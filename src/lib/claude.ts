import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import type { DeadlineEntry, StudyPackage } from "@/types/study";

const client = new Anthropic();

const MODEL = "claude-sonnet-5";

// Sonnet 5's 1M-token context window comfortably fits far more than this, but
// a hard cap keeps latency and cost predictable for a single lecture-note /
// textbook-chapter upload, which is the app's stated scope.
const MAX_MATERIAL_CHARS = 300_000;

const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const MindMapPointSchema = z.object({
  point: z.string(),
});

const MindMapSubtopicSchema = z.object({
  point: z.string(),
  subtopics: z.array(MindMapPointSchema),
});

const MindMapBranchSchema = z.object({
  point: z.string(),
  subtopics: z.array(MindMapSubtopicSchema),
});

const MindMapSchema = z.object({
  topic: z.string(),
  subtopics: z.array(MindMapBranchSchema),
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
  topic: z.string(),
});

const StudyPlanDaySchema = z.object({
  date: z.string(),
  topics: z.array(z.string()),
  tasks: z.array(z.string()),
  estimatedMinutes: z.number().int().min(1),
});

const StudyPackageSchema = z.object({
  flashcards: z.array(FlashcardSchema),
  mindMap: MindMapSchema,
  quiz: z.array(QuizQuestionSchema),
  studyPlan: z.array(StudyPlanDaySchema),
});

export interface GenerateStudyPackageResult {
  studyPackage: StudyPackage;
  materialTruncated: boolean;
}

export async function generateStudyPackage(
  materialText: string,
  deadlines: DeadlineEntry[],
  studyStartDate: string,
): Promise<GenerateStudyPackageResult> {
  const materialTruncated = materialText.length > MAX_MATERIAL_CHARS;
  const truncatedMaterial = materialTruncated
    ? materialText.slice(0, MAX_MATERIAL_CHARS)
    : materialText;

  const deadlinesList = deadlines
    .map((d) => `- ${d.topic}: due ${d.dueDate}`)
    .join("\n");

  const prompt = `You are an expert study coach. Generate a complete study package from the material and deadlines below.

Study start date: ${studyStartDate}

Deadlines:
${deadlinesList}

Study material:
<material>
${truncatedMaterial}
</material>

Generate:
- flashcards: question/answer pairs covering the key concepts in the material.
- mindMap: a hierarchical breakdown of the material's topic structure, nested up to three levels below the root topic (leave "subtopics" empty on nodes that don't need to go deeper).
- quiz: multiple-choice questions, each with exactly 4 options, a zero-based correctIndex, an explanation of the correct answer, and a "topic" field naming the specific topic or subtopic it tests. Use the same topic names that appear in the mind map (a branch or subtopic label) or in the deadlines list, so a wrong answer can be traced back to a recognizable topic the user can go review.
- studyPlan: a day-by-day plan with one entry per study day from ${studyStartDate} through the last deadline. Front-load harder or foundational topics earlier, and schedule review and quiz days immediately before each deadline. Each day also needs "estimatedMinutes": a rough, honest estimate of study time in minutes for that day, based on how much material and how many tasks that day covers (a light review day might be 20-30 minutes, a day introducing several new foundational topics might be 60-90 minutes).`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    output_config: {
      format: zodOutputFormat(StudyPackageSchema),
    },
    messages: [{ role: "user", content: prompt }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("Claude declined to generate a study package for this material.");
  }

  if (!message.parsed_output) {
    throw new Error("Claude's response did not match the expected study package format.");
  }

  return { studyPackage: message.parsed_output, materialTruncated };
}
