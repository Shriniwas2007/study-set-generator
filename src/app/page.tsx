"use client";

import { useState } from "react";
import { MaterialInput, type MaterialMode } from "@/components/MaterialInput";
import { DeadlinesForm } from "@/components/DeadlinesForm";
import { Tabs } from "@/components/Tabs";
import { FlashcardsView } from "@/components/FlashcardsView";
import { MindMapView } from "@/components/MindMapView";
import { QuizView } from "@/components/QuizView";
import { StudyPlanView } from "@/components/StudyPlanView";
import type { DeadlineEntry, StudyPackage } from "@/types/study";

const RESULT_TABS = [
  { id: "flashcards", label: "Flashcards" },
  { id: "mindmap", label: "Mind Map" },
  { id: "quiz", label: "Quiz" },
  { id: "plan", label: "Study Plan" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [materialMode, setMaterialMode] = useState<MaterialMode>("paste");
  const [materialText, setMaterialText] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  const [studyStartDate, setStudyStartDate] = useState(today());
  const [deadlines, setDeadlines] = useState<DeadlineEntry[]>([
    { topic: "", dueDate: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudyPackage | null>(null);
  const [activeResultTab, setActiveResultTab] = useState("flashcards");

  function validate(): string | null {
    if (materialMode === "paste" && !materialText.trim()) {
      return "Please paste your study material.";
    }
    if (materialMode === "upload" && !materialFile) {
      return "Please upload a PDF.";
    }
    if (!studyStartDate) {
      return "Please set a study start date.";
    }
    const cleanedDeadlines = deadlines.filter(
      (d) => d.topic.trim() && d.dueDate,
    );
    if (cleanedDeadlines.length === 0) {
      return "Please add at least one topic with a due date.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("studyStartDate", studyStartDate);
      formData.set(
        "deadlines",
        JSON.stringify(deadlines.filter((d) => d.topic.trim() && d.dueDate)),
      );

      if (materialMode === "upload" && materialFile) {
        formData.set("file", materialFile);
      } else {
        formData.set("text", materialText);
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setResult(data as StudyPackage);
      setActiveResultTab("flashcards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 py-12 dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            AI Study Scheduler
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Upload your material and deadlines to generate flashcards, a mind
            map, a quiz, and a day-by-day study plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <MaterialInput
            mode={materialMode}
            onModeChange={setMaterialMode}
            text={materialText}
            onTextChange={setMaterialText}
            file={materialFile}
            onFileChange={setMaterialFile}
          />

          <DeadlinesForm
            studyStartDate={studyStartDate}
            onStudyStartDateChange={setStudyStartDate}
            deadlines={deadlines}
            onDeadlinesChange={setDeadlines}
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? "Generating..." : "Generate study package"}
          </button>
        </form>

        {result && (
          <section className="flex flex-col gap-4">
            <Tabs
              tabs={RESULT_TABS}
              activeTab={activeResultTab}
              onChange={setActiveResultTab}
            />
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              {activeResultTab === "flashcards" && (
                <FlashcardsView flashcards={result.flashcards} />
              )}
              {activeResultTab === "mindmap" && (
                <MindMapView mindMap={result.mindMap} />
              )}
              {activeResultTab === "quiz" && <QuizView quiz={result.quiz} />}
              {activeResultTab === "plan" && (
                <StudyPlanView studyPlan={result.studyPlan} />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
