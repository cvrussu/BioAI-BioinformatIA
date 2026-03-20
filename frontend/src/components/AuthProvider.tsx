"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import RegistrationGate, { type UserData } from "./RegistrationGate";

interface AuthContextValue {
  user: UserData | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  logout: () => {},
});

export function useUser() {
  return useContext(AuthContext);
}

let snapshotCache: { raw: string | null; parsed: UserData | null } = {
  raw: null,
  parsed: null,
};

function getStoredUser(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("bioai_user");
    if (raw !== snapshotCache.raw) {
      snapshotCache = { raw, parsed: raw ? JSON.parse(raw) : null };
    }
    return snapshotCache.parsed;
  } catch {
    localStorage.removeItem("bioai_user");
    snapshotCache = { raw: null, parsed: null };
  }
  return null;
}

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getStoredUser, () => null);

  const handleRegistered = useCallback(() => {
    // localStorage already written by RegistrationGate — just notify React
    snapshotCache = { raw: null, parsed: null };
    emitChange();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bioai_user");
    snapshotCache = { raw: null, parsed: null };
    emitChange();
  }, []);

  if (!user) {
    return <RegistrationGate onRegistered={handleRegistered} />;
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
