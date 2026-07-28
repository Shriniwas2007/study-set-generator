"use client";

import { useRef, useState } from "react";

export type MaterialMode = "paste" | "upload" | "image";

interface MaterialInputProps {
  mode: MaterialMode;
  onModeChange: (mode: MaterialMode) => void;
  text: string;
  onTextChange: (text: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  images: File[];
  onImagesChange: (images: File[]) => void;
}

const HEIC_EXTENSION = /\.hei[cf]$/i;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|hei[cf])$/i;

// Claude's vision input only accepts these four media types — HEIC photos
// (the default on iPhone) have to be converted client-side before upload.
async function convertHeicToJpeg(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(
          new Error(
            `This browser can't preview "${file.name}". Please convert HEIC photos to JPG or PNG before uploading.`,
          ),
        );
      el.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error(`Could not convert "${file.name}" to JPG.`);

    return new File([blob], file.name.replace(HEIC_EXTENSION, ".jpg"), {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Caches one object URL per File (rather than minting a fresh one on every
// render) so thumbnails stay stable and preview URLs can be revoked by
// reference when an image is removed.
const objectUrlCache = new WeakMap<File, string>();

function getImageUrl(file: File): string {
  let url = objectUrlCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    objectUrlCache.set(file, url);
  }
  return url;
}

export function MaterialInput({
  mode,
  onModeChange,
  text,
  onTextChange,
  file,
  onFileChange,
  images,
  onImagesChange,
}: MaterialInputProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isImageDragActive, setIsImageDragActive] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  async function acceptImages(candidates: FileList | File[]) {
    const accepted: File[] = [];
    let error: string | null = null;

    for (const candidate of Array.from(candidates)) {
      const isImage =
        candidate.type.startsWith("image/") ||
        IMAGE_EXTENSIONS.test(candidate.name);
      if (!isImage) {
        error = `"${candidate.name}" isn't an image file.`;
        continue;
      }

      const isHeic =
        candidate.type === "image/heic" ||
        candidate.type === "image/heif" ||
        HEIC_EXTENSION.test(candidate.name);

      if (!isHeic) {
        accepted.push(candidate);
        continue;
      }

      try {
        accepted.push(await convertHeicToJpeg(candidate));
      } catch (err) {
        error = err instanceof Error ? err.message : "Could not process HEIC image.";
      }
    }

    setImageError(error);
    if (accepted.length > 0) {
      onImagesChange([...images, ...accepted]);
    }
  }

  function handleImageDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsImageDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      void acceptImages(e.dataTransfer.files);
    }
  }

  function removeImage(index: number) {
    const removed = images[index];
    const url = objectUrlCache.get(removed);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlCache.delete(removed);
    }
    onImagesChange(images.filter((_, i) => i !== index));
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
          <button
            type="button"
            onClick={() => onModeChange("image")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "image"
                ? "bg-accent text-accent-ink"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Upload Image
          </button>
        </div>
      </div>

      {mode === "paste" && (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your lecture notes, textbook chapter, or other study material here..."
          rows={12}
          className="w-full resize-y rounded-lg border border-hairline bg-page/60 p-3 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
        />
      )}

      {mode === "upload" && (
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

      {mode === "image" && (
        <div className="flex flex-col gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsImageDragActive(true);
            }}
            onDragLeave={() => setIsImageDragActive(false)}
            onDrop={handleImageDrop}
            onClick={() => imageInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              isImageDragActive
                ? "border-accent bg-accent-soft"
                : "border-hairline hover:border-ink-muted"
            }`}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void acceptImages(e.target.files);
                }
                e.target.value = "";
              }}
            />
            <p className="text-sm font-medium text-ink">
              Drag and drop photos here, or click to browse
            </p>
            <p className="text-xs text-ink-muted">
              JPG, PNG, GIF, WEBP, or HEIC — add multiple pages in order
            </p>
          </div>
          {imageError && (
            <p className="text-sm text-danger">{imageError}</p>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img, index) => (
                <div
                  key={`${img.name}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-hairline bg-page/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(img)}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs font-semibold text-page opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove ${img.name}`}
                  >
                    ×
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-page">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
