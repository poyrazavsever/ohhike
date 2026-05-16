import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../components/marketing/content-page";

export default function DocsPage() {
  return (
    <main>
      <ContentHero
        badge="documentation"
        title="Documentation for hosted and self-hosted teams"
        description="Start with the product model, then move into deployment, integrations, API keys, and security."
        image="/arkaplanlar/1861726_Image.png"
        actions={[
          { href: "/docs/self-host", label: "Self-host Docs" },
          { href: "/security", label: "Security" },
        ]}
      />

      <ContentSection
        eyebrow="Start here"
        title="The first documentation tracks"
        items={[
          {
            title: "Self-host Installation",
            description:
              "Deployment flow, infrastructure requirements, provider setup, and operational ownership.",
          },
          {
            title: "Security",
            description:
              "RLS, role boundaries, sensitive athlete data, and AI safety expectations.",
          },
          {
            title: "Integrations",
            description:
              "The next docs track for wearables, AI providers, storage, and CSV import.",
          },
        ]}
      />

      <TextSection title="Documentation roadmap">
        <p>
          The current docs pass establishes the top-level information
          architecture. Upcoming pages should add integration references,
          deployment notes, API key guidance, and troubleshooting material.
        </p>
      </TextSection>
    </main>
  );
}
