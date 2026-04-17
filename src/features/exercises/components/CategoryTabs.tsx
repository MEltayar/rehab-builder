import type { ExerciseCategory } from '../../../types';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useSettingsStore } from '../../../store/settingsStore';

const PHYSIO_CATEGORIES: { value: ExerciseCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'mobility',   label: 'Mobility' },
  { value: 'stability',  label: 'Stability' },
  { value: 'strength',   label: 'Strength' },
  { value: 'stretching', label: 'Stretching' },
  { value: 'balance',    label: 'Balance' },
  { value: 'functional', label: 'Functional' },
];

const GYM_CATEGORIES: { value: ExerciseCategory | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'chest',     label: 'Chest' },
  { value: 'back',      label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps',    label: 'Biceps' },
  { value: 'triceps',   label: 'Triceps' },
  { value: 'legs',      label: 'Legs' },
  { value: 'glutes',    label: 'Glutes' },
  { value: 'core',      label: 'Core' },
  { value: 'cardio',    label: 'Cardio' },
  { value: 'full_body', label: 'Full Body' },
];

export default function CategoryTabs() {
  const selectedCategory = useExerciseStore((s) => s.selectedCategory);
  const setCategory = useExerciseStore((s) => s.setCategory);
  const isGym = useSettingsStore((s) => s.profileType) === 'gym';
  const CATEGORIES = isGym ? GYM_CATEGORIES : PHYSIO_CATEGORIES;

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setCategory(value)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === value
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
