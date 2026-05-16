import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../components/marketing/content-page";

export default function SecurityPage() {
  return (
    <main>
      <ContentHero
        badge="security"
        title="Sensitive athlete data needs explicit boundaries"
        description="CoachOS is designed around role-based access, row-level security, private storage, and conservative AI usage rules."
        image="/arkaplanlar/1861646_Image.png"
      />

      <ContentSection
        eyebrow="Controls"
        title="The security model starts with isolation"
        items={[
          {
            title: "Tenant isolation",
            description:
              "Organizations, teams, and athletes are separated with row-level security and role-aware access rules.",
          },
          {
            title: "Role-based access",
            description:
              "Owners, coaches, analysts, physiotherapists, nutritionists, athletes, and viewers receive scoped visibility.",
          },
          {
            title: "Private files",
            description:
              "Reports, uploads, and supporting files are intended to use private storage with controlled access.",
          },
          {
            title: "AI boundaries",
            description:
              "AI is a decision-support layer. It does not diagnose, prescribe treatment, or replace qualified professionals.",
          },
        ]}
      />

      <TextSection title="Self-host changes ownership, not the standard">
        <p>
          Self-hosted clubs keep direct control of their own database, storage,
          and keys. That increases operational responsibility, but it does not
          weaken the product expectation around access control and athlete
          privacy.
        </p>
      </TextSection>
    </main>
  );
}
