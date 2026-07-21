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

export function StudyPlanView({ studyPlan }: StudyPlanViewProps) {
  if (studyPlan.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        No study plan was generated.
      </p>
    );
  }

  const today = todayStr();

  return (
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
  );
}
