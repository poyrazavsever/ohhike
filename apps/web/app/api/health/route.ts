import { isCoachNetworkEnabled } from "../../../lib/coach-network";

export const dynamic = "force-dynamic";

export async function GET() {
  const coachNetwork = isCoachNetworkEnabled();

  return Response.json({
    ok: true,
    service: "ohhike-web",
    coachNetworkEnabled: coachNetwork,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    webUrl: process.env.NEXT_PUBLIC_WEB_URL ?? null,
    coachNetworkEnv: process.env.NEXT_PUBLIC_COACH_NETWORK_ENABLED ?? null,
    hasClerkPublishableKey: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hint: coachNetwork
      ? "Coach Network routes active"
      : "Set NEXT_PUBLIC_COACH_NETWORK_ENABLED=true at build + runtime, then redeploy",
  });
}
