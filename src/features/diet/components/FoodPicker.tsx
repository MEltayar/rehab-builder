import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../../../types';
import { useFoodStore } from '../../../store/foodStore';
import { scaleMacro } from '../utils/servings';

const CATEGORIES: { value: FoodCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'protein',    label: 'Protein' },
  { value: 'dairy',      label: 'Dairy' },
  { value: 'grains',     label: 'Grains' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits',     label: 'Fruits' },
  { value: 'nuts_seeds', label: 'Nuts & Seeds' },
  { value: 'legumes',    label: 'Legumes' },
  { value: 'fats_oils',  label: 'Fats & Oils' },
  { value: 'beverages',  label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'snacks',     label: 'Snacks' },
  { value: 'other',      label: 'Other' },
];

interface FoodPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: FoodItem, quantity: number, servingMultiplier: number, servingLabel: string) => void;
}

export default function FoodPicker({ isOpen, onClose, onSelect }: FoodPickerProps) {
  const foods = useFoodStore((s) => s.foods);
  const [search, setSearch]             = useState('');
  const [category, setCategory]         = useState<FoodCategory | 'all'>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount]             = useState(100);
  const [unit, setUnit]                 = useState('');

  // Build unit options based on the food's base unit.
  // `grams` here means "how many base serving-units does 1 of this option equal":
  //   - for g/ml foods: grams = the SI quantity of that unit
  //   - for count-based foods: native unit grams=1, g option grams=1/gramsPerUnit
  const unitOptions = useMemo(() => {
    if (!selectedFood) return [];
    const base = selectedFood.servingUnit.toLowerCase();
    if (base === 'g') return [
      { label: 'g',           grams: 1 },
      { label: 'oz',          grams: 28.35 },
      { label: 'cup (~240g)', grams: 240 },
      { label: 'tbsp (~15g)', grams: 15 },
      { label: 'tsp (~5g)',   grams: 5 },
    ];
    if (base === 'ml') return [
      { label: 'ml',           grams: 1 },
      { label: 'cup (240ml)',  grams: 240 },
      { label: 'tbsp (15ml)',  grams: 15 },
      { label: 'tsp (5ml)',    grams: 5 },
    ];
    // Count-based (piece, slice, scoop, serving, oz, tbsp, tsp, cup, custom…)
    const nativeOption = { label: selectedFood.servingUnit, grams: 1 };
    if (selectedFood.gramsPerUnit != null && selectedFood.gramsPerUnit > 0) {
      // Also offer grams when we know the weight per unit
      return [
        nativeOption,
        { label: 'g', grams: 1 / selectedFood.gramsPerUnit },
      ];
    }
    return [nativeOption];
  }, [selectedFood]);

  const currentUnit = unitOptions.find((u) => u.label === unit) ?? unitOptions[0];

  // Unified multiplier: (amount × unitFactor) / servingSize
  const calcMultiplier = useMemo(() => {
    if (!selectedFood || selectedFood.servingSize <= 0 || !currentUnit) return 1;
    return (amount * currentUnit.grams) / selectedFood.servingSize;
  }, [selectedFood, amount, currentUnit]);

  const filtered = useMemo(() =>
    foods.filter((f) => {
      if (category !== 'all' && f.category !== category) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
  [foods, category, search]);

  // Live macro preview
  const preview = selectedFood ? {
    cal:  scaleMacro(selectedFood.calories, calcMultiplier),
    pro:  scaleMacro(selectedFood.protein,  calcMultiplier),
    carb: scaleMacro(selectedFood.carbs,    calcMultiplier),
    fat:  scaleMacro(selectedFood.fat,      calcMultiplier),
  } : null;

  const handleSelectFood = (food: FoodItem) => {
    if (selectedFood?.id === food.id) {
      setSelectedFood(null);
    } else {
      setSelectedFood(food);
      setAmount(food.servingSize);
      setUnit(''); // reset to default unit for this food
    }
  };

  const handleConfirm = () => {
    if (!selectedFood) return;
    const label = `${amount} ${currentUnit?.label ?? selectedFood.servingUnit}`;
    onSelect(selectedFood, 1, calcMultiplier, label);
    reset();
  };

  const reset = () => {
    setSelectedFood(null);
    setAmount(100);
    setSearch('');
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Food to Meal</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods…"
              className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto px-5 py-2 shrink-0">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === value
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Food list */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No foods found.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors ${
                      isSelected
                        ? 'bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{food.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        per {food.servingSize} {food.servingUnit}{food.gramsPerUnit != null ? ` (≈ ${food.gramsPerUnit * food.servingSize} g)` : ''} — {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0 ml-3">Selected ✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm panel — shown when a food is selected */}
        {selectedFood && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-5 py-4 shrink-0 flex flex-col gap-3">

            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {selectedFood.name}
            </p>

            {/* Amount + unit */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAmount((a) => Math.max(1, Math.round((a - (a >= 50 ? 10 : 1)) * 10) / 10))}
                    className="w-7 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium flex items-center justify-center transition-colors"
                  >−</button>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v > 0) setAmount(v);
                    }}
                    className="w-20 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount((a) => Math.round((a + (a >= 50 ? 10 : 1)) * 10) / 10)}
                    className="w-7 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium flex items-center justify-center transition-colors"
                  >+</button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Unit</label>
                <select
                  value={currentUnit?.label ?? ''}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {unitOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live macro preview + Add button */}
            {preview && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-3 text-xs flex-wrap">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{preview.cal} kcal</span>
                  <span className="text-red-600 dark:text-red-400">P {preview.pro}g</span>
                  <span className="text-yellow-600 dark:text-yellow-400">C {preview.carb}g</span>
                  <span className="text-purple-600 dark:text-purple-400">F {preview.fat}g</span>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={amount <= 0 || isNaN(amount)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors shrink-0"
                >
                  Add to Meal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
