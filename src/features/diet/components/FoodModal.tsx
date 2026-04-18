import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../../../types';

const UNIT_OPTIONS = [
  { value: 'g',       label: 'g — grams' },
  { value: 'ml',      label: 'ml — millilitres' },
  { value: 'piece',   label: 'piece' },
  { value: 'slice',   label: 'slice' },
  { value: 'cup',     label: 'cup' },
  { value: 'tbsp',    label: 'tbsp — tablespoon' },
  { value: 'tsp',     label: 'tsp — teaspoon' },
  { value: 'scoop',   label: 'scoop' },
  { value: 'oz',      label: 'oz — ounce' },
  { value: 'serving', label: 'serving' },
  { value: '__custom__', label: 'Custom…' },
];

const KNOWN_UNITS = new Set(UNIT_OPTIONS.map((o) => o.value).filter((v) => v !== '__custom__'));

const CATEGORIES: { value: FoodCategory; label: string }[] = [
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

type FoodFormData = Omit<FoodItem, 'id' | 'createdAt' | 'isCustom'> & { customCategory?: string };

interface FoodModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FoodFormData) => Promise<void> | void;
}

const WEIGHT_UNITS = new Set(['g', 'ml']);

const emptyForm = (): FoodFormData => ({
  name: '',
  category: 'protein',
  customCategory: undefined,
  servingSize: 100,
  servingUnit: 'g',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: undefined,
  sugar: undefined,
  sodium: undefined,
  notes: '',
  gramsPerUnit: undefined,
});

function numField(value: string): number {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function optNumField(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

export default function FoodModal({ food, isOpen, onClose, onSave }: FoodModalProps) {
  const [form, setForm] = useState<FoodFormData>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (food) {
        setForm({
          name: food.name,
          category: food.category,
          customCategory: food.customCategory,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          sugar: food.sugar,
          sodium: food.sodium,
          notes: food.notes ?? '',
          gramsPerUnit: food.gramsPerUnit,
        });
      } else {
        setForm(emptyForm());
      }
      setErrors({});
    }
  }, [isOpen, food]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.servingSize <= 0) errs.servingSize = 'Must be > 0';
    if (!form.servingUnit.trim()) errs.servingUnit = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {food ? 'Edit Food' : 'Add Food'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="e.g. Chicken Breast (cooked)"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as FoodCategory, customCategory: undefined })}
              className={inputCls}
            >
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {form.category === 'other' && (
              <input
                type="text"
                value={form.customCategory ?? ''}
                onChange={(e) => setForm({ ...form, customCategory: e.target.value || undefined })}
                placeholder="e.g. Vitamins, Supplements, Herbs…"
                className={`${inputCls} mt-1`}
                autoFocus
              />
            )}
          </div>

          {/* Serving */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Serving size <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.servingSize}
                onChange={(e) => setForm({ ...form, servingSize: numField(e.target.value) })}
                className={inputCls}
              />
              {errors.servingSize && <p className="text-xs text-red-500">{errors.servingSize}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Unit <span className="text-red-500">*</span></label>
              <select
                value={KNOWN_UNITS.has(form.servingUnit) ? form.servingUnit : '__custom__'}
                onChange={(e) => {
                  if (e.target.value !== '__custom__') setForm({ ...form, servingUnit: e.target.value });
                  else setForm({ ...form, servingUnit: '' });
                }}
                className={inputCls}
              >
                {UNIT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {!KNOWN_UNITS.has(form.servingUnit) && (
                <input
                  type="text"
                  value={form.servingUnit}
                  onChange={(e) => setForm({ ...form, servingUnit: e.target.value })}
                  placeholder="Enter unit…"
                  className={`${inputCls} mt-1`}
                  autoFocus
                />
              )}
              {errors.servingUnit && <p className="text-xs text-red-500">{errors.servingUnit}</p>}
            </div>
          </div>

          {/* Grams per unit — only relevant for count-based foods (egg, piece, banana…) */}
          {!WEIGHT_UNITS.has(form.servingUnit) && form.servingUnit.trim() !== '' && (
            <div className="flex flex-col gap-1">
              <label className={labelCls}>
                Weight per {form.servingUnit}{' '}
                <span className="font-normal text-gray-400 dark:text-gray-500">(g) — optional</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.gramsPerUnit ?? ''}
                onChange={(e) => setForm({ ...form, gramsPerUnit: optNumField(e.target.value) })}
                placeholder={`e.g. 60  →  1 ${form.servingUnit} ≈ 60 g`}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                How many grams is 1 {form.servingUnit}? Shown as a reference on the food card.
              </p>
            </div>
          )}

          {/* Calories */}
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Calories (kcal) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: numField(e.target.value) })}
              className={inputCls}
            />
          </div>

          {/* Main macros */}
          <div className="grid grid-cols-3 gap-3">
            {(['protein', 'carbs', 'fat'] as const).map((macro) => (
              <div key={macro} className="flex flex-col gap-1">
                <label className={labelCls}>{macro.charAt(0).toUpperCase() + macro.slice(1)} (g)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form[macro]}
                  onChange={(e) => setForm({ ...form, [macro]: numField(e.target.value) })}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          {/* Optional macros */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Fiber (g)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.fiber ?? ''}
                onChange={(e) => setForm({ ...form, fiber: optNumField(e.target.value) })}
                placeholder="—"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Sugar (g)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.sugar ?? ''}
                onChange={(e) => setForm({ ...form, sugar: optNumField(e.target.value) })}
                placeholder="—"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Sodium (mg)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.sodium ?? ''}
                onChange={(e) => setForm({ ...form, sodium: optNumField(e.target.value) })}
                placeholder="—"
                className={inputCls}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Notes</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Optional notes…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {saving ? 'Saving…' : (food ? 'Save Changes' : 'Add Food')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
