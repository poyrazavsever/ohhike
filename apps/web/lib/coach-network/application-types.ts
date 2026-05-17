export type ApplicationConsentSnapshot = {
  shareProfile: boolean;
  shareGoals: boolean;
  shareContact: boolean;
  acceptedTerms: boolean;
  acceptedAt: string;
};

export type CoachNetworkApplicationFormData = {
  consents: ApplicationConsentSnapshot;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  weeklyAvailability: string;
  injuriesOrConstraints?: string;
  preferredPackageId?: string | null;
};

export type CreateCoachNetworkApplicationInput = {
  coachProfileId: string;
  packageId?: string | null;
  athleteMessage: string;
  formData: CoachNetworkApplicationFormData;
};
