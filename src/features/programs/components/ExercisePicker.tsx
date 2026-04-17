import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useSettingsStore } from '../../../store/settingsStore';
import type { ExerciseCategory } from '../../../types';

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

const CATEGORY_COLORS: Record<string, string> = {
  // Physio
  mobility:   'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  stability:  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  strength:   'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  stretching: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  balance:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  functional: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  // Gym
  chest:      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  back:       'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  shoulders:  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  biceps:     'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  triceps:    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  legs:       'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  glutes:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  core:       'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  cardio:     'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  full_body:  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

export default function ExercisePicker({ isOpen, onClose, onSelect }: ExercisePickerProps) {
  const exercises = useExerciseStore((s) => s.exercises);
  const isGym = useSettingsStore((s) => s.profileType) === 'gym';
  const CATEGORIES = isGym ? GYM_CATEGORIES : PHYSIO_CATEGORIES;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setCategory('all');
    setTimeout(() => inputRef.current?.focus(), 50);
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    return exercises
      .filter((ex) => {
        if (category !== 'all' && ex.category !== category) return false;
        if (search.trim() && !ex.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, search, category]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Add Exercise</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3 flex flex-col gap-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {exercises.length === 0
                  ? 'No exercises in library yet — add exercises first.'
                  : 'No exercises match your search.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { onSelect(ex.id); onClose(); }}
                  className="flex items-center justify-between gap-3 px-2 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-left transition-colors rounded-md"
                >
                  <span className="text-sm text-gray-900 dark:text-gray-100 leading-snug">
                    {ex.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[ex.category] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {ex.category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    {isGym && ex.muscleGroup && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {ex.muscleGroup}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
