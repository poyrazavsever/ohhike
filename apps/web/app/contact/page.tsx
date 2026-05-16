import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

import { InfoGrid, MarketingHero, TextBand } from "../../components/marketing/page-sections";

const contactCards = [
  {
    title: "Product and demos",
    description:
      "Talk about CoachOS for your team, academy, school program, or performance group.",
    icon: "solar:chat-round-like-bold",
  },
  {
    title: "Self-host and deployment",
    description:
      "Discuss running OhHike with your own database, storage, AI provider, and wearable keys.",
    icon: "solar:server-square-cloud-bold",
  },
  {
    title: "Security questions",
    description:
      "Ask about role-based access, sensitive athlete data, AI boundaries, and storage strategy.",
    icon: "solar:shield-check-bold",
  },
];

export default function ContactPage() {
  return (
    <main>
      <MarketingHero
        badge="contact"
        title="Build better team intelligence with the right setup"
        description="Whether you are testing CoachOS with one team or planning a self-hosted deployment for a club, start with the questions that matter most."
        mascot="heart"
        image="wideAbout"
        primaryCta={{ href: "mailto:hello@ohhike.com", label: "Email OhHike" }}
        secondaryCta={{ href: "/docs", label: "Read Docs" }}
      />
      <InfoGrid title="What to contact us about" cards={contactCards} />
      <TextBand title="Fastest way to get a useful answer">
        <p>
          Share your sport, number of teams, approximate athlete count, whether
          you need hosted or self-hosted setup, and which data sources you plan
          to use.
        </p>
        <p>
          For privacy or security questions, include the roles that need access
          to readiness, nutrition, wearable, and report data.
        </p>
        <Button asChild>
          <Link href="mailto:hello@ohhike.com">hello@ohhike.com</Link>
        </Button>
      </TextBand>
    </main>
  );
}
