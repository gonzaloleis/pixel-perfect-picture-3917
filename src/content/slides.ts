/**
 * Single source of truth for the CIPRI keynote.
 * Every on-screen text, number, chart point, build-step count, capture slot
 * and speaker note lives here. ALL NUMBERS ARE SAMPLE DATA.
 * Replace values here; components never hardcode content.
 */

export type CaptureSlot = {
  /** File inside /public/captures/ */
  file: string;
  description: string;
  width: number;
  height: number;
};

export const SAMPLE_DATA_LABEL = "SAMPLE DATA";
export const TIMER_TARGET_SECONDS = 240;
export const TIMER_WARNING_SECONDS = 220;

export const captures = {
  gantt: { file: "gantt.png", description: "Gantt chart · phases collapsed · baseline", width: 1000, height: 620 },
  resourceGraph: {
    file: "resource-graph.png",
    description: "Resource Graph · integration technician · Oct 2027",
    width: 760,
    height: 480,
  },
  costOverview: { file: "cost-overview.png", description: "Cost Overview report · by phase", width: 760, height: 420 },
  cashFlow: { file: "cash-flow.png", description: "Cash Flow report · baseline cost", width: 520, height: 320 },
} satisfies Record<string, CaptureSlot>;

export type Accent = "ink" | "amber" | "mint";

/* ---------------- Slide 1 ---------------- */
export const s1 = {
  title: "CIPRI Project Plan",
  subtitle: "From signed contract to an operational centre.",
  baseline: "BASELINE · 16 NOV 2026 → 31 MAY 2028 · 79 WEEKS",
  credit: "GPRO S.A. · Project Unit · Team 9",
};

/* ---------------- Slide 2 ---------------- */
export const s2 = {
  title: "Same solution. New contract.",
  headers: ["ITEM", "PRE-SALES OFFER", "SIGNED CONTRACT"] as const,
  rows: [
    { step: 1, item: "Price", offer: "€1,415,263", contract: "€975,000", accent: "amber" as Accent, count: true },
    { step: 1, item: "Start", offer: "Nov 2026", contract: "16 Nov 2026" },
    { step: 2, item: "First result", offer: "Infrastructure, Apr 2027", contract: "MVP in shadow mode, 30 Jun 2027" },
    { step: 2, item: "Full deployment", offer: "Apr 2028", contract: "29 Feb 2028" },
    { step: 3, item: "Before the campaign", offer: "4-week buffer", contract: "White march, Mar–May 2028" },
    { step: 3, item: "Final acceptance", offer: "Apr 2028", contract: "By 31 May 2028" },
  ],
  footer: "Architecture, suppliers and scope unchanged. Schedule and budget re-planned.",
};

/* ---------------- Slide 3 ---------------- */
export const s3 = {
  title: "10 phases. 142 tasks. 6 milestones.",
  phases: [
    ["00", "Project management"],
    ["01", "Initiation and planning"],
    ["02", "Design: data model and API"],
    ["03", "Infrastructure (layer 2)"],
    ["04", "Platforms (layers 1 and 3)"],
    ["05", "MVP in shadow mode"],
    ["06", "Summer: internal build"],
    ["07", "Regional integration (3 regions)"],
    ["08", "Integrated tests and full deployment"],
    ["09", "White march, drill and acceptance"],
  ] as const,
  capture: captures.gantt,
  stats: [
    { value: "142", unit: "tasks" },
    { value: "6", unit: "milestones" },
    { value: "375", unit: "working days" },
  ],
};

/* ---------------- Slide 4 ---------------- */
export const s4 = {
  title: "Every contractual date met.",
  start: { date: "2026-11-16", label: "16 NOV 2026" },
  end: { date: "2028-06-01", label: "1 JUN 2028" },
  bands: [
    { from: "2026-12-24", to: "2027-01-06", label: "CHRISTMAS CLOSURE", tone: "grey", step: 1 },
    { from: "2027-12-24", to: "2028-01-06", label: "CHRISTMAS CLOSURE", tone: "grey", step: 1 },
    { from: "2027-07-01", to: "2027-08-31", label: "SUMMER · LIMITED REGIONAL AVAILABILITY", tone: "amber", step: 1 },
    { from: "2028-03-01", to: "2028-05-31", label: "WHITE MARCH", tone: "ink", step: 4 },
  ] as const,
  milestones: [
    { step: 1, date: "2026-11-16", head: "M1 · 16 Nov 2026", text: "Kick-off and plan approved", slack: "ON TIME", accent: "mint" as Accent, side: "below", align: "start" },
    { step: 2, date: "2027-06-30", head: "M2 · 30 Jun 2027", text: "MVP in shadow mode (Madrid, Castilla-La Mancha)", slack: "+6 DAYS SLACK", accent: "mint" as Accent, side: "above", align: "start" },
    { step: 3, date: "2028-02-29", head: "M3 · 29 Feb 2028", text: "Full deployment, 5 regions", slack: "+4 DAYS SLACK", accent: "mint" as Accent, side: "below", align: "end" },
    { step: 4, date: "2028-05-31", head: "M4 · 31 May 2028", text: "Drill passed, final acceptance", slack: "0 DAYS SLACK", accent: "amber" as Accent, side: "above", align: "end" },
  ] as const,
  marker: { date: "2028-06-01", label: "1 JUN 2028 · CAMPAIGN", step: 4 },
  /** Fraction of the axis drawn at each step (1..4). */
  axisProgress: [0.3, 0.62, 0.9, 1],
};

/* ---------------- Slide 5 ---------------- */
export const s5 = {
  title: "7,290 hours across six units.",
  units: [
    { name: "Projects", hours: 3900, label: "3,900 h" },
    { name: "Applications", hours: 2100, label: "2,100 h" },
    { name: "Communications", hours: 650, label: "650 h" },
    { name: "Security", hours: 300, label: "300 h" },
    { name: "User Stations", hours: 220, label: "220 h" },
    { name: "Cloud", hours: 120, label: "120 h" },
  ],
  capture: captures.resourceGraph,
  cards: [
    { accent: "mint" as Accent, text: "Applications Unit levelled: training moved one week." },
    {
      accent: "amber" as Accent,
      text: "One overallocation accepted: integration technician, Oct 2027, 24 h overtime (limit 80 h/year), to protect full deployment.",
    },
  ],
};

/* ---------------- Slide 6 ---------------- */
export const s6 = {
  title: "Where the money goes.",
  /** Donut starts at this angle (degrees, 0 = 3 o'clock, clockwise). */
  donutStartDeg: 118,
  segments: [
    { name: "Personnel", value: 330000, label: "€330,000 · 32%", tone: 1 },
    { name: "Contracts and services", value: 215000, label: "€215,000 · 21%", tone: 0.28 },
    { name: "Material and licences", value: 420000, label: "€420,000 · 40%", tone: 0.55 },
  ],
  centre: { value: "€965,000", caption: "direct cost" },
  stack: {
    direct: { label: "Direct", value: 965000, text: "€965,000" },
    indirect: { label: "Indirect", value: 72900, text: "€72,900 (10 €/h × 7,290 h)" },
    total: { label: "Cost before profit", text: "€1,037,900" },
  },
  capture: captures.costOverview,
};

/* ---------------- Slide 7 ---------------- */
export const s7 = {
  title: "Planned value over time.",
  bac: { label: "BAC", value: "€1,037,900", caption: "Budget at completion (baseline)" },
  /** Cumulative planned cost (BCWS), €k */
  bcws: [
    ["Nov-26", 40], ["Dec-26", 140], ["Jan-27", 260], ["Feb-27", 330], ["Mar-27", 400],
    ["Apr-27", 470], ["May-27", 520], ["Jun-27", 570], ["Jul-27", 600], ["Aug-27", 620],
    ["Sep-27", 670], ["Oct-27", 720], ["Nov-27", 770], ["Dec-27", 815], ["Jan-28", 870],
    ["Feb-28", 920], ["Mar-28", 960], ["Apr-28", 1000], ["May-28", 1037.9],
  ] as [string, number][],
  /** Cumulative payments received, €k */
  payments: [
    { month: "Nov-26", value: 48.75, label: "M1 5%" },
    { month: "Jun-27", value: 390, label: "M2 35%" },
    { month: "Feb-28", value: 682.5, label: "M3 30%" },
    { month: "May-28", value: 975, label: "M4 30%" },
  ],
  yMax: 1100,
  yTicks: [250, 500, 750, 1000],
  lineLabels: { bcws: "BCWS", payments: "PAYMENTS" },
  prefinancing: { month: "May-27", label: "PRE-FINANCING · PEAK €330k (MAY 2027)" },
  capture: captures.cashFlow,
};

/* ---------------- Slide 8 ---------------- */
export const s8 = {
  title: "On time. Below cost.",
  time: {
    label: "TIME",
    headline: "All 4 contractual dates met",
    detail: "Full deployment 4 days early · final acceptance on the deadline",
  },
  cost: {
    label: "COST",
    headline: "€975,000 price vs €1,037,900 cost",
    detail: "Margin −€62,900 (−6.5%)",
  },
  waterfall: [
    { label: "Price", text: "€975,000", delta: 975000, kind: "total" },
    { label: "− Direct", text: "€965,000", delta: -965000, kind: "step" },
    { label: "− Indirect", text: "€72,900", delta: -72900, kind: "step" },
    { label: "Result", text: "−€62,900", delta: -62900, kind: "result" },
  ] as const,
  footer: "Accepted as a strategic project. Levers under review: SOC start date, indirect rate, white-march staffing.",
};

/* ---------------- Slide 9 ---------------- */
export const s9 = {
  title: "What the catalogue did not cover.",
  missing: {
    label: "MISSING TASKS",
    items: [
      "No task for the MVP in shadow mode — built from 'pilot operation' tasks.",
      "No task for the white march — reused 'assisted operation support'.",
      "No task for the 112 adapters — reused 'integration with external systems' five times.",
    ],
  },
  assumptions: {
    label: "ASSUMPTIONS",
    items: [
      "40 of 65 template resources removed as not applicable.",
      "Regional teams unavailable for tests in July and August 2027.",
      "Frequentis lead time: 14 weeks from the order.",
      "Indirect cost: 10 € per hour per resource.",
    ],
  },
  footer: "Recommendation: add MVP, white-march and adapter tasks to the company catalogue.",
};

/* ---------------- Slide 10 ---------------- */
export const s10 = {
  title: "Next: internal kick-off.",
  cards: [
    { date: "12 NOV 2026", name: "Internal kick-off", text: "Scope, milestones, team and roles" },
    { date: "13 NOV 2026", name: "Plan approved", text: "Baseline frozen in MS Project" },
    { date: "18 NOV 2026", name: "Client kick-off", text: "With TRAGSA and the DGPCE" },
  ],
  closing: { text: "Planned. Baselined. Ready to start.", mark: "GPRO · CIPRI" },
};

/* ---------------- Deck order ---------------- */
export type SlideMeta = { id: number; name: string; steps: number; sampleData: boolean; glow: boolean; notes: string };

export const slides: SlideMeta[] = [
  { id: 1, name: "Title", steps: 2, sampleData: true, glow: true, notes: "This is the baseline plan for CIPRI: from the official start on 16 November 2026 to final acceptance on 31 May 2028." },
  { id: 2, name: "What changed since the offer", steps: 3, sampleData: true, glow: false, notes: "The solution is the same we offered, but the contract changed: a lower price, an MVP in shadow mode by June 2027, full deployment by February 2028 and a white march before acceptance." },
  { id: 3, name: "WBS and tasks", steps: 3, sampleData: true, glow: false, notes: "We organised the plan in ten phases, from project management to the white march, with 142 tasks and six milestones." },
  { id: 4, name: "Milestones and deadlines", steps: 4, sampleData: true, glow: false, notes: "Every contractual date is met. The tightest point is final acceptance, which has no slack, so the white march protects it." },
  { id: 5, name: "Resources", steps: 3, sampleData: true, glow: false, notes: "The plan needs 7,290 hours. We levelled the Applications Unit and accepted one small overallocation, within the overtime limit." },
  { id: 6, name: "Cost breakdown", steps: 3, sampleData: true, glow: false, notes: "Direct cost is 965,000 euros; with indirect costs, the cost before profit is about 1.04 million." },
  { id: 7, name: "BAC and BCWS", steps: 3, sampleData: true, glow: false, notes: "The budget at completion is 1,037,900 euros. The S-curve shows planned value against payments: the peak of pre-financing is in May 2027." },
  { id: 8, name: "Margin and contract compliance", steps: 3, sampleData: true, glow: false, notes: "We meet all dates, but at the signed price the project runs a small loss. Management accepted it as strategic, and we are reviewing three levers." },
  { id: 9, name: "Problems with the catalogue", steps: 2, sampleData: true, glow: false, notes: "The catalogue had no tasks for the MVP, the white march or the adapters, so we adapted existing ones and recorded our assumptions." },
  { id: 10, name: "Next steps", steps: 3, sampleData: true, glow: true, notes: "Next step: the internal kick-off on 12 November, then the client kick-off on the 18th." },
];
