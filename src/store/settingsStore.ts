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
  isLoaded: false,

  setDarkMode: async (darkMode: boolean) => {
    set({ darkMode });
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
        ...patch,
      };
      const { error } = await supabase
        .from('settings')
        .upsert({ user_id: user.id, ...settingsToDbRow(current) }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to persist settings:', err);
      set(previous);
    }
  },

  reset: () => set({
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
    exportPaletteId: undefined,
    isLoaded: false,
  }),

  initializeFromDB: async () => {
    if (get().isLoaded) return;
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings row yet — default profileType so user isn't trapped in onboarding loop
        set({ isLoaded: true, profileType: 'physio' });
        return;
      }

      if (error) throw error;

      const settings = dbRowToSettings(data);
      set({ ...settings, isLoaded: true });

      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Failed to initialize settings from DB:', err);
      set({ isLoaded: true });
    }
  },
}));
