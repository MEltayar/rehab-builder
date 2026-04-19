import { create } from 'zustand';
import type { Exercise, ExerciseCategory } from '../types';
import { supabase } from '../lib/supabase';
import { dbRowToExercise, exerciseToDbRow, exercisePatchToDbRow } from '../lib/mappers';
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

// Module-level channel so we can clean up on re-init
let exerciseChannel: ReturnType<typeof supabase.channel> | null = null;

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

    // Clean up any existing subscription before creating a new one
    if (exerciseChannel) {
      supabase.removeChannel(exerciseChannel);
    }

    // Subscribe only to shared library rows (is_custom=false) so personal copies
    // never propagate to other users. Server-side filter is more reliable than
    // client-side filtering.
    exerciseChannel = supabase
      .channel('exercises-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'exercises', filter: 'is_custom=eq.false' },
        (payload) => {
          const hiddenIds = new Set(useSettingsStore.getState().hiddenExerciseIds ?? []);

          if (payload.eventType === 'INSERT') {
            const newEx = dbRowToExercise(payload.new as Record<string, unknown>);
            if (hiddenIds.has(newEx.id)) return;
            set((state) => {
              if (state.exercises.some((ex) => ex.id === newEx.id)) return state;
              return { exercises: [...state.exercises, newEx] };
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = dbRowToExercise(payload.new as Record<string, unknown>);
            set((state) => ({
              exercises: state.exercises.map((ex) => ex.id === updated.id ? updated : ex),
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            set((state) => ({
              exercises: state.exercises.filter((ex) => ex.id !== deletedId),
            }));
          }
        },
      )
      .subscribe();
  },

  addExercise: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = useUserStore.getState().canAccessAdmin();
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

    // Admin/Staff: update shared record in DB
    const { error } = await supabase
      .from('exercises')
      .update(exercisePatchToDbRow(data))
      .eq('id', id);
    if (error) throw error;
    // Realtime subscription will propagate the change to all other users automatically.
    // Update local state immediately for the current user.
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
