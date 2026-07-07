// @ts-nocheck
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { backgroundScenes, pandaMascots } from "@repo/ui/lib/assets";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

import { getAppUrl } from "../../lib/site-url";

type MarketingHeroProps = {
  badge: string;
  description: string;
  image?: keyof typeof backgroundScenes;
  mascot?: keyof typeof pandaMascots;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
  title: string;
};

type InfoCard = {
  description: string;
  icon: string;
  title: string;
};

function MarketingHero({
  badge,
  description,
  image = "wideFeatures",
  mascot = "planning",
  primaryCta,
  secondaryCta,
  title,
}: MarketingHeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background">
      <Image
        src={backgroundScenes[image]}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/72 to-primary-soft/55" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-10 px-5 py-20 md:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
            <Icon icon="solar:stars-bold" className="size-3.5" />
            <span>{badge}</span>
          </div>
          <h1 className="mt-7 text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-balance text-base font-medium leading-8 text-muted-foreground sm:text-lg">
            {description}
          </p>
          {primaryCta || secondaryCta ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryCta ? (
                <Button size="lg" className="rounded-full font-bold px-8" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button size="lg" variant="outline" className="rounded-full font-bold px-8 bg-background/50 backdrop-blur-sm" asChild>
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="hidden justify-center lg:flex">
          <Image
            src={pandaMascots[mascot]}
            alt=""
            width={1024}
            height={1024}
            className="h-auto w-80 object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

function InfoGrid({
  cards,
  eyebrow,
  title,
}: {
  cards: InfoCard[];
  eyebrow?: string;
  title: string;
}) {
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
          {cards.map((card) => (
            <Card key={card.title} className="group transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-8">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon icon={card.icon} className="size-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold leading-tight text-foreground">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextBand({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="bg-muted/30 px-5 py-20 md:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
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

function CtaBand({
  description = "Start with the hosted app, or keep reading the implementation notes before deploying your own setup.",
  title = "Ready to turn every session into team intelligence?",
}: {
  description?: string;
  title?: string;
}) {
  return (
    <section className="bg-background px-5 py-20 md:px-8">
      <Card className="mx-auto max-w-7xl overflow-hidden border-primary/20 bg-primary-soft/50 shadow-xl shadow-primary/5">
        <CardContent className="p-10 md:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full font-bold px-8 shadow-lg shadow-primary/20" asChild>
                <Link href={getAppUrl("/register")}>Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full font-bold px-8 bg-background/50 hover:bg-background" asChild>
                <Link href="/docs">Read Docs</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export { CtaBand, InfoGrid, MarketingHero, TextBand, type InfoCard };
