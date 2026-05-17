import {
  ContentHero,
  ContentSection,
  TextSection,
} from "../../../components/marketing/content-page";

export default function PrivacyPage() {
  return (
    <main>
      <ContentHero
        badge="privacy"
        title="Privacy rules for team, athlete, and wearable data"
        description="OhHike handles operational sports data, personal athlete inputs, uploaded reports, and optional wearable summaries."
        image="/arkaplanlar/1861636_Image.png"
      />

      <ContentSection
        eyebrow="Data categories"
        title="What the platform may process"
        items={[
          {
            title: "Athlete data",
            description:
              "Profiles, team assignments, check-ins, readiness signals, notes, and training participation.",
          },
          {
            title: "Wearable data",
            description:
              "Optional activity, sleep, load, and recovery summaries connected by the athlete or organization.",
          },
          {
            title: "Uploaded material",
            description:
              "Reports, CSV files, session notes, and documents used for analysis or Team Memory.",
          },
          {
            title: "AI usage",
            description:
              "AI uses available product context for decision support and must stay within product safety boundaries.",
          },
        ]}
      />

      <TextSection title="Operational note">
        <p>
          The final legal privacy policy should be reviewed before production
          launch and should define retention, deletion, support requests, and
          self-host responsibilities in jurisdiction-specific language.
        </p>
      </TextSection>
    </main>
  );
}
