"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
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
  LIVE_PREPARATION_QUESTIONS,
  extractEmbeddedDesiredOutcome,
  resolveLivePreparationReadiness,
  resolveLivePreparationTransition,
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
  | "introduction"
  | "questions"
  | "decision"
  | "review";

type FormulaSurfaceMode = "closed" | "review";

type FormulaResponse = {
  ok: boolean;
  formulas?: OperationalFormula[];
  error?: string;
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

function ConversationTypeCard({
  conversationType,
  onSelect,
}: {
  conversationType: ConversationType;
  onSelect: (conversationType: ConversationType) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversationType)}
      className="group flex min-h-[64px] items-center justify-between gap-3 rounded-[14px] border border-white/[0.08] bg-[#08090A] px-4 py-3 text-left transition-[border-color,background-color,transform] duration-200 hover:border-white/[0.16] hover:bg-[#0D0F12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.99]"
    >
      <h3 className="font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-white">
        {conversationType.title}
      </h3>
      <span className="shrink-0 text-[14px] text-white/72 transition group-hover:translate-x-0.5 group-hover:text-white">
        →
      </span>
    </button>
  );
}

export function HomeConversationTypeSurface() {
  const [selectedType, setSelectedType] = useState<ConversationType | null>(
    null,
  );
  const [phase, setPhase] = useState<SurfacePhase>("selection");
  const [introStage, setIntroStage] = useState(0);
  const [decisionReady, setDecisionReady] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editingQuestionKey, setEditingQuestionKey] = useState<string | null>(
    null,
  );
  const [activeQuestionKey, setActiveQuestionKey] = useState<string | null>(
    null,
  );
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

  const visibleCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const typeById = new Map(
      CONVERSATION_TYPES.filter((item) => item.title !== "Other").map((item) => [
        item.id,
        item,
      ]),
    );

    return CONVERSATION_CATEGORIES.map((category) => {
      const categoryMatches = [category.label, category.description]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const conversationTypes = category.conversationTypeIds
        .map((id) => typeById.get(id))
        .filter((item): item is ConversationType => Boolean(item))
        .filter(
          (item) =>
            !query ||
            categoryMatches ||
            [item.title, item.description, item.initialization]
              .join(" ")
              .toLowerCase()
              .includes(query),
        );

      return { category, conversationTypes };
    }).filter(({ conversationTypes }) => conversationTypes.length > 0);
  }, [searchQuery]);

  const visibleConversationCount = useMemo(
    () =>
      visibleCategories.reduce(
        (count, category) => count + category.conversationTypes.length,
        0,
      ),
    [visibleCategories],
  );

  const readiness = useMemo(
    () => resolveLivePreparationReadiness(answers),
    [answers],
  );
  const activeQuestion =
    LIVE_PREPARATION_QUESTIONS.find(
      (question) =>
        question.key === (editingQuestionKey || activeQuestionKey),
    ) || null;
  const activeQuestionIndex = activeQuestion
    ? LIVE_PREPARATION_QUESTIONS.findIndex(
        (question) => question.key === activeQuestion.key,
      )
    : LIVE_PREPARATION_QUESTIONS.length;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const shouldRestoreBriefReview =
      params.get("restore") === "brief-review";

    if (!shouldRestoreBriefReview) return;

    const restoredAnswers = loadLivePreparationSignals();
    setAnswers(restoredAnswers);
    setEditingQuestionKey(null);
    setActiveQuestionKey(null);

    const frame = window.requestAnimationFrame(() => {
      setPhase("review");
      window.history.replaceState({}, "", window.location.pathname);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "introduction") return;

    setIntroStage(0);

    const introductionText =
      "The structure is ready. GEORGE will help sequence the facts, impact, explanation, empathy, and next steps.";
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
  const questionText = useTypewriter(
    activeQuestion?.question || "",
    phase === "questions" && Boolean(activeQuestion),
    24,
  );
  const decisionText = useTypewriter(
    "You can continue directly into LIVE now, or remain here and continue briefing GEORGE.",
    phase === "decision",
    24,
  );

  function selectConversation(conversationType: ConversationType) {
    setSelectedType(conversationType);
    setPhase("selected");
    setIntroStage(0);
    setDecisionReady(false);
    setEditingQuestionKey(null);
    setActiveQuestionKey(null);
  }

  function resetSelection() {
    setFormulaSurfaceMode("closed");
    setFormulaError("");
    setSelectedType(null);
    setPhase("selection");
    setIntroStage(0);
    setDecisionReady(false);
    setEditingQuestionKey(null);
    setActiveQuestionKey(null);
    setAnswers({});
  }

  function beginPreparation() {
    setPhase("introduction");
  }

  function goBack() {
    setEditingQuestionKey(null);

    if (phase === "selected") {
      resetSelection();
      return;
    }

    if (phase === "introduction") {
      setPhase("selected");
      return;
    }

    if (phase === "questions") {
      setPhase("introduction");
      return;
    }

    if (phase === "decision") {
      setPhase("questions");
      return;
    }

    if (phase === "review") {
      setPhase("decision");
    }
  }

  function beginQuestions() {
    const loadedAnswers = loadLivePreparationSignals();
    const transition = resolveLivePreparationTransition(loadedAnswers);

    setAnswers(loadedAnswers);
    setEditingQuestionKey(null);

    if (!transition.question) {
      setActiveQuestionKey(null);
      setPhase("decision");
      return;
    }

    setActiveQuestionKey(transition.question.key);
    setPhase("questions");
  }

  function saveCurrentAnswer() {
    if (!activeQuestion) return;

    const answer = String(answers[activeQuestion.key] || "").trim();
    if (!answer) return;

    const embeddedOutcome =
      activeQuestion.key === "conversationContext"
        ? extractEmbeddedDesiredOutcome(answer)
        : "";

    const nextSignals = {
      ...answers,
      [activeQuestion.key]: answer,
      ...(embeddedOutcome && !String(answers.desiredOutcome || "").trim()
        ? { desiredOutcome: embeddedOutcome }
        : {}),
    };

    setAnswers(nextSignals);
    saveLivePreparationSignals(nextSignals);

    if (editingQuestionKey) {
      setEditingQuestionKey(null);
      setActiveQuestionKey(null);
      setPhase("review");
      return;
    }

    const nextTransition = resolveLivePreparationTransition(nextSignals);

    if (nextTransition.question) {
      setActiveQuestionKey(nextTransition.question.key);
      return;
    }

    setActiveQuestionKey(null);
    window.setTimeout(() => setPhase("decision"), 260);
  }

  function preserveHomepageHandoff() {
    if (!selectedType || !readiness.thresholdMet) return false;

    const signals = Object.fromEntries(
      Object.entries(answers)
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
          readiness: resolveLivePreparationReadiness(signals),
          createdAt: Date.now(),
        }),
      );
    } catch {}

    return true;
  }

  function approveAndContinueToLive() {
    if (!preserveHomepageHandoff()) return;
    window.location.href =
      "/george/live-entry?source=homepage&stage=formula";
  }

  return (
    <section
      className={`relative min-h-[100dvh] border-t border-white/10 px-5 py-14 transition-colors duration-700 sm:px-8 sm:py-20 ${
        selectedType ? "bg-[#020304]" : "bg-black"
      }`}
    >
      <div className="mx-auto w-full max-w-[1700px]">
        {phase === "selection" ? (
          <div className="animate-[fadeIn_420ms_ease-out]">
            <div className="max-w-5xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white/88">
                BRANESX
              </p>
              <h1 className="mt-4 font-mono text-[34px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[54px]">
                What do you want GEORGE to help you do?
              </h1>
              <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/68">
                Choose the closest conversation type, or describe what you want
                to accomplish.
              </p>

              <label className="mt-8 block max-w-3xl">
                <span className="sr-only">Search conversation types</span>
                <div className="mb-3 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-white/42">
                  Whatever you'd like to discuss
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Describe what you want to accomplish"
                  className="w-full rounded-[16px] border border-white/[0.1] bg-[#08090A] px-5 py-4 text-[15px] text-white outline-none transition placeholder:text-white/28 focus:border-[#7EA1FF]/55"
                />
              </label>
            </div>

            <div className="mt-9">
              <div className="mb-5 flex items-center justify-between gap-2 sm:gap-3">
                <div className="inline-flex rounded-[10px] border border-[#7EA1FF]/28 bg-[#4E7CFF]/72 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_8px_24px_rgba(20,61,168,0.14)]">
                  Infinite Conversations
                </div>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38 transition hover:text-white/78"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {visibleConversationCount > 0 ? (
                <div className="grid grid-cols-2 gap-2 pb-24 sm:pb-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {visibleCategories.map(({ category, conversationTypes }) => (
                    <Fragment key={category.id}>
                      <CategoryDescriptor category={category} />
                      {conversationTypes.map((conversationType) => (
                        <ConversationTypeCard
                          key={conversationType.id}
                          conversationType={conversationType}
                          onSelect={selectConversation}
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="rounded-[18px] border border-white/[0.08] bg-[#08090A] px-5 py-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/48">
                    No close match yet. Try a broader description.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl animate-[fadeIn_420ms_ease-out]">
            <div className="rounded-[18px] border border-white/[0.08] bg-[#050607] p-3 sm:p-5 shadow-[0_18px_70px_rgba(0,0,0,0.42)] sm:p-7">
              <div
                className={`border-b border-white/[0.07] pb-5 transition-all duration-500 ${
                  phase === "questions" ? "border-transparent pb-3" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-white">
                      Conversation type
                    </div>

                    <h2 className="mt-2 font-mono text-[21px] font-semibold uppercase leading-tight tracking-[-0.025em] text-white sm:text-[25px]">
                      {selectedType?.title}
                    </h2>
                  </div>

                  <div
                    className={`shrink-0 transition-all duration-500 ${
                      phase === "questions"
                        ? "pointer-events-none -translate-y-1 opacity-0"
                        : "translate-y-0 opacity-100"
                    }`}
                  >
                    {phase !== "selected" && phase !== "questions" && (
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
                      <button
                        type="button"
                        onClick={openFormulaReview}
                        className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/46 transition hover:text-white"
                      >
                        Review Formula →
                      </button>

                      <div className="mt-6 max-w-3xl">
                        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white">
                          With your voice.
                        </div>

                        <p className="mt-3 text-[15px] leading-7 text-white/58">
                          {selectedType?.description}
                        </p>
                      </div>

                      <div className="mt-7 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={beginPreparation}
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

              {phase === "questions" && activeQuestion && (
                <div
                  key={activeQuestion.key}
                  className="pt-5 animate-[fadeIn_420ms_ease-out]"
                >
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/52">
                    {activeQuestion.kicker}
                  </div>

                  <h3 className="mt-3 min-h-[58px] max-w-4xl font-mono text-[18px] leading-7 tracking-[-0.025em] text-white sm:text-[21px]">
                    {questionText}
                  </h3>

                  <p className="mt-2 max-w-3xl text-[12px] leading-5 text-white/36">
                    {activeQuestion.examples}
                  </p>

                  <textarea
                    autoFocus
                    value={answers[activeQuestion.key] || ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [activeQuestion.key]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        saveCurrentAnswer();
                      }
                    }}
                    rows={2}
                    placeholder="Type your answer"
                    className="mt-4 min-h-[104px] w-full resize-none rounded-[11px] border border-white/[0.09] bg-black/20 px-4 py-3 text-[14px] leading-6 text-white outline-none transition placeholder:text-white/18 focus:border-[#7EA1FF]/45 focus:bg-black/30"
                  />

                  <div className="mt-4 flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/26">
                        {activeQuestionIndex + 1} of{" "}
                        {LIVE_PREPARATION_QUESTIONS.length}
                      </span>

                      <div className="flex gap-1" aria-hidden="true">
                        {LIVE_PREPARATION_QUESTIONS.map((question, index) => (
                          <span
                            key={question.key}
                            className={`h-[3px] w-4 rounded-full transition-colors duration-300 ${
                              index <= activeQuestionIndex
                                ? "bg-[#7EA1FF]/68"
                                : "bg-white/[0.09]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={saveCurrentAnswer}
                      disabled={
                        !String(answers[activeQuestion.key] || "").trim()
                      }
                      className="h-10 rounded-[10px] border border-[#7EA1FF]/42 bg-[#11182A] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#AEB6FF]/70 hover:bg-[#18213A] disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {phase === "decision" && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <h3 className="min-h-[96px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px] sm:leading-9">
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
                      onClick={() => {
                        setEditingQuestionKey("conversationContext");
                        setActiveQuestionKey("conversationContext");
                        setPhase("questions");
                      }}
                      disabled={!readiness.thresholdMet}
                      className="min-w-[190px] rounded-[10px] border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Continue briefing
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase("review")}
                      disabled={!readiness.thresholdMet}
                      className="min-w-[160px] rounded-[10px] border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Review briefing
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
                    {LIVE_PREPARATION_QUESTIONS.map((question) => (
                      <div
                        key={question.key}
                        className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">
                              {question.question}
                            </p>
                            <p className="mt-2 text-[14px] leading-6 text-white/76">
                              {answers[question.key]}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestionKey(question.key);
                              setActiveQuestionKey(question.key);
                              setPhase("questions");
                            }}
                            className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-[#AEB6FF]/72 transition hover:text-white"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={approveAndContinueToLive}
                      disabled={!readiness.thresholdMet}
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
