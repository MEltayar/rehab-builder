import { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, ChevronsUpDown, Pencil, Trash2, Play, ExternalLink, Dumbbell } from 'lucide-react';
import type { Exercise, ExerciseCategory } from '../../../types';
import { getYouTubeThumbnailUrl } from '../services/youtubeUtils';

// ── Category colours ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  mobility:    'bg-blue-100   dark:bg-blue-900/60   text-blue-700   dark:text-blue-300',
  stability:   'bg-green-100  dark:bg-green-900/60  text-green-700  dark:text-green-300',
  strength:    'bg-red-100    dark:bg-red-900/60    text-red-700    dark:text-red-300',
  stretching:  'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-300',
  balance:     'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
  functional:  'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300',
  chest:       'bg-red-100    dark:bg-red-900/60    text-red-700    dark:text-red-300',
  back:        'bg-blue-100   dark:bg-blue-900/60   text-blue-700   dark:text-blue-300',
  shoulders:   'bg-sky-100    dark:bg-sky-900/60    text-sky-700    dark:text-sky-300',
  biceps:      'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300',
  triceps:     'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
  legs:        'bg-green-100  dark:bg-green-900/60  text-green-700  dark:text-green-300',
  glutes:      'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
  core:        'bg-amber-100  dark:bg-amber-900/60  text-amber-700  dark:text-amber-300',
  cardio:      'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300',
  full_body:   'bg-gray-100   dark:bg-gray-700      text-gray-600   dark:text-gray-400',
};

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell', dumbbell: 'Dumbbell', cable: 'Cable',
  machine: 'Machine', bodyweight: 'Bodyweight', kettlebell: 'Kettlebell',
  resistance_band: 'Band', ez_bar: 'EZ Bar', other: 'Other',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-green-100  dark:bg-green-900/50  text-green-700  dark:text-green-300',
  intermediate: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
  advanced:     'bg-red-100    dark:bg-red-900/50    text-red-700    dark:text-red-300',
};

// ── Sort ──────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'category' | 'equipment';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-blue-500" />
    : <ChevronDown size={12} className="text-blue-500" />;
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface RowProps {
  exercise: Exercise;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  isAdmin?: boolean;
  ownerName?: string;
}

function ExerciseTableRow({ exercise, onEdit, onDelete, onPreview, isAdmin, ownerName }: RowProps) {
  const [thumbError, setThumbError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const thumbnail = exercise.videoUrl ? getYouTubeThumbnailUrl(exercise.videoUrl) : null;
  const hasDetails = !!(exercise.description || exercise.notes);

  return (
    <>
    <tr className="group border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">

      {/* Thumbnail */}
      <td className="py-2 pl-3 pr-2 w-16">
        {thumbnail && !thumbError ? (
          <div className="relative w-14 h-9 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 cursor-pointer" onClick={onPreview}>
            <img
              src={thumbnail}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setThumbError(true)}
            />
            {onPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={14} className="text-white fill-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-14 h-9 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Dumbbell size={14} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </td>

      {/* Name */}
      <td className="py-2.5 px-2 text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[200px]">
        <div className="flex items-center gap-1">
          {hasDetails && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              title={expanded ? 'Hide details' : 'Show description'}
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
          <span className="block truncate">{exercise.name}</span>
          {exercise.isCustom && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              custom
            </span>
          )}
        </div>
        {exercise.isCustom && isAdmin && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ml-1 truncate">
            by {ownerName ?? 'Unknown'}
          </p>
        )}
      </td>

      {/* Category */}
      <td className="py-2.5 px-2 whitespace-nowrap">
        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[exercise.category] ?? 'bg-gray-100 text-gray-600'}`}>
          {exercise.category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </td>

      {/* Equipment */}
      <td className="py-2.5 px-2 whitespace-nowrap">
        {exercise.equipment ? (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
            {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
          </span>
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>

      {/* Level */}
      <td className="py-2.5 px-2 whitespace-nowrap">
        {exercise.progressionLevel ? (
          <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${LEVEL_COLORS[exercise.progressionLevel]}`}>
            {exercise.progressionLevel.charAt(0).toUpperCase() + exercise.progressionLevel.slice(1)}
          </span>
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>

      {/* Muscle group */}
      <td className="py-2.5 px-2 text-xs text-gray-500 dark:text-gray-400 max-w-[120px]">
        <span className="block truncate">{exercise.muscleGroup ?? '—'}</span>
      </td>

      {/* Video */}
      <td className="py-2 px-2 whitespace-nowrap">
        {exercise.videoUrl ? (
          <div className="flex items-center gap-1">
            {onPreview && (
              <button
                onClick={onPreview}
                className="p-1.5 rounded text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Preview video"
              >
                <Play size={13} />
              </button>
            )}
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-2 pr-3 pl-1 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </td>
    </tr>
    {expanded && hasDetails && (
      <tr className="bg-blue-50/30 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-700/50">
        <td colSpan={8} className="px-5 py-3">
          {exercise.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{exercise.description}</p>
          )}
          {exercise.notes && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{exercise.notes}</p>
          )}
        </td>
      </tr>
    )}
    </>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface ExerciseTableProps {
  exercises: Exercise[];
  onEdit?: (exercise: Exercise) => (() => void) | undefined;
  onDelete?: (exercise: Exercise) => (() => void) | undefined;
  onPreview?: (exercise: Exercise) => void;
  isAdmin?: boolean;
  userNames?: Record<string, string>;
}

export default function ExerciseTable({ exercises, onEdit, onDelete, onPreview, isAdmin, userNames }: ExerciseTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = useCallback((key: SortKey) => {
    setSortDir((d) => key === sortKey ? (d === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(key);
  }, [sortKey]);

  const sorted = [...exercises].sort((a, b) => {
    let av: string, bv: string;
    if (sortKey === 'name')      { av = a.name.toLowerCase();       bv = b.name.toLowerCase(); }
    else if (sortKey === 'category') { av = a.category;             bv = b.category; }
    else                         { av = a.equipment ?? '';          bv = b.equipment ?? ''; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap text-left"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon col={col} active={sortKey} dir={sortDir} />
      </span>
    </th>
  );

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
          <Dumbbell size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No exercises found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term or category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-2.5 pl-3 pr-2 w-16" />
              <Th col="name"      label="Exercise" />
              <Th col="category"  label="Category" />
              <Th col="equipment" label="Equipment" />
              <th className="py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Level</th>
              <th className="py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Muscle</th>
              <th className="py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Video</th>
              <th className="py-2.5 pr-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((ex) => (
              <ExerciseTableRow
                key={ex.id}
                exercise={ex}
                onEdit={onEdit?.(ex)}
                onDelete={onDelete?.(ex)}
                onPreview={onPreview && (() => onPreview(ex))}
                isAdmin={isAdmin}
                ownerName={ex.userId ? userNames?.[ex.userId] : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-400 dark:text-gray-500">
        {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
