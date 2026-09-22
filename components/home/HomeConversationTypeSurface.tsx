"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONVERSATION_TYPES,
  getConversationTypeBaselineAssumptions,
  type ConversationType,
} from "@/lib/george/live-entry/conversation-types";
import {
  clearPreparationSession,
  loadPreparationSession,
  loadLivePreparationSignals,
  markLivePreparationPreviewReady,
  savePreparationSession,
  saveLivePreparationSignals,
} from "@/lib/george/live-browser/live-preparation-browser-storage";
import {
  createPreparationSession,
  normalizePreparationInteractions,
  projectPreparationSessionForLiveRuntime,
  type PreparationCheckpoint,
  type PreparationQuestion,
  type PreparationSessionV1,
} from "@/lib/george/live-runtime/live-preparation-controller";
import {
  NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
  type NormalLiveOperationalJudgmentResult,
  type OperationalPreparationTurnClassification,
  type OperationalPreparationReadinessJudgment,
} from "@/lib/george/runtime/operational-judgment";

import type {
  OperationalFormula,
} from "@/lib/george/operational-memory/types";


type ConversationCategory = {
  id: string;
  label: string;
  description: string;
  conversationTypeIds: readonly string[];
};

type HomepageRole = {
  id: string;
  label: string;
  category: string;
  conversationTypeId: string;
  featured?: boolean;
  summary: string;
  capabilities: readonly string[];
  relevantGoalIds?: readonly string[];
};

type HomepagePriorInteraction = {
  key: string;
  question: string;
  example?: string;
  answer: string;
  status: "answered" | "skipped";
  evidenceNeed?: string;
  purpose?: "live_scope_grounding" | "qualification";
};

function SelectionAcknowledgement({ label }: { label: string }) {
  return (
    <div className="mt-2 inline-flex max-w-full items-center rounded-[12px] border border-white/[0.14] bg-white/[0.03] px-4 py-2">
      <span className="truncate font-mono text-[14px] font-semibold uppercase tracking-[0.12em] text-white sm:text-[15px]">
        {label}
      </span>
    </div>
  );
}

const HOMEPAGE_ROLES: readonly HomepageRole[] = [
  {
    id: "salesperson",
    label: "Salesperson",
    category: "Sales & Outreach",
    conversationTypeId: "discovery-call",
    featured: true,
    summary:
      "Uncovering hidden buyer pain points through structured discovery, handling unexpected competitive threats smoothly, or locking down immediate purchase commitments before ending a call.",
    capabilities: [
      "Discovery and qualification",
      "Rhetorical flow",
      "Value framing",
      "Objection handling",
      "Transitions",
      "Closing and next steps",
      "Recovery",
      "Adapting to buyer reaction",
    ],
  },
  {
    id: "executive",
    label: "Executive",
    category: "Conversation starters",
    conversationTypeId: "executive-presentation",
    featured: true,
    summary:
      "Aligning divided board members behind a single strategy, managing corporate reputation under pressure, or delivering critical structural feedback without breaking team morale.",
    capabilities: ["Decision framing", "Evidence", "Risk", "Executive clarity"],
    relevantGoalIds: [
      "make-decision",
      "present-strategy",
      "negotiate",
      "lead-difficult-meeting",
      "align-stakeholders",
      "defend-recommendation",
      "deliver-feedback",
    ],
  },
  {
    id: "job-seeker",
    label: "Job Seeker",
    category: "Conversation starters",
    conversationTypeId: "prep-my-interview",
    featured: true,
    summary:
      "Navigating intense panels and technical Q&A sessions, pulling up specific portfolio metrics instantly, or confidently defending salary requirements during an offer discussion.",
    capabilities: [
      "Accomplishments",
      "Metrics",
      "STAR examples",
      "Company research",
      "Difficult questions",
      "Recovery",
    ],
    relevantGoalIds: [
      "win-interview",
      "negotiate-compensation",
      "receive-offer",
      "pass-technical-interview",
      "build-confidence",
    ],
  },
  {
    id: "scientist",
    label: "Scientist",
    category: "Conversation starters",
    conversationTypeId: "other-work",
    featured: true,
    summary:
      "Defending complex experimental data to a non-technical board of directors, translating dense engineering metrics for commercial investors, or cleanly passing an intense academic panel review.",
    capabilities: ["Relevant facts", "Questions", "Clarity", "Next steps"],
  },
  {
    id: "educator",
    label: "Educator",
    category: "Conversation starters",
    conversationTypeId: "teach-a-lesson",
    featured: true,
    summary:
      "Translating dense academic material into effortless clarity, managing sudden classroom behavioral shifts, or defending curriculum decisions directly to a school board.",
    capabilities: ["Explanation", "Examples", "Pacing", "Adaptation"],
    relevantGoalIds: [
      "teach-lesson",
      "present-research",
      "secure-curriculum-support",
    ],
  },
  {
    id: "other",
    label: "Other",
    category: "Conversation starters",
    conversationTypeId: "other-work",
    featured: true,
    summary:
      "Recovering cleanly when a spontaneous client conversation changes direction, pulling up forgotten project details instantly, or keeping any unexpected discussion moving toward your target objective.",
    capabilities: ["Clarity", "Recall", "Adaptation", "Next steps"],
  },
  {
    id: "telemarketer",
    label: "Telemarketer",
    category: "Sales & Outreach",
    conversationTypeId: "set-appointment",
    featured: true,
    summary:
      "Breaking through initial cold call resistance, maintaining absolute energy across hundreds of dials, or instantly pivoting to a fresh angle the moment a prospect tries to hang up.",
    capabilities: [
      "Openings and first impressions",
      "Pacing and conversational control",
      "Gatekeeper and screener handling",
      "Objection handling",
      "Recovery after difficult moments",
      "Appointment setting",
      "Consistency across high call volume",
      "Adapting when another strategy performs better",
    ],
  },
  {
    id: "influencer",
    label: "Influencer",
    category: "Presentation & Media",
    conversationTypeId: "create-a-broadcast-script",
    featured: true,
    summary:
      "Hitting every required sponsor brand message naturally, maintaining high-energy charismatic pacing on a live stream, or conducting seamless, unscripted interviews with guest creators.",
    capabilities: [
      "Rhetorical flow",
      "Pacing",
      "Emphasis",
      "Transitions",
      "Recovery",
      "Audience engagement",
      "Sponsor messages",
      "Clarity and confidence",
      "Adapting to audience reaction",
    ],
    relevantGoalIds: [
      "deliver-presentation",
      "keep-audience-engaged",
      "stay-on-message",
      "conduct-interview",
      "present-sponsor-messages",
      "recover-train-thought",
      "respond-audience-reactions",
    ],
  },
  {
    id: "founder",
    label: "Founder",
    category: "Business & Leadership",
    conversationTypeId: "investor-pitch",
    featured: true,
    summary:
      "Securing vital capital during high-stakes venture investor pitches, defending company valuations, or winning over key early hires on the ultimate company vision.",
    capabilities: [
      "Pitch structure",
      "Executive presence",
      "Clear explanation",
      "Handling difficult questions",
      "Negotiation",
      "Transitions",
      "Recovery",
      "Maintaining the objective",
    ],
    relevantGoalIds: [
      "raise-capital",
      "pitch-business",
      "defend-valuation",
      "explain-strategy",
      "negotiate",
      "recruit-key-person",
      "secure-partnership",
    ],
  },
  {
    id: "attorney",
    label: "Attorney",
    category: "Legal",
    conversationTypeId: "make-my-case",
    featured: true,
    summary:
      "Protecting sensitive case strategy under intense cross-examination, exposing critical logical flaws in an opponent's witness testimony, or delivering airtight legal arguments in a deposition.",
    capabilities: [
      "Argument structure",
      "Question sequencing",
      "Rhetorical emphasis",
      "Responding under pressure",
      "Transitions",
      "Recovery",
      "Clarity",
      "Adapting to the listener or forum",
    ],
    relevantGoalIds: [
      "make-case",
      "prepare-questioning",
      "answer-difficult-questions",
      "protect-key-facts",
      "negotiate",
      "present-argument",
      "maintain-legal-boundaries",
    ],
  },
  {
    id: "recruiter",
    label: "Recruiter",
    category: "Sales & Outreach",
    conversationTypeId: "networking-conversation",
    featured: true,
    summary:
      "Screening passive executive-level candidates, uncovering resume discrepancies during phone screens, or selling top-tier talent on company culture to close a competitive hire.",
    capabilities: [
      "Candidate engagement",
      "Discovery",
      "Opportunity framing",
      "Handling hesitation",
      "Pacing",
      "Follow-up",
      "Recovery",
      "Adapting to candidate reaction",
    ],
    relevantGoalIds: [
      "evaluate-candidate",
      "conduct-interview",
      "sell-opportunity",
      "uncover-inconsistencies",
      "negotiate-compensation",
      "deliver-feedback",
      "resolve-employee-issue",
    ],
  },
  {
    id: "account-executive",
    label: "Account Executive",
    category: "Sales & Outreach",
    conversationTypeId: "close-the-sale",
    summary: "Advance complex opportunities through discovery, negotiation, stakeholder alignment, and closing.",
    capabilities: ["Discovery", "Stakeholder alignment", "Negotiation", "Objection handling", "Closing", "Recovery"],
  },
  {
    id: "customer-service-representative",
    label: "Customer Service Representative",
    category: "Service & Support",
    conversationTypeId: "resolve-customer-complaint",
    summary: "Identify the issue quickly, de-escalate when needed, explain clearly, and move toward resolution.",
    capabilities: ["Issue identification", "De-escalation", "Clarity", "Empathy", "Resolution", "Escalation judgment"],
  },
  {
    id: "real-estate-agent",
    label: "Real Estate Agent",
    category: "Advisory & Property",
    conversationTypeId: "real-estate-offer",
    summary: "Guide buyers, sellers, and prospects through offers, objections, negotiation, and next steps.",
    capabilities: ["Prospecting", "Needs discovery", "Offer presentation", "Negotiation", "Objection handling", "Closing"],
  },
  {
    id: "financial-advisor",
    label: "Financial Advisor",
    category: "Advisory & Property",
    conversationTypeId: "secure-financing",
    summary: "Explain complex choices clearly, build trust, surface concerns, and guide a client toward an informed decision.",
    capabilities: ["Trust building", "Clear explanation", "Discovery", "Risk communication", "Questions", "Next steps"],
  },
  {
    id: "insurance-agent",
    label: "Insurance Agent",
    category: "Advisory & Property",
    conversationTypeId: "insurance-claim",
    summary: "Explain coverage, identify needs, answer objections, and guide the conversation toward an appropriate decision.",
    capabilities: ["Needs discovery", "Coverage explanation", "Objection handling", "Trust", "Follow-up", "Closing"],
  },
  {
    id: "manager",
    label: "Manager",
    category: "Business & Leadership",
    conversationTypeId: "performance-review",
    summary: "Lead meetings, feedback, performance, alignment, and difficult conversations with clarity and control.",
    capabilities: ["Meeting leadership", "Feedback", "Alignment", "Difficult conversations", "Clarity", "Recovery"],
  },
  {
    id: "consultant",
    label: "Consultant",
    category: "Business & Leadership",
    conversationTypeId: "present-my-proposal",
    summary: "Present recommendations, explain tradeoffs, answer challenges, and move clients toward a decision.",
    capabilities: ["Recommendation structure", "Presentation", "Question handling", "Clarity", "Persuasion", "Next steps"],
  },
  {
    id: "plaintiff",
    label: "Plaintiff",
    category: "Legal",
    conversationTypeId: "make-a-civil-case",
    summary: "Prepare to explain events, impact, evidence, and the result being sought with clarity and consistency.",
    capabilities: ["Chronology", "Clarity", "Evidence framing", "Question response", "Composure", "Recovery"],
  },
  {
    id: "defendant",
    label: "Defendant",
    category: "Legal",
    conversationTypeId: "make-a-criminal-case",
    summary: "Prepare to communicate clearly under pressure while preserving consistency, composure, and the intended position.",
    capabilities: ["Clear response", "Composure", "Question handling", "Consistency", "Recovery", "Pacing"],
  },
  {
    id: "witness",
    label: "Witness",
    category: "Legal",
    conversationTypeId: "make-my-case",
    summary: "Answer carefully, stay within what is known, maintain clarity, and recover when questioning becomes difficult.",
    capabilities: ["Question response", "Pacing", "Clarity", "Composure", "Consistency", "Recovery"],
  },
  {
    id: "podcaster",
    label: "Podcaster",
    category: "Presentation & Media",
    conversationTypeId: "record-a-podcast",
    summary: "Structure episodes and interviews, maintain flow, recover naturally, and keep listeners engaged.",
    capabilities: ["Flow", "Interview transitions", "Pacing", "Emphasis", "Recovery", "Audience engagement"],
  },
  {
    id: "public-speaker",
    label: "Public Speaker",
    category: "Presentation & Media",
    conversationTypeId: "deliver-a-keynote",
    summary: "Deliver presentations with stronger pacing, emphasis, transitions, audience engagement, and recovery.",
    capabilities: ["Rhetorical flow", "Pacing", "Emphasis", "Transitions", "Audience engagement", "Recovery"],
  },
  {
    id: "teacher",
    label: "Teacher",
    category: "Education",
    conversationTypeId: "teach-a-lesson",
    summary: "Explain ideas clearly, maintain attention, transition between concepts, and adapt to learner response.",
    capabilities: ["Explanation", "Pacing", "Transitions", "Engagement", "Questions", "Adaptation"],
  },
  {
    id: "student",
    label: "Student",
    category: "Education",
    conversationTypeId: "present-my-proposal",
    summary: "Present, interview, participate, and explain ideas with greater clarity, confidence, and structure.",
    capabilities: ["Presentation", "Interview response", "Clarity", "Confidence", "Pacing", "Recovery"],
  },
];

const FEATURED_HOMEPAGE_ROLES = HOMEPAGE_ROLES.filter((role) => role.featured);

type HomepageGoal = { id: string; label: string };

const HOMEPAGE_GOALS: readonly HomepageGoal[] = [
  { id: "close-sale", label: "Close a sale" },
  { id: "set-appointment", label: "Set an appointment" },
  { id: "protect-margin", label: "Protect margin" },
  { id: "advance-buyer", label: "Advance the buyer to the next step" },
  { id: "win-interview", label: "Win the interview" },
  { id: "negotiate-compensation", label: "Negotiate compensation" },
  { id: "teach-lesson", label: "Teach a lesson" },
  { id: "present-research", label: "Present research" },
  { id: "secure-curriculum-support", label: "Secure curriculum support" },
  { id: "receive-offer", label: "Receive an offer" },
  { id: "pass-technical-interview", label: "Pass the technical interview" },
  { id: "build-confidence", label: "Build confidence" },
  { id: "deliver-presentation", label: "Deliver a presentation" },
  { id: "keep-audience-engaged", label: "Keep the audience engaged" },
  { id: "stay-on-message", label: "Stay on message" },
  { id: "conduct-interview", label: "Conduct an interview" },
  { id: "present-sponsor-messages", label: "Present sponsor messages" },
  { id: "respond-audience-reactions", label: "Respond to audience reactions" },
  { id: "make-decision", label: "Make a decision" },
  { id: "present-strategy", label: "Present a strategy" },
  { id: "lead-difficult-meeting", label: "Lead a difficult meeting" },
  { id: "align-stakeholders", label: "Align stakeholders" },
  { id: "defend-recommendation", label: "Defend a recommendation" },
  { id: "deliver-feedback", label: "Deliver performance feedback" },
  { id: "make-case", label: "Make my case" },
  { id: "prepare-questioning", label: "Prepare for questioning" },
  { id: "protect-key-facts", label: "Protect key facts" },
  { id: "present-argument", label: "Present an argument" },
  { id: "maintain-legal-boundaries", label: "Maintain legal boundaries" },
  { id: "raise-capital", label: "Raise capital" },
  { id: "pitch-business", label: "Pitch the business" },
  { id: "defend-valuation", label: "Defend the valuation" },
  { id: "explain-strategy", label: "Explain the strategy" },
  { id: "recruit-key-person", label: "Recruit a key person" },
  { id: "secure-partnership", label: "Secure a partnership" },
  { id: "evaluate-candidate", label: "Evaluate a candidate" },
  { id: "sell-opportunity", label: "Sell the opportunity" },
  { id: "uncover-inconsistencies", label: "Uncover inconsistencies" },
  { id: "resolve-employee-issue", label: "Resolve an employee issue" },
  { id: "present-idea", label: "Present an idea" },
  { id: "persuade", label: "Persuade" },
  { id: "resolve-conflict", label: "Resolve a conflict" },
  { id: "explain-something", label: "Explain something clearly" },
  { id: "lead-meeting", label: "Lead a meeting" },
  { id: "handle-difficult-questions", label: "Handle difficult questions" },
  { id: "other", label: "Other..." },
];

const UNIVERSAL_GOAL_IDS = [
  "present-idea",
  "persuade",
  "negotiate",
  "resolve-conflict",
  "explain-something",
  "lead-meeting",
  "handle-difficult-questions",
  "other",
] as const;

const BASELINE_GOAL_IDS = new Set([
  "handle-objection",
  "answer-difficult-questions",
  "explain-experience",
  "present-qualifications",
  "recover-train-thought",
  "keep-audience-engaged",
  "stay-on-message",
  "conduct-interview",
  "respond-audience-reactions",
  "answer-questions",
  "adapt-explanation",
  "manage-difficult-discussion",
]);

function goalsForHomepageRole(role: HomepageRole | null) {
  const ids = role?.relevantGoalIds?.length
    ? role.relevantGoalIds
    : UNIVERSAL_GOAL_IDS;
  const goalsById = new Map(HOMEPAGE_GOALS.map((goal) => [goal.id, goal]));
  return ids
    .filter((id) => !BASELINE_GOAL_IDS.has(id))
    .map((id) => goalsById.get(id))
    .filter(Boolean) as HomepageGoal[];
}



const CONVERSATION_CATEGORIES: readonly ConversationCategory[] = [
  {
    id: "business",
    label: "Business",
    description: "Meetings, proposals, partnerships, clients, and organizational decisions.",
    conversationTypeIds: [
      "lead-my-meeting",
      "present-my-proposal",
      "handle-tough-questions",
      "executive-presentation",
      "budget-discussion",
      "vendor-negotiation",
      "partnership-discussion",
      "project-kickoff",
      "deliver-a-status-update",
      "crisis-communication",
    ],
  },
  {
    id: "sales",
    label: "Sales",
    description: "Prospecting, discovery, objections, closing, retention, and customer growth.",
    conversationTypeIds: [
      "negotiate-a-sale",
      "set-professional-appointment",
      "sell-anything",
      "set-appointment",
      "handle-objections",
      "discovery-call",
      "close-the-sale",
      "client-follow-up",
      "retain-a-client",
      "resolve-customer-complaint",
      "ask-for-referral",
      "contract-renewal",
      "price-increase",
      "collections-call",
      "customer-success-review",
      "product-demo",
    ],
  },
  {
    id: "career",
    label: "Career",
    description: "Interviews, compensation, performance, leadership, and professional growth.",
    conversationTypeIds: [
      "prep-my-interview",
      "ask-for-a-raise",
      "request-a-promotion",
      "salary-negotiation",
      "networking-conversation",
      "performance-review",
      "ask-for-feedback",
      "give-feedback",
      "address-underperformance",
      "manage-up",
      "delegate-work",
      "align-on-priorities",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    description: "Financing, lending, investment, insurance, contracts, and property decisions.",
    conversationTypeIds: [
      "secure-financing",
      "discuss-a-loan",
      "investor-pitch",
      "fundraising-meeting",
      "real-estate-offer",
      "insurance-claim",
      "contract-discussion",
      "estate-planning-discussion",
      "housing-negotiation",
    ],
  },
  {
    id: "legal-civic",
    label: "Legal / Civic",
    description: "Cases, formal arguments, public positions, appeals, and civic communication.",
    conversationTypeIds: [
      "make-my-case",
      "make-a-civil-case",
      "make-a-criminal-case",
      "hold-a-political-debate",
      "public-comment",
      "insurance-appeal",
    ],
  },
  {
    id: "media-speaking",
    label: "Media / Speaking",
    description: "Keynotes, broadcasts, interviews, panels, podcasts, and public delivery.",
    conversationTypeIds: [
      "deliver-a-keynote",
      "create-a-broadcast-script",
      "record-a-podcast",
      "press-interview",
      "media-interview",
      "panel-discussion",
      "moderate-a-discussion",
    ],
  },
  {
    id: "science-education",
    label: "Science / Education",
    description: "Complex ideas, lessons, workshops, and knowledge made understandable.",
    conversationTypeIds: [
      "articulate-thermonuclear-physics",
      "teach-a-lesson",
      "lead-a-workshop",
    ],
  },
  {
    id: "sports-culture",
    label: "Sports / Culture",
    description: "Sports theory, history, culture, and wider public meaning.",
    conversationTypeIds: [
      "explain-basketball-theory",
      "explain-history-of-any-sport",
      "explain-pop-culture",
    ],
  },
  {
    id: "personal",
    label: "Personal",
    description: "Relationships, boundaries, repair, family, care, and difficult decisions.",
    conversationTypeIds: [
      "have-a-difficult-conversation",
      "resolve-a-conflict",
      "set-a-boundary",
      "ask-for-something-important",
      "parent-teacher-conference",
      "therapy-conversation",
      "family-decision",
      "apologize-and-repair",
      "end-a-relationship",
      "co-parenting-conversation",
    ],
  },
];

function CategoryDescriptor({ category }: { category: ConversationCategory }) {
  return (
    <div
      className="flex min-h-[64px] flex-col justify-center rounded-[10px] border-l-2 border-[#6F91DE]/70 bg-[#172347]/28 px-4 py-3"
      title={category.description}
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
        {category.label}
      </div>
      <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/68">
        {category.description}
      </div>
    </div>
  );
}

type SurfacePhase =
  | "selection"
  | "goal"
  | "introduction"
  | "decision"
  | "optional"
  | "review";

type FormulaSurfaceMode = "closed" | "review";

type FormulaResponse = {
  ok: boolean;
  formulas?: OperationalFormula[];
  error?: string;
};

type HomepageOptionalQuestion = PreparationQuestion;

type HomepageConversationMode = "live_briefing" | "preparation";

type HomepageConversationSequence = {
  stage:
    | "question"
    | "transitioning"
    | "acknowledgment"
    | "response"
    | "clarification";
  message: string;
};

type HomepageHeldAmbiguousTurn = {
  submission: string;
  pendingQuestion: HomepageOptionalQuestion;
  currentClassification: HomepageConversationMode;
};

type HomepageOperationalJudgmentAuthorization = {
  request: typeof NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST;
  source: "operational_judgment";
  entrySource: "homepage";
  preparationSessionId: string;
  shouldAcquire: true;
  requestedSignal: string;
  reason: string;
  purpose?: "live_scope_grounding" | "qualification";
};

const HOMEPAGE_INTELLIGENCE_TIERS = [
  {
    id: "smart",
    shortLabel: "S",
    label: "Smart",
    explanation: "Fast, focused support.",
  },
  {
    id: "intelligent",
    shortLabel: "I",
    label: "Intelligent",
    explanation: "Deeper reasoning and adaptation.",
  },
  {
    id: "brilliant",
    shortLabel: "B",
    label: "Brilliant",
    explanation:
      "Highest available reasoning for complex or consequential conversations.",
  },
] as const;

const HOMEPAGE_SELECTED_TIER_STORAGE_KEY =
  "george_live_home_selected_tier";

function homepageSelectedTierStorageKey(payload: {
  authenticated?: boolean;
  email?: unknown;
  source?: unknown;
}) {
  const identity = payload.authenticated
    ? String(payload.email || payload.source || "authenticated")
        .trim()
        .toLowerCase()
    : "anonymous";

  return `${HOMEPAGE_SELECTED_TIER_STORAGE_KEY}:${encodeURIComponent(identity)}`;
}

function isHomepageMissionTier(value: unknown): value is HomepageMissionTier {
  return (
    value === "smart" || value === "intelligent" || value === "brilliant"
  );
}

function useTypewriter(text: string, enabled: boolean, speed = 28) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
    if (!enabled || !text) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(text);
      return;
    }

    let index = 0;
    const interval = Math.max(
      8,
      Math.min(speed, Math.floor(900 / Math.max(text.length, 1))),
    );
    const timer = window.setInterval(() => {
      index += 1;
      setValue(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, interval);

    return () => window.clearInterval(timer);
  }, [enabled, speed, text]);

  return value;
}

function HomepageRoleCard({
  role,
  onSelect,
  featured = false,
  selected = false,
  receded = false,
}: {
  role: HomepageRole;
  onSelect: (role: HomepageRole) => void;
  featured?: boolean;
  selected?: boolean;
  receded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      aria-pressed={selected}
      className={`bx-command-shimmer group flex items-center justify-between gap-3 rounded-[14px] border text-left transition-[border-color,background-color,transform,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.99] ${
        selected
          ? "border-[#AEB6FF]/75 bg-[#172347] opacity-100"
          : featured
          ? "min-h-[88px] border-white/[0.28] bg-[#050505] px-5 py-4 hover:border-white/[0.58] hover:bg-[#0B0B0C]"
          : "min-h-[64px] border-white/[0.12] bg-[#08090A] px-4 py-3 hover:border-white/[0.24] hover:bg-[#0D0F12]"
      } ${receded ? "opacity-30 hover:opacity-70" : "opacity-100"} ${
        selected && featured ? "min-h-[88px] px-5 py-4" : ""
      } ${selected && !featured ? "min-h-[64px] px-4 py-3" : ""}`}
    >
      <div>
        <h3 className="font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-white">
          {role.label}
        </h3>
        {featured ? (
          <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/48">
            {role.summary}
          </p>
        ) : null}
      </div>
      <span className="shrink-0 text-[14px] text-white/72 transition group-hover:translate-x-0.5 group-hover:text-white">
        →
      </span>
    </button>
  );
}

function homepageOperationalPromise(
  role: HomepageRole | null,
  goal: string | null,
) {
  const capabilities = role?.capabilities.slice(0, 3) || [
    "the relevant facts",
    "strong responses",
    "the next move",
  ];
  const sentence = `I’ll help you prepare ${capabilities.join(", ")} while you keep the conversation moving.`;
  const objective = String(goal || "").trim();

  return objective
    ? `${sentence} I’ll keep “${objective}” in view as we prepare.`
    : sentence;
}

type HomepageMissionTier = "smart" | "intelligent" | "brilliant";

function homepageTierRank(tier: HomepageMissionTier) {
  if (tier === "smart") return 0;
  if (tier === "intelligent") return 1;
  return 2;
}

function homepageMissionLimit(tier: HomepageMissionTier) {
  if (tier === "smart") return 1;
  if (tier === "intelligent") return 2;
  return Number.POSITIVE_INFINITY;
}

function homepageOperationalUnderstanding(
  role: HomepageRole | null,
  missions: readonly string[],
) {
  const roleLabel = role?.label || "professional";
  const missionParts = missions
    .map((mission) => {
      const [verb, ...rest] = mission.split(" ");
      const gerunds: Record<string, string> = {
        Answer: "answering",
        Close: "closing",
        Conduct: "conducting",
        Defend: "defending",
        Deliver: "delivering",
        Explain: "explaining",
        Handle: "handling",
        Keep: "keeping",
        Lead: "leading",
        Make: "making",
        Negotiate: "negotiating",
        Persuade: "persuading",
        Pitch: "pitching",
        Present: "presenting",
        Prepare: "preparing",
        Protect: "protecting",
        Raise: "raising",
        Recruit: "recruiting",
        Recover: "recovering",
        Resolve: "resolving",
        Respond: "responding",
        Secure: "securing",
        Sell: "selling",
        Set: "setting",
        Stay: "staying",
        Teach: "teaching",
        Uncover: "uncovering",
        Win: "winning",
      };
      return [gerunds[verb] || verb.toLowerCase(), ...rest].join(" ");
    });
  const missionText =
    missionParts.length <= 1
      ? missionParts[0] || "moving toward your objective"
      : missionParts.length === 2
        ? missionParts.join(" and ")
        : `${missionParts.slice(0, -1).join(", ")}, and ${missionParts.at(-1)}`;

  return `You're preparing for a ${roleLabel.toLowerCase()} conversation where success depends on ${missionText}.`;
}

function homepageOperationalSupport(
  role: HomepageRole | null,
  outcome: string,
) {
  const resolvedOutcome = String(outcome || "").trim();

  if (resolvedOutcome) {
    return `I'll help you prepare to ${resolvedOutcome.toLowerCase()} before the conversation begins.`;
  }

  const capabilities = role?.capabilities.slice(0, 3) || [
    "the strongest evidence",
    "likely resistance",
    "next moves",
  ];

  return `I'll help you prepare ${capabilities.join(", ")} before the conversation begins.`;
}

export function HomeConversationTypeSurface() {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const homepagePreparationSeedRef = useRef<PreparationSessionV1 | null>(null);
  const homepageAssessmentSequenceRef = useRef(0);
  const homepageConversationSequenceRef = useRef(0);
  const homepageAssessmentAbortRef = useRef<AbortController | null>(null);
  const homepageAssessmentInFlightRef = useRef(false);
  const tierDisclosureTimeoutRef = useRef<number | null>(null);
  const lastTierPointerTypeRef = useRef<string | null>(null);
  const mobileLockedTierArmedRef = useRef<HomepageMissionTier | null>(null);
  const selectedTierStorageKeyRef = useRef(
    `${HOMEPAGE_SELECTED_TIER_STORAGE_KEY}:anonymous`,
  );
  const [selectedType, setSelectedType] = useState<ConversationType | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<HomepageRole | null>(null);
  const [outcomeDraft, setOutcomeDraft] = useState("");

const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [missionTier, setMissionTier] = useState<HomepageMissionTier | null>(
    null,
  );
  const [entitledMissionTier, setEntitledMissionTier] =
    useState<HomepageMissionTier | null>(null);
  const [disclosedMissionTier, setDisclosedMissionTier] =
    useState<HomepageMissionTier | null>(null);
  const [tierAuthorityResolved, setTierAuthorityResolved] = useState(false);
  const [customMissionOpen, setCustomMissionOpen] = useState(false);
  const [assumptionCorrectionOpen, setAssumptionCorrectionOpen] = useState(false);
  const [assumptionCorrection, setAssumptionCorrection] = useState("");
  const [adaptiveUnderstanding, setAdaptiveUnderstanding] = useState("");
  const [adaptiveUnderstandingOutcome, setAdaptiveUnderstandingOutcome] = useState("");
  const [adaptiveDirections, setAdaptiveDirections] = useState<string[]>([]);
  const [understandingUpdatePending, setUnderstandingUpdatePending] = useState(false);
  const [missionCollapsing, setMissionCollapsing] = useState(false);

  const [showAllRoles, setShowAllRoles] = useState(false);
  const [phase, setPhase] = useState<SurfacePhase>("selection");
  const [introStage, setIntroStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [briefingSufficient, setBriefingSufficient] = useState(false);
  const [preparationReadiness, setPreparationReadiness] =
    useState<OperationalPreparationReadinessJudgment | null>(null);
  const [optionalQuestion, setOptionalQuestion] =
    useState<HomepageOptionalQuestion | null>(null);
  const [optionalAnswer, setOptionalAnswer] = useState("");
  const [acceptedConversationMode, setAcceptedConversationMode] =
    useState<HomepageConversationMode>("live_briefing");
  const [pendingExplicitConversationMode, setPendingExplicitConversationMode] =
    useState<HomepageConversationMode | null>(null);
  const [homepageConversationSequence, setHomepageConversationSequence] =
    useState<HomepageConversationSequence>({
      stage: "question",
      message: "",
    });
  const [homepageConversationError, setHomepageConversationError] =
    useState("");
  const [heldAmbiguousTurn, setHeldAmbiguousTurn] =
    useState<HomepageHeldAmbiguousTurn | null>(null);
  const [editingOptionalQuestionKey, setEditingOptionalQuestionKey] =
    useState<string | null>(null);
  const [optionalAnswers, setOptionalAnswers] = useState<Record<string, string>>({});
  const [optionalQuestionHistory, setOptionalQuestionHistory] =
    useState<Record<string, string>>({});
  const [skippedOptionalQuestions, setSkippedOptionalQuestions] =
    useState<string[]>([]);
  const [optionalQuestionLoading, setOptionalQuestionLoading] = useState(false);
  const [currentUnderstandingRevision, setCurrentUnderstandingRevision] =
    useState("");
  const [currentUnderstandingDraft, setCurrentUnderstandingDraft] =
    useState("");
  const [editingCurrentUnderstanding, setEditingCurrentUnderstanding] =
    useState(false);
  const [currentUnderstandingStatus, setCurrentUnderstandingStatus] =
    useState<"idle" | "editing" | "preserved">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [formulaSurfaceMode, setFormulaSurfaceMode] =
    useState<FormulaSurfaceMode>("closed");
  const [accessibleFormulas, setAccessibleFormulas] = useState<
    OperationalFormula[]
  >([]);
  const [formulaLoading, setFormulaLoading] = useState(false);
  const [formulaError, setFormulaError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/session", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Session authority unavailable.");
        }

        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const grantedTier: HomepageMissionTier = isHomepageMissionTier(
          payload?.tier,
        )
          ? payload.tier
          : "smart";
        const selectionStorageKey = homepageSelectedTierStorageKey(payload);
        const persistedSelection =
          window.localStorage.getItem(selectionStorageKey);
        const selectedTier =
          isHomepageMissionTier(persistedSelection) &&
          homepageTierRank(persistedSelection) <= homepageTierRank(grantedTier)
            ? persistedSelection
            : grantedTier;

        setEntitledMissionTier(grantedTier);
        setMissionTier(selectedTier);
        selectedTierStorageKeyRef.current = selectionStorageKey;
        window.localStorage.setItem("george_tier", grantedTier);
        window.localStorage.setItem(selectionStorageKey, selectedTier);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTierAuthorityResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      homepageAssessmentSequenceRef.current += 1;
      homepageConversationSequenceRef.current += 1;
      homepageAssessmentAbortRef.current?.abort();
      homepageAssessmentAbortRef.current = null;
      homepageAssessmentInFlightRef.current = false;
      if (tierDisclosureTimeoutRef.current !== null) {
        window.clearTimeout(tierDisclosureTimeoutRef.current);
      }
    },
    [],
  );

  function discloseMissionTier(
    tier: HomepageMissionTier,
    temporary = false,
  ) {
    if (tierDisclosureTimeoutRef.current !== null) {
      window.clearTimeout(tierDisclosureTimeoutRef.current);
      tierDisclosureTimeoutRef.current = null;
    }

    setDisclosedMissionTier(tier);

    if (temporary) {
      tierDisclosureTimeoutRef.current = window.setTimeout(() => {
        setDisclosedMissionTier(null);
        mobileLockedTierArmedRef.current = null;
        tierDisclosureTimeoutRef.current = null;
      }, 2400);
    }
  }

  function selectHomepageMissionTier(tier: HomepageMissionTier) {
    if (!tierAuthorityResolved || !entitledMissionTier) return;

    const available =
      homepageTierRank(tier) <= homepageTierRank(entitledMissionTier);
    const mobileTap = lastTierPointerTypeRef.current === "touch";

    discloseMissionTier(tier, mobileTap);

    if (!available) {
      if (mobileTap && mobileLockedTierArmedRef.current !== tier) {
        mobileLockedTierArmedRef.current = tier;
        return;
      }

      window.location.assign(`/activate?tier=${tier}&intent=be-${tier}`);
      return;
    }

    mobileLockedTierArmedRef.current = null;
    setMissionTier(tier);
    window.localStorage.setItem(selectedTierStorageKeyRef.current, tier);
  }

  const activeFormula = useMemo(() => {
    if (!selectedType || accessibleFormulas.length === 0) return null;

    const conversationId = selectedType.id.trim().toLowerCase();
    const conversationTitle = selectedType.title.trim().toLowerCase();

    const ranked = accessibleFormulas
      .filter((formula) => formula.status !== "retired")
      .map((formula) => {
        const roomTypes = (formula.roomTypes || []).map((value) =>
          value.trim().toLowerCase(),
        );
        const bestUsedFor = (formula.bestUsedFor || []).map((value) =>
          value.trim().toLowerCase(),
        );
        const formulaName = String(formula.name || "").trim().toLowerCase();

        let score = formula.confidence || 0;

        if (roomTypes.includes(conversationId)) score += 4;
        if (roomTypes.includes(conversationTitle)) score += 3;
        if (formulaName.includes(conversationTitle)) score += 2;
        if (
          bestUsedFor.some(
            (value) =>
              value.includes(conversationTitle) ||
              conversationTitle.includes(value),
          )
        ) {
          score += 1;
        }

        if (formula.status === "validated") score += 0.5;
        if (formula.status === "candidate") score -= 0.15;

        return { formula, score };
      })
      .sort((left, right) => right.score - left.score);

    return ranked[0]?.formula || null;
  }, [accessibleFormulas, selectedType]);

  async function openFormulaReview() {
    setFormulaSurfaceMode("review");
    setFormulaError("");

    if (accessibleFormulas.length > 0 || formulaLoading) return;

    setFormulaLoading(true);

    try {
      const response = await fetch(
        "/api/george/operational-memory/formulas",
        { cache: "no-store" },
      );
      const payload = (await response.json()) as FormulaResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load formula");
      }

      setAccessibleFormulas(payload.formulas || []);
    } catch (error) {
      setFormulaError(
        error instanceof Error ? error.message : "Unable to load formula",
      );
    } finally {
      setFormulaLoading(false);
    }
  }

  function closeFormulaReview() {
    setFormulaSurfaceMode("closed");
    setFormulaError("");
  }

  const visibleRoleGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const roles = HOMEPAGE_ROLES.filter((role) => {
      if (!query) return true;
      return [
        role.label,
        role.category,
        role.summary,
        ...role.capabilities,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    const groups = new Map<string, HomepageRole[]>();

    for (const role of roles) {
      const current = groups.get(role.category) || [];
      current.push(role);
      groups.set(role.category, current);
    }

    return Array.from(groups.entries()).map(([category, categoryRoles]) => ({
      category,
      roles: categoryRoles,
    }));
  }, [searchQuery]);

  const visibleRoleCount = useMemo(
    () =>
      visibleRoleGroups.reduce(
        (count, group) => count + group.roles.length,
        0,
      ),
    [visibleRoleGroups],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const shouldRestoreBriefReview =
      params.get("restore") === "brief-review";

    if (!shouldRestoreBriefReview) return;

    const restoredAnswers = loadLivePreparationSignals();
    setAnswers(restoredAnswers);

    const restoredPreparationSession = loadPreparationSession();
    if (restoredPreparationSession?.provenance.entrySource === "homepage") {
      homepagePreparationSeedRef.current = restoredPreparationSession;
    }

    try {
      const rawSnapshot = window.sessionStorage.getItem(
        "GEORGE_HOMEPAGE_BRIEF_REVIEW_SNAPSHOT",
      );

      if (rawSnapshot) {
        const snapshot = JSON.parse(rawSnapshot) as {
          conversationTypeId?: string;
          answers?: Record<string, string>;
          optionalAnswers?: Record<string, string>;
          optionalQuestionHistory?: Record<string, string>;
          skippedOptionalQuestions?: string[];
          priorInteractions?: HomepagePriorInteraction[];
        };

        const restoredConversation = CONVERSATION_TYPES.find(
          (option) => option.id === snapshot.conversationTypeId,
        );

        if (restoredConversation) {
          setSelectedType(restoredConversation);
          setSelectedRole(
            HOMEPAGE_ROLES.find(
              (role) => role.conversationTypeId === restoredConversation.id,
            ) || null,
          );
        }

        if (snapshot.answers) {
          setAnswers(snapshot.answers);
        }

        if (snapshot.optionalAnswers) {
          setOptionalAnswers(snapshot.optionalAnswers);
        }

        if (snapshot.optionalQuestionHistory) {
          setOptionalQuestionHistory(snapshot.optionalQuestionHistory);
        }

        if (Array.isArray(snapshot.skippedOptionalQuestions)) {
          setSkippedOptionalQuestions(snapshot.skippedOptionalQuestions);
        }
      }
    } catch {}

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      setPhase("review");

      secondFrame = window.requestAnimationFrame(() => {
        surfaceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        window.history.replaceState({}, "", window.location.pathname);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    if (phase !== "introduction") return;

    setIntroStage(0);

    const introductionText =
      selectedRole?.summary ||
      "I’ll carry your selected role and objective into preparation.";
    const typewriterDuration = introductionText.length * 24;

    const typewriterTimer = window.setTimeout(() => setIntroStage(1), 180);
    const customizeTimer = window.setTimeout(
      () => setIntroStage(2),
      typewriterDuration + 520,
    );
    const startTimer = window.setTimeout(
      () => setIntroStage(3),
      typewriterDuration + 1450,
    );

    return () => {
      window.clearTimeout(typewriterTimer);
      window.clearTimeout(customizeTimer);
      window.clearTimeout(startTimer);
    };
  }, [phase]);

  const optionalQuestionText = useTypewriter(
    optionalQuestion?.question || "",
    phase === "optional" &&
      Boolean(optionalQuestion) &&
      !editingCurrentUnderstanding &&
      homepageConversationSequence.stage === "question",
    18,
  );
  const optionalQuestionWhyText = useTypewriter(
    optionalQuestion?.why || "",
    phase === "optional" &&
      Boolean(optionalQuestion) &&
      !editingCurrentUnderstanding &&
      homepageConversationSequence.stage === "question",
    14,
  );
  const homepageConversationSequenceText = useTypewriter(
    homepageConversationSequence.message,
    phase === "optional" &&
      !editingCurrentUnderstanding &&
      (homepageConversationSequence.stage === "acknowledgment" ||
        homepageConversationSequence.stage === "response" ||
        homepageConversationSequence.stage === "clarification"),
    18,
  );
  const visibleConversationMode =
    pendingExplicitConversationMode || acceptedConversationMode;

  function waitForHomepageConversation(milliseconds: number) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }

  async function presentHomepageConversationSequence(
    items: Array<{
      stage: "acknowledgment" | "response";
      message: string;
    }>,
    restoreQuestion = true,
  ) {
    const sequence = homepageConversationSequenceRef.current + 1;
    homepageConversationSequenceRef.current = sequence;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setHomepageConversationSequence({
      stage: "transitioning",
      message: "",
    });
    if (!reducedMotion) {
      await waitForHomepageConversation(190);
    }

    for (const item of items) {
      if (
        homepageConversationSequenceRef.current !== sequence ||
        !item.message.trim()
      ) {
        continue;
      }

      setHomepageConversationSequence(item);
      const readingTime =
        item.stage === "acknowledgment"
          ? 900
          : Math.min(3200, Math.max(1400, item.message.length * 18));
      await waitForHomepageConversation(readingTime);
    }

    if (homepageConversationSequenceRef.current === sequence) {
      setHomepageConversationSequence({
        stage: restoreQuestion ? "question" : "transitioning",
        message: "",
      });
    }
  }

  const supportedCurrentUnderstanding = useMemo(() => {
    const explicitRevision =
      currentUnderstandingRevision ||
      String(answers.currentUnderstandingRevision || "");
    if (explicitRevision) return explicitRevision;

    return [
      String(answers.desiredOutcome || "").trim(),
      answers.role ? `Your role: ${answers.role}` : "",
      String(answers.conversationContext || "").trim(),
      ...Object.entries(optionalAnswers).map(([, answer]) =>
        String(answer || "").trim(),
      ),
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [
    answers.conversationContext,
    answers.currentUnderstandingRevision,
    answers.desiredOutcome,
    answers.role,
    currentUnderstandingRevision,
    optionalAnswers,
  ]);

  const currentUnderstandingSignals = useMemo(() => {
    const punctuate = (value: string) => {
      const clean = value.trim().replace(/^[-✓•]\s*/, "");
      if (!clean) return "";
      return /[.!?]$/.test(clean) ? clean : `${clean}.`;
    };
    const describeOutcome = (value: string) => {
      const clean = value.trim();
      const firstPersonOpenings: Array<[RegExp, string]> = [
        [/^I\s+want\b/i, "You want"],
        [/^I\s+need\b/i, "You need"],
        [/^I\s+hope\b/i, "You hope"],
        [/^I\s+intend\b/i, "You intend"],
        [/^I\s+would\s+like\b/i, "You would like"],
        [/^I'd\s+like\b/i, "You'd like"],
        [/^I(?:'m|\s+am)\b/i, "You are"],
        [/^My\b/i, "Your"],
      ];
      const opening = firstPersonOpenings.find(([pattern]) =>
        pattern.test(clean),
      );

      return opening
        ? clean.replace(opening[0], opening[1])
        : `Desired outcome: ${clean}`;
    };
    const outcome = String(answers.desiredOutcome || "").trim();
    const revision = String(
      currentUnderstandingRevision ||
        answers.currentUnderstandingRevision ||
        "",
    ).trim();

    if (revision) {
      return revision
        .split(/\n+/)
        .map(punctuate)
        .filter(Boolean);
    }

    return [
      outcome ? punctuate(describeOutcome(outcome)) : "",
      answers.role ? punctuate(`Your role is ${answers.role}`) : "",
      answers.conversationContext
        ? punctuate(`Relevant context: ${answers.conversationContext}`)
        : "",
      ...Object.values(optionalAnswers).map((answer) =>
        punctuate(String(answer || "")),
      ),
    ].filter(Boolean);
  }, [
    answers.conversationContext,
    answers.currentUnderstandingRevision,
    answers.desiredOutcome,
    answers.role,
    currentUnderstandingRevision,
    optionalAnswers,
  ]);

  const currentOperationalPromise = homepageOperationalPromise(
    selectedRole,
    selectedGoal,
  );
  const currentOperationalUnderstanding = answers.conversationContext?.trim()
    ? `Based on what you've told me, ${answers.conversationContext.trim()}`
    : currentOperationalPromise;

  const baselineAssumptions = useMemo(
    () =>
      getConversationTypeBaselineAssumptions(selectedType?.id),
    [selectedType?.id],
  );

  const preparationUnderstandingChecklist = useMemo(() => {
    const objective = String(
      answers.desiredOutcome || selectedGoal || "",
    ).trim();

    const learnedSignals = Object.entries({
      ...answers,
      ...optionalAnswers,
    }).filter(([, value]) => Boolean(String(value || "").trim()));

    const semanticUnderstanding =
      adaptiveUnderstanding &&
      adaptiveUnderstandingOutcome ===
        String(answers.desiredOutcome || "").trim()
        ? String(adaptiveUnderstanding).trim()
        : "";

    const hasAccumulatedBriefingEvidence =
      learnedSignals.length > 0 || Boolean(semanticUnderstanding);

    return [
      {
        key: "role",
        label: selectedRole?.label
          ? `I understand your role: ${selectedRole.label}.`
          : "Your role is not established yet; I’ll ask only if it matters.",
        complete: Boolean(selectedRole),
      },
      {
        key: "objective",
        label: objective
          ? `I understand the outcome: ${objective}.`
          : "I still need to understand the outcome you want.",
        complete: Boolean(objective),
      },
      {
        key: "briefing",
        label: hasAccumulatedBriefingEvidence
          ? "I understand important facts about this conversation."
          : "I'm still learning the situation.",
        complete: hasAccumulatedBriefingEvidence,
      },
      {
        key: "readiness",
        label: briefingSufficient
          ? "I have enough verified context to support you LIVE."
          : "I’m still determining whether I can realistically support you LIVE.",
        complete: briefingSufficient,
      },
    ];
  }, [
    adaptiveUnderstanding,
    adaptiveUnderstandingOutcome,
    answers,
    briefingSufficient,
    optionalAnswers,
    selectedGoal,
    selectedRole,
  ]);

  const preparationUnderstandingSummary = useMemo(() => {
    const role = selectedRole?.label?.trim() || "";
    const conversation = selectedType?.title?.trim() || "";
    const direction = String(
      selectedGoal || answers.broadGoal || "",
    ).trim();
    const outcome = String(answers.desiredOutcome || "").trim();
    const context = String(answers.conversationContext || "").trim();

    const frame = conversation
      ? `You're preparing for a ${conversation.toLowerCase()}.`
      : role
        ? `You're preparing for a ${role.toLowerCase()} conversation.`
        : "You're preparing for a conversation.";

    if (briefingSufficient) {
      return [
        frame.replace("You're", "We're"),
        outcome
          ? `The intended outcome is ${outcome}.`
          : direction
            ? `The current direction is ${direction}.`
            : "",
        context ? `What I understand about this conversation: ${context}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
    }

    if (context) {
      return `${frame} I understand this is ${context}. I'll use that to refine what matters next.`;
    }

    if (outcome) {
      return `${frame} The intended outcome is ${outcome}. I'll keep refining what matters as you brief me.`;
    }

    if (direction) {
      return `${frame} The current direction is ${direction}. I'll use that as a working signal while we clarify the specific outcome.`;
    }

    return `${frame} I understand the role, but not yet the specific situation or what you need this conversation to accomplish.`;
  }, [
    answers.broadGoal,
    answers.conversationContext,
    answers.desiredOutcome,
    briefingSufficient,
    selectedGoal,
    selectedRole,
    selectedType,
  ]);
  const currentUnderstandingOutcome = String(
    answers.desiredOutcome || "",
  ).trim();

  const adaptiveUnderstandingIsCurrent =
    Boolean(adaptiveUnderstanding) &&
    adaptiveUnderstandingOutcome === currentUnderstandingOutcome;

  const resolvedPreparationUnderstanding =
    adaptiveUnderstandingIsCurrent
      ? adaptiveUnderstanding
      : preparationUnderstandingSummary;

  const understandingBeforeUpdateRef = useRef(resolvedPreparationUnderstanding);

  useEffect(() => {
    if (!understandingUpdatePending) {
      understandingBeforeUpdateRef.current = resolvedPreparationUnderstanding;
    }
  }, [resolvedPreparationUnderstanding, understandingUpdatePending]);

  const typewriterUnderstanding = understandingUpdatePending
    ? understandingBeforeUpdateRef.current
    : resolvedPreparationUnderstanding;

  const typedPreparationUnderstanding = useTypewriter(
    typewriterUnderstanding,
    phase !== "selection",
    18,
  );

  const isMissionTransition = Boolean(
    selectedRole && (phase === "goal" || phase === "introduction"),
  );

  function selectRole(role: HomepageRole) {
    if (role.id === "other") {
      setShowAllRoles(true);
      return;
    }

    setSelectedRole(role);
    const nextAnswers = { ...answers, role: role.label };
    setAnswers(nextAnswers);
    saveLivePreparationSignals(nextAnswers);

    const seed = homepagePreparationSeedRef.current;
    if (!seed) return;

    const explicitRoleInteraction = {
      key: "role",
      question: "Which role best describes your position in this conversation?",
      answer: role.label,
      status: "answered" as const,
      evidenceNeed: "the user's role in the anticipated conversation",
    };
    const nextSession = createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        ...seed.knowledge,
        role: role.label,
        additionalSignals: {
          ...seed.knowledge.additionalSignals,
          role: role.label,
        },
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions.filter(
            (interaction) => interaction.key !== "role",
          ),
          explicitRoleInteraction,
        ]),
        currentQuestion: seed.briefing.currentQuestion,
      },
      assets: seed.assets,
      support: seed.support,
      workflow: seed.workflow,
      relations: seed.relations,
    });

    homepagePreparationSeedRef.current = nextSession;
    savePreparationSession(nextSession);
    if (nextSession.knowledge.objective) {
      void requestHomepageOperationalJudgment(nextSession);
    }
  }

  function captureDesiredOutcome() {
    if (homepageAssessmentInFlightRef.current) return;
    if (!tierAuthorityResolved || !missionTier) return;
    const exactOutcome = outcomeDraft;
    if (!exactOutcome.trim()) return;

    const nextSignals = {
      desiredOutcome: exactOutcome,
      broadGoal: exactOutcome,
    };
    const existingSeed = homepagePreparationSeedRef.current;
    const exactOutcomeInteraction = {
      key: "desiredOutcome",
      question: "What do you want this conversation to accomplish?",
      answer: exactOutcome,
      status: "answered" as const,
      evidenceNeed: "the user's desired outcome for the anticipated conversation",
    };

    if (!existingSeed) {
      clearPreparationSession();
    }

    const seed = createPreparationSession({
      preparationSessionId: existingSeed?.preparationSessionId,
      provenance: existingSeed?.provenance || { entrySource: "homepage" },
      createdAt: existingSeed?.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        ...(existingSeed?.knowledge || {}),
        objective: exactOutcome,
        additionalSignals: {
          ...(existingSeed?.knowledge.additionalSignals || {}),
          ...nextSignals,
        },
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...(existingSeed?.briefing.priorInteractions || []).filter(
            (interaction) => interaction.key !== "desiredOutcome",
          ),
          exactOutcomeInteraction,
        ]),
        currentQuestion: existingSeed?.briefing.currentQuestion,
      },
      assets: existingSeed?.assets,
      support: existingSeed?.support,
      workflow: existingSeed?.workflow,
      relations: existingSeed?.relations,
    });

    homepagePreparationSeedRef.current = seed;
    savePreparationSession(seed);
    saveLivePreparationSignals(nextSignals);
    setSelectedGoal(exactOutcome);
    setSelectedMissions([exactOutcome]);
    setAnswers(nextSignals);
    setBriefingSufficient(false);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setAcceptedConversationMode("live_briefing");
    setPendingExplicitConversationMode(null);
    setHeldAmbiguousTurn(null);
    setHomepageConversationError("");
    setHomepageConversationSequence({ stage: "question", message: "" });
    setPhase("optional");
    void requestHomepageOperationalJudgment(seed);
  }

  function resetSelection() {
    if (loadPreparationSession()?.provenance.entrySource === "homepage") {
      clearPreparationSession();
    }
    homepagePreparationSeedRef.current = null;
    setFormulaSurfaceMode("closed");
    setFormulaError("");
    setSelectedType(null);
    setSelectedRole(null);
    setOutcomeDraft("");
    setSelectedGoal(null);
    setSelectedMissions([]);
    setAdaptiveUnderstanding("");
    setAdaptiveUnderstandingOutcome("");
    setAdaptiveDirections([]);
    setUnderstandingUpdatePending(false);
    setCustomMissionOpen(false);
    setMissionCollapsing(false);
    setPhase("selection");
    setIntroStage(0);
    setAnswers({});
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setAcceptedConversationMode("live_briefing");
    setPendingExplicitConversationMode(null);
    setHeldAmbiguousTurn(null);
    setHomepageConversationError("");
    setHomepageConversationSequence({ stage: "question", message: "" });
    setOptionalAnswers({});
    setOptionalQuestionHistory({});
    setSkippedOptionalQuestions([]);
    setOptionalQuestionLoading(false);
    setCurrentUnderstandingRevision("");
    setCurrentUnderstandingDraft("");
    setEditingCurrentUnderstanding(false);
    setCurrentUnderstandingStatus("idle");
  }

  function toggleMission(mission: string) {
    const normalizedMission = mission.trim();
    if (!normalizedMission) return;

    setSelectedMissions((current) => {
      if (current.includes(normalizedMission)) {
        return current.filter((value) => value !== normalizedMission);
      }

      const limit = homepageMissionLimit(missionTier || "smart");
      if (current.length >= limit) return current;
      return [...current, normalizedMission];
    });
  }

  function continueWithMissions() {
    const missions = selectedMissions.map((mission) => mission.trim()).filter(Boolean);
    if (missions.length === 0) return;

    const normalizedGoal = missions.join("; ");
    const nextSignals = {
      ...answers,
      role: selectedRole?.label || answers.role || "",
      broadGoal: normalizedGoal,
      desiredOutcome: normalizedGoal,
    };

    if (!homepagePreparationSeedRef.current) {
      clearPreparationSession();
      const seed = createPreparationSession({
        provenance: { entrySource: "homepage" },
      });
      homepagePreparationSeedRef.current = seed;
    }

    setSelectedGoal(normalizedGoal);
    setAnswers(nextSignals);
    setAdaptiveUnderstanding("");
    setAdaptiveUnderstandingOutcome("");
    saveLivePreparationSignals(nextSignals);
    setMissionCollapsing(true);
    window.setTimeout(() => {
      setMissionCollapsing(false);
      setPhase("introduction");
      setIntroStage(0);
    }, 520);
  }

  function selectCustomMission(mission: string) {
    const normalizedMission = mission.trim();
    if (!normalizedMission) return;
    setSelectedMissions((current) => {
      if (current.includes(normalizedMission)) return current;
      const limit = homepageMissionLimit(missionTier || "smart");
      if (current.length >= limit) return current;
      return [...current, normalizedMission];
    });
    setCustomMissionOpen(false);
  }

  function submitAssumptionCorrection() {
    const exactCorrection = assumptionCorrection;
    if (!exactCorrection.trim()) return;

    const seed = homepagePreparationSeedRef.current;
    if (!seed || seed.provenance.entrySource !== "homepage") return;

    const nextAnswers: Record<string, string> = {
      ...answers,
      conversationContext: exactCorrection,
    };
    const correctionInteraction = {
      key: "assumptionCorrection",
      question: "What should I understand instead?",
      answer: exactCorrection,
      status: "answered" as const,
      evidenceNeed: "the user's correction to the preparation context",
    };
    const nextSession = createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        ...seed.knowledge,
        knownContext: exactCorrection,
        additionalSignals: {
          ...seed.knowledge.additionalSignals,
          assumptionCorrection: exactCorrection,
        },
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions.filter(
            (interaction) => interaction.key !== "assumptionCorrection",
          ),
          correctionInteraction,
        ]),
        currentQuestion: seed.briefing.currentQuestion,
      },
      assets: seed.assets,
      support: seed.support,
      workflow: seed.workflow,
      relations: seed.relations,
    });

    homepagePreparationSeedRef.current = nextSession;
    savePreparationSession(nextSession);
    saveLivePreparationSignals(nextAnswers);
    setAnswers(nextAnswers);
    setAssumptionCorrection("");
    setAssumptionCorrectionOpen(false);
    setUnderstandingUpdatePending(false);
    setAdaptiveUnderstanding("");
    setAdaptiveUnderstandingOutcome("");
    setIntroStage(2);
    setBriefingSufficient(false);
    setOptionalQuestion(null);
    setPhase("optional");
    void requestHomepageOperationalJudgment(nextSession);
  }

  function beginPreparation() {
    setPhase("introduction");
  }

  function goBack() {
    if (phase === "goal") {
      resetSelection();
      return;
    }

    if (phase === "introduction") {
      resetSelection();
      return;
    }

    if (phase === "decision" || phase === "optional") {
      setPhase("introduction");
      return;
    }

    if (phase === "review") {
      setPhase("decision");
    }
  }

  function beginQuestions() {
    if (homepageAssessmentInFlightRef.current) return;
    if (!homepagePreparationSeedRef.current) {
      clearPreparationSession();
      const seed = createPreparationSession({
        provenance: { entrySource: "homepage" },
      });
      homepagePreparationSeedRef.current = seed;
    }

    const freshAnswers: Record<string, string> = {
      ...answers,
      role: answers.role || "",
      broadGoal: answers.broadGoal || selectedGoal || "",
    };

    setAnswers(freshAnswers);
    saveLivePreparationSignals(freshAnswers);
    setBriefingSufficient(false);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setAcceptedConversationMode("live_briefing");
    setPendingExplicitConversationMode(null);
    setHeldAmbiguousTurn(null);
    setHomepageConversationError("");
    setHomepageConversationSequence({ stage: "question", message: "" });
    setPhase("optional");
    const preparationSession = homepagePreparationSeedRef.current;
    if (preparationSession) {
      void requestHomepageOperationalJudgment(preparationSession);
    }
  }

  function preserveHomepagePendingQuestion(
    session: PreparationSessionV1,
    currentQuestion: HomepageOptionalQuestion | null,
  ) {
    const nextSession = createPreparationSession({
      preparationSessionId: session.preparationSessionId,
      provenance: session.provenance,
      createdAt: session.createdAt,
      updatedAt: Date.now(),
      knowledge: session.knowledge,
      briefing: {
        priorInteractions: session.briefing.priorInteractions,
        currentQuestion,
      },
      assets: session.assets,
      support: session.support,
      workflow: session.workflow,
      relations: session.relations,
    });

    homepagePreparationSeedRef.current = nextSession;
    savePreparationSession(nextSession);
    return nextSession;
  }

  function normalizeHomepageEvidence(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function applyAcceptedLiveBriefingTurn(
    session: PreparationSessionV1,
    pendingQuestion: HomepageOptionalQuestion,
    classification: OperationalPreparationTurnClassification,
    judgmentResult: NormalLiveOperationalJudgmentResult,
  ) {
    const acceptedDisposition =
      judgmentResult.operationalJudgment.operationalDisposition;
    const existingEvidence = new Set<string>();

    for (const interaction of session.briefing.priorInteractions) {
      if (interaction.status !== "answered" || !interaction.answer.trim()) {
        continue;
      }

      existingEvidence.add(normalizeHomepageEvidence(interaction.answer));
      existingEvidence.add(
        normalizeHomepageEvidence(
          `${interaction.evidenceNeed || interaction.question}: ${interaction.answer}`,
        ),
      );
    }

    for (const value of Object.values(session.knowledge.additionalSignals)) {
      if (value.trim()) {
        existingEvidence.add(normalizeHomepageEvidence(value));
      }
    }

    const acceptedEvidence = acceptedDisposition.providerProposalAccepted
      ? Array.from(
          new Set(
            acceptedDisposition.knownEvidence
              .map((value) => String(value || "").trim())
              .filter(Boolean),
          ),
        ).filter(
          (value) => !existingEvidence.has(normalizeHomepageEvidence(value)),
        )
      : [];
    const acceptedAnswer = acceptedEvidence.join("\n");
    const preservePendingQuestion = classification.preservePendingQuestion;
    const acceptedKey = preservePendingQuestion
      ? `accepted_live_turn_${Date.now()}`
      : pendingQuestion.key;
    const acceptedQuestion = preservePendingQuestion
      ? "Additional accepted LIVE briefing evidence"
      : pendingQuestion.question;
    const acceptedInteraction = acceptedAnswer
      ? {
          key: acceptedKey,
          question: acceptedQuestion,
          answer: acceptedAnswer,
          status: "answered" as const,
          ...(preservePendingQuestion
            ? {}
            : {
                ...(pendingQuestion.example
                  ? { example: pendingQuestion.example }
                  : {}),
                ...(pendingQuestion.evidenceNeed
                  ? { evidenceNeed: pendingQuestion.evidenceNeed }
                  : {}),
                ...(pendingQuestion.purpose
                  ? { purpose: pendingQuestion.purpose }
                  : {}),
              }),
        }
      : null;
    const nextOptionalAnswers = acceptedInteraction
      ? {
          ...optionalAnswers,
          [acceptedInteraction.key]: acceptedInteraction.answer,
        }
      : optionalAnswers;
    const nextSession = createPreparationSession({
      preparationSessionId: session.preparationSessionId,
      provenance: session.provenance,
      createdAt: session.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        ...session.knowledge,
        additionalSignals: acceptedInteraction
          ? {
              ...session.knowledge.additionalSignals,
              [acceptedInteraction.key]: acceptedInteraction.answer,
            }
          : session.knowledge.additionalSignals,
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...session.briefing.priorInteractions.filter(
            (interaction) => interaction.key !== acceptedInteraction?.key,
          ),
          ...(acceptedInteraction ? [acceptedInteraction] : []),
        ]),
        currentQuestion: preservePendingQuestion ? pendingQuestion : null,
      },
      assets: session.assets,
      support: session.support,
      workflow: session.workflow,
      relations: session.relations,
    });

    homepagePreparationSeedRef.current = nextSession;
    savePreparationSession(nextSession);
    setOptionalQuestion(
      preservePendingQuestion ? pendingQuestion : null,
    );

    if (acceptedInteraction) {
      setOptionalAnswers(nextOptionalAnswers);
      setOptionalQuestionHistory((current) => ({
        ...current,
        [acceptedInteraction.key]: acceptedInteraction.question,
      }));
      try {
        window.localStorage.setItem(
          "GEORGE_PRE_LIVE_OPTIONAL_SIGNALS",
          JSON.stringify(nextOptionalAnswers),
        );
      } catch {}
    }

    return nextSession;
  }

  async function requestHomepageOperationalJudgment(
    preparationSession: PreparationSessionV1,
    reassessmentSource: "preparation" | "current_understanding" = "preparation",
  ) {
    const projectedPreparation =
      projectPreparationSessionForLiveRuntime(preparationSession);
    if (
      !projectedPreparation ||
      projectedPreparation.provenance.entrySource !== "homepage" ||
      projectedPreparation.preparationSessionId !==
        preparationSession.preparationSessionId ||
      projectedPreparation.relations.normalSessionId
    ) {
      setBriefingSufficient(false);
      setOptionalQuestion(null);
      setOptionalAnswer("");
      setPhase("optional");
      return;
    }

    homepageAssessmentAbortRef.current?.abort();
    const controller = new AbortController();
    homepageAssessmentAbortRef.current = controller;
    const requestSequence = homepageAssessmentSequenceRef.current + 1;
    homepageAssessmentSequenceRef.current = requestSequence;
    homepageAssessmentInFlightRef.current = true;
    const preparationSessionId = preparationSession.preparationSessionId;
    const responseIsCurrent = () =>
      homepageAssessmentSequenceRef.current === requestSequence &&
      homepagePreparationSeedRef.current?.preparationSessionId ===
        preparationSessionId;

    setOptionalQuestionLoading(true);
    setBriefingSufficient(false);
    setPreparationReadiness(null);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setPhase("optional");
    if (reassessmentSource === "current_understanding") {
      setCurrentUnderstandingStatus("preserved");
    }

    try {
      const judgmentResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Apply the Operational Preparation Judgment request to the current validated evidence.",
            },
          ],
          mode: "normal",
          tier: missionTier,
          requestPurpose: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
          preparationContext: {
            entrySource: "homepage",
            preparationSessionId,
            session: preparationSession,
            evidenceSufficiency: "unresolved",
            signalAcquisitionAllowed: true,
          },
        }),
      });
      const judgmentPayload = await judgmentResponse
        .json()
        .catch(() => ({}));
      if (!responseIsCurrent() || controller.signal.aborted) return;

      const judgmentResult = judgmentPayload?.operationalJudgmentResult as
        | NormalLiveOperationalJudgmentResult
        | null;
      if (
        !judgmentResponse.ok ||
        judgmentResult?.request !==
          NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST ||
        judgmentResult.source !== "operational_judgment" ||
        judgmentResult.operationalJudgment?.source !== "operational_judgment"
      ) {
        return;
      }

      const readinessJudgment =
        judgmentResult.operationalJudgment.preparationReadiness;
      const minimumLiveSupportEstablished =
        readinessJudgment?.source === "operational_judgment" &&
        readinessJudgment.minimumLiveSupportEstablished === true &&
        (readinessJudgment.level === "supportable" ||
          readinessJudgment.level === "sharp");

      setPreparationReadiness(readinessJudgment);

      if (minimumLiveSupportEstablished) {
        preserveHomepagePendingQuestion(preparationSession, null);
        setOptionalQuestion(null);
        setOptionalAnswer("");
        setBriefingSufficient(true);
        setPhase("decision");
        return;
      }

      const signalAcquisition =
        judgmentResult.operationalJudgment.signalAcquisition;
      const authorizedEvidenceNeed = String(
        signalAcquisition.requestedSignal || "",
      );
      const authorizationReason = String(signalAcquisition.reason || "");

      if (
        signalAcquisition.shouldAcquire !== true ||
        !authorizedEvidenceNeed.trim() ||
        !authorizationReason.trim()
      ) {
        preserveHomepagePendingQuestion(preparationSession, null);
        setOptionalQuestion(null);
        return;
      }

      const authorization: HomepageOperationalJudgmentAuthorization = {
        request: judgmentResult.request,
        source: judgmentResult.source,
        entrySource: "homepage",
        preparationSessionId,
        shouldAcquire: true,
        requestedSignal: authorizedEvidenceNeed,
        reason: authorizationReason,
        ...(signalAcquisition.purpose
          ? { purpose: signalAcquisition.purpose }
          : {}),
      };

      const bundledQuestion = judgmentResult.authorizedSignalQuestion;
      if (
        bundledQuestion?.evidenceNeed === authorizedEvidenceNeed &&
        bundledQuestion.question.trim() &&
        bundledQuestion.key.trim()
      ) {
        const nextQuestion: HomepageOptionalQuestion = {
          key: bundledQuestion.key,
          label: bundledQuestion.label || "Additional signal",
          question: bundledQuestion.question,
          why: bundledQuestion.why || authorizationReason,
          example: bundledQuestion.example || "",
          evidenceNeed: authorizedEvidenceNeed,
          ...(authorization.purpose
            ? { purpose: authorization.purpose }
            : {}),
          clarificationRequired: false,
        };

        preserveHomepagePendingQuestion(preparationSession, nextQuestion);
        setOptionalQuestion(nextQuestion);
        setOptionalQuestionHistory((current) => ({
          ...current,
          [nextQuestion.key]: nextQuestion.question,
        }));
        setOptionalAnswer("");
        return;
      }

      const formulationResponse = await fetch(
        "/api/george/live/signal-question",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            entrySource: "homepage",
            preparationSessionId,
            homepagePreparationContext: {
              session: preparationSession,
              preparationSessionId,
            },
            authorizedEvidenceNeed,
            authorizationReason,
            operationalJudgmentAuthorization: authorization,
          }),
        },
      );
      const formulationPayload = await formulationResponse
        .json()
        .catch(() => ({}));
      if (!responseIsCurrent() || controller.signal.aborted) return;

      const returnedAuthorization =
        formulationPayload?.authorization as
          | HomepageOperationalJudgmentAuthorization
          | null;
      const question = String(formulationPayload?.question || "");
      const key = String(formulationPayload?.key || "");
      if (
        !formulationResponse.ok ||
        formulationPayload?.nextAction !== "ask_question" ||
        String(formulationPayload?.evidenceNeed || "") !==
          authorizedEvidenceNeed ||
        returnedAuthorization?.request !==
          NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST ||
        returnedAuthorization?.source !== "operational_judgment" ||
        returnedAuthorization.entrySource !== "homepage" ||
        returnedAuthorization.preparationSessionId !== preparationSessionId ||
        returnedAuthorization.shouldAcquire !== true ||
        returnedAuthorization.requestedSignal !== authorizedEvidenceNeed ||
        returnedAuthorization.reason !== authorizationReason ||
        returnedAuthorization.purpose !== authorization.purpose ||
        !question.trim() ||
        !key.trim()
      ) {
        return;
      }

      const nextQuestion: HomepageOptionalQuestion = {
        key,
        label: String(formulationPayload.label || "Additional signal"),
        question,
        why: String(formulationPayload.why || formulationPayload.helper || ""),
        example: String(formulationPayload.example || ""),
        evidenceNeed: authorizedEvidenceNeed,
        ...(authorization.purpose
          ? { purpose: authorization.purpose }
          : {}),
        clarificationRequired:
          formulationPayload.clarificationRequired === true,
      };

      preserveHomepagePendingQuestion(preparationSession, nextQuestion);
      setOptionalQuestion(nextQuestion);
      setOptionalQuestionHistory((current) => ({
        ...current,
        [nextQuestion.key]: nextQuestion.question,
      }));
      setOptionalAnswer("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    } finally {
      if (homepageAssessmentSequenceRef.current === requestSequence) {
        homepageAssessmentAbortRef.current = null;
        homepageAssessmentInFlightRef.current = false;
        setOptionalQuestionLoading(false);
      }
    }
  }

  function editCurrentUnderstanding() {
    setCurrentUnderstandingDraft(supportedCurrentUnderstanding);
    setCurrentUnderstandingStatus("editing");
    setEditingCurrentUnderstanding(true);
  }

  function cancelCurrentUnderstandingEdit() {
    setCurrentUnderstandingDraft("");
    setCurrentUnderstandingStatus("idle");
    setEditingCurrentUnderstanding(false);
  }

  function preserveCurrentUnderstanding() {
    const exactRevision = currentUnderstandingDraft;
    if (!exactRevision.trim()) return;

    const seed = homepagePreparationSeedRef.current;
    if (!seed) return;

    const nextAnswers = {
      ...answers,
      currentUnderstandingRevision: exactRevision,
    };
    const revisionInteraction = {
      key: "currentUnderstandingRevision",
      question:
        "Continue editing from here. Correct anything I misunderstood, remove what no longer applies, or add what I should know.",
      answer: exactRevision,
      status: "answered" as const,
      evidenceNeed: "the user's corrected current understanding",
    };
    const nextSession = createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        ...seed.knowledge,
        knownContext: exactRevision,
        additionalSignals: {
          ...seed.knowledge.additionalSignals,
          currentUnderstandingRevision: exactRevision,
        },
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions.filter(
            (interaction) =>
              interaction.key !== "currentUnderstandingRevision",
          ),
          revisionInteraction,
        ]),
        currentQuestion: seed.briefing.currentQuestion,
      },
      assets: seed.assets,
      support: seed.support,
      workflow: seed.workflow,
      relations: seed.relations,
    });

    homepagePreparationSeedRef.current = nextSession;
    savePreparationSession(nextSession);
    saveLivePreparationSignals(nextAnswers);
    setAnswers(nextAnswers);
    setCurrentUnderstandingRevision(exactRevision);
    setCurrentUnderstandingDraft("");
    setCurrentUnderstandingStatus("preserved");
    setEditingCurrentUnderstanding(false);
    setBriefingSufficient(false);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setPhase("optional");
    void requestHomepageOperationalJudgment(
      nextSession,
      "current_understanding",
    );
  }

  async function submitHomepageOptionalAnswer(options?: {
    explicitSelection?: HomepageConversationMode;
    heldTurn?: HomepageHeldAmbiguousTurn;
  }) {
    if (homepageAssessmentInFlightRef.current) return;

    const heldTurn = options?.heldTurn;
    const pendingQuestion = heldTurn?.pendingQuestion || optionalQuestion;
    const exactSubmission = heldTurn?.submission ?? optionalAnswer;
    if (!pendingQuestion || !exactSubmission.trim()) return;

    const seed = homepagePreparationSeedRef.current;
    if (!seed || seed.provenance.entrySource !== "homepage") return;

    const projectedPreparation =
      projectPreparationSessionForLiveRuntime(seed);
    if (
      !projectedPreparation ||
      projectedPreparation.provenance.entrySource !== "homepage" ||
      projectedPreparation.preparationSessionId !== seed.preparationSessionId ||
      projectedPreparation.relations.normalSessionId
    ) {
      return;
    }

    const currentClassification =
      heldTurn?.currentClassification || acceptedConversationMode;
    const explicitSelection =
      options?.explicitSelection ?? pendingExplicitConversationMode;
    const controller = new AbortController();
    homepageAssessmentAbortRef.current?.abort();
    homepageAssessmentAbortRef.current = controller;
    const requestSequence = homepageAssessmentSequenceRef.current + 1;
    homepageAssessmentSequenceRef.current = requestSequence;
    homepageAssessmentInFlightRef.current = true;
    const preparationSessionId = seed.preparationSessionId;
    const responseIsCurrent = () =>
      homepageAssessmentSequenceRef.current === requestSequence &&
      homepagePreparationSeedRef.current?.preparationSessionId ===
        preparationSessionId;

    setHomepageConversationError("");
    setOptionalQuestionLoading(true);
    setHomepageConversationSequence({
      stage: "transitioning",
      message: "",
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [{ role: "user", content: exactSubmission }],
          mode: "normal",
          tier: missionTier,
          requestPurpose: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
          preparationTurnIntent: {
            currentClassification,
            explicitSelection: explicitSelection ?? null,
          },
          preparationContext: {
            entrySource: "homepage",
            preparationSessionId,
            session: seed,
            evidenceSufficiency: "unresolved",
            signalAcquisitionAllowed: true,
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!responseIsCurrent() || controller.signal.aborted) return;

      const judgmentResult = payload?.operationalJudgmentResult as
        | NormalLiveOperationalJudgmentResult
        | null;
      const classification =
        judgmentResult?.operationalJudgment
          ?.preparationTurnClassification;
      const realization =
        judgmentResult?.operationalJudgment
          ?.preparationTurnRealizationAuthorization;

      if (
        !response.ok ||
        judgmentResult?.request !==
          NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST ||
        judgmentResult.source !== "operational_judgment" ||
        judgmentResult.operationalJudgment?.source !==
          "operational_judgment" ||
        classification?.authority !== "operational_judgment" ||
        realization?.source !== "operational_judgment"
      ) {
        throw new Error("The canonical turn result was unavailable.");
      }

      if (classification.classification === "clarification_required") {
        const clarificationMessage = String(
          judgmentResult.message || "",
        ).trim();
        if (
          realization.action !== "direct_canonical_clarification" ||
          realization.providerExecutionAuthorized ||
          !clarificationMessage
        ) {
          throw new Error("The canonical clarification was unavailable.");
        }

        setHeldAmbiguousTurn({
          submission: exactSubmission,
          pendingQuestion,
          currentClassification,
        });
        setPendingExplicitConversationMode(null);
        setHomepageConversationSequence({
          stage: "clarification",
          message: clarificationMessage,
        });
        return;
      }

      const acceptedMode = classification.classification;
      const canonicalAcknowledgment =
        classification.inferredModeTransition === "switched"
          ? String(classification.acknowledgment || "").trim()
          : "";
      if (
        classification.inferredModeTransition === "switched" &&
        !canonicalAcknowledgment
      ) {
        throw new Error("The canonical mode acknowledgment was unavailable.");
      }

      if (acceptedMode === "preparation") {
        const preparationResponse = String(
          judgmentResult.message || "",
        ).trim();
        if (
          realization.action !== "respond_to_preparation" ||
          !realization.providerExecutionAuthorized ||
          !realization.preservePendingQuestion ||
          !preparationResponse
        ) {
          throw new Error("The authorized Preparation response was unavailable.");
        }

        setAcceptedConversationMode(acceptedMode);
        setPendingExplicitConversationMode(null);
        setHeldAmbiguousTurn(null);
        setEditingOptionalQuestionKey(null);
        setOptionalAnswer("");
        await presentHomepageConversationSequence([
          ...(canonicalAcknowledgment
            ? [
                {
                  stage: "acknowledgment" as const,
                  message: canonicalAcknowledgment,
                },
              ]
            : []),
          { stage: "response", message: preparationResponse },
        ]);
        return;
      }

      if (
        realization.action !== "assess_live_briefing" ||
        !realization.assessLiveBriefing ||
        !realization.mayAffectLivePreparation
      ) {
        throw new Error("The LIVE-briefing assessment was unavailable.");
      }

      setAcceptedConversationMode(acceptedMode);
      setPendingExplicitConversationMode(null);
      setHeldAmbiguousTurn(null);
      setEditingOptionalQuestionKey(null);
      const nextSession = applyAcceptedLiveBriefingTurn(
        seed,
        pendingQuestion,
        classification,
        judgmentResult,
      );
      const canonicalResponse = String(judgmentResult.message || "").trim();
      setOptionalAnswer("");
      setBriefingSufficient(false);
      setPhase("optional");

      await presentHomepageConversationSequence(
        [
          ...(canonicalAcknowledgment
            ? [
                {
                  stage: "acknowledgment" as const,
                  message: canonicalAcknowledgment,
                },
              ]
            : []),
          ...(canonicalResponse
            ? [{ stage: "response" as const, message: canonicalResponse }]
            : []),
        ],
        false,
      );
      await requestHomepageOperationalJudgment(nextSession);
      setHomepageConversationSequence({ stage: "question", message: "" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      setHomepageConversationError(
        "I couldn’t process that turn. Your text and briefing are still here—try again.",
      );
      setHomepageConversationSequence(
        heldAmbiguousTurn || heldTurn
          ? {
              stage: "clarification",
              message:
                homepageConversationSequence.message,
            }
          : { stage: "question", message: "" },
      );
    } finally {
      if (homepageAssessmentSequenceRef.current === requestSequence) {
        homepageAssessmentAbortRef.current = null;
        homepageAssessmentInFlightRef.current = false;
        setOptionalQuestionLoading(false);
      }
    }
  }

  function selectHomepageConversationMode(mode: HomepageConversationMode) {
    setPendingExplicitConversationMode(mode);
    setHomepageConversationError("");

    if (heldAmbiguousTurn) {
      void submitHomepageOptionalAnswer({
        explicitSelection: mode,
        heldTurn: heldAmbiguousTurn,
      });
    }
  }

  function skipHomepageOptionalQuestion() {
    if (!optionalQuestion || homepageAssessmentInFlightRef.current) return;

    const seed = homepagePreparationSeedRef.current;
    if (!seed || seed.provenance.entrySource !== "homepage") return;

    const nextSkipped = [...skippedOptionalQuestions, optionalQuestion.key];
    const skippedInteraction = {
      key: optionalQuestion.key,
      question: optionalQuestion.question,
      example: optionalQuestion.example,
      answer: "",
      status: "skipped" as const,
      evidenceNeed: optionalQuestion.evidenceNeed,
      purpose: optionalQuestion.purpose,
    };
    const nextSession = createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: seed.knowledge,
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions.filter(
            (interaction) => interaction.key !== optionalQuestion.key,
          ),
          skippedInteraction,
        ]),
        currentQuestion: null,
      },
      assets: seed.assets,
      support: seed.support,
      workflow: seed.workflow,
      relations: seed.relations,
    });

    homepagePreparationSeedRef.current = nextSession;
    savePreparationSession(nextSession);

    setSkippedOptionalQuestions(nextSkipped);
    setOptionalQuestion(null);
    setOptionalAnswer("");

    setBriefingSufficient(false);
    setPhase("optional");
    void requestHomepageOperationalJudgment(nextSession);
  }

  function continueHomepageBriefing() {
    if (homepageAssessmentInFlightRef.current) return;
    const preparationSession = homepagePreparationSeedRef.current;
    if (!preparationSession) return;

    setEditingOptionalQuestionKey(null);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setBriefingSufficient(false);
    setPhase("optional");
    void requestHomepageOperationalJudgment(preparationSession);
  }

  function editHomepageOptionalAnswer(key: string) {
    const question = String(optionalQuestionHistory[key] || "").trim();
    const answer = String(optionalAnswers[key] || "");
    const existingInteraction =
      homepagePreparationSeedRef.current?.briefing.priorInteractions.find(
        (interaction) => interaction.key === key,
      );

    if (!question) return;

    setEditingOptionalQuestionKey(key);
    setOptionalQuestion({
      key,
      label: "Additional briefing",
      question,
      why: "Update this answer without restarting the briefing.",
      example: "Revise your answer.",
      ...(existingInteraction?.evidenceNeed
        ? { evidenceNeed: existingInteraction.evidenceNeed }
        : {}),
      ...(existingInteraction?.purpose
        ? { purpose: existingInteraction.purpose }
        : {}),
    });
    setOptionalAnswer(answer);
    setPhase("optional");
  }

  type HomepageBriefingAction = "review_brief";

  function buildHomepagePriorInteractions() {
    const answeredQuestionKeys = new Set(Object.keys(optionalAnswers));
    const canonicalInteractions = new Map(
      (homepagePreparationSeedRef.current?.briefing.priorInteractions || []).map(
        (interaction) => [interaction.key, interaction],
      ),
    );

    return [
      ...Object.entries(optionalAnswers).map(([key, answer]) => {
        const interaction = canonicalInteractions.get(key);
        return {
          key,
          question: interaction?.question || optionalQuestionHistory[key] || "",
          ...(interaction?.example ? { example: interaction.example } : {}),
          answer: String(answer || ""),
          status: "answered" as const,
          ...(interaction?.evidenceNeed
            ? { evidenceNeed: interaction.evidenceNeed }
            : {}),
          ...(interaction?.purpose ? { purpose: interaction.purpose } : {}),
        };
      }),
      ...Array.from(new Set(skippedOptionalQuestions))
        .filter((key) => !answeredQuestionKeys.has(key))
        .map((key) => {
          const interaction = canonicalInteractions.get(key);
          return {
            key,
            question:
              interaction?.question || optionalQuestionHistory[key] || "",
            ...(interaction?.example ? { example: interaction.example } : {}),
            answer: "",
            status: "skipped" as const,
            ...(interaction?.evidenceNeed
              ? { evidenceNeed: interaction.evidenceNeed }
              : {}),
            ...(interaction?.purpose ? { purpose: interaction.purpose } : {}),
          };
        }),
    ];
  }

  const homepagePreparationSession = useMemo(() => {
    const seed = homepagePreparationSeedRef.current;
    if (!seed) return null;

    const additionalSignals = Object.fromEntries(
      Object.entries({
        ...seed.knowledge.additionalSignals,
        ...answers,
        ...optionalAnswers,
      })
        .map(([key, value]) => [key, String(value || "").trim()])
        .filter(([, value]) => Boolean(value)),
    );
    const audience = String(
      additionalSignals.counterparty || additionalSignals.audience || "",
    ).trim();
    const checkpoint: PreparationCheckpoint =
      phase === "review"
        ? { surface: "briefing", phase: "review" }
        : phase === "decision"
          ? { surface: "briefing", phase: "decision" }
          : { surface: "briefing", phase: "questions" };

    return createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        objective:
          answers.desiredOutcome || selectedGoal || seed.knowledge.objective,
        baselineAssumptions: [...baselineAssumptions],
        name: answers.name || seed.knowledge.name,
        role: answers.role || seed.knowledge.role,
        participants: audience ? [audience] : seed.knowledge.participants,
        audience: audience || seed.knowledge.audience,
        perspectives: seed.knowledge.perspectives,
        conversation: selectedType
          ? {
              id: selectedType.id,
              title: selectedType.title,
              group: selectedType.group,
            }
          : seed.knowledge.conversation,
        knownContext:
          answers.currentUnderstandingRevision ||
          answers.conversationContext ||
          seed.knowledge.knownContext,
        communicationMedium: seed.knowledge.communicationMedium,
        receiverEvidence: seed.knowledge.receiverEvidence,
        acceptableOutcome: seed.knowledge.acceptableOutcome,
        secondaryOutcome: seed.knowledge.secondaryOutcome,
        roomObjective: seed.knowledge.roomObjective,
        additionalSignals,
        documents: seed.knowledge.documents,
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions,
          ...buildHomepagePriorInteractions(),
        ]),
        currentQuestion: optionalQuestion,
      },
      assets: seed.assets,
      support: seed.support,
      workflow: {
        current: checkpoint,
        history: seed.workflow.history,
      },
      relations: seed.relations,
    });
  }, [
    answers,
    optionalAnswers,
    optionalQuestion,
    optionalQuestionHistory,
    phase,
    selectedGoal,
    selectedRole,
    selectedType,
    baselineAssumptions,
    skippedOptionalQuestions,
  ]);

  useEffect(() => {
    if (!homepagePreparationSession) return;
    homepagePreparationSeedRef.current = homepagePreparationSession;
    savePreparationSession(homepagePreparationSession);
  }, [homepagePreparationSession]);

  function preserveHomepageHandoff(
    workflowAction: HomepageBriefingAction,
  ) {
    if (
      !briefingSufficient ||
      !homepagePreparationSession
    ) {
      return false;
    }

    const signals = Object.fromEntries(
      Object.entries({
        ...answers,
        ...optionalAnswers,
      })
        .map(([key, value]) => [key, String(value || "").trim()])
        .filter(([, value]) => Boolean(value)),
    );

    saveLivePreparationSignals(signals);
    markLivePreparationPreviewReady();

    const readyRoomPreparationSession: PreparationSessionV1 =
      createPreparationSession({
        preparationSessionId:
          homepagePreparationSession.preparationSessionId,
        provenance: homepagePreparationSession.provenance,
        createdAt: homepagePreparationSession.createdAt,
        updatedAt: Date.now(),
        knowledge: homepagePreparationSession.knowledge,
        briefing: {
          priorInteractions:
            homepagePreparationSession.briefing.priorInteractions,
          currentQuestion: null,
        },
        assets: homepagePreparationSession.assets,
        support: homepagePreparationSession.support,
        workflow: {
          current: {
            surface: "ready_room",
            phase: "readiness",
            section: "support",
          },
          history: [homepagePreparationSession.workflow.current],
        },
        relations: homepagePreparationSession.relations,
      });

    savePreparationSession(readyRoomPreparationSession);

    try {
      window.localStorage.setItem(
        "GEORGE_HOMEPAGE_LIVE_HANDOFF",
        JSON.stringify({
          conversationTypeId:
            selectedType?.id ||
            homepagePreparationSession.knowledge.conversation.id ||
            "",
          conversationType:
            selectedType?.title ||
            homepagePreparationSession.knowledge.conversation.title ||
            "",
          conversationGroup:
            selectedType?.group ||
            homepagePreparationSession.knowledge.conversation.group ||
            "",
          signals,
          readiness: {
            ...preparationReadiness,
            thresholdMet: briefingSufficient,
            complete: briefingSufficient,
          },
          optionalSignals: optionalAnswers,
          optionalQuestionHistory,
          skippedOptionalQuestions,
          priorInteractions: buildHomepagePriorInteractions(),
          preparationSession: readyRoomPreparationSession,
          workflowAction,
          createdAt: Date.now(),
        }),
      );
    } catch {}

    return true;
  }

  function approveAndContinueToLive() {
    if (!preserveHomepageHandoff("review_brief")) return;

    try {
      window.sessionStorage.setItem(
        "GEORGE_HOMEPAGE_BRIEF_REVIEW_SNAPSHOT",
        JSON.stringify({
          conversationTypeId: selectedType?.id || "",
          answers,
          optionalAnswers,
          optionalQuestionHistory,
          skippedOptionalQuestions,
          priorInteractions: buildHomepagePriorInteractions(),
          preparationSessionId:
            homepagePreparationSession?.preparationSessionId || "",
        }),
      );
    } catch {}

    window.location.href =
      "/george/live-entry?source=homepage&stage=formula";
  }

  return (
    <section
      ref={surfaceRef}
      className={`relative min-h-[100dvh] scroll-mt-4 border-t border-white/[0.08] px-6 pb-16 pt-8 transition-colors duration-700 sm:px-8 sm:pb-20 sm:pt-10 ${
        isMissionTransition
          ? "bg-[#020304] max-sm:px-3 max-sm:py-3"
          : "bg-black"
      }`}
    >
      <div className="mx-auto w-full max-w-5xl">
        {phase === "selection" ? (
          <div className="mx-auto flex min-h-[62dvh] w-full max-w-3xl items-center animate-[fadeIn_420ms_ease-out]">
            <form
              className="w-full min-w-0 py-8 sm:py-12"
              onSubmit={(event) => {
                event.preventDefault();
                captureDesiredOutcome();
              }}
            >
              <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-[#AEB6FF]/62">
                Desired outcome
              </div>
              <label
                htmlFor="homepage-desired-outcome"
                className="mt-4 block max-w-2xl font-mono text-[24px] font-semibold leading-[1.22] tracking-[-0.04em] text-white sm:text-[34px]"
              >
                What do you want this conversation to accomplish?
              </label>
              <p className="mt-4 max-w-xl text-[13px] leading-6 text-white/44 sm:text-[14px]">
                Start with the result in your own words. GEORGE can determine the next best question to materially improve the likelihood of a successful conclusion.
              </p>
              <textarea
                id="homepage-desired-outcome"
                autoFocus
                value={outcomeDraft}
                onChange={(event) => setOutcomeDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    outcomeDraft.trim()
                  ) {
                    event.preventDefault();
                    captureDesiredOutcome();
                  }
                }}
                rows={3}
                placeholder="Describe the outcome you want"
                className="mt-8 min-h-[118px] w-full min-w-0 resize-none border-x-0 border-b border-t-0 border-white/[0.16] bg-transparent px-0 py-3 text-[17px] leading-7 text-white outline-none transition placeholder:text-white/24 focus:border-[#7EA1FF]/65 focus:ring-0 sm:text-[19px]"
              />
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={!outcomeDraft.trim() || !tierAuthorityResolved || !missionTier}
                  className="h-11 rounded-[9px] border border-[#7EA1FF]/48 bg-[#11182A] px-6 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#18213A] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl min-w-0 py-8 animate-[fadeIn_280ms_ease-out] sm:py-12">
            {editingCurrentUnderstanding ? (
              <form
                className="min-w-0"
                onSubmit={(event) => {
                  event.preventDefault();
                  preserveCurrentUnderstanding();
                }}
              >
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/62">
                  Editing your understanding
                </div>
                <h2 className="mt-4 max-w-2xl font-mono text-[22px] font-semibold leading-8 tracking-[-0.035em] text-white sm:text-[28px] sm:leading-9">
                  Continue editing from here.
                </h2>
                <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/48">
                  Correct anything I misunderstood, remove what no longer applies, or add what I should know.
                </p>
                <textarea
                  autoFocus
                  value={currentUnderstandingDraft}
                  onChange={(event) =>
                    setCurrentUnderstandingDraft(event.target.value)
                  }
                  rows={7}
                  className="mt-7 min-h-[180px] w-full min-w-0 resize-y border-x-0 border-b border-t-0 border-white/[0.16] bg-transparent px-0 py-3 text-[16px] leading-7 text-white outline-none transition focus:border-[#7EA1FF]/65 focus:ring-0"
                />
                <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelCurrentUnderstandingEdit}
                    className="px-2 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/42 transition hover:text-white/72"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!currentUnderstandingDraft.trim()}
                    className="rounded-[9px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white transition hover:border-[#AEB6FF]/75 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Preserve changes
                  </button>
                </div>
              </form>
            ) : (
              <>

              {phase === "optional" && (
                <div className="pt-7 motion-reduce:animate-none animate-[fadeIn_420ms_ease-out]">
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    {homepageConversationSequence.stage === "clarification"
                      ? "Clarification"
                      : homepageConversationSequence.stage === "acknowledgment" ||
                          homepageConversationSequence.stage === "response"
                        ? "GEORGE"
                        : optionalQuestion?.label || "Optional briefing"}
                  </div>

                  {homepageConversationSequence.stage === "transitioning" ? (
                    <div
                      aria-live="polite"
                      className="min-h-[172px] opacity-0 transition-opacity duration-200 motion-reduce:transition-none"
                    >
                      {optionalQuestion?.question || "GEORGE"}
                    </div>
                  ) : homepageConversationSequence.stage === "acknowledgment" ||
                    homepageConversationSequence.stage === "response" ? (
                    <div
                      aria-live="polite"
                      className="animate-[fadeIn_240ms_ease-out] motion-reduce:animate-none"
                    >
                      <h3 className="mt-3 min-h-[88px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                        {homepageConversationSequenceText}
                      </h3>
                    </div>
                  ) : homepageConversationSequence.stage === "clarification" ? (
                    <div
                      aria-live="assertive"
                      className="animate-[fadeIn_240ms_ease-out] motion-reduce:animate-none"
                    >
                      <h3 className="mt-3 min-h-[88px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                        {homepageConversationSequenceText}
                      </h3>
                      <div
                        aria-label="How GEORGE should use this turn"
                        className="mt-4 flex items-center gap-2"
                      >
                        {(
                          [
                            ["live_briefing", "LIVE briefing"],
                            ["preparation", "Preparation"],
                          ] as const
                        ).map(([mode, label]) => (
                          <button
                            key={mode}
                            type="button"
                            aria-pressed={visibleConversationMode === mode}
                            disabled={optionalQuestionLoading}
                            onClick={() => selectHomepageConversationMode(mode)}
                            className={
                              visibleConversationMode === mode
                                ? "rounded-[9px] border border-[#7EA1FF]/48 bg-[#172347] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white"
                                : "rounded-[9px] border border-white/[0.10] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/45 transition hover:border-white/25 hover:text-white/70"
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {homepageConversationError ? (
                        <p className="mt-3 text-[12px] leading-5 text-[#AEB6FF]/72">
                          {homepageConversationError}
                        </p>
                      ) : null}
                    </div>
                  ) : optionalQuestionLoading && !optionalQuestion ? (
                    <p className="mt-5 font-mono text-[14px] leading-7 text-white/68">
                      I’m determining what matters next.
                    </p>
                  ) : optionalQuestion ? (
                    <>
                      <h3 className="mt-3 min-h-[58px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                        {optionalQuestionText}
                      </h3>
                      <p className="mt-2 min-h-5 max-w-3xl text-[12px] leading-5 text-white/42">
                        {optionalQuestionWhyText}
                      </p>
                      <div
                        aria-label="How GEORGE should use this turn"
                        className="mt-4 flex items-center gap-2"
                      >
                        {(
                          [
                            ["live_briefing", "LIVE briefing"],
                            ["preparation", "Preparation"],
                          ] as const
                        ).map(([mode, label]) => (
                          <button
                            key={mode}
                            type="button"
                            aria-pressed={visibleConversationMode === mode}
                            disabled={optionalQuestionLoading}
                            onClick={() => selectHomepageConversationMode(mode)}
                            className={
                              visibleConversationMode === mode
                                ? "rounded-[9px] border border-[#7EA1FF]/48 bg-[#172347] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white"
                                : "rounded-[9px] border border-white/[0.10] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/45 transition hover:border-white/25 hover:text-white/70"
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        autoFocus
                        value={optionalAnswer}
                        onChange={(event) => setOptionalAnswer(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            submitHomepageOptionalAnswer();
                          }
                        }}
                        rows={3}
                        placeholder={optionalQuestion.example}
                        className="mt-4 min-h-[118px] w-full resize-none rounded-[11px] border border-white/[0.09] bg-black/20 px-4 py-3 text-[14px] leading-6 text-white outline-none transition placeholder:text-white/22 focus:border-[#7EA1FF]/45 focus:bg-black/30"
                      />
                      {homepageConversationError ? (
                        <p className="mt-3 text-[12px] leading-5 text-[#AEB6FF]/72">
                          {homepageConversationError}
                        </p>
                      ) : null}
                      <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
                        <div
                          role="group"
                          aria-label="Intelligence level"
                          className="relative flex shrink-0 items-center gap-1"
                        >
                          {HOMEPAGE_INTELLIGENCE_TIERS.map((tier) => {
                            const selected = tier.id === missionTier;
                            const available = Boolean(
                              entitledMissionTier &&
                                homepageTierRank(tier.id) <=
                                  homepageTierRank(entitledMissionTier),
                            );
                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onPointerDown={(event) => {
                                  lastTierPointerTypeRef.current =
                                    event.pointerType;
                                }}
                                onKeyDown={() => {
                                  lastTierPointerTypeRef.current = null;
                                }}
                                onPointerEnter={(event) => {
                                  if (event.pointerType !== "touch") {
                                    discloseMissionTier(tier.id);
                                  }
                                }}
                                onPointerLeave={(event) => {
                                  if (event.pointerType !== "touch") {
                                    setDisclosedMissionTier(null);
                                  }
                                }}
                                onFocus={() => discloseMissionTier(tier.id)}
                                onBlur={() => setDisclosedMissionTier(null)}
                                onClick={() =>
                                  selectHomepageMissionTier(tier.id)
                                }
                                aria-label={`${tier.label} tier${
                                  selected
                                    ? ", selected"
                                    : available
                                      ? ", available"
                                      : ", review access"
                                }`}
                                aria-describedby={`homepage-tier-explanation-${tier.id}`}
                                aria-pressed={selected}
                                disabled={!tierAuthorityResolved || !missionTier}
                                className="group grid h-11 w-11 place-items-center rounded-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-35"
                              >
                                <span
                                  aria-hidden="true"
                                  className={`grid h-8 w-8 place-items-center rounded-[8px] border font-mono text-[11px] font-semibold transition-[border-color,background-color,color,transform,opacity] duration-150 group-hover:-translate-y-0.5 ${
                                    selected
                                      ? "border-[#7EA1FF]/72 bg-[#172347] text-white shadow-[0_0_0_1px_rgba(126,161,255,0.10)] group-hover:border-[#AEB6FF]/85 group-hover:bg-[#203268]"
                                      : "border-white/[0.09] bg-white/[0.02] text-white/30 opacity-55 group-hover:border-white/25 group-hover:bg-white/[0.05] group-hover:text-white/70 group-hover:opacity-100"
                                  }`}
                                >
                                  {tier.shortLabel}
                                </span>
                                <span
                                  id={`homepage-tier-explanation-${tier.id}`}
                                  className="sr-only"
                                >
                                  {tier.explanation}
                                </span>
                              </button>
                            );
                          })}
                          {disclosedMissionTier ? (
                            <div
                              role="tooltip"
                              aria-hidden="true"
                              className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-[min(18rem,calc(100vw-3rem))] rounded-[8px] border border-white/[0.10] bg-[#090B10]/95 px-3 py-2 text-[11px] leading-5 text-white/64 shadow-[0_10px_32px_rgba(0,0,0,0.38)]"
                            >
                              {
                                HOMEPAGE_INTELLIGENCE_TIERS.find(
                                  (tier) => tier.id === disclosedMissionTier,
                                )?.explanation
                              }
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            optionalAnswer.trim()
                              ? void submitHomepageOptionalAnswer()
                              : skipHomepageOptionalQuestion()
                          }
                          disabled={optionalQuestionLoading}
                          className={`min-w-[92px] rounded-[10px] border px-5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] transition disabled:cursor-not-allowed disabled:opacity-30 ${
                            optionalAnswer.trim()
                              ? "border-[#7EA1FF]/48 bg-[#172347] text-white hover:border-[#AEB6FF]/75 hover:bg-[#203268]"
                              : "border-white/[0.12] text-white/52 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {optionalAnswer.trim() ? "Submit" : "Skip"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-5 font-mono text-[14px] leading-7 text-white/68">
                      I’m determining what matters next.
                    </p>
                  )}
                </div>
              )}

              {phase === "decision" && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <p className="font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                    {preparationReadiness?.level === "sharp"
                      ? "GEORGE is ready to support you LIVE."
                      : "GEORGE can support you LIVE now."}
                  </p>
                  <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/48">
                    {preparationReadiness?.furtherBriefingCouldSharpen
                      ? "Another answer could sharpen my support. You can still enter LIVE now and I’ll work from what we know."
                      : "Review what I understand before we prepare how I’ll support you."}
                  </p>
                  <div className="mt-6 flex justify-start">
                    <button
                      type="button"
                      onClick={() => setPhase("review")}
                      disabled={!briefingSufficient}
                      className="min-w-[190px] rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      ENTER LIVE
                    </button>
                  </div>
                </div>
              )}

              {phase === "review" && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    Review answers
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      {
                        key: "role",
                        label: "Role",
                        value: answers.role || selectedRole?.label || "",
                      },
                      {
                        key: "broadGoal",
                        label: "Objectives",
                        value: answers.broadGoal || selectedGoal || "",
                      },
                    ]
                      .filter((item) => String(item.value || "").trim())
                      .map((item) => (
                        <div
                          key={item.key}
                          className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-4"
                        >
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">
                            {item.label}
                          </p>
                          <p className="mt-2 text-[14px] leading-6 text-white/76">
                            {item.value}
                          </p>
                        </div>
                      ))}
                  </div>

                  {Object.keys(optionalAnswers).length > 0 && (
                    <div className="mt-6">
                      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#AEB6FF]/46">
                        Additional briefing
                      </div>
                      <div className="mt-3 space-y-3">
                        {Object.entries(optionalAnswers).map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">
                                  {optionalQuestionHistory[key] || "Additional signal"}
                                </p>
                                <p className="mt-2 text-[14px] leading-6 text-white/76">
                                  {value}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => editHomepageOptionalAnswer(key)}
                                className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-[#AEB6FF]/72 transition hover:text-white"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-7 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={approveAndContinueToLive}
                      disabled={!briefingSufficient}
                      className="min-w-[190px] rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Approve and continue
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase("decision")}
                      className="min-w-[120px] rounded-[10px] border border-white/[0.14] px-4 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:border-white/30 hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
              </>
            )}

            {!editingCurrentUnderstanding ? (
              <button
                type="button"
                data-current-understanding="compact"
                onClick={editCurrentUnderstanding}
                className="mt-5 block w-full min-w-0 border-t border-white/[0.07] pt-5 text-left transition hover:border-[#7EA1FF]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF]/45"
              >
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.19em] text-[#AEB6FF]/58">
                  Current understanding
                </span>
                <span className="mt-3 block space-y-2 text-[13px] leading-6 text-white/64">
                  {currentUnderstandingSignals.map((signal, index) => (
                    <span
                      key={`${signal}-${index}`}
                      className="flex items-start gap-2"
                    >
                      <span aria-hidden="true" className="text-[#AEB6FF]/78">
                        ✓
                      </span>
                      <span className="min-w-0 break-words">{signal}</span>
                    </span>
                  ))}
                </span>
                <span className="mt-3 block text-[11px] leading-5 text-white/34">
                  Edit anything I have misunderstood, or add what I should know.
                </span>
                {currentUnderstandingStatus === "preserved" ? (
                  <span className="mt-3 block font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AEB6FF]/64">
                    Changes preserved
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
