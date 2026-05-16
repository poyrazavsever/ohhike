import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

type HeroAction = {
  href: string;
  label: string;
};

type ContentHeroProps = {
  actions?: HeroAction[];
  badge: string;
  description: string;
  image: string;
  title: string;
};

type ContentSectionProps = {
  eyebrow?: string;
  items: {
    description: string;
    title: string;
  }[];
  title: string;
};

function ContentHero({
  actions = [],
  badge,
  description,
  image,
  title,
}: ContentHeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/92 via-background/82 to-background" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center px-5 py-20 md:px-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
          <Icon icon="solar:stars-bold" className="size-3.5" />
          <span>{badge}</span>
        </div>

        <h1 className="mt-7 max-w-5xl text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl">
          {title}
        </h1>

        <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>

        {actions.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    : "inline-flex h-11 items-center justify-center rounded-full border border-input bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-primary-soft"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ContentSection({
  eyebrow,
  items,
  title,
}: ContentSectionProps) {
  return (
    <section className="bg-background px-5 py-20 md:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary-700">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="mt-3 text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <h3 className="text-xl font-extrabold leading-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="bg-card px-5 py-20 md:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground">
          {title}
        </h2>
        <div className="space-y-5 text-base font-medium leading-8 text-muted-foreground">
          {children}
        </div>
      </div>
    </section>
  );
}

export { ContentHero, ContentSection, TextSection };
