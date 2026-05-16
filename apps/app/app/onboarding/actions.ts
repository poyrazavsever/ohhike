"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import type {
  OrganizationType,
  SportType,
  TablesInsert,
} from "../../lib/database.types";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";

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

function parsePositiveInteger(value: string | undefined) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
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

function getPrimaryEmail(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null
  );
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
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

  const { userId } = await auth();
  const user = await currentUser();
  const email = getPrimaryEmail(user);

  if (!userId || !email) {
    return {
      ok: false,
      error: "You need a signed-in account with an email address.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const organizationName = cleanString(input.organization.name);
  const teamName = cleanString(input.team.name);

  if (!organizationName || !teamName) {
    return {
      ok: false,
      error: "Organization and team names are required.",
    };
  }

  const displayName = getDisplayName(user);
  const organizationSlug = `${slugify(organizationName)}-${crypto.randomUUID().slice(0, 8)}`;

  const { error: userError } = await supabase.from("users").upsert({
    id: userId,
    email,
    display_name: displayName,
    avatar_url: user?.imageUrl ?? null,
    updated_at: new Date().toISOString(),
  });

  if (userError) {
    return {
      ok: false,
      error: userError.message,
    };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      slug: organizationSlug,
      type: input.organization.type,
      city: cleanString(input.organization.city),
      country: cleanString(input.organization.country),
      created_by: userId,
    })
    .select("id")
    .single();

  if (organizationError) {
    return {
      ok: false,
      error: organizationError.message,
    };
  }

  const organizationId = organization.id;

  const { error: membershipError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role: "owner",
      is_active: true,
    });

  if (membershipError) {
    return {
      ok: false,
      error: membershipError.message,
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      organization_id: organizationId,
      name: teamName,
      sport_type: input.team.sportType,
      age_group: cleanString(input.team.ageGroup),
      level: cleanString(input.team.level),
      season_goal: cleanString(input.team.seasonGoal),
      weekly_training_count:
        parsePositiveInteger(input.team.weeklyTrainingCount) ?? 0,
    })
    .select("id")
    .single();

  if (teamError) {
    return {
      ok: false,
      error: teamError.message,
    };
  }

  const teamId = team.id;

  const { error: teamStaffError } = await supabase.from("team_staff").insert({
    team_id: teamId,
    user_id: userId,
    role: "head_coach",
    assigned_by: userId,
  });

  if (teamStaffError) {
    return {
      ok: false,
      error: teamStaffError.message,
    };
  }

  const { error: entitlementError } = await supabase
    .from("team_billing_entitlements")
    .insert({
      organization_id: organizationId,
      team_id: teamId,
      plan: "basic_team",
      max_team_members: 3,
    });

  if (entitlementError) {
    return {
      ok: false,
      error: entitlementError.message,
    };
  }

  const athletes = input.athletes
    .filter((athlete) => hasAthleteInput(athlete))
    .slice(0, 12)
    .map<TablesInsert<"athletes">>((athlete) => {
      const firstName = cleanString(athlete.firstName) ?? "";
      const lastName = cleanString(athlete.lastName);
      const number = parsePositiveInteger(athlete.number);
      return {
        organization_id: organizationId,
        team_id: teamId,
        first_name: firstName,
        last_name: lastName,
        display_name: [firstName, lastName].filter(Boolean).join(" "),
        email: cleanString(athlete.email),
        number,
        position: cleanString(athlete.position),
        dominant_side: cleanString(athlete.dominantSide),
        status: "active",
        created_by: userId,
      };
    });

  if (athletes.length > 0) {
    const { error: athletesError } = await supabase
      .from("athletes")
      .insert(athletes);

    if (athletesError) {
      return {
        ok: false,
        error: athletesError.message,
      };
    }
  }

  await supabase.from("audit_logs").insert([
    {
      organization_id: organizationId,
      user_id: userId,
      action: "organization.created",
      entity_type: "organization",
      entity_id: organizationId,
    },
    {
      organization_id: organizationId,
      user_id: userId,
      action: "team.created",
      entity_type: "team",
      entity_id: teamId,
    },
  ]);

  revalidatePath("/");

  return {
    ok: true,
    redirectTo: "/dashboard",
  };
}
