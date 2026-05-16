export default function ProtectedLoading() {
  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <div className="h-28 animate-pulse rounded-3xl bg-muted/80" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl bg-muted/70"
          />
        ))}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-3xl bg-muted/60" />
    </section>
  );
}
