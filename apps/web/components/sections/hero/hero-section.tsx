import Link from "next/link";
import { getAppUrl } from "../../../lib/site-url";

export function HeroSection() {
  const appUrl = getAppUrl();
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          OhHike CoachOS
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Coaching operations platform for sports teams.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={`${appUrl}/login`}
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
