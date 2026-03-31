import { useEffect, useMemo, useState } from 'react';
import type { Exercise } from '../../../types';
import { useExerciseStore } from '../../../store/exerciseStore';
import CategoryTabs from '../components/CategoryTabs';
import ExerciseSearch from '../components/ExerciseSearch';
import TagFilter from '../components/TagFilter';
import ExerciseGrid from '../components/ExerciseGrid';
import ExerciseModal from '../components/ExerciseModal';
import VideoPreviewModal from '../components/VideoPreviewModal';

export default function ExercisesPage() {
  const initializeFromDB = useExerciseStore((s) => s.initializeFromDB);
  const isLoaded = useExerciseStore((s) => s.isLoaded);
  const allExercises = useExerciseStore((s) => s.exercises);
  const searchTerm = useExerciseStore((s) => s.searchTerm);
  const selectedCategory = useExerciseStore((s) => s.selectedCategory);
  const selectedTag = useExerciseStore((s) => s.selectedTag);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) return false;
      if (selectedTag && !ex.tags.includes(selectedTag)) return false;
      if (searchTerm && !ex.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [allExercises, searchTerm, selectedCategory, selectedTag]);
  const addExercise = useExerciseStore((s) => s.addExercise);
  const updateExercise = useExerciseStore((s) => s.updateExercise);
  const deleteExercise = useExerciseStore((s) => s.deleteExercise);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    initializeFromDB();
  }, [initializeFromDB]);

  const handleAdd = () => {
    setSelectedExercise(null);
    setModalOpen(true);
  };

  const handleEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const handleDelete = (exercise: Exercise) => {
    if (window.confirm(`Delete "${exercise.name}"?`)) {
      deleteExercise(exercise.id);
    }
  };

  const handleSave = (data: Parameters<typeof addExercise>[0]) => {
    if (selectedExercise) {
      updateExercise(selectedExercise.id, data);
    } else {
      addExercise(data);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exercise Library</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Add Exercise
        </button>
      </div>

      <CategoryTabs />

      <div className="flex flex-col gap-2">
        <ExerciseSearch />
        <TagFilter />
      </div>

      {!isLoaded ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading exercises…</p>
        </div>
      ) : (
        <ExerciseGrid
          exercises={filteredExercises}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={(ex) => setPreviewExercise(ex)}
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
  );
}
