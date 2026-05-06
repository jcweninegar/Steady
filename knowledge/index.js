import { adhdCore } from "./adhd-core.js";
import { wellbeingScience } from "./wellbeing-science.js";
import { philosophyGoodLife } from "./philosophy-good-life.js";

// Add future knowledge files here — they'll be auto-included in all AI system prompts.

const sections = [
  adhdCore,
  wellbeingScience,
  philosophyGoodLife,
];

export const knowledgeBase = sections.join("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
