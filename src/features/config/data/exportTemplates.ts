import type { ExportTemplate, LayoutVariant } from '../../../types';
import { getEffectivePalette } from './colorPalettes';

// Default color (used when no palette is selected yet)
const DEFAULT_COLOR = { primary: '#0f766e', secondary: '#0d9488', light: '#ccfbf1', text: '#ffffff', darkText: '#134e4a' };

// ── 30 structurally distinct layout styles ────────────────
const STYLES: LayoutVariant[] = [
  // Original 15
  'professional', // full table, dark banner header
  'patient',      // centered header, card blocks per exercise
  'checklist',    // minimal tick-list, left accent bar
  'clinical',     // plain numbered list, no color fill
  'modern',       // large metric pills, left accent bars
  'minimal',      // ultra-clean, thin borders only, no fills
  'bold',         // large exercise names, colored pill badges
  'executive',    // near-black header, single accent line
  'compact',      // maximum density, small fonts, condensed table
  'twoColumn',    // two side-by-side exercise columns
  'ledger',       // accounting-style alternating color stripes
  'timeline',     // vertical connector line with bullet markers
  'handout',      // large fonts, big checkboxes, patient-facing
  'report',       // formal numbered sections, medical report style
  'card',         // standalone bordered card per exercise (2-col)
  // New 15
  'striped',      // wide alternating stripes, no header banner
  'magazine',     // giant decorative exercise numbers on left
  'sidebar',      // colored left sidebar with session label
  'academic',     // numbered sections, formal indented structure
  'outline',      // hierarchical bullet-point outline
  'receipt',      // name left / metrics right, receipt-like
  'notebook',     // ruled-line rows, no fill, bottom border only
  'poster',       // oversized clinic name, large exercise text
  'plain',        // zero decoration, pure typography
  'rounded',      // generous border-radius, soft card feel
  'highlight',    // color band behind exercise name row
  'columns',      // three exercises per row
  'divider',      // thick rule between every exercise
  'schedule',     // timetable / session-column layout
  'compactCard',  // tiny 3-per-row cards
];

export const STYLE_LABELS: Record<LayoutVariant, string> = {
  professional: 'Professional',
  patient:      'Patient-Friendly',
  checklist:    'Checklist',
  clinical:     'Clinical',
  modern:       'Modern',
  minimal:      'Minimal',
  bold:         'Bold',
  executive:    'Executive',
  compact:      'Compact',
  twoColumn:    'Two-Column',
  ledger:       'Ledger',
  timeline:     'Timeline',
  handout:      'Handout',
  report:       'Report',
  card:         'Card',
  striped:      'Striped',
  magazine:     'Magazine',
  sidebar:      'Sidebar',
  academic:     'Academic',
  outline:      'Outline',
  receipt:      'Receipt',
  notebook:     'Notebook',
  poster:       'Poster',
  plain:        'Plain',
  rounded:      'Rounded',
  highlight:    'Highlight',
  columns:      'Three-Column',
  divider:      'Divider',
  schedule:     'Schedule',
  compactCard:  'Compact Cards',
};

// ── Generate 30 layout templates (color-agnostic) ─────────
export const exportTemplates: ExportTemplate[] = STYLES.map((style) => ({
  id: `tmpl-${style}`,
  name: STYLE_LABELS[style],
  colorScheme: DEFAULT_COLOR, // overridden at export time by selected palette
  layoutVariant: style,
  headerStyle: 'logo-left' as const,
}));

// ── Helpers ───────────────────────────────────────────────

export function getEffectiveTemplate(id: string | undefined): ExportTemplate {
  if (!id) return exportTemplates[0];
  return exportTemplates.find((t) => t.id === id) ?? exportTemplates[0];
}

/** Returns the template with the selected palette's colorScheme applied. */
export function getCombinedTemplate(templateId: string | undefined, paletteId: string | undefined): ExportTemplate {
  const template = getEffectiveTemplate(templateId);
  const palette = getEffectivePalette(paletteId);
  return { ...template, colorScheme: palette.colorScheme };
}
