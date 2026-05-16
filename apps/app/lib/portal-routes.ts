/** Routes that only linked athletes (org role `athlete`) may access. */
export const ATHLETE_PORTAL_PREFIXES = [
  "/athlete/home",
  "/athlete/onboarding",
  "/athlete/check-in",
  "/athlete/nutrition",
  "/athlete/profile",
] as const;

/** Coach roster / team athlete insights (not the athlete self-service home). */
export const COACH_ATHLETE_INSIGHT_PATHS = ["/athlete/dashboard"] as const;

/** Coach and staff workspace routes; blocked for athlete role. */
export const COACH_WORKSPACE_PREFIXES = [
  "/dashboard",
  "/calendar",
  "/teams",
  "/athletes",
  "/sessions",
  "/training-planner",
  "/drills",
  "/readiness",
  "/load-recovery",
  "/nutrition",
  "/wearables",
  "/ai-reports",
  "/team-memory",
  "/reports",
  "/settings/organization",
  "/settings/organization/new",
  "/settings/staff",
  "/settings/billing",
  "/settings/integrations",
] as const;

export const PORTAL_PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/invite",
  "/onboarding",
  "/api",
] as const;

export function pathnameMatchesPrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAthletePortalPath(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, ATHLETE_PORTAL_PREFIXES);
}

export function isCoachWorkspacePath(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, COACH_WORKSPACE_PREFIXES);
}

export function isPortalPublicPath(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, PORTAL_PUBLIC_PREFIXES);
}
