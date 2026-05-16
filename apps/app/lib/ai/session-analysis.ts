import "server-only";

import type { Tables } from "../database.types";
import {
  absenceReasonLabel,
  bodyPainAreaLabel,
  sessionFocusAreaLabel,
  sessionPlannedIntensityLabel,
} from "../coach-vocabulary";

type SessionRow = Tables<"sessions">;
type AttendanceRow = Tables<"session_attendance">;
type BlockRow = Tables<"training_blocks">;
type CheckinRow = Tables<"wellness_checkins">;

export type SessionAnalysisAthlete = {
  id: string;
  label: string;
};

export type SessionAnalysisContext = {
  organizationName: string;
  teamName: string;
  sportType: string | null;
  session: SessionRow;
  athletes: SessionAnalysisAthlete[];
  attendance: Array<
    AttendanceRow & {
      athleteLabel: string;
    }
  >;
  trainingBlocks: BlockRow[];
  recentCheckins: Array<
    CheckinRow & {
      athleteLabel: string;
    }
  >;
};

export type SessionAnalysisObservation = {
  category: string;
  observation: string;
  evidence: string;
  severity: "low" | "medium" | "high";
};

export type SessionAnalysisAthleteObservation = {
  athlete_reference: string;
  observation: string;
  evidence: string;
  severity: "low" | "medium" | "high";
};

export type SessionAnalysisOutput = {
  title: string;
  summary: string;
  confidence_score: number;
  tactical_observations: SessionAnalysisObservation[];
  athlete_observations: SessionAnalysisAthleteObservation[];
  load_observations: SessionAnalysisObservation[];
  risk_alerts: SessionAnalysisObservation[];
  recommended_drills: Array<{ title: string; reason: string }>;
  next_training_plan: {
    focus: string;
    notes: string;
  };
  missing_data: string[];
};

const PROMPT_VERSION = "session-analysis-v3-mvp";

function formatSessionType(type: string) {
  return type
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function average(numbers: number[]) {
  if (numbers.length === 0) {
    return null;
  }

  return Math.round(
    numbers.reduce((total, value) => total + value, 0) / numbers.length,
  );
}

function athleteLabelFromParts(
  firstName: string,
  lastName: string | null,
  number: number | null,
) {
  return [number ? `#${number}` : null, firstName, lastName]
    .filter(Boolean)
    .join(" ");
}

export function buildSessionAnalysisContext(input: {
  organizationName: string;
  team: Pick<Tables<"teams">, "name" | "sport_type">;
  session: SessionRow;
  athletes: Array<
    Pick<Tables<"athletes">, "id" | "first_name" | "last_name" | "number">
  >;
  attendance: AttendanceRow[];
  trainingBlocks: BlockRow[];
  checkins: CheckinRow[];
}): SessionAnalysisContext {
  const athleteMap = new Map(
    input.athletes.map((athlete) => [
      athlete.id,
      athleteLabelFromParts(
        athlete.first_name,
        athlete.last_name,
        athlete.number,
      ),
    ]),
  );

  return {
    organizationName: input.organizationName,
    teamName: input.team.name,
    sportType: input.team.sport_type,
    session: input.session,
    athletes: input.athletes.map((athlete) => ({
      id: athlete.id,
      label: athleteMap.get(athlete.id) ?? athlete.first_name,
    })),
    attendance: input.attendance.map((entry) => ({
      ...entry,
      athleteLabel: athleteMap.get(entry.athlete_id) ?? "Unknown athlete",
    })),
    trainingBlocks: input.trainingBlocks,
    recentCheckins: input.checkins.map((checkin) => ({
      ...checkin,
      athleteLabel: athleteMap.get(checkin.athlete_id) ?? "Unknown athlete",
    })),
  };
}

export function generateSessionAnalysisFromContext(
  context: SessionAnalysisContext,
): SessionAnalysisOutput {
  const { session, attendance, trainingBlocks, recentCheckins } = context;
  const missing_data: string[] = [];

  const present = attendance.filter((entry) => entry.attended);
  const absent = attendance.filter((entry) => !entry.attended);
  const rpeValues = present
    .map((entry) => entry.rpe)
    .filter((value): value is number => value != null);
  const avgRpe = average(rpeValues);
  const highRpe = present.filter((entry) => (entry.rpe ?? 0) >= 8);
  const painEntries = present.filter((entry) => entry.pain_reported);
  const completedBlocks = trainingBlocks.filter((block) => block.completed);

  if (attendance.length === 0) {
    missing_data.push("No attendance records were captured for this session.");
  }

  if (rpeValues.length === 0) {
    missing_data.push("No RPE values were logged for attending athletes.");
  }

  if (recentCheckins.length === 0) {
    missing_data.push("No recent wellness check-ins for this team.");
  }

  const readinessScores = recentCheckins
    .map((checkin) => checkin.readiness_score)
    .filter((value): value is number => value != null);
  const avgReadiness = average(readinessScores);

  const tactical_observations: SessionAnalysisObservation[] = [];
  const athlete_observations: SessionAnalysisAthleteObservation[] = [];
  const load_observations: SessionAnalysisObservation[] = [];
  const risk_alerts: SessionAnalysisObservation[] = [];

  if (session.focus_area) {
    tactical_observations.push({
      category: "tactical",
      observation: `Session focus was ${sessionFocusAreaLabel(session.focus_area)}.`,
      evidence: `Focus area set on the session plan.`,
      severity: "low",
    });
  }

  if (session.coach_notes) {
    tactical_observations.push({
      category: "other",
      observation: "Coach notes highlight areas to review in the next micro-cycle.",
      evidence: session.coach_notes.slice(0, 240),
      severity: "medium",
    });
  }

  if (absent.length > 0) {
    tactical_observations.push({
      category: "behavioral",
      observation: `${absent.length} athlete(s) were marked absent.`,
      evidence: absent
        .map(
          (entry) =>
            `${entry.athleteLabel}${
              entry.absence_reason
                ? ` (${absenceReasonLabel(entry.absence_reason)})`
                : ""
            }`,
        )
        .join("; "),
      severity: absent.length >= 3 ? "high" : "medium",
    });
  }

  if (avgRpe != null) {
    load_observations.push({
      category: "physical",
      observation: `Average session RPE was ${avgRpe}/10 across ${rpeValues.length} athlete(s).`,
      evidence: `Computed from attendance RPE entries.`,
      severity: avgRpe >= 8 ? "high" : avgRpe >= 6 ? "medium" : "low",
    });
  }

  for (const entry of highRpe) {
    athlete_observations.push({
      athlete_reference: entry.athleteLabel,
      observation: "Reported a high session load (RPE 8+).",
      evidence: `RPE ${entry.rpe}, minutes ${entry.minutes_played ?? "not set"}.`,
      severity: (entry.rpe ?? 0) >= 9 ? "high" : "medium",
    });
  }

  for (const entry of painEntries) {
    risk_alerts.push({
      category: "readiness",
      observation: `${entry.athleteLabel} reported pain during or after the session.`,
      evidence: bodyPainAreaLabel(entry.pain_area) || "Pain flagged without area.",
      severity: "high",
    });
  }

  if (avgReadiness != null && avgReadiness < 60) {
    risk_alerts.push({
      category: "readiness",
      observation: `Team readiness average is ${avgReadiness}/100 ahead of this session window.`,
      evidence: `Based on ${readinessScores.length} recent check-in(s).`,
      severity: avgReadiness < 50 ? "high" : "medium",
    });
  }

  const highFatigue = recentCheckins.filter(
    (checkin) => (checkin.fatigue ?? 0) >= 7,
  );
  for (const checkin of highFatigue.slice(0, 3)) {
    athlete_observations.push({
      athlete_reference: checkin.athleteLabel,
      observation: "Recent wellness check-in shows elevated fatigue.",
      evidence: `Fatigue ${checkin.fatigue ?? "?"}/10 on ${checkin.checkin_date}.`,
      severity: "medium",
    });
  }

  const recommended_drills: Array<{ title: string; reason: string }> = [];

  if (session.focus_area) {
    recommended_drills.push({
      title: `Drills tagged for ${sessionFocusAreaLabel(session.focus_area)}`,
      reason: "Review your drill library for blocks that reinforce this session focus.",
    });
  }

  if (highRpe.length > 0) {
    recommended_drills.push({
      title: "Recovery and regeneration block",
      reason: "Several athletes reported high RPE; plan a lighter follow-up day.",
    });
  }

  const intensityLabel = sessionPlannedIntensityLabel(session.planned_intensity);
  const summaryParts = [
    `${formatSessionType(session.type)} for ${context.teamName} is recorded as ${session.status ?? "planned"}.`,
    present.length > 0
      ? `${present.length} athlete(s) attended${avgRpe != null ? ` with average RPE ${avgRpe}/10` : ""}.`
      : "Attendance has not been logged yet.",
    completedBlocks.length > 0
      ? `${completedBlocks.length} of ${trainingBlocks.length} training block(s) marked complete.`
      : trainingBlocks.length > 0
        ? `${trainingBlocks.length} training block(s) are on the plan.`
        : null,
    session.planned_intensity
      ? `Planned intensity was ${intensityLabel}.`
      : null,
    avgReadiness != null
      ? `Recent team readiness average: ${avgReadiness}/100.`
      : null,
    missing_data.length > 0
      ? "Some data gaps remain — treat recommendations as directional, not definitive."
      : "Use this summary as a coaching checkpoint before the next session.",
  ].filter(Boolean);

  const confidenceBase = 0.55;
  const confidenceBonus =
    (attendance.length > 0 ? 0.15 : 0) +
    (rpeValues.length > 0 ? 0.15 : 0) +
    (recentCheckins.length > 0 ? 0.1 : 0) +
    (session.coach_notes ? 0.05 : 0);

  return {
    title: `Session analysis — ${session.title}`,
    summary: summaryParts.join(" "),
    confidence_score: Math.min(
      Number((confidenceBase + confidenceBonus).toFixed(2)),
      0.92,
    ),
    tactical_observations,
    athlete_observations,
    load_observations,
    risk_alerts,
    recommended_drills,
    next_training_plan: {
      focus: session.focus_area
        ? sessionFocusAreaLabel(session.focus_area)
        : "Review priority themes from this session",
      notes:
        highRpe.length > 0
          ? "Monitor high-RPE athletes in the next 48 hours and adjust volume if needed."
          : "Confirm attendance and RPE are captured while the session is still fresh.",
    },
    missing_data,
  };
}

export function serializeContextForLlm(context: SessionAnalysisContext): string {
  const { session } = context;

  return JSON.stringify(
    {
      organization: context.organizationName,
      team: context.teamName,
      sport_type: context.sportType,
      session: {
        title: session.title,
        type: session.type,
        status: session.status,
        focus_area: session.focus_area,
        planned_intensity: session.planned_intensity,
        planned_duration_min: session.planned_duration_min,
        coach_notes: session.coach_notes,
        scheduled_at: session.scheduled_at,
      },
      attendance: context.attendance.map((entry) => ({
        athlete: entry.athleteLabel,
        attended: entry.attended,
        absence_reason: entry.absence_reason,
        minutes_played: entry.minutes_played,
        rpe: entry.rpe,
        pain_reported: entry.pain_reported,
        pain_area: entry.pain_area,
      })),
      training_blocks: context.trainingBlocks.map((block) => ({
        title: block.title,
        completed: block.completed,
        planned_duration_min: block.planned_duration_min,
      })),
      recent_checkins: context.recentCheckins.map((checkin) => ({
        athlete: checkin.athleteLabel,
        date: checkin.checkin_date,
        readiness_score: checkin.readiness_score,
        fatigue: checkin.fatigue,
        muscle_soreness: checkin.muscle_soreness,
        sleep_hours: checkin.sleep_hours,
      })),
    },
    null,
    2,
  );
}

export async function tryGenerateSessionAnalysisWithGemini(
  context: SessionAnalysisContext,
): Promise<SessionAnalysisOutput | null> {
  const { geminiGenerateJson } = await import("./gemini");

  const content = await geminiGenerateJson({
    systemInstruction:
      "You are Doctor Panda, the AI coaching intelligence assistant for OhHike CoachOS. Analyze session data and return JSON only. Do not invent unsupported facts. Do not provide medical diagnosis. Use severity low|medium|high. Include missing_data array when context is incomplete.",
    userText: `Analyze this session and return JSON with keys: title, summary, confidence_score (0-1), tactical_observations[], athlete_observations[], load_observations[], risk_alerts[], recommended_drills[{title,reason}], next_training_plan{focus,notes}, missing_data[].

Session data:
${serializeContextForLlm(context)}`,
    temperature: 0.3,
  });

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as SessionAnalysisOutput;

    if (!parsed.summary || !parsed.title) {
      return null;
    }

    return {
      ...generateSessionAnalysisFromContext(context),
      ...parsed,
      confidence_score: Math.min(Math.max(parsed.confidence_score ?? 0.7, 0), 1),
    };
  } catch {
    return null;
  }
}

export function getSessionAnalysisPromptVersion() {
  return PROMPT_VERSION;
}
