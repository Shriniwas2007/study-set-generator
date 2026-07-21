"use client";

import type { DeadlineEntry } from "@/types/study";

interface DeadlinesFormProps {
  studyStartDate: string;
  onStudyStartDateChange: (date: string) => void;
  deadlines: DeadlineEntry[];
  onDeadlinesChange: (deadlines: DeadlineEntry[]) => void;
}

export function DeadlinesForm({
  studyStartDate,
  onStudyStartDateChange,
  deadlines,
  onDeadlinesChange,
}: DeadlinesFormProps) {
  function updateDeadline(index: number, patch: Partial<DeadlineEntry>) {
    onDeadlinesChange(
      deadlines.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  }

  function addDeadline() {
    onDeadlinesChange([...deadlines, { topic: "", dueDate: "" }]);
  }

  function removeDeadline(index: number) {
    onDeadlinesChange(deadlines.filter((_, i) => i !== index));
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Deadlines
      </h2>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="study-start-date"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Study start date
        </label>
        <input
          id="study-start-date"
          type="date"
          value={studyStartDate}
          onChange={(e) => onStudyStartDateChange(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        {deadlines.map((deadline, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={deadline.topic}
              onChange={(e) =>
                updateDeadline(index, { topic: e.target.value })
              }
              placeholder="Topic name"
              className="flex-1 rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600"
            />
            <input
              type="date"
              value={deadline.dueDate}
              onChange={(e) =>
                updateDeadline(index, { dueDate: e.target.value })
              }
              className="rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600"
            />
            <button
              type="button"
              onClick={() => removeDeadline(index)}
              disabled={deadlines.length === 1}
              aria-label="Remove deadline"
              className="rounded-lg border border-zinc-200 p-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDeadline}
        className="self-start rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        + Add topic
      </button>
    </section>
  );
}
