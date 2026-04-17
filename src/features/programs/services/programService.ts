import { supabase } from '../../../lib/supabase';
import { dbRowToProgram, programToDbRow, programPatchToDbRow } from '../../../lib/mappers';
import type { Program } from '../../../types';

export async function getAllPrograms(): Promise<Program[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', user.id);
  if (error) throw error;
  return (data ?? []).map(dbRowToProgram);
}

export async function addProgram(program: Program): Promise<void> {
  const { error } = await supabase.from('programs').insert(programToDbRow(program));
  if (error) throw error;
}

export async function updateProgram(id: string, data: Partial<Program>): Promise<void> {
  const { error } = await supabase
    .from('programs')
    .update(programPatchToDbRow(data))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProgram(id: string): Promise<void> {
  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (error) throw error;
}
