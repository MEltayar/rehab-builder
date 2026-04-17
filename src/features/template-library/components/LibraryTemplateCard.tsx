import { Star } from 'lucide-react';
import type { Template } from '../../../types';
import { LockedButton } from '../../../components/UpgradeLock';

interface Props {
  template: Template;
  isFavourite: boolean;
  locked: boolean;
  onToggleFavourite: (id: string) => void;
  onPreview: (template: Template) => void;
  onSelect: (template: Template) => void;
}

export default function LibraryTemplateCard({
  template,
  isFavourite,
  locked,
  onToggleFavourite,
  onPreview,
  onSelect,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{template.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{template.condition}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavourite(template.id)}
          className="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Star
            size={16}
            className={isFavourite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 dark:text-gray-500'}
          />
        </button>
      </div>

      {template.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{template.description}</p>
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

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {template.sessions.length} session{template.sessions.length !== 1 ? 's' : ''}
        {' · '}
        {template.sessions.reduce((sum, s) => sum + s.exercises.length, 0)} exercises
      </div>

      <div className="flex justify-end gap-2 mt-auto">
        <button
          type="button"
          onClick={() => onPreview(template)}
          className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Preview
        </button>
        <LockedButton
          locked={locked}
          feature="templates"
          onClick={() => onSelect(template)}
          className="px-3 py-1.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
        >
          Use Template
        </LockedButton>
      </div>
    </div>
  );
}
