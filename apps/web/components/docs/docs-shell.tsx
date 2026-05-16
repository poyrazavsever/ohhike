import { Icon } from "@iconify/react";
import Link from "next/link";

const docSections = [
  {
    href: "/docs",
    label: "Overview",
    description: "Documentation home",
  },
  {
    href: "/docs/self-host",
    label: "Self-host",
    description: "Deployment and operations",
  },
];

function DocsShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 lg:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
            <Icon icon="solar:notebook-bookmark-bold" className="size-3.5" />
            <span>Documentation</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            Product and deployment documentation
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            Guidance for hosted teams, self-host operators, integrations, and
            the security boundaries behind CoachOS.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 md:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Documentation
          </div>
          <nav className="mt-4 grid gap-2">
            {docSections.map((item) => {
              const active = item.href === currentPath;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "rounded-2xl border border-primary/35 bg-primary-soft px-4 py-3"
                      : "rounded-2xl border border-transparent px-4 py-3 transition-colors hover:border-border hover:bg-card"
                  }
                >
                  <span className="block text-sm font-extrabold text-foreground">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </section>
    </main>
  );
}

function DocsArticle({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <article className="max-w-4xl">
      <header className="border-b border-border pb-8">
        <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-muted-foreground">
          {description}
        </p>
      </header>

      <div className="mt-8 space-y-10">{children}</div>
    </article>
  );
}

function DocsSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section>
      <h3 className="text-2xl font-extrabold text-foreground">{title}</h3>
      <div className="mt-4 space-y-4 text-base font-medium leading-8 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export { DocsArticle, DocsSection, DocsShell };
