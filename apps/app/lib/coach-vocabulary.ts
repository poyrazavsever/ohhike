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

/** Planned session / block intensity on a 1–10 RPE-style scale (stored as integer). */
export const SESSION_PLANNED_INTENSITY_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "1", label: "1 — Very light" },
  { value: "2", label: "2 — Light" },
  { value: "3", label: "3 — Light–moderate" },
  { value: "4", label: "4 — Moderate-" },
  { value: "5", label: "5 — Moderate" },
  { value: "6", label: "6 — Moderate+" },
  { value: "7", label: "7 — Hard" },
  { value: "8", label: "8 — Very hard" },
  { value: "9", label: "9 — Extremely hard" },
  { value: "10", label: "10 — Max effort" },
] as const;

export const SESSION_FOCUS_AREA_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "warm_up_structure", label: "Warm-up structure" },
  { value: "possession", label: "Possession / control" },
  { value: "pressing_defending", label: "Pressing & defending" },
  { value: "low_block", label: "Low block / compactness" },
  { value: "transition_attack", label: "Transition to attack" },
  { value: "transition_defense", label: "Transition to defense" },
  { value: "set_pieces_attack", label: "Set pieces (attacking)" },
  { value: "set_pieces_defense", label: "Set pieces (defending)" },
  { value: "counter_attack", label: "Counterattack" },
  { value: "build_up", label: "Build-up / progression" },
  { value: "finishing", label: "Finishing / final third" },
  { value: "width_depth", label: "Width & depth" },
  { value: "conditioning", label: "Physical conditioning" },
  { value: "speed_agility", label: "Speed & agility" },
  { value: "strength_power", label: "Strength & power" },
  { value: "technical_emphasis", label: "Technical emphasis" },
  { value: "recovery_regeneration", label: "Recovery / regeneration" },
  { value: "match_preparation", label: "Match preparation" },
  { value: "video_review", label: "Video / analysis" },
  { value: "team_cohesion", label: "Team cohesion / culture" },
  { value: "gk_specific", label: "Goalkeeper-specific" },
  { value: "individual_development", label: "Individual development" },
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
const sessionFocusAreaSlugs = new Set<string>(
  SESSION_FOCUS_AREA_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
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

export function isOptionalSessionFocusArea(
  value: string | null | undefined,
): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return sessionFocusAreaSlugs.has(v);
}

/**
 * Select options including the current value when it is legacy / not in the vocabulary.
 */
export function sessionFocusAreaSelectOptions(
  currentValue: string | null | undefined,
): Array<{ value: string; label: string }> {
  const base: Array<{ value: string; label: string }> = [
    ...SESSION_FOCUS_AREA_OPTIONS,
  ];
  const v = (currentValue ?? "").trim();
  if (v && !base.some((o) => o.value === v)) {
    base.push({ value: v, label: v });
  }
  return base;
}

export function sessionPlannedIntensitySelectOptions(
  currentValue: string | null | undefined,
): Array<{ value: string; label: string }> {
  const base: Array<{ value: string; label: string }> = [
    ...SESSION_PLANNED_INTENSITY_OPTIONS,
  ];
  const v = (currentValue ?? "").trim();
  if (v && !base.some((o) => o.value === v)) {
    base.push({ value: v, label: `Legacy (${v})` });
  }
  return base;
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

export function sessionFocusAreaLabel(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }
  const found = SESSION_FOCUS_AREA_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function sessionPlannedIntensityLabel(
  value: number | null | undefined,
): string {
  if (value == null) {
    return "Not set";
  }
  const key = String(value);
  const found = SESSION_PLANNED_INTENSITY_OPTIONS.find((o) => o.value === key);
  return found?.label ?? `${key} (legacy)`;
}

/** Session RPE uses the same 1–10 scale as planned intensity. */
export const SESSION_RPE_OPTIONS = SESSION_PLANNED_INTENSITY_OPTIONS;

export const ABSENCE_REASON_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "illness", label: "Illness / sick" },
  { value: "injury", label: "Injury" },
  { value: "recovery", label: "Recovery / load management" },
  { value: "school", label: "School / exams" },
  { value: "work", label: "Work / commitments" },
  { value: "travel", label: "Travel" },
  { value: "personal", label: "Personal / family" },
  { value: "unexcused", label: "Unexcused" },
  { value: "suspension", label: "Suspension / discipline" },
  { value: "national_team", label: "National / representative duty" },
  { value: "other", label: "Other" },
] as const;

export const BODY_PAIN_AREA_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "head", label: "Head" },
  { value: "neck", label: "Neck" },
  { value: "shoulder", label: "Shoulder" },
  { value: "upper_back", label: "Upper back" },
  { value: "lower_back", label: "Lower back" },
  { value: "chest", label: "Chest" },
  { value: "abdomen", label: "Abdomen / core" },
  { value: "hip", label: "Hip" },
  { value: "groin", label: "Groin" },
  { value: "quad", label: "Quadriceps" },
  { value: "hamstring", label: "Hamstring" },
  { value: "knee", label: "Knee" },
  { value: "calf", label: "Calf" },
  { value: "ankle", label: "Ankle" },
  { value: "foot", label: "Foot" },
  { value: "arm", label: "Arm / elbow" },
  { value: "wrist", label: "Wrist / hand" },
  { value: "general", label: "General / multiple areas" },
  { value: "other", label: "Other" },
] as const;

const absenceReasonSlugs = new Set<string>(
  ABSENCE_REASON_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
);
const bodyPainAreaSlugs = new Set<string>(
  BODY_PAIN_AREA_OPTIONS.map((o) => o.value).filter((v) => v !== ""),
);

export function isOptionalAbsenceReason(
  value: string | null | undefined,
): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return absenceReasonSlugs.has(v);
}

export function isOptionalBodyPainArea(
  value: string | null | undefined,
): boolean {
  const v = (value ?? "").trim();
  if (!v) {
    return true;
  }
  return bodyPainAreaSlugs.has(v);
}

export function absenceReasonSelectOptions(
  currentValue: string | null | undefined,
): Array<{ value: string; label: string }> {
  const base: Array<{ value: string; label: string }> = [...ABSENCE_REASON_OPTIONS];
  const v = (currentValue ?? "").trim();
  if (v && !base.some((o) => o.value === v)) {
    base.push({ value: v, label: v });
  }
  return base;
}

export function bodyPainAreaSelectOptions(
  currentValue: string | null | undefined,
): Array<{ value: string; label: string }> {
  const base: Array<{ value: string; label: string }> = [...BODY_PAIN_AREA_OPTIONS];
  const v = (currentValue ?? "").trim();
  if (v && !base.some((o) => o.value === v)) {
    base.push({ value: v, label: v });
  }
  return base;
}

export function absenceReasonLabel(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }
  const found = ABSENCE_REASON_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function bodyPainAreaLabel(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }
  const found = BODY_PAIN_AREA_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function sessionRpeLabel(value: number | null | undefined): string {
  return sessionPlannedIntensityLabel(value);
}

export const PERSONAL_TRAINING_TYPE_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio / conditioning" },
  { value: "technical", label: "Technical skills" },
  { value: "recovery", label: "Recovery / mobility" },
  { value: "skills", label: "Individual skills" },
  { value: "gym", label: "Gym / weights" },
  { value: "other", label: "Other" },
] as const;

export function isOptionalPersonalTrainingType(value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned) {
    return true;
  }
  return PERSONAL_TRAINING_TYPE_OPTIONS.some(
    (option) => option.value === cleaned,
  );
}

export function personalTrainingTypeSelectOptions(currentValue?: string) {
  const base: Array<{ value: string; label: string }> = [
    ...PERSONAL_TRAINING_TYPE_OPTIONS,
  ];
  const value = (currentValue ?? "").trim();
  if (value && !base.some((option) => option.value === value)) {
    base.push({ value, label: value });
  }
  return base;
}

export function personalTrainingTypeLabel(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }
  const found = PERSONAL_TRAINING_TYPE_OPTIONS.find(
    (option) => option.value === value,
  );
  return found?.label ?? value;
}
