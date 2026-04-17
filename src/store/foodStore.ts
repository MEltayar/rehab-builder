import { create } from 'zustand';
import type { FoodItem } from '../types';
import { supabase } from '../lib/supabase';
import { foodItemToDbRow, foodItemPatchToDbRow } from '../lib/mappers';
import { useUserStore } from './userStore';
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
    set({ foods: all, isLoaded: true });
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
    const { error } = await supabase
      .from('food_items')
      .update(foodItemPatchToDbRow(data))
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      foods: state.foods.map((f) => (f.id === id ? { ...f, ...data } : f)),
    }));
  },

  deleteFood: async (id) => {
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
