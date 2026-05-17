"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { addCompletedDateToAssignment } from "../../lib/coach-network/program-assignments";
import {
  buildCoachingProofStoragePath,
  COACHING_PROOFS_BUCKET,
  isAllowedProofMimeType,
  MAX_PROOF_FILE_BYTES,
  MAX_PROOF_FILES_PER_SUBMIT,
  parseProofMetadata,
} from "../../lib/coach-network/training-proofs-storage";
import type { Json, TrainingProofStatus } from "../../lib/database.types";
import { writeWorkspaceAuditLog } from "../../lib/audit-log";
import { isCoachStaffRole } from "../../lib/org-roles";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { getAthletePortalContext } from "../../lib/athlete-portal";
import { getCurrentWorkspace } from "../../lib/workspace";

type ActionResult = { ok: true } | { ok: false; error: string };

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function cleanString(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function requireCoachStaff() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const workspace = await getCurrentWorkspace();
  if (!isCoachStaffRole(workspace.membership.role)) {
    throw new Error("Only coaching staff can review proofs.");
  }

  return { userId, workspace };
}

async function getActiveRelationshipForAthlete(athleteId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("remote_coaching_relationships")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function createSignedUrls(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const results = await Promise.all(
    storagePaths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(COACHING_PROOFS_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

      if (error || !data?.signedUrl) {
        return null;
      }

      return { path, url: data.signedUrl };
    }),
  );

  return results.filter((entry): entry is { path: string; url: string } =>
    Boolean(entry),
  );
}

function storagePathsFromProof(storagePaths: Json | null) {
  if (!Array.isArray(storagePaths)) {
    return [];
  }
  return storagePaths.filter((path): path is string => typeof path === "string");
}

export async function listTrainingProofsForAthlete() {
  const portal = await getAthletePortalContext();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("training_proofs")
    .select("*")
    .eq("athlete_id", portal.athlete.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listTrainingProofsForWorkspace() {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data: proofs, error } = await supabase
    .from("training_proofs")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = proofs ?? [];
  const athleteIds = [...new Set(rows.map((row) => row.athlete_id))];

  const { data: athletes } =
    athleteIds.length > 0
      ? await supabase
          .from("athletes")
          .select("id, display_name, first_name, last_name, email")
          .in("id", athleteIds)
      : { data: [] };

  const athleteById = new Map((athletes ?? []).map((a) => [a.id, a]));

  return rows.map((row) => ({
    ...row,
    athlete: athleteById.get(row.athlete_id) ?? null,
  }));
}

export async function getTrainingProofDetail(proofId: string) {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: proof, error } = await supabase
    .from("training_proofs")
    .select("*")
    .eq("id", proofId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!proof) {
    return null;
  }

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, user_id, display_name, first_name, last_name, email")
    .eq("id", proof.athlete_id)
    .maybeSingle();

  const workspace = await getCurrentWorkspace().catch(() => null);
  const isCoach =
    workspace &&
    isCoachStaffRole(workspace.membership.role) &&
    workspace.organization.id === proof.organization_id;
  const isAthlete = athlete?.user_id === userId;

  if (!isCoach && !isAthlete) {
    return null;
  }

  const paths = storagePathsFromProof(proof.storage_paths);
  const media = await createSignedUrls(paths);

  const metadata = parseProofMetadata(proof.metadata);
  let messages: Array<{
    id: string;
    body: string;
    sender_user_id: string;
    message_type: string;
    created_at: string | null;
  }> = [];

  if (metadata.conversation_id) {
    const { data: thread } = await supabase
      .from("marketplace_messages")
      .select("id, body, sender_user_id, message_type, created_at")
      .eq("conversation_id", metadata.conversation_id)
      .order("created_at", { ascending: true });

    messages = thread ?? [];
  }

  return {
    proof,
    athlete: athlete ?? null,
    media,
    messages,
    canReview: Boolean(isCoach),
    isAthlete: Boolean(isAthlete),
  };
}

export async function submitTrainingProof(
  formData: FormData,
): Promise<ActionResult & { proofId?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    const portal = await getAthletePortalContext();
    const relationship = await getActiveRelationshipForAthlete(portal.athlete.id);

    if (!relationship) {
      return {
        ok: false,
        error:
          "No active remote coaching relationship. Accept a coach offer before submitting proofs.",
      };
    }

    const title = cleanString(formData.get("title"));
    if (!title) {
      return { ok: false, error: "Title is required." };
    }

    const notes = cleanString(formData.get("notes"));
    const proofDate =
      cleanString(formData.get("proofDate")) ?? new Date().toISOString().slice(0, 10);

    const fileEntries = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (fileEntries.length === 0) {
      return { ok: false, error: "Add at least one photo or video." };
    }

    if (fileEntries.length > MAX_PROOF_FILES_PER_SUBMIT) {
      return {
        ok: false,
        error: `You can upload up to ${MAX_PROOF_FILES_PER_SUBMIT} files per proof.`,
      };
    }

    for (const file of fileEntries) {
      if (!isAllowedProofMimeType(file.type)) {
        return { ok: false, error: "Only image and video files are allowed." };
      }
      if (file.size > MAX_PROOF_FILE_BYTES) {
        return { ok: false, error: "Each file must be 25 MB or smaller." };
      }
    }

    const supabase = createSupabaseAdminClient();
    const proofId = randomUUID();

    const { data: activeAssignment } = await supabase
      .from("coaching_program_assignments")
      .select("id")
      .eq("athlete_id", portal.athlete.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const storagePaths: string[] = [];

    for (const file of fileEntries) {
      const path = buildCoachingProofStoragePath({
        organizationId: relationship.organization_id,
        relationshipId: relationship.id,
        proofId,
        fileName: file.name,
      });

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from(COACHING_PROOFS_BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return { ok: false, error: uploadError.message };
      }

      storagePaths.push(path);
    }

    const now = new Date().toISOString();
    const { data: conversation, error: conversationError } = await supabase
      .from("marketplace_conversations")
      .insert({
        conversation_type: "proof",
        organization_id: relationship.organization_id,
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      return {
        ok: false,
        error: conversationError?.message ?? "Could not start proof thread.",
      };
    }

    await supabase.from("marketplace_conversation_participants").insert([
      {
        conversation_id: conversation.id,
        user_id: userId,
        participant_role: "athlete",
      },
      {
        conversation_id: conversation.id,
        user_id: relationship.coach_user_id,
        participant_role: "coach",
      },
    ]);

    const { data: proof, error: proofError } = await supabase
      .from("training_proofs")
      .insert({
        id: proofId,
        relationship_id: relationship.id,
        assignment_id: activeAssignment?.id ?? null,
        organization_id: relationship.organization_id,
        athlete_id: portal.athlete.id,
        submitted_by: userId,
        title,
        notes,
        proof_date: proofDate,
        storage_paths: storagePaths as Json,
        status: "pending",
        metadata: { conversation_id: conversation.id } as Json,
      })
      .select("id")
      .single();

    if (proofError || !proof) {
      return { ok: false, error: proofError?.message ?? "Could not save proof." };
    }

    await supabase
      .from("marketplace_conversations")
      .update({ context_id: proof.id, last_message_at: now })
      .eq("id", conversation.id);

    await supabase.from("marketplace_messages").insert({
      conversation_id: conversation.id,
      organization_id: relationship.organization_id,
      sender_user_id: userId,
      body: `Proof submitted: ${title}`,
      message_type: "system",
      metadata: { proofId: proof.id },
    });

    revalidatePath("/athlete/proofs");
    revalidatePath("/coach-network/proofs");
    return { ok: true, proofId: proof.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not submit proof.",
    };
  }
}

export async function reviewTrainingProof(input: {
  proofId: string;
  status: Extract<TrainingProofStatus, "approved" | "needs_revision" | "rejected">;
  feedback?: string;
}): Promise<ActionResult> {
  try {
    const { userId, workspace } = await requireCoachStaff();
    const feedback = cleanString(input.feedback ?? null);
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: proof, error: proofError } = await supabase
      .from("training_proofs")
      .select("*")
      .eq("id", input.proofId)
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (proofError || !proof) {
      return { ok: false, error: "Proof not found." };
    }

    const { error: updateError } = await supabase
      .from("training_proofs")
      .update({
        status: input.status,
        coach_feedback: feedback,
        reviewed_by: userId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", proof.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    if (input.status === "approved") {
      const assignmentId = proof.assignment_id;
      if (assignmentId) {
        await addCompletedDateToAssignment(
          supabase,
          assignmentId,
          proof.proof_date,
        );
      } else {
        const { data: activeAssignment } = await supabase
          .from("coaching_program_assignments")
          .select("id")
          .eq("athlete_id", proof.athlete_id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activeAssignment?.id) {
          await addCompletedDateToAssignment(
            supabase,
            activeAssignment.id,
            proof.proof_date,
          );
        }
      }
    }

    const metadata = parseProofMetadata(proof.metadata);
    if (metadata.conversation_id && feedback) {
      await supabase.from("marketplace_messages").insert({
        conversation_id: metadata.conversation_id,
        organization_id: workspace.organization.id,
        sender_user_id: userId,
        body: feedback,
        message_type: "text",
        metadata: { proofId: proof.id, reviewStatus: input.status },
      });

      await supabase
        .from("marketplace_conversations")
        .update({ last_message_at: now })
        .eq("id", metadata.conversation_id);
    } else if (metadata.conversation_id) {
      await supabase.from("marketplace_messages").insert({
        conversation_id: metadata.conversation_id,
        organization_id: workspace.organization.id,
        sender_user_id: userId,
        body: `Proof ${input.status.replaceAll("_", " ")}.`,
        message_type: "system",
        metadata: { proofId: proof.id, reviewStatus: input.status },
      });

      await supabase
        .from("marketplace_conversations")
        .update({ last_message_at: now })
        .eq("id", metadata.conversation_id);
    }

    await writeWorkspaceAuditLog({
      organizationId: workspace.organization.id,
      userId,
      role: workspace.membership.role,
      action: `coach_network.proof.${input.status}`,
      entityType: "training_proof",
      entityId: proof.id,
    });

    revalidatePath("/coach-network/proofs");
    revalidatePath(`/coach-network/proofs/${proof.id}`);
    revalidatePath("/athlete/proofs");
    revalidatePath(`/athlete/proofs/${proof.id}`);
    revalidatePath("/athlete/home");
    revalidatePath("/coach-network/remote-athletes");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not review proof.",
    };
  }
}

export async function sendProofThreadMessage(
  proofId: string,
  body: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }

  if (trimmed.length > 4000) {
    return { ok: false, error: "Message is too long (max 4000 characters)." };
  }

  try {
    const detail = await getTrainingProofDetail(proofId);
    if (!detail) {
      return { ok: false, error: "Proof not found." };
    }

    const metadata = parseProofMetadata(detail.proof.metadata);
    if (!metadata.conversation_id) {
      return { ok: false, error: "Conversation not available for this proof." };
    }

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("marketplace_messages").insert({
      conversation_id: metadata.conversation_id,
      organization_id: detail.proof.organization_id,
      sender_user_id: userId,
      body: trimmed,
      message_type: "text",
      metadata: { proofId },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    await supabase
      .from("marketplace_conversations")
      .update({ last_message_at: now })
      .eq("id", metadata.conversation_id);

    revalidatePath(`/coach-network/proofs/${proofId}`);
    revalidatePath(`/athlete/proofs/${proofId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send message.",
    };
  }
}
