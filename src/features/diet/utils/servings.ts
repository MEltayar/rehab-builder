import type { AltServing, FoodItem } from '../../../types';

/**
 * Returns the list of serving options for a food.
 * Foods with explicit altServings use those; everything else gets
 * auto-generated sensible options based on the base unit.
 */
export function getServingOptions(food: FoodItem): AltServing[] {
  if (food.altServings && food.altServings.length > 0) {
    return food.altServings;
  }

  const base = food.servingSize;
  const unit = food.servingUnit.toLowerCase();

  // Gram-based foods → add oz / cup / tbsp options
  if (unit === 'g') {
    return [
      { label: `${base}g`,          multiplier: 1 },
      { label: '1 oz (28g)',        multiplier: 28.35 / base },
      { label: '3 oz (85g)',        multiplier: 85 / base },
      { label: '½ cup (~120g)',     multiplier: 120 / base },
      { label: '1 cup (~240g)',     multiplier: 240 / base },
    ];
  }

  // Millilitre / liquid foods → cups / tbsp
  if (unit === 'ml') {
    return [
      { label: `${base}ml`,         multiplier: 1 },
      { label: '1 tbsp (15ml)',     multiplier: 15 / base },
      { label: '¼ cup (60ml)',      multiplier: 60 / base },
      { label: '½ cup (120ml)',     multiplier: 120 / base },
      { label: '1 cup (240ml)',     multiplier: 240 / base },
    ];
  }

  // Everything else (piece, slice, scoop…) — show per-unit and per-100g for comparison
  const g = food.gramsPerUnit;
  const u = food.servingUnit;
  if (g != null && g > 0) {
    return [
      { label: `${u} (≈ ${g} g)`, multiplier: 1 },
      { label: 'per 100 g',       multiplier: 100 / g },
    ];
  }
  return [{ label: u, multiplier: 1 }];
}

/** Scale a single macro value by the chosen serving multiplier, rounded to 1 dp. */
export function scaleMacro(value: number, multiplier: number): number {
  return Math.round(value * multiplier * 10) / 10;
}
