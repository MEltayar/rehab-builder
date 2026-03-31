import { useMemo } from 'react';
import { useExerciseStore } from '../../../store/exerciseStore';

export default function TagFilter() {
  const exercises = useExerciseStore((s) => s.exercises);
  const availableTags = useMemo(() => {
    const tags = exercises.flatMap((ex) => ex.tags);
    return [...new Set(tags)].sort();
  }, [exercises]);
  const selectedTag = useExerciseStore((s) => s.selectedTag);
  const setTag = useExerciseStore((s) => s.setTag);

  if (availableTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {availableTags.map((tag) => (
        <button
          key={tag}
          onClick={() => setTag(selectedTag === tag ? null : tag)}
          className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
            selectedTag === tag
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
