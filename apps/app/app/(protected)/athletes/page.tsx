import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiWorkspaceShellData } from "../../../lib/api-workspace";
import { getTeamAthletes } from "../../../lib/api-athletes";
import { fetchApi } from "../../../lib/api-client";
import { AthleteRowActions } from "./_components/athlete-row-actions";
import { CreateAthleteForm } from "./_components/create-athlete-form";

function getAthleteName(firstName: string, lastName: string | null | undefined) {
  return [firstName, lastName].filter(Boolean).join(" ");
}

function formatStatus(status: string | null | undefined) {
  return status
    ? status
        .split("_")
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" ")
    : "Active";
}

export default async function AthletesPage() {
  const workspace = await getApiWorkspaceShellData();
  const athletes = await getTeamAthletes();
  
  // Takım seçimi formu için organizasyondaki tüm takımları getir
  const teams = await fetchApi(`/teams/${workspace.organizationId}`);

  const claimedCount = athletes.filter((athlete) => athlete.user_id).length;
  const invitedCount = athletes.length - claimedCount;
  const activeCount = athletes.filter(
    (athlete) => !athlete.status || athlete.status === "active",
  ).length;

  return (
    <section className="bg-primary/5 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Team Operations"
        title="Athletes"
        subtitle={`Track athlete profiles, roster status and claim readiness for ${workspace.organizationName}.`}
        mascotSrc="/maskotlar/kosu.png"
      />

      <div className="mt-4">
        <CreateAthleteForm teams={teams} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Athletes"
          value={athletes.length.toString()}
          helper="Profiles in roster"
          icon="solar:user-id-bold"
        />
        <MetricCard
          label="Claimed"
          value={claimedCount.toString()}
          helper={`${invitedCount} unclaimed`}
          icon="solar:user-check-rounded-bold"
          tone="secondary"
        />
        <MetricCard
          label="Active"
          value={activeCount.toString()}
          helper={`${teams.length} teams available`}
          icon="solar:heart-pulse-bold"
          tone="info"
        />
      </div>

      {athletes.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-extrabold text-xs uppercase tracking-widest text-muted-foreground">Athlete</TableHead>
                <TableHead className="font-extrabold text-xs uppercase tracking-widest text-muted-foreground">Team</TableHead>
                <TableHead className="font-extrabold text-xs uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="font-extrabold text-xs uppercase tracking-widest text-muted-foreground">Claim</TableHead>
                <TableHead className="text-right font-extrabold text-xs uppercase tracking-widest text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athletes.map((athlete) => (
                <TableRow key={athlete._id} className="hover:bg-muted/30">
                  <TableCell>
                    <p className="text-sm font-black text-foreground">
                      {getAthleteName(athlete.first_name, athlete.last_name)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {athlete.position ?? "Position not set"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-foreground">
                    {workspace.teamName ?? "No team"}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-foreground">
                    {formatStatus(athlete.status)}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-muted-foreground">
                    {athlete.user_id ? "Claimed" : "Unclaimed"}
                  </TableCell>
                  <TableCell className="text-right">
                    <AthleteRowActions athlete={athlete as any} teams={teams} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyStateCard
          title="No athletes loaded yet"
          description="Add athletes during onboarding or directly from this page."
          icon="solar:user-id-bold"
        />
      )}
    </section>
  );
}
