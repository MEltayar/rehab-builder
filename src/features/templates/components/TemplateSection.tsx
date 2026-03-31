import type { Template } from '../../../types';
import TemplateCard from './TemplateCard';

interface TemplateSectionProps {
  title: string;
  templates: Template[];
  emptyMessage?: string;
}

export default function TemplateSection({ title, templates, emptyMessage }: TemplateSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-xs">
        {title}
      </h2>

      {templates.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4">
          {emptyMessage ?? 'No templates available.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
