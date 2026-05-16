import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

function PricingCard({
  children,
  className,
  cta,
  description,
  featured = false,
  meta,
  name,
  price,
}: React.ComponentProps<"article"> & {
  cta: React.ReactNode;
  description: string;
  featured?: boolean;
  meta: string;
  name: string;
  price: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[2rem] border border-border bg-card p-6",
        featured && "border-primary/45 bg-primary-soft/45",
        className,
      )}
    >
      <div>
        <div className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary-700">
          {meta}
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-foreground">
          {name}
        </h2>
        <div className="mt-4 text-4xl font-extrabold tracking-normal text-foreground">
          {price}
        </div>
        <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-7 flex-1">{children}</div>

      <div className="mt-8">{cta}</div>
    </article>
  );
}

function PricingFeatureList({
  children,
  className,
}: React.ComponentProps<"ul">) {
  return (
    <ul className={cn("space-y-3 text-sm font-semibold", className)}>
      {children}
    </ul>
  );
}

function PricingFeature({
  children,
  muted = false,
}: React.ComponentProps<"li"> & {
  muted?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex gap-3 leading-6 text-foreground",
        muted && "text-muted-foreground",
      )}
    >
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

function PricingButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button className={cn("w-full", className)} {...props}>
      {children}
    </Button>
  );
}

export { PricingButton, PricingCard, PricingFeature, PricingFeatureList };
