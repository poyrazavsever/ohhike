import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Self-host", href: "/self-host" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Coach Dashboard", href: "/features/coach-dashboard" },
      { label: "Athlete Check-ins", href: "/features/check-ins" },
      { label: "Team Memory", href: "/features/team-memory" },
      { label: "AI Reports", href: "/features/ai-reports" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Community", href: "/community" },
      { label: "Blog", href: "/blog" },
      { label: "Docs", href: "/docs" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1.85fr]">
          <div className="relative max-w-md">
            <Image
              src="/maskotlar/kalpTutma.png"
              alt="Doctor Panda holding a heart"
              width={1024}
              height={1024}
              className="pointer-events-none absolute right-10 -top-10 h-auto w-32 select-none sm:right-10 sm:w-40 opacity-50"
              />

            <Link
              href="/"
              className="relative z-10 inline-flex items-center"
              aria-label="OH HIKE home"
            >
              <Image
                src="/logo/logowtext.png"
                alt="OH HIKE"
                width={172}
                height={48}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="relative z-10 mt-6 text-base font-medium leading-7 text-muted-foreground">
              OhHike CoachOS helps teams turn coach notes, athlete check-ins,
              smart watch data, and past reports into practical coaching
              decisions.
            </p>

            <div className="relative z-10 mt-7 flex items-center gap-4 text-muted-foreground">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="OH HIKE on GitHub"
                className="transition-colors hover:text-primary"
              >
                <Icon icon="mdi:github" className="size-5" />
              </a>
              <Link
                href="/community"
                aria-label="OH HIKE community"
                className="transition-colors hover:text-primary"
              >
                <Icon icon="solar:users-group-rounded-bold" className="size-5" />
              </Link>
              <Link
                href="/blog"
                aria-label="OH HIKE blog"
                className="transition-colors hover:text-primary"
              >
                <Icon icon="solar:pen-new-square-bold" className="size-5" />
              </Link>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-extrabold text-foreground">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => {
                    const isExternal = link.href.startsWith("http");

                    return (
                      <li key={link.href}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 text-sm font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 OhHike. Open-source AI coaching platform.</p>
          <p className="inline-flex items-center gap-1.5">
            Created with love
            <Icon icon="solar:heart-bold" className="size-4 text-primary" />
            by
            <a
              href="https://poyrazavsever.com"
              target="_blank"
              rel="noreferrer"
              className="text-foreground transition-colors hover:text-primary"
            >
              Poyraz Avsever
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
