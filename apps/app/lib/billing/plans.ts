import type { TeamPlanTier } from "../database.types";

export type BillingPlanDefinition = {
  id: TeamPlanTier;
  name: string;
  priceLabel: string;
  memberLimitLabel: string;
  description: string;
  features: string[];
  entitlements: {
    maxTeamMembers: number;
    aiFeaturesEnabled: boolean;
    aiReportsEnabled: boolean;
    teamMemoryEnabled: boolean;
    trainingPlannerEnabled: boolean;
    wearableEnabled: boolean;
    pdfExportEnabled: boolean;
    brandedReportsEnabled: boolean;
    monthlyAiReportLimit: number;
  };
};

export const billingPlans: readonly BillingPlanDefinition[] = [
  {
    id: "basic_team",
    name: "Basic Team",
    priceLabel: "Free",
    memberLimitLabel: "3 members",
    description: "Core team operations for getting started.",
    features: [
      "Team and athlete management",
      "Sessions and calendar workflow",
      "Daily check-ins",
      "Nutrition and water habits",
    ],
    entitlements: {
      maxTeamMembers: 3,
      aiFeaturesEnabled: false,
      aiReportsEnabled: false,
      teamMemoryEnabled: false,
      trainingPlannerEnabled: false,
      wearableEnabled: false,
      pdfExportEnabled: false,
      brandedReportsEnabled: false,
      monthlyAiReportLimit: 0,
    },
  },
  {
    id: "pro_team",
    name: "Pro Team",
    priceLabel: "$29 / month",
    memberLimitLabel: "20+ members",
    description: "AI workflows and exports for active teams.",
    features: [
      "AI Coach Reports",
      "Team Memory assistant",
      "Training planner",
      "Wearable summaries",
      "PDF exports",
    ],
    entitlements: {
      maxTeamMembers: 20,
      aiFeaturesEnabled: true,
      aiReportsEnabled: true,
      teamMemoryEnabled: true,
      trainingPlannerEnabled: true,
      wearableEnabled: true,
      pdfExportEnabled: true,
      brandedReportsEnabled: false,
      monthlyAiReportLimit: 100,
    },
  },
  {
    id: "pro_plus_team",
    name: "Pro Plus Team",
    priceLabel: "$79 / month",
    memberLimitLabel: "50+ members",
    description: "Advanced collaboration and reporting for larger programs.",
    features: [
      "Everything in Pro",
      "Branded reports",
      "Advanced roles",
      "Higher AI limits",
      "Priority support",
    ],
    entitlements: {
      maxTeamMembers: 50,
      aiFeaturesEnabled: true,
      aiReportsEnabled: true,
      teamMemoryEnabled: true,
      trainingPlannerEnabled: true,
      wearableEnabled: true,
      pdfExportEnabled: true,
      brandedReportsEnabled: true,
      monthlyAiReportLimit: 500,
    },
  },
];

export const defaultBillingPlan = billingPlans[0]!;

export function getBillingPlan(plan: TeamPlanTier | null | undefined) {
  return billingPlans.find((candidate) => candidate.id === plan) ?? defaultBillingPlan;
}
