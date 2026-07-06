import { NextResponse } from "next/server";


import {
  getMissingProductionEnvKeys,
  PRODUCTION_ENV_OPTIONAL,
} from "../../../lib/production-env";

export async function GET() {
  const missing = getMissingProductionEnvKeys();
  const optionalMissing = PRODUCTION_ENV_OPTIONAL.filter(
    (key) => !process.env[key]?.trim(),
  );

  return NextResponse.json({
    ok: missing.length === 0,
    service: "ohhike-app",
    revenueCatEnabled: process.env.NEXT_PUBLIC_REVENUECAT_ENABLED === "true",
    hasRevenueCatApiKey: Boolean(
      process.env.NEXT_PUBLIC_REVENUECAT_API_KEY?.trim(),
    ),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    missing,
    optionalMissing,
    hint:
      missing.length > 0
        ? "Set required env vars in your hosting provider, then redeploy."
        : optionalMissing.includes("GEMINI_API_KEY")
          ? "AI features use rule-based fallback without GEMINI_API_KEY."
          : undefined,
  });
}

