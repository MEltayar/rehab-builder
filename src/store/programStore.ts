import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { db } from '../db';
import type { Program, Session, ProgramExercise, Template } from '../types';
import { getAllPrograms } from '../features/programs/services/programService';

interface ProgramStore {
  programs: Program[];
  isLoaded: boolean;
  draft: Program | null;

  initializeFromDB: () => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;

  startNewDraft: (clientId: string) => void;
  loadDraftFromProgram: (program: Program) => void;
  loadDraftFromTemplate: (template: Template) => void;
  clearDraft: () => void;
  saveDraft: () => Promise<void>;

  setDraftField: (
    field: 'name' | 'condition' | 'goal' | 'durationWeeks' | 'startDate' | 'clientId',
    value: string | number
  ) => void;

  addSession: () => void;
  updateSessionLabel: (sessionId: string, label: string) => void;
  deleteSession: (sessionId: string) => void;

  addExerciseToSession: (sessionId: string, exerciseId: string) => void;
  updateExerciseParams: (
    sessionId: string,
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'restSeconds' | 'notes'>>
  ) => void;
  removeExerciseFromSession: (sessionId: string, programExerciseId: string) => void;
  reorderExercisesInSession: (sessionId: string, oldIndex: number, newIndex: number) => void;
}

export const useProgramStore = create<ProgramStore>((set, get) => ({
  programs: [],
  isLoaded: false,
  draft: null,

  initializeFromDB: async () => {
    const all = await getAllPrograms();
    set({ programs: all, isLoaded: true });
  },

  deleteProgram: async (id) => {
    const previous = get().programs;
    set((state) => ({ programs: state.programs.filter((p) => p.id !== id) }));
    try {
      await db.programs.delete(id);
    } catch (err) {
      console.error('Failed to delete program:', err);
      set({ programs: previous });
      throw err;
    }
  },

  startNewDraft: (clientId) => {
    set({
      draft: {
        id: crypto.randomUUID(),
        clientId,
        name: '',
        condition: '',
        goal: 'Reduce pain and restore normal movement.',
        durationWeeks: 4,
        startDate: new Date().toISOString().split('T')[0],
        sessions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  loadDraftFromProgram: (program) => {
    set({ draft: JSON.parse(JSON.stringify(program)) });
  },

  loadDraftFromTemplate: (template) => {
    set({
      draft: {
        id: crypto.randomUUID(),
        clientId: '',
        name: template.name,
        condition: template.condition,
        goal: '',
        durationWeeks: 4,
        startDate: new Date().toISOString().split('T')[0],
        sessions: JSON.parse(JSON.stringify(template.sessions)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  clearDraft: () => set({ draft: null }),

  saveDraft: async () => {
    const { draft, programs } = get();
    if (!draft) throw new Error('No draft to save');
    const updated: Program = { ...draft, updatedAt: new Date().toISOString() };
    await db.programs.put(updated);
    const exists = programs.some((p) => p.id === updated.id);
    set({
      draft: updated,
      programs: exists
        ? programs.map((p) => (p.id === updated.id ? updated : p))
        : [...programs, updated],
    });
  },

  setDraftField: (field, value) => {
    set((state) => {
      if (!state.draft) return state;
      return { draft: { ...state.draft, [field]: value } };
    });
  },

  addSession: () => {
    set((state) => {
      if (!state.draft) return state;
      const n = state.draft.sessions.length + 1;
      const newSession: Session = {
        id: crypto.randomUUID(),
        label: `Session ${n}`,
        exercises: [],
      };
      return { draft: { ...state.draft, sessions: [...state.draft.sessions, newSession] } };
    });
  },

  updateSessionLabel: (sessionId, label) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) =>
            s.id === sessionId ? { ...s, label } : s
          ),
        },
      };
    });
  },

  deleteSession: (sessionId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.filter((s) => s.id !== sessionId),
        },
      };
    });
  },

  addExerciseToSession: (sessionId, exerciseId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const newExercise: ProgramExercise = {
              id: crypto.randomUUID(),
              exerciseId,
              order: s.exercises.length,
            };
            return { ...s, exercises: [...s.exercises, newExercise] };
          }),
        },
      };
    });
  },

  updateExerciseParams: (sessionId, programExerciseId, params) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              exercises: s.exercises.map((ex) =>
                ex.id === programExerciseId ? { ...ex, ...params } : ex
              ),
            };
          }),
        },
      };
    });
  },

  removeExerciseFromSession: (sessionId, programExerciseId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const filtered = s.exercises.filter((ex) => ex.id !== programExerciseId);
            return {
              ...s,
              exercises: filtered.map((ex, i) => ({ ...ex, order: i })),
            };
          }),
        },
      };
    });
  },

  reorderExercisesInSession: (sessionId, oldIndex, newIndex) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const reordered = arrayMove(s.exercises, oldIndex, newIndex).map((ex, i) => ({
              ...ex,
              order: i,
            }));
            return { ...s, exercises: reordered };
          }),
        },
      };
    });
  },
}));
