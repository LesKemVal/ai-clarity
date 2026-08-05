"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONVERSATION_TYPES,
  type ConversationType,
} from "@/lib/george/live-entry/conversation-types";
import {
  loadLivePreparationSignals,
  markLivePreparationPreviewReady,
  saveLivePreparationSignals,
} from "@/lib/george/live-browser/live-preparation-browser-storage";
import {
  resolveLivePreparationReadiness,
} from "@/lib/george/live-runtime/live-intent-runtime";

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
    id: "telemarketer",
    label: "Telemarketer",
    category: "Sales & Outreach",
    conversationTypeId: "set-appointment",
    featured: true,
    summary:
      "Make repeated calls with a consistent opening, recover quickly, handle objections, and adapt as the session produces evidence.",
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
    id: "salesperson",
    label: "Salesperson",
    category: "Sales & Outreach",
    conversationTypeId: "discovery-call",
    featured: true,
    summary:
      "Move a prospect toward the next decision with stronger discovery, explanation, objection handling, and closing language.",
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
    id: "influencer",
    label: "Influencer",
    category: "Presentation & Media",
    conversationTypeId: "create-a-broadcast-script",
    featured: true,
    summary:
      "Present from a teleprompter, laptop, camera, microphone, livestream, or interview with greater control and audience awareness.",
    capabilities: [
      "Rhetorical flow",
      "Pacing",
      "Emphasis",
      "Transitions",
      "Recovery",
      "Audience engagement",
      "Clarity and confidence",
      "Adapting to audience reaction",
    ],
  },
  {
    id: "founder",
    label: "Founder",
    category: "Business & Leadership",
    conversationTypeId: "investor-pitch",
    featured: true,
    summary:
      "Lead consequential conversations with investors, partners, customers, teams, and the public while staying anchored to the goal.",
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
  },
  {
    id: "attorney",
    label: "Attorney",
    category: "Legal",
    conversationTypeId: "make-my-case",
    featured: true,
    summary:
      "Organize arguments, question effectively, respond under pressure, and present a position with precision.",
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
  },
  {
    id: "recruiter",
    label: "Recruiter",
    category: "Sales & Outreach",
    conversationTypeId: "networking-conversation",
    featured: true,
    summary:
      "Attract, evaluate, and move candidates through conversations while adapting to motivation, hesitation, and fit.",
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

const HOMEPAGE_GOALS = [
  "Close a sale",
  "Set an appointment",
  "Negotiate",
  "Present an idea",
  "Win an interview",
  "Resolve a conflict",
  "Educate",
  "Persuade",
  "Defend a position",
  "Build trust",
  "Explain something",
  "Other...",
] as const;



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
      className={`group flex items-center justify-between gap-3 rounded-[14px] border text-left transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.99] ${
        featured
          ? "min-h-[88px] border-[#7EA1FF]/28 bg-[#10172A] px-5 py-4 hover:border-[#AEB6FF]/55 hover:bg-[#151F39]"
          : "min-h-[64px] border-white/[0.08] bg-[#08090A] px-4 py-3 hover:border-white/[0.16] hover:bg-[#0D0F12]"
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

export function HomeConversationTypeSurface() {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const [selectedType, setSelectedType] = useState<ConversationType | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<HomepageRole | null>(null);

const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const [showAllRoles, setShowAllRoles] = useState(false);
  const [phase, setPhase] = useState<SurfacePhase>("selection");
  const [introStage, setIntroStage] = useState(0);
  const [decisionReady, setDecisionReady] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [briefingSufficient, setBriefingSufficient] = useState(false);
  const [optionalQuestion, setOptionalQuestion] =
    useState<HomepageOptionalQuestion | null>(null);
  const [optionalAnswer, setOptionalAnswer] = useState("");
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
      "GEORGE will carry the selected role and goal into preparation.";
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

  useEffect(() => {
    if (phase !== "decision") return;

    setDecisionReady(false);
    const timer = window.setTimeout(() => setDecisionReady(true), 2450);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const structureText = useTypewriter(
    "The structure is ready. GEORGE will help sequence the facts, impact, explanation, empathy, and next steps.",
    phase === "introduction" && introStage >= 1,
    24,
  );
  const decisionText = useTypewriter(
    "GEORGE has enough information to prepare for LIVE.",
    phase === "decision",
    24,
  );
  const optionalQuestionText = useTypewriter(
    optionalQuestion?.question || "",
    phase === "optional" && Boolean(optionalQuestion),
    18,
  );

  function selectRole(role: HomepageRole) {
    const conversationType = CONVERSATION_TYPES.find(
      (option) => option.id === role.conversationTypeId,
    );

    if (!conversationType) return;

    setSelectedRole(role);
    setSelectedType(conversationType);
    setSelectedGoal(null);
    setPhase("selected");
    setIntroStage(0);
    setDecisionReady(false);
    setAnswers({});
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setOptionalAnswers({});
    setOptionalQuestionHistory({});
    setSkippedOptionalQuestions([]);
    setOptionalQuestionLoading(false);
  }

  function resetSelection() {
    setFormulaSurfaceMode("closed");
    setFormulaError("");
    setSelectedType(null);
    setSelectedRole(null);
    setSelectedGoal(null);
    setPhase("selection");
    setIntroStage(0);
    setDecisionReady(false);
    setAnswers({});
    setOptionalQuestion(null);
    setOptionalAnswer("");
    setOptionalAnswers({});
    setOptionalQuestionHistory({});
    setSkippedOptionalQuestions([]);
    setOptionalQuestionLoading(false);
  }

  function selectGoal(goal: string) {
    const normalizedGoal = goal.trim();
    if (!normalizedGoal || normalizedGoal === "Other...") return;

    const nextSignals = {
      ...answers,
      role: selectedRole?.label || answers.role || "",
      desiredOutcome: normalizedGoal,
    };

    setSelectedGoal(normalizedGoal);
    setAnswers(nextSignals);
    saveLivePreparationSignals(nextSignals);
    setPhase("introduction");
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
      setPhase("selected");
      return;
    }

    if (phase === "introduction") {
      setPhase("selected");
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
    setPhase("optional");
    void requestHomepageOptionalQuestion({}, []);
  }

  async function requestHomepageOptionalQuestion(
    priorAnswers = optionalAnswers,
    skippedQuestions = skippedOptionalQuestions,
  ) {
    if (!selectedType) return;

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
          room: selectedType.title,
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
        question: "What should GEORGE be especially ready for in this room?",
        why: "This answer may materially improve GEORGE's preparation.",
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

  function submitHomepageOptionalAnswer() {
    if (!optionalQuestion) return;

    const answer = optionalAnswer.trim();
    if (!answer) return;

    const nextAnswers = {
      ...optionalAnswers,
      [optionalQuestion.key]: answer,
    };

    setOptionalAnswers(nextAnswers);
    setOptionalQuestion(null);
    setOptionalAnswer("");

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

    setBriefingSufficient(true);
    setPhase("decision");
  }

  function skipHomepageOptionalQuestion() {
    if (!optionalQuestion) return;

    const nextSkipped = [...skippedOptionalQuestions, optionalQuestion.key];

    setSkippedOptionalQuestions(nextSkipped);
    setOptionalQuestion(null);
    setOptionalAnswer("");

    setBriefingSufficient(true);
    setPhase("decision");
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

  function preserveHomepageHandoff(
    workflowAction: HomepageBriefingAction,
  ) {
    if (!selectedType || !briefingSufficient) return false;

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
        selectedType ? "bg-[#020304]" : "bg-black"
      }`}
    >
      <div className="mx-auto w-full max-w-[1700px]">
        {phase === "selection" ? (
          <div className="animate-[fadeIn_420ms_ease-out]">
            <div className="max-w-6xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white/88">
                BRANESX
              </p>
              <h1 className="mt-4 max-w-6xl font-mono text-[34px] font-black uppercase leading-[0.98] tracking-[-0.06em] sm:text-[54px]">
                If success depends on what you say, how you say it, or how you adapt while saying it, GEORGE can help.
              </h1>
              <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/68">
                Choose the role that feels most like you. GEORGE will show how it can help before asking what you are trying to accomplish.
              </p>

              <div className="mt-10">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                  Featured roles
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
          <div className="mx-auto w-full max-w-4xl animate-[fadeIn_420ms_ease-out]">
            <div className="rounded-[18px] border border-white/[0.08] bg-[#050607] p-3 sm:p-5 shadow-[0_18px_70px_rgba(0,0,0,0.42)] sm:p-7">
              <div
                className={`border-b border-white/[0.07] pb-5 transition-all duration-500 ${
                  phase === "optional" ? "border-transparent pb-3" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-white">
                      How GEORGE Can Help
                    </div>

                    <SelectionAcknowledgement
                      label={selectedRole?.label || selectedType?.title || "Selected role"}
                    />
                  </div>

                  <div
                    className={`shrink-0 transition-all duration-500 ${
                      phase === "optional"
                        ? "pointer-events-none -translate-y-1 opacity-0"
                        : "translate-y-0 opacity-100"
                    }`}
                  >
                    {phase !== "selected" && phase !== "optional" && (
                      <div className="flex gap-2 flex-col items-stretch shrink-0 w-[116px] sm:w-[132px]">
                        <button
                          type="button"
                          onClick={goBack}
                          className="rounded-[9px] border border-white/[0.12] bg-transparent font-mono font-semibold uppercase tracking-[0.12em] text-white/52 transition hover:border-white/25 hover:text-white w-full h-8 min-w-0 px-2 text-[7px] sm:text-[8px] whitespace-nowrap"
                        >
                          ← Back
                        </button>

                        <button
                          type="button"
                          onClick={resetSelection}
                          className="rounded-[9px] border border-white/[0.12] bg-transparent font-mono font-semibold uppercase tracking-[0.12em] text-white/52 transition hover:border-white/25 hover:text-white w-full h-8 min-w-0 px-2 text-[7px] sm:text-[8px] whitespace-nowrap order-last"
                        >
                          Re-select
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {phase === "selected" && (
                <div className="pt-6">
                  {formulaSurfaceMode === "closed" ? (
                    <div className="animate-[fadeIn_420ms_ease-out]">
                      <div className="mt-4 max-w-3xl">
                        <p className="text-[14px] leading-6 text-white/62 sm:text-[15px]">
                          {selectedRole?.summary || selectedType?.description}
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
                          Re-select
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
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/58">
                      Goal
                    </div>

                    <h3 className="mt-3 font-mono text-[22px] font-semibold leading-8 tracking-[-0.035em] text-white sm:text-[28px] sm:leading-9">
                      What is your goal?
                    </h3>

                    <p className="mt-2 text-[13px] leading-6 text-white/42">
                      Choose the outcome that best describes what you need this
                      conversation or presentation to accomplish.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {HOMEPAGE_GOALS.filter((goal) => goal !== "Other...").map(
                      (goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => selectGoal(goal)}
                          className="min-h-[48px] rounded-[11px] border border-white/[0.08] bg-white/[0.018] px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/72 transition hover:border-[#7EA1FF]/45 hover:bg-[#11182A] hover:text-white"
                        >
                          {goal}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="mt-5 rounded-[12px] border border-white/[0.08] bg-white/[0.015] p-3">
                    <label
                      htmlFor="homepage-custom-goal"
                      className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42"
                    >
                      Or describe your goal
                    </label>

                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        id="homepage-custom-goal"
                        value={selectedGoal || ""}
                        onChange={(event) => setSelectedGoal(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            selectGoal(selectedGoal || "");
                          }
                        }}
                        placeholder="What needs to happen?"
                        className="h-11 min-w-0 flex-1 rounded-[9px] border border-white/[0.09] bg-black/40 px-3 text-[14px] text-white outline-none placeholder:text-white/24 focus:border-[#7EA1FF]/55"
                      />

                      <button
                        type="button"
                        disabled={!String(selectedGoal || "").trim()}
                        onClick={() => selectGoal(selectedGoal || "")}
                        className="h-11 rounded-[9px] border border-[#7EA1FF]/42 bg-[#11182A] px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goBack}
                    className="mt-5 h-9 rounded-[9px] border border-white/[0.10] px-4 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/52 transition hover:border-white/25 hover:text-white"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {phase === "introduction" && (
                <div className="pt-6">
                  <div className="min-h-[96px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.03em] text-white sm:text-[24px] sm:leading-9">
                    {structureText}
                  </div>

                  <div
                    className={`mt-6 transition-all duration-700 ${
                      introStage >= 2
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <h3 className="font-mono text-[17px] font-semibold tracking-[-0.02em] text-white">
                      With your voice.
                    </h3>

                    <p className="mt-3 max-w-3xl text-[14px] leading-7 text-white/52">
                      Continue shaping the conversation, then carry the same preparation into LIVE.
                    </p>
                  </div>

                  <div
                    className={`mt-5 transition-all duration-500 ${
                      introStage >= 3
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={beginQuestions}
                      className="h-10 rounded-[10px] border border-[#7EA1FF]/42 bg-[#11182A] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#AEB6FF]/70 hover:bg-[#18213A]"
                    >
                      Start →
                    </button>
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
                            Continue
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
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    ✓ Core briefing complete
                  </div>
                  <h3 className="mt-3 min-h-[96px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px] sm:leading-9">
                    {decisionText}
                  </h3>
                  <div
                    className={`mt-7 flex flex-wrap justify-center gap-3 transition-all duration-500 ${
                      decisionReady
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={approveAndContinueToLive}
                      disabled={!briefingSufficient}
                      className="min-w-[190px] rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Start LIVE
                    </button>
                    <button
                      type="button"
                      onClick={continueHomepageBriefing}
                      className="min-w-[190px] rounded-[10px] border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-white/30 hover:text-white"
                    >
                      Continue Briefing
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
                        label: "Goal",
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
