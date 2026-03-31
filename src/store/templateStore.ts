import { create } from 'zustand';
import { db } from '../db';
import type { Template } from '../types';

interface TemplateStore {
  templates: Template[];
  isLoaded: boolean;

  initializeFromDB: () => Promise<void>;
  addTemplate: (template: Template) => Promise<void>;
  updateTemplate: (id: string, patch: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  isLoaded: false,

  initializeFromDB: async () => {
    const all = await db.templates.toArray();
    set({ templates: all, isLoaded: true });
  },

  addTemplate: async (template) => {
    await db.templates.add(template);
    set((state) => ({ templates: [...state.templates, template] }));
  },

  updateTemplate: async (id, patch) => {
    const previous = get().templates;
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    try {
      await db.templates.update(id, patch);
    } catch (err) {
      console.error('Failed to update template:', err);
      set({ templates: previous });
      throw err;
    }
  },

  deleteTemplate: async (id) => {
    const previous = get().templates;
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
    try {
      await db.templates.delete(id);
    } catch (err) {
      console.error('Failed to delete template:', err);
      set({ templates: previous });
      throw err;
    }
  },
}));
