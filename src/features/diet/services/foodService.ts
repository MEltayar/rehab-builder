import { supabase } from '../../../lib/supabase';
import { dbRowToFoodItem, foodItemToDbRow } from '../../../lib/mappers';
import { useUserStore } from '../../../store/userStore';
import type { FoodItem } from '../../../types';

// Seed data lives in ./foodSeed — dynamic-imported inside the seeder only,
// so its ~400-line payload never ships in page/main bundles.

// ── Seeding ───────────────────────────────────────────────────────────────────

const FOOD_SEED_VERSION = 'v4';
const FOOD_SEED_KEY = 'foodSeedVersion';

export async function seedFoodItemsIfEmpty(): Promise<void> {
  if (localStorage.getItem(FOOD_SEED_KEY) === FOOD_SEED_VERSION) return;
  const { SEED_FOOD_ITEMS } = await import('./foodSeed');
  const rows = SEED_FOOD_ITEMS.map(foodItemToDbRow);
  // ignoreDuplicates: false so existing rows get alt_servings updated
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase
      .from('food_items')
      .upsert(rows.slice(i, i + 100), { onConflict: 'id', ignoreDuplicates: false });
    if (error) { console.error('Failed to seed food items:', error); return; }
  }
  localStorage.setItem(FOOD_SEED_KEY, FOOD_SEED_VERSION);
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const isAdmin = useUserStore.getState().canAccessAdmin();

  let query = supabase.from('food_items').select('*');
  if (!isAdmin && userId) {
    query = query.or(`is_custom.eq.false,user_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(dbRowToFoodItem);
}
