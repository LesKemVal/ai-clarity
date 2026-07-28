"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CONVERSATION_TYPES,
  type ConversationType,
} from "@/lib/george/live-entry/conversation-types";
import { LIVE_PREPARATION_QUESTIONS } from "@/lib/george/live-runtime/live-intent-runtime";

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
      className="group flex min-h-[64px] items-center justify-between gap-3 rounded-[14px] border border-white/[0.08] bg-[#08090A] px-4 py-3 text-left transition duration-200 hover:border-[#4E7CFF]/42 hover:bg-[#4E7CFF]/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <h3 className="font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-white">
        {conversationType.title}
      </h3>
      <span className="shrink-0 text-[14px] text-white/24 transition group-hover:translate-x-0.5 group-hover:text-white/72">
        →
      </span>
    </button>
  );
}

export function HomeConversationTypeSurface() {
  const [selectedType, setSelectedType] = useState<ConversationType | null>(
    null,
  );
  const [introStage, setIntroStage] = useState(0);
  const [customizing, setCustomizing] = useState(false);
  const [transitioningToBriefing, setTransitioningToBriefing] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const visibleTypes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return CONVERSATION_TYPES;

    return CONVERSATION_TYPES.filter((item) =>
      [item.title, item.description, item.initialization]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedType) {
      setIntroStage(0);
      setCustomizing(false);
      setTransitioningToBriefing(false);
      setQuestionIndex(0);
      setAnswers({});
      return;
    }

    const structureTimer = window.setTimeout(() => setIntroStage(1), 220);
    const initializationTimer = window.setTimeout(() => setIntroStage(2), 1050);
    const customizePromptTimer = window.setTimeout(
      () => setIntroStage(3),
      1550,
    );
    const buttonTimer = window.setTimeout(() => setIntroStage(4), 1850);

    return () => {
      window.clearTimeout(structureTimer);
      window.clearTimeout(initializationTimer);
      window.clearTimeout(customizePromptTimer);
      window.clearTimeout(buttonTimer);
    };
  }, [selectedType]);

  const structureText = useTypewriter(
    "The structure is ready.",
    introStage >= 1,
    34,
  );
  const initializationText = useTypewriter(
    selectedType?.initialization || "",
    introStage >= 2,
    18,
  );
  const customizeText = useTypewriter(
    "Would you like to customize it?",
    introStage >= 3,
    28,
  );

  const structuredQuestions = LIVE_PREPARATION_QUESTIONS.slice(0, 4);
  const activeQuestion = structuredQuestions[questionIndex] || null;
  const questionText = useTypewriter(
    activeQuestion?.question || "",
    customizing && Boolean(activeQuestion),
    24,
  );

  function resetSelection() {
    setSelectedType(null);
  }

  function beginCustomization() {
    setTransitioningToBriefing(true);
    window.setTimeout(() => {
      setCustomizing(true);
      setTransitioningToBriefing(false);
    }, 420);
  }

  function continueBriefing() {
    if (!activeQuestion) return;

    const answer = String(answers[activeQuestion.key] || "").trim();
    if (!answer) return;

    try {
      const nextSignals = {
        ...answers,
        [activeQuestion.key]: answer,
      };

      window.localStorage.setItem(
        `GEORGE_PRE_LIVE_${activeQuestion.key.toUpperCase()}`,
        answer,
      );
      window.localStorage.setItem(
        "GEORGE_PRE_LIVE_SIGNALS",
        JSON.stringify(nextSignals),
      );
    } catch {}

    setQuestionIndex((current) =>
      Math.min(current + 1, structuredQuestions.length),
    );
  }

  function continueToLiveFinalCheck() {
    if (!selectedType) return;

    const signals = structuredQuestions.reduce<Record<string, string>>(
      (current, question) => {
        const answer = String(answers[question.key] || "").trim();
        if (answer) current[question.key] = answer;
        return current;
      },
      {},
    );

    try {
      window.localStorage.setItem(
        "GEORGE_PRE_LIVE_SIGNALS",
        JSON.stringify(signals),
      );

      for (const [key, value] of Object.entries(signals)) {
        window.localStorage.setItem(
          `GEORGE_PRE_LIVE_${key.toUpperCase()}`,
          value,
        );
      }

      window.localStorage.setItem(
        "GEORGE_HOMEPAGE_LIVE_HANDOFF",
        JSON.stringify({
          conversationTypeId: selectedType.id,
          conversationType: selectedType.title,
          signals,
          mechanics: {
            supportStyle: "cue",
            receiverProfile: "audio_only",
            communicationStyle: "Diplomatic",
          },
          createdAt: Date.now(),
        }),
      );

      // Homepage route uses the canonical recommended mechanics.
      window.localStorage.setItem("GEORGE_LIVE_SUPPORT_STYLE", "cue");
      window.localStorage.setItem("GEORGE_LIVE_DELIVERY_STYLE", "cue");
      window.localStorage.setItem(
        "george_live_adaptive_support_preference",
        "cue",
      );
      window.localStorage.setItem("GEORGE_LIVE_RECEIVER_PROFILE", "audio_only");
      window.localStorage.setItem(
        "george_live_entry_receiver_profile",
        "audio_only",
      );
      window.localStorage.setItem(
        "george_live_communication_style",
        "Diplomatic",
      );
    } catch {}

    window.location.href =
      "/george/live-entry?source=homepage&stage=final-check";
  }

  return (
    <section className="relative border-t border-white/10 bg-black px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1700px]">
        <div className="max-w-5xl">
          <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
            Conversation types
          </p>
          <h1 className="mt-4 font-mono text-[34px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[54px]">
            What do you want GEORGE to help you do?
          </h1>
          <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/68">
            Choose the closest conversation type, or describe what you want to
            accomplish.
          </p>

          <label className="mt-8 block max-w-3xl">
            <span className="sr-only">Search conversation types</span>
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
              {visibleTypes.length} conversation{" "}
              {visibleTypes.length === 1 ? "type" : "types"}
            </p>
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

          {visibleTypes.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {visibleTypes.map((conversationType) => (
                <ConversationTypeCard
                  key={conversationType.id}
                  conversationType={conversationType}
                  onSelect={setSelectedType}
                />
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

      {selectedType && (
        <div className="relative z-10 border-t border-white/[0.08] bg-black px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="w-full">
              <button
                type="button"
                onClick={resetSelection}
                className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/38 transition hover:text-white/78"
              >
                ← Choose another conversation type
              </button>

              <div className="rounded-[30px] border border-white/[0.1] bg-[#08090A] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-9">
                <div className="border-b border-white/[0.08] pb-7">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#AEB6FF]/56">
                    Conversation type
                  </div>
                  <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[-0.025em] text-white sm:text-[28px]">
                    {selectedType.title}
                  </h2>
                  {!customizing && (
                    <p className="mt-3 max-w-2xl text-[14px] leading-7 text-white/58">
                      {selectedType.description}
                    </p>
                  )}
                </div>

                {!customizing ? (
                  <div
                    className={`pt-7 transition-all duration-[420ms] ${transitioningToBriefing ? "translate-y-[-6px] opacity-0" : "translate-y-0 opacity-100"}`}
                  >
                    <div className="min-h-[48px] font-mono text-[22px] leading-8 tracking-[-0.035em] text-white sm:text-[28px] sm:leading-10">
                      {structureText}
                    </div>
                    <p className="mt-4 min-h-[56px] max-w-3xl text-[15px] leading-7 text-white/66">
                      {initializationText}
                    </p>
                    <h3 className="mt-6 min-h-[28px] font-mono text-[15px] font-semibold tracking-[-0.02em] text-white">
                      {customizeText}
                    </h3>
                    <p
                      className={`mt-2 text-[13px] leading-6 text-white/48 transition-opacity duration-300 ${introStage >= 3 ? "opacity-100" : "opacity-0"}`}
                    >
                      GEORGE will use the existing briefing to understand your
                      role, the room, and your objective before adapting
                      naturally.
                    </p>
                    <button
                      type="button"
                      onClick={beginCustomization}
                      className={`mt-5 rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition duration-500 hover:border-[#AEB6FF]/75 hover:bg-[#203268] ${introStage >= 4 && !transitioningToBriefing ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
                    >
                      Customize this conversation
                    </button>
                  </div>
                ) : (
                  <div className="pt-7">
                    {activeQuestion ? (
                      <div
                        key={activeQuestion.key}
                        className="animate-[fadeIn_420ms_ease-out]"
                      >
                        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                          {activeQuestion.kicker}
                        </div>
                        <h3 className="mt-3 min-h-[58px] font-mono text-[18px] leading-7 tracking-[-0.025em] text-white sm:text-[22px]">
                          {questionText}
                        </h3>
                        <p className="mt-3 text-[13px] leading-6 text-white/42">
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
                              continueBriefing();
                            }
                          }}
                          rows={3}
                          className="mt-5 w-full resize-none rounded-[16px] border border-white/[0.1] bg-white/[0.025] px-4 py-3 text-[15px] leading-6 text-white outline-none transition focus:border-[#7EA1FF]/55"
                        />
                        <div className="mt-5 flex items-center justify-between gap-4">
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">
                            {questionIndex + 1} of {structuredQuestions.length}
                          </span>
                          <button
                            type="button"
                            onClick={continueBriefing}
                            disabled={
                              !String(answers[activeQuestion.key] || "").trim()
                            }
                            className="rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-[fadeIn_420ms_ease-out]">
                        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                          Initial briefing established
                        </div>
                        <h3 className="mt-3 font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                          GEORGE has enough signal to prepare your LIVE entry.
                        </h3>
                        <p className="mt-3 max-w-3xl text-[14px] leading-7 text-white/52">
                          Your recommended mechanics are already set. Review the
                          final check, then enter LIVE.
                        </p>
                        <button
                          type="button"
                          onClick={continueToLiveFinalCheck}
                          className="mt-6 rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268]"
                        >
                          Continue to final check
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
