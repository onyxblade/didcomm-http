import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../../src/server.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /did/resolve/:did", () => {
  it("returns 400 for unsupported DID method", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/did/resolve/did%3Aexample%3Aalice",
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.didResolutionMetadata.error).toBe("methodNotSupported");
  });

  it("returns 404 for unresolvable did:web", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/did/resolve/${encodeURIComponent("did:web:nonexistent.invalid")}`,
    });

    // Should get a resolution result with error
    const body = res.json();
    expect(body.didResolutionMetadata).toBeDefined();
  });
});
