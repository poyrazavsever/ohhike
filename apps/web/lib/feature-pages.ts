export type FeaturePage = {
  badge: string;
  cards: {
    description: string;
    icon: string;
    title: string;
  }[];
  description: string;
  image: "wideAbout" | "wideFeatures" | "wideHero";
  mascot: "observing" | "planning" | "pointing" | "running";
  narrative: string[];
  title: string;
};

export const featurePages = {
  "coach-dashboard": {
    badge: "coach dashboard",
    title: "One daily command view for coaches",
    description:
      "See readiness, load, missing check-ins, upcoming sessions, nutrition compliance, and AI recommendations before training decisions are made.",
    image: "wideHero",
    mascot: "observing",
    cards: [
      {
        title: "Team readiness",
        description:
          "Daily check-ins, recent RPE, soreness, sleep, and wearable summaries combine into a practical team signal.",
        icon: "solar:pulse-2-bold",
      },
      {
        title: "Risk alerts",
        description:
          "Surface athletes with high load, low sleep, repeated pain reports, or missing inputs that need staff attention.",
        icon: "solar:shield-warning-bold",
      },
      {
        title: "Recommended focus",
        description:
          "AI summaries point coaches toward adjustments like recovery blocks, technical focus, or lower intensity.",
        icon: "solar:lightbulb-bolt-bold",
      },
    ],
    narrative: [
      "The coach dashboard is the first operational screen after login. It should answer what changed since the last session and what needs attention today.",
      "The dashboard does not replace the coach. It reduces scattered signals into a readable view so staff can decide with better context.",
    ],
  },
  "check-ins": {
    badge: "athlete check-ins",
    title: "Daily athlete signals without heavy admin work",
    description:
      "Athletes submit quick readiness, wellness, RPE, nutrition, water, and personal training data from a mobile-first flow.",
    image: "wideFeatures",
    mascot: "running",
    cards: [
      {
        title: "Readiness inputs",
        description:
          "Sleep, energy, soreness, stress, motivation, pain area, illness signals, and notes form the daily readiness view.",
        icon: "solar:heart-pulse-bold",
      },
      {
        title: "Nutrition habits",
        description:
          "Water, meals, pre-training and post-training habits are tracked as recovery context, not as medical diet prescriptions.",
        icon: "solar:cup-hot-bold",
      },
      {
        title: "Personal training",
        description:
          "Team-external running, gym, recovery, mobility, or match work is visible before staff plan additional load.",
        icon: "solar:running-2-bold",
      },
    ],
    narrative: [
      "Check-ins are intentionally short. The goal is consistent signal collection, not a long clinical questionnaire.",
      "Athletes without smart watches still get the full workflow through manual input, while wearable data can enrich the same readiness context.",
    ],
  },
  "team-memory": {
    badge: "team memory",
    title: "Ask your season what it has already taught you",
    description:
      "Team Memory turns reports, coach notes, patterns, check-ins, wearable summaries, and drill history into searchable coaching context.",
    image: "wideAbout",
    mascot: "planning",
    cards: [
      {
        title: "Memory documents",
        description:
          "Session reports, coach notes, player observations, training plans, and weekly summaries are stored as team context.",
        icon: "solar:documents-bold",
      },
      {
        title: "RAG assistant",
        description:
          "Coaches can ask what repeated this month, who carried high load, or what was previously tried for a pattern.",
        icon: "solar:stars-bold",
      },
      {
        title: "Permission aware",
        description:
          "Retrieved context must respect organization, team, athlete, and staff visibility boundaries.",
        icon: "solar:lock-keyhole-bold",
      },
    ],
    narrative: [
      "The system treats every completed session as a future memory source. This is the core difference between a tracker and a learning coaching system.",
      "Team Memory should answer from available documents only. If the evidence is weak or missing, Doctor Panda must say that clearly.",
    ],
  },
  "ai-reports": {
    badge: "ai reports",
    title: "Structured reports coaches can review and act on",
    description:
      "AI reports combine session data, attendance, RPE, readiness, nutrition, wearable summaries, coach notes, and previous patterns.",
    image: "wideHero",
    mascot: "pointing",
    cards: [
      {
        title: "Session analysis",
        description:
          "Generate summaries, observations, load and recovery notes, risk alerts, recommended drills, and next-session plans.",
        icon: "solar:document-add-bold",
      },
      {
        title: "Structured output",
        description:
          "Reports should be JSON-validated, reviewable, and linked back into permanent team memory documents.",
        icon: "solar:code-square-bold",
      },
      {
        title: "Safety boundaries",
        description:
          "Reports avoid medical diagnosis, diet prescriptions, invented events, and guaranteed performance claims.",
        icon: "solar:shield-check-bold",
      },
    ],
    narrative: [
      "AI reports are not generic coaching advice. They must be generated from the team's actual context and stored for future retrieval.",
      "The best report is concise, evidence-aware, and useful for the next coaching decision.",
    ],
  },
} satisfies Record<string, FeaturePage>;
