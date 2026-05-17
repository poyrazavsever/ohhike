"use client";

import type { SportType } from "../../../../lib/database.types";
import type { PublicCoachSort } from "../../../../lib/coach-network/types";
import { useRouter, useSearchParams } from "next/navigation";

const sportOptions: Array<{ value: SportType | ""; label: string }> = [
  { value: "", label: "All sports" },
  { value: "running", label: "Running" },
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "fitness", label: "Fitness" },
  { value: "tennis", label: "Tennis" },
  { value: "swimming", label: "Swimming" },
];

const sortOptions: Array<{ value: PublicCoachSort; label: string }> = [
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
];

function fieldClassName() {
  return "h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function FindCoachFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(`/find-coach?${params.toString()}`);
  }

  return (
    <form
      className="grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();

        const q = String(formData.get("q") ?? "").trim();
        const sport = String(formData.get("sport") ?? "");
        const sort = String(formData.get("sort") ?? "rating");
        const remote = formData.get("remote") === "on";

        if (q) params.set("q", q);
        if (sport) params.set("sport", sport);
        if (sort) params.set("sort", sort);
        if (remote) params.set("remote", "1");

        router.replace(`/find-coach?${params.toString()}`);
      }}
    >
      <input
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Search coaches"
        className={`${fieldClassName()} md:col-span-2`}
      />
      <select
        name="sport"
        defaultValue={searchParams.get("sport") ?? ""}
        className={fieldClassName()}
        onChange={(event) => updateParam("sport", event.target.value)}
      >
        {sportOptions.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        name="sort"
        defaultValue={searchParams.get("sort") ?? "rating"}
        className={fieldClassName()}
        onChange={(event) => updateParam("sort", event.target.value)}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground md:col-span-4">
        <input
          type="checkbox"
          name="remote"
          defaultChecked={searchParams.get("remote") === "1"}
          className="size-4 rounded border-border"
        />
        Remote coaching only
      </label>
      <button
        type="submit"
        className="h-11 rounded-full bg-primary px-5 text-sm font-extrabold text-white hover:bg-primary-hover md:col-span-4 md:w-fit"
      >
        Search
      </button>
    </form>
  );
}
