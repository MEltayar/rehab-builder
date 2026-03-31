import { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Exercise } from '../../../types';
import { getYouTubeEmbedUrl } from '../services/youtubeUtils';

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
}

export default function VideoPreviewModal({ exercise, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exercise) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [exercise, onClose]);

  if (!exercise || !exercise.videoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(exercise.videoUrl);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
            {exercise.name}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <ExternalLink size={12} />
              Watch
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close preview"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="p-4">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={exercise.name}
              className="w-full aspect-video rounded"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          ) : (
            <div className="w-full aspect-video rounded bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3 text-center px-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Preview not available for this link.
              </p>
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <ExternalLink size={14} />
                Open link in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
