import { Dumbbell } from 'lucide-react';
import type { Exercise } from '../../../types';
import ExerciseCard from './ExerciseCard';

interface ExerciseGridProps {
  exercises: Exercise[];
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onPreview?: (exercise: Exercise) => void;
}

export default function ExerciseGrid({ exercises, onEdit, onDelete, onPreview }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Dumbbell size={40} className="text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No exercises found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onEdit={onEdit ? () => onEdit(exercise) : undefined}
          onDelete={onDelete ? () => onDelete(exercise) : undefined}
          onPreview={onPreview ? () => onPreview(exercise) : undefined}
        />
      ))}
    </div>
  );
}
