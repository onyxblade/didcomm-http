import {
  Message,
  type DIDDoc,
  type DIDResolver,
  type Secret,
  type SecretsResolver,
} from "didcomm-node";
import type {
  PackEncryptedRequest,
  PackSignedRequest,
  PackPlaintextRequest,
  UnpackRequest,
} from "../schemas/didcomm.js";

export class InMemoryDIDResolver implements DIDResolver {
  private docs: Map<string, DIDDoc>;

  constructor(didDocs: DIDDoc[]) {
    this.docs = new Map(didDocs.map((doc) => [doc.id, doc]));
  }

  async resolve(did: string): Promise<DIDDoc | null> {
    return this.docs.get(did) ?? null;
  }
}

export class InMemorySecretsResolver implements SecretsResolver {
  private secrets: Map<string, Secret>;

  constructor(secrets: Secret[]) {
    this.secrets = new Map(secrets.map((s) => [s.id, s]));
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return this.secrets.get(secretId) ?? null;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((id) => this.secrets.has(id));
  }
}

export async function packEncrypted(req: PackEncryptedRequest) {
  const didResolver = new InMemoryDIDResolver(req.didDocs as DIDDoc[]);
  const secretsResolver = new InMemorySecretsResolver(req.secrets as Secret[]);
  const msg = new Message(req.message);

  const [packedMessage, metadata] = await msg.pack_encrypted(
    req.to,
    req.from ?? null,
    req.sign_by ?? null,
    didResolver,
    secretsResolver,
    {
      forward: false,
      ...req.options,
    }
  );

  return { packedMessage, metadata };
}

export async function packSigned(req: PackSignedRequest) {
  const didResolver = new InMemoryDIDResolver(req.didDocs as DIDDoc[]);
  const secretsResolver = new InMemorySecretsResolver(req.secrets as Secret[]);
  const msg = new Message(req.message);

  const [packedMessage, metadata] = await msg.pack_signed(
    req.sign_by,
    didResolver,
    secretsResolver
  );

  return { packedMessage, metadata };
}

export async function packPlaintext(req: PackPlaintextRequest) {
  const didResolver = new InMemoryDIDResolver(req.didDocs as DIDDoc[]);
  const msg = new Message(req.message);

  const packedMessage = await msg.pack_plaintext(didResolver);

  return { packedMessage };
}

export async function unpack(req: UnpackRequest) {
  const didResolver = new InMemoryDIDResolver(req.didDocs as DIDDoc[]);
  const secretsResolver = new InMemorySecretsResolver(req.secrets as Secret[]);

  const [msg, metadata] = await Message.unpack(
    req.message,
    didResolver,
    secretsResolver,
    req.options ?? {}
  );

  return { message: msg.as_value(), metadata };
}
