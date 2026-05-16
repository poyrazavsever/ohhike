"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  updateSessionTrainingBlocks,
  type TrainingBlockInput,
} from "../../../actions/workspace";
import { sessionPlannedIntensitySelectOptions } from "../../../../lib/coach-vocabulary";
import type { SessionWithMeta } from "../../../../lib/workspace";

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
}

function createEmptyBlock(orderIndex: number): TrainingBlockInput {
  return {
    title: "",
    description: "",
    orderIndex: orderIndex.toString(),
    plannedDurationMin: "",
    actualDurationMin: "",
    intensity: "",
    completed: false,
    notes: "",
  };
}

function buildBlocks(session: SessionWithMeta): TrainingBlockInput[] {
  if (session.trainingBlocks.length === 0) {
    return [createEmptyBlock(0)];
  }

  return session.trainingBlocks.map((block) => ({
    id: block.id,
    title: block.title,
    description: block.description ?? "",
    orderIndex: block.order_index.toString(),
    plannedDurationMin: block.planned_duration_min?.toString() ?? "",
    actualDurationMin: block.actual_duration_min?.toString() ?? "",
    intensity: block.intensity?.toString() ?? "",
    completed: block.completed ?? false,
    notes: block.notes ?? "",
  }));
}

export function SessionTrainingBlocksButton({
  session,
}: {
  session: SessionWithMeta;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<TrainingBlockInput[]>(() =>
    buildBlocks(session),
  );
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function updateBlock(
    index: number,
    update: Partial<TrainingBlockInput>,
  ) {
    setBlocks((current) =>
      current.map((block, currentIndex) =>
        currentIndex === index ? { ...block, ...update } : block,
      ),
    );
  }

  function addBlock() {
    setBlocks((current) => [...current, createEmptyBlock(current.length)]);
  }

  function removeBlock(index: number) {
    setBlocks((current) =>
      current
        .filter((_, currentIndex) => currentIndex !== index)
        .map((block, nextIndex) => ({
          ...block,
          orderIndex: nextIndex.toString(),
        })),
    );
  }

  function saveBlocks() {
    setError(null);

    startTransition(async () => {
      const result = await updateSessionTrainingBlocks({
        sessionId: session.id,
        blocks,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      closeModal();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setBlocks(buildBlocks(session));
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
      >
        <Icon icon="solar:layers-bold" className="size-3.5" />
        Blocks
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close training blocks modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90svh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:layers-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Training blocks
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Build the session plan with ordered drills, duration and intensity.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Icon icon="solar:close-circle-bold" className="size-3.5" />
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {blocks.map((block, index) => (
                <div
                  key={`${block.id ?? "new"}-${index}`}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm font-extrabold text-foreground">
                      Block {index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={block.completed}
                          onChange={(event) =>
                            updateBlock(index, {
                              completed: event.target.checked,
                            })
                          }
                        />
                        Completed
                      </label>
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive-soft"
                      >
                        <Icon
                          icon="solar:trash-bin-trash-bold"
                          className="size-3.5"
                        />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-5">
                    <input
                      type="number"
                      min="0"
                      className={inputClassName()}
                      value={block.orderIndex}
                      onChange={(event) =>
                        updateBlock(index, { orderIndex: event.target.value })
                      }
                      placeholder="Order"
                    />
                    <input
                      className={`${inputClassName()} md:col-span-4`}
                      value={block.title}
                      onChange={(event) =>
                        updateBlock(index, { title: event.target.value })
                      }
                      placeholder="Block title"
                    />
                    <input
                      type="number"
                      min="0"
                      className={inputClassName()}
                      value={block.plannedDurationMin}
                      onChange={(event) =>
                        updateBlock(index, {
                          plannedDurationMin: event.target.value,
                        })
                      }
                      placeholder="Planned min"
                    />
                    <input
                      type="number"
                      min="0"
                      className={inputClassName()}
                      value={block.actualDurationMin}
                      onChange={(event) =>
                        updateBlock(index, {
                          actualDurationMin: event.target.value,
                        })
                      }
                      placeholder="Actual min"
                    />
                    <select
                      className={inputClassName()}
                      value={block.intensity}
                      onChange={(event) =>
                        updateBlock(index, { intensity: event.target.value })
                      }
                    >
                      {sessionPlannedIntensitySelectOptions(block.intensity).map(
                        (opt) => (
                          <option
                            key={`${block.id ?? "new"}-int-${opt.value || "x"}`}
                            value={opt.value}
                          >
                            {opt.label}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      className={`${inputClassName()} md:col-span-2`}
                      value={block.description}
                      onChange={(event) =>
                        updateBlock(index, {
                          description: event.target.value,
                        })
                      }
                      placeholder="Description"
                    />
                    <textarea
                      className={`${inputClassName()} min-h-20 resize-none md:col-span-5`}
                      value={block.notes}
                      onChange={(event) =>
                        updateBlock(index, { notes: event.target.value })
                      }
                      placeholder="Notes"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addBlock}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
            >
              <Icon icon="solar:add-circle-bold" className="size-4" />
              Add block
            </button>

            {error ? (
              <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={saveBlocks}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Saving..." : "Save blocks"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
