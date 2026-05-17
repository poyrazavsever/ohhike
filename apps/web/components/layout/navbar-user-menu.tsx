"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";

import { getAccountTypeFromMetadata } from "../../lib/account-type";
import { isCoachNetworkEnabled } from "../../lib/coach-network";
import { getAppUrl } from "../../lib/site-url";
import { coachNetworkAthleteItems } from "./navbar-coach-network";

function useCloseOnOutside(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [containerRef, isOpen, onClose]);
}

function GuestMenuItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/login"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Icon icon="solar:login-3-bold" className="size-4 text-primary" />
        Sign in
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Icon icon="solar:user-plus-bold" className="size-4 text-primary" />
        Create account
      </Link>
    </>
  );
}

function SignedInMenuItems({ onNavigate }: { onNavigate?: () => void }) {
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const accountType = getAccountTypeFromMetadata(user?.publicMetadata);

  const athleteLinks = [
    ...coachNetworkAthleteItems,
    {
      href: "/athlete/onboarding",
      label: "My profile",
      description: "Update your marketplace profile and goals.",
    },
  ];

  return (
    <>
      {accountType === "coach" ? (
        <a
          href={getAppUrl("/dashboard")}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Icon icon="solar:widget-5-bold" className="size-4 text-primary" />
          Open CoachOS
        </a>
      ) : (
        athleteLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="block rounded-2xl px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <span className="block text-sm font-semibold text-foreground">
              {item.label}
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
              {item.description}
            </span>
          </Link>
        ))
      )}

      <div className="my-1 h-px bg-border" />

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          openUserProfile();
        }}
        className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Icon icon="solar:user-check-rounded-bold" className="size-4 text-primary" />
        Manage account
      </button>

      <button
        type="button"
        onClick={() => signOut({ redirectUrl: "/" })}
        className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Icon icon="solar:logout-3-bold" className="size-4 text-primary" />
        Sign out
      </button>
    </>
  );
}

function UserMenuPanel({
  isOpen,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate?: () => void;
}) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-border bg-card p-2 shadow-lg">
      {isLoaded && isSignedIn ? (
        <div className="px-3 py-2">
          <p className="truncate text-sm font-extrabold text-foreground">
            {user?.fullName ?? "Account"}
          </p>
          <p className="truncate text-xs font-medium text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
          </p>
        </div>
      ) : null}

      {isLoaded && isSignedIn ? <div className="my-1 h-px bg-border" /> : null}

      {!isLoaded ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">Loading…</p>
      ) : isSignedIn ? (
        <SignedInMenuItems onNavigate={onNavigate} />
      ) : (
        <GuestMenuItems onNavigate={onNavigate} />
      )}
    </div>
  );
}

export function NavbarUserMenu() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useCloseOnOutside(isOpen, () => setIsOpen(false), containerRef);

  if (!isCoachNetworkEnabled()) {
    return null;
  }

  const close = () => setIsOpen(false);
  const avatarSrc = user?.imageUrl ?? null;
  const label = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 text-left transition-colors hover:border-primary/35 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isSignedIn ? "Account menu" : "Sign in menu"}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon icon="solar:user-bold" className="size-4" />
          </span>
        )}
        <span className="max-w-[7rem] truncate text-xs font-bold text-foreground">
          {isLoaded ? (isSignedIn ? label : "Sign in") : "…"}
        </span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={
            isOpen
              ? "size-4 shrink-0 rotate-180 text-muted-foreground transition-transform"
              : "size-4 shrink-0 text-muted-foreground transition-transform"
          }
        />
      </button>

      <UserMenuPanel isOpen={isOpen} onNavigate={close} />
    </div>
  );
}

export function NavbarUserMenuMobile({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isCoachNetworkEnabled()) {
    return null;
  }

  const avatarSrc = user?.imageUrl ?? null;

  return (
    <div className="mt-8 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon icon="solar:user-bold" className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-foreground">
            {isLoaded && isSignedIn
              ? (user?.fullName ?? "Account")
              : "Welcome"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {isLoaded && isSignedIn
              ? (user?.primaryEmailAddress?.emailAddress ?? "Signed in")
              : "Sign in to use Coach Network"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {!isLoaded ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : isSignedIn ? (
          <SignedInMenuItems onNavigate={onNavigate} />
        ) : (
          <GuestMenuItems onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}
