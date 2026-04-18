import { create } from 'zustand';
import type { FoodItem } from '../types';
import { supabase } from '../lib/supabase';
import { foodItemToDbRow, foodItemPatchToDbRow } from '../lib/mappers';
import { useUserStore } from './userStore';
import { useSettingsStore } from './settingsStore';
import { seedFoodItemsIfEmpty, getAllFoodItems } from '../features/diet/services/foodService';

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

export const useFoodStore = create<FoodStore>((set, get) => ({
  foods: [],
  isLoaded: false,
  searchTerm: '',
  selectedCategory: 'all',

  initializeFromDB: async () => {
    if (get().isLoaded) return;
    await seedFoodItemsIfEmpty();
    const all = await getAllFoodItems();
    const hiddenIds = new Set(useSettingsStore.getState().hiddenFoodIds ?? []);
    const visible = hiddenIds.size > 0 ? all.filter((f) => !hiddenIds.has(f.id)) : all;
    set({ foods: visible, isLoaded: true });
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

    // Admin/Staff or editing own custom: update shared record in DB.
    // Add .select('id') to detect if RLS silently blocked the update.
    const { data: updated, error } = await supabase
      .from('food_items')
      .update(foodItemPatchToDbRow(data))
      .eq('id', id)
      .select('id');
    if (error) throw error;

    // RLS blocked the update (0 rows affected) — upsert with current user as owner
    if (!updated || updated.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      const full: FoodItem = { ...food, ...data, userId: user?.id };
      const { error: upsertError } = await supabase
        .from('food_items')
        .upsert({ ...foodItemToDbRow(full), user_id: user?.id }, { onConflict: 'id' });
      if (upsertError) throw upsertError;
    }

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
