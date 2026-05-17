"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendProofThreadMessage } from "../../../../actions/coach-network-proofs";

type ThreadMessage = {
  id: string;
  body: string;
  sender_user_id: string;
  message_type: string;
  created_at: string | null;
};

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function ProofThreadPanel({
  proofId,
  messages,
  currentUserId,
}: {
  proofId: string;
  messages: ThreadMessage[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await sendProofThreadMessage(proofId, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Feedback thread
      </h2>
      <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <li className="text-sm text-muted-foreground">No messages yet.</li>
        ) : (
          messages.map((message) => (
            <li
              key={message.id}
              className={
                message.sender_user_id === currentUserId
                  ? "ml-8 rounded-2xl bg-primary-soft px-4 py-3 text-sm"
                  : "mr-8 rounded-2xl bg-muted px-4 py-3 text-sm"
              }
            >
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {message.message_type === "system" ? "System" : "Message"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-foreground">{message.body}</p>
            </li>
          ))
        )}
      </ul>
      <textarea
        className={`${fieldClassName()} mt-4 min-h-20`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Reply to your coach…"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={send}
        className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
