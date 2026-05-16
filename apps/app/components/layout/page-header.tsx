type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="rounded-4xl border border-border bg-card p-6 md:p-8">
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-extrabold text-foreground">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
