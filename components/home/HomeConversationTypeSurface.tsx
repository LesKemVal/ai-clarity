"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BxPageHeader from "@/components/BxPageHeader";
import { ContextualGeorgeInput } from "@/components/george/ContextualGeorgeInput";
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
  resolveLivePreparationReadiness,
} from "@/lib/george/live-runtime/live-intent-runtime";
import {
  createPreparationSession,
  normalizePreparationInteractions,
  type PreparationCheckpoint,
  type PreparationSessionV1,
} from "@/lib/george/live-runtime/live-preparation-controller";

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
  answer: string;
  status: "answered" | "skipped";
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
  | "selected"
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

type HomepageOptionalQuestion = {
  key: string;
  label: string;
  question: string;
  why: string;
  example: string;
};

function useTypewriter(text: string, enabled: boolean, speed = 28) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
    if (!enabled || !text) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setValue(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, speed);

    return () => window.clearInterval(timer);
  }, [enabled, speed, text]);

  return value;
}

function HomepageRoleCard({
  role,
  onSelect,
  featured = false,
}: {
  role: HomepageRole;
  onSelect: (role: HomepageRole) => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`bx-command-shimmer group flex items-center justify-between gap-3 rounded-[14px] border text-left transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.99] ${
        featured
          ? "min-h-[88px] border-white/[0.28] bg-[#050505] px-5 py-4 hover:border-white/[0.58] hover:bg-[#0B0B0C]"
          : "min-h-[64px] border-white/[0.12] bg-[#08090A] px-4 py-3 hover:border-white/[0.24] hover:bg-[#0D0F12]"
      }`}
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
  const preparationScrollRef = useRef<HTMLDivElement | null>(null);
  const homepagePreparationSeedRef = useRef<PreparationSessionV1 | null>(null);
  const [selectedType, setSelectedType] = useState<ConversationType | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<HomepageRole | null>(null);

const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [missionTier, setMissionTier] = useState<HomepageMissionTier>("smart");
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
  const [optionalQuestion, setOptionalQuestion] =
    useState<HomepageOptionalQuestion | null>(null);
  const [optionalAnswer, setOptionalAnswer] = useState("");
  const [optionalInteractionMode, setOptionalInteractionMode] =
    useState<"briefing" | "ask_george">("briefing");
  const [optionalGeorgeResponse, setOptionalGeorgeResponse] = useState("");
  const [editingOptionalQuestionKey, setEditingOptionalQuestionKey] =
    useState<string | null>(null);
  const [optionalAnswers, setOptionalAnswers] = useState<Record<string, string>>({});
  const [optionalQuestionHistory, setOptionalQuestionHistory] =
    useState<Record<string, string>>({});
  const [skippedOptionalQuestions, setSkippedOptionalQuestions] =
    useState<string[]>([]);
  const [optionalQuestionLoading, setOptionalQuestionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formulaSurfaceMode, setFormulaSurfaceMode] =
    useState<FormulaSurfaceMode>("closed");
  const [accessibleFormulas, setAccessibleFormulas] = useState<
    OperationalFormula[]
  >([]);
  const [formulaLoading, setFormulaLoading] = useState(false);
  const [formulaError, setFormulaError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTier = window.localStorage.getItem("george_tier");
    if (storedTier === "smart" || storedTier === "intelligent" || storedTier === "brilliant") {
      setMissionTier(storedTier);
    }
  }, []);

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
    phase === "optional" && Boolean(optionalQuestion),
    18,
  );

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
          : "I still need to understand your role.",
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
          ? "I have enough context to support you LIVE."
          : "I'm still gathering the context I need to support you LIVE.",
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

  useEffect(() => {
    if (!isMissionTransition) return;
    preparationScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [isMissionTransition, phase, selectedRole]);

  function selectRole(role: HomepageRole) {
    if (role.id === "other") {
      window.localStorage.setItem("george_start_new_live", "1");
      window.location.href = "/george/live-entry?source=start";
      return;
    }

    if (loadPreparationSession()?.provenance.entrySource === "homepage") {
      clearPreparationSession();
    }
    homepagePreparationSeedRef.current = null;

    setSelectedRole(role);
    setSelectedType(null);
    setSelectedGoal(null);
    setSelectedMissions([]);
    setAdaptiveUnderstanding("");
    setAdaptiveUnderstandingOutcome("");
    setAdaptiveDirections([]);
    setUnderstandingUpdatePending(false);
    setCustomMissionOpen(false);
    setMissionCollapsing(false);
    setPhase("goal");
    setIntroStage(0);
    setAnswers({});
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setOptionalAnswers({});
    setOptionalQuestionHistory({});
    setSkippedOptionalQuestions([]);
    setOptionalQuestionLoading(false);
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
    setOptionalAnswers({});
    setOptionalQuestionHistory({});
    setSkippedOptionalQuestions([]);
    setOptionalQuestionLoading(false);
  }

  function toggleMission(mission: string) {
    const normalizedMission = mission.trim();
    if (!normalizedMission) return;

    setSelectedMissions((current) => {
      if (current.includes(normalizedMission)) {
        return current.filter((value) => value !== normalizedMission);
      }

      const limit = homepageMissionLimit(missionTier);
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
      const limit = homepageMissionLimit(missionTier);
      if (current.length >= limit) return current;
      return [...current, normalizedMission];
    });
    setCustomMissionOpen(false);
  }

  async function submitAssumptionCorrection() {
    const correction = assumptionCorrection.trim();
    if (!correction) return;

    const nextAnswers: Record<string, string> = {
      ...answers,
      role: answers.role || selectedRole?.label || "",
      conversationContext: correction,
    };

    setAssumptionCorrection("");
    setAssumptionCorrectionOpen(false);
    setUnderstandingUpdatePending(true);

    try {
      const response = await fetch("/api/george/live/signal-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: nextAnswers.role,
          broadGoal: nextAnswers.broadGoal || selectedGoal || "",
          desiredOutcome: nextAnswers.desiredOutcome || "",
          acceptableOutcome: "",
          audience:
            nextAnswers.audience ||
            nextAnswers.participants ||
            nextAnswers.who ||
            "",
          room: selectedType?.title || "",
          knownContext: correction,
          documentSummary: "",
          priorAnswers: optionalAnswers,
          priorInteractions: [
            ...Object.entries(optionalAnswers).map(([key, answer]) => ({
              key,
              question: optionalQuestionHistory[key] || "",
              answer: String(answer || "").trim(),
              status: "answered" as const,
            })),
            {
              key: "assumptionCorrection",
              question: "What should I understand instead?",
              answer: correction,
              status: "answered" as const,
            },
          ],
          skippedQuestions: skippedOptionalQuestions,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      const understanding =
        typeof payload?.understanding === "string"
          ? payload.understanding.trim()
          : "";

      const directions = Array.isArray(payload?.directions)
        ? payload.directions
            .map((value: unknown) =>
              typeof value === "string" ? value.trim() : "",
            )
            .filter(Boolean)
            .slice(0, 6)
        : [];

      setAnswers(nextAnswers);
      saveLivePreparationSignals(nextAnswers);

      if (understanding) {
        setAdaptiveUnderstanding(understanding);
        setAdaptiveUnderstandingOutcome(
          String(nextAnswers.desiredOutcome || "").trim(),
        );
      } else {
        // Clear stale adaptive text so the corrected deterministic
        // understanding becomes the single fallback render.
        setAdaptiveUnderstanding("");
        setAdaptiveUnderstandingOutcome("");
      }

      if (directions.length > 0) {
        setAdaptiveDirections(directions);
        setSelectedMissions((current) =>
          current.filter((mission) => directions.includes(mission)),
        );
      }
    } catch {
      // If adaptive reasoning fails, apply the correction once and let
      // the deterministic understanding become the single revised render.
      setAnswers(nextAnswers);
      saveLivePreparationSignals(nextAnswers);
      setAdaptiveUnderstanding("");
      setAdaptiveUnderstandingOutcome("");
    } finally {
      setUnderstandingUpdatePending(false);
    }

    setIntroStage(2);
  }

  function beginPreparation() {
    setPhase("introduction");
  }

  function goBack() {
    if (phase === "selected") {
      resetSelection();
      return;
    }

    if (phase === "goal") {
      resetSelection();
      return;
    }

    if (phase === "introduction") {
      setPhase("goal");
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
    if (!homepagePreparationSeedRef.current) {
      clearPreparationSession();
      const seed = createPreparationSession({
        provenance: { entrySource: "homepage" },
      });
      homepagePreparationSeedRef.current = seed;
    }

    const freshAnswers: Record<string, string> = {
      ...answers,
      role: answers.role || selectedRole?.label || "",
      broadGoal: answers.broadGoal || selectedGoal || "",
    };

    setAnswers(freshAnswers);
    saveLivePreparationSignals(freshAnswers);
    setBriefingSufficient(false);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setOptionalInteractionMode("briefing");
    setOptionalGeorgeResponse("");
    setPhase("optional");
    void requestHomepageOptionalQuestion({}, []);
  }

  async function requestHomepageOptionalQuestion(
    priorAnswers = optionalAnswers,
    skippedQuestions = skippedOptionalQuestions,
  ) {
    if (!selectedRole) return;

    setOptionalQuestionLoading(true);

    try {
      const answeredQuestionKeys = new Set(Object.keys(priorAnswers));
      const priorInteractions = [
        ...Object.entries(priorAnswers).map(([key, answer]) => ({
          key,
          question: optionalQuestionHistory[key] || "",
          answer: String(answer || "").trim(),
          status: "answered" as const,
        })),
        ...Array.from(new Set(skippedQuestions))
          .filter((key) => !answeredQuestionKeys.has(key))
          .map((key) => ({
            key,
            question: optionalQuestionHistory[key] || "",
            answer: "",
            status: "skipped" as const,
          })),
      ];

      const response = await fetch("/api/george/live/signal-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: answers.role || selectedRole?.label || "",
          broadGoal: answers.broadGoal || selectedGoal || "",
          desiredOutcome: answers.desiredOutcome || "",
          acceptableOutcome: "",
          audience: "",
          room: selectedType?.title || "",
          knownContext: answers.conversationContext || "",
          documentSummary: "",
          priorAnswers,
          priorInteractions,
          skippedQuestions,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (
        payload?.status === "sufficient" ||
        !String(payload?.question || "").trim()
      ) {
        setOptionalQuestion(null);
        setOptionalAnswer("");
        setBriefingSufficient(true);
        setPhase("decision");
        return;
      }

      const nextQuestion: HomepageOptionalQuestion = {
        key: String(payload.key || `signal_${Date.now()}`),
        label: String(payload.label || "Additional signal"),
        question: String(payload.question || ""),
        why: String(
          payload.why ||
            payload.helper ||
            "This answer may materially improve GEORGE's preparation.",
        ),
        example: String(payload.example || "Answer if useful, or skip."),
      };

      setBriefingSufficient(false);
      setOptionalQuestion(nextQuestion);
      setOptionalQuestionHistory((current) => ({
        ...current,
        [nextQuestion.key]: nextQuestion.question,
      }));
      setOptionalAnswer("");
      setPhase("optional");
    } catch {
      const fallbackQuestion: HomepageOptionalQuestion = {
        key: `fallback_${Date.now()}`,
        label: "Additional signal",
        question: "What should I be especially ready for in this room?",
        why: "This may materially improve my preparation.",
        example: "Answer if useful, or skip.",
      };

      setOptionalQuestion(fallbackQuestion);
      setOptionalQuestionHistory((current) => ({
        ...current,
        [fallbackQuestion.key]: fallbackQuestion.question,
      }));
      setOptionalAnswer("");
      setPhase("optional");
    } finally {
      setOptionalQuestionLoading(false);
    }
  }

  async function submitHomepageOptionalAnswer() {
    if (!optionalQuestion) return;

    const answer = optionalAnswer.trim();
    if (!answer) return;

    if (optionalInteractionMode === "ask_george") {
      setOptionalQuestionLoading(true);
      setOptionalGeorgeResponse("");

      try {
        const response = await fetch("/api/george/live/signal-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interactionMode: "ask_george",
            userTurn: answer,
            role: answers.role || selectedRole?.label || "",
            broadGoal: answers.broadGoal || selectedGoal || "",
            desiredOutcome: answers.desiredOutcome || "",
            acceptableOutcome: "",
            audience: "",
            room: selectedType?.title || "",
            knownContext: answers.conversationContext || "",
            documentSummary: "",
            priorAnswers: optionalAnswers,
            priorInteractions: buildHomepagePriorInteractions(),
            skippedQuestions: skippedOptionalQuestions,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        const georgeResponse = String(payload?.response || "").trim();

        setOptionalGeorgeResponse(
          georgeResponse ||
            "I can answer that while preserving the current briefing question.",
        );
        setOptionalAnswer("");
        setOptionalInteractionMode("briefing");
      } catch {
        setOptionalGeorgeResponse(
          "I couldn't answer that just now. The briefing question is still here.",
        );
      } finally {
        setOptionalQuestionLoading(false);
      }

      return;
    }

    const nextAnswers = {
      ...optionalAnswers,
      [optionalQuestion.key]: answer,
    };

    setOptionalAnswers(nextAnswers);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setOptionalGeorgeResponse("");
    setOptionalInteractionMode("briefing");

    try {
      window.localStorage.setItem(
        "GEORGE_PRE_LIVE_OPTIONAL_SIGNALS",
        JSON.stringify(nextAnswers),
      );
    } catch {}

    if (editingOptionalQuestionKey) {
      setEditingOptionalQuestionKey(null);
      setPhase("review");
      return;
    }

    setBriefingSufficient(false);
    setPhase("optional");
    void requestHomepageOptionalQuestion(nextAnswers, skippedOptionalQuestions);
  }

  function skipHomepageOptionalQuestion() {
    if (!optionalQuestion) return;

    const nextSkipped = [...skippedOptionalQuestions, optionalQuestion.key];

    setSkippedOptionalQuestions(nextSkipped);
    setOptionalQuestion(null);
    setOptionalAnswer("");

    setBriefingSufficient(false);
    setPhase("optional");
    void requestHomepageOptionalQuestion(optionalAnswers, nextSkipped);
  }

  function continueHomepageBriefing() {
    setEditingOptionalQuestionKey(null);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setBriefingSufficient(false);
    setPhase("optional");
    void requestHomepageOptionalQuestion(
      optionalAnswers,
      skippedOptionalQuestions,
    );
  }

  function editHomepageOptionalAnswer(key: string) {
    const question = String(optionalQuestionHistory[key] || "").trim();
    const answer = String(optionalAnswers[key] || "");

    if (!question) return;

    setEditingOptionalQuestionKey(key);
    setOptionalQuestion({
      key,
      label: "Additional briefing",
      question,
      why: "Update this answer without restarting the briefing.",
      example: "Revise your answer.",
    });
    setOptionalAnswer(answer);
    setPhase("optional");
  }

  function reviewHomepageAnswers() {
    setEditingOptionalQuestionKey(null);
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setPhase("review");
  }

  type HomepageBriefingAction = "review_brief";

  function buildHomepagePriorInteractions() {
    const answeredQuestionKeys = new Set(Object.keys(optionalAnswers));

    return [
      ...Object.entries(optionalAnswers).map(([key, answer]) => ({
        key,
        question: optionalQuestionHistory[key] || "",
        answer: String(answer || "").trim(),
        status: "answered" as const,
      })),
      ...Array.from(new Set(skippedOptionalQuestions))
        .filter((key) => !answeredQuestionKeys.has(key))
        .map((key) => ({
          key,
          question: optionalQuestionHistory[key] || "",
          answer: "",
          status: "skipped" as const,
        })),
    ];
  }

  const homepagePreparationSession = useMemo(() => {
    const seed = homepagePreparationSeedRef.current;
    if (!seed || !selectedRole) return null;

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
        role: answers.role || selectedRole?.label || seed.knowledge.role,
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
          answers.conversationContext || seed.knowledge.knownContext,
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
      !selectedType ||
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
          conversationTypeId: selectedType.id,
          conversationType: selectedType.title,
          conversationGroup: selectedType.group,
          signals,
          readiness: {
            ...resolveLivePreparationReadiness(signals),
            source: "openai",
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
      className={`relative min-h-[100dvh] scroll-mt-4 border-t border-white/10 px-5 py-14 transition-colors duration-700 sm:px-8 sm:py-20 ${
        isMissionTransition
          ? "bg-[#020304] max-sm:px-3 max-sm:py-3"
          : "bg-black"
      }`}
    >
      <div className="mx-auto w-full max-w-[1700px]">
        {phase === "selection" ? (
          <div className="animate-[fadeIn_420ms_ease-out]">
            <div className="max-w-6xl">
              <div
                id="conversation-setup"
                className="mt-1 scroll-mt-28 sm:mt-3"
              >
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                  Role first / conversation setup
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {FEATURED_HOMEPAGE_ROLES.map((role) => (
                    <HomepageRoleCard
                      key={role.id}
                      role={role}
                      featured
                      onSelect={selectRole}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowAllRoles((current) => !current)}
                  className="rounded-[10px] border border-white/[0.14] bg-white/[0.025] px-4 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-white/30 hover:text-white"
                >
                  {showAllRoles ? "Hide roles" : "View all roles"}
                </button>
                <span className="text-[12px] text-white/38">
                  Roles are included when conversation or presentation materially affects success.
                </span>
              </div>

              {showAllRoles ? (
                <div className="mt-8 animate-[fadeIn_320ms_ease-out]">
                  <label className="block max-w-3xl">
                    <span className="sr-only">Search roles</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search roles or describe how you communicate"
                      className="w-full rounded-[16px] border border-white/[0.1] bg-[#08090A] px-5 py-4 text-[15px] text-white outline-none transition placeholder:text-white/28 focus:border-[#7EA1FF]/55"
                    />
                  </label>

                  {visibleRoleCount > 0 ? (
                    <div className="mt-7 space-y-8 pb-24 sm:pb-0">
                      {visibleRoleGroups.map((group) => (
                        <section key={group.category}>
                          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/46">
                            {group.category}
                          </div>
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {group.roles.map((role) => (
                              <HomepageRoleCard
                                key={role.id}
                                role={role}
                                onSelect={selectRole}
                              />
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[18px] border border-white/[0.08] bg-[#08090A] px-5 py-6">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/48">
                        No close role match yet. Choose the nearest role; OpenAI will adapt during briefing.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl animate-[fadeIn_420ms_ease-out]">
            <div ref={preparationScrollRef} className="rounded-[18px] border border-white/[0.08] bg-[#050607] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.42)] sm:p-5 sm:p-7">
              <BxPageHeader
                onBack={goBack}
                rightSlot={
                  <button
                    type="button"
                    onClick={resetSelection}
                    className="inline-flex h-[23px] items-center justify-center rounded-[7px] border border-white bg-white px-2.5 font-mono !text-[8px] font-semibold uppercase leading-none tracking-[0.11em] text-black transition hover:bg-white/88"
                  >
                    Change role
                  </button>
                }
              />
              <div
                className={`border-b border-white/[0.07] pb-5 transition-all duration-500 ${
                  phase === "optional" ? "border-transparent pb-3" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <SelectionAcknowledgement
                      label={selectedRole?.label || selectedType?.title || "Selected role"}
                    />
                  </div>

                </div>
              </div>

              <section
                aria-live="polite"
                className="border-b border-white/[0.07] py-5 transition-all duration-500 sm:py-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/58">
                      GEORGE understands
                    </div>
                    <h2 className="mt-2 font-mono text-[18px] font-semibold uppercase tracking-[-0.03em] text-white sm:text-[20px]">
                      {selectedRole?.label || selectedType?.title || "Conversation"}
                    </h2>
                  </div>

                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/30">
                    {briefingSufficient ? "Briefing ready" : "Updating as we brief"}
                  </div>
                </div>

                <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.45fr)] lg:items-start">
                  <ul className="space-y-2 text-[12px] leading-5">
                    {preparationUnderstandingChecklist.map((item) => (
                      <li
                        key={item.key}
                        className={`flex gap-2 ${
                          item.complete ? "text-white/68" : "text-white/34"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={
                            item.complete
                              ? "text-[#AEB6FF]"
                              : "text-white/24"
                          }
                        >
                          {item.complete ? "✓" : "○"}
                        </span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="min-w-0">
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#AEB6FF]/58">
                      Current understanding
                    </div>

                    <p className="mt-2 max-w-3xl text-[13px] leading-6 text-white/64">
                      {typedPreparationUnderstanding}
                    </p>

                    {baselineAssumptions.length > 0 && !answers.conversationContext?.trim() ? (
                      <div className="mt-4">
                        <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AEB6FF]/58">
                          Working assumptions
                        </div>
                        <ul className="mt-2 space-y-1 text-[11px] leading-5 text-white/42">
                          {baselineAssumptions.map((assumption) => (
                            <li key={assumption}>{assumption}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {assumptionCorrectionOpen ? (
                      <ContextualGeorgeInput
                        id="homepage-assumption-correction"
                        value={assumptionCorrection}
                        label="What should I understand instead?"
                        placeholder="Tell me what is different or important about this conversation."
                        submitLabel="Update my understanding"
                        onChange={setAssumptionCorrection}
                        onSubmit={submitAssumptionCorrection}
                        onCancel={() => setAssumptionCorrectionOpen(false)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAssumptionCorrectionOpen(true)}
                        className="mt-4 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#AEB6FF]/58 transition hover:text-white"
                      >
                        Clarify something? →
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {phase === "selected" && (
                <div className="pt-6">
                  {formulaSurfaceMode === "closed" ? (
                    <div className="animate-[fadeIn_420ms_ease-out]">
                      <div className="mt-4 max-w-3xl">
                        <p className="text-[14px] leading-6 text-white/62 sm:text-[15px]">
                          {currentOperationalPromise}
                        </p>

                        {selectedRole ? (
                          <div className="mt-5 grid gap-1.5 sm:grid-cols-2">
                            {selectedRole.capabilities.map((capability) => (
                              <div
                                key={capability}
                                className="min-h-[44px] rounded-[10px] border border-white/[0.07] bg-white/[0.018] px-3 py-2.5 text-[12px] leading-5 text-white/62"
                              >
                                {capability}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPhase("goal")}
                          className="inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-[#7EA1FF]/42 bg-[#11182A] px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-150 hover:border-white hover:bg-white hover:text-[#111318] focus-visible:border-white focus-visible:bg-white focus-visible:text-[#111318]"
                        >
                          Continue →
                        </button>

                        <button
                          type="button"
                          onClick={resetSelection}
                          className="inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-white bg-white px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#111318] transition hover:border-[#4E7CFF] hover:bg-[#4E7CFF] hover:text-white"
                        >
                          Change role
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-[fadeIn_320ms_ease-out]">
                      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white/42">
                        Formula
                      </div>

                      {formulaLoading ? (
                        <p className="mt-4 text-[13px] text-white/42">
                          Reviewing the formula…
                        </p>
                      ) : formulaError ? (
                        <p className="mt-4 text-[13px] leading-6 text-white/52">
                          {formulaError}
                        </p>
                      ) : activeFormula ? (
                        <div className="mt-4 max-w-3xl">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="font-mono text-[17px] font-semibold uppercase tracking-[-0.02em] text-white">
                              {activeFormula.name || selectedType?.title}
                            </h3>
                            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/32">
                              Version {activeFormula.version} ·{" "}
                              {activeFormula.status}
                            </span>
                          </div>

                          {(activeFormula.bestUsedFor || []).length > 0 && (
                            <p className="mt-3 text-[13px] leading-6 text-white/46">
                              {(activeFormula.bestUsedFor || [])[0]}
                            </p>
                          )}

                          <div className="mt-5 space-y-3">
                            {(activeFormula.steps || []).map((step, index) => (
                              <div
                                key={`${activeFormula.id}-${index}`}
                                className="border-l border-white/[0.10] pl-3"
                              >
                                <div className="text-[13px] leading-6 text-white/72">
                                  {step.actionType ||
                                    step.expectedTransition ||
                                    step.signalType}
                                </div>

                                {step.actionType &&
                                  step.expectedTransition && (
                                    <div className="mt-1 text-[11px] leading-5 text-white/34">
                                      {step.expectedTransition}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 max-w-2xl text-[13px] leading-6 text-white/46">
                          No operational formula is currently available for this
                          conversation.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={closeFormulaReview}
                        className="mt-7 inline-flex h-9 items-center justify-center rounded-[9px] border border-white/[0.12] px-4 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-white/58 transition hover:border-white/28 hover:text-white"
                      >
                        ← Back
                      </button>
                    </div>
                  )}
                </div>
              )}

              {phase === "goal" && (
                <div className="pt-6 animate-[fadeIn_360ms_ease-out]">
                  <div className="max-w-3xl">
                    <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.24em] text-[#AEB6FF]/58 sm:text-[9px]">
                      Direction
                    </div>
                    <h3 className="mt-2.5 font-mono text-[17px] font-semibold leading-6 tracking-[-0.03em] text-white sm:text-[22px] sm:leading-7">
                      What do you want to take away from this conversation?
                    </h3>
                    <p className="mt-2 max-w-2xl text-[11px] leading-[1.65] text-white/48 sm:text-[12px] sm:leading-5">
                      Choose the direction that best describes what you want from this conversation. I’ll use your role and this direction together to refine the briefing.
                    </p>
                    <p className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.10em] text-white/34">
                      {missionTier === "smart"
                        ? "Choose the closest direction."
                        : missionTier === "intelligent"
                          ? "Choose up to two."
                          : "Choose what applies."}
                    </p>
                  </div>

                  <div className={missionCollapsing ? "mt-5 grid gap-2 sm:grid-cols-2 opacity-0 transition-all duration-500" : "mt-5 grid gap-2 sm:grid-cols-2 opacity-100 transition-all duration-500"}>
                    {(adaptiveDirections.length > 0
                      ? adaptiveDirections.map((label) => ({
                          id: `adaptive-${label}`,
                          label,
                        }))
                      : goalsForHomepageRole(selectedRole).filter(
                          (goal) => goal.id !== "other",
                        )
                    ).map((mission) => {
                        const selected = selectedMissions.includes(mission.label);
                        const limitReached =
                          !selected &&
                          selectedMissions.length >= homepageMissionLimit(missionTier);
                        return (
                          <button
                            key={mission.id}
                            type="button"
                            aria-pressed={selected}
                            disabled={limitReached}
                            onClick={() => toggleMission(mission.label)}
                            className={selected
                              ? "min-h-[34px] rounded-[8px] border border-[#AEB6FF]/70 bg-[#172347] px-3 py-2 text-left font-mono !text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.08em] text-white transition sm:min-h-[40px] sm:px-4 sm:py-2.5 sm:!text-[12px] sm:tracking-[0.10em]"
                              : "min-h-[34px] rounded-[8px] border border-white/[0.08] bg-white/[0.018] px-3 py-2 text-left font-mono !text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.08em] text-white/68 transition hover:border-[#7EA1FF]/45 hover:bg-[#11182A] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-[40px] sm:px-4 sm:py-2.5 sm:!text-[12px] sm:tracking-[0.10em]"}
                          >
                            <span className="mr-2 inline-block w-4 text-[#AEB6FF]">
                              {selected ? "✓" : ""}
                            </span>
                            {mission.label}
                          </button>
                        );
                      })}
                  </div>

                  <div className="mt-4">
                    {!customMissionOpen ? (
                      <button
                        type="button"
                        onClick={() => setCustomMissionOpen(true)}
                        className="rounded-[10px] border border-dashed border-white/[0.16] px-4 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/58 transition hover:border-white/30 hover:text-white"
                      >
                        Something else…
                      </button>
                    ) : (
                      <div className="rounded-[12px] border border-white/[0.08] bg-white/[0.015] p-3">
                        <label
                          htmlFor="homepage-custom-mission"
                          className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42"
                        >
                          What do you want to take away from this conversation?
                        </label>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                          <input
                            id="homepage-custom-mission"
                            value={selectedGoal || ""}
                            onChange={(event) => setSelectedGoal(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                selectCustomMission(selectedGoal || "");
                              }
                            }}
                            placeholder="Describe the outcome you want"
                            className="h-11 min-w-0 flex-1 rounded-[9px] border border-white/[0.09] bg-black/40 px-3 text-[14px] text-white outline-none placeholder:text-white/24 focus:border-[#7EA1FF]/55"
                          />
                          <button
                            type="button"
                            disabled={!String(selectedGoal || "").trim()}
                            onClick={() => selectCustomMission(selectedGoal || "")}
                            className="h-11 rounded-[9px] border border-[#7EA1FF]/42 bg-[#11182A] px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            Add objective
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {missionCollapsing && selectedMissions.length > 0 && (
                    <div className={missionCollapsing ? "mt-5 flex flex-wrap gap-2 -translate-y-3 transition-all duration-500" : "mt-5 flex flex-wrap gap-2 translate-y-0 transition-all duration-500"}>
                      {selectedMissions.map((mission) => (
                        <span
                          key={mission}
                          className="rounded-full border border-[#AEB6FF]/45 bg-[#172347] px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-white"
                        >
                          ✓ {mission}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={selectedMissions.length === 0}
                      onClick={continueWithMissions}
                      className="h-11 rounded-[9px] border border-[#7EA1FF]/42 bg-[#11182A] px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {phase === "introduction" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="px-1 pt-4 pb-3 sm:pt-6">
                    <div
                      className={`mt-5 transition-all duration-700 ${
                        introStage >= 2
                          ? "translate-y-0 opacity-100"
                          : "pointer-events-none translate-y-2 opacity-0"
                      }`}
                    >
                      <p className="max-w-3xl text-[14px] leading-[1.6] text-white/52 sm:text-[16px] sm:leading-[1.6]">
                        {homepageOperationalSupport(
                      selectedRole,
                      answers.desiredOutcome || selectedGoal || "",
                    )}
                      </p>
                      <div className="mt-7">
                        <button
                          type="button"
                          onClick={beginQuestions}
                          className="h-11 rounded-[9px] border border-[#7EA1FF]/42 bg-[#11182A] px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:border-[#AEB6FF]/70 hover:bg-[#18213A] sm:h-10"
                        >
                          Start Briefing →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {phase === "optional" && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    {optionalQuestion?.label || "Optional briefing"}
                  </div>

                  {optionalQuestionLoading && !optionalQuestion ? (
                    <div className="mt-5 rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-5">
                      <p className="font-mono text-[14px] leading-7 text-white/68">
                        GEORGE is reviewing the brief for the next useful question...
                      </p>
                    </div>
                  ) : optionalQuestion ? (
                    <>
                      <h3 className="mt-3 min-h-[58px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                        {optionalQuestionText}
                      </h3>
                      <p className="mt-2 max-w-3xl text-[12px] leading-5 text-white/42">
                        {optionalQuestion.why}
                      </p>
                      {optionalGeorgeResponse && (
                        <div className="mt-4 rounded-[11px] border border-[#7EA1FF]/20 bg-[#11182A]/55 px-4 py-3">
                          <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-[#AEB6FF]/64">
                            GEORGE
                          </div>
                          <p className="mt-2 text-[13px] leading-6 text-white/70">
                            {optionalGeorgeResponse}
                          </p>
                        </div>
                      )}

                      {!editingOptionalQuestionKey && (
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            aria-pressed={optionalInteractionMode === "briefing"}
                            onClick={() => {
                              setOptionalInteractionMode("briefing");
                              setOptionalGeorgeResponse("");
                            }}
                            className={
                              optionalInteractionMode === "briefing"
                                ? "rounded-[9px] border border-[#7EA1FF]/48 bg-[#172347] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white"
                                : "rounded-[9px] border border-white/[0.10] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/45 transition hover:border-white/25 hover:text-white/70"
                            }
                          >
                            Answer
                          </button>
                          <button
                            type="button"
                            aria-pressed={optionalInteractionMode === "ask_george"}
                            onClick={() => {
                              setOptionalInteractionMode("ask_george");
                              setOptionalGeorgeResponse("");
                            }}
                            className={
                              optionalInteractionMode === "ask_george"
                                ? "rounded-[9px] border border-[#7EA1FF]/48 bg-[#172347] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white"
                                : "rounded-[9px] border border-white/[0.10] px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/45 transition hover:border-white/25 hover:text-white/70"
                            }
                          >
                            Ask GEORGE
                          </button>
                        </div>
                      )}

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
                        placeholder={
                          optionalInteractionMode === "ask_george"
                            ? "Ask GEORGE about this conversation or briefing."
                            : optionalQuestion.example
                        }
                        className="mt-4 min-h-[118px] w-full resize-none rounded-[11px] border border-white/[0.09] bg-black/20 px-4 py-3 text-[14px] leading-6 text-white outline-none transition placeholder:text-white/22 focus:border-[#7EA1FF]/45 focus:bg-black/30"
                      />
                      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={skipHomepageOptionalQuestion}
                            disabled={optionalQuestionLoading}
                            className="rounded-[10px] border border-white/[0.12] px-4 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/52 transition hover:border-white/25 hover:text-white disabled:opacity-30"
                          >
                            Skip
                          </button>
                          <button
                            type="button"
                            onClick={submitHomepageOptionalAnswer}
                            disabled={optionalQuestionLoading || !optionalAnswer.trim()}
                            className="rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            {optionalInteractionMode === "ask_george"
                              ? "Ask GEORGE"
                              : "Continue"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={reviewHomepageAnswers}
                      className="mt-5 rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white"
                    >
                          Continue
                        </button>
                  )}
                </div>
              )}

              {phase === "decision" && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  {briefingSufficient && (
                    <div>
                      <h3 className="max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px] sm:leading-9">
                        I have enough context to support you LIVE.
                      </h3>
                      <p className="mt-3 max-w-3xl text-[13px] leading-6 text-white/52">
                        We can start now, or continue briefing to sharpen my support.
                      </p>
                    </div>
                  )}
                  <div className={`${briefingSufficient ? "mt-7" : "mt-1"} flex flex-wrap justify-center gap-3`}>
                    <button
                      type="button"
                      onClick={approveAndContinueToLive}
                      disabled={!briefingSufficient}
                      className="min-w-[190px] rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      START LIVE
                    </button>
                    <button
                      type="button"
                      onClick={continueHomepageBriefing}
                      className="min-w-[190px] rounded-[10px] border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-white/30 hover:text-white"
                    >
                      NEXT QUESTION
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
