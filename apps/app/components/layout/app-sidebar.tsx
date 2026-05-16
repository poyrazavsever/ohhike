"use client";

import { Icon } from "@iconify/react";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navGroups = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Coach Dashboard",
        icon: "solar:widget-5-bold",
      },
      {
        href: "/athlete/dashboard",
        label: "Athlete View",
        icon: "solar:user-heart-bold",
      },
      {
        href: "/calendar",
        label: "Calendar",
        icon: "solar:calendar-mark-bold",
      },
    ],
  },
  {
    label: "Team Operations",
    items: [
      {
        href: "/teams",
        label: "Teams",
        icon: "solar:users-group-rounded-bold",
      },
      {
        href: "/athletes",
        label: "Athletes",
        icon: "solar:user-id-bold",
      },
      {
        href: "/sessions",
        label: "Sessions",
        icon: "solar:clipboard-list-bold",
      },
      {
        href: "/training-planner",
        label: "Training Planner",
        icon: "solar:map-arrow-right-bold",
      },
      {
        href: "/drills",
        label: "Drill Library",
        icon: "solar:notebook-bookmark-bold",
      },
    ],
  },
  {
    label: "Performance Data",
    items: [
      {
        href: "/readiness",
        label: "Readiness",
        icon: "solar:pulse-2-bold",
      },
      {
        href: "/load-recovery",
        label: "Load & Recovery",
        icon: "solar:shield-warning-bold",
      },
      {
        href: "/nutrition",
        label: "Nutrition",
        icon: "solar:cup-hot-bold",
      },
      {
        href: "/wearables",
        label: "Wearables",
        icon: "solar:watch-round-bold",
      },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      {
        href: "/ai-reports",
        label: "AI Reports",
        icon: "solar:document-add-bold",
      },
      {
        href: "/team-memory",
        label: "Team Memory",
        icon: "solar:stars-bold",
      },
      {
        href: "/reports",
        label: "Reports",
        icon: "solar:file-download-bold",
      },
    ],
  },
];

const adminItems = [
  {
    href: "/settings/profile",
    label: "Profile",
    icon: "solar:user-circle-bold",
  },
  {
    href: "/settings/staff",
    label: "Staff",
    icon: "solar:user-plus-bold",
  },
  {
    href: "/settings/billing",
    label: "Billing",
    icon: "solar:card-bold",
  },
  {
    href: "/settings/integrations",
    label: "Integrations",
    icon: "solar:plug-circle-bold",
  },
];

function SidebarUserCard() {
  const { openUserProfile, signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="relative border-t border-border p-3">
      {isOpen ? (
        <div className="absolute bottom-[4.75rem] left-3 right-3 z-50 rounded-3xl border border-border bg-card p-2">
          <div className="px-3 py-2">
            <p className="truncate text-xs font-semibold text-foreground">
              {user?.fullName ?? "Account"}
            </p>
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
            </p>
          </div>

          <div className="my-1 h-px bg-border" />

          {adminItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon icon={item.icon} className="size-4" />
              {item.label}
            </Link>
          ))}

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openUserProfile();
            }}
            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon="solar:user-check-rounded-bold" className="size-4" />
            Manage account
          </button>

          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/login" })}
            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon="solar:logout-3-bold" className="size-4" />
            Sign out
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-3xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/35"
      >
        <Image
          src={user?.imageUrl ?? "/logo/logoWtextBlack.png"}
          alt=""
          width={40}
          height={40}
          className="size-9 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Coach"}
          </p>
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Account & admin
          </p>
        </div>
        <Icon
          icon="solar:alt-arrow-up-linear"
          className={
            isOpen
              ? "size-4 shrink-0 rotate-180 text-muted-foreground transition-transform"
              : "size-4 shrink-0 text-muted-foreground transition-transform"
          }
        />
      </button>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" aria-label="OhHike CoachOS dashboard">
          <Image
            src="/logo/logoWtextBlack.png"
            alt="OH HIKE"
            width={172}
            height={48}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mt-4">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </div>
            <div className="mt-2 grid gap-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive
                        ? "flex items-center gap-2.5 rounded-2xl bg-primary-soft px-3 py-2 text-xs font-semibold text-primary-700"
                        : "flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    }
                  >
                    <Icon icon={item.icon} className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <SidebarUserCard />
    </aside>
  );
}
