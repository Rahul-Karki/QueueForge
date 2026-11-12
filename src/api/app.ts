import express, { type Application, type Request, type Response } from "express";

export interface DatabaseHealthCheck {
  check(): Promise<void>;
}

export function createApp(database: DatabaseHealthCheck): Application {
  const app = express();

  app.get("/health/live", (_request: Request, response: Response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/health/ready", async (_request: Request, response: Response) => {
    try {
      await database.check();
      response.status(200).json({ status: "ok", database: "up" });
    } catch {
      response.status(503).json({ status: "not_ready", database: "down" });
    }
  });

  return app;
}
