import type { Json } from "./database.types";

export type ParsedObservation = {
  category?: string;
  observation: string;
  evidence?: string;
  severity?: string;
  athlete_reference?: string;
};

export type ParsedDrill = {
  title: string;
  reason?: string;
};

export type ParsedTrainingPlan = {
  focus?: string;
  notes?: string;
};

function asArray(value: Json | null): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseObservationList(value: Json | null): ParsedObservation[] {
  const items: ParsedObservation[] = [];

  for (const entry of asArray(value)) {
    const record = asRecord(entry);
    if (!record || typeof record.observation !== "string") {
      continue;
    }

    items.push({
      category:
        typeof record.category === "string" ? record.category : undefined,
      observation: record.observation,
      evidence:
        typeof record.evidence === "string" ? record.evidence : undefined,
      severity:
        typeof record.severity === "string" ? record.severity : undefined,
      athlete_reference:
        typeof record.athlete_reference === "string"
          ? record.athlete_reference
          : undefined,
    });
  }

  return items;
}

export function parseDrillList(value: Json | null): ParsedDrill[] {
  const items: ParsedDrill[] = [];

  for (const entry of asArray(value)) {
    const record = asRecord(entry);
    if (!record || typeof record.title !== "string") {
      continue;
    }

    items.push({
      title: record.title,
      reason: typeof record.reason === "string" ? record.reason : undefined,
    });
  }

  return items;
}

export function parseTrainingPlan(value: Json | null): ParsedTrainingPlan | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  return {
    focus: typeof record.focus === "string" ? record.focus : undefined,
    notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}

export function formatModelProvider(value: string | null) {
  if (!value) {
    return "manual";
  }

  if (value === "gemini") {
    return "Gemini";
  }

  if (value === "rules") {
    return "Rule-based";
  }

  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function severityTone(severity: string | undefined) {
  switch (severity) {
    case "high":
      return "bg-destructive-soft text-destructive-foreground";
    case "medium":
      return "bg-warning-soft text-warning-foreground";
    default:
      return "bg-primary-soft text-primary-700";
  }
}
