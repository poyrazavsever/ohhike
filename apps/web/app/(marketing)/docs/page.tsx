import Link from "next/link";

import {
  DocsArticle,
  DocsSection,
  DocsShell,
} from "../../../components/docs/docs-shell";

const docTracks = [
  {
    href: "/docs/self-host",
    title: "Self-host",
    description:
      "Install CoachOS on your own infrastructure, configure providers, and plan safe operations.",
  },
  {
    title: "Integrations",
    description:
      "Upcoming references for wearables, AI providers, storage, and CSV imports.",
  },
  {
    title: "Security",
    description:
      "Upcoming technical guidance for RLS, roles, private storage, and AI boundaries.",
  },
];

export default function DocsPage() {
  return (
    <DocsShell currentPath="/docs">
      <DocsArticle
        title="Start with the product model, then move into operations"
        description="The documentation hub keeps hosted and self-hosted guidance in one place. Self-host setup is one track inside the docs, not a separate top-level product."
      >
        <DocsSection title="Documentation tracks">
          <div className="grid gap-4 md:grid-cols-2">
            {docTracks.map((track) =>
              track.href ? (
                <Link
                  key={track.title}
                  href={track.href}
                  className="rounded-3xl border border-border bg-card p-5 transition-colors hover:border-primary/35"
                >
                  <h4 className="text-lg font-extrabold text-foreground">
                    {track.title}
                  </h4>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                    {track.description}
                  </p>
                </Link>
              ) : (
                <div
                  key={track.title}
                  className="rounded-3xl border border-border bg-card p-5"
                >
                  <h4 className="text-lg font-extrabold text-foreground">
                    {track.title}
                  </h4>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                    {track.description}
                  </p>
                </div>
              ),
            )}
          </div>
        </DocsSection>

        <DocsSection title="Recommended path">
          <ol className="grid gap-3">
            <li>1. Understand the product model and hosted versus self-hosted responsibilities.</li>
            <li>2. Follow the self-host setup path when operating your own infrastructure.</li>
            <li>3. Add integrations, API keys, and deployment-specific references as those docs land.</li>
          </ol>
        </DocsSection>
      </DocsArticle>
    </DocsShell>
  );
}
