"use client";

import { useRef, useState } from "react";

export type MaterialMode = "paste" | "upload";

interface MaterialInputProps {
  mode: MaterialMode;
  onModeChange: (mode: MaterialMode) => void;
  text: string;
  onTextChange: (text: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function MaterialInput({
  mode,
  onModeChange,
  text,
  onTextChange,
  file,
  onFileChange,
}: MaterialInputProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFile(candidate: File | undefined) {
    if (!candidate) return;
    const isPdf =
      candidate.type === "application/pdf" ||
      candidate.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileError("Please upload a PDF file.");
      return;
    }
    setFileError(null);
    onFileChange(candidate);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(false);
    acceptFile(e.dataTransfer.files[0]);
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">
          Study material
        </h2>
        <div className="flex rounded-lg border border-hairline p-0.5">
          <button
            type="button"
            onClick={() => onModeChange("paste")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "paste"
                ? "bg-accent text-accent-ink"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => onModeChange("upload")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-accent text-accent-ink"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Upload PDF
          </button>
        </div>
      </div>

      {mode === "paste" ? (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your lecture notes, textbook chapter, or other study material here..."
          rows={12}
          className="w-full resize-y rounded-lg border border-hairline bg-page/60 p-3 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
        />
      ) : (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              isDragActive
                ? "border-accent bg-accent-soft"
                : "border-hairline hover:border-ink-muted"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            {file ? (
              <>
                <p className="text-sm font-medium text-ink">{file.name}</p>
                <p className="text-xs text-ink-muted">
                  {(file.size / 1024).toFixed(0)} KB — click or drop to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-ink">
                  Drag and drop a PDF here, or click to browse
                </p>
                <p className="text-xs text-ink-muted">PDF files only</p>
              </>
            )}
          </div>
          {fileError && (
            <p className="mt-2 text-sm text-danger">{fileError}</p>
          )}
        </div>
      )}
    </section>
  );
}
