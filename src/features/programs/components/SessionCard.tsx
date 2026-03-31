import { useRef, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { ProgramExercise, Session } from '../../../types';
import SortableExerciseList from './SortableExerciseList';

interface SessionCardProps {
  session: Session;
  onUpdateLabel: (label: string) => void;
  onDelete: () => void;
  onAddExercise: () => void;
  onUpdateParams: (
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'restSeconds' | 'notes'>>
  ) => void;
  onRemoveExercise: (programExerciseId: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export default function SessionCard({
  session,
  onUpdateLabel,
  onDelete,
  onAddExercise,
  onUpdateParams,
  onRemoveExercise,
  onReorder,
}: SessionCardProps) {
  const [label, setLabel] = useState(session.label);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleBlur() {
    const trimmed = label.trim();
    if (trimmed) {
      onUpdateLabel(trimmed);
    } else {
      setLabel(session.label);
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          className="flex-1 bg-transparent border-none font-semibold text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 -mx-1"
        />
        <button
          onClick={onDelete}
          className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label={`Delete session ${session.label}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <SortableExerciseList
        exercises={session.exercises}
        onUpdateParams={onUpdateParams}
        onRemove={onRemoveExercise}
        onReorder={onReorder}
      />

      <button
        onClick={onAddExercise}
        className="flex items-center gap-1.5 self-start px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Plus size={13} />
        Add Exercise
      </button>
    </div>
  );
}
