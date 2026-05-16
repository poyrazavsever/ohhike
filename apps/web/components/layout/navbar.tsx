"use client";

import { Icon } from "@iconify/react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAppUrl } from "../../lib/site-url";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/self-host", label: "Self-host" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            src="/logo/logowtext.png"
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

          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            About Us
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border bg-background px-3 text-xs text-foreground shadow-none hover:bg-muted"
            asChild
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Star OH HIKE on GitHub"
            >
              <Icon icon="mdi:github" className="size-4" />
              <span>Star</span>
              <span className="ml-1 border-l border-border pl-2 text-[11px] text-muted-foreground">
                12.4K
              </span>
            </a>
          </Button>

          <Button
            size="sm"
            className="h-9 px-5 text-xs shadow-none"
            asChild
          >
            <Link href={getAppUrl("/")}>Get Started</Link>
          </Button>
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
                src="/logo/logowtext.png"
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
