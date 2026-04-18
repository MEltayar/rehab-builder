import { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../../../types';
import { getServingOptions, scaleMacro } from '../utils/servings';

// ── Category colours (badge) ──────────────────────────────────────────────────

const CATEGORY_COLORS: Record<FoodCategory, string> = {
  protein:    'bg-red-100    dark:bg-red-900/60    text-red-700    dark:text-red-300',
  dairy:      'bg-blue-100   dark:bg-blue-900/60   text-blue-700   dark:text-blue-300',
  grains:     'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-300',
  vegetables: 'bg-green-100  dark:bg-green-900/60  text-green-700  dark:text-green-300',
  fruits:     'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300',
  nuts_seeds: 'bg-amber-100  dark:bg-amber-900/60  text-amber-700  dark:text-amber-300',
  legumes:    'bg-lime-100   dark:bg-lime-900/60   text-lime-700   dark:text-lime-300',
  fats_oils:  'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
  beverages:  'bg-cyan-100   dark:bg-cyan-900/60   text-cyan-700   dark:text-cyan-300',
  condiments: 'bg-rose-100   dark:bg-rose-900/60   text-rose-700   dark:text-rose-300',
  snacks:     'bg-pink-100   dark:bg-pink-900/60   text-pink-700   dark:text-pink-300',
  other:      'bg-gray-100   dark:bg-gray-700      text-gray-600   dark:text-gray-400',
};

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  protein: 'Protein', dairy: 'Dairy', grains: 'Grains',
  vegetables: 'Vegetables', fruits: 'Fruits', nuts_seeds: 'Nuts & Seeds',
  legumes: 'Legumes', fats_oils: 'Fats & Oils', beverages: 'Beverages',
  condiments: 'Condiments', snacks: 'Snacks', other: 'Other',
};

// ── Sort ──────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'calories' | 'protein' | 'carbs' | 'fat';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-green-500" />
    : <ChevronDown size={12} className="text-green-500" />;
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface FoodTableRowProps {
  food: FoodItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

function FoodTableRow({ food, onEdit, onDelete }: FoodTableRowProps) {
  const options = getServingOptions(food);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const m = options[selectedIdx];
  const cal  = scaleMacro(food.calories, m.multiplier);
  const pro  = scaleMacro(food.protein,  m.multiplier);
  const carb = scaleMacro(food.carbs,    m.multiplier);
  const fat  = scaleMacro(food.fat,      m.multiplier);
  const fib  = food.fiber !== undefined ? scaleMacro(food.fiber, m.multiplier) : null;

  return (
    <tr className="group border-b border-gray-100 dark:border-gray-700/50 hover:bg-green-50/40 dark:hover:bg-green-900/10 transition-colors">
      {/* Name */}
      <td className="py-2.5 pl-4 pr-2 text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[220px]">
        <span className="block truncate">{food.name}</span>
        {food.isCustom && (
          <span className="text-[10px] text-green-600 dark:text-green-400 font-normal">custom</span>
        )}
      </td>

      {/* Category */}
      <td className="py-2.5 px-2 whitespace-nowrap">
        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[food.category]}`}>
          {food.category === 'other' && food.customCategory ? food.customCategory : CATEGORY_LABELS[food.category]}
        </span>
      </td>

      {/* Calories */}
      <td className="py-2.5 px-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
        {cal}
      </td>

      {/* Protein */}
      <td className="py-2.5 px-3 text-right text-sm text-red-600 dark:text-red-400 tabular-nums">
        {pro}g
      </td>

      {/* Carbs */}
      <td className="py-2.5 px-3 text-right text-sm text-yellow-600 dark:text-yellow-400 tabular-nums">
        {carb}g
      </td>

      {/* Fat */}
      <td className="py-2.5 px-3 text-right text-sm text-purple-600 dark:text-purple-400 tabular-nums">
        {fat}g
      </td>

      {/* Fiber */}
      <td className="py-2.5 px-3 text-right text-sm text-gray-400 dark:text-gray-500 tabular-nums">
        {fib !== null ? `${fib}g` : '—'}
      </td>

      {/* Serving selector */}
      <td className="py-2 px-2 whitespace-nowrap">
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer max-w-[160px]"
        >
          {options.map((opt, i) => (
            <option key={i} value={i}>{opt.label}</option>
          ))}
        </select>
      </td>

      {/* Actions */}
      <td className="py-2 pr-4 pl-1 whitespace-nowrap">
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
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
        )}
      </td>
    </tr>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface FoodTableProps {
  foods: FoodItem[];
  onEdit?: (food: FoodItem) => (() => void) | undefined;
  onDelete?: (food: FoodItem) => (() => void) | undefined;
}

export default function FoodTable({ foods, onEdit, onDelete }: FoodTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = useCallback((key: SortKey) => {
    setSortDir((d) => (key === sortKey ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
    setSortKey(key);
  }, [sortKey]);

  const sorted = [...foods].sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    if (sortKey === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
    else { av = a[sortKey]; bv = b[sortKey]; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const Th = ({ col, label, right }: { col: SortKey; label: string; right?: boolean }) => (
    <th
      onClick={() => handleSort(col)}
      className={`py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}
    >
      <span className="inline-flex items-center gap-1">
        {right && <SortIcon col={col} active={sortKey} dir={sortDir} />}
        {label}
        {!right && <SortIcon col={col} active={sortKey} dir={sortDir} />}
      </span>
    </th>
  );

  if (foods.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">No foods match your search.</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <Th col="name"     label="Food"     />
              <th className="py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</th>
              <Th col="calories" label="Cal"      right />
              <Th col="protein"  label="Protein"  right />
              <Th col="carbs"    label="Carbs"    right />
              <Th col="fat"      label="Fat"      right />
              <th className="py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">Fiber</th>
              <th className="py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Per serving</th>
              <th className="py-2.5 pr-4" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((food) => (
              <FoodTableRow
                key={food.id}
                food={food}
                onEdit={onEdit?.(food)}
                onDelete={onDelete?.(food)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-400 dark:text-gray-500">
        {foods.length} food{foods.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
