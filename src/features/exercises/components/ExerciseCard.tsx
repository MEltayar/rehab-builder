import { useState } from 'react';
import { ExternalLink, Pencil, Trash2, Video } from 'lucide-react';
import type { Exercise, ExerciseCategory } from '../../../types';
import { getYouTubeThumbnailUrl } from '../services/youtubeUtils';

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  mobility: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  stability: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  strength: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  stretching: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  balance: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  functional: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onEdit, onDelete, onPreview }: ExerciseCardProps) {
  const visibleTags = exercise.tags.slice(0, 3);
  const thumbnailUrl = exercise.videoUrl ? getYouTubeThumbnailUrl(exercise.videoUrl) : null;
  const [thumbError, setThumbError] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
      {/* Thumbnail */}
      {thumbnailUrl && !thumbError ? (
        <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-700 shrink-0">
          <img
            src={thumbnailUrl}
            alt={`${exercise.name} video thumbnail`}
            className="w-full h-full object-cover"
            onError={() => setThumbError(true)}
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Video size={18} className="text-gray-800 ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        /* Placeholder strip for exercises without a thumbnail */
        <div className="w-full h-1.5 shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60" />
      )}

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {exercise.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[exercise.category]}`}>
            {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
          </span>
          {exercise.progressionLevel && (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
              {LEVEL_LABELS[exercise.progressionLevel]}
            </span>
          )}
        </div>

        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {exercise.tags.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                +{exercise.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {(onEdit || onDelete || exercise.videoUrl) && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                aria-label={`Watch ${exercise.name} video`}
              >
                <ExternalLink size={12} />
                Watch
              </a>
            )}
            {exercise.videoUrl && onPreview && (
              <button
                type="button"
                onClick={() => onPreview(exercise)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                aria-label={`Preview ${exercise.name} video`}
              >
                <Video size={12} />
                Preview
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Edit ${exercise.name}`}
              >
                <Pencil size={12} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label={`Delete ${exercise.name}`}
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
