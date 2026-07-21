import type { MindMap } from "@/types/study";

interface MindMapViewProps {
  mindMap: MindMap;
}

export function MindMapView({ mindMap }: MindMapViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" />
        <h3 className="font-display text-xl font-semibold text-ink">
          {mindMap.topic}
        </h3>
      </div>

      <ul className="flex flex-col gap-1 border-l border-hairline pl-5">
        {mindMap.subtopics.map((branch, i) => (
          <li
            key={i}
            className="relative before:absolute before:-left-5 before:top-[19px] before:h-px before:w-5 before:bg-hairline"
          >
            <details open className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1 marker:content-none hover:bg-accent-soft/60">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="text-[15px] font-semibold text-ink">
                  {branch.point}
                </span>
              </summary>

              {branch.subtopics.length > 0 && (
                <ul className="mt-1 ml-2.5 flex flex-col gap-1 border-l border-hairline pl-5">
                  {branch.subtopics.map((subtopic, j) => (
                    <li
                      key={j}
                      className="relative before:absolute before:-left-5 before:top-[17px] before:h-px before:w-5 before:bg-hairline"
                    >
                      <details open>
                        <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 marker:content-none hover:bg-accent-soft/60">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/65" />
                          <span className="text-sm font-medium text-ink-secondary">
                            {subtopic.point}
                          </span>
                        </summary>

                        {subtopic.subtopics.length > 0 && (
                          <ul className="mt-1 ml-2 flex flex-col gap-1.5 border-l border-hairline pl-5">
                            {subtopic.subtopics.map((point, k) => (
                              <li
                                key={k}
                                className="relative flex items-center gap-2.5 py-0.5 pl-1 before:absolute before:-left-5 before:top-[11px] before:h-px before:w-5 before:bg-hairline"
                              >
                                <span className="h-1 w-1 shrink-0 rounded-full bg-accent/35" />
                                <span className="text-sm text-ink-muted">
                                  {point.point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
