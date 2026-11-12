import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/infrastructure/config.js";

describe("loadConfig", () => {
  const minimum = { DATABASE_URL: "postgresql://user:password@localhost:5432/queueforge" };

  it("applies safe development defaults", () => {
    expect(loadConfig(minimum)).toMatchObject({
      PORT: 3000,
      DATABASE_SSL: false,
      MAX_PAGE_SIZE: 100
    });
  });

  it("rejects unsafe or malformed values", () => {
    expect(() => loadConfig({ ...minimum, PORT: "70000" })).toThrow("Invalid configuration");
  });
});
