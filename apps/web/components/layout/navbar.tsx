"use client";

import { Icon } from "@iconify/react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { isCoachNetworkEnabled } from "../../lib/coach-network";
import { getAppUrl } from "../../lib/site-url";
import {
  NavbarCoachNetwork,
  NavbarCoachNetworkMobile,
} from "./navbar-coach-network";
import { NavDropdown } from "./navbar-nav-dropdown";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

const resourceItems = [
  {
    href: "/self-host",
    label: "Self-host",
    description: "Run CoachOS on infrastructure you control.",
  },
  {
    href: "/docs",
    label: "Docs",
    description: "Read setup, deployment, and product guidance.",
  },
  {
    href: "/community",
    label: "Community",
    description: "See events and community sessions.",
  },
  {
    href: "/blog",
    label: "Blog",
    description: "Read product notes and training insights.",
  },
];

export function Navbar() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolled(window.scrollY > 0);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStarCount() {
      try {
        const response = await fetch(
          "https://api.github.com/repos/poyrazavsever/ohhike",
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const repository = (await response.json()) as {
          stargazers_count?: number;
        };

        if (typeof repository.stargazers_count === "number") {
          setStarCount(repository.stargazers_count);
        }
      } catch {
        // Keep the CTA usable if GitHub is unavailable or rate-limited.
      }
    }

    void loadStarCount();

    return () => {
      controller.abort();
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-transparent duration-200",
        hasScrolled && "border-b border-border/80 bg-background/95",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center"
          aria-label="OH HIKE home"
        >
          <Image
            src="/logo/logoWtext.png"
            alt="OH HIKE"
            width={154}
            height={42}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/90 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

          <NavDropdown label="Resources" items={resourceItems} />
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            About Us
          </Link>
          <NavbarCoachNetwork />
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border bg-background px-3 text-xs text-foreground shadow-none hover:bg-muted"
            asChild
          >
            <a
              href="https://github.com/poyrazavsever/ohhike"
              target="_blank"
              rel="noreferrer"
              aria-label="Star poyrazavsever/ohhike on GitHub"
            >
              <Icon icon="mdi:github" className="size-4" />
              <span>Star</span>
              {starCount !== null && (
                <span className="ml-1 border-l border-border pl-2 text-[11px] text-muted-foreground">
                  {starCount.toLocaleString("en-US")}
                </span>
              )}
            </a>
          </Button>

          {!isCoachNetworkEnabled() && (
            <Button
              size="sm"
              className="h-9 px-5 text-xs shadow-none"
              asChild
            >
              <Link href={getAppUrl("/")}>Get Started</Link>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label="Open menu"
          onClick={() => setIsMenuOpen(true)}
        >
          <Icon icon="solar:hamburger-menu-linear" className="size-5" />
        </Button>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "fixed inset-0 z-60 bg-background transition-transform duration-300 ease-out lg:hidden",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <Link
              href="/"
              className="flex min-w-0 items-center"
              aria-label="OH HIKE home"
              onClick={closeMenu}
            >
              <Image
                src="/logo/logoWtext.png"
                alt="OH HIKE"
                width={154}
                height={42}
                priority
                className="h-8 w-auto object-contain"
              />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <Icon icon="solar:close-circle-linear" className="size-6" />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-4 text-2xl font-extrabold text-foreground transition-colors hover:border-primary/25 hover:bg-primary-soft focus-visible:border-primary/30 focus-visible:bg-primary-soft focus-visible:outline-none"
                >
                  {item.label}
                  <Icon
                    icon="solar:arrow-right-up-linear"
                    className="size-5 text-primary"
                  />
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <div className="px-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Resources
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {resourceItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:border-primary/35 focus-visible:bg-primary-soft focus-visible:outline-none"
                  >
                    <span className="block text-lg font-extrabold text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              onClick={closeMenu}
              className="mt-8 flex items-center justify-between rounded-2xl border border-transparent px-4 py-4 text-2xl font-extrabold text-foreground transition-colors hover:border-primary/25 hover:bg-primary-soft focus-visible:border-primary/30 focus-visible:bg-primary-soft focus-visible:outline-none"
            >
              About Us
              <Icon icon="solar:arrow-right-up-linear" className="size-5 text-primary" />
            </Link>

            <NavbarCoachNetworkMobile onNavigate={closeMenu} />

            <div className="mt-auto grid gap-3 pt-8">
              <Button size="lg" asChild>
                <Link href={getAppUrl("/")} onClick={closeMenu}>
                  Get Started
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  <Icon icon="mdi:github" className="size-5" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
