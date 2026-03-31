import { useState } from 'react';
import { Star, Check } from 'lucide-react';
import SectionHeader from './SectionHeader';
import TemplatePreviewModal from './TemplatePreviewModal';
import { exportTemplates, STYLE_LABELS } from '../data/exportTemplates';
import { colorPalettes, getEffectivePalette } from '../data/colorPalettes';
import type { ExportTemplate } from '../../../types';

const INFO_TEXT =
  'Pick a color palette then choose a layout. Your selection auto-applies to every PDF and Excel export.';

const LAYOUT_BADGE: Record<string, string> = {
  professional: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  patient:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  checklist:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  clinical:     'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  modern:       'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  minimal:      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  bold:         'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  executive:    'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300',
  compact:      'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  twoColumn:    'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  ledger:       'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  timeline:     'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  handout:      'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
  report:       'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  card:         'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  striped:      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  magazine:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  sidebar:      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  academic:     'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300',
  outline:      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  receipt:      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  notebook:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  poster:       'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
  plain:        'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  rounded:      'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  highlight:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  columns:      'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  divider:      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  schedule:     'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  compactCard:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
};

interface ExportedSheetTemplateSectionProps {
  selectedTemplateId: string | undefined;
  favoriteIds: string[];
  selectedPaletteId: string | undefined;
  onSelectTemplate: (id: string) => void;
  onSelectPalette: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function ExportedSheetTemplateSection({
  selectedTemplateId,
  favoriteIds,
  selectedPaletteId,
  onSelectTemplate,
  onSelectPalette,
  onToggleFavorite,
}: ExportedSheetTemplateSectionProps) {
  const [previewTemplate, setPreviewTemplate] = useState<ExportTemplate | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const activePalette = getEffectivePalette(selectedPaletteId);

  const visibleTemplates = showFavoritesOnly
    ? exportTemplates.filter((t) => favoriteIds.includes(t.id))
    : exportTemplates;

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <SectionHeader title="Exported Sheet Template" infoText={INFO_TEXT} />

      {/* ── Color Palette Picker ── */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Color Palette
        </p>
        <div className="flex flex-wrap gap-3">
          {colorPalettes.map((palette) => {
            const isActive = (selectedPaletteId ?? colorPalettes[0].id) === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => onSelectPalette(palette.id)}
                className="flex flex-col items-center gap-1.5 group"
                title={palette.name}
              >
                {/* Color circle */}
                <div
                  className={`relative w-9 h-9 rounded-full transition-all ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-110'
                      : 'ring-1 ring-gray-200 dark:ring-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: palette.colorScheme.primary }}
                >
                  {/* Inner light dot */}
                  <div
                    className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/50"
                    style={{ backgroundColor: palette.colorScheme.light }}
                  />
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow" />
                    </div>
                  )}
                </div>
                <span className={`text-xs transition-colors ${isActive ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {palette.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Layout Filter bar ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Layout — {visibleTemplates.length}{showFavoritesOnly ? ' favorites' : ' templates'}
        </p>
        <button
          type="button"
          onClick={() => setShowFavoritesOnly((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            showFavoritesOnly
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-amber-400 dark:hover:border-amber-500'
          }`}
        >
          <Star size={12} className={showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''} />
          {showFavoritesOnly ? 'All Templates' : 'Favorites'}
        </button>
      </div>

      {/* Empty state for favorites */}
      {showFavoritesOnly && visibleTemplates.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
          <Star size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          No favorites yet. Star a template to add it here.
        </div>
      )}

      {/* ── Template grid ── */}
      {visibleTemplates.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {visibleTemplates.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            const isFavorited = favoriteIds.includes(template.id);
            const cs = activePalette.colorScheme;

            return (
              <div
                key={template.id}
                className={`relative flex flex-col rounded-lg border-2 overflow-hidden transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-400 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Mini color preview using active palette */}
                <div className="h-6 w-full flex">
                  <div className="flex-1" style={{ backgroundColor: cs.primary }} />
                  <div className="w-6" style={{ backgroundColor: cs.secondary }} />
                  <div className="w-6" style={{ backgroundColor: cs.light }} />
                </div>

                {/* Card body */}
                <div className="flex flex-col gap-1.5 p-2.5 bg-white dark:bg-gray-800 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {STYLE_LABELS[template.layoutVariant]}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(template.id); }}
                      className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-amber-400 dark:hover:text-amber-400 transition-colors"
                      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star size={12} className={isFavorited ? 'fill-amber-400 text-amber-400' : ''} />
                    </button>
                  </div>

                  <span className={`self-start px-1.5 py-0.5 rounded text-xs font-medium ${LAYOUT_BADGE[template.layoutVariant] ?? 'bg-gray-100 text-gray-600'}`} style={{ fontSize: 10 }}>
                    {STYLE_LABELS[template.layoutVariant]}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1 mt-auto pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      style={{ fontSize: 10 }}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTemplate(template.id)}
                      className={`flex-1 px-1.5 py-1 text-xs rounded font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white cursor-default'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {isSelected ? '✓' : 'Use'}
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#2563eb' }}
                  >
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal — injects active palette's colors */}
      <TemplatePreviewModal
        template={previewTemplate}
        palette={activePalette}
        onClose={() => setPreviewTemplate(null)}
      />
    </section>
  );
}
