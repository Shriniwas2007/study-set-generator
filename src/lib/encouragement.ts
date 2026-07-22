const ENCOURAGEMENT_LINES = [
  "Exactly right.",
  "That's correct — nice recall.",
  "Right, and for the right reason.",
  "You got that one cleanly.",
  "Correct on the first try.",
  "That's the one.",
  "Good instinct there.",
  "Spot on.",
  "You clearly know this material.",
  "Correct — that took real recall, not a guess.",
  "Right answer, solid reasoning.",
  "That one was clean.",
];

export function pickEncouragement(exclude?: string): string {
  const options = exclude
    ? ENCOURAGEMENT_LINES.filter((line) => line !== exclude)
    : ENCOURAGEMENT_LINES;
  return options[Math.floor(Math.random() * options.length)];
}
