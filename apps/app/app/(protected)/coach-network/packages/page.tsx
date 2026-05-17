import { listCoachingPackagesForWorkspace } from "../../../actions/coach-network-offers";
import { CoachingPackagesManager } from "./_components/coaching-packages-manager";

export default async function CoachNetworkPackagesPage() {
  const packages = await listCoachingPackagesForWorkspace();

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">Coaching packages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Reusable packages you can attach when sending offers to applicants.
      </p>

      <CoachingPackagesManager initialPackages={packages} />
    </main>
  );
}
