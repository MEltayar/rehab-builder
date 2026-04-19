import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToTemplate, templateToDbRow, templatePatchToDbRow } from '../lib/mappers';
import { readListCache, writeListCache } from '../lib/storeCache';
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

    const cached = readListCache<Template>('templates');
    if (cached) {
      set({ templates: cached, isLoaded: true });
      supabase.from('templates').select('*').then(({ data, error }) => {
        if (error) { console.error('[templateStore] background refresh failed:', error); return; }
        const fresh = (data ?? []).map(dbRowToTemplate);
        writeListCache('templates', fresh);
        set({ templates: fresh });
      });
      return;
    }

    const { data, error } = await supabase.from('templates').select('*');
    if (error) throw error;
    const templates = (data ?? []).map(dbRowToTemplate);
    writeListCache('templates', templates);
    set({ templates, isLoaded: true });
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

useTemplateStore.subscribe((state, prev) => {
  if (state.templates !== prev.templates && state.isLoaded) {
    writeListCache('templates', state.templates);
  }
});
