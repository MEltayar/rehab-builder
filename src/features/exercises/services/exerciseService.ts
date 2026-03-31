import { db } from '../../../db';
import { SEED_EXERCISES } from '../../../db/seed';

export async function seedIfEmpty(): Promise<void> {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd(SEED_EXERCISES);
  }
}

export async function getAllExercises() {
  return db.exercises.toArray();
}
