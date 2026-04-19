import { supabase } from '../../../lib/supabase';
import { dbRowToExercise, exerciseToDbRow } from '../../../lib/mappers';
import type { Exercise } from '../../../types';

// Seed data is dynamic-imported inside seeding functions only, so its
// ~1700-line payload never ships in the main/page bundles.

export async function seedIfEmpty(): Promise<void> {
  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });
  if ((count ?? 0) === 0) {
    const { SEED_EXERCISES } = await import('../../../db/seed');
    const rows = SEED_EXERCISES.map(exerciseToDbRow);
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await supabase.from('exercises').insert(rows.slice(i, i + 100));
      if (error) throw error;
    }
  }
}

// Bump this string whenever new exercises or video URLs are added to GYM_SEED_EXERCISES.
// Each user's browser will re-run the sync exactly once when the version changes.
const GYM_SEED_VERSION = 'v3';
const GYM_SEED_KEY = 'gymSeedVersion';
const GYM_VIDEO_KEY = 'gymVideoSyncVersion';

export async function seedGymExercisesIfMissing(): Promise<void> {
  if (localStorage.getItem(GYM_SEED_KEY) === GYM_SEED_VERSION) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { GYM_SEED_EXERCISES } = await import('../../../db/seed');
  // Upsert by id — adds new exercises, skips ones that already exist.
  // Explicitly set user_id so RLS with check passes; ignoreDuplicates skips
  // rows that already exist from another user's seed run.
  const rows = GYM_SEED_EXERCISES.map((ex) => ({ ...exerciseToDbRow(ex), user_id: user.id }));
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase
      .from('exercises')
      .upsert(rows.slice(i, i + 100), { onConflict: 'id', ignoreDuplicates: true });
    if (error) { console.error('Failed to upsert gym exercises:', error); return; }
  }
  localStorage.setItem(GYM_SEED_KEY, GYM_SEED_VERSION);
}

export async function syncGymExerciseVideos(): Promise<void> {
  if (localStorage.getItem(GYM_VIDEO_KEY) === GYM_SEED_VERSION) return;
  const { GYM_SEED_EXERCISES } = await import('../../../db/seed');
  const withVideo = GYM_SEED_EXERCISES.filter((ex) => ex.videoUrl);
  await Promise.all(
    withVideo.map((ex) =>
      supabase
        .from('exercises')
        .update({ video_url: ex.videoUrl })
        .eq('id', ex.id)
        .or('video_url.is.null,video_url.eq.'),
    ),
  );
  localStorage.setItem(GYM_VIDEO_KEY, GYM_SEED_VERSION);
}

export async function getAllExercises(): Promise<Exercise[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Everyone sees shared exercises (is_custom=false) + their own custom only.
  // Admin/staff are NOT special here — they should not see other users' personal copies.
  let query = supabase.from('exercises').select('*');
  if (userId) {
    query = query.or(`is_custom.eq.false,user_id.eq.${userId}`);
  } else {
    query = query.eq('is_custom', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(dbRowToExercise);
}
