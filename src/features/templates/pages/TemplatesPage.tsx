import { useMemo, useState } from 'react';
import { Search, Library } from 'lucide-react';
import { useTemplateStore } from '../../../store/templateStore';
import TemplateCard from '../components/TemplateCard';
import { usePlanStore } from '../../../store/planStore';

export default function TemplatesPage() {
  const templates = useTemplateStore((s) => s.templates);
  const isLoaded = useTemplateStore((s) => s.isLoaded);
  const canSaveTemplate = usePlanStore((s) => s.limits().canSaveTemplate);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();

  const savedTemplates = useMemo(
    () =>
      templates.filter(
        (t) =>
          !t.isBuiltIn &&
          (!term ||
            t.name.toLowerCase().includes(term) ||
            (t.condition ?? '').toLowerCase().includes(term)),
      ),
    [templates, term],
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading templates…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Templates</h1>
        <div className="relative w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or condition…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      {savedTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Library size={26} className="text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {term ? 'No templates match your search.' : 'No saved templates yet.'}
          </p>
          {!term && (
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
              {canSaveTemplate
                ? 'Open any program, then use "Save as Template" to build your library.'
                : 'Upgrade to Pro to save programs as reusable templates.'}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} canUse={canSaveTemplate} />
          ))}
        </div>
      )}
    </div>
  );
}
