import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import type { Client } from '../../../types';

interface ClientCardProps {
  client: Client;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex-1 min-w-0">
        <Link
          to={`/clients/${client.id}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
        >
          {client.name}
        </Link>
        <div className="flex gap-3 mt-0.5">
          {client.age !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Age: {client.age}</span>
          )}
          {client.email && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{client.email}</span>
          )}
          {client.phone && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{client.phone}</span>
          )}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Edit ${client.name}`}
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label={`Delete ${client.name}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
