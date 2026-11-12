import pino from "pino";
import { createApp } from "./app.js";
import { loadConfig } from "../config/env.js";
import { createPool } from "../infrastructure/database/pool.js";

const config = loadConfig();
const logger = pino({ level: config.LOG_LEVEL });
const pool = createPool(config);
const app = createApp({
  async check(): Promise<void> {
    await pool.query("SELECT 1");
  }
});

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "api listening");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "shutting down api");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
