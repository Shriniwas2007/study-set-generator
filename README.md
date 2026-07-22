# AI Study Scheduler

Upload your notes (or a PDF), add your deadlines, and get back a complete study package: flashcards, a mind map, a quiz with weak-point tracking, and a day-by-day study plan — sequenced against your actual dates, exportable straight to your calendar.

**[Live demo →](your-vercel-url-here)** · **[Repo →](your-github-url-here)**

## Why I built this

Going into my second year, I wanted a tool that did more than summarize notes — something that actually reasons about *when* to study *what*, given real deadlines, not just a wall of flashcards with no structure. Most AI study tools stop at "here are some flashcards." This one plans your time too.

## What it does

Give it study material (pasted text or a PDF) plus a list of topics and due dates, and one Claude API call generates four structured outputs at once:

- **Flashcards** — question/answer pairs covering the key concepts
- **Mind map** — a hierarchical breakdown of topics → subtopics → key points, rendered as a real connecting-line diagram
- **Quiz** — multiple choice questions with explanations, plus a **weak-point summary** at the end that maps wrong answers back to the specific topics they came from
- **Study plan** — a day-by-day schedule from your start date to your deadline, front-loading harder topics earlier and scheduling review/quiz days before each deadline, with a rough time estimate per day

From there, a one-click **"Add to Calendar"** button exports the whole plan as an `.ics` file, importable into Google Calendar, Apple Calendar, or Outlook.

### Example

Tested against ICSE Class 10 Biology notes on photosynthesis and respiration, with a "Biology Chapter Test" deadline one week out. The generated quiz correctly distinguished aerobic vs. anaerobic respiration and flagged photosynthesis's light-dependent vs. light-independent stages as separate weak-point areas when answered incorrectly — the study plan scheduled leaf-structure content on day one (foundational) and left the last two days for review and a full practice quiz before the test date.

## Architecture

```
Upload (PDF or text) + deadlines
        │
        ▼
  Text extraction (pdf-parse, server-side)
        │
        ▼
  Claude Sonnet 5 — single structured-output call
  (flashcards + mindMap + quiz + studyPlan, one schema)
        │
        ▼
  Four interactive views (Next.js / React)
  + .ics calendar export
```

- **Next.js (App Router) + TypeScript + Tailwind** — same foundation across the frontend and API routes
- **Claude API (Sonnet 5)**, called via `client.messages.stream()` with a Zod-validated structured output schema, so the response is guaranteed to match the app's types rather than being parsed out of free-form text
- **pdf-parse** for server-side text extraction from uploaded PDFs
- Deployed on **Vercel**, auto-deploying from `main`

## Interesting problems along the way

**Recursive schemas aren't supported in structured outputs.** The mind map is naturally recursive (a topic contains subtopics, which contain more subtopics), but Claude's structured-output schema validation doesn't support self-referencing types. I redesigned it as three fixed, non-recursive levels (`MindMapBranch → MindMapSubtopic → MindMapPoint`), with the deepest level's children left empty when only two levels of depth are needed. Same effective flexibility, without fighting the schema validator.

**Streaming over blocking calls.** A single generation call produces four separate outputs — flashcards, a full quiz, a multi-day plan — which can run long. Using `client.messages.stream()` with `.finalMessage()` instead of a plain `.create()` avoids HTTP timeout risk on larger responses, at the cost of slightly more complex response handling.

**Google Calendar: OAuth vs. a plain file.** Real-time Google Calendar sync would need OAuth, and Google requires manual "test user" approval for any app not through their full verification review — a poor fit for something meant to be shared freely with anyone who has the link. Exporting a standard `.ics` file instead means anyone can add the plan to *any* calendar app, with no login, no verification process, and no maintenance burden on my end.

## Running locally

```bash
git clone <repo-url>
cd study-set-generator
npm install
cp .env.example .env.local   # add your own ANTHROPIC_API_KEY
npm run dev
```

## What I'd add with more time

- Persist generated sets (would need a lightweight database like Supabase) so users can save and revisit past study packages instead of a single-session flow
- Spaced-repetition scheduling for flashcards, resurfacing cards marked "review again" more frequently
- Multi-document input, so a full syllabus across several files can be planned as one unified set

## Stack

Next.js · TypeScript · Tailwind CSS · Claude API (Anthropic SDK) · pdf-parse · Vercel
