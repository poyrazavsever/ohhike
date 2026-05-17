/** Coach Network & marketplace routes (CN0-14). */
export function isCoachNetworkEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_COACH_NETWORK_ENABLED?.trim().toLowerCase();

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  // Unset in local dev: routes stay reachable (proxy + layout otherwise return 404).
  return process.env.NODE_ENV === "development";
}
