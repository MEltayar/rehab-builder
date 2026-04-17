import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type UserRole = 'super_admin' | 'staff';

function cacheKey(userId: string) { return `frl_role_${userId}`; }

function readCache(userId: string): UserRole | null {
  try { return (localStorage.getItem(cacheKey(userId)) as UserRole) ?? null; } catch { return null; }
}
function writeCache(userId: string, role: UserRole | null) {
  try {
    if (role) localStorage.setItem(cacheKey(userId), role);
    else localStorage.removeItem(cacheKey(userId));
  } catch { /* ignore */ }
}
function clearCache(userId: string) {
  try { localStorage.removeItem(cacheKey(userId)); } catch { /* ignore */ }
}

interface UserStore {
  userId: string | null;
  role: UserRole | null;
  displayName: string | null;
  isLoaded: boolean;

  initialize: () => Promise<void>;
  reset: () => void;
  isSuperAdmin: () => boolean;
  canAccessAdmin: () => boolean;
  canEdit: (ownerId: string | null | undefined) => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  userId: null,
  role: null,
  displayName: null,
  isLoaded: false,

  reset: () => {
    const { userId } = get();
    if (userId) clearCache(userId);
    set({ userId: null, role: null, displayName: null, isLoaded: false });
  },

  initialize: async () => {
    if (get().isLoaded) return;
    // getSession() reads from localStorage — no network call
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) { set({ isLoaded: true }); return; }

    // Serve from cache immediately so ProtectedRoute resolves without waiting for Supabase
    const cached = readCache(user.id);
    if (cached !== null) {
      set({ userId: user.id, role: cached, isLoaded: true });
      // Verify in the background and update if the role changed
      supabase.from('user_profiles').select('role, display_name').eq('id', user.id).maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          const fresh = data.role as UserRole;
          writeCache(user.id, fresh);
          set({ role: fresh, displayName: data.display_name ?? user.email ?? null });
        });
      return;
    }

    // No cache yet — fetch from DB (first login or after cache clear)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .maybeSingle();
    if (error) console.error('[userStore] Failed to fetch profile:', error);

    const role = (data?.role as UserRole) ?? null;
    writeCache(user.id, role);
    set({
      userId: user.id,
      role,
      displayName: data?.display_name ?? user.email ?? null,
      isLoaded: true,
    });
  },

  isSuperAdmin: () => get().role === 'super_admin',
  canAccessAdmin: () => get().role === 'super_admin' || get().role === 'staff',

  canEdit: (ownerId) => {
    const { userId, role } = get();
    if (role === 'super_admin' || role === 'staff') return true;
    if (!userId || !ownerId) return false;
    return userId === ownerId;
  },
}));
