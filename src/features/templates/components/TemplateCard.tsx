import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Layers, Dumbbell, Lock } from 'lucide-react';
import { useTemplateStore } from '../../../store/templateStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import type { Template } from '../../../types';

interface TemplateCardProps {
  template: Template;
  canUse?: boolean;
  onPreview?: (template: Template) => void;
}

export default function TemplateCard({ template, canUse = true, onPreview }: TemplateCardProps) {
  const navigate = useNavigate();
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);
  const exercises = useExerciseStore((s) => s.exercises);
  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const totalExercises = template.sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0,
  );

  const descriptionExcerpt =
    template.description && template.description.length > 100
      ? template.description.slice(0, 97) + '…'
      : template.description;

  function handleUseTemplate() {
    navigate(`/programs/new?template=${template.id}`);
  }

  function handleEdit() {
    navigate(`/templates/${template.id}/edit`);
  }

  function handleDelete() {
    showConfirm({
      title: 'Delete Template',
      message: `Are you sure you want to delete "${template.name}"? This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteTemplate(template.id);
        } catch (err) {
          console.error('Failed to delete template:', err);
          showToast('Failed to delete template. Please try again.', 'error');
        }
      },
    });
  }

  // Resolve exercise names for unknown-exercise detection (T017)
  const exerciseMap = new Map(exercises.map((ex) => [ex.id, ex.name]));
  const unknownCount = template.sessions
    .flatMap((s) => s.exercises)
    .filter((pe) => !exerciseMap.has(pe.exerciseId)).length;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight truncate">
            {template.name}
          </h3>
          {template.condition && (
            <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5 truncate">
              {template.condition}
            </p>
          )}
        </div>
        {template.isBuiltIn && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-medium">
            Built-in
          </span>
        )}
      </div>

      {/* Description */}
      {descriptionExcerpt && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {descriptionExcerpt}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Layers size={12} />
          {template.sessions.length} session{template.sessions.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Dumbbell size={12} />
          {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
        </span>
        {unknownCount > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            {unknownCount} unknown
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
        {onPreview && (
          <button
            onClick={() => onPreview(template)}
            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            aria-label="Preview template"
            title="Preview"
          >
            <Eye size={14} />
          </button>
        )}
        {canUse ? (
          <button
            onClick={handleUseTemplate}
            className="flex-1 py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-md transition-colors"
          >
            Use Template
          </button>
        ) : (
          <a
            href="/pricing"
            title="Upgrade to Pro to use templates"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            <Lock size={11} />
            Upgrade to Use
          </a>
        )}

        {!template.isBuiltIn && (
          <>
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Edit template"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              aria-label="Delete template"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
