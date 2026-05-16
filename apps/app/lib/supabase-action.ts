import "server-only";

import { createSupabaseAdminClient } from "./supabase-admin";

export const SUPABASE_RLS_SETUP_HINT =
  "Database access was denied. In Clerk, add a JWT template named \"supabase\" for Supabase, and ensure the user is signed in.";

export function isSupabaseRlsError(message: string) {
  return /permission denied|row-level security|jwt|invalid claim/i.test(message);
}

export function formatSupabaseActionError(
  message: string,
  options?: { schemaAlignHint?: string },
) {
  if (options?.schemaAlignHint) {
    return options.schemaAlignHint;
  }

  if (isSupabaseRlsError(message)) {
    return SUPABASE_RLS_SETUP_HINT;
  }

  return message;
}

/** MVP: service role client (RLS migration deferred). */
export async function createActionSupabase() {
  return createSupabaseAdminClient();
}
