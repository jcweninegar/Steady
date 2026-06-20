import { useState, useRef, useEffect } from "react";

const C = {
  black: "#111111", grey1: "#444444", grey2: "#767676", grey3: "#ABABAB",
  white: "#FFFFFF", paper: "#FAFAF8", recessed: "#F1F1ED", quiet: "#E3E3DE", red: "#C42B1C",
};

const CURRENT_YEAR = 2026;

const FAMILY = {
  parents: [
    { name: "Chris", age: 42, retireYear: 2049 },
    { name: "Britney", age: 42, retireYear: 2049 },
  ],
  children: [
    { name: "Child 1", birthYear: 2014 },
    { name: "Child 2", birthYear: 2016 },
    { name: "Child 3", birthYear: 2018 },
    { name: "Child 4", birthYear: 2019 },
  ],
};

const LIFE_STAGES = [
  { label: "School-age years", childAgeRange: [6, 12], desc: "Activities, braces, after-school. Busy and full." },
  { label: "Teen years", childAgeRange: [13, 17], desc: "Driving, phones, costs spike. Freedom and expense." },
  { label: "Launching", childAgeRange: [18, 22], desc: "College, first cars, moving out. One by one." },
  { label: "Empty nest", childAgeRange: [23, 99], desc: "Just you two. Travel, giving, legacy." },
];

// Baby Steps with calculated completion years
const BABY_STEPS_DEF = [
  { n: 1, label: "$1,000 starter fund",  completedYear: 2026 },
  { n: 2, label: "Debt snowball",         completedYear: 2032 },
  { n: 3, label: "Emergency fund",        completedYear: 2033 },
  { n: 4, label: "Retirement 15%",        completedYear: null  }, // ongoing
  { n: 5, label: "College savings",       completedYear: 2034  },
  { n: 6, label: "Pay off home",          completedYear: 2045  },
  { n: 7, label: "Legacy & wealth",       completedYear: null  }, // ongoing
];

// Portfolio assets — used in retirement section
const PORTFOLIO = {
  2026: [
    { label: "401k",               value: 12000 },
    { label: "536 Overland equity",value: 35000 },
    { label: "809 Randall equity", value: 74000 },
  ],
  2033: [
    { label: "401k",               value: 48000 },
    { label: "536 Overland equity", value: 62000 },
    { label: "809 Randall equity",  value: 101000 },
    { label: "Brokerage",           value: 22000 },
  ],
  2049: [
    { label: "401k / IRA",          value: 3800000 },
    { label: "536 Overland equity", value: 520000  },
    { label: "809 Randall equity",  value: 430000  },
    { label: "Brokerage",           value: 450000  },
  ],
};

const YEAR_DATA = {
  2026: {
    babyStep: 2,
    retirementOnTrack: false,
    monthlySpendAtRetirement: 14000,
    income: [
      { label: "Britney — W-2",      amt: 5430 },
      { label: "Rent — 536 Overland", amt: 2535 },
      { label: "Rent — 809 Randall",  amt: 2000 },
      { label: "Real estate agent",   amt: 1500 },
      { label: "Spark + consulting",  amt: 1400 },
    ],
    expenses: [
      { label: "Housing",       amt: 1750 },
      { label: "Food",          amt: 2000 },
      { label: "Utilities",     amt: 850  },
      { label: "Transportation",amt: 500  },
      { label: "Insurance",     amt: 600  },
      { label: "Personal",      amt: 700  },
      { label: "Giving",        amt: 1085 },
      { label: "Debt minimums", amt: 2800 },
    ],
    surplusGoesTo: "Debt snowball — Discover ($13,424)",
    accomplished: ["$1,000 starter fund in place", "Budget confirmed", "Snowball started on Discover"],
    upcoming: ["Discover paid off Aug 2026", "Braces eval — Child 1 next year"],
  },
  2027: {
    babyStep: 2,
    retirementOnTrack: false,
    monthlySpendAtRetirement: 14500,
    income: [
      { label: "Britney — W-2",       amt: 5700 },
      { label: "Rent — 536 Overland",  amt: 2600 },
      { label: "Rent — 809 Randall",   amt: 2060 },
      { label: "Real estate agent",    amt: 1600 },
      { label: "Spark + consulting",   amt: 1440 },
    ],
    expenses: [
      { label: "Housing (mortgage)",amt: 2100 },
      { label: "Food",              amt: 2000 },
      { label: "Utilities",         amt: 900  },
      { label: "Transportation",    amt: 520  },
      { label: "Insurance",         amt: 620  },
      { label: "Personal",          amt: 720  },
      { label: "Giving",            amt: 1140 },
      { label: "Debt minimums",     amt: 2200 },
    ],
    surplusGoesTo: "Debt snowball — Bank of America",
    accomplished: ["Discover paid off (Aug)", "House purchased", "Disney Paris trip"],
    upcoming: ["Bank of America closing in", "Braces — Child 1"],
  },
  2028: {
    babyStep: 2,
    retirementOnTrack: false,
    monthlySpendAtRetirement: 14900,
    income: [
      { label: "Britney — W-2",       amt: 5900 },
      { label: "Rent — 536 Overland",  amt: 2680 },
      { label: "Rent — 809 Randall",   amt: 2120 },
      { label: "Real estate agent",    amt: 1650 },
      { label: "Spark + consulting",   amt: 1480 },
    ],
    expenses: [
      { label: "Housing",       amt: 2100 },
      { label: "Food",          amt: 2060 },
      { label: "Utilities",     amt: 920  },
      { label: "Transportation",amt: 540  },
      { label: "Insurance",     amt: 640  },
      { label: "Personal",      amt: 740  },
      { label: "Giving",        amt: 1180 },
      { label: "Debt minimums", amt: 1600 },
    ],
    surplusGoesTo: "Debt snowball — Wells Fargo",
    accomplished: ["Bank of America paid off", "Braces — Child 1", "Phone — Child 2"],
    upcoming: ["Wells Fargo in sight", "Rome anniversary planning"],
  },
  2029: {
    babyStep: 2,
    retirementOnTrack: false,
    monthlySpendAtRetirement: 15400,
    income: [
      { label: "Britney — W-2",       amt: 6100 },
      { label: "Rent — 536 Overland",  amt: 2760 },
      { label: "Rent — 809 Randall",   amt: 2180 },
      { label: "Real estate agent",    amt: 1700 },
      { label: "Spark + consulting",   amt: 1520 },
    ],
    expenses: [
      { label: "Housing",       amt: 2100 },
      { label: "Food",          amt: 2120 },
      { label: "Utilities",     amt: 940  },
      { label: "Transportation",amt: 560  },
      { label: "Insurance",     amt: 660  },
      { label: "Personal",      amt: 760  },
      { label: "Giving",        amt: 1220 },
      { label: "Debt minimums", amt: 1200 },
    ],
    surplusGoesTo: "Debt snowball — Nelnet",
    accomplished: ["Wells Fargo paid off", "Rome/Venice anniversary trip", "CO₂ laser — Britney"],
    upcoming: ["Nelnet closing in", "Marriott next on snowball"],
  },
  2033: {
    babyStep: 4,
    retirementOnTrack: true,
    monthlySpendAtRetirement: 17400,
    income: [
      { label: "Britney — W-2",       amt: 7200 },
      { label: "Rent — 536 Overland",  amt: 3100 },
      { label: "Rent — 809 Randall",   amt: 2500 },
      { label: "Real estate agent",    amt: 2000 },
      { label: "Spark + consulting",   amt: 1700 },
    ],
    expenses: [
      { label: "Housing",       amt: 2100 },
      { label: "Food",          amt: 2300 },
      { label: "Utilities",     amt: 1040 },
      { label: "Transportation",amt: 620  },
      { label: "Insurance",     amt: 720  },
      { label: "Personal",      amt: 860  },
      { label: "Giving",        amt: 1620 },
      { label: "Retirement 15%",amt: 2430 },
    ],
    surplusGoesTo: "Retirement (15% of income) + college savings",
    accomplished: ["Debt-free!", "Emergency fund funded", "15% to retirement started", "Net worth positive"],
    upcoming: ["Child 2 college in 3 years", "Home payoff on horizon (2045)"],
  },
  2049: {
    babyStep: 7,
    retirementOnTrack: true,
    monthlySpendAtRetirement: 22000,
    income: [
      { label: "Retirement distributions", amt: 17330 },
      { label: "Rent — 536 Overland",      amt: 5200 },
      { label: "Rent — 809 Randall",        amt: 4100 },
      { label: "Social Security (Chris)",   amt: 3200 },
      { label: "Social Security (Britney)", amt: 2800 },
    ],
    expenses: [
      { label: "Housing (paid off)",amt: 800  },
      { label: "Food",              amt: 2800 },
      { label: "Utilities",         amt: 1400 },
      { label: "Transportation",    amt: 900  },
      { label: "Healthcare",        amt: 2400 },
      { label: "Insurance",         amt: 900  },
      { label: "Personal",          amt: 1400 },
      { label: "Giving",            amt: 3200 },
    ],
    surplusGoesTo: "Legacy giving & wealth building",
    accomplished: ["Home paid off (2045)", "All four children launched", "Retirement at 67", "Net worth $5.2M"],
    upcoming: ["Legacy planning", "Generational wealth transfers"],
  },
};

const SUGGESTIONS = [
  { id: "braces_1",   label: "Braces — Child 1",         year: 2027, cost: 5500,  trigger: "Child 1 turns 13",   type: "one-time"  },
  { id: "braces_2",   label: "Braces — Child 2",         year: 2028, cost: 5500,  trigger: "Child 2 turns 12",   type: "one-time"  },
  { id: "braces_3",   label: "Braces — Child 3",         year: 2029, cost: 5500,  trigger: "Child 3 turns 11",   type: "one-time"  },
  { id: "braces_4",   label: "Braces — Child 4",         year: 2030, cost: 5500,  trigger: "Child 4 turns 11",   type: "one-time"  },
  { id: "phone_1",    label: "Phone — Child 1",           year: 2026, cost: 360,   trigger: "Child 1 is 12",      type: "recurring" },
  { id: "phone_2",    label: "Phone — Child 2",           year: 2028, cost: 360,   trigger: "Child 2 turns 12",   type: "recurring" },
  { id: "phone_3",    label: "Phone — Child 3",           year: 2030, cost: 360,   trigger: "Child 3 turns 12",   type: "recurring" },
  { id: "phone_4",    label: "Phone — Child 4",           year: 2031, cost: 360,   trigger: "Child 4 turns 12",   type: "recurring" },
  { id: "teen_ins_1", label: "Teen insurance — Child 1",  year: 2030, cost: 5200,  trigger: "Child 1 turns 16",   type: "recurring" },
  { id: "teen_ins_2", label: "Teen insurance — Child 2",  year: 2032, cost: 5200,  trigger: "Child 2 turns 16",   type: "recurring" },
  { id: "car_1",      label: "First car — Child 1",       year: 2031, cost: 14000, trigger: "Child 1 turns 17",   type: "one-time"  },
  { id: "college_1",  label: "College — Child 1",         year: 2032, cost: 28000, trigger: "Child 1 age 18",     type: "recurring" },
  { id: "maintenance",label: "Home maintenance",           year: 2027, cost: 6750,  trigger: "Homeowner · 1.5%/yr",type: "recurring" },
];

function SilhouetteFigure({ height, width }) {
  const headR = width * 0.22;
  const bodyW = width * 0.55;
  const bodyH = height * 0.45;
  const legH  = height * 0.42;
  const cx    = (width + 4) / 2;
  const bodyX = cx - bodyW / 2;
  const bodyY = headR * 2 + 1 + height * 0.02;
  const legW  = bodyW * 0.42;
  const legY  = bodyY + bodyH - 4;
  return (
    <svg width={width + 4} height={height + 2} viewBox={"0 0 " + (width + 4) + " " + (height + 2)}>
      <circle cx={cx} cy={headR + 1} r={headR} fill={C.black} />
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={bodyW * 0.15} fill={C.black} />
      <rect x={bodyX} y={legY} width={legW} height={legH} rx={0} fill={C.black} />
      <rect x={bodyX + bodyW - legW} y={legY} width={legW} height={legH} rx={0} fill={C.black} />
    </svg>
  );
}

function FamilySilhouette({ year }) {
  const allPeople = [
    ...FAMILY.children.map(c => ({ ...c, age: year - c.birthYear, type: "child" })),
    ...FAMILY.parents.map(p => ({ ...p, age: p.age + (year - CURRENT_YEAR), type: "parent" })),
  ].sort((a, b) => b.age - a.age);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {allPeople.map((p, i) => {
        const isChild   = p.type === "child";
        const ageRatio  = isChild ? Math.min(Math.max(p.age, 0) / 18, 1) : 1;
        const height    = isChild ? 60 + ageRatio * 60 : 120;
        const width     = isChild ? 28 + ageRatio * 14 : 44;
        return (
          <div key={p.name + year} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: i === 0 ? 0 : -8 }}>
            <SilhouetteFigure height={height} width={width} />
            <div style={{ fontSize: 9, color: C.grey2, marginTop: 3 }}>{p.age}</div>
          </div>
        );
      })}
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <span onClick={onClick} style={{ width: 40, height: 24, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${on ? C.black : C.grey3}`, background: on ? C.black : "transparent", position: "relative", cursor: "pointer", display: "inline-block" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 4, background: on ? C.white : C.grey3, transition: "left .15s" }} />
    </span>
  );
}

const fmt  = (v) => "$" + Math.round(v).toLocaleString("en-US");
const fmtM = (v) => v >= 1000000 ? "$" + (v / 1000000).toFixed(1) + "M" : v >= 1000 ? "$" + Math.round(v / 1000) + "k" : "$" + v;
const inflated = (cost, fromYear, toYear) => Math.round(cost * Math.pow(1.03, toYear - fromYear));

const AVAILABLE_YEARS = [2026, 2027, 2028, 2029, 2033, 2049];

const SectionHead = ({ label }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey2 }}>{label}</div>
    <div style={{ height: 1, background: C.black, marginTop: 4 }} />
  </div>
);

const Row = ({ label, value, bold, small }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.quiet}` }}>
    <span style={{ fontSize: small ? 12 : 14, color: bold ? C.black : C.grey1, fontWeight: bold ? 600 : 400 }}>{label}</span>
    <span style={{ fontSize: small ? 12 : 14, color: C.black, fontVariantNumeric: "tabular-nums", fontWeight: bold ? 600 : 400 }}>{value}</span>
  </div>
);

export default function LifestyleVisual() {
  const [tab,      setTab]      = useState("family");
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [toggles,  setToggles]  = useState({});
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const timelineRef = useRef(null);
  const yearRefs    = useRef({});

  const toggle = (id) => setToggles(t => ({ ...t, [id]: !t[id] }));

  const oldestAge    = (y) => y - FAMILY.children[0].birthYear;
  const currentStage = LIFE_STAGES.find(s => oldestAge(viewYear) >= s.childAgeRange[0] && oldestAge(viewYear) <= s.childAgeRange[1]) || LIFE_STAGES[LIFE_STAGES.length - 1];
  const yd           = YEAR_DATA[viewYear] || YEAR_DATA[2026];
  const bs           = yd.babyStep;

  // Portfolio for this year — pick closest available
  const portfolioYear = [2026, 2033, 2049].reduce((prev, y) => Math.abs(y - viewYear) < Math.abs(prev - viewYear) ? y : prev, 2026);
  const portfolio     = PORTFOLIO[portfolioYear] || PORTFOLIO[2026];
  const portfolioTotal = portfolio.reduce((s, a) => s + a.value, 0);
  const SPEND_DOWN    = 3100000;
  const PRESERVE      = 5200000;

  const prevYear = () => { const i = AVAILABLE_YEARS.indexOf(viewYear); if (i > 0) setViewYear(AVAILABLE_YEARS[i - 1]); };
  const nextYear = () => { const i = AVAILABLE_YEARS.indexOf(viewYear); if (i < AVAILABLE_YEARS.length - 1) setViewYear(AVAILABLE_YEARS[i + 1]); };

  const eventsForYear = (y) => SUGGESTIONS.filter(s => s.year === y);

  // Auto-scroll timeline to selected year
  useEffect(() => {
    if (tab === "planner" && yearRefs.current[viewYear] && timelineRef.current) {
      yearRefs.current[viewYear].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [viewYear, tab]);

  // Income and expense totals
  const incomeTotal  = yd.income.reduce((s, r) => s + r.amt, 0);
  const expenseTotal = yd.expenses.reduce((s, r) => s + r.amt, 0);
  const surplus      = incomeTotal - expenseTotal;

  return (
    <div style={{ background: C.recessed, minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "-apple-system, Helvetica, Arial, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 412, background: C.paper, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* App header */}
        <div style={{ padding: "18px 24px 12px", borderBottom: `1px solid ${C.quiet}`, flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: C.black }}>Teleport</div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.black}`, flexShrink: 0 }}>
          {[["family", "Life view"], ["planner", "Timeline"], ["suggestions", "Suggested"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: tab === id ? 700 : 400, color: tab === id ? C.black : C.grey3, borderBottom: tab === id ? `2px solid ${C.black}` : "2px solid transparent", marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── LIFE VIEW ── */}
        {tab === "family" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* STICKY HEADER — year nav + stage */}
            <div style={{ flexShrink: 0, background: C.paper, zIndex: 10, borderBottom: `1px solid ${C.quiet}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px 8px" }}>
                <span onClick={prevYear} style={{ fontSize: 22, color: AVAILABLE_YEARS.indexOf(viewYear) > 0 ? C.black : C.grey3, cursor: "pointer", padding: "0 8px", userSelect: "none" }}>‹</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 600, color: C.black, lineHeight: 1 }}>{viewYear}</div>
                  <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey3, marginTop: 3 }}>{currentStage.label}</div>
                </div>
                <span onClick={nextYear} style={{ fontSize: 22, color: AVAILABLE_YEARS.indexOf(viewYear) < AVAILABLE_YEARS.length - 1 ? C.black : C.grey3, cursor: "pointer", padding: "0 8px", userSelect: "none" }}>›</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, paddingBottom: 10 }}>
                {AVAILABLE_YEARS.map(y => (
                  <span key={y} onClick={() => setViewYear(y)} style={{ width: 7, height: 7, borderRadius: "50%", background: y === viewYear ? C.black : C.grey3, cursor: "pointer", display: "inline-block" }} />
                ))}
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>

              {/* Stage description */}
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: C.grey2 }}>{currentStage.desc}</div>
              </div>

              {/* Silhouette */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, padding: "16px 0", borderTop: `1px solid ${C.quiet}`, borderBottom: `1px solid ${C.quiet}` }}>
                <FamilySilhouette year={viewYear} />
              </div>

              {/* EVENTS THIS YEAR */}
              {eventsForYear(viewYear).length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <SectionHead label="Events this year" />
                  {eventsForYear(viewYear).map(s => {
                    const on = !!toggles[s.id];
                    return (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.quiet}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: on ? C.black : C.grey1, fontWeight: on ? 500 : 400 }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: C.grey3, marginTop: 1 }}>{s.trigger}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, color: C.grey2, fontVariantNumeric: "tabular-nums" }}>
                            {fmt(inflated(s.cost, CURRENT_YEAR, viewYear))}{s.type === "recurring" ? "/yr" : ""}
                          </span>
                          <Toggle on={on} onClick={() => toggle(s.id)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BUDGET */}
              <div style={{ marginBottom: 28 }}>
                <SectionHead label={"Budget · " + viewYear} />

                {/* Income sources */}
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey3, padding: "8px 0 4px" }}>Income</div>
                {yd.income.map(r => <Row key={r.label} label={r.label} value={fmt(r.amt)} small />)}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.black}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.black }}>Total income / mo</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(incomeTotal)}</span>
                </div>

                {/* Expense categories */}
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey3, padding: "8px 0 4px" }}>Expenses</div>
                {yd.expenses.map(r => <Row key={r.label} label={r.label} value={fmt(r.amt)} small />)}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.black}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.black }}>Total expenses / mo</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(expenseTotal)}</span>
                </div>

                {/* Surplus */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.black }}>Surplus / mo</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(surplus)}</span>
                </div>
                <div style={{ padding: "9px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: C.grey3, marginBottom: 2 }}>Surplus going to</div>
                  <div style={{ fontSize: 13, color: C.grey1 }}>{yd.surplusGoesTo}</div>
                </div>
              </div>

              {/* BABY STEPS */}
              <div style={{ marginBottom: 28 }}>
                <SectionHead label="Baby steps" />
                {BABY_STEPS_DEF.map(s => {
                  const done    = s.n < bs;
                  const current = s.n === bs;
                  const future  = s.n > bs;
                  const yearLabel = done ? "Done ✓" : current ? "Now" : s.completedYear ? String(s.completedYear) : "—";
                  return (
                    <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.quiet}`, opacity: future ? 0.45 : 1 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: done ? C.black : current ? C.black : "transparent", border: `1.5px solid ${done || current ? C.black : C.grey3}`, color: done || current ? C.white : C.grey3, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {done ? "✓" : s.n}
                      </div>
                      <span style={{ flex: 1, fontSize: 14, color: current ? C.black : done ? C.grey2 : C.grey1, fontWeight: current ? 600 : 400 }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: current ? C.black : C.grey3, fontWeight: current ? 600 : 400 }}>{yearLabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* RETIREMENT AT 67 */}
              <div style={{ marginBottom: 28 }}>
                <SectionHead label="Retirement at 67" />

                {/* Portfolio breakdown */}
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey3, padding: "8px 0 4px" }}>Portfolio</div>
                {(showAllPortfolio ? portfolio : portfolio.slice(0, 3)).map(a => (
                  <div key={a.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.quiet}` }}>
                    <span style={{ fontSize: 12, color: C.grey1 }}>{a.label}</span>
                    <span style={{ fontSize: 12, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(a.value)}</span>
                  </div>
                ))}
                {portfolio.length > 3 && (
                  <div onClick={() => setShowAllPortfolio(v => !v)} style={{ fontSize: 12, color: C.grey2, padding: "7px 0", cursor: "pointer", borderBottom: `1px solid ${C.quiet}` }}>
                    {showAllPortfolio ? "Show less" : `+ ${portfolio.length - 3} more`}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.black}` }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.black }}>Total portfolio</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmtM(portfolioTotal)}</span>
                </div>

                {/* On track + monthly spend */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: C.grey3, marginBottom: 2 }}>Monthly spend at retirement</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(yd.monthlySpendAtRetirement)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: yd.retirementOnTrack ? C.black : C.red }}>
                      {yd.retirementOnTrack ? "On track ✓" : "Not yet"}
                    </div>
                    {!yd.retirementOnTrack && (
                      <div style={{ fontSize: 11, color: C.grey2, marginTop: 3 }}>
                        +{fmtM(Math.round((PRESERVE - portfolioTotal) / Math.max((2049 - viewYear) * 12, 1)))}/mo to hit target
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar with two targets — no grey box, just lines */}
                <div style={{ padding: "16px 0 4px" }}>
                  <div style={{ position: "relative", height: 28 }}>
                    {/* Track */}
                    <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, background: C.quiet, borderRadius: 2 }} />
                    {/* Fill */}
                    <div style={{ position: "absolute", top: 12, left: 0, height: 4, background: C.black, borderRadius: 2, width: Math.min((portfolioTotal / PRESERVE) * 100, 100) + "%", transition: "width .5s" }} />
                    {/* Spend-down tick */}
                    <div style={{ position: "absolute", top: 6, left: (SPEND_DOWN / PRESERVE * 100) + "%", transform: "translateX(-50%)" }}>
                      <div style={{ width: 1, height: 16, background: C.grey2 }} />
                    </div>
                    {/* Preserve tick */}
                    <div style={{ position: "absolute", top: 6, right: 0 }}>
                      <div style={{ width: 1, height: 16, background: C.grey2 }} />
                    </div>
                  </div>
                  {/* Labels inside the bar area */}
                  <div style={{ position: "relative", height: 36 }}>
                    <div style={{ position: "absolute", left: (SPEND_DOWN / PRESERVE * 100) + "%", transform: "translateX(-50%)", textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.black }}>{fmtM(SPEND_DOWN)}</div>
                      <div style={{ fontSize: 9, color: C.grey3, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>Spend-down</div>
                    </div>
                    <div style={{ position: "absolute", right: 0, textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.black }}>{fmtM(PRESERVE)}</div>
                      <div style={{ fontSize: 9, color: C.grey3, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>Keep principal</div>
                    </div>
                  </div>
                </div>

                {!yd.retirementOnTrack && (
                  <div style={{ paddingTop: 6, fontSize: 12, color: C.grey2, lineHeight: 1.6 }}>
                    Pay off debt first — then 15% of income to retirement starting 2033 puts you on track for the spend-down target.
                  </div>
                )}
              </div>

              {/* ACCOMPLISHED */}
              {yd.accomplished && (
                <div style={{ marginBottom: 28 }}>
                  <SectionHead label={"Accomplished by " + viewYear} />
                  {yd.accomplished.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.quiet}` }}>
                      <span style={{ fontSize: 10, color: C.grey3, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: C.grey2 }}>{a}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* PREPARING FOR */}
              {yd.upcoming && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHead label="Preparing for" />
                  {yd.upcoming.map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.quiet}` }}>
                      <span style={{ fontSize: 10, color: C.grey3, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 13, color: C.grey1 }}>{u}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {tab === "planner" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Sticky year strip + baby step status */}
            <div style={{ flexShrink: 0, background: C.paper, borderBottom: `1px solid ${C.quiet}`, padding: "12px 24px" }}>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                {AVAILABLE_YEARS.map(y => (
                  <span key={y} onClick={() => setViewYear(y)} style={{ fontSize: 11, letterSpacing: 0.8, padding: "4px 10px", borderRadius: 4, border: `1px solid ${y === viewYear ? C.black : C.quiet}`, background: y === viewYear ? C.black : "transparent", color: y === viewYear ? C.white : C.grey2, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {y}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.black }}>
                  {BABY_STEPS_DEF.find(s => s.n === (YEAR_DATA[viewYear] || YEAR_DATA[2026]).babyStep)?.label}
                </div>
                <div style={{ fontSize: 11, color: C.grey3 }}>
                  Baby Step {(YEAR_DATA[viewYear] || YEAR_DATA[2026]).babyStep} · {viewYear}
                </div>
              </div>
            </div>

            {/* Sticky events this year */}
            {eventsForYear(viewYear).length > 0 && (
              <div style={{ flexShrink: 0, background: C.paper, borderBottom: `1px solid ${C.quiet}`, padding: "10px 24px" }}>
                <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey2, marginBottom: 6 }}>Events this year
                  <span onClick={() => {}} style={{ float: "right", fontSize: 12, letterSpacing: 0, textTransform: "none", color: C.black, cursor: "pointer", fontWeight: 600 }}>+ Add</span>
                </div>
                {eventsForYear(viewYear).map(s => {
                  const on = !!toggles[s.id];
                  return (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.quiet}` }}>
                      <div>
                        <span style={{ fontSize: 13, color: on ? C.black : C.grey1 }}>{s.label}</span>
                        <span style={{ fontSize: 10, color: C.grey3, marginLeft: 8 }}>{s.trigger}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: C.grey2 }}>{fmt(inflated(s.cost, CURRENT_YEAR, viewYear))}{s.type === "recurring" ? "/yr" : ""}</span>
                        <Toggle on={on} onClick={() => toggle(s.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scrollable full timeline */}
            <div ref={timelineRef} style={{ flex: 1, overflowY: "auto", padding: "16px 24px 40px" }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey2, marginBottom: 12 }}>Full picture</div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: C.quiet }} />
                {AVAILABLE_YEARS.map(y => {
                  const yEvents  = eventsForYear(y);
                  const isActive = y === viewYear;
                  const yData    = YEAR_DATA[y] || YEAR_DATA[2026];
                  return (
                    <div
                      key={y}
                      ref={el => { yearRefs.current[y] = el; }}
                      onClick={() => setViewYear(y)}
                      style={{ position: "relative", paddingLeft: 26, marginBottom: 22, cursor: "pointer" }}
                    >
                      <div style={{ position: "absolute", left: 0, top: 4, width: 13, height: 13, borderRadius: "50%", background: isActive ? C.black : yEvents.length > 0 ? C.grey1 : C.paper, border: `1.5px solid ${isActive ? C.black : yEvents.length > 0 ? C.grey1 : C.grey3}` }} />
                      <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 400, color: isActive ? C.black : C.grey1, marginBottom: 2 }}>
                        {y}
                        <span style={{ fontSize: 11, color: C.grey3, fontWeight: 400, marginLeft: 10 }}>BS{yData.babyStep} · {BABY_STEPS_DEF.find(s => s.n === yData.babyStep)?.label}</span>
                      </div>
                      {yEvents.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {yEvents.map(e => (
                            <span key={e.id} style={{ fontSize: 10, color: toggles[e.id] ? C.black : C.grey2, background: toggles[e.id] ? C.quiet : C.recessed, padding: "2px 7px", borderRadius: 3 }}>{e.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Future placeholder — extends to old age */}
                <div style={{ paddingLeft: 26, marginBottom: 22 }}>
                  <div style={{ position: "absolute", left: 0, width: 13, height: 13, borderRadius: "50%", background: C.paper, border: `1.5px solid ${C.quiet}` }} />
                  <div style={{ fontSize: 13, color: C.grey3 }}>2049 → 2093 · Retirement & legacy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUGGESTIONS TAB ── */}
        {tab === "suggestions" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px 40px" }}>
            <div style={{ fontSize: 13, color: C.grey1, lineHeight: 1.55, marginBottom: 6 }}>Based on your family — 4 children ages 7, 8, 10, 12 — here's what's likely coming.</div>
            <div style={{ fontSize: 11, color: C.grey3, marginBottom: 20 }}>Costs in today's dollars. At-year estimates adjust for 3% inflation.</div>
            {Array.from(new Set(SUGGESTIONS.map(s => s.year))).sort().map(year => (
              <div key={year} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.black }}>{year}</span>
                  <span style={{ fontSize: 11, color: C.grey3 }}>· {year - CURRENT_YEAR > 0 ? `${year - CURRENT_YEAR} years away` : "Now"}</span>
                </div>
                <div style={{ height: 1, background: year === CURRENT_YEAR ? C.black : C.quiet }} />
                {SUGGESTIONS.filter(s => s.year === year).map(s => {
                  const on = !!toggles[s.id];
                  return (
                    <div key={s.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 14, color: on ? C.black : C.grey1, fontWeight: on ? 500 : 400 }}>{s.label}</span>
                            <span style={{ fontSize: 9, letterSpacing: 0.8, color: C.grey3, textTransform: "uppercase" }}>Suggested</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.grey3, marginBottom: 6 }}>{s.trigger}</div>
                          <div style={{ display: "flex", gap: 16 }}>
                            <div>
                              <div style={{ fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: C.grey3 }}>Today</div>
                              <div style={{ fontSize: 12, color: C.grey2, fontVariantNumeric: "tabular-nums" }}>{fmt(s.cost)}{s.type === "recurring" ? "/yr" : ""}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: C.grey3 }}>In {year}</div>
                              <div style={{ fontSize: 12, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(inflated(s.cost, CURRENT_YEAR, year))}{s.type === "recurring" ? "/yr" : ""}</div>
                            </div>
                          </div>
                        </div>
                        <Toggle on={on} onClick={() => toggle(s.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
