import { table, text, integer, sql } from 'sdk/db';

/**
 * Cache table to persist inspection payloads and high-resolution photo file IDs
 * across ephemeral serverless isolate invocations.
 */
export const cache = table('cache', {
  id: text('id').primaryKey(),
  json: text('json').notNull(),
  photoFileId: text('photo_file_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

/**
 * Usage metrics table to track bot statistics.
 */
export const stats = table('stats', {
  id: text('id').primaryKey(),
  count: integer('count').notNull().default(0),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
