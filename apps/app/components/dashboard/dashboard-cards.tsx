"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

type HeroBannerProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
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

function toneClassName(tone: MetricCardProps["tone"] = "primary") {
  const tones = {
    primary: "bg-primary-soft text-primary-700",
    secondary: "bg-secondary-soft text-secondary-600",
    info: "bg-info-soft text-info-foreground",
    warning: "bg-warning-soft text-warning-foreground",
  };

  return tones[tone];
}

export function DashboardHero({ title, subtitle, eyebrow }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-primary/10 bg-linear-to-r from-primary-soft via-white to-primary-50 p-6 shadow-sm md:p-8">
      <div className="absolute right-20 top-8 hidden size-40 rounded-full bg-primary/10 blur-2xl md:block" />
      <div className="absolute bottom-10 right-48 hidden size-28 rounded-full bg-info/10 blur-2xl md:block" />
      <div className="absolute bottom-0 right-10 hidden h-20 w-48 rounded-t-full bg-primary/10 md:block" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-4xl bg-white shadow-sm">
          <div className="absolute -left-2 top-3 size-8 rounded-full bg-foreground" />
          <div className="absolute -right-2 top-3 size-8 rounded-full bg-foreground" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-white">
            <div className="absolute left-5 top-8 size-5 rounded-full bg-foreground" />
            <div className="absolute right-5 top-8 size-5 rounded-full bg-foreground" />
            <div className="absolute bottom-8 size-3 rounded-full bg-primary" />
            <div className="absolute bottom-5 h-1.5 w-8 rounded-full bg-secondary" />
          </div>
        </div>

        <div className="max-w-xl">
          {eyebrow ? (
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
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
    <div className="rounded-4xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 truncate text-2xl font-black text-foreground">
            {value}
          </p>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-2xl ${toneClassName(tone)}`}>
          <Icon icon={icon} className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-muted-foreground">
        {helper}
      </p>
    </div>
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
    <div className="rounded-4xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-foreground">{label}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {helper}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-2xl bg-primary-soft text-primary-700">
          <Icon icon={icon} className="size-5" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div
          className="grid size-24 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${safeValue * 3.6}deg, var(--muted) 0deg)`,
          }}
        >
          <div className="grid size-16 place-items-center rounded-full bg-card">
            <span className="text-lg font-black text-foreground">
              {safeValue}%
            </span>
          </div>
        </div>
        <p className="text-sm font-semibold leading-6 text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  );
}

export function QuickActions({ actions }: { actions: QuickActionProps[] }) {
  return (
    <div className="rounded-4xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-black text-foreground">Quick Actions</p>
      <div className="mt-4 grid gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-extrabold text-foreground transition-colors hover:bg-primary-soft hover:text-primary-700"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
              <Icon icon={action.icon} className="size-5" />
            </span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AchievementStrip({
  achievements,
}: {
  achievements: AchievementProps[];
}) {
  return (
    <div className="rounded-4xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-foreground">Recent Signals</p>
        <span className="text-xs font-extrabold text-primary-700">Live</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {achievements.map((achievement) => (
          <div key={achievement.label} className="flex items-center gap-3">
            <div className={`flex size-12 items-center justify-center rounded-2xl ${toneClassName(achievement.tone)}`}>
              <Icon icon={achievement.icon} className="size-6" />
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
    </div>
  );
}
