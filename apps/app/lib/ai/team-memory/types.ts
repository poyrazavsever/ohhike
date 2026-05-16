export type MemoryDocumentType =
  | "player_observation"
  | "team_pattern"
  | "ai_report"
  | "session_report"
  | "readiness_summary"
  | "other";

export type RetrievedMemoryDocument = {
  id: string;
  documentType: MemoryDocumentType;
  title: string;
  content: string;
  teamId: string | null;
  athleteId: string | null;
  createdAt: string | null;
  score: number;
};

export type TeamMemoryEvidence = {
  document_title: string;
  document_type: string;
  evidence_summary: string;
};

export type TeamMemoryNextAction = {
  action: string;
  reason: string;
};

export type TeamMemoryAnswer = {
  direct_answer: string;
  supporting_evidence: TeamMemoryEvidence[];
  recommended_next_actions: TeamMemoryNextAction[];
  missing_data: string[];
  retrieval_mode: "vector" | "keyword" | "hybrid";
  model_provider: "openai" | "rules";
};

export type TeamMemoryQueryContext = {
  organizationId: string;
  organizationName: string;
  userRole: string;
  teamId: string | null;
  teamName: string | null;
  athleteId: string | null;
  athleteName: string | null;
  question: string;
};
