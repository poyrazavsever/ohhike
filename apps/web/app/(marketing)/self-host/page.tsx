import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const ownershipPoints = [
  {
    title: "Your database",
    description:
      "Athlete data, session history, reports, and Team Memory remain inside infrastructure you operate.",
    icon: "solar:database-bold",
  },
  {
    title: "Your provider keys",
    description:
      "Bring your own AI, storage, and wearable credentials instead of depending on shared platform keys.",
    icon: "solar:key-square-bold",
  },
  {
    title: "Your operating model",
    description:
      "Choose Docker Compose, a VPS, or a managed deployment tool that fits the team running the system.",
    icon: "solar:server-square-cloud-bold",
  },
];

const comparisonRows = [
  {
    label: "Fastest start",
    hosted: "Hosted cloud",
    selfHosted: "Requires setup",
  },
  {
    label: "Infrastructure ownership",
    hosted: "OhHike",
    selfHosted: "Your organization",
  },
  {
    label: "Database and storage",
    hosted: "Managed",
    selfHosted: "Bring your own",
  },
  {
    label: "Provider keys",
    hosted: "Managed path",
    selfHosted: "Bring your own",
  },
];

export default function SelfHostPage() {
  return (
    <main className="bg-background">
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
        <Image
          src="/arkaplanlar/1861655_Image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/76 to-background" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center px-5 py-20 md:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
              <Icon icon="solar:server-square-cloud-bold" className="size-3.5" />
              <span>self-hosted deployment</span>
            </div>
            <h1 className="mt-7 max-w-4xl text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl">
              Run CoachOS where your team data already belongs
            </h1>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-muted-foreground sm:text-lg">
              Self-host CoachOS with your own database, storage, AI keys, and
              wearable provider credentials when deployment control matters as
              much as the product itself.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full gap-2 px-6">
                <Link href="/docs/self-host">
                  <Icon icon="solar:book-bookmark-bold" className="size-5" />
                  Read Docs
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full gap-2 px-6">
                <Link href="/pricing">
                  Compare Plans
                  <Icon icon="solar:arrow-right-linear" className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              Choose self-host when operational control is part of the product
            </h2>
            <p className="mt-5 text-base font-medium leading-7 text-muted-foreground sm:text-lg">
              Clubs and technical teams can keep the same coaching workflow
              while operating the infrastructure themselves.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ownershipPoints.map((point) => (
              <article
                key={point.title}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-700">
                  <Icon icon={point.icon} className="size-5" />
                </div>
                <h3 className="mt-5 text-2xl font-extrabold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                  {point.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card px-5 py-24 md:px-8 lg:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground">
              Hosted cloud and self-host solve different jobs
            </h2>
            <p className="mt-5 text-base font-medium leading-7 text-muted-foreground">
              The product model stays the same. The operating responsibility
              changes.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border bg-background">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border text-sm font-extrabold text-foreground">
              <div className="p-4">Decision</div>
              <div className="bg-primary-soft/50 p-4">Hosted cloud</div>
              <div className="p-4">Self-host</div>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_1fr_1fr] border-b border-border text-sm last:border-b-0"
              >
                <div className="p-4 font-bold text-foreground">{row.label}</div>
                <div className="bg-primary-soft/25 p-4 font-medium text-muted-foreground">
                  {row.hosted}
                </div>
                <div className="p-4 font-medium text-muted-foreground">
                  {row.selfHosted}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
