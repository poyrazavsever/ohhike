import Link from "next/link";

import { Button } from "@repo/ui/components/ui/button";

export default function FindCoachPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="text-4xl font-extrabold text-foreground">Find a coach</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Public coach discovery and filters ship in CN-1. Your athlete profile is
        ready — browse will list published marketplace profiles next.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/athlete/applications">My applications</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
