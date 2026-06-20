import { useState, useRef, useEffect } from "react";

const C = {
  black: "#111111", grey1: "#444444", grey2: "#767676", grey3: "#ABABAB",
  white: "#FFFFFF", paper: "#FAFAF8", recessed: "#F1F1ED", quiet: "#E3E3DE", red: "#C42B1C",
};

// Icons — simple SVG inline components (exception to no-icon rule: lifestyle categories
// benefit from emotional recognition; see LifestyleDesign.md Section 17)
const Icon = ({ name, size = 20 }) => {
  const s = { width: size, height: size, display: "block", flexShrink: 0 };
  const icons = {
    home:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    travel:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.5H2"/><path d="M5 16.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10.5"/><path d="M12 4v12.5"/></svg>,
    wellness:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    clothing:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>,
    children:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    giving:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M8 6a4 4 0 0 1 8 0"/><path d="M12 6V2"/></svg>,
    vehicles:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    star:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    check:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  };
  return icons[name] || null;
};

// Onboarding steps — shown on intro screen
const ONBOARD_STEPS = [
  { n: 1, label: "Sign up",            desc: "Passwordless — magic link or Google." },
  { n: 2, label: "Connect accounts",   desc: "Link banks, cards, and loans with Plaid." },
  { n: 3, label: "Confirm budget",     desc: "AI reads your transactions — you just confirm." },
  { n: 4, label: "Plan your life",     desc: "Tell us what you want. We build around it." },
  { n: 5, label: "See your future",    desc: "Your plan, your milestones, your next step." },
];

// Lifestyle categories with icons and prompts
const CATEGORIES = [
  {
    id: "housing", label: "Housing & Home", icon: "home", ramsey: "Housing · 25%",
    prompt: "Any home upgrades, moves, or services you want once there's room? Think: housekeeper, renovation, bigger home.",
    events: [
      { id: "house_purchase", label: "Buy a house",           type: "one-time",  defaultAmt: 450000, when: "2027", note: "Down payment ~1.5% out of pocket + $2,500 closing" },
      { id: "furnishings",    label: "Furnish the new home",  type: "one-time",  defaultAmt: 8000,   when: "2027" },
      { id: "housekeeper",   label: "Monthly housekeeper",    type: "recurring", defaultAmt: 200,    when: "2027", note: "Once debt is paid off" },
      { id: "renovation",    label: "Kitchen remodel",        type: "one-time",  defaultAmt: 40000,  when: "2032" },
    ],
  },
  {
    id: "travel", label: "Travel & Bucket List", icon: "travel", ramsey: "Personal & Entertainment · 7%",
    prompt: "Trips you've been putting off. Family adventures. Bucket list moments. A couples trip you've been dreaming about.",
    events: [
      { id: "disney_paris",    label: "Disney Paris — family trip",     type: "one-time",  defaultAmt: 20000, when: "2027", note: "5 days · before oldest ages out of Disney" },
      { id: "rome",            label: "Rome & Venice — anniversary",    type: "one-time",  defaultAmt: 5000,  when: "2028", note: "Target: May · just the two of you" },
      { id: "annual_vacation", label: "Annual family vacation",         type: "recurring", defaultAmt: 5000,  when: "2030", note: "Once debt is cleared" },
    ],
  },
  {
    id: "wellness", label: "Personal Care & Wellness", icon: "wellness", ramsey: "Personal & Entertainment · 7%",
    prompt: "Fitness, skincare, treatments, or bodywork you want to make a regular part of life once you have margin.",
    events: [
      { id: "microneedling", label: "Microneedling — Britney",    type: "recurring", defaultAmt: 1000,  period: "year",  when: "2027", note: "Series of 3 sessions/year" },
      { id: "co2_laser",     label: "CO₂ laser — Britney",       type: "one-time",  defaultAmt: 2750,  when: "2028",    note: "Every 3 years · $2,500–$3,000" },
      { id: "massage",       label: "Monthly massage — Britney", type: "recurring", defaultAmt: 100,   period: "month", when: "2027" },
      { id: "gym",           label: "Gym or fitness memberships",type: "recurring", defaultAmt: 100,   period: "month", when: "2030" },
    ],
  },
  {
    id: "clothing", label: "Clothing & Appearance", icon: "clothing", ramsey: "Personal & Entertainment · 7%",
    prompt: "Real clothing budget for the whole family — you've been putting this off. Six people all need clothes.",
    events: [
      { id: "family_clothing", label: "Family clothing budget", type: "recurring", defaultAmt: 400, period: "month", when: "2027", note: "Currently underfunded for all 6" },
    ],
  },
  {
    id: "children", label: "Children & Their Future", icon: "children", ramsey: "Personal & Entertainment · 7% + Savings",
    prompt: "Activities, camps, college, and the big decisions as they grow — first phones, first cars, helping them launch.",
    events: [
      { id: "activities",   label: "Sports & activities (all 4)",   type: "recurring", defaultAmt: 600,   period: "month", when: "2026" },
      { id: "college_529",  label: "College savings (529)",         type: "recurring", defaultAmt: 1000,  period: "month", when: "2033", note: "After retirement is on track" },
      { id: "cars_kids",    label: "First cars for kids",           type: "one-time",  defaultAmt: 12000, when: "2030",    note: "Oldest turns 16 in ~4 years" },
    ],
  },
  {
    id: "giving", label: "Giving & Generosity", icon: "giving", ramsey: "Giving · 10%",
    prompt: "Beyond the tithe — causes you believe in, generosity that grows as you do, leaving an inheritance.",
    events: [
      { id: "tithe",        label: "Tithe — 10% of income",      type: "recurring", defaultAmt: 1300, period: "month", when: "2026", committed: true, note: "Off the top, always" },
      { id: "extra_giving", label: "Increase giving as income grows", type: "recurring", defaultAmt: 500, period: "month", when: "2033" },
    ],
  },
  {
    id: "vehicles", label: "Vehicles", icon: "vehicles", ramsey: "Transportation · 3%",
    prompt: "Vehicle upgrades for the family — once the debt is behind you, what do you actually want to drive?",
    events: [
      { id: "brittany_suv", label: "Replace Britney's SUV",  type: "one-time", defaultAmt: 28000, when: "2030" },
      { id: "chris_vehicle",label: "Replace Chris's vehicle", type: "one-time", defaultAmt: 25000, when: "2032" },
    ],
  },
];

const TIMELINE_YEARS = Array.from({ length: 84 }, (_, i) => 2026 + i); // out to 2110 (~age 110 for Chris)
const CURRENT_YEAR  = 2026;
const fmt  = (v) => "$" + Math.round(v).toLocaleString("en-US");
const fmtShort = (v) => v >= 1000 ? "$" + (v / 1000).toFixed(0) + "k" : "$" + v;

function Toggle({ on, onClick }) {
  return (
    <span onClick={onClick} style={{ width: 40, height: 24, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${on ? C.black : C.grey3}`, background: on ? C.black : "transparent", position: "relative", cursor: "pointer", display: "inline-block" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 4, background: on ? C.white : C.grey3, transition: "left .15s" }} />
    </span>
  );
}

function Shell({ children }) {
  return (
    <div style={{ background: C.recessed, minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "-apple-system, Helvetica, Arial, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 412, background: C.paper, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 14px", flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: C.black }}>Teleport</span>
          <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.grey3 }}>Lifestyle plan</span>
        </div>
        <div style={{ height: 1, background: C.quiet, flexShrink: 0 }} />
        {children}
      </div>
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px 12px", flexShrink: 0 }}>
        <span onClick={onBack} style={{ fontSize: 22, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>‹</span>
        <span style={{ fontSize: 17, fontWeight: 600, color: C.black }}>{title}</span>
      </div>
      <div style={{ height: 1, background: C.quiet, flexShrink: 0 }} />
    </>
  );
}

export default function LifestyleOnboarding() {
  const [screen,      setScreen]      = useState("intro");
  const [selectedCat, setSelectedCat] = useState(null);
  const [viewYear,    setViewYear]    = useState(CURRENT_YEAR);
  const [showMaster,  setShowMaster]  = useState(false);
  const [addingTo,    setAddingTo]    = useState(null); // category id being added to
  const [newLabel,    setNewLabel]    = useState("");
  const [toggles, setToggles] = useState(() => {
    const t = {};
    CATEGORIES.forEach(cat => cat.events.forEach(ev => { t[ev.id] = ev.committed || false; }));
    return t;
  });
  const [customEvents, setCustomEvents] = useState({}); // { catId: [{id, label, ...}] }

  const toggle = (id) => setToggles(t => ({ ...t, [id]: !t[id] }));

  const allEvents  = CATEGORIES.flatMap(c => [...c.events, ...(customEvents[c.id] || [])]);
  const activeEvts = allEvents.filter(e => toggles[e.id]);
  const recurringTotal = activeEvts.filter(e => e.type === "recurring" && e.period === "month").reduce((s, e) => s + e.defaultAmt, 0);

  const cat = CATEGORIES.find(c => c.id === selectedCat);

  const eventsForYear = (y) => allEvents.filter(e => toggles[e.id] && parseInt(e.when) === y && TIMELINE_YEARS.includes(y));

  const addCustomEvent = (catId) => {
    if (!newLabel.trim()) return;
    const id = catId + "_custom_" + Date.now();
    setCustomEvents(prev => ({ ...prev, [catId]: [...(prev[catId] || []), { id, label: newLabel.trim(), type: "one-time", defaultAmt: 0, when: String(viewYear) }] }));
    setToggles(t => ({ ...t, [id]: true }));
    setNewLabel("");
    setAddingTo(null);
  };

  const removeEvent = (id) => {
    setToggles(t => { const n = { ...t }; delete n[id]; return n; });
    setCustomEvents(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { n[k] = n[k].filter(e => e.id !== id); });
      return n;
    });
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === "intro") return (
    <Shell>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "28px 24px 36px" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.grey3, marginBottom: 14 }}>Step 4 of 5</div>
          <div style={{ fontSize: 28, fontWeight: 400, color: C.black, lineHeight: 1.2, marginBottom: 14 }}>
            Plan the life<br />you actually want.
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: C.grey1, marginBottom: 10 }}>
            Your budget handles the basics. This is where you tell us what changes when there's room — the trips, the upgrades, the things you've been putting off.
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: C.grey1, marginBottom: 28 }}>
            Think of this as your bucket list meeting your financial plan. Every choice shows up on your timeline — and shows you exactly what it does to your retirement date. Toggle things on or off anytime.
          </div>

          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.grey2, marginBottom: 8 }}>How it works</div>
          <div style={{ height: 1, background: C.black, marginBottom: 0 }} />
          {ONBOARD_STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "11px 0", borderBottom: `1px solid ${C.quiet}` }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${s.n === 4 ? C.black : C.grey3}`, background: s.n === 4 ? C.black : "transparent", color: s.n === 4 ? C.white : s.n < 4 ? C.grey3 : C.grey3, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {s.n < 4 ? "✓" : s.n}
              </div>
              <div>
                <div style={{ fontSize: 14, color: s.n === 4 ? C.black : s.n < 4 ? C.grey2 : C.grey1, fontWeight: s.n === 4 ? 600 : 400, textDecoration: s.n < 4 ? "line-through" : "none" }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.grey3, marginTop: 1 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setScreen("categories")} style={{ width: "100%", padding: "15px 0", background: C.black, color: C.white, border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", borderRadius: 0, marginTop: 24 }}>
          Start planning
        </button>
      </div>
    </Shell>
  );

  // ── MASTER TOGGLE LIST ─────────────────────────────────────────────────────
  if (showMaster) return (
    <Shell>
      <TopBar title="All lifestyle choices" onBack={() => setShowMaster(false)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px 40px" }}>
        <div style={{ fontSize: 13, color: C.grey1, lineHeight: 1.5, marginBottom: 20 }}>Everything in one place. Toggle on what you want, off what you don't.</div>
        {CATEGORIES.map(cat => {
          const catEvts = [...cat.events, ...(customEvents[cat.id] || [])];
          return (
            <div key={cat.id} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, marginBottom: 5 }}>{cat.label}</div>
              <div style={{ height: 1, background: C.black }} />
              {catEvts.map(ev => (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: toggles[ev.id] ? C.black : C.grey2 }}>{ev.label}</div>
                    {ev.defaultAmt > 0 && <div style={{ fontSize: 11, color: C.grey3 }}>{fmt(ev.defaultAmt)}{ev.period ? "/" + ev.period : ev.type === "one-time" ? " · " + ev.when : ""}</div>}
                  </div>
                  <Toggle on={!!toggles[ev.id]} onClick={() => toggle(ev.id)} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Shell>
  );

  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  if (screen === "categories") return (
    <Shell>
      <TopBar title="Lifestyle plan" onBack={() => setScreen("intro")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px 100px" }}>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: C.grey1, marginBottom: 8 }}>
          What do you want when there's margin? Work through each category.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: C.grey1, marginBottom: 20 }}>
          Think: things you want on a regular basis, bucket list trips and experiences, what you want to do for your kids — college, first cars, camps. Toggle things on and watch your timeline update.
        </div>

        {CATEGORIES.map(cat => {
          const catEvts = [...cat.events, ...(customEvents[cat.id] || [])];
          const onCount = catEvts.filter(e => toggles[e.id]).length;
          return (
            <div key={cat.id} onClick={() => { setSelectedCat(cat.id); setScreen("category_detail"); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0", borderBottom: `1px solid ${C.quiet}`, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={cat.icon} size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: C.black }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: C.grey3, marginTop: 1 }}>{cat.ramsey}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {onCount > 0 && <span style={{ fontSize: 11, color: C.grey2 }}>{onCount} on</span>}
                <span style={{ fontSize: 16, color: C.grey3 }}>›</span>
              </div>
            </div>
          );
        })}

        <div onClick={() => setShowMaster(true)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", cursor: "pointer" }}>
          <span style={{ fontSize: 14, color: C.grey1 }}>See all choices at once</span>
          <span style={{ fontSize: 16, color: C.grey3 }}>›</span>
        </div>
      </div>

      {/* Sticky summary bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.paper, borderTop: `1px solid ${C.black}`, padding: "14px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey2 }}>Added per month</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(recurringTotal)}</span>
        </div>
        <button onClick={() => setScreen("timeline")} style={{ width: "100%", padding: "13px 0", background: C.black, color: C.white, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: 0 }}>
          See your timeline →
        </button>
      </div>
    </Shell>
  );

  // ── CATEGORY DETAIL ────────────────────────────────────────────────────────
  if (screen === "category_detail" && cat) {
    const catEvts = [...cat.events, ...(customEvents[cat.id] || [])];
    return (
      <Shell>
        <TopBar title={cat.label} onBack={() => setScreen("categories")} />
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px 40px" }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: C.grey1, marginBottom: 20 }}>{cat.prompt}</div>
          <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, marginBottom: 6 }}>In this category</div>
          <div style={{ height: 1, background: C.black }} />

          {catEvts.map(ev => {
            const on = !!toggles[ev.id];
            const isCustom = ev.id.includes("_custom_");
            return (
              <div key={ev.id} style={{ padding: "14px 0", borderBottom: `1px solid ${C.quiet}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: on ? C.black : C.grey2, fontWeight: on ? 500 : 400 }}>{ev.label}</div>
                    <div style={{ fontSize: 12, color: C.grey3, marginTop: 2 }}>
                      {ev.type === "recurring"
                        ? `${fmt(ev.defaultAmt)}/${ev.period || "mo"} · starts ${ev.when}`
                        : `${ev.defaultAmt > 0 ? fmt(ev.defaultAmt) : "Amount TBD"} · ${ev.when}`}
                    </div>
                    {ev.note && on && <div style={{ fontSize: 11, color: C.grey3, marginTop: 3, lineHeight: 1.4 }}>{ev.note}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isCustom && (
                      <span onClick={() => removeEvent(ev.id)} style={{ fontSize: 12, color: C.red, cursor: "pointer" }}>Remove</span>
                    )}
                    <Toggle on={on} onClick={() => toggle(ev.id)} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add custom item */}
          {addingTo === cat.id ? (
            <div style={{ padding: "14px 0", borderBottom: `1px solid ${C.quiet}` }}>
              <input
                autoFocus
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addCustomEvent(cat.id); if (e.key === "Escape") setAddingTo(null); }}
                placeholder="Describe what you want..."
                style={{ width: "100%", border: "none", borderBottom: `1px solid ${C.black}`, outline: "none", fontSize: 15, padding: "4px 0", background: "transparent", color: C.black, boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <span onClick={() => addCustomEvent(cat.id)} style={{ fontSize: 13, fontWeight: 600, color: C.black, cursor: "pointer" }}>Add</span>
                <span onClick={() => { setAddingTo(null); setNewLabel(""); }} style={{ fontSize: 13, color: C.grey2, cursor: "pointer" }}>Cancel</span>
              </div>
            </div>
          ) : (
            <div onClick={() => setAddingTo(cat.id)} style={{ fontSize: 13, color: C.grey3, padding: "14px 0", cursor: "pointer", borderBottom: `1px solid ${C.quiet}` }}>
              + Add something to {cat.label.toLowerCase()}
            </div>
          )}

          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `2px solid ${C.black}` }}>
            <span style={{ fontSize: 13, color: C.grey2 }}>Category total on</span>
            <span style={{ fontSize: 13, color: C.black, fontVariantNumeric: "tabular-nums" }}>
              {fmt(catEvts.filter(e => toggles[e.id] && e.type === "recurring" && e.period === "month").reduce((s, e) => s + e.defaultAmt, 0))}/mo
            </span>
          </div>

          <div style={{ marginTop: 8, fontSize: 11, letterSpacing: 0.5, color: C.grey3, lineHeight: 1.5 }}>
            Toggle things on to add them to your plan. Toggle off anytime — every change updates your retirement projection.
          </div>
        </div>
      </Shell>
    );
  }

  // ── TIMELINE ───────────────────────────────────────────────────────────────
  if (screen === "timeline") {
    const yearsWithEvents = TIMELINE_YEARS.filter(y => eventsForYear(y).length > 0);
    const displayYears = [...new Set([viewYear, ...yearsWithEvents])].sort((a, b) => a - b).slice(0, 20);

    return (
      <Shell>
        <TopBar title="Your timeline" onBack={() => setScreen("categories")} />

        {/* Sticky year strip */}
        <div style={{ flexShrink: 0, background: C.paper, borderBottom: `1px solid ${C.quiet}`, padding: "10px 24px" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {displayYears.slice(0, 15).map(y => (
              <span key={y} onClick={() => setViewYear(y)} style={{ fontSize: 11, letterSpacing: 0.8, padding: "4px 10px", borderRadius: 4, border: `1px solid ${viewYear === y ? C.black : C.quiet}`, background: viewYear === y ? C.black : "transparent", color: viewYear === y ? C.white : C.grey2, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                {y}
              </span>
            ))}
          </div>
        </div>

        {/* Sticky events this year */}
        <div style={{ flexShrink: 0, background: C.paper, borderBottom: `1px solid ${C.quiet}`, padding: "12px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 20, fontWeight: 600, color: C.black }}>{viewYear}</span>
              <span style={{ fontSize: 12, color: C.grey3, marginLeft: 10 }}>Baby Step 2 · Debt snowball</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.black, cursor: "pointer" }}>+ Add</span>
          </div>
          {eventsForYear(viewYear).length === 0 ? (
            <div style={{ fontSize: 13, color: C.grey3 }}>No lifestyle events for {viewYear}. Tap + Add to plan something.</div>
          ) : (
            eventsForYear(viewYear).map(ev => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.quiet}` }}>
                <div>
                  <span style={{ fontSize: 13, color: C.black }}>{ev.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.grey2 }}>{ev.type === "recurring" ? fmt(ev.defaultAmt) + "/mo" : fmt(ev.defaultAmt)}</span>
                  <Toggle on={!!toggles[ev.id]} onClick={() => toggle(ev.id)} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scrollable full picture */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 40px" }}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey2, marginBottom: 12 }}>Full picture</div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: C.quiet }} />
            {displayYears.map(y => {
              const yEvts    = eventsForYear(y);
              const isActive = y === viewYear;
              return (
                <div key={y} onClick={() => setViewYear(y)} style={{ position: "relative", paddingLeft: 26, marginBottom: 20, cursor: "pointer" }}>
                  <div style={{ position: "absolute", left: 0, top: 4, width: 13, height: 13, borderRadius: "50%", background: isActive ? C.black : yEvts.length > 0 ? C.grey1 : C.paper, border: `1.5px solid ${isActive ? C.black : yEvts.length > 0 ? C.grey1 : C.grey3}` }} />
                  <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 400, color: isActive ? C.black : C.grey1, marginBottom: 3 }}>{y}</div>
                  {yEvts.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {yEvts.map(e => (
                        <span key={e.id} style={{ fontSize: 10, color: C.grey2, background: C.recessed, padding: "2px 6px" }}>{e.label}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ paddingLeft: 26, marginBottom: 20 }}>
              <div style={{ position: "absolute", left: 0, width: 13, height: 13, borderRadius: "50%", background: C.paper, border: `1.5px solid ${C.quiet}` }} />
              <div style={{ fontSize: 12, color: C.grey3 }}>2049 · Retirement at 67</div>
            </div>
            <div style={{ paddingLeft: 26 }}>
              <div style={{ position: "absolute", left: 0, width: 13, height: 13, borderRadius: "50%", background: C.paper, border: `1.5px solid ${C.quiet}` }} />
              <div style={{ fontSize: 12, color: C.grey3 }}>2093–2110 · Legacy & generational wealth</div>
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.quiet}`, padding: "14px 24px 24px" }}>
          <button onClick={() => setScreen("summary")} style={{ width: "100%", padding: "14px 0", background: C.black, color: C.white, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: 0 }}>
            See the impact on retirement →
          </button>
        </div>
      </Shell>
    );
  }

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  if (screen === "summary") return (
    <Shell>
      <TopBar title="Retirement impact" onBack={() => setScreen("timeline")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px 40px" }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.grey2, marginBottom: 6 }}>Your lifestyle choices · {activeEvts.length} on</div>
          <div style={{ height: 1, background: C.black }} />
          {activeEvts.length === 0 ? (
            <div style={{ fontSize: 13, color: C.grey3, padding: "14px 0" }}>Nothing toggled on yet.</div>
          ) : (
            activeEvts.map(ev => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.quiet}` }}>
                <span style={{ fontSize: 13, color: C.black }}>{ev.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: C.grey2, fontVariantNumeric: "tabular-nums" }}>
                    {ev.type === "recurring" ? `${fmt(ev.defaultAmt)}/${ev.period || "mo"}` : `${fmt(ev.defaultAmt)} · ${ev.when}`}
                  </span>
                  <Toggle on={!!toggles[ev.id]} onClick={() => toggle(ev.id)} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.grey2, marginBottom: 6 }}>Monthly lifestyle add</div>
          <div style={{ height: 1, background: C.black }} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.black }}>Total recurring / mo</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.black }}>{fmt(recurringTotal)}</span>
          </div>
          <div style={{ padding: "10px 0", fontSize: 13, color: C.grey2, lineHeight: 1.6 }}>
            Every toggle changes your lifestyle spending, which changes your retirement number, which changes whether you can retire at 67.
          </div>
        </div>

        <button onClick={() => setScreen("categories")} style={{ width: "100%", padding: "13px 0", background: "transparent", color: C.black, border: `1.5px solid ${C.black}`, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>
          ← Adjust my choices
        </button>
        <button onClick={() => setScreen("intro")} style={{ width: "100%", padding: "13px 0", background: C.black, color: C.white, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Save and continue
        </button>
      </div>
    </Shell>
  );

  return null;
}
