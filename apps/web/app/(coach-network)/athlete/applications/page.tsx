import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { Button } from "@repo/ui/components/ui/button";
import { redirect } from "next/navigation";

export default async function AthleteApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/athlete/applications");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">My applications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Application inbox ships in CN-2. You will see coach responses and offer
        status here.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/find-coach">Find a coach</Link>
      </Button>
    </main>
  );
}
