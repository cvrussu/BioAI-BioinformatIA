"""User registration router — persists user data to CSV and Google Sheets webhook."""

from __future__ import annotations

import csv
import logging
import os
import threading
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException

from app.models.schemas import UserRegistrationRequest, UserRegistrationResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Usuarios"])

# ---------------------------------------------------------------------------
# CSV storage configuration
# ---------------------------------------------------------------------------

_CSV_DIR = Path(__file__).resolve().parent.parent.parent / "data"
_CSV_PATH = _CSV_DIR / "users.csv"
_CSV_COLUMNS = ["timestamp", "name", "email", "organization", "industry"]
_csv_lock = threading.Lock()

_WEBHOOK_URL = os.getenv(
    "GOOGLE_SHEET_WEBHOOK_URL",
    "https://script.google.com/macros/s/AKfycbxOWq5Qt7dEtzsqmA7qYtFS-56l3aIHsbIEbn_wwb3k52BM6IYu3zi6gT02Fo4Xe_BJ_A/exec",
)


def _post_to_sheet(row: dict[str, str]) -> None:
    """Fire-and-forget: send registration data to Google Sheets webhook."""
    try:
        httpx.post(_WEBHOOK_URL, json=row, timeout=10)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Google Sheet webhook failed: %s", exc)


def _ensure_csv() -> None:
    """Create the data directory and CSV file with headers if they don't exist."""
    _CSV_DIR.mkdir(parents=True, exist_ok=True)
    if not _CSV_PATH.exists():
        with open(_CSV_PATH, "w", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            writer.writerow(_CSV_COLUMNS)


def _read_all_rows() -> list[dict[str, str]]:
    """Read every row from the CSV and return as a list of dicts."""
    if not _CSV_PATH.exists():
        return []
    with open(_CSV_PATH, "r", newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return list(reader)


def _write_all_rows(rows: list[dict[str, str]]) -> None:
    """Overwrite the CSV with the given rows (used for upsert)."""
    with open(_CSV_PATH, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=_CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/users/register",
    response_model=UserRegistrationResponse,
    summary="Registrar un nuevo usuario",
    description="Registra un usuario en la plataforma BioAI. Si el email ya existe, se actualizan los datos.",
)
async def register_user(body: UserRegistrationRequest) -> UserRegistrationResponse:
    """Register a user or update an existing one (keyed by email)."""
    now = datetime.now(timezone.utc).isoformat()

    new_row = {
        "timestamp": now,
        "name": body.name.strip(),
        "email": body.email.strip().lower(),
        "organization": body.organization.strip(),
        "industry": body.industry.strip(),
    }

    with _csv_lock:
        _ensure_csv()
        rows = _read_all_rows()

        # Check for existing email — update in place if found.
        updated = False
        for idx, row in enumerate(rows):
            if row.get("email", "").lower() == new_row["email"]:
                rows[idx] = new_row
                updated = True
                break

        if updated:
            _write_all_rows(rows)
            logger.info("Usuario actualizado: %s", new_row["email"])
        else:
            # Append-only path — faster for the common case.
            with open(_CSV_PATH, "a", newline="", encoding="utf-8") as fh:
                writer = csv.DictWriter(fh, fieldnames=_CSV_COLUMNS)
                writer.writerow(new_row)
            logger.info("Usuario registrado: %s", new_row["email"])

    # Send to Google Sheets (non-blocking thread — registration succeeds regardless)
    threading.Thread(target=_post_to_sheet, args=(new_row,), daemon=True).start()

    return UserRegistrationResponse(email=new_row["email"])


@router.get(
    "/users/export",
    summary="Exportar usuarios registrados",
    description="Descarga el archivo CSV con todos los usuarios registrados.",
)
async def export_users():
    from fastapi.responses import FileResponse

    _ensure_csv()
    if not _CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="No hay usuarios registrados aun.")

    return FileResponse(
        path=str(_CSV_PATH),
        media_type="text/csv",
        filename="bioai_usuarios.csv",
    )
