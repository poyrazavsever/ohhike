import Link from "next/link";

export function FeatureLockedCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5">
      <p className="text-base font-black text-foreground">{title}</p>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">
        {description}
      </p>
      <Link
        href="/settings/billing"
        className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        View plans
      </Link>
    </div>
  );
}
