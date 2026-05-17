/** Primary marketing nav link to the public coach directory. */
export const FIND_COACH_PATH = "/find-coach";

export const findCoachNavLink = {
  href: FIND_COACH_PATH,
  label: "Coaches",
} as const;

export const findCoachDropdownItem = {
  href: FIND_COACH_PATH,
  label: "Find a coach",
  description: "Browse published coaching profiles and packages.",
} as const;
