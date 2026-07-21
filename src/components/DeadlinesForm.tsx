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
      <h2 className="font-display text-lg font-semibold text-ink">
        Deadlines
      </h2>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="study-start-date"
          className="text-sm font-medium text-ink-secondary"
        >
          Study start date
        </label>
        <input
          id="study-start-date"
          type="date"
          value={studyStartDate}
          onChange={(e) => onStudyStartDateChange(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-hairline bg-page/60 p-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
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
              className="flex-1 rounded-lg border border-hairline bg-page/60 p-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
            />
            <input
              type="date"
              value={deadline.dueDate}
              onChange={(e) =>
                updateDeadline(index, { dueDate: e.target.value })
              }
              className="rounded-lg border border-hairline bg-page/60 p-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
            />
            <button
              type="button"
              onClick={() => removeDeadline(index)}
              disabled={deadlines.length === 1}
              aria-label="Remove deadline"
              className="rounded-lg border border-hairline p-2 text-sm text-ink-muted transition-colors hover:border-danger/40 hover:bg-danger-soft hover:text-danger-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:bg-transparent disabled:hover:text-ink-muted"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDeadline}
        className="self-start rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
      >
        + Add topic
      </button>
    </section>
  );
}
