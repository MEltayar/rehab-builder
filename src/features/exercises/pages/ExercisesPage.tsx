import { useEffect, useMemo, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import type { Exercise } from '../../../types';
import { usePlanStore } from '../../../store/planStore';
import { LockedButton } from '../../../components/UpgradeLock';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useUserStore } from '../../../store/userStore';

const GYM_CATEGORY_SET = new Set([
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'legs', 'glutes', 'core', 'cardio', 'full_body',
]);
import CategoryTabs from '../components/CategoryTabs';
import ExerciseSearch from '../components/ExerciseSearch';
import ExerciseTable from '../components/ExerciseTable';
import ExerciseModal from '../components/ExerciseModal';
import VideoPreviewModal from '../components/VideoPreviewModal';
import GymFloatAnimation from '../../../components/GymFloatAnimation';

export default function ExercisesPage() {
  const initializeFromDB = useExerciseStore((s) => s.initializeFromDB);
  const isLoaded = useExerciseStore((s) => s.isLoaded);
  const allExercises = useExerciseStore((s) => s.exercises);
  const searchTerm = useExerciseStore((s) => s.searchTerm);
  const selectedCategory = useExerciseStore((s) => s.selectedCategory);
  const isGym = useSettingsStore((s) => s.profileType) === 'gym';

  const filteredExercises = useMemo(() => {
    let list = allExercises.filter((ex) => {
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) return false;
      if (searchTerm && !ex.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
    // In gym mode "All" tab: show gym exercises first
    if (isGym && selectedCategory === 'all') {
      list = [...list].sort((a, b) => {
        const aGym = GYM_CATEGORY_SET.has(a.category) ? 0 : 1;
        const bGym = GYM_CATEGORY_SET.has(b.category) ? 0 : 1;
        return aGym - bGym;
      });
    }
    return list;
  }, [allExercises, searchTerm, selectedCategory, isGym]);
  const addExercise = useExerciseStore((s) => s.addExercise);
  const updateExercise = useExerciseStore((s) => s.updateExercise);
  const deleteExercise = useExerciseStore((s) => s.deleteExercise);
  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const canEdit  = useUserStore((s) => s.canEdit);
  const canAccessAdmin = useUserStore((s) => s.canAccessAdmin);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    initializeFromDB();
  }, [initializeFromDB]);

  // Load display names for custom exercise owners (admin only)
  useEffect(() => {
    if (!canAccessAdmin()) return;
    const ids = [...new Set(allExercises.filter(ex => ex.isCustom && ex.userId).map(ex => ex.userId as string))];
    if (ids.length === 0) return;
    supabase.from('user_profiles').select('id, display_name').in('id', ids).then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach(p => { map[p.id] = p.display_name ?? 'Unknown'; });
      setUserNames(map);
    });
  }, [allExercises, canAccessAdmin]);

  const handleAdd = () => {
    setSelectedExercise(null);
    setModalOpen(true);
  };

  const handleEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const handleDelete = (exercise: Exercise) => {
    showConfirm({
      title: 'Delete Exercise',
      message: `Are you sure you want to delete "${exercise.name}"?`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteExercise(exercise.id);
        } catch {
          showToast('Failed to delete exercise. Please try again.', 'error');
        }
      },
    });
  };

  const handleSave = (data: Parameters<typeof addExercise>[0]) => {
    if (selectedExercise) {
      updateExercise(selectedExercise.id, data);
    } else {
      addExercise(data);
    }
    setModalOpen(false);
  };

  const canAddCustomExercise = usePlanStore((s) => s.limits().canAddCustomExercise);

  return (
    <div className="relative flex flex-col gap-4 min-h-screen">
      <GymFloatAnimation count={20} />

      <div className="relative z-10 flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
            <Dumbbell size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Exercise Library</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse, filter and manage your full exercise database.</p>
          </div>
        </div>
        <LockedButton
          locked={!canAddCustomExercise}
          feature="custom exercises"
          onClick={handleAdd}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          + Add Exercise
        </LockedButton>
      </div>

      <CategoryTabs />

      <ExerciseSearch />

      {!isLoaded ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading exercises…</p>
        </div>
      ) : (
        <ExerciseTable
          exercises={filteredExercises}
          onEdit={(ex) => canAccessAdmin() || !ex.isCustom || canEdit(ex.userId) ? () => handleEdit(ex) : undefined}
          onDelete={(ex) => canAccessAdmin() || !ex.isCustom || canEdit(ex.userId) ? () => handleDelete(ex) : undefined}
          onPreview={(ex) => setPreviewExercise(ex)}
          isAdmin={canAccessAdmin()}
          userNames={userNames}
        />
      )}

      <ExerciseModal
        exercise={selectedExercise}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <VideoPreviewModal
        exercise={previewExercise}
        onClose={() => setPreviewExercise(null)}
      />
      </div>
    </div>
  );
}
