export const COACHING_PROOFS_BUCKET = "coaching-proofs";

export const MAX_PROOF_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_PROOF_FILES_PER_SUBMIT = 5;

const ALLOWED_MIME_PREFIXES = ["image/", "video/"];

export function isAllowedProofMimeType(mimeType: string) {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

export function sanitizeProofFileName(fileName: string) {
  const base = fileName.split(/[/\\]/).pop() ?? "upload";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "upload";
}

export function buildCoachingProofStoragePath(input: {
  organizationId: string;
  relationshipId: string;
  proofId: string;
  fileName: string;
}) {
  const safeName = sanitizeProofFileName(input.fileName);
  return `${input.organizationId}/${input.relationshipId}/${input.proofId}/${safeName}`;
}

export type ProofMetadata = {
  conversation_id?: string;
};

export function parseProofMetadata(value: unknown): ProofMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    conversation_id:
      typeof record.conversation_id === "string"
        ? record.conversation_id
        : undefined,
  };
}
