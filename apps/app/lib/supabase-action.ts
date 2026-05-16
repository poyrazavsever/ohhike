import "server-only";

import { createSupabaseServerClient } from "./supabase-server";

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

/** Default Supabase client for server actions (RLS enforced via Clerk JWT). */
export async function createActionSupabase() {
  return createSupabaseServerClient();
}
