const DEFAULT_MARKETING_URL = "http://localhost:3000";

export function getMarketingUrl(path = "/") {
  const raw = process.env.NEXT_PUBLIC_WEB_URL?.trim();

  try {
    const base = raw ? new URL(raw).origin : DEFAULT_MARKETING_URL;
    return new URL(path, base).toString();
  } catch {
    return new URL(path, DEFAULT_MARKETING_URL).toString();
  }
}
