import { supabase } from '../../../lib/supabase';
import { dbRowToClient } from '../../../lib/mappers';
import type { Client } from '../../../types';

export async function getAllClients(): Promise<Client[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id);
  if (error) throw error;
  return (data ?? []).map(dbRowToClient);
}
