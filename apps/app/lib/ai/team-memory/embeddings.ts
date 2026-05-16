import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, DocumentType } from "../../database.types";
import type { RetrievedMemoryDocument } from "./types";
import { fetchOrganizationMemoryCorpus } from "./retrieve";

const EMBEDDING_MODEL = "text-embedding-3-small";
const CHUNK_SIZE = 900;

async function createEmbedding(text: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };

  return payload.data?.[0]?.embedding ?? null;
}

function mapDocumentType(type: RetrievedMemoryDocument["documentType"]) {
  switch (type) {
    case "player_observation":
      return "player_observation";
    case "team_pattern":
      return "team_pattern";
    case "ai_report":
      return "ai_report";
    case "session_report":
      return "session_report";
    case "readiness_summary":
      return "recovery_note";
    default:
      return "other";
  }
}

export async function syncOrganizationMemoryEmbeddings(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return false;
  }

  const corpus = await fetchOrganizationMemoryCorpus(supabase, organizationId, {});

  for (const memory of corpus.slice(0, 60)) {
    const sourceKey = memory.id;
    const { data: existing } = await supabase
      .from("documents")
      .select("id")
      .eq("organization_id", organizationId)
      .contains("metadata", { source_key: sourceKey })
      .maybeSingle();

    if (existing) {
      continue;
    }

    const content = `${memory.title}\n\n${memory.content}`.trim();
    const chunk = content.slice(0, CHUNK_SIZE);
    const embedding = await createEmbedding(chunk, apiKey);

    if (!embedding) {
      continue;
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        organization_id: organizationId,
        team_id: memory.teamId,
        athlete_id: memory.athleteId,
        type: mapDocumentType(memory.documentType) as DocumentType,
        title: memory.title,
        content,
        created_by: userId,
        metadata: { source_key: sourceKey },
      })
      .select("id")
      .single();

    if (documentError || !document) {
      continue;
    }

    await supabase.from("document_embeddings").insert({
      document_id: document.id,
      organization_id: organizationId,
      team_id: memory.teamId,
      chunk_index: 0,
      content_chunk: chunk,
      embedding: embedding as never,
    });
  }

  return true;
}

export async function retrieveMemoryDocumentsByVector(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  question: string,
  filters: { teamId?: string | null },
  limit = 8,
): Promise<RetrievedMemoryDocument[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return [];
  }

  const embedding = await createEmbedding(question, apiKey);

  if (!embedding) {
    return [];
  }

  const { data, error } = await supabase.rpc("match_document_embeddings", {
    query_embedding: embedding as never,
    match_organization_id: organizationId,
    match_team_id: filters.teamId ?? undefined,
    match_count: limit,
  });

  if (error || !data?.length) {
    return [];
  }

  const documentIds = [...new Set(data.map((row) => row.document_id))];
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, content, type, team_id, athlete_id, created_at, metadata")
    .in("id", documentIds);

  const documentMap = new Map((documents ?? []).map((row) => [row.id, row]));

  const results: RetrievedMemoryDocument[] = [];

  for (const row of data) {
    const document = documentMap.get(row.document_id);
    if (!document) {
      continue;
    }

    const sourceKey =
      typeof document.metadata === "object" &&
      document.metadata &&
      "source_key" in document.metadata &&
      typeof document.metadata.source_key === "string"
        ? document.metadata.source_key
        : `document:${document.id}`;

    results.push({
      id: sourceKey,
      documentType: "other",
      title: document.title,
      content: row.content_chunk || document.content,
      teamId: document.team_id,
      athleteId: document.athlete_id,
      createdAt: document.created_at,
      score: row.similarity ?? 0,
    });
  }

  return results;
}
