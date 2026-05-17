import { auth } from "@clerk/nextjs/server";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getTrainingProofDetail } from "../../../../actions/coach-network-proofs";
import {
  DashboardHero,
  DetailStat,
} from "../../../../../components/dashboard/dashboard-cards";
import { ProofThreadPanel } from "../_components/proof-thread-panel";

type AthleteProofDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AthleteProofDetailPage({
  params,
}: AthleteProofDetailPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const detail = await getTrainingProofDetail(id);

  if (!detail || !detail.isAthlete) {
    notFound();
  }

  const { proof, media, messages } = detail;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <Link
        href="/athlete/proofs"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon icon="solar:arrow-left-linear" className="size-4" />
        Training proofs
      </Link>

      <div className="mt-4">
        <DashboardHero
          eyebrow="Remote coaching"
          title={proof.title}
          subtitle="Review your uploaded proof, coach feedback and message history in one place."
          mascotSrc="/maskotlar/hazirlik.png"
        />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <DetailStat label="Date" value={proof.proof_date} />
        <DetailStat label="Status" value={formatStatus(proof.status)} />
        <DetailStat label="Media" value={media.length} />
      </div>

      {proof.notes ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm font-semibold leading-6 text-muted-foreground">
          {proof.notes}
        </p>
      ) : null}

      {proof.coach_feedback ? (
        <p className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/50 p-4 text-sm font-semibold leading-6 text-foreground">
          <span className="font-bold">Coach feedback: </span>
          {proof.coach_feedback}
        </p>
      ) : null}

      {media.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {media.map((item) => (
            <a
              key={item.path}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-2xl border border-border bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt="Training proof"
                className="h-48 w-full object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}

      <ProofThreadPanel
        proofId={proof.id}
        messages={messages}
        currentUserId={userId}
      />
    </section>
  );
}
