import type { OrganizationRole } from "./database.types";

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
