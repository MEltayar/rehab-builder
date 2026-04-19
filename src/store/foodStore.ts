import { create } from 'zustand';
import type { FoodItem } from '../types';
import { supabase } from '../lib/supabase';
import { dbRowToFoodItem, foodItemToDbRow, foodItemPatchToDbRow } from '../lib/mappers';
import { useUserStore } from './userStore';
import { useSettingsStore } from './settingsStore';
import { seedFoodItemsIfEmpty, getAllFoodItems } from '../features/diet/services/foodService';
import { readListCache, writeListCache } from '../lib/storeCache';

interface FoodStore {
  foods: FoodItem[];
  isLoaded: boolean;
  searchTerm: string;
  selectedCategory: string;

  initializeFromDB: () => Promise<void>;
  addFood: (data: Omit<FoodItem, 'id' | 'createdAt' | 'isCustom'>) => Promise<void>;
  updateFood: (id: string, data: Partial<Omit<FoodItem, 'id' | 'createdAt' | 'isCustom'>>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;

  setSearchTerm: (term: string) => void;
  setCategory: (category: string) => void;

  filteredFoods: () => FoodItem[];
}

// Module-level channel so we can clean up on re-init
let foodChannel: ReturnType<typeof supabase.channel> | null = null;

function subscribeFoodRealtime() {
  if (foodChannel) supabase.removeChannel(foodChannel);
  foodChannel = supabase
    .channel('food-items-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'food_items', filter: 'is_custom=eq.false' },
      (payload) => {
        const hiddenIds = new Set(useSettingsStore.getState().hiddenFoodIds ?? []);
        if (payload.eventType === 'INSERT') {
          const newFood = dbRowToFoodItem(payload.new as Record<string, unknown>);
          if (hiddenIds.has(newFood.id)) return;
          useFoodStore.setState((state) => {
            if (state.foods.some((f) => f.id === newFood.id)) return state;
            return { foods: [...state.foods, newFood] };
          });
        } else if (payload.eventType === 'UPDATE') {
          const updated = dbRowToFoodItem(payload.new as Record<string, unknown>);
          useFoodStore.setState((state) => ({
            foods: state.foods.map((f) => f.id === updated.id ? updated : f),
          }));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id;
          useFoodStore.setState((state) => ({
            foods: state.foods.filter((f) => f.id !== deletedId),
          }));
        }
      },
    )
    .subscribe();
}

export const useFoodStore = create<FoodStore>((set, get) => ({
  foods: [],
  isLoaded: false,
  searchTerm: '',
  selectedCategory: 'all',

  initializeFromDB: async () => {
    if (get().isLoaded) return;

    const applyHidden = (all: FoodItem[]) => {
      const hiddenIds = new Set(useSettingsStore.getState().hiddenFoodIds ?? []);
      return hiddenIds.size > 0 ? all.filter((f) => !hiddenIds.has(f.id)) : all;
    };

    const cached = readListCache<FoodItem>('foods');
    if (cached) {
      set({ foods: applyHidden(cached), isLoaded: true });
      subscribeFoodRealtime();
      (async () => {
        try {
          await seedFoodItemsIfEmpty();
          const fresh = await getAllFoodItems();
          writeListCache('foods', fresh);
          set({ foods: applyHidden(fresh) });
        } catch (err) {
          console.error('[foodStore] background refresh failed:', err);
        }
      })();
      return;
    }

    await seedFoodItemsIfEmpty();
    const all = await getAllFoodItems();
    writeListCache('foods', all);
    set({ foods: applyHidden(all), isLoaded: true });
    subscribeFoodRealtime();
  },

  addFood: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('Not authenticated');
    const isAdmin = useUserStore.getState().canAccessAdmin();
    const food: FoodItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isCustom: !isAdmin,
      userId: user.id,
    };
    const { error } = await supabase.from('food_items').insert(foodItemToDbRow(food));
    if (error) throw error;
    set((state) => ({ foods: [...state.foods, food] }));
  },

  updateFood: async (id, data) => {
    const food = get().foods.find((f) => f.id === id);
    if (!food) return;
    const isAdmin = useUserStore.getState().canAccessAdmin();

    if (!food.isCustom && !isAdmin) {
      // Normal user editing built-in: create personal copy, hide original
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const copy: FoodItem = {
        ...food,
        ...data,
        id: crypto.randomUUID(),
        isCustom: true,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      const { error } = await supabase.from('food_items').insert(foodItemToDbRow(copy));
      if (error) throw error;
      set((state) => ({
        foods: state.foods.filter((f) => f.id !== id).concat(copy),
      }));
      const hiddenIds = [...(useSettingsStore.getState().hiddenFoodIds ?? []), id];
      useSettingsStore.getState().updateSettings({ hiddenFoodIds: hiddenIds }).catch(() => {});
      return;
    }

    // Admin/Staff: update shared record in DB
    const { error } = await supabase
      .from('food_items')
      .update(foodItemPatchToDbRow(data))
      .eq('id', id);
    if (error) throw error;
    // Realtime subscription will propagate the change to all other users automatically.
    // Update local state immediately for the current user.
    set((state) => ({
      foods: state.foods.map((f) => (f.id === id ? { ...f, ...data } : f)),
    }));
  },

  deleteFood: async (id) => {
    const food = get().foods.find((f) => f.id === id);
    if (!food) return;
    const isAdmin = useUserStore.getState().canAccessAdmin();

    if (!food.isCustom && !isAdmin) {
      // Normal user deleting built-in: remove from local state immediately, persist hidden list in background
      set((state) => ({ foods: state.foods.filter((f) => f.id !== id) }));
      const hiddenIds = [...(useSettingsStore.getState().hiddenFoodIds ?? []), id];
      useSettingsStore.getState().updateSettings({ hiddenFoodIds: hiddenIds }).catch(() => {});
      return;
    }

    // Admin/Staff or deleting own custom: remove from DB
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ foods: state.foods.filter((f) => f.id !== id) }));
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setCategory: (category) => set({ selectedCategory: category }),

  filteredFoods: () => {
    const { foods, searchTerm, selectedCategory } = get();
    return foods.filter((f) => {
      if (selectedCategory !== 'all') {
        if (selectedCategory.startsWith('other:')) {
          const customLabel = selectedCategory.slice(6);
          if (f.category !== 'other' || f.customCategory !== customLabel) return false;
        } else {
          if (f.category !== selectedCategory) return false;
        }
      }
      if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  },
}));

useFoodStore.subscribe((state, prev) => {
  if (state.foods !== prev.foods && state.isLoaded) {
    writeListCache('foods', state.foods);
  }
});
