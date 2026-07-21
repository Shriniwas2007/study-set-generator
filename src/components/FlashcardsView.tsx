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
      <p className="text-sm text-ink-secondary">
        No flashcards were generated.
      </p>
    );
  }

  const card = flashcards[index];
  const progress = ((index + 1) / flashcards.length) * 100;

  function goTo(newIndex: number) {
    setIndex((newIndex + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-xl flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-ink-secondary">
          <span>
            Card {index + 1} of {flashcards.length}
          </span>
          <span className="text-ink-muted">Click the card to flip</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-xl [perspective:1400px]">
        <button
          type="button"
          onClick={() => setIsFlipped((f) => !f)}
          aria-label={isFlipped ? "Show question" : "Show answer"}
          className="group relative block h-64 w-full [transform-style:preserve-3d] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-72"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front — question */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-hairline bg-surface-raised p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-300 [backface-visibility:hidden] group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_18px_36px_-8px_rgba(0,0,0,0.18)] group-active:scale-[0.99]">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Question
            </span>
            <span className="font-display text-xl leading-snug text-ink">
              {card.question}
            </span>
          </div>

          {/* Back — answer */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-accent/25 bg-accent-soft p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-300 [backface-visibility:hidden] group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_18px_36px_-8px_rgba(0,0,0,0.18)] group-active:scale-[0.99]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Answer
            </span>
            <span className="font-display text-xl leading-snug text-ink">
              {card.answer}
            </span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="flex items-center gap-1.5 rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="flex items-center gap-1.5 rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
        >
          Next
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
