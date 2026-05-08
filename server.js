import express from "express";
import cors from "cors";
import { knowledgeBase } from "./knowledge/index.js";
import { fileURLToPath } from "url";
import path from "path";
import { existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ebgowtfbelmhkejjyssl.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { realtime: { transport: ws } })
  : null;

async function getJournalHistory(userId) {
  if (!supabaseAdmin || !userId || userId === "dev") return [];
  try {
    const cutoff = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA");
    const { data, error } = await supabaseAdmin
      .from("journal_entries")
      .select("date,chat_messages,captures,completed_tasks,life_area_activity,day_rating,user_notes")
      .eq("user_id", userId)
      .gte("date", cutoff)
      .order("date", { ascending: false })
      .limit(14);
    if (error || !data) return [];
    return data;
  } catch { return []; }
}

function formatHistoryForAI(history) {
  if (!history || history.length === 0) return "";
  const lines = history.map(e => {
    const done = (e.completed_tasks || []).map(t => t.label).join(", ") || "nothing completed";
    const mind = (e.captures || []).map(c => c.text).slice(0, 5).join("; ") || "no captures";
    const chat = (e.chat_messages || []).map(m => m.text).slice(0, 4).join("; ") || "";
    const notes = e.user_notes || {};
    const noteParts = [notes.happened, notes.challenging, notes.different].filter(Boolean).join(" | ");
    const areas = e.life_area_activity ? Object.entries(e.life_area_activity).filter(([,v])=>v>0).map(([k,v])=>`${k}(${v})`).join(",") : "";
    return `[${e.date}] Rating: ${e.day_rating||"?"} | Done: ${done} | Areas: ${areas||"none"} | Mind: "${mind}"${chat?` | Said: "${chat.slice(0,120)}"`:""} ${noteParts?`| Notes: ${noteParts}`:""}`.trim();
  });
  return `\n━━━ USER HISTORY (last 14 days) ━━━\nThis is factual data about who this person is, what they've been working on, and how their days have been going. Use it to personalise all advice, spot patterns, and understand what matters to them.\n\n${lines.join("\n")}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function callModel(model, system, messages, max_tokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens, system, messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// Haiku — fast & cheap, used for all endpoints
const callAnthropic = (system, messages, max_tokens = 700) =>
  callModel("claude-haiku-4-5", system, messages, max_tokens);

// Cached call — splits system into a cacheable knowledge block + dynamic block.
// Requires anthropic-beta: prompt-caching-2024-07-31. Reduces repeat-read cost ~90%.
async function callCached(knowledgePart, dynamicPart, messages, max_tokens = 700) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens,
      system: [
        { type: "text", text: knowledgePart, cache_control: { type: "ephemeral" } },
        { type: "text", text: dynamicPart },
      ],
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

// Compact ADHD brief used in endpoints that don't warrant the full knowledge base
const ADHD_BRIEF = `ADHD core: Executive dysfunction, working memory deficits, time blindness, and emotional dysregulation are neurological — not character flaws. ADHD brains run on Dodson's motivators: Interest, Challenge, Urgency, Novelty, Meaning. Shame spirals are counterproductive. Task initiation is harder than completion. One small next step beats a perfect plan.`;

// ── Brain dump extraction ────────────────────────────────────────────────────
app.post("/api/extract", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });

  const today = new Date().toLocaleDateString("en-CA");
  const todayFull = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  const system = `You are a JSON-only extraction engine for an ADHD support app called steady.
Split compound inputs into separate items. Fully shape each task. Return ONLY valid JSON — no markdown, no explanation, no preamble.`;

  const prompt = `Split this brain dump into tasks and captures. Fully shape each task.

INPUT TO SPLIT: "${text}"

SPLITTING RULE: Every distinct action, event, or thought = its own separate item. Do NOT combine unrelated items even if spoken in one sentence. Example: "I need to clean the house and kids have soccer Thursday" = Task "Clean the house" (home) + Capture "Kids soccer game Thursday" (calendar-event). These are TWO different things. Never combine them.

━━━ CLASSIFICATION ━━━
- Tasks = things the user needs to DO (call, pay, email, review, buy, schedule, fix, pick up, text, etc.)
- Captures = events/feelings/ideas/observations NOT requiring action right now (worries, calendar events already set, things they noticed, plans already made)
- Journal inputs = inner emotional content — personal feelings, mental state, processing thoughts, anxieties, emotional observations. NOT tasks. NOT calendar events. Examples: "I've been feeling off all week", "I'm scared about the business", "I feel proud of how I handled that", "I've been grinding too hard lately"
- Area options: work | home | health | money | relationships | contribution | meaning
  · relationships = family, kids, close relationships · home = chores, house stuff

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
  "journal_inputs": [{
    "text": "the emotional/inner content"
  }],
  "acknowledgment": "warm one-sentence acknowledgment of what they shared — natural, human, no lists. If journal inputs were present, acknowledge the emotional content first."
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
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 500);
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
  const { messages, tasks, captures, userId } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });

  const today = new Date().toLocaleDateString("en-CA");
  const todayFull = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const history = await getJournalHistory(userId);
  const historyBlock = formatHistoryForAI(history);

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

  const dynamicSystem = `You are steady., a calm ADHD support companion and second brain.
Today: ${todayFull} (${today})
${historyBlock}

The user's current tasks:
${taskList || "(none yet)"}
${captureList ? `\nRecent brain dumps: ${captureList}` : ""}

Your role: help the user through natural conversation. Use your knowledge of ADHD to understand why they're struggling.
— When they mention task corrections, new details, due dates, combining tasks, or deletions — make those changes.
— When making ANY task changes, include a COMPLETE updated task array at the very end of your response in this exact XML block:
<tasks>[{"id":"preserve existing id exactly","label":"...","area":"work|home|health|money|relationships|contribution|meaning","urgency":"now|soon|someday","dueDate":"YYYY-MM-DD or null","desc":"...","done":false,"subtasks":[],"notes":"","hours":"0h","mins":"30m"}]</tasks>
— For brand new tasks the user mentions, omit the id field entirely.
— If the user asks to open/show their plan, journal, or life map — confirm you're opening it for them.
— If the user is just chatting with NO task changes needed, do NOT include the <tasks> block.
— Keep your reply to 1–3 short sentences. Warm and direct. Never clinical or preachy.`;

  try {
    const formatted = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content || m.text || "",
    })).filter(m => m.content.trim());

    const rawReply = await callCached(knowledgeBase, dynamicSystem, formatted, 400);

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

  const today = new Date().toLocaleDateString("en-CA");
  const todayFull = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const dynamicSystem = `You are steady., a second brain and ADHD support companion.
Today: ${todayFull} (${today})

Your role: help adults with ADHD capture thoughts, manage tasks, and build a life that works. Be calm, warm, and direct — never clinical or preachy. Keep responses concise — ADHD brains don't need walls of text. When someone seems overwhelmed, offer one small next step. When someone expresses shame, gently anchor to neuroscience.

Tone: calm, smart friend who gets it. Not a therapist. Not a productivity guru. Just steady.`;

  try {
    const formatted = messages
      .filter(m => m.role === "user" || m.role === "ai")
      .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
    const reply = await callCached(knowledgeBase, dynamicSystem, formatted, 350);
    res.json({ reply });
  } catch (e) {
    console.error("Chat error:", e.message);
    res.status(500).json({ reply: "Got it. I'm here." });
  }
});

// ── AI journal entry ─────────────────────────────────────────────────────────
app.post("/api/journal", async (req, res) => {
  const { captures, completedTasks, rating } = req.body;

  const system = `You are ghostwriting a private journal entry in the first person, as if the user wrote it themselves with perfect recall.

Your job: turn their brain dumps, tasks, and day into an authentic, organic journal entry — the kind of thing someone would actually write in a notebook at the end of a real day.

Rules:
- First person ("I", "we", "my") throughout. Never second person ("you").
- Mirror the tone and vocabulary of their brain dumps as closely as possible. If they write casually, write casually. If they're terse, be terse. If they're reflective, go deeper.
- Stick to what actually happened — specific details they mentioned, tasks they did, things on their mind. No invented details.
- 3–4 short paragraphs, under 220 words total.
- No pep talks, no affirmations, no therapist-speak. Just honest, grounded writing.
- Do not mention ADHD or diagnoses.
- End with a simple, genuine forward thought — one thing they're thinking about for tomorrow, drawn from their actual captures.
- Sound like a real person, not an AI summarizing their day.`;

  const captureText = (captures || []).slice(0, 12).map(c => c.text).join("\n- ") || "nothing captured";
  const taskText = (completedTasks || []).map(t => t.label).join(", ") || "nothing completed";
  const prompt = `Write my journal entry for today.\n\nThings on my mind today:\n- ${captureText}\n\nWhat I got done: ${taskText}\nHow the day felt: ${rating || "not rated"}`;

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
  const { tasks, lifeAreas, captures, dayRating, userId, emotional_signal, calendar_events } = req.body;
  const nowMs = Date.now();
  const available = (tasks || []).filter(t => !t.done).slice(0, 25);
  if (available.length === 0) return res.json({ picks: [], observation: null, reflective_question: null });

  // Infer task age: task IDs are Date.now() timestamps (13-digit ms)
  const withMeta = available.map((t, i) => {
    const isTimestamp = typeof t.id === "number" && t.id > 1_000_000_000_000;
    const ageDays = isTimestamp ? Math.floor((nowMs - t.id) / 86_400_000) : null;
    return { ...t, _idx: i, _ageDays: ageDays };
  });

  // Life area task coverage
  const AREA_IDS = ["work","health","relationships","contribution","money","home","meaning"];
  const areaCounts = Object.fromEntries(AREA_IDS.map(a => [a, 0]));
  available.forEach(t => { if (areaCounts[t.area] !== undefined) areaCounts[t.area]++; });
  const neglectedAreas = AREA_IDS.filter(a => areaCounts[a] === 0);
  const areaLine = lifeAreas && lifeAreas.length > 0
    ? lifeAreas.map(la => `${la.id}: ${la.status || "not set"}`).join(", ")
    : `No tasks in: ${neglectedAreas.join(", ") || "none"}`;

  // Recent capture themes
  const captureText = (captures || [])
    .slice(0, 15)
    .map(c => c.text || c.label || "")
    .filter(Boolean)
    .join("; ") || "none";

  // Fixed time commitments today
  const todayEvents = (calendar_events || []).map(e => e.text || e.label || "").filter(Boolean);
  const calLine = todayEvents.length > 0
    ? `Fixed commitments today: ${todayEvents.join("; ")}`
    : "No fixed commitments logged for today";

  // Emotional context
  const emotionalLine = emotional_signal
    ? `Wellbeing pattern (last 7 days): ${(emotional_signal.last7Days || []).join(", ")} — overall: ${emotional_signal.hardStreak || "stable"}`
    : dayRating ? `Yesterday rated: ${dayRating}` : "No rating data available";

  // Build task list with staleness signal
  const taskList = withMeta.map(t => {
    const age = t._ageDays !== null ? ` [${t._ageDays}d old]` : "";
    const due = t.dueDate ? ` due:${t.dueDate}` : "";
    const parked = t._ageDays !== null && t._ageDays > 7 ? " [STALE]" : "";
    return `${t._idx}: "${t.label}" — area:${t.area} urgency:${t.urgency || "soon"}${due}${age}${parked}`;
  }).join("\n");

  const todayStr = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
  const history = await getJournalHistory(userId);
  const historyBlock = formatHistoryForAI(history);

  const system = `${historyBlock}

━━━ THE STEADY ALGORITHM ━━━
You are the steady. prioritization engine. Rank the 10 best tasks for this user today using the algorithm below. Return exactly 10 picks (or all available tasks if fewer than 10).

INPUTS IN PRIORITY ORDER:
1. Fixed time commitments — if today has hard calendar events, factor in reduced available focus time.
2. Hard deadlines — anything with a due date at or near today comes first.
3. Emotional load — if the user has had multiple Hard days recently, prefer shorter/lighter tasks where possible. Don't overload a depleted brain.
4. Task staleness — tasks marked [STALE] (7+ days untouched) need surfacing. Name this directly in whyToday.
5. Life area neglect — if an important area (health, relationships, money) has nothing moving, flag it.
6. Capture frequency — if a topic appears repeatedly in brain dumps, it belongs near the top.
7. Dodson's motivators — assign each pick the motivator that best activates the ADHD brain:
   - "urgency": deadline is real and near
   - "challenge": requires full focus, good for a dedicated block
   - "interest": connects to something the user genuinely cares about
   - "novelty": fresh action in a long-neglected area
   - "meaning": moves something in a core life area
8. Cognitive load balance — mix heavy and light tasks. Don't stack 10 hard tasks.

whyToday rules:
- 8–12 words, plain declarative English
- No praise, no pressure, no exclamation marks
- Neutral and observational — describe reality, don't evaluate the person
- Never use: overdue, should, must, failing, behind, late, disappointed
- Good: "Due tomorrow. This is the real window."
- Good: "Health hasn't had a move in a few days."
- Good: "Been in three brain dumps. Time to clear it."

observation rules:
- 10–15 words, one sentence, warm and factual
- Describes the shape of today's list — not the person's performance

reflective_question rules:
- Only include when a clear pattern exists (task stuck 3+ times, specific area neglected 7+ days, hard streak 3+ days, etc.)
- Max 12 words, warm and curious tone — not confrontational
- Good: "Health hasn't moved in a week. Is that intentional?"
- Good: "This task has come up a few times. What's in the way?"
- null if no clear pattern worth naming

Return ONLY valid JSON — no markdown, no explanation:
{
  "picks": [
    {"index": 0, "motivator": "urgency", "whyToday": "..."},
    {"index": 3, "motivator": "meaning", "whyToday": "..."}
  ],
  "observation": "...",
  "reflective_question": "..." or null
}`;

  const prompt = `TODAY: ${todayStr}
${calLine}
${emotionalLine}

TASKS (${available.length} active):
${taskList}

LIFE AREAS: ${areaLine}
RECENT BRAIN DUMP CAPTURES: ${captureText}`;

  try {
    const raw = await callAnthropic(system, [{ role: "user", content: prompt }], 600);
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (e) {
    console.error("Top3 error:", e.message);
    res.json({ picks: [{index:0},{index:1},{index:2}], observation: null, reflective_question: null });
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
