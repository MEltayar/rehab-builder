import type { DietMealItem, FoodItem } from '../../../types';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function calcItemMacros(item: DietMealItem, food: FoodItem): MacroTotals {
  const q = item.quantity * (item.servingMultiplier ?? 1);
  return {
    calories: Math.round(food.calories * q * 10) / 10,
    protein:  Math.round(food.protein  * q * 10) / 10,
    carbs:    Math.round(food.carbs    * q * 10) / 10,
    fat:      Math.round(food.fat      * q * 10) / 10,
    fiber:    Math.round((food.fiber ?? 0) * q * 10) / 10,
  };
}

export function sumMacros(list: MacroTotals[]): MacroTotals {
  return list.reduce(
    (acc, m) => ({
      calories: Math.round((acc.calories + m.calories) * 10) / 10,
      protein:  Math.round((acc.protein  + m.protein)  * 10) / 10,
      carbs:    Math.round((acc.carbs    + m.carbs)    * 10) / 10,
      fat:      Math.round((acc.fat      + m.fat)      * 10) / 10,
      fiber:    Math.round((acc.fiber    + m.fiber)    * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}
