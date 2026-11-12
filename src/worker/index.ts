import pino from "pino";
import { loadConfig } from "../config/env.js";

const config = loadConfig();
const logger = pino({ level: config.LOG_LEVEL });

logger.info("worker process started; job processing is not implemented in milestone 1");
