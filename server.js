import express from "express";
import cors from "cors";
import { knowledgeBase } from "./knowledge/index.js";
import { fileURLToPath } from "url";
import path from "path";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function callAnthropic(system, messages, max_tokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── Brain dump extraction ────────────────────────────────────────────────────
app.post("/api/extract", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });

  const today = new Date().toLocaleDateString("en-CA");
  const todayFull = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  const system = `You are a JSON-only extraction engine for an ADHD support app called steady.
Split compound inputs into separate items. Fully shape each task. Return ONLY valid JSON — no markdown, no explanation, no preamble.`;

  const prompt = `Split this brain dump into tasks and captures. Fully shape each task.

TODAY: ${todayFull} (${today})
INPUT: "${text}"

━━━ CLASSIFICATION ━━━
- Tasks = things the user needs to DO (call, pay, email, review, buy, schedule, fix, pick up, text, etc.)
- Captures = events/feelings/ideas/observations NOT requiring action right now (worries, calendar events already set, things they noticed, plans already made)
- Area options: work | home | health | money | close | contribution | meaning
  · close = family, kids, relationships · home = chores, house stuff

━━━ TITLE (label) ━━━
- Start with a strong action verb. Be as specific as possible.
- Good: "Call Lizzy about the lease renewal" not "Call person"
- Good: "Pay Chase credit card bill" not "Pay bill"  
- If the name is unknown but the role is clear: "Call the bank about funding" (role is fine)
- Max ~8 words. Clear and scannable.

━━━ DURATION — estimate thoughtfully based on task type ━━━
Phone call (quick personal/family): 10
Phone call (business, logistics): 20
Phone call (sales, negotiation, complex): 30
Text or email reply: 5
Send a detailed email: 15
Errand / pickup / drop-off: 30
Pay a bill online: 10
Schedule an appointment: 10
Review a short document: 20
Review a long document or proposal: 45
Admin task (form, application): 30
Meeting or call with agenda: 60
Deep work / creative / writing: 90
Quick check / look something up: 5
Grocery run or shopping trip: 45
Clean / tidy a space: 30

━━━ DESCRIPTION (note field) ━━━
Write 1–2 sentences of useful context — what the person needs to know to actually do this task.
- For calls: who to call, what to discuss, any important details from the input
- For reviews: what document, what to look for
- For errands: where, what to bring
- If there's no inferrable context at all, set note to null
- Never say "no description available" — either write something useful or use null

━━━ STEPS (steps field) ━━━
Only add steps for tasks that naturally have 3+ sub-steps (e.g., a complex errand, a multi-part review).
Most tasks: steps = []
Format: [{"text": "step description", "dur": 5}]

━━━ TIMING ━━━
- Only set urgency/dueDate when the user EXPLICITLY mentions timing ("today", "by Friday", "urgent", "tomorrow", "next week", "due Thursday")
- Convert relative dates to YYYY-MM-DD using today's date above
- If no timing mentioned: urgency = "soon", dueDate = null
- urgency options: now | soon | someday

━━━ CLARIFYING QUESTION ━━━
If 2+ tasks have no explicit timing: set ONE broad question on the FIRST task only (null on all others).
Vary naturally: "Do any of these have deadlines?", "Anything time-sensitive here?", "Any of these need to happen by a certain date or time?", "Want to add timing or context to any of these?"
If all tasks have timing, or there's only 1 task: null on all.

Return ONLY this exact JSON:
{
  "tasks": [{
    "label": "verb-first specific title",
    "area": "area id",
    "urgency": "now|soon|someday",
    "dueDate": "YYYY-MM-DD or null",
    "duration": 30,
    "steps": [],
    "clarifying_question": null,
    "note": "useful context sentence or null"
  }],
  "captures": [{
    "text": "the item",
    "type": "calendar-event|worry|idea|observation"
  }],
  "acknowledgment": "warm one-sentence acknowledgment of what they shared — natural, human, no lists"
}`;

  try {
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 1500);
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (e) {
    console.error("Extract error:", e.message);
    res.status(500).json({
      tasks: [{ label: text, area: "work", urgency: "soon", dueDate: null, duration: 30, steps: [], clarifying_question: null, note: null }],
      captures: [],
      acknowledgment: "Got it.",
    });
  }
});

// ── TASK REFINEMENT (clarifying answer → updated tasks) ──────────────────────
app.post("/api/refine", async (req, res) => {
  const { tasks, captures, question, answer } = req.body;
  const today = new Date().toLocaleDateString("en-CA");

  const system = `You are a JSON-only task refinement engine. Return ONLY valid JSON — no markdown, no explanation.`;

  const prompt = `The user was asked: "${question}"
User's answer: "${answer}"
Today's date: ${today}

Original tasks:
${JSON.stringify(tasks, null, 2)}

Update the tasks based on the user's answer. Apply any due dates, urgency, or details they mentioned. Convert relative dates ("tomorrow", "Friday", "next week") to YYYY-MM-DD. Only update fields the answer addresses; leave all other fields unchanged.

Return ONLY this JSON:
{
  "tasks": [/* same array structure with updates applied */],
  "acknowledgment": "warm 1-sentence confirmation of what was noted (e.g. 'Got it — I've added the deadline.')"
}`;

  try {
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 900);
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json({ tasks: result.tasks || tasks, acknowledgment: result.acknowledgment || "Got it." });
  } catch (e) {
    console.error("Refine error:", e.message);
    res.json({ tasks, acknowledgment: "Got it." });
  }
});

// ── Brain-dump follow-up: task-aware ongoing conversation ────────────────────
app.post("/api/braindump-chat", async (req, res) => {
  const { messages, tasks, captures } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });

  const today = new Date().toLocaleDateString("en-CA");

  // ── Navigation intent detection ─────────────────────────────────────────────
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  const userText = (lastUserMsg?.content || lastUserMsg?.text || "").toLowerCase();

  let action = null;
  if (/\b(open|show|go to|take me to|pull up|navigate to|see|view)\b.*\b(plan|agenda|calendar|schedule|today'?s plan)\b/.test(userText) ||
      /\b(my plan|today'?s plan|work block|routine)\b.*\b(please|now|open|show)\b/.test(userText)) {
    action = { type: "navigate", screen: "plan" };
  } else if (/\b(open|show|go to|take me to|pull up|navigate to|see|view)\b.*\b(journal|entries?|my day)\b/.test(userText) ||
      /\b(today'?s? journal|journal entry|what('?s| is) (in )?my journal|tell me (about )?my (day|journal))\b/.test(userText)) {
    action = { type: "navigate", screen: "journal" };
  } else if (/\b(open|show|go to|take me to|pull up|navigate to|see|view)\b.*\b(life\s*map|life\s*areas?|baseline|areas)\b/.test(userText) ||
      /\blife\s*map\b.*\b(please|now|open|show)\b/.test(userText)) {
    action = { type: "navigate", screen: "lifemap" };
  }

  const taskList = (tasks || [])
    .filter(t => !t.done)
    .map((t, i) =>
      `[ID:${t.id}] ${i + 1}. "${t.label}" — ${t.area}, ${t.urgency}${t.dueDate ? ", due " + t.dueDate : ""}${t.desc ? ", note: " + t.desc : ""}`
    ).join("\n");

  const captureList = (captures || []).slice(0, 8)
    .map(c => `"${c.text || c.label || ""}"`)
    .join(", ");

  const system = `You are steady., a calm ADHD support companion and second brain.
Today: ${today}

KNOWLEDGE BASE — use this to inform all responses:
${knowledgeBase}

The user's current tasks:
${taskList || "(none yet)"}
${captureList ? `\nRecent brain dumps: ${captureList}` : ""}

Your role: help the user through natural conversation. Use your knowledge of ADHD to understand why they're struggling.
— When they mention task corrections, new details, due dates, combining tasks, or deletions — make those changes.
— When making ANY task changes, include a COMPLETE updated task array at the very end of your response in this exact XML block:
<tasks>[{"id":"preserve existing id exactly","label":"...","area":"work|home|health|money|close|contribution|meaning","urgency":"now|soon|someday","dueDate":"YYYY-MM-DD or null","desc":"...","done":false,"subtasks":[],"notes":"","hours":"0h","mins":"30m"}]</tasks>
— For brand new tasks the user mentions, omit the id field entirely.
— If the user asks to open/show their plan, journal, or life map — confirm you're opening it for them.
— If the user is just chatting with NO task changes needed, do NOT include the <tasks> block.
— Keep your reply to 1–3 short sentences. Warm and direct. Never clinical or preachy.`;

  try {
    const formatted = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content || m.text || "",
    })).filter(m => m.content.trim());

    const rawReply = await callAnthropic(system, formatted, 1200);

    const taskMatch = rawReply.match(/<tasks>([\s\S]*?)<\/tasks>/);
    let updatedTasks = null;
    let reply = rawReply.replace(/<tasks>[\s\S]*?<\/tasks>/, "").trim();

    if (taskMatch) {
      try { updatedTasks = JSON.parse(taskMatch[1].trim()); }
      catch (e) { console.error("Task parse error:", e.message); }
    }

    res.json({ reply, updatedTasks, action });
  } catch (e) {
    console.error("Braindump chat error:", e.message);
    res.status(500).json({ reply: "I'm here. What would you like to adjust?", updatedTasks: null, action: null });
  }
});

// ── AI companion chat ────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });

  const system = `You are steady., a second brain and ADHD support companion. You help adults with ADHD capture thoughts, manage tasks, and build a life that works.

KNOWLEDGE BASE — use this to inform all responses:
${knowledgeBase}

Your role:
- Receive brain dumps (tasks, worries, ideas, anything) and acknowledge them warmly
- Help users figure out what to do next when they're stuck
- Answer questions about ADHD, executive function, time blindness, emotional dysregulation, and task initiation — grounded in the research above
- Be calm, warm, and direct — never clinical or preachy
- Keep responses concise and actionable — ADHD brains don't need walls of text
- When someone seems overwhelmed, name it gently and offer one small next step
- When someone expresses shame or self-blame, gently reflect what the research says (it's neurological, not a character flaw) without being preachy about it

Tone: like a calm, smart friend who gets it. Not a therapist. Not a productivity guru. Just steady.`;

  try {
    const formatted = messages
      .filter(m => m.role === "user" || m.role === "ai")
      .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
    const reply = await callAnthropic(system, formatted, 600);
    res.json({ reply });
  } catch (e) {
    console.error("Chat error:", e.message);
    res.status(500).json({ reply: "Got it. I'm here." });
  }
});

// ── AI journal entry ─────────────────────────────────────────────────────────
app.post("/api/journal", async (req, res) => {
  const { captures, completedTasks, rating } = req.body;

  const system = `You are writing a private journal entry for an adult with ADHD. Write in second person. 3-4 short paragraphs under 250 words. Name one emotional truth. Reference something specific. End with one quiet forward thought. Sound human, not like an AI.

You understand from research that ADHD is a neurodevelopmental disorder — not laziness, not a character flaw. The person reading this journal lives with real neurological challenges: executive function deficits, time blindness, working memory gaps, emotional dysregulation. When their day was hard, acknowledge the real weight of that without pathologizing it. When they got things done, honor the genuine effort it took — because for someone with ADHD, starting is neurologically harder than it looks. Never preach. Never diagnose. Just witness.`;

  const captureText = (captures || []).slice(0, 10).map(c => c.text).join(", ") || "No captures today";
  const taskText = (completedTasks || []).map(t => t.label).join(", ") || "No tasks completed";
  const prompt = `Write today's journal entry.\nBrain dumps today: ${captureText}\nCompleted tasks: ${taskText}\nDay rating: ${rating || "not rated"}`;

  try {
    const narrative = await callAnthropic(system, [{ role: "user", content: prompt }], 500);
    res.json({ narrative });
  } catch (e) {
    console.error("Journal error:", e.message);
    res.status(500).json({ narrative: "Today had its own shape. Something moved. Tomorrow is a clean start." });
  }
});

// ── Top 3 suggestion — the steady algorithm ───────────────────────────────────
app.post("/api/top3", async (req, res) => {
  const { tasks, lifeAreas, captures, dayRating } = req.body;
  const nowMs = Date.now();
  const available = (tasks || []).filter(t => !t.done).slice(0, 20);
  if (available.length === 0) return res.json({ picks: [], observation: null });

  // Infer task age: task IDs are Date.now() timestamps (13-digit ms)
  const withMeta = available.map((t, i) => {
    const isTimestamp = typeof t.id === "number" && t.id > 1_000_000_000_000;
    const ageDays = isTimestamp ? Math.floor((nowMs - t.id) / 86_400_000) : null;
    return { ...t, _idx: i, _ageDays: ageDays };
  });

  // Life area task coverage — which areas have tasks, which are empty
  const AREAS = ["work","health","close","contribution","money","home","meaning"];
  const areaCounts = Object.fromEntries(AREAS.map(a => [a, 0]));
  available.forEach(t => { if (areaCounts[t.area] !== undefined) areaCounts[t.area]++; });
  const neglectedAreas = AREAS.filter(a => areaCounts[a] === 0);
  const areaLine = lifeAreas && lifeAreas.length > 0
    ? lifeAreas.map(la => `${la.id}: ${la.status || "not set"}`).join(", ")
    : `No tasks in: ${neglectedAreas.join(", ") || "none"}`;

  // Recent capture themes
  const captureText = (captures || [])
    .slice(0, 15)
    .map(c => c.text || c.label || "")
    .filter(Boolean)
    .join("; ") || "none";

  // Build task list with staleness signal
  const taskList = withMeta.map(t => {
    const age = t._ageDays !== null ? ` [${t._ageDays}d old]` : "";
    const due = t.dueDate ? ` due:${t.dueDate}` : "";
    return `${t._idx}: "${t.label}" — area:${t.area} urgency:${t.urgency || "soon"}${due}${age}`;
  }).join("\n");

  const todayStr = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  const system = `${knowledgeBase}

━━━ THE STEADY ALGORITHM ━━━
You are the steady. prioritization engine. Select the 3 best tasks for this user today using the algorithm below.

INPUTS IN PRIORITY ORDER:
1. Hard deadlines — anything with a due date at or near today comes first.
2. Task staleness — tasks sitting untouched 7+ days need surfacing. Name this directly in whyToday.
3. Life area neglect — if an important area (health, relationships, money) has nothing moving, flag it.
4. Capture frequency — if a topic appears repeatedly in brain dumps, it belongs in the Top 3.
5. Dodson's four motivators — assign each pick the motivator that best activates the ADHD brain for that task:
   - "urgency": deadline is real and near
   - "challenge": requires full focus, good for a dedicated block
   - "interest": connects to something the user genuinely cares about
   - "novelty": fresh action in a long-neglected area
   - "meaning": moves something in a core life area
6. Cognitive load balance — don't pick 3 heavy tasks. Mix at least one lighter action if possible.

whyToday rules:
- 8–12 words, plain declarative English
- No praise, no pressure, no exclamation marks
- Neutral and observational — describe reality, don't evaluate the person
- Never use: overdue, should, must, failing, behind, late, disappointed
- Good examples:
  "Due tomorrow. This is the real window."
  "Health hasn't had a move in a few days."
  "Been in three brain dumps. Time to clear it."
  "Quiet area. One action changes that."

observation rules:
- 10–15 words, one sentence
- Warm, factual, forward-looking
- Describes the shape of today's list — not the person's performance
- Example: "Two areas moving today. Health is the one still waiting."

Return ONLY valid JSON — no markdown, no explanation:
{
  "picks": [
    {"index": 0, "motivator": "urgency", "whyToday": "..."},
    {"index": 3, "motivator": "meaning", "whyToday": "..."},
    {"index": 7, "motivator": "challenge", "whyToday": "..."}
  ],
  "observation": "..."
}`;

  const prompt = `TODAY: ${todayStr}
YESTERDAY RATING: ${dayRating || "not recorded"}

TASKS:
${taskList}

LIFE AREAS: ${areaLine}
RECENT BRAIN DUMP CAPTURES: ${captureText}`;

  try {
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 500);
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (e) {
    console.error("Top3 error:", e.message);
    // Graceful fallback — return first 3 with no framing
    res.json({ picks: [{index:0},{index:1},{index:2}], observation: null });
  }
});

// Serve built frontend in production
const distPath = path.join(__dirname, "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/(.*)/, (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

const PORT = process.env.PORT || process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`steady. API running on port ${PORT}`));
