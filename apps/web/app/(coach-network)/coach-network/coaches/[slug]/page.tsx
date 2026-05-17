import { Icon } from "@iconify/react";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCoachProfileReviewState } from "../../../../../app/actions/coach-network-reviews";
import { getPublicCoachBySlug } from "../../../../../lib/coach-network/public-queries";
import { getYouTubeEmbedUrl } from "../../../../../lib/coach-network/youtube";
import { CoachProfileReviewPanel } from "./_components/coach-profile-review-panel";
import { CoachPublicReviews } from "./_components/coach-public-reviews";

type CoachProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ apply?: string }>;
};

function formatRating(rating: number | null, reviewCount: number) {
  if (rating === null || reviewCount === 0) {
    return "New coach";
  }
  return `${rating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`;
}

function formatPrice(cents: number | null, currency: string) {
  if (cents === null) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function generateMetadata({
  params,
}: CoachProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const coach = await getPublicCoachBySlug(slug);

  if (!coach) {
    return { title: "Coach not found | OhHike" };
  }

  return {
    title: `${coach.displayName} | Coach profile | OhHike`,
    description:
      coach.headline ??
      `Remote coaching profile for ${coach.displayName} on OhHike.`,
  };
}

export default async function CoachPublicProfilePage({
  params,
  searchParams,
}: CoachProfilePageProps) {
  const { slug } = await params;
  const { apply } = await searchParams;
  const coach = await getPublicCoachBySlug(slug);

  if (!coach) {
    notFound();
  }

  const showApplyHint = apply === "1";
  const { userId } = await auth();
  const reviewState = await getCoachProfileReviewState(coach.id);
  const applyHref = userId
    ? `/coach-network/apply/${coach.id}`
    : `/login?redirect_url=${encodeURIComponent(`/coach-network/apply/${coach.id}`)}`;
  const introVideoEmbedUrl = getYouTubeEmbedUrl(coach.introVideoUrl);
  const location = [coach.locationCity, coach.locationCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="bg-primary-50">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <Link
          href="/find-coach"
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Back to find a coach
        </Link>

        <header className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-primary-soft text-primary">
                {coach.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coach.photoUrl}
                    alt=""
                    className="size-24 rounded-3xl object-cover"
                  />
                ) : (
                  <Icon icon="solar:user-bold" className="size-10" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-extrabold text-foreground md:text-4xl">
                  {coach.displayName}
                </h1>
                {coach.headline ? (
                  <p className="mt-2 text-base text-muted-foreground">
                    {coach.headline}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-bold text-primary">
                  {formatRating(coach.averageRating, coach.reviewCount)}
                  {coach.reputationScore !== 0
                    ? ` · Reputation ${coach.reputationScore > 0 ? "+" : ""}${coach.reputationScore}`
                    : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                  {coach.sports.map((sport) => (
                    <span
                      key={sport}
                      className="rounded-full bg-muted px-3 py-1 uppercase tracking-wide"
                    >
                      {sport.replace("_", " ")}
                    </span>
                  ))}
                  {coach.coachingModes.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full border border-border px-3 py-1 capitalize"
                    >
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {coach.bio ? (
              <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {coach.bio}
              </p>
            ) : null}

            {coach.featuredResult ? (
              <div className="mt-6 rounded-2xl border border-success/25 bg-success-soft p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-success-foreground">
                  Featured result
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-success-foreground">
                  {coach.featuredResult}
                </p>
              </div>
            ) : null}
          </section>

          <aside className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              Coaching snapshot
            </p>
            <dl className="mt-4 grid gap-4 text-sm">
              {coach.pricingDisplay ? (
                <div>
                  <dt className="font-bold text-muted-foreground">Pricing</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {coach.pricingDisplay}
                  </dd>
                </div>
              ) : null}
              {coach.yearsExperience !== null ? (
                <div>
                  <dt className="font-bold text-muted-foreground">
                    Experience
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {coach.yearsExperience} years
                  </dd>
                </div>
              ) : null}
              {coach.responseTimeAvgHours !== null ? (
                <div>
                  <dt className="font-bold text-muted-foreground">
                    Typical response
                  </dt>
                  <dd className="font-semibold text-foreground">
                    ~{coach.responseTimeAvgHours}h
                  </dd>
                </div>
              ) : null}
              {location ? (
                <div>
                  <dt className="font-bold text-muted-foreground">Location</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {location}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              {coach.isAcceptingClients ? (
                <Link
                  href={applyHref}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
                >
                  {userId
                    ? showApplyHint
                      ? "Continue application"
                      : "Apply for coaching"
                    : "Sign in to apply"}
                </Link>
              ) : (
                <span className="inline-flex h-11 items-center rounded-xl bg-muted px-6 text-sm font-extrabold text-muted-foreground">
                  Not accepting clients
                </span>
              )}
            </div>
          </aside>
        </header>

        {introVideoEmbedUrl ? (
          <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-xl font-extrabold text-foreground">
                Intro video
              </h2>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={introVideoEmbedUrl}
                title={`${coach.displayName} intro video`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-extrabold text-foreground">
              Coaching approach
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
              {coach.trainingPhilosophy ??
                "This coach has not added a training philosophy yet."}
            </p>
          </article>

          <aside className="rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
                Specialties
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {coach.specialties.length > 0 ? (
                  coach.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
                    >
                      {specialty}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">
                    Not specified
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
                Languages
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {coach.languages.length > 0 ? (
                  coach.languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground"
                    >
                      {language}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">
                    Not specified
                  </span>
                )}
              </div>
            </div>
          </aside>
        </section>

        {coach.packages.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-foreground">Packages</h2>
            <div className="mt-4 grid gap-4">
              {coach.packages.map((pkg) => {
                const price = formatPrice(pkg.priceCents, pkg.currency);

                return (
                  <article
                    key={pkg.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-lg font-extrabold text-foreground">
                        {pkg.title}
                      </h3>
                      {price ? (
                        <span className="text-sm font-extrabold text-primary">
                          {price}
                          {pkg.durationWeeks
                            ? ` / ${pkg.durationWeeks} weeks`
                            : null}
                        </span>
                      ) : null}
                    </div>
                    {pkg.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {pkg.description}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-foreground">Reviews</h2>
          <CoachProfileReviewPanel
            state={reviewState}
            coachName={coach.displayName}
            profileHref={`/coach-network/coaches/${coach.slug}`}
          />
          <CoachPublicReviews reviews={coach.reviews} />
        </section>
      </div>
    </main>
  );
}
