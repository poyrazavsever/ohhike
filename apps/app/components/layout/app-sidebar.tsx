"use client";

import { Icon } from "@iconify/react";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { switchActiveOrganization } from "../../app/actions/workspace";
import { isAthleteRole } from "../../lib/org-roles";
import type { WorkspaceShellData } from "../../lib/workspace";

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
        href: "/nutrition",
        label: "Nutrition",
        icon: "solar:cup-hot-bold",
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        href: "/reports",
        label: "Reports",
        icon: "solar:file-download-bold",
      },
    ],
  },
];

const athleteNavGroups = [
  {
    label: "My portal",
    items: [
      {
        href: "/athlete/home",
        label: "Home",
        icon: "solar:home-2-bold",
      },
      {
        href: "/athlete/check-in",
        label: "Daily check-in",
        icon: "solar:pulse-2-bold",
      },
      {
        href: "/athlete/nutrition",
        label: "Nutrition",
        icon: "solar:cup-hot-bold",
      },
      {
        href: "/athlete/training",
        label: "Personal training",
        icon: "solar:running-bold",
      },
      {
        href: "/athlete/profile",
        label: "My profile",
        icon: "solar:user-id-bold",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        href: "/settings/profile",
        label: "Account settings",
        icon: "solar:user-circle-bold",
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
    href: "/settings/organization",
    label: "Organization",
    icon: "solar:buildings-3-bold",
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

function formatPlan(plan: WorkspaceShellData["plan"]) {
  if (!plan) {
    return "Basic Team";
  }

  return plan
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRole(role: WorkspaceShellData["role"]) {
  return role
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function WorkspaceCard({ workspace }: { workspace: WorkspaceShellData }) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleOrganizationSwitch(organizationId: string) {
    setError(null);
    setIsSwitching(true);

    try {
      const result = await switchActiveOrganization(organizationId);

      if (!result.ok) {
        setError(result.error);
        setIsSwitching(false);
        return;
      }

      setIsOpen(false);
      router.replace(result.redirectTo ?? "/dashboard");
    } catch {
      setError("Could not switch organization. Please try again.");
      setIsSwitching(false);
    }
  }

  return (
    <div ref={containerRef} className="relative px-3 pb-3">
      {isOpen ? (
        <div className="absolute left-3 right-3 top-23 z-50 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <div className="px-3 py-2">
            <p className="truncate text-xs font-extrabold text-foreground">
              {workspace.organizationName}
            </p>
            <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
              {workspace.teamName ?? "No active team"} ·{" "}
              {formatRole(workspace.role)}
            </p>
          </div>

          <div className="my-1 h-px bg-border" />

          <div className="grid gap-1">
            {workspace.organizations.map((organization) => (
              <button
                key={organization.id}
                type="button"
                disabled={organization.isActive || isSwitching}
                onClick={() => handleOrganizationSwitch(organization.id)}
                className={
                  organization.isActive
                    ? "flex w-full items-center gap-2.5 rounded-xl bg-primary-soft px-3 py-2 text-left text-xs font-bold text-primary-700"
                    : "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
                }
              >
                <Icon icon="solar:buildings-3-bold" className="size-4" />
                <span className="min-w-0 flex-1 truncate">
                  {organization.name}
                </span>
                {organization.isActive ? (
                  <Icon icon="solar:check-circle-bold" className="size-4" />
                ) : null}
              </button>
            ))}
          </div>

          {error ? (
            <p className="px-3 py-2 text-xs font-bold text-destructive">
              {error}
            </p>
          ) : null}

          <Link
            href={
              workspace.canCreateOrganization
                ? "/settings/organization/new"
                : "/settings/billing"
            }
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon="solar:add-circle-bold" className="size-4" />
            New organization
            {!workspace.canCreateOrganization ? (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
                Pro
              </span>
            ) : null}
          </Link>

          <Link
            href="/settings/organization"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon="solar:settings-bold" className="size-4" />
            Organization settings
          </Link>

          <Link
            href="/settings/billing"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon="solar:card-bold" className="size-4" />
            Manage plan
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/35"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-extrabold text-primary-700">
          {workspace.organizationName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-foreground">
            {workspace.organizationName}
          </p>
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            {workspace.teamName ?? "No active team"} ·{" "}
            {formatPlan(workspace.plan)}
          </p>
        </div>
        <Icon
          icon="solar:alt-arrow-down-linear"
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

function SidebarUserCard() {
  const { openUserProfile, signOut } = useClerk();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative border-t border-border p-3">
      {isOpen ? (
        <div className="absolute bottom-19 left-3 right-3 z-50 rounded-3xl border border-border bg-card p-2">
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
            {user?.fullName ??
              user?.primaryEmailAddress?.emailAddress ??
              "Coach"}
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

export function AppSidebar({ workspace }: { workspace: WorkspaceShellData }) {
  const pathname = usePathname();
  const isAthlete = isAthleteRole(workspace.role);
  const groups = isAthlete ? athleteNavGroups : navGroups;

  return (
    <>
      <MobileAppNavigation
        groups={groups}
        pathname={pathname}
        workspace={workspace}
        isAthlete={isAthlete}
      />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="h-3" />
        <WorkspaceCard workspace={workspace} />

        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mt-4">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </div>
              <div className="mt-2 grid gap-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const isLocked =
                    "feature" in item &&
                    item.feature &&
                    !workspace.features[
                      item.feature as keyof typeof workspace.features
                    ];

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
                      {isLocked ? (
                        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
                          Pro
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <SidebarUserCard />
      </aside>
    </>
  );
}

function MobileAppNavigation({
  groups,
  pathname,
  workspace,
  isAthlete,
}: {
  groups: typeof navGroups | typeof athleteNavGroups;
  pathname: string;
  workspace: WorkspaceShellData;
  isAthlete: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const currentGroup = groups.find((group) => group.label === activeGroup);

  function close() {
    setIsOpen(false);
    setActiveGroup(null);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo/logoWtextBlack.png"
            alt="OhHike"
            width={122}
            height={32}
            className="h-7 w-auto object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-foreground"
          aria-label="Open navigation"
        >
          <Icon icon="solar:hamburger-menu-linear" className="size-5" />
        </button>
      </header>

      <div
        className={
          isOpen
            ? "fixed inset-0 z-60 translate-x-0 bg-background transition-transform duration-300 lg:hidden"
            : "fixed inset-0 z-60 -translate-x-full bg-background transition-transform duration-300 lg:hidden"
        }
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            {currentGroup ? (
              <button
                type="button"
                onClick={() => setActiveGroup(null)}
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground"
              >
                <Icon icon="solar:arrow-left-linear" className="size-4" />
                Back
              </button>
            ) : (
              <div>
                <p className="text-sm font-black text-foreground">
                  {workspace.organizationName}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {workspace.teamName ?? "No active team"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={close}
              className="inline-flex size-10 items-center justify-center rounded-xl text-foreground"
              aria-label="Close navigation"
            >
              <Icon icon="solar:close-circle-linear" className="size-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            {!currentGroup ? (
              <div className="grid">
                {groups.map((group) => (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => setActiveGroup(group.label)}
                    className="flex items-center justify-between border-b border-border py-4 text-left text-xl font-extrabold text-foreground transition-colors hover:text-primary"
                  >
                    {group.label}
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="size-4 text-muted-foreground"
                    />
                  </button>
                ))}
                {!isAthlete ? (
                  <button
                    type="button"
                    onClick={() => setActiveGroup("__account")}
                    className="flex items-center justify-between border-b border-border py-4 text-left text-xl font-extrabold text-foreground transition-colors hover:text-primary"
                  >
                    Account
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="size-4 text-muted-foreground"
                    />
                  </button>
                ) : null}
              </div>
            ) : activeGroup === "__account" ? (
              <MobileAccountLinks onNavigate={close} />
            ) : (
              <section>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {currentGroup.label}
                </p>
                <div className="mt-4 grid">
                  {currentGroup.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    const isLocked =
                      "feature" in item &&
                      item.feature &&
                      !workspace.features[
                        item.feature as keyof typeof workspace.features
                      ];

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="flex items-center justify-between border-b border-border py-4"
                      >
                        <span
                          className={
                            isActive
                              ? "text-lg font-extrabold text-primary-700"
                              : "text-lg font-extrabold text-foreground"
                          }
                        >
                          {item.label}
                        </span>
                        {isLocked ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
                            Pro
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const { openUserProfile, signOut } = useClerk();

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Account
      </p>
      <div className="mt-4 grid">
        {adminItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="border-b border-border py-4 text-lg font-extrabold text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => {
            onNavigate();
            openUserProfile();
          }}
          className="border-b border-border py-4 text-left text-lg font-extrabold text-foreground"
        >
          Manage account
        </button>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="border-b border-border py-4 text-left text-lg font-extrabold text-foreground"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
