import React, { useState, useRef, useMemo, useEffect } from "react";

const C = {
  black: "#111111", grey1: "#444444", grey2: "#767676", grey3: "#ABABAB",
  white: "#FFFFFF", paper: "#FAFAF8", recessed: "#F1F1ED", quiet: "#E3E3DE", red: "#C42B1C",
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const AVATAR = "data:image/jpeg;base64,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";
const BRITTANY = "data:image/jpeg;base64,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";
const HOUSEHOLD = [
  { name: "Brittany", sub: "Spouse", photo: true },
  { name: "Children", sub: "4 dependents", badge: "+4" },
];

function generateData(years) {
  const months = years * 12, startYear = 2026, startMonth = 5, r = 0.07 / 12, pts = [];
  for (let m = 0; m <= months; m++) {
    const debt = m >= 36 ? 0 : 90000 * Math.pow(1 - m / 36, 1.25);
    const realEstate = 115000 + 2100 * m;
    let investment = 0;
    if (m > 36) { const n = m - 36; investment = 1600 * ((Math.pow(1 + r, n) - 1) / r); }
    const netWorth = realEstate + investment + 5000 - debt;
    const income = 130000 * Math.pow(1.03, m / 12);
    const surplus = 28000 * Math.pow(1.03, m / 12) + (m > 36 ? 15000 : 0);
    const tot = startMonth + m;
    pts.push({ m, year: startYear + Math.floor(tot / 12), month: tot % 12, netWorth, debt, income, surplus });
  }
  return pts;
}

// one-month daily cash flow (June 2026) with real timing
function generateCashMonth() {
  const days = 30, start = 4200, burn = 110;
  // 1st: rent + mortgages + bills | 7th: rental income | 12 & 26: Brittany pay | 15: card minimums | 19: tax refund | 22: big Discover payment
  const events = { 1: -2800, 7: 4535, 12: 2715, 15: -2500, 19: 13000, 22: -9000, 26: 2715 };
  const pts = []; let cum = 0;
  for (let d = 1; d <= days; d++) {
    let net = -burn; if (events[d]) net += events[d];
    cum += net; pts.push({ day: d, balance: start + cum, cum });
  }
  return pts;
}

const SERIES = [
  { key: "netWorth", label: "Net worth", color: C.black, width: 2,    dash: "0" },
  { key: "debt",     label: "Debt",      color: C.red,   width: 1.75, dash: "5 4" },
  { key: "income",   label: "Income",    color: C.grey2, width: 1.25, dash: "1 4" },
  { key: "surplus",  label: "Surplus",   color: C.grey1, width: 1.25, dash: "7 3 1 3" },
];
const HORIZONS = [{ label: "1Y", years: 1 }, { label: "5Y", years: 5 }, { label: "10Y", years: 10 }, { label: "25Y", years: 25 }];

const SEQUENCE = [
  { step: "Give 10% of your income", when: "This month", current: true, helper: "Give first, off the top. It anchors every other money decision." },
  { step: "Get protected", when: "This month", current: true, helper: "Term life (10–12× income), long-term disability, a basic will, and guardianship for the kids — handled together." },
  { step: "$1,000 starter fund", when: "This month", current: true, helper: "A small buffer so a surprise doesn't become new debt while you attack the cards." },
  { step: "Pay off all non-mortgage debt", when: "This month", current: true, helper: "Smallest balance first. Every extra dollar hits one card until it's gone, then roll it forward." },
  { step: "Pause investing", when: "This month", current: true, helper: "Pause 401k contributions (match included) and aim it all at the debt — temporarily." },
  { step: "Full emergency fund", when: "Next month", helper: "Build 3–6 months of expenses in cash once the debt is gone." },
  { step: "Retirement (15%)", when: "2032", helper: "Invest 15% of income for retirement, steady and automatic." },
  { step: "Education funding", when: "2033", helper: "Fund the kids' education once retirement is rolling." },
  { step: "Pay off the home", when: "2045", helper: "Throw everything extra at the mortgage until the house is yours." },
  { step: "Legacy planning", when: "Ongoing", helper: "Leave an inheritance for your children and your children's children." },
];

const JUNE_TASKS = [
  { id: "k401", label: "Pause Brittany's 401k", when: "review", priority: true },
  { id: "withholding", label: "Update Brittany's W-4", when: "review", priority: true },
  { id: "give", label: "Give 10% of income", when: "1st" },
  { id: "starter", label: "Fund $1,000 starter", when: "1st" },
  { id: "discover", label: "Throw all surplus at Discover", when: "payday" },
  { id: "snowball", label: "Start the debt snowball", when: "payday" },
  { id: "life", label: "Life insurance audit", when: "review" },
  { id: "disability", label: "Disability audit", when: "review" },
  { id: "health", label: "Health insurance", when: "review" },
  { id: "auto", label: "Auto insurance", when: "review" },
  { id: "home", label: "Home insurance", when: "review" },
  { id: "will", label: "Set up a will + guardianship", when: "review", priority: true },
  { id: "poa", label: "Name powers of attorney", when: "review" },
];

const CLOSEOUT = [
  { id: "reconcile", label: "Reconcile all accounts", when: "month-end" },
  { id: "updbal", label: "Update balances in Teleport", when: "month-end" },
  { id: "budrev", label: "Review budget vs. targets", when: "month-end" },
  { id: "givesent", label: "Confirm giving sent", when: "month-end" },
  { id: "logsurplus", label: "Log this month's surplus", when: "month-end" },
  { id: "nextplan", label: "Set next month's plan", when: "month-end" },
];

const ONBOARD = [
  { name: "Passwordless sign-up", line: "Magic link or Google — no password to remember.", how: "Supabase Auth runs it. A magic link is a one-time email link; Google is OAuth through Supabase. On success, Supabase creates the user and issues a session token that lives on the device.", where: "Creates a household record in Supabase Postgres keyed to the new user ID. Every other record in the app hangs off that ID.", limits: "Magic-link delivery depends on email; Google sign-in needs a verified consent screen before public launch." },
  { name: "Connect accounts", line: "Link banks, cards, and loans in a tap with Plaid.", how: "The app opens Plaid Link using a token minted by a Supabase edge function that holds the Plaid secret — the secret never touches the phone. After the user logs in at their bank, Plaid returns a public token; the edge function swaps it for a permanent access token and stores it encrypted.", where: "Pulls the institution, accounts (name, type, last four, balances), transactions, and loan balances + APRs. Balances land on Accounts; transactions feed Budget and Cash flow; loans feed Debt payoff and Net worth.", limits: "Plaid's free Trial plan caps at 10 connections — fine for the team and a few households, not a public launch. Small credit unions may not be supported (those fall back to upload). Data refreshes by webhook, so it's near-live, not instant." },
  { name: "Confirm your budget", line: "AI drafts your targets; you just watch the surplus.", how: "Transactions are auto-categorized (Plaid categories plus an AI pass) and rolled into monthly spend per category. AI proposes targets and you nudge them. It runs in the background — invisible budgeting.", where: "Targets save to a budget table; the monthly surplus (income minus spending) is snapshotted and feeds the Plan, Cash flow, and the long-range projections.", limits: "Categorization needs a quick review for low-confidence items, and the first month or two is rough until there’s enough history to learn from." },
  { name: "Pick your path", line: "We narrow the options; you decide your future.", how: "A projection engine takes your accounts, surplus, and choices — debt method, investment order, goals, milestones, life events — and computes the timeline. Teleport surfaces only the decisions that matter, each with a smart default.", where: "Choices, goals, and events save to their own tables. Any change recomputes the projection that drives the home chart, the timeline, and every calculated report.", limits: "Growth and appreciation assumptions are estimates you’ll be able to review and sign off on. Optimization is rules-based for the MVP, not a full solver." },
  { name: "See your future", line: "Your custom plan, and the next step to get there.", how: "The engine resolves everything into the Comprehensive Plan, a prioritized action list, and the home timeline — recalculated the moment any input changes.", where: "Shows up on Home (chart, timeline, this-month tasks) and across the Plan’s reports. The action list is your “what to do next.”", limits: "It’s guidance, not licensed financial advice — the plan carries that disclaimer." },
];

const INFO = {
  give: { title: "Give 10% of income", body: [
    { h: "What Dave says", t: "Gross or net is up to you — he won't split hairs. He gives off the top of his taxable income, but his line is just “be a giver.”" },
    { h: "What scripture says", t: "“Firstfruits” (Proverbs 3:9) means give first, off the top. There's no New Testament command on gross vs. net." },
    { h: "Practical read", t: "Giving on net is not unfaithful. Give on what actually reaches you — the heart matters more than the math." },
    { h: "Rental income", t: "Tithe on the cash flow that reaches your pocket, not gross rent." },
    { h: "Side / all income", t: "Yes — 10% of everything (agent commissions, Spark, consulting)." },
    { h: "Tax refund", t: "If you gave on gross, it's already covered. If you gave on net, give 10% of the refund." },
  ]},
  starter: { title: "$1,000 starter fund", body: [
    { h: "Why", t: "Baby Step 1. A buffer so a small surprise doesn't become new debt while you're paying off the cards." },
    { h: "Why no “minimum balance” rule", t: "The $1,000 is the floor itself. Keep it in a separate savings account so it isn't blurred into checking." },
    { h: "Your real minimum", t: "The $1,000 plus your monthly timing buffer. Use the Cash toggle to see the lowest your balance dips, and keep at least that much parked." },
  ]},
  discover: { title: "Throw all surplus at Discover", body: [
    { h: "Why Discover first", t: "First snowball target: $13,424 at 15.49%. After giving, the $1,000, and all minimums, every extra dollar goes here." },
    { h: "Then roll it", t: "When Discover is gone, add its old payment to the next debt — the snowball grows." },
  ]},
  snowball: { title: "Debt payoff method", body: [
    { h: "Snowball (Dave)", t: "Smallest balance first. It's psychology — quick wins keep you going." },
    { h: "Avalanche", t: "Highest rate first. Saves the most interest." },
    { h: "Your custom angle", t: "0% promos expire soon — BoA 11/22/26 to 17.49%, Wells Fargo 4/2/27 to 30%. Plan around those before the rate jumps." },
  ]},
  k401: { title: "Pause Brittany's 401k", body: [
    { h: "What Dave says", t: "Pause ALL 401k contributions during Baby Step 2 — even the employer match — and send it to debt." },
    { h: "What it frees up", t: "Brittany puts in 3% (~$121/paycheck). Pausing frees about $262/mo for the snowball." },
    { h: "The tradeoff", t: "While paused you give up the match. Restart the moment the debt is gone." },
  ]},
  life: { title: "Life insurance audit", body: [
    { h: "What Dave says", t: "10–12x income, term only, 15–20 year level term. No whole life." },
    { h: "For you (variable income)", t: "Size it on your sustainable income, not a peak year. ~$500k–600k fits. Nudge to $600k if income's trending up." },
    { h: "Non-working spouse", t: "Still insure them — replacing childcare and household work is real. Typically $250k–500k." },
  ]},
  disability: { title: "Disability audit", body: [
    { h: "What Dave says", t: "Long-term yes, short-term no — your emergency fund covers the short gap." },
    { h: "Brittany's short-term", t: "Her “Std Post Tax” line is ~$50.90/period. Cancel once the e-fund covers ~90 days. Saves ~$1,323/yr." },
    { h: "Keep", t: "Her Voluntary LTD. Post-tax premiums mean any benefit is tax-free." },
  ]},
  withholding: { title: "Update Brittany's W-4", body: [
    { h: "The issue", t: "~$13,000 refund = a ~$1,083/mo interest-free loan to the IRS — cash you could throw at Discover now." },
    { h: "Likely cause", t: "Extra withholding on her W-4 (line 4c) or status set to over-withhold." },
    { h: "Fix", t: "Adjust her W-4 in ADP toward a ~$0 refund. Keep a small cushion. Re-check after the comp change." },
  ]},
  bank_about: { title: "Bank accounts", body: [
    { h: "What these are", t: "Your day-to-day cash — checking and savings. Not investments or property; just spendable balances." },
    { h: "Keep it current", t: "Upload a statement for each account, or just ask Porter anytime." },
  ]},
  plaid: { title: "Connecting accounts", body: [
    { h: "Prototype", t: "Manual statement upload for now." },
    { h: "Future build", t: "DEV NOTE — connect accounts automatically with Plaid so balances and transactions sync live." },
  ]},
  docs90: { title: "Where the data comes from", body: [
    { h: "~90% from four docs", t: "DEV NOTE — most of the data model populates from: pay stub, bank statements, credit-card & loan statements, and last year's tax return." },
    { h: "The rest", t: "Property values, insurance details, and goals — entered once, or told to Porter." },
  ]},
  voice_tech: { title: "Voice — build notes", body: [
    { h: "Requirement", t: "DEV NOTE — highest-quality speech-to-text: accurate, low-latency, handles finance terms and dollar amounts." },
    { h: "Behavior", t: "Opens listening. Live transcript stays docked at the bottom and never expands over the screen. No keyboard." },
    { h: "Privacy", t: "Voice replies muted by default; user can unmute." },
  ]},
  porter: { title: "Porter", body: [
    { h: "What Porter does", t: "Voice-first. Works from your Teleport data and knowledge base — answers questions and runs tasks, never pushes opinions." },
    { h: "Ask anything", t: "“Should I buy this car?” shows the impact on cash, debt, and timeline — not a yes or no. “Show me life when our oldest starts college” renders that moment." },
    { h: "Manages your data", t: "Add timeline events, tag an expense as business (it remembers), or upload a statement — unknowns route to your to-do list." },
    { h: "Voice", t: "DEV NOTE — highest-quality speech-to-text: accurate, low-latency, handles finance terms and dollar amounts." },
    { h: "Behavior", t: "Opens as a slim bottom bar so it never covers your data. It only takes the screen when Porter needs to show you something. No keyboard." },
    { h: "Privacy", t: "Voice replies muted by default; unmute to hear Porter." },
  ]},
  plan_print: { title: "Print", body: [
    { h: "Format", t: "Every report in the plan is one page, printed landscape at 11 × 8.5 in." },
    { h: "What prints", t: "The executive summary plus every report, each on its own page." },
  ]},
  plan_download: { title: "Download", body: [
    { h: "Format", t: "Downloads as a 16:9 deck — built for sharing and presenting." },
  ]},
  plan_share: { title: "Share", body: [
    { h: "Share", t: "Send the plan to someone — an advisor, your spouse, a lender." },
  ]},
  tools: { title: "Tools", body: [{ h: "What this is", t: "Your planning models — lifestyle goals, education funding, and W-4 / tax sizing. Come back to these whenever life changes." }]},
  reconcile: { title: "Reconcile all accounts", body: [{ h: "What it means", t: "Match each account's real balance to what Teleport shows, so every decision is based on true numbers." }]},
  updbal: { title: "Update balances", body: [{ h: "What it means", t: "Enter the current balance for each account — or upload a statement — so net worth and cash flow stay current." }]},
  budrev: { title: "Review budget vs. targets", body: [{ h: "What it means", t: "Compare what you actually spent against your targets, and adjust next month wherever you ran over." }]},
  givesent: { title: "Confirm giving sent", body: [{ h: "What it means", t: "Verify your 10% went out for the month — first, off the top, before anything else." }]},
  logsurplus: { title: "Log this month's surplus", body: [{ h: "What it means", t: "Record what was left after spending and debt payments. The surplus is the fuel for your snowball and your goals." }]},
  nextplan: { title: "Set next month's plan", body: [{ h: "What it means", t: "Decide next month's giving, bills, and debt target up front, so you start the month with a plan instead of a guess." }]},
  will: { title: "Will & guardianship", body: [{ h: "Why now", t: "With four kids, a will naming guardians is the most important document you can have — without it, a court decides who raises them." }, { h: "Cost", t: "A simple will or a reputable online service is inexpensive. Don't let perfect be the enemy of done." }]},
  poa: { title: "Powers of attorney", body: [{ h: "What", t: "A financial POA and a medical directive name who can act for you if you can't. They pair with the will." }]},
  household_kids: { title: "Your household", body: [
    { h: "The +4", t: "Your four children. They're counted in the household but not shown individually." },
    { h: "Why no photos", t: "Minors don't get public profiles or photos — privacy by default. Manage this under Privacy & data." },
  ]},
  health: { title: "Health insurance", body: [{ h: "Status", t: "Required. You have it through Aqua, deducted pre-tax. Keep it." }]},
  auto: { title: "Auto insurance", body: [{ h: "Status", t: "Required. Liability + collision. Once the full e-fund is in place, higher deductibles lower the premium." }]},
  home: { title: "Home insurance", body: [
    { h: "Status", t: "Required. Landlord policies on both rentals; homeowners on your residence." },
    { h: "Check", t: "Dwelling coverage should equal rebuild cost, not market value." },
  ]},
  bud_Giving: { title: "Giving", body: [
    { h: "Target", t: "10% of take-home, off the top." },
    { h: "Last year (Jun)", t: "$980/mo. You're slightly above your 12-mo average — good." },
  ]},
  bud_Housing: { title: "Housing", body: [
    { h: "Target", t: "At or under 25% of take-home — Dave's hard cap. Mortgage/rent, taxes, insurance." },
    { h: "Last year (Jun)", t: "$1,750/mo. Flat vs. your 12-mo average." },
  ]},
  bud_Food: { title: "Food", body: [
    { h: "Target", t: "10–15%. Groceries plus dining. Scales with household size — for a family of 6, anchor a per-person number." },
    { h: "Last year (Jun)", t: "$2,250/mo avg. This month you're down ~11%." },
    { h: "Note", t: "Still over target — the biggest lever to free cash for the snowball." },
  ]},
  bud_Utilities: { title: "Utilities", body: [
    { h: "Target", t: "5–10%. Power, water, gas, internet, phone. Climate and home size move this." },
    { h: "Last year (Jun)", t: "$820/mo. About flat." },
  ]},
  bud_Transportation: { title: "Transportation", body: [
    { h: "Target", t: "~10%. Fuel, maintenance, insurance, any payments." },
    { h: "Last year (Jun)", t: "$560/mo. You're down ~11%." },
  ]},
  bud_Insurance: { title: "Insurance", body: [
    { h: "Target", t: "Varies. Life, disability, and any health not taken via payroll." },
    { h: "Last year (Jun)", t: "$600/mo. Flat." },
  ]},
  bud_Personal: { title: "Personal", body: [
    { h: "Target", t: "5–10%. Clothing, household goods, miscellaneous." },
    { h: "Last year (Jun)", t: "$760/mo. You're down ~8%." },
  ]},
  bud_Recreation: { title: "Recreation", body: [
    { h: "Target", t: "5–10%. Entertainment, eating out, fun. First to trim during debt payoff." },
    { h: "Last year (Jun)", t: "$640/mo. Down ~22% — good restraint during payoff." },
  ]},
};

const MILESTONES = [
  { date: "Aug 2026", label: "Discover paid off" },
  { date: "Nov 2026", label: "Bank of America paid off" },
  { date: "2027",     label: "$108,000 inflow", maybe: true },
  { date: "Jun 2027", label: "Wells Fargo paid off" },
  { date: "Aug 2029", label: "Nelnet paid off" },
  { date: "2029",     label: "All consumer debt gone" },
  { date: "Jul 2032", label: "Debt-free" },
  { date: "2035",     label: "Net worth $500k" },
  { date: "2045",     label: "Home paid off" },
  { date: "2049",     label: "Retirement · $5.2M" },
];

const NAV = [{ id: "home", label: "Home" }, { id: "reports", label: "Plan" }];

const ACCOUNTS = [
  { group: "Income", unit: "/mo", items: [
    { name: "Brittany — W-2", amt: 8750 }, { name: "Real estate agent", amt: 1500 },
    { name: "Spark delivery", amt: 600 }, { name: "Consulting", amt: 800 },
    { name: "Rent — 536 Overland", amt: 2535 }, { name: "Rent — 809 Randall", amt: 2000 },
  ]},
  { group: "Expenses", unit: "/mo", items: [
    { name: "Housing", amt: 1750 }, { name: "Food", amt: 2000 }, { name: "Utilities", amt: 850 },
    { name: "Transportation", amt: 500 }, { name: "Insurance", amt: 600 },
  ]},
  { group: "Assets", unit: "", items: [
    { name: "536 Overland", amt: 376000 }, { name: "809 Randall", amt: 301000 }, { name: "401k", amt: 12000 },
  ]},
  { group: "Liabilities", unit: "", items: [
    { name: "Discover", amt: 13424 }, { name: "Bank of America", amt: 7701 }, { name: "Wells Fargo", amt: 12817 },
    { name: "Marriott", amt: 35280 }, { name: "Affirm (small)", amt: 2148 }, { name: "Affirm (big)", amt: 7005 },
    { name: "First Community", amt: 10639 }, { name: "Federal student loans", amt: 143492 }, { name: "Nelnet", amt: 24807 },
    { name: "Mortgage — 536 Overland", amt: 340812 }, { name: "Mortgage — 809 Randall", amt: 226134 },
  ]},
];

const BANK = [
  { name: "Personal checking", amt: 2840, low: true },
  { name: "Business checking", amt: 6200 },
  { name: "Emergency savings", amt: 1000 },
];

const INCOME = [
  { name: "Brittany — net pay", amt: 5430 },
  { name: "Rent — 536 Overland", amt: 2535 },
  { name: "Rent — 809 Randall", amt: 2000 },
  { name: "Real estate agent", amt: 1500 },
  { name: "Spark + consulting", amt: 1400 },
];
const BUDGET = [
  { cat: "Giving", amt: 1085, target: 10 }, { cat: "Housing", amt: 1750, target: 25 },
  { cat: "Food", amt: 2000, target: 15 }, { cat: "Utilities", amt: 850, target: 10 },
  { cat: "Transportation", amt: 500, target: 10 }, { cat: "Insurance", amt: 600, target: 25 },
  { cat: "Personal", amt: 700, target: 10 }, { cat: "Recreation", amt: 500, target: 10 },
];

const REPORTS = ["Wealth strategy", "Budget", "Net worth", "Cash flow", "Debt payoff", "Business performance", "Real estate performance", "Emergency readiness", "Retirement readiness", "Education funding", "Insurance and risk assessment", "Estate readiness", "Tax position", "Where decisions land you", "What to do next"];

const fmt = (v) => "$" + Math.round(v).toLocaleString("en-US");

function Toggle({ on, onClick }) {
  return (
    <span onClick={onClick} style={{ width: 38, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${on ? C.black : C.grey3}`, background: on ? C.black : "transparent", position: "relative", cursor: "pointer", marginLeft: 12 }}>
      <span style={{ position: "absolute", top: 2.5, left: on ? 18 : 3, width: 14, height: 14, borderRadius: 4, background: on ? C.white : C.grey3, transition: "left .15s" }} />
    </span>
  );
}
function InfoDot({ onClick }) {
  return <span onClick={onClick} style={{ width: 18, height: 18, flexShrink: 0, borderRadius: "50%", border: `1.2px solid ${C.grey3}`, color: C.grey2, fontSize: 10, fontStyle: "italic", fontFamily: "Georgia, serif", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 8, verticalAlign: "middle" }}>i</span>;
}

function Waveform() {
  const bars = Array.from({ length: 30 });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 30 }}>
      <style>{"@keyframes tpWave{0%,100%{transform:scaleY(0.18)}50%{transform:scaleY(1)}}"}</style>
      {bars.map((_, i) => (
        <div key={i} style={{ width: 3, height: 26, borderRadius: 2, background: i % 2 ? C.grey2 : C.black, transformOrigin: "center", animation: `tpWave ${(0.7 + (i % 5) * 0.12).toFixed(2)}s ease-in-out ${(i * 0.05).toFixed(2)}s infinite` }} />
      ))}
    </div>
  );
}

function DevNote({ text, onMore }) {
  return (
    <div style={{ background: C.recessed, borderLeft: `2px solid ${C.grey3}`, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: C.grey2, marginBottom: 3 }}>Dev note</div>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: C.grey1 }}>{text}</div>
      </div>
      {onMore && <InfoDot onClick={onMore} />}
    </div>
  );
}

function RedDot({ onClick }) {
  return <span onClick={onClick} style={{ width: 9, height: 9, borderRadius: "50%", background: C.red, flexShrink: 0, display: "inline-block", cursor: onClick ? "pointer" : "default" }} />;
}

// ===== Lifestyle screens (merged from LifestyleVisual.jsx + LifestyleOnboarding.jsx) =====
// Each is fully self-contained: all helpers are local; only the shared palette C is reused.
function LifestyleVisualScreen() {
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

function LifestyleVisualInner() {
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
  return <LifestyleVisualInner />;
}

function LifestyleOnboardingScreen() {
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

        {/* LIFE VIEW (LifestyleVisual) */}
        {page === "lifeview" && (
          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}><LifestyleVisualScreen /></div>
        )}

        {/* LIFESTYLE PLAN (LifestyleOnboarding) */}
        {page === "lifestyleplan" && (
          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}><LifestyleOnboardingScreen /></div>
        )}
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

function LifestyleOnboardingInner() {
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
  return <LifestyleOnboardingInner />;
}

// ===== end lifestyle screens =====

export default function TeleportApp() {
  const [page, setPage] = useState("home");
  const [navOpen, setNavOpen] = useState(false);
  const [horizon, setHorizon] = useState(2);
  const [cashMode, setCashMode] = useState(false);
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState("month");
  const [checkedT, setCheckedT] = useState(() => JUNE_TASKS.map(() => false));
  const [checkedC, setCheckedC] = useState(() => CLOSEOUT.map(() => false));
  const [evtOn, setEvtOn] = useState(() => { const o = {}; MILESTONES.forEach((m, i) => { if (m.maybe) o[i] = false; }); return o; });
  const [info, setInfo] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [notif, setNotif] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [report, setReport] = useState(null);
  const [reportInfo, setReportInfo] = useState(false);
  const [doneSteps, setDoneSteps] = useState({});
  const [expandedSteps, setExpandedSteps] = useState({});
  const [printPreview, setPrintPreview] = useState(null);
  const toggleDone = (i) => setDoneSteps((s) => ({ ...s, [i]: !s[i] }));
  const toggleExpand = (i) => setExpandedSteps((s) => ({ ...s, [i]: !s[i] }));
  const [landH, setLandH] = useState(0);
  const [tool, setTool] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [debtMethod, setDebtMethod] = useState("snowball");
  const [onbOpen, setOnbOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMuted, setChatMuted] = useState(true);
  const [chatInfo, setChatInfo] = useState(false);
  const svgRef = useRef(null);

  const data = useMemo(() => generateData(HORIZONS[horizon].years), [horizon]);
  const month = useMemo(() => generateCashMonth(), []);
  const n = data.length, nM = month.length;
  const W = 360, H = 166, padL = 12, padR = 12, padT = 24, padB = 18;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const maxVal = useMemo(() => { let mx = 0; data.forEach((d) => SERIES.forEach((s) => { if (d[s.key] > mx) mx = d[s.key]; })); return mx * 1.06; }, [data]);
  const cashMax = useMemo(() => { let mx = 0; month.forEach((d) => { if (d.balance > mx) mx = d.balance; }); return mx * 1.1; }, [month]);
  const recMinCash = useMemo(() => { const minCum = Math.min(...month.map((d) => d.cum)); return Math.round((1000 - minCum) / 100) * 100; }, [month]);

  const N = cashMode ? nM : n;
  const xAt = (i) => padL + (i / (N - 1)) * plotW;
  const yAt = (v) => padT + plotH - (v / maxVal) * plotH;
  const yAtCash = (v) => padT + plotH - (v / cashMax) * plotH;

  const paths = useMemo(() => { const o = {}; SERIES.forEach((s) => { o[s.key] = data.map((d, i) => `${i === 0 ? "M" : "L"}${(padL + (i / (n - 1)) * plotW).toFixed(2)} ${yAt(d[s.key]).toFixed(2)}`).join(" "); }); return o; }, [data, maxVal]);
  const cashPath = useMemo(() => month.map((d, i) => `${i === 0 ? "M" : "L"}${(padL + (i / (nM - 1)) * plotW).toFixed(2)} ${yAtCash(d.balance).toFixed(2)}`).join(" "), [month, cashMax]);

  const ticks = useMemo(() => {
    if (cashMode) {
      return month.map((d, i) => ({ i, label: d.day })).filter((t) => [1, 8, 15, 22, 29].includes(t.label));
    }
    const out = [], seen = new Set(); const sy = Math.max(1, Math.round(HORIZONS[horizon].years / 5));
    data.forEach((d, i) => { if (d.month === 0 && !seen.has(d.year) && d.year % sy === 0) { seen.add(d.year); out.push({ i, label: d.year }); } });
    return out;
  }, [data, horizon, cashMode, month]);

  const handleMove = (e) => { const rect = svgRef.current.getBoundingClientRect(); const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; const f = ((px / rect.width) * W - padL) / plotW; let idx = Math.round(f * (N - 1)); idx = Math.max(0, Math.min(N - 1, idx)); setActive(idx); };
  const clear = () => setActive(null);
  const toggleT = (i) => setCheckedT((c) => c.map((v, j) => (j === i ? !v : v)));
  const toggleC = (i) => setCheckedC((c) => c.map((v, j) => (j === i ? !v : v)));
  const toggleEvt = (i) => setEvtOn((s) => ({ ...s, [i]: !s[i] }));
  const goto = (id) => { setPage(id); setNavOpen(false); };
  const isLifeScreen = page === "lifeview" || page === "lifestyleplan";

  const ad = active != null ? (cashMode ? month[active] : data[active]) : null;
  const tipFrac = active != null ? (padL + (active / (N - 1)) * plotW) / W : 0;
  const totalDone = checkedT.filter(Boolean).length + checkedC.filter(Boolean).length;
  const totalItems = JUNE_TASKS.length + CLOSEOUT.length;

  const incomeTotal = INCOME.reduce((s, x) => s + x.amt, 0);
  const spendTotal = BUDGET.reduce((s, x) => s + x.amt, 0);
  const surplus = incomeTotal - spendTotal;
  const assetItems = [...ACCOUNTS.find((g) => g.group === "Assets").items, ...BANK];
  const liabItems = ACCOUNTS.find((g) => g.group === "Liabilities").items;
  const assetsTotal = assetItems.reduce((s, x) => s + x.amt, 0);
  const liabsTotal = liabItems.reduce((s, x) => s + x.amt, 0);
  const netWorthVal = assetsTotal - liabsTotal;
  const REPORT_INFO = { "Wealth strategy": "The sequence in order — bold is where you are now.", "Accounts": "Everything you own and owe.", "Budget": "Money in, spending against targets, and what's left.", "Real estate": "Your two rentals — values, equity, and cash flow.", "Debt payoff": "Pick snowball or avalanche; the order and timeline update.", "Lifestyle plan": "Future goals with a target amount and date.", "Education funding": "How much you'll cover per child.", "Investment waterfall": "The order new money invests once debt-free.", "Net worth": "Everything you own minus everything you owe, over three years.", "Cash flow": "Where the money moves each month, and when.", "Business performance": "What each income stream earns and costs.", "Emergency readiness": "Your safety net and when it's funded.", "Insurance and risk assessment": "Recommended coverage vs. what you carry.", "Estate readiness": "Wills, directives, and who's protected.", "Tax position": "Last year, and what to fix this year.", "Where decisions land you": "Where the plan takes you at 3 / 10 / retirement.", "What to do next": "Your action plan, in priority order." };

  // ===== plan models =====
  const PLAN_INPUTS = ["Wealth strategy", "Accounts", "Budget", "Real estate", "Debt payoff", "Lifestyle plan", "Education funding", "Investment waterfall"];
  const PLAN_REPORTS = ["Net worth", "Cash flow", "Business performance", "Emergency readiness", "Insurance and risk assessment", "Estate readiness", "Tax position", "Where decisions land you", "What to do next"];
  const RL = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid " + C.quiet };
  const EB = { fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2 };
  const SUB = { fontSize: 14, lineHeight: 1.5, color: C.grey1, marginBottom: 18 };
  const nw3 = (() => { let prop = 376000 + 301000; const other = 12000 + 2840 + 6200 + 1000; let liab = liabsTotal; const pay = 46000; const out = []; for (let y = 0; y < 3; y++) { const a = Math.round(prop + other); out.push({ year: 2026 + y, assets: a, liab: Math.round(liab), nw: Math.round(a - liab) }); prop *= 1.03; liab = Math.max(0, liab - pay); } return out; })();
  const DEBTS = [ { name: "Affirm 1", bal: 2148, apr: 10 }, { name: "Affirm 2", bal: 7005, apr: 10 }, { name: "Bank of America", bal: 7701, apr: 17.49 }, { name: "First Community", bal: 10639, apr: 8.99 }, { name: "Wells Fargo", bal: 12817, apr: 30 }, { name: "Discover", bal: 13424, apr: 15.49 }, { name: "Nelnet", bal: 24807, apr: 6.5 }, { name: "Marriott", bal: 35280, apr: 19.49 }, { name: "Federal student loans", bal: 143492, apr: 6 } ];
  const SNOW_MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const orderFor = (method) => [...DEBTS].sort((a, b) => method === "avalanche" ? b.apr - a.apr : a.bal - b.bal);
  const simDebt = (ordered) => { const pool = 4600; let bs = ordered.map((d) => d.bal); const rows = ordered.map(() => []); for (let m = 0; m < 12; m++) { let p = pool; for (let i = 0; i < bs.length && p > 0; i++) { if (bs[i] > 0) { const pay = Math.min(bs[i], p); bs[i] -= pay; p -= pay; } } bs.forEach((b, i) => rows[i].push(Math.round(b))); } return rows; };
  const BUSINESS = [ { name: "536 Overland (rent)", inc: 2535, exp: 2050 }, { name: "809 Randall (rent)", inc: 2000, exp: 1430 }, { name: "Real estate agent", inc: 1500, exp: 300 }, { name: "Spark delivery", inc: 600, exp: 210 }, { name: "Consulting", inc: 800, exp: 60 } ];
  const RENTALS = [ { name: "536 Overland", value: 376000, lastValue: 358000, mortgage: 340812, rent: 2535, exp: 2050, action: "Cash flow is thin — review rent vs. market at renewal." }, { name: "809 Randall", value: 301000, lastValue: 287000, mortgage: 226134, rent: 2000, exp: 1430, action: "Strong equity. Keep the 3.63% loan — don’t refinance." } ];
  const INS = [ { t: "Term life", rec: "10–12× income", cur: "Minimal", st: "Gap" }, { t: "Long-term disability", rec: "Yes", cur: "Voluntary LTD", st: "OK" }, { t: "Short-term disability", rec: "Not needed w/ fund", cur: "$50.90/period", st: "Cancel" }, { t: "Health", rec: "Required", cur: "Aqua (pre-tax)", st: "OK" }, { t: "Auto", rec: "Required", cur: "In force", st: "Verify" }, { t: "Landlord / home", rec: "Required", cur: "In force", st: "OK" }, { t: "Umbrella", rec: "As wealth grows", cur: "None", st: "Later" }, { t: "Will & guardianship", rec: "Now (4 kids)", cur: "None", st: "Gap" } ];
  const NEXT = [ { t: "Give 10% of your income", w: "This month" }, { t: "Update Brittany’s W-4 to stop over-withholding", w: "This month", flag: true }, { t: "Pause Brittany’s 401k and aim it at debt", w: "This month", flag: true }, { t: "Confirm the $1,000 starter fund is set", w: "This month" }, { t: "Throw all surplus at the smallest balance", w: "Payday" }, { t: "Get term life + a basic will & guardianship", w: "This month" }, { t: "Cancel short-term disability once the fund covers 90 days", w: "Soon" } ];
  const LAND = [ { tag: "3 years", year: "2029", nw: "+$60k", items: ["Consumer debt gone", "Emergency fund fully funded", "Investing restarted at 15%"], budget: "Surplus ~$2,800/mo → emergency fund, then investing" }, { tag: "10 years", year: "2036", nw: "$520k", items: ["Debt-free except the homes", "15% to retirement every month", "Kids’ education funding underway"], budget: "Surplus → investing + education" }, { tag: "Retirement", year: "2049", nw: "$5.2M", items: ["Homes paid off (2045)", "Giving generously", "Legacy plan in place"], budget: "Living on a fraction; the rest compounds & gives" } ];
  const EST = [ { t: "Will", cur: "None", st: "Gap" }, { t: "Guardianship for kids", cur: "None", st: "Gap" }, { t: "Financial power of attorney", cur: "None", st: "Gap" }, { t: "Medical directive / POA", cur: "None", st: "Gap" }, { t: "Beneficiaries up to date", cur: "Verify", st: "Check" }, { t: "Term life in place", cur: "See Insurance", st: "Linked" } ];
  const LIFE = [ { g: "Family trip (Disney)", amt: 8000, when: "2028" }, { g: "Replace Brittany’s SUV", amt: 28000, when: "2030" }, { g: "Kitchen remodel", amt: 40000, when: "2032" }, { g: "Lake property fund", amt: 60000, when: "2038" } ];
  const KIDS = [ { n: "Child 1", grad: 2031 }, { n: "Child 2", grad: 2033 }, { n: "Child 3", grad: 2036 }, { n: "Child 4", grad: 2039 } ];
  const WATERFALL = [ { t: "401k — up to the match", d: "Free money first. Never leave the match on the table." }, { t: "HSA (if eligible)", d: "Triple tax-advantaged; doubles as a health buffer." }, { t: "Roth IRA — each spouse", d: "Tax-free growth while income is moderate." }, { t: "401k — up to 15% of income", d: "Fill to the retirement target." }, { t: "Taxable / extra on the mortgage", d: "Overflow once tax-advantaged space is full." } ];
  const ActionItem = ({ children }) => (<div style={{ marginTop: 24 }}><div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, marginBottom: 5 }}>Action</div><div style={{ fontSize: 14, lineHeight: 1.6, color: C.black }}>{children}</div></div>);
  const Editable = () => (<span style={{ fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: C.grey3, border: "1px solid " + C.quiet, borderRadius: 4, padding: "2px 6px" }}>You set this</span>);

  const reportBody = (name) => {
    if (name === "Wealth strategy") return (<><div style={SUB}>Your path to wealth, in order — one step at a time.</div>{SEQUENCE.map((s, i) => { const dn = doneSteps[i]; return (<div key={i} style={{ borderBottom: "1px solid " + C.quiet }}><div onClick={() => toggleExpand(i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", cursor: "pointer" }}><span onClick={(e) => { e.stopPropagation(); toggleDone(i); }} style={{ width: 24, height: 24, borderRadius: "50%", border: dn ? "none" : "1.5px solid " + (s.current ? C.black : C.grey3), background: dn ? C.black : "transparent", color: dn ? C.white : (s.current ? C.black : C.grey3), fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{dn ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2 L5 8.5 L9.5 3.2" fill="none" stroke={C.white} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> : (i + 1)}</span><span style={{ flex: 1, fontSize: 15, color: dn ? C.grey3 : (s.current ? C.black : C.grey1), fontWeight: s.current && !dn ? 600 : 400, textDecoration: dn ? "line-through" : "none" }}>{s.step}</span>{s.current && !dn && <RedDot />}<span style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3, whiteSpace: "nowrap" }}>{s.when}</span></div>{expandedSteps[i] && (<div style={{ paddingLeft: 38, paddingBottom: 14, fontSize: 13, lineHeight: 1.5, color: C.grey2 }}>{s.helper}</div>)}</div>); })}<div style={{ marginTop: 14, fontSize: 12, color: C.grey3, lineHeight: 1.5 }}>Tap a step to read it. Tap the number to mark it done.</div></>);
    if (name === "Real estate") { const Row = (label, fn) => (<div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", padding: "10px 0", borderBottom: "1px solid " + C.quiet, alignItems: "center" }}><span style={{ fontSize: 12, color: C.grey2 }}>{label}</span>{RENTALS.map((r, i) => (<span key={i} style={{ textAlign: "right", fontSize: 13, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fn(r)}</span>))}</div>); return (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={SUB}>Your two rentals, side by side.</span></div><div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", borderBottom: "1px solid " + C.black, paddingBottom: 8 }}><span></span>{RENTALS.map((r, i) => (<span key={i} style={{ ...EB, fontSize: 10, textAlign: "right" }}>{r.name}</span>))}</div>{Row("Value", (r) => fmt(r.value))}{Row("vs. last year", (r) => "+" + fmt(r.value - r.lastValue))}{Row("Mortgage", (r) => fmt(r.mortgage))}{Row("Equity", (r) => fmt(r.value - r.mortgage))}{Row("Rent / mo", (r) => fmt(r.rent))}{Row("Expenses / mo", (r) => fmt(r.exp))}{Row("Net / mo", (r) => fmt(r.rent - r.exp))}<div style={{ ...EB, margin: "22px 0 8px" }}>Action items</div>{RENTALS.map((r, i) => (<div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ fontSize: 12, fontWeight: 600, color: C.black, whiteSpace: "nowrap" }}>{r.name}</span><span style={{ fontSize: 13, color: C.grey1 }}>{r.action}</span></div>))}</>); }
    if (name === "Debt payoff") { const ordered = orderFor(debtMethod); const rows = simDebt(ordered); return (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontSize: 14, color: C.grey1 }}>Choose how you attack the debt.</span></div><div style={{ display: "flex", gap: 8, marginBottom: 18 }}>{[["snowball", "Snowball", "Smallest first"], ["avalanche", "Avalanche", "Highest rate first"]].map(([id, label, sublbl]) => (<div key={id} onClick={() => setDebtMethod(id)} style={{ flex: 1, border: "1px solid " + (debtMethod === id ? C.black : C.quiet), background: debtMethod === id ? C.black : "transparent", borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}><div style={{ fontSize: 14, fontWeight: 600, color: debtMethod === id ? C.white : C.black }}>{label}</div><div style={{ fontSize: 11, color: debtMethod === id ? C.grey3 : C.grey2, marginTop: 2 }}>{sublbl}</div></div>))}</div><div style={{ ...EB, marginBottom: 6 }}>Attack order</div><div style={{ height: 1, background: C.black }} />{ordered.map((d, i) => (<div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? C.red : C.grey3, width: 14 }}>{i + 1}</span><span style={{ flex: 1, fontSize: 14, color: C.black }}>{d.name}</span><span style={{ fontSize: 12, color: C.grey3, fontVariantNumeric: "tabular-nums" }}>{fmt(d.bal)} · {d.apr}%</span></div>))}<div style={{ ...EB, margin: "22px 0 6px" }}>Next 12 months</div><div style={{ overflowX: "auto", margin: "0 -22px", padding: "0 22px" }}><table style={{ borderCollapse: "collapse", fontSize: 11, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}><thead><tr><th style={{ textAlign: "left", padding: "0 10px 8px 0" }}></th>{SNOW_MONTHS.map((m, j) => (<th key={j} style={{ textAlign: "right", padding: "0 8px 8px", color: C.grey2, fontWeight: 600 }}>{m}</th>))}</tr></thead><tbody>{ordered.map((d, i) => (<tr key={i} style={{ borderTop: "1px solid " + C.quiet }}><td style={{ textAlign: "left", padding: "8px 10px 8px 0", color: C.black }}>{d.name}</td>{rows[i].map((b, j) => (<td key={j} style={{ textAlign: "right", padding: "8px", color: b === 0 ? C.grey3 : C.black }}>{b === 0 ? "—" : fmt(b)}</td>))}</tr>))}</tbody></table></div><div style={{ marginTop: 12, fontSize: 11, color: C.grey3, lineHeight: 1.5 }}>Balances at month-end, principal-only. Snowball builds momentum; avalanche saves the most interest.</div><ActionItem>This month: every extra dollar to <b>{ordered[0].name} ({fmt(ordered[0].bal)})</b>.</ActionItem></>); }
    if (name === "Lifestyle plan") { const CATS = [{ cat: "Home", prompt: "A remodel, a bigger place, or a second home.", goals: [{ g: "Kitchen remodel", amt: 40000, when: "2032" }, { g: "Lake property fund", amt: 60000, when: "2038" }] }, { cat: "Travel & experiences", prompt: "Bigger trips and bucket-list time with the family.", goals: [{ g: "Family trip (Disney)", amt: 8000, when: "2028" }] }, { cat: "Vehicles", prompt: "Replace an aging car — or an upgrade.", goals: [{ g: "Replace Brittany’s SUV", amt: 28000, when: "2030" }] }, { cat: "Furniture & home goods", prompt: "Finish the rooms you’ve been putting off.", goals: [] }, { cat: "Giving", prompt: "Give beyond the tithe — causes you believe in.", goals: [] }, { cat: "Family & kids", prompt: "Activities, experiences, and helping them launch.", goals: [] }, { cat: "Health & wellness", prompt: "Training, better food, taking care of yourselves.", goals: [] }, { cat: "Recreation & hobbies", prompt: "The fun stuff — toys, gear, time off.", goals: [] }, ]; return (<><div style={SUB}>When there’s margin, what changes? Think it through by category — add what matters, skip what doesn’t.</div>{CATS.map((c2, ci) => (<div key={ci} style={{ marginBottom: 24 }}><div style={{ fontSize: 15, fontWeight: 600, color: C.black, marginBottom: 2 }}>{c2.cat}</div><div style={{ fontSize: 13, color: C.grey2, marginBottom: 8 }}>{c2.prompt}</div><div style={{ height: 1, background: C.quiet }} />{c2.goals.map((g, gi) => (<div key={gi} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ fontSize: 14, color: C.black }}>{g.g}</span><span style={{ display: "flex", gap: 12, alignItems: "baseline" }}><span style={{ fontSize: 14, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(g.amt)}</span><span style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3 }}>{g.when}</span></span></div>))}<div style={{ fontSize: 13, color: C.grey3, padding: "9px 0", cursor: "pointer" }}>+ Add to {c2.cat.toLowerCase()}</div></div>))}</>); }
    if (name === "Education funding") return (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontSize: 14, color: C.grey1 }}>Decide how much to cover per child.</span></div>{KIDS.map((x, i) => (<div key={i} style={RL}><span style={{ fontSize: 15, color: C.black }}>{x.n}</span><span style={{ display: "flex", gap: 12, alignItems: "baseline" }}><span style={{ fontSize: 13, color: C.grey3 }}>Goal not set</span><span style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3 }}>Grad {x.grad}</span></span></div>))}<div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: C.grey1 }}>Cover a state school in full, match dollar-for-dollar, a fixed amount each, or <b style={{ color: C.black }}>nothing</b> — all valid. There are loans for college, none for retirement, so this comes after investing.</div><ActionItem>Set a goal per child once you reach the education step.</ActionItem></>);
    if (name === "Investment waterfall") return (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontSize: 14, color: C.grey1 }}>Where new money flows once you’re debt-free.</span></div>{WATERFALL.map((x, i) => (<div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ fontSize: 12, fontWeight: 700, color: C.grey3, width: 14, paddingTop: 1 }}>{i + 1}</span><div><div style={{ fontSize: 15, color: C.black }}>{x.t}</div><div style={{ fontSize: 13, color: C.grey2, marginTop: 2 }}>{x.d}</div></div></div>))}<ActionItem>Confirm Brittany’s 401k match rate at ADP so step 1 is sized correctly.</ActionItem></>);
    if (name === "Net worth") return (<><div style={SUB}>What you own minus what you owe — and where it heads over three years.</div><div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", borderBottom: "1px solid " + C.black, paddingBottom: 8 }}><span></span>{nw3.map((r) => (<span key={r.year} style={{ ...EB, textAlign: "right" }}>{r.year}</span>))}</div>{[["Assets", "assets"], ["Liabilities", "liab"], ["Net worth", "nw"]].map(([label, key]) => (<div key={label} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "12px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ fontSize: 14, color: C.black, fontWeight: key === "nw" ? 600 : 400 }}>{label}</span>{nw3.map((r) => (<span key={r.year} style={{ textAlign: "right", fontSize: 13, fontVariantNumeric: "tabular-nums", color: key === "nw" && r[key] < 0 ? C.red : C.black, fontWeight: key === "nw" ? 600 : 400 }}>{fmt(r[key])}</span>))}</div>))}<div style={{ ...EB, margin: "26px 0 6px" }}>Today’s detail</div><div style={{ height: 1, background: C.black }} />{assetItems.map((it) => (<div key={it.name} style={RL}><span style={{ fontSize: 13, color: C.grey1 }}>{it.name}</span><span style={{ fontSize: 13, color: C.grey1, fontVariantNumeric: "tabular-nums" }}>{fmt(it.amt)}</span></div>))}{liabItems.map((it) => (<div key={it.name} style={RL}><span style={{ fontSize: 13, color: C.grey1 }}>{it.name}</span><span style={{ fontSize: 13, color: C.grey1, fontVariantNumeric: "tabular-nums" }}>-{fmt(it.amt)}</span></div>))}<ActionItem>Net worth crosses into positive around 2028 as the debt falls. The snowball is the single biggest lever.</ActionItem></>);
    if (name === "Cash flow") return (<><div style={SUB}>Where the money actually moves each month — and when.</div><div style={{ ...EB, marginBottom: 4 }}>In</div><div style={{ height: 1, background: C.black }} />{INCOME.map((it) => (<div key={it.name} style={RL}><span style={{ fontSize: 14, color: C.black }}>{it.name}</span><span style={{ fontSize: 14, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(it.amt)}</span></div>))}<div style={{ ...RL, borderBottom: "none" }}><span style={{ fontSize: 14, fontWeight: 700 }}>Total in</span><span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(incomeTotal)}</span></div><div style={{ ...EB, margin: "20px 0 4px" }}>Out</div><div style={{ height: 1, background: C.black }} /><div style={RL}><span style={{ fontSize: 14, color: C.black }}>Living + bills</span><span style={{ fontSize: 14, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(spendTotal)}</span></div><div style={{ ...RL, borderBottom: "none" }}><span style={{ fontSize: 14, fontWeight: 700 }}>Left over</span><span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(surplus)}</span></div><div style={{ marginTop: 18, fontSize: 13, lineHeight: 1.6, color: C.grey2 }}>Rent and big bills hit on the <b style={{ color: C.black }}>1st</b>; rentals land around the <b style={{ color: C.black }}>7th</b>; Brittany’s pay arrives the <b style={{ color: C.black }}>12th & 26th</b>. The daily view on Home shows the dips.</div><ActionItem>Keep about <b>{fmt(4500)}</b> in checking so the 1st never overdraws before income lands.</ActionItem></>);
    if (name === "Business performance") { const ti = BUSINESS.reduce((s, x) => s + x.inc, 0); const te = BUSINESS.reduce((s, x) => s + x.exp, 0); return (<><div style={SUB}>What each stream earns, what it costs to run, and what’s left.</div><div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", borderBottom: "1px solid " + C.black, paddingBottom: 8 }}>{["Stream", "In", "Cost", "Net"].map((h, i) => (<span key={i} style={{ ...EB, fontSize: 10, textAlign: i === 0 ? "left" : "right" }}>{h}</span>))}</div>{BUSINESS.map((x, i) => { const n = x.inc - x.exp; return (<div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: "11px 0", borderBottom: "1px solid " + C.quiet, alignItems: "center" }}><span style={{ fontSize: 13, color: C.black }}>{x.name}</span><span style={{ textAlign: "right", fontSize: 13, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(x.inc)}</span><span style={{ textAlign: "right", fontSize: 13, color: C.grey2, fontVariantNumeric: "tabular-nums" }}>{fmt(x.exp)}</span><span style={{ textAlign: "right", fontSize: 13, color: n < 250 ? C.red : C.black, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmt(n)}</span></div>); })}<div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: "12px 0", borderTop: "2px solid " + C.black }}><span style={{ fontSize: 13, fontWeight: 700 }}>Total / mo</span><span style={{ textAlign: "right", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(ti)}</span><span style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: C.grey2, fontVariantNumeric: "tabular-nums" }}>{fmt(te)}</span><span style={{ textAlign: "right", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(ti - te)}</span></div><ActionItem>536 Overland barely clears each month. Your biggest lever is rent at renewal.</ActionItem></>); }
    if (name === "Emergency readiness") { const m3 = spendTotal * 3, m6 = spendTotal * 6; return (<><div style={SUB}>Your safety net — built in two stages.</div><div style={RL}><span style={{ fontSize: 14, color: C.black }}>Starter fund ($1,000)</span><span style={{ fontSize: 12, color: C.grey3 }}>Done ✓</span></div><div style={{ ...RL, borderBottom: "none" }}><span style={{ fontSize: 14, color: C.black }}>Full fund (3–6 months)</span><span style={{ fontSize: 13, color: C.grey2, fontVariantNumeric: "tabular-nums" }}>{fmt(m3)} – {fmt(m6)}</span></div><div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: C.grey1 }}>The $1,000 starter is in place. The full 3–6 month fund comes <b style={{ color: C.black }}>after the last debt is gone</b> — you’ll redirect the entire snowball into it. Estimated complete: <b style={{ color: C.black }}>2032</b>.</div><ActionItem>Nothing to do here yet — keep attacking debt. The fund is the next milestone after debt-free.</ActionItem></>); }
    if (name === "Insurance and risk assessment") { const sc = (s) => s === "Gap" ? C.red : (s === "Cancel" || s === "Verify") ? C.black : C.grey3; return (<><div style={SUB}>What’s recommended, what you carry, and where the gaps are.</div><div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.1fr 1fr 0.7fr", borderBottom: "1px solid " + C.black, paddingBottom: 8 }}>{["Coverage", "Recommended", "Current", "Status"].map((h, i) => (<span key={i} style={{ ...EB, fontSize: 10, textAlign: i === 3 ? "right" : "left" }}>{h}</span>))}</div>{INS.map((x, i) => (<div key={i} style={{ display: "grid", gridTemplateColumns: "1.3fr 1.1fr 1fr 0.7fr", padding: "10px 0", borderBottom: "1px solid " + C.quiet, alignItems: "center" }}><span style={{ fontSize: 13, color: C.black }}>{x.t}</span><span style={{ fontSize: 12, color: C.grey2 }}>{x.rec}</span><span style={{ fontSize: 12, color: C.grey2 }}>{x.cur}</span><span style={{ fontSize: 12, textAlign: "right", color: sc(x.st), fontWeight: x.st === "Gap" ? 600 : 400 }}>{x.st}</span></div>))}<ActionItem>Biggest gaps: <b>term life</b> and a <b>will</b>. Both are cheap and fast — handle this month.</ActionItem></>); }
    if (name === "Estate readiness") return (<><div style={SUB}>Wills, directives, and who’s protected if something happens.</div>{EST.map((x, i) => (<div key={i} style={RL}><span style={{ fontSize: 14, color: C.black }}>{x.t}</span><span style={{ fontSize: 13, color: x.st === "Gap" ? C.red : C.grey2, fontWeight: x.st === "Gap" ? 600 : 400 }}>{x.cur}</span></div>))}<ActionItem>With four kids, a <b>will naming guardians</b> is the single most important document. Start there.</ActionItem></>);
    if (name === "Tax position") return (<><div style={SUB}>Last year, and the one change that frees up real money.</div><div style={RL}><span style={{ fontSize: 14, color: C.black }}>Last refund</span><span style={{ fontSize: 14, color: C.black, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>~{fmt(13000)}</span></div><div style={RL}><span style={{ fontSize: 14, color: C.black }}>That’s per month</span><span style={{ fontSize: 14, color: C.red, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>~{fmt(1083)}</span></div><div style={{ ...RL, borderBottom: "none" }}><span style={{ fontSize: 14, color: C.black }}>Fix</span><span style={{ fontSize: 14, color: C.black }}>W-4 (claim dependents)</span></div><div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: C.grey1 }}>A big refund feels good, but it’s an interest-free loan to the IRS. Adjusting Brittany’s W-4 keeps that <b style={{ color: C.black }}>~$1,083/month</b> in your pocket — straight into the snowball.</div><ActionItem>Update Brittany’s W-4 to stop the ~$13k over-withholding.</ActionItem></>);
    if (name === "Where decisions land you") { const L = LAND[landH]; return (<><div style={SUB}>Stick to the plan, and here’s where it lands you.</div><div style={{ display: "flex", gap: 18, marginBottom: 20 }}>{LAND.map((x, i) => (<span key={i} onClick={() => setLandH(i)} style={{ fontSize: 13, cursor: "pointer", fontWeight: i === landH ? 700 : 400, color: i === landH ? C.black : C.grey3, textDecoration: i === landH ? "underline" : "none", textUnderlineOffset: 5 }}>{x.tag}</span>))}</div><div style={{ ...EB, marginBottom: 4 }}>{L.tag} · {L.year}</div><div style={{ fontSize: 34, fontWeight: 700, color: C.black, marginBottom: 16 }}>{L.nw}</div><div style={{ ...EB, marginBottom: 8 }}>What you’ll have accomplished</div>{L.items.map((t, i) => (<div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ color: C.grey3 }}>—</span><span style={{ fontSize: 14, color: C.black }}>{t}</span></div>))}<div style={{ marginTop: 18, fontSize: 13, color: C.grey2, lineHeight: 1.5 }}><b style={{ color: C.black }}>Budget:</b> {L.budget}</div></>); }
    if (name === "What to do next") return (<><div style={SUB}>Your action plan, in priority order. This is what shows up on your home screen.</div>{NEXT.map((x, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid " + C.quiet }}><span style={{ fontSize: 12, fontWeight: 700, color: C.grey3, width: 16 }}>{i + 1}</span><span style={{ flex: 1, fontSize: 14, color: C.black }}>{x.t}</span>{x.flag && <RedDot />}<span style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3, whiteSpace: "nowrap" }}>{x.w}</span></div>))}</>);
    return (<div style={{ fontSize: 14, lineHeight: 1.6, color: C.grey2, paddingTop: 8 }}>This section is being built.</div>);
  };

  const ALLOC = [{ name: "Discover — snowball", amt: surplus - 500 }, { name: "$1,000 starter top-up", amt: 500 }];

  const Amt = ({ v, bold }) => (<span style={{ width: 88, textAlign: "right", fontSize: 15, color: C.black, fontVariantNumeric: "tabular-nums", fontWeight: bold ? 600 : 400 }}>{fmt(v)}</span>);

  const stickyTabs = (
    <div style={{ position: "sticky", top: 0, zIndex: 5, background: C.paper }}>
      <div style={{ height: 1, background: C.quiet }} />
      <div style={{ display: "flex", padding: "16px 22px 0" }}>
        {[{ id: "steps", label: "Steps" }, { id: "month", label: "June '27" }, { id: "timeline", label: "Timeline" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, textAlign: "center", background: "none", border: "none", padding: "0 0 12px", cursor: "pointer", fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? C.black : C.grey3, borderBottom: tab === t.id ? `2px solid ${C.black}` : "2px solid transparent" }}>{t.label}</button>
        ))}
      </div>
      <div style={{ height: 1, background: C.black }} />
    </div>
  );

  const sectionHead = (label, right) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2 }}>{label}</span>
      {right && <span style={{ fontSize: 10, color: C.grey3 }}>{right}</span>}
    </div>
  );

  return (
    <div style={{ background: C.recessed, height: "100vh", display: "flex", justifyContent: "center", fontFamily: "-apple-system, Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      <div style={{ width: "100%", maxWidth: 412, background: C.paper, height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 16px", flexShrink: 0 }}>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: C.black }}>Teleport</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => setSettingsOpen(true)} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <img src={BRITTANY} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.paper}`, marginRight: -10 }} />
              <img src={AVATAR} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.paper}` }} />
              <span style={{ marginLeft: 7, fontSize: 13, fontWeight: 600, color: C.grey2 }}>+4</span>
            </div>
            <div onClick={() => setNavOpen(true)} style={{ width: 24, cursor: "pointer", padding: 4, margin: -4 }}>
              <div style={{ height: 2, background: C.black, marginBottom: 5 }} />
              <div style={{ height: 2, background: C.black, marginBottom: 5 }} />
              <div style={{ height: 2, background: C.black }} />
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: C.quiet, flexShrink: 0 }} />

        {/* HOME */}
        {page === "home" && (
          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ position: "relative", padding: "18px 14px 4px" }}>
              {cashMode && (<div style={{ position: "absolute", top: 18, left: 18, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey2 }}>Cash balance · June 2026</div>)}
              <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: "crosshair" }}
                onMouseMove={handleMove} onMouseLeave={clear} onTouchStart={handleMove} onTouchMove={handleMove} onTouchEnd={clear}>
                <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={C.black} strokeWidth="1" />
                {cashMode ? (<>
                  <line x1={padL} y1={yAtCash(1000)} x2={W - padR} y2={yAtCash(1000)} stroke={C.grey3} strokeWidth="1" strokeDasharray="2 4" />
                  <path d={cashPath} fill="none" stroke={C.black} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </>) : (SERIES.map((s) => (<path key={s.key} d={paths[s.key]} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round" />)))}
                {ad && (<>
                  <line x1={xAt(active)} y1={padT - 6} x2={xAt(active)} y2={padT + plotH} stroke={C.grey3} strokeWidth="1" />
                  {cashMode ? <circle cx={xAt(active)} cy={yAtCash(ad.balance)} r="3" fill={C.black} /> : SERIES.map((s) => (<circle key={s.key} cx={xAt(active)} cy={yAt(ad[s.key])} r="3" fill={s.key === "debt" ? C.red : C.black} />))}
                </>)}
                {ticks.map((t) => (<text key={t.label} x={xAt(t.i)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.grey3} fontFamily="Helvetica, Arial, sans-serif">{cashMode ? "Jun " + t.label : t.label}</text>))}
              </svg>
              {ad && (
                <div style={{ position: "absolute", top: 6, left: `${tipFrac * 100}%`, transform: `translateX(${tipFrac > 0.6 ? "-100%" : tipFrac < 0.4 ? "0%" : "-50%"})`, background: C.white, border: `1px solid ${C.black}`, padding: "9px 11px", minWidth: 170, pointerEvents: "none", zIndex: 2 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.black, letterSpacing: 0.3, marginBottom: 7 }}>{cashMode ? "Jun " + ad.day : MONTHS[ad.month] + " " + ad.year}</div>
                  {cashMode ? (<>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 11, color: C.grey2 }}>Cash balance</span><span style={{ fontSize: 11, color: ad.balance < 1000 ? C.red : C.black, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{fmt(ad.balance)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: C.grey2 }}>Keep today</span><span style={{ fontSize: 11, color: C.black, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{fmt(recMinCash)}</span></div>
                  </>) : (SERIES.map((s) => (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}><svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} /></svg><span style={{ fontSize: 11, color: C.grey2 }}>{s.label}</span></span>
                      <span style={{ fontSize: 11, color: C.black, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{fmt(ad[s.key])}</span>
                    </div>
                  )))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 22px 18px" }}>
              <button onClick={() => { setCashMode(!cashMode); setActive(null); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, letterSpacing: 0.5, fontWeight: cashMode ? 700 : 400, color: cashMode ? C.black : C.grey3, textDecoration: cashMode ? "underline" : "none", textUnderlineOffset: 5 }}>Cash</button>
              {cashMode ? (
                <span style={{ fontSize: 12, letterSpacing: 0.5, color: C.grey3 }}>June 2026</span>
              ) : (
                <div style={{ display: "flex", gap: 22 }}>
                  {HORIZONS.map((h, i) => (<button key={h.label} onClick={() => { setHorizon(i); setActive(null); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, letterSpacing: 0.5, fontWeight: i === horizon ? 700 : 400, color: i === horizon ? C.black : C.grey3, textDecoration: i === horizon ? "underline" : "none", textUnderlineOffset: 5 }}>{h.label}</button>))}
                </div>
              )}
            </div>

            {stickyTabs}

            {tab === "month" ? (
              <div style={{ padding: "18px 22px 40px" }}>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: C.grey1, marginBottom: 20 }}>
                  Follow the plan this month and you'll clear Baby Step 1 — your $1,000 starter fund — and move well into Baby Step 2, the debt payoff.
                </div>
                <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, marginBottom: 6 }}>To do</div>
                <div style={{ height: 1, background: C.black }} />
                {JUNE_TASKS.map((t, i) => (
                  <div key={t.id} onClick={() => toggleT(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.quiet}`, cursor: "pointer" }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 4, border: checkedT[i] ? "none" : `1.5px solid ${C.grey3}`, background: checkedT[i] ? C.black : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {checkedT[i] && (<svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.6 L4.4 8 L9 2.5" fill="none" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                    </span>
                    <span style={{ flex: 1, fontSize: 15, color: checkedT[i] ? C.grey3 : C.black, textDecoration: checkedT[i] ? "line-through" : "none" }}>{t.label}</span>
                    {t.priority && !checkedT[i] && <RedDot />}
                    <span style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3, whiteSpace: "nowrap" }}>{t.when}</span>
                    <InfoDot onClick={(e) => { e.stopPropagation(); setInfo(t.id); }} />
                  </div>
                ))}
                <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, margin: "30px 0 6px" }}>Month-end closeout</div>
                <div style={{ height: 1, background: C.black }} />
                {CLOSEOUT.map((t, i) => (
                  <div key={i} onClick={() => toggleC(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.quiet}`, cursor: "pointer" }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 4, border: checkedC[i] ? "none" : `1.5px solid ${C.grey3}`, background: checkedC[i] ? C.black : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {checkedC[i] && (<svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.6 L4.4 8 L9 2.5" fill="none" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                    </span>
                    <span style={{ flex: 1, fontSize: 15, color: checkedC[i] ? C.grey3 : C.black, textDecoration: checkedC[i] ? "line-through" : "none" }}>{t.label}</span>
                    <span style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3, whiteSpace: "nowrap" }}>{t.when}</span>
                    <InfoDot onClick={(e) => { e.stopPropagation(); setInfo(t.id); }} />
                  </div>
                ))}
                <div style={{ marginTop: 18, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: C.grey2 }}>{totalDone} of {totalItems} done</div>
              </div>
            ) : tab === "steps" ? (
              <div style={{ padding: "6px 22px 40px" }}>
                {SEQUENCE.map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${C.quiet}` }}>
                    <span style={{ fontSize: 15, color: row.current ? C.black : C.grey1, fontWeight: row.current ? 600 : 400 }}>{row.step}</span>
                    <span style={{ fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: row.current ? C.black : C.grey3, fontWeight: row.current ? 600 : 400, whiteSpace: "nowrap", marginLeft: 14 }}>{row.when}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "18px 22px 60px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.grey2 }}>On now · Step 2 · Pay off debt</span>
                  <span style={{ fontSize: 14, color: C.black, cursor: "pointer" }}>+ Add</span>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 5, top: 6, bottom: 12, width: 1, background: C.quiet }} />
                  {MILESTONES.map((mi, i) => {
                    const on = mi.maybe ? evtOn[i] : true;
                    return (
                      <div key={i} style={{ position: "relative", paddingLeft: 26, marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <div style={{ position: "absolute", left: 0, top: 4, width: 12, height: 12, borderRadius: "50%", background: on ? C.grey1 : C.paper, border: on ? "none" : `1.5px solid ${C.grey3}` }} />
                        <span style={{ flex: 1, fontSize: 15, color: on ? C.black : C.grey3 }}>{mi.label}</span>
                        <span style={{ fontSize: 10, letterSpacing: 0.9, textTransform: "uppercase", color: on ? C.grey2 : C.grey3, whiteSpace: "nowrap" }}>{mi.date}</span>
                        {mi.maybe && <Toggle on={on} onClick={() => toggleEvt(i)} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACCOUNTS */}
        {page === "accounts" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 50px" }}>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: C.grey1, marginBottom: 12 }}>
              Upload a few documents and we'll build most of this for you.
            </div>
            <DevNote text="~90% of the data populates from four docs: pay stub, bank statements, card & loan statements, and last year's tax return." onMore={() => setInfo("docs90")} />

            {/* Bank accounts — the detailed example, moved to top */}
            <div style={{ marginTop: 26, marginBottom: 30 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, display: "flex", alignItems: "center" }}>Bank accounts<InfoDot onClick={() => setInfo("bank_about")} /></span>
                <span onClick={() => { setUploadStep(0); setUploadOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey2 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16 V4" /><path d="M7 9 l5 -5 5 5" /><path d="M4 16 v3 a1 1 0 0 0 1 1 h14 a1 1 0 0 0 1 -1 v-3" /></svg>
                  Upload
                </span>
              </div>
              <div style={{ height: 1, background: C.black }} />
              {BANK.map((it) => (
                <div key={it.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  <span style={{ flex: 1, fontSize: 15, color: C.black }}>{it.name}</span>
                  {it.low && <RedDot onClick={() => setNotif(true)} />}
                  <span style={{ fontSize: 15, color: C.black, fontVariantNumeric: "tabular-nums" }}>{fmt(it.amt)}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 12, color: C.grey3, lineHeight: 1.5 }}>Upload a statement for each account — or ask Porter.</div>
            </div>

            {ACCOUNTS.map((g) => (
              <div key={g.group} style={{ marginBottom: 30 }}>
                {sectionHead(g.group, g.unit)}
                <div style={{ height: 1, background: C.black }} />
                {g.items.map((it) => (
                  <div key={it.name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                    <span style={{ fontSize: 15, color: C.black }}>{it.name}</span>
                    <Amt v={it.amt} />
                  </div>
                ))}
              </div>
            ))}
            <div onClick={() => goto("budget")} style={{ marginTop: 26, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, cursor: "pointer" }}><span style={{ fontSize: 14, fontWeight: 600, color: C.black }}>Next: Budget</span><span style={{ fontSize: 16, color: C.black }}>›</span></div>
          </div>
        )}

        {/* BUDGET */}
        {page === "budget" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 50px" }}>
            {/* income */}
            {sectionHead("Income this month", "/mo")}
            <div style={{ height: 1, background: C.black }} />
            {INCOME.map((it) => (
              <div key={it.name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                <span style={{ fontSize: 15, color: C.black }}>{it.name}</span>
                <Amt v={it.amt} />
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
              <span style={{ fontSize: 15, color: C.black, fontWeight: 600 }}>Total in</span>
              <Amt v={incomeTotal} bold />
            </div>

            {/* spending */}
            <div style={{ marginTop: 26 }} />
            {sectionHead("Spending", "% / target")}
            <div style={{ height: 1, background: C.black }} />
            {BUDGET.map((b) => {
              const pct = Math.round((b.amt / incomeTotal) * 100);
              const over = pct > b.target;
              return (
                <div key={b.cat} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  <span style={{ flex: 1, fontSize: 15, color: C.black, display: "flex", alignItems: "center" }}>{b.cat}<InfoDot onClick={() => setInfo("bud_" + b.cat)} /></span>
                  <span style={{ width: 64, textAlign: "right", fontSize: 11, color: over ? C.red : C.grey3, fontVariantNumeric: "tabular-nums" }}>{pct}% / {b.target}%</span>
                  <Amt v={b.amt} />
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
              <span style={{ fontSize: 15, color: C.black, fontWeight: 600 }}>Total out</span>
              <Amt v={spendTotal} bold />
            </div>

            {/* surplus */}
            <div style={{ marginTop: 26 }} />
            {sectionHead("Surplus")}
            <div style={{ height: 1, background: C.black }} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.quiet}` }}>
              <span style={{ fontSize: 16, color: C.black, fontWeight: 600 }}>Left to allocate</span>
              <Amt v={surplus} bold />
            </div>

            {/* allocation */}
            <div style={{ marginTop: 26 }} />
            {sectionHead("Allocated to")}
            <div style={{ height: 1, background: C.black }} />
            {ALLOC.map((a) => (
              <div key={a.name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                <span style={{ fontSize: 15, color: C.black }}>{a.name}</span>
                <Amt v={a.amt} />
              </div>
            ))}
            <div style={{ marginTop: 16, fontSize: 12, color: C.grey2, lineHeight: 1.5 }}>
              Percent of take-home, against the recommended target. Red means over. Tap the info dot for last year's spending.
            </div>
            <div onClick={() => { setPage("reports"); setReport("Real estate"); setReportInfo(false); }} style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, cursor: "pointer" }}><span style={{ fontSize: 14, fontWeight: 600, color: C.black }}>Next: Real estate</span><span style={{ fontSize: 16, color: C.black }}>›</span></div>
          </div>
        )}

        {/* REPORTS */}
        {page === "reports" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 50px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span onClick={() => setPlanExpanded(!planExpanded)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.black }}>Comprehensive Plan</span>
                <span style={{ fontSize: 14, color: C.grey3, display: "inline-block", transform: planExpanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span onClick={() => setShareOpen(true)} title="Share" style={{ cursor: "pointer", lineHeight: 0 }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8 L15.8 6.2" /><path d="M8.2 13.2 L15.8 17.8" /></svg>
                </span>
              </div>
            </div>
            {planExpanded && (
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: C.grey1, background: C.recessed, borderRadius: 12, padding: "13px 15px", margin: "8px 0 14px" }}>
                You're in Baby Step 2, attacking about $90k of consumer debt. On plan, you're debt-free by 2032 and net worth crosses $500k by 2035. This month: clear the $1,000 starter and start the snowball on your smallest balance.
              </div>
            )}
            <div style={{ ...EB, marginTop: planExpanded ? 4 : 14, marginBottom: 2 }}>Your inputs</div>
            <div style={{ fontSize: 12, color: C.grey3, marginBottom: 7 }}>What you set up. Edit these and everything below recalculates.</div>
            <div style={{ height: 1, background: C.black }} />
            {PLAN_INPUTS.map((r) => (
              <div key={r} onClick={() => { if (r === "Accounts") { goto("accounts"); } else if (r === "Budget") { goto("budget"); } else if (r === "Lifestyle plan") { goto("lifestyleplan"); } else { setReport(r); setReportInfo(false); } }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: `1px solid ${C.quiet}`, cursor: "pointer" }}>
                <span style={{ fontSize: 15, color: C.black }}>{r}</span>
                <span style={{ fontSize: 16, color: C.grey3 }}>›</span>
              </div>
            ))}
            <div style={{ ...EB, marginTop: 30, marginBottom: 2 }}>Your reports</div>
            <div style={{ fontSize: 12, color: C.grey3, marginBottom: 7 }}>Calculated for you from everything above.</div>
            <div style={{ height: 1, background: C.black }} />
            {PLAN_REPORTS.map((r) => (
              <div key={r} onClick={() => { setReport(r); setReportInfo(false); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: `1px solid ${C.quiet}`, cursor: "pointer" }}>
                <span style={{ fontSize: 15, color: C.black }}>{r}</span>
                <span style={{ fontSize: 16, color: C.grey3 }}>›</span>
              </div>
            ))}
          </div>
        )}

        {/* SHARE */}
        {shareOpen && (
          <div onClick={() => setShareOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 60, display: "flex", alignItems: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, width: "100%", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: "22px 22px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.black }}>Share your plan</span>
                <span onClick={() => setShareOpen(false)} style={{ fontSize: 22, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>✕</span>
              </div>
              <div style={{ fontSize: 14, color: C.grey1, lineHeight: 1.5, marginBottom: 16 }}>Create a private link to a read-only snapshot — for your spouse, CPA, or advisor.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid " + C.quiet, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                <span style={{ flex: 1, fontSize: 13, color: C.grey2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>teleport.app/p/wxg-7f3a9c</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.black, cursor: "pointer" }}>Copy</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.grey2 }}>Anyone with the link can view</span>
                <span style={{ width: 38, height: 22, borderRadius: 11, background: C.black, position: "relative", display: "inline-block" }}><span style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: C.white }} /></span>
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: C.grey3, lineHeight: 1.5 }}>Read-only · no account changes · you can revoke anytime.</div>
            </div>
          </div>
        )}

        {/* INFO sheet */}
        {info && INFO[info] && (
          <div onClick={() => setInfo(null)} style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 60, display: "flex", alignItems: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, width: "100%", maxHeight: "82%", overflowY: "auto", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: "22px 22px 40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.black }}>{INFO[info].title}</span>
                <span onClick={() => setInfo(null)} style={{ fontSize: 22, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>✕</span>
              </div>
              {INFO[info].body.map((s, i) => (
                <div key={i} style={{ marginBottom: 15 }}>
                  {s.h && <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey2, marginBottom: 5 }}>{s.h}</div>}
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: C.grey1 }}>{s.t}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD workflow (prototype) */}
        {uploadOpen && (
          <div onClick={() => setUploadOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 55, display: "flex", alignItems: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, width: "100%", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: "22px 22px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.black, display: "flex", alignItems: "center" }}>Upload statement<InfoDot onClick={() => setInfo("plaid")} /></span>
                <span onClick={() => setUploadOpen(false)} style={{ fontSize: 22, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>✕</span>
              </div>
              {uploadStep === 0 ? (
                <>
                  <div onClick={() => setUploadStep(1)} style={{ border: `1.5px dashed ${C.grey3}`, borderRadius: 14, padding: "34px 16px", textAlign: "center", cursor: "pointer", marginBottom: 20 }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}><path d="M12 16 V4" /><path d="M7 9 l5 -5 5 5" /><path d="M4 16 v3 a1 1 0 0 0 1 1 h14 a1 1 0 0 0 1 -1 v-3" /></svg>
                    <div style={{ fontSize: 15, color: C.black, marginBottom: 4 }}>Tap to choose a PDF or photo</div>
                    <div style={{ fontSize: 12, color: C.grey3 }}>or drag a statement here</div>
                  </div>
                  {["Upload it", "Porter reads it", "Confirm anything unclear"].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${C.grey3}`, color: C.grey2, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 14, color: C.grey1 }}>{s}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", background: C.black, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7.4 L6 10.2 L11.5 3.4" fill="none" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: C.black }}>Statement read</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.grey1, lineHeight: 1.5, marginBottom: 8 }}>42 transactions imported · 2 need your help.</div>
                  <div style={{ fontSize: 14, color: C.grey1, lineHeight: 1.5, marginBottom: 22 }}>The 2 unknowns were added to this month's to-do list for you and Porter to sort out.</div>
                  <div onClick={() => setUploadOpen(false)} style={{ background: C.black, color: C.white, textAlign: "center", padding: "13px 0", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Done</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* LOW-BALANCE notification */}
        {notif && (
          <div onClick={() => setNotif(false)} style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 55, display: "flex", alignItems: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, width: "100%", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: "22px 22px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: C.black, display: "flex", alignItems: "center", gap: 9 }}><RedDot />Low checking</span>
                <span onClick={() => setNotif(false)} style={{ fontSize: 22, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>✕</span>
              </div>
              <div style={{ fontSize: 14, color: C.grey1, lineHeight: 1.5, marginBottom: 12 }}>Personal checking ({fmt(2840)}) is below your safe minimum of {fmt(recMinCash)}.</div>
              <div style={{ fontSize: 14, color: C.grey1, lineHeight: 1.5 }}>Keep at least that much in checking to cover the 1st-of-month bills before the rental income (7th) and your tax refund land.</div>
            </div>
          </div>
        )}

        {/* CHAT launcher */}
        {!navOpen && !chatOpen && (
          <div onClick={() => setChatOpen(true)} style={{ position: "absolute", bottom: 24, right: 22, width: 52, height: 52, borderRadius: "50%", background: C.black, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 40, boxShadow: "0 4px 14px rgba(17,17,17,0.18)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 5 h14 a1.5 1.5 0 0 1 1.5 1.5 v8 a1.5 1.5 0 0 1 -1.5 1.5 H10 l-4 3.5 v-3.5 H5 a1.5 1.5 0 0 1 -1.5 -1.5 V6.5 A1.5 1.5 0 0 1 5 5 Z" />
            </svg>
          </div>
        )}

        {/* CHAT — slim bottom bar; opens with a teleporty expand; info panel rises above, chat stays visible */}
        {chatOpen && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 45, transformOrigin: "center bottom", animation: "tpChatIn 0.42s cubic-bezier(0.16,1,0.3,1) both" }}>
            <style>{"@keyframes tpChatIn{from{opacity:0;transform:translateY(34px) scaleX(0.4)}to{opacity:1;transform:translateY(0) scaleX(1)}}@keyframes tpInfoUp{from{opacity:0;transform:translateY(16px) scaleY(0.85)}to{opacity:1;transform:translateY(0) scaleY(1)}}"}</style>

            {chatInfo && (
              <div style={{ margin: "0 14px 8px", background: C.paper, border: `1px solid ${C.quiet}`, borderRadius: 16, boxShadow: "0 -6px 20px rgba(17,17,17,0.10)", maxHeight: "46vh", overflowY: "auto", padding: "18px 18px 20px", transformOrigin: "center bottom", animation: "tpInfoUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.black }}>Porter</span>
                  <span onClick={() => setChatInfo(false)} style={{ fontSize: 20, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>✕</span>
                </div>
                {INFO.porter.body.map((s, i) => (
                  <div key={i} style={{ marginBottom: 13 }}>
                    <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey2, marginBottom: 4 }}>{s.h}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5, color: C.grey1 }}>{s.t}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <span onClick={() => setChatInfo(!chatInfo)} style={{ width: 26, height: 26, borderRadius: "50%", background: chatInfo ? C.black : C.white, border: `1px solid ${chatInfo ? C.black : C.quiet}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(17,17,17,0.08)", fontSize: 12, fontStyle: "italic", fontFamily: "Georgia, serif", color: chatInfo ? C.white : C.grey2 }}>i</span>
            </div>

            <div style={{ background: C.paper, borderTop: `1px solid ${C.quiet}`, boxShadow: "0 -4px 16px rgba(17,17,17,0.06)", padding: "12px 18px 18px" }}>
              <div style={{ fontSize: 13, color: C.grey2, textAlign: "center", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Hey Porter, should I buy this car<span style={{ color: C.grey3 }}>…</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span onClick={() => setChatOpen(false)} title="Close" style={{ cursor: "pointer", lineHeight: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.7" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                </span>
                <span onClick={() => { setUploadStep(0); setUploadOpen(true); }} title="Attach a document" style={{ cursor: "pointer", lineHeight: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5 L11.8 20.7 a4.6 4.6 0 0 1 -6.5 -6.5 L14.2 5.3 a3 3 0 0 1 4.3 4.3 L9.4 18.7 a1.4 1.4 0 0 1 -2 -2 L15.6 8.5" /></svg>
                </span>
                <div style={{ flex: 1 }}><Waveform /></div>
                <span onClick={() => setChatMuted(!chatMuted)} title={chatMuted ? "Voice replies off" : "Voice replies on"} style={{ cursor: "pointer", lineHeight: 0 }}>
                  {chatMuted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.grey3} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9 h4 l5 -4 v14 l-5 -4 H4 Z" /><line x1="17" y1="9" x2="22" y2="14" stroke={C.grey2} /><line x1="22" y1="9" x2="17" y2="14" stroke={C.grey2} /></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.grey2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9 h4 l5 -4 v14 l-5 -4 H4 Z" /><path d="M16 8 a5 5 0 0 1 0 8" /></svg>
                  )}
                </span>
                <div onClick={() => setChatOpen(false)} title="Stop" style={{ width: 44, height: 44, borderRadius: "50%", background: C.black, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ width: 15, height: 15, borderRadius: 3, background: C.white }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NAV */}
        {navOpen && (
          <div style={{ position: "absolute", inset: 0, background: C.black, zIndex: 50, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 16px" }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: C.white }}>Teleport</span>
              <span onClick={() => setNavOpen(false)} style={{ fontSize: 26, color: C.white, cursor: "pointer", lineHeight: 1 }}>✕</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
              {NAV.map((item) => (<span key={item.id} onClick={() => goto(item.id)} style={{ fontSize: 30, cursor: "pointer", color: page === item.id ? C.white : C.grey2, fontWeight: page === item.id ? 600 : 400 }}>{item.label}</span>))}
              <span onClick={() => goto("lifestyleplan")} style={{ fontSize: 30, cursor: "pointer", color: page === "lifestyleplan" ? C.white : C.grey2, fontWeight: page === "lifestyleplan" ? 600 : 400 }}>Lifestyle plan</span>
              <span onClick={() => goto("lifeview")} style={{ fontSize: 30, cursor: "pointer", color: page === "lifeview" ? C.white : C.grey2, fontWeight: page === "lifeview" ? 600 : 400 }}>Life view</span>
              <span onClick={() => { setOnbOpen(true); setNavOpen(false); }} style={{ fontSize: 14, color: C.grey3, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4, marginTop: 6 }}>How it works</span>
            </div>
            <div style={{ padding: "0 22px 40px", textAlign: "center" }}>
              <div style={{ height: 1, background: "#2A2A2A", marginBottom: 22 }} />
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.grey2, marginBottom: 8 }}>SYNCED</div>
              <div style={{ fontSize: 15, color: C.white, marginBottom: 10 }}>jcweninegar@gmail.com</div>
              <div style={{ fontSize: 13, color: C.grey3, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>Sign out</div>
            </div>
          </div>
        )}

        {/* HOW IT WORKS (annotated onboarding map) */}
        {onbOpen && (
          <div style={{ position: "absolute", inset: 0, background: C.paper, zIndex: 72, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 14px" }}>
              <span onClick={() => setOnbOpen(false)} style={{ fontSize: 26, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>‹</span>
              <span style={{ fontSize: 17, fontWeight: 600, color: C.black }}>How it works</span>
              <span style={{ width: 18 }} />
            </div>
            <div style={{ height: 1, background: C.quiet }} />
            <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 36px" }}>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: C.grey1 }}>From first tap to finished plan — what happens at each step, where your data goes, and what’s limited for now.</div>
              {ONBOARD.map((s, i) => (
                <div key={i} style={{ paddingTop: 22, marginTop: 22, borderTop: "1px solid " + C.quiet }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", border: "1.5px solid " + C.black, color: C.black, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: C.black }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.grey1, marginLeft: 36, marginBottom: 14 }}>{s.line}</div>
                  {[["How it works", s.how], ["Where it goes", s.where], ["Limitations", s.limits]].map(([lbl, txt]) => (
                    <div key={lbl} style={{ marginLeft: 36, marginBottom: 12 }}>
                      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: lbl === "Limitations" ? C.red : C.grey2, marginBottom: 3 }}>{lbl}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.55, color: C.grey1 }}>{txt}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ paddingTop: 22, marginTop: 22, borderTop: "1px solid " + C.quiet }}>
                <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: C.grey2, marginBottom: 5 }}>Under the hood</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.grey1 }}>Every record is keyed to your household in Supabase Postgres and protected by row-level security — you only ever see your own data. Third-party secrets (Plaid, Google) live in Supabase edge functions on the server, never on the device. Multi-user works because each household is isolated by that key.</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid " + C.quiet, padding: "10px 22px", textAlign: "center", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey3 }}>Prototype · annotations for the dev team</div>
          </div>
        )}

        {/* REPORT detail (16:9 / print-ready, mobile-readable) */}
        {report && (
          <div style={{ position: "absolute", inset: 0, background: C.paper, zIndex: 65, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 14px" }}>
              <span onClick={() => setReport(null)} style={{ fontSize: 26, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>‹</span>
              <span style={{ fontSize: 17, fontWeight: 600, color: C.black }}>{report}</span>
              <InfoDot onClick={() => setReportInfo(!reportInfo)} />
            </div>
            <div style={{ height: 1, background: C.quiet }} />
            {reportInfo && (<div style={{ fontSize: 13, lineHeight: 1.5, color: C.grey1, background: C.recessed, padding: "12px 22px" }}>{REPORT_INFO[report] || "This report is in progress."}</div>)}
            <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 30px" }}>
              {reportBody(report)}
            </div>
            <div style={{ borderTop: `1px solid ${C.quiet}`, padding: "10px 22px", textAlign: "center", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.grey3 }}>16:9 · prints landscape</div>
          </div>
        )}

        {/* PRINT PREVIEW (16:9 landscape, how it prints) */}
        {printPreview && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.55)", zIndex: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
            <style>{"@media print{body *{visibility:hidden!important}.tp-print,.tp-print *{visibility:visible!important}.tp-print{position:fixed;inset:0;width:100%;height:100%;margin:0;border-radius:0;box-shadow:none}@page{size:landscape;margin:12mm}}"}</style>
            <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px 12px" }}>
              <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.white }}>Print preview · 16:9</span>
              <span onClick={() => setPrintPreview(null)} style={{ fontSize: 22, color: C.white, cursor: "pointer", lineHeight: 1 }}>✕</span>
            </div>
            <div className="tp-print" style={{ width: "100%", aspectRatio: "16 / 9", background: C.white, borderRadius: 6, boxShadow: "0 8px 30px rgba(0,0,0,0.3)", padding: "16px 18px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, borderBottom: `1px solid ${C.black}`, paddingBottom: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.black }}>{printPreview}</span>
                <span style={{ fontSize: 7.5, letterSpacing: 1, textTransform: "uppercase", color: C.grey3 }}>Teleport · Comprehensive Plan</span>
              </div>
              {printPreview === "Wealth strategy" ? (
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: "min-content", gap: "5px 18px" }}>
                  {SEQUENCE.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: C.black, width: 11, flexShrink: 0, paddingTop: 1 }}>{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: C.black, lineHeight: 1.2 }}>{s.step} <span style={{ color: C.grey3, fontWeight: 400 }}>· {s.when}</span></div>
                        <div style={{ fontSize: 7.5, lineHeight: 1.25, color: C.grey2 }}>{s.helper}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : printPreview === "Budget" ? (
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 18, marginBottom: 8 }}>
                    {[["In", incomeTotal], ["Out", spendTotal], ["Surplus", surplus]].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 7, letterSpacing: 1, textTransform: "uppercase", color: C.grey3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: C.black }}>{fmt(v)}</div></div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 18px" }}>
                    {BUDGET.map((b) => { const pct = Math.round((b.amt / incomeTotal) * 100); return (
                      <div key={b.cat} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.quiet}`, padding: "2px 0", fontSize: 9 }}><span style={{ color: C.black }}>{b.cat}</span><span style={{ color: pct > b.target ? C.red : C.black }}>{fmt(b.amt)} · {pct}%</span></div>
                    ); })}
                  </div>
                </div>
              ) : printPreview === "Net worth" ? (
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, fontSize: 8 }}>
                  <div><div style={{ fontSize: 7, letterSpacing: 1, textTransform: "uppercase", color: C.grey3, marginBottom: 3 }}>Assets · {fmt(assetsTotal)}</div>{assetItems.map((it) => (<div key={it.name} style={{ display: "flex", justifyContent: "space-between", color: C.black }}><span>{it.name}</span><span>{fmt(it.amt)}</span></div>))}</div>
                  <div><div style={{ fontSize: 7, letterSpacing: 1, textTransform: "uppercase", color: C.grey3, marginBottom: 3 }}>Liabilities · {fmt(liabsTotal)}</div>{liabItems.map((it) => (<div key={it.name} style={{ display: "flex", justifyContent: "space-between", color: C.black }}><span>{it.name}</span><span>{fmt(it.amt)}</span></div>))}<div style={{ marginTop: 6, fontWeight: 700, color: netWorthVal < 0 ? C.red : C.black }}>Net worth · {fmt(netWorthVal)}</div></div>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.grey3 }}>This report is being built.</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <span onClick={() => setPrintPreview(null)} style={{ fontSize: 14, color: C.white, cursor: "pointer", padding: "8px 16px" }}>Close</span>
              <span onClick={() => { try { window.print(); } catch (e) {} }} style={{ fontSize: 14, fontWeight: 600, color: C.black, background: C.white, borderRadius: 8, cursor: "pointer", padding: "8px 22px" }}>Print</span>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {settingsOpen && (
          <div style={{ position: "absolute", inset: 0, background: C.paper, zIndex: 70, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 16px" }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: C.black }}>Settings</span>
              <span onClick={() => setSettingsOpen(false)} style={{ fontSize: 24, color: C.grey2, cursor: "pointer", lineHeight: 1 }}>✕</span>
            </div>
            <div style={{ height: 1, background: C.quiet }} />
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <img src={AVATAR} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: C.black }}>Chris Weninegar</div>
                  <div style={{ fontSize: 13, color: C.grey3 }}>jcweninegar@gmail.com</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2 }}>Household</span><InfoDot onClick={() => setInfo("household_kids")} /></div>
              <div style={{ height: 1, background: C.black }} />
              {HOUSEHOLD.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.quiet}` }}>
                  {m.photo
                    ? <img src={BRITTANY} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <span style={{ width: 32, height: 32, borderRadius: "50%", background: C.grey2, color: C.white, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.badge}</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: C.black }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: C.grey3 }}>{m.sub}</div>
                  </div>
                  <span style={{ fontSize: 16, color: C.grey3 }}>›</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0 28px", cursor: "pointer" }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px dashed ${C.grey3}`, color: C.grey2, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</span>
                <span style={{ fontSize: 15, color: C.grey1 }}>Add household member</span>
              </div>
              <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, marginBottom: 6 }}>Account</div>
              <div style={{ height: 1, background: C.black }} />
              {["Profile & photo", "Connected accounts", "Notifications", "Appearance", "Privacy & data", "Sign out"].map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: `1px solid ${C.quiet}`, cursor: "pointer" }}>
                  <span style={{ fontSize: 15, color: C.black }}>{s}</span>
                  {s !== "Sign out" && <span style={{ fontSize: 16, color: C.grey3 }}>›</span>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
