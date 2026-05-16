import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

type ClerkEmailAddress = {
  email_address?: string;
  id?: string;
};

type ClerkUserData = {
  email_addresses?: ClerkEmailAddress[];
  first_name?: string | null;
  id?: string;
  image_url?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  profile_image_url?: string | null;
};

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase webhook environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

function getPrimaryEmail(user: ClerkUserData) {
  return (
    user.email_addresses?.find(
      (email) => email.id === user.primary_email_address_id,
    )?.email_address ??
    user.email_addresses?.[0]?.email_address ??
    null
  );
}

function getDisplayName(user: ClerkUserData) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
}

export async function POST(req: NextRequest) {
  const event = await verifyWebhook(req);
  const supabase = createSupabaseAdminClient();

  if (event.type === "user.deleted") {
    const user = event.data as ClerkUserData;

    if (user.id) {
      await supabase.from("users").delete().eq("id", user.id);
    }

    return new Response("Webhook received", { status: 200 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const user = event.data as ClerkUserData;
    const email = getPrimaryEmail(user);

    if (!user.id || !email) {
      return new Response("Missing user id or email", { status: 400 });
    }

    const { error } = await supabase.from("users").upsert({
      id: user.id,
      email,
      display_name: getDisplayName(user),
      avatar_url: user.image_url ?? user.profile_image_url ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return new Response(error.message, { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
