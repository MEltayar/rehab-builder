import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import type { Client, DietPlan } from '../../../types';

interface DietPlanCardProps {
  plan: DietPlan;
  clients: Client[];
  onDelete?: () => void;
}

export default function DietPlanCard({ plan, clients, onDelete }: DietPlanCardProps) {
  const clientName = clients.find((c) => c.id === plan.clientId)?.name ?? 'Unknown client';
  const dayCount = plan.days.length;
  const mealCount = plan.days.reduce((sum, d) => sum + d.meals.length, 0);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="w-1 self-stretch rounded-full bg-green-500 shrink-0" />

      <div className="flex-1 min-w-0">
        <Link
          to={`/diet-plans/${plan.id}/edit`}
          className="font-medium text-green-600 dark:text-green-400 hover:underline truncate block"
        >
          {plan.name || 'Untitled Plan'}
        </Link>
        <div className="flex gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">{clientName}</span>
          {plan.goal && <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{plan.goal}</span>}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {dayCount} {dayCount === 1 ? 'day' : 'days'} · {mealCount} meals
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(plan.createdAt).toLocaleDateString()}
        </span>
        <Link
          to={`/diet-plans/${plan.id}/edit`}
          className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          aria-label={`Edit ${plan.name}`}
        >
          <Pencil size={14} />
        </Link>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label={`Delete ${plan.name}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
