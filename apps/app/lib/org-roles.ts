// @ts-nocheck
import type { OrganizationRole } from "./db.types";

export const COACH_STAFF_ROLES = [
  "owner",
  "admin",
  "head_coach",
  "assistant_coach",
  "analyst",
  "physiotherapist",
  "nutritionist",
] as const satisfies readonly OrganizationRole[];

export type CoachStaffRole = (typeof COACH_STAFF_ROLES)[number];

export function isAthleteRole(role: OrganizationRole): boolean {
  return role === "athlete";
}

export function isCoachStaffRole(role: OrganizationRole): boolean {
  return (COACH_STAFF_ROLES as readonly OrganizationRole[]).includes(role);
}

/** Roles assignable through a staff invite link (never owner or athlete). */
export const INVITABLE_ORGANIZATION_ROLES = [
  "admin",
  "head_coach",
  "assistant_coach",
  "analyst",
  "physiotherapist",
  "nutritionist",
  "viewer",
] as const satisfies readonly OrganizationRole[];

export type InvitableOrganizationRole =
  (typeof INVITABLE_ORGANIZATION_ROLES)[number];

export function isInvitableOrganizationRole(
  role: OrganizationRole,
): role is InvitableOrganizationRole {
  return (INVITABLE_ORGANIZATION_ROLES as readonly OrganizationRole[]).includes(
    role,
  );
}

export function canManageStaffInvites(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

export function formatOrganizationRole(role: OrganizationRole): string {
  return role
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}


