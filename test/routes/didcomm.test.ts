import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../../src/server.js";
import type { FastifyInstance } from "fastify";
import { ALICE_DID_DOC, BOB_DID_DOC } from "../fixtures/did-docs.js";
import { ALICE_SECRETS, BOB_SECRETS } from "../fixtures/secrets.js";
import { MESSAGE_SIMPLE } from "../fixtures/messages.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("POST /didcomm/pack/encrypted", () => {
  it("packs an encrypted message", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/didcomm/pack/encrypted",
      payload: {
        message: MESSAGE_SIMPLE,
        to: "did:example:bob",
        from: "did:example:alice",
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
        secrets: ALICE_SECRETS,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.packedMessage).toBeTypeOf("string");
    expect(body.metadata.to_kids.length).toBeGreaterThan(0);
  });

  it("returns 400 on invalid body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/didcomm/pack/encrypted",
      payload: { invalid: true },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /didcomm/pack/signed", () => {
  it("packs a signed message", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/didcomm/pack/signed",
      payload: {
        message: MESSAGE_SIMPLE,
        sign_by: "did:example:alice",
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
        secrets: ALICE_SECRETS,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.packedMessage).toBeTypeOf("string");
    expect(body.metadata.sign_by_kid).toContain("did:example:alice");
  });
});

describe("POST /didcomm/pack/plaintext", () => {
  it("packs a plaintext message", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/didcomm/pack/plaintext",
      payload: {
        message: MESSAGE_SIMPLE,
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.packedMessage).toBeTypeOf("string");
    const parsed = JSON.parse(body.packedMessage);
    expect(parsed.id).toBe(MESSAGE_SIMPLE.id);
  });
});

describe("POST /didcomm/unpack", () => {
  it("unpacks an encrypted message", async () => {
    // First pack
    const packRes = await app.inject({
      method: "POST",
      url: "/didcomm/pack/encrypted",
      payload: {
        message: MESSAGE_SIMPLE,
        to: "did:example:bob",
        from: "did:example:alice",
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
        secrets: ALICE_SECRETS,
      },
    });

    const { packedMessage } = packRes.json();

    // Then unpack
    const unpackRes = await app.inject({
      method: "POST",
      url: "/didcomm/unpack",
      payload: {
        message: packedMessage,
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
        secrets: BOB_SECRETS,
      },
    });

    expect(unpackRes.statusCode).toBe(200);
    const body = unpackRes.json();
    expect(body.message.id).toBe(MESSAGE_SIMPLE.id);
    expect(body.metadata.encrypted).toBe(true);
    expect(body.metadata.authenticated).toBe(true);
  });

  it("unpacks a plaintext message", async () => {
    const packRes = await app.inject({
      method: "POST",
      url: "/didcomm/pack/plaintext",
      payload: {
        message: MESSAGE_SIMPLE,
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
      },
    });

    const { packedMessage } = packRes.json();

    const unpackRes = await app.inject({
      method: "POST",
      url: "/didcomm/unpack",
      payload: {
        message: packedMessage,
        didDocs: [ALICE_DID_DOC, BOB_DID_DOC],
        secrets: [],
      },
    });

    expect(unpackRes.statusCode).toBe(200);
    const body = unpackRes.json();
    expect(body.message.id).toBe(MESSAGE_SIMPLE.id);
    expect(body.metadata.encrypted).toBe(false);
  });
});
