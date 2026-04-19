// Cache-first helper for Zustand list stores.
//
// On refresh, reading from localStorage (~1ms) lets lists render immediately
// instead of waiting for a Supabase round-trip (~300-1500ms on mobile).
// The background fetch reconciles any drift within a second.
//
// Cache is keyed by user id so one user's data never leaks into another's
// browser session, and so each login starts reading from its own snapshot.

import { useAuthStore } from '../store/authStore';

const PREFIX = 'frl_cache_';

function cacheKey(kind: string, userId: string): string {
  return `${PREFIX}${kind}_${userId}`;
}

export function readListCache<T>(kind: string): T[] | null {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(cacheKey(kind, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

export function writeListCache<T>(kind: string, data: T[]): void {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  try {
    localStorage.setItem(cacheKey(kind, userId), JSON.stringify(data));
  } catch {
    // Quota exceeded or storage unavailable — ignore; next refresh falls back to DB fetch.
  }
}
