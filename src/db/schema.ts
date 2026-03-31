import Dexie, { type Table } from 'dexie';
import type { Exercise, Client, Program, Template, AppSettings } from '../types';

export class RehabDB extends Dexie {
  exercises!: Table<Exercise>;
  clients!: Table<Client>;
  programs!: Table<Program>;
  templates!: Table<Template>;
  settings!: Table<AppSettings & { id: number }>;

  constructor() {
    super('RehabBuilderDB');
    this.version(1).stores({
      exercises: 'id, category, name, isCustom',
      clients: 'id, name, createdAt',
      programs: 'id, clientId, name, createdAt',
      templates: 'id, name, condition, isBuiltIn',
      settings: 'id',
    });
  }
}

export const db = new RehabDB();
