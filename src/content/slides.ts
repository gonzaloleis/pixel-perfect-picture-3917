/**
 * Single source of truth for the CIPRI keynote.
 * Every on-screen text, number, chart point, build-step count, capture slot
 * and speaker note lives here. FINAL PROJECT DATA (Nov 2026).
 * Replace values here; components never hardcode content.
 */

export type CaptureSlot = {
  /** File inside /public/captures/ */
  file: string;
  description: string;
  width: number;
  height: number;
};

export const SAMPLE_DATA_LABEL = "Sample data";
export const TIMER_TARGET_SECONDS = 240;
export const TIMER_WARNING_SECONDS = 220;

export const captures = {
  gantt: { file: "gantt.png", description: "Gantt chart with baseline, phases collapsed", width: 1000, height: 620 },
  resourceGraph: {
    file: "resource-graph.png",
    description: "Resource usage, client staff overallocations",
    width: 1620,
    height: 240,
  },
  costOverview: { file: "cost-overview.png", description: "Cost overview report", width: 650, height: 436 },
  cashFlow: { file: "cash-flow.png", description: "Cash flow report, baseline cost", width: 460, height: 352 },
} satisfies Record<string, CaptureSlot>;

export type Accent = "ink" | "blue" | "amber" | "mint";

/* ---------------- Slide 1 ---------------- */
export const s1 = {
  title: "CIPRI Project Plan",
  subtitle: "From signed contract to an operational centre.",
  baseline: "Baseline from 16 November 2026 to 16 May 2028, 18 months",
  credit: "GPRO S.A., Project Unit, Team 9",
};

/* ---------------- Slide 2 ---------------- */
export const s2 = {
  title: "Same solution. New contract.",
  headers: ["Item", "Pre-sales offer", "Signed contract", "Our baseline"] as const,
  rows: [
    {
      step: 1,
      item: "Price",
      offer: "1.444.330 €",
      contract: "975.000 € (−32,5 %)",
      baseline: "Budget 1.256.501 €",
      accent: "amber" as Accent,
      count: true,
    },
    { step: 1, item: "MVP in shadow mode", offer: "Not in the offer", contract: "By 30 Jun 2027", baseline: "25 Jun 2027" },
    { step: 2, item: "Full deployment", offer: "Apr 2028", contract: "By 29 Feb 2028", baseline: "14 Feb 2028" },
    { step: 2, item: "Final acceptance", offer: "28 Apr 2028", contract: "By 31 May 2028", baseline: "16 May 2028" },
    {
      step: 3,
      item: "Payment milestones",
      offer: "4 (5, 35, 30, 30 %)",
      contract: "3 to 5, first up to 5 %",
      baseline: "5 (5, 30, 15, 30, 20 %)",
    },
    { step: 3, item: "GPRO staff hours", offer: "7.630 h", contract: "Not fixed", baseline: "11.255 h" },
  ],
  footer:
    "Architecture and scope unchanged, with SÉNECA as incident platform as agreed at the pitch. Schedule and budget re-planned from the company catalogue.",
};

/* ---------------- Slide 3 ---------------- */
export const s3 = {
  title: "77 tasks. 9 milestones. One baseline.",
  phases: [
    ["1", "Project management"],
    ["2", "Initiation and planning"],
    ["3", "Design: requirements, data model and APIs"],
    ["4", "Infrastructure (layer 2)"],
    ["5", "Platforms (layers 1 and 3)"],
    ["6", "MVP in shadow mode"],
    ["7", "Summer 2027: internal build"],
    ["8", "Integration of the other 3 regions"],
    ["9", "Integrated tests and full deployment"],
    ["10", "White march, drill and acceptance"],
    ["11", "Recurring services until acceptance"],
    ["12", "Indirect costs and contingency"],
  ] as const,
  capture: captures.gantt,
  /** Planning-assistant status line; shown while checked phases < `until`. */
  status: [
    { until: 5, text: "Building WBS…" },
    { until: 9, text: "Linking dependencies…" },
    { until: 12, text: "Assigning resources…" },
    { until: 13, text: "Baseline saved" },
  ],
  stats: [
    { value: "77", unit: "tasks" },
    { value: "9", unit: "milestones", sub: "5 of them payment milestones" },
    { value: "362", unit: "working days" },
  ],
};

/* ---------------- Slide 4 ---------------- */
export const s4 = {
  title: "Every contractual date met.",
  /** Month ruler range (first day of first month → first day after last month). */
  ruler: { from: "2026-11-01", to: "2028-07-01" },
  /** Phase bars. `lane` 0/1: phases that overlap in time sit on the second lane. */
  phases: [
    { name: "Initiation and design", from: "2026-11-16", to: "2027-03-10", lane: 0 },
    { name: "Infrastructure and platforms", from: "2026-11-19", to: "2027-06-04", lane: 1 },
    { name: "MVP", from: "2027-03-10", to: "2027-09-03", lane: 0 },
    { name: "Summer build", from: "2027-06-28", to: "2027-08-25", lane: 1 },
    { name: "Regional integration", from: "2027-09-06", to: "2027-11-18", lane: 0 },
    { name: "Tests and full deployment", from: "2027-11-19", to: "2028-02-14", lane: 1 },
    { name: "White march and drill", from: "2028-02-15", to: "2028-05-16", lane: 0 },
  ],
  /** Constraint bands drawn across the ruler, no text on them. */
  bands: [
    { from: "2026-12-24", to: "2027-01-07", tone: "grey" },
    { from: "2027-12-24", to: "2028-01-07", tone: "grey" },
    { from: "2027-07-01", to: "2027-09-01", tone: "amber" },
  ] as const,
  legend: {
    grey: "Christmas closure",
    amber: "Limited regional availability",
    note: "Slack in working days, planned date vs deadline",
  },
  milestones: [
    {
      step: 1,
      date: "2026-11-23",
      title: "23 Nov 2026",
      lines: ["M1 Kick-off and plan approved"],
      deadline: "Deadline: 30 Nov 2026, payment 5 %",
      pill: "5 days of slack",
      accent: "mint" as Accent,
    },
    {
      step: 2,
      date: "2027-04-09",
      title: "9 Apr 2027",
      lines: ["M2 Design and infrastructure", "GIS in service, platforms delivered"],
      deadline: "Deadline: 30 Apr 2027, payment 30 %",
      pill: "15 days of slack",
      accent: "mint" as Accent,
    },
    {
      step: 3,
      date: "2027-06-25",
      title: "25 Jun 2027",
      lines: ["M3 MVP in shadow mode", "Madrid and Castilla-La Mancha"],
      deadline: "Deadline: 30 Jun 2027, payment 15 %",
      pill: "3 days of slack",
      accent: "amber" as Accent,
    },
    {
      step: 4,
      date: "2028-02-14",
      title: "14 Feb 2028",
      lines: ["M4 Full deployment", "All 5 regions in live exchange"],
      deadline: "Deadline: 29 Feb 2028, payment 30 %",
      pill: "11 days of slack",
      accent: "mint" as Accent,
    },
    {
      step: 5,
      date: "2028-05-16",
      title: "16 May 2028",
      lines: ["M5 Drill passed, final acceptance"],
      deadline: "Deadline: 31 May 2028, payment 20 %",
      pill: "11 days of slack",
      accent: "mint" as Accent,
    },
  ],
  marker: { date: "2028-06-01", label: "Campaign starts 1 June 2028" },
};

/* ---------------- Slide 5 ---------------- */
export const s5 = {
  title: "11.255 hours across seven units.",
  units: [
    { name: "Applications", hours: 6744, label: "6.744 h" },
    { name: "Projects and Operations Management", hours: 2018, label: "2.018 h" },
    { name: "Communications", hours: 994, label: "994 h" },
    { name: "Security", hours: 517, label: "517 h" },
    { name: "Cloud", hours: 400, label: "400 h" },
    { name: "User Stations", hours: 304, label: "304 h" },
    { name: "Finance (legal and purchasing)", hours: 278, label: "278 h" },
  ],
  capture: captures.resourceGraph,
  cards: [
    { accent: "mint" as Accent, text: "No GPRO resource overallocated. 0 h of overtime." },
    {
      accent: "amber" as Accent,
      text: "Client staff overallocated by the catalogue minimums. At peak: 4 DGPCE technicians (catalogue: 1), 5 TRAGSA technicians (3) and 2 TRAGSA commission directors (1). No cost to GPRO; requested at the client kick-off.",
    },
  ],
};

/* ---------------- Slide 6 ---------------- */
export const s6 = {
  title: "Where the money goes.",
  /** Donut starts at this angle (degrees, 0 = 3 o'clock, clockwise). */
  donutStartDeg: -50,
  /** Clockwise from donutStartDeg. Percentages must add up to 100. */
  segments: [
    { name: "GPRO staff", value: 388976, label: "388.976 € (36 %)", tone: 1 },
    { name: "Services and contracts", value: 229662, label: "229.662 € (21 %)", tone: 0.7 },
    { name: "Licences", value: 280000, label: "280.000 € (26 %)", tone: 0.45 },
    { name: "Equipment and installations", value: 185478, label: "185.478 € (17 %)", tone: 0.25 },
  ],
  centre: { value: "1.084.116 €", caption: "direct cost" },
  stack: {
    direct: { label: "Direct", value: 1084116, text: "1.084.116 €" },
    indirect: { label: "Indirect", value: 112552, text: "112.552 € (10 €/h × 11.255 h)" },
    contingency: { label: "Contingency", value: 59833, text: "59.833 € (5 %)" },
    total: { label: "Budget at completion (BAC)", text: "1.256.501 €" },
  },
  capture: captures.costOverview,
};

/* ---------------- Slide 7 ---------------- */
export const s7 = {
  title: "Planned value over time.",
  bac: {
    label: "BAC",
    value: "1.256.501 €",
    caption: "Budget at completion (baseline, includes indirect costs and contingency)",
  },
  /** Cumulative planned cost (BCWS), €k */
  bcws: [
    ["Nov-26", 18.8], ["Dec-26", 54.6], ["Jan-27", 231.9], ["Feb-27", 508.8], ["Mar-27", 554.7],
    ["Apr-27", 600.5], ["May-27", 636.0], ["Jun-27", 668.2], ["Jul-27", 826.0], ["Aug-27", 877.0],
    ["Sep-27", 931.8], ["Oct-27", 979.2], ["Nov-27", 1026.3], ["Dec-27", 1064.0], ["Jan-28", 1100.7],
    ["Feb-28", 1141.1], ["Mar-28", 1188.4], ["Apr-28", 1227.5], ["May-28", 1256.5], ["Jun-28", 1256.5],
  ] as [string, number][],
  /** Last month on the X axis (final payment; BCWS stays flat at the BAC after acceptance). */
  endMonth: "Jun-28",
  /** Cumulative payments received, €k (collected one month after each milestone). */
  payments: [
    { month: "Dec-26", value: 48.75, label: "M1 5 %" },
    { month: "May-27", value: 341.25, label: "M2 30 %" },
    { month: "Jul-27", value: 487.5, label: "M3 15 %" },
    { month: "Mar-28", value: 780, label: "M4 30 %" },
    { month: "Jun-28", value: 975, label: "M5 20 %" },
  ],
  yMax: 1250,
  yTicks: [0, 250, 500, 750, 1000, 1250],
  lineLabels: { bcws: "BCWS", payments: "Payments" },
  /** Amber labels in the shaded gap, right-aligned to the next payment step. */
  peaks: [
    { month: "Apr-27", label: "Peak financing need: 347.892 € (April 2027)" },
    { month: "Feb-28", label: "Second peak: 219.889 € (February 2028)" },
  ],
  notes: [
    "Payments collected one month after each milestone.",
    "Steep steps in January and February 2027 (licences, UPS, network, firewalls) and July 2027 (workstations and video wall).",
  ],
  capture: captures.cashFlow,
};

/* ---------------- Slide 8 ---------------- */
export const s8 = {
  title: "On time. Below cost, by decision.",
  time: {
    label: "Time",
    headline: "All 5 milestones on time",
    detail: "Every contractual deadline met; the tightest is the MVP, with 3 days of slack",
  },
  cost: {
    label: "Cost",
    headline: "975.000 € price vs 1.265.996 € full cost",
    detail: "Margin −290.996 € (−29,8 %)",
    cash: "Cash result +210.531 €",
  },
  waterfall: [
    { label: "Price", text: "975.000 €", delta: 975000, kind: "total" },
    { label: "− Direct", text: "1.084.116 €", delta: -1084116, kind: "step" },
    { label: "− Indirect", text: "112.552 €", delta: -112552, kind: "step" },
    { label: "− Contingency", text: "59.833 €", delta: -59833, kind: "step" },
    { label: "− Financing", text: "9.495 €", delta: -9495, kind: "step" },
    { label: "Result", text: "−290.996 €", delta: -290996, kind: "result" },
  ] as const,
  footer:
    "The price cut explains 92 % of the margin drop. Accepted by management as a strategic investment, without cutting the signed scope. The price covers every payment to third parties and leaves +210.531 € in cash: the loss is GPRO's own staff time.",
};

/* ---------------- Slide 9 ---------------- */
export const s9 = {
  title: "What the catalogue did not cover.",
  missing: {
    label: "Gaps in the catalogue",
    items: [
      "No continuous project management task: the project manager only appears in specific tasks (528 h vs 2.520 h in the offer).",
      "No complete UPS, building network or access control: added at Deliverable 1 prices (30.000 €, 12.528 € and 3.000 €).",
      "No annual support fees: services modelled as recurring tasks until acceptance.",
      "Client staff in the catalogue below the minimums of Text1 at peak periods.",
    ],
  },
  assumptions: {
    label: "Assumptions",
    items: [
      "SÉNECA as incident platform: 12 weeks from the order, as agreed at the pitch.",
      "M2 means GIS in service, simulator and SÉNECA delivered.",
      "MVP operators use provisional workstations until July 2027.",
      "Regional teams unavailable for tests in July and August 2027.",
      "Indirect cost 10 € per hour, contingency 5 %, client staff at 0 €.",
    ],
  },
  footer:
    "Recommendation: add a continuous project management task, support fees and room fit-out items to the company catalogue.",
};

/* ---------------- Slide 10 ---------------- */
export const s10 = {
  title: "Next: internal kick-off.",
  cards: [
    { date: "16 November 2026", name: "Internal kick-off", text: "9:00 to 11:00, scope, milestones, team and roles" },
    {
      date: "19 November 2026",
      name: "Client kick-off",
      text: "Platforms ordered (GIS, simulator and SÉNECA) and kick-off with TRAGSA and the DGPCE",
    },
    { date: "23 November 2026", name: "M1: plan approved", text: "First payment, 5 % (48.750 €)" },
  ],
  closing: { text: "Planned. Baselined. Ready to start.", mark: "GPRO S.A." },
};

/* ---------------- Deck order ---------------- */
export type SlideMeta = { id: number; name: string; steps: number; sampleData: boolean; glow: boolean; notes: string };

export const slides: SlideMeta[] = [
  {
    id: 1,
    name: "Title",
    steps: 2,
    sampleData: false,
    glow: true,
    notes: "This is the baseline plan for CIPRI: from the official start on 16 November 2026 to final acceptance on 16 May 2028.",
  },
  {
    id: 2,
    name: "What changed since the offer",
    steps: 3,
    sampleData: false,
    glow: false,
    notes: "The solution is the same we offered, but the contract changed: a lower price, an MVP in shadow mode by June 2027, full deployment by February 2028 and a white march before acceptance.",
  },
  {
    id: 3,
    name: "WBS and tasks",
    steps: 3,
    sampleData: false,
    glow: false,
    notes: "We organised the plan in twelve work packages, from project management to indirect costs and contingency, with 77 tasks and nine milestones.",
  },
  {
    id: 4,
    name: "Milestones and deadlines",
    steps: 5,
    sampleData: false,
    glow: false,
    notes: "Five payment milestones, each planned ahead of its contractual deadline. The tightest is the MVP in shadow mode, with 3 days of slack; all the others have at least five.",
  },
  {
    id: 5,
    name: "Resources",
    steps: 3,
    sampleData: false,
    glow: false,
    notes: "The plan needs 11.255 hours across seven units. No GPRO resource is overallocated; the catalogue under-staffs the client's own teams at peak periods, which we raise at the client kick-off.",
  },
  {
    id: 6,
    name: "Cost breakdown",
    steps: 3,
    sampleData: false,
    glow: false,
    notes: "Direct cost is 1.084.116 euros; with indirect costs and contingency, the budget at completion is 1.256.501 euros.",
  },
  {
    id: 7,
    name: "BAC and BCWS",
    steps: 3,
    sampleData: false,
    glow: false,
    notes: "The budget at completion is 1.256.501 euros. Five payments, each collected one month after its milestone. The financing need peaks at about 347.892 euros in April 2027, with a second peak of about 219.889 euros in February 2028.",
  },
  {
    id: 8,
    name: "Margin and contract compliance",
    steps: 3,
    sampleData: false,
    glow: false,
    notes: "We meet every milestone. At the signed price the project runs a loss of 290.996 euros, accepted by management as a strategic investment. The price covers every payment to third parties and leaves a positive cash result of 210.531 euros; the loss is our own staff time.",
  },
  {
    id: 9,
    name: "Problems with the catalogue",
    steps: 2,
    sampleData: false,
    glow: false,
    notes: "The catalogue had no continuous project management task, no room fit-out items and no support fees, so we adapted existing tasks and recorded our assumptions.",
  },
  {
    id: 10,
    name: "Next steps",
    steps: 3,
    sampleData: false,
    glow: true,
    notes: "Next step: the internal kick-off on 16 November, orders and the client kick-off on the 19th, and M1, the approved plan, on the 23rd.",
  },
];
