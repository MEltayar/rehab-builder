import { db } from '../../../db';

export async function getAllClients() {
  return db.clients.toArray();
}
