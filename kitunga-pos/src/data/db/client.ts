// src/data/db/client.ts
import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

const DB_NAME = 'kitunga.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Ouvre la base (une seule fois) et applique les migrations manquantes. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!dbPromise) {
        dbPromise = openAndMigrate();
    }
    return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    await runMigrations(db);

    return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS _migrations (
            version     INTEGER PRIMARY KEY,
            applied_at  TEXT NOT NULL
        );
    `);

    const row = await db.getFirstAsync<{ version: number | null }>(
        'SELECT MAX(version) AS version FROM _migrations',
    );
    const currentVersion = row?.version ?? 0;

    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
        const version = i + 1;
        const sql = MIGRATIONS[i];

        try {
            await db.execAsync('BEGIN;');
            await db.execAsync(sql);
            await db.runAsync(
                'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)',
                [version, new Date().toISOString()],
            );
            await db.execAsync('COMMIT;');
            console.log(`[db] migration v${version} appliquée`);
        } catch (error) {
            await db.execAsync('ROLLBACK;');
            console.error(`[db] échec migration v${version}`, error);
            throw error;
        }
    }
}

/** Utilitaire de dev : supprime la base (⚠️ destructif). */
export async function resetDatabase(): Promise<void> {
    const db = await getDb();
    await db.closeAsync();
    await SQLite.deleteDatabaseAsync(DB_NAME);
    dbPromise = null;
}