import { useMemo } from 'react';
import { useFoodStore } from '../../../store/foodStore';

const BASE_CATEGORIES: { value: string; label: string }[] = [
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

export default function FoodCategoryTabs() {
  const selectedCategory = useFoodStore((s) => s.selectedCategory);
  const setCategory = useFoodStore((s) => s.setCategory);
  const foods = useFoodStore((s) => s.foods);

  const categories = useMemo(() => {
    const customLabels = Array.from(
      new Set(
        foods
          .filter((f) => f.category === 'other' && f.customCategory)
          .map((f) => f.customCategory!)
      )
    ).sort();

    const customTabs = customLabels.map((label) => ({
      value: `other:${label}`,
      label,
    }));

    // If there are custom categories, insert them before 'Other'; keep 'Other' for unlabelled items
    if (customTabs.length === 0) return BASE_CATEGORIES;
    const idx = BASE_CATEGORIES.findIndex((c) => c.value === 'other');
    return [
      ...BASE_CATEGORIES.slice(0, idx),
      ...customTabs,
      ...BASE_CATEGORIES.slice(idx),
    ];
  }, [foods]);

  return (
    <div className="flex flex-wrap gap-1">
      {categories.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setCategory(value)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === value
              ? 'bg-green-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
