import { db } from '../../../db';
import type { Program } from '../../../types';

export async function getAllPrograms(): Promise<Program[]> {
  return db.programs.toArray();
}

export async function addProgram(program: Program): Promise<void> {
  await db.programs.add(program);
}

export async function updateProgram(id: string, data: Partial<Program>): Promise<void> {
  await db.programs.update(id, data);
}

export async function deleteProgram(id: string): Promise<void> {
  await db.programs.delete(id);
}
