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

export function getClerkMiddlewareKeys() {
  return {
    publishableKey: getClerkPublishableKey(),
    secretKey: getClerkSecretKey(),
  };
}
