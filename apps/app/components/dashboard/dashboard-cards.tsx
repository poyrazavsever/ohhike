"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

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
    primary: "bg-primary-soft text-primary-700",
    secondary: "bg-secondary-soft text-secondary-600",
    info: "bg-info-soft text-info-foreground",
    warning: "bg-warning-soft text-warning-foreground",
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
    <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-linear-to-r from-primary-soft via-white to-primary-50 p-5 md:p-6">
      <div className="absolute bottom-0 right-8 hidden h-14 w-36 rounded-t-full bg-primary/10 md:block" />
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary-700">
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 truncate text-xl font-black text-foreground">
            {value}
          </p>
        </div>
        <div className={`flex size-9 items-center justify-center rounded-xl ${toneClassName(tone)}`}>
          <Icon icon={icon} className="size-5" />
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">{label}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {helper}
          </p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
          <Icon icon={icon} className="size-4" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div
          className="grid size-20 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${safeValue * 3.6}deg, var(--muted) 0deg)`,
          }}
        >
          <div className="grid size-14 place-items-center rounded-full bg-card">
            <span className="text-base font-black text-foreground">
              {safeValue}%
            </span>
          </div>
        </div>
        <p className="text-xs font-semibold leading-5 text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  );
}

export function QuickActions({ actions }: { actions: QuickActionProps[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-black text-foreground">Quick Actions</p>
      <div className="mt-3 grid gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-xl bg-background px-3 py-2.5 text-sm font-extrabold text-foreground transition-colors hover:bg-primary-soft hover:text-primary-700"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary-700">
              <Icon icon={action.icon} className="size-4" />
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-foreground">Recent Signals</p>
        <span className="text-xs font-extrabold text-primary-700">Live</span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
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
    </div>
  );
}

export function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="rounded-xl bg-background p-3">
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
    <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
        <Icon icon={icon} className="size-5" />
      </div>
      <p className="mt-3 text-sm font-black text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
