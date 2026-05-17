import { NextResponse } from "next/server";

import { isCoachNetworkEnabled } from "../../../lib/coach-network";
import {
  getMissingProductionEnvKeys,
  PRODUCTION_ENV_OPTIONAL,
} from "../../../lib/production-env";

export async function GET() {
  const missing = getMissingProductionEnvKeys();
  const optionalMissing = PRODUCTION_ENV_OPTIONAL.filter(
    (key) => !process.env[key]?.trim(),
  );
  const coachNetworkEnabled = isCoachNetworkEnabled();

  return NextResponse.json({
    ok: missing.length === 0,
    service: "ohhike-app",
    coachNetworkEnabled,
    coachNetworkEnv: process.env.NEXT_PUBLIC_COACH_NETWORK_ENABLED ?? null,
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
