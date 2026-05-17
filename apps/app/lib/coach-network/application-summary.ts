import type { Json } from "../database.types";

type ApplicationFormData = {
  experienceLevel?: string;
  weeklyAvailability?: string;
  injuriesOrConstraints?: string;
  consents?: Record<string, unknown>;
};

export function buildCoachApplicationSummary(input: {
  athleteMessage: string | null;
  formData: Json | null;
  athleteDisplayName?: string | null;
  athleteGoals?: string | null;
}) {
  const form =
    input.formData && typeof input.formData === "object" && !Array.isArray(input.formData)
      ? (input.formData as ApplicationFormData)
      : {};

  const lines = [
    input.athleteDisplayName
      ? `Athlete: ${input.athleteDisplayName}`
      : "Athlete application summary",
    form.experienceLevel ? `Level: ${form.experienceLevel}` : null,
    form.weeklyAvailability
      ? `Availability: ${form.weeklyAvailability}`
      : null,
    input.athleteGoals ? `Goals: ${input.athleteGoals}` : null,
    input.athleteMessage ? `Message: ${input.athleteMessage}` : null,
    form.injuriesOrConstraints
      ? `Constraints: ${form.injuriesOrConstraints}`
      : null,
  ].filter(Boolean);

  return lines.join("\n");
}
