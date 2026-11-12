import { Pool } from "pg";
import type { AppConfig } from "../config.js";

export function createPool(config: AppConfig): Pool {
  return new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DATABASE_POOL_MAX,
    connectionTimeoutMillis: config.DATABASE_CONNECT_TIMEOUT_MS,
    ssl: config.DATABASE_SSL ? { rejectUnauthorized: false } : undefined
  });
}
