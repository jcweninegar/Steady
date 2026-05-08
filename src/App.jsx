import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import { useAuth } from "./lib/AuthContext";
import AuthScreen from "./screens/AuthScreen";
import { supabase } from "./lib/supabase";

const LIGHT = {
  bg:"#F7F4EF", card:"#FFFFFF", border:"rgba(0,0,0,0.07)", surface:"#F0EDE7",
  text:"#1A1714", sub:"#8A8680", muted:"#C4BFB8",
  accent:"#E9B84A", accentText:"#1A1714", accentSoft:"rgba(233,184,74,0.12)",
  divider:"rgba(0,0,0,0.06)",
  shadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 14px rgba(0,0,0,0.04)",
  userBg:"#1A1714", userText:"#F7F4EF", aiBg:"#FFFFFF",
  frost:"rgba(247,244,239,0.92)",
  red:"#D94F4F", green:"#3DAA6A",
};
const DARK = {
  bg:"#141210", card:"#1E1B18", border:"rgba(255,255,255,0.08)", surface:"#262320",
  text:"#F2EDE6", sub:"#7A7570", muted:"#3A3530",
  accent:"#E9B84A", accentText:"#141210", accentSoft:"rgba(233,184,74,0.11)",
  divider:"rgba(255,255,255,0.06)",
  shadow:"0 1px 3px rgba(0,0,0,0.3),0 4px 20px rgba(0,0,0,0.2)",
  userBg:"#E9B84A", userText:"#1A1714", aiBg:"#1E1B18",
  frost:"rgba(20,18,16,0.94)",
  red:"#E06060", green:"#4DBF7A",
};

// ── LIFE AREAS DATA ───────────────────────────────────────────────────────────
const AREAS = [
  {id:"work",         label:"Work",                  research:"Adults who report meaningful work are 2x as likely to thrive overall.",          example:"I do focused work 3x per week and leave feeling capable.",        checkin:"Are you getting into flow at least once a week?"},
  {id:"health",       label:"Health",                research:"Regular movement is the single strongest predictor of long-term wellbeing.",     example:"I move my body daily and sleep 7+ hours most nights.",            checkin:"Is your body getting what it needs to keep up with your mind?"},
  {id:"relationships", label:"Close Relationships",     research:"People with 1-2 deep relationships are as happy as those with many.",           example:"I feel genuinely known by at least one person in my life.",      checkin:"Do the people closest to you actually know what's going on for you?"},
  {id:"contribution", label:"Contribution",          research:"Giving time or skill to others predicts life satisfaction independent of income.",example:"I contribute something weekly — even small acts count.",          checkin:"Are you giving something back, even occasionally?"},
  {id:"money",        label:"Money",                 research:"Financial stress is the top stressor for adults with ADHD. Stability matters more than amount.",example:"I have a system — even a rough one — for tracking what comes in and out.",checkin:"Is money stress background noise or front-of-mind?"},
  {id:"home",         label:"Home",                  research:"Environmental order reduces cognitive load, which matters especially for ADHD brains.",example:"My home is calm enough that I can find things and think clearly.",  checkin:"Does your space support you or fight you?"},
  {id:"meaning",      label:"Meaning",               research:"A sense of purpose buffers against anxiety and depression more than external success.",example:"I have a sense of why I'm doing what I'm doing.",               checkin:"Do you still know what you're working toward?"},
];

// ── ICONS ─────────────────────────────────────────────────────────────────────
const SendIcon = ({c}) => <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M16 9L2 2l2.5 6L2 14l12-6z" fill={c}/></svg>;
const MicIcon = ({c}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="11" rx="3" stroke={c} strokeWidth="1.8"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
const PlusIcon = ({c}) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>;
const XIcon = ({c,size=16}) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
const ChevronRight = ({c}) => <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CheckIcon = ({c="#fff"}) => <svg width="10" height="8" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── SHEET WRAPPER — every screen uses this ────────────────────────────────────
function Sheet({T, open, onClose, chatBarRef, children, title, overflow="auto"}) {
  const sheetRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [sheetBottom, setSheetBottom] = useState(0);
  const dragStartY = useRef(null);

  useEffect(() => {
    if(chatBarRef?.current) {
      const rect = chatBarRef.current.getBoundingClientRect();
      setSheetBottom(window.innerHeight - rect.top);
    }
  }, [open]);

  useEffect(() => {
    if(open) setTimeout(() => setVisible(true), 10);
    else { setVisible(false); }
  }, [open]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

  const onDragStart = e => { dragStartY.current = e.touches[0].clientY; if(sheetRef.current) sheetRef.current.style.transition = "none"; };
  const onDragMove = e => {
    if(dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if(dy > 0 && sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onDragEnd = e => {
    const dy = e.changedTouches[0].clientY - (dragStartY.current || 0);
    if(sheetRef.current) { sheetRef.current.style.transition = ""; }
    if(dy > 80) handleClose();
    else if(sheetRef.current) sheetRef.current.style.transform = "";
    dragStartY.current = null;
  };

  if(!open && !visible) return null;

  return (
    <>
      <div onClick={handleClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.18)",backdropFilter:"blur(2px)",transition:"opacity 0.3s",opacity:visible?1:0}}/>
      <div ref={sheetRef} style={{position:"fixed",left:0,right:0,top:88,bottom:sheetBottom,zIndex:201,background:T.frost,backdropFilter:"blur(40px) saturate(1.6)",WebkitBackdropFilter:"blur(40px) saturate(1.6)",borderRadius:"22px 22px 0 0",display:"flex",flexDirection:"column",transition:"transform 0.32s cubic-bezier(0.32,0.72,0,1)",transform:visible?"translateY(0)":"translateY(100%)",boxShadow:"0 -6px 48px rgba(0,0,0,0.16)",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        {/* Handle row */}
        <div onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd} style={{flexShrink:0,height:48,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",touchAction:"none",borderBottom:`1px solid ${T.divider}`,position:"relative",zIndex:350}}>
          <button onClick={handleClose} style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"flex-start",background:"none",border:"none",padding:0}}>
            <XIcon c={T.muted}/>
          </button>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.divider}}/>
            {title && <div style={{fontSize:12,color:T.muted,marginTop:4,fontWeight:500}}>{title}</div>}
          </div>
          <div style={{width:44}}/>
        </div>
        {/* Content */}
        <div style={{flex:1,overflowY:overflow,WebkitOverflowScrolling:"touch",minHeight:0}}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── CHAT CONTENT ──────────────────────────────────────────────────────────────
const AI_RESPONSES = {
  "Brain dump":"Perfect. Just say it — tasks, ideas, worries, anything taking up space in your head. I'll sort it out.",
  "Ask me anything":"Go ahead. Ask me anything about ADHD, how steady. works, or what to do next.",
  "What can you do?":"I'm your second brain.\n\nDump anything here and I route it to the right place. Nothing gets lost.\n\nI can answer ADHD questions, tell you what to do next, update your agenda, and help you break down the things you keep avoiding.\n\nYour only job is to get it out of your head.",
};

// ── TASK CARD QUEUE ───────────────────────────────────────────────────────────
function TaskCardQueue({T, tasks, onConfirm, onDismissAll}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState([]);

  if(idx >= tasks.length) {
    return (
      <div style={{marginTop:8,padding:"12px 14px",background:T.accentSoft,borderRadius:12,border:"1px solid "+T.accent}}>
        <div style={{fontSize:13,color:T.accent,fontWeight:600,marginBottom:4}}>
          {confirmed.length} task{confirmed.length!==1?"s":""} added to your plan.
        </div>
        <div style={{fontSize:12,color:T.sub}}>Open Plan to see them.</div>
      </div>
    );
  }

  const task = tasks[idx];

  const confirm = () => {
    const finalTask = {...task, label: answer ? task.label + " — " + answer : task.label};
    onConfirm(finalTask);
    setConfirmed(p=>[...p, finalTask]);
    setAnswer("");
    setIdx(i=>i+1);
  };

  const skip = () => {
    setAnswer("");
    setIdx(i=>i+1);
  };

  return (
    <div style={{marginTop:10}}>
      {/* Progress dots */}
      {tasks.length > 1 && (
        <div style={{display:"flex",gap:4,marginBottom:8,justifyContent:"center"}}>
          {tasks.map((_,i)=>(
            <div key={i} style={{width:i===idx?16:6,height:6,borderRadius:3,background:i===idx?T.accent:i<idx?T.green:T.divider,transition:"all 0.2s"}}/>
          ))}
        </div>
      )}

      {/* Card */}
      <div style={{background:T.card,borderRadius:14,border:"1px solid "+T.border,overflow:"hidden",boxShadow:T.shadow}}>
        <div style={{padding:"14px 16px"}}>
          {/* Area + urgency */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <AreaIconSVG id={task.area} size={13} color={T.sub}/>
            <span style={{fontSize:11,color:T.sub,textTransform:"capitalize",fontFamily:"'DM Sans',sans-serif"}}>{task.area}</span>
            {task.urgency==="now" && <span style={{fontSize:10,fontWeight:700,color:T.red,background:"rgba(217,79,79,0.1)",padding:"2px 7px",borderRadius:10}}>Now</span>}
            {task.due && <span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>Due: {task.due}</span>}
          </div>

          {/* Task label */}
          <div style={{fontSize:15,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.35,marginBottom:task.note||task.steps.length?8:0}}>{task.label}</div>

          {/* Note */}
          {task.note && <div style={{fontSize:12,color:T.muted,lineHeight:1.5,marginBottom:6,fontStyle:"italic"}}>{task.note}</div>}

          {/* Steps */}
          {task.steps && task.steps.length>0 && (
            <div style={{marginBottom:6}}>
              {task.steps.map(function(step,i){
                return (
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:4}}>
                    <div style={{fontSize:10,color:T.accent,fontWeight:700,flexShrink:0,marginTop:2}}>{i+1}</div>
                    <div style={{fontSize:12,color:T.sub,lineHeight:1.4}}>{step}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Duration */}
          {task.duration && (
            <div style={{fontSize:11,color:T.muted}}>{task.duration} min estimated</div>
          )}
        </div>

        {/* Clarifying question */}
        {task.clarifying_question && (
          <div style={{borderTop:"1px solid "+T.divider,padding:"12px 16px",background:T.surface}}>
            <div style={{fontSize:12,color:T.sub,marginBottom:8,fontStyle:"italic"}}>"{task.clarifying_question}"</div>
            <input
              value={answer}
              onChange={function(e){setAnswer(e.target.value);}}
              onKeyDown={function(e){if(e.key==="Enter") confirm();}}
              placeholder="Type your answer or skip..."
              style={{width:"100%",padding:"8px 10px",borderRadius:9,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex",borderTop:"1px solid "+T.divider}}>
          <button onClick={confirm} style={{flex:1,padding:"11px",border:"none",background:T.accent,color:T.accentText,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Add to plan
          </button>
          <button onClick={skip} style={{width:48,padding:"11px",border:"none",borderLeft:"1px solid "+T.divider,background:"transparent",color:T.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            ✕
          </button>
        </div>
      </div>

      {/* Queue count */}
      {tasks.length > 1 && idx < tasks.length-1 && (
        <div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:6}}>{tasks.length-1-idx} more after this</div>
      )}
    </div>
  );
}


const SYSTEM_PROMPT = `You are steady., a second brain and ADHD support companion. You help adults with ADHD capture thoughts, manage tasks, and build a life that works.

Your role:
- Receive brain dumps (tasks, worries, ideas, anything) and acknowledge them warmly
- Help users figure out what to do next when they're stuck
- Answer questions about ADHD, executive function, time blindness, and task initiation
- Be calm, warm, and direct — never clinical or preachy
- Keep responses concise and actionable — ADHD brains don't need walls of text
- When someone dumps tasks, confirm you've got them and ask one clarifying question if needed
- When someone seems overwhelmed, name it and offer one small next step

You know about: Brain Dump (capture everything), Plan (today's priorities, morning/shutdown routines), Life Map (baselines in 6 life areas), Journal (daily narrative from activity).

Tone: like a calm, smart friend who gets it. Not a therapist. Not a productivity guru. Just steady.`;

async function callClaude(messages) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ messages })
  });
  if(!response.ok) throw new Error("API error");
  const data = await response.json();
  return data.reply || "Got it.";
}

async function callBraindumpChat(history, tasks, captures, userId) {
  const res = await fetch("/api/braindump-chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ messages: history, tasks, captures, userId }),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// ── BRAIN DUMP EXTRACTION ────────────────────────────────────────────────────
async function refineWithAnswer(tasks, captures, question, answer) {
  const res = await fetch("/api/refine", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ tasks, captures, question, answer }),
  });
  if (!res.ok) throw new Error("Refine failed");
  return res.json();
}

async function extractFromDump(rawText) {
  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text: rawText })
    });
    if(!response.ok) throw new Error("API error");
    return await response.json();
  } catch(e) {
    return {tasks:[{label:rawText,area:"work",urgency:"soon",dueDate:null,duration:30,steps:[],clarifying_question:null,note:null}],captures:[],acknowledgment:"Got it."};
  }
}




// ── MORNING TOP 3 SUGGESTION — the steady algorithm ──────────────────────────
async function suggestTop3(tasks, captures, dayRating, userId) {
  const available = tasks.filter(t => !t.done).slice(0, 20);
  if (available.length === 0) return { tasks: [], framing: {}, observation: null };
  try {
    const res = await fetch("/api/top3", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ tasks: available, captures: captures || [], dayRating: dayRating || null, userId })
    });
    const data = await res.json();
    const picks = data.picks || [];
    const selectedTasks = picks.map(p => available[p.index]).filter(Boolean);
    const framing = {};
    picks.forEach(p => {
      const task = available[p.index];
      if (task && p.whyToday) framing[String(task.id)] = { motivator: p.motivator, whyToday: p.whyToday };
    });
    return { tasks: selectedTasks.length > 0 ? selectedTasks : available.slice(0,3), framing, observation: data.observation || null };
  } catch(e) {
    return { tasks: available.slice(0, 3), framing: {}, observation: null };
  }
}

// ── LIFE MAP GAP OBSERVATION ──────────────────────────────────────────────────
async function getLifeMapObservation(lifemapAreas, completedTasks) {
  return "You are moving. Keep the thread.";
}


const URGENCY_COLOR = (u, T) => u==="now" ? T.red : u==="soon" ? T.accent : T.muted;

const CaptureSVG = ({type, color}) => {
  const s = {stroke:color, strokeWidth:"1.3", strokeLinecap:"round"};
  if(type==="calendar-event") return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="2" {...s}/><path d="M1 7h14M5 1v4M11 1v4" {...s}/></svg>;
  if(type==="worry")          return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="7.5" r="5.5" {...s}/><path d="M8 4.5v3M8 9.5v.5" strokeWidth="1.5" stroke={color} strokeLinecap="round"/></svg>;
  if(type==="idea")           return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 0 1 2.5 7.1V11h-5V9.1A4 4 0 0 1 8 2zM6 12h4M6.5 14h3" {...s}/></svg>;
  if(type==="observation")    return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" {...s}/><circle cx="8" cy="8" r="2" {...s}/></svg>;
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" {...s}/><path d="M5 8h6M5 5.5h4" {...s}/></svg>;
};

const TrashIcon = ({c}) => <svg width="12" height="13" viewBox="0 0 14 16" fill="none"><path d="M1 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4M3 4l.9 9.5a1 1 0 0 0 1 .9h4.2a1 1 0 0 0 1-.9L11 4" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// Convert raw duration (minutes) to valid hours/mins select values (rounded to 15m)
const durationToHM = (totalMins) => {
  const clamped = Math.max(5, Math.min(240, totalMins || 30));
  const rounded = Math.round(clamped / 15) * 15;
  const h = Math.min(4, Math.floor(rounded / 60));
  const m = rounded % 60;
  const mStr = m === 0 ? "0m" : m === 15 ? "15m" : m === 30 ? "30m" : "45m";
  return { hours: h + "h", mins: mStr };
};

const formatTask = (raw, id) => {
  const { hours, mins } = durationToHM(raw.duration || 30);
  return {
    id,
    label: raw.label,
    area: raw.area || "work",
    hours,
    mins,
    dueDate: raw.dueDate || "",
    desc: raw.note || "",
    subtasks: (raw.steps || []).map(s => ({ text: s.text || s, done: false, mins: (s.dur || 15) + "m", dueDate: "" })),
    done: false,
    notes: "",
    urgency: raw.urgency || "soon",
  };
};

// Converts a message to a text string for AI history
const msgToHistory = (m) => {
  if (m.role === "user") return { role: "user", content: m.text || "" };
  if (m.isDump) {
    const tLabels = (m.formattedTasks || []).map(t => `"${t.label}"`).join(", ");
    const text = [m.acknowledgment, tLabels ? `Tasks added: ${tLabels}` : "", m.clarifyingQuestion || ""].filter(Boolean).join(" ");
    return { role: "assistant", content: text };
  }
  return { role: "assistant", content: m.text || "" };
};

const ChatContent = forwardRef(function ChatContent({T, initialText, onCapture, onAddTasks, onRemoveTask, onUpdateTasks, tasks, savedMessages, onMessagesChange, readOnly, onAction, captures, userId}, ref) {
  const [messages, setMessages] = useState(savedMessages?.length ? savedMessages : []);
  const [loading, setLoading] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(()=>!!(savedMessages?.some(m=>m.isDump)));
  const [pendingClarification, setPendingClarification] = useState(null);
  const [chatSheetTask, setChatSheetTask] = useState(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const extractedRef = useRef([]); // formatted tasks from last extraction (with IDs)
  const bottomRef = useRef(null);
  const hasRun = useRef(false);

  const openChatTask = (task) => { setChatSheetTask(task); setChatSheetOpen(true); };
  const saveChatTask = (saved) => {
    // Update message formattedTasks in-place
    setMessages(p => p.map(m => !m.isDump ? m : {...m, formattedTasks: m.formattedTasks.map(t => t.id === saved.id ? saved : t)}));
    // Update extractedRef so braindump-chat has fresh data
    extractedRef.current = extractedRef.current.map(t => t.id === saved.id ? saved : t);
    // Propagate to global task list
    if (onUpdateTasks) onUpdateTasks(tasks.map(t => t.id === saved.id ? saved : t));
    setChatSheetOpen(false);
  };
  const deleteChatTask = (id) => {
    setMessages(p => p.map(m => !m.isDump ? m : {...m, formattedTasks: m.formattedTasks.filter(t => t.id !== id)}));
    extractedRef.current = extractedRef.current.filter(t => t.id !== id);
    if (onRemoveTask) onRemoveTask(id);
    setChatSheetOpen(false);
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({behavior:"smooth"});
  useEffect(scrollToBottom, [messages, loading]);

  // Persist messages whenever they change
  useEffect(()=>{ if(messages.length>0 && onMessagesChange) onMessagesChange(messages); },[messages]);

  // After extraction: all follow-up messages go here
  const sendToChat = async (newMsgs, currentTasks) => {
    setLoading(true);
    try {
      const history = newMsgs.map(msgToHistory).filter(m => m.content.trim());
      const result = await callBraindumpChat(history, currentTasks || tasks || [], captures || [], userId);
      setMessages(p => [...p, {role:"ai", text: result.reply || "Got it."}]);
      if (result.updatedTasks && onUpdateTasks) {
        onUpdateTasks(result.updatedTasks);
      }
      if (result.action && onAction) {
        setTimeout(() => onAction(result.action), 700);
      }
    } catch(e) {
      setMessages(p => [...p, {role:"ai", text:"I'm here. What would you like to adjust?"}]);
    }
    setLoading(false);
  };

  const runExtract = (text, prevMsgs) => {
    setLoading(true);
    extractFromDump(text).then(result => {
      const rawTasks = result.tasks || [];
      const captures = result.captures || [];
      const clarifyingQuestion = rawTasks.find(t => t.clarifying_question)?.clarifying_question || null;

      if (rawTasks.length > 0 || captures.length > 0) {
        // Format tasks with IDs and auto-add them
        const baseId = Date.now();
        const formattedTasks = rawTasks.map((t, i) => formatTask(t, baseId + i));
        extractedRef.current = formattedTasks;
        if (onAddTasks) onAddTasks(formattedTasks);
        if (onCapture) captures.forEach(c => onCapture(c));

        const dumpMsg = {
          role:"ai", isDump:true,
          acknowledgment: result.acknowledgment || "Got it.",
          formattedTasks, captures, clarifyingQuestion,
        };
        setMessages(p => [...p, dumpMsg]);
        setLoading(false);
        setHasExtracted(true);

        if (clarifyingQuestion) {
          setPendingClarification({ question: clarifyingQuestion, rawTasks, captures });
        }
      } else {
        // No tasks found — fall back to chat
        sendToChat(prevMsgs, tasks);
      }
    }).catch(() => sendToChat(prevMsgs, tasks));
  };

  const handleClarifyResponse = (answer) => {
    const { question, rawTasks, captures } = pendingClarification;
    const userMsg = {role:"user", text:answer};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setPendingClarification(null);
    setLoading(true);
    refineWithAnswer(rawTasks, captures, question, answer)
      .then(result => {
        const refined = result.tasks || rawTasks;
        // Update the already-added tasks using stored IDs
        const stored = extractedRef.current;
        const updatedFormatted = refined.map((t, i) => ({
          ...(stored[i] || formatTask(t, Date.now() + i)),
          label: t.label,
          area: t.area || "work",
          urgency: t.urgency || "soon",
          dueDate: t.dueDate || "",
          desc: t.note || "",
        }));
        extractedRef.current = updatedFormatted;
        if (onUpdateTasks) onUpdateTasks(updatedFormatted);

        setMessages(p => {
          let lastDumpIdx = -1;
          for (let i = p.length - 1; i >= 0; i--) { if (p[i].isDump) { lastDumpIdx = i; break; } }
          const base = lastDumpIdx >= 0
            ? p.map((m, i) => i === lastDumpIdx ? {...m, formattedTasks: updatedFormatted, clarifyingQuestion: null} : m)
            : p;
          return [...base, {role:"ai", text: result.acknowledgment || "Got it, updated."}];
        });
        setLoading(false);
      })
      .catch(() => { setMessages(p=>[...p,{role:"ai",text:"Got it."}]); setLoading(false); });
  };

  const sendMessage = (text) => {
    if (!text.trim() || loading) return;
    if (pendingClarification) { handleClarifyResponse(text.trim()); return; }

    const userMsg = {role:"user", text:text.trim()};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);

    if (hasExtracted) {
      sendToChat(newMsgs, tasks);
    } else {
      runExtract(text.trim(), newMsgs);
    }
  };

  useImperativeHandle(ref, () => ({ sendMessage }));

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (savedMessages?.length > 0) {
      // Today's chat already exists — restore it, then send any new input
      if (initialText && initialText.trim()) {
        sendMessage(initialText);
      }
    } else if (initialText && initialText.trim()) {
      sendMessage(initialText);
    } else {
      setMessages([{role:"ai", text:"What's on your mind? Just dump it all — tasks, worries, ideas, anything."}]);
    }
  }, []);

  return (
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"24px 24px 16px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{display:"flex",flexDirection:"column"}}>
        {messages.map((msg, i) => {
          const fromEnd = messages.length - 1 - i;
          const opacity = fromEnd===0 ? 1 : fromEnd===1 ? 0.72 : Math.max(0.15, 0.72 - fromEnd*0.15);
          const blur = fromEnd <= 1 ? 0 : Math.min(2.5, fromEnd*0.7);
          return (
            <div key={i} style={{marginBottom:28,transition:"opacity 0.4s,filter 0.4s",opacity,filter:blur?`blur(${blur}px)`:"none"}}>
              {msg.role==="user" ? (
                /* User input — quiet memo, not the headline */
                <div style={{fontSize:13,fontWeight:400,color:T.muted,lineHeight:1.55,whiteSpace:"pre-wrap",paddingLeft:12,borderLeft:"2px solid "+T.divider,marginBottom:4}}>{msg.text}</div>
              ) : msg.isDump ? (
                <div>
                  {/* AI acknowledgment — primary voice, prominent */}
                  {msg.acknowledgment&&(
                    <div style={{fontSize:17,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.65,marginBottom:18}}>{msg.acknowledgment}</div>
                  )}

                  {(msg.formattedTasks.length + msg.captures.length) > 0 && (
                    <div style={{marginBottom:16,background:T.surface,borderRadius:14,overflow:"hidden",border:"1px solid "+T.border}}>
                      {/* Tasks — tappable to open detail sheet */}
                      {msg.formattedTasks.length > 0 && (
                        <div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px 8px"}}>
                            <div style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"1.4px",textTransform:"uppercase"}}>
                              {msg.formattedTasks.length} task{msg.formattedTasks.length!==1?"s":""} added to plan
                            </div>
                            <div style={{fontSize:10,color:T.muted,fontStyle:"italic"}}>tap to view</div>
                          </div>
                          {msg.formattedTasks.map((task, j) => (
                            <div key={task.id} onClick={()=>openChatTask(task)}
                              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:"1px solid "+T.divider,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                              <div style={{width:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                <AreaIconSVG id={task.area||"work"} size={13} color={T.muted}/>
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:14,fontWeight:500,color:T.text,lineHeight:1.35,marginBottom:task.desc?2:0}}>{task.label}</div>
                                <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                                  <span style={{fontSize:11,color:T.muted,textTransform:"capitalize"}}>{task.area}</span>
                                  <span style={{fontSize:11,color:T.muted}}>· {task.hours==="0h"?"":task.hours+" "}{task.mins}</span>
                                  {task.urgency&&task.urgency!=="someday"&&<span style={{fontSize:11,fontWeight:600,color:URGENCY_COLOR(task.urgency,T)}}>· {task.urgency}</span>}
                                  {task.dueDate&&<span style={{fontSize:11,color:T.muted}}>· {task.dueDate}</span>}
                                </div>
                                {task.desc&&<div style={{fontSize:12,color:T.muted,marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>{task.desc}</div>}
                              </div>
                              {/* Chevron affordance */}
                              <svg width="6" height="10" viewBox="0 0 7 12" fill="none" style={{flexShrink:0,opacity:0.35}}><path d="M1 1l5 5-5 5" stroke={T.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Captures */}
                      {msg.captures.length > 0 && (
                        <div style={{borderTop:msg.formattedTasks.length>0?"1px solid "+T.divider:"none"}}>
                          <div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"1.2px",textTransform:"uppercase",padding:"11px 14px 8px"}}>{msg.captures.length} capture{msg.captures.length!==1?"s":""}</div>
                          {msg.captures.map((cap, j) => (
                            <div key={"c"+j} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 14px",borderTop:"1px solid "+T.divider}}>
                              <div style={{width:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:3}}>
                                <CaptureSVG type={cap.type} color={T.muted}/>
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:14,color:T.sub,lineHeight:1.45}}>{typeof cap==="string"?cap:cap.text}</div>
                                <div style={{fontSize:11,color:T.muted,marginTop:1,textTransform:"capitalize"}}>{(cap.type||"note").replace("-"," ")}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clarifying / follow-up question — most prominent element */}
                  {msg.clarifyingQuestion && (
                    <div style={{fontSize:17,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.65}}>
                      {msg.clarifyingQuestion}
                    </div>
                  )}

                  {/* Post-extraction conversation hint */}
                  {!msg.clarifyingQuestion && hasExtracted && i===messages.length-1 && (
                    <div style={{fontSize:13,color:T.muted,lineHeight:1.55,marginTop:4}}>
                      Fix details, add dates, or ask anything.
                    </div>
                  )}
                </div>
              ) : (
                /* Regular AI reply — primary, prominent */
                <div style={{fontSize:17,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{msg.text}</div>
              )}
            </div>
          );
        })}
        {loading&&(
          <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:12,opacity:0.6}}>
            {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:`dots 1.2s ${i*0.2}s infinite`}}/>)}
            <span style={{fontSize:12,color:T.muted,marginLeft:6,fontStyle:"italic"}}>thinking...</span>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      {/* Task detail sheet — opens when user taps a task card in chat */}
      <TaskSheet
        T={T}
        task={chatSheetTask}
        open={chatSheetOpen}
        onClose={()=>setChatSheetOpen(false)}
        onSave={saveChatTask}
        onDelete={deleteChatTask}
      />
    </div>
  );
});

// ── LIFE MAP CONTENT ──────────────────────────────────────────────────────────

const STATUS_OPTS = ["Yes","Getting there","Not yet","Had it, lost it"];

const MOCK_CAPTURES = [
  {id:1,text:"Follow up with client on proposal",area:"work",type:"todo",estimate:"30 min",hard:false,subtasks:[]},
  {id:2,text:"Soccer practice Wednesday 5pm",area:"relationships",type:"calendar",estimate:"90 min",hard:false,subtasks:[]},
  {id:3,text:"Pay lease renewal",area:"money",type:"todo",estimate:"20 min",hard:true,subtasks:[]},
  {id:4,text:"Call mom back",area:"relationships",type:"todo",estimate:"10 min",hard:false,subtasks:[]},
  {id:5,text:"I want to read more this year",area:"fun",type:"parking",estimate:"30 min",hard:false,subtasks:[]},
  {id:6,text:"Feeling anxious about the budget this month",area:"money",type:"parking",estimate:"15 min",hard:true,subtasks:[]},
];




function LifeMapContent({T, userId}) {
  const STATUS_OPTS = ["Yes","Getting there","Not yet","Had it, lost it"];

  const [areas, setAreas] = useState(()=>{
    try {
      const s = localStorage.getItem("steady_lifemap");
      const saved = s ? JSON.parse(s) : null;
      if(saved && Array.isArray(saved)) {
        return AREAS.map(a => ({ ...a, ...(saved.find(x=>x.id===a.id)||{}), label:a.label, research:a.research }));
      }
    } catch {}
    return AREAS.map(a=>({...a,baseline:"",status:null,goals:[]}));
  });
  const [showResearch, setShowResearch] = useState(false);
  const [activeSheet, setActiveSheet]   = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editBaseline, setEditBaseline] = useState("");
  const [editStatus, setEditStatus]     = useState(null);
  const [editGoals, setEditGoals]       = useState([]);
  const [newGoal, setNewGoal]           = useState("");
  const sheetRef = useRef(null);
  const dragY = useRef(null);

  const withBaseline = areas.filter(a=>a.baseline.trim()).length;

  const openArea = (area) => {
    setActiveSheet(area);
    setEditBaseline(area.baseline||"");
    setEditStatus(area.status||null);
    setEditGoals(area.goals||[]);
    setNewGoal("");
    setTimeout(()=>setSheetVisible(true),10);
  };

  const closeArea = () => {
    if(activeSheet) {
      const updated = {...activeSheet, baseline:editBaseline, status:editStatus, goals:editGoals};
      setAreas(prev=>prev.map(a=>a.id===activeSheet.id ? updated : a));
      syncArea(updated);
    }
    setSheetVisible(false);
    setTimeout(()=>setActiveSheet(null),320);
  };

  const onDS = e => { dragY.current=e.touches[0].clientY; if(sheetRef.current) sheetRef.current.style.transition="none"; };
  const onDM = e => { if(dragY.current===null) return; const dy=e.touches[0].clientY-dragY.current; if(dy>0&&sheetRef.current) sheetRef.current.style.transform=`translateY(${dy}px)`; };
  const onDE = e => { const dy=e.changedTouches[0].clientY-(dragY.current||0); if(sheetRef.current) sheetRef.current.style.transition=""; if(dy>80) closeArea(); else if(sheetRef.current) sheetRef.current.style.transform=""; dragY.current=null; };

  const addGoal = () => {
    if(!newGoal.trim()) return;
    setEditGoals(p=>[...p,{text:newGoal.trim(),done:false}]);
    setNewGoal("");
  };

  // Persist to localStorage whenever areas change
  useEffect(()=>{
    try { localStorage.setItem("steady_lifemap", JSON.stringify(areas)); } catch {}
  }, [areas]);

  // Load from Supabase on mount (after localStorage baseline is set)
  useEffect(()=>{
    if(!userId || userId==="dev") return;
    supabase.from("life_areas").select("*").eq("user_id", userId)
      .then(({data, error})=>{
        if(error || !data || data.length===0) return;
        setAreas(prev => prev.map(a => {
          const row = data.find(r => r.area_key === a.id);
          if(!row) return a;
          return { ...a, baseline: row.baseline||"", status: row.status||null, goals: row.goals||[] };
        }));
      });
  }, [userId]);

  const syncArea = useCallback(async (area) => {
    if(!userId || userId==="dev") return;
    const row = {
      user_id: userId, area_key: area.id,
      baseline: area.baseline||"", status: area.status||null,
      goals: area.goals||[], updated_at: new Date().toISOString(),
    };
    const {error} = await supabase.from("life_areas").upsert(row, {onConflict:"user_id,area_key"});
    if(error) console.error("life_areas sync:", error.message);
  }, [userId]);

  return (
    <div style={{padding:"16px 20px 40px"}}>

      {/* Research card — collapsed by default */}
      <div style={{background:T.card,borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:14,boxShadow:T.shadow}}>
        <div onClick={()=>setShowResearch(r=>!r)} style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.accent,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:3}}>Research shows</div>
            <div style={{fontSize:15,fontWeight:600,color:T.text,fontFamily:"'Lora',serif"}}>A good life is obtainable.</div>
          </div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{transform:showResearch?"rotate(90deg)":"none",transition:"transform 0.2s",flexShrink:0}}><path d="M1 1l5 5-5 5" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        {showResearch&&(
          <div style={{borderTop:`1px solid ${T.divider}`,padding:"12px 16px 14px",background:T.surface}}>
            {AREAS.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.accent,flexShrink:0,marginTop:6}}/>
                <div style={{fontSize:13,color:T.sub,lineHeight:1.55}}>{a.research}</div>
              </div>
            ))}
            <div style={{fontSize:11,color:T.muted,marginTop:8,fontStyle:"italic"}}>Seligman (PERMA) · Health & Retirement Study · Faraone et al. (2021)</div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,color:T.sub}}><span style={{fontWeight:700,color:T.text}}>{withBaseline}</span> of {areas.length} baselines set</div>
        <div style={{width:80,background:T.divider,borderRadius:2,height:3,overflow:"hidden"}}>
          <div style={{height:"100%",background:T.accent,borderRadius:2,width:`${(withBaseline/areas.length)*100}%`,transition:"width 0.5s"}}/>
        </div>
      </div>

      {/* Unified area list — one card with dividers */}
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
        {areas.map((area,i)=>(
          <div key={area.id} onClick={()=>openArea(area)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderTop:i>0?`1px solid ${T.divider}`:"none",cursor:"pointer"}}>
            <AreaIconSVG id={area.id} size={15} color={T.sub}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:2}}>{area.label}</div>
              {area.baseline
                ? <div style={{fontSize:12,color:T.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{area.baseline}</div>
                : <div style={{fontSize:12,color:T.muted}}>Set your baseline →</div>
              }
            </div>
            {area.baseline&&<div style={{width:6,height:6,borderRadius:"50%",background:T.accent,flexShrink:0}}/>}
            {area.status&&<div style={{fontSize:11,color:T.sub,flexShrink:0,whiteSpace:"nowrap"}}>{area.status}</div>}
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{flexShrink:0,opacity:0.3}}><path d="M1 1l5 5-5 5" stroke={T.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>

      {/* Area detail sheet */}
      {activeSheet&&(
        <>
          <div onClick={closeArea} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.28)",backdropFilter:"blur(4px)",transition:"opacity 0.3s",opacity:sheetVisible?1:0}}/>
          <div ref={sheetRef} style={{position:"fixed",inset:0,zIndex:401,display:"flex",flexDirection:"column",background:T.surface,transition:"transform 0.32s cubic-bezier(0.32,0.72,0,1)",transform:sheetVisible?"translateY(0)":"translateY(100%)"}}>

            {/* Handle + header */}
            <div onTouchStart={onDS} onTouchMove={onDM} onTouchEnd={onDE} style={{flexShrink:0,padding:"52px 20px 16px",background:T.surface,borderBottom:`1px solid ${T.divider}`,touchAction:"none"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
                <div style={{width:36,height:4,borderRadius:2,background:T.divider}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={closeArea} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",padding:0,flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
                <AreaIconSVG id={activeSheet.id} size={16} color={T.sub}/>
                <div style={{fontSize:20,fontWeight:600,color:T.text,fontFamily:"'Lora',serif"}}>{activeSheet.label}</div>
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"20px 20px 40px"}}>

              {/* Research baseline */}
              <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:14,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:6}}>Research baseline</div>
                <div style={{fontSize:15,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.4}}>{activeSheet.research}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:6}}>Shape this into your own words below.</div>
              </div>

              {/* Personal baseline */}
              <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:14,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Your personal baseline</div>
                <textarea
                  value={editBaseline}
                  onChange={e=>setEditBaseline(e.target.value)}
                  placeholder={`What does this look like for you?

e.g. ${activeSheet.example}`}
                  rows={4}
                  style={{width:"100%",border:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,outline:"none",resize:"none"}}
                />
                {editBaseline&&(
                  <div style={{borderTop:`1px solid ${T.divider}`,paddingTop:10,marginTop:4}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.accent,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>30-day check-in</div>
                    <div style={{fontSize:13,color:T.sub,fontStyle:"italic",lineHeight:1.55}}>{activeSheet.checkin}</div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:14,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:10}}>Where are you now?</div>
                <div style={{display:"flex",flexDirection:"column",gap:0,overflow:"hidden",borderRadius:10,border:`1px solid ${T.border}`}}>
                  {STATUS_OPTS.map((opt,i)=>(
                    <button key={opt} onClick={()=>setEditStatus(opt)} style={{padding:"11px 14px",border:"none",borderTop:i>0?`1px solid ${T.divider}`:"none",background:editStatus===opt?T.accentSoft:"transparent",color:editStatus===opt?T.accent:T.text,fontSize:14,fontWeight:editStatus===opt?600:400,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"background 0.15s"}}>
                      <span>{opt}</span>
                      {editStatus===opt&&<svg width="10" height="8" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div style={{background:T.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${T.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:10}}>Goals <span style={{fontWeight:400,color:T.muted}}>(optional)</span></div>
                {editGoals.map((g,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                    <button onClick={()=>setEditGoals(p=>p.map((gg,j)=>j===i?{...gg,done:!gg.done}:gg))} style={{width:20,height:20,borderRadius:"50%",border:g.done?"none":`1.5px solid ${T.muted}`,background:g.done?T.accent:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
                      {g.done&&<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <span style={{flex:1,fontSize:14,color:T.text,textDecoration:g.done?"line-through":"none",opacity:g.done?0.5:1}}>{g.text}</span>
                    <button onClick={()=>setEditGoals(p=>p.filter((_,j)=>j!==i))} style={{color:T.muted,background:"none",border:"none",fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGoal()} placeholder="Add a goal..." style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card,color:T.text,fontSize:14,fontFamily:"inherit",outline:"none"}}/>
                  <button onClick={addGoal} disabled={!newGoal.trim()} style={{padding:"9px 14px",borderRadius:10,border:"none",background:newGoal.trim()?T.accent:T.card,color:newGoal.trim()?T.accentText:T.muted,fontSize:13,fontWeight:700,cursor:newGoal.trim()?"pointer":"default",fontFamily:"inherit",transition:"all 0.2s"}}>Add</button>
                </div>
              </div>
            </div>

            {/* Bottom safe area */}
            <div style={{flexShrink:0,height:32,background:T.surface}}/>
          </div>
        </>
      )}
    </div>
  );
}




const AreaIconSVG = ({id, size=16, color="currentColor"}) => {
  const s={width:size,height:size,display:"block",flexShrink:0};
  const sw="1.4";
  switch(id){
    case "work":   return <svg style={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.5" stroke={color} strokeWidth={sw}/><path d="M5 5V4a3 3 0 016 0v1" stroke={color} strokeWidth={sw} strokeLinecap="round"/><path d="M2 9h12" stroke={color} strokeWidth={sw}/></svg>;
    case "home":   return <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M2 7.5L8 2l6 5.5V14a.5.5 0 01-.5.5h-4V10H6.5v4.5h-4A.5.5 0 012 14V7.5z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>;
    case "health": return <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M8 13S2 9.5 2 5.5a3.5 3.5 0 016-2.45A3.5 3.5 0 0114 5.5C14 9.5 8 13 8 13z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>;
    case "money":  return <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={color} strokeWidth={sw}/><path d="M8 4.5v7" stroke={color} strokeWidth={sw} strokeLinecap="round"/><path d="M10 6.5a2 2 0 00-4 0c0 .8.9 1.5 2 1.5s2 .7 2 1.5a2 2 0 01-4 0" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
    case "family": return <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="4" r="1.8" stroke={color} strokeWidth={sw}/><circle cx="10.5" cy="4" r="1.8" stroke={color} strokeWidth={sw}/><path d="M2 14v-2.5A3.5 3.5 0 018 8M14 14v-2.5A3.5 3.5 0 008 8" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
    case "fun":          return <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3.2L13 5.8l-2.5 2.4.6 3.4L8 10l-3.1 1.6.6-3.4L3 5.8l3.5-.6L8 2z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>;
    case "close":        return <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M8 13S2 9.5 2 5.5a3.5 3.5 0 016-2.45A3.5 3.5 0 0114 5.5C14 9.5 8 13 8 13z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>;
    case "contribution": return <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke={color} strokeWidth={sw}/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
    case "meaning":      return <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={color} strokeWidth={sw}/><path d="M8 3v1M8 12v1M3 8h1M12 8h1" stroke={color} strokeWidth={sw} strokeLinecap="round"/><path d="M8 5.5L9.5 8 8 10.5 6.5 8 8 5.5z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>;
    default:       return <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke={color} strokeWidth={sw}/></svg>;
  }
};

const AreaIcon = AreaIconSVG;

const AREA_LABELS = {work:"Work",home:"Home",health:"Health",money:"Money",relationships:"Close Relationships",contribution:"Contribution",meaning:"Meaning"};

function ExtractedTasksFlow({T, message, onTaskConfirmed}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState([]);
  const tasks = message.extractedTasks || [];

  if(tasks.length === 0) return null;

  if(idx >= tasks.length) {
    return (
      <div style={{marginTop:8,padding:"10px 12px",background:T.accentSoft,borderRadius:10,border:"1px solid "+T.accent}}>
        <div style={{fontSize:12,fontWeight:600,color:T.accent}}>{confirmed.length} task{confirmed.length!==1?"s":""} added to your plan.</div>
      </div>
    );
  }

  const task = tasks[idx];

  const confirm = () => {
    if(onTaskConfirmed) onTaskConfirmed({...task, clarifyingAnswer: answer});
    setConfirmed(p=>[...p,idx]);
    setAnswer("");
    setIdx(i=>i+1);
  };

  const skip = () => { setAnswer(""); setIdx(i=>i+1); };

  return (
    <div style={{marginTop:10}}>
      {tasks.length > 1 && (
        <div style={{display:"flex",gap:4,marginBottom:8}}>
          {tasks.map(function(_,i){
            return <div key={i} style={{width:i===idx?14:6,height:6,borderRadius:3,background:i===idx?T.accent:confirmed.includes(i)?T.green:T.divider,transition:"all 0.2s"}}/>;
          })}
        </div>
      )}
      <div style={{background:T.card,borderRadius:14,border:"1px solid "+T.border,overflow:"hidden"}}>
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <AreaIconSVG id={task.area||"work"} size={12} color={T.sub}/>
            <span style={{fontSize:10,color:T.sub,textTransform:"capitalize"}}>{task.area||"work"}</span>
            {task.urgency==="now"&&<span style={{fontSize:10,fontWeight:700,color:T.red,background:"rgba(217,79,79,0.1)",padding:"2px 6px",borderRadius:8,marginLeft:4}}>Now</span>}
            {task.dueDate&&<span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>Due: {task.dueDate}</span>}
          </div>
          <div style={{fontSize:14,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.3,marginBottom:task.note||task.steps&&task.steps.length?6:0}}>{task.label||task.text}</div>
          {task.note&&<div style={{fontSize:11,color:T.muted,fontStyle:"italic",marginBottom:4,lineHeight:1.4}}>{task.note}</div>}
          {task.steps&&task.steps.length>0&&(
            <div style={{marginBottom:4}}>
              {task.steps.map(function(step,i){
                return <div key={i} style={{display:"flex",gap:6,marginBottom:3}}><span style={{fontSize:10,color:T.accent,fontWeight:700,flexShrink:0}}>{i+1}</span><span style={{fontSize:11,color:T.sub,lineHeight:1.4}}>{step}</span></div>;
              })}
            </div>
          )}
          {task.duration&&<div style={{fontSize:10,color:T.muted}}>{task.duration} min</div>}
        </div>
        {task.clarifyingQuestion&&(
          <div style={{borderTop:"1px solid "+T.divider,padding:"10px 14px",background:T.surface}}>
            <div style={{fontSize:12,color:T.sub,fontStyle:"italic",marginBottom:6}}>"{task.clarifyingQuestion}"</div>
            <input value={answer} onChange={function(e){setAnswer(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")confirm();}} placeholder="Answer or skip..." style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
          </div>
        )}
        <div style={{display:"flex",borderTop:"1px solid "+T.divider}}>
          <button onClick={confirm} style={{flex:1,padding:"10px",border:"none",background:T.accent,color:T.accentText,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add to plan</button>
          <button onClick={skip} style={{width:44,padding:"10px",border:"none",borderLeft:"1px solid "+T.divider,background:"transparent",color:T.muted,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
      </div>
      {tasks.length>1&&idx<tasks.length-1&&<div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:4}}>{tasks.length-1-idx} more</div>}
    </div>
  );
}



// ── INLINE TIMER ──────────────────────────────────────────────────────────────
function InlineTimer({T, hours, mins, onTimerChange}) {
  const taskSec = Math.max((parseInt(hours||"0")*3600)+(parseInt(mins||"0")*60), 60);
  const [mode, setMode] = useState("idle");
  const [secs, setSecs] = useState(taskSec);
  const [running, setRun] = useState(false);
  const [done, setDone] = useState(false);
  const [showMenu, setMenu] = useState(false);
  const [cH, setCH] = useState("0h");
  const [cM, setCM] = useState("25m");
  const iv = useRef(null);
  const dm=Math.floor(secs/60), ds=secs%60;
  const timeStr=String(dm).padStart(2,"0")+":"+String(ds).padStart(2,"0");
  useEffect(()=>{ if(mode==="running"&&onTimerChange) onTimerChange(true,timeStr); },[timeStr,mode]);
  useEffect(()=>{
    if(running&&secs>0) iv.current=setInterval(()=>setSecs(s=>s-1),1000);
    else if(secs===0&&running){ setRun(false);setDone(true);clearInterval(iv.current); }
    return ()=>clearInterval(iv.current);
  },[running,secs]);
  const start=(s)=>{ clearInterval(iv.current);setSecs(s);setRun(true);setDone(false);setMode("running");setMenu(false);if(onTimerChange)onTimerChange(true,""); };
  const reset=()=>{ clearInterval(iv.current);setRun(false);setDone(false);setSecs(taskSec);setMode("idle");setMenu(false);if(onTimerChange)onTimerChange(false,""); };
  const row={width:"100%",padding:"11px 14px",border:"none",background:"transparent",color:"currentColor",fontSize:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left"};
  if(mode==="idle") return <button onClick={()=>setMode("pick")} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,border:"1px solid "+T.border,background:T.card,color:T.sub,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>⏱ Timer</button>;
  if(mode==="pick") return (
    <div style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setMode("idle")} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,border:"1px solid "+T.accent,background:T.accentSoft,color:T.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>⏱ Timer</button>
      <div style={{position:"absolute",top:36,right:0,zIndex:20,background:T.card,borderRadius:12,overflow:"hidden",border:"1px solid "+T.border,boxShadow:T.shadow,minWidth:180}}>
        <button onClick={()=>start(taskSec)} style={{...row,borderBottom:"1px solid "+T.divider,color:T.text}}>Task — {(parseInt(hours||"0")>0?hours+" ":"")+(mins||"25m")}</button>
        <button onClick={()=>start(25*60)} style={{...row,borderBottom:"1px solid "+T.divider,color:T.text}}>Pomodoro — 25m</button>
        <button onClick={()=>setMode("custom")} style={{...row,borderBottom:"1px solid "+T.divider,color:T.text}}>Custom</button>
        <button onClick={()=>setMode("idle")} style={{...row,color:T.muted,fontSize:13}}>Cancel</button>
      </div>
    </div>
  );
  if(mode==="custom") return (
    <div style={{position:"relative",flexShrink:0}}>
      <button style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,border:"1px solid "+T.accent,background:T.accentSoft,color:T.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>⏱ Timer</button>
      <div style={{position:"absolute",top:36,right:0,zIndex:20,background:T.card,borderRadius:12,overflow:"hidden",border:"1px solid "+T.border,boxShadow:T.shadow,minWidth:200,padding:"14px"}}>
        <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:10}}>Custom</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <select value={cH} onChange={e=>setCH(e.target.value)} style={{flex:1,padding:"8px",borderRadius:9,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}>{["0h","1h","2h","3h","4h"].map(h=><option key={h}>{h}</option>)}</select>
          <select value={cM} onChange={e=>setCM(e.target.value)} style={{flex:1,padding:"8px",borderRadius:9,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}>{["0m","5m","10m","15m","20m","25m","30m","45m"].map(m=><option key={m}>{m}</option>)}</select>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setMode("pick")} style={{flex:1,padding:"9px",borderRadius:9,border:"1px solid "+T.border,background:"transparent",color:T.sub,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Back</button>
          <button onClick={()=>start((parseInt(cH)*3600)+(parseInt(cM)*60)||60)} style={{flex:2,padding:"9px",borderRadius:9,border:"none",background:T.accent,color:T.accentText,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Start</button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setMenu(m=>!m)} style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(done?T.green:T.accent),background:done?"rgba(61,170,106,0.1)":T.accentSoft,color:done?T.green:T.accent,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Lora',serif",whiteSpace:"nowrap"}}>
        {done?"✓":timeStr}
      </button>
      {showMenu&&(
        <div style={{position:"absolute",top:36,right:0,zIndex:20,background:T.card,borderRadius:12,overflow:"hidden",border:"1px solid "+T.border,boxShadow:T.shadow,minWidth:160}}>
          {!done&&<button onClick={()=>{setRun(r=>!r);setMenu(false);}} style={{...row,borderBottom:"1px solid "+T.divider,color:T.text,fontSize:15,fontWeight:600}}>{running?"Pause":"Resume"}</button>}
          <button onClick={reset} style={{...row,color:T.red,fontSize:14}}>Cancel timer</button>
        </div>
      )}
    </div>
  );
}

// ── LIVE CLOCK ────────────────────────────────────────────────────────────────
function LiveClock({T, timerActive, timerDisplay}) {
  const [time, setTime] = useState(new Date());
  useEffect(()=>{ const iv=setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(iv); },[]);
  const timeStr = time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  const dateStr = time.toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"});
  return (
    <div style={{marginBottom:8}}>
      {timerActive ? (
        <div>
          <div style={{fontSize:48,fontWeight:300,color:T.accent,fontFamily:"'Lora',serif",letterSpacing:"-2px",lineHeight:1}}>{timerDisplay||"00:00"}</div>
          <div style={{fontSize:12,color:T.muted,marginTop:2}}>{timeStr} · {dateStr}</div>
        </div>
      ) : (
        <div>
          <div style={{fontSize:48,fontWeight:300,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-2px",lineHeight:1}}>{timeStr}</div>
          <div style={{fontSize:12,color:T.muted,marginTop:2}}>{dateStr}</div>
        </div>
      )}
    </div>
  );
}

// ── TASK SHEET ────────────────────────────────────────────────────────────────
const TASK_AREAS = {work:"Work",home:"Home",health:"Health",money:"Money",close:"Close relationships",contribution:"Contribution",meaning:"Meaning"};
const HOURS=["0h","1h","2h","3h","4h"];
const MINS=["0m","15m","30m","45m"];
const SUB_MINS=["5m","10m","15m","20m","30m","45m","60m","90m"];

function TaskSheet({T, task, open, onClose, onSave, onDelete, onGetUnstuck}) {
  const sheetRef=useRef(null);
  const [visible,setVisible]=useState(false);
  const [name,setName]=useState("");
  const [area,setArea]=useState("work");
  const [pickingArea,setPickingArea]=useState(false);
  const [desc,setDesc]=useState("");
  const [hours,setHours]=useState("0h");
  const [mins,setMins]=useState("30m");
  const [dueDate,setDueDate]=useState("");
  const [subtasks,setSubtasks]=useState([]);
  const [newSubText,setNewSubText]=useState("");
  const [newSubMins,setNewSubMins]=useState("15m");
  const [newSubDue,setNewSubDue]=useState("");
  const [notes,setNotes]=useState("");
  const [timerActive,setTimerActive]=useState(false);
  const [timerDisplay,setTimerDisplay]=useState("");
  const dragY=useRef(null);

  useEffect(()=>{
    if(task){setArea(task.area||"work");setName(task.label||"");setDesc(task.desc||"");setHours(task.hours||"0h");setMins(task.mins||"30m");setDueDate(task.dueDate||"");setSubtasks(task.subtasks||[]);setNotes(task.notes||"");}
  },[task]);
  useEffect(()=>{ if(open) setTimeout(()=>setVisible(true),10); else setVisible(false); },[open]);

  const handleClose=()=>{ onSave({...task,area,label:name,desc,hours,mins,dueDate,subtasks,notes});setVisible(false);setTimeout(onClose,320); };
  const onDS=e=>{ dragY.current=e.touches[0].clientY;if(sheetRef.current)sheetRef.current.style.transition="none"; };
  const onDM=e=>{ if(!dragY.current)return;const dy=e.touches[0].clientY-dragY.current;if(dy>0&&sheetRef.current)sheetRef.current.style.transform="translateY("+dy+"px)"; };
  const onDE=e=>{ const dy=e.changedTouches[0].clientY-(dragY.current||0);if(sheetRef.current)sheetRef.current.style.transition="";if(dy>80)handleClose();else if(sheetRef.current)sheetRef.current.style.transform="";dragY.current=null; };
  const addSub=()=>{ if(!newSubText.trim())return;setSubtasks(p=>[...p,{text:newSubText.trim(),done:false,mins:newSubMins,dueDate:newSubDue}]);setNewSubText("");setNewSubMins("15m");setNewSubDue(""); };
  const sel={padding:"9px 10px",borderRadius:10,border:"1px solid "+T.border,background:T.card,color:T.sub,fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer",width:"100%",height:"40px",boxSizing:"border-box"};

  if(!open&&!visible) return null;
  return (
    <>
      <div onClick={handleClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.28)",backdropFilter:"blur(4px)",transition:"opacity 0.3s",opacity:visible?1:0}}/>
      <div ref={sheetRef} style={{position:"fixed",inset:0,zIndex:401,display:"flex",flexDirection:"column",background:T.surface,transition:"transform 0.32s cubic-bezier(0.32,0.72,0,1)",transform:visible?"translateY(0)":"translateY(100%)"}}>
        <div onTouchStart={onDS} onTouchMove={onDM} onTouchEnd={onDE} style={{flexShrink:0,padding:"52px 20px 12px",background:T.surface,borderBottom:"1px solid "+T.divider,touchAction:"none"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.divider}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <button onClick={handleClose} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",padding:0,flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div style={{flex:1}}/>
            <div style={{position:"relative",flexShrink:0}}>
              <button onClick={()=>setPickingArea(p=>!p)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:10,border:"1px solid "+T.border,background:T.card,cursor:"pointer",flexShrink:0}}>
                <AreaIconSVG id={area} size={13} color={T.sub}/>
                <span style={{fontSize:12,color:T.sub,fontWeight:500,whiteSpace:"nowrap"}}>{TASK_AREAS[area]||"Work"}</span>
              </button>
              {pickingArea&&(
                <div style={{position:"absolute",top:38,right:0,zIndex:10,background:T.card,borderRadius:12,overflow:"hidden",border:"1px solid "+T.border,boxShadow:T.shadow,minWidth:160}}>
                  {Object.entries(TASK_AREAS).map(([id,lbl],i)=>(
                    <button key={id} onClick={()=>{setArea(id);setPickingArea(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"none",borderTop:i>0?"1px solid "+T.divider:"none",background:area===id?T.accentSoft:"transparent",color:area===id?T.accent:T.text,fontSize:13,fontWeight:area===id?600:400,cursor:"pointer",fontFamily:"inherit"}}>
                      <AreaIconSVG id={id} size={13} color={area===id?T.accent:T.sub}/><span style={{flex:1}}>{lbl}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <InlineTimer T={T} hours={hours} mins={mins} onTimerChange={(active,display)=>{setTimerActive(active);setTimerDisplay(display);}}/>
          </div>
          <LiveClock T={T} timerActive={timerActive} timerDisplay={timerDisplay}/>
          <input value={name} onChange={e=>setName(e.target.value)} style={{fontSize:20,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",border:"none",background:"transparent",outline:"none",lineHeight:1.3,width:"100%"}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 20px"}}>
          <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Description</div>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="If you handed this off, what would they need to know?" rows={3} style={{width:"100%",border:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,outline:"none",resize:"none"}}/>
          </div>
          <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{display:"flex",gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Duration</div>
                <div style={{display:"flex",gap:6}}>
                  <select value={hours} onChange={e=>setHours(e.target.value)} style={{...sel,flex:1}}>{HOURS.map(h=><option key={h}>{h}</option>)}</select>
                  <select value={mins} onChange={e=>setMins(e.target.value)} style={{...sel,flex:1}}>{MINS.map(m=><option key={m}>{m}</option>)}</select>
                </div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Due date</div>
                <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{...sel}}/>
              </div>
            </div>
          </div>
          <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:12}}>Steps <span style={{fontWeight:400,color:T.sub,opacity:0.6}}>(optional)</span></div>
            {subtasks.map((sub,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+T.divider}}>
                <button onClick={()=>setSubtasks(p=>p.map((s,j)=>j===i?{...s,done:!s.done}:s))} style={{width:20,height:20,borderRadius:"50%",border:sub.done?"none":"1.5px solid "+T.sub,background:sub.done?T.accent:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
                  {sub.done&&<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <span style={{flex:1,fontSize:14,color:sub.done?T.sub:T.text,textDecoration:sub.done?"line-through":"none"}}>{sub.text}</span>
                <span style={{fontSize:11,color:T.muted}}>{sub.mins}</span>
                <button onClick={()=>setSubtasks(p=>p.filter((_,j)=>j!==i))} style={{color:T.sub,background:"none",border:"none",fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
              </div>
            ))}
            <div style={{background:T.surface,borderRadius:10,padding:"10px 12px",border:"1px dashed "+T.border}}>
              <input value={newSubText} onChange={e=>setNewSubText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()} placeholder="Add a step..." style={{width:"100%",border:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:8}}/>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <select value={newSubMins} onChange={e=>setNewSubMins(e.target.value)} style={{...sel,flex:1,fontSize:12}}>{SUB_MINS.map(m=><option key={m}>{m}</option>)}</select>
                <input type="date" value={newSubDue} onChange={e=>setNewSubDue(e.target.value)} style={{...sel,flex:1,fontSize:12}}/>
                <button onClick={addSub} disabled={!newSubText.trim()} style={{padding:"9px 14px",borderRadius:10,border:"none",background:newSubText.trim()?T.accent:T.card,color:newSubText.trim()?T.accentText:T.muted,fontSize:13,fontWeight:700,cursor:newSubText.trim()?"pointer":"default",fontFamily:"inherit",alignSelf:"flex-end"}}>Add</button>
              </div>
            </div>
          </div>
          <div style={{background:T.card,borderRadius:14,padding:"14px 16px",border:"1px solid "+T.border}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Notes</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes, links, or context..." rows={3} style={{width:"100%",border:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,outline:"none",resize:"none"}}/>
          </div>
          {onGetUnstuck&&task&&(
            <button onClick={()=>{ handleClose(); setTimeout(()=>onGetUnstuck(task),340); }} style={{width:"100%",padding:"13px",border:"1px solid "+T.accent+"40",borderRadius:14,background:"transparent",color:T.accent,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",textAlign:"center",marginBottom:8}}>
              Feeling stuck? Get unstuck →
            </button>
          )}
          {onDelete&&task&&(
            <button onClick={()=>onDelete(task.id)} style={{width:"100%",padding:"13px",border:"1px solid "+T.red+"40",borderRadius:14,background:"transparent",color:T.red,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M13 4l-1 10H4L3 4" stroke={T.red} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Delete task
            </button>
          )}
        </div>
        <div style={{flexShrink:0,height:32,background:T.surface}}/>
      </div>
    </>
  );
}

// ── PLAN CONTENT ──────────────────────────────────────────────────────────────
const MOCK_TASKS=[
  {id:1,label:"Pay lease renewal",area:"money",hours:"0h",mins:"20m",dueDate:"2025-05-01",desc:"",subtasks:[],done:false,notes:""},
  {id:2,label:"Follow up with client",area:"work",hours:"0h",mins:"30m",dueDate:"2025-05-02",desc:"",subtasks:[],done:false,notes:""},
  {id:3,label:"Call mom back",area:"close",hours:"0h",mins:"10m",dueDate:"2025-05-03",desc:"",subtasks:[],done:false,notes:""},
  {id:4,label:"Morning movement",area:"health",hours:"0h",mins:"30m",dueDate:"2025-05-03",desc:"",subtasks:[],done:true,notes:""},
  {id:5,label:"Review budget",area:"money",hours:"0h",mins:"20m",dueDate:"2025-05-04",desc:"",subtasks:[],done:false,notes:""},
  {id:6,label:"Deep work block",area:"work",hours:"1h",mins:"0m",dueDate:"2025-05-04",desc:"",subtasks:[],done:true,notes:""},
];

const formatDue=(d)=>{ if(!d)return"";const date=new Date(d);const today=new Date();today.setHours(0,0,0,0);const diff=Math.round((date-today)/(1000*60*60*24));if(diff<0)return"Overdue";if(diff===0)return"Today";if(diff===1)return"Tomorrow";return date.toLocaleDateString([],{month:"short",day:"numeric"}); };
const dueColor=(d,T)=>{ if(!d)return T.muted;const date=new Date(d);const today=new Date();today.setHours(0,0,0,0);const diff=Math.round((date-today)/(1000*60*60*24));if(diff<0)return T.red;if(diff<=1)return T.accent;return T.muted; };

const CAL_ROUTINE_DEFS = [
  {id:"morning", label:"Morning Routine", time:"6:00 AM", h:6, m:0, isMorning:true, steps:[
    {id:"m1",text:"Medication",dur:2},{id:"m2",text:"Morning review",dur:5},{id:"m3",text:"Movement",dur:20},
  ]},
  {id:"startup", label:"Startup", time:"9:00 AM", h:9, m:0, steps:[
    {id:"st1",text:"Review Top 3",dur:5},{id:"st2",text:"Set intention",dur:3},{id:"st3",text:"Clear open loops",dur:5},
  ]},
  {id:"shutdown", label:"Shutdown", time:"5:30 PM", h:17, m:30, steps:[
    {id:"sh1",text:"Capture open loops",dur:5},{id:"sh2",text:"Prep tomorrow",dur:5},
  ]},
  {id:"evening", label:"Evening", time:"7:00 PM", h:19, m:0, steps:[
    {id:"e1",text:"Decompress / family time",dur:30},{id:"e2",text:"Bedtime prep",dur:15},
  ]},
];
const CHECK_SVG=(c)=><svg width="8" height="6" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CHEVRON=(c,up)=><svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:up?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><path d="M3 6l5 5 5-5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// Reusable Card — consistent appearance everywhere a task appears
function TaskCard({T, task, badge, onCheck, onClick, onRemove, draggable:isDrag, onDragStart, dragOver}) {
  return (
    <div draggable={isDrag} onDragStart={onDragStart}
      onClick={onClick}
      style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:T.surface,borderRadius:10,cursor:"pointer",border:"1.5px solid "+(dragOver?T.accent:"transparent"),transition:"border-color 0.12s",userSelect:"none"}}>
      <div onClick={e=>{e.stopPropagation();onCheck&&onCheck();}} style={{width:20,height:20,borderRadius:"50%",border:task.done?"none":"1.5px solid "+T.sub,background:task.done?T.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",cursor:"pointer"}}>
        {task.done&&CHECK_SVG(T.accentText)}
      </div>
      {badge!==undefined&&<div style={{width:18,height:18,borderRadius:"50%",background:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:700,color:T.accent}}>{badge}</span></div>}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,color:task.done?T.sub:T.text,textDecoration:task.done?"line-through":"none",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.label}</div>
        {task.dueDate&&<div style={{fontSize:10,color:T.muted,marginTop:1}}>{task.hours} {task.mins}</div>}
      </div>
      {onRemove&&<button onClick={e=>{e.stopPropagation();onRemove();}} style={{background:"none",border:"none",color:T.sub,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1,flexShrink:0}}>×</button>}
    </div>
  );
}

function CalendarView({T, workTasks, setWorkTasks, routineDone, setRoutineDone, onTaskClick, workBlockMins, setWorkBlockMins, markDone, outerScrollRef}) {
  const PX_HR=96, PX_MIN=PX_HR/60, START_H=6, END_H=22, GAP=3;
  const TOTAL_PX=(END_H-START_H)*PX_HR;
  const gestureRef=useRef(null);
  const sheetBlockRef=useRef(null);
  const longPressRef=useRef(null);
  const blockOffsetsRef=useRef({});
  const allBlocksRef=useRef([]);
  const gridRef=useRef(null);
  const editingBlockIdRef=useRef(null);
  const [gesture,setGesture]=useState(null);
  const [editingBlockId,setEditingBlockId]=useState(null);
  const [expandedId,setExpandedId]=useState(null);  // block id or null
  const [sheetVisible,setSheetVisible]=useState(false); // drives CSS transform
  const [blockOffsets,setBlockOffsets]=useState(()=>{try{const s=localStorage.getItem("steady_cal_offsets");return s?JSON.parse(s):{morning:0,startup:0,workblock:0,shutdown:0,evening:0};}catch{return {morning:0,startup:0,workblock:0,shutdown:0,evening:0};}});
  const [blockDurs,setBlockDurs]=useState(()=>{try{const s=localStorage.getItem("steady_cal_durs");return s?JSON.parse(s):{};}catch{return {};}});
  const [stepOrders,setStepOrders]=useState(()=>{try{const s=localStorage.getItem("steady_cal_steporders");if(s){const p=JSON.parse(s);return Object.fromEntries(CAL_ROUTINE_DEFS.map(rb=>[rb.id,p[rb.id]||rb.steps.map(s=>s.id)]));}  }catch{}return Object.fromEntries(CAL_ROUTINE_DEFS.map(rb=>[rb.id,rb.steps.map(s=>s.id)]));});
  const [cardDrag,setCardDrag]=useState(null);
  const [expandedStepId,setExpandedStepId]=useState(null);
  const [stepNotes,setStepNotes]=useState(()=>{try{return JSON.parse(localStorage.getItem("steady_step_notes")||"{}");}catch{return {};}});
  const touchCardDragRef=useRef(null);
  const reorderCardsRef=useRef(null);

  useEffect(()=>{try{localStorage.setItem("steady_cal_steporders",JSON.stringify(stepOrders));}catch{}},[stepOrders]);
  useEffect(()=>{try{localStorage.setItem("steady_step_notes",JSON.stringify(stepNotes));}catch{}},[stepNotes]);
  useEffect(()=>{
    if(!sheetVisible)return;
    const onMove=(e)=>{
      if(!touchCardDragRef.current)return;
      e.preventDefault();
      const touch=e.touches[0];
      const{startY,cardH,blockId,fromIdx}=touchCardDragRef.current;
      const dy=touch.clientY-startY;
      const newIdx=Math.max(0,Math.round(fromIdx+dy/cardH));
      touchCardDragRef.current.currentIdx=newIdx;
      setCardDrag({blockId,fromIdx,toIdx:newIdx});
    };
    const onEnd=()=>{
      if(!touchCardDragRef.current)return;
      const{blockId,fromIdx,currentIdx}=touchCardDragRef.current;
      reorderCardsRef.current&&reorderCardsRef.current(blockId,fromIdx,currentIdx??fromIdx);
      touchCardDragRef.current=null;
      setCardDrag(null);
    };
    window.addEventListener("touchmove",onMove,{passive:false});
    window.addEventListener("touchend",onEnd);
    return()=>{window.removeEventListener("touchmove",onMove);window.removeEventListener("touchend",onEnd);};
  },[sheetVisible]);

  const now=new Date();
  const nowPx=(now.getHours()-START_H)*PX_HR+now.getMinutes()*PX_MIN;
  const toY=(h,m)=>(h-START_H)*PX_HR+m*PX_MIN;
  const durStr=(m)=>{ const h=Math.floor(m/60),r=m%60; return h>0?`${h}h${r>0?" "+r+"m":""}`:r+"m"; };
  const fmtH=(h)=>h===0?"12am":h<12?`${h}am`:h===12?"12pm":`${h-12}pm`;
  const fmtStart=(mins)=>{const h=Math.floor(mins/60),m=mins%60,b=h===0?"12":h<=12?`${h}`:`${h-12}`,s=h<12?"am":"pm";return m>0?`${b}:${String(m).padStart(2,"0")}${s}`:`${b}${s}`;};
  const hours=Array.from({length:END_H-START_H+1},(_,i)=>START_H+i);

  const stepTotal=(rb)=>rb.steps.reduce((a,s)=>a+s.dur,0);
  const getDur=(id,def)=>id==="workblock"?workBlockMins:(blockDurs[id]!=null?blockDurs[id]:def);

  const buildBlocks=()=>[
    ...CAL_ROUTINE_DEFS.map(rb=>({id:rb.id,label:rb.label,h:rb.h,m:rb.m,steps:rb.steps,defMins:stepTotal(rb),isRoutine:true})),
    {id:"workblock",label:"Work Block",h:9,m:15,steps:[],defMins:workBlockMins,isWorkBlock:true},
  ].map(b=>{
    const off=blockOffsets[b.id]||0;
    const startMins=Math.max(START_H*60,Math.min((END_H-0.5)*60,b.h*60+b.m+off));
    const dur=getDur(b.id,b.defMins);
    return {...b,startMins,dur,endMins:startMins+dur,top:toY(Math.floor(startMins/60),startMins%60)};
  }).sort((a,b)=>a.startMins-b.startMins);

  const ALL_BLOCKS=buildBlocks();
  allBlocksRef.current=ALL_BLOCKS;
  blockOffsetsRef.current=blockOffsets;
  editingBlockIdRef.current=editingBlockId;

  // Keep sheet content available during close animation
  if(expandedId) sheetBlockRef.current=ALL_BLOCKS.find(b=>b.id===expandedId)||sheetBlockRef.current;
  const sheetBlock=sheetBlockRef.current;

  const openBlock=(id)=>{ setExpandedId(id); requestAnimationFrame(()=>setSheetVisible(true)); };
  const closeBlock=()=>{ setSheetVisible(false); setTimeout(()=>{ setExpandedId(null); sheetBlockRef.current=null; },360); };

  useEffect(()=>{
    const t=setTimeout(()=>{ if(outerScrollRef?.current)outerScrollRef.current.scrollTop=Math.max(0,nowPx-90); },150);
    return ()=>clearTimeout(t);
  },[]);

  useEffect(()=>{ try{localStorage.setItem("steady_cal_offsets",JSON.stringify(blockOffsets));}catch{} },[blockOffsets]);
  useEffect(()=>{ try{localStorage.setItem("steady_cal_durs",JSON.stringify(blockDurs));}catch{} },[blockDurs]);

  // Always-on gesture listeners — registered once so touchmove is passive:false
  // from the very first touchmove, preventing page scroll during resize/drag.
  useEffect(()=>{
    const onMove=(e)=>{
      if(!gestureRef.current) return;
      if(e.cancelable) e.preventDefault();
      const cy=e.touches?e.touches[0].clientY:e.clientY;
      const g=gestureRef.current;
      if(g.type==="resize"){
        const snapped=Math.round(((cy-g.y)/PX_MIN)/15)*15;
        const nd=Math.max(15,Math.min(600,g.origDur+snapped));
        if(g.id==="workblock") setWorkBlockMins(nd);
        else setBlockDurs(p=>({...p,[g.id]:nd}));
      } else if(g.type==="drag"){
        const dy=cy-g.y;
        if(Math.abs(dy)>6) g.moved=true;
        if(!g.moved) return;
        let proposed=g.defaultStart+g.origOff+dy/PX_MIN;
        let lo=START_H*60, hi=(END_H-0.5)*60-g.myDur;
        const myCenter=proposed+g.myDur/2;
        for(const o of g.others){
          const oCenter=o.startMins+(o.endMins-o.startMins)/2;
          if(oCenter<myCenter) lo=Math.max(lo,o.endMins+GAP);
          else hi=Math.min(hi,o.startMins-g.myDur-GAP);
        }
        proposed=Math.max(lo,Math.min(hi,proposed));
        proposed=Math.round(proposed/15)*15;
        proposed=Math.max(lo,Math.min(hi,proposed));
        setBlockOffsets(p=>({...p,[g.id]:proposed-g.defaultStart}));
      }
    };
    const onUp=()=>{ setGesture(null);gestureRef.current=null; };
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    window.addEventListener("touchmove",onMove,{passive:false});
    window.addEventListener("touchend",onUp);
    return ()=>{ window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);window.removeEventListener("touchmove",onMove);window.removeEventListener("touchend",onUp); };
  },[]);

  const startResize=(e,block)=>{
    e.preventDefault();e.stopPropagation();
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    gestureRef.current={type:"resize",y:cy,id:block.id,origDur:block.dur};
    setGesture("resize-"+block.id);
  };
  const startDrag=(e,block)=>{
    e.preventDefault();
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    gestureRef.current={
      type:"drag",y:cy,id:block.id,
      defaultStart:block.h*60+block.m,
      origOff:blockOffsets[block.id]||0,
      myDur:block.dur,moved:false,
      others:ALL_BLOCKS.filter(b=>b.id!==block.id).map(b=>({startMins:b.startMins,endMins:b.endMins})),
    };
    setGesture("drag-"+block.id);
  };

  // Native non-passive touchstart on the grid — lets us preventDefault before
  // iOS fires its own 300ms text-selection / callout gesture.
  useEffect(()=>{
    const grid=gridRef.current;
    if(!grid) return;
    const handler=(e)=>{
      if(gestureRef.current) return;
      if(e.target.closest('[data-no-drag]')) return;
      const editingId=editingBlockIdRef.current;

      // Resize handle
      const resizeZone=e.target.closest('[data-resize-zone]');
      if(resizeZone){
        const blockId=resizeZone.dataset.resizeZone;
        const block=allBlocksRef.current.find(b=>String(b.id)===blockId);
        if(!block) return;
        if(editingId===blockId){
          // Already in edit mode — start resize immediately
          e.preventDefault();
          gestureRef.current={type:"resize",y:e.touches[0].clientY,id:block.id,origDur:block.dur};
          setGesture("resize-"+block.id);
        } else {
          // Not in edit mode — long-press enters edit mode and immediately arms resize
          if(editingId){editingBlockIdRef.current=null;setEditingBlockId(null);}
          const startY=e.touches[0].clientY;
          longPressRef.current={
            blockId,startY,
            timer:setTimeout(()=>{
              if(navigator.vibrate) navigator.vibrate(35);
              editingBlockIdRef.current=blockId;
              setEditingBlockId(blockId);
              gestureRef.current={type:"resize",y:startY,id:block.id,origDur:block.dur};
              setGesture("resize-"+blockId);
              longPressRef.current=null;
            },400),
          };
        }
        return;
      }

      // Drag zone
      const dragZone=e.target.closest('[data-drag-zone]');
      if(dragZone){
        const blockId=dragZone.dataset.dragZone;
        if(editingId===blockId){
          // Already editing — immediate drag, prevent scroll
          e.preventDefault();
          const startY=e.touches[0].clientY;
          const block=allBlocksRef.current.find(b=>String(b.id)===blockId);
          if(!block) return;
          const others=allBlocksRef.current.filter(b=>b.id!==block.id).map(b=>({startMins:b.startMins,endMins:b.endMins}));
          gestureRef.current={type:"drag",y:startY,id:block.id,defaultStart:block.h*60+block.m,origOff:blockOffsetsRef.current[block.id]||0,myDur:block.dur,moved:true,others};
          setGesture("drag-"+block.id);
        } else {
          // Not editing — 400ms long-press enters edit mode; scroll is allowed until then
          if(editingId){editingBlockIdRef.current=null;setEditingBlockId(null);}
          const startY=e.touches[0].clientY;
          const block=allBlocksRef.current.find(b=>String(b.id)===blockId);
          if(!block) return;
          longPressRef.current={
            blockId,startY,
            timer:setTimeout(()=>{
              if(navigator.vibrate) navigator.vibrate(35);
              editingBlockIdRef.current=blockId;
              setEditingBlockId(blockId);
              longPressRef.current=null;
            },400),
          };
        }
        return;
      }

      // Touch outside any block zone — exit edit mode
      if(editingId){editingBlockIdRef.current=null;setEditingBlockId(null);}
    };
    grid.addEventListener('touchstart',handler,{passive:false});
    return ()=>grid.removeEventListener('touchstart',handler);
  },[]);

  const onBlockTouchMove=(e)=>{
    if(!longPressRef.current) return;
    if(Math.abs(e.touches[0].clientY-longPressRef.current.startY)>8){
      clearTimeout(longPressRef.current.timer);
      longPressRef.current=null;
    }
  };
  const onBlockTouchEnd=()=>{ if(longPressRef.current){ clearTimeout(longPressRef.current.timer); longPressRef.current=null; } };

  const reorderCards=(blockId,from,to)=>{
    if(from===to)return;
    if(blockId==="workblock") setWorkTasks(p=>{const a=[...p];const[i]=a.splice(from,1);a.splice(to,0,i);return a;});
    else setStepOrders(p=>{const a=[...p[blockId]];const[i]=a.splice(from,1);a.splice(to,0,i);return{...p,[blockId]:a};});
  };
  reorderCardsRef.current=reorderCards;

  // Shared card row renderer for the sheet
  const renderCard=(blockId,item,i,isTask)=>{
    const isDragOver=cardDrag?.blockId===blockId&&cardDrag?.toIdx===i;
    const done=isTask?item.done:routineDone[item.id];
    const stepExpanded=!isTask&&expandedStepId===item.id;
    return (
      <div key={item.id}
        draggable={isTask}
        onDragStart={isTask?e=>{e.stopPropagation();e.dataTransfer.setDragImage(e.currentTarget,e.nativeEvent.offsetX,e.nativeEvent.offsetY);setCardDrag({blockId,fromIdx:i,toIdx:i});}:undefined}
        onDragOver={e=>{e.preventDefault();e.stopPropagation();setCardDrag(p=>p?{...p,toIdx:i}:null);}}
        onDrop={e=>{e.preventDefault();e.stopPropagation();cardDrag&&reorderCards(blockId,cardDrag.fromIdx,i);setCardDrag(null);}}
        onDragEnd={()=>setCardDrag(null)}
        style={{display:"flex",flexDirection:"column",background:isDragOver?T.accentSoft:T.surface,borderRadius:12,border:"1.5px solid "+(isDragOver?T.accent:stepExpanded?T.accent+"60":T.border),transition:"background 0.1s,border-color 0.15s",userSelect:"none",WebkitUserSelect:"none",boxSizing:"border-box"}}>
        {/* Main row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px"}}>
          {/* Checkbox */}
          <div
            onClick={e=>{e.stopPropagation();isTask?markDone&&markDone(item.id):setRoutineDone(p=>({...p,[item.id]:!p[item.id]}));}}
            style={{width:22,height:22,borderRadius:"50%",border:done?"none":"1.5px solid "+T.sub,background:done?T.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",cursor:"pointer"}}>
            {done&&CHECK_SVG(T.accentText)}
          </div>
          {isTask&&i<3&&<div style={{width:18,height:18,borderRadius:"50%",background:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:700,color:T.accent}}>{i+1}</span></div>}
          {/* Label — tap opens detail */}
          <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={isTask?()=>onTaskClick&&onTaskClick(item):()=>setExpandedStepId(p=>p===item.id?null:item.id)}>
            <div style={{fontSize:14,color:done?T.sub:T.text,textDecoration:done?"line-through":"none",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isTask?item.label:item.text}</div>
            {!isTask&&<div style={{fontSize:11,color:T.muted,marginTop:1}}>{item.dur}m{stepNotes[item.id]?" · has notes":""}</div>}
          </div>
          {/* Drag handle — touch to reorder */}
          <span
            onTouchStart={e=>{e.stopPropagation();touchCardDragRef.current={blockId,fromIdx:i,currentIdx:i,startY:e.touches[0].clientY,cardH:62};setCardDrag({blockId,fromIdx:i,toIdx:i});}}
            style={{fontSize:16,color:T.muted,cursor:"grab",flexShrink:0,paddingLeft:6,paddingRight:2,touchAction:"none",userSelect:"none",WebkitUserSelect:"none"}}>⠿</span>
        </div>
        {/* Inline detail for routine steps */}
        {stepExpanded&&(
          <div style={{padding:"0 14px 14px",borderTop:"1px solid "+T.divider}}>
            <div style={{fontSize:11,fontWeight:600,color:T.sub,marginTop:10,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>Notes</div>
            <textarea
              placeholder={`Notes for "${item.text}"…`}
              value={stepNotes[item.id]||""}
              onChange={e=>setStepNotes(p=>({...p,[item.id]:e.target.value}))}
              onTouchStart={e=>e.stopPropagation()}
              style={{width:"100%",background:T.bg,border:"1px solid "+T.border,borderRadius:8,padding:"9px 11px",fontSize:13,color:T.text,resize:"none",fontFamily:"inherit",lineHeight:1.5,boxSizing:"border-box",minHeight:76,outline:"none"}}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Calendar grid — parent PlanContent handles scroll */}
      <div ref={gridRef} style={{position:"relative",height:TOTAL_PX+80,userSelect:gesture?"none":"auto",cursor:gesture&&gesture.startsWith("drag-")?"grabbing":"default"}}>

          {/* Hour lines */}
          {hours.map(h=>(
            <div key={h} style={{position:"absolute",top:toY(h,0),left:0,right:0,pointerEvents:"none"}}>
              <span style={{position:"absolute",left:0,top:-9,fontSize:11,color:T.sub,width:50,textAlign:"right",paddingRight:10,lineHeight:1}}>{fmtH(h)}</span>
              <div style={{position:"absolute",left:54,right:0,top:0,height:1,background:T.divider}}/>
            </div>
          ))}
          {hours.slice(0,-1).map(h=>(
            <div key={"m"+h} style={{position:"absolute",top:toY(h,30),left:54,right:0,height:1,background:T.divider,opacity:0.3,pointerEvents:"none"}}/>
          ))}

          {/* Blocks — collapsed, uniform style, only label+duration */}
          {ALL_BLOCKS.map(block=>{
            const isDragging=gesture==="drag-"+block.id;
            const isResizing=gesture==="resize-"+block.id;
            const blockH=Math.max(44,block.dur*PX_MIN);
            const allDone=block.isRoutine&&block.steps.every(s=>routineDone[s.id]);
            const cardTotal=block.isRoutine?block.defMins:0;
            const hasOverflow=block.isRoutine&&blockDurs[block.id]!=null&&cardTotal>blockDurs[block.id];
            const isOpen=expandedId===block.id;
            const isEditing=editingBlockId===block.id;
            const dimmed=!!editingBlockId&&!isEditing;

            return (
              <div key={block.id}
                data-drag-zone={String(block.id)}
                onTouchMove={e=>onBlockTouchMove(e)}
                onTouchEnd={()=>onBlockTouchEnd()}
                style={{
                position:"absolute",left:58,right:10,top:block.top,height:blockH,
                background:T.card,
                border:"1.5px solid "+(hasOverflow?"#E07A5F70":isDragging||isResizing||isEditing?T.accent:isOpen?T.accent+"80":T.border),
                borderRadius:12,overflow:"hidden",boxSizing:"border-box",
                opacity:dimmed?0.35:allDone?0.4:1,
                boxShadow:isDragging?"0 10px 30px rgba(0,0,0,0.2)":isEditing?"0 0 0 3px "+T.accent+"44":isOpen?"0 0 0 2px "+T.accent+"30":"none",
                zIndex:isDragging?30:isEditing?20:1,
                transition:isDragging?"none":"box-shadow 0.2s,border-color 0.2s,opacity 0.3s",
                userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",
              }}>
                {/* Header — long-press whole block to enter edit mode */}
                <div style={{display:"flex",alignItems:"flex-start",height:blockH-28}}>
                  <div
                    onPointerDown={e=>{ if(e.pointerType==="mouse") startDrag(e,block); }}
                    style={{flex:1,padding:"9px 4px 4px 12px",cursor:isDragging?"grabbing":isEditing?"grab":"default",touchAction:isEditing?"none":"pan-y",minWidth:0}}>
                    {blockH>=64?(
                      <>
                        <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
                          <span style={{width:18,flexShrink:0,fontSize:15,color:T.accent,lineHeight:1,visibility:isEditing?"visible":"hidden",textAlign:"center"}}>⠿</span>
                          <span style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{block.label}</span>
                          {hasOverflow&&<span style={{fontSize:9,background:"#E07A5F22",color:"#E07A5F",padding:"1px 5px",borderRadius:6,fontWeight:700,flexShrink:0}}>over</span>}
                        </div>
                        <div style={{fontSize:10,color:T.sub,marginTop:3,fontVariantNumeric:"tabular-nums",paddingLeft:23}}>
                          {fmtStart(block.startMins)} · {block.isWorkBlock?`${workTasks.length} tasks · ${durStr(workBlockMins)}`:durStr(block.dur)}
                        </div>
                      </>
                    ):(
                      <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
                        <span style={{width:18,flexShrink:0,fontSize:15,color:T.accent,lineHeight:1,visibility:isEditing?"visible":"hidden",textAlign:"center"}}>⠿</span>
                        <span style={{fontSize:10,color:T.sub,flexShrink:0,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{fmtStart(block.startMins)}</span>
                        <span style={{fontSize:12,fontWeight:600,color:T.text,lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{block.label}</span>
                        {hasOverflow&&<span style={{fontSize:9,background:"#E07A5F22",color:"#E07A5F",padding:"1px 5px",borderRadius:6,fontWeight:700,flexShrink:0}}>over</span>}
                      </div>
                    )}
                  </div>
                  <div
                    data-no-drag
                    onTouchEnd={e=>{e.stopPropagation();e.preventDefault();isEditing?setEditingBlockId(null):(isOpen?closeBlock():openBlock(block.id));}}
                    onClick={()=>isEditing?setEditingBlockId(null):(isOpen?closeBlock():openBlock(block.id))}
                    style={{alignSelf:"stretch",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 12px",cursor:"pointer",flexShrink:0,minWidth:44}}>
                    {isEditing
                      ? <span style={{fontSize:11,fontWeight:700,color:T.accent,letterSpacing:0.2}}>Done</span>
                      : CHEVRON(T.sub,isOpen)}
                  </div>
                </div>
                {/* Resize handle */}
                <div
                  onMouseDown={e=>startResize(e,block)}
                  data-resize-zone={String(block.id)}
                  style={{position:"absolute",bottom:0,left:0,right:0,height:28,cursor:"ns-resize",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(transparent,"+T.accent+"18)",touchAction:"none"}}>
                  <div style={{width:32,height:3,background:T.accent+(isResizing?"cc":"55"),borderRadius:2,transition:"background 0.15s"}}/>
                </div>
              </div>
            );
          })}

          {/* Now line */}
          {now.getHours()>=START_H&&now.getHours()<END_H&&(
            <div style={{position:"absolute",top:nowPx,left:54,right:0,height:1.5,background:T.accent,zIndex:10,pointerEvents:"none"}}>
              <div style={{position:"absolute",left:-5,top:-3.5,width:9,height:9,borderRadius:"50%",background:T.accent}}/>
            </div>
          )}
      </div>

      {/* Backdrop — starts below sticky header so tabs remain tappable */}
      <div
        onClick={closeBlock}
        style={{
          position:"fixed",top:174,left:0,right:0,bottom:0,
          background:"rgba(0,0,0,0.28)",
          zIndex:290,
          opacity:sheetVisible?1:0,
          pointerEvents:sheetVisible?"auto":"none",
          transition:"opacity 0.32s ease",
        }}/>

      {/* Expanded block bottom sheet — starts below sticky header */}
      <div style={{
        position:"fixed",top:174,bottom:0,left:0,right:0,
        background:T.bg,
        borderRadius:"22px 22px 0 0",
        boxShadow:"0 -10px 48px rgba(0,0,0,0.18)",
        zIndex:300,
        display:"flex",flexDirection:"column",
        transform:sheetVisible?"translateY(0)":"translateY(100%)",
        transition:"transform 0.36s cubic-bezier(0.25,0.46,0.45,0.94)",
        overflow:"hidden",
      }}>
        {sheetBlock&&(<>
          {/* Drag pill */}
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px"}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.divider}}/>
          </div>
          {/* Sheet header */}
          <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",borderBottom:"1px solid "+T.divider}}>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.2}}>{sheetBlock.label}</div>
              <div style={{fontSize:12,color:T.sub,marginTop:4}}>
                {sheetBlock.isWorkBlock?`${workTasks.length} task${workTasks.length!==1?"s":""} · ${durStr(sheetBlock.dur)}`:durStr(sheetBlock.dur)}
                {!sheetBlock.isWorkBlock&&blockDurs[sheetBlock.id]!=null&&<span style={{color:T.accent,marginLeft:6}}>custom</span>}
              </div>
            </div>
            <button onClick={closeBlock} style={{background:"none",border:"none",fontSize:22,color:T.sub,cursor:"pointer",padding:"0 0 0 16px",lineHeight:1,marginTop:2}}>×</button>
          </div>
          {/* Card list */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px 32px",display:"flex",flexDirection:"column",gap:8,WebkitOverflowScrolling:"touch"}}>
            {sheetBlock.isRoutine&&(
              (stepOrders[sheetBlock.id]||[]).map(sid=>sheetBlock.steps.find(s=>s.id===sid)).filter(Boolean).map((s,i)=>
                renderCard(sheetBlock.id,s,i,false)
              )
            )}
            {sheetBlock.isWorkBlock&&(workTasks.length===0?(
              <div style={{textAlign:"center",fontSize:13,color:T.muted,fontStyle:"italic",padding:"32px 0"}}>No tasks yet — add from Agenda</div>
            ):workTasks.map((t,i)=>renderCard("workblock",t,i,true)))}
          </div>
        </>)}
      </div>
    </>
  );
}

function PlanContent({T, tasks, setTasks, captures, userId, onGetUnstuck}) {
  const [planView,setPlanView]=useState("today");
  const [workTasks,setWorkTasks]=useState([]);
  const [top10Candidates,setTop10Candidates]=useState([]);
  const top3Key="steady_top3_"+new Date().toLocaleDateString("en-CA");
  const planCacheKey="steady_plan_"+new Date().toLocaleDateString("en-CA");
  const [planObservation,setPlanObservation]=useState(null);
  const [planQuestion,setPlanQuestion]=useState(null);
  const [candidatesLoading,setCandidatesLoading]=useState(false);
  const [showAllTasks,setShowAllTasks]=useState(false);
  const [allTasksFilter,setAllTasksFilter]=useState("all");
  const [workBlockMins,_setWorkBlockMins]=useState(()=>{try{const v=localStorage.getItem("steady_cal_workblock");return v?Number(v):90;}catch{return 90;}});
  const setWorkBlockMins=(v)=>{_setWorkBlockMins(v);try{localStorage.setItem("steady_cal_workblock",String(v));}catch{}};
  const [routineDone,setRoutineDone]=useState({});
  const [selected,setSelected]=useState(null);
  const [sheetOpen,setSheetOpen]=useState(false);
  const contentScrollRef=useRef(null);

  // Staleness: task id is a ms timestamp and > 7 days old
  const isParked=(task)=>{
    if(task.done) return false;
    const isTs=typeof task.id==="number"&&task.id>1_000_000_000_000;
    if(!isTs) return false;
    return (Date.now()-task.id)>7*86_400_000;
  };

  // Load ratings from localStorage for emotional signal
  const localRatings=useMemo(()=>{
    const r={};
    try{ Object.keys(localStorage).filter(k=>k.startsWith("steady_entry_")).forEach(k=>{ const d=k.replace("steady_entry_",""); try{ const e=JSON.parse(localStorage.getItem(k)); if(e?.rating) r[d]=e.rating; }catch{} }); }catch{}
    return r;
  },[]);

  const now=new Date();
  const timeStr=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  const dateStr=now.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"});
  const MOTIVATOR_ICON={urgency:"◎",challenge:"◈",interest:"◇",novelty:"◉",meaning:"◆"};
  const FILTER_OPTS=[
    {id:"all",label:"All"},{id:"urgent",label:"Urgent"},
    {id:"area:work",label:"Work"},{id:"area:health",label:"Health"},
    {id:"area:relationships",label:"Relationships"},{id:"area:money",label:"Money"},
    {id:"area:home",label:"Home"},{id:"area:contribution",label:"Contribution"},
    {id:"area:meaning",label:"Meaning"},{id:"parked",label:"Parked"},
  ];

  const confirmedIds=new Set(workTasks.map(t=>t.id));

  const markDone=(id)=>{ setTasks(p=>p.map(t=>t.id===id?{...t,done:true}:t)); setWorkTasks(p=>p.filter(t=>t.id!==id)); setTop10Candidates(p=>p.filter(c=>c.task.id!==id)); };
  const deleteTask=(id)=>{ setTasks(p=>p.filter(t=>t.id!==id)); setWorkTasks(p=>p.filter(t=>t.id!==id)); setTop10Candidates(p=>p.filter(c=>c.task.id!==id)); };
  const openTask=(task)=>{ setSelected(task); setSheetOpen(true); };

  const confirmTask=(task)=>{
    setWorkTasks(prev=>{
      if(prev.find(t=>t.id===task.id)) return prev.filter(t=>t.id!==task.id);
      if(prev.length>=3) return prev;
      return [...prev,task];
    });
  };

  const buildEmotionalSignal=()=>{
    const last7=[]; const nowD=new Date();
    for(let i=0;i<7;i++){ const d=new Date(nowD-i*86400000).toLocaleDateString("en-CA"); last7.push(localRatings[d]||"?"); }
    const hardCount=last7.filter(x=>x==="Hard").length;
    return { last7Days:last7, hardStreak:hardCount>=3?"elevated":hardCount>=1?"some difficulty":"stable" };
  };

  const loadCandidates=()=>{
    const activeTasks=tasks.filter(t=>!t.done);
    if(!activeTasks.length) return;
    const emotional_signal=buildEmotionalSignal();
    const calendar_events=(captures||[]).filter(c=>c.type==="calendar-event").map(c=>({text:c.text||c.label||""})).filter(c=>c.text);
    setCandidatesLoading(true);
    fetch("/api/top3",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({tasks:activeTasks,captures:captures||[],userId,emotional_signal,calendar_events})
    }).then(r=>r.json()).then(data=>{
      const cands=(data.picks||[]).map(p=>{ const task=activeTasks[p.index]; return task?{task,framing:{motivator:p.motivator,whyToday:p.whyToday}}:null; }).filter(Boolean);
      setTop10Candidates(cands);
      if(data.observation) setPlanObservation(data.observation);
      if(data.reflective_question) setPlanQuestion(data.reflective_question);
      // Cache result for the day
      try{ localStorage.setItem(planCacheKey,JSON.stringify({candidates:cands,observation:data.observation,reflective_question:data.reflective_question})); }catch{}
    }).catch(()=>{}).finally(()=>setCandidatesLoading(false));
  };

  useEffect(()=>{
    // Restore from today's cache first — skip API if valid results exist
    try{
      const cached=JSON.parse(localStorage.getItem(planCacheKey)||"null");
      if(cached){
        const valid=(cached.candidates||[]).filter(c=>tasks.find(t=>String(t.id)===String(c.task.id)&&!t.done));
        if(valid.length){
          setTop10Candidates(valid);
          if(cached.observation) setPlanObservation(cached.observation);
          if(cached.reflective_question) setPlanQuestion(cached.reflective_question);
          return;
        }
      }
    }catch{}
    if(tasks.filter(t=>!t.done).length>0) loadCandidates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Load today's Top 3 from localStorage on mount
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(top3Key)||"[]");
      if(saved.length){
        const loaded=saved.map(id=>tasks.find(t=>String(t.id)===String(id)&&!t.done)).filter(Boolean);
        if(loaded.length) setWorkTasks(loaded);
      }
    }catch{}
  },[]);

  // Persist Top 3 task IDs whenever selection changes
  useEffect(()=>{
    try{ localStorage.setItem(top3Key,JSON.stringify(workTasks.map(t=>t.id))); }catch{}
  },[workTasks]);

  const allTasksFiltered=useMemo(()=>{
    let list=tasks.filter(t=>!t.done);
    if(allTasksFilter==="parked") return list.filter(isParked);
    if(allTasksFilter==="urgent") list=list.filter(t=>t.urgency==="now"||(t.dueDate&&new Date(t.dueDate)<=new Date(Date.now()+2*86400000)));
    else if(allTasksFilter.startsWith("area:")) list=list.filter(t=>t.area===allTasksFilter.replace("area:",""));
    else list=list.filter(t=>!isParked(t));
    return list;
  },[tasks,allTasksFilter]);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"visible"}}>
      {/* Header — always visible, never scrolls */}
      <div style={{flexShrink:0,padding:"16px 20px 0",background:T.bg,position:"relative",zIndex:351}}>
        <div style={{fontSize:13,color:T.sub,marginBottom:2}}>{dateStr}</div>
        <div style={{fontSize:42,fontWeight:300,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-2px",lineHeight:1}}>{timeStr}</div>
        <div style={{background:T.surface,borderRadius:2,height:2,overflow:"hidden",marginTop:10}}>
          <div style={{height:"100%",background:T.accent,borderRadius:2,width:workTasks.length===0?"0%":((workTasks.length/3)*100)+"%",transition:"width 0.4s"}}/>
        </div>
        <div style={{display:"flex",marginTop:14,marginLeft:-20,marginRight:-20,paddingLeft:20,paddingRight:20,borderBottom:"1px solid "+T.divider}}>
          {["Today","Calendar"].map(v=>{
            const key=v.toLowerCase();
            const active=planView===key;
            return <button key={v} onClick={()=>setPlanView(key)} style={{flex:1,textAlign:"center",padding:"8px 0 11px",border:"none",background:"transparent",borderBottom:"2px solid "+(active?T.accent:T.divider),color:active?T.text:T.sub,fontSize:13,fontWeight:active?600:400,cursor:"pointer",fontFamily:"inherit",marginBottom:-1,transition:"all 0.2s"}}>{v}</button>;
          })}
        </div>
      </div>

      <div ref={contentScrollRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:planView==="calendar"?"0":"14px 20px 40px"}}>
        {planView==="today"?(
          <>
            {/* Algorithm observation */}
            {planObservation&&<div style={{background:T.card,borderRadius:12,padding:"11px 14px",marginBottom:planQuestion?6:12,border:"1px solid "+T.border,borderLeft:"2px solid "+T.accent}}><div style={{fontSize:12,color:T.sub,fontStyle:"italic",lineHeight:1.55,fontFamily:"'Lora',serif"}}>{planObservation}</div></div>}
            {/* Reflective question */}
            {planQuestion&&<div style={{background:T.surface,borderRadius:12,padding:"10px 14px",marginBottom:14,border:"1px solid "+T.divider}}><div style={{fontSize:12,color:T.muted,lineHeight:1.55}}>{planQuestion}</div></div>}

            {/* Today's focus — 3 confirmation slots */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Today's focus</div>
              {[0,1,2].map(i=>{
                const confirmed=workTasks[i];
                return (
                  <div key={i} style={{marginBottom:6,minHeight:52,borderRadius:12,
                    border:"1.5px "+(confirmed?"solid "+T.border:"dashed "+T.divider),
                    background:confirmed?T.card:"transparent",
                    display:"flex",alignItems:"center",padding:"10px 14px",gap:10,transition:"all 0.2s"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",
                      background:confirmed?T.accent:T.surface,
                      border:"1.5px solid "+(confirmed?T.accent:T.border),
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                      <span style={{fontSize:11,fontWeight:700,color:confirmed?T.accentText:T.muted}}>{i+1}</span>
                    </div>
                    {confirmed?(
                      <>
                        <span style={{flex:1,fontSize:14,fontWeight:500,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{confirmed.label}</span>
                        <button onClick={()=>markDone(confirmed.id)} style={{width:22,height:22,borderRadius:"50%",border:"1.5px solid "+T.border,background:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button onClick={()=>confirmTask(confirmed)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1,flexShrink:0}}>×</button>
                      </>
                    ):(
                      <span style={{fontSize:13,color:T.muted,fontStyle:"italic"}}>Pick from below</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Top 10 candidates */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase"}}>
                  {candidatesLoading?"Finding your best moves…":"Suggested for today"}
                </div>
                {!candidatesLoading&&<button onClick={()=>{ setTop10Candidates([]); setPlanObservation(null); setPlanQuestion(null); loadCandidates(); }} style={{fontSize:11,color:T.muted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>Refresh</button>}
              </div>
              {candidatesLoading?(
                <div style={{display:"flex",gap:4,padding:"16px 0",justifyContent:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:`dots 1.2s ${i*0.2}s infinite`}}/>)}
                </div>
              ):top10Candidates.length===0?(
                <div style={{textAlign:"center",padding:"20px 0",color:T.muted,fontSize:13,fontStyle:"italic"}}>
                  {tasks.filter(t=>!t.done).length===0?"No tasks yet — brain dump to get started.":"Tap Refresh to get suggestions."}
                </div>
              ):(
                <div style={{background:T.card,borderRadius:14,overflow:"hidden",border:"1px solid "+T.border}}>
                  {top10Candidates.map(({task,framing},idx)=>{
                    const isConf=confirmedIds.has(task.id);
                    const slotsLeft=3-workTasks.length;
                    return (
                      <div key={task.id} style={{borderTop:idx>0?"1px solid "+T.divider:"none",background:isConf?T.accentSoft:"transparent",transition:"background 0.2s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:framing?.whyToday?"11px 14px 5px":"11px 14px",cursor:"pointer"}} onClick={()=>openTask(task)}>
                          <div style={{width:22,height:22,borderRadius:"50%",background:isConf?T.accent:T.surface,border:"1.5px solid "+(isConf?T.accent:T.border),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                            <span style={{fontSize:10,fontWeight:700,color:isConf?T.accentText:T.muted}}>{idx+1}</span>
                          </div>
                          <span style={{flex:1,fontSize:14,fontWeight:500,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.label}</span>
                          <span style={{fontSize:11,color:T.muted,flexShrink:0}}>{task.hours}{task.hours!=="0h"?" ":""}{task.mins}</span>
                          <button onClick={e=>{ e.stopPropagation(); confirmTask(task); }}
                            style={{width:28,height:28,borderRadius:"50%",
                              border:"1.5px solid "+(isConf?T.accent:slotsLeft>0?T.accent:T.border),
                              background:isConf?T.accent:slotsLeft>0?T.accentSoft:"transparent",
                              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                              cursor:slotsLeft>0||isConf?"pointer":"default",transition:"all 0.15s"}}>
                            {isConf
                              ?<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              :<svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke={slotsLeft>0?T.accent:T.muted} strokeWidth="2" strokeLinecap="round"/></svg>
                            }
                          </button>
                        </div>
                        {framing?.whyToday&&(
                          <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 14px 10px 46px"}}>
                            <span style={{fontSize:10,color:T.accent,opacity:0.7}}>{MOTIVATOR_ICON[framing.motivator]||"◇"}</span>
                            <span style={{fontSize:11,color:T.sub,fontStyle:"italic",lineHeight:1.4}}>{framing.whyToday}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All tasks — collapsible with filters */}
            <div>
              <button onClick={()=>setShowAllTasks(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:T.card,borderRadius:showAllTasks?"12px 12px 0 0":"12px",border:"1px solid "+T.border,borderBottom:showAllTasks?"1px solid "+T.divider:"1px solid "+T.border,cursor:"pointer",fontFamily:"inherit",transition:"border-radius 0.2s"}}>
                <div style={{fontSize:13,fontWeight:500,color:T.text}}>All tasks</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:T.muted}}>{tasks.filter(t=>!t.done).length} remaining</span>
                  {CHEVRON(T.sub,showAllTasks)}
                </div>
              </button>
              {showAllTasks&&(
                <div style={{background:T.card,borderRadius:"0 0 12px 12px",border:"1px solid "+T.border,borderTop:"none",overflow:"hidden"}}>
                  <div style={{display:"flex",gap:6,padding:"10px 14px",overflowX:"auto",scrollbarWidth:"none"}}>
                    {FILTER_OPTS.map(opt=>(
                      <button key={opt.id} onClick={()=>setAllTasksFilter(opt.id)} style={{flexShrink:0,padding:"5px 11px",borderRadius:20,border:"1px solid "+(allTasksFilter===opt.id?T.accent:T.border),background:allTasksFilter===opt.id?T.accentSoft:"transparent",color:allTasksFilter===opt.id?T.accent:T.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s"}}>{opt.label}</button>
                    ))}
                  </div>
                  {allTasksFiltered.length===0?(
                    <div style={{padding:"20px 14px",textAlign:"center",color:T.muted,fontSize:13,fontStyle:"italic"}}>
                      {allTasksFilter==="parked"?"No parked tasks.":"Nothing in this view."}
                    </div>
                  ):(
                    allTasksFiltered.map((task,i)=>(
                      <div key={task.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderTop:"1px solid "+T.divider,cursor:"pointer"}} onClick={()=>openTask(task)}>
                        <AreaIconSVG id={task.area} size={12} color={T.sub}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.label}</div>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:1}}>
                            {task.dueDate&&<span style={{fontSize:11,color:dueColor(task.dueDate,T),fontWeight:500}}>{formatDue(task.dueDate)}</span>}
                            {isParked(task)&&<span style={{fontSize:10,color:T.muted,background:T.surface,borderRadius:4,padding:"1px 5px"}}>parked</span>}
                          </div>
                        </div>
                        <button title={confirmedIds.has(task.id)?"Remove from focus":"Add to focus"} onClick={e=>{ e.stopPropagation(); confirmTask(task); }} style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid "+(confirmedIds.has(task.id)?T.accent:T.border),background:confirmedIds.has(task.id)?T.accent:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s"}}>
                          {confirmedIds.has(task.id)?<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>:<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke={T.accent} strokeWidth="2" strokeLinecap="round"/></svg>}
                        </button>
                        <button title="Delete" onClick={e=>{ e.stopPropagation(); deleteTask(task.id); }} style={{width:26,height:26,borderRadius:"50%",border:"none",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",padding:0,marginLeft:2}}>
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M13 4l-1 10H4L3 4" stroke={T.sub} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ):(
          <CalendarView T={T} workTasks={workTasks} setWorkTasks={setWorkTasks} routineDone={routineDone} setRoutineDone={setRoutineDone} onTaskClick={openTask} workBlockMins={workBlockMins} setWorkBlockMins={setWorkBlockMins} markDone={markDone} outerScrollRef={contentScrollRef}/>
        )}
      </div>
      <TaskSheet T={T} task={selected} open={sheetOpen} onClose={()=>setSheetOpen(false)} onSave={u=>setTasks(p=>p.map(t=>t.id===u.id?u:t))} onDelete={id=>{deleteTask(id);setSheetOpen(false);}} onGetUnstuck={onGetUnstuck}/>
    </div>
  );
}

// ── STUB / NAV / MIC ──────────────────────────────────────────────────────────
function StubContent({T, label}) {
  return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,padding:"40px 20px"}}>
      <div style={{fontSize:18,fontWeight:400,fontFamily:"'Lora',serif",color:T.text}}>{label}</div>
      <div style={{fontSize:13,color:T.muted}}>Coming soon.</div>
    </div>
  );
}

// ── ENTRY CARD ─────────────────────────────────────────────────────────────────
function EntryCard({T, dateLabel, entry, chatCount, onClick, ratingColor, isToday}) {
  return (
    <div onClick={onClick} style={{background:T.card,borderRadius:16,padding:"14px 18px",marginBottom:8,border:"1px solid "+T.border,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:14,fontWeight:isToday?600:400,color:T.text,fontFamily:"'Lora',serif"}}>{dateLabel}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {entry?.rating&&<span style={{fontSize:10,fontWeight:700,color:ratingColor(entry.rating)}}>{entry.rating}</span>}
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      {entry?.narrative
        ? <div style={{fontSize:12,color:T.muted,lineHeight:1.5,fontFamily:"'Lora',serif",fontStyle:"italic"}}>{entry.narrative.slice(0,90)+"…"}</div>
        : <div style={{fontSize:12,color:T.muted}}>{chatCount>0?chatCount+" messages · no entry yet":"No conversation yet"}</div>
      }
    </div>
  );
}

function NavDrawer({T, open, onClose, onOpen, chatDates, onViewDate, profile, signOut}) {
  const IC={
    chat:(c)=><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-5 5V5z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    plan:(c)=><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="15" rx="2" stroke={c} strokeWidth="1.5"/><path d="M7 1v4M13 1v4M2 8h16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M6 12h2M10 12h2M14 12h2M6 15h2M10 15h2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    lifemap:(c)=><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2C7.24 2 5 4.24 5 7c0 4.25 5 9 5 9s5-4.75 5-9c0-2.76-2.24-5-5-5z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><circle cx="10" cy="7" r="1.75" stroke={c} strokeWidth="1.3"/></svg>,
    journal:(c)=><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 3h12a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={c} strokeWidth="1.5"/><path d="M2 6h2M2 11h2M2 16h2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 7h7M7 10.5h7M7 14h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  };
  const NAV=[
    {id:"chat",    icon:IC.chat,    label:"Chat",      sub:"Today's conversation"},
    {id:"plan",    icon:IC.plan,    label:"Plan",      sub:"Today's agenda"},
    {id:"lifemap", icon:IC.lifemap, label:"Life Map",  sub:"Your baseline"},
    {id:"journal", icon:IC.journal, label:"Journal",   sub:"Your record"},
  ];
  const todayStr=new Date().toLocaleDateString("en-CA");
  const yesterStr=new Date(Date.now()-86400000).toLocaleDateString("en-CA");
  const dateLabel=(d)=>{
    if(d===todayStr) return "Today";
    if(d===yesterStr) return "Yesterday";
    return new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  };
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(6px)",transition:"opacity 0.28s",opacity:open?1:0,pointerEvents:open?"auto":"none"}}/>
      {/* Left sidebar */}
      <div style={{position:"fixed",top:0,left:0,bottom:0,width:272,zIndex:501,background:T.card,boxShadow:"6px 0 40px rgba(0,0,0,0.18)",transition:"transform 0.32s cubic-bezier(0.32,0.72,0,1)",transform:open?"translateX(0)":"translateX(-100%)",display:"flex",flexDirection:"column",overflowY:"auto"}}>
        {/* Logo */}
        <div style={{padding:"60px 22px 18px",borderBottom:"1px solid "+T.divider}}>
          <div style={{fontSize:22,fontWeight:700,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-0.3px"}}>steady<span style={{color:T.accent}}>.</span></div>
          <div style={{fontSize:12,color:T.sub,marginTop:3}}>Your ADHD support system</div>
        </div>
        {/* Nav items */}
        <div style={{padding:"10px 10px 0"}}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>{onClose();setTimeout(()=>onOpen(item.id),50);}}
              style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 14px",borderRadius:10,cursor:"pointer",background:"none",border:"none",textAlign:"left",WebkitTapHighlightColor:"transparent",marginBottom:2}}>
              <span style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.icon(T.sub)}</span>
              <div>
                <div style={{fontSize:15,color:T.text,fontWeight:500,lineHeight:1.2}}>{item.label}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:1}}>{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{flex:1}}/>
        <div style={{padding:"16px 14px 28px",borderTop:"1px solid "+T.divider}}>
          {profile&&(
            <div style={{fontSize:12,color:T.sub,marginBottom:12,padding:"0 6px"}}>
              Signed in as <span style={{fontWeight:600,color:T.text}}>{profile.name||profile.email||"you"}</span>
            </div>
          )}
          <button
            onClick={()=>{onClose();setTimeout(signOut,200);}}
            style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid "+T.border,background:"none",cursor:"pointer",textAlign:"left",WebkitTapHighlightColor:"transparent"}}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3" stroke={T.sub} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 14l3-4-3-4M16 10H8" stroke={T.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{fontSize:14,color:T.sub,fontWeight:500}}>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}

function MicButton({T, onPress}) {
  const [active,setActive]=useState(false);
  return (
    <button onClick={()=>{setActive(a=>!a);onPress();}} style={{width:44,height:44,borderRadius:"50%",border:"none",background:active?T.accent:"#1A1714",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 10px rgba(0,0,0,0.18)",transition:"background 0.15s",WebkitTapHighlightColor:"transparent"}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="13" rx="3" stroke={active?"#1A1714":"#E9B84A"} strokeWidth="1.4"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke={active?"#1A1714":"#E9B84A"} strokeWidth="1.4" strokeLinecap="round"/></svg>
    </button>
  );
}

// ── JOURNAL SCREEN ────────────────────────────────────────────────────────────
function Observation({T, completedTasks}) {
  const [text,setText]=useState("You are moving. Keep the thread.");
  useEffect(()=>{ getLifeMapObservation([],completedTasks).then(setText).catch(()=>{}); },[completedTasks.length]);
  return <div style={{fontSize:13,color:T.sub,fontStyle:"italic",lineHeight:1.6,fontFamily:"'Lora',serif"}}>{text}</div>;
}

function JournalScreen({T, captures, tasks, chatMessages, chatDates, initialDate, userId}) {
  const todayStr=new Date().toLocaleDateString("en-CA");
  const [selectedDate,setSelectedDate]=useState(initialDate||new Date().toLocaleDateString("en-CA"));
  const [sbChats,setSbChats]=useState({});

  // Fetch historical chat from Supabase when localStorage doesn't have it
  useEffect(()=>{
    if(!userId||userId==="dev"||selectedDate===todayStr) return;
    const local=(()=>{try{const s=localStorage.getItem("steady_chat_"+selectedDate);return s?JSON.parse(s):null;}catch{return null;}})();
    if(local||sbChats[selectedDate]) return;
    supabase.from("journal_entries").select("chat_messages")
      .eq("user_id",userId).eq("date",selectedDate).single()
      .then(({data})=>{
        if(data?.chat_messages?.length) setSbChats(p=>({...p,[selectedDate]:data.chat_messages}));
      });
  },[selectedDate,userId]);
  const [expandedMonths,setExpandedMonths]=useState({[todayStr.slice(0,7)]:true});
  const [narratives,setNarratives]=useState(()=>{
    const s={};
    try{ Object.keys(localStorage).filter(k=>k.startsWith("steady_entry_")).forEach(k=>{ try{ s[k.replace("steady_entry_","")]=JSON.parse(localStorage.getItem(k)); }catch{} }); }catch{}
    return s;
  });
  const [generating,setGenerating]=useState(null);
  const [ratings,setRatings]=useState({});
  const [detailTab,setDetailTab]=useState("chat");
  const [notes,setNotes]=useState(()=>{
    const s={};
    try{ Object.keys(localStorage).filter(k=>k.startsWith("steady_notes_")).forEach(k=>{ try{ s[k.replace("steady_notes_","")]=JSON.parse(localStorage.getItem(k)); }catch{} }); }catch{}
    return s;
  });
  const saveNote=(date,field,val)=>{
    setNotes(p=>{
      const updated={...p,[date]:{...(p[date]||{}),[field]:val}};
      try{ localStorage.setItem("steady_notes_"+date,JSON.stringify(updated[date])); }catch{}
      upsertJournalEntry(date,{notes:updated[date]});
      return updated;
    });
  };
  const ratingColor=r=>r==="Good"?T.green:r==="Hard"?T.red:T.accent;

  // Auto-generate narrative when Journal tab opens and entry doesn't exist yet
  useEffect(()=>{
    if(detailTab!=="journal"||!selectedDate) return;
    const msgs=getChatMsgs(selectedDate);
    if(msgs.length===0) return;
    if(narratives[selectedDate]?.narrative) return;
    if(generating===selectedDate) return;
    generateEntry(selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[detailTab,selectedDate]);

  const getChatMsgs=(date)=>{
    if(date===todayStr) return chatMessages||[];
    try{ const s=localStorage.getItem("steady_chat_"+date); if(s) return JSON.parse(s); }catch{}
    return sbChats[date]||[];
  };
  const saveNarrative=(date,text,ratingVal)=>{
    const entry={narrative:text,rating:ratingVal};
    try{ localStorage.setItem("steady_entry_"+date,JSON.stringify(entry)); }catch{}
    setNarratives(p=>({...p,[date]:entry}));
    upsertJournalEntry(date,{narrative:text,rating:ratingVal});
  };

  const upsertJournalEntry=async(date,overrides={})=>{
    if(!userId||userId==="dev") return;
    const AREA_IDS=["work","health","relationships","contribution","money","home","meaning"];
    const dayMsgs=date===todayStr?chatMessages||[]:
      (()=>{ try{ const s=localStorage.getItem("steady_chat_"+date); return s?JSON.parse(s):[]; }catch{ return []; }})();
    const dayCaptures=date===todayStr?(captures||[]):[];
    const dayDone=date===todayStr?(tasks||[]).filter(t=>t.done):[];
    const areaActivity=Object.fromEntries(AREA_IDS.map(id=>[id,dayDone.filter(t=>t.area===id).length]));
    const curNarrative=overrides.narrative??narratives[date]?.narrative??null;
    const curRating=overrides.rating??ratings[date]??narratives[date]?.rating??null;
    const curNotes=overrides.notes??notes[date]??{};
    const row={
      user_id:userId,
      date,
      chat_messages:dayMsgs.filter(m=>m.role==="user"||m.role==="ai"||m.role==="assistant")
        .map(m=>({role:m.role,text:m.text||m.content||"",ts:m.ts||null})),
      captures:dayCaptures.slice(0,20).map(c=>({text:c.text||c.label||""})),
      completed_tasks:dayDone.map(t=>({label:t.label,area:t.area})),
      life_area_activity:areaActivity,
      day_rating:curRating,
      ai_narrative:curNarrative,
      user_notes:curNotes,
      updated_at:new Date().toISOString(),
    };
    try{ await supabase.from("journal_entries").upsert(row,{onConflict:"user_id,date"}); }catch(e){ console.error("journal upsert:",e); }
  };
  const generateEntry=(date)=>{
    const msgs=getChatMsgs(date);
    const ratingVal=ratings[date]||narratives[date]?.rating;
    setGenerating(date);
    const chatCaptures=msgs.filter(m=>m.role==="user").map(m=>({text:m.text}));
    const completedTasksList=date===todayStr?(tasks||[]).filter(t=>t.done):[];
    fetch("/api/journal",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({captures:[...(date===todayStr?captures||[]:[]),...chatCaptures],completedTasks:completedTasksList,rating:ratingVal})
    }).then(r=>r.json())
      .then(d=>{ saveNarrative(date,d.narrative||"Today had its own shape. Something moved.",ratingVal); setGenerating(null); })
      .catch(()=>{ saveNarrative(date,"Today had its own shape. Something moved.",ratingVal); setGenerating(null); });
  };

  const allDates=[...new Set([todayStr,...(chatDates||[])])].sort().reverse();
  const byMonth={};
  allDates.forEach(d=>{ const mk=d.slice(0,7); if(!byMonth[mk])byMonth[mk]=[]; byMonth[mk].push(d); });
  const sortedMonths=Object.keys(byMonth).sort().reverse();
  const multiMonths=sortedMonths.length>1;

  const monthLabel=(mk)=>{ const [y,m]=mk.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"}); };
  const entryDateLabel=(d)=>{
    if(d===todayStr) return "Today";
    const yest=new Date(Date.now()-86400000).toLocaleDateString("en-CA");
    if(d===yest) return "Yesterday";
    return new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  };

  // ── LIST VIEW ──
  if(!selectedDate){
    return (
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 40px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontSize:22,fontWeight:400,fontFamily:"'Lora',serif",color:T.text}}>Journal</div>
          <div style={{fontSize:11,color:T.muted}}>{new Date().toLocaleDateString([],{weekday:"long",month:"short",day:"numeric"})}</div>
        </div>
        {!multiMonths ? (
          allDates.map(d=>(
            <EntryCard key={d} T={T} dateLabel={entryDateLabel(d)} entry={narratives[d]}
              chatCount={getChatMsgs(d).filter(m=>m.role==="user").length}
              isToday={d===todayStr} onClick={()=>setSelectedDate(d)} ratingColor={ratingColor}/>
          ))
        ) : (
          sortedMonths.map(mk=>{
            const isOpen=expandedMonths[mk]!==false;
            return (
              <div key={mk} style={{marginBottom:16}}>
                <div onClick={()=>setExpandedMonths(p=>({...p,[mk]:!isOpen}))}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 2px",cursor:"pointer",marginBottom:isOpen?8:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.text}}>{monthLabel(mk)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:T.muted}}>{byMonth[mk].length} days</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}><path d="M1 1l4 4 4-4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {isOpen&&(
                  <>
                    {byMonth[mk].map(d=>(
                      <EntryCard key={d} T={T} dateLabel={entryDateLabel(d)} entry={narratives[d]}
                        chatCount={getChatMsgs(d).filter(m=>m.role==="user").length}
                        isToday={d===todayStr} onClick={()=>setSelectedDate(d)} ratingColor={ratingColor}/>
                    ))}
                    <button style={{width:"100%",padding:"10px",borderRadius:10,border:"1px dashed "+T.border,background:"transparent",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
                      Generate {monthLabel(mk).split(" ")[0]} summary
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ── ENTRY DETAIL VIEW ──
  const msgs=getChatMsgs(selectedDate);
  const entry=narratives[selectedDate];
  const currentRating=ratings[selectedDate]||entry?.rating;
  const isToday=selectedDate===todayStr;
  const completedForDay=isToday?(tasks||[]).filter(t=>t.done):[];
  const AREA_IDS=["work","health","relationships","contribution","money","home","meaning"];
  const areaPct=id=>Math.min(100,completedForDay.filter(t=>t.area===id).length*33);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header with back + date + tabs */}
      <div style={{flexShrink:0,borderBottom:"1px solid "+T.divider}}>
        <div style={{display:"flex",alignItems:"center",gap:2,padding:"12px 20px 10px"}}>
          <button onClick={()=>{ setSelectedDate(null); setDetailTab("chat"); }} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px 4px 4px",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke={T.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:16,fontWeight:500,color:T.text,fontFamily:"'Lora',serif"}}>{entryDateLabel(selectedDate)}</span>
          </button>
          <div style={{flex:1}}/>
          {currentRating&&<span style={{fontSize:11,fontWeight:700,color:ratingColor(currentRating)}}>{currentRating}</span>}
        </div>
        <div style={{margin:"0 20px 12px",display:"flex",background:T.surface,borderRadius:12,padding:3,gap:2}}>
          {[{id:"chat",label:"Chat"},{id:"journal",label:"Journal"}].map(tab=>(
            <button key={tab.id} onClick={()=>setDetailTab(tab.id)}
              style={{flex:1,padding:"9px 8px",borderRadius:9,border:"none",background:detailTab===tab.id?T.accent:"transparent",color:detailTab===tab.id?T.accentText:T.muted,fontSize:14,fontWeight:detailTab===tab.id?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.18s"}}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {detailTab==="chat"&&(
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 40px"}}>
          {msgs.length===0?(
            <div style={{textAlign:"center",padding:"48px 0",color:T.muted,fontSize:14,fontStyle:"italic"}}>No conversation for this day yet.</div>
          ):(
            msgs.map((msg,i)=>{
              const isUser=msg.role==="user";
              if(msg.isDump){return(<div key={i} style={{marginBottom:14}}>
                {msg.acknowledgment&&<div style={{background:T.card,borderRadius:"14px 14px 14px 4px",padding:"12px 14px",marginBottom:8,fontSize:14,color:T.text,lineHeight:1.6,maxWidth:"88%",border:"1px solid "+T.border}}>{msg.acknowledgment}</div>}
                {(msg.formattedTasks||[]).map((t,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:T.surface,borderRadius:10,marginBottom:5,border:"1px solid "+T.border}}><div style={{width:14,height:14,borderRadius:"50%",border:"1.5px solid "+T.muted,flexShrink:0}}/><span style={{fontSize:13,color:T.text}}>{t.label}</span></div>)}
              </div>);}
              return(<div key={i} style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:8}}>
                <div style={{background:isUser?T.text:T.card,color:isUser?T.bg:T.text,borderRadius:isUser?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",maxWidth:"84%",fontSize:14,lineHeight:1.6,border:isUser?"none":"1px solid "+T.border}}>{msg.text}</div>
              </div>);
            })
          )}
        </div>
      )}

      {/* ── JOURNAL TAB ── */}
      {detailTab==="journal"&&(
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 40px"}}>
          {/* Today at a glance */}
          <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:12}}>Today at a glance</div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:12,color:T.sub}}>Tasks completed</div>
                <div style={{fontSize:12,fontWeight:700,color:T.text}}>{completedForDay.length} done</div>
              </div>
              <div style={{background:T.surface,borderRadius:3,height:5,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(completedForDay.length/Math.max(1,(tasks||[]).length))*100)+"%",background:T.accent,borderRadius:3}}/></div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:8,fontWeight:500}}>Life areas</div>
              {AREA_IDS.map(id=>{
                const label=AREAS.find(a=>a.id===id)?.label||id;
                return(<div key={id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                  <div style={{fontSize:11,color:T.sub,width:88,flexShrink:0}}>{label}</div>
                  <div style={{flex:1,background:T.surface,borderRadius:2,height:4,overflow:"hidden"}}><div style={{height:"100%",width:areaPct(id)+"%",background:areaPct(id)>0?T.accent:T.divider,borderRadius:2}}/></div>
                </div>);
              })}
            </div>
            <div style={{background:T.surface,borderRadius:10,padding:"10px 12px",borderLeft:"2px solid "+T.accent}}>
              <Observation T={T} completedTasks={completedForDay}/>
            </div>
          </div>

          {/* What got done */}
          {completedForDay.length>0&&(
            <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+T.border}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:10}}>What got done</div>
              {completedForDay.map((task,i)=>(
                <div key={task.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderTop:i>0?"1px solid "+T.divider:"none"}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="8" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div style={{flex:1}}><div style={{fontSize:13,color:T.text,fontWeight:500}}>{task.label}</div><div style={{fontSize:10,color:T.muted,textTransform:"capitalize"}}>{task.area}</div></div>
                </div>
              ))}
            </div>
          )}

          {/* Rating */}
          <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:10}}>How was today?</div>
            <div style={{display:"flex",gap:6,marginBottom:currentRating?10:0}}>
              {["Good","Okay","Hard"].map(opt=>(
                <button key={opt} onClick={()=>{ setRatings(p=>({...p,[selectedDate]:opt})); upsertJournalEntry(selectedDate,{rating:opt}); }}
                  style={{flex:1,padding:"10px 4px",borderRadius:12,border:"1px solid "+(currentRating===opt?ratingColor(opt):T.border),background:currentRating===opt?ratingColor(opt)+"18":"transparent",color:currentRating===opt?ratingColor(opt):T.sub,fontSize:13,fontWeight:currentRating===opt?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{opt}</button>
              ))}
            </div>
            {currentRating&&<div style={{fontSize:12,color:T.muted,textAlign:"center",fontStyle:"italic",fontFamily:"'Lora',serif"}}>{currentRating==="Good"?"Good days are worth noting.":currentRating==="Hard"?"Hard days pass. You showed up.":"Most days are okay. That is okay."}</div>}
          </div>

          {/* Entry narrative */}
          <div style={{background:T.card,borderRadius:16,padding:"16px",border:"1px solid "+T.border}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent}}>Entry</div>
              {entry?.narrative&&<button onClick={()=>generateEntry(selectedDate)} style={{fontSize:11,color:T.muted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>Refresh</button>}
            </div>
            {entry?.narrative ? (
              <div style={{fontSize:15,color:T.text,lineHeight:1.85,fontFamily:"'Lora',serif",fontStyle:"italic"}}>{entry.narrative}</div>
            ) : generating===selectedDate ? (
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
                <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:`dots 1.2s ${i*0.2}s infinite`}}/>)}</div>
                <div style={{fontSize:13,color:T.sub,fontStyle:"italic",fontFamily:"'Lora',serif"}}>Writing your entry…</div>
              </div>
            ) : (
              <div style={{fontSize:13,color:T.muted,fontStyle:"italic",fontFamily:"'Lora',serif"}}>
                {msgs.length===0?"No conversation yet today.":"Getting your entry ready…"}
              </div>
            )}
          </div>
          {/* In your own words */}
          <div style={{background:T.card,borderRadius:16,padding:"16px",marginTop:12,border:"1px solid "+T.border}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:14}}>In your own words</div>
            {[
              {key:"happened",   label:"What happened today?",         ph:"Just the highlights…"},
              {key:"challenging",label:"What was challenging?",        ph:"Be honest with yourself…"},
              {key:"intention",  label:"One intention for tomorrow",   ph:"Something small, concrete…"},
              {key:"grateful",   label:"One thing I'm grateful for today", ph:"It doesn't have to be big…"},
            ].map((field,i,arr)=>(
              <div key={field.key} style={{paddingBottom:i<arr.length-1?14:0,marginBottom:i<arr.length-1?14:0,borderBottom:i<arr.length-1?"1px solid "+T.divider:"none"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:6}}>{field.label}</div>
                <textarea
                  rows={2}
                  placeholder={field.ph}
                  value={(notes[selectedDate]||{})[field.key]||""}
                  onChange={e=>saveNote(selectedDate,field.key,e.target.value)}
                  style={{width:"100%",border:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,outline:"none",resize:"none",WebkitAppearance:"none"}}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── VOICE VISUAL ─────────────────────────────────────────────────────────────
function VoiceVisual({T, text}) {
  const words=(text||"").trim().split(/\s+/).filter(Boolean);
  const recent=words.slice(-10);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",overflow:"hidden"}}>
      <div style={{fontSize:11,color:T.accent,letterSpacing:"2px",textTransform:"uppercase",marginBottom:20,opacity:0.8}}>I have you. Keep going.</div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,maxWidth:280,marginBottom:28,minHeight:80}}>
        {recent.length===0
          ?<div style={{fontSize:16,color:T.muted,fontStyle:"italic",fontFamily:"'Lora',serif",alignSelf:"center"}}>Listening…</div>
          :recent.map((word,i)=>{
            const fromEnd=recent.length-1-i;
            const opacity=Math.max(0.12,1-fromEnd*0.1);
            return <span key={i} style={{fontSize:17,fontFamily:"'Lora',serif",color:T.text,opacity,transition:"opacity 0.3s",lineHeight:1.7}}>{word}</span>;
          })
        }
      </div>
      <div style={{display:"flex",gap:5}}>
        {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.accent,animation:`dots 1.2s ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function OnboardingScreen({T, onComplete}) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  if(step===0) return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",padding:"60px 36px 40px",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:30,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-0.5px",marginBottom:8}}>steady<span style={{color:T.accent}}>.</span></div>
        <div style={{fontSize:13,color:T.muted,letterSpacing:"0.2px"}}>the calming home for an ADHD brain</div>
      </div>
      <div style={{width:"100%",maxWidth:320,marginBottom:48}}>
        <div style={{fontSize:16,color:T.sub,fontFamily:"'Lora',serif",marginBottom:20,textAlign:"center",lineHeight:1.6}}>What would you like to be called?</div>
        <input
          value={name} onChange={e=>setName(e.target.value)}
          placeholder="First name (optional)"
          autoFocus
          style={{width:"100%",padding:"14px 16px",borderRadius:14,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:16,fontFamily:"'DM Sans',sans-serif",outline:"none",textAlign:"center",WebkitAppearance:"none"}}
        />
      </div>
      <button onClick={()=>setStep(1)} style={{padding:"14px 40px",borderRadius:24,border:"none",background:T.accent,color:T.accentText,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
        {name.trim()?`Let's go, ${name.trim().split(" ")[0]}.`:"Let's go →"}
      </button>
      <div style={{marginTop:16,fontSize:12,color:T.muted,fontStyle:"italic",textAlign:"center"}}>No account needed. Your data stays on your device.</div>
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",padding:"60px 36px 40px",overflowY:"auto"}}>
      <div style={{maxWidth:340,margin:"0 auto",width:"100%"}}>
        <div style={{fontSize:22,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-0.3px",marginBottom:6,textAlign:"center"}}>steady is built for<br/>how your brain works.</div>
        <div style={{fontSize:13,color:T.muted,textAlign:"center",marginBottom:36}}>Three things. All connected.</div>
        {[
          {icon:"○", title:"Brain dump", desc:"Get it out of your head. Tasks, worries, ideas — anything. steady sorts it automatically."},
          {icon:"◈", title:"Today", desc:"An algorithm finds your best moves for the day. You confirm the ones that feel right. Nothing auto-fills."},
          {icon:"◇", title:"Journal", desc:"Your day's conversation becomes a story. Patterns surface over time."},
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:14,marginBottom:12,padding:"14px 16px",background:T.card,borderRadius:14,border:"1px solid "+T.border}}>
            <div style={{fontSize:18,color:T.accent,flexShrink:0,marginTop:2}}>{item.icon}</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>{item.title}</div>
              <div style={{fontSize:13,color:T.sub,lineHeight:1.55}}>{item.desc}</div>
            </div>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"center",marginTop:28}}>
          <button onClick={onComplete} style={{padding:"14px 40px",borderRadius:24,border:"none",background:T.accent,color:T.accentText,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Start steady. →
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:T.muted,fontStyle:"italic"}}>You can explore everything at your own pace.</div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { session, profile, loading, devBypass, setDevBypass, updateProfile, signOut } = useAuth();
  const [dark,setDark]=useState(false);
  const [navOpen,setNavOpen]=useState(false);
  const [activeSheet,setActiveSheet]=useState(null);
  const [chatPrompt,setChatPrompt]=useState(null);
  const [chatInitialText,setChatInitialText]=useState("");
  const [chatBarInput,setChatBarInput]=useState("");
  const [captures,setCaptures]=useState(()=>{ try{ const s=localStorage.getItem("steady_captures"); return s?JSON.parse(s):[]; }catch{return[];} });
  const [tasks,setTasks]=useState(()=>{ try{ const s=localStorage.getItem("steady_tasks"); return s?JSON.parse(s):MOCK_TASKS; }catch{return MOCK_TASKS;} });

  // ── Chat history ──
  const todayKey=()=>new Date().toLocaleDateString("en-CA");
  const chatStorageKey=(d)=>"steady_chat_"+d;
  const [chatDates,setChatDates]=useState(()=>{ try{ return Object.keys(localStorage).filter(k=>k.startsWith("steady_chat_")).map(k=>k.replace("steady_chat_","")).sort().reverse(); }catch{return[];} });
  const [todayChatMessages,setTodayChatMessages]=useState(()=>{ try{ const s=localStorage.getItem(chatStorageKey(new Date().toLocaleDateString("en-CA"))); return s?JSON.parse(s):null; }catch{return null;} });
  const [journalInitialDate,setJournalInitialDate]=useState(null);

  const chatSyncTimerRef=useRef(null);
  const saveChatMessages=(msgs)=>{
    try{ const d=todayKey(); localStorage.setItem(chatStorageKey(d),JSON.stringify(msgs)); setTodayChatMessages(msgs); setChatDates(prev=>prev.includes(d)?prev:[d,...prev]); }catch{}
    // Debounced sync to Supabase (journal_entries.chat_messages)
    clearTimeout(chatSyncTimerRef.current);
    chatSyncTimerRef.current=setTimeout(()=>{
      const uid=session?.user?.id;
      if(!uid||uid==="dev") return;
      const d=todayKey();
      const rows=msgs.filter(m=>m.role==="user"||m.role==="ai"||m.role==="assistant")
        .map(m=>({role:m.role,text:m.text||m.content||"",ts:m.ts||null}));
      supabase.from("journal_entries").upsert(
        {user_id:uid,date:d,chat_messages:rows,updated_at:new Date().toISOString()},
        {onConflict:"user_id,date"}
      ).then(({error})=>{ if(error) console.error("chat sync:",error.message); });
    },2000);
  };
  const openHistoryDate=(date)=>{ setJournalInitialDate(date||null); setNavOpen(false); setActiveSheet("journal"); };
  const handleChatAction=(action)=>{ if(action?.type==="navigate") setActiveSheet(action.screen); };

  const chatBarRef=useRef(null);
  const chatBarInputRef=useRef(null);
  const chatContentRef=useRef(null);
  const recognitionRef=useRef(null);
  const [isListening,setIsListening]=useState(false);
  const [onboarded,setOnboarded]=useState(()=>{ try{return !!localStorage.getItem("steady_onboarded");}catch{return true;} });
  const [nameInput,setNameInput]=useState("");
  const [nameSaving,setNameSaving]=useState(false);
  const T=dark?DARK:LIGHT;

  const greeting=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";};
  const showNamePrompt=!devBypass&&session&&profile&&!profile.name;

  const saveName=async()=>{
    const n=nameInput.trim();
    if(!n)return;
    setNameSaving(true);
    await updateProfile({name:n});
    setNameSaving(false);
  };

  useEffect(()=>{ try{ localStorage.setItem("steady_tasks",JSON.stringify(tasks)); }catch{} },[tasks]);
  useEffect(()=>{ try{ localStorage.setItem("steady_captures",JSON.stringify(captures)); }catch{} },[captures]);

  // ── Supabase task sync ────────────────────────────────────────────────────
  const syncTimerRef = useRef(null);
  const syncTasksToSupabase = useCallback((taskList, uid) => {
    if(!uid || uid==="dev") return;
    const rows = taskList.map(t=>({
      user_id: uid,
      client_id: String(t.id),
      label: t.label||"",
      area: t.area||"work",
      urgency: t.urgency||"soon",
      due_date: t.dueDate||null,
      hours: t.hours||"0h",
      mins: t.mins||"30m",
      description: t.desc||"",
      steps: t.steps||[],
      subtasks: t.subtasks||[],
      notes: t.notes||"",
      done: t.done||false,
      updated_at: new Date().toISOString(),
    }));
    if(!rows.length) return;
    supabase.from("tasks").upsert(rows,{onConflict:"user_id,client_id"})
      .then(({error})=>{ if(error) console.error("tasks sync:",error.message); });
  },[]);

  // Load tasks from Supabase on first login (merge with or replace localStorage)
  useEffect(()=>{
    if(!session?.user?.id || devBypass) return;
    const uid = session.user.id;
    supabase.from("tasks").select("*").eq("user_id",uid)
      .then(({data,error})=>{
        if(error) return;
        if(!data || data.length===0) {
          // First device — push any existing localStorage tasks up
          const local=(()=>{ try{ const s=localStorage.getItem("steady_tasks"); return s?JSON.parse(s):[]; }catch{return[];} })();
          if(local.length>0) syncTasksToSupabase(local, uid);
          return;
        }
        const dbTasks = data
          .filter(r=>r.client_id)
          .map(r=>({
            id: parseInt(r.client_id)||r.client_id,
            label: r.label||"",
            area: r.area||"work",
            urgency: r.urgency||"soon",
            dueDate: r.due_date||"",
            hours: r.hours||"0h",
            mins: r.mins||"30m",
            desc: r.description||"",
            steps: r.steps||[],
            subtasks: r.subtasks||[],
            notes: r.notes||"",
            done: r.done||false,
          }));
        if(dbTasks.length>0) setTasks(dbTasks);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[session?.user?.id]);

  // Debounced push: sync to Supabase 1.5s after any task change
  useEffect(()=>{
    if(!session?.user?.id || devBypass) return;
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(()=>syncTasksToSupabase(tasks, session.user.id), 1500);
    return ()=>clearTimeout(syncTimerRef.current);
  },[tasks, session?.user?.id]);

  // ── Supabase captures sync ─────────────────────────────────────────────────
  const capturesSyncTimerRef=useRef(null);
  const syncCapturesToSupabase=useCallback((captureList,uid)=>{
    if(!uid||uid==="dev"||!captureList.length) return;
    const rows=captureList.map(c=>({
      user_id:uid,
      client_id:String(c.ts||c.id||Date.now()),
      text:c.text||"",
      type:c.type||"idea",
      updated_at:new Date().toISOString(),
    }));
    supabase.from("captures").upsert(rows,{onConflict:"user_id,client_id"})
      .then(({error})=>{ if(error) console.error("captures sync:",error.message); });
  },[]);

  // Load captures from Supabase on login
  useEffect(()=>{
    if(!session?.user?.id||devBypass) return;
    const uid=session.user.id;
    supabase.from("captures").select("*").eq("user_id",uid)
      .order("updated_at",{ascending:false}).limit(300)
      .then(({data,error})=>{
        if(error) return;
        if(!data||data.length===0){
          const local=(()=>{try{const s=localStorage.getItem("steady_captures");return s?JSON.parse(s):[]; }catch{return[];}})();
          if(local.length>0) syncCapturesToSupabase(local,uid);
          return;
        }
        const dbCaptures=data.filter(r=>r.client_id).map(r=>({
          ts:parseInt(r.client_id)||r.client_id,
          id:parseInt(r.client_id)||r.client_id,
          text:r.text||"",
          type:r.type||"idea",
        }));
        if(dbCaptures.length>0) setCaptures(dbCaptures);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[session?.user?.id]);

  // Debounced captures sync
  useEffect(()=>{
    if(!session?.user?.id||devBypass) return;
    clearTimeout(capturesSyncTimerRef.current);
    capturesSyncTimerRef.current=setTimeout(()=>syncCapturesToSupabase(captures,session.user.id),1500);
    return ()=>clearTimeout(capturesSyncTimerRef.current);
  },[captures,session?.user?.id]);

  // Load chat dates from Supabase on login (merge with localStorage)
  useEffect(()=>{
    if(!session?.user?.id||devBypass) return;
    supabase.from("journal_entries").select("date")
      .eq("user_id",session.user.id)
      .not("chat_messages","eq","[]")
      .order("date",{ascending:false}).limit(90)
      .then(({data})=>{
        if(!data||!data.length) return;
        const dbDates=data.map(r=>r.date).filter(Boolean);
        setChatDates(prev=>{
          const merged=[...new Set([...prev,...dbDates])].sort().reverse();
          return merged;
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[session?.user?.id]);

  const toggleVoice=()=>{
    if(isListening){
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ openSheet("chat",null,""); return; }
    const r=new SR();
    r.continuous=true;
    r.interimResults=true;
    r.lang="en-US";
    r.onstart=()=>setIsListening(true);
    r.onresult=e=>{
      let t="";
      for(let i=0;i<e.results.length;i++) t+=e.results[i][0].transcript;
      setChatBarInput(t);
      if(chatBarInputRef.current){
        chatBarInputRef.current.style.height="auto";
        chatBarInputRef.current.style.height=Math.min(chatBarInputRef.current.scrollHeight,140)+"px";
      }
    };
    r.onerror=()=>setIsListening(false);
    r.onend=()=>setIsListening(false);
    recognitionRef.current=r;
    r.start();
  };

  if (loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#F7F4EF",fontFamily:"'DM Sans',sans-serif",color:"#8A8680",fontSize:14}}>
      steady<span style={{color:"#E9B84A"}}>.</span>
    </div>
  );
  if (!session && !devBypass) return <AuthScreen dark={dark} onSkip={() => setDevBypass(true)} />;
  if (!onboarded) return <OnboardingScreen T={T} onComplete={()=>{ localStorage.setItem("steady_onboarded","1"); localStorage.setItem("steady_name",JSON.stringify("")); setOnboarded(true); setTasks([]); setCaptures([]); }}/>;


  const openSheet=(id,prompt=null,text="")=>{
    setChatInitialText(text);
    setActiveSheet(id);
    if(prompt) setChatPrompt(prompt);
  };
  const closeSheet=()=>{ setActiveSheet(null);setChatPrompt(null);setChatInitialText(""); };

  const submitChatBar=()=>{
    // Also read DOM value directly — iOS native dictation bypasses React onChange
    const domVal=chatBarInputRef.current?.value||"";
    const text=(chatBarInput||domVal).trim();
    if(!text) { openSheet("chat",null,""); return; }
    // Stop mic if running
    if(isListening){ recognitionRef.current?.stop(); setIsListening(false); }
    // Clear both React state and DOM value (iOS dictation only updates DOM)
    setChatBarInput("");
    if(chatBarInputRef.current){ chatBarInputRef.current.value=""; chatBarInputRef.current.style.height="auto"; }
    if(activeSheet==="chat" && chatContentRef.current) {
      chatContentRef.current.sendMessage(text);
    } else {
      openSheet("chat",null,text);
    }
  };

  const CHIPS=[
    {label:"Today",    action:()=>openSheet("plan")},
    {label:"Life Map", action:()=>openSheet("lifemap")},
    {label:"Journal",  action:()=>openSheet("journal")},
    {label:"Stuck?",   action:()=>openSheet("chat",null,"I'm feeling stuck and don't know what to do next. Help me figure out my best next move.")},
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}input,textarea,select{outline:none;-webkit-appearance:none;}button{-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{display:none;}@keyframes dots{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}@keyframes pulse-ring{from{transform:scale(0.9);opacity:0.8}to{transform:scale(1.4);opacity:0}}`}</style>
      <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100%",background:T.bg,fontFamily:"'DM Sans',-apple-system,sans-serif",overflow:"hidden",transition:"background 0.3s"}}>
        {/* ── TOP BAR ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"44px 20px 0",flexShrink:0}}>
          <button onClick={()=>setNavOpen(true)} style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",padding:4}}>
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none"><path d="M0 1h18M0 6.5h18M0 12h12" stroke={T.sub} strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
          <div style={{fontSize:18,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-0.3px"}}>steady<span style={{color:T.accent}}>.</span></div>
          <button onClick={()=>setDark(d=>!d)} style={{width:34,height:34,borderRadius:"50%",border:"1px solid "+T.border,background:T.card,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",color:T.sub}}>{dark?"☀":"☾"}</button>
        </div>

        {/* ── HOME CONTENT ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 36px 100px",overflow:"hidden",transition:"all 0.3s"}}>
          {isListening?(
            <VoiceVisual T={T} text={chatBarInput}/>
          ):showNamePrompt?(
            /* ── Name prompt ── */
            <div style={{textAlign:"center",maxWidth:300,width:"100%"}}>
              <div style={{fontSize:32,marginBottom:16}}>👋</div>
              <div style={{fontSize:22,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",marginBottom:8}}>What should I call you?</div>
              <div style={{fontSize:14,color:T.sub,marginBottom:28,lineHeight:1.5}}>Just your first name is perfect.</div>
              <input
                autoFocus
                type="text"
                placeholder="Your name…"
                value={nameInput}
                onChange={e=>setNameInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveName();}}
                style={{width:"100%",padding:"14px 16px",borderRadius:14,border:"1.5px solid "+T.border,background:T.card,color:T.text,fontSize:16,fontFamily:"'DM Sans',sans-serif",outline:"none",textAlign:"center",marginBottom:12,boxSizing:"border-box"}}
              />
              <button
                onClick={saveName}
                disabled={!nameInput.trim()||nameSaving}
                style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:T.accent,color:T.accentText,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:(!nameInput.trim()||nameSaving)?0.5:1,transition:"opacity 0.15s"}}>
                {nameSaving?"Saving…":"Let's go →"}
              </button>
            </div>
          ):(
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontSize:13,color:T.muted,marginBottom:20,letterSpacing:"0.2px"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
              {profile?.name&&<div style={{fontSize:15,color:T.sub,marginBottom:8,fontWeight:500}}>{greeting()}, {profile.name}.</div>}
              <div style={{fontSize:38,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-1px",lineHeight:1.15,marginBottom:14}}>What's on<br/>your mind?</div>
              <div style={{fontSize:14,color:T.muted,fontStyle:"italic"}}>Just get it out. I'll handle the rest.</div>
            </div>
          )}
        </div>

        {/* ── PERSISTENT CHAT BAR — always visible, above all sheets ── */}
        <div ref={chatBarRef} style={{position:"fixed",bottom:0,left:0,right:0,zIndex:300,borderTop:"1px solid "+T.divider,padding:"10px 20px 28px",background:T.bg,transition:"background 0.4s"}}>
          <div style={{background:T.card,borderRadius:24,padding:"10px 12px 10px 18px",border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:8}}>
            <textarea
              ref={chatBarInputRef}
              value={chatBarInput}
              onChange={e=>{ setChatBarInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,140)+"px"; }}
              onInput={e=>{ setChatBarInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,140)+"px"; }}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); submitChatBar(); } }}
              placeholder="What's on your mind..."
              rows={1}
              style={{flex:1,border:"none",background:"transparent",color:T.text,fontSize:15,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,resize:"none",outline:"none",maxHeight:140,overflowY:"auto",scrollbarWidth:"none"}}
            />
            {chatBarInput.trim()
              ? <button onClick={submitChatBar} style={{width:30,height:30,borderRadius:"50%",border:"none",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}><SendIcon c={T.bg}/></button>
              : <button onClick={toggleVoice} style={{width:30,height:30,borderRadius:"50%",border:"none",background:isListening?"rgba(217,79,79,0.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                  {isListening && <span style={{position:"absolute",inset:-3,borderRadius:"50%",border:"2px solid "+T.red,animation:"pulse-ring 1.2s ease-out infinite",pointerEvents:"none"}}/>}
                  <svg width="15" height="18" viewBox="0 0 15 20" fill="none">
                    <rect x="4" y="1" width="7" height="11" rx="3.5" stroke={isListening?T.red:T.muted} strokeWidth="1.4"/>
                    <path d="M1 10c0 3.866 2.91 7 6.5 7s6.5-3.134 6.5-7" stroke={isListening?T.red:T.muted} strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="7.5" y1="17" x2="7.5" y2="19" stroke={isListening?T.red:T.muted} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
            }
          </div>
        </div>

        {/* ── SHEETS ── */}
        <Sheet T={T} open={activeSheet==="chat"} onClose={closeSheet} chatBarRef={chatBarRef} title="Chat">
          {activeSheet==="chat"&&<ChatContent
            ref={chatContentRef}
            T={T}
            userId={session?.user?.id}
            initialText={chatInitialText}
            tasks={tasks}
            captures={captures}
            savedMessages={todayChatMessages}
            onMessagesChange={saveChatMessages}
            onAction={handleChatAction}
            onCapture={cap=>setCaptures(p=>[...p,{...cap,ts:cap.ts||Date.now()}])}
            onAddTasks={formattedTasks=>{
              setTasks(p=>[...p,...formattedTasks]);
            }}
            onRemoveTask={id=>setTasks(p=>p.filter(t=>t.id!==id))}
            onUpdateTasks={updatedTasks=>{
              setTasks(prev=>{
                const existingMap=new Map(prev.map(t=>[String(t.id),t]));
                const now=Date.now();
                return updatedTasks.map((t,i)=>{
                  const existing=t.id?existingMap.get(String(t.id)):null;
                  if(existing) return {...existing,...t,id:existing.id};
                  return {id:now+i,label:t.label||"",area:t.area||"work",hours:t.hours||"0h",mins:t.mins||"30m",dueDate:t.dueDate||"",desc:t.desc||"",subtasks:t.subtasks||[],done:t.done||false,notes:t.notes||"",urgency:t.urgency||"soon"};
                });
              });
            }}
          />}
        </Sheet>
        <Sheet T={T} open={activeSheet==="plan"} onClose={closeSheet} chatBarRef={chatBarRef} title="Plan" overflow="visible">
          {activeSheet==="plan"&&<PlanContent T={T} tasks={tasks} setTasks={setTasks} captures={captures} userId={session?.user?.id} onGetUnstuck={(task)=>{ closeSheet(); setTimeout(()=>openSheet("chat",null,`I'm feeling stuck on "${task?.label||"a task"}". Help me break this down and figure out my next step.`),320); }}/>}
        </Sheet>
        <Sheet T={T} open={activeSheet==="lifemap"} onClose={closeSheet} chatBarRef={chatBarRef} title="Life Map">
          {activeSheet==="lifemap"&&<LifeMapContent T={T} userId={session?.user?.id}/>}
        </Sheet>
        <Sheet T={T} open={activeSheet==="journal"} onClose={closeSheet} chatBarRef={chatBarRef} title="Journal">
          {activeSheet==="journal"&&<JournalScreen T={T} captures={captures} tasks={tasks} chatMessages={todayChatMessages||[]} chatDates={chatDates} initialDate={journalInitialDate} userId={session?.user?.id}/>}
        </Sheet>

        <NavDrawer T={T} open={navOpen} onClose={()=>setNavOpen(false)} onOpen={openSheet} chatDates={chatDates} onViewDate={openHistoryDate} profile={profile} signOut={signOut}/>
      </div>
    </>
  );
}
