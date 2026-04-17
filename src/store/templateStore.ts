import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToTemplate, templateToDbRow, templatePatchToDbRow } from '../lib/mappers';
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
    if (get().isLoaded) return;
    const { data, error } = await supabase.from('templates').select('*');
    if (error) throw error;
    set({ templates: (data ?? []).map(dbRowToTemplate), isLoaded: true });
  },

  addTemplate: async (template) => {
    const { error } = await supabase.from('templates').insert(templateToDbRow(template));
    if (error) throw error;
    set((state) => ({ templates: [...state.templates, template] }));
  },

  updateTemplate: async (id, patch) => {
    const previous = get().templates;
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    try {
      const { error } = await supabase
        .from('templates')
        .update(templatePatchToDbRow(patch))
        .eq('id', id);
      if (error) throw error;
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
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete template:', err);
      set({ templates: previous });
      throw err;
    }
  },
}));
