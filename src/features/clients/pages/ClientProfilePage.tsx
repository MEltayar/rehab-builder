import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useClientStore } from '../../../store/clientStore';
import { db } from '../../../db';
import type { Program } from '../../../types';
import ClientModal from '../components/ClientModal';
import type { Client } from '../../../types';

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const clients = useClientStore((s) => s.clients);
  const updateClient = useClientStore((s) => s.updateClient);
  const initializeFromDB = useClientStore((s) => s.initializeFromDB);
  const isLoaded = useClientStore((s) => s.isLoaded);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      initializeFromDB();
    }
  }, [isLoaded, initializeFromDB]);

  useEffect(() => {
    if (!id) return;
    db.programs
      .where('clientId')
      .equals(id)
      .toArray()
      .then(setPrograms)
      .catch((err) => console.error('Failed to load client programs:', err));
  }, [id]);

  const client = clients.find((c) => c.id === id);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Client not found</p>
        <Link to="/clients" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  function handleSave(data: Omit<Client, 'id' | 'createdAt'>) {
    if (!client) return;
    updateClient(client.id, data);
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/clients"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline self-start"
      >
        ← Back to Clients
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{client.name}</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
        >
          Edit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-5 py-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Details
        </h2>
        {client.age !== undefined && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Age:</span> {client.age}
          </p>
        )}
        {client.email && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Email:</span> {client.email}
          </p>
        )}
        {client.phone && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Phone:</span> {client.phone}
          </p>
        )}
        {client.age === undefined && !client.email && !client.phone && (
          <p className="text-sm text-gray-400 dark:text-gray-500">No details recorded.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Programs</h2>
        {programs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-5 py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No programs yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Programs will appear here once created in the Program Builder
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
              >
                <Link
                  to={`/programs/${program.id}/edit`}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline block"
                >
                  {program.name}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {program.condition} ·{' '}
                  {new Date(program.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientModal
        client={client}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
