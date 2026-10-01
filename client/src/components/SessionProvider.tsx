"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getMe, logout, type User } from "@/lib/api";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  user: User | null;
  status: SessionStatus;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const inFlight = useRef<Promise<void> | null>(null);

  // deduped so a burst of callers shares one round trip
  const refresh = useCallback((): Promise<void> => {
    if (inFlight.current) {
      return inFlight.current;
    }

    const request = getMe()
      .then((data) => {
        setUser(data.user);
        setStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setStatus("unauthenticated");
      })
      .finally(() => {
        inFlight.current = null;
      });

    inFlight.current = request;

    return request;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // drop local state anyway so the ui stays honest
    }

    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, status, refresh, signOut }),
    [user, status, refresh, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }

  return context;
}

export default SessionProvider;