import { useEffect, useMemo, useState } from 'react';
import { useClientStore } from '../../../store/clientStore';
import type { Client } from '../../../types';
import ClientSearch from '../components/ClientSearch';
import ClientList from '../components/ClientList';
import ClientModal from '../components/ClientModal';

export default function ClientsPage() {
  const initializeFromDB = useClientStore((s) => s.initializeFromDB);
  const isLoaded = useClientStore((s) => s.isLoaded);
  const searchTerm = useClientStore((s) => s.searchTerm);
  const allClients = useClientStore((s) => s.clients);
  const addClient = useClientStore((s) => s.addClient);

  const clients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term ? allClients.filter((c) => c.name.toLowerCase().includes(term)) : allClients;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [allClients, searchTerm]);
  const updateClient = useClientStore((s) => s.updateClient);
  const deleteClient = useClientStore((s) => s.deleteClient);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    initializeFromDB();
  }, [initializeFromDB]);

  function handleEdit(client: Client) {
    setSelectedClient(client);
    setModalOpen(true);
  }

  function handleDelete(client: Client) {
    if (window.confirm(`Delete "${client.name}"?`)) {
      deleteClient(client.id);
    }
  }

  function handleSave(data: Omit<Client, 'id' | 'createdAt'>) {
    if (selectedClient) {
      updateClient(selectedClient.id, data);
    } else {
      addClient(data);
    }
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clients</h1>
        <button
          onClick={() => { setSelectedClient(null); setModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Add Client
        </button>
      </div>

      <ClientSearch />

      <ClientList
        clients={clients}
        isLoaded={isLoaded}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ClientModal
        client={selectedClient}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
