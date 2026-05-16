import { AppShell } from "../components/layout/app-shell";

export default function Home() {
  return (
    <AppShell>
      <section className="px-5 py-8 md:px-8">
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
          <h1 className="text-3xl font-extrabold text-foreground">
            Coach Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            Sidebar navigation is aligned with the CoachOS app modules from the
            product docs.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
