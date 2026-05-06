import express from "express";
import cors from "cors";
import { knowledgeBase } from "./knowledge/index.js";

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

  const system = `You are a JSON-only extraction engine for an ADHD support app.
Split compound inputs into separate items. Return ONLY valid JSON — no markdown, no explanation, no preamble.`;

  const prompt = `Split this brain dump into tasks and captures. Classify each item.

Input: ${text}

Rules:
- Each distinct thing = a separate item
- Tasks = things the user needs to DO (call, pay, clean, email, fix, buy, schedule, etc.)
- Captures = events, feelings, ideas, observations that are NOT action items (worries, plans already made, things they noticed)
- Area options: work, home, health, money, close, contribution, meaning
- home = cleaning, chores, house stuff; close = kids, family, relationships
- DO NOT guess or infer urgency or due dates. Only set urgency/dueDate when the user explicitly says a time (e.g. "today", "by Friday", "urgent", "tomorrow", "next week").
- If timing is not explicitly stated: urgency = "someday", dueDate = null
- clarifying_question: if 2 or more tasks have no explicit timing, set ONE broad open-ended question on the FIRST task only (null on all others) inviting the user to add any due dates or context. Vary the phrasing naturally — e.g. "Do any of these have deadlines?", "Anything time-sensitive in here?", "Want to add timing or context to any of these?", "Any of these need to happen by a certain date?". If all tasks already have timing, or there's only 1 task, set null on all.

Return this exact JSON:
{
  "tasks": [{
    "label": "short action phrase starting with a verb",
    "area": "area id",
    "urgency": "now|soon|someday",
    "dueDate": "YYYY-MM-DD or null",
    "duration": 30,
    "steps": [],
    "clarifying_question": null,
    "note": null
  }],
  "captures": [{
    "text": "the item",
    "type": "calendar-event|worry|idea|observation"
  }],
  "acknowledgment": "warm one-sentence acknowledgment of what they shared (no lists, just a human response)"
}`;

  try {
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 1200);
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
  const { messages, tasks } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });

  const today = new Date().toLocaleDateString("en-CA");

  const taskList = (tasks || [])
    .filter(t => !t.done)
    .map((t, i) =>
      `[ID:${t.id}] ${i + 1}. "${t.label}" — ${t.area}, ${t.urgency}${t.dueDate ? ", due " + t.dueDate : ""}${t.desc ? ", note: " + t.desc : ""}`
    ).join("\n");

  const system = `You are steady., a calm ADHD support companion and second brain.
Today: ${today}

KNOWLEDGE BASE — use this to inform all responses:
${knowledgeBase}

The user's current tasks:
${taskList || "(none yet)"}

Your role: help the user refine their task list through natural conversation. Use your knowledge of ADHD to understand why they're struggling, not just what they need to do.
— When they mention corrections, new details, due dates, combining tasks, or deletions — make those changes.
— When making ANY task changes, include a COMPLETE updated task array at the very end of your response in this exact XML block (ALL tasks, not just changed ones):
<tasks>[{"id":"preserve existing id exactly","label":"...","area":"work|home|health|money|close|contribution|meaning","urgency":"now|soon|someday","dueDate":"YYYY-MM-DD or null","desc":"...","done":false,"subtasks":[],"notes":"","hours":"0h","mins":"30m"}]</tasks>
— For brand new tasks the user mentions, omit the id field entirely.
— If the user is just chatting or asking questions with NO task changes needed, do NOT include the <tasks> block.
— Keep your reply to 1–3 short sentences. Warm and direct. Never clinical or preachy.`;

  try {
    const formatted = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content || "",
    })).filter(m => m.content.trim());

    const rawReply = await callAnthropic(system, formatted, 1200);

    const taskMatch = rawReply.match(/<tasks>([\s\S]*?)<\/tasks>/);
    let updatedTasks = null;
    let reply = rawReply.replace(/<tasks>[\s\S]*?<\/tasks>/, "").trim();

    if (taskMatch) {
      try { updatedTasks = JSON.parse(taskMatch[1].trim()); }
      catch (e) { console.error("Task parse error:", e.message); }
    }

    res.json({ reply, updatedTasks });
  } catch (e) {
    console.error("Braindump chat error:", e.message);
    res.status(500).json({ reply: "I'm here. What would you like to adjust?", updatedTasks: null });
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

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`steady. API running on port ${PORT}`));
