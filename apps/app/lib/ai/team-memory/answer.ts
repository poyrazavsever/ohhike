import "server-only";

import type {
  RetrievedMemoryDocument,
  TeamMemoryAnswer,
  TeamMemoryQueryContext,
} from "./types";
import { memoryTypeLabel } from "./retrieve";

const PROMPT_VERSION = "team-memory-rag-v1";

function serializeRetrievedDocuments(documents: RetrievedMemoryDocument[]) {
  return JSON.stringify(
    documents.map((document) => ({
      id: document.id,
      type: memoryTypeLabel(document.documentType),
      title: document.title,
      content: document.content.slice(0, 1200),
      created_at: document.createdAt,
    })),
    null,
    2,
  );
}

export function generateTeamMemoryAnswerFromRules(
  context: TeamMemoryQueryContext,
  documents: RetrievedMemoryDocument[],
  retrievalMode: TeamMemoryAnswer["retrieval_mode"],
): TeamMemoryAnswer {
  if (documents.length === 0) {
    return {
      direct_answer:
        "I do not have enough stored team memory to answer that yet. Add athlete observations, team patterns, or generate session AI reports first.",
      supporting_evidence: [],
      recommended_next_actions: [
        {
          action: "Log a team pattern or athlete observation",
          reason: "Builds searchable coaching memory for future questions.",
        },
        {
          action: "Complete a session and generate an AI report",
          reason: "Session summaries become retrievable evidence.",
        },
      ],
      missing_data: [
        "No observations, patterns, AI reports, or check-ins matched this question.",
      ],
      retrieval_mode: retrievalMode,
      model_provider: "rules",
    };
  }

  const top = documents.slice(0, 3);
  const highlights = top
    .map((document) => `• ${document.title}: ${document.content.slice(0, 180)}`)
    .join("\n");

  return {
    direct_answer: `Based on ${documents.length} memory record(s) for ${context.organizationName}${context.teamName ? ` (${context.teamName})` : ""}, the strongest signals are:\n\n${highlights}\n\nAsk a narrower follow-up with a team or athlete filter for more precision.`,
    supporting_evidence: documents.slice(0, 5).map((document) => ({
      document_title: document.title,
      document_type: memoryTypeLabel(document.documentType),
      evidence_summary: document.content.slice(0, 220),
    })),
    recommended_next_actions: [
      {
        action: "Review the cited observations in the registry below",
        reason: "Validate severity and mark resolved items when addressed.",
      },
      {
        action: "Add a follow-up observation after the next session",
        reason: "Keeps the memory trail current for load and tactical trends.",
      },
    ],
    missing_data:
      documents.length < 3
        ? ["Limited memory depth — add more observations or reports."]
        : [],
    retrieval_mode: retrievalMode,
    model_provider: "rules",
  };
}

export async function tryGenerateTeamMemoryAnswerWithGemini(
  context: TeamMemoryQueryContext,
  documents: RetrievedMemoryDocument[],
  retrievalMode: TeamMemoryAnswer["retrieval_mode"],
): Promise<TeamMemoryAnswer | null> {
  const { geminiGenerateJson } = await import("../gemini");

  const result = await geminiGenerateJson({
    systemInstruction: `You are Doctor Panda, the Team Memory assistant inside OhHike CoachOS (${PROMPT_VERSION}).
Answer using ONLY the retrieved memory documents and context. Do not invent data. No medical diagnosis.
Return JSON with keys: direct_answer (string), supporting_evidence (array of {document_title, document_type, evidence_summary}), recommended_next_actions (array of {action, reason}), missing_data (string array).`,
    userText: `User role: ${context.userRole}
Organization: ${context.organizationName}
Team: ${context.teamName ?? "All teams"}
Athlete: ${context.athleteName ?? "All athletes"}

Question:
${context.question}

Retrieved memory:
${serializeRetrievedDocuments(documents)}`,
    temperature: 0.25,
  });

  if (!result.ok) {
    return null;
  }

  try {
    const parsed = JSON.parse(result.text) as Omit<
      TeamMemoryAnswer,
      "retrieval_mode" | "model_provider"
    >;

    if (!parsed.direct_answer?.trim()) {
      return null;
    }

    return {
      direct_answer: parsed.direct_answer,
      supporting_evidence: parsed.supporting_evidence ?? [],
      recommended_next_actions: parsed.recommended_next_actions ?? [],
      missing_data: parsed.missing_data ?? [],
      retrieval_mode: retrievalMode,
      model_provider: "gemini",
    };
  } catch {
    return null;
  }
}

export async function generateTeamMemoryAnswer(
  context: TeamMemoryQueryContext,
  documents: RetrievedMemoryDocument[],
  retrievalMode: TeamMemoryAnswer["retrieval_mode"],
): Promise<TeamMemoryAnswer> {
  const llm =
    (await tryGenerateTeamMemoryAnswerWithGemini(
      context,
      documents,
      retrievalMode,
    )) ??
    generateTeamMemoryAnswerFromRules(context, documents, retrievalMode);

  return llm;
}
