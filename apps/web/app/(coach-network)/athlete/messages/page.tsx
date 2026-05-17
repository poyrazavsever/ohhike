import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { Button } from "@repo/ui/components/ui/button";
import { redirect } from "next/navigation";

export default async function AthleteMessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/athlete/messages");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Messages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Supabase Realtime messaging ships in CN-3. Threads will appear here once
        you apply to coaches.
      </p>
      <Button className="mt-6" variant="outline" asChild>
        <Link href="/athlete/applications">View applications</Link>
      </Button>
    </main>
  );
}
