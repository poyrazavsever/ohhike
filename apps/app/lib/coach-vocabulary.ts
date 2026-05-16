/**
 * Controlled vocabularies for coach-facing forms.
 * Values are stored as short snake_case strings in varchar columns until DB enums migrate.
 */

export const DRILL_CATEGORY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "warm_up", label: "Warm up" },
  { value: "technical", label: "Technical" },
  { value: "tactical", label: "Tactical" },
  { value: "physical", label: "Physical / conditioning" },
  { value: "recovery", label: "Recovery" },
  { value: "speed_agility", label: "Speed & agility" },
  { value: "goalkeeping", label: "Goalkeeping" },
  { value: "shooting", label: "Shooting" },
  { value: "small_sided_game", label: "Small-sided game" },
  { value: "cool_down", label: "Cool down" },
  { value: "other", label: "Other" },
] as const;

export const DRILL_DIFFICULTY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "beginner", label: "Beginner" },
  { value: "easy", label: "Easy" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
] as const;

/** Preset equipment; use __custom__ for free-text detail in the drill form. */
export const DRILL_EQUIPMENT_PRESETS = [
  { value: "", label: "Not specified" },
  { value: "cones", label: "Cones" },
  { value: "balls", label: "Balls" },
  { value: "goals", label: "Goals / nets" },
  { value: "markers", label: "Markers / discs" },
  { value: "hurdles", label: "Hurdles / mini hurdles" },
  { value: "ladder", label: "Agility ladder" },
  { value: "resistance_bands", label: "Resistance bands" },
  { value: "sled", label: "Sled / prowler" },
  { value: "weights", label: "Weights / dumbbells" },
  { value: "timer", label: "Timer" },
  { value: "whistle", label: "Whistle" },
  { value: "__custom__", label: "Custom (describe below)" },
] as const;

export const OBSERVATION_CATEGORY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "wellness", label: "Wellness / readiness" },
  { value: "injury", label: "Injury / pain" },
  { value: "load", label: "Load / fatigue" },
  { value: "behavior", label: "Behavior / mindset" },
  { value: "technique", label: "Technique" },
  { value: "tactics", label: "Tactics" },
  { value: "nutrition", label: "Nutrition / hydration" },
  { value: "sleep", label: "Sleep" },
  { value: "social", label: "Team / social" },
  { value: "other", label: "Other" },
] as const;

export const MEMORY_SEVERITY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "info", label: "Info" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

export const TEAM_PATTERN_TYPE_OPTIONS = [
  { value: "tactical", label: "Tactical" },
  { value: "physical", label: "Physical" },
  { value: "technical", label: "Technical" },
  { value: "mental", label: "Mental" },
  { value: "recovery", label: "Recovery" },
  { value: "culture", label: "Culture / cohesion" },
  { value: "performance_trend", label: "Performance trend" },
  { value: "other", label: "Other" },
] as const;

const drillCategorySlugs = new Set<string>(
  DRILL_CATEGORY_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
);
const drillDifficultySlugs = new Set<string>(
  DRILL_DIFFICULTY_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
);
const drillEquipmentPresetSlugs = new Set<string>(
  DRILL_EQUIPMENT_PRESETS.map((o) => o.value).filter(
    (v) => v !== "" && v !== "__custom__",
  ),
);
const observationCategorySlugs = new Set<string>(
  OBSERVATION_CATEGORY_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
);
const memorySeveritySlugs = new Set<string>(
  MEMORY_SEVERITY_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
);
const teamPatternTypeSlugs = new Set<string>(
  TEAM_PATTERN_TYPE_OPTIONS.map((o) => o.value),
);

export function isOptionalDrillCategory(value: string | null | undefined): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return drillCategorySlugs.has(v);
}

export function isOptionalDrillDifficulty(value: string | null | undefined): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return drillDifficultySlugs.has(v);
}

/** Equipment after merge: empty, a preset key, or custom prose (any non-empty string). */
export function isDrillEquipmentValue(value: string | null | undefined): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  if (drillEquipmentPresetSlugs.has(v)) {
    return true;
  }
  return v.length <= 2000;
}

export function isOptionalObservationCategory(
  value: string | null | undefined,
): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return observationCategorySlugs.has(v);
}

export function isOptionalMemorySeverity(value: string | null | undefined): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return memorySeveritySlugs.has(v);
}

export function isTeamPatternType(value: string | null | undefined): boolean {
  const v = (value ?? "").trim();
  return teamPatternTypeSlugs.has(v);
}

export function drillCategoryLabel(value: string | null | undefined): string {
  if (!value) {
    return "No category";
  }
  const found = DRILL_CATEGORY_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function drillDifficultyLabel(value: string | null | undefined): string {
  if (!value) {
    return "No difficulty";
  }
  const found = DRILL_DIFFICULTY_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function memorySeverityLabel(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }
  const found = MEMORY_SEVERITY_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function teamPatternTypeLabel(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }
  const found = TEAM_PATTERN_TYPE_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function observationCategoryLabel(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Not set";
  }
  const found = OBSERVATION_CATEGORY_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}
