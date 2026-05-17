import { listRemoteAthletesWithProgramAdherence } from "../../../actions/coach-network-programs";
import { RemoteAthletesList } from "./_components/remote-athletes-list";

export default async function CoachNetworkRemoteAthletesPage() {
  const rows = await listRemoteAthletesWithProgramAdherence();

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">Remote athletes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Athletes who accepted your coaching offers. Confirm payment, assign programs,
        and track adherence (completed days ÷ elapsed program days).
      </p>

      <RemoteAthletesList rows={rows} />
    </main>
  );
}
