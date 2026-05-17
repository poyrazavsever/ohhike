const DEFAULT_AFTER_AUTH = "/account-type";

function webOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_WEB_URL?.trim();
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** Safe post-login path on the marketing / coach-network site (relative or same-origin full URL). */
export function authRedirectTarget(
  raw: string | undefined,
  fallback = DEFAULT_AFTER_AUTH,
): string {
  if (!raw?.trim()) {
    return fallback;
  }

  const value = raw.trim();

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const allowed = webOrigin();

    if (allowed && parsed.origin !== allowed) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}
