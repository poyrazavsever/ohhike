"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "../../lib/api-client";

type OrganizationType =
  | "club"
  | "academy"
  | "individual_coach"
  | "school_team"
  | "university_team"
  | "performance_center"
  | "other";

type SportType =
  | "football"
  | "basketball"
  | "volleyball"
  | "handball"
  | "running"
  | "fitness"
  | "tennis"
  | "swimming"
  | "martial_arts"
  | "esports"
  | "other";

const organizationTypes = [
  "club",
  "academy",
  "individual_coach",
  "school_team",
  "university_team",
  "performance_center",
  "other",
] as const satisfies readonly OrganizationType[];

const sportTypes = [
  "football",
  "basketball",
  "volleyball",
  "handball",
  "running",
  "fitness",
  "tennis",
  "swimming",
  "martial_arts",
  "esports",
  "other",
] as const satisfies readonly SportType[];

export type OnboardingAthleteInput = {
  firstName: string;
  lastName?: string;
  email?: string;
  number?: string;
  position?: string;
  dominantSide?: string;
};

export type CompleteOnboardingInput = {
  organization: {
    name: string;
    type: OrganizationType;
    city?: string;
    country?: string;
  };
  team: {
    name: string;
    sportType: SportType;
    ageGroup?: string;
    level?: string;
    seasonGoal?: string;
    weeklyTrainingCount?: string;
  };
  athletes: OnboardingAthleteInput[];
};

export type OnboardingActionResult =
  | {
      ok: true;
      redirectTo: string;
    }
  | {
      ok: false;
      error: string;
    };

function cleanString(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function hasAthleteInput(athlete: OnboardingAthleteInput) {
  return Boolean(
    cleanString(athlete.firstName) ||
      cleanString(athlete.lastName) ||
      cleanString(athlete.email) ||
      cleanString(athlete.number) ||
      cleanString(athlete.position) ||
      cleanString(athlete.dominantSide),
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isOrganizationType(value: string): value is OrganizationType {
  return organizationTypes.includes(value as OrganizationType);
}

function isSportType(value: string): value is SportType {
  return sportTypes.includes(value as SportType);
}

function validateInput(input: CompleteOnboardingInput) {
  const organizationName = cleanString(input.organization.name);
  const teamName = cleanString(input.team.name);

  if (!organizationName) {
    return "Organization name is required.";
  }

  if (!teamName) {
    return "First team name is required.";
  }

  if (!isOrganizationType(input.organization.type)) {
    return "Invalid organization type.";
  }

  if (!isSportType(input.team.sportType)) {
    return "Invalid sport type.";
  }

  const invalidAthlete = input.athletes.find(
    (athlete) => hasAthleteInput(athlete) && !cleanString(athlete.firstName),
  );

  if (invalidAthlete) {
    return "Athlete first name is required.";
  }

  const invalidAthleteEmail = input.athletes.find((athlete) => {
    const email = cleanString(athlete.email);
    return email ? !isValidEmail(email) : false;
  });

  if (invalidAthleteEmail) {
    return "Please enter a valid athlete email address.";
  }

  return null;
}

export async function completeOnboarding(
  input: CompleteOnboardingInput,
): Promise<OnboardingActionResult> {
  const validationError = validateInput(input);

  if (validationError) {
    return {
      ok: false,
      error: validationError,
    };
  }

  const organizationName = cleanString(input.organization.name);
  const teamName = cleanString(input.team.name);

  if (!organizationName || !teamName) {
    return {
      ok: false,
      error: "Organization and team names are required.",
    };
  }

  const organizationSlug = `${slugify(organizationName)}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    // Create Organization via Express API
    const organization = await fetchApi("/organizations", {
      method: "POST",
      body: JSON.stringify({
        name: organizationName,
        slug: organizationSlug,
      }),
    });

    // Create Team via Express API
    const team = await fetchApi("/teams", {
      method: "POST",
      body: JSON.stringify({
        name: teamName,
        organization_id: organization._id,
      }),
    });

    const athletes = input.athletes
      .filter((athlete) => hasAthleteInput(athlete))
      .slice(0, 12);

    if (athletes.length > 0) {
      const athletePromises = athletes.map((athlete) => {
        const firstName = cleanString(athlete.firstName) ?? "";
        const lastName = cleanString(athlete.lastName);
        
        return fetchApi("/athletes", {
          method: "POST",
          body: JSON.stringify({
            team_id: team._id,
            first_name: firstName,
            last_name: lastName,
            email: cleanString(athlete.email),
            position: cleanString(athlete.position),
          }),
        });
      });

      await Promise.all(athletePromises);
    }
  } catch (error: any) {
    console.error("Onboarding Error:", error);
    return {
      ok: false,
      error: error.message || "Failed to create onboarding data via API.",
    };
  }

  revalidatePath("/");

  return {
    ok: true,
    redirectTo: "/dashboard",
  };
}
