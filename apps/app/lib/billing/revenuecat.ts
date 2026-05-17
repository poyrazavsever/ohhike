import type { TeamPlanTier } from "../database.types";

export const revenueCatPlanEntitlements = {
  pro_team: "pro_team",
  pro_plus_team: "pro_plus_team",
} as const;

export type RevenueCatEntitlementId =
  (typeof revenueCatPlanEntitlements)[keyof typeof revenueCatPlanEntitlements];

type RevenueCatRestEntitlement = {
  expires_date: string | null;
  purchase_date: string | null;
  product_identifier: string;
};

export type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatRestEntitlement>;
  };
};

export function getRevenueCatTeamAppUserId(teamId: string) {
  return `team:${teamId}`;
}

export function getRevenueCatPublicApiKey() {
  return process.env.NEXT_PUBLIC_REVENUECAT_API_KEY?.trim() ?? "";
}

export function isRevenueCatEnabled() {
  return (
    process.env.NEXT_PUBLIC_REVENUECAT_ENABLED === "true" &&
    Boolean(getRevenueCatPublicApiKey())
  );
}

function entitlementIsActive(
  entitlement: RevenueCatRestEntitlement | undefined,
  now = new Date(),
) {
  if (!entitlement) {
    return false;
  }

  if (!entitlement.expires_date) {
    return true;
  }

  return new Date(entitlement.expires_date).getTime() > now.getTime();
}

export function getRevenueCatPlanFromSubscriber(
  subscriber: RevenueCatSubscriberResponse["subscriber"],
): {
  plan: TeamPlanTier;
  activeEntitlements: RevenueCatEntitlementId[];
  periodStart: Date | null;
  periodEnd: Date | null;
} {
  const entitlements = subscriber?.entitlements ?? {};
  const activeEntitlements = (
    Object.entries(revenueCatPlanEntitlements) as Array<
      [Exclude<TeamPlanTier, "basic_team">, RevenueCatEntitlementId]
    >
  )
    .filter(([, entitlementId]) =>
      entitlementIsActive(entitlements[entitlementId]),
    )
    .map(([, entitlementId]) => entitlementId);

  const plan: TeamPlanTier = activeEntitlements.includes("pro_plus_team")
    ? "pro_plus_team"
    : activeEntitlements.includes("pro_team")
      ? "pro_team"
      : "basic_team";

  const selectedEntitlement =
    plan === "basic_team"
      ? null
      : entitlements[revenueCatPlanEntitlements[plan]];

  return {
    plan,
    activeEntitlements,
    periodStart: selectedEntitlement?.purchase_date
      ? new Date(selectedEntitlement.purchase_date)
      : null,
    periodEnd: selectedEntitlement?.expires_date
      ? new Date(selectedEntitlement.expires_date)
      : null,
  };
}
