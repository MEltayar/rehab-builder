import { useEffect, useMemo, useRef } from 'react';
import { X, Star } from 'lucide-react';
import type { Template } from '../../../types';
import { LockedButton } from '../../../components/UpgradeLock';
import { useExerciseStore } from '../../../store/exerciseStore';

interface Props {
  template: Template;
  isFavourite: boolean;
  locked: boolean;
  onToggleFavourite: (id: string) => void;
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export default function TemplatePreviewModal({
  template,
  isFavourite,
  locked,
  onToggleFavourite,
  onSelect,
  onClose,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const exercises = useExerciseStore((s) => s.exercises);
  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e.name])), [exercises]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{template.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{template.condition}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavourite(template.id)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star
                size={18}
                className={isFavourite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 dark:text-gray-500'}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close preview"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{template.description}</p>
          )}

          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {template.sessions.map((session, si) => (
              <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {session.label || `Session ${si + 1}`}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {session.exercises.map((ex) => (
                    <li key={ex.id} className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center shrink-0 font-medium">
                        {ex.order}
                      </span>
                      <span className="flex-1 truncate">
                        {exerciseMap.get(ex.exerciseId) ?? <span className="text-amber-500 dark:text-amber-400 italic">Unknown exercise</span>}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets ? `${ex.sets} sets` : ex.reps ? ex.reps : ''}
                        {ex.holdTime ? ` · ${ex.holdTime}s hold` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <LockedButton
            locked={locked}
            feature="templates"
            onClick={() => onSelect(template)}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Use Template
          </LockedButton>
        </div>
      </div>
    </div>
  );
}
