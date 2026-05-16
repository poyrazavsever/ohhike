import { InfoGrid, MarketingHero, TextBand } from "../../components/marketing/page-sections";

const privacyCards = [
  {
    title: "Team data stays scoped",
    description:
      "Organizations, teams, athletes, sessions, reports, and memory documents are designed around tenant isolation.",
    icon: "solar:database-bold",
  },
  {
    title: "Sensitive athlete signals",
    description:
      "Readiness, soreness, nutrition, wearable, and recovery data require role-based access and careful product language.",
    icon: "solar:pulse-2-bold",
  },
  {
    title: "Self-host control",
    description:
      "Self-host deployments let clubs run their own database, storage, AI keys, wearable keys, backups, and access rules.",
    icon: "solar:server-square-cloud-bold",
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <MarketingHero
        badge="privacy"
        title="Privacy for sports teams and athlete data"
        description="OhHike CoachOS is built around organization-scoped data, explicit athlete workflows, role-based access, and self-host options for teams that need deeper control."
        mascot="observing"
        image="wideFeatures"
      />
      <InfoGrid title="Privacy principles" cards={privacyCards} />
      <TextBand title="What OhHike handles">
        <p>
          CoachOS may store account details, organization and team records,
          athlete profiles, session notes, check-ins, nutrition logs, wearable
          summaries, uploaded files, AI reports, and Team Memory documents.
        </p>
        <p>
          AI features are intended to analyze the context provided by a team.
          Wearable, health-adjacent, and nutrition data should not be treated as
          model training data for unrelated organizations.
        </p>
        <p>
          Self-hosted users are responsible for their own infrastructure,
          backups, provider keys, access policies, and local compliance needs.
        </p>
      </TextBand>
    </main>
  );
}
