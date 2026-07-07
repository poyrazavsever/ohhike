"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type HeroBannerProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  mascotSrc: string;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone?: "primary" | "secondary" | "info" | "warning";
};

type ProgressCardProps = {
  label: string;
  value: number;
  helper: string;
  icon: string;
  footer: string;
};

type QuickActionProps = {
  label: string;
  href: string;
  icon: string;
};

type AchievementProps = {
  label: string;
  helper: string;
  icon: string;
  tone?: "primary" | "secondary" | "info" | "warning";
};

type EmptyStateProps = {
  title: string;
  description: string;
  icon: string;
};

type DetailStatProps = {
  label: string;
  value: string | number;
};

function toneClassName(tone: MetricCardProps["tone"] = "primary") {
  const tones = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    info: "bg-blue-500/10 text-blue-500",
    warning: "bg-yellow-500/10 text-yellow-600",
  };

  return tones[tone];
}

export function DashboardHero({
  title,
  subtitle,
  eyebrow,
  mascotSrc,
}: HeroBannerProps) {
  return (
    <Card className="relative overflow-hidden border-primary/10 bg-linear-to-r from-primary/10 via-background to-primary/5 shadow-sm">
      <div className="absolute bottom-0 right-8 hidden h-14 w-36 rounded-t-full bg-primary/5 md:block" />
      <CardContent className="relative z-10 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="relative h-28 w-28 shrink-0 md:h-32 md:w-32">
          <Image
            src={mascotSrc}
            alt=""
            fill
            priority
            sizes="128px"
            className="object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "primary",
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 truncate text-2xl font-black text-foreground">
              {value}
            </p>
          </div>
          <div className={`flex size-10 items-center justify-center rounded-xl ${toneClassName(tone)}`}>
            <Icon icon={icon} className="size-5" />
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold leading-5 text-muted-foreground">
          {helper}
        </p>
      </CardContent>
    </Card>
  );
}

export function ProgressCard({
  label,
  value,
  helper,
  icon,
  footer,
}: ProgressCardProps) {
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-foreground">{label}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {helper}
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon icon={icon} className="size-4" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <div
            className="grid size-20 place-items-center rounded-full shadow-inner"
            style={{
              background: `conic-gradient(var(--primary) ${safeValue * 3.6}deg, var(--muted) 0deg)`,
            }}
          >
            <div className="grid size-14 place-items-center rounded-full bg-card shadow-sm">
              <span className="text-sm font-black text-foreground">
                {safeValue}%
              </span>
            </div>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-muted-foreground flex-1">
            {footer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActions({ actions }: { actions: QuickActionProps[] }) {
  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-black text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-4 grid gap-2">
        {actions.map((action) => (
          <Button key={action.href} variant="secondary" className="w-full justify-start gap-3 h-11" asChild>
            <Link href={action.href}>
              <Icon icon={action.icon} className="size-4 text-primary" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export function AchievementStrip({
  achievements,
}: {
  achievements: AchievementProps[];
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-foreground">Recent Signals</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold text-primary">LIVE</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {achievements.map((achievement) => (
            <div key={achievement.label} className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-xl ${toneClassName(achievement.tone)}`}>
                <Icon icon={achievement.icon} className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">
                  {achievement.label}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {achievement.helper}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-foreground">
        {value}
      </p>
    </div>
  );
}

export function EmptyStateCard({ title, description, icon }: EmptyStateProps) {
  return (
    <Card className="mt-4 border-dashed bg-transparent shadow-none">
      <CardContent className="p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon icon={icon} className="size-6" />
        </div>
        <p className="mt-4 text-base font-black text-foreground">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
