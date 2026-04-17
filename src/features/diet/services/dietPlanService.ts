import { supabase } from '../../../lib/supabase';
import { dbRowToDietPlan } from '../../../lib/mappers';
import type { DietPlan } from '../../../types';

export async function getAllDietPlans(): Promise<DietPlan[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbRowToDietPlan);
}
