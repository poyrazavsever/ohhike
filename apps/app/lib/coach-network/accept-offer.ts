import { createSupabaseAdminClient } from "../supabase-admin";
import { provisionMarketplaceAthlete } from "./provision-marketplace-athlete";

export async function acceptCoachNetworkOfferCore(
  offerId: string,
  athleteUserId: string,
) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: offer, error: offerError } = await supabase
    .from("coach_network_offers")
    .select("*")
    .eq("id", offerId)
    .eq("athlete_user_id", athleteUserId)
    .maybeSingle();

  if (offerError) {
    throw new Error(offerError.message);
  }

  if (!offer) {
    throw new Error("Offer not found.");
  }

  if (offer.status !== "sent") {
    throw new Error("This offer is no longer available.");
  }

  const { data: application, error: applicationError } = await supabase
    .from("coach_network_applications")
    .select("id, coach_profile_id")
    .eq("id", offer.application_id)
    .maybeSingle();

  if (applicationError || !application) {
    throw new Error(applicationError?.message ?? "Application not found.");
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, email, display_name")
    .eq("id", athleteUserId)
    .maybeSingle();

  const { data: athleteProfile } = await supabase
    .from("athlete_marketplace_profiles")
    .select("display_name")
    .eq("user_id", athleteUserId)
    .maybeSingle();

  const displayName =
    athleteProfile?.display_name ??
    user?.display_name ??
    user?.email?.split("@")[0] ??
    "Athlete";

  const athlete = await provisionMarketplaceAthlete({
    organizationId: offer.organization_id,
    athleteUserId,
    displayName,
    email: user?.email ?? null,
  });

  const { data: relationship, error: relationshipError } = await supabase
    .from("remote_coaching_relationships")
    .insert({
      organization_id: offer.organization_id,
      team_id: athlete.team_id,
      athlete_id: athlete.id,
      athlete_user_id: athleteUserId,
      coach_user_id: offer.coach_user_id,
      coach_profile_id: application.coach_profile_id,
      application_id: offer.application_id,
      offer_id: offer.id,
      status: "active",
      payment_status: "pending_manual",
      started_at: now,
    })
    .select("id")
    .single();

  if (relationshipError || !relationship) {
    throw new Error(
      relationshipError?.message ?? "Could not create coaching relationship.",
    );
  }

  const { error: offerUpdateError } = await supabase
    .from("coach_network_offers")
    .update({
      status: "accepted",
      accepted_at: now,
      remote_relationship_id: relationship.id,
      updated_at: now,
    })
    .eq("id", offer.id);

  if (offerUpdateError) {
    throw new Error(offerUpdateError.message);
  }

  await supabase
    .from("coach_network_applications")
    .update({
      status: "accepted",
      resolved_at: now,
      updated_at: now,
    })
    .eq("id", offer.application_id);

  return { offerId: offer.id, relationshipId: relationship.id };
}

export async function declineCoachNetworkOfferCore(
  offerId: string,
  athleteUserId: string,
) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("coach_network_offers")
    .update({
      status: "declined",
      declined_at: now,
      updated_at: now,
    })
    .eq("id", offerId)
    .eq("athlete_user_id", athleteUserId)
    .eq("status", "sent");

  if (error) {
    throw new Error(error.message);
  }
}
