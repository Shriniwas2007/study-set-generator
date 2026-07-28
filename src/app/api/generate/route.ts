import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf";
import {
  generateStudyPackage,
  type MaterialImage,
  type MaterialImageMediaType,
  type StudyMaterial,
} from "@/lib/claude";
import type { DeadlineEntry } from "@/types/study";

const SUPPORTED_IMAGE_MEDIA_TYPES: MaterialImageMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function isSupportedImageMediaType(
  type: string,
): type is MaterialImageMediaType {
  return (SUPPORTED_IMAGE_MEDIA_TYPES as string[]).includes(type);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const pastedText = formData.get("text");
  const file = formData.get("file");
  const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);
  const studyStartDate = formData.get("studyStartDate");
  const deadlinesRaw = formData.get("deadlines");

  if (typeof studyStartDate !== "string" || !studyStartDate) {
    return NextResponse.json(
      { error: "studyStartDate is required" },
      { status: 400 },
    );
  }

  if (typeof deadlinesRaw !== "string") {
    return NextResponse.json(
      { error: "deadlines is required" },
      { status: 400 },
    );
  }

  let deadlines: DeadlineEntry[];
  try {
    deadlines = JSON.parse(deadlinesRaw);
  } catch {
    return NextResponse.json(
      { error: "deadlines must be valid JSON" },
      { status: 400 },
    );
  }

  if (!Array.isArray(deadlines) || deadlines.length === 0) {
    return NextResponse.json(
      { error: "At least one deadline is required" },
      { status: 400 },
    );
  }

  let material: StudyMaterial;

  if (imageFiles.length > 0) {
    const images: MaterialImage[] = [];
    for (const image of imageFiles) {
      if (!isSupportedImageMediaType(image.type)) {
        return NextResponse.json(
          {
            error: `Unsupported image type "${image.type || "unknown"}" for "${image.name}". Please upload JPG, PNG, GIF, or WEBP images.`,
          },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await image.arrayBuffer());
      images.push({ base64: buffer.toString("base64"), mediaType: image.type });
    }
    material = { type: "images", images };
  } else {
    let materialText = "";
    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      materialText = await extractTextFromPdf(buffer);
    } else if (typeof pastedText === "string") {
      materialText = pastedText;
    }

    if (!materialText.trim()) {
      return NextResponse.json(
        { error: "Study material (file, text, or images) is required" },
        { status: 400 },
      );
    }

    material = { type: "text", text: materialText };
  }

  try {
    const { studyPackage, materialTruncated } = await generateStudyPackage(
      material,
      deadlines,
      studyStartDate,
    );

    return NextResponse.json({ ...studyPackage, materialTruncated });
  } catch (err) {
    const isMissingCredentials =
      err instanceof Error && err.message.includes("Could not resolve authentication method");

    if (err instanceof Anthropic.AuthenticationError || isMissingCredentials) {
      return NextResponse.json(
        { error: "Anthropic API key is missing or invalid. Check ANTHROPIC_API_KEY." },
        { status: 500 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${err.message}` },
        { status: 502 },
      );
    }

    const message = err instanceof Error ? err.message : "Failed to generate study package.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
