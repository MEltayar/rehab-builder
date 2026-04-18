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
    const isAdmin = useUserStore.getState().canAccessAdmin();

    if (!exercise.isCustom && !isAdmin) {
      // Normal user editing built-in: create personal copy, hide original
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
      set((state) => ({
        exercises: state.exercises.filter((ex) => ex.id !== id).concat(copy),
      }));
      const hiddenIds = [...(useSettingsStore.getState().hiddenExerciseIds ?? []), id];
      useSettingsStore.getState().updateSettings({ hiddenExerciseIds: hiddenIds }).catch(() => {});
      return;
    }

    // Admin/Staff or editing own custom: update shared record in DB.
    // Add .select('id') so we can detect if RLS silently blocked the update
    // (built-in exercises may be owned by a different user_id in the DB).
    const { data: updated, error } = await supabase
      .from('exercises')
      .update(exercisePatchToDbRow(data))
      .eq('id', id)
      .select('id');
    if (error) throw error;

    // RLS blocked the update (0 rows affected) — upsert with current user as owner
    if (!updated || updated.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      const full: Exercise = { ...exercise, ...data, userId: user?.id };
      const { error: upsertError } = await supabase
        .from('exercises')
        .upsert({ ...exerciseToDbRow(full), user_id: user?.id }, { onConflict: 'id' });
      if (upsertError) throw upsertError;
    }

    set((state) => ({
      exercises: state.exercises.map((ex) => ex.id === id ? { ...ex, ...data } : ex),
    }));
  },

  deleteExercise: async (id) => {
    const exercise = get().exercises.find((ex) => ex.id === id);
    if (!exercise) return;
    const isAdmin = useUserStore.getState().canAccessAdmin();

    if (!exercise.isCustom && !isAdmin) {
      // Normal user deleting built-in: remove from local state immediately, persist hidden list in background
      set((state) => ({ exercises: state.exercises.filter((ex) => ex.id !== id) }));
      const hiddenIds = [...(useSettingsStore.getState().hiddenExerciseIds ?? []), id];
      useSettingsStore.getState().updateSettings({ hiddenExerciseIds: hiddenIds }).catch(() => {});
      return;
    }

    // Admin/Staff or deleting own custom: remove from DB
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) throw error;
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

