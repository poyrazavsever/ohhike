/**
 * Modules that must keep using `createSupabaseAdminClient()` (service role).
 * Everything else should use `createWorkspaceSupabase()` / `createActionSupabase()`.
 */
export const SUPABASE_ADMIN_ONLY_MODULES = [
  "app/api/webhooks/clerk",
  "app/onboarding/actions",
  "lib/audit-log",
  "lib/athlete-invite",
  "lib/staff-invite",
] as const;

export type SupabaseAdminOnlyModule =
  (typeof SUPABASE_ADMIN_ONLY_MODULES)[number];

export function isSupabaseAdminOnlyModule(
  moduleId: string,
): moduleId is SupabaseAdminOnlyModule {
  return (SUPABASE_ADMIN_ONLY_MODULES as readonly string[]).includes(moduleId);
}
