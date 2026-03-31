import { create } from 'zustand';
import { db } from '../db';
import type { AppSettings } from '../types';

type ClinicInfo = Omit<AppSettings, 'darkMode'>;

interface SettingsStore extends ClinicInfo {
  darkMode: boolean;
  isLoaded: boolean;
  setDarkMode: (darkMode: boolean) => Promise<void>;
  updateSettings: (patch: Partial<ClinicInfo>) => Promise<void>;
  initializeFromDB: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  darkMode: false,
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
  isLoaded: false,

  setDarkMode: async (darkMode: boolean) => {
    set({ darkMode });
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      const updated = await db.settings.update(1, { darkMode });
      if (!updated) {
        await db.settings.put({ id: 1, darkMode, clinicName: '' });
      }
    } catch (err) {
      console.error('Failed to persist theme setting:', err);
    }
  },

  updateSettings: async (patch: Partial<ClinicInfo>) => {
    const previous = get();
    set(patch);
    try {
      const updated = await db.settings.update(1, patch);
      if (!updated) {
        await db.settings.put({
          id: 1,
          darkMode: previous.darkMode,
          clinicName: previous.clinicName,
          clinicPhone: previous.clinicPhone,
          clinicEmail: previous.clinicEmail,
          clinicAddress: previous.clinicAddress,
          clinicWebsite: previous.clinicWebsite,
          therapistName: previous.therapistName,
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
        });
      }
    } catch (err) {
      console.error('Failed to persist settings:', err);
      // Rollback UI state so it stays consistent with what's in the DB
      set(previous);
    }
  },

  initializeFromDB: async () => {
    try {
      const settings = await db.settings.get(1);
      if (!settings) {
        await db.settings.put({ id: 1, darkMode: false, clinicName: '' });
        set({ darkMode: false, clinicName: '', isLoaded: true });
      } else {
        const {
          darkMode,
          clinicName,
          clinicLogo,
          clinicPhone,
          clinicEmail,
          clinicAddress,
          clinicWebsite,
          therapistName,
          whatsappTemplate,
          emailTemplate,
          emailSubject,
          favouriteTemplateIds,
          clinicInstagram,
          clinicFacebook,
          clinicGmail,
          clinicWhatsApp,
          exportTemplateId,
          exportTemplateFavorites,
          exportPaletteId,
        } = settings;
        set({
          darkMode,
          clinicName: clinicName ?? '',
          clinicLogo,
          clinicPhone,
          clinicEmail,
          clinicAddress,
          clinicWebsite,
          therapistName,
          whatsappTemplate,
          emailTemplate,
          emailSubject,
          favouriteTemplateIds,
          clinicInstagram,
          clinicFacebook,
          clinicGmail,
          clinicWhatsApp,
          exportTemplateId,
          exportTemplateFavorites: exportTemplateFavorites ?? [],
          exportPaletteId,
          isLoaded: true,
        });
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (err) {
      console.error('Failed to initialize settings from DB:', err);
      set({ isLoaded: true });
    }
  },
}));
