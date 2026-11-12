import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/api/app.js";

describe("health endpoints", () => {
  it("reports liveness without a database call", async () => {
    const app = createApp({ check: async () => Promise.reject(new Error("not called")) });

    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("reports ready when PostgreSQL is reachable", async () => {
    const app = createApp({ check: async () => undefined });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", database: "up" });
  });

  it("reports not ready when PostgreSQL is unavailable", async () => {
    const app = createApp({ check: async () => Promise.reject(new Error("connection refused")) });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "not_ready", database: "down" });
  });
});
