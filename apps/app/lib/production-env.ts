import {
  getClerkPublishableKey,
  getClerkWebhookSigningSecret,
} from "./clerk-env";

/** Required for production deploy (apps/app). Secrets are presence-only checks. */
export const PRODUCTION_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

export const PRODUCTION_ENV_OPTIONAL = [
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GEMINI_EMBEDDING_MODEL",
  "RESEND_API_KEY",
  "INVITE_EMAIL_FROM",
  "STRAVA_CLIENT_ID",
  "STRAVA_CLIENT_SECRET",
  "NEXT_PUBLIC_REVENUECAT_ENABLED",
  "NEXT_PUBLIC_REVENUECAT_API_KEY",
  "REVENUECAT_SECRET_API_KEY",
] as const;

export function getMissingProductionEnvKeys(): string[] {
  return PRODUCTION_ENV_KEYS.filter((key) => {
    if (key === "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") {
      return !getClerkPublishableKey();
    }
    if (key === "CLERK_WEBHOOK_SIGNING_SECRET") {
      return !getClerkWebhookSigningSecret();
    }
    return !process.env[key]?.trim();
  });
}
