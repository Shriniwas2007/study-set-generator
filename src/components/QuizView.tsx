"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/types/study";

interface QuizViewProps {
  quiz: QuizQuestion[];
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const pct = total === 0 ? 0 : score / total;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative h-36 w-36 animate-ring-in">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-hairline"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold text-ink">
          {score}/{total}
        </span>
        <span className="text-xs text-ink-secondary">
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
}

export function QuizView({ quiz }: QuizViewProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(quiz.length).fill(null),
  );

  if (quiz.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        No quiz questions were generated.
      </p>
    );
  }

  const isFinished = index === quiz.length;

  if (isFinished) {
    const score = answers.filter(
      (a, i) => a === quiz[i].correctIndex,
    ).length;
    const verdict =
      score === quiz.length
        ? "Perfect score."
        : score >= quiz.length / 2
          ? "Nice work."
          : "Worth another pass.";

    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <ScoreRing score={score} total={quiz.length} />
        <p className="font-display text-lg font-semibold text-ink">
          {verdict}
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setAnswers(new Array(quiz.length).fill(null));
          }}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition-all hover:bg-accent-hover active:scale-[0.98]"
        >
          Retake quiz
        </button>
      </div>
    );
  }

  const question = quiz[index];
  const hasAnswered = selected !== null;

  function selectOption(optionIndex: number) {
    if (hasAnswered) return;
    setSelected(optionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-secondary">
        Question {index + 1} of {quiz.length}
      </p>

      <p className="font-display text-xl text-ink">{question.question}</p>

      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;

          let stateClasses =
            "border-hairline hover:border-accent/50 hover:bg-accent-soft/50";
          let animationClass = "";
          if (hasAnswered) {
            if (isCorrect) {
              stateClasses = "border-success bg-success-soft";
              animationClass = "animate-pulse-correct";
            } else if (isSelected) {
              stateClasses = "border-danger bg-danger-soft";
              animationClass = "animate-shake-incorrect";
            } else {
              stateClasses = "border-hairline opacity-60";
            }
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => selectOption(i)}
              disabled={hasAnswered}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm text-ink transition-colors disabled:cursor-default ${stateClasses} ${animationClass}`}
            >
              <span>{option}</span>
              {hasAnswered && isCorrect && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-success"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-danger"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="rounded-lg bg-accent-soft p-4 text-sm text-ink">
          {question.explanation}
        </div>
      )}

      <button
        type="button"
        onClick={next}
        disabled={!hasAnswered}
        className="self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition-all hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {index === quiz.length - 1 ? "Finish" : "Next question"}
      </button>
    </div>
  );
}
