import { Pencil, Trash2 } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../../../types';

const CATEGORY_COLORS: Record<FoodCategory, string> = {
  protein:    'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  dairy:      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  grains:     'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  vegetables: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  fruits:     'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  nuts_seeds: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  legumes:    'bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300',
  fats_oils:  'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  beverages:  'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
  condiments: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
  snacks:     'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
  other:      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  protein:    'Protein',
  dairy:      'Dairy',
  grains:     'Grains',
  vegetables: 'Vegetables',
  fruits:     'Fruits',
  nuts_seeds: 'Nuts & Seeds',
  legumes:    'Legumes',
  fats_oils:  'Fats & Oils',
  beverages:  'Beverages',
  condiments: 'Condiments',
  snacks:     'Snacks',
  other:      'Other',
};

interface MacroPillProps { label: string; value: number; unit?: string; color: string }
function MacroPill({ label, value, unit = 'g', color }: MacroPillProps) {
  return (
    <div className={`flex flex-col items-center px-2 py-1 rounded ${color}`}>
      <span className="text-xs font-bold leading-none">{value % 1 === 0 ? value : value.toFixed(1)}{unit}</span>
      <span className="text-[10px] leading-none mt-0.5 opacity-75">{label}</span>
    </div>
  );
}

interface FoodCardProps {
  food: FoodItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FoodCard({ food, onEdit, onDelete }: FoodCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
      {/* Top accent */}
      <div className="w-full h-1 shrink-0 bg-gradient-to-r from-green-500 to-emerald-500" />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + category */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
            {food.name}
          </p>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[food.category]}`}>
            {food.category === 'other' && food.customCategory ? food.customCategory : CATEGORY_LABELS[food.category]}
          </span>
        </div>

        {/* Serving */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Per {food.servingSize} {food.servingUnit}
          {food.gramsPerUnit != null && ` (≈ ${food.gramsPerUnit * food.servingSize} g)`}
        </p>

        {/* Calories big */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{food.calories}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">kcal</span>
        </div>

        {/* Macros row */}
        <div className="flex gap-1.5">
          <MacroPill label="Protein" value={food.protein} color="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300" />
          <MacroPill label="Carbs"   value={food.carbs}   color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" />
          <MacroPill label="Fat"     value={food.fat}     color="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" />
          {food.fiber !== undefined && food.fiber > 0 && (
            <MacroPill label="Fiber" value={food.fiber} color="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300" />
          )}
        </div>

        {/* Optional secondary macros */}
        {(food.sugar !== undefined || food.sodium !== undefined) && (
          <div className="flex gap-2 text-xs text-gray-400 dark:text-gray-500">
            {food.sugar !== undefined && <span>Sugar: {food.sugar}g</span>}
            {food.sodium !== undefined && <span>Sodium: {food.sodium}mg</span>}
          </div>
        )}

        {food.notes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">{food.notes}</p>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil size={12} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
