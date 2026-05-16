import { InfoGrid, MarketingHero, TextBand } from "../../components/marketing/page-sections";

const termCards = [
  {
    title: "Decision support",
    description:
      "OhHike helps coaches interpret team data. It does not replace the coach, doctor, physiotherapist, or nutritionist.",
    icon: "solar:lightbulb-bolt-bold",
  },
  {
    title: "No medical diagnosis",
    description:
      "Readiness, pain, nutrition, and wearable signals are performance context, not medical diagnosis or treatment instructions.",
    icon: "solar:health-bold",
  },
  {
    title: "User responsibility",
    description:
      "Teams decide how to collect consent, manage access, validate AI outputs, and operate self-hosted deployments.",
    icon: "solar:clipboard-check-bold",
  },
];

export default function TermsPage() {
  return (
    <main>
      <MarketingHero
        badge="terms"
        title="Terms for using an AI coaching operations platform"
        description="CoachOS is designed for practical team operations and coaching intelligence. The final decision always remains with qualified humans."
        mascot="pointing"
        image="wideAbout"
      />
      <InfoGrid title="Core terms" cards={termCards} />
      <TextBand title="Important boundaries">
        <p>
          OhHike CoachOS provides software for organizing team data, athlete
          inputs, session records, reports, and AI-assisted summaries. It is not
          a medical device and does not provide diagnosis, treatment, or
          guaranteed performance outcomes.
        </p>
        <p>
          AI outputs should be reviewed by coaches and relevant specialists
          before being used in training, recovery, nutrition, or athlete
          management decisions.
        </p>
        <p>
          Self-host users are responsible for deployment security, provider
          secrets, backups, update procedures, and local data governance.
        </p>
      </TextBand>
    </main>
  );
}
