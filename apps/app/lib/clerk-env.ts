/**
 * Read Clerk keys at runtime (bracket access avoids Next.js build-time inlining).
 * Required for Docker/Dokploy when NEXT_PUBLIC_* were not passed as build-args.
 */
function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getClerkPublishableKey(): string {
  return (
    readEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ??
    readEnv("CLERK_PUBLISHABLE_KEY") ??
    ""
  );
}

export function getClerkSecretKey(): string {
  return readEnv("CLERK_SECRET_KEY") ?? "";
}

export function getClerkEncryptionKey(): string {
  return readEnv("CLERK_ENCRYPTION_KEY") ?? "";
}

/**
 * Clerk requires CLERK_ENCRYPTION_KEY when passing secretKey via middleware (Docker/runtime).
 * Local dev: only publishableKey is passed; CLERK_SECRET_KEY is read from .env by @clerk/nextjs.
 */
export function getClerkMiddlewareKeys() {
  const publishableKey = getClerkPublishableKey();
  const secretKey = getClerkSecretKey();
  const encryptionKey = getClerkEncryptionKey();

  if (secretKey && encryptionKey) {
    return { publishableKey, secretKey };
  }

  return { publishableKey };
}
