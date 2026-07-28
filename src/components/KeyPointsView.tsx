import type { KeyPointGroup } from "@/types/study";

interface KeyPointsViewProps {
  keyPoints: KeyPointGroup[];
}

// Points come back from Claude with **term** markers around the key term or
// value, per the prompt in claude.ts — split on that and bold the matches.
function renderPoint(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part !== "");
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function KeyPointsView({ keyPoints }: KeyPointsViewProps) {
  if (keyPoints.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        No key points were generated.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Cram sheet — scan before the test
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {keyPoints.map((group, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 rounded-xl border border-hairline bg-page/60 p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
              <h3 className="font-display text-[15px] font-semibold text-ink">
                {group.topic}
              </h3>
            </div>
            <ul className="flex flex-col gap-1.5">
              {group.points.map((point, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm leading-snug text-ink-secondary"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50" />
                  <span>{renderPoint(point)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
