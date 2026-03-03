import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { didcommRoutes } from "./routes/didcomm.js";
import { didRoutes } from "./routes/did.js";
import { errorHandler } from "./plugins/error-handler.js";

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "DIDComm HTTP API",
        description:
          "HTTP wrapper for DIDComm WASM (didcomm-rust) and DID resolution (did:web + did:webvh)",
        version: "0.1.0",
      },
      tags: [
        {
          name: "DIDComm",
          description: "Stateless DIDComm pack/unpack operations",
        },
        { name: "DID", description: "DID resolution" },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/documentation",
  });

  fastify.setErrorHandler(errorHandler);

  await fastify.register(didcommRoutes);
  await fastify.register(didRoutes);

  fastify.get("/openapi.json", {
    schema: { hide: true },
    handler: async () => {
      return fastify.swagger();
    },
  });

  return fastify;
}
