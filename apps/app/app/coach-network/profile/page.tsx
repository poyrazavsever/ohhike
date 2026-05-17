export default function CoachNetworkProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-extrabold text-foreground">
        Marketplace profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Coach marketplace profile editor ships in CN-1. Enable{" "}
        <code className="rounded bg-muted px-1">NEXT_PUBLIC_COACH_NETWORK_ENABLED=true</code>{" "}
        and complete migration 012 to continue.
      </p>
    </main>
  );
}
