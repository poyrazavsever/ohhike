"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  acceptCoachNetworkOfferCore,
  declineCoachNetworkOfferCore,
} from "../../lib/coach-network/accept-offer";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getAthleteOffer(offerId: string) {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("coach_network_offers")
    .select("*")
    .eq("id", offerId)
    .eq("athlete_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listAthleteOffers() {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("coach_network_offers")
    .select("id, title, status, sent_at, price_cents, currency, application_id")
    .eq("athlete_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function acceptCoachNetworkOffer(
  offerId: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    await acceptCoachNetworkOfferCore(offerId, userId);
    revalidatePath("/athlete/applications");
    revalidatePath(`/athlete/offers/${offerId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not accept offer.",
    };
  }
}

export async function acceptCoachNetworkOfferAndRedirect(offerId: string) {
  const result = await acceptCoachNetworkOffer(offerId);
  if (!result.ok) {
    return result;
  }
  redirect("/athlete/applications?offerAccepted=1");
}

export async function declineCoachNetworkOffer(
  offerId: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    await declineCoachNetworkOfferCore(offerId, userId);
    revalidatePath("/athlete/applications");
    revalidatePath(`/athlete/offers/${offerId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not decline offer.",
    };
  }
}
