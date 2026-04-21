import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToSettings, settingsToDbRow } from '../lib/mappers';
import { useAuthStore } from './authStore';
import type { AppSettings } from '../types';

type ClinicInfo = Omit<AppSettings, 'darkMode'>;

interface SettingsStore extends ClinicInfo {
  darkMode: boolean;
  isLoaded: boolean;
  setDarkMode: (darkMode: boolean) => Promise<void>;
  updateSettings: (patch: Partial<ClinicInfo>) => Promise<void>;
  initializeFromDB: () => Promise<void>;
  reset: () => void;
}

const SETTINGS_CACHE_KEY = 'frl_settings';

function readCache(): AppSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    return raw ? JSON.parse(raw) as AppSettings : null;
  } catch { return null; }
}
function writeCache(s: AppSettings) {
  try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
function clearCache() {
  try { localStorage.removeItem(SETTINGS_CACHE_KEY); } catch { /* ignore */ }
}

function applyDarkMode(darkMode: boolean) {
  if (darkMode) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  darkMode: false,
  profileType: undefined,
  clinicName: '',
  clinicLogo: undefined,
  clinicPhone: undefined,
  clinicEmail: undefined,
  clinicAddress: undefined,
  clinicWebsite: undefined,
  therapistName: undefined,
  whatsappTemplate: undefined,
  emailTemplate: undefined,
  emailSubject: undefined,
  favouriteTemplateIds: undefined,
  clinicInstagram: undefined,
  clinicFacebook: undefined,
  clinicGmail: undefined,
  clinicWhatsApp: undefined,
  exportTemplateId: undefined,
  exportTemplateFavorites: [],
  exportPaletteId: undefined,
  helpAnnouncements: [],
  hiddenExerciseIds: [],
  hiddenFoodIds: [],
  isLoaded: false,

  setDarkMode: async (darkMode: boolean) => {
    set({ darkMode });
    applyDarkMode(darkMode);
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const { error } = await supabase
        .from('settings')
        .upsert({ user_id: user.id, dark_mode: darkMode, clinic_name: get().clinicName }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to persist theme setting:', err);
    }
  },

  updateSettings: async (patch: Partial<ClinicInfo>) => {
    const previous = get();
    set(patch);
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const current: AppSettings = {
        profileType: previous.profileType,
        clinicName: previous.clinicName,
        clinicLogo: previous.clinicLogo,
        clinicPhone: previous.clinicPhone,
        clinicEmail: previous.clinicEmail,
        clinicAddress: previous.clinicAddress,
        clinicWebsite: previous.clinicWebsite,
        therapistName: previous.therapistName,
        darkMode: previous.darkMode,
        whatsappTemplate: previous.whatsappTemplate,
        emailTemplate: previous.emailTemplate,
        emailSubject: previous.emailSubject,
        favouriteTemplateIds: previous.favouriteTemplateIds,
        clinicInstagram: previous.clinicInstagram,
        clinicFacebook: previous.clinicFacebook,
        clinicGmail: previous.clinicGmail,
        clinicWhatsApp: previous.clinicWhatsApp,
        exportTemplateId: previous.exportTemplateId,
        exportTemplateFavorites: previous.exportTemplateFavorites,
        exportPaletteId: previous.exportPaletteId,
        helpAnnouncements: previous.helpAnnouncements,
        hiddenExerciseIds: previous.hiddenExerciseIds ?? [],
        hiddenFoodIds: previous.hiddenFoodIds ?? [],
        ...patch,
      };
      writeCache(current);
      const { error } = await supabase
        .from('settings')
        .upsert({ user_id: user.id, ...settingsToDbRow(current) }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to persist settings:', err);
      set(previous);
    }
  },

  reset: () => {
    clearCache();
    set({
      profileType: undefined,
      clinicName: '',
      clinicLogo: undefined,
      clinicPhone: undefined,
      clinicEmail: undefined,
      clinicAddress: undefined,
      clinicWebsite: undefined,
      therapistName: undefined,
      whatsappTemplate: undefined,
      emailTemplate: undefined,
      emailSubject: undefined,
      favouriteTemplateIds: undefined,
      clinicInstagram: undefined,
      clinicFacebook: undefined,
      clinicGmail: undefined,
      clinicWhatsApp: undefined,
      exportTemplateId: undefined,
      exportTemplateFavorites: [],
      helpAnnouncements: [],
      hiddenExerciseIds: [],
      hiddenFoodIds: [],
      exportPaletteId: undefined,
      isLoaded: false,
    });
  },

  initializeFromDB: async () => {
    if (get().isLoaded) return;

    // Validate session before any DB call — expired tokens cause 406 spam
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      set({ isLoaded: true });
      return;
    }

    // Serve from cache immediately — ProtectedRoute resolves without a network round-trip
    const cached = readCache();
    if (cached) {
      set({ ...cached, isLoaded: true });
      applyDarkMode(cached.darkMode);
      // Refresh in background
      supabase.from('settings').select('*').single().then(({ data, error }) => {
        if (!error && data) {
          const fresh = dbRowToSettings(data);
          writeCache(fresh);
          set({ ...fresh });
          applyDarkMode(fresh.darkMode);
        }
      });
      return;
    }

    // No cache — full fetch
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code === 'PGRST116') {
        // New user — leave profileType undefined so ProtectedRoute sends them to /onboarding
        set({ isLoaded: true });
        return;
      }

      if (error) throw error;

      const settings = dbRowToSettings(data);
      writeCache(settings);
      set({ ...settings, isLoaded: true });
      applyDarkMode(settings.darkMode);
    } catch (err) {
      console.error('Failed to initialize settings from DB:', err);
      set({ isLoaded: true });
    }
  },
}));
