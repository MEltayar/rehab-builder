import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useExerciseStore } from '../../../store/exerciseStore';
import type { ProgramExercise } from '../../../types';
import ExerciseParamRow from './ExerciseParamRow';

interface SortableExerciseListProps {
  exercises: ProgramExercise[];
  onUpdateParams: (
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'restSeconds' | 'notes'>>
  ) => void;
  onRemove: (programExerciseId: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export default function SortableExerciseList({
  exercises,
  onUpdateParams,
  onRemove,
  onReorder,
}: SortableExerciseListProps) {
  const allExercises = useExerciseStore((s) => s.exercises);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 py-3 text-center">
        No exercises yet — click Add Exercise
      </p>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {exercises.map((pe) => {
            const exerciseName =
              allExercises.find((e) => e.id === pe.exerciseId)?.name ?? 'Unknown exercise';
            return (
              <ExerciseParamRow
                key={pe.id}
                programExercise={pe}
                exerciseName={exerciseName}
                onUpdateParams={(params) => onUpdateParams(pe.id, params)}
                onRemove={() => onRemove(pe.id)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
