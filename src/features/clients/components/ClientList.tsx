import { Users } from 'lucide-react';
import type { Client } from '../../../types';
import ClientCard from './ClientCard';

interface ClientListProps {
  clients: Client[];
  isLoaded: boolean;
  searchTerm: string;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

export default function ClientList({ clients, isLoaded, searchTerm, onEdit, onDelete }: ClientListProps) {
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading clients…</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Users size={40} className="text-gray-300 dark:text-gray-600" />
        {searchTerm.trim() ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No clients found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try a different search term</p>
          </>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No clients yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Add your first client to get started</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit ? () => onEdit(client) : undefined}
          onDelete={onDelete ? () => onDelete(client) : undefined}
        />
      ))}
    </div>
  );
}
