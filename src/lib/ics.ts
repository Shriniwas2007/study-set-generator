import { createEvents, type DateArray, type EventAttributes } from "ics";
import type { StudyPlanDay } from "@/types/study";

function parseDateArray(dateStr: string): DateArray {
  const [year, month, day] = dateStr.split("-").map(Number);
  return [year, month, day];
}

function nextDayArray(dateStr: string): DateArray {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
}

export function generateStudyPlanIcs(studyPlan: StudyPlanDay[]) {
  const events: EventAttributes[] = studyPlan.map((day) => {
    const title =
      day.topics.length > 0 ? day.topics.join(", ") : "Study session";
    const description =
      day.tasks.length > 0
        ? day.tasks.map((task) => `- ${task}`).join("\n")
        : undefined;

    return {
      title,
      description,
      start: parseDateArray(day.date),
      end: nextDayArray(day.date),
      status: "CONFIRMED",
    };
  });

  return createEvents(events, { calName: "AI Study Scheduler Plan" });
}

export function downloadIcsFile(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
