import { adhdCore } from "./adhd-core.js";

// Add future knowledge files here — they'll be auto-included in all AI system prompts.
// Example: import { productivity } from "./productivity.js";
// Example: import { habits } from "./habits.js";

const sections = [
  adhdCore,
  // productivity,
  // habits,
];

export const knowledgeBase = sections.join("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
