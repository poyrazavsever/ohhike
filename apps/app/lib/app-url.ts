import "server-only";

import { headers } from "next/headers";

/**
 * Canonical app origin for invite links and redirects.
 * Production: set NEXT_PUBLIC_APP_URL (required for reliable invite copy).
 */
export async function getAppBaseUrl(): Promise<string> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envBase) {
    return envBase;
  }

  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    if (!host) {
      return "";
    }
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

export function buildAppUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!baseUrl) {
    return normalizedPath;
  }
  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}
