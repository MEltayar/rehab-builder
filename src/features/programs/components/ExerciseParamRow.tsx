import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, Trash2 } from 'lucide-react';
import type { ProgramExercise } from '../../../types';

interface ExerciseParamRowProps {
  programExercise: ProgramExercise;
  exerciseName: string;
  onUpdateParams: (params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'restSeconds' | 'notes'>>) => void;
  onRemove: () => void;
}

const numInputClass =
  'w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function ExerciseParamRow({
  programExercise,
  exerciseName,
  onUpdateParams,
  onRemove,
}: ExerciseParamRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: programExercise.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {exerciseName}
        </span>
        <button
          onClick={onRemove}
          className="shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label={`Remove ${exerciseName}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3 pl-6">
        <label className="flex flex-col gap-0.5 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Sets</span>
          <input
            type="number"
            value={programExercise.sets ?? ''}
            onChange={(e) =>
              onUpdateParams({ sets: e.target.value ? Number(e.target.value) : undefined })
            }
            min={1}
            step={1}
            placeholder="—"
            className={numInputClass}
          />
        </label>

        <label className="flex flex-col gap-0.5 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Reps</span>
          <input
            type="text"
            value={programExercise.reps ?? ''}
            onChange={(e) =>
              onUpdateParams({ reps: e.target.value || undefined })
            }
            placeholder="—"
            className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col gap-0.5 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Hold (s)</span>
          <input
            type="number"
            value={programExercise.holdTime ?? ''}
            onChange={(e) =>
              onUpdateParams({ holdTime: e.target.value ? Number(e.target.value) : undefined })
            }
            min={0}
            step={1}
            placeholder="—"
            className={numInputClass}
          />
        </label>

        <label className="flex flex-col gap-0.5 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Rest (s)</span>
          <input
            type="number"
            value={programExercise.restSeconds ?? ''}
            onChange={(e) =>
              onUpdateParams({ restSeconds: e.target.value ? Number(e.target.value) : undefined })
            }
            min={0}
            step={1}
            placeholder="—"
            className={numInputClass}
          />
        </label>
      </div>

      <div className="pl-6">
        <input
          type="text"
          value={programExercise.notes ?? ''}
          onChange={(e) => onUpdateParams({ notes: e.target.value || undefined })}
          placeholder="Notes (optional)"
          className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
