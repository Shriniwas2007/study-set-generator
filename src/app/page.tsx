"use client";

import { useState } from "react";
import { MaterialInput, type MaterialMode } from "@/components/MaterialInput";
import { DeadlinesForm } from "@/components/DeadlinesForm";
import { Tabs } from "@/components/Tabs";
import { FlashcardsView } from "@/components/FlashcardsView";
import { MindMapView } from "@/components/MindMapView";
import { QuizView } from "@/components/QuizView";
import { StudyPlanView } from "@/components/StudyPlanView";
import { KeyPointsView } from "@/components/KeyPointsView";
import type { DeadlineEntry, StudyPackage } from "@/types/study";

const RESULT_TABS = [
  { id: "flashcards", label: "Flashcards" },
  { id: "mindmap", label: "Mind Map" },
  { id: "quiz", label: "Quiz" },
  { id: "plan", label: "Study Plan" },
  { id: "keypoints", label: "Important Points" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function BrandMark() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-sm shadow-accent/20">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6.5c-1.8-1.4-4-2-6.5-2-.6 0-1 .4-1 1v11c0 .6.4 1 1 1 2.5 0 4.7.6 6.5 2 1.8-1.4 4-2 6.5-2 .6 0 1-.4 1-1v-11c0-.6-.4-1-1-1-2.5 0-4.7.6-6.5 2Z" />
        <path d="M12 6.5v13" />
      </svg>
    </div>
  );
}

export default function Home() {
  const [materialMode, setMaterialMode] = useState<MaterialMode>("paste");
  const [materialText, setMaterialText] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialImages, setMaterialImages] = useState<File[]>([]);

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
    if (materialMode === "image" && materialImages.length === 0) {
      return "Please upload at least one image.";
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
      } else if (materialMode === "image" && materialImages.length > 0) {
        for (const image of materialImages) {
          formData.append("images", image);
        }
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
    <div className="flex flex-1 flex-col items-center bg-page py-12">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-6">
        <header className="flex items-center gap-3.5">
          <BrandMark />
          <div className="flex flex-col gap-0.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              AI Study Scheduler
            </h1>
            <p className="text-sm text-ink-secondary">
              Upload your material and deadlines to generate flashcards, a
              mind map, a quiz, and a day-by-day study plan.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 rounded-2xl border border-hairline bg-surface p-6 shadow-sm sm:p-8"
        >
          <MaterialInput
            mode={materialMode}
            onModeChange={setMaterialMode}
            text={materialText}
            onTextChange={setMaterialText}
            file={materialFile}
            onFileChange={setMaterialFile}
            images={materialImages}
            onImagesChange={setMaterialImages}
          />

          <DeadlinesForm
            studyStartDate={studyStartDate}
            onStudyStartDateChange={setStudyStartDate}
            deadlines={deadlines}
            onDeadlinesChange={setDeadlines}
          />

          {error && (
            <p className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger-ink">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition-all hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
            <div
              key={activeResultTab}
              className="animate-panel-in rounded-2xl border border-hairline bg-surface p-6 shadow-sm sm:p-8"
            >
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
              {activeResultTab === "keypoints" && (
                <KeyPointsView keyPoints={result.keyPoints} />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
