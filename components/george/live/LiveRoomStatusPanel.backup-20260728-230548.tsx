"use client";

import { useEffect, useState } from "react";

type LiveViewMode = "controls" | "reading";
type LiveOverlay = "support" | "reword" | null;
type LiveSupportChoice =
  "adaptive" | "cue" | "line" | "response" | "presentation";
type LiveRewordChoice =
  | "simpler"
  | "shorter"
  | "stronger"
  | "natural"
  | "persuasive"
  | "professional"
  | "confident"
  | "diplomatic";

type LiveRoomStatusPanelProps = {
  isListening: boolean;
  liveRoomActive: boolean;
  voiceOn: boolean;
  isThinking: boolean;
  roomLabel: string;
  chairLabel: string;
  objectiveLabel?: string;
  steeringLabels: [string, string, string];
  receiverProfile?: string;
  receiverProfileLabel: string;
  communicationStyle: string;
  onRoomToggle: () => void;
  onVoiceToggle: () => void;
  onExitLive: () => void;
  onPauseLive?: () => void;
  onReceiverPressed: () => void;
  onCommunicationPressed: () => void;
  onConversationPressed: () => void;
  onRepeatPressed: () => boolean;
  onSupportSelected: (choice: LiveSupportChoice) => void;
  onRewordSelected: (choice: LiveRewordChoice) => void;
};

function LiveChoiceOverlay({
  title,
  detail,
  options,
  onSelect,
  onClose,
}: {
  title: string;
  detail: string;
  options: Array<{ value: string; label: string; helper?: string }>;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10030] flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        aria-label="Close options"
        onClick={onClose}
        className="absolute inset-0 bg-black/58 backdrop-blur-[14px] transition-[opacity,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)]"
      />

      <div className="relative z-10 flex max-h-[calc(100dvh-32px)] w-full max-w-[540px] flex-col overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_top,rgba(46,126,215,0.12),rgba(5,8,15,0.97)_48%)] shadow-[0_26px_90px_rgba(0,0,0,0.62)] ring-1 ring-inset ring-[#7CB7FF]/[0.08]">
        <div className="shrink-0 px-4 pb-3 pt-4 text-left sm:px-5 sm:pt-5">
          <div className="text-[15px] font-semibold leading-5 text-white/90 sm:text-[16px]">
            {title}
          </div>
          <p className="mt-1 max-w-[460px] text-[11px] leading-4 text-white/40 sm:text-[12px]">
            {detail}
          </p>
        </div>

        <div className="min-h-0 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className="flex min-h-[64px] flex-col justify-center rounded-[0.95rem] bg-[#2F78C9]/[0.09] px-3 py-2.5 text-left ring-1 ring-inset ring-[#82BFFF]/[0.045] transition-[transform,background-color] duration-200 ease-out hover:bg-[#3C8EE8]/[0.16] active:scale-[0.985] sm:min-h-[68px] sm:px-3.5"
              >
                <div className="whitespace-normal text-[13px] font-semibold leading-4 text-white/90 sm:text-[14px]">
                  {option.label}
                </div>
                {option.helper && (
                  <div className="mt-1 whitespace-normal text-[10px] leading-3.5 text-white/42 sm:text-[11px] sm:leading-4">
                    {option.helper}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-3 pb-3 sm:px-4 sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="mx-auto block rounded-full bg-[#2F78C9]/[0.07] px-5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/42 transition-[background-color,transform] duration-200 hover:bg-[#3C8EE8]/[0.13] active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type ControlPillProps = {
  label: string;
  detail: string;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
  tone?: "conversation" | "support" | "runtime";
  onClick: () => void;
};

function ControlPill({
  label,
  detail,
  active = false,
  disabled = false,
  tone = "runtime",
  compact = false,
  onClick,
}: ControlPillProps) {
  void tone;

  const icon =
    label === "Pause" ? (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[44%] w-[44%]">
        <rect x="17" y="12" width="11" height="40" rx="3" fill="currentColor" />
        <rect x="36" y="12" width="11" height="40" rx="3" fill="currentColor" />
      </svg>
    ) : label === "Resume" ? (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[44%] w-[44%]">
        <path d="M20 13.5 50 32 20 50.5Z" fill="currentColor" />
      </svg>
    ) : label === "Repeat" ? (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[50%] w-[50%]">
        <path
          d="M48.5 19.5A22 22 0 1 0 53 39"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M39 11.5h12v12"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : label === "Support" ? (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[52%] w-[52%]">
        <path
          d="M11 29c0-10 9-18 21-18s21 8 21 18-9 18-21 18c-3 0-6-.5-8.7-1.5L14 52l2.8-10.2A17 17 0 0 1 11 29Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="29" r="2.6" fill="currentColor" />
        <circle cx="32" cy="29" r="2.6" fill="currentColor" />
        <circle cx="40" cy="29" r="2.6" fill="currentColor" />
      </svg>
    ) : (
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[50%] w-[50%]">
        <path d="m15 46 4-13L43 9l12 12-24 24-13 4Z" fill="currentColor" />
        <path d="m39 13 12 12" fill="none" stroke="#05080c" strokeWidth="4" />
      </svg>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label}: ${detail}`}
      title={`${label}: ${detail}`}
      className={`
        group relative flex min-w-0 flex-col items-center justify-center
        overflow-hidden border text-center
        transition-[transform,border-color,background-color,box-shadow] duration-150
        active:translate-y-[1px] active:scale-[0.99]
        disabled:cursor-not-allowed disabled:opacity-40

        ${
          compact
            ? "h-[86px] rounded-[0.95rem] px-1.5 py-2 sm:h-[92px] sm:rounded-[1rem]"
            : "h-full min-h-0 rounded-[1.65rem] px-3 py-4"
        }

        ${
          active
            ? "border-[#477fb8]/70 bg-[#07111c] shadow-[0_10px_24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(126,181,235,0.08)]"
            : "border-[#263849]/70 bg-[#05090e] shadow-[0_10px_24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(126,181,235,0.04)] hover:border-[#3a5875]/80 hover:bg-[#070d14]"
        }
      `}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(47,112,181,0.08),transparent_40%),linear-gradient(145deg,rgba(10,22,35,0.72),rgba(3,7,12,0.98)_65%)]"
      />

      <span
        className={`relative flex items-center justify-center rounded-full border border-[#315b88]/65 bg-[#02070d]/90 text-[#4f98e8] shadow-[inset_0_0_14px_rgba(35,89,145,0.12)] ${
          compact ? "h-8 w-8" : "h-[94px] w-[94px] sm:h-[104px] sm:w-[104px]"
        }`}
      >
        <span className="relative flex h-full w-full items-center justify-center drop-shadow-[0_0_5px_rgba(73,145,224,0.35)]">
          {icon}
        </span>
      </span>

      <span
        className={`relative block font-semibold uppercase leading-none text-white/90 ${
          compact
            ? "mt-2 max-w-full truncate text-[9px] tracking-[0.08em] sm:text-[10px]"
            : "mt-4 text-[20px] tracking-[0.075em] sm:text-[22px]"
        }`}
      >
        {label}
      </span>

      {!compact && (
        <span className="relative mt-3 block max-w-full truncate font-mono text-[10px] font-medium uppercase leading-4 tracking-[0.14em] text-white/42 sm:text-[11px]">
          {detail}
        </span>
      )}

      <span
        aria-hidden="true"
        className={`relative rounded-full ${
          compact ? "mt-2 h-1.5 w-1.5" : "mt-4 h-2 w-2"
        } ${
          active
            ? "bg-[#62a9eb] shadow-[0_0_7px_rgba(78,151,224,0.55)]"
            : "bg-[#386c9f] shadow-[0_0_5px_rgba(55,111,166,0.35)]"
        }`}
      />
    </button>
  );
}

function OperationalStatus({
  isListening,
  isThinking,
  liveRoomActive,
}: {
  isListening: boolean;
  isThinking: boolean;
  liveRoomActive: boolean;
}) {
  const label = isThinking
    ? "Building support…"
    : isListening
      ? "Listening…"
      : liveRoomActive
        ? "Holding…"
        : "LIVE paused";

  return (
    <div
      className="flex min-w-0 items-center gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-[background-color,box-shadow] duration-500 ${
          isThinking
            ? "bg-[#2EA7D7]/80 shadow-[0_0_12px_rgba(46,167,215,0.36)]"
            : isListening
              ? "bg-[#35D1A3] shadow-[0_0_16px_rgba(53,209,163,0.68)]"
              : "bg-white/18"
        }`}
      />
      <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-white/64">
        {label}
      </span>
    </div>
  );
}

export function LiveRoomStatusPanel({
  isListening,
  liveRoomActive,
  isThinking,
  roomLabel,
  chairLabel,
  objectiveLabel,
  steeringLabels,
  receiverProfile,
  receiverProfileLabel,
  communicationStyle,
  onRoomToggle,
  onPauseLive,
  onReceiverPressed,
  onCommunicationPressed,
  onConversationPressed,
  onRepeatPressed,
  onSupportSelected,
  onRewordSelected,
}: LiveRoomStatusPanelProps) {
  const [viewMode, setViewMode] = useState<LiveViewMode>("controls");
  const [overlay, setOverlay] = useState<LiveOverlay>(null);
  const [showRoomIntro, setShowRoomIntro] = useState(true);
  const [isDesktopReadingSurface, setIsDesktopReadingSurface] = useState(false);
  const [readingIntroStarted, setReadingIntroStarted] = useState(false);
  const [readingIntroText, setReadingIntroText] = useState("");
  const [readingIntroVisible, setReadingIntroVisible] = useState(false);
  const [readingIntroComplete, setReadingIntroComplete] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("GEORGE_LIVE_VIEW_MODE");
      if (stored === "controls" || stored === "reading") setViewMode(stored);
    } catch {}

    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const syncDesktopReadingSurface = () =>
      setIsDesktopReadingSurface(desktopQuery.matches);

    syncDesktopReadingSurface();
    desktopQuery.addEventListener("change", syncDesktopReadingSurface);

    const introTimer = window.setTimeout(() => setShowRoomIntro(false), 3000);
    return () => {
      window.clearTimeout(introTimer);
      desktopQuery.removeEventListener("change", syncDesktopReadingSurface);
    };
  }, []);

  const setMobileView = (nextMode: LiveViewMode) => {
    setViewMode(nextMode);
    try {
      window.localStorage.setItem("GEORGE_LIVE_VIEW_MODE", nextMode);
    } catch {}
  };

  useEffect(() => {
    const nextMode: LiveViewMode =
      receiverProfile === "audio_only" ? "controls" : "reading";

    setViewMode(nextMode);

    try {
      window.localStorage.setItem("GEORGE_LIVE_VIEW_MODE", nextMode);
    } catch {}
  }, [receiverProfile]);

  const safeRoomLabel = String(roomLabel || "LIVE conversation").trim();
  const safeChairLabel = String(chairLabel || "User").trim();
  const safeObjective = String(objectiveLabel || "").trim();

  const liveLayoutMode =
    receiverProfile === "audio_only"
      ? "audio"
      : receiverProfile === "visual_only"
        ? "visual"
        : "hybrid";

  const isAudioOnlyLayout = liveLayoutMode === "audio";

  useEffect(() => {
    const readingIsVisible = viewMode === "reading" || isDesktopReadingSurface;
    if (!readingIsVisible || readingIntroStarted) return;

    setReadingIntroStarted(true);
    setReadingIntroComplete(false);

    const message =
      "I'm with you. I understand the objective. My role is to help you get what you want out of this conversation. You'll notice a consistent pattern in how I support you, making it easier to recognize and use my advice. If something changes, I'll help your conversation adapt to it. Use my advice word for word, reword it to fit your style, or ignore it entirely—I'll adjust with you. When it helps, I'll also explain why I chose a particular cue or response.";
    const timers: number[] = [];
    let cancelled = false;

    const wait = (milliseconds: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, milliseconds);
        timers.push(timer);
      });

    const runSequence = async () => {
      await wait(280);
      setReadingIntroText("");
      setReadingIntroVisible(true);

      for (let index = 0; index < message.length; index += 1) {
        if (cancelled) return;
        setReadingIntroText(message.slice(0, index + 1));
        const character = message[index];
        await wait(
          character === "." || character === "?" || character === "!"
            ? 72
            : character === "," || character === "—"
              ? 42
              : 20,
        );
      }

      if (!cancelled) setReadingIntroComplete(true);
    };

    void runSequence();

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isDesktopReadingSurface, readingIntroStarted, viewMode]);

  const roomSummary = [safeRoomLabel, safeChairLabel]
    .filter(Boolean)
    .join(" · ");
  const signalSummary = steeringLabels.filter(Boolean).join(" · ");

  const handlePause = () => {
    if (onPauseLive) {
      onPauseLive();
      return;
    }
    onRoomToggle();
  };

  const controlGrid = (
    <div
      className={`grid ${
        isAudioOnlyLayout
          ? "h-[66dvh] min-h-[480px] max-h-[680px] grid-cols-2 auto-rows-fr gap-3"
          : "grid-cols-4 gap-2"
      }`}
    >
      <ControlPill
        label={isListening ? "Pause" : "Resume"}
        detail={isListening ? "Suspend support" : "Continue support"}
        active={!isListening}
        disabled={isThinking}
        compact={!isAudioOnlyLayout}
        onClick={handlePause}
      />

      <ControlPill
        label="Repeat"
        detail="Last support"
        tone="support"
        disabled={isThinking}
        compact={!isAudioOnlyLayout}
        onClick={() => {
          onRepeatPressed();
        }}
      />

      <ControlPill
        label="Support"
        detail="Choose style"
        tone="support"
        disabled={isThinking}
        compact={!isAudioOnlyLayout}
        onClick={() => setOverlay("support")}
      />

      <ControlPill
        label="Reword"
        detail={communicationStyle || "Natural"}
        tone="support"
        disabled={isThinking}
        compact={!isAudioOnlyLayout}
        onClick={() => setOverlay("reword")}
      />
    </div>
  );

  const readingSurface = (
    <div
      className="min-h-[calc(100dvh-210px)] flex-1 overflow-y-auto rounded-[1.35rem] bg-[radial-gradient(circle_at_top_left,rgba(46,126,215,0.055),rgba(255,255,255,0.01)_42%)] px-5 py-5 ring-1 ring-inset ring-[#7CB7FF]/[0.045] sm:min-h-[320px] sm:px-7 sm:py-6 lg:min-h-[360px]"
      aria-live="polite"
    >
      <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/24">
        GEORGE
      </div>
      <div
        className={`mt-5 max-w-[760px] text-[17px] leading-[1.7] text-white/82 transition-opacity duration-700 sm:text-[18px] ${
          readingIntroVisible && readingIntroText ? "opacity-100" : "opacity-0"
        }`}
      >
        {readingIntroText}
        {readingIntroVisible && readingIntroText && !readingIntroComplete && (
          <span
            className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.14em] animate-pulse bg-[#78BFFF]/70"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );

  return (
    <section
      className="pointer-events-auto w-full"
      aria-label="LIVE conversation controls"
    >
      <div className="mb-3 hidden min-h-[42px] px-2 sm:block sm:px-3">
        <OperationalStatus
          isListening={isListening}
          isThinking={isThinking}
          liveRoomActive={liveRoomActive}
        />
        <p
          className={`mt-1 truncate text-[11px] text-white/30 transition-opacity duration-500 ${
            showRoomIntro ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!showRoomIntro}
        >
          {roomSummary}
          {safeObjective ? ` · ${safeObjective}` : ""}
        </p>
      </div>

      {/* Phone: Controls and Reading are intentionally separate receiver modes. */}
      <div className="sm:hidden">
        {viewMode === "controls" ? (
          <div
            className={`flex flex-col ${
              isAudioOnlyLayout
                ? "fixed inset-x-0 bottom-0 top-[96px] z-[180] bg-black px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4"
                : "min-h-[calc(100dvh-190px)]"
            }`}
          >
            <div className="mb-3 min-h-[42px] px-2">
              <OperationalStatus
                isListening={isListening}
                isThinking={isThinking}
                liveRoomActive={liveRoomActive}
              />
              <p
                className={`mt-1 truncate text-[11px] text-white/30 transition-opacity duration-500 ${
                  showRoomIntro ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showRoomIntro}
              >
                {roomSummary}
                {safeObjective ? ` · ${safeObjective}` : ""}
              </p>
            </div>

            <div
              className={`flex min-h-0 flex-col bg-[radial-gradient(circle_at_top,rgba(46,126,215,0.07),rgba(5,7,11,0.92)_52%)] shadow-[0_20px_64px_rgba(0,0,0,0.42)] ring-1 ring-inset ring-[#7CB7FF]/[0.04] backdrop-blur-xl ${
                isAudioOnlyLayout
                  ? "flex-1 rounded-[2.25rem] border border-[#24384f]/65 bg-[#02070d]/95 p-4 shadow-[0_34px_90px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(120,181,240,0.06)] sm:p-5"
                  : "rounded-[1.35rem] p-2.5"
              }`}
            >
              {controlGrid}
              {!isAudioOnlyLayout && (signalSummary || !liveRoomActive) && (
                <div className="mt-2 border-t border-white/[0.045] px-3 py-2.5 text-center text-[10px] leading-4 text-white/30">
                  {liveRoomActive
                    ? signalSummary
                    : "Support is suspended. Resume when you are ready."}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[calc(100dvh-150px)] flex-col gap-3">
            <div className="flex min-h-[42px] items-center justify-between gap-2 rounded-[1rem] border border-white/[0.06] bg-[#05070B]/88 px-3 py-2 shadow-[0_14px_42px_rgba(0,0,0,0.36)] backdrop-blur-xl">
              <OperationalStatus
                isListening={isListening}
                isThinking={isThinking}
                liveRoomActive={liveRoomActive}
              />

              <button
                type="button"
                onClick={onReceiverPressed}
                aria-label="Change delivery or view"
                className="rounded-[0.9rem] border border-[#31506f]/80 bg-[#050a10] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#72afe8]/90 shadow-[0_10px_24px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(127,184,239,0.07)] transition-[transform,border-color,background-color] duration-150 hover:border-[#4777a4]/85 hover:bg-[#07101a] active:translate-y-[1px]"
              >
                Controls
              </button>
            </div>
            {readingSurface}
          </div>
        )}
      </div>

      {/* Desktop: controls stay available without competing with the reading surface. */}
      <div className="hidden space-y-3 sm:block">
        <div className="rounded-[1.35rem] bg-[radial-gradient(circle_at_top,rgba(46,126,215,0.07),rgba(5,7,11,0.90)_52%)] p-3 shadow-[0_20px_64px_rgba(0,0,0,0.40)] ring-1 ring-inset ring-[#7CB7FF]/[0.04] backdrop-blur-xl">
          {controlGrid}
          {(signalSummary || !liveRoomActive) && (
            <div className="mt-3 border-t border-white/[0.045] px-3 pt-3 text-center text-[10px] leading-4 text-white/28">
              {liveRoomActive
                ? signalSummary
                : "Support is suspended. Resume when you are ready."}
            </div>
          )}
        </div>
        {readingSurface}
      </div>

      {overlay === "support" && (
        <LiveChoiceOverlay
          title="Choose GEORGE's support"
          detail="Choose how GEORGE begins."
          options={[
            {
              value: "adaptive",
              label: "Adaptive",
              helper: "GEORGE chooses support depth.",
            },
            {
              value: "cue",
              label: "Cue",
              helper: "Brief, timely guidance.",
            },
            {
              value: "line",
              label: "Line",
              helper: "Ready-to-say wording.",
            },
            {
              value: "response",
              label: "Response",
              helper: "A complete answer.",
            },
            {
              value: "presentation",
              label: "Presentation",
              helper: "Longer structured support.",
            },
          ]}
          onSelect={(value) => {
            const choice = value as LiveSupportChoice;
            onSupportSelected(choice);
            setOverlay(null);
          }}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === "reword" && (
        <LiveChoiceOverlay
          title="Reword"
          detail="Adjust the current and future wording."
          options={[
            { value: "simpler", label: "Simpler" },
            { value: "shorter", label: "Shorter" },
            { value: "stronger", label: "Stronger" },
            { value: "natural", label: "More natural" },
            { value: "persuasive", label: "More persuasive" },
            { value: "professional", label: "More professional" },
            { value: "confident", label: "More confident" },
            { value: "diplomatic", label: "More diplomatic" },
          ]}
          onSelect={(value) => {
            const choice = value as LiveRewordChoice;
            onRewordSelected(choice);
            setOverlay(null);
          }}
          onClose={() => setOverlay(null)}
        />
      )}
    </section>
  );
}
