import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../../components/marketing/content-page";

export default function SelfHostDocsPage() {
  return (
    <main>
      <ContentHero
        badge="self-host docs"
        title="Set up CoachOS on your own infrastructure"
        description="The self-host path covers deployment, database setup, storage, provider keys, backups, and operational ownership."
        image="/arkaplanlar/1861662_Image.png"
        actions={[
          { href: "/self-host", label: "Why Self-host" },
          { href: "/contact", label: "Contact Us" },
        ]}
      />

      <ContentSection
        eyebrow="Setup path"
        title="The core self-host checklist"
        items={[
          {
            title: "1. System requirements",
            description:
              "Prepare a server, PostgreSQL/Supabase-compatible database, storage access, public URL, and encryption settings.",
          },
          {
            title: "2. Deploy the app",
            description:
              "Use Docker Compose or your preferred deployment platform, then verify app, database, and storage connectivity.",
          },
          {
            title: "3. Configure providers",
            description:
              "Add AI provider keys, optional wearable provider credentials, and the storage configuration your team will use.",
          },
          {
            title: "4. Complete setup",
            description:
              "Create the first admin, organization, and team before inviting athletes or staff.",
          },
          {
            title: "5. Operate safely",
            description:
              "Plan backup, restore, update, and secret rotation procedures before production use.",
          },
        ]}
      />

      <TextSection title="What this guide will expand next">
        <p>
          The next documentation pass should add exact Docker Compose commands,
          environment variable references, migration steps, backup examples,
          and provider-specific setup instructions.
        </p>
        <p>
          Until then, this page establishes the canonical deployment flow and
          keeps self-host expectations aligned with the product architecture.
        </p>
      </TextSection>
    </main>
  );
}
