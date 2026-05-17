import type { NextRequest } from "next/server";

function originFromEnv(envKey: "NEXT_PUBLIC_WEB_URL" | "NEXT_PUBLIC_APP_URL") {
  const raw = process.env[envKey]?.trim();
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function isInternalHost(host: string) {
  return (
    host.startsWith("0.0.0.0") ||
    host.startsWith("127.0.0.1") ||
    host === "localhost" ||
    host.startsWith("localhost:")
  );
}

/**
 * Public origin for redirects behind Docker/Traefik.
 * `req.url` can be https://0.0.0.0:3000/... when HOSTNAME=0.0.0.0 (see deploy README).
 */
export function getRequestPublicOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() ?? req.headers.get("host")?.trim();

  if (host && !isInternalHost(host)) {
    const proto = (req.headers.get("x-forwarded-proto") ?? "https")
      .split(",")[0]
      ?.trim();
    return `${proto}://${host}`;
  }

  return (
    originFromEnv("NEXT_PUBLIC_WEB_URL") ??
    originFromEnv("NEXT_PUBLIC_APP_URL") ??
    req.nextUrl.origin
  );
}

export function getRequestPublicUrl(req: NextRequest) {
  const origin = getRequestPublicOrigin(req);
  return `${origin}${req.nextUrl.pathname}${req.nextUrl.search}`;
}
