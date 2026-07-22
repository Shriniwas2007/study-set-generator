"use client";

import { useState } from "react";
import { downloadIcsFile, generateStudyPlanIcs } from "@/lib/ics";
import type { StudyPlanDay } from "@/types/study";

interface StudyPlanViewProps {
  studyPlan: StudyPlanDay[];
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `~${hours}h` : `~${hours}h ${remainder}m`;
}

export function StudyPlanView({ studyPlan }: StudyPlanViewProps) {
  const [calendarError, setCalendarError] = useState<string | null>(null);

  if (studyPlan.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        No study plan was generated.
      </p>
    );
  }

  const today = todayStr();

  function handleAddToCalendar() {
    const { error, value } = generateStudyPlanIcs(studyPlan);
    if (error || !value) {
      setCalendarError("Couldn't generate the calendar file. Please try again.");
      return;
    }
    setCalendarError(null);
    downloadIcsFile(value, "study-plan.ics");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-end gap-1.5 self-end">
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="flex items-center gap-2 rounded-lg border border-hairline px-3.5 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M12 14v6M9 17h6" />
          </svg>
          Add to Calendar
        </button>
        {calendarError && (
          <p className="text-xs text-danger">{calendarError}</p>
        )}
      </div>

      <ol className="flex flex-col">
        {studyPlan.map((day, i) => {
          const isToday = day.date === today;
          return (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={
                    isToday
                      ? "mt-0.5 h-4 w-4 shrink-0 rounded-full bg-accent ring-4 ring-accent-soft"
                      : "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-ink-muted"
                  }
                />
                {i < studyPlan.length - 1 && (
                  <div className="w-px flex-1 bg-hairline" />
                )}
              </div>
              <div className="flex flex-col gap-2 pb-6">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${isToday ? "text-accent" : "text-ink"}`}
                  >
                    {formatDate(day.date)}
                  </p>
                  {isToday && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-ink uppercase">
                      Today
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-ink-muted">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    {formatMinutes(day.estimatedMinutes)}
                  </span>
                </div>
                {day.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {day.topics.map((topic, j) => (
                      <span
                        key={j}
                        className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="flex flex-col gap-1">
                  {day.tasks.map((task, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-ink-secondary"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-muted" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
