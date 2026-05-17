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

export function getClerkMiddlewareKeys() {
  const publishableKey = getClerkPublishableKey();
  const secretKey = getClerkSecretKey();
  const encryptionKey = getClerkEncryptionKey();

  if (secretKey && encryptionKey) {
    return { publishableKey, secretKey };
  }

  return { publishableKey };
}
