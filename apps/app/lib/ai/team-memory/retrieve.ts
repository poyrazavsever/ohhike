import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../database.types";
import type { MemoryDocumentType, RetrievedMemoryDocument } from "./types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "what",
  "when",
  "who",
  "how",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "from",
  "about",
  "into",
  "your",
  "our",
  "their",
  "bir",
  "ve",
  "ile",
  "için",
  "bu",
  "şu",
  "ne",
  "kim",
  "nasıl",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function recencyBoost(createdAt: string | null) {
  if (!createdAt) {
    return 0;
  }

  const ageDays =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

  return Math.max(0, 12 - ageDays) * 0.15;
}

function keywordScore(content: string, terms: string[]) {
  if (terms.length === 0) {
    return 0.5;
  }

  const haystack = content.toLowerCase();
  let hits = 0;

  for (const term of terms) {
    if (haystack.includes(term)) {
      hits += 1;
    }
  }

  return hits / terms.length;
}

function rankDocuments(
  documents: RetrievedMemoryDocument[],
  question: string,
  limit: number,
) {
  const terms = tokenize(question);

  return documents
    .map((document) => {
      const text = `${document.title}\n${document.content}`;
      const score =
        keywordScore(text, terms) * 4 +
        recencyBoost(document.createdAt) +
        (document.documentType === "team_pattern" ? 0.2 : 0);

      return { ...document, score };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

function athleteLabel(
  athlete: {
    first_name: string;
    last_name: string | null;
    number: number | null;
  } | undefined,
) {
  if (!athlete) {
    return "Unknown athlete";
  }

  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function fetchOrganizationMemoryCorpus(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  filters: { teamId?: string | null; athleteId?: string | null },
): Promise<RetrievedMemoryDocument[]> {
  const teamFilter = filters.teamId ?? undefined;
  const athleteFilter = filters.athleteId ?? undefined;

  const [
    { data: observations },
    { data: patterns },
    { data: reports },
    { data: sessions },
    { data: checkins },
    { data: athletes },
    { data: teams },
  ] = await Promise.all([
    supabase
      .from("athlete_observations")
      .select(
        "id, team_id, athlete_id, title, category, severity, observation, recommendation, created_at",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("team_patterns")
      .select(
        "id, team_id, pattern_type, title, description, severity, status, last_seen_at, created_at",
      )
      .eq("organization_id", organizationId)
      .order("last_seen_at", { ascending: false })
      .limit(40),
    supabase
      .from("ai_reports")
      .select(
        "id, team_id, athlete_id, title, summary, report_type, created_at, risk_alerts",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("sessions")
      .select(
        "id, team_id, title, type, status, coach_notes, scheduled_at, created_at",
      )
      .eq("organization_id", organizationId)
      .in("status", ["completed", "analysis_completed"])
      .order("scheduled_at", { ascending: false })
      .limit(25),
    supabase
      .from("wellness_checkins")
      .select(
        "id, team_id, athlete_id, checkin_date, readiness_score, fatigue, muscle_soreness, stress, mood, notes",
      )
      .eq("organization_id", organizationId)
      .order("checkin_date", { ascending: false })
      .limit(40),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId),
    supabase
      .from("teams")
      .select("id, name")
      .eq("organization_id", organizationId),
  ]);

  const athleteMap = new Map((athletes ?? []).map((row) => [row.id, row]));
  const teamMap = new Map((teams ?? []).map((row) => [row.id, row.name]));

  const documents: RetrievedMemoryDocument[] = [];

  for (const row of observations ?? []) {
    if (teamFilter && row.team_id !== teamFilter) {
      continue;
    }
    if (athleteFilter && row.athlete_id !== athleteFilter) {
      continue;
    }

    const name = athleteLabel(athleteMap.get(row.athlete_id));
    const teamName = teamMap.get(row.team_id) ?? "Team";

    documents.push({
      id: `observation:${row.id}`,
      documentType: "player_observation",
      title: row.title ?? `${name} observation`,
      content: [
        `Athlete: ${name}`,
        `Team: ${teamName}`,
        row.category ? `Category: ${row.category}` : null,
        row.severity ? `Severity: ${row.severity}` : null,
        row.observation,
        row.recommendation ? `Recommendation: ${row.recommendation}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      teamId: row.team_id,
      athleteId: row.athlete_id,
      createdAt: row.created_at,
      score: 0,
    });
  }

  for (const row of patterns ?? []) {
    if (teamFilter && row.team_id !== teamFilter) {
      continue;
    }

    documents.push({
      id: `pattern:${row.id}`,
      documentType: "team_pattern",
      title: row.title,
      content: [
        `Team: ${teamMap.get(row.team_id) ?? "Team"}`,
        `Type: ${row.pattern_type}`,
        row.status ? `Status: ${row.status}` : null,
        row.severity ? `Severity: ${row.severity}` : null,
        row.description ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
      teamId: row.team_id,
      athleteId: null,
      createdAt: row.last_seen_at ?? row.created_at,
      score: 0,
    });
  }

  for (const row of reports ?? []) {
    if (teamFilter && row.team_id && row.team_id !== teamFilter) {
      continue;
    }
    if (athleteFilter && row.athlete_id && row.athlete_id !== athleteFilter) {
      continue;
    }

    const name = row.athlete_id
      ? athleteLabel(athleteMap.get(row.athlete_id))
      : null;

    documents.push({
      id: `ai_report:${row.id}`,
      documentType: "ai_report",
      title: row.title,
      content: [
        row.report_type ? `Type: ${row.report_type}` : null,
        name ? `Athlete: ${name}` : null,
        row.summary ?? "",
        row.risk_alerts
          ? `Risk alerts: ${JSON.stringify(row.risk_alerts).slice(0, 400)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
      teamId: row.team_id,
      athleteId: row.athlete_id,
      createdAt: row.created_at,
      score: 0,
    });
  }

  for (const row of sessions ?? []) {
    if (teamFilter && row.team_id !== teamFilter) {
      continue;
    }
    if (!row.coach_notes?.trim() && !row.title) {
      continue;
    }

    documents.push({
      id: `session:${row.id}`,
      documentType: "session_report",
      title: row.title,
      content: [
        `Team: ${teamMap.get(row.team_id) ?? "Team"}`,
        `Type: ${row.type}`,
        `Status: ${row.status ?? "unknown"}`,
        row.scheduled_at ? `Scheduled: ${row.scheduled_at}` : null,
        row.coach_notes ? `Coach notes: ${row.coach_notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      teamId: row.team_id,
      athleteId: null,
      createdAt: row.scheduled_at ?? row.created_at,
      score: 0,
    });
  }

  for (const row of checkins ?? []) {
    if (teamFilter && row.team_id !== teamFilter) {
      continue;
    }
    if (athleteFilter && row.athlete_id !== athleteFilter) {
      continue;
    }

    const name = athleteLabel(athleteMap.get(row.athlete_id));

    documents.push({
      id: `checkin:${row.id}`,
      documentType: "readiness_summary",
      title: `${name} check-in ${row.checkin_date}`,
      content: [
        `Athlete: ${name}`,
        `Date: ${row.checkin_date}`,
        row.readiness_score != null
          ? `Readiness: ${row.readiness_score}`
          : null,
        row.fatigue != null ? `Fatigue: ${row.fatigue}` : null,
        row.muscle_soreness != null
          ? `Soreness: ${row.muscle_soreness}`
          : null,
        row.stress != null ? `Stress: ${row.stress}` : null,
        row.mood != null ? `Mood: ${row.mood}` : null,
        row.notes ? `Notes: ${row.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      teamId: row.team_id,
      athleteId: row.athlete_id,
      createdAt: row.checkin_date,
      score: 0,
    });
  }

  return documents;
}

export async function retrieveMemoryDocuments(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  question: string,
  filters: { teamId?: string | null; athleteId?: string | null },
  limit = 8,
): Promise<RetrievedMemoryDocument[]> {
  const corpus = await fetchOrganizationMemoryCorpus(
    supabase,
    organizationId,
    filters,
  );

  return rankDocuments(corpus, question, limit);
}

export function memoryTypeLabel(type: MemoryDocumentType) {
  switch (type) {
    case "player_observation":
      return "Athlete observation";
    case "team_pattern":
      return "Team pattern";
    case "ai_report":
      return "AI report";
    case "session_report":
      return "Session note";
    case "readiness_summary":
      return "Readiness check-in";
    default:
      return "Team memory";
  }
}
