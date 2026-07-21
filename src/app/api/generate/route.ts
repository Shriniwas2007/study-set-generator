import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf";
import { generateStudyPackage } from "@/lib/claude";
import type { DeadlineEntry } from "@/types/study";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const pastedText = formData.get("text");
  const file = formData.get("file");
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

  let materialText = "";
  if (file instanceof File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    materialText = await extractTextFromPdf(buffer);
  } else if (typeof pastedText === "string") {
    materialText = pastedText;
  }

  if (!materialText.trim()) {
    return NextResponse.json(
      { error: "Study material (file or text) is required" },
      { status: 400 },
    );
  }

  try {
    const { studyPackage, materialTruncated } = await generateStudyPackage(
      materialText,
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
