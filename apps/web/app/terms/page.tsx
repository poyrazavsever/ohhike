import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../components/marketing/content-page";

export default function TermsPage() {
  return (
    <main>
      <ContentHero
        badge="terms"
        title="Usage terms for a coaching decision-support product"
        description="CoachOS helps teams interpret data. It does not replace coaches, clinicians, physiotherapists, or nutritionists."
        image="/arkaplanlar/1861640_Image.png"
      />

      <ContentSection
        eyebrow="Core terms"
        title="The important product boundaries"
        items={[
          {
            title: "Decision support",
            description:
              "AI outputs are suggestions and summaries, not final coaching or medical decisions.",
          },
          {
            title: "No medical diagnosis",
            description:
              "The platform must not be used as a substitute for diagnosis, treatment, or emergency medical judgment.",
          },
          {
            title: "Permissioned integrations",
            description:
              "Wearable connections depend on user consent and provider authorization.",
          },
          {
            title: "Self-host responsibility",
            description:
              "Self-host operators manage their own infrastructure, backups, secrets, and compliance obligations.",
          },
        ]}
      />

      <TextSection title="Production note">
        <p>
          This page is the product-structure draft. Before public launch, final
          legal terms should be reviewed and replaced with approved contract
          language.
        </p>
      </TextSection>
    </main>
  );
}
