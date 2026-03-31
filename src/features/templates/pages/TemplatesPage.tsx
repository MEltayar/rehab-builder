import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTemplateStore } from '../../../store/templateStore';
import TemplateSection from '../components/TemplateSection';

export default function TemplatesPage() {
  const templates = useTemplateStore((s) => s.templates);
  const isLoaded = useTemplateStore((s) => s.isLoaded);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();

  const builtIn = useMemo(
    () =>
      templates.filter(
        (t) =>
          t.isBuiltIn &&
          (!term ||
            t.name.toLowerCase().includes(term) ||
            t.condition.toLowerCase().includes(term)),
      ),
    [templates, term],
  );

  const custom = useMemo(
    () =>
      templates.filter(
        (t) =>
          !t.isBuiltIn &&
          (!term ||
            t.name.toLowerCase().includes(term) ||
            t.condition.toLowerCase().includes(term)),
      ),
    [templates, term],
  );

  const noResults = term && builtIn.length === 0 && custom.length === 0;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading templates…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Templates</h1>

        {/* Search */}
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

      {noResults ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No templates found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Try a different name or condition.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <TemplateSection
            title="Built-in Templates"
            templates={builtIn}
            emptyMessage="No built-in templates match your search."
          />

          <div className="border-t border-gray-200 dark:border-gray-700" />

          <TemplateSection
            title="My Templates"
            templates={custom}
            emptyMessage={
              term
                ? 'No custom templates match your search.'
                : 'No custom templates yet. Save a program as a template to get started.'
            }
          />
        </div>
      )}
    </div>
  );
}
