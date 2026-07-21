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

export function StudyPlanView({ studyPlan }: StudyPlanViewProps) {
  if (studyPlan.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No study plan was generated.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {studyPlan.map((day, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-50" />
            {i < studyPlan.length - 1 && (
              <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            )}
          </div>
          <div className="flex flex-col gap-2 pb-6">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {formatDate(day.date)}
            </p>
            {day.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {day.topics.map((topic, j) => (
                  <span
                    key={j}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
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
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
