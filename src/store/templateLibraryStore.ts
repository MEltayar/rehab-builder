import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

interface TemplateLibraryStore {
  favouriteIds: Set<string>;
  showFavouritesOnly: boolean;
  isInitialized: boolean;
  initializeFromSettings: () => void;
  toggleFavourite: (id: string) => Promise<void>;
  setShowFavouritesOnly: (v: boolean) => void;
}

export const useTemplateLibraryStore = create<TemplateLibraryStore>((set, get) => ({
  favouriteIds: new Set(),
  showFavouritesOnly: false,
  isInitialized: false,

  initializeFromSettings: () => {
    const { favouriteTemplateIds } = useSettingsStore.getState();
    set({
      favouriteIds: new Set(favouriteTemplateIds ?? []),
      isInitialized: true,
    });
  },

  toggleFavourite: async (id: string) => {
    const { favouriteIds } = get();
    const next = new Set(favouriteIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ favouriteIds: next });
    await useSettingsStore.getState().updateSettings({
      favouriteTemplateIds: [...next],
    });
  },

  setShowFavouritesOnly: (v: boolean) => {
    set({ showFavouritesOnly: v });
  },
}));
