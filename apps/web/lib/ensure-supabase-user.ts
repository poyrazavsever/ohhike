import { clerkClient, currentUser } from "@clerk/nextjs/server";

import { createSupabaseAdminClient } from "./supabase-admin";

/**
 * Web sign-up uses Clerk; `public.users` is populated by the app webhook in production.
 * Athlete flows on web must upsert the user row before any FK to users(id).
 */
export async function ensureSupabaseUser(userId: string) {
  const sessionUser = await currentUser();

  let email: string | null = null;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  if (sessionUser?.id === userId) {
    email = sessionUser.primaryEmailAddress?.emailAddress ?? null;
    displayName = sessionUser.fullName ?? null;
    avatarUrl = sessionUser.imageUrl ?? null;
  } else {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    email =
      clerkUser.emailAddresses.find(
        (entry) => entry.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null;
    displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
    avatarUrl = clerkUser.imageUrl ?? null;
  }

  if (!email) {
    throw new Error(
      "A verified email is required. Add an email to your account in Clerk, then try again.",
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      email,
      display_name: displayName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
