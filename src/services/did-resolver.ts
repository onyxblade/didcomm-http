import { Resolver, type DIDDocument } from "did-resolver";
import { getResolver as getWebResolver } from "web-did-resolver";
import { resolveDID as resolveWebVH } from "didwebvh-ts";

let cachedResolver: Resolver | null = null;

function getDidWebResolver(): Resolver {
  if (!cachedResolver) {
    cachedResolver = new Resolver({ ...getWebResolver() });
  }
  return cachedResolver;
}

export interface ResolveResult {
  didDocument: DIDDocument | null;
  didDocumentMetadata: Record<string, unknown>;
  didResolutionMetadata: {
    contentType?: string;
    error?: string;
    message?: string;
  };
}

export async function resolveDID(did: string): Promise<ResolveResult> {
  if (did.startsWith("did:webvh:")) {
    return resolveDidWebVH(did);
  }

  if (did.startsWith("did:web:")) {
    return resolveDidWeb(did);
  }

  return {
    didDocument: null,
    didDocumentMetadata: {},
    didResolutionMetadata: {
      error: "methodNotSupported",
      message: `Unsupported DID method: ${did.split(":")[1] ?? "unknown"}`,
    },
  };
}

async function resolveDidWeb(did: string): Promise<ResolveResult> {
  const resolver = getDidWebResolver();
  const result = await resolver.resolve(did);
  return {
    didDocument: result.didDocument ?? null,
    didDocumentMetadata: result.didDocumentMetadata ?? {},
    didResolutionMetadata: result.didResolutionMetadata ?? {},
  };
}

async function resolveDidWebVH(did: string): Promise<ResolveResult> {
  try {
    const result = await resolveWebVH(did);
    return {
      didDocument: result.doc ?? null,
      didDocumentMetadata: {
        versionId: result.meta.versionId,
        created: result.meta.created,
        updated: result.meta.updated,
        deactivated: result.meta.deactivated,
        portable: result.meta.portable,
      },
      didResolutionMetadata: {
        contentType: "application/did+ld+json",
        ...(result.meta.error ? { error: String(result.meta.error) } : {}),
      },
    };
  } catch (err) {
    return {
      didDocument: null,
      didDocumentMetadata: {},
      didResolutionMetadata: {
        error: "notFound",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
