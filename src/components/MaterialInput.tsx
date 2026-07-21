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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Study material
        </h2>
        <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onModeChange("paste")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "paste"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => onModeChange("upload")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
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
          className="w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600"
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
                ? "border-zinc-400 bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-900"
                : "border-zinc-200 dark:border-zinc-800"
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
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {(file.size / 1024).toFixed(0)} KB — click or drop to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Drag and drop a PDF here, or click to browse
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  PDF files only
                </p>
              </>
            )}
          </div>
          {fileError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {fileError}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
