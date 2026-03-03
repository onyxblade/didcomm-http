import { Type, type Static } from "@sinclair/typebox";

export const VerificationMethodType = Type.String({
  description:
    'Verification method type, e.g. "JsonWebKey2020", "X25519KeyAgreementKey2019"',
  examples: ["JsonWebKey2020"],
});

export const VerificationMethod = Type.Object(
  {
    id: Type.String({ description: "Verification method ID (DID URL)" }),
    type: VerificationMethodType,
    controller: Type.String({ description: "Controller DID" }),
    publicKeyJwk: Type.Optional(
      Type.Record(Type.String(), Type.Unknown(), {
        description: "Public key in JWK format",
      })
    ),
    publicKeyMultibase: Type.Optional(
      Type.String({ description: "Public key in multibase format" })
    ),
    publicKeyBase58: Type.Optional(
      Type.String({ description: "Public key in base58 format" })
    ),
  },
  { description: "DID Document Verification Method" }
);
export type VerificationMethod = Static<typeof VerificationMethod>;

export const ServiceEndpoint = Type.Object(
  {
    uri: Type.String(),
    accept: Type.Optional(Type.Array(Type.String())),
    routingKeys: Type.Optional(Type.Array(Type.String())),
  },
  { description: "Service endpoint" }
);

export const Service = Type.Object(
  {
    id: Type.String(),
    type: Type.String(),
    serviceEndpoint: Type.Union([ServiceEndpoint, Type.String()]),
  },
  { description: "DID Document Service" }
);
export type Service = Static<typeof Service>;

export const DIDDoc = Type.Object(
  {
    id: Type.String({ description: "DID for the document" }),
    keyAgreement: Type.Array(Type.String(), {
      description: "DID URLs for key agreement verification methods",
    }),
    authentication: Type.Array(Type.String(), {
      description: "DID URLs for authentication verification methods",
    }),
    verificationMethod: Type.Array(VerificationMethod, {
      description: "Verification methods",
    }),
    service: Type.Array(Service, { description: "Services" }),
  },
  { description: "DID Document in DIDComm WASM format" }
);
export type DIDDoc = Static<typeof DIDDoc>;

export const Secret = Type.Object(
  {
    id: Type.String({ description: "Key ID (DID URL)" }),
    type: Type.String({
      description: "Secret type, must match verification method type",
      examples: ["JsonWebKey2020"],
    }),
    privateKeyJwk: Type.Optional(
      Type.Record(Type.String(), Type.Unknown(), {
        description: "Private key in JWK format",
      })
    ),
    privateKeyMultibase: Type.Optional(
      Type.String({ description: "Private key in multibase format" })
    ),
    privateKeyBase58: Type.Optional(
      Type.String({ description: "Private key in base58 format" })
    ),
  },
  { description: "Secret (private key)" }
);
export type Secret = Static<typeof Secret>;

export const DIDResolutionResult = Type.Object(
  {
    didDocument: Type.Any({ description: "Resolved DID Document" }),
    didDocumentMetadata: Type.Record(Type.String(), Type.Unknown(), {
      description: "DID Document metadata",
    }),
    didResolutionMetadata: Type.Object({
      contentType: Type.Optional(Type.String()),
      error: Type.Optional(Type.String()),
      message: Type.Optional(Type.String()),
    }),
  },
  { description: "DID Resolution Result (W3C format)" }
);
export type DIDResolutionResult = Static<typeof DIDResolutionResult>;
