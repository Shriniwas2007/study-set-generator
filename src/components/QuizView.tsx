"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/types/study";

interface QuizViewProps {
  quiz: QuizQuestion[];
}

export function QuizView({ quiz }: QuizViewProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(quiz.length).fill(null),
  );

  if (quiz.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No quiz questions were generated.
      </p>
    );
  }

  const isFinished = index === quiz.length;

  if (isFinished) {
    const score = answers.filter(
      (a, i) => a === quiz[i].correctIndex,
    ).length;

    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          You scored {score} / {quiz.length}
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setAnswers(new Array(quiz.length).fill(null));
          }}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Question {index + 1} of {quiz.length}
      </p>

      <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {question.question}
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;

          let stateClasses =
            "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700";
          if (hasAnswered) {
            if (isCorrect) {
              stateClasses =
                "border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-950";
            } else if (isSelected) {
              stateClasses =
                "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950";
            }
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => selectOption(i)}
              disabled={hasAnswered}
              className={`rounded-lg border px-4 py-3 text-left text-sm text-zinc-900 transition-colors disabled:cursor-default dark:text-zinc-50 ${stateClasses}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {question.explanation}
        </div>
      )}

      <button
        type="button"
        onClick={next}
        disabled={!hasAnswered}
        className="self-start rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {index === quiz.length - 1 ? "Finish" : "Next question"}
      </button>
    </div>
  );
}
