import { create } from 'zustand';
import type { Client } from '../types';
import { supabase } from '../lib/supabase';
import { clientToDbRow, clientPatchToDbRow } from '../lib/mappers';
import { getAllClients } from '../features/clients/services/clientService';
import { usePlanStore } from './planStore';
import { readListCache, writeListCache } from '../lib/storeCache';

interface ClientStore {
  clients: Client[];
  isLoaded: boolean;
  searchTerm: string;

  initializeFromDB: () => Promise<void>;
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;

  filteredClients: () => Client[];
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  isLoaded: false,
  searchTerm: '',

  initializeFromDB: async () => {
    if (get().isLoaded) return;

    const cached = readListCache<Client>('clients');
    if (cached) {
      set({ clients: cached, isLoaded: true });
      getAllClients()
        .then((fresh) => {
          writeListCache('clients', fresh);
          set({ clients: fresh });
        })
        .catch((err) => console.error('[clientStore] background refresh failed:', err));
      return;
    }

    const all = await getAllClients();
    writeListCache('clients', all);
    set({ clients: all, isLoaded: true });
  },

  addClient: async (data) => {
    // Hard enforce limit — checked here regardless of UI state
    if (usePlanStore.getState().clientLimitReached()) {
      throw new Error('Client limit reached. Upgrade to Pro to add more clients.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    const client: Client = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('clients')
      .insert({ ...clientToDbRow(client), user_id: user?.id });
    if (error) throw new Error(error.message);
    set((state) => ({ clients: [...state.clients, client] }));
    // Increment lifetime counter
    await usePlanStore.getState().incrementClientsCreated();
  },

  updateClient: async (id, data) => {
    const previous = get().clients;
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    try {
      const { error } = await supabase
        .from('clients')
        .update(clientPatchToDbRow(data))
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update client:', err);
      set({ clients: previous });
      throw err;
    }
  },

  deleteClient: async (id) => {
    const previous = get().clients;
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete client:', err);
      set({ clients: previous });
      throw err;
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  filteredClients: () => {
    const { clients, searchTerm } = get();
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? clients.filter((c) => c.name.toLowerCase().includes(term))
      : clients;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  },
}));

useClientStore.subscribe((state, prev) => {
  if (state.clients !== prev.clients && state.isLoaded) {
    writeListCache('clients', state.clients);
  }
});
