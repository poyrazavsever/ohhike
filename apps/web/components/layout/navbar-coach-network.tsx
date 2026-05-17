"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

import { isCoachNetworkEnabled } from "../../lib/coach-network";
import { NavDropdown } from "./navbar-nav-dropdown";

export const coachNetworkPublicItems = [
  {
    href: "/find-coach",
    label: "Find a coach",
    description: "Browse public coaching profiles and packages.",
  },
];

export const coachNetworkAthleteItems = [
  {
    href: "/athlete/applications",
    label: "My applications",
    description: "Track applications and coach responses.",
  },
  {
    href: "/athlete/messages",
    label: "Messages",
    description: "Realtime threads with your coaches.",
  },
  {
    href: "/athlete/reviews",
    label: "Coach reviews",
    description: "Rate coaches after remote coaching.",
  },
];

export function NavbarCoachNetwork() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isCoachNetworkEnabled()) {
    return null;
  }

  if (isLoaded && isSignedIn) {
    return (
      <NavDropdown label="Coach Network" items={coachNetworkAthleteItems} align="end" />
    );
  }

  return (
    <>
      <NavDropdown label="Coach Network" items={coachNetworkPublicItems} align="end" />
      <Link
        href="/login"
        className="text-sm font-medium text-foreground/90 transition-colors hover:text-primary"
      >
        Sign in
      </Link>
    </>
  );
}

export function NavbarCoachNetworkMobile({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isCoachNetworkEnabled()) {
    return null;
  }

  const items = isLoaded && isSignedIn ? coachNetworkAthleteItems : coachNetworkPublicItems;

  return (
    <div className="mt-8">
      <div className="px-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Coach Network
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:border-primary/35 focus-visible:bg-primary-soft focus-visible:outline-none"
          >
            <span className="block text-lg font-extrabold text-foreground">{item.label}</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              {item.description}
            </span>
          </Link>
        ))}
        {isLoaded && !isSignedIn ? (
          <Link
            href="/login"
            onClick={onNavigate}
            className="rounded-2xl border border-primary/30 bg-primary-soft px-4 py-4 text-lg font-extrabold text-primary"
          >
            Sign in
          </Link>
        ) : null}
      </div>
    </div>
  );
}
