"use client";

import { useState } from "react";
import type { Flashcard } from "@/types/study";

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

export function FlashcardsView({ flashcards }: FlashcardsViewProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No flashcards were generated.
      </p>
    );
  }

  const card = flashcards[index];

  function goTo(newIndex: number) {
    setIndex((newIndex + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Card {index + 1} of {flashcards.length}
      </p>

      <button
        type="button"
        onClick={() => setIsFlipped((f) => !f)}
        className="flex min-h-52 w-full max-w-xl flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {isFlipped ? "Answer" : "Question"}
        </span>
        <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {isFlipped ? card.answer : card.question}
        </span>
        <span className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          Click to flip
        </span>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Next
        </button>
      </div>
    </div>
  );
}
