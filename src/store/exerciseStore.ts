import { create } from 'zustand';
import type { Exercise, ExerciseCategory } from '../types';
import { db } from '../db';
import { seedIfEmpty, getAllExercises } from '../features/exercises/services/exerciseService';

interface ExerciseStore {
  exercises: Exercise[];
  isLoaded: boolean;
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
  searchTerm: '',
  selectedCategory: 'all',
  selectedTag: null,

  initializeFromDB: async () => {
    await seedIfEmpty();
    const all = await getAllExercises();
    set({ exercises: all, isLoaded: true });
  },

  addExercise: async (data) => {
    const exercise: Exercise = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
    await db.exercises.add(exercise);
    set((state) => ({ exercises: [...state.exercises, exercise] }));
  },

  updateExercise: async (id, data) => {
    await db.exercises.update(id, data);
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, ...data } : ex
      ),
    }));
  },

  deleteExercise: async (id) => {
    await db.exercises.delete(id);
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
