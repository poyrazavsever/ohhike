import * as React from "react";

import { cn } from "../../lib/utils";

function FeatureSectionShell({
  children,
  className,
}: React.ComponentProps<"section">) {
  return (
    <section className="relative bg-background px-5 py-5 md:px-8">
      <div
        className={cn(
          "mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-card px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-18",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

function FeatureSectionHeader({
  align = "left",
  children,
  className,
  description,
  title,
}: React.ComponentProps<"div"> & {
  align?: "left" | "center";
  description: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        "relative z-10 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base font-medium leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
      {children}
    </div>
  );
}

function FeatureItem({
  children,
  className,
  icon,
  title,
}: React.ComponentProps<"article"> & {
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <article
      className={cn(
        "h-full rounded-3xl border border-border bg-background p-5 transition-colors hover:border-primary/35",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-700">
            {icon}
          </div>
        ) : null}
        <div>
          <h3 className="text-lg font-extrabold leading-tight text-foreground">
            {title}
          </h3>
          <div className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturePill({
  children,
  className,
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/25 bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

export { FeatureItem, FeaturePill, FeatureSectionHeader, FeatureSectionShell };
