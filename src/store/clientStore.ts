import { create } from 'zustand';
import type { Client } from '../types';
import { db } from '../db';
import { getAllClients } from '../features/clients/services/clientService';

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
    const all = await getAllClients();
    set({ clients: all, isLoaded: true });
  },

  addClient: async (data) => {
    const client: Client = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await db.clients.add(client);
    set((state) => ({ clients: [...state.clients, client] }));
  },

  updateClient: async (id, data) => {
    const previous = get().clients;
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    try {
      await db.clients.update(id, data);
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
      await db.clients.delete(id);
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
