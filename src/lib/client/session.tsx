"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Api } from "./api";
import type { SanitisedUser } from "@/lib/server/services";

const STORAGE_KEY = "good_deeds_user_id";

type SessionContextValue = {
  user: SanitisedUser | null;
  loading: boolean;
  setUser: (user: SanitisedUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SanitisedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: SanitisedUser | null) => {
    setUserState(next);
    if (next) localStorage.setItem(STORAGE_KEY, next.id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      setUserState(null);
      return;
    }
    try {
      const { user: fresh } = await Api.getUser(id);
      setUserState(fresh);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUserState(null);
    }
  }, []);

  const logout = useCallback(() => setUser(null), [setUser]);

  useEffect(() => {
    (async () => {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        setUserState(null);
      } else {
        try {
          const { user: fresh } = await Api.getUser(id);
          setUserState(fresh);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
          setUserState(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, setUser, refreshUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}

/**
 * PRD gap fix: DATA never surfaced the "+N points confirmed" moment. We track which
 * confirmed signups the volunteer has already been shown a celebration for, keyed by
 * signup id, so it appears exactly once the next time Find/Profile loads.
 */
const SEEN_CONFIRMATIONS_KEY = "good_deeds_seen_confirmations";

function getSeenConfirmations(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_CONFIRMATIONS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markConfirmationsSeen(ids: string[]) {
  const seen = getSeenConfirmations();
  ids.forEach((id) => seen.add(id));
  localStorage.setItem(SEEN_CONFIRMATIONS_KEY, JSON.stringify([...seen]));
}

export type PendingCelebration = { signupId: string; points: number; title: string };

export function takeUnseenConfirmation(
  history: { signup_id: string; status: string; points_awarded?: string; title: string }[],
): PendingCelebration | null {
  const seen = getSeenConfirmations();
  const unseen = history.find((h) => h.status === "confirmed" && !seen.has(h.signup_id));
  if (!unseen) return null;
  markConfirmationsSeen([unseen.signup_id]);
  return {
    signupId: unseen.signup_id,
    points: Number(unseen.points_awarded || 0),
    title: unseen.title,
  };
}
