const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export function getAppUrl(path = "/") {
  return new URL(path, appUrl).toString();
}
