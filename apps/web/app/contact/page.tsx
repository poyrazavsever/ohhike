import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../components/marketing/content-page";

export default function ContactPage() {
  return (
    <main>
      <ContentHero
        badge="contact"
        title="Talk to the OhHike team"
        description="Use this page for demos, self-host questions, support requests, or product conversations."
        image="/arkaplanlar/1861722_Image.png"
        actions={[
          { href: "/docs", label: "Read Docs" },
          { href: "/self-host", label: "Explore Self-host" },
        ]}
      />

      <ContentSection
        eyebrow="Contact paths"
        title="Choose the path that matches the request"
        items={[
          {
            title: "Request a demo",
            description:
              "For coaches, clubs, or academies evaluating the hosted product.",
          },
          {
            title: "Discuss self-host",
            description:
              "For technical teams planning their own deployment and provider setup.",
          },
          {
            title: "Get support",
            description:
              "For implementation questions, documentation gaps, or product issues.",
          },
        ]}
      />

      <TextSection title="Next implementation step">
        <p>
          This page currently establishes the content structure. The next pass
          should add the real contact channel, form handling, spam protection,
          and routing for demo versus support requests.
        </p>
      </TextSection>
    </main>
  );
}
