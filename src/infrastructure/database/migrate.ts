import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { loadConfig } from "../config.js";
import { createPool } from "./pool.js";

const migrationsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../migrations"
);

async function withMigrationLock<T>(client: PoolClient, operation: () => Promise<T>): Promise<T> {
  await client.query("SELECT pg_advisory_lock($1)", [8_104_202_610]);
  try {
    return await operation();
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [8_104_202_610]);
  }
}

async function main(): Promise<void> {
  const pool = createPool(loadConfig());
  const client = await pool.connect();
  try {
    await withMigrationLock(client, async () => {
      await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);
      const files = (await readdir(migrationsDirectory))
        .filter((file) => /^\\d{4}_.+\\.sql$/.test(file))
        .sort();
      for (const filename of files) {
        const existing = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [
          filename
        ]);
        if (existing.rowCount) continue;
        const sql = await readFile(path.join(migrationsDirectory, filename), "utf8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
          await client.query("COMMIT");
          console.log(`Applied migration ${filename}`);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      }
    });
  } finally {
    client.release();
    await pool.end();
  }
}

void main();
