"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

import { isCoachNetworkEnabled } from "../../lib/coach-network";

export function NavbarCoachNetwork() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isCoachNetworkEnabled()) {
    return null;
  }

  return (
    <>
      <Link
        href="/find-coach"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
      >
        Find coach
      </Link>

      {isLoaded && isSignedIn ? (
        <>
          <Link
            href="/athlete/applications"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            My applications
          </Link>
          <Link
            href="/athlete/messages"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            Messages
          </Link>
          <span className="max-w-[8rem] truncate text-xs font-semibold text-muted-foreground">
            {user?.firstName ?? user?.primaryEmailAddress?.emailAddress}
          </span>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" className="h-9 px-3 text-xs" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" className="h-9 px-3 text-xs shadow-none" asChild>
            <Link href="/register">Join as athlete</Link>
          </Button>
        </>
      )}
    </>
  );
}
