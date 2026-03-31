import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { db } from '../../../db';
import type { Template } from '../../../types';
import { useTemplateLibraryStore } from '../../../store/templateLibraryStore';
import { useSettingsStore } from '../../../store/settingsStore';
import LibraryTemplateCard from '../components/LibraryTemplateCard';
import TemplatePreviewModal from '../components/TemplatePreviewModal';
import FavouritesFilterButton from '../components/FavouritesFilterButton';

export default function TemplateLibraryPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const settingsLoaded = useSettingsStore((s) => s.isLoaded);
  const { favouriteIds, showFavouritesOnly, isInitialized, initializeFromSettings, toggleFavourite, setShowFavouritesOnly } =
    useTemplateLibraryStore();

  // Initialize favourites from settings once settings are loaded
  useEffect(() => {
    if (settingsLoaded && !isInitialized) {
      initializeFromSettings();
    }
  }, [settingsLoaded, isInitialized, initializeFromSettings]);

  // Prune stale favourite IDs that no longer exist in DB
  useEffect(() => {
    if (!isInitialized || templates.length === 0) return;
    const validIds = new Set(templates.map((t) => t.id));
    const stale = [...favouriteIds].filter((id) => !validIds.has(id));
    if (stale.length > 0) {
      stale.forEach((id) => toggleFavourite(id));
    }
  }, [isInitialized, templates]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    db.templates.toArray().then((rows) => {
      setTemplates(rows);
      setLoading(false);
    });
  }, []);

  const conditions = useMemo(() => {
    const set = new Set(templates.map((t) => t.condition).filter(Boolean));
    return Array.from(set).sort();
  }, [templates]);

  const filtered = useMemo(() => {
    let list = templates;
    if (showFavouritesOnly) {
      list = list.filter((t) => favouriteIds.has(t.id));
    }
    if (selectedCondition) {
      list = list.filter((t) => t.condition === selectedCondition);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.condition.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (t.description ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [templates, showFavouritesOnly, selectedCondition, search, favouriteIds]);

  const handleSelect = (template: Template) => {
    navigate(`/programs/new?template=${template.id}`);
  };

  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
        Loading templates…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Template Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {templates.length} pre-built programme templates — browse, preview, and use as a starting point.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="py-1.5 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All conditions</option>
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <FavouritesFilterButton
          active={showFavouritesOnly}
          count={favouriteIds.size}
          onToggle={() => setShowFavouritesOnly(!showFavouritesOnly)}
        />
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {filtered.length} template{filtered.length !== 1 ? 's' : ''} shown
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-500 dark:text-gray-400 gap-2">
          <p className="text-sm">No templates match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCondition('');
              setShowFavouritesOnly(false);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {filtered.map((template) => (
            <LibraryTemplateCard
              key={template.id}
              template={template}
              isFavourite={favouriteIds.has(template.id)}
              onToggleFavourite={toggleFavourite}
              onPreview={setPreviewTemplate}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          isFavourite={favouriteIds.has(previewTemplate.id)}
          onToggleFavourite={toggleFavourite}
          onSelect={(t) => {
            setPreviewTemplate(null);
            handleSelect(t);
          }}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
