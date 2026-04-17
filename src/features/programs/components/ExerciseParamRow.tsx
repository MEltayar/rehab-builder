import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, Trash2 } from 'lucide-react';
import type { ProgramExercise } from '../../../types';
import { useSettingsStore } from '../../../store/settingsStore';

interface ExerciseParamRowProps {
  programExercise: ProgramExercise;
  exerciseName: string;
  onUpdateParams: (params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'weightKg' | 'restSeconds' | 'notes'>>) => void;
  onRemove: () => void;
}

const numInputClass =
  'w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function ExerciseParamRow({
  programExercise,
  exerciseName,
  onUpdateParams,
  onRemove,
}: ExerciseParamRowProps) {
  const isGym = useSettingsStore((s) => s.profileType) === 'gym';
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
      {/* Name row */}
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 shrink-0 p-1 -ml-1"
          aria-label="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {exerciseName}
        </span>
        <button
          onClick={onRemove}
          className="shrink-0 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label={`Remove ${exerciseName}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Params — 2×2 grid on mobile, 4 columns on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6">
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Sets</span>
          <input
            type="number"
            value={programExercise.sets ?? ''}
            onChange={(e) =>
              onUpdateParams({ sets: e.target.value ? Number(e.target.value) : undefined })
            }
            min={1}
            max={100}
            step={1}
            placeholder="—"
            className={numInputClass}
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Reps</span>
          <input
            type="text"
            value={programExercise.reps ?? ''}
            onChange={(e) =>
              onUpdateParams({ reps: e.target.value || undefined })
            }
            placeholder="—"
            className={numInputClass}
          />
        </label>

        {isGym ? (
          <label className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Weight (kg)</span>
            <input
              type="number"
              value={programExercise.weightKg ?? ''}
              onChange={(e) =>
                onUpdateParams({ weightKg: e.target.value ? Number(e.target.value) : undefined })
              }
              min={0}
              max={500}
              step={0.5}
              placeholder="—"
              className={numInputClass}
            />
          </label>
        ) : (
          <label className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Hold (s)</span>
            <input
              type="number"
              value={programExercise.holdTime ?? ''}
              onChange={(e) =>
                onUpdateParams({ holdTime: e.target.value ? Number(e.target.value) : undefined })
              }
              min={0}
              max={300}
              step={1}
              placeholder="—"
              className={numInputClass}
            />
          </label>
        )}

        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Rest (s)</span>
          <input
            type="number"
            value={programExercise.restSeconds ?? ''}
            onChange={(e) =>
              onUpdateParams({ restSeconds: e.target.value ? Number(e.target.value) : undefined })
            }
            min={0}
            max={600}
            step={1}
            placeholder="—"
            className={numInputClass}
          />
        </label>
      </div>

      {/* Notes */}
      <div className="pl-6">
        <input
          type="text"
          value={programExercise.notes ?? ''}
          onChange={(e) => onUpdateParams({ notes: e.target.value || undefined })}
          placeholder="Notes (optional)"
          className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
