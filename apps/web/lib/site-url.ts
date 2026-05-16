const DEFAULT_APP_URL = "http://localhost:3001";

/** Dokploy build may pass an empty ARG; treat that as unset so prerender does not throw. */
function resolveAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return DEFAULT_APP_URL;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_APP_URL;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}

const appUrl = resolveAppBaseUrl();

export function getAppUrl(path = "/") {
  return new URL(path, appUrl).toString();
}
