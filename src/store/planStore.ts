import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToSubscription } from '../lib/mappers';
import { useUserStore } from './userStore';
import type { Subscription, PlanLimits } from '../types';

const TRIAL_LIMITS: PlanLimits = {
  maxClients: 2,
  maxProgramsPerClient: 1,
  canPreview: false,
  canExportPDF: false,
  canExportExcel: false,
  canAddCustomExercise: false,
  canSaveTemplate: false,
  canAccessConfig: false,
  canShare: false,
  canAccessDietPlans: false,
  canManageFood: false,
  canAccessClientAnalytics: false,
  canUseExportTemplates: false,
};

const PRO_MONTHLY_LIMITS: PlanLimits = {
  maxClients: Infinity,
  maxProgramsPerClient: Infinity,
  canPreview: true,
  canExportPDF: true,
  canExportExcel: false,
  canAddCustomExercise: true,
  canSaveTemplate: true,
  canAccessConfig: true,
  canShare: false,
  canAccessDietPlans: true,
  canManageFood: true,
  canAccessClientAnalytics: false,
  canUseExportTemplates: false,
};

const PRO_YEARLY_LIMITS: PlanLimits = {
  maxClients: Infinity,
  maxProgramsPerClient: Infinity,
  canPreview: true,
  canExportPDF: true,
  canExportExcel: true,
  canAddCustomExercise: true,
  canSaveTemplate: true,
  canAccessConfig: true,
  canShare: true,
  canAccessDietPlans: true,
  canManageFood: true,
  canAccessClientAnalytics: true,
  canUseExportTemplates: true,
};

function calcTrialDaysLeft(trialStartedAt: string): number {
  const start = new Date(trialStartedAt).getTime();
  const now = Date.now();
  const diffDays = (now - start) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(3 - diffDays));
}

interface PlanStore {
  subscription: Subscription | null;
  isLoaded: boolean;

  fetchSubscription: () => Promise<void>;
  reset: () => void;
  incrementClientsCreated: () => Promise<void>;

  // Computed
  isPro: () => boolean;
  isTrialExpired: () => boolean;
  trialDaysLeft: () => number;
  limits: () => PlanLimits;
  clientLimitReached: () => boolean;
}

const SUB_CACHE_KEY = 'frl_sub';

function readSubCache(): Subscription | null {
  try {
    const raw = localStorage.getItem(SUB_CACHE_KEY);
    return raw ? JSON.parse(raw) as Subscription : null;
  } catch { return null; }
}
function writeSubCache(sub: Subscription | null) {
  try {
    if (sub) localStorage.setItem(SUB_CACHE_KEY, JSON.stringify(sub));
    else localStorage.removeItem(SUB_CACHE_KEY);
  } catch { /* ignore */ }
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  subscription: null,
  isLoaded: false,

  reset: () => {
    writeSubCache(null);
    set({ subscription: null, isLoaded: false });
  },

  fetchSubscription: async () => {
    // Serve from cache immediately so ProtectedRoute resolves without a network round-trip
    const cached = readSubCache();
    if (cached) {
      set({ subscription: cached, isLoaded: true });
      // Verify in the background and update if the plan changed
      supabase.from('subscriptions').select('*').single().then(({ data, error }) => {
        if (!error && data) {
          const fresh = dbRowToSubscription(data);
          writeSubCache(fresh);
          set({ subscription: fresh });
        }
      });
      return;
    }

    // No cache — full fetch
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .single();

    // No subscription row yet — auto-create a trial (fallback for users who slipped through)
    if (error && error.code === 'PGRST116') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const now = new Date().toISOString();
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .upsert({ user_id: user.id, plan: 'trial', status: 'active', trial_started_at: now, clients_created: 0 }, { onConflict: 'user_id', ignoreDuplicates: true })
          .select('*')
          .single();
        if (!insertError && newSub) {
          const sub = dbRowToSubscription(newSub);
          writeSubCache(sub);
          set({ subscription: sub, isLoaded: true });
          return;
        }
      }
      set({ isLoaded: true });
      return;
    }
    if (error) { console.error('Failed to fetch subscription:', error); set({ isLoaded: true }); return; }
    const sub = dbRowToSubscription(data);
    writeSubCache(sub);
    set({ subscription: sub, isLoaded: true });
  },

  incrementClientsCreated: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const next = (get().subscription?.clientsCreated ?? 0) + 1;
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ clients_created: next })
      .eq('user_id', user.id)
      .select('clients_created')
      .maybeSingle();
    if (error) { console.error('[planStore] incrementClientsCreated failed:', error); return; }
    if (data) {
      set((state) => ({
        subscription: state.subscription
          ? { ...state.subscription, clientsCreated: data.clients_created }
          : null,
      }));
    }
  },

  isPro: () => {
    if (useUserStore.getState().role === 'super_admin') return true;
    const { subscription } = get();
    return subscription?.plan === 'pro_monthly' || subscription?.plan === 'pro_yearly';
  },

  isTrialExpired: () => {
    if (useUserStore.getState().role === 'super_admin') return false;
    const { subscription } = get();
    if (!subscription) return false;
    if (get().isPro()) return false;
    return calcTrialDaysLeft(subscription.trialStartedAt) === 0;
  },

  trialDaysLeft: () => {
    if (useUserStore.getState().role === 'super_admin') return 0;
    const { subscription } = get();
    if (!subscription || get().isPro()) return 0;
    return calcTrialDaysLeft(subscription.trialStartedAt);
  },

  limits: () => {
    if (useUserStore.getState().role === 'super_admin') return PRO_YEARLY_LIMITS;
    const plan = get().subscription?.plan;
    if (plan === 'pro_yearly') return PRO_YEARLY_LIMITS;
    if (plan === 'pro_monthly') return PRO_MONTHLY_LIMITS;
    return TRIAL_LIMITS;
  },

  clientLimitReached: () => {
    const store = get();
    if (store.isPro()) return false;
    const created = store.subscription?.clientsCreated ?? 0;
    return created >= TRIAL_LIMITS.maxClients;
  },
}));
