import {
  DocsArticle,
  DocsSection,
  DocsShell,
} from "../../../../components/docs/docs-shell";

const setupSteps = [
  "Prepare database, storage, public URL, and encryption settings.",
  "Deploy the app with Docker Compose or your chosen platform.",
  "Apply migrations and verify app, database, and storage connectivity.",
  "Create the first admin, organization, and team.",
  "Add AI provider keys and optional wearable provider credentials.",
  "Define backup, restore, update, and secret rotation procedures.",
];

export default function SelfHostDocsPage() {
  return (
    <DocsShell currentPath="/docs/self-host">
      <DocsArticle
        title="Self-host CoachOS on infrastructure you control"
        description="This track documents the operational path for clubs or technical teams running their own deployment."
      >
        <DocsSection title="Before you begin">
          <p>
            Self-hosting is an operations choice. Your organization controls
            the database, storage, provider keys, backups, updates, and
            production security posture.
          </p>
        </DocsSection>

        <DocsSection title="Setup checklist">
          <ol className="grid gap-3">
            {setupSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </DocsSection>

        <DocsSection title="What this guide will expand next">
          <p>
            The next docs pass should add exact commands, environment variable
            references, migration notes, provider-specific setup, backup
            examples, and update instructions.
          </p>
        </DocsSection>
      </DocsArticle>
    </DocsShell>
  );
}
