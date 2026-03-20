"use client";

import {
  createContext,
  useContext,
  useState,
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

function getStoredUser(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("bioai_user");
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem("bioai_user");
  }
  return null;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const storedUser = useSyncExternalStore(subscribe, getStoredUser, () => null);
  const [user, setUser] = useState<UserData | null>(storedUser);

  const handleRegistered = useCallback((userData: UserData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bioai_user");
    setUser(null);
    window.location.reload();
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
