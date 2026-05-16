import "server-only";

import type { OrganizationRole } from "./database.types";
import { generateTeamMemoryAnswer } from "./ai/team-memory/answer";
import {
  retrieveMemoryDocumentsByVector,
  syncOrganizationMemoryEmbeddings,
} from "./ai/team-memory/embeddings";
import { retrieveMemoryDocuments } from "./ai/team-memory/retrieve";
import type {
  RetrievedMemoryDocument,
  TeamMemoryAnswer,
  TeamMemoryQueryContext,
} from "./ai/team-memory/types";
import { formatOrganizationRole, isAthleteRole } from "./org-roles";
import { createWorkspaceSupabase } from "./supabase-action";

export type TeamMemoryThreadRow = {
  id: string;
  title: string | null;
  team_id: string | null;
  athlete_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TeamMemoryMessageRow = {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

function mergeRetrievedDocuments(
  keyword: RetrievedMemoryDocument[],
  vector: RetrievedMemoryDocument[],
  limit: number,
) {
  const map = new Map<string, RetrievedMemoryDocument>();

  for (const document of [...vector, ...keyword]) {
    const existing = map.get(document.id);
    if (!existing || document.score > existing.score) {
      map.set(document.id, document);
    }
  }

  return [...map.values()]
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export async function runTeamMemoryQuery(input: {
  organizationId: string;
  organizationName: string;
  userId: string;
  userRole: OrganizationRole;
  question: string;
  teamId?: string | null;
  teamName?: string | null;
  athleteId?: string | null;
  athleteName?: string | null;
}): Promise<{
  answer: TeamMemoryAnswer;
  retrieved: RetrievedMemoryDocument[];
}> {
  if (isAthleteRole(input.userRole)) {
    throw new Error("Athletes cannot use the Team Memory assistant.");
  }

  const supabase = await createWorkspaceSupabase();
  const filters = {
    teamId: input.teamId ?? null,
    athleteId: input.athleteId ?? null,
  };

  await syncOrganizationMemoryEmbeddings(
    supabase,
    input.organizationId,
    input.userId,
  ).catch(() => false);

  const [keywordDocs, vectorDocs] = await Promise.all([
    retrieveMemoryDocuments(
      supabase,
      input.organizationId,
      input.question,
      filters,
      8,
    ),
    retrieveMemoryDocumentsByVector(
      supabase,
      input.organizationId,
      input.question,
      { teamId: filters.teamId },
      6,
    ),
  ]);

  const retrievalMode: TeamMemoryAnswer["retrieval_mode"] =
    vectorDocs.length > 0 && keywordDocs.length > 0
      ? "hybrid"
      : vectorDocs.length > 0
        ? "vector"
        : "keyword";

  const retrieved = mergeRetrievedDocuments(keywordDocs, vectorDocs, 8);

  const context: TeamMemoryQueryContext = {
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    userRole: formatOrganizationRole(input.userRole),
    teamId: filters.teamId,
    teamName: input.teamName ?? null,
    athleteId: filters.athleteId,
    athleteName: input.athleteName ?? null,
    question: input.question,
  };

  const answer = await generateTeamMemoryAnswer(
    context,
    retrieved,
    retrievalMode,
  );

  return { answer, retrieved };
}

export function formatAssistantAnswerForChat(answer: TeamMemoryAnswer) {
  const sections = [answer.direct_answer];

  if (answer.recommended_next_actions.length > 0) {
    sections.push(
      "\n\nRecommended next steps:\n" +
        answer.recommended_next_actions
          .map((item) => `• ${item.action} — ${item.reason}`)
          .join("\n"),
    );
  }

  if (answer.missing_data.length > 0) {
    sections.push(
      "\n\nMissing data:\n" + answer.missing_data.map((item) => `• ${item}`).join("\n"),
    );
  }

  return sections.join("");
}
