import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const WEEKDAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKDAY_SET = new Set(WEEKDAYS);
import type { DietDay, FoodItem } from '../../../types';
import { calcItemMacros, sumMacros } from '../utils/macros';
import DietMealRow from './DietMealRow';

interface DietDayCardProps {
  day: DietDay;
  foodMap: Map<string, FoodItem>;
  onLabelChange: (label: string) => void;
  onDelete: () => void;
  onAddMeal: () => void;
  onMealLabelChange: (mealId: string, label: string) => void;
  onDeleteMeal: (mealId: string) => void;
  onAddFood: (mealId: string, food: FoodItem, quantity: number, servingMultiplier: number, servingLabel: string) => void;
  onUpdateQuantity: (mealId: string, itemId: string, quantity: number) => void;
  onRemoveItem: (mealId: string, itemId: string) => void;
}

export default function DietDayCard({
  day, foodMap, onLabelChange, onDelete, onAddMeal,
  onMealLabelChange, onDeleteMeal, onAddFood, onUpdateQuantity, onRemoveItem,
}: DietDayCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [customLabel, setCustomLabel] = useState(WEEKDAY_SET.has(day.label) ? '' : day.label);

  const isCustom = !WEEKDAY_SET.has(day.label);
  const selectValue = isCustom ? '__custom__' : day.label;

  // Day totals
  const allItems = day.meals.flatMap((m) => m.items);
  const allMacros = allItems.map((item) => {
    const food = foodMap.get(item.foodItemId);
    return food ? calcItemMacros(item, food) : null;
  }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
  const dayTotals = sumMacros(allMacros);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Day header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <select
            value={selectValue}
            onChange={(e) => {
              if (e.target.value !== '__custom__') {
                setCustomLabel('');
                onLabelChange(e.target.value);
              } else {
                onLabelChange(customLabel || 'Custom Day');
              }
            }}
            className="text-sm font-semibold bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 cursor-pointer pr-1"
          >
            {WEEKDAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
            <option value="__custom__">Custom…</option>
          </select>
          {isCustom && (
            <input
              autoFocus
              value={customLabel}
              onChange={(e) => {
                setCustomLabel(e.target.value);
                onLabelChange(e.target.value || 'Custom Day');
              }}
              placeholder="Day name…"
              className="text-sm font-semibold bg-transparent border-b border-green-500 focus:outline-none text-gray-900 dark:text-gray-100 min-w-0 flex-1"
            />
          )}
        </div>

        {/* Day macro totals */}
        {allItems.length > 0 && (
          <div className="flex gap-2 text-xs shrink-0">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{dayTotals.calories} kcal</span>
            <span className="text-red-600 dark:text-red-400">P {dayTotals.protein}g</span>
            <span className="text-yellow-600 dark:text-yellow-400">C {dayTotals.carbs}g</span>
            <span className="text-purple-600 dark:text-purple-400">F {dayTotals.fat}g</span>
          </div>
        )}

        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
          title="Delete day"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Meals */}
      {expanded && (
        <div className="p-4 flex flex-col gap-3">
          {day.meals.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">No meals yet.</p>
          ) : (
            day.meals.map((meal) => (
              <DietMealRow
                key={meal.id}
                dayId={day.id}
                meal={meal}
                foodMap={foodMap}
                onLabelChange={(label) => onMealLabelChange(meal.id, label)}
                onDelete={() => onDeleteMeal(meal.id)}
                onAddFood={(food, qty, multiplier, label) => onAddFood(meal.id, food, qty, multiplier, label)}
                onUpdateQuantity={(itemId, qty) => onUpdateQuantity(meal.id, itemId, qty)}
                onRemoveItem={(itemId) => onRemoveItem(meal.id, itemId)}
              />
            ))
          )}

          <button
            onClick={onAddMeal}
            className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Plus size={14} />
            Add Meal
          </button>
        </div>
      )}
    </div>
  );
}
