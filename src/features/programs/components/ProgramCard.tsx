import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { Client, Program } from '../../../types';

interface ProgramCardProps {
  program: Program;
  clients: Client[];
  onDelete?: () => void;
}

export default function ProgramCard({ program, clients, onDelete }: ProgramCardProps) {
  const clientName = clients.find((c) => c.id === program.clientId)?.name ?? 'Unknown client';

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex-1 min-w-0">
        <Link
          to={`/programs/${program.id}/edit`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
        >
          {program.name}
        </Link>
        <div className="flex gap-3 mt-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">{clientName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{program.condition}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(program.createdAt).toLocaleDateString()}
        </span>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label={`Delete ${program.name}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
