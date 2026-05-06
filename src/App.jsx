import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useAuth } from "./lib/AuthContext";
import AuthScreen from "./screens/AuthScreen";

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
  {id:"close",        label:"Close relationships",   research:"People with 1-2 deep relationships are as happy as those with many.",           example:"I feel genuinely known by at least one person in my life.",      checkin:"Do the people closest to you actually know what's going on for you?"},
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
function Sheet({T, open, onClose, chatBarRef, children, title}) {
  const sheetRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [sheetHeight, setSheetHeight] = useState("85vh");
  const [sheetBottom, setSheetBottom] = useState(0);
  const dragStartY = useRef(null);

  useEffect(() => {
    if(chatBarRef?.current) {
      const rect = chatBarRef.current.getBoundingClientRect();
      setSheetHeight(`${rect.top}px`);
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
      <div onClick={handleClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.22)",backdropFilter:"blur(3px)",transition:"opacity 0.3s",opacity:visible?1:0}}/>
      <div ref={sheetRef} style={{position:"fixed",left:0,right:0,bottom:sheetBottom,height:sheetHeight,zIndex:201,background:T.frost,backdropFilter:"blur(36px) saturate(1.4)",WebkitBackdropFilter:"blur(36px) saturate(1.4)",borderRadius:"20px 20px 0 0",display:"flex",flexDirection:"column",transition:"transform 0.32s cubic-bezier(0.32,0.72,0,1)",transform:visible?"translateY(0)":"translateY(100%)",boxShadow:"0 -4px 40px rgba(0,0,0,0.14)",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        {/* Handle row */}
        <div onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd} style={{flexShrink:0,height:48,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",touchAction:"none",borderBottom:`1px solid ${T.divider}`}}>
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
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
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

// ── BRAIN DUMP EXTRACTION ────────────────────────────────────────────────────
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




// ── MORNING TOP 3 SUGGESTION ──────────────────────────────────────────────────
async function suggestTop3(tasks, lifemapAreas, dayRating) {
  const available = tasks.filter(t => !t.done).slice(0, 20);
  if (available.length === 0) return [];
  try {
    const res = await fetch("/api/top3", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ tasks: available, lifeAreas: lifemapAreas, yesterdayRating: dayRating })
    });
    const data = await res.json();
    return (data.indices || [0,1,2]).map(i => available[i]).filter(Boolean);
  } catch(e) {
    return available.slice(0, 3);
  }
}

// ── LIFE MAP GAP OBSERVATION ──────────────────────────────────────────────────
async function getLifeMapObservation(lifemapAreas, completedTasks) {
  return "You are moving. Keep the thread.";
}


const CAPTURE_ICONS = {
  "calendar-event": "📅",
  "worry": "💭",
  "idea": "💡",
  "observation": "👁",
};
const URGENCY_COLOR = (u, T) => u==="now" ? T.red : u==="soon" ? T.accent : T.muted;

const ChatContent = forwardRef(function ChatContent({T, initialText, onCapture}, ref) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendToAPI = async (msgs) => {
    setLoading(true);
    try {
      const reply = await callClaude(msgs);
      setMessages(p=>[...p,{role:"ai",text:reply}]);
    } catch(e) {
      setMessages(p=>[...p,{role:"ai",text:"Got it. I've captured that."}]);
    }
    setLoading(false);
  };

  const runExtract = (text, prevMsgs) => {
    setLoading(true);
    extractFromDump(text).then(result => {
      const tasks = result.tasks || [];
      const captures = result.captures || [];
      if(tasks.length > 0 || captures.length > 0) {
        setMessages(p=>[...p,{
          role:"ai",
          isDump: true,
          acknowledgment: result.acknowledgment || "Got it.",
          tasks,
          captures,
        }]);
        setLoading(false);
        if(onCapture) captures.forEach(c => onCapture(c));
      } else {
        sendToAPI(prevMsgs);
      }
    }).catch(() => sendToAPI(prevMsgs));
  };

  const sendMessage = (text) => {
    if(!text.trim() || loading) return;
    const userMsg = {role:"user", text: text.trim(), id: Date.now()};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    runExtract(text.trim(), newMsgs);
  };

  useImperativeHandle(ref, () => ({ sendMessage }));

  useEffect(() => {
    if(initialText && initialText.trim()) {
      sendMessage(initialText);
    } else {
      setMessages([{role:"ai", text:"What's on your mind? Just dump it all — tasks, worries, ideas, anything."}]);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);

  return (
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"24px 24px 16px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{display:"flex",flexDirection:"column"}}>
        {messages.map((msg,i)=>{
          const total = messages.length;
          const fromEnd = total - 1 - i;
          const opacity = fromEnd===0 ? 1 : fromEnd===1 ? 0.65 : Math.max(0.15, 0.65 - fromEnd*0.15);
          const blur = fromEnd <= 1 ? 0 : Math.min(3, fromEnd*0.8);
          return (
            <div key={i} style={{marginBottom:20, transition:"opacity 0.4s,filter 0.4s", opacity, filter:blur?`blur(${blur}px)`:"none"}}>
              {msg.role==="user" ? (
                <div style={{fontSize:17,fontWeight:400,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.6,whiteSpace:"pre-wrap",paddingBottom:12,borderBottom:"1px solid "+T.divider}}>{msg.text}</div>
              ) : msg.isDump ? (
                <div>
                  {/* Acknowledgment */}
                  <div style={{fontSize:14,color:T.sub,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,marginBottom:14,fontStyle:"italic"}}>{msg.acknowledgment}</div>

                  {/* All items unified */}
                  {(msg.tasks.length + msg.captures.length) > 0 && (
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:10}}>
                        {msg.tasks.length + msg.captures.length} item{msg.tasks.length+msg.captures.length!==1?"s":""} found
                      </div>

                      {/* Tasks */}
                      {msg.tasks.map((task,j)=>(
                        <div key={"t"+j} style={{display:"flex",alignItems:"flex-start",gap:12,paddingBottom:11,marginBottom:11,borderBottom:"1px solid "+T.divider}}>
                          <div style={{width:28,height:28,borderRadius:8,background:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                            <AreaIconSVG id={task.area||"work"} size={13} color={T.accent}/>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",lineHeight:1.35,marginBottom:3}}>{task.label}</div>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                              <span style={{fontSize:11,color:T.sub,textTransform:"capitalize"}}>{task.area||"work"}</span>
                              {task.urgency&&<span style={{fontSize:11,fontWeight:600,color:URGENCY_COLOR(task.urgency,T)}}>· {task.urgency}</span>}
                              {task.dueDate&&<span style={{fontSize:11,color:T.muted}}>· due {task.dueDate}</span>}
                              {task.duration&&<span style={{fontSize:11,color:T.muted}}>· ~{task.duration}min</span>}
                            </div>
                            {task.note&&<div style={{fontSize:12,color:T.muted,marginTop:4,lineHeight:1.5,fontStyle:"italic"}}>{task.note}</div>}
                          </div>
                        </div>
                      ))}

                      {/* Captures */}
                      {msg.captures.map((cap,j)=>(
                        <div key={"c"+j} style={{display:"flex",alignItems:"flex-start",gap:12,paddingBottom:11,marginBottom:11,borderBottom:j<msg.captures.length-1?"1px solid "+T.divider:"none"}}>
                          <div style={{width:28,height:28,borderRadius:8,background:T.surface,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,fontSize:13}}>
                            {CAPTURE_ICONS[cap.type]||"📌"}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,color:T.sub,lineHeight:1.45}}>{typeof cap==="string"?cap:cap.text}</div>
                            <div style={{fontSize:11,color:T.muted,marginTop:2,textTransform:"capitalize"}}>{(cap.type||"note").replace("-"," ")}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add to plan CTA */}
                  {msg.tasks.length > 0 && (
                    <button style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:T.text,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",letterSpacing:"-0.2px"}}>
                      Add {msg.tasks.length===1?"this task":"these "+msg.tasks.length+" tasks"} to plan →
                    </button>
                  )}
                </div>
              ) : (
                <div style={{fontSize:15,color:T.sub,fontFamily:"'DM Sans',sans-serif",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{msg.text}</div>
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
    </div>
  );
});

// ── LIFE MAP CONTENT ──────────────────────────────────────────────────────────

const STATUS_OPTS = ["Yes","Getting there","Not yet","Had it, lost it"];

const MOCK_CAPTURES = [
  {id:1,text:"Follow up with client on proposal",area:"work",type:"todo",estimate:"30 min",hard:false,subtasks:[]},
  {id:2,text:"Soccer practice Wednesday 5pm",area:"close",type:"calendar",estimate:"90 min",hard:false,subtasks:[]},
  {id:3,text:"Pay lease renewal",area:"money",type:"todo",estimate:"20 min",hard:true,subtasks:[]},
  {id:4,text:"Call mom back",area:"close",type:"todo",estimate:"10 min",hard:false,subtasks:[]},
  {id:5,text:"I want to read more this year",area:"fun",type:"parking",estimate:"30 min",hard:false,subtasks:[]},
  {id:6,text:"Feeling anxious about the budget this month",area:"money",type:"parking",estimate:"15 min",hard:true,subtasks:[]},
];




function LifeMapContent({T}) {
  const STATUS_OPTS = ["Yes","Getting there","Not yet","Had it, lost it"];




  const [areas, setAreas]           = useState(AREAS.map(a=>({...a,baseline:"",status:null,goals:[]})));
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
    // auto-save on close
    if(activeSheet) {
      setAreas(prev=>prev.map(a=>a.id===activeSheet.id
        ? {...a, baseline:editBaseline, status:editStatus, goals:editGoals}
        : a
      ));
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

const AREA_LABELS = {work:"Work",home:"Home",health:"Health",money:"Money",close:"Close relationships",contribution:"Contribution",meaning:"Meaning"};
// ── TASK CARDS ───────────────────────────────────────────────────────────────
function TaskCard({T, taskData, index, total, onConfirm, onDismiss, onAnswer}) {
  const [expanded, setExpanded] = useState(true);
  const [name, setName] = useState(taskData.text || "");
  const [area, setArea] = useState(taskData.area || "work");
  const [duration, setDuration] = useState(taskData.estimate || "30 min");
  const [answer, setAnswer] = useState("");
  const [pickArea, setPickArea] = useState(false);

  const AREAS = {work:"Work",home:"Home",health:"Health",money:"Money",close:"Close relationships",contribution:"Contribution",meaning:"Meaning"};

  return (
    <div style={{marginTop:12,background:T.card,borderRadius:16,overflow:"hidden",border:"1px solid "+T.border,boxShadow:T.shadow}}>
      {/* Card header */}
      <div style={{padding:"12px 14px 0"}}>
        {total > 1 && (
          <div style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>
            Task {index+1} of {total}
          </div>
        )}
        {/* Editable name */}
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          style={{width:"100%",fontSize:15,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",border:"none",background:"transparent",outline:"none",lineHeight:1.4,marginBottom:8}}
        />
        {/* Area + duration pills */}
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setPickArea(p=>!p)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:20,border:"1px solid "+T.border,background:T.surface,fontSize:11,color:T.sub,cursor:"pointer",fontFamily:"inherit"}}>
              <AreaIconSVG id={area} size={11} color={T.sub}/>
              {AREAS[area]||area}
            </button>
            {pickArea&&(
              <div style={{position:"absolute",bottom:32,left:0,zIndex:20,background:T.card,borderRadius:12,overflow:"hidden",border:"1px solid "+T.border,boxShadow:T.shadow,minWidth:160}}>
                {Object.entries(AREAS).map(([id,lbl],i)=>(
                  <button key={id} onClick={()=>{setArea(id);setPickArea(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 12px",border:"none",borderTop:i>0?"1px solid "+T.divider:"none",background:area===id?T.accentSoft:"transparent",color:area===id?T.accent:T.text,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    <AreaIconSVG id={id} size={11} color={area===id?T.accent:T.sub}/>{lbl}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+T.border,background:T.surface,fontSize:11,color:T.sub}}>{duration}</div>
          {taskData.dueDate&&<div style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+T.accent+"40",background:T.accentSoft,fontSize:11,color:T.accent}}>{taskData.dueDate}</div>}
          {taskData.urgency==="now"&&!taskData.dueDate&&<div style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+T.accent+"40",background:T.accentSoft,fontSize:11,color:T.accent}}>Tonight</div>}
        </div>
        {/* Steps if any */}
        {taskData.steps&&taskData.steps.length>0&&(
          <div style={{marginBottom:10}}>
            {taskData.steps.map((step,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:4}}>
                <div style={{width:16,height:16,borderRadius:"50%",border:"1px solid "+T.muted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <span style={{fontSize:9,color:T.muted}}>{i+1}</span>
                </div>
                <div style={{fontSize:12,color:T.sub,lineHeight:1.5}}>{step}</div>
              </div>
            ))}
          </div>
        )}
        {/* Clarifying question */}
        {taskData.clarifyingQuestion&&(
          <div style={{marginBottom:10,background:T.surface,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:12,color:T.sub,marginBottom:6,fontStyle:"italic",fontFamily:"'Lora',serif"}}>{taskData.clarifyingQuestion}</div>
            <input
              value={answer}
              onChange={e=>setAnswer(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&answer.trim()) onAnswer(answer);}}
              placeholder="Type your answer..."
              style={{width:"100%",fontSize:13,color:T.text,border:"none",background:"transparent",outline:"none",fontFamily:"'DM Sans',sans-serif"}}
            />
          </div>
        )}
      </div>
      {/* Action buttons */}
      <div style={{display:"flex",borderTop:"1px solid "+T.divider}}>
        <button onClick={()=>onConfirm({...taskData,text:name,area,clarifyingAnswer:answer})} style={{flex:1,padding:"11px",border:"none",background:T.accent,color:T.accentText,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          Add to plan
        </button>
        <button onClick={onDismiss} style={{width:48,padding:"11px",border:"none",borderLeft:"1px solid "+T.divider,background:"transparent",color:T.muted,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
      </div>
    </div>
  );
}

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

function TaskSheet({T, task, open, onClose, onSave}) {
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
            <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:12}}>Steps <span style={{fontWeight:400,color:T.muted}}>(optional)</span></div>
            {subtasks.map((sub,i)=>(
              <div key={i} style={{background:T.surface,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <button onClick={()=>setSubtasks(p=>p.map((s,j)=>j===i?{...s,done:!s.done}:s))} style={{width:20,height:20,borderRadius:"50%",border:sub.done?"none":"1.5px solid "+T.muted,background:sub.done?T.accent:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {sub.done&&<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <span style={{flex:1,fontSize:14,color:T.text,textDecoration:sub.done?"line-through":"none",opacity:sub.done?0.5:1}}>{sub.text}</span>
                  <button onClick={()=>setSubtasks(p=>p.filter((_,j)=>j!==i))} style={{color:T.muted,background:"none",border:"none",fontSize:16,cursor:"pointer",padding:"0 4px"}}>×</button>
                </div>
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

function PlanContent({T}) {
  const [tasks,setTasks]=useState(MOCK_TASKS);
  const [big3,setBig3]=useState([null,null,null]);
  const [showUpNext,setShowUpNext]=useState(false);
  const [selected,setSelected]=useState(null);
  const [sheetOpen,setSheetOpen]=useState(false);
  const [dragId,setDragId]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const MORNING=[{id:"m1",label:"Medication",time:"6:00 AM",dur:"2 min"},{id:"m2",label:"Morning review",time:"6:05 AM",dur:"5 min"},{id:"m3",label:"Movement",time:"6:20 AM",dur:"20 min"}];
  const SHUTDOWN=[{id:"s1",label:"Wind-down capture",time:"8:00 PM",dur:"5 min"},{id:"s2",label:"Tomorrow prep",time:"8:10 PM",dur:"5 min"}];
  const [morningDone,setMorningDone]=useState({});
  const [shutdownDone,setShutdownDone]=useState({});
  const big3Ids=big3.filter(Boolean).map(t=>t.id);
  const listTasks=tasks.filter(t=>!t.done&&!big3Ids.includes(t.id)).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,10);
  const filledCount=big3.filter(Boolean).length;
  const addToBig3=(task)=>{ const i=big3.findIndex(s=>s===null);if(i===-1)return;const n=[...big3];n[i]=task;setBig3(n); };
  const removeFromBig3=(i)=>{ const n=[...big3];n[i]=null;setBig3(n); };
  const markDone=(id)=>{ setTasks(p=>p.map(t=>t.id===id?{...t,done:true}:t));setBig3(p=>p.map(t=>t&&t.id===id?null:t)); };
  const onB3DS=(i)=>setDragId("b3-"+i);
  const onB3DO=(e,i)=>{ e.preventDefault();setDragOver("b3-"+i); };
  const onB3Dr=(e,i)=>{ e.preventDefault();if(dragId&&dragId.startsWith("b3-")){const fi=parseInt(dragId.split("-")[1]);const n=[...big3];[n[fi],n[i]]=[n[i],n[fi]];setBig3(n);}else if(dragId){const task=listTasks.find(t=>t.id===parseInt(dragId));if(task){const n=[...big3];n[i]=task;setBig3(n);}}setDragId(null);setDragOver(null); };
  const now=new Date();
  const timeStr=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  const dateStr=now.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"});
  useEffect(()=>{ if(big3.every(s=>s===null)&&tasks.filter(t=>!t.done).length>0){ suggestTop3(tasks,[],null).then(suggested=>{ if(suggested.length>0)setBig3([suggested[0]||null,suggested[1]||null,suggested[2]||null]); }).catch(()=>{}); } },[]);
  return (
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"0 0 20px"}}>
      <div style={{padding:"16px 20px 12px",background:T.bg}}>
        <div style={{fontSize:13,color:T.sub,marginBottom:2}}>{dateStr}</div>
        <div style={{fontSize:42,fontWeight:300,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-2px",lineHeight:1}}>{timeStr}</div>
        <div style={{background:T.surface,borderRadius:2,height:2,overflow:"hidden",marginTop:10}}>
          <div style={{height:"100%",background:T.accent,borderRadius:2,width:(filledCount===0?0:(filledCount/3)*100)+"%",transition:"width 0.4s"}}/>
        </div>
      </div>
      <div style={{padding:"0 20px"}}>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Morning routine</div>
          <div style={{background:T.card,borderRadius:14,overflow:"hidden",border:"1px solid "+T.border}}>
            {MORNING.map((r,i)=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderTop:i>0?"1px solid "+T.divider:"none",opacity:morningDone[r.id]?0.35:1}}>
                <button onClick={()=>setMorningDone(p=>({...p,[r.id]:!p[r.id]}))} style={{width:22,height:22,borderRadius:"50%",border:morningDone[r.id]?"none":"1.5px solid "+T.muted,background:morningDone[r.id]?T.accent:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
                  {morningDone[r.id]&&<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div style={{flex:1}}><div style={{fontSize:14,color:T.text,textDecoration:morningDone[r.id]?"line-through":"none"}}>{r.label}</div><div style={{fontSize:11,color:T.muted}}>{r.time} · {r.dur}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase"}}>Top 3 today</div>
            <button onClick={()=>setShowUpNext(s=>!s)} style={{fontSize:11,color:T.accent,fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{showUpNext?"Hide tasks":"View all tasks"}</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {big3.map((task,idx)=>(
              <div key={idx} onDragOver={e=>onB3DO(e,idx)} onDrop={e=>onB3Dr(e,idx)} style={{borderRadius:12,border:"1.5px "+(task?"solid":"dashed")+" "+(dragOver==="b3-"+idx?T.accent:task?T.border:T.divider),background:task?T.card:"transparent",minHeight:46,transition:"all 0.15s"}}>
                {task?(
                  <div draggable onDragStart={()=>onB3DS(idx)} onClick={()=>{setSelected(task);setSheetOpen(true);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:11,fontWeight:700,color:T.accent}}>{idx+1}</span></div>
                    <span style={{flex:1,fontSize:14,fontWeight:500,color:T.text,lineHeight:1.35}}>{task.label}</span>
                    <span style={{fontSize:11,color:dueColor(task.dueDate,T),fontWeight:500,flexShrink:0}}>{formatDue(task.dueDate)}</span>
                    <button onClick={e=>{e.stopPropagation();markDone(task.id);}} style={{width:22,height:22,borderRadius:"50%",border:"1.5px solid "+T.muted,background:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                    <button onClick={e=>{e.stopPropagation();removeFromBig3(idx);}} style={{background:"none",border:"none",color:T.muted,fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1,flexShrink:0}}>×</button>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:"1.5px dashed "+T.divider,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:11,color:T.muted}}>{idx+1}</span></div>
                    <span style={{fontSize:13,color:T.muted,fontStyle:"italic"}}>Drag here or tap +</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {showUpNext&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase"}}>Up next</div>
              <div style={{fontSize:11,color:T.muted}}>Sorted by due date</div>
            </div>
            {listTasks.length===0?<div style={{textAlign:"center",padding:"20px",color:T.muted,fontSize:13}}>All tasks in Top 3 or done.</div>:(
              <div style={{background:T.card,borderRadius:14,overflow:"hidden",border:"1px solid "+T.border}}>
                {listTasks.map((task,i)=>{
                  const canAdd=big3.some(s=>s===null);
                  return (
                    <div key={task.id} draggable onDragStart={()=>setDragId(task.id)} onClick={()=>{setSelected(task);setSheetOpen(true);}} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderTop:i>0?"1px solid "+T.divider:"none",cursor:"pointer",opacity:dragId===task.id?0.4:1}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,color:T.text,marginBottom:1}}>{task.label}</div>
                        <div style={{fontSize:11,color:T.muted,display:"flex",gap:6}}>
                          {task.dueDate&&<span style={{color:dueColor(task.dueDate,T),fontWeight:500}}>{formatDue(task.dueDate)}</span>}
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();canAdd&&addToBig3(task);}} style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid "+(canAdd?T.accent:T.divider),background:canAdd?T.accentSoft:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:canAdd?"pointer":"default",transition:"all 0.2s"}}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke={canAdd?T.accent:T.muted} strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:"0.6px",textTransform:"uppercase",marginBottom:8}}>Shutdown routine</div>
          <div style={{background:T.card,borderRadius:14,overflow:"hidden",border:"1px solid "+T.border}}>
            {SHUTDOWN.map((r,i)=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderTop:i>0?"1px solid "+T.divider:"none",opacity:shutdownDone[r.id]?0.35:1}}>
                <button onClick={()=>setShutdownDone(p=>({...p,[r.id]:!p[r.id]}))} style={{width:22,height:22,borderRadius:"50%",border:shutdownDone[r.id]?"none":"1.5px solid "+T.muted,background:shutdownDone[r.id]?T.accent:"transparent",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
                  {shutdownDone[r.id]&&<svg width="9" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div style={{flex:1}}><div style={{fontSize:14,color:T.text,textDecoration:shutdownDone[r.id]?"line-through":"none"}}>{r.label}</div><div style={{fontSize:11,color:T.muted}}>{r.time} · {r.dur}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TaskSheet T={T} task={selected} open={sheetOpen} onClose={()=>setSheetOpen(false)} onSave={u=>setTasks(p=>p.map(t=>t.id===u.id?u:t))}/>
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

function NavDrawer({T, open, onClose, onOpen}) {
  const NAV=[
    {id:"chat",    label:"Home",      sub:"What's on your mind"},
    {id:"plan",    label:"Plan",      sub:"Today's agenda"},
    {id:"lifemap", label:"Life Map",  sub:"Your baseline"},
    {id:"journal", label:"Journal",   sub:"Your record"},
  ];
  const ChevronRight=({c})=><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c||"#C4BFB8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",transition:"opacity 0.3s",opacity:open?1:0,pointerEvents:open?"auto":"none"}}/>
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:501,background:T.card,borderRadius:"20px 20px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)",transition:"transform 0.32s cubic-bezier(0.32,0.72,0,1)",transform:open?"translateY(0)":"translateY(100%)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px 10px"}}>
          <div style={{width:32}}/>
          <div style={{width:36,height:4,borderRadius:2,background:T.divider}}/>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"1px solid "+T.border,background:T.surface,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{padding:"4px 24px 12px",borderBottom:"1px solid "+T.divider}}>
          <div style={{fontSize:18,fontWeight:600,color:T.text,fontFamily:"'Lora',serif"}}>steady<span style={{color:T.accent}}>.</span></div>
          <div style={{fontSize:11,color:T.sub,marginTop:1}}>Your second brain</div>
        </div>
        <div style={{padding:"4px 0"}}>
          {NAV.map(item=>(
            <div key={item.id} onClick={()=>{onClose();setTimeout(()=>onOpen(item.id),50);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 24px",cursor:"pointer",borderBottom:"1px solid "+T.divider}}>
              <div>
                <div style={{fontSize:16,color:T.text,fontWeight:500}}>{item.label}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:1}}>{item.sub}</div>
              </div>
              <ChevronRight c={T.muted}/>
            </div>
          ))}
        </div>
        <div style={{height:36}}/>
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

function JournalScreen({T, captures, tasks}) {
  const [view,setView]=useState("dashboard");
  const [mode,setMode]=useState("ai");
  const [rating,setRating]=useState(null);
  const [narrative,setNarrative]=useState("");
  const [generating,setGenerating]=useState(false);
  const [generated,setGenerated]=useState(false);
  const [expanded,setExpanded]=useState(null);
  const [highlight,setHighlight]=useState("");
  const [hard,setHard]=useState("");
  const [grateful,setGrateful]=useState("");
  const [tomorrow,setTomorrow]=useState("");
  const completedTasks=(tasks||[]).filter(t=>t.done);
  const today=new Date().toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"});
  const AREAS=["work","health","close","contribution","money","home","meaning"];
  const areaPct=id=>Math.min(100,completedTasks.filter(t=>t.area===id).length*33);
  const ratingColor=r=>r==="Good"?T.green:r==="Hard"?T.red:T.accent;
  const ENTRIES=[
    {date:"Yesterday",fullDate:"Monday, May 5",rating:"Good",preview:"Something clicked today. Not dramatically.",narrative:"Something clicked today. Not dramatically. Just the quiet kind of click where you realize at 4pm that you did the things you said you were going to do. The deep work block held. Two weeks in a row. Still have not touched the money stuff. That is the pattern.",done:["Deep work block","Morning movement","Review budget"]},
    {date:"2 days ago",fullDate:"Sunday, May 4",rating:"Hard",preview:"Some days the only win is showing up.",narrative:"Some days the only win is showing up. Today was one of those. Nothing on the list moved. The kids needed more than the plan had room for. Not a failure. Just a different kind of day. Tomorrow starts fresh.",done:["Morning movement"]},
  ];
  const runGenerate=()=>{
    setGenerating(true);
    fetch("/api/journal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({captures,completedTasks,rating})})
      .then(function(r){return r.json();})
      .then(function(data){setNarrative(data.narrative||"Today had its own shape. Something moved. Tomorrow is a clean start.");setGenerating(false);setGenerated(true);})
      .catch(function(){setNarrative("Today had its own shape. Something moved. Tomorrow is a clean start.");setGenerating(false);setGenerated(true);});
  };
  return (
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{padding:"16px 20px 12px",background:T.bg}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:400,fontFamily:"'Lora',serif",color:T.text}}>Journal</div>
          <div style={{fontSize:11,color:T.muted}}>{today}</div>
        </div>
        <div style={{display:"flex",background:T.surface,borderRadius:12,padding:3,gap:2}}>
          {[{id:"dashboard",label:"Today"},{id:"entries",label:"Entries"}].map(function(tab){return(<button key={tab.id} onClick={function(){setView(tab.id);}} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:view===tab.id?T.card:"transparent",color:view===tab.id?T.text:T.muted,fontSize:13,fontWeight:view===tab.id?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{tab.label}</button>);})}
        </div>
      </div>
      {view==="dashboard"&&(
        <div style={{padding:"4px 20px 40px"}}>
          <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:12}}>Today at a glance</div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{fontSize:12,color:T.sub}}>Tasks completed</div><div style={{fontSize:12,fontWeight:700,color:T.text}}>{completedTasks.length} done</div></div>
              <div style={{background:T.surface,borderRadius:3,height:5,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(completedTasks.length/3)*100)+"%",background:T.accent,borderRadius:3}}/></div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:8,fontWeight:500}}>Life areas</div>
              {AREAS.map(function(id){return(<div key={id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}><div style={{fontSize:11,color:T.sub,width:80,flexShrink:0,textTransform:"capitalize"}}>{id}</div><div style={{flex:1,background:T.surface,borderRadius:2,height:4,overflow:"hidden"}}><div style={{height:"100%",width:areaPct(id)+"%",background:areaPct(id)>0?T.accent:T.divider,borderRadius:2}}/></div></div>);}) }
            </div>
            <div style={{background:T.surface,borderRadius:10,padding:"10px 12px",borderLeft:"2px solid "+T.accent}}>
              <Observation T={T} completedTasks={completedTasks}/>
            </div>
          </div>
          {completedTasks.length>0&&(
            <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+T.border}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:10}}>What got done</div>
              {completedTasks.map(function(task,i){return(<div key={task.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderTop:i>0?"1px solid "+T.divider:"none"}}><div style={{width:18,height:18,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="8" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={T.accentText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{flex:1}}><div style={{fontSize:13,color:T.text,fontWeight:500}}>{task.label}</div><div style={{fontSize:10,color:T.muted,textTransform:"capitalize"}}>{task.area}</div></div></div>);})}
            </div>
          )}
          <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+T.border}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent}}>Today entry</div>
              <div style={{display:"flex",background:T.surface,borderRadius:8,padding:2,gap:2}}>
                {[{id:"ai",label:"AI"},{id:"manual",label:"Write"}].map(function(m){return(<button key={m.id} onClick={function(){setMode(m.id);}} style={{padding:"4px 10px",borderRadius:6,border:"none",background:mode===m.id?T.card:"transparent",color:mode===m.id?T.text:T.muted,fontSize:11,fontWeight:mode===m.id?600:400,cursor:"pointer",fontFamily:"inherit"}}>{m.label}</button>);})}
              </div>
            </div>
            {mode==="ai"&&!generated&&!generating&&(<div><div style={{fontSize:13,color:T.muted,lineHeight:1.65,marginBottom:14,fontStyle:"italic",fontFamily:"'Lora',serif"}}>{(captures||[]).length===0?"No captures yet today.":"Ready to generate from "+((captures||[]).length)+" captures."}</div><button onClick={runGenerate} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:T.text,color:T.bg,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Generate today entry</button></div>)}
            {mode==="ai"&&generating&&(<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"dots 1.2s "+(i*0.2)+"s infinite"}}/>)}</div><div style={{fontSize:13,color:T.sub,fontStyle:"italic",fontFamily:"'Lora',serif"}}>Writing your entry...</div></div>)}
            {mode==="ai"&&generated&&(<div style={{fontSize:15,color:T.text,lineHeight:1.8,fontFamily:"'Lora',serif",fontStyle:"italic"}}>{narrative}</div>)}
            {mode==="manual"&&(<div>{[{label:"What happened today worth noting?",val:highlight,set:setHighlight,ph:"One thing..."},{label:"What was hard?",val:hard,set:setHard,ph:"Be honest..."},{label:"One thing grateful for",val:grateful,set:setGrateful,ph:"Anything..."},{label:"One intention for tomorrow",val:tomorrow,set:setTomorrow,ph:"Not a task..."}].map(function(field,i){return(<div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<3?"1px solid "+T.divider:"none"}}><div style={{fontSize:9,fontWeight:700,color:T.accent,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6}}>{field.label}</div><textarea rows={2} placeholder={field.ph} value={field.val} onChange={function(e){field.set(e.target.value);}} style={{width:"100%",border:"none",background:"transparent",color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,outline:"none",resize:"none"}}/></div>);})}</div>)}
          </div>
          <div style={{background:T.card,borderRadius:16,padding:"16px",border:"1px solid "+T.border}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.accent,marginBottom:10}}>How was today?</div>
            <div style={{display:"flex",gap:8,marginBottom:rating?12:0}}>
              {["Good","Okay","Hard"].map(function(opt){return(<button key={opt} onClick={function(){setRating(opt);}} style={{flex:1,padding:"11px 8px",borderRadius:12,border:"1px solid "+(rating===opt?ratingColor(opt):T.border),background:rating===opt?ratingColor(opt)+"18":"transparent",color:rating===opt?ratingColor(opt):T.sub,fontSize:14,fontWeight:rating===opt?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{opt}</button>);})}
            </div>
            {rating&&(<div style={{fontSize:13,color:T.muted,textAlign:"center",fontStyle:"italic",fontFamily:"'Lora',serif"}}>{rating==="Good"?"Good days are worth noting.":rating==="Hard"?"Hard days pass. You showed up.":"Most days are okay. That is okay."}</div>)}
          </div>
        </div>
      )}
      {view==="entries"&&(
        <div style={{padding:"4px 20px 40px"}}>
          <div style={{fontSize:13,color:T.muted,marginBottom:16,fontStyle:"italic",fontFamily:"'Lora',serif"}}>Your record. Everything captured.</div>
          {ENTRIES.map(function(entry,i){return(
            <div key={i} style={{background:T.card,borderRadius:16,border:"1px solid "+T.border,marginBottom:12,overflow:"hidden",boxShadow:T.shadow}}>
              <div onClick={function(){setExpanded(expanded===i?null:i);}} style={{padding:"16px 18px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:"'Lora',serif"}}>{entry.fullDate}</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>{entry.date}</div></div>
                  <div style={{padding:"3px 10px",borderRadius:20,background:ratingColor(entry.rating)+"18",border:"1px solid "+ratingColor(entry.rating)+"40"}}><span style={{fontSize:11,fontWeight:700,color:ratingColor(entry.rating)}}>{entry.rating}</span></div>
                </div>
                <div style={{fontSize:14,color:T.sub,lineHeight:1.7,fontFamily:"'Lora',serif",fontStyle:"italic"}}>{expanded===i?entry.narrative:entry.preview}</div>
              </div>
              {expanded===i&&(<div style={{borderTop:"1px solid "+T.divider,padding:"12px 18px",background:T.surface}}><div style={{fontSize:9,fontWeight:700,color:T.muted,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:8}}>Got done</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{entry.done.map(function(t,j){return(<span key={j} style={{fontSize:11,color:T.sub,background:T.card,padding:"4px 10px",borderRadius:20,border:"1px solid "+T.border}}>{t}</span>);})}</div></div>)}
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { session, loading, devBypass, setDevBypass } = useAuth();
  const [dark,setDark]=useState(false);
  const [navOpen,setNavOpen]=useState(false);
  const [activeSheet,setActiveSheet]=useState(null);
  const [chatPrompt,setChatPrompt]=useState(null);
  const [chatInitialText,setChatInitialText]=useState("");
  const [chatBarInput,setChatBarInput]=useState("");
  const [captures,setCaptures]=useState([]);
  const [tasks,setTasks]=useState(MOCK_TASKS);
  const chatBarRef=useRef(null);
  const chatBarInputRef=useRef(null);
  const chatContentRef=useRef(null);
  const T=dark?DARK:LIGHT;

  if (loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#F7F4EF",fontFamily:"'DM Sans',sans-serif",color:"#8A8680",fontSize:14}}>
      steady<span style={{color:"#E9B84A"}}>.</span>
    </div>
  );
  if (!session && !devBypass) return <AuthScreen dark={dark} onSkip={() => setDevBypass(true)} />;

  const openSheet=(id,prompt=null,text="")=>{
    setChatInitialText(text);
    setActiveSheet(id);
    if(prompt) setChatPrompt(prompt);
  };
  const closeSheet=()=>{ setActiveSheet(null);setChatPrompt(null);setChatInitialText(""); };

  const submitChatBar=()=>{
    const text=chatBarInput.trim();
    if(!text) { openSheet("chat",null,""); return; }
    setChatBarInput("");
    if(activeSheet==="chat" && chatContentRef.current) {
      chatContentRef.current.sendMessage(text);
    } else {
      openSheet("chat",null,text);
    }
  };

  const CHIPS=[
    {label:"Plan",     action:()=>openSheet("plan")},
    {label:"Life Map", action:()=>openSheet("lifemap")},
    {label:"Journal",  action:()=>openSheet("journal")},
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
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 36px 100px",overflow:"hidden"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontSize:38,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-1px",lineHeight:1.15,marginBottom:12}}>What's on<br/>your mind?</div>
            <div style={{fontSize:14,color:T.muted,fontStyle:"italic"}}>Just get it out. I'll handle the rest.</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",width:"100%",maxWidth:280}}>
            {CHIPS.map((chip,i)=>(
              <button key={i} onClick={chip.action} style={{padding:"12px 0",border:"none",borderBottom:"1px solid "+T.divider,background:"transparent",color:T.sub,fontSize:14,fontWeight:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:0}}>
                <span>{chip.label}</span>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ))}
          </div>
        </div>

        {/* ── PERSISTENT CHAT BAR — always visible, above all sheets ── */}
        <div ref={chatBarRef} style={{position:"fixed",bottom:0,left:0,right:0,zIndex:300,borderTop:"1px solid "+T.divider,padding:"10px 20px 28px",background:T.bg,transition:"background 0.4s"}}>
          <div style={{background:T.card,borderRadius:24,padding:"10px 12px 10px 18px",border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:8}}>
            <textarea
              ref={chatBarInputRef}
              value={chatBarInput}
              onChange={e=>setChatBarInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); submitChatBar(); } }}
              placeholder="What's on your mind..."
              rows={1}
              style={{flex:1,border:"none",background:"transparent",color:T.text,fontSize:15,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4,resize:"none",outline:"none",maxHeight:72,overflowY:"auto"}}
              onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,72)+"px";}}
            />
            {chatBarInput.trim()
              ? <button onClick={submitChatBar} style={{width:30,height:30,borderRadius:"50%",border:"none",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}><SendIcon c={T.bg}/></button>
              : <button onClick={()=>openSheet("chat",null,"")} style={{width:30,height:30,borderRadius:"50%",border:"none",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                  <svg width="15" height="18" viewBox="0 0 15 20" fill="none">
                    <rect x="4" y="1" width="7" height="11" rx="3.5" stroke={T.muted} strokeWidth="1.4"/>
                    <path d="M1 10c0 3.866 2.91 7 6.5 7s6.5-3.134 6.5-7" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="7.5" y1="17" x2="7.5" y2="19" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
            }
          </div>
        </div>

        {/* ── SHEETS ── */}
        <Sheet T={T} open={activeSheet==="chat"} onClose={closeSheet} chatBarRef={chatBarRef} title="Brain Dump">
          {activeSheet==="chat"&&<ChatContent ref={chatContentRef} T={T} initialText={chatInitialText} onCapture={cap=>setCaptures(p=>[...p,cap])}/>}
        </Sheet>
        <Sheet T={T} open={activeSheet==="plan"} onClose={closeSheet} chatBarRef={chatBarRef} title="Plan">
          {activeSheet==="plan"&&<PlanContent T={T}/>}
        </Sheet>
        <Sheet T={T} open={activeSheet==="lifemap"} onClose={closeSheet} chatBarRef={chatBarRef} title="Life Map">
          {activeSheet==="lifemap"&&<LifeMapContent T={T}/>}
        </Sheet>
        <Sheet T={T} open={activeSheet==="journal"} onClose={closeSheet} chatBarRef={chatBarRef} title="Journal">
          {activeSheet==="journal"&&<JournalScreen T={T} captures={captures} tasks={tasks}/>}
        </Sheet>

        <NavDrawer T={T} open={navOpen} onClose={()=>setNavOpen(false)} onOpen={openSheet}/>
      </div>
    </>
  );
}
