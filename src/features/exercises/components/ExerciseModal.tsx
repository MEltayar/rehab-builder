import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Exercise, ExerciseCategory, EquipmentType, ProgressionLevel } from '../../../types';
import { useSettingsStore } from '../../../store/settingsStore';
import QRPreview from './QRPreview';

const PHYSIO_CATEGORIES: ExerciseCategory[] = [
  'mobility', 'stability', 'strength', 'stretching', 'balance', 'functional',
];
const GYM_CATEGORIES: ExerciseCategory[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'core', 'cardio', 'full_body',
];

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  mobility: 'Mobility', stability: 'Stability', strength: 'Strength',
  stretching: 'Stretching', balance: 'Balance', functional: 'Functional',
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', legs: 'Legs',
  glutes: 'Glutes', core: 'Core', cardio: 'Cardio', full_body: 'Full Body',
};

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string }[] = [
  { value: 'barbell',        label: 'Barbell' },
  { value: 'dumbbell',       label: 'Dumbbell' },
  { value: 'cable',          label: 'Cable' },
  { value: 'machine',        label: 'Machine' },
  { value: 'bodyweight',     label: 'Bodyweight' },
  { value: 'kettlebell',     label: 'Kettlebell' },
  { value: 'resistance_band',label: 'Resistance Band' },
  { value: 'ez_bar',         label: 'EZ Bar' },
  { value: 'other',          label: 'Other' },
];
const LEVELS: { value: ProgressionLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

type ExerciseFormData = Omit<Exercise, 'id' | 'createdAt' | 'isCustom' | 'progressionGroupId' | 'imageUrl'>;

interface ExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExerciseFormData) => void;
}

const emptyPhysioForm = (): ExerciseFormData => ({
  name: '', category: 'mobility', description: '',
  tags: [], progressionLevel: undefined, videoUrl: '', notes: '',
});

const emptyGymForm = (): ExerciseFormData => ({
  name: '', category: 'chest', description: '',
  tags: [], progressionLevel: undefined, videoUrl: '', notes: '',
  muscleGroup: '', equipment: undefined,
});

export default function ExerciseModal({ exercise, isOpen, onClose, onSave }: ExerciseModalProps) {
  const isGym = useSettingsStore((s) => s.profileType) === 'gym';
  const CATEGORIES = isGym ? GYM_CATEGORIES : PHYSIO_CATEGORIES;
  const [form, setForm] = useState<ExerciseFormData>(isGym ? emptyGymForm() : emptyPhysioForm());
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (exercise) {
        setForm({
          name: exercise.name,
          category: exercise.category,
          description: exercise.description ?? '',
          tags: exercise.tags,
          progressionLevel: exercise.progressionLevel,
          videoUrl: exercise.videoUrl ?? '',
          notes: exercise.notes ?? '',
          muscleGroup: exercise.muscleGroup ?? '',
          equipment: exercise.equipment,
        });
        setTagsInput(exercise.tags.join(', '));
      } else {
        setForm(isGym ? emptyGymForm() : emptyPhysioForm());
        setTagsInput('');
      }
      setErrors({});
    }
  }, [isOpen, exercise]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (form.videoUrl && form.videoUrl.trim()) {
      try { new URL(form.videoUrl); } catch {
        newErrors.videoUrl = 'Must be a valid URL';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ ...form, tags });
  };

  const isEditMode = exercise !== null;
  const title = isEditMode ? 'Edit Exercise' : 'Add Exercise';
  const saveLabel = isEditMode ? 'Save Changes' : 'Add Exercise';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter exercise name"
              className={`px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExerciseCategory })}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>

          {isGym && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Muscle</label>
                <input
                  type="text"
                  value={form.muscleGroup ?? ''}
                  onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
                  placeholder="e.g. Quadriceps"
                  className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Equipment</label>
                <select
                  value={form.equipment ?? ''}
                  onChange={(e) => setForm({ ...form, equipment: (e.target.value as EquipmentType) || undefined })}
                  className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">— Not set —</option>
                  {EQUIPMENT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
            <select
              value={form.progressionLevel ?? ''}
              onChange={(e) => setForm({
                ...form,
                progressionLevel: (e.target.value as ProgressionLevel) || undefined,
              })}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">— Not set —</option>
              {LEVELS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. shoulder, posture, stretching"
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Video URL</label>
            <div className="relative">
              <input
                type="text"
                value={form.videoUrl ?? ''}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=…"
                className="px-3 py-2 pr-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
              />
              {form.videoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, videoUrl: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove video"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {errors.videoUrl && <p className="text-xs text-red-500">{errors.videoUrl}</p>}
            {form.videoUrl && <QRPreview url={form.videoUrl} />}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
