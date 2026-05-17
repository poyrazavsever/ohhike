"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  acceptCoachNetworkOfferCore,
  declineCoachNetworkOfferCore,
} from "../../lib/coach-network/accept-offer";
import { ensureConversationParticipants } from "../../lib/coach-network/conversation-participants";
import type { Json } from "../../lib/database.types";
import { writeWorkspaceAuditLog } from "../../lib/audit-log";
import { getMarketingUrl } from "../../lib/marketing-url";
import { isCoachStaffRole } from "../../lib/org-roles";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { getCurrentWorkspace } from "../../lib/workspace";

type ActionResult = { ok: true } | { ok: false; error: string };

export type CoachingPackageInput = {
  id?: string;
  title: string;
  description?: string;
  durationWeeks?: number | null;
  priceCents?: number | null;
  currency?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type CoachNetworkOfferInput = {
  applicationId: string;
  packageId?: string | null;
  title: string;
  description?: string;
  terms?: string;
  priceCents?: number | null;
  currency?: string;
  sendNow?: boolean;
};

function cleanString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function requireCoachStaff() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const workspace = await getCurrentWorkspace();
  if (!isCoachStaffRole(workspace.membership.role)) {
    throw new Error("Only coaching staff can manage offers.");
  }

  return { userId, workspace };
}

export async function listCoachingPackagesForWorkspace() {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("coach_marketplace_profiles")
    .select("id")
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (!profile) {
    return [];
  }

  const { data, error } = await supabase
    .from("coaching_packages")
    .select("*")
    .eq("coach_profile_id", profile.id)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function upsertCoachingPackage(
  input: CoachingPackageInput,
): Promise<ActionResult> {
  try {
    const { workspace } = await requireCoachStaff();
    const title = input.title.trim();

    if (!title) {
      return { ok: false, error: "Package title is required." };
    }

    const supabase = createSupabaseAdminClient();
    const { data: profile } = await supabase
      .from("coach_marketplace_profiles")
      .select("id")
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (!profile) {
      return {
        ok: false,
        error: "Create your marketplace profile before adding packages.",
      };
    }

    const payload = {
      coach_profile_id: profile.id,
      organization_id: workspace.organization.id,
      title,
      description: cleanString(input.description),
      duration_weeks: input.durationWeeks ?? null,
      price_cents: input.priceCents ?? null,
      currency: input.currency?.trim() || "USD",
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const { error } = await supabase
        .from("coaching_packages")
        .update(payload)
        .eq("id", input.id)
        .eq("organization_id", workspace.organization.id);

      if (error) {
        return { ok: false, error: error.message };
      }
    } else {
      const { error } = await supabase.from("coaching_packages").insert(payload);

      if (error) {
        return { ok: false, error: error.message };
      }
    }

    revalidatePath("/coach-network/packages");
    revalidatePath("/coach-network/profile");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save package.",
    };
  }
}

export async function deleteCoachingPackage(
  packageId: string,
): Promise<ActionResult> {
  try {
    const { workspace } = await requireCoachStaff();
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("coaching_packages")
      .delete()
      .eq("id", packageId)
      .eq("organization_id", workspace.organization.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/coach-network/packages");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not delete package.",
    };
  }
}

export async function listOffersForApplication(applicationId: string) {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("coach_network_offers")
    .select("*")
    .eq("application_id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function sendCoachNetworkOffer(
  input: CoachNetworkOfferInput,
): Promise<ActionResult & { offerId?: string }> {
  try {
    const { userId, workspace } = await requireCoachStaff();
    const title = input.title.trim();

    if (!title) {
      return { ok: false, error: "Offer title is required." };
    }

    const supabase = createSupabaseAdminClient();
    const { data: application, error: applicationError } = await supabase
      .from("coach_network_applications")
      .select("id, athlete_user_id, coach_profile_id, organization_id, status")
      .eq("id", input.applicationId)
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (applicationError || !application) {
      return { ok: false, error: "Application not found." };
    }

    let packageSnapshot: Json = {};
    if (input.packageId) {
      const { data: pkg } = await supabase
        .from("coaching_packages")
        .select("*")
        .eq("id", input.packageId)
        .eq("organization_id", workspace.organization.id)
        .maybeSingle();

      if (pkg) {
        packageSnapshot = pkg as Json;
      }
    }

    const now = new Date().toISOString();
    const status = input.sendNow === false ? "draft" : "sent";

    const { data: conversation, error: conversationError } = await supabase
      .from("marketplace_conversations")
      .insert({
        conversation_type: "offer",
        organization_id: workspace.organization.id,
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      return { ok: false, error: conversationError?.message ?? "Conversation failed." };
    }

    try {
      await ensureConversationParticipants(supabase, conversation.id, [
        { userId: application.athlete_user_id, role: "athlete" },
        { userId, role: "coach" },
      ]);
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Could not add conversation participants.",
      };
    }

    const { data: offer, error: offerError } = await supabase
      .from("coach_network_offers")
      .insert({
        application_id: application.id,
        organization_id: workspace.organization.id,
        coach_user_id: userId,
        athlete_user_id: application.athlete_user_id,
        package_id: input.packageId ?? null,
        conversation_id: conversation.id,
        title,
        description: cleanString(input.description),
        terms: cleanString(input.terms),
        package_snapshot: packageSnapshot,
        price_cents: input.priceCents ?? null,
        currency: input.currency?.trim() || "USD",
        status,
        sent_at: status === "sent" ? now : null,
      })
      .select("id")
      .single();

    if (offerError || !offer) {
      return { ok: false, error: offerError?.message ?? "Could not create offer." };
    }

    await supabase
      .from("marketplace_conversations")
      .update({ context_id: offer.id, last_message_at: now })
      .eq("id", conversation.id);

    if (status === "sent") {
      await supabase.from("marketplace_messages").insert({
        conversation_id: conversation.id,
        organization_id: workspace.organization.id,
        sender_user_id: userId,
        body: `Coaching offer: ${title}`,
        message_type: "system",
        metadata: { offerId: offer.id },
      });

      const { data: athleteUser } = await supabase
        .from("users")
        .select("email")
        .eq("id", application.athlete_user_id)
        .maybeSingle();

      const resendKey = process.env.RESEND_API_KEY?.trim();
      const from = process.env.INVITE_EMAIL_FROM?.trim();
      if (athleteUser?.email && resendKey && from) {
        const offerUrl = getMarketingUrl(`/athlete/offers/${offer.id}`);
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [athleteUser.email],
            subject: `New coaching offer from ${workspace.organization.name}`,
            text: `You received a coaching offer.\n\nReview it here:\n${offerUrl}`,
          }),
        }).catch(() => undefined);
      }
    }

    await writeWorkspaceAuditLog({
      organizationId: workspace.organization.id,
      userId,
      role: workspace.membership.role,
      action: `coach_network.offer.${status}`,
      entityType: "coach_network_offer",
      entityId: offer.id,
    });

    revalidatePath(`/coach-network/applications/${application.id}`);
    revalidatePath("/coach-network/applications");

    return { ok: true, offerId: offer.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send offer.",
    };
  }
}

export async function listRemoteCoachingRelationshipsForWorkspace() {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data: relationships, error } = await supabase
    .from("remote_coaching_relationships")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = relationships ?? [];
  const athleteIds = rows
    .map((row) => row.athlete_id)
    .filter((id): id is string => Boolean(id));

  const { data: athletes } =
    athleteIds.length > 0
      ? await supabase
          .from("athletes")
          .select("id, display_name, first_name, last_name, email, user_id")
          .in("id", athleteIds)
      : { data: [] };

  const athleteById = new Map((athletes ?? []).map((a) => [a.id, a]));

  return rows.map((row) => ({
    ...row,
    athlete: row.athlete_id ? athleteById.get(row.athlete_id) ?? null : null,
  }));
}

export async function confirmRemoteCoachingPayment(
  relationshipId: string,
): Promise<ActionResult> {
  try {
    const { userId, workspace } = await requireCoachStaff();
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("remote_coaching_relationships")
      .update({
        payment_status: "confirmed_manual",
        updated_at: now,
      })
      .eq("id", relationshipId)
      .eq("organization_id", workspace.organization.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    await writeWorkspaceAuditLog({
      organizationId: workspace.organization.id,
      userId,
      role: workspace.membership.role,
      action: "coach_network.payment.confirmed_manual",
      entityType: "remote_coaching_relationship",
      entityId: relationshipId,
    });

    revalidatePath("/coach-network/remote-athletes");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not confirm payment.",
    };
  }
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
    revalidatePath("/coach-network/remote-athletes");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not accept offer.",
    };
  }
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
