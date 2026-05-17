"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { submitTrainingProof } from "../../../../actions/coach-network-proofs";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function SubmitProofForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitTrainingProof(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Proof submitted. Your coach will review it soon.");
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-3xl border border-border bg-card p-5"
    >
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Submit training proof
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload photos or short videos from today&apos;s session (max 5 files, 25 MB each).
      </p>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Title
        <input
          name="title"
          required
          className={fieldClassName()}
          placeholder="e.g. Tempo run — 8 km"
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Session date
        <input
          type="date"
          name="proofDate"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={fieldClassName()}
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Notes
        <textarea
          name="notes"
          className={`${fieldClassName()} min-h-20`}
          placeholder="RPE, how it felt, anything your coach should know…"
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Media
        <input
          type="file"
          name="files"
          accept="image/*,video/*"
          multiple
          required
          className={`${fieldClassName()} file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary`}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
      >
        {isPending ? "Uploading…" : "Submit proof"}
      </button>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
