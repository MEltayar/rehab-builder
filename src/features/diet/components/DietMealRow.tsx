import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import type { DietMeal, FoodItem } from '../../../types';
import { calcItemMacros, sumMacros } from '../utils/macros';
import FoodPicker from './FoodPicker';

const MEAL_PRESETS = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Afternoon Snack',
  'Dinner',
  'Evening Snack',
  'Pre-workout',
  'Post-workout',
  'Snack',
  '__custom__',
];

const PRESET_SET = new Set(MEAL_PRESETS.filter((v) => v !== '__custom__'));

interface DietMealRowProps {
  dayId: string;
  meal: DietMeal;
  foodMap: Map<string, FoodItem>;
  onLabelChange: (label: string) => void;
  onDelete: () => void;
  onAddFood: (foodItem: FoodItem, quantity: number, servingMultiplier: number, servingLabel: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function DietMealRow({
  meal, foodMap, onLabelChange, onDelete, onAddFood, onUpdateQuantity, onRemoveItem,
}: DietMealRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customMode, setCustomMode] = useState(!PRESET_SET.has(meal.label));
  const [customLabel, setCustomLabel] = useState(
    PRESET_SET.has(meal.label) ? '' : meal.label,
  );

  const selectValue = customMode ? '__custom__' : meal.label;

  const itemMacros = meal.items.map((item) => {
    const food = foodMap.get(item.foodItemId);
    return food ? calcItemMacros(item, food) : null;
  });
  const totals = sumMacros(itemMacros.filter(Boolean) as ReturnType<typeof calcItemMacros>[]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Meal header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <select
            value={selectValue}
            onChange={(e) => {
              if (e.target.value !== '__custom__') {
                setCustomMode(false);
                setCustomLabel('');
                onLabelChange(e.target.value);
              } else {
                setCustomMode(true);
              }
            }}
            className="text-sm font-medium bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 cursor-pointer pr-1 max-w-[160px]"
          >
            {MEAL_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p === '__custom__' ? 'Custom…' : p}
              </option>
            ))}
          </select>
          {customMode && (
            <input
              autoFocus
              value={customLabel}
              onChange={(e) => {
                setCustomLabel(e.target.value);
                if (e.target.value.trim()) onLabelChange(e.target.value);
              }}
              onBlur={() => {
                if (!customLabel.trim()) {
                  setCustomMode(false);
                  onLabelChange(meal.label);
                }
              }}
              placeholder="Type meal name…"
              className="text-sm font-medium bg-transparent border-b border-green-500 focus:outline-none text-gray-900 dark:text-gray-100 min-w-0 flex-1"
            />
          )}
        </div>

        {/* Macro summary */}
        {meal.items.length > 0 && (
          <div className="flex gap-2 text-xs text-gray-400 dark:text-gray-500 shrink-0">
            <span className="font-medium text-gray-700 dark:text-gray-300">{totals.calories} kcal</span>
            <span>P {totals.protein}g</span>
            <span>C {totals.carbs}g</span>
            <span>F {totals.fat}g</span>
          </div>
        )}

        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
          title="Delete meal"
        >
          <X size={14} />
        </button>
      </div>

      {/* Items */}
      {expanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {meal.items.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic">No foods yet — add one below.</p>
          ) : (
            meal.items.map((item, idx) => {
              const food = foodMap.get(item.foodItemId);
              const macros = food ? calcItemMacros(item, food) : null;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {food?.name ?? `Food #${idx + 1}`}
                    </p>
                    {macros && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {macros.calories} kcal · P {macros.protein}g · C {macros.carbs}g · F {macros.fat}g
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v > 0) onUpdateQuantity(item.id, v);
                      }}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (isNaN(v) || v <= 0) onUpdateQuantity(item.id, 1);
                      }}
                      className="w-12 px-1.5 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100"
                      title="Quantity"
                    />
                    <span
                      className="w-[90px] text-xs text-gray-400 dark:text-gray-500 truncate"
                      title={item.servingLabel ?? `${food?.servingSize} ${food?.servingUnit}`}
                    >
                      × {item.servingLabel ?? `${food?.servingSize} ${food?.servingUnit}`}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Add food button */}
          <div className="px-4 py-2">
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors"
            >
              <Plus size={13} />
              Add food
            </button>
          </div>
        </div>
      )}

      <FoodPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(food, qty, multiplier, label) => {
          onAddFood(food, qty, multiplier, label);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
