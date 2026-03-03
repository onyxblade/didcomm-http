import { Type } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import { DIDResolutionResult } from "../schemas/did.js";

import { resolveDID } from "../services/did-resolver.js";

export async function didRoutes(fastify: FastifyInstance) {
  fastify.get("/did/resolve/:did", {
    schema: {
      tags: ["DID"],
      summary: "Resolve a DID (did:web + did:webvh)",
      params: Type.Object({
        did: Type.String({
          description:
            "DID to resolve (URL-encoded, e.g. did%3Aweb%3Aexample.com)",
        }),
      }),
      response: {
        200: DIDResolutionResult,
        400: DIDResolutionResult,
        404: DIDResolutionResult,
      },
    },
    handler: async (request, reply) => {
      const { did } = request.params as { did: string };

      const result = await resolveDID(did);

      if (result.didResolutionMetadata.error) {
        const status =
          result.didResolutionMetadata.error === "methodNotSupported"
            ? 400
            : 404;
        reply.status(status);
      }

      return result;
    },
  });
}
