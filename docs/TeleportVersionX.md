# Teleport — Version X

The single master document for Teleport Financial. It says what we're building, how a person experiences it, how the money math works, what it's built on, how it looks, and how the work itself gets done. It ends with the exact prompt to hand the Chief of Staff to start building.

Last updated: June 2026. This file replaces all earlier MVP notes.

---

## 1. What Teleport is

**Teleport changes the way people see money.**

We're all used to seeing money on a spreadsheet — rows, balances, a budget that lives in a grid. Teleport shows people what their money looks like **in space and time**: laid out across their actual life, from today to retirement, as a place you move *through* rather than a sheet you scan. That's the whole idea, and everything else serves it.

**Teleport** (formal: Teleport Financial) is a responsive, phone-first PWA — one place that holds a household's whole financial life and renders it across time.

- **The core idea:** a vertical timeline of life events. Add, move, or toggle an event — pay off a card, sell a rental, buy a house, a raise starts — and the whole picture recomputes across time. That recompute *is* the product; it's the "teleport."
- **The assistant:** **Porter**, a slim conversational layer for asking questions and making changes in plain language.
- **The promise:** *We build the plan around you.*
- **The transformation:** from anxious and guessing → clear, decided, and at peace — because for the first time they can *see* it.

What it is **not**: a spreadsheet, a budgeting nag, or a wall of charts. See §2 for the spine.

---

## 2. The user journey

### 2.1 Money in space and time (the spine)

The spine of the product is the reframe: **money seen in space and time, not on a spreadsheet.** Every screen should reinforce that a person's finances are a journey laid across their life — where they stand now, the stops ahead, and where it all lands. The timeline and the trajectory aren't features bolted onto a budgeting app; they *are* Teleport.

Because the picture stretches across decades, we're honest about it rather than precise about it. We don't fake a single exact number 30 years out (a Monte Carlo run on this household spread across millions of dollars). Instead we show **what's possible and what it would take to get there** — hope grounded in reality, not fantasy and not doom. The method:
1. Start from what the person actually **wants** — their life and their goals.
2. Show them: *if you do all of this, this is roughly where you end up.*
3. Let them adjust the route and watch the destination move.

### 2.2 The destination — lifestyle, then the retirement number at 67

The journey ends at **retirement, age 67** (full retirement age for anyone born 1960 or later). But the destination isn't just an age — it's **the life they want to be living when they get there.** So before we size the number, we do **lifestyle planning.**

The core insight (from the lifestyle spec): **lifestyle spending is not a budgeting problem — it is a retirement-sufficiency engine.** The lifestyle a household chooses *sets its required retirement number.* The engine then projects whether they hit it and, if not, the minimum income increase to close the gap.

- **Family composition drives lifestyle, not parent age.** Spending pressure tracks family size and child ages (a modified **Duvall Family Life Cycle**: all-under-6 → mixed → school-age 6–12 → teens 13+ → launching 18+ → empty nest), via **avatars** (single / DINK / small 1–2 / medium 3–5 / large 6+). A 42- and a 70-year-old with the same family shape face similar lifestyle pressure; parent age is a *separate* layer (healthcare).
- **A trajectory, not a flat number.** The avatar carries a *shape* of spending across the stages, not one figure.
- **Lifestyle events sit on top.** Specific choices — a house, the Disney Paris trip, monthly massage, a teen's first car — are **toggleable timeline events** (one-time `LE_one` or recurring `LE_rec`) that pull from surplus and recompute everything when flipped.
- **Minimum inputs.** Almost the whole projection runs from three sources: a **tax return** (members, ages, income, filing, withholding), a **Plaid** connection (12 months of spend, debt balances, account balances), and **three lifestyle questions** (withdrawal rate: preserve-principal 4% vs. spend-down; legacy strategy; health status per person). Everything else is computed — no manual budget entry.

The full algorithm, variables, and formulas are inlined in **§9 (Appendix — Lifestyle Engine Spec)** below; its money-relevant decisions are folded into §3.7–3.10.

Once lifestyle sets the target, the **retirement number at 67** is what funds that life. Everything else — paying off debt, the rentals, buying a house, growing income — is a **stop on the route.** **Social Security claiming** is a toggleable scenario against the 67 baseline (early 62 reduced; 67 full; delay to 70 ≈ +8%/yr).

> Open sub-decision (see §7): the spec defaults the retirement number to **`E_total(retirement_year) / withdrawal_rate`** (4% / preserve-principal) with a spend-down alternative (`E_total × runway_years_target`). Confirm which is the headline and the inflation assumption — next financial-planning conversation.

### 2.3 The payoff — the verdict at the end of the journey

The climax is a plain answer to what every household is actually asking, and the engine produces **six output variables** that answer it precisely:

- **Can I get there on my current income?** → **`Income_gap` = Retirement_number − projected net worth at 67.** ≤ 0 means *yes, on track or ahead*; > 0 is the shortfall in dollars. This is the core yes/no.
- **If not, what would it take?** → **`Min_income_increase` = Income_gap / years_to_retirement** — the minimum extra annual income to close the gap (shown with sensitivity at 1-, 3-, and 5-year delays, because waiting raises the bar).
- **What do my expenses look like over the years?** → **`NW_annual`** (net worth every year to retirement and beyond) and **`Retirement_number`** (which moves instantly with any lifestyle toggle).
- **After I retire:** **`Runway_years`** (how long the money lasts under spend-down) and **`Principal_trend`** (is principal growing or shrinking).

So the two honest verdicts are:
1. **"You can get there on your current income."** — on track; here's the path. Or
2. **"To get there, you'd need to grow income by about $X, phased in over this period."** — here's the gap and the route that closes it.

A **Scenario engine** lets the household save and compare named scenarios side by side — *conservative* (only committed events on), *dream* (everything on), and *auto-optimized* (the system cuts lowest-priority events first until `Income_gap` hits zero, showing the minimum cuts, the minimum income increase, or a blend).

That verdict, rendered across time rather than as a spreadsheet cell, is the whole point of the product made concrete.

### 2.4 Onboarding, walked as a user (5 steps, locked)

The thread through all five: **AI handles language and classification; code handles every number; the person only ever confirms and decides.** That keeps it simple, cheap, and correct.

1. **Sign up — passwordless.** Magic link or Google, via Supabase Auth. No password means nothing to leak. *(Simplest possible front door.)*

2. **Connect your accounts.** Plaid Link. Access tokens live server-side in a Supabase edge function, never in the browser. This is the highest-leverage action, so it comes before anything that depends on real data.

3. **Confirm your budget (don't build it).** "Invisible budgeting": the AI reads real transactions, sorts them into the 11 Ramsey categories, and shows *"here's what you actually spend."* The person nods or nudges. A cheap model (Haiku) classifies; hardcoded Ramsey targets do the math.

4. **Pick your path.** "We build the plan around you," made literal: narrow the whole world down to the 1–2 decisions that matter right now — snowball vs. avalanche, keep or sell the Gadsden rental, when to buy a house. The person decides. This is the judgment moment (Sonnet). Each choice becomes a toggleable timeline event.

5. **See your future.** The plan, the milestones, the debt-free date, and a single clear next action — plus the §2.3 verdict. Toggling any decision recomputes the projection live. Code runs the projection — instant, free, correct.

---

## 3. The money model

This is the implementation contract for budget, income, and tax. (Full detail lives in `Budget-and-Income-Rules.md` in Drive; this is the authoritative summary.)

### 3.1 Budget targets = Dave Ramsey
Eleven categories, profiled for **Baby Step 2** at ~$10k/mo take-home (Savings and Retirement $0, Debt high — matches this household):

| Category | % (BS2) | Notes |
|---|---|---|
| Giving | 10% | constant |
| Savings | 0% | jumps in BS3 |
| Food | 13% | band 10–15% |
| Utilities | 6% | band 5–10% |
| Housing | 25% | hard cap ≤25% |
| Transportation | 3% | low by profile |
| Insurance | 11% | band 10–25% |
| Household Items | 1% | — |
| Debt | 24% | high by design in BS2 |
| Retirement | 0% | 15% in BS4 |
| Personal & Entertainment | 7% | band 5–10% |

Store **both** a published band and a default value per category; targets are **Baby-Step aware**. These eleven replace the prototype's current eight.

### 3.2 Expenses vs. income
- **Expenses = a categorization problem.** Crosswalk Plaid's `personal_finance_category` → the 11 Ramsey categories; anything unclear → "Uncategorized / needs review," and the user's correction trains the rule. Headline BS2 check: ~24% of take-home to Debt.
- **Income = a classification problem.** Budget on **recurring income only** (the percentage denominator). Three buckets: recurring (feeds the budget), one-time-actual (windfall — auto-routed, never budgeted), one-time-planned (user enters; lands on the timeline). Windfalls route by Baby Step (BS2 → snowball, BS3 → e-fund, BS4+ → next). Income **goals** are projection-only "what ifs," never baked into the plan.

### 3.3 Variable / commission income
A hardcoded **12-month trailing table** per variable source. Drivers: % of collections, threshold, "expect to hit threshold?", weeks off/year. Conservative trailing-12 average = base; threshold/bonus months = upside, not base.

### 3.4 Income stream fields
Every stream is time-bounded and carries its own schedule: type, start date (payday-anchored), end date or ongoing, cadence, pay-date anchor, amounts. A stream with a start/end **is** a timeline event.

**Brittany = two dated lines:** Salary (W-2, biweekly, ends ~July 2026) and Commission (W-2, biweekly, starts first payday in August 2026, ongoing, 12-month model). Her production bonus is the threshold months inside the commission stream — **still W-2, not self-employment.**

### 3.5 Employment types & tax handling
MVP types: W-2 steady, W-2 commission, 1099 side hustle, self-employed.
- **W-2 (steady or commission):** already withheld → take-home = net. **No set-aside.**
- **1099 / self-employed / rental:** untaxed at deposit → **apply a tax set-aside %** (CPA-confirmed) before it counts as take-home.

W-2 deductions: taxes **lumped**; 401k, Medical (+"covers whole family?"), LTD (keep), STD (cancel once e-fund ≈ 90 days), Dental + Vision (**flagged self-insure candidates** per Ramsey) all **separate**.

### 3.6 Architecture principle for money
**Hardcoded spine + AI sandbox.** The schema (11 categories, income_type, employment type, dates/cadence, 12-month table, deduction fields, tax set-aside %) is fixed and identical for every user, so every number is consistent and sign-off-able. The AI fills and classifies into that spine and asks when unsure. A freeform notes blob gives human context but **never feeds a calculation.**

### 3.7 The projection engine (four engines)
The whole forward projection is **code**, run by four cooperating engines (full formulas in `LifestyleDesign.md`):

1. **Budget Engine** — classifies Plaid transactions into the 11 categories; computes `E_baseline` (trailing 12 mo) → `E_pred` (inflation-adjusted at 3%/yr).
2. **Surplus & Allocation Engine** — `S = (I_pred − BS4_alloc) − E_pred − NMDS − VE`; adds volatile surplus; allocates in two tiers — **Tier 1** the Baby-Steps priority array (non-negotiable), **Tier 2** lifestyle events from what's left. Holds debt-snowball logic, milestone dates, windfall routing.
3. **Projection Engine** — runs everything forward monthly for ~30 years (and a legacy tail), applies inflation, fires age-triggered events, places lifestyle events, and outputs the six variables. **Reruns instantly on any toggle.**
4. **Investment & Growth Engine** — compounds BS4 retirement contributions at a default **7%** growth so net worth is a projection, not a sum.

Key order-of-operations rule: **BS4 (15% retirement) is funded first**, deducted from gross before surplus; lifestyle events never reduce it.

### 3.8 Category scaling rules
Not every category scales the same way — a real source of correctness bugs, so it's explicit:
- **Percentage-of-income** (default): Giving, Food, Personal & Entertainment.
- **Dollar + inflation only** (do *not* scale with income): Utilities, Household Items, Insurance, Transportation; Housing's mortgage is fixed dollar, the rest dollar+inflation.
- **Governed by the Baby-Steps engine** (not a %): Savings, Debt, Retirement.
- A user can override any category with a dollar amount, which then scales by inflation only and converges back toward the % target as income grows. (Fixed-vs-variable handling as income grows is an open elegance item — §7.)

### 3.9 Lifestyle events & age-triggered costs
- **Lifestyle events (`LE`)** are user choices with a cost and a date: **`LE_one`** (one-time, placed on the timeline — house, trips, CO2 laser, a teen's car) and **`LE_rec`** (recurring from a start date — massage, housekeeping, clothing bump). Every one is **toggleable**; flipping it recomputes all six outputs. Events pull from **surplus**, not from % targets — exceeding a category target *notifies* but never blocks, and may push a Baby-Step milestone later.
- **Age-triggered costs (`AT`)** are predictable, not chosen: braces, first phone (~age 12), teen-driver insurance spike (~$4–4.5k/yr/teen at 16), summer camps, college (a BS5 line). Modeled per child from birthdate, inflation-adjusted to the trigger year. Adult **healthcare** (`E_age_adults`) is a separate per-adult curve adjusted by health status (healthy / moderate / chronic), inflating ~5%/yr.

### 3.10 Liabilities & debt service
Per-account modeling, month by month. **`NMDS`** (non-mortgage minimum debt service) is the sum of all minimum payments and is subtracted *before* surplus — it is not a budget choice. Accounts are **RD** (revolving — minimum falls as balance falls, which is what makes the snowball accelerate `S`) or **FD** (fixed payment). Each carries balance, rate, promo rate + promo-end date, minimum floor / fixed payment, term. Snowball targets smallest balance first; a freed minimum rolls into the next. Beta may use the simple monthly-interest approximation; v1 moves credit cards to the **Average Daily Balance** method. Net worth = total assets − total liabilities.

---

## 4. Architecture & stack

**GitHub → Cloudflare Pages → Supabase → Plaid.**

- **GitHub** — source of truth for code and version history; the read/write surface the build agents work against.
- **Cloudflare Pages** — hosts the React/TypeScript front end; auto-redeploys on push.
- **Supabase** — the entire backend: Auth (magic link / Google), Postgres with row-level security, and edge functions that hold every secret (Plaid, Google, Anthropic). No secret ever touches the browser.
- **Plaid** — bank data. Start on the free **Trial plan** (real production data, capped at 10 Production Items, auto-approved). Email-statement ingestion is a secondary fallback.

**TypeScript over plain JS** — it catches money-math and data-shape bugs at build time, and lets us compiler-enforce the rules (palette, 11 categories, income types).

**Anthropic model strategy** — the math is always code, never the model.
- **Haiku** (~80% of calls): transaction classification, reading paychecks/statements, one-time-vs-recurring, short Porter replies.
- **Sonnet**: judgment moments — the budget narrative, "pick your path," whole-picture Porter.
- **Opus**: build-side agents (Chief of Staff + red teams), not runtime.

> Verify current Anthropic model names and pricing live before quoting them anywhere (see §7).

**Still to acquire:** a domain (e.g. via Cloudflare), the Anthropic API key, an email sender for magic links (Resend/Postmark), the Plaid account.

---

## 5. Design system

Locked, and **we are not changing it.** Authoritative source: `Design Tokens.pdf` in Drive. Ships as two reconciled outputs:
- `DESIGN_SYSTEM.md` — the intent (below).
- `tokens.ts` — typed values, `as const`, so the compiler enforces them.

**Type:** modular scale ratio √φ (1.272) on an 11px anchor → 9 · 11 · 14 · 18 · 23 · 28. Page title 28/400; section 18/500; table header 11/600 caps; body 14/400/1.55; small label 11/600/0.18em. Numbers tabular and right-aligned, always.

**Color:** `#111111` black · `#444444` · `#767676` · `#ABABAB` · `#FFFFFF` (editable fields) · `#FAFAF8` paper (bg) · `#F1F1ED` recessed (read-only rows) · `#C42B1C` red (off-track / negative / attention only) · `#9A9A9A` secondary line · `#E3E3DE` quiet hairline. No hue exceptions, no gradients, no off-palette color.

**Spacing:** Fibonacci/golden — 8 · 13 · 21 · 34 · 55 · 89. Dashboard split 62/38.

**Rules:** hairlines are 1px only (`#111111` structural, `#E3E3DE` quiet). **No boxes, no fills behind cards, no shadows** — a rule and a gap do all the work. Attention is a small discrete red **dot**, right-justified — never an exclamation point.

**The mark:** three squares stepping grey → white through a portal line (`#444444` → `#767676`/`#ABABAB` split at the line → `#FFFFFF`). The grey-to-white step *is* the motion story — no color needed.

**Visual language — show life, not graphs (strong principle, near-rule).** Because the product is money *in space and time*, the default way to show the future is **as life stages, not as a chart or spreadsheet.** Wherever possible, an image should show **how a household sees their life change over time** rather than plotting a line. The reference image to build toward: **silhouettes of the family** (e.g. a family of six) shown in **~3-year blocks across the timeline** — the kids grow taller, the family changes — so the person reads *"at this stage… and this stage…"* at a glance. Graphs and tables are the fallback, not the headline. (Chris is intentionally close to making "no graphs" a hard rule; treat it as a heavily-weighted default and flag any screen that reaches for a conventional chart.)

**Additional locked rules (from the lifestyle spec):**
- **No grey boxes for content.** `#F1F1ED` recessed is for the outer page background only — never content cards or dividers. Sections are separated by hairlines and whitespace. (Explicitly corrected in a design session.)
- **One icon exception.** Decorative icons remain banned *except* in **lifestyle-category navigation** (onboarding step 4 and the Plan tab), where a small single-stroke SVG (20–22px, `#767676` stroke, never filled or colored) aids emotional recognition of life areas. Nowhere else.
- **Sticky stage/year headers.** Year and life-stage navigation headers are `position: sticky` so the person can change the year without scrolling to the top.
- **Timeline tail to legacy.** The lifestyle timeline extends past retirement; show events through 67 and label the long tail **"Legacy & generational wealth."**
- **"Show the math" is a data shape, not a feature bolt-on.** Every *calculated* number is a `CalcField { value, formula, inputs[], calculatedAt }`; constants and user inputs are plain numbers. Tapping any figure shows its formula and inputs, and the Financial-accuracy red team can trace any output back to its constants. (TypeScript pattern in `LifestyleDesign.md` §16.)

---

## 6. The build operating system

The point of this section: let Chris own the spec and the screens, then step back, while the work continues with as little of his time as possible until beta.

**The loop:**
1. **Chris** owns the spec and the screens. Once those are set, he steps back.
2. **Chief of Staff** (running in Claude Code) reads this master file, writes the next spec, and spins up a **builder agent**.
3. The builder's output goes through **four red teams**, each with its own constitution:
   - **Security** — bank-grade; the top bar.
   - **UX / aesthetics** — guards the locked design system.
   - **Code correctness** — does it actually work.
   - **Financial accuracy** — projections and statistics are right and honest.
4. A **Judge** red team weighs the four and reports to the Chief of Staff.
5. The Chief of Staff writes the next spec / spins the next agent, and repeats **autonomously until something genuinely needs Chris.**

Each agent works from its own file ("constitution") so its job and limits are explicit.

**The two non-negotiables, ranked:**
1. **Security — bank-grade.** SSNs and full financial data; airtight, nothing leaks. This outranks everything.
2. **Aesthetics.** The existing design system is locked; the visual bar is much of the point.

**How the work actually ships.** Development happens **against the live deployed app from day one.** Agents commit/push to the branch → Cloudflare Pages redeploys → it's live in the real PWA Chris is using. There is no separate staging mockup; the working app *is* the product, built in public against itself. This is the established, working rhythm — don't change it.

### "Chris's Work" — the Messages inbox

This is how Chris and the agents talk. It lives inside the app so he can work from his phone (he can't tick markdown checkboxes or push commits from a phone).

- **Naming/placement:** the item currently labeled **Notifications** on the **Household** screen becomes **Messages.**
- **The list:** tapping Messages opens an **email-style list of tickets** — individual items, **newest first.** Not a chat window. Each row shows enough to triage at a glance (what it's about, which agent, when, unread state).
- **A ticket:** open one and it reads like an email/ticket — the agent's question or request, with whatever context Chris needs to decide.
- **Replying — tap first, type if needed:** most agent questions are a decision, so a ticket carries **quick structured options** when applicable — **Approve / Reject**, or an **A-or-B pick** — with an **optional free-text note** underneath. A tap settles the common case fast; the note handles the rest. Pure free-text is available when there's no structured choice to offer.
- **Where the answer goes (the spine):** the reply **writes to Supabase** (a row the agents read), **not** straight to GitHub from the phone. **GitHub is for code; Supabase is for data, and a ticket reply is data.** The Chief of Staff reads the reply on its next pass; if the answer changes code, *the agent* commits to the branch — which goes live, same loop as everything else. (We can mirror threads into the repo later as a paper trail, but DB-first is the spine.)

This is the **first thing to build** — mostly wiring onto the existing UX and standing up the reply → Supabase → agent-reads-it path — once it's approved.

---

## 7. Open decisions

- **Lifestyle → the "number at 67."** The spec defaults to `E_total / withdrawal_rate` (4% / preserve-principal) with a spend-down alternative; confirm the headline method and the inflation assumption. *Next financial-planning conversation.*
- ~~Incoming `Lifestyle.md`~~ — **arrived and compiled** (June 2026). `LifestyleDesign.md` + the two prototypes are in the deliverables and folded into §2–3, §5.
- **Visual language:** decide whether "show life stages, not graphs" becomes a hard rule or stays a heavily-weighted default (the family-silhouettes-in-3-year-blocks reference).
- **Fixed-vs-variable scaling at higher incomes** — the spec flags an "elegant solution" is still needed for categories that don't scale with income; not solved for beta.
- **Live-verify** current Anthropic model names and pricing before they go in any spec.
- Wire the **11 Ramsey categories** into the prototype Budget (replacing the 8) and add the **dental/vision/STD self-insure flags** to the Insurance report.
- Build the **"Chris's Work" Messages inbox** (first build item; see §6).
- **Fix the retirement label on the live app:** Controls read "Plan to retire 2049 / Net worth at **65**" → anchor is **67**, year shifts accordingly. Clean, isolated early ticket. (The prototypes still carry `retireYear: 2049` / age-65 assumptions — update to 67.)
- Confirm the reply pattern: structured tap options (Approve/Reject, A-or-B) + optional note. *(Current decision: structured-first with optional note.)*
- Stand up the **"Show the math"** `CalcField` pattern; wire **Net worth** first.
- Decide whether to offer the **Statements inbox** (email ingestion) under Settings → Connected accounts.
- Reconcile the **Net worth report engine** against the Home chart; replace the prototype's hardcoded `generateData()` with the real four-engine stack.
- Confirm: **Plaid** signup, **Aqua 401k** match rate, **CPA** tax set-aside % and the W-4 change, **Black County** property-tax rate, housekeeping/college/furnishing/trip dollar amounts.
- Decide whether Baby-Step target shifts are modeled in MVP or hardcoded to BS2 for now.
- **User-facing name for lifestyle events** — not "dreams"; candidates "plans" / "goals" / surfaced by category. (Open in the spec.)

---

## 8. Kickoff — the Chief of Staff handoff prompt

> Paste the text below into the Claude Code Chief of Staff, with **five attachments**: (1) the current UX code (`teleport-app2.jsx`); (2) this master document; (3) the lifestyle engine spec (`LifestyleDesign.md`); (4) the life-stage visual prototype (`LifestyleVisual.jsx`); (5) the lifestyle onboarding prototype (`LifestyleOnboarding.jsx`). *(If the agents pull the live branch from GitHub directly, the deployed code supersedes the `.jsx` attachments — use the attachments as the UX reference and the repo as the build target.)*

---

You are the **Chief of Staff** for Teleport Financial. You are in control of the build. I (Chris) own the spec and the screens; once those are set I step back, and you keep the work moving with as little of my time as possible until beta.

Nothing has been built against this plan yet — you and your agents are meeting all of it fresh, so read it in full and treat it as the complete briefing.

**Your inputs (attached):**
1. The current UX prototype (`teleport-app2.jsx`) — a single-file React app. The locked visual and interaction reference.
2. The Teleport Version X master document — what we're building, the money model, the stack, the design system, and how we work. The source of truth.
3. `LifestyleDesign.md` — the full lifestyle / retirement-sufficiency engine spec: the four engines, every variable and formula, the 11-category scaling rules, age-triggered costs, the six output variables, minimum inputs, the `CalcField` typing pattern, and a prototype-vs-spec gap analysis with a build-priority list.
4. `LifestyleVisual.jsx` and 5. `LifestyleOnboarding.jsx` — working, on-palette prototypes of the life-stage visual and the lifestyle onboarding (step 4). Data is hardcoded; wire them to the real engine and persist toggles to Supabase.

**How you operate:**
- Read the master document fully before doing anything. Check it for current state before each new piece of work.
- We develop **against the live deployed app from day one.** Commit/push to the branch → Cloudflare Pages redeploys → it's live in the real PWA I'm using. There is no separate mockup. Keep this rhythm.
- For each unit of work: write a tight spec, spin up a builder agent, then route the output through four red teams — **Security** (bank-grade; the top priority), **UX/aesthetics** (the design system is locked, do not change it), **Code correctness**, and **Financial accuracy** (the math and statistics must be right and honest). A **Judge** weighs their findings and reports to you. Then you write the next spec. Repeat autonomously; only surface to me when something genuinely needs my decision — and surface it as a ticket in the Messages inbox (below).
- Give every agent its own constitution file.

**Hard rules:**
- **Security is paramount** — SSNs and full financial data; airtight, nothing leaks.
- **Aesthetics are locked** — build only from the attached design system and prototype. No new visual language. No boxes, no fills, no shadows, no off-palette color, no gradients.
- **The math is always code, never the model.** AI classifies and explains; code computes every number, and every number must be traceable ("show the math").
- **Projections tell the truth:** show what's possible and what it would take — never false precision. Retirement anchors at age 67.
- Revert from broken states; never iterate forward on something broken.

**First task — the "Chris's Work" Messages inbox.** Build the channel we'll use to communicate (§6). Rename the Household screen's "Notifications" to **Messages**; tapping it opens an email-style list of tickets, newest first; opening a ticket shows the agent's request with quick structured options when applicable (Approve/Reject or A-or-B) plus an optional free-text note. A reply **writes to Supabase** — never straight to GitHub from the phone — and you read it on your next pass; if it changes code, an agent commits to the branch. It's mostly wiring onto the existing UX plus that reply → Supabase → agent-reads-it path. Spec it, build it, red-team it, and bring me the result as the first ticket in that very inbox.

**Then, the lifestyle / projection engine**, in the priority order set out in `LifestyleDesign.md` §14.3:
1. **Foundation** — replace the prototype's hardcoded `generateData()` with the real four-engine formula stack; separate `NMDS` from baseline expenses; connect lifestyle-event toggles to live recomputation; add the missing budget categories (Savings, Debt, Retirement) so all 11 are tracked.
2. **Entity model & data sources** — per-member profiles, pay-stub parsing, retirement-account detection, insurance audit.
3. **Full lifestyle engine** — age-triggered costs from child birthdates, adult healthcare curves, scenario save/compare, auto-optimize to close `Income_gap`.
4. **Reporting & outputs** — wire all six output variables to live calc, W-4 optimization from real data, ADB credit-card interest, college funding in BS5.

Work the foundation first; nothing else is trustworthy until the numbers are real and traceable.

---

## 9. Appendix — Lifestyle Engine Spec (full)

*The complete `LifestyleDesign.md`, inlined verbatim (headings demoted one level to nest under this appendix). This is the authoritative projection-engine spec referenced throughout §2–3 and §5. The two prototypes it describes — `LifestyleVisual.jsx` and `LifestyleOnboarding.jsx` — are now merged into `teleport-app2.jsx`.*

## Lifestyle Design Spec
### Teleport Financial — Planning Phase

Last updated: June 2026.

---

### Executive Summary

This document exists because building a lifestyle projection engine requires understanding the math before writing a line of code. Chris and Britney worked through the full algorithm in a planning session — income, expenses, debt, Baby Steps, lifestyle choices, age-triggered costs, and retirement sufficiency — to arrive at a spec that is mathematically grounded and buildable.

The core insight: lifestyle spending is not a budgeting problem. It is a retirement sufficiency engine. The lifestyle choices a household makes determine their required retirement number. The algorithm projects whether they hit it, and if not, calculates the minimum income increase needed to close the gap.

The goal of this document is to give the builder everything needed to implement the lifestyle engine correctly — the variables, the formulas, the category structure, the data sources, and the gap between the current prototype and the full spec.

This document will be compiled into the Teleport Version X master document when complete.

---

### Section 0: Category & Subcategory Structure

All spending in Teleport maps to the 11 official Dave Ramsey budget categories. Source: ramseysolutions.com budget calculator and budget percentages page. Every transaction from Plaid, every lifestyle event, and every age-triggered expense maps to one of these 11 categories.

The categories are listed in Ramsey's canonical order. Each has a target percentage (BS2 profile, ~$10K/month take-home), official subcategories per Ramsey's documentation, and scaling rules for the projection engine.

---

#### 0.1 Giving — 10%

Target: 10% of gross income. Fixed. Always on, even in Baby Step 2.

Scaling rule: Always scales as percentage of I_pred. Never reduced by lifestyle events or debt payoff.

Official subcategories:
- Tithing (church)
- Charitable giving (nonprofits, causes)
- Community giving
- Family generosity (helping extended family)

Note: Give on what actually reaches your pocket. Rental income — tithe on cash flow, not gross rent. Tax refund — if you gave on gross, it is already covered; if on net, give 10% of the refund. Side income and commissions — 10% of everything.

---

#### 0.2 Savings — 0% in BS2, variable in BS3, 15% in BS4

Target: Governed entirely by Baby Steps Engine. Not a fixed lifestyle percentage.

Scaling rule: Directed by Baby Steps priority array, not a percentage of income.

Official subcategories:
- Emergency fund ($1,000 starter in BS1; 3-6 months of expenses in BS3)
- Large purchases / sinking funds (saving up for a known future expense — car, vacation, appliance)
- Retirement savings (15% of gross income in BS4, into 401k, Roth IRA, IRA, or similar)

Note: The 3-6 month range for the emergency fund depends on income stability and family size. Variable income households with dependents should target 6 months. Stable dual-W2 households may be fine at 3 months.

---

#### 0.3 Food — 13%

Target: 10-15% band; 13% default. No fixed dollar rule — scales as percentage of I_pred.

Scaling rule: Scales as percentage of I_pred by default. User can override with a dollar amount, which then scales by inflation only.

Official subcategories:
- Groceries (household food purchasing)
- Dining out / restaurants (discretionary — first to cut during debt payoff)

National averages (2024): Families of four ~$971/month thrifty plan. Restaurant spending ~$252/month average household.

Note: Restaurants are discretionary. Groceries are not. Track them as separate lines within the Food category. Food is one of the highest-leverage categories to trim during BS2.

---

#### 0.4 Utilities — 6%

Target: 5-10% band; 6% default.

Scaling rule: Scales as dollar amount adjusted for inflation, NOT as a percentage of income. Utilities do not proportionally increase with income. They increase with life events (new/larger home, more people in household). Goal is to stay within the 6% band as income grows.

Official subcategories (per Ramsey):
- Electricity
- Water and sewer
- Natural gas or propane
- Trash services
- Internet
- Phone bill (cell and landline)

Note: Cable TV and streaming services do NOT go here — they go under Personal & Entertainment. Internet goes here; cable does not.

---

#### 0.5 Housing — 25% (hard cap)

Target: Hard cap at 25% of take-home pay. Never exceed. Includes mortgage/rent plus all housing-related costs.

Scaling rule: Mortgage payment is fixed dollar. Other subcategories scale by dollar amount plus inflation. Major events (home purchase, major renovation) are placed as LE_one on the timeline.

Official subcategories (per Ramsey):
- Mortgage or rent (principal and interest)
- Property taxes (location-specific — must be user input, not assumed)
- HOA fees
- Homeowners or renters insurance
- Home maintenance and repairs (budget 1-2% of home value annually)
- Household items (cleaning supplies, toiletries, paper products, light bulbs, laundry detergent — consumables only)
- Lawn care and landscaping
- Pest control
- Housekeeping / cleaning service

Note: Furniture and major appliances are NOT household items — they are one-time planned expenses (LE_one). Household items is consumables only. Property taxes are location-specific and must always be a prompted user input.

Sample data (Chris and Britney): House purchase target August 2027, $400K-$500K. Property taxes in Black County TBD (open item). Monthly housekeeping service planned post-debt-payoff.

---

#### 0.6 Transportation — 3%

Target: ~10% is national average; Ramsey targets 3% for this household profile. Varies by vehicle ownership and commute.

Scaling rule: Scales as dollar amount plus inflation. Major events (vehicle purchase, teen driver added) placed as LE_one or AT events on the timeline.

Official subcategories (per Ramsey):
- Gas and fuel
- Car maintenance and oil changes
- Car tag renewals and registration
- Public transportation (bus, subway, Uber, Lyft)
- Routine vehicle maintenance

Note: Auto insurance goes under Insurance, not Transportation. Vehicle purchases go here as one-time planned expenses. Teen driver insurance spike (~$2,700-$4,500/year per teen added to policy at age 16) goes under Insurance as an age-triggered event (AT).

---

#### 0.7 Insurance — 11%

Target: 10-25% band; 11% default. Varies significantly by household size, health, and coverage.

Scaling rule: Scales as dollar amount. Increases with age-triggered events (teen driver, healthcare needs).

Official subcategories (per Ramsey):
- Health insurance (required; employer-provided or self-paid)
- Auto insurance (required)
- Homeowners or renters insurance (required)
- Term life insurance (10-12x income; term only — no whole life)
- Long-term disability insurance (LTD — keep)
- Short-term disability insurance (STD — cancel once emergency fund covers ~90 days)
- Dental insurance (flagged as self-insure candidate per Ramsey)
- Vision insurance (flagged as self-insure candidate per Ramsey)
- Identity theft protection
- Umbrella / liability insurance (recommended once net worth exceeds ~$500K)
- Long-term care insurance (recommended at age 60+)

Age-triggered events in Insurance:
- Teen driver added to policy at age 16: +$2,700-$4,500/year per teen
- Four children = four insurance spike events staggered over ~6-8 years
- Healthcare costs increase with parent age (feeds E_age_adults)

Note: STD cancellation should be flagged as a Do This Next Engine action when emergency fund reaches 90 days of expenses. Dental and vision should be flagged as self-insure candidates in the insurance audit.

---

#### 0.8 Household Items — 1%

Target: 1% of take-home. Small but real.

Scaling rule: Scales as dollar amount plus inflation. Does not scale proportionally with income.

Official subcategories (per Ramsey, included under Housing in some versions):
- Cleaning supplies
- Toiletries and personal hygiene consumables
- Paper products (toilet paper, paper towels, napkins)
- Light bulbs and minor household replacements
- Laundry supplies
- Batteries, small tools, minor hardware

Note: This is consumables only. Major purchases (furniture, appliances) are LE_one events. If an item needs to be replaced regularly, it belongs here. If it is a one-time purchase above a reasonable consumable threshold, it is LE_one.

---

#### 0.9 Debt — 24% in BS2, 0% after BS2

Target: 24% of take-home in BS2. Drops to 0% after all non-mortgage debt is paid off.

Scaling rule: Governed entirely by Baby Steps Engine and Surplus & Allocation Engine. Not a lifestyle percentage. Splits into NMDS (minimum debt service) and extra snowball payments.

Official subcategories:
- Credit card payments (revolving debt — RD)
- Personal loan payments (fixed debt — FD)
- Auto loan payments (FD)
- Student loan payments (FD)
- Medical debt payments (FD or RD)

Note: Mortgage is NOT in this category — it is under Housing (25%). NMDS covers minimum required payments across all RD and FD accounts. Extra snowball payments are allocated by the Surplus & Allocation Engine above NMDS. When BS2 is complete, the 24% previously going to debt becomes available — this is the primary lifestyle creep window.

---

#### 0.10 Retirement — 0% in BS2, 15% in BS4

Target: 0% during BS2 (pause contributions, redirect to debt). 15% of gross income in BS4.

Scaling rule: Governed by Baby Steps Engine. Fixed at 15% of I_pred once BS4 is active. Never reduced by lifestyle events. Deducted from gross income before surplus is calculated.

Official subcategories:
- 401k contributions (traditional or Roth)
- IRA contributions (traditional or Roth)
- 403b (nonprofit/government employees)
- SIMPLE IRA (small business employees)
- Solo 401k (self-employed)
- HSA (if eligible — triple tax-advantaged)
- Employer match (tracked separately — free money, never leave it unclaimed)

Note: During BS2, pause 401k contributions including employer match per Ramsey. Restart immediately when BS2 is complete. BS4 requires 15% — if employer match is 3%, employee contribution needed is 12% to hit 15% total. Confirm match rate per employer before calculating BS4_alloc.

---

#### 0.11 Personal & Entertainment — 7%

Target: 5-10% band; 7% default. This is the primary lifestyle category. Most lifestyle events map here.

Scaling rule: Scales as percentage of I_pred by default. User can override individual subcategories with dollar amounts. Lifestyle events that push this category over 7% trigger a notification but are not blocked — they pull from surplus.

Official subcategories (per Ramsey):
- Clothing (adults and children — separate lines)
- Personal care products (toothpaste, makeup, grooming items, skincare)
- Fun money — his (individual discretionary spending, no questions asked)
- Fun money — hers (individual discretionary spending, no questions asked)
- Streaming services and subscriptions (Netflix, Spotify, etc.)
- Cable TV (if applicable — note: internet goes under Utilities)
- Event tickets (concerts, sports, movies, theater)
- Travel and vacations (family trips, couples trips, bucket-list experiences)
- Dining out (if not tracked separately under Food)
- Gym memberships and fitness classes
- Therapy and mental health appointments
- Copays for doctor visits and medical services
- Prescription medications
- Childcare for date nights and non-work purposes
- Children's sports and extracurricular activities
- Children's school supplies and enrichment materials
- Tutoring and academic enrichment
- Summer camps (ages 6+)
- Gifts (birthday, holiday, wedding, baby shower)
- Miscellaneous and irregular expenses (~5% buffer for things that do not fit elsewhere)
- Aesthetic and wellness procedures (microneedling, laser treatments, massage, etc.)
- Pet care (food, vet, grooming, boarding)
- Hobbies and recreation (gear, supplies, memberships)
- Technology and gadgets (phones, computers, accessories, upgrades)

Sample data (Chris and Britney):
- Microneedling (Britney): ~$1,000/year
- CO2 laser (Britney): ~$2,500-$3,000 every 3 years (LE_one)
- Massage (Britney): $100/month recurring (LE_rec)
- Disney Paris family trip: $20,000 one-time (LE_one, target 2027)
- Rome/Venice/Florence anniversary trip: $3,000-$5,000 one-time (LE_one, target May TBD year)
- Clothing budget increase post-debt: amount TBD (LE_rec)

Note: Fun money is a Ramsey staple — both spouses get their own discretionary line so neither has to check in on small purchases. Pets, technology, hobbies, and personal care are absorbed into this category even though Rachel Cruze's expanded article lists them separately. The 11-category model consolidates them here.

---

### Section 1: Master Algorithm

#### 1.1 The Four Engines

Engine 1: Budget Engine
Classifies all transactions from Plaid into the 11 Ramsey categories. Calculates E_baseline from past 12 months. Outputs E_pred (inflation-adjusted baseline). Flags over/under spend by category. Lifestyle events layer on top from specific dates forward.

Engine 2: Surplus & Allocation Engine
Receives all surplus (S and VS). Calculates S = (I_pred - BS4_alloc) - E_pred - NMDS - VE. Routes VS directly here, bypassing Budget Engine. Allocates total surplus in two priority tiers:
Tier 1 (non-negotiable): Baby Steps priority array (BS1 through BS6 in order)
Tier 2 (user choice): Lifestyle allocation (LE_one and LE_rec) from remaining surplus after Baby Steps
Contains: surplus calculation, VS routing, Baby Steps priority array, debt snowball logic, milestone date calculations, windfall routing rules, Baby Step transition logic.

Engine 3: Projection Engine
Wrapper that runs all engines forward monthly and annually for 30 years. Applies inflation to I_pred and E_pred. Triggers AT events at specific child ages. Places LE events on timeline. Outputs all six derived variables. Reruns instantly on any toggle or input change.

Engine 4: Investment & Growth Engine
Compounds BS4 retirement contributions at assumed market growth rate. Without this, NW_retirement is a sum not a projection.
INV = BS4_alloc x growth_rate / 12

#### 1.2 Master Algorithm (top level)

Step 1 — Budget Engine:
E_pred = E_baseline x 1.03^n

Step 2 — Surplus & Allocation Engine:
S = I_pred - E_pred - VE
Total_surplus = S + VS
Allocation Tier 1: BS_alloc = priority_array(Total_surplus, BS_current)
Allocation Tier 2: LE_alloc = Total_surplus - BS_alloc (directed by user lifestyle choices)

Step 3 — Projection Engine (repeat monthly for 360 months):
E_total = E_pred + LE_rec + E_age_adults(person1) + E_age_adults(person2) + AT(child1) + AT(child2) + AT(child3) + AT(child4)
Note: E_pred already carries inflation (E_baseline x 1.03^n). No additional inflation factor needed here.
NW_annual = NW_prior + (Total_surplus - BS_alloc - LE_alloc - AT) + INV
Note: LE_alloc = LE_one + LE_rec. Using LE_alloc avoids double-subtracting lifestyle events.

Step 4 — Investment & Growth Engine:
INV = BS4_alloc x growth_rate / 12

Step 5 — Derived Output Variables:
Solve for all six output variables at each year (see Section 10).

---

### Section 2: Variable Definitions

#### Income Variables

I_pred = Total predictable monthly income
Formula: I_pred = I_fixed + I_variable_trended

I_fixed = Fixed monthly income (W-2, salary)
Unit: dollars/month
Source: Tax return W-2 box 1 divided by 12, OR pay stub gross income. Pay stub is preferred source because it also provides: deduction details (health insurance, dental, vision, 401k, LTD, STD), withholding amounts (feeds W-4 optimization), and flags for connected accounts (401k, HSA, FSA).

I_variable = Variable monthly income (commission, 1099, rental)
Unit: dollars/month
Source: Plaid transaction history or tax return
Note: Variable but predictable based on past performance. Included in I_pred.

I_variable_trended = Three-month rolling average of variable income, inflated 3% annually
Formula: ((M1 + M2 + M3) / 3) x 1.03
M1, M2, M3 = most recent three months of variable income

VS = Volatile surplus
Definition: Income above I_pred conservative baseline. Income goals, windfalls, one-time bonuses, amounts above I_variable estimate.
Rule: NOT included in I_pred. NOT budgeted. Flows directly to Surplus & Allocation Engine. Applied to current active Baby Step (BS2 = debt payoff by default). Never projected forward as guaranteed income.
Note: VS is different from I_variable. I_variable is predictable based on past data. VS is unpredictable by definition.

n = Number of years forward from current year
Unit: integer

#### Expense Variables

E_baseline = Raw 12-month average of actual spending by Ramsey category
Source: Plaid transaction history

E_pred = Predictable monthly baseline expenses, inflation-adjusted
Formula: E_baseline x 1.03^n

E_total = Fully adjusted total monthly expenses, all layers combined
Formula: (E_pred x 1.03^n) + LE_rec + E_age_adults(person1) + E_age_adults(person2) + AT(child1) + AT(child2) + AT(child3) + AT(child4)

E_age_adults = Age-related expense increases per adult (primarily healthcare)
Modeled separately per adult. Adjusted by health_status input.
health_status = healthy / moderate / chronic (user input per person)

VE = Volatile expenses
Definition: Unexpected one-time expenses in a given month (car repair, medical emergency, etc.)
Rule: Reduces S for that month only. Emergency fund (BS3) exists to absorb VE. Not projected forward.

E_annual = E_total expressed annually
Formula: E_total x 12

LE_annual = Annual lifestyle spending
Formula: (LE_rec x 12) + LE_one (placed as one-time events on timeline)

#### Lifestyle Event Variables

LE = Total lifestyle events
Formula: LE = LE_one + LE_rec

LE_one = One-time planned lifestyle expense at specific timeline date
Examples: house purchase, Disney Paris trip, Rome trip, CO2 laser, teen vehicle purchase

LE_rec = Recurring lifestyle expense added to monthly baseline from start date
Examples: massage, housekeeping, microneedling, clothing budget increase

LE_alloc = Amount of surplus directed to lifestyle choices after Baby Steps
Formula: LE_alloc = Total_surplus - BS_alloc

Toggle = Boolean per lifestyle event
ON = included in E_total and all output variables
OFF = excluded from calculation
Multiple toggles active simultaneously allowed. Every toggle reruns full projection instantly.

#### Surplus & Allocation Variables

S = Monthly predictable surplus
Formula: S = (I_pred - BS4_alloc) - E_pred - NMDS - VE
Note: BS4 deducted first from gross income. NMDS (non-mortgage minimum debt service) subtracted separately from baseline expenses. VE subtracted for volatile/unexpected expenses in that month.

Total_surplus = S + VS
Note: All surplus — predictable and volatile — feeds the Surplus & Allocation Engine.

BS_alloc = Baby Steps allocation (Tier 1, non-negotiable)
Formula: BS_alloc = priority_array(Total_surplus, BS_current)
BS_current = current active Baby Step (1 through 6)

BS1_target = $1,000 (starter emergency fund)
BS1_months = 1000 / S

RD = Revolving debt (credit cards)
Note: Minimum payment decreases as balance decreases. Creates snowball effect on S.

FD = Fixed debt (loans, mortgages)
Note: Payment stays constant regardless of balance.

Total_debt = Sum of all RD and FD balances

BS2_pct = Percentage of I_pred directed to debt snowball in BS2 (default 24%)
BS2_months = Total_debt / (S x BS2_pct)
Debt snowball order: smallest balance to largest, regardless of interest rate.

efund_months = User-selected emergency fund target (3 or 6 months)
BS3_target = E_pred x efund_months
BS3_months = (BS3_target - 1000) / S

BS4_alloc = Fixed retirement savings allocation
Formula: BS4_alloc = I_pred x 0.15
Note: BS4 is deducted from gross income BEFORE surplus is calculated. It is not part of the surplus allocation. Order of operations: gross income -> BS4_alloc deducted -> then S = (I_pred - BS4_alloc) - E_pred - NMDS - VE. This means retirement is funded first, always.

BS5_alloc = College savings allocation
Formula: BS5_alloc = remaining Total_surplus after BS4 and LE_alloc
Condition: Only active after BS4 is confirmed on track.

BS6_alloc = Legacy and wealth building allocation
Formula: BS6_alloc = remaining Total_surplus after BS5
Condition: Only active after BS5 is on track or complete.

#### Investment & Growth Variables

INV = Monthly investment growth on retirement accounts
Formula: INV = BS4_alloc x growth_rate / 12

growth_rate = Assumed annual market return on retirement investments
Default: 7% annually. User adjustable.

NW_prior = Net worth at end of prior year (starting point for NW_annual)

#### Retirement Variables

withdrawal_rate = Percentage of retirement assets withdrawn annually
Default: 4% (preserve principal / 4% rule)
Alternative: spend-down strategy (user selects target runway age)

retirement_year = Calendar year of target retirement
Default: current year + (67 - current age)

years_to_retirement = retirement_year - current_year

runway_years_target = User-selected target age for spend-down strategy
Default: 90 years old. User adjustable. Used in spend-down Retirement_number formula.
Note: Compare to life_expectancy_age to assess longevity risk.

life_expectancy_age = Planning horizon
Default: age 90-95 per SSA/CDC tables
SSA data: males at 67 expected to live to ~84-85; females ~87-88
Financial planning standard: plan to 90-95 conservatively
V2: user inputs desired lifespan

Retirement_number = Total assets needed at retirement to sustain lifestyle
Formula (preserve principal): E_total(retirement_year) / withdrawal_rate
Formula (spend-down): E_total(retirement_year) x runway_years_target

Legacy_strategy = User selection
Option A: Preserve principal (4% rule, money grows indefinitely, generational wealth)
Option B: Spend down to target age

---

### Section 3: Output Variables & Formulas

These are the six derived variables the Projection Engine solves for. Each maps to a specific user question. All six update instantly on any input or toggle change.

#### Output 1: NW_annual
Formula: NW_annual = NW_prior + (Total_surplus - BS_alloc - LE_alloc - AT) + INV
Note: LE_alloc = LE_one + LE_rec. Using LE_alloc avoids double-subtracting lifestyle events.
User question: What is my net worth at any given point in time?
User sees: Net worth at every year from today through retirement and beyond.

#### Output 2: Retirement_number
Formula (preserve principal): Retirement_number = E_total(retirement_year) / withdrawal_rate
Formula (spend-down): Retirement_number = E_total(retirement_year) x runway_years_target
User question: How much money do I need saved at retirement to sustain my chosen lifestyle?
Note: Changing any lifestyle toggle changes E_total which changes Retirement_number instantly.

#### Output 3: Income_gap
Formula: Income_gap = Retirement_number - NW_annual(retirement_year)
User question: Can I retire at my target age (67)?
Income_gap <= 0: YES, on track or ahead
Income_gap > 0: NO, shortfall exists in dollars
Note: This is the primary yes/no answer to the user's core question.

#### Output 4: Min_income_increase
Formula: Min_income_increase = Income_gap / years_to_retirement
User question: What is the minimum additional annual income I need to earn to retire at 67?
Note: The later the user starts earning more, the higher the required increase. Model should show sensitivity at 1, 3, and 5 year delays.

#### Output 5: Runway_years
Formula: Runway_years = NW_annual(retirement_year) / LE_annual
User question: How long will my money last after I retire?
Applies when: user selects spend-down legacy strategy
Note: Compare to life_expectancy_age to assess risk.

#### Output 6: Principal_trend
Formula: Principal_trend = NW_annual(year+1) - NW_annual(year)
User question: After I retire, is my principal growing or shrinking?
Positive = growing (on track for legacy/generational wealth)
Negative = drawing down (expected in spend-down; concerning in preserve-principal)
Zero = exactly breaking even

#### Feeding Formulas Per Output Variable

NW_annual requires: I_pred, E_pred, VE, S, VS, Total_surplus, BS_alloc, LE_one, LE_rec, AT, INV, NW_prior

Retirement_number requires: E_total(retirement_year), withdrawal_rate or runway_years_target
E_total requires: E_pred, LE_rec, E_age_adults(all adults), AT(all children)
E_pred requires: E_baseline, n

Income_gap requires: Retirement_number, NW_annual(retirement_year)

Min_income_increase requires: Income_gap, years_to_retirement

Runway_years requires: NW_annual(retirement_year), LE_annual
LE_annual requires: LE_rec, LE_one

Principal_trend requires: NW_annual(year), NW_annual(year+1)

#### Scenario Engine
Users save named scenarios and compare all six output variables side by side.
Scenario A (conservative): Only committed LE events toggled ON.
Scenario B (dream): All LE events toggled ON.
Scenario C (auto-optimized): System prioritizes LE events by user-ranked priority. Cuts lowest-priority events first until Income_gap reaches zero. Shows minimum cuts needed, OR minimum income increase needed, OR combination of both.

### Section 4: Lifestyle Events

#### 2.1 Definition

Lifestyle events are user-entered spending decisions that affect the projection. They are not part of the baseline budget. They represent choices — things the user wants to do, buy, or experience — that have a financial cost and a timeline date.

Internally called: Lifestyle Events (LE)
User-facing language: TBD (not "dreams" — consider "plans," "goals," or simply surfaced by category within the budget)

#### 2.2 Two Types

LE_one = One-time planned expense. Placed on the timeline at a specific date.
Examples: house purchase, Disney Paris trip, Rome anniversary trip, CO2 laser treatment, vehicle purchase for teen.

LE_rec = Recurring lifestyle expense. Added to the monthly baseline from a start date forward.
Examples: monthly massage ($100/month), housekeeping service, microneedling annual series, clothing budget increase.

#### 2.3 Toggle Mechanic

Every lifestyle event is toggleable on the timeline.
Toggle ON = event is included in E_total and affects all six output variables.
Toggle OFF = event is excluded from calculation.
Multiple events can be toggled simultaneously in any combination.
Every toggle instantly recomputes the full 30-year projection.

User can save named scenarios (e.g. "conservative," "dream," "house + no trips") and compare retirement projections side by side.

#### 2.4 How Lifestyle Events Affect the Budget

Lifestyle events pull from surplus, not from percentage targets.
The 11 Ramsey category percentages are guardrails that show what a healthy budget looks like. They do not block lifestyle events.
When a lifestyle event pushes a category over its percentage target, the app notifies the user (e.g. "This trip pushes Personal & Entertainment from 7% to 10% this year") but does not block it.
The event reduces surplus for that period, which may push back a Baby Step milestone date.
BS4 (15% retirement) is never reduced by lifestyle events. It is a fixed allocation from income once active.

#### 2.5 Sample Lifestyle Events — Chris and Britney

One-time events (LE_one):
House purchase: $400K-$500K, target August 2027. Down payment ~1.5% out of pocket (~$6K-$7.5K). Closing costs ~$2,500. Maps to Housing category.
Disney Paris family trip: $20,000 working budget, target summer 2027 (5 days). Maps to Personal & Entertainment.
Rome/Venice/Florence anniversary trip: $3,000-$5,000 working budget, target May (anniversary month), year TBD. Maps to Personal & Entertainment.
CO2 laser (Britney): $2,500-$3,000, once every 3 years. Maps to Personal & Entertainment.
Vehicle purchase per teen driver: cost TBD, triggered at each child's age 16. Four children = four decision points over ~6-8 years. Maps to Transportation.
Home furnishings at purchase: amount TBD. Maps to Housing.

Recurring events (LE_rec):
Monthly massage (Britney): $100/month ($1,200/year). Maps to Personal & Entertainment.
Microneedling (Britney): ~$1,000/year (series of 3 sessions). Maps to Personal & Entertainment.
Housekeeping service: monthly, cost TBD by local market. Maps to Housing.
Clothing budget increase: amount TBD, post-debt payoff. Maps to Personal & Entertainment.
Teen driver insurance: ~$4,000/year per teen added to policy, triggered at age 16. Maps to Transportation.

---

### Section 5: Budget Categories & Mapping

#### 3.1 Overview

All spending — baseline, lifestyle, and age-triggered — maps to the 11 official Dave Ramsey budget categories. These are the authoritative categories used in Teleport. Source: ramseysolutions.com budget calculator.

The simplest long-term projection model is percentage-based: commit to staying within these percentages as income grows. Surplus increases as debt is paid off (Debt drops from 24% to 0%, freeing cash flow for other categories or savings). This is the default projection model.

Note for builders: The app must account for the distinction between fixed expenses (stable dollar amounts regardless of income) and variable expenses (scale with income or circumstances). Utilities, for example, do not scale proportionally with income but do increase with housing changes. This needs an elegant solution — flagged as an open item.

#### 3.2 The 11 Categories (Official Ramsey, in order)

**1. Giving — 10%**
Fixed percentage of gross income. Always on, even in BS2.
Subcategories: Tithing, charitable giving, community giving.
Sample (Chris & Britney): Britney committed to 10% giving.
Scaling rule: Always scales as percentage of I_pred.

**2. Savings — 0% in BS2, variable in BS3, 15% in BS4**
Not a fixed lifestyle percentage. Directed entirely by Baby Steps Engine.
BS1: $1,000 starter fund
BS3: 3-6 months of E_pred (user selects 3 or 6 based on income stability)
BS4: 15% of gross income to retirement (fixed, not reducible by lifestyle events)
BS5: college savings from remaining surplus
Scaling rule: Governed by Baby Steps Engine, not percentage.

**3. Food — 13%**
Subcategories: Groceries, dining out/restaurants (separate lines).
National averages: Families of four ~$971/month (thrifty plan). Restaurants ~$252/month average.
Note: Restaurants are discretionary and first to cut in tight months.
Scaling rule: Scales as percentage of I_pred. User can override with dollar amount.

**4. Utilities — 6%**
Subcategories: Electricity, water/sewer, natural gas/propane, trash, internet, phone bill.
Note: Cable TV and streaming services go under Personal & Entertainment, NOT Utilities.
National averages: Natural gas ~$37/month, electricity ~$129/month, water ~$58/month.
Scaling rule: Scales as dollar amount (inflation-adjusted), not as percentage of income. Increases with housing events (new/larger home). Goal is to stay within 6% band as income grows.

**5. Housing — 25% (hard cap)**
Subcategories: Mortgage/rent, property taxes, HOA fees, home maintenance/repairs, household items (toilet paper, detergent, light bulbs), lawn care, pest control, housekeeping.
Hard cap: Never exceed 25% of take-home pay including mortgage + tax + insurance + HOA.
Note: Property taxes are location-specific and must be user input, not assumed.
Sample (Chris & Britney): House purchase August 2027, $400K-$500K. Property taxes in Black County TBD (open item).
Scaling rule: Mortgage is fixed dollar. Other subcategories scale by dollar amount + inflation.

**6. Transportation — 3%**
Subcategories: Gas/fuel, car maintenance, oil changes, car tag renewals, public transit, Uber/Lyft.
Note: Auto insurance is under Insurance category, not Transportation.
National averages: Gas ~$179/month, maintenance ~$81/month.
Age-triggered events: Teen driver insurance spike (~$4,000/year per teen at age 16-17) maps to Insurance, not Transportation. Vehicle purchase for teen maps here.
Sample (Chris & Britney): Four teen drivers over ~6-8 years.
Scaling rule: Scales as dollar amount + inflation. Major events (vehicle purchase) placed as LE_one on timeline.

**7. Insurance — 11%**
Subcategories: Health insurance, auto insurance, homeowners/renters insurance, term life insurance, identity theft protection, disability insurance (LTD), dental, vision.
Note per Ramsey: Dental and vision are flagged as self-insure candidates (see Budget-and-Income-Rules.md).
Note: STD (short-term disability) should be cancelled once emergency fund reaches ~90 days.
Teen driver insurance spike (~$4,000/year) maps here as AT (age-triggered) event.
Scaling rule: Scales as dollar amount. Increases with age-triggered events.

**8. Household Items — 1%**
Subcategories: Cleaning supplies, toiletries, paper products, minor household replacements, pet supplies.
Note: This is consumables only. Furniture and major items go under Housing.
Scaling rule: Scales as dollar amount + inflation.

**9. Debt — 24% in BS2, 0% after BS2**
Subcategories: Credit cards (revolving, RD), loans (fixed, FD), mortgage (once purchased).
RD (revolving debt): Minimum payment decreases as balance decreases, creating snowball effect.
FD (fixed debt): Payment stays constant regardless of balance.
Scaling rule: Governed entirely by Baby Steps Engine. Not a lifestyle percentage.

**10. Retirement — 0% in BS2, 15% in BS4**
Subcategories: 401k, IRA, Roth IRA, other retirement vehicles.
Fixed at 15% of gross income once BS4 is active. Never reduced by lifestyle events.
Scaling rule: Governed by Baby Steps Engine.

**11. Personal & Entertainment — 7%**
Subcategories: Clothing (adults and children), personal care products, fun money (his and hers separate lines), streaming services, cable, subscriptions, event tickets, travel, dining out (if not under Food), gym memberships, therapy copays, medications, childcare for date nights, sports/extracurriculars for kids, school supplies, tutoring, summer camps, gifts, holidays, miscellaneous.
Note: This is the largest lifestyle category. Most of Britney's wellness spending and all travel map here.
Sample (Chris & Britney): Microneedling ($1,000/yr), massage ($1,200/yr), CO2 laser ($2,500-$3,000 every 3 years), Disney Paris ($20,000 one-time), Rome trip ($3,000-$5,000 one-time), clothing budget increase TBD.
Scaling rule: Scales as percentage of I_pred by default. User can override with dollar amounts per subcategory. Lifestyle events that push this category over 7% trigger a notification but are not blocked — they pull from surplus.

---

### Section 6: Age-Triggered Dependent Expenses (AT)

Separate from lifestyle events. These are predictable costs that occur at specific child ages, independent of user choices. All are inflation-adjusted to the calendar year the child reaches that age.

Adults (E_age_adults): Healthcare and other costs increase with age. Modeled per adult separately. Health status (healthy, moderate, chronic) adjusts the curve. This is a separate calculation layer from lifestyle spending.

Children (AT per child):
Braces/orthodontics: Phase 1 ages 7-12, $2,000-$4,000. Phase 2 ages 11-18, $3,000-$10,000. Insurance covers 30-50%.
Cell phone: Ages 11-12. $20-$40/month added to family plan.
Vehicle purchase: Age 16-17. Cost TBD, user decision (toggleable LE_one).
Teen driver insurance: Age 16, ~$2,700-$4,500/year added to policy. Age 17, ~$4,200-$4,500/year. Maps to Insurance category.
Summer camps: Ages 6-12, $200-$400/week. Ages 13+, $500-$1,500/session.
College: Surfaces as planning prompt when oldest child is 8-10 years from college age. Average parental contribution ~$17,000/child. Four children = major BS5 line item.

For beta: Assume children are moderately healthy. Use average regional healthcare costs.

---

### Section 7: Liability & Debt Service Formulas

#### 11.1 Overview

Two things happen simultaneously during debt payoff:
1. Minimum payments reduce balances over time (tracked per account)
2. Extra payments (BS2 snowball allocation) accelerate payoff and further reduce balances

Both must be modeled. The liability balance for every account must be projected forward month by month.

#### 11.2 Debt Service Variable

NMDS = Non-Mortgage Debt Service
Definition: The sum of all minimum required payments across all liability accounts in a given month.
Formula: NMDS = sum of MinPmt(account_i) for all RD and FD accounts (excludes mortgage) for all active liability accounts
Note: NMDS is subtracted from income BEFORE surplus is calculated. It is a mandatory cash outflow, not a budget category choice.
NMDS is separate from VE (volatile expenses) and separate from E_pred (baseline expenses).

Corrected surplus formula:
S = (I_pred - BS4_alloc) - E_pred - NMDS - VE

#### 11.3 Liability Account Types

Every liability account is classified as one of two types:

RD = Revolving Debt (credit cards, lines of credit)
Minimum payment changes month to month as balance changes.
Minimum payment formula (standard): MinPmt_RD = max((Balance x interest_rate / 12) + (Balance x 0.01), minimum_floor)
Where minimum_floor = typically $25-35 (card-specific).
As balance decreases, MinPmt_RD decreases, which increases S over time (snowball effect).
Promotional rate handling: if promo_rate applies and promo_end_date has not passed, use promo_rate in calculation. After promo_end_date, revert to standard_rate.

FD = Fixed Debt (personal loans, auto loans, student loans)
Payment is fixed for the life of the loan.
MinPmt_FD = fixed monthly payment per loan terms.
Balance decreases each month by the principal portion of the payment.
Principal portion = MinPmt_FD - (Balance x interest_rate / 12)

Mortgage = treated as FD for payment calculation but tracked separately.
Note: Escrow changes (property tax/insurance adjustments) are flagged for post-beta handling.

#### 11.4 Per-Account Fields Required

Each liability account needs the following fields:

account_id = Unique identifier
account_type = RD or FD or Mortgage
current_balance = Current outstanding balance (source: Plaid or user input)
interest_rate = Annual interest rate as decimal (e.g. 0.24 for 24%)
promo_rate = Promotional interest rate if applicable (e.g. 0.00 for 0%)
promo_end_date = Date promotional rate expires. After this date, standard interest_rate applies.
minimum_floor = Minimum payment floor in dollars (RD accounts only, card-specific)
monthly_payment = Fixed monthly payment (FD and Mortgage accounts only)
original_balance = Balance at loan origination (FD only, for amortization reference)
loan_term_months = Total loan term in months (FD only)
origination_date = Loan start date (FD only)

Source: Plaid for balances and payment history. User input or statement upload for interest rates, promo dates, and minimum floors.

#### 11.5 Balance Projection Formulas

RD Balance projection (month by month):
Interest_charge = Balance x (interest_rate / 12)
If current_date < promo_end_date: Interest_charge = Balance x (promo_rate / 12)
MinPmt_RD = max(Interest_charge + (Balance x 0.01), minimum_floor)
Extra_payment = BS2 snowball allocation directed to this account (if it is current snowball target)
Balance(month+1) = Balance - (MinPmt_RD - Interest_charge) - Extra_payment
Note: Only the principal portion of MinPmt_RD reduces the balance. Interest_charge does not reduce balance.

FD Balance projection (month by month):
Interest_charge = Balance x (interest_rate / 12)
Principal_portion = monthly_payment - Interest_charge
Extra_payment = BS2 snowball allocation directed to this account (if current snowball target)
Balance(month+1) = Balance - Principal_portion - Extra_payment
Account closes when Balance reaches zero.

#### 11.6 Snowball Logic

BS2 directs extra payments (above NMDS) to one account at a time.
Snowball order: accounts ranked smallest current_balance to largest (Dave Ramsey method).
When current snowball target account Balance reaches zero:
- That account's MinPmt is freed up
- Freed MinPmt is added to extra_payment pool for next account
- Next smallest balance account becomes new snowball target
- NMDS decreases by freed MinPmt amount, increasing S

This is the mechanism by which S grows over time during BS2. As each debt is paid off, more surplus becomes available for the next Baby Step.

#### 11.7 Total Liabilities Output Variable

Total_liabilities = sum of Balance(account_i) for all active liability accounts at any given month
This feeds NW_annual as a component of net worth.
NW = Total_assets - Total_liabilities

Note: Total_assets includes retirement accounts, investment accounts, primary residence value, rental property values, cash balances.


---

### Section 8: Household Member Profiles & Connected Accounts

#### 12.1 Entity Model

Every person in the household is treated as an entity in the system. Each entity has its own profile with connected accounts, income sources, deductions, and insurance coverage.

Entity fields:
entity_id = Unique identifier
name = Full name
date_of_birth = Used for age calculations, E_age_adults projections, life expectancy modeling
relationship = head_of_household / spouse / dependent
employment_type = W-2_steady / W-2_commission / 1099 / self_employed / unemployed / dependent
health_status = healthy / moderate / chronic (affects E_age_adults curve)

#### 12.2 Pay Stub as Primary Data Source

When a household member uploads a pay stub, the system parses and extracts:

Gross income (feeds I_fixed or I_variable per entity)
Pay frequency (weekly, biweekly, semi-monthly, monthly)
YTD figures (validates annual income against tax return)

Fixed deductions (same every pay period):
- Health insurance premium (flags health insurance account connected to entity)
- Dental insurance premium (flags dental account)
- Vision insurance premium (flags vision account)
- LTD (long-term disability) premium (flags LTD account)
- STD (short-term disability) premium (flags STD account — note: Ramsey recommends cancelling STD once emergency fund reaches ~90 days)
- Life insurance premium if employer-provided (flags life insurance account)
- HSA or FSA contributions if present

Variable deductions (change based on elections or income):
- Federal/state tax withholding (feeds W-4 optimization output)
- 401k or other retirement vehicle contributions (flags retirement account, connects to entity profile, feeds BS4 tracking)
- Any other pre-tax or post-tax deductions

When a retirement vehicle (401k, 403b, SIMPLE IRA, etc.) is detected on a pay stub:
- System flags that a retirement account exists for this entity
- Prompts user to connect the account (Plaid or manual entry)
- Account appears in entity profile under connected retirement accounts
- Contributions feed BS4_alloc tracking

#### 12.3 Connected Account Types Per Entity

Each entity can have the following connected accounts:

Income accounts: checking/savings accounts receiving direct deposit (source: Plaid)
Retirement accounts: 401k, Roth 401k, IRA, Roth IRA, 403b, SIMPLE IRA, Solo 401k (source: Plaid or manual)
Insurance policies: health, dental, vision, life, LTD, STD, auto, home/renters (source: pay stub parse or document upload)
Liability accounts: credit cards, loans, mortgage (source: Plaid)
Investment accounts: brokerage, HSA, FSA (source: Plaid or manual)
Property: primary residence, rental properties (source: manual entry or Zillow integration — future phase)

#### 12.4 Insurance Audit (Do This Next Engine Input)

Note: Full insurance coverage amounts and recommendations to be defined separately per Ramsey guidelines. The following is a placeholder for the insurance audit feature.

When pay stubs and policy documents are uploaded, the system builds an insurance profile per entity showing:

For each insurance type:
- Coverage type (health, dental, vision, life, LTD, STD, auto, home)
- Coverage amount (where applicable, e.g. life insurance death benefit)
- Monthly premium
- Whether employer-provided or self-paid
- Policy status (active, flagged for review, recommended to cancel)

Ramsey insurance flags (to be fully specified in separate insurance spec):
- LTD: Keep. Recommended for all working adults.
- STD: Cancel once emergency fund reaches ~90 days of expenses. Flag this milestone.
- Dental/Vision: Flagged as self-insure candidates per Ramsey. Evaluate cost vs. benefit.
- Life insurance: Term life only. Coverage amount per Ramsey formula (TBD — to be added in insurance spec). Flag if entity has whole/universal life (recommend converting to term).
- Health insurance: Required. Flag if entity is uninsured.
- Auto: Required. Flag if entity is uninsured.
- Home/renters: Required. Flag if entity is uninsured.

This insurance audit feeds directly into the Do This Next Engine.

#### 12.5 Do This Next Engine (Overview — Full Spec Separate)

The Do This Next Engine generates a prioritized monthly action checklist for the user, surfaced in the Messages/Chris's Work inbox and on the home screen.

Sources that feed this engine:
- Current active Baby Step (BS_current)
- Insurance audit flags (missing coverage, STD cancellation milestone, etc.)
- W-4 optimization output (if withholding is incorrect)
- Debt snowball status (which account is current target, balance, projected payoff date)
- Lifestyle event timeline (upcoming one-time events requiring savings)
- Account connection status (missing or disconnected accounts)

Example outputs:
"You are on Baby Step 2. This month, apply $X to [smallest debt]. Projected payoff: [date]."
"Your emergency fund has reached 90 days. Consider cancelling your STD policy to free up $X/month."
"Your W-4 withholding is over by ~$X/year. Update your W-4 to increase take-home pay."
"Britney's 401k is connected but contributions are below 15% of gross income. Increase contribution rate to $X to stay on track for BS4."

Full spec for Do This Next Engine to be developed separately.


---

### Section 9: Daily Cash Flow & Balance Tracking

#### 13.1 Daily Cash Balance (Cash Flow Tab)

The cash flow tab in the UI displays a daily cash balance line graph per cash account (checking, savings). This requires projecting cash balances at the daily level, not just monthly.

Daily_cash_balance(account, day) = prior_day_balance + credits(day) - debits(day)

Credits on a given day: paycheck deposits (anchored to pay dates from income stream fields), incoming transfers, windfalls.
Debits on a given day: scheduled bill payments, NMDS minimum payments, known recurring expenses, lifestyle events.

Note: Plaid provides historical daily transaction data. Projection engine extends this forward based on known income schedules and expense patterns.

The line graph shows:
- Historical daily balances (from Plaid, trailing 30-90 days)
- Projected daily balances (forward 30-90 days based on known scheduled transactions)
- Low balance warnings (when projected balance drops below user-set threshold)

#### 13.2 Daily Balance for Credit Card Interest Calculation

Most credit cards calculate interest using the Average Daily Balance (ADB) method, not end-of-month balance. Some cards may use other methods — this should be confirmed per card when statement is uploaded.

Average Daily Balance method:
ADB = sum of daily balances for each day in billing cycle / number of days in billing cycle

Daily_balance(card, day) = prior_day_balance + new_charges(day) - payments(day)

Monthly interest charge = ADB x (annual_rate / 365) x days_in_billing_cycle

This replaces the simplified formula used in Section 11:
Previous: Interest_charge = Balance x (interest_rate / 12)
Corrected: Interest_charge = ADB x (annual_rate / 365) x days_in_billing_cycle

Note: For beta, the simplified monthly formula (Balance x interest_rate / 12) is acceptable as an approximation. The ADB method should be implemented in v1 for accuracy. Flag per card when statement is uploaded to confirm which method the issuer uses.

Promotional rate handling applies at the daily level:
If current_date < promo_end_date: use promo_rate in ADB calculation
If current_date >= promo_end_date: use standard_rate
Flag upcoming promo_end_dates in the Do This Next Engine (e.g. "Your 0% promo rate on [card] expires in 30 days. Balance remaining: $X.")

### Section 10: Minimum User Inputs

The goal is the fewest possible inputs to run the full projection. Three sources provide almost everything:

**Input 1: Tax Return Upload**
Provides: Names and ages of all household members, total household income by source, filing status, existing retirement contributions, mortgage interest (confirms homeownership), current withholding.
Output from this: W-4 optimization (separate deliverable).

**Input 2: Plaid Connection (bank/credit accounts)**
Provides: 12 months of actual spending history (feeds E_pred), current debt balances and minimum payments (feeds BS2), current account balances (feeds NW_annual starting point).

**Input 3: Three Lifestyle Questions**
1. Withdrawal rate preference: Preserve principal (4% rule) or spend down to target age?
2. Legacy strategy: Grow principal, spend down, or custom withdrawal rate?
3. Health status per family member: Healthy, moderate, or chronic conditions?

Everything else is calculated. No manual budget entry required.

---

### Section 11: Life Stage Visual (Deliverable 1)

Interactive timeline showing family silhouettes by child age stages. Based on Duvall Family Life Cycle framework (modified for financial planning purposes).

**Family Composition Avatars:**
Single, no children
Married/partnered, no children (DINK)
Small family: 1-2 children
Medium family: 3-5 children
Large family: 6+ children

**Child Age Phases (within each avatar):**
All children under 6 (infant/toddler)
Mixed: youngest under 6, oldest school-age 6-12
All children ages 6-12 (school-age)
Includes teenagers 13+ (teen phase)
Launching: oldest 18+, some still at home
Empty nest: all children out of primary residence

Key insight: Lifestyle spending is driven by family composition and child ages, NOT parent age. A 42-year-old and a 70-year-old with identical family composition have similar lifestyle spending pressures. Parent age affects E_age_adults separately.

**Visual format:**
In-app: swipeable/scrollable timeline with family silhouettes showing life stages
Printable: 16x9 landscape OR 11x8.5 landscape (8.5x11 rotated)
Design language: matches locked Teleport design system (silhouettes, no graphs, no color outside palette)

---

### Section 12: Lifestyle Spending Plan (Deliverable 2, LS_annual)

Year-by-year breakdown of lifestyle spending choices. This is the LE variable made human-readable.

Drillable to monthly detail. Feeds directly into Projection Engine as LE_one and LE_rec. Used to calculate Retirement_number, Runway_years, and Income_gap.

---

### Section 13: Open Items & Considerations for Builders

**Open items:**
Black County property tax rate — must be confirmed before modeling house purchase.
Housekeeping service cost — market-dependent, user input needed.
College contribution amount per child — user input.
Home furnishing budget at purchase — user input.
Disney Paris trip final cost — working budget $20,000.
Rome/Venice/Florence trip final cost — working budget $3,000-$5,000.
Clothing budget amounts by family size — TBD.
Aqua 401k match rate — confirm.
CPA tax set-aside % — confirm.

**Considerations for builders:**

Fixed vs. variable expense distinction: Some expenses (utilities, household items) do not scale proportionally with income but do increase with life events (new home, more kids). The model needs an elegant way to handle this. Flagged as open item — not solved for beta.

Percentage vs. dollar amount scaling: By default, most categories scale as a percentage of I_pred. User can override individual categories with a dollar amount, in which case the model scales that amount by inflation only, not income growth. The model should converge back to the percentage target over time as income grows to meet the dollar amount.

Income volatility: I_variable uses 3-month rolling average. This is conservative by design. Users with highly volatile commission income may want to adjust the rolling window. Flagged for future consideration.

Baby Step transitions: When the user moves from BS2 to BS3, the 24% previously allocated to debt becomes available. The model must reallocate this correctly — first to complete BS3, then to BS4, then to lifestyle events if user chooses. This transition is the primary lifestyle creep window.

V2 considerations:
Life expectancy as user input (desired lifespan). Currently defaults to age 90-95 planning horizon.
Baby Step target shifts modeled dynamically vs. hardcoded to BS2 for beta.
Statements inbox (email ingestion) as fallback if Plaid unavailable.
Scenario comparison: side-by-side retirement projections for saved scenarios.

**Note on Duvall framework:** Academically respected but criticized for assuming intact nuclear families. Works well for financial modeling of mainstream family compositions. Does not handle single parents, blended families, or non-traditional structures in its original form. Teleport's avatar system extends it to cover these cases.

---

*This document is a living spec. It will be compiled into Teleport Version X master document when complete. Last updated June 2026.*

---


---

### Section 14: Gap Analysis — Prototype vs. Full Spec

This section documents the delta between the current prototype (teleport-app2.jsx) and the full spec defined in this document. Use this as a build priority list.

---

#### 14.1 What the Prototype Already Has

Budget categories: BUDGET array has 8 of the 11 Ramsey categories implemented with dollar amounts and percentage targets. Functioning for display.

Baby Steps sequence: SEQUENCE array has all 10 steps in correct order with helper text. Toggle and completion state working.

Debt payoff report: Snowball and avalanche both implemented with 12-month balance projection table. DEBTS array has real balances and APRs.

Daily cash flow chart: generateCashMonth() produces day-by-day balance with real event timing (rent 1st, rental income 7th, Brittany pay 12th and 26th, minimums 15th, tax refund 19th, Discover payment 22nd). Low balance detection working.

Long-range projection chart: generateData() produces 30-year net worth, debt, income, and surplus curves. Multiple time horizons (1Y, 5Y, 10Y, 25Y) working.

Milestone timeline: MILESTONES array with toggleable events. Toggle mechanic working.

Insurance audit: INS array in the insurance report has all coverage types with recommended vs. current vs. status.

Do This Next: JUNE_TASKS and NEXT arrays have correct action items. Checkbox mechanic working.

Portfolio of reports: 15 reports listed. Several fully implemented (Net worth, Cash flow, Debt payoff, Budget, Real estate, Insurance, Estate, Tax position, Where decisions land you, What to do next).

---

#### 14.2 What Is Missing or Hardcoded

**Projection engine — hardcoded, not calculated:**
generateData() uses hardcoded estimates, not the formula stack defined in Section 1. Needs to be replaced with the real algorithm: S = (I_pred - BS4_alloc) - E_pred - NMDS - VE, fed through the Baby Steps priority array, with LE and AT events placed on the timeline, and INV compounding at growth_rate.

**Budget categories — incomplete:**
BUDGET array has 8 categories; needs all 11 (Savings and Retirement are missing as tracked line items, Debt needs to show NMDS separately from snowball extra payments).

**NMDS — not separated:**
Minimum debt service is not broken out as a separate variable from baseline expenses. The surplus formula needs NMDS extracted from E_pred and calculated dynamically based on current account balances and minimum payment formulas.

**Entity / profile model — not implemented:**
Britney is a photo in the household settings but not a full entity. No pay stub parsing, no per-entity deduction tracking, no insurance policy records connected to entities. Section 12 describes the full entity model needed.

**Lifestyle events — not connected to projection:**
MILESTONES are toggleable on the timeline but toggling them does not recompute the projection. LE_one and LE_rec need to feed E_total which feeds Retirement_number which feeds Income_gap. Every toggle should recompute all six output variables instantly.

**Scenario engine — not implemented:**
No scenario saving. No side-by-side comparison. No auto-optimize (cut lowest-priority events first until Income_gap reaches zero). Section 2.3 describes the full toggle and scenario mechanic.

**Age-triggered expenses (AT) — not in projection:**
No child age-triggered cost model. Braces, phones, teen driver insurance spikes, vehicles, and college are not projected forward based on child birthdates. Section 4 describes the AT variable and formulas.

**Adult age-related costs (E_age_adults) — not implemented:**
No healthcare cost increase model by parent age. E_age_adults is referenced in E_total but has no data or formula implementation yet. Flagged as a separate workstream.

**Daily balance for interest calculation — simplified:**
Current debt payoff table uses simplified monthly interest calculation. Section 13 specifies Average Daily Balance (ADB) method for credit cards. Beta can use simplified version; upgrade to ADB in v1.

**W-4 optimization — hardcoded:**
Tax position report shows the $13,000 refund and the fix, but does not calculate optimal W-4 withholding from actual income and deduction data. Needs to be driven by tax return and pay stub inputs.

**Investment waterfall — display only:**
WATERFALL array shows the correct order but is not connected to the projection engine. Once BS4 is active, the waterfall should drive how surplus above NMDS and lifestyle events is allocated to retirement vehicles.

**College funding — not projected:**
KIDS array shows graduation years but no 529 savings projections, no parental contribution amounts, and no impact on the retirement projection. Section 4 specifies college as a BS5 allocation from remaining surplus.

---

#### 14.3 Build Priority Order

Priority 1 — Foundation (nothing else works without these):
- Replace generateData() with real Projection Engine formula stack
- Separate NMDS from E_pred in surplus calculation
- Connect LE toggles to projection recomputation
- Add missing budget categories (Savings, Debt, Retirement) to BUDGET array

Priority 2 — Entity model and data sources:
- Build entity profile per household member
- Implement pay stub parsing (fixed and variable deductions)
- Connect retirement account detection to entity profile
- Build insurance audit from pay stub and policy document uploads

Priority 3 — Full lifestyle engine:
- Implement AT (age-triggered) events from child birthdates
- Implement E_age_adults curves per adult health status
- Build scenario save and compare mechanic
- Build auto-optimize scenario (cut lowest priority events to close Income_gap)

Priority 4 — Reporting and outputs:
- Wire all six output variables to live calculation
- Connect W-4 optimization to real tax data
- Implement ADB interest calculation for credit cards
- Build college funding projection in BS5

---


---

### Section 15: Lifestyle Event Field Audit & Input Requirements

This section documents every lifestyle event type, its required input fields, field patterns across events, and how suggestions are generated and costed.

---

#### 15.1 Field Patterns Across All Event Types

After auditing all events in the lifestyle categories, four field patterns emerge:

Pattern A — One-time purchase (house, car, trip, procedure)
Required fields: label, category (maps to Ramsey category), estimated_cost, target_date (date picker), inflation_adjusted_cost (calculated), notes (optional)

Pattern B — Recurring expense (massage, housekeeper, gym, clothing budget)
Required fields: label, category, monthly_amount, start_date (date picker), end_date or ongoing toggle, inflation_rate (default 3%), notes (optional)

Pattern C — Age-triggered event (braces, phone, car insurance spike, college)
Required fields: label, category, linked_dependent (select from household members), trigger_age, estimated_cost_today, inflation_adjusted_cost (auto-calculated to trigger year), notes (optional)
These are system-suggested, not user-entered from scratch.

Pattern D — Income-linked recurring (giving increase, investment contributions)
Required fields: label, category, percentage_of_income OR fixed_amount, start_date, tied_to_baby_step (select), notes (optional)

Date fields: All date inputs use a minimalist black and white calendar picker. Month/year selector at top; day grid below; confirm button at bottom. No color except black selection state. Matches Teleport design system exactly.

---

#### 15.2 Per-Event Field Requirements

Housing & Home:
- House purchase (Pattern A): estimated_cost, down_payment_pct, closing_cost_estimate, agent_commission_offset, target_date, property_tax_annual (user input, location-specific), mortgage_term, interest_rate_estimate
- Furnishings (Pattern A): estimated_cost, target_date, notes
- Housekeeper (Pattern B): monthly_amount, frequency (weekly/biweekly/monthly), start_date, ongoing toggle
- Renovation (Pattern A): estimated_cost, target_date, financing toggle (cash vs. loan), notes

Travel & Experiences:
- Family trip (Pattern A): estimated_cost, destination (text), number_of_travelers, target_date, notes
- Anniversary trip (Pattern A): estimated_cost, destination, travelers (2), target_date, notes
- Annual vacation (Pattern B): annual_amount, start_year, frequency (annually), notes

Personal Care & Wellness:
- Microneedling (Pattern B): annual_amount, sessions_per_year, cost_per_session (auto-calculates annual), start_date, notes
- CO2 laser (Pattern A, recurring): cost_per_treatment, frequency_years (every N years), first_treatment_date
- Massage (Pattern B): monthly_amount, start_date, ongoing toggle

Clothing:
- Family clothing budget (Pattern B): monthly_amount, start_date, ongoing toggle, notes

Children & Education:
- Activities (Pattern B): monthly_amount, start_date, end_date (when youngest finishes), notes
- Cell phones (Pattern C): monthly_add_per_child, trigger_age (default 12), linked_dependents (multi-select), stagger_by_age (auto-calculated)
- Braces (Pattern C): cost_per_child, trigger_age (default 9), insurance_coverage_pct (default 30%), net_cost_per_child, linked_dependents (multi-select)
- Teen driver insurance (Pattern C): annual_premium_increase_per_teen, trigger_age (default 16), linked_dependents, end_age (default 25 when rates normalize)
- First car (Pattern A + C): estimated_cost, trigger_age (default 16-17), linked_dependent, financing toggle
- College savings (Pattern D): monthly_amount OR percentage_of_income, start_date, per_child toggle, linked_dependents

Giving:
- Tithe (Pattern D): percentage_of_income (default 10%), tied_to_gross_or_net (toggle), start_date
- Extra giving (Pattern D): monthly_amount OR percentage, start_date, tied_to_baby_step

Vehicles:
- Vehicle purchase (Pattern A): estimated_cost, target_date, trade_in_value, financing toggle, notes
- Teen vehicles: see Children section above

---

#### 15.3 Suggestion Engine — AI-Driven Lifestyle Prompts

Based on the household profile (family size, child ages, health status, Baby Step stage), Teleport suggests likely lifestyle events the user may not have thought of. These appear as "Suggested" items within each category — not committed, not required, just surfaced for consideration.

Suggestion trigger model:
Each suggestion has a trigger condition based on one or more of: family_size, child_ages, parent_ages, baby_step_current, time_since_debt_free, income_level.

When a suggestion fires, it appears in the relevant category with:
- A "Suggested" label (no border box — just the text label inline)
- Estimated cost today (research-backed baseline)
- Inflation-adjusted cost at estimated trigger year
- Toggle to add to plan or dismiss

The Duvall Family Life Cycle framework (modified) drives the segmentation. Key stages: all children under 6, mixed under-6 and school-age, all school-age 6-12, includes teenagers 13+, launching 18+, empty nest. Suggestions shift as children age through these stages.

---

#### 15.4 Suggested Events Catalog (Research-Backed)

The following table documents every suggestion type, its trigger condition, baseline cost today, inflation formula, and source.

ORTHODONTICS / BRACES
Trigger: child_age >= 7 AND child_age <= 10 (evaluation recommended by AAO at age 7)
Baseline cost today (2026): Phase 1 treatment $2,000-$4,000; Phase 2 (full braces) $3,000-$7,000; combined estimate $5,000-$9,000 per child out of pocket before insurance
Insurance offset: 30-50% coverage common for children under 18; net estimate $3,500-$6,000 per child
Inflation formula: cost_today x (1.03 ^ (trigger_year - 2026))
Trigger year: child's age at treatment start = 9 for Phase 1, 12 for Phase 2
Source: AAO, Brockway Orthodontics 2026, Chacon Orthodontics 2026
Note: Four children = four orthodontic events staggered by age. Each child gets their own suggestion when they approach age 7.

TEEN DRIVER INSURANCE SPIKE
Trigger: child_age >= 14 (flag 2 years ahead of license age)
Baseline cost today (2026): adding a 16-year-old to parent policy averages $4,515-$5,740/year per Bankrate/Insurance.com 2026 data. On own policy: $7,658-$9,825/year (significantly higher). Recommend parent policy addition.
Gender adjustment: male teen +8-10% vs female teen
Inflation formula: premium_today x (1.03 ^ (trigger_year - 2026))
Trigger year: child's 16th birthday year
Duration: rates normalize by approximately age 25; model as 9-year recurring cost declining 8% annually after age 18
Source: Bankrate 2026, Insurance.com 2026, The Zebra 2025

FIRST VEHICLE FOR TEEN
Trigger: child_age >= 15, user has indicated willingness to buy cars for kids
Baseline cost today (2026): used reliable vehicle for teen $10,000-$18,000; new entry-level $22,000-$28,000
Recommendation: used vehicle strongly preferred — lower insurance, lower depreciation, lower total cost
Inflation formula: cost_today x (1.03 ^ (trigger_year - 2026))
Trigger year: child's 16th birthday year
Source: Kelley Blue Book 2026 used vehicle averages

CELL PHONE PLAN ADDITION
Trigger: child_age >= 10
Baseline cost today (2026): adding a line to family plan $20-$40/month; standalone kid plan $5-$15/month
Recommended: family plan addition — significantly cheaper
Inflation formula: monthly_cost x (1.03 ^ years_forward)
Trigger year: child's 12th birthday year (median first phone age per Pew Research)
Source: Major carrier plan pricing 2026

SUMMER CAMPS
Trigger: child_age >= 6 AND child_age <= 16
Baseline cost today (2026): day camp ages 6-12 $200-$400/week; specialty overnight camp ages 13+ $500-$1,500/session; typical spend $1,500-$4,000/child/summer for active families
Inflation formula: cost_today x (1.03 ^ years_forward)
Trigger year: current year if child is in range
Note: Scales with number of children. Four children in camp range simultaneously = $6,000-$16,000/summer at peak.

COLLEGE TUITION SAVINGS (529)
Trigger: child_age >= 10 OR baby_step >= 4
Baseline cost today (2026): in-state public university $28,000/year; out-of-state $46,000/year; private $60,000+/year. Four-year total: $112,000-$240,000+ per child.
Recommended savings target: $500-$1,000/month per child started at birth; $1,000-$2,000/month per child started at age 10
529 growth assumption: 7% annually compounded
Inflation formula: tuition_today x (1.04 ^ years_until_enrollment) (college inflation historically 4%/year)
Trigger year: when oldest child is 10 years from college, or when baby_step >= 4
Source: College Board Trends in College Pricing 2025-2026

HEALTHCARE COST INCREASES (ADULT)
Trigger: parent_age >= 45
Baseline cost today (2026): average annual healthcare out-of-pocket by age: 40s $3,500/year; 50s $5,500/year; 60s $8,200/year; 70s $11,300/year (Kaiser Family Foundation 2025)
Inflation formula: healthcare_cost_today x (1.05 ^ years_forward) (healthcare inflates at ~5%/year vs. general 3%)
Note: Adjust for health_status. Healthy: use baseline. Moderate: 1.3x baseline. Chronic: 1.8x baseline.
Source: KFF 2025 health spending data

HOME MAINTENANCE BUDGET
Trigger: homeowner = true
Baseline cost today (2026): 1-2% of home value annually. On a $450,000 home: $4,500-$9,000/year ($375-$750/month)
Inflation formula: home_value x 0.015 x (1.03 ^ years_forward) (scales with home value appreciation)
Note: New homes trend toward lower end (1%). Older homes trend toward higher end (1.5-2%).

LAWN CARE / LANDSCAPING SERVICE
Trigger: homeowner = true AND (family_size >= 4 OR both_parents_working = true)
Baseline cost today (2026): basic lawn service $100-$250/month depending on lot size and region
Inflation formula: monthly_cost x (1.03 ^ years_forward)

PET ACQUISITION AND CARE
Trigger: family_size >= 3 AND child_age_min >= 5 (kids old enough to care for pet)
Baseline cost today (2026): first-year pet costs $1,000-$3,000 (adoption, vet, supplies); annual ongoing $800-$2,000/year
Inflation formula: annual_cost x (1.03 ^ years_forward)
Note: Suggest only if not already in household profile

VACATION HOME / LAKE PROPERTY FUND
Trigger: baby_step >= 4 AND net_worth >= 200000
Baseline cost today (2026): highly variable by region; suggest starting a sinking fund at $500-$1,000/month toward a 20% down payment goal
Inflation formula: property_target x (1.04 ^ years_forward) (real estate appreciates ~4%/year)

ANNIVERSARY / COUPLES TRIPS
Trigger: married = true AND baby_step >= 3
Baseline cost today (2026): domestic weekend getaway $800-$2,000; international trip $3,000-$8,000
Inflation formula: trip_cost x (1.03 ^ years_forward)
Note: Suggest annually starting after debt-free date

ESTATE PLANNING REFRESH
Trigger: child_age_max >= 18 OR net_worth >= 500000 OR parent_age >= 50
Baseline cost today (2026): will update + POA refresh $500-$2,000 through attorney; online services $100-$300
Inflation formula: cost_today x (1.03 ^ years_forward)
Note: Suggest every 5-7 years or after major life event

LONG-TERM CARE INSURANCE
Trigger: parent_age >= 55
Baseline cost today (2026): policy starting at 55: $1,500-$3,000/year per person; starting at 65: $3,500-$8,000/year
Inflation formula: annual_premium x (1.05 ^ years_forward)
Note: Earlier purchase = lower premiums. Flag this when parent approaches age 55.


---

### Section 16: TypeScript Field Typing — Calculated vs. Static Numbers

#### 16.1 The Problem

TypeScript types all numbers as `number` by default. This means a static constant (like `withdrawal_rate = 0.04`) and a calculated output (like `Retirement_number = E_total / withdrawal_rate`) are indistinguishable at the type level. For a financial projection engine where every number must be auditable and traceable, this is a meaningful gap.

#### 16.2 Recommended Pattern — CalcField Wrapper

Rather than branded types (which enforce the distinction at compile time but lose the audit trail at runtime), use a wrapper object for every calculated field. This directly implements the "show the math" requirement from the Version X master document.

```typescript
type CalcField = {
  value: number;
  formula: string;       // human-readable formula name e.g. "E_total / withdrawal_rate"
  inputs: string[];      // variable names that fed this calculation
  calculatedAt: string;  // ISO timestamp of when this was computed
};

type StaticField = number; // plain number — a constant, a user input, or a lookup value
```

Example usage:

```typescript
// Static — user input or hardcoded constant
const withdrawal_rate: StaticField = 0.04;
const growth_rate: StaticField = 0.07;

// Calculated — wrapper with full audit trail
const Retirement_number: CalcField = {
  value: 5200000,
  formula: "E_total(retirement_year) / withdrawal_rate",
  inputs: ["E_total", "withdrawal_rate"],
  calculatedAt: new Date().toISOString(),
};

const Income_gap: CalcField = {
  value: 5200000 - 48000,
  formula: "Retirement_number - NW_annual(retirement_year)",
  inputs: ["Retirement_number", "NW_annual"],
  calculatedAt: new Date().toISOString(),
};
```

#### 16.3 What This Enables

Every CalcField carries its own provenance. The "show the math" feature — where a user taps any number and sees the formula and inputs that produced it — is built directly from this wrapper. No separate audit log needed; the data carries the audit trail.

The financial accuracy red team can verify any output by following the inputs chain. If Retirement_number looks wrong, you check its inputs array, pull each CalcField, check their inputs, and trace all the way back to StaticField constants and user inputs.

#### 16.4 All Calculated Fields in the Projection Engine

The following fields should be typed as CalcField. Everything else (user inputs, constants, lookup values) is StaticField.

S — Monthly predictable surplus. Formula: (I_pred - BS4_alloc) - E_pred - NMDS - VE
I_variable_trended — Trended variable income. Formula: ((M1 + M2 + M3) / 3) x 1.03
E_pred — Inflation-adjusted baseline expenses. Formula: E_baseline x 1.03^n
E_total — Fully adjusted total expenses. Formula: E_pred + LE_rec + E_age_adults(all) + AT(all)
BS1_months — Months to complete Baby Step 1. Formula: 1000 / S
BS2_months — Months to complete Baby Step 2. Formula: Total_debt / (S x BS2_pct)
BS3_target — Emergency fund target. Formula: E_pred x efund_months
BS3_months — Months to complete Baby Step 3. Formula: (BS3_target - 1000) / S
BS4_alloc — Monthly retirement contribution. Formula: I_pred x 0.15
NW_annual — Net worth at any given year. Formula: NW_prior + (Total_surplus - BS_alloc - LE_alloc - AT) + INV
Retirement_number — Amount needed at retirement. Formula: E_total(retirement_year) / withdrawal_rate
Income_gap — Retirement shortfall. Formula: Retirement_number - NW_annual(retirement_year)
Min_income_increase — Minimum income increase needed. Formula: Income_gap / years_to_retirement
Runway_years — Years retirement savings will last. Formula: NW_annual(retirement_year) / LE_annual
Principal_trend — Post-retirement net worth change. Formula: NW_annual(year+1) - NW_annual(year)
INV — Monthly investment growth. Formula: BS4_alloc x growth_rate / 12
inflated_cost — Any future cost inflation-adjusted. Formula: cost_today x (1.03 ^ years_forward)

#### 16.5 Static Fields (plain number)

withdrawal_rate — Default 0.04. User adjustable.
growth_rate — Default 0.07. User adjustable.
inflation_rate — Default 0.03. Fixed for beta.
efund_months — User input. 3 or 6.
BS2_pct — Default 0.24. Derived from Ramsey 11-category targets.
trigger_age — Per dependent, per event type. User input or system default.
healthcare_inflation_rate — Default 0.05. Fixed for beta.
college_inflation_rate — Default 0.04. Fixed for beta.


---

### Section 17: Icon Usage Exception — Lifestyle Categories

The Teleport design system prohibits decorative icons. However, lifestyle category navigation is an approved exception for the following reason: lifestyle categories represent emotional and aspirational choices (travel, wellness, giving, family). A small icon creates instant recognition and an emotional connection that plain text alone does not. This aids the user in quickly scanning and understanding which category covers which part of their life.

**Rules for this exception:**
- Icons are permitted ONLY in lifestyle category navigation lists (onboarding and plan tab)
- Icons must be simple, single-stroke SVG at 20-22px, using C.grey2 stroke color
- No filled icons, no colored icons, no icons outside of this specific context
- All other app screens follow the no-icon rule from the design system

---

### Section 18: Onboarding Flow → Main App Relationship

#### 18.1 Onboarding Runs Once

The lifestyle onboarding flow (LifestyleOnboarding.jsx) runs during initial setup as Step 4 of 5 in the onboarding sequence. After completion, the user does not see the onboarding flow again.

Onboarding steps (canonical, locked):
1. Sign up — passwordless (magic link or Google)
2. Connect accounts — Plaid Link
3. Confirm budget — AI reads transactions, user confirms
4. Plan your life — lifestyle onboarding (this flow)
5. See your future — plan, milestones, next step

#### 18.2 After Onboarding — Where Lifestyle Lives

After onboarding, the lifestyle plan is accessible from the Plan tab in the main app. The Plan tab (in teleport-app2.jsx) includes a "Lifestyle plan" item under the Inputs section. Tapping it opens the same category/toggle experience as the onboarding, but without the onboarding wrapper screens (no intro, no "Step 4 of 5", no "Save and continue").

The lifestyle visual (LifestyleVisual.jsx) is a separate tool — accessible from the Plan tab under Tools, and potentially as a standalone "Life view" section. It shows the family silhouette, year scrubber, budget snapshot, baby steps, and retirement tracking — not the onboarding flow.

#### 18.3 The Two React Apps Included With This Document

**LifestyleVisual.jsx** — the life stage visualization tool.
What it is: A three-tab React app showing the family silhouette timeline, budget snapshot by year, Baby Steps progress with completion years, retirement portfolio breakdown with two targets (spend-down $3.1M and preserve principal $5.2M), accomplished milestones, and upcoming events. Uses real household data for Chris and Britney.
Where it lives in the app: Plan tab → Tools → Life view. Also potentially as a home screen module.
Status: Prototype. Data is hardcoded to available snapshot years (2026, 2027, 2028, 2029, 2033, 2049). Needs wiring to the live projection engine.

**LifestyleOnboarding.jsx** — the lifestyle planning onboarding flow.
What it is: A five-screen React app (intro, categories, category detail, timeline, summary) that walks the user through selecting their lifestyle preferences. Includes all 7 Ramsey budget categories, toggle mechanics, custom item add/remove, master toggle list view, and a timeline view extending to age 110.
Where it lives in the app: Step 4 of onboarding. After onboarding, the same category/toggle interface lives in Plan tab → Lifestyle plan (without the onboarding wrapper).
Status: Prototype. Toggles work. Timeline is visual only — not yet wired to projection engine.

#### 18.4 Instructions for the Builder Agent

Read this document in full before starting any build work. The two React apps are working prototypes — they show the intended UX and data structure. Wire them into the live app using the projection engine formulas documented in Sections 1–3. The LifestyleVisual's hardcoded YEAR_DATA should be replaced with calculated outputs from the Projection Engine (Section 1). The LifestyleOnboarding's toggles should write to Supabase so they persist across sessions and feed the lifestyle engine (Section 4).

Priority order per the build operating system (Section 6 of Version X):
1. Security — all user data stays server-side
2. Aesthetics — design system is locked, no changes
3. The math is always code — no model computes numbers
4. Show the math — every calculated field must be traceable (Section 16)

---

### Section 19: Design Rules Consolidated for Builder Reference

These rules are locked. Do not change them without Chris's explicit approval.

**No grey boxes for content** — content sections are separated by hairlines (1px C.black or C.quiet) and whitespace only. The C.recessed color is used for the outer page background only, not for content cards or section dividers. This was explicitly called out and corrected during the design session.

**No icons except lifestyle category navigation** — see Section 17.

**No gradients, no shadows, no off-palette colors** — the palette is fixed: #111111, #444444, #767676, #ABABAB, #FFFFFF, #FAFAF8, #F1F1ED, #E3E3DE, #C42B1C, #9A9A9A. Nothing else.

**Attention = small red dot** — never an exclamation point, never a badge count, never a colored background. A single 8-9px red circle, right-justified.

**Numbers are tabular and right-aligned** — always use fontVariantNumeric: "tabular-nums" on financial figures.

**Type scale** — 9, 11, 14, 18, 23, 28. Body is 14/400/1.55. Labels are 11/600/1.4em tracking. No other sizes.

**Spacing** — Fibonacci: 8, 13, 21, 34, 55, 89. Standard content padding is 24px horizontal.

**The Teleport mark** — three squares stepping grey to white through a portal line. Do not modify.

**Sticky headers** — year/stage navigation headers should be position:sticky so users can change the year without scrolling back to top. This was explicitly requested during the design session.

**Timeline extends to age 110** — the lifestyle planning timeline (LifestyleOnboarding timeline screen) extends to approximately 2110 (Chris at age ~126 / planning horizon for generational wealth). In practice, show events through retirement and label the tail as "Legacy & generational wealth."
