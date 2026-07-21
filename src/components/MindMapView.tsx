import type { MindMap } from "@/types/study";

interface MindMapViewProps {
  mindMap: MindMap;
}

export function MindMapView({ mindMap }: MindMapViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {mindMap.topic}
      </h3>
      <ul className="flex flex-col gap-2">
        {mindMap.subtopics.map((branch, i) => (
          <li key={i}>
            <details open className="group">
              <summary className="cursor-pointer list-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 marker:content-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
                {branch.point}
              </summary>
              {branch.subtopics.length > 0 && (
                <ul className="ml-4 mt-2 flex flex-col gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                  {branch.subtopics.map((subtopic, j) => (
                    <li key={j}>
                      <details open>
                        <summary className="cursor-pointer list-none rounded-md px-2 py-1 text-sm font-medium text-zinc-700 marker:content-none dark:text-zinc-300">
                          {subtopic.point}
                        </summary>
                        {subtopic.subtopics.length > 0 && (
                          <ul className="ml-4 mt-1 flex flex-col gap-1 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                            {subtopic.subtopics.map((point, k) => (
                              <li
                                key={k}
                                className="px-2 py-0.5 text-sm text-zinc-500 dark:text-zinc-400"
                              >
                                {point.point}
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
