import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAppUrl } from "../../../lib/site-url";

export function HeroSection() {
  const appUrl = getAppUrl();
  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          OhHike CoachOS
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-xl font-medium leading-relaxed text-muted-foreground">
          Coaching operations platform for elite sports teams. Manage your athletes, sessions, and insights all in one place.
        </p>
        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/20" asChild>
            <Link href={`${appUrl}/register`}>Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 font-bold" asChild>
            <Link href="/features">Explore Features</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
