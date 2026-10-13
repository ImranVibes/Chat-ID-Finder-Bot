import { db } from 'sdk';
import { eq, lt } from 'sdk/db';
import { cache } from '../schema.js';

/**
 * Saves a raw inspection payload and optional photo file ID into SQLite.
 * Returns a unique cache ID.
 */
export async function savePayload(jsonObj, photoFileId = null) {
  const id = Math.random().toString(36).substring(2, 10);
  const jsonStr = JSON.stringify(jsonObj, null, 2);

  // Background cleanup: keep SQLite database lean by removing entries older than 24 hours
  try {
    const expirationThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.delete(cache).where(lt(cache.createdAt, expirationThreshold)).run();
  } catch (cleanErr) {
    // Non-fatal if cleanup query fails
  }

  await db.insert(cache).values({
    id,
    json: jsonStr,
    photoFileId: photoFileId || null,
  }).run();

  return id;
}

/**
 * Retrieves a cached payload and photo file ID by its ID.
 */
export async function getPayload(id) {
  if (!id) return null;
  return await db.select().from(cache).where(eq(cache.id, id)).get();
}
