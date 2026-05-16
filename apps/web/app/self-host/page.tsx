import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../components/marketing/content-page";

export default function SelfHostPage() {
  return (
    <main>
      <ContentHero
        badge="self-hosted deployment"
        title="Keep your team data on infrastructure you control"
        description="OhHike CoachOS can run on your own server with your own database, storage, AI keys, and wearable provider credentials."
        image="/arkaplanlar/1861655_Image.png"
        actions={[
          { href: "/docs/self-host", label: "Read Self-host Docs" },
          { href: "/docs", label: "Browse Docs" },
        ]}
      />

      <ContentSection
        eyebrow="Why self-host"
        title="A practical option for clubs that need control"
        items={[
          {
            title: "Own your data",
            description:
              "Keep athlete, wearable, report, and team memory data inside infrastructure managed by your organization.",
          },
          {
            title: "Bring your own providers",
            description:
              "Use your own AI, storage, and wearable API credentials instead of depending on OhHike-managed keys.",
          },
          {
            title: "Adapt deployment",
            description:
              "Run with Docker Compose, a VPS, or managed deployment tools that fit your technical team.",
          },
        ]}
      />

      <TextSection title="Hosted cloud and self-host solve different needs">
        <p>
          Hosted cloud is the fastest path for coaches who want to start using
          the product immediately. Self-host is for clubs, academies, and
          technical teams that need stronger control over deployment, data
          residency, and provider configuration.
        </p>
        <p>
          The product model stays the same in both cases: team data flows into
          session analysis, AI reports, and Team Memory. The difference is who
          operates the infrastructure below it.
        </p>
      </TextSection>
    </main>
  );
}
