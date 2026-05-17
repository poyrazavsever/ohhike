/** Coach Network & marketplace routes (CN0-14). */
export function isCoachNetworkEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COACH_NETWORK_ENABLED === "true";
}
