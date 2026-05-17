import type { Json, Tables } from "../database.types";

export type CoachingProgramMetadata = {
  completed_dates?: string[];
  /** Shown on athlete “today” card when set */
  daily_focus?: string;
};

export type ProgramAdherence = {
  completedDays: number;
  totalDays: number;
  percent: number | null;
};

export type TodayProgramView = {
  date: string;
  inWindow: boolean;
  completedToday: boolean;
  focus: string | null;
};

type AssignmentRow = Pick<
  Tables<"coaching_program_assignments">,
  "starts_at" | "ends_at" | "program_metadata" | "status" | "title" | "description"
>;

export function parseCoachingProgramMetadata(
  value: Json | null,
): CoachingProgramMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const completedDates = Array.isArray(record.completed_dates)
    ? record.completed_dates.filter((d): d is string => typeof d === "string")
    : undefined;

  return {
    completed_dates: completedDates,
    daily_focus:
      typeof record.daily_focus === "string" ? record.daily_focus : undefined,
  };
}

export function toIsoDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value: string) {
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date(NaN);
  }
  return new Date(Date.UTC(year, month - 1, day));
}

export function countDaysInclusive(start: string, end: string) {
  const startMs = parseIsoDate(start).getTime();
  const endMs = parseIsoDate(end).getTime();
  if (endMs < startMs) {
    return 0;
  }
  return Math.floor((endMs - startMs) / 86_400_000) + 1;
}

export function isDateWithinAssignment(
  date: string,
  startsAt: string | null,
  endsAt: string | null,
) {
  if (!startsAt || !endsAt) {
    return false;
  }
  return date >= startsAt && date <= endsAt;
}

export function computeProgramAdherence(
  assignment: AssignmentRow,
  asOf: Date = new Date(),
): ProgramAdherence {
  if (assignment.status !== "active" || !assignment.starts_at || !assignment.ends_at) {
    return { completedDays: 0, totalDays: 0, percent: null };
  }

  const metadata = parseCoachingProgramMetadata(assignment.program_metadata);
  const completedInRange = (metadata.completed_dates ?? []).filter((date) =>
    isDateWithinAssignment(date, assignment.starts_at, assignment.ends_at),
  );

  const today = toIsoDateString(asOf);
  const effectiveEnd =
    assignment.ends_at < today ? assignment.ends_at : today < assignment.starts_at
      ? assignment.starts_at
      : today;

  const totalDays = countDaysInclusive(assignment.starts_at, effectiveEnd);
  const completedDays = completedInRange.length;
  const percent =
    totalDays > 0 ? Math.min(100, Math.round((completedDays / totalDays) * 100)) : null;

  return { completedDays, totalDays, percent };
}

export function getTodayProgramView(
  assignment: AssignmentRow,
  asOf: Date = new Date(),
): TodayProgramView {
  const today = toIsoDateString(asOf);
  const metadata = parseCoachingProgramMetadata(assignment.program_metadata);
  const inWindow = isDateWithinAssignment(
    today,
    assignment.starts_at,
    assignment.ends_at,
  );
  const completedToday = (metadata.completed_dates ?? []).includes(today);

  const focus =
    metadata.daily_focus?.trim() ||
    assignment.description?.trim() ||
    assignment.title ||
    null;

  return {
    date: today,
    inWindow,
    completedToday,
    focus: inWindow ? focus : null,
  };
}
