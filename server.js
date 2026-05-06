import express from "express";
import cors from "cors";

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

The user's current tasks:
${taskList || "(none yet)"}

Your role: help the user refine their task list through natural conversation.
— When they mention corrections, new details, due dates, combining tasks, or deletions — make those changes.
— When making ANY task changes, include a COMPLETE updated task array at the very end of your response in this exact XML block (ALL tasks, not just changed ones):
<tasks>[{"id":"preserve existing id exactly","label":"...","area":"work|home|health|money|close|contribution|meaning","urgency":"now|soon|someday","dueDate":"YYYY-MM-DD or null","desc":"...","done":false,"subtasks":[],"notes":"","hours":"0h","mins":"30m"}]</tasks>
— For brand new tasks the user mentions, omit the id field entirely.
— If the user is just chatting or asking questions with NO task changes needed, do NOT include the <tasks> block.
— Keep your reply to 1–3 short sentences. Warm and direct.`;

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

Your role:
- Receive brain dumps (tasks, worries, ideas, anything) and acknowledge them warmly
- Help users figure out what to do next when they're stuck
- Answer questions about ADHD, executive function, time blindness, and task initiation
- Be calm, warm, and direct — never clinical or preachy
- Keep responses concise and actionable — ADHD brains don't need walls of text
- When someone seems overwhelmed, name it gently and offer one small next step

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

  const system = `You are writing a private journal entry for an adult with ADHD. Write in second person. 3-4 short paragraphs under 250 words. Name one emotional truth. Reference something specific. End with one quiet forward thought. Sound human, not like an AI.`;

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

// ── Top 3 suggestion ─────────────────────────────────────────────────────────
app.post("/api/top3", async (req, res) => {
  const { tasks, lifeAreas, yesterdayRating } = req.body;
  const available = (tasks || []).filter(t => !t.done).slice(0, 20);
  if (available.length === 0) return res.json({ indices: [0, 1, 2] });

  const taskList = available.map((t, i) =>
    `${i}: ${t.label} (${t.area}, due: ${t.dueDate || "no date"}, urgency: ${t.urgency || "soon"})`
  ).join("\n");

  const system = `You are a prioritization engine. Return ONLY a JSON array of up to 3 task indices. No explanation.`;
  const prompt = `Pick the best 3 tasks for today:\n${taskList}\nYesterday rating: ${yesterdayRating || "unknown"}\n\nPrioritize: overdue, urgent, neglected life areas.\nReturn ONLY a JSON array like: [0, 3, 7]`;

  try {
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 100);
    const clean = raw.replace(/```json|```/g, "").trim();
    const indices = JSON.parse(clean);
    res.json({ indices });
  } catch (e) {
    console.error("Top3 error:", e.message);
    res.json({ indices: [0, 1, 2] });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`steady. API running on port ${PORT}`));
