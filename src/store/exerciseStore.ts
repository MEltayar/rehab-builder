import { create } from 'zustand';
import type { Exercise, ExerciseCategory } from '../types';
import { supabase } from '../lib/supabase';
import { exerciseToDbRow, exercisePatchToDbRow } from '../lib/mappers';
import { useUserStore } from './userStore';
import { useSettingsStore } from './settingsStore';
import { seedIfEmpty, seedGymExercisesIfMissing, syncGymExerciseVideos, getAllExercises } from '../features/exercises/services/exerciseService';

interface ExerciseStore {
  exercises: Exercise[];
  isLoaded: boolean;
  isInitializing: boolean;
  searchTerm: string;
  selectedCategory: ExerciseCategory | 'all';
  selectedTag: string | null;

  initializeFromDB: () => Promise<void>;
  addExercise: (data: Omit<Exercise, 'id' | 'createdAt' | 'isCustom'>) => Promise<void>;
  updateExercise: (id: string, data: Partial<Omit<Exercise, 'id' | 'createdAt' | 'isCustom'>>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;

  setSearchTerm: (term: string) => void;
  setCategory: (category: ExerciseCategory | 'all') => void;
  setTag: (tag: string | null) => void;

  filteredExercises: () => Exercise[];
  availableTags: () => string[];
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: [],
  isLoaded: false,
  isInitializing: false,
  searchTerm: '',
  selectedCategory: 'all',
  selectedTag: null,

  initializeFromDB: async () => {
    if (get().isLoaded || get().isInitializing) return;
    set({ isInitializing: true });
    await seedIfEmpty();
    await seedGymExercisesIfMissing();
    await syncGymExerciseVideos();
    const all = await getAllExercises();
    const hiddenIds = new Set(useSettingsStore.getState().hiddenExerciseIds ?? []);
    const visible = hiddenIds.size > 0 ? all.filter((ex) => !hiddenIds.has(ex.id)) : all;
    set({ exercises: visible, isLoaded: true, isInitializing: false });
  },

  addExercise: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = useUserStore.getState().canAccessAdmin();
    // Admin/staff exercises are treated as built-in (visible to all users).
    // Regular user exercises are personal custom (visible only to them).
    const exercise: Exercise = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isCustom: !isAdmin,
      userId: user?.id,
    };
    const { error } = await supabase.from('exercises').insert(exerciseToDbRow(exercise));
    if (error) throw error;
    set((state) => ({ exercises: [...state.exercises, exercise] }));
  },

  updateExercise: async (id, data) => {
    const exercise = get().exercises.find((ex) => ex.id === id);
    if (!exercise) return;

    if (!exercise.isCustom) {
      // Built-in exercise: create a personal copy and hide the original
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const copy: Exercise = {
        ...exercise,
        ...data,
        id: crypto.randomUUID(),
        isCustom: true,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      const { error } = await supabase.from('exercises').insert(exerciseToDbRow(copy));
      if (error) throw error;
      const hiddenIds = [...(useSettingsStore.getState().hiddenExerciseIds ?? []), id];
      await useSettingsStore.getState().updateSettings({ hiddenExerciseIds: hiddenIds });
      set((state) => ({
        exercises: state.exercises.filter((ex) => ex.id !== id).concat(copy),
      }));
      return;
    }

    const { error } = await supabase
      .from('exercises')
      .update(exercisePatchToDbRow(data))
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      exercises: state.exercises.map((ex) => ex.id === id ? { ...ex, ...data } : ex),
    }));
  },

  deleteExercise: async (id) => {
    const exercise = get().exercises.find((ex) => ex.id === id);
    if (!exercise) return;

    if (!exercise.isCustom) {
      // Built-in exercise: hide it for this user only (don't touch DB)
      const hiddenIds = [...(useSettingsStore.getState().hiddenExerciseIds ?? []), id];
      await useSettingsStore.getState().updateSettings({ hiddenExerciseIds: hiddenIds });
      set((state) => ({ exercises: state.exercises.filter((ex) => ex.id !== id) }));
      return;
    }

    const { error, count } = await supabase
      .from('exercises')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (error) throw error;
    if (count === 0) throw new Error('Exercise could not be deleted. You may not have permission.');
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== id),
    }));
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setCategory: (category) => set({ selectedCategory: category }),
  setTag: (tag) => set({ selectedTag: tag }),

  filteredExercises: () => {
    const { exercises, searchTerm, selectedCategory, selectedTag } = get();
    return exercises.filter((ex) => {
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) return false;
      if (selectedTag && !ex.tags.includes(selectedTag)) return false;
      if (searchTerm && !ex.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  },

  availableTags: () => {
    const tags = get().exercises.flatMap((ex) => ex.tags);
    return [...new Set(tags)].sort();
  },
}));

