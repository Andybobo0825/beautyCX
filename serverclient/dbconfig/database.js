import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

let database;

export function getDatabasePath(env = process.env) {
  const configuredPath = env.DATABASE_PATH ?? 'data/beautycx.sqlite';
  const primaryPath = resolve(configuredPath);
  if (existsSync(primaryPath)) return primaryPath;

  const repoRootFallback = resolve('..', configuredPath);
  if (existsSync(repoRootFallback)) return repoRootFallback;

  return primaryPath;
}

export function getDatabase() {
  if (database) return database;

  const databasePath = getDatabasePath();
  if (!existsSync(databasePath)) {
    throw new Error(`SQLite database not found: ${databasePath}`);
  }

  database = new DatabaseSync(databasePath, { readOnly: true });
  database.exec('PRAGMA foreign_keys = ON;');
  return database;
}

export function closeDatabase() {
  if (!database) return;
  database.close();
  database = undefined;
}
