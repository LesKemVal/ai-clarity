"use client";

/* GEORGE LIVE VISUAL COMPOSER OWNERSHIP
   Audio hides the composer. Visual restores the existing canonical composer. */
const GEORGE_LIVE_VISUAL_COMPOSER_STYLE = `
  @media (max-width: 639px) {
    html[data-george-live-view="controls"]
      .george-live-composer-region {
      display: none !important;
    }

    html[data-george-live-view="reading"]
      .george-live-composer-region {
      display: block !important;
      position: fixed !important;
      left: 16px !important;
      right: 16px !important;
      bottom: calc(16px + env(safe-area-inset-bottom)) !important;
      width: auto !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      z-index: 10050 !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    html[data-george-live-view="reading"]
      .george-composer-shell {
      display: block !important;
      width: 100% !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    html[data-george-live-view="reading"] body {
      padding-bottom: calc(
        118px + env(safe-area-inset-bottom)
      ) !important;
    }
  }
`;

import {
  clearPreparationSession,
  clearLivePreparationPreviewReady,
  clearLivePreparationSignals,
  isLivePreparationPreviewReady,
  loadPreparationSession,
  loadLivePreparationSignals,
  savePreparationSession,
  saveLivePreparationSignals,
} from "@/lib/george/live-browser/live-preparation-browser-storage";
import {
  normalizePreparationInteractions,
  normalizeExplicitNormalPreparationObjective,
  reconcileNormalPreparationSession,
  type PreparationCheckpoint,
  type PreparationQuestion,
  type PreparationSessionV1,
} from "@/lib/george/live-runtime/live-preparation-controller";
import { buildOpportunitySignalAcquisitionMessage } from "@/lib/george/runtime/conversation-strategy";

import {
  markLiveTtsAudioReceived,
  markLiveTtsPlaybackEnd,
  markLiveTtsPlaybackStart,
  markLiveTtsRequestStart,
  startLiveTtsTurn,
} from "@/lib/george/live-runtime/live-tts-metrics";
import { normalizeBrandSpeech } from "@/lib/george/live-voice/spoken-text";
import { governLiveResponse } from "@/lib/george/live-voice/runtime/response-shaper";
import {
  buildGeorgeSessionRestoreState,
  consumePreparedLiveSetup,
  createAudioPlayback,
  findGeorgeSessionToRestore,
  markLiveRuntimeStarted,
  persistActiveLiveRuntimeSupport,
  readActiveLiveRuntimeSupport,
  readGeorgeNormalDraft,
  beginNextLiveConversation,
  completeLiveConversation,
  prepareLiveCompletionReview,
  recordLiveOutcomeSignal,
  recordLiveSupportPreference,
  saveGeorgeSession,
} from "@/lib/george/live-host/live-application-host";
import { determineLiveVoiceSpeed } from "@/lib/george/live-delivery/voice-speed-policy";
import {
  drainSpeechQueue,
  replaceSpeechQueue,
  clearSpeechQueue,
} from "@/lib/george/live-runtime/speech-queue";
import {
  getLastGeorgeApprovedLiveDelivery,
  replayLastGeorgeApprovedLiveDelivery,
} from "@/lib/george/live-runtime/approved-delivery-history";
import { buildGeorgeApprovedDeliveryRewordRequest } from "@/lib/george/live-runtime/approved-delivery-transform";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { operationalMotion } from "@/lib/george/ui/operational-motion";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Sidebar from "@/components/Sidebar";
import { ShareIcon } from "@/components/icons/ShareIcon";
import ContinuityCapsule from "@/components/george/ContinuityCapsule";
import MemoryContinuityPanel from "@/components/george/settings/MemoryContinuityPanel";
import DesktopOperationalSurface from "@/components/george/DesktopOperationalSurface";
import GeorgePaymentElement from "@/components/george/checkout/GeorgePaymentElement";
import HeadsetOperatorIcon from "@/components/george/HeadsetOperatorIcon";
import LiveChooser from "@/components/george/LiveChooser";
import { LiveCapabilitySurface } from "@/components/george/LiveCapabilitySurface";
import {
  buildLiveGuidance,
  detectConversationProfile,
} from "@/lib/george/live-runtime/live-guidance";
import {
  consumeFreshNormalBrowserSessionRequest,
  createFreshNormalSession,
  createSession,
  ensureGeorgeBrowserInstanceScope,
  getActiveMode,
  getActiveSessionForMode,
  getActiveSessionIdForMode,
  setActiveSessionIdForMode,
  setActiveMode,
  updateActiveSessionMessages,
  updateSessionLinkage,
  updateCampaignSessionMetadata,
  getCampaignSessions,
  getSessionsForMode,
  deleteSession,
  hasMeaningfulUserMessage,
  hydrateSessionsFromServer,
} from "@/lib/george/session/store";
import {
  fetchGeorgeSessionAuthority,
  readCachedGeorgeSessionAuthority,
  writeCachedGeorgeSessionAuthority,
  clearCachedGeorgeSessionAuthority,
} from "@/lib/george/session-authority";
import { detectLiveOutcomeSignal } from "@/lib/george/live-runtime/live-outcome-observation";
import {
  appendFollowUp,
  buildTrainingIntakeOverride,
  trainingNeedsJurisdiction,
} from "@/lib/george/training/training-helpers";
import {
  getPostResponseSuggestedPrompts,
  getReroutePrompt,
  getSuggestedPromptsFromMessages,
  samePromptSet,
} from "@/lib/george/prompts/suggested-prompts";
import { applyRuntimeOverlayFromCode } from "@/lib/george/operator/load-runtime-overlay";
import type { LivePrepSetup } from "@/lib/george/live-runtime/prep-runtime";
import { buildGeorgeCoreInterpretation } from "@/lib/george/core/build-interpretation";
import { tryLiveFastPath } from "@/lib/george/live-runtime/live-fast-path";
import { buildLiveRuntimeContext } from "@/lib/george/live-runtime/live-runtime-context";
import type { LiveOutcomeObservation } from "@/lib/george/live-runtime/live-outcome-review";
import { PostLiveConversationRecordPanel } from "@/components/george/live/PostLiveConversationRecordPanel";
import { LiveRoomStatusPanel } from "@/components/george/live/LiveRoomStatusPanel";
import { LiveHubShadowBridge } from "@/components/george/live/LiveHubShadowBridge";
import { LiveHubVisualCueBridge } from "@/components/george/live/LiveHubVisualCueBridge";
import { useLiveAudioRuntime } from "@/hooks/useLiveAudioRuntime";
import { useLiveReflexListener } from "@/hooks/useLiveReflexListener";
import {
  isDirectGeorgeAddress,
  isLiveSteeringPhrase,
  type LastLiveFinalTranscript,
} from "@/lib/george/live-runtime/transcript-routing";
import {
  applyLiveFinalTranscriptExecution,
  resolveLiveFinalTranscriptAction,
} from "@/lib/george/live-runtime/live-final-transcript-adapter";
import { resolveLiveTranscriptDecision } from "@/lib/george/live-runtime/live-transcript-controller";
import { rememberLiveSpokenLine } from "@/lib/george/live-runtime/spoken-memory";
import { type LiveAwarenessFragment } from "@/lib/george/live-runtime/live-awareness-buffer";
import { processLiveAwarenessSignal } from "@/lib/george/live-runtime/live-awareness-pipeline";
import {
  buildLiveSelfDescription,
  isLiveIdentityQuestion,
} from "@/lib/george/identity/live-self-description";
import {
  resolveLiveIntentRuntime,
  resolveLiveMessageBarSetup,
} from "@/lib/george/live-runtime/live-intent-runtime";
import { resolvePreProviderSend } from "@/lib/george/runtime/pre-provider-send-resolution";
import { resolveCoursesExpandResponse } from "@/lib/george/runtime/training-runtime";
import {
  detectLiveFriction,
  scoreLiveFriction,
} from "@/lib/george/live-runtime/live-friction";
import type { OperationalResourceMonitorState } from "@/lib/george/runtime/operational-resource-monitor";
import type { GeorgeRuntimeAuthoritySnapshot } from "@/lib/george/runtime/runtime-pipeline";
import {
  NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
  type GeorgeOperationalDisposition,
  type NormalLiveOperationalJudgmentResult,
} from "@/lib/george/runtime/operational-judgment";

type NormalOperationalJudgmentRequestOptions = {
  signalAcquisitionAllowed?: boolean;
};

type NormalPreparationJudgmentResult = {
  runtimeAuthoritySnapshot: GeorgeRuntimeAuthoritySnapshot;
  operationalJudgmentResult: NormalLiveOperationalJudgmentResult;
};

const GEORGE_LAST_NORMAL_DRAFT = "george_last_normal_draft";

const LIVE_ENTRY_RESPONSIBILITY_MARKER = "[RESPONSIBILITY_CHECKPOINT]";
const LIVE_ENTRY_TOA_MARKER = "[TOA_CHECKPOINT]";

function getLiveEntryCheckpointState(
  briefing: string | null,
  responsibilityConfirmed: boolean,
  toaConfirmed: boolean,
) {
  const source = String(briefing || "");

  const responsibilityIndex = source.indexOf(LIVE_ENTRY_RESPONSIBILITY_MARKER);
  const toaIndex = source.indexOf(LIVE_ENTRY_TOA_MARKER);

  if (!source || responsibilityIndex < 0 || toaIndex < 0) {
    return {
      text: source,
      showResponsibility: false,
      showToa: false,
    };
  }

  const beforeResponsibility = source.slice(0, responsibilityIndex).trim();
  const afterResponsibility = source
    .slice(
      responsibilityIndex + LIVE_ENTRY_RESPONSIBILITY_MARKER.length,
      toaIndex,
    )
    .trim();
  const afterToa = source.slice(toaIndex + LIVE_ENTRY_TOA_MARKER.length).trim();

  if (!responsibilityConfirmed) {
    return {
      text: beforeResponsibility,
      showResponsibility: true,
      showToa: false,
    };
  }

  if (!toaConfirmed) {
    return {
      text: [beforeResponsibility, afterResponsibility]
        .filter(Boolean)
        .join("\n\n"),
      showResponsibility: false,
      showToa: true,
    };
  }

  return {
    text: [beforeResponsibility, afterResponsibility, afterToa]
      .filter(Boolean)
      .join("\n\n"),
    showResponsibility: false,
    showToa: false,
  };
}

function deriveSessionTitle(
  desiredOutcome?: string | null,
  fallback?: string | null,
) {
  const outcome = String(desiredOutcome || "").trim();

  if (outcome.length > 0) {
    return outcome.length > 72 ? outcome.slice(0, 72).trim() + "…" : outcome;
  }

  const fb = String(fallback || "").trim();

  if (fb.length > 0) {
    return fb.length > 72 ? fb.slice(0, 72).trim() + "…" : fb;
  }

  return "In Progress";
}

function getActiveLiveDesiredOutcomeTitle(fallback?: string | null) {
  if (typeof window === "undefined") return deriveSessionTitle(null, fallback);

  try {
    const activeSetup =
      JSON.parse(
        window.localStorage.getItem("george_live_setup_active") || "null",
      ) ||
      JSON.parse(
        window.localStorage.getItem("GEORGE_LAST_LIVE_SETUP") || "null",
      ) ||
      JSON.parse(window.localStorage.getItem("GEORGE_LIVE_SETUP") || "null");

    return deriveSessionTitle(
      activeSetup?.objective || activeSetup?.room || null,
      fallback,
    );
  } catch {
    return deriveSessionTitle(null, fallback);
  }
}

function deriveNormalSessionTitleFromMessages(
  messages: Message[],
  fallback?: string | null,
) {
  const firstUser = messages
    .find((message) => message.role === "user")
    ?.content?.trim();
  const cleaned = firstUser
    ?.replace(/\s+/g, " ")
    .replace(/^(can you|could you|please|help me|i need to|i want to)\s+/i, "")
    .trim();

  return deriveSessionTitle(cleaned, fallback || "GEORGE Session");
}

const GEORGE_PREPARATION_TAGLINES = [
  "preparation serves outcome.",
  "prepare before the room begins.",
  "preparation reveals fresh options.",
  "preparation reduces uncertainty.",
  "preparation strengthens judgment.",
  "preparation uncovers better questions.",
  "preparation improves timing.",
  "preparation increases confidence.",
  "preparation strengthens communication.",
  "preparation protects opportunity.",
  "preparation turns understanding into movement.",
  "preparation makes better outcomes more likely.",
];


function getLiveRuntimeSteeringLabels(room?: string | null) {
  const clean = String(room || "")
    .trim()
    .toLowerCase();

  if (clean.includes("interview")) return ["Answer", "Example", "Redirect"];
  if (clean.includes("negotiation")) return ["Probe", "Anchor", "Protect"];
  if (clean.includes("doctor") || clean.includes("medical"))
    return ["Clarify", "Challenge", "Escalate"];
  if (
    clean.includes("investor") ||
    clean.includes("capital") ||
    clean.includes("fundraising")
  )
    return ["Explore", "Position", "Close"];
  if (clean.includes("sales")) return ["Trust", "Objection", "Close"];
  if (clean.includes("board") || clean.includes("executive"))
    return ["Frame", "Evidence", "Decision"];

  return ["Approach", "Momentum", "Trust"];
}

function getLiveResponseServingTags(
  message: Message,
  liveAssistMode?: string | null,
) {
  if (Array.isArray(message.servingTags) && message.servingTags.length > 0) {
    return message.servingTags.slice(0, 3);
  }

  const content = String(message.content || "").toLowerCase();
  const tags: string[] = [];

  const add = (tag: string) => {
    if (!tags.includes(tag)) tags.push(tag);
  };

  if (/outcome|objective|goal|shift|pivot|reframe/.test(content))
    add("Outcome");
  if (/say|tell them|open with|close with|ask them|respond/.test(content))
    add("Continuation");
  if (/cue|watch|listen|notice|pressure|timing|signal/.test(content))
    add("Cues");
  if (/should|best move|recommend|i would|next step|let's/.test(content))
    add("Advise");
  if (/confirm|commit|owner|when|next step/.test(content)) add("Close");

  if (tags.length === 0) {
    if (liveAssistMode === "lines") add("Continuation");
    else add("Cues");
    add("Advise");
  }

  return tags.slice(0, 3);
}


type Message = {
  role: "assistant" | "user" | "system";
  content: string;
  constrained?: boolean;
  imageDataUrl?: string | null;
  simplifiedFromIndex?: number;
  source?:
    | "user_input"
    | "sidebar_prompt"
    | "live_transcript"
    | "third_party_speech"
    | "system_override";
  servingTags?: string[];
  presentationMode?: "live_preparation";
};

function buildNormalPreparationQuestionContent(question: PreparationQuestion) {
  const questionText = String(question.question || "").trim();
  const rawExample = String(question.example || "").trim();
  const exampleIsInterfaceGuidance =
    /^(answer if useful,? or skip|this (?:answer )?may improve george(?:'s|’s) context, timing, and support)\.?$/i.test(
      rawExample,
    );
  const answerFormula = !rawExample || exampleIsInterfaceGuidance
    ? ""
    : /^for example:/i.test(rawExample)
      ? rawExample
      : `For example: ${rawExample.replace(/^example:\s*/i, "")}`;

  return [questionText, answerFormula].filter(Boolean).join("\n\n");
}

type PromptSelection = {
  label: string;
  text: string;
  context: string;
};

// PRO LIVE / campaign architecture is shelved.
// Keep remaining campaign code inert until it is extracted or deleted.
// See docs/architecture/PRO_LIVE_CAMPAIGNS.bak.md.

type GeorgeCampaign = {
  id: string;
  name: string;
  mode: "solo" | "firm";
  productOrService?: string;
  targetMarket?: string;
  callingFromRegion?: string;
  callingToRegion?: string;
  desiredOutcome?: string;
  assistMode?:
    | "manual"
    | "negotiation"
    | "objection_handling"
    | "discovery"
    | "closing"
    | "compliance";
  deliveryMode?: "text" | "audio" | "both";
  outputStyle?: "say_ask_boundary_close" | "short_cues" | "repeatable_lines";
  successSignal?: string;
  currentGoal?: string;
  complianceBoundaries?: string;
  requiredLanguage?: string[];
  forbiddenClaims?: string[];
  timingRules?: string[];
  qualificationRules?: string[];
  dataToPreserve?: string[];
  defaultAnswersEnabled: boolean;
};

type GeorgeConversation = {
  id: string;
  type: "conversation";
  title?: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];

  summary?: string;
  personOrRole?: string;
  setting?: string;
  userGoal?: string;
  lastKnownState?: string;
  suggestedRestart?: string;
};

function saveSessionToV2(params: {
  id?: string;
  mode: "normal" | "live";
  title: string;
  messages: Message[];
  summary?: string;
  userGoal?: string;
  lastKnownState?: string;
  suggestedRestart?: string;
  metadata?: Record<string, unknown>;
}) {
  return saveGeorgeSession(params);
}

const REROUTE_PROMPT: PromptSelection = {
  label: "New strategy",
  text: "Give me a new strategy from where I am now.",
  context: "strategy_recalculation",
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorLike = {
  error?: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}


function renderAssistantContent(text: string, liveMode: boolean) {
  const cleaned = String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^###\s+/gm, "")
    .replace(/^##\s+/gm, "")
    .replace(/^#\s+/gm, "")
    .trim();

  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`flex flex-col ${liveMode ? "gap-7" : "gap-5"}`}>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const bulletLines = lines.filter((line) => /^[-•*]\s+/.test(line));

        const numberedLines = lines.filter((line) => /^\d+[.)]\s+/.test(line));

        if (
          lines.length > 1 &&
          (bulletLines.length === lines.length ||
            numberedLines.length === lines.length)
        ) {
          return (
            <div key={index}>
              {bulletLines.length === lines.length ? (
                <ul className="space-y-3">
                  {lines.map((line, i) => (
                    <li key={i}>{line.replace(/^[-•*]\s+/, "• ")}</li>
                  ))}
                </ul>
              ) : (
                <ol className="space-y-3">
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
              )}
            </div>
          );
        }

        return (
          <div key={index} className="flex flex-col gap-3">
            {lines.map((line, lineIndex) => {
              if (/^[-•*]\s+/.test(line)) {
                return (
                  <div key={lineIndex} className="pl-5 -indent-5">
                    {line.replace(/^[-•*]\s+/, "• ")}
                  </div>
                );
              }

              if (/^\d+[.)]\s+/.test(line)) {
                return (
                  <div key={lineIndex} className="pl-5 -indent-5">
                    {line}
                  </div>
                );
              }

              const routeLink = line.match(
                /^\[([^\]]+)\]\((\/[^)]+)\)$/,
              );

              if (routeLink) {
                return (
                  <div key={lineIndex}>
                    <a
                      href={routeLink[2]}
                      className="inline-flex items-center gap-1.5 border-b border-[#8FAEFF]/34 pb-[1px] font-medium text-[#AFC0FF]/82 transition hover:border-[#AFC0FF]/72 hover:text-[#DCE5FF]"
                    >
                      {routeLink[1]}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                );
              }

              return <div key={lineIndex}>{line}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

const georgeAmbientPulseStyles = `
@keyframes georgeGhostDrift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
  50% { transform: translate3d(2.5%, -1.5%, 0) scale(1.025); opacity: 0.82; }
}

@keyframes georgeGhostDriftSlow {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.92; }
  50% { transform: translate3d(-2%, 1.5%, 0) scale(1.018); opacity: 1; }
}


@keyframes terminalDot {
  0%, 100% {
    opacity: 0.24;
    transform: translateY(0) scale(0.82);
    filter: blur(0px);
  }
  42% {
    opacity: 0.95;
    transform: translateY(-1px) scale(1);
    filter: blur(0.15px);
  }
}

.,
.,
.,
. {
  animation: terminalDot 0.82s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(174, 182, 255, 0.22);
}

. { animation-delay: 90ms; opacity: 0.72; }
. { animation-delay: 180ms; opacity: 0.52; }
. { animation-delay: 270ms; opacity: 0.36; }
`;

export default function Page({
  forceLive = false,
}: { forceLive?: boolean } = {}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [preparationTaglineIndex, setPreparationTaglineIndex] = useState(0);
  const [typedPreparationTagline, setTypedPreparationTagline] = useState("");
  const [hasSentFirstNormalMessage, setHasSentFirstNormalMessage] =
    useState(false);
  const [composerPlaceholder, setComposerPlaceholder] =
    useState("Say it here…");
  const [composerFocused, setComposerFocused] = useState(false);
  const [composerSendFeedback, setComposerSendFeedback] = useState(false);
  const [composerSendFeedbackSignal, setComposerSendFeedbackSignal] =
    useState(0);
  const [lastGuidedLine, setLastGuidedLine] = useState("");
  const [liveMode, setLiveMode] = useState(false);

  function getVisitCount() {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem("george_visit_count");
    const count = Number(raw || "0");
    return Number.isFinite(count) ? count : 0;
  }

  function bumpVisitCount() {
    if (typeof window === "undefined") return;
    const next = getVisitCount() + 1;
    window.localStorage.setItem("george_visit_count", String(next));
  }

  function getInitialGreeting(name = "", tier = "smart") {
    const hour = new Date().getHours();
    const visitCount = getVisitCount();

    const timeGreeting =
      hour < 12
        ? "Good morning."
        : hour < 18
          ? "Good afternoon."
          : "Good evening.";

    const firstTimeGreeting = `An intelligent utility for decisions, preparation, and words that matter.`;

    // Normal GEORGE opens with continuity posture.
    // Scope: non-LIVE normal sessions only.
    // This is behavioral orientation, not session restoration.
    // Saved conversations, LIVE Conversations, and room prep continuation remain handled by pickers.
    const earlyUserGreeting = `Continue current direction\nor switch projects?`;

    const greetingPool = [
      `${timeGreeting} Most distractions are noise. What matters today?`,
      `${timeGreeting} We can drift, or we can execute. Which is it?`,
      `${timeGreeting} Bring me something real.`,
      `${timeGreeting} Comfort costs. What is the bottleneck?`,
      `${timeGreeting} Protect momentum. What’s the next decisive step?`,
      `${timeGreeting} What are we trying to move forward?`,
      `${timeGreeting} Pressure reveals weak systems. What needs fixing?`,
      `${timeGreeting} Time is moving either way. What move are we making?`,
      `${timeGreeting} What are we building that actually matters?`,
      `${timeGreeting} The strongest next move is usually smaller than you think. What is it?`,
    ];

    if (visitCount === 0) {
      return firstTimeGreeting;
    }

    if (visitCount > 0 && visitCount < 5) {
      return earlyUserGreeting;
    }

    if (tier === "smart") {
      return greetingPool[Math.floor(Date.now() / 60000) % greetingPool.length];
    }

    if (tier === "intelligent") {
      return greetingPool[Math.floor(Date.now() / 60000) % greetingPool.length];
    }

    if (tier === "brilliant") {
      return greetingPool[Math.floor(Date.now() / 60000) % greetingPool.length];
    }

    return `${timeGreeting} What do you want to do?`;
  }

  async function handleShareGeorge() {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/` : "/";

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "GEORGE by BRANESx",
          text: "Some conversations change everything, so be...\n\nMore knowledgeable.\n\nMore centered.\n\nMore persuasive.\n\nMore expansive.\n\nwith GEORGE in any room.",
          url,
        });

        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setToastMessage("GEORGE link copied");
        setShowToast(true);
      }
    } catch {}
  }

  useEffect(() => {
    if (input.trim() || composerFocused) return;

    let mounted = true;
    const phrases = [
      "Say it here…",
      "Ask it here…",
      "Upload a document…",
      "LIVE is available…",
      "Use your capabilities…",
      "Need a pitch deck?",
    ];
    let phraseIndex = phrases.indexOf(composerPlaceholder);
    if (phraseIndex < 0) phraseIndex = 0;

    const timer = window.setInterval(() => {
      if (!mounted) return;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setComposerPlaceholder(phrases[phraseIndex]);
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [input, composerFocused, composerPlaceholder]);

  useEffect(() => {
    if (!composerSendFeedbackSignal) return;

    setComposerSendFeedback(true);

    const timer = window.setTimeout(() => {
      setComposerSendFeedback(false);
    }, 1050);

    return () => {
      window.clearTimeout(timer);
    };
  }, [composerSendFeedbackSignal]);

  const [messages, setMessages] = useState<Message[]>([]);
  const normalSessionBootedRef = useRef(false);
  const normalSessionWriteReadyRef = useRef(false);
  const liveSessionWriteReadyRef = useRef(false);
  const preLiveSessionIdRef = useRef<string | null>(null);
  const normalLiveExplicitObjectiveRef = useRef("");
  const normalAdaptiveQuestionRequestRef = useRef(false);
  const liveEntryBootedRef = useRef(false);
  const [pendingImage, setPendingImage] = useState<{
    dataUrl: string;
    name: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const [feedbackPulse, setFeedbackPulse] = useState<Record<string, boolean>>(
    {},
  );
  const [conversationMode, setConversationMode] = useState<string | null>(null);
  const [dismissedTrajectoryIds, setDismissedTrajectoryIds] = useState<
    string[]
  >([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = JSON.parse(
        window.localStorage.getItem("GEORGE_DISMISSED_TRAJECTORIES") || "[]",
      );
      setDismissedTrajectoryIds(Array.isArray(saved) ? saved : []);
    } catch {
      setDismissedTrajectoryIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("GEORGE_FEEDBACK_STATE") || "{}",
      );

      if (saved && typeof saved === "object") {
        setFeedback(saved);
      }
    } catch {}
  }, []);

  const dismissTrajectory = (id: string) => {
    setDismissedTrajectoryIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      window.localStorage.setItem(
        "GEORGE_DISMISSED_TRAJECTORIES",
        JSON.stringify(next),
      );
      return next;
    });
  };

  const unfinishedTrajectories = useMemo(() => {
    if (typeof window === "undefined") return [];

    try {
      const existing = JSON.parse(
        window.localStorage.getItem("GEORGE_WORKSPACE") || "[]",
      ) as any[];

      return existing
        .filter((item) => item?.type === "goal")
        .filter((item) => (item.status || "active") !== "completed")
        .filter((item) => !dismissedTrajectoryIds.includes(item.id))
        .sort(
          (a, b) =>
            (b.updatedAt || b.timestamp || 0) -
            (a.updatedAt || a.timestamp || 0),
        )
        .slice(0, 3)
        .map((item) => {
          const title = String(
            item.trajectoryTitle || item.preview || "Active direction",
          )
            .replace(/\s+/g, " ")
            .trim();
          const summary = String(
            item.trajectorySummary || "Still in chamber. Ready when you are.",
          )
            .replace(/\s+/g, " ")
            .trim();

          return {
            id: item.id,
            title: title.length > 78 ? `${title.slice(0, 78)}…` : title,
            summary: summary.length > 92 ? `${summary.slice(0, 92)}…` : summary,
          };
        });
    } catch {
      return [];
    }
  }, [dismissedTrajectoryIds]);

  useEffect(() => {
    // 🚫 NEVER run greeting if LIVE or Conversation Mode is active
    if (forceLive || liveMode || isManualLive) return;

    const greeting = getInitialGreeting();

    setMessages((prev) => {
      if (prev.length === 0) {
        const next = [{ role: "assistant" as const, content: greeting }];
        messagesRef.current = next;
        return next;
      }

      if (
        prev.length === 1 &&
        prev[0]?.role === "assistant" &&
        prev[0]?.content.includes("Tell me what matters today?")
      ) {
        const next = [{ role: "assistant" as const, content: greeting }];
        messagesRef.current = next;
        return next;
      }

      return prev;
    });

    if (messagesRef.current.length === 0) {
      messagesRef.current = [{ role: "assistant", content: greeting }];
    }

    if (
      messagesRef.current.length === 1 &&
      messagesRef.current[0]?.role === "assistant" &&
      messagesRef.current[0]?.content.includes("Tell me what matters today?")
    ) {
      messagesRef.current = [{ role: "assistant", content: greeting }];
    }
  }, []);

  function handleFeedback(index: number, type: "up" | "down") {
    setFeedback((prev) => {
      const current = prev[index];

      const next = {
        ...prev,
      };

      if (current === type) {
        delete next[index];
      } else {
        next[index] = type;
      }

      try {
        localStorage.setItem("GEORGE_FEEDBACK_STATE", JSON.stringify(next));
      } catch {}

      return next;
    });

    const pulseKey = `${index}-${type}`;
    setFeedbackPulse((prev) => ({
      ...prev,
      [pulseKey]: true,
    }));

    window.setTimeout(() => {
      setFeedbackPulse((prev) => ({
        ...prev,
        [pulseKey]: false,
      }));
    }, 520);

    const msg = messagesRef.current[index];
    if (!msg || msg.role !== "assistant") return;

    const key = type === "up" ? "GEORGE_POSITIVE" : "GEORGE_NEGATIVE";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    existing.push({
      content: msg.content,
      timestamp: Date.now(),
    });

    localStorage.setItem(key, JSON.stringify(existing));
  }

  const [interimTranscript, setInterimTranscript] = useState("");
  const [liveHubShadowTranscript, setLiveHubShadowTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [interactionMode, setInteractionMode] = useState<"text" | "speech">(
    "text",
  );
  const [pendingAssistantMessage, setPendingAssistantMessage] =
    useState<Message | null>(null);
  const [activePromptLabel, setActivePromptLabel] = useState<string | null>(
    null,
  );
  const [activePromptContext, setActivePromptContext] = useState<string | null>(
    null,
  );
  const [showPreLiveSignalSurface, setShowPreLiveSignalSurface] =
    useState(false);
  const [currentPreLiveQuestion, setCurrentPreLiveQuestion] =
    useState<PreparationQuestion | null>(null);
  const [preLiveSignals, setPreLiveSignals] = useState<Record<string, string>>(
    {},
  );
  const [preLiveSignalComplete, setPreLiveSignalComplete] = useState(false);
  const [normalPreparationSession, setNormalPreparationSession] =
    useState<PreparationSessionV1 | null>(null);
  const [normalOperationalDisposition, setNormalOperationalDisposition] =
    useState<GeorgeOperationalDisposition | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("GEORGE_PRE_LIVE_SIGNALS");
      const parsed = raw ? JSON.parse(raw) : null;

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const hydrated = Object.fromEntries(
          Object.entries(parsed)
            .map(([key, value]) => [key, String(value || "").trim()])
            .filter(([, value]) => Boolean(value)),
        );

        setPreLiveSignals(hydrated);
      }
    } catch {}
  }, []);

  const isManualLive =
    conversationMode === "manual_live" || activePromptContext === "manual_live";
  const [campaigns, setCampaigns] = useState<GeorgeCampaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [showCampaignMenu, setShowCampaignMenu] = useState(false);
  const [language, setLanguage] = useState("English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageOptions = [
    "English",
    "Español",
    "Français",
    "العربية",
    "中文",
    "日本語",
  ];

  const activeCampaign =
    campaigns.find((campaign) => campaign.id === activeCampaignId) || null;
  const resolvedLivePosture =
    conversationMode === "live_debate" || activePromptContext === "live_debate"
      ? "debate"
      : activeCampaign?.assistMode === "negotiation"
        ? "negotiation"
        : activeCampaign?.assistMode === "objection_handling"
          ? "response"
          : conversationMode === "live_negotiation" ||
              activePromptContext === "live_negotiation" ||
              conversationMode === "professional_negotiation" ||
              activePromptContext === "professional_negotiation"
            ? "negotiation"
            : conversationMode === "live_response" ||
                activePromptContext === "live_response" ||
                conversationMode === "professional_objection_handling" ||
                activePromptContext === "professional_objection_handling"
              ? "response"
              : isManualLive
                ? "manual"
                : "default";

  const resolvedOutputStyle =
    activeCampaign?.outputStyle ||
    (resolvedLivePosture === "debate"
      ? "repeatable_lines"
      : resolvedLivePosture === "negotiation"
        ? "say_ask_boundary_close"
        : resolvedLivePosture === "response"
          ? "repeatable_lines"
          : "short_cues");

  const liveLastSignalRef = useRef<number>(0);
  const liveInterventionRef = useRef<number>(0);
  const lastCueTsRef = useRef<number>(0);
  const liveConversationStateRef = useRef({
    objectionCount: 0,
    dismissCount: 0,
    pressureCount: 0,
    lastCue: "",
    outcomeState: "neutral",
    activeDirection: "clarity",
  });

  const [contextTurnCount, setContextTurnCount] = useState(0);
  const [reroutePrompt, setReroutePrompt] = useState<PromptSelection | null>(
    null,
  );
  const [rerouteSignal, setRerouteSignal] = useState(0);
  const [currentTier, setCurrentTier] = useState<
    "smart" | "intelligent" | "brilliant"
  >("smart");
  const [tierSignalPhase, setTierSignalPhase] = useState(0);
  const [showNormalUtilityMenu, setShowNormalUtilityMenu] = useState<
    "help" | "language" | null
  >(null);
  const [showMemoryContinuityPanel, setShowMemoryContinuityPanel] =
    useState(false);
  const normalUtilityMenuRef = useRef<HTMLDivElement | null>(null);
  const [activeHelpTopic, setActiveHelpTopic] = useState<
    "live" | "continuity" | "memory" | "images" | "signal"
  >("live");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = window.setInterval(() => {
      setTierSignalPhase((phase) => (phase + 1) % 2);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  const hasLiveGeorgeAccess =
    currentTier === "intelligent" || currentTier === "brilliant";
  const tierUpgradeAction =
    currentTier === "smart"
      ? {
          label: "BE INTELLIGENT",
          headline: "Current Access",
          currentLabel: "Smart",
          currentIncludes: [
            "Ask GEORGE",
            "Limited continuity",
            "Limited LIVE capacity",
            "Basic restoration",
          ],
          nextCopy:
            "Intelligent includes everything in Smart, plus stronger continuity, contextual awareness, expanded LIVE resources, and operational support.",
          cta: "Understand More",
          href: "/activate?tier=intelligent&intent=be-intelligent",
        }
      : currentTier === "intelligent"
        ? {
            label: "BE BRILLIANT",
            headline: "Current Access",
            currentLabel: "Intelligent",
            currentIncludes: [
              "Expanded continuity",
              "Contextual awareness",
              "Operational support",
              "Expanded LIVE capacity",
            ],
            nextCopy:
              "Brilliant includes everything in Intelligent, plus deeper continuity, stronger awareness, persistent operational support, and the highest LIVE capacity.",
            cta: "Understand More",
            href: "/activate?tier=brilliant&intent=be-brilliant",
          }
        : {
            label: "STAY BRILLIANT",
            headline: "Current Access",
            currentLabel: "Brilliant",
            currentIncludes: [
              "Maximum continuity",
              "Deep contextual awareness",
              "Persistent operational support",
              "Highest LIVE capacity",
            ],
            nextCopy:
              "Highest Access Active. Based on recent usage, Intelligent may also be sufficient.",
            cta: "Manage Access",
            href: "/activate?tier=brilliant&intent=stay-brilliant",
          };

  const tierPrimarySignal =
    currentTier === "smart"
      ? "Go Intelligent"
      : currentTier === "intelligent"
        ? "Go Brilliant"
        : "Stay Brilliant";
  const tierSignalText =
    hasLiveGeorgeAccess && tierSignalPhase === 1
      ? "You have access to LIVE GEORGE"
      : tierPrimarySignal;
  const showLiveGeorgeFlame = hasLiveGeorgeAccess && tierSignalPhase === 1;
  const tieredStarterPrompts = useMemo<PromptSelection[]>(() => {
    if (currentTier === "brilliant") {
      return [];
    }

    if (currentTier === "intelligent") {
      return [
        {
          label: "Faster revenue",
          text: "I need to make money faster, and I want GEORGE to ask the right question first, then build a practical execution plan.",
          context: "money_skill_to_income",
        },
        {
          label: "Build correctly",
          text: "I want to build something, and I want GEORGE to help me define the target, sequence the work, and avoid wasted steps.",
          context: "build_start",
        },
        {
          label: "Get moving",
          text: "I am stuck, and I want GEORGE to clarify what is blocking me and turn this into an executable next step.",
          context: "unstuck_start",
        },
      ];
    }

    return [
      {
        label: "Fast revenue",
        text: "I need to make money, and I want the clearest realistic path before I choose a direction.",
        context: "money_this_week",
      },
      {
        label: "Build something",
        text: "I want to build something, and I need GEORGE to help me see the strongest starting point.",
        context: "build_start",
      },
      {
        label: "Get unstuck",
        text: "I am stuck, and I need GEORGE to show me what matters most and what to do first.",
        context: "unstuck_start",
      },
    ];
  }, [currentTier]);

  const [suggestedPrompts, setSuggestedPrompts] =
    useState<PromptSelection[]>(tieredStarterPrompts);

  useEffect(() => {
    setSuggestedPrompts(tieredStarterPrompts);
  }, [tieredStarterPrompts]);
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    fetch("/api/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        if (data?.tier === "intelligent" || data?.tier === "brilliant") {
          setCurrentTier(data.tier);
          window.localStorage.setItem("george_tier", data.tier);

          if (data?.email) {
            const restoredEmail = String(data.email).trim().toLowerCase();
            setSubscriberEmail(restoredEmail);
            window.localStorage.setItem("george_email", restoredEmail);
            window.localStorage.setItem("george_verified_continuity", "true");
            void hydrateSessionsFromServer();
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLanguage = window.localStorage.getItem("george_language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    const savedCadence = window.localStorage.getItem("george_live_cadence");
    if (savedCadence) {
      setLiveCadence(savedCadence);
    }

    try {
      const rawLiveSetup = window.localStorage.getItem("GEORGE_LIVE_SETUP");

      if (rawLiveSetup) {
        const parsed = JSON.parse(rawLiveSetup);

        if (parsed?.controlWords) {
          const firstPhrase = parsed.controlWords
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean)[0];

          if (firstPhrase) {
            setLiveSteeringPhrase(firstPhrase);
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    // PRO LIVE / campaign architecture is archived.
    // Do not auto-load campaigns or restore campaign sessions into active GEORGE/LIVE runtime.
    setCampaigns([]);
    setActiveCampaignId(null);
  }, []);

  useEffect(() => {
    // Campaign persistence is V2-owned. Keep local state only for the active UI session.
    return;
  }, [campaigns, activeCampaignId]);
  const [tonePopupIndex, setTonePopupIndex] = useState<number | null>(null);
  const [tonePopupUpward, setTonePopupUpward] = useState(true);
  const [rewordPopupIndex, setRewordPopupIndex] = useState<number | null>(null);
  const [recommendedControl, setRecommendedControl] = useState<string | null>(
    null,
  );
  const [rewordPopupUpward, setRewordPopupUpward] = useState(true);
  const [assistTone, setAssistTone] = useState<
    "calm" | "direct" | "assertive" | "firm" | "warm" | "neutral"
  >("direct");
  const resolvedAssistTone =
    assistTone ||
    (resolvedLivePosture === "negotiation"
      ? "firm"
      : resolvedLivePosture === "response"
        ? "calm"
        : "direct");

  const replaceLastLiveGuidance = (guidance: string) => {
    const existingMessages = [...messagesRef.current];
    const lastMessage = existingMessages[existingMessages.length - 1];

    const shouldReplaceLastGuidance =
      lastMessage?.role === "assistant" &&
      typeof lastMessage?.content === "string" &&
      (lastMessage.content.includes("reduce leakage") ||
        lastMessage.content.includes("without overexplaining"));

    const nextMessages = shouldReplaceLastGuidance
      ? [
          ...existingMessages.slice(0, -1),
          {
            role: "assistant" as const,
            content: guidance,
          },
        ]
      : [
          ...existingMessages,
          {
            role: "assistant" as const,
            content: guidance,
          },
        ];

    window.setTimeout(() => {
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
    }, 220);
  };

  const activateNegotiationPosture = () => {
    setActivePromptContext("live_negotiation");
    setConversationMode("live_negotiation");
    setLiveDeliveryStyle("line");

    setToastMessage("Negotiation guidance active.");
    setShowToast(true);
    replaceLastLiveGuidance(
      "Good. I’ll help you stay composed, reduce leakage, and move toward leverage.",
    );
  };

  const activateResponsePosture = () => {
    setActivePromptContext("live_response");
    setConversationMode("live_response");
    setLiveDeliveryStyle("response");

    setToastMessage("Response handling active.");
    setShowToast(true);
    replaceLastLiveGuidance(
      "Good. I’ll help you answer pressure, objections, or confusion without overexplaining.",
    );
  };

  const [forceClose, setForceClose] = useState(false);

  const [suggestedSignal, setSuggestedSignal] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const getInitialLiveDeliveryStyle = ():
    "cue" | "advice" | "line" | "response" | "expandedLine" | "continue" => {
    if (typeof window === "undefined") return "advice";

    const rawStored =
      window.localStorage.getItem("GEORGE_LIVE_SUPPORT_STYLE") ||
      window.localStorage.getItem("GEORGE_LIVE_DELIVERY_STYLE");

    const stored =
      rawStored === "completion"
        ? "continue"
        : rawStored === "presentation"
          ? "expandedLine"
          : rawStored;

    return stored === "cue" ||
      stored === "advice" ||
      stored === "line" ||
      stored === "response" ||
      stored === "expandedLine" ||
      stored === "continue"
      ? stored
      : "advice";
  };
  const [liveDeliveryStyle, setLiveDeliveryStyle] = useState<
    "cue" | "advice" | "line" | "response" | "expandedLine" | "continue"
  >(getInitialLiveDeliveryStyle);

  type GeorgeLiveReceiverProfile =
    "audio_only" | "visual_only" | "audio_visual";

  const normalizeLiveReceiverProfile = (
    value: unknown,
  ): GeorgeLiveReceiverProfile | null => {
    return value === "audio_only" ||
      value === "visual_only" ||
      value === "audio_visual"
      ? value
      : null;
  };

  const getInitialLiveReceiverProfile = (): GeorgeLiveReceiverProfile => {
    if (typeof window === "undefined") return "audio_only";

    return (
      normalizeLiveReceiverProfile(
        window.localStorage.getItem("GEORGE_LIVE_RECEIVER_PROFILE"),
      ) ||
      normalizeLiveReceiverProfile(
        window.localStorage.getItem("george_live_entry_receiver_profile"),
      ) ||
      "audio_only"
    );
  };

  type LiveViewMode = "controls" | "reading";

  const getInitialLiveViewMode = (): LiveViewMode => {
    try {
      return (
        (window.localStorage.getItem(
          "GEORGE_LIVE_VIEW_MODE",
        ) as LiveViewMode) ||
        (getInitialLiveReceiverProfile() === "audio_only"
          ? "controls"
          : "reading")
      );
    } catch {
      return "controls";
    }
  };

  const [liveReceiverProfile, setLiveReceiverProfile] =
    useState<GeorgeLiveReceiverProfile>(getInitialLiveReceiverProfile);

  const [liveViewMode, setLiveViewMode] = useState<LiveViewMode>(
    getInitialLiveViewMode,
  );

  const getActiveLiveCommunicationStyle = () => {
    try {
      const setup = JSON.parse(
        window.localStorage.getItem("GEORGE_LIVE_SETUP") || "null",
      );
      return (
        String(setup?.communicationStyle || "").trim() ||
        String(
          window.localStorage.getItem("george_live_communication_style") || "",
        ).trim() ||
        "Adaptive"
      );
    } catch {
      return "Adaptive";
    }
  };

  const activeLiveReceiverProfileLabel =
    liveReceiverProfile === "audio_visual"
      ? "Audio + Visual"
      : liveReceiverProfile === "visual_only"
        ? "Visual"
        : "Audio";

  const cycleLiveReceiverProfile = () => {
    const nextProfile =
      liveReceiverProfile === "audio_only"
        ? "visual_only"
        : liveReceiverProfile === "visual_only"
          ? "audio_visual"
          : "audio_only";

    setLiveReceiverProfile(nextProfile);

    try {
      window.localStorage.setItem("GEORGE_LIVE_RECEIVER_PROFILE", nextProfile);
      window.localStorage.setItem(
        "george_live_entry_receiver_profile",
        nextProfile,
      );
      window.dispatchEvent(new Event("george-live-receiver-profile-change"));
    } catch {}

    setToastMessage(
      nextProfile === "audio_visual"
        ? "Receiver: Audio + Visual"
        : nextProfile === "visual_only"
          ? "Receiver: Visual"
          : "Receiver: Audio",
    );
    setShowToast(true);
  };
  const [showLiveSteeringReference, setShowLiveSteeringReference] =
    useState(false);
  const [liveGeorgeEnabled, setLiveGeorgeEnabled] = useState(true);
  const resolvedDeliveryMode =
    activeCampaign?.deliveryMode || (voiceOn ? "audio" : "text");
  const [voiceSpeed, setVoiceSpeed] = useState(1.2);
  const [voiceType, setVoiceType] = useState("ash");

  const [otherSpeaking, setOtherSpeaking] = useState(false);
  const [lastTranscriptTime, setLastTranscriptTime] = useState(0);

  function detectLiveInterruption(interim: string) {
    const now = Date.now();

    if (interim && interim.trim().length > 0) {
      setOtherSpeaking(true);
      setLastTranscriptTime(now);
    }

    // if silence for 1.2s → other person stopped
    if (now - lastTranscriptTime > 1200) {
      setOtherSpeaking(false);
    }

    // if both talking → interruption
    if (isListening && otherSpeaking) {
      return true;
    }

    return false;
  }

  const [isListening, setIsListening] = useState(false);
  const liveRoomActive = Boolean(forceLive || liveMode) && liveGeorgeEnabled;

  const liveStatusStackRef = useRef<HTMLDivElement | null>(null);
  const [liveStatusStackClearance, setLiveStatusStackClearance] = useState(0);

  const [stableLiveGuidance, setStableLiveGuidance] = useState<{
    signal: string;
    say: string;
  } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [thinkingDots, setThinkingDots] = useState(1);
  const [bridgeThinking, setBridgeThinking] = useState(false);
  const [conversationSignal, setConversationSignal] = useState<string | null>(
    null,
  );
  const [signalTimestamp, setSignalTimestamp] = useState(0);

  const [adaptiveCueLabel, setAdaptiveCueLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!adaptiveCueLabel) return;

    const timer = setTimeout(() => {
      setAdaptiveCueLabel(null);
    }, 2400);

    return () => clearTimeout(timer);
  }, [adaptiveCueLabel]);

  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");

  const getSubscriberSessionMetadata = useCallback(() => {
    const email = subscriberEmail.trim().toLowerCase();
    return email ? { subscriberEmail: email } : { localOnly: true };
  }, [subscriberEmail]);

  const [birthdayMD, setBirthdayMD] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showLiveQuickMenu, setShowLiveQuickMenu] = useState(false);
  const [showLiveSessionDetails, setShowLiveSessionDetails] = useState(false);

  useEffect(() => {
    // LIVE route ownership now belongs exclusively to /george/live
    // Keep disabled to prevent modal/state hydration conflicts.
  }, []);

  const [liveSegueIndex, setLiveSegueIndex] = useState(0);
  const [showAccessCodeEntry, setShowAccessCodeEntry] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessCodeError, setAccessCodeError] = useState("");
  const [showEarbudOverlay, setShowEarbudOverlay] = useState(true);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        normalUtilityMenuRef.current &&
        !normalUtilityMenuRef.current.contains(event.target as Node)
      ) {
        setShowNormalUtilityMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const [showProLiveComingSoon, setShowProLiveComingSoon] = useState(false);
  const [showLiveChooser, setShowLiveChooser] = useState(false);
  const [liveEntryBlinking, setLiveEntryBlinking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      window.localStorage.getItem("george_open_live_access_after_home") === "1"
    ) {
      window.localStorage.removeItem("george_open_live_access_after_home");
      window.localStorage.setItem("george_pending_live_after_access", "1");
      setShowSidebar(false);
      openLiveEntry();
      return;
    }

    if (
      window.localStorage.getItem("george_open_live_chooser_after_home") === "1"
    ) {
      window.localStorage.removeItem("george_open_live_chooser_after_home");
      startLiveSignalAcquisition();
      return;
    }

  }, []);

  const [liveCadence, setLiveCadence] = useState("Balanced");
  const [liveSteeringPhrase, setLiveSteeringPhrase] = useState("hmm");
  const [preLiveMessages, setPreLiveMessages] = useState<Message[] | null>(
    null,
  );
  const [showLiveEntrySequence, setShowLiveEntrySequence] = useState(
    Boolean(forceLive || liveMode),
  );
  const [liveEntryBriefing, setLiveEntryBriefing] = useState<string | null>(
    null,
  );
  const [typedLiveEntryBriefing, setTypedLiveEntryBriefing] = useState("");
  const [liveEntryTypingComplete, setLiveEntryTypingComplete] = useState(false);
  const [
    liveEntryResponsibilityConfirmed,
    setLiveEntryResponsibilityConfirmed,
  ] = useState(false);
  const [liveEntryToaConfirmed, setLiveEntryToaConfirmed] = useState(false);
  const [liveEntryOptionalSignalComplete, setLiveEntryOptionalSignalComplete] =
    useState(false);

  const liveEntryCheckpointState = useMemo(
    () =>
      getLiveEntryCheckpointState(
        liveEntryBriefing,
        liveEntryResponsibilityConfirmed,
        liveEntryToaConfirmed,
      ),
    [
      liveEntryBriefing,
      liveEntryResponsibilityConfirmed,
      liveEntryToaConfirmed,
    ],
  );

  useEffect(() => {
    if (!(forceLive || liveMode) || showLiveEntrySequence) {
      setLiveStatusStackClearance(0);
      return;
    }

    const measure = () => {
      const node = liveStatusStackRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setLiveStatusStackClearance(Math.ceil(rect.bottom + 48));
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    if (resizeObserver && liveStatusStackRef.current) {
      resizeObserver.observe(liveStatusStackRef.current);
    }

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [
    forceLive,
    liveMode,
    showLiveEntrySequence,
    liveRoomActive,
    isListening,
    voiceOn,
  ]);

  useEffect(() => {
    setLiveEntryResponsibilityConfirmed(false);
    setLiveEntryToaConfirmed(false);
    setLiveEntryOptionalSignalComplete(false);
    setShowLiveEntrySequence(Boolean(liveEntryBriefing));
  }, [liveEntryBriefing]);

  useEffect(() => {
    const briefingText = liveEntryCheckpointState.text;

    if (!(forceLive || liveMode) || !briefingText) {
      setTypedLiveEntryBriefing("");
      setLiveEntryTypingComplete(false);
      return;
    }

    let index = 0;
    setLiveEntryTypingComplete(false);
    setTypedLiveEntryBriefing("");

    const timer = window.setInterval(() => {
      index += 1;
      setTypedLiveEntryBriefing(briefingText.slice(0, index));

      if (index >= briefingText.length) {
        window.clearInterval(timer);
        setLiveEntryTypingComplete(true);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [forceLive, liveMode, liveEntryCheckpointState.text]);

  const liveEntryReadyForOptionalSignal =
    showLiveEntrySequence &&
    Boolean(forceLive || liveMode) &&
    liveEntryToaConfirmed &&
    !liveEntryCheckpointState.showResponsibility &&
    !liveEntryCheckpointState.showToa &&
    !liveEntryOptionalSignalComplete &&
    liveEntryTypingComplete;

  const captureLiveEntryOptionalSignal = () => {
    const finalSignal = input.trim();

    if (finalSignal) {
      try {
        window.localStorage.setItem("GEORGE_LIVE_FINAL_SIGNAL", finalSignal);
      } catch {}

      setTypedLiveEntryBriefing(
        (current) => `${current}\n\nI'll account for that.`,
      );
    } else {
      setTypedLiveEntryBriefing((current) => `${current}\n\nUnderstood.`);
    }

    setInput("");
    setLiveEntryOptionalSignalComplete(true);

    window.setTimeout(() => {
      setLiveEntryBriefing(null);
      setShowLiveEntrySequence(false);
    }, 500);

    textareaRef.current?.focus();
  };

  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showOutcomeExitReview, setShowOutcomeExitReview] = useState(false);
  const [pendingLiveExitAction, setPendingLiveExitAction] = useState<
    "save" | "discard" | null
  >(null);
  const [liveOutcomeReview, setLiveOutcomeReview] =
    useState<LiveOutcomeObservation | null>(null);
  const [showConversationRecord, setShowConversationRecord] = useState(false);
  const [lastConversationRecord, setLastConversationRecord] = useState<
    any | null
  >(null);
  const [showSaveNaming, setShowSaveNaming] = useState(false);
  const [pendingSessionTitle, setPendingSessionTitle] = useState("");
  const [conversationMenuLane, setConversationMenuLane] = useState<
    "selector" | "personal" | "professional"
  >("selector");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1280px)");
    const syncDesktopSidebar = () => {
      setShowSidebar(media.matches && !forceLive && !liveMode);
    };
    syncDesktopSidebar();
    media.addEventListener?.("change", syncDesktopSidebar);
    return () => media.removeEventListener?.("change", syncDesktopSidebar);
  }, [forceLive, liveMode]);

  useEffect(() => {
    if (typeof window === "undefined" || !showSidebar) return;

    const mobileOverlay = window.matchMedia("(max-width: 1279px)").matches;
    if (!mobileOverlay) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
    };
  }, [showSidebar]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = "george_removed_upgrade_test_sessions_v1";
    if (window.localStorage.getItem(key) === "1") return;

    const badPatterns = [
      /we can go further here/i,
      /upgrade/i,
      /support the work/i,
      /go brilliant/i,
      /go intelligent/i,
      /test question/i,
    ];

    try {
      for (const storageKey of ["GEORGE_SESSIONS_V2", "GEORGE_SESSIONS"]) {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) continue;

        const sessions = JSON.parse(raw);
        if (!Array.isArray(sessions)) continue;

        const cleaned = sessions.filter((session) => {
          const text = JSON.stringify(session || "");
          return !badPatterns.some((pattern) => pattern.test(text));
        });

        window.localStorage.setItem(storageKey, JSON.stringify(cleaned));
      }

      window.sessionStorage.removeItem("george_last_normal_draft");
      window.sessionStorage.removeItem("GEORGE_LAST_NORMAL_DRAFT");
      window.localStorage.setItem(key, "1");
    } catch {
      window.localStorage.setItem(key, "1");
    }
  }, []);

  useEffect(() => {
    setShowSidebar(false);
  }, []);
  const [activeSaveIndex, setActiveSaveIndex] = useState<number | null>(null);
  const [savePopupUpward, setSavePopupUpward] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showRecentFolders, setShowRecentFolders] = useState(false);
  const [activeMemoryFolder, setActiveMemoryFolder] = useState<string | null>(
    null,
  );
  const [lastDomain, setLastDomain] = useState<string | null>(null);
  const [operationalResourceMonitor, setOperationalResourceMonitor] =
    useState<OperationalResourceMonitorState | null>(null);

  const [canonicalRuntimeAuthority, setCanonicalRuntimeAuthority] =
    useState<GeorgeRuntimeAuthoritySnapshot | null>(null);

  const liveBarMessages = useMemo(() => {
    const opportunity = operationalResourceMonitor?.opportunity;

    if (opportunity) {
      return opportunity.thresholdMet
        ? [
            opportunity.suggestion,
            `${opportunity.title} readiness · ${opportunity.readiness}%`,
            opportunity.tapAction === "open_execution_gateway"
              ? opportunity.executionLabel
              : "Tap to continue preparing in this conversation.",
          ]
        : [
            `${opportunity.title} readiness · ${opportunity.readiness}%`,
            "Keep preparing in this conversation.",
          ];
    }

    return [
      "Opportunity readiness",
      "Keep working with GEORGE. I’ll surface the strongest next capability when it becomes useful.",
    ];
  }, [operationalResourceMonitor]);

  useEffect(() => {
    if (messages.length === 0) setOperationalResourceMonitor(null);
  }, [messages.length]);

  const [liveBarMessageIndex, setLiveBarMessageIndex] = useState(0);
  const [liveBarTypedText, setLiveBarTypedText] = useState("");

  useEffect(() => {
    if (!liveBarMessages.length) return;
    const timer = window.setInterval(() => {
      setLiveBarMessageIndex((prev) => (prev + 1) % liveBarMessages.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [liveBarMessages.length]);

  useEffect(() => {
    const message =
      liveBarMessages[liveBarMessageIndex % liveBarMessages.length] || "";
    setLiveBarTypedText("");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setLiveBarTypedText(message.slice(0, i));
      if (i >= message.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [liveBarMessageIndex, liveBarMessages]);

  const [memoryVersion, setMemoryVersion] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const openLiveOutcomeExitReview = (action: "save" | "discard") => {
    const transcript = messagesRef.current
      .map((message) => message.content)
      .join("\n");

    const { usage, outcomeReview } = prepareLiveCompletionReview({
      desiredOutcome: getActiveLiveDesiredOutcomeTitle("LIVE Conversation"),
      conversationContext:
        getActiveLiveDesiredOutcomeTitle("LIVE Conversation"),
      transcript,
      transcriptEvidenceCount: messagesRef.current.length,
      outcomeGovernor: outcomeGovernorSnapshot,
      persistUsage: action === "save",
    });

    if (usage) {
      const actual =
        typeof usage.actualCents === "number"
          ? `${usage.actualCents}¢`
          : "not estimated";

      setToastMessage(
        `Actual runtime usage: ${actual} · ${usage.summary}`,
      );
      setShowToast(true);
    }

    setPendingLiveExitAction(action);
    setLiveOutcomeReview(outcomeReview);
    setShowExitPopup(false);
    setShowOutcomeExitReview(true);
  };

  const finishLiveExitAfterOutcomeReview = async () => {
    try {
      if (liveOutcomeReview) {
        const transcript = messagesRef.current
          .map((message) => message.content)
          .join("\n");

        const completion = await completeLiveConversation({
          desiredOutcome: liveOutcomeReview.desiredOutcome,
          conversationContext:
            getActiveLiveDesiredOutcomeTitle("LIVE Conversation"),
          transcript,
          transcriptEvidenceCount: messagesRef.current.length,
          outcomeGovernor: outcomeGovernorSnapshot,
          outcomeReview: liveOutcomeReview,
        });

        setLastConversationRecord(completion.conversationRecord);
        setShowConversationRecord(true);
      }
    } catch (error) {
      console.error(
        "[GEORGE][LIVE_COMPLETION][FAILED]",
        error,
      );
    }

    if (pendingLiveExitAction === "discard") {
      window.localStorage.removeItem("george_active_live_session_id");
      window.localStorage.removeItem("george_active_campaign_session_id");
    }

    setShowOutcomeExitReview(false);
    setPendingLiveExitAction(null);
    exitLiveMode();
  };

  const ACCESS_CODES: Record<string, "intelligent" | "brilliant"> = {
    ...Object.fromEntries(
      Array.from({ length: 100 }, (_, index) => [
        `INTEL-FOUNDER-${String(index + 1).padStart(3, "0")}`,
        "intelligent" as const,
      ]),
    ),
    "BRILLIANT-FOUNDERS": "brilliant",
  };

  const redeemAccessCode = () => {
    const normalized = accessCode.trim().toUpperCase();

    const runtimeOverlay = applyRuntimeOverlayFromCode(normalized);
    const tier = runtimeOverlay?.tier || ACCESS_CODES[normalized];

    if (!tier) {
      setAccessCodeError("Invalid access code.");
      return;
    }

    setCurrentTier(tier);

    if (typeof window !== "undefined") {
      localStorage.setItem("george_tier", tier);
    }

    setToastMessage(
      runtimeOverlay
        ? `${runtimeOverlay.overlay.title} loaded.`
        : `${tier === "brilliant" ? "Brilliant" : "Intelligent"} access loaded.`,
    );
    setShowToast(true);
    setAccessCode("");
    setAccessCodeError("");
    setShowAccessCodeEntry(false);
  };

  const LIVE_SEGUES = [
    {
      title: "LIVE listens with you.",
      body: "Use LIVE when the conversation is active. GEORGE helps with timing, pressure, escalation, hesitation, and next responses in real time.",
    },
    {
      title: "You do not need to explain everything first.",
      body: "LIVE is designed for movement. Interviews, negotiation, conflict, uncertainty, pressure, sales, and difficult conversations.",
    },
    {
      title: "GEORGE tracks the room.",
      body: "LIVE cues help you slow down, redirect, recover control, or sharpen the next sentence before momentum slips.",
    },
    {
      title: "LIVE changes runtime behavior.",
      body: "LIVE is optimized for timing and response delivery while conversations are actually happening.",
    },
  ];
  const [isSharingGeorgeLink, setIsSharingGeorgeLink] = useState(false);
  const [typedMessageIndex, setTypedMessageIndex] = useState<number | null>(
    null,
  );
  const [typedMessageContent, setTypedMessageContent] = useState("");

  const tierSuggestedLimit =
    currentTier === "brilliant" ? 5 : currentTier === "intelligent" ? 3 : 2;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (normalSessionBootedRef.current) return;

    const liveParam = new URLSearchParams(window.location.search).get("live");

    if (forceLive && liveParam !== "segue") {
      const cachedTier = window.localStorage.getItem("george_tier");
      const cachedLiveAccess =
        cachedTier === "intelligent" || cachedTier === "brilliant";
      const liveAccessKnown = hasLiveGeorgeAccess || cachedLiveAccess;

      const hasLocalLiveSetup =
        Boolean(window.localStorage.getItem("GEORGE_LIVE_SETUP")) ||
        Boolean(window.localStorage.getItem("george_live_setup_active"));

      if (liveAccessKnown === false && hasLocalLiveSetup === false) {
        normalSessionBootedRef.current = true;
        window.localStorage.removeItem("george_fresh_live_entry");
        window.localStorage.removeItem("george_start_new_live");
        window.localStorage.removeItem("GEORGE_LIVE_SETUP");
        window.localStorage.removeItem("GEORGE_LAST_LIVE_SETUP");
        window.localStorage.removeItem("george_live_setup_active");
        window.localStorage.removeItem("george_active_live_session_id");
        window.localStorage.removeItem("GEORGE_ACTIVE_LIVE_SESSION_ID");
        setActiveMode("normal");
        setLiveMode(false);
        router.replace("/george");
        return;
      }

      normalSessionBootedRef.current = true;

      if (typeof window !== "undefined") {
        const existingNormalMessages = messagesRef.current;

        if (
          Array.isArray(existingNormalMessages) &&
          existingNormalMessages.length > 0 &&
          hasMeaningfulUserMessage(existingNormalMessages)
        ) {
          window.sessionStorage.setItem(
            GEORGE_LAST_NORMAL_DRAFT,
            JSON.stringify({
              messages: existingNormalMessages,
              conversationMode,
              activePromptContext,
              currentTier,
              updatedAt: Date.now(),
            }),
          );
        }
      }

      setActiveMode("live");
      const activePreparation = loadPreparationSession();
      const parentSessionId = String(
        activePreparation?.relations.normalSessionId || "",
      ).trim();
      if (parentSessionId && activePreparation?.preparationSessionId) {
        updateSessionLinkage(parentSessionId, {
          preparationSessionId: activePreparation.preparationSessionId,
          surface: "live",
        });
      }
      setMessages([]);
      messagesRef.current = [];

      setLiveMode(true);
      setConversationMode("manual_live");
      setActivePromptContext("manual_live");

      const activeLiveSession = getActiveSessionForMode("live");

      // do not auto-restore LIVE session by default
      // user can resume later via sessions if needed

      const startNewLiveRequested =
        window.localStorage.getItem("george_start_new_live") === "1";
      if (startNewLiveRequested) {
        window.localStorage.removeItem("george_start_new_live");

        window.localStorage.removeItem("george_active_live_session_id");
        window.localStorage.removeItem("george_active_campaign_session_id");
        window.localStorage.removeItem("george_active_campaign");
        window.localStorage.removeItem("george_active_context");
        window.localStorage.removeItem("george_active_label");

        setActiveCampaignId(null);
        setMessages([]);
        messagesRef.current = [];
      }

      // LIVE auto-restore is disabled for now.
      // A new LIVE route must boot cleanly and must not reattach stale "hold/resume" room state.
      // Resume will return later only after it is scoped to verified LIVE sessions.
      const existingLive = null;

      const liveSetup: LivePrepSetup | null =
        consumePreparedLiveSetup() ||
        (() => {
          try {
            const raw = window.localStorage.getItem("george_live_setup_active");
            return raw ? (JSON.parse(raw) as LivePrepSetup) : null;
          } catch {
            return null;
          }
        })();

      markLiveRuntimeStarted();
      persistActiveLiveRuntimeSupport(liveSetup);

      if (liveSetup) {
        window.localStorage.setItem(
          "george_live_setup_active",
          JSON.stringify(liveSetup),
        );

        const contextSummary = [
          liveSetup.room ? `Room: ${liveSetup.room}` : null,
          liveSetup.objective ? `BRANESx: ${liveSetup.objective}` : null,
          liveSetup.cadence ? `Cadence: ${liveSetup.cadence}` : null,
          liveSetup.liveAssistMode ? `Mode: ${liveSetup.liveAssistMode}` : null,
        ]
          .filter(Boolean)
          .join(" · ");
      } else {
        window.localStorage.removeItem("george_live_setup_active");
      }

      const setupRoom = liveSetup?.room || "";

      if (setupRoom === "Debate") {
        setConversationMode("live_debate");
        setActivePromptContext("live_debate");
      }
      const liveRoom = String(liveSetup?.room || "").trim();
      const liveBRANESx = String(liveSetup?.objective || "").trim();
      const liveContext = String(
        (liveSetup as any)?.observedReality ||
          (liveSetup as any)?.knownContext ||
          "",
      ).trim();
      const liveChair = String((liveSetup as any)?.chair || "").trim();
      const liveExecutionScript = liveSetup?.customizedScript ?? null;

      if (liveExecutionScript) {
        console.info("[GEORGE][LIVE][CUSTOMIZED_SCRIPT_READY]", {
          scriptId: liveExecutionScript.id,
          scriptVersion: liveExecutionScript.version,
          formulaId: liveExecutionScript.formulaId,
          formulaVersion: liveExecutionScript.formulaVersion,
          lineCount: liveExecutionScript.lines.length,
          sessionOnly: true,
        });
      }

      const subscriberMetadata = getSubscriberSessionMetadata();
      if (subscriberMetadata) {
        liveSessionWriteReadyRef.current = true;
      }

      setLiveEntryBriefing(null);
      setShowLiveEntrySequence(false);

      const quickLiveRequested =
        window.localStorage.getItem("george_quick_live_entry") === "1";
      const quickLiveMessage =
        window.localStorage.getItem("george_quick_live_message") ||
        "I'll become sharper as the interaction unfolds.";

      if (quickLiveRequested) {
        window.localStorage.removeItem("george_quick_live_entry");
        window.localStorage.removeItem("george_quick_live_message");
        const quickLiveMessages = [
          { role: "assistant" as const, content: quickLiveMessage },
        ];
        setMessages(quickLiveMessages);
        messagesRef.current = quickLiveMessages;
      } else {
        setMessages([]);
        messagesRef.current = [];
      }

      setVoiceOn(true);
      setInteractionMode("speech");
      setShowEarbudOverlay(true);
      window.setTimeout(() => setShowEarbudOverlay(false), 5200);

      return;
    }

    if (liveMode || isManualLive) return;

    normalSessionBootedRef.current = true;

    // /george boots into normal GEORGE.
    // Browser reload means start clean.
    // Internal site navigation can restore last known workspace.
    setLiveEntryBriefing(null);
    setActiveMode("normal");

    const browserReload =
      typeof window !== "undefined" &&
      performance
        .getEntriesByType("navigation")
        .some(
          (entry) => (entry as PerformanceNavigationTiming).type === "reload",
        );

    const newBrowserInstance = ensureGeorgeBrowserInstanceScope();

    const freshNormalEntryRequested =
      consumeFreshNormalBrowserSessionRequest() || newBrowserInstance;

    const activeSession = freshNormalEntryRequested
      ? null
      : findGeorgeSessionToRestore({
          mode: "normal",
          subscriberEmail,
        });
    const storedPreparationSession = loadPreparationSession();

    if (activeSession?.id) {
      updateSessionLinkage(activeSession.id, {
        preparationSessionId:
          storedPreparationSession?.relations.normalSessionId ===
          activeSession.id
            ? storedPreparationSession.preparationSessionId
            : undefined,
        surface: "normal",
      });
    }

    setNormalPreparationSession(
      storedPreparationSession?.provenance.entrySource === "normal" &&
        activeSession?.id &&
        storedPreparationSession.relations.normalSessionId === activeSession.id
        ? storedPreparationSession
        : null,
    );

    const transientDraft = freshNormalEntryRequested
      ? { restored: false as const, messages: [] }
      : readGeorgeNormalDraft(GEORGE_LAST_NORMAL_DRAFT);

    if (transientDraft.restored) {
      const draftMessages = transientDraft.messages as Message[];

      skipNextTypewriterRef.current = true;
      restoredMessagesSignatureRef.current =
        getMessagesSignature(draftMessages);

      setMessages(draftMessages);
      messagesRef.current = draftMessages;

      if (transientDraft.conversationMode) {
        setConversationMode(
          transientDraft.conversationMode as typeof conversationMode,
        );
      }

      if (transientDraft.activePromptContext) {
        setActivePromptContext(transientDraft.activePromptContext);
      }

      normalSessionWriteReadyRef.current = true;
      return;
    }

    const sessionRestoreState = buildGeorgeSessionRestoreState(activeSession);

    if (sessionRestoreState.restored) {
      const restoredMessages = sessionRestoreState.messages as Message[];

      // Normal GEORGE restores the user's active workspace on refresh.
      // Sessions remain user-owned continuity, not assistant-first startup messages.
      skipNextTypewriterRef.current = true;
      restoredMessagesSignatureRef.current =
        getMessagesSignature(restoredMessages);

      setMessages(restoredMessages);
      messagesRef.current = restoredMessages;
      normalSessionWriteReadyRef.current = true;
      return;
    }

    bumpVisitCount();

    normalSessionWriteReadyRef.current = true;
    setMessages([]);
    messagesRef.current = [];
  }, [
    profileName,
    currentTier,
    liveMode,
    conversationMode,
    activePromptContext,
    forceLive,
  ]);

  useEffect(() => {
    // Session bootstrap is now handled by the normal session store effect above.
    // Keep this disabled so refresh does not overwrite restored conversations.
    return;
  }, [profileName, currentTier]);

  const georgeProfile = detectConversationProfile(input, interimTranscript);
  const liveRuntimeSupport = readActiveLiveRuntimeSupport();

  const liveGuidance = buildLiveGuidance({
    liveMode,
    currentTier,
    isListening,
    interimTranscript,
    input,
    profile: georgeProfile,
    userPosition: liveRuntimeSupport?.userPosition,
  });

  const outcomeGovernorSnapshot = useMemo(() => {
    if (!liveMode) return null;

    const knownContext =
      liveRuntimeSupport?.knownContext ||
      liveRuntimeSupport?.purview?.body ||
      "";

    const objectiveKnown = Boolean(
      input.trim() ||
      activeCampaign?.desiredOutcome ||
      activeCampaign?.currentGoal ||
      liveRuntimeSupport?.knownContext ||
      liveRuntimeSupport?.purview?.body ||
      liveRuntimeSupport?.purview?.line,
    );

    const knownContextAvailable = Boolean(
      knownContext || interimTranscript.trim() || stableLiveGuidance?.signal,
    );

    const desiredOutcome =
      activeCampaign?.desiredOutcome ||
      activeCampaign?.currentGoal ||
      liveRuntimeSupport?.purview?.line ||
      input.trim() ||
      "";

    const interpretation = buildGeorgeCoreInterpretation({
      transcript: interimTranscript.trim() || stableLiveGuidance?.signal || "",
      room: liveRuntimeSupport?.room || liveRuntimeSupport?.knownContext,
      desiredOutcome,
      knownContext,
      userPosition: liveRuntimeSupport?.userPosition,
      knownUserSpeaking: true,
    });

    return interpretation.outcomeGovernor;
  }, [
    liveMode,
    input,
    interimTranscript,
    activeCampaign?.desiredOutcome,
    activeCampaign?.currentGoal,
    liveRuntimeSupport?.knownContext,
    liveRuntimeSupport?.purview?.body,
    liveRuntimeSupport?.purview?.line,
    liveRuntimeSupport?.userPosition,
    stableLiveGuidance,
  ]);

  useEffect(() => {
    if (!liveMode || currentTier !== "brilliant" || !liveGuidance) {
      setStableLiveGuidance(null);
      return;
    }

    const adaptiveDelay =
      liveGuidance.signal === "PRESSURE DETECTED"
        ? 250
        : liveGuidance.signal === "FOCUS ON TERMS"
          ? 350
          : liveGuidance.signal === "STATE YOUR POSITION"
            ? 500
            : liveGuidance.signal === "CLARITY GAP"
              ? 650
              : liveGuidance.signal === "READ THE ROOM"
                ? 800
                : 700;

    const timer = window.setTimeout(() => {
      setStableLiveGuidance((prev) => {
        if (
          prev &&
          prev.signal === liveGuidance.signal &&
          prev.say === liveGuidance.say
        ) {
          return prev;
        }
        return liveGuidance;
      });
    }, adaptiveDelay);

    return () => window.clearTimeout(timer);
  }, [liveMode, currentTier, liveGuidance]);
  const [attemptStartTime, setAttemptStartTime] = useState<number | null>(null);
  const [showOutcomeBar, setShowOutcomeBar] = useState(false);
  const [lastOutcomeContext, setLastOutcomeContext] = useState<string | null>(
    null,
  );

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [showIdentityMenu, setShowIdentityMenu] = useState(false);

  const handleIdentitySignOut = () => {
    setShowIdentityMenu(false);
    setSubscriberEmail("");
    setCurrentTier("smart");
    clearCachedGeorgeSessionAuthority();
    window.localStorage.removeItem("george_founder_restore");
    window.localStorage.removeItem("george_founder_access");
    setToastMessage("Signed out.");
    setShowToast(true);
  };
  const [loginLinkSent, setLoginLinkSent] = useState(false);
  const [loginSending, setLoginSending] = useState(false);
  const [activeCheckout, setActiveCheckout] = useState<
    "intelligent" | "brilliant" | "brilliant_day" | null
  >(null);
  const redeemFounderCode = async () => {
    const code = window.prompt("Enter founder access code");

    if (!code) return;

    try {
      const response = await fetch("/api/founder-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          email: subscriberEmail.trim().toLowerCase() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        (data.tier !== "intelligent" && data.tier !== "brilliant")
      ) {
        setToastMessage(data.error || "Invalid founder code.");
        setShowToast(true);
        return;
      }

      setCurrentTier(data.tier);
      writeCachedGeorgeSessionAuthority({
        authenticated: true,
        email:
          subscriberEmail.trim().toLowerCase() ||
          `founder:${code.trim().toUpperCase()}`,
        tier: data.tier,
        liveAccess: true,
        source: "founder",
      });
      window.localStorage.setItem("george_founder_access", "server-verified");
      setToastMessage(
        `Founder ${data.tier === "brilliant" ? "Brilliant" : "Intelligent"} access activated.`,
      );

      if (
        window.localStorage.getItem("george_pending_live_after_access") === "1"
      ) {
        window.localStorage.removeItem("george_pending_live_after_access");
        window.localStorage.setItem("george_start_new_live", "1");
        window.setTimeout(() => {
          window.location.href = "/george/live-entry?source=founder";
        }, 250);
        return;
      }
      setShowToast(true);
      setShowUpgradeModal(false);
    } catch {
      setToastMessage("Founder code check failed.");
      setShowToast(true);
    }
  };

  const [upgradeCtaWord, setUpgradeCtaWord] = useState<
    "Intelligent" | "Brilliant"
  >("Intelligent");

  useEffect(() => {
    if (currentTier === "brilliant") return;

    setUpgradeCtaWord(currentTier === "smart" ? "Intelligent" : "Brilliant");

    const timer = window.setInterval(() => {
      setUpgradeCtaWord((word) =>
        word === "Intelligent" ? "Brilliant" : "Intelligent",
      );
    }, 2600);

    return () => window.clearInterval(timer);
  }, [currentTier]);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [draftProfileName, setDraftProfileName] = useState("");

  // FULL GEORGE WINDOW SYSTEM
  const [isFullMode, setIsFullMode] = useState(false);
  const [windowEndsAt, setWindowEndsAt] = useState<number | null>(null);

  // Dynamic greeting
  const [greeting, setGreeting] = useState(
    "Welcome back. Pick up where we left off.",
  );
  const accentSymbol = useMemo(() => {
    const accents = ["♥", "🍒", "🍎", "🍇"];
    return accents[new Date().getDate() % accents.length];
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const continuityToken = params.get("continuity");
    const tierParam = params.get("tier");
    const subStatus = params.get("subscription");
    const cachedAuthority = readCachedGeorgeSessionAuthority();

    setSubscriberEmail(cachedAuthority.email);
    setCurrentTier(cachedAuthority.tier);

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        setSubscriberEmail(authority.email);
        setCurrentTier(authority.tier);
      })
      .catch(() => {});

    if (continuityToken) {
      void fetch("/api/continuity/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: continuityToken }),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            setToastMessage(data?.error || "Login link could not be verified.");
            setShowToast(true);
            window.history.replaceState({}, "", window.location.pathname);
            return;
          }

          const verifiedEmail = String(data?.email || "")
            .trim()
            .toLowerCase();
          const verifiedTier = data?.currentTier;

          const normalizedTier =
            verifiedTier === "intelligent" || verifiedTier === "brilliant"
              ? verifiedTier
              : "smart";

          setSubscriberEmail(verifiedEmail);
          setCurrentTier(normalizedTier);

          writeCachedGeorgeSessionAuthority({
            authenticated: Boolean(verifiedEmail),
            email: verifiedEmail,
            tier: normalizedTier,
            liveAccess:
              normalizedTier === "intelligent" ||
              normalizedTier === "brilliant",
            source: "continuity",
          });

          setToastMessage("Login verified.");
          setShowToast(true);
          window.history.replaceState({}, "", window.location.pathname);
        })
        .catch(() => {
          setToastMessage("Login link could not be verified.");
          setShowToast(true);
          window.history.replaceState({}, "", window.location.pathname);
        });

      return;
    }
    const cleanSavedEmail = cachedAuthority.email;
    if (cleanSavedEmail) setSubscriberEmail(cleanSavedEmail);

    const validTier =
      tierParam === "smart" ||
      tierParam === "intelligent" ||
      tierParam === "brilliant";

    if (validTier && subStatus === "success") {
      setToastMessage(
        `${tierParam.charAt(0).toUpperCase() + tierParam.slice(1)} is being verified.`,
      );
      setShowToast(true);
    }

    if (!cleanSavedEmail) {
      setCurrentTier("smart");
      return;
    }

    void fetch(
      `/api/subscription-state?email=${encodeURIComponent(cleanSavedEmail)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const serverTier = data?.currentTier;
        const restoredEmail = String(data?.email || cleanSavedEmail || "")
          .trim()
          .toLowerCase();
        const normalizedTier =
          serverTier === "intelligent" || serverTier === "brilliant"
            ? serverTier
            : "smart";

        setSubscriberEmail(restoredEmail);
        setCurrentTier(normalizedTier);

        writeCachedGeorgeSessionAuthority({
          authenticated: Boolean(restoredEmail),
          email: restoredEmail,
          tier: normalizedTier,
          liveAccess:
            normalizedTier === "intelligent" || normalizedTier === "brilliant",
          source: "subscription-state",
        });

        if (subStatus === "success") {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
          setToastMessage(
            serverTier === "intelligent" || serverTier === "brilliant"
              ? `${serverTier.charAt(0).toUpperCase() + serverTier.slice(1)} verified.`
              : "Access will restore after payment confirmation.",
          );
          setShowToast(true);
        }
      })
      .catch(() => {
        setCurrentTier("smart");
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedContext = window.localStorage.getItem("george_active_context");
    const savedLabel = window.localStorage.getItem("george_active_label");
    const savedVoice = window.localStorage.getItem("george_voice");

    // Disabled auto LIVE restore — GEORGE must start in normal mode

    if (savedLabel) {
      setActivePromptLabel(savedLabel);
    }

    if (savedVoice === "on") {
      setVoiceOn(true);
      setInteractionMode("speech");
      setTimeout(() => startListening(), 900);
    }
  }, []);

  const assistantRevealedRef = useRef(false);
  const skipNextTypewriterRef = useRef(false);
  const restoredMessagesSignatureRef = useRef<string | null>(null);

  function getMessagesSignature(items: Message[]) {
    return items.map((item) => `${item.role}:${item.content}`).join("|");
  }

  // CHATGPT-STYLE TYPING ENGINE
  useEffect(() => {
    if (skipNextTypewriterRef.current) {
      skipNextTypewriterRef.current = false;
      setTypedMessageIndex(null);
      setTypedMessageContent("");
      return;
    }

    if (!messages.length) return;

    const signature = getMessagesSignature(messages);
    if (restoredMessagesSignatureRef.current === signature) {
      setTypedMessageIndex(null);
      setTypedMessageContent("");
      return;
    }

    const lastIndex = messages.length - 1;
    const lastMessage = messages[lastIndex];

    if (lastMessage.role !== "assistant") {
      restoredMessagesSignatureRef.current = null;
      return;
    }

    let i = 0;
    const fullText = lastMessage.content || "";

    setTypedMessageIndex(lastIndex);
    setTypedMessageContent("");

    const interval = setInterval(() => {
      i++;

      setTypedMessageContent((prev) => fullText.slice(0, i));

      if (i >= fullText.length) {
        clearInterval(interval);
        setTypedMessageIndex(null);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [messages]);

  const lastSpeechTsRef = useRef<number>(0);
  const responseTimerRef = useRef<any>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speakingRef = useRef(false);
  const audioRef = useRef<ReturnType<typeof createAudioPlayback> | null>(null);
  const liveTranscriptSubmitRef = useRef<(text: string) => void>(() => {});
  const lastLiveFinalTranscriptRef = useRef<LastLiveFinalTranscript>(null);
  const liveBuyTimeUntilRef = useRef<number>(0);
  const liveLastSpokenUtteranceRef = useRef<string>("");
  const liveRecentSpokenUtterancesRef = useRef<string[]>([]);
  const liveAwarenessBufferRef = useRef<LiveAwarenessFragment[]>([]);

  const processLivePartialTranscript = useCallback((text: string) => {
    setVoiceError("");
    setInterimTranscript(text);
    liveLastSignalRef.current = Date.now();
    lastSpeechTsRef.current = Date.now();
  }, []);

  const resolveLiveFinalTranscriptExecution = useCallback(
    (clean: string) => {
      const execution = resolveLiveFinalTranscriptAction({
        transcript: clean,
        lastFinalTranscript: lastLiveFinalTranscriptRef.current,
        isThinking,
        isSpeaking: isSpeakingRef.current,
        liveMode,
        buyTimeUntil: liveBuyTimeUntilRef.current,
        lastSpokenLine: liveLastSpokenUtteranceRef.current,
        overlapDetected: liveAwarenessBufferRef.current.some(
          (fragment) => fragment.overlapLikely,
        ),
        desiredOutcome:
          liveRuntimeSupport?.objective ||
          activeCampaign?.desiredOutcome ||
          activeCampaign?.currentGoal ||
          "",
        persistentSignals: liveAwarenessBufferRef.current
          ? processLiveAwarenessSignal({
              buffer: liveAwarenessBufferRef.current,
              kind: "final",
              text: clean,
              whileGeorgeSpeaking: isSpeakingRef.current,
            }).awarenessState.persistentSignals
          : [],
        deliveryStyle: liveDeliveryStyle,
      });

      if (execution) {
        lastLiveFinalTranscriptRef.current = execution.nextFinalTranscript;
      }

      return execution;
    },
    [
      isThinking,
      liveMode,
      liveDeliveryStyle,
      liveRuntimeSupport?.objective,
      activeCampaign?.desiredOutcome,
      activeCampaign?.currentGoal,
    ],
  );

  const processLiveFinalTranscript = useCallback(
    (text: string) => {
      const clean = String(text || "").trim();
      if (!clean) return;

      if (liveBuyTimeUntilRef.current > Date.now()) {
        liveBuyTimeUntilRef.current = 0;
        console.info("[GEORGE LIVE LOCAL]", "buy_time_cancelled");
      }

      setInterimTranscript("");
      liveLastSignalRef.current = Date.now();
      lastSpeechTsRef.current = Date.now();
      const awareness = processLiveAwarenessSignal({
        buffer: liveAwarenessBufferRef.current,
        kind: "final",
        text: clean,
        whileGeorgeSpeaking: isSpeakingRef.current,
      });
      liveAwarenessBufferRef.current = awareness.buffer;

      const awarenessState = awareness.awarenessState;
      const overlapRecovery = awareness.overlapRecovery;
      if (awarenessState.overlapDetected || overlapRecovery.requiresAttention) {
        console.info("[GEORGE LIVE AWARENESS]", {
          awarenessState,
          overlapRecovery,
        });
      }

      setInput("");

      const execution = resolveLiveFinalTranscriptExecution(clean);

      if (execution?.routing?.shouldForwardToHub) {
        setLiveHubShadowTranscript(execution.routing.hubTranscript);
      } else {
        console.info("[GEORGE LIVE HUB ROUTE]", {
          route: "held_before_hub",
          transcript: clean,
          authority: execution?.authority || null,
          routing: execution?.routing || null,
        });
      }

      const storedGeorgeName =
        typeof window !== "undefined"
          ? window.localStorage.getItem("george_name") || ""
          : "";
      if (
        isLiveSteeringPhrase(clean) ||
        isDirectGeorgeAddress(clean, storedGeorgeName)
      ) {
        liveTranscriptSubmitRef.current(clean);
      }
    },
    [resolveLiveFinalTranscriptExecution],
  );

  const processLiveAudioError = useCallback((error: unknown) => {
    console.warn("[GEORGE LIVE AUDIO]", error);
    setVoiceError("LIVE speech connection failed.");
    setIsListening(false);
  }, []);

  const liveAudioRuntime = useLiveAudioRuntime({
    enabled: Boolean(forceLive || liveMode),
    onPartialTranscript: processLivePartialTranscript,
    onFinalTranscript: processLiveFinalTranscript,
    onError: processLiveAudioError,
  });

  const liveDeliveryStyleHydratedRef = useRef(false);

  useEffect(() => {
    const rawStored =
      window.localStorage.getItem("GEORGE_LIVE_SUPPORT_STYLE") ||
      window.localStorage.getItem("GEORGE_LIVE_DELIVERY_STYLE");
    const stored =
      rawStored === "completion"
        ? "continue"
        : rawStored === "presentation"
          ? "expandedLine"
          : rawStored;

    if (
      stored === "cue" ||
      stored === "advice" ||
      stored === "line" ||
      stored === "response" ||
      stored === "expandedLine" ||
      stored === "continue"
    ) {
      setLiveDeliveryStyle(stored);
    }

    liveDeliveryStyleHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!liveDeliveryStyleHydratedRef.current) return;

    window.localStorage.setItem(
      "GEORGE_LIVE_DELIVERY_STYLE",
      liveDeliveryStyle,
    );
  }, [liveDeliveryStyle]);

  const startLiveAudioRuntime = liveAudioRuntime.start;
  const stopLiveAudioRuntimeDirect = liveAudioRuntime.stop;
  const emergencyStopLiveAudioRuntime = liveAudioRuntime.emergencyStop;
  const liveAudioDesiredActiveRef = useRef(false);
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const stopSpeechRef = useRef(false);
  const speechPlaybackGenerationRef = useRef(0);
  const suppressLegacyLiveVoiceUntilRef = useRef(0);
  const savePickerRef = useRef<HTMLDivElement | null>(null);
  const folderBrowserRef = useRef<HTMLDivElement | null>(null);
  const bridgeSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopLiveAudioRuntime = useCallback(() => {
    stopLiveAudioRuntimeDirect();
    setIsListening(false);
  }, [stopLiveAudioRuntimeDirect]);

  useLiveReflexListener({
    enabled: Boolean(forceLive || liveMode),
    active: Boolean(isSpeaking),
    onReflex: (event) => {
      console.info("[GEORGE LIVE REFLEX]", event);

      if (event.intent === "pause") {
        stopSpeechRef.current = true;
        void stopSpeech();
        return;
      }

      if (event.intent === "repeat_last_line") {
        const approvedDelivery = replayLastGeorgeApprovedLiveDelivery("repeat");
        const lastLine =
          approvedDelivery?.text || liveLastSpokenUtteranceRef.current.trim();

        if (lastLine && (voiceOn || liveReceiverProfile === "audio_only")) {
          void speakText(lastLine);
        }
        return;
      }

      if (event.intent === "compress_last_line") {
        const action = resolveLiveTranscriptDecision({
          decision: { type: "local", content: "compress_last_line" },
          transcript: event.transcript,
          lastSpokenLine: liveLastSpokenUtteranceRef.current,
        });

        if (action.type === "speak") {
          void speakText(action.text);
        }
        return;
      }

      if (event.intent === "buy_time") {
        liveBuyTimeUntilRef.current = Date.now() + 3500;
      }
    },
  });

  useEffect(() => {
    const liveEnabled = Boolean(forceLive || liveMode);
    const desiredActive = Boolean(liveEnabled && liveRoomActive);

    if (!liveEnabled) {
      if (liveAudioDesiredActiveRef.current) {
        stopLiveAudioRuntimeDirect();
        setIsListening(false);
      }
      liveAudioDesiredActiveRef.current = false;
      return;
    }

    (window as any).__GEORGE_STOP_LIVE_MIC__ = () => {
      emergencyStopLiveAudioRuntime();
      liveAudioDesiredActiveRef.current = false;
      setIsListening(false);
    };

    if (desiredActive === liveAudioDesiredActiveRef.current) return;

    liveAudioDesiredActiveRef.current = desiredActive;

    if (desiredActive) {
      startLiveAudioRuntime();
      setIsListening(true);
    } else {
      stopLiveAudioRuntimeDirect();
      setIsListening(false);
    }
  }, [
    forceLive,
    liveMode,
    liveRoomActive,
    emergencyStopLiveAudioRuntime,
    startLiveAudioRuntime,
    stopLiveAudioRuntimeDirect,
  ]);

  const interruptAndListen = () => {
    try {
      stopSpeechRef.current = true;
      window.speechSynthesis.cancel();
    } catch {}

    setVoiceOn(true);
    setInteractionMode("speech");
    setTimeout(() => startListening(), 80);
  };

  const messagesRef = useRef<Message[]>([
    { role: "assistant", content: "GEORGE" },
  ]);
  const normalOperationalJudgmentRequestRef = useRef<
    ((
      session: PreparationSessionV1,
      options?: NormalOperationalJudgmentRequestOptions,
    ) => Promise<NormalPreparationJudgmentResult | null>) | null
  >(null);

  const preserveNormalDraft = () => {
    if (typeof window === "undefined") return;

    const normalMessages = [...messagesRef.current];

    const hasUserMessage = normalMessages.some(
      (message) =>
        message.role === "user" &&
        String(message.content || "").trim().length > 0,
    );

    if (normalMessages.length > 0 && hasUserMessage) {
      window.sessionStorage.setItem(
        GEORGE_LAST_NORMAL_DRAFT,
        JSON.stringify({
          messages: normalMessages,
          conversationMode,
          activePromptContext,
          currentTier,
          updatedAt: Date.now(),
        }),
      );
    }
  };

  const loadValidatedNormalPreparationSession = () => {
    if (typeof window === "undefined") return null;

    const preparationSession = loadPreparationSession();
    const activeNormalSession = getActiveSessionForMode("normal");

    if (
      preparationSession?.provenance.entrySource !== "normal" ||
      !activeNormalSession?.id ||
      preparationSession.relations.normalSessionId !== activeNormalSession.id
    ) {
      return null;
    }

    return preparationSession;
  };

  const beginNormalLivePreparation = ({
    signals = {},
    explicitObjective = "",
    sourceContext = "",
    briefing,
    checkpoint,
  }: {
    signals?: Record<string, string>;
    explicitObjective?: string;
    sourceContext?: string;
    briefing?: PreparationSessionV1["briefing"];
    checkpoint: PreparationCheckpoint;
  }): PreparationSessionV1 | null => {
    if (typeof window === "undefined") return null;

    const subscriberMetadata = getSubscriberSessionMetadata() || {};
    const activeNormalSession =
      getActiveSessionForMode("normal") ||
      createSession(
        "normal",
        messagesRef.current,
        deriveNormalSessionTitleFromMessages(
          messagesRef.current,
          "GEORGE Session",
        ),
        subscriberMetadata,
      );
    const normalSessionId = String(activeNormalSession.id || "").trim();
    if (!normalSessionId) return null;

    const session = reconcileNormalPreparationSession({
      existingSession: loadPreparationSession(),
      normalSessionId,
      activeSessionMetadata: activeNormalSession.metadata || {},
      signals,
      acceptedObjective: explicitObjective,
      currentConversation: messagesRef.current,
      briefing,
      checkpoint,
      updatedAt: Date.now(),
    });
    if (!session) return null;

    savePreparationSession(session);
    updateSessionLinkage(normalSessionId, {
      preparationSessionId: session.preparationSessionId,
      surface: "preparation",
    });
    setNormalPreparationSession(session);
    return session;
  };

  const buildNormalLiveEntryUrl = (
    session: PreparationSessionV1,
    source?: "signal" | "message",
  ) => {
    const params = new URLSearchParams();
    if (source) params.set("source", source);
    params.set("preparationSessionId", session.preparationSessionId);
    params.set(
      "normalSessionId",
      String(session.relations.normalSessionId || ""),
    );
    return `/george/live-entry?${params.toString()}`;
  };

  const openLiveEntry = () => {
    if (typeof window === "undefined") return;

    preserveNormalDraft();

    if (currentTier === "smart") {
      setShowUpgradeModal(true);
      return;
    }

    const fromPreparedMessage =
      window.localStorage.getItem("GEORGE_PRE_LIVE_FROM_MESSAGE") === "1";
    const validatedPreparationSession =
      loadValidatedNormalPreparationSession();
    const objective = normalizeExplicitNormalPreparationObjective(
      validatedPreparationSession?.knowledge.objective,
    );

    if (validatedPreparationSession && objective) {
      const preparationSession = beginNormalLivePreparation({
        signals: validatedPreparationSession.knowledge.additionalSignals,
        explicitObjective: objective,
        briefing: validatedPreparationSession.briefing,
        checkpoint: { surface: "ready_room", phase: "mechanics" },
      });
      if (!preparationSession) return;

      window.location.href = buildNormalLiveEntryUrl(
        preparationSession,
        fromPreparedMessage ? "message" : "signal",
      );
      return;
    }

    const preparationSession = beginNormalLivePreparation({
      checkpoint: { surface: "briefing", phase: "questions" },
    });
    if (!preparationSession) return;

    window.location.href = buildNormalLiveEntryUrl(preparationSession);
  };

  const openLiveEntryFromMessage = (message: Message) => {
    if (typeof window === "undefined") return;

    const content = String(message?.content || "").trim();

    preserveNormalDraft();

    if (currentTier === "smart") {
      setShowUpgradeModal(true);
      return;
    }

    normalLiveExplicitObjectiveRef.current = "";
    beginNormalLivePreparation({
      sourceContext: content,
      checkpoint: { surface: "briefing", phase: "questions" },
    });

    try {
      window.localStorage.setItem(
        "GEORGE_LIVE_INTENT_STAGE",
        "choose_briefing_depth",
      );
      window.localStorage.setItem("GEORGE_PRE_LIVE_FROM_MESSAGE", "1");
      window.localStorage.setItem(
        "GEORGE_PRE_LIVE_SOURCE_CONTEXT",
        JSON.stringify({
          source: "message_action",
          title: content.slice(0, 72) || "GEORGE context",
          summary: content.slice(0, 900),
          selectedAt: Date.now(),
        }),
      );
    } catch {}

    setShowSidebar(false);
    setShowConversationMenu(false);
    setShowNormalUtilityMenu(null);
    setShowPromptMenu(false);
    setActivePromptLabel("LIVE");
    setActivePromptContext("live_message_bar_setup");
    setContextTurnCount(0);

    const setupMessage: Message = {
      role: "assistant",
      content:
        "I can prepare you for this conversation.\n\nQuick LIVE: Begin with what I already know. I’ll ask only for what is still missing.\n\nFull Brief: Keep preparing with me before we enter LIVE.",
      source: "system_override",
      presentationMode: "live_preparation",
    };

    setMessages((prev) => {
      const next = [...prev, setupMessage];
      messagesRef.current = next;
      return next;
    });

    setInput("");
    setInterimTranscript("");
    setSuggestedSignal(Date.now());
  };

  const presentNormalAdaptiveQuestion = (question: PreparationQuestion) => {
    setNormalOperationalDisposition("unresolved");
    setCurrentPreLiveQuestion(question);
    setPreLiveSignalComplete(false);
    setShowPreLiveSignalSurface(true);
    setActivePromptContext("pre_live_signal_acquisition");
    setActivePromptLabel(question.label || "LIVE");

    const questionContent = buildNormalPreparationQuestionContent(question);
    const latestMessage = messagesRef.current[messagesRef.current.length - 1];

    if (
      latestMessage?.role !== "assistant" ||
      String(latestMessage.content || "").trim() !== questionContent
    ) {
      const questionMessage: Message = {
        role: "assistant",
        content: questionContent,
        source: "system_override",
        presentationMode: "live_preparation",
      };

      setMessages((prev) => {
        const visible = prev.filter(
          (message) => String(message.content || "").trim() !== "GEORGE",
        );
        const next = [...visible, questionMessage];
        messagesRef.current = next;
        return next;
      });
    }

    setInput("");
    setInterimTranscript("");
    setVoiceError("");
    setSuggestedPrompts([]);
    setSuggestedSignal(Date.now());
    setRerouteSignal(0);
  };

  const presentNormalOperationalJudgmentResponse = (content: string) => {
    const normalizedContent = String(content || "").trim();
    if (!normalizedContent) return;

    const latestMessage = messagesRef.current[messagesRef.current.length - 1];
    if (
      latestMessage?.role === "assistant" &&
      String(latestMessage.content || "").trim() === normalizedContent
    ) {
      return;
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: normalizedContent,
    };

    setMessages((previous) => {
      const next = [...previous, assistantMessage];
      messagesRef.current = next;
      return next;
    });
  };

  const consumeNormalOperationalJudgment = (
    judgmentResult: NormalPreparationJudgmentResult,
    preparationSession: PreparationSessionV1,
  ) => {
    const operationalJudgment =
      judgmentResult.operationalJudgmentResult.operationalJudgment;
    const disposition =
      operationalJudgment.operationalDisposition.disposition;
    const canonicalObjective = normalizeExplicitNormalPreparationObjective(
      operationalJudgment.operationalDisposition.operationalObjective ||
        preparationSession.knowledge.objective,
    );
    const executionDisposition =
      disposition === "execution_ready" ||
      disposition === "execution_opportunity";
    const decisionSession = beginNormalLivePreparation({
      signals: preparationSession.knowledge.additionalSignals,
      explicitObjective: canonicalObjective,
      briefing: {
        priorInteractions: preparationSession.briefing.priorInteractions,
        currentQuestion: undefined,
      },
      checkpoint: { surface: "briefing", phase: "decision" },
    });

    setNormalOperationalDisposition(disposition);
    setCurrentPreLiveQuestion(null);
    setShowPreLiveSignalSurface(true);
    setPreLiveSignalComplete(
      Boolean(executionDisposition && canonicalObjective),
    );
    setActivePromptContext(
      executionDisposition && canonicalObjective
        ? "pre_live_signal_ready"
        : null,
    );
    setActivePromptLabel(
      executionDisposition && canonicalObjective ? "LIVE Ready" : "LIVE",
    );
    presentNormalOperationalJudgmentResponse(
      judgmentResult.operationalJudgmentResult.message || "",
    );

    return decisionSession || preparationSession;
  };

  const requestNormalAdaptiveQuestion = async (
    preparationSession: PreparationSessionV1,
  ) => {
    if (normalAdaptiveQuestionRequestRef.current) return;

    normalAdaptiveQuestionRequestRef.current = true;

    try {
      const priorInteractions =
        preparationSession.briefing.priorInteractions;
      const judgmentResult =
        await normalOperationalJudgmentRequestRef.current?.(
          preparationSession,
        );

      if (!judgmentResult) {
        throw new Error("Operational Judgment request failed.");
      }

      const operationalJudgment =
        judgmentResult.operationalJudgmentResult.operationalJudgment;
      const canonicalObjective = normalizeExplicitNormalPreparationObjective(
        operationalJudgment.operationalDisposition.operationalObjective ||
          preparationSession.knowledge.objective,
      );
      const canonicalPreparationSession =
        beginNormalLivePreparation({
          signals: preparationSession.knowledge.additionalSignals,
          explicitObjective: canonicalObjective,
          briefing: preparationSession.briefing,
          checkpoint: preparationSession.workflow.current,
        }) || preparationSession;
      const authorizedEvidenceNeed = String(
        operationalJudgment.signalAcquisition.requestedSignal || "",
      ).trim();
      const signalAcquisitionAuthorized = Boolean(
        operationalJudgment.signalAcquisition.shouldAcquire &&
          authorizedEvidenceNeed,
      );

      if (!signalAcquisitionAuthorized) {
        consumeNormalOperationalJudgment(
          judgmentResult,
          canonicalPreparationSession,
        );
        return;
      }

      setNormalOperationalDisposition("unresolved");

      const activeNormalSession = getActiveSessionForMode("normal");

      const normalAdaptivePayload = {
        normalPreparationContext: {
          session: canonicalPreparationSession,
          activeNormalSessionId: activeNormalSession?.id || null,
          linkedPreparationSessionId:
            activeNormalSession?.metadata?.preparationSessionId || null,
          currentConversation: messagesRef.current,
          evidenceSufficiency: "unresolved" as const,
          signalAcquisitionAllowed: true,
        },
        authorizedEvidenceNeed,
        authorizationReason:
          operationalJudgment.signalAcquisition.reason,
      };

      console.log("[GEORGE][NORMAL_LIVE][ADAPTIVE_REQUEST]", {
        normalSessionId:
          canonicalPreparationSession.relations.normalSessionId || null,
        preparationSessionId:
          canonicalPreparationSession.preparationSessionId,
        payload: normalAdaptivePayload,
      });

      const returnToCanonicalJudgment = async () => {
        const reassessedJudgment =
          await normalOperationalJudgmentRequestRef.current?.(
            canonicalPreparationSession,
            { signalAcquisitionAllowed: false },
          );

        if (!reassessedJudgment) {
          throw new Error("Operational Judgment reassessment failed.");
        }

        consumeNormalOperationalJudgment(
          reassessedJudgment,
          canonicalPreparationSession,
        );
      };

      let response: Response;
      let payload: any;

      try {
        response = await fetch("/api/george/live/signal-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalAdaptivePayload),
        });
        payload = await response.json().catch(() => ({}));
      } catch {
        await returnToCanonicalJudgment();
        return;
      }

      console.log("[GEORGE][NORMAL_LIVE][ADAPTIVE_RESPONSE]", {
        status: payload?.status || null,
        nextAction: payload?.nextAction || null,
        transitionReason: payload?.transitionReason || null,
        question: payload?.question || null,
        key: payload?.key || null,
        understanding: payload?.understanding || null,
        directions: payload?.directions || [],
      });

      if (!response.ok) {
        await returnToCanonicalJudgment();
        return;
      }

      if (payload?.nextAction !== "ask_question") {
        await returnToCanonicalJudgment();
        return;
      }

      const nextQuestion: PreparationQuestion = {
        key: String(payload.key || `signal_${Date.now()}`),
        label: String(payload.label || "Additional signal"),
        question: String(payload.question || ""),
        why: String(
          payload.why ||
            payload.helper ||
            "This answer may materially improve GEORGE's preparation.",
        ),
        example: String(payload.example || ""),
        evidenceNeed: String(
          payload.evidenceNeed || payload.key || "",
        ).trim(),
        clarificationRequired:
          payload.clarificationRequired === true,
      };
      const questionSession = beginNormalLivePreparation({
        signals: canonicalPreparationSession.knowledge.additionalSignals,
        explicitObjective: canonicalObjective,
        briefing: {
          priorInteractions,
          currentQuestion: nextQuestion,
        },
        checkpoint: { surface: "briefing", phase: "questions" },
      });

      presentNormalAdaptiveQuestion(
        questionSession?.briefing.currentQuestion || nextQuestion,
      );
    } catch {
      const objective = normalizeExplicitNormalPreparationObjective(
        preparationSession.knowledge.objective,
      );

      beginNormalLivePreparation({
        signals: preparationSession.knowledge.additionalSignals,
        explicitObjective: objective,
        briefing: preparationSession.briefing,
        checkpoint: objective
          ? { surface: "briefing", phase: "decision" }
          : { surface: "briefing", phase: "questions" },
      });
      setCurrentPreLiveQuestion(null);
      setShowPreLiveSignalSurface(true);
      setPreLiveSignalComplete(Boolean(objective));
      setActivePromptContext(
        objective ? "pre_live_signal_ready" : "pre_live_signal_acquisition",
      );
      setActivePromptLabel(objective ? "LIVE Ready" : "LIVE");
    } finally {
      normalAdaptiveQuestionRequestRef.current = false;
    }
  };

  const startLiveSignalAcquisition = () => {
    if (typeof window === "undefined") return;

    setShowSidebar(false);
    setShowLiveChooser(false);
    setShowConversationMenu(false);
    setShowNormalUtilityMenu(null);
    setActivePromptLabel("LIVE");
    setNormalOperationalDisposition(null);
    setContextTurnCount(0);

    const preparationSession = beginNormalLivePreparation({
      checkpoint: { surface: "briefing", phase: "questions" },
    });
    if (!preparationSession) return;

    setPreLiveSignals({
      ...preparationSession.knowledge.additionalSignals,
      ...(preparationSession.knowledge.objective
        ? { desiredOutcome: preparationSession.knowledge.objective }
        : {}),
    });
    setShowPreLiveSignalSurface(true);
    setPreLiveSignalComplete(false);
    setCurrentPreLiveQuestion(null);
    setActivePromptContext("pre_live_signal_acquisition");

    void requestNormalAdaptiveQuestion(preparationSession);
  };

  const continueNormalAdaptiveBriefing = () => {
    const preparationSession = loadValidatedNormalPreparationSession();
    const objective = normalizeExplicitNormalPreparationObjective(
      preparationSession?.knowledge.objective,
    );

    if (
      !preparationSession ||
      preparationSession.workflow.current.surface !== "briefing" ||
      preparationSession.workflow.current.phase !== "decision" ||
      !objective
    ) {
      return;
    }

    const questionSession = beginNormalLivePreparation({
      signals: preparationSession.knowledge.additionalSignals,
      explicitObjective: objective,
      briefing: preparationSession.briefing,
      checkpoint: { surface: "briefing", phase: "questions" },
    });
    if (!questionSession) return;

    setShowPreLiveSignalSurface(true);
    setNormalOperationalDisposition(null);
    setCurrentPreLiveQuestion(null);
    setPreLiveSignalComplete(false);
    setActivePromptContext("pre_live_signal_acquisition");
    setActivePromptLabel("LIVE");
    void requestNormalAdaptiveQuestion(questionSession);
  };

  const closeNormalPreparationBriefing = () => {
    const preparationSession = loadValidatedNormalPreparationSession();
    if (!preparationSession) return;

    setNormalPreparationSession(preparationSession);
    setShowPreLiveSignalSurface(false);
    setCurrentPreLiveQuestion(null);
    setPreLiveSignalComplete(false);
    setActivePromptContext(null);
    setActivePromptLabel(null);
  };

  const resumeNormalPreparationBriefing = () => {
    const preparationSession = loadValidatedNormalPreparationSession();

    if (
      !preparationSession ||
      preparationSession.workflow.current.surface !== "briefing"
    ) {
      startLiveSignalAcquisition();
      return;
    }

    const objective = normalizeExplicitNormalPreparationObjective(
      preparationSession.knowledge.objective,
    );

    setNormalPreparationSession(preparationSession);
    setPreLiveSignals({
      ...preparationSession.knowledge.additionalSignals,
      ...(objective ? { desiredOutcome: objective } : {}),
    });
    setShowPreLiveSignalSurface(true);
    setNormalOperationalDisposition(null);

    setCurrentPreLiveQuestion(null);
    setPreLiveSignalComplete(false);
    setActivePromptContext("pre_live_signal_acquisition");
    setActivePromptLabel("LIVE");
    void requestNormalAdaptiveQuestion(preparationSession);
  };

  const handleNormalLiveControl = () => {
    startLiveSignalAcquisition();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (liveEntryBootedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const pendingLiveSignal =
      window.localStorage.getItem("GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION") ===
      "start";
    const shouldStartNewLive =
      pendingLiveSignal ||
      params.get("start") === "1" ||
      (params.get("live") === "1" && params.get("start") === "1");

    if (!shouldStartNewLive) return;

    liveEntryBootedRef.current = true;
    setLiveMode(false);
    setConversationMode(null);
    setPreLiveSignals({});
    setPreLiveSignalComplete(false);
    setCurrentPreLiveQuestion(null);
    setInput("");
    setInterimTranscript("");
    setActiveMode("normal");
    window.localStorage.removeItem("GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION");

    const timer = window.setTimeout(startLiveSignalAcquisition, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("start") === "1") {
      window.location.href = "/george/live-entry?source=start";
      return;
    }

    if (params.get("live") !== "1") return;

    const shouldResume = params.get("resume") === "1";

    window.history.replaceState({}, "", "/george");

    if (shouldResume) {
      window.setTimeout(() => {
        setToastMessage("Open the sidebar to resume LIVE conversations.");
        setShowToast(true);
        setShowSidebar(true);
      }, 80);
      return;
    }

    window.setTimeout(() => startLiveSignalAcquisition(), 80);
  }, []);

  const restoreNormalDraft = () => {
    if (typeof window === "undefined") return false;

    try {
      const rawDraft = window.sessionStorage.getItem(GEORGE_LAST_NORMAL_DRAFT);
      const draft = rawDraft ? JSON.parse(rawDraft) : null;
      const draftMessages = Array.isArray(draft?.messages)
        ? draft.messages
        : [];

      if (!draftMessages.length) return false;

      skipNextTypewriterRef.current = true;
      restoredMessagesSignatureRef.current =
        getMessagesSignature(draftMessages);

      setMessages(draftMessages);
      messagesRef.current = draftMessages;

      if (typeof draft?.conversationMode === "string") {
        setConversationMode(draft.conversationMode as typeof conversationMode);
      } else {
        setConversationMode(null);
      }

      if (typeof draft?.activePromptContext === "string") {
        setActivePromptContext(draft.activePromptContext);
      } else {
        setActivePromptContext(null);
      }

      normalSessionWriteReadyRef.current = true;
      liveSessionWriteReadyRef.current = false;
      setActiveMode("normal");

      return true;
    } catch {
      return false;
    }
  };

  const enterLiveMode = () => {
    const normalMessages = [...messagesRef.current];

    preLiveSessionIdRef.current = getActiveSessionIdForMode("normal");
    setPreLiveMessages(normalMessages);
    preserveNormalDraft();

    setLiveMode(true);
  };

  const requestExitLiveMode = () => {
    setShowExitPopup(true);
  };

  const beginNextRepeatedConversation = () => {
    setShowConversationRecord(false);
    setLastConversationRecord(null);
    setLiveOutcomeReview(null);
    setPendingLiveExitAction(null);

    const parentSessionId =
      preLiveSessionIdRef.current || getActiveSessionIdForMode("normal");
    const preparationSession = loadPreparationSession();
    if (parentSessionId) {
      updateSessionLinkage(parentSessionId, {
        preparationSessionId: preparationSession?.preparationSessionId,
        surface: "live",
      });
    }

    beginNextLiveConversation({
      enterLiveMode,
      startListening,
      onReady: () => {
        setToastMessage("Ready for next call");
        setShowToast(true);
      },
    });
  };

  const exitLiveMode = () => {
    try {
      stopLiveAudioRuntime();
      stopListening();
      window.speechSynthesis.cancel();
    } catch {}

    setLiveMode(false);
    setVoiceOn(false);
    setInteractionMode("text");
    setConversationMode(null);
    setShowConversationMenu(false);
    setConversationMenuLane("selector");
    setShowCampaignMenu(false);
    setShowRecentFolders(false);
    setActivePromptContext(null);
    setActivePromptLabel(null);
    setStableLiveGuidance(null);
    setInterimTranscript("");
    setVoiceError("");

    const parentSessionId =
      preLiveSessionIdRef.current || getActiveSessionIdForMode("normal");
    const preparationSession = loadPreparationSession();
    if (parentSessionId) {
      updateSessionLinkage(parentSessionId, {
        preparationSessionId: preparationSession?.preparationSessionId,
        surface: "post_live",
      });
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("george_active_context");
      window.localStorage.removeItem("george_active_label");
      window.localStorage.setItem("george_voice", "off");
    }

    const restoredDraft = restoreNormalDraft();

    if (!restoredDraft && preLiveMessages) {
      skipNextTypewriterRef.current = true;

      if (preLiveSessionIdRef.current) {
        setActiveSessionIdForMode("normal", preLiveSessionIdRef.current);
      }

      setActiveMode("normal");
      liveSessionWriteReadyRef.current = false;
      normalSessionWriteReadyRef.current = true;

      setLiveMode(false);
      setConversationMode(null);
      setActivePromptContext(null);

      setMessages(preLiveMessages);
      messagesRef.current = preLiveMessages;
      setTypedMessageIndex(null);
      setTypedMessageContent("");
    }
    // save LIVE conversation if meaningful
    if (messagesRef.current.length > 2) {
      try {
        saveSessionToV2({
          mode: "live",
          title: getActiveLiveDesiredOutcomeTitle("LIVE Conversation"),
          messages: messagesRef.current,
          summary: "LIVE Conversation checkpoint.",
          userGoal: "In progress",
          lastKnownState: "User exited LIVE mode.",
          suggestedRestart: "Resume this LIVE Conversation naturally.",
          metadata: {
            normalSessionId: parentSessionId,
            preparationSessionId: preparationSession?.preparationSessionId,
            surface: "post_live",
            liveOutcomeObservation:
              typeof window !== "undefined"
                ? JSON.parse(
                    window.localStorage.getItem(
                      "GEORGE_LAST_LIVE_OUTCOME_OBSERVATION",
                    ) || "null",
                  )
                : null,
          },
        });
      } catch {}
    }

    setPreLiveMessages(null);

  };

  const finishActiveBriefing = () => {
    setShowConversationRecord(false);
    const parentSessionId =
      preLiveSessionIdRef.current || getActiveSessionIdForMode("normal");
    if (parentSessionId) {
      updateSessionLinkage(parentSessionId, { surface: "normal" });
    }
    router.replace("/george");
  };

  const askWithinActiveBriefing = () => {
    setShowConversationRecord(false);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };
  const startNewGeorgeSession = (
    openingMessage: Message,
    sessionLabel = "GEORGE Session",
  ) => {
    // A new workspace must begin in a clean normal-GEORGE state.
    // LIVE preparation cannot survive into the new workspace.
    setShowPreLiveSignalSurface(false);
    setNormalPreparationSession(null);
    setCurrentPreLiveQuestion(null);
    setPreLiveSignals({});
    setPreLiveSignalComplete(false);
    setActivePromptContext(null);
    setActivePromptLabel(null);
    setConversationMode(null);
    setTypedMessageIndex(null);
    setTypedMessageContent("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("GEORGE_PRE_LIVE_FROM_MESSAGE");
      window.localStorage.removeItem("GEORGE_LIVE_INTENT_STAGE");
      clearLivePreparationPreviewReady();
      window.localStorage.removeItem("GEORGE_PRE_LIVE_SOURCE_CONTEXT");
      window.localStorage.removeItem("GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION");
      window.localStorage.removeItem("george_start_new_live");
      window.localStorage.removeItem("george_fresh_live_entry");
    }
    if (typeof window !== "undefined" && messagesRef.current.length > 1) {
      try {
        const parentSessionId =
          preLiveSessionIdRef.current || getActiveSessionIdForMode("normal");
        const preparationSession = loadPreparationSession();
        saveSessionToV2({
          mode: liveMode ? "live" : "normal",
          title: liveMode
            ? getActiveLiveDesiredOutcomeTitle(sessionLabel)
            : deriveNormalSessionTitleFromMessages(
                messagesRef.current,
                sessionLabel,
              ),
          messages: messagesRef.current,
          summary: liveMode
            ? "LIVE Conversation saved before starting a new session."
            : "GEORGE session saved before starting a new session.",
          userGoal: activePromptLabel || "Not set",
          lastKnownState: "Saved after user interaction.",
          suggestedRestart: liveMode
            ? "Resume this LIVE Conversation naturally."
            : "Resume this GEORGE session from the clearest next step.",
          metadata: liveMode
            ? {
                normalSessionId: parentSessionId,
                preparationSessionId: preparationSession?.preparationSessionId,
                surface: "live",
              }
            : undefined,
        });
      } catch {}
    }

    if (conversationMode === "manual_live") {
      // initialize LIVE surface
      setMessages([]);
      messagesRef.current = [];
      const liveIntro: Message = {
        role: "assistant",
        content: `I’m listening.

You don’t have to explain everything up front.
As you speak, I’ll pick up the room.

If you need help, just say things like:
“hold on…”
“how do I say this?”
“what’s the word I’m looking for?”
“let me put that another way…”
“help me here”

I’ll stay with you.`,
      };

      const subscriberMetadata = getSubscriberSessionMetadata();
      if (subscriberMetadata) {
        liveSessionWriteReadyRef.current = true;
      }
      setMessages([liveIntro]);
      messagesRef.current = [liveIntro];
    } else {
      const subscriberMetadataForOpening = getSubscriberSessionMetadata();
      if (subscriberMetadataForOpening) {
        liveSessionWriteReadyRef.current = true;
      }
      setMessages([openingMessage]);
      messagesRef.current = [openingMessage];
    }
    setInput("");
    setInterimTranscript("");
    setVoiceError("");
    setSuggestedPrompts([]);
    setSuggestedSignal(0);
    setReroutePrompt(null);
    setRerouteSignal(0);
    setContextTurnCount(0);
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [showScrollHint, setShowScrollHint] = useState(false);
  const [responseActionMenuIndex, setResponseActionMenuIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const checkScroll = () => {
      const el = messagesEndRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight;

      setShowScrollHint(!inView);
    };

    window.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [isThinking, bridgeThinking]);

  const scrollHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleArrowScroll = (event: globalThis.KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const active = document.activeElement;
      const isComposer = active === textareaRef.current;
      const isEditing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);

      if (isEditing && (!isComposer || input.trim())) return;

      event.preventDefault();

      window.scrollBy({
        top: event.key === "ArrowDown" ? 120 : -120,
        behavior: "smooth",
      });
    };

    window.addEventListener("keydown", handleArrowScroll);
    return () => window.removeEventListener("keydown", handleArrowScroll);
  }, [input]);
  const userPinnedBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    const nextHeight = Math.min(Math.max(el.scrollHeight, 24), 144);
    el.style.height = `${nextHeight}px`;
  }, [input]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const autoResizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const maxHeight = 180;
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [input, interimTranscript, autoResizeTextarea]);
  const promptMenuRef = useRef<HTMLDivElement | null>(null);
  const hasUserInteractedRef = useRef(false);

  const getExistingFolders = () => {
    if (typeof window === "undefined") return [] as string[];

    const existing = JSON.parse(
      window.localStorage.getItem("GEORGE_WORKSPACE") || "[]",
    );
    const folders = Array.from(
      new Set(
        existing
          .map((item: { folder?: string }) => (item.folder || "").trim())
          .filter((folder: string) => folder && folder !== "Scripts"),
      ),
    ) as string[];

    const lastUsedFolder = (
      window.localStorage.getItem("GEORGE_LAST_FOLDER") || ""
    ).trim();
    if (!lastUsedFolder) return folders;

    return [
      lastUsedFolder,
      ...folders.filter((folder) => folder !== lastUsedFolder),
    ];
  };

  const getDefaultFolder = () => {
    if (typeof window === "undefined") return "general";
    const existingFolders = getExistingFolders();
    const lastUsedFolder = (
      window.localStorage.getItem("GEORGE_LAST_FOLDER") || ""
    ).trim();
    return lastUsedFolder || existingFolders[0] || "general";
  };

  const getMemoriesByFolder = (folder: string) => {
    if (typeof window === "undefined") return [];

    const existing = JSON.parse(
      window.localStorage.getItem("GEORGE_WORKSPACE") || "[]",
    ) as any[];

    return existing
      .filter(
        (item) =>
          (item.type || "memory") === "memory" &&
          (item.folder || "").trim() === folder.trim(),
      )
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  };

  const getCampaigns = () => {
    if (typeof window === "undefined") return [];

    try {
      return getCampaignSessions();
    } catch {
      return [];
    }
  };

  const getFolderItems = (folder: string) => {
    if (typeof window === "undefined") return [];

    const memoryItems = getMemoriesByFolder(folder);

    const campaigns = getCampaigns();

    const campaignItems = campaigns.map((session: any) => ({
      ...session,
      type: "campaign",
      folder: "campaigns",
    }));

    return [...memoryItems, ...campaignItems];
  };

  const getLatestSavedMemoryByFolder = (folder: string) => {
    if (typeof window === "undefined") return null;

    const existing = JSON.parse(
      window.localStorage.getItem("GEORGE_WORKSPACE") || "[]",
    ) as Array<{
      type?: "memory" | "campaign";
      content?: string;
      role?: string;
      folder?: string;
      timestamp?: number;
      savedPair?: boolean;
      userPromptContent?: string | null;
    }>;

    const matches = existing
      .filter(
        (item) =>
          (item.type || "memory") === "memory" &&
          (item.folder || "").trim() === folder.trim(),
      )
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (!matches.length) return null;

    const latest = matches[0];
    const assistantPart = (latest.content || "").trim();
    const userPart = (latest.userPromptContent || "").trim();

    if (latest.savedPair && userPart && assistantPart) {
      return `Continuation memory (${folder})\nUser: ${userPart}\nGEORGE: ${assistantPart}`;
    }

    if (assistantPart) {
      return `Continuation memory (${folder})\n${assistantPart}`;
    }

    return null;
  };

  const saveGoal = (message: Message, messageIndex: number) => {
    if (typeof window === "undefined") return;

    const existing = JSON.parse(
      window.localStorage.getItem("GEORGE_WORKSPACE") || "[]",
    );
    const previousUserMessage =
      message.role === "assistant"
        ? [...messagesRef.current.slice(0, messageIndex)]
            .reverse()
            .find((item) => item.role === "user") || null
        : null;

    const sourceText = previousUserMessage?.content || message.content || "";
    const assistantText =
      message.role === "assistant" ? message.content || "" : "";
    const titleSource = sourceText || assistantText || "Active direction";
    const cleanTitle = titleSource.replace(/\s+/g, " ").trim().slice(0, 110);
    const cleanSummary = assistantText
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);

    existing.push({
      id: `goal_${Date.now()}`,
      type: "goal",
      status: "active",
      trajectoryTitle: cleanTitle || "Active direction",
      trajectorySummary:
        cleanSummary ||
        "GEORGE will keep this in chamber until you finish, clear, or share it.",
      content: message.content,
      preview: cleanTitle || "Active direction",
      role: message.role,
      folder: "Goals",
      timestamp: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      savedPair: message.role === "assistant",
      userPromptContent: previousUserMessage?.content || null,
      completionState: "unfinished",
      source: "user_classified_goal",
    });

    window.localStorage.setItem("GEORGE_WORKSPACE", JSON.stringify(existing));
    window.localStorage.setItem("GEORGE_LAST_FOLDER", "Goals");
    setMemoryVersion((prev) => prev + 1);
    setToastMessage("Kept in chamber");
    setShowToast(true);
    setActiveSaveIndex(null);
    setNewFolderName("");
  };

  const saveMemory = (
    message: Message,
    messageIndex: number,
    folderOverride?: string,
  ) => {
    if (typeof window === "undefined") return;

    const existing = JSON.parse(
      window.localStorage.getItem("GEORGE_WORKSPACE") || "[]",
    );
    const chosenFolder =
      (folderOverride || getDefaultFolder()).trim() || "general";

    const previousUserMessage =
      message.role === "assistant"
        ? [...messagesRef.current.slice(0, messageIndex)]
            .reverse()
            .find((item) => item.role === "user") || null
        : null;

    const abbreviated =
      message.role === "assistant"
        ? (message.content || "").split("\n")[0].slice(0, 120)
        : (message.content || "").slice(0, 120);

    existing.push({
      type: "memory",
      content: message.content,
      preview: abbreviated,
      role: message.role,
      folder: chosenFolder,
      timestamp: Date.now(),
      savedPair: message.role === "assistant",
      userPromptContent: previousUserMessage?.content || null,
    });

    window.localStorage.setItem("GEORGE_WORKSPACE", JSON.stringify(existing));
    window.localStorage.setItem("GEORGE_LAST_FOLDER", chosenFolder);
    setMemoryVersion((prev) => prev + 1);
    setToastMessage(`Saved to ${chosenFolder}`);
    setShowToast(true);
    setActiveSaveIndex(null);
    setNewFolderName("");
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (liveMode || isManualLive) return;
    if (!Array.isArray(messages) || messages.length === 0) return;

    const hasUserMessage = messages.some(
      (message) =>
        message.role === "user" &&
        String(message.content || "").trim().length > 0,
    );

    if (!hasUserMessage) return;

    window.sessionStorage.setItem(
      GEORGE_LAST_NORMAL_DRAFT,
      JSON.stringify({
        messages,
        conversationMode,
        activePromptContext,
        currentTier,
        updatedAt: Date.now(),
      }),
    );

    window.localStorage.removeItem(GEORGE_LAST_NORMAL_DRAFT);
  }, [messages, liveMode, conversationMode, activePromptContext, currentTier]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!normalSessionWriteReadyRef.current) return;
    if (liveMode || isManualLive) return;
    if (!messages.length) return;

    const subscriberMetadata = getSubscriberSessionMetadata() || {};
    updateActiveSessionMessages(messages, "normal", subscriberMetadata);
  }, [messages, liveMode, conversationMode, activePromptContext]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!liveSessionWriteReadyRef.current) return;
    if (!liveMode && !isManualLive) return;
    if (!messages.length) return;

    const subscriberMetadata = getSubscriberSessionMetadata();
    if (!subscriberMetadata) return;
    updateActiveSessionMessages(messages, "live", subscriberMetadata);
  }, [messages, liveMode, conversationMode, activePromptContext]);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    if (!userPinnedBottomRef.current && !liveMode) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking) return;
    const interval = setInterval(() => {
      setThinkingDots((d) => (d % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, [isThinking]);

  useEffect(() => {
    if (!windowEndsAt) return;

    const interval = setInterval(() => {
      if (Date.now() >= windowEndsAt) {
        setIsFullMode(false);
        setWindowEndsAt(null);
        window.localStorage.removeItem("george_full_until");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [windowEndsAt]);

  const availableFolders = useMemo(
    () => getExistingFolders(),
    [messages, activeSaveIndex, memoryVersion],
  );
  const recentFolders = useMemo(() => availableFolders, [availableFolders]);

  const SpeechRecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const insideSavePicker = savePickerRef.current?.contains(target) ?? false;
      const insideFolderBrowser =
        folderBrowserRef.current?.contains(target) ?? false;
      const insidePromptMenu = promptMenuRef.current?.contains(target) ?? false;
      const insideLanguageMenu =
        (target as Element | null)?.closest?.("[data-george-language-menu]") ??
        false;

      if (
        !insideSavePicker &&
        !insideFolderBrowser &&
        !insidePromptMenu &&
        !insideLanguageMenu
      ) {
        setShowLanguageMenu(false);
        setShowPromptMenu(false);
        setShowRecentFolders(false);
        setActiveMemoryFolder(null);
        setActiveSaveIndex(null);
        setRewordPopupIndex(null);
        setTonePopupIndex(null);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();

      const typing =
        tag === "input" || tag === "textarea" || target?.isContentEditable;

      if (event.key === "Escape") {
        setShowPromptMenu(false);
        setShowLanguageMenu(false);
      }

      if (typing && event.key !== "ArrowDown" && event.key !== "ArrowUp")
        return;
      if (typing && event.shiftKey) return;

      const scrollHost = scrollHostRef.current;

      if (!scrollHost) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();

        scrollHost.scrollBy({
          top: 120,
          behavior: "smooth",
        });
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        scrollHost.scrollBy({
          top: -120,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenMemoryFolder = (event: Event) => {
      const folder = (event as CustomEvent<string>).detail;
      if (!folder) return;

      const prompt =
        folder === "Credit"
          ? "Help me tighten my credit situation and show me the strongest path."
          : folder === "Business"
            ? "Help me improve the business path in front of me."
            : folder === "Legal"
              ? "Help me understand the legal issue clearly and cautiously."
              : folder === "Funding"
                ? "Help me think clearly about funding and show me the strongest path."
                : "Help me find the strongest next move.";

      setInput(prompt);

      setTimeout(() => {
        void handleSend(prompt);
      }, 0);

      setShowRecentFolders(false);
      setActiveMemoryFolder(folder);
      setShowSidebar(false);
    };

    window.addEventListener(
      "open-memory-folder",
      handleOpenMemoryFolder as EventListener,
    );

    return () => {
      window.removeEventListener(
        "open-memory-folder",
        handleOpenMemoryFolder as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
    setIsAndroid(/Android/i.test(ua));

    const storedName = window.localStorage.getItem("george_name") || "";
    const storedBirthdayMD =
      window.localStorage.getItem("george_birthday_md") || "";
    const storedVoiceSpeed = Number(
      window.localStorage.getItem("george_voice_speed") || "1.4",
    );
    const storedVoiceType =
      window.localStorage.getItem("george_voice_type") || "ash";
    const nameLocked =
      window.localStorage.getItem("george_name_locked") === "true";
    const voiceLocked =
      window.localStorage.getItem("george_voice_locked") === "true";

    const storedWindowEnd = window.localStorage.getItem("george_full_until");
    if (storedWindowEnd) {
      const end = Number(storedWindowEnd);
      if (Date.now() < end) {
        setIsFullMode(true);
        setWindowEndsAt(end);
      } else {
        window.localStorage.removeItem("george_full_until");
      }
    }

    const personalized =
      window.localStorage.getItem("george_personalized") === "true";

    if (currentTier === "smart") {
      setProfileName("");
      window.localStorage.setItem("george_name_locked", "true");
      window.localStorage.setItem("george_voice_locked", "true");
    } else {
      setProfileName(personalized ? storedName : "");
      setDraftProfileName(personalized ? storedName : "");
      window.localStorage.setItem(
        "george_name_locked",
        personalized ? "false" : "true",
      );
      window.localStorage.setItem(
        "george_voice_locked",
        personalized ? "false" : "true",
      );
    }

    if (personalized && ["ash", "coral"].includes(storedVoiceType)) {
      setVoiceType(storedVoiceType);
    }

    setBirthdayMD(storedBirthdayMD);

    if ([0.8, 1, 1.2, 1.4].includes(storedVoiceSpeed)) {
      setVoiceSpeed(storedVoiceSpeed);
    }

    if (currentTier === "smart") {
      setInteractionMode("text");
      setVoiceOn(false);
      window.localStorage.setItem("george_voice", "off");
    } else {
      setInteractionMode("text");
      setVoiceOn(false);
      window.localStorage.setItem("george_voice", "off");
    }

    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared");
    const prompt = params.get("prompt");
    const context = params.get("context");
    const label = params.get("label");
    if (shared) {
      setInput(shared);
      if (textareaRef.current) {
      }
    }

    if (prompt) {
      setInput(prompt);
      if (textareaRef.current) {
      }
    }

    if (context) {
      setActivePromptContext(context);
      setContextTurnCount(0);
    }

    if (label) {
      setActivePromptLabel(label);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentTier === "smart") {
      setVoiceOn(false);
      if (interactionMode === "speech") {
        setInteractionMode("text");
      }
      window.localStorage.setItem("george_voice", "off");
      return;
    }

    window.localStorage.setItem("george_voice", voiceOn ? "on" : "off");
  }, [currentTier, interactionMode, voiceOn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentTier === "smart") return;
    window.localStorage.setItem("george_voice_speed", String(voiceSpeed));
  }, [voiceSpeed, currentTier]);

  const tagline = `I will not contradict the Holy Bible (KJV).`;

  const homepageHeroSequence = [
    "Build a business plan",
    "Help me think it through",
    "Create a pitch deck",
    "Review this document",
    "Build a stronger strategy",
    "Analyze this opportunity",
    "Compare my options",
    "Plan the next steps",
    "Solve this problem",
    "Strengthen this proposal",
    "Prepare for the interview",
    "Improve this presentation",
    "Review this contract",
    "Write a better response",
    "Organize my thinking",
    "Research this topic",
    "Turn ideas into action",
    "Make this decision easier",
  ];
  const [homepageHeroFlip, setHomepageHeroFlip] = useState({
    front: 0,
    back: 1,
    flipped: false,
    transitionEnabled: true,
  });

  useEffect(() => {
    let settleTimer: number | null = null;
    let resetTimer: number | null = null;

    const timer = window.setInterval(() => {
      setHomepageHeroFlip((state) => ({
        ...state,
        flipped: true,
        transitionEnabled: true,
      }));

      settleTimer = window.setTimeout(() => {
        setHomepageHeroFlip((state) => {
          const nextFront = state.back;
          const nextBack = (state.back + 1) % homepageHeroSequence.length;

          return {
            front: nextFront,
            back: nextBack,
            flipped: false,
            transitionEnabled: false,
          };
        });

        resetTimer = window.setTimeout(() => {
          setHomepageHeroFlip((state) => ({
            ...state,
            transitionEnabled: true,
          }));
        }, 40);
      }, 900);
    }, 3600);

    return () => {
      window.clearInterval(timer);

      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
      }

      if (resetTimer !== null) {
        window.clearTimeout(resetTimer);
      }
    };
  }, [homepageHeroSequence.length]);

  const heroTitle = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const monthDay = `${month}-${day}`;
    const hour = now.getHours();
    const nameSuffix = profileName ? `, ${profileName}` : "";

    if (birthdayMD && monthDay === birthdayMD) {
      return `Happy birthday${nameSuffix}.`;
    }

    if (monthDay === "01-01") {
      return "Happy New Year.";
    }

    if (monthDay === "12-25") {
      return "Merry Christmas.";
    }

    return getInitialGreeting(profileName, currentTier);
  }, [birthdayMD, profileName, currentTier]);

  const stopListening = useCallback(() => {
    if (liveMode) {
      stopLiveAudioRuntimeDirect();
      setIsListening(false);
      return;
    }

    recognitionRef.current?.stop?.();
    setIsListening(false);
  }, [liveMode, stopLiveAudioRuntimeDirect]);

  const startListening = useCallback(() => {
    if (liveMode) {
      if (isListening || isThinking || speakingRef.current) return;

      setVoiceError("");
      setInterimTranscript("");
      setIsListening(true);

      try {
        const startResult = startLiveAudioRuntime();

        void Promise.resolve(startResult).catch((error) => {
          console.warn("[GEORGE LIVE AUDIO][START]", error);
          setIsListening(false);
          setVoiceError("LIVE microphone connection failed.");
        });
      } catch (error) {
        console.warn("[GEORGE LIVE AUDIO][START]", error);
        setIsListening(false);
        setVoiceError("LIVE microphone connection failed.");
      }

      return;
    }

    if (!recognitionRef.current || isIOS) {
      setVoiceError("Voice input is not available on this device yet.");
      return;
    }

    if (isListening || isThinking || speakingRef.current) return;

    setVoiceError("");
    setInterimTranscript("");

    try {
      recognitionRef.current.start();
    } catch {
      // browser timing collisions
    }
  }, [liveMode, isIOS, isListening, isThinking, startLiveAudioRuntime]);

  function splitForSpeech(text: string): string[] {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return [];
    if (cleaned.length <= 420) return [cleaned];

    return cleaned
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .flatMap((sentence) => {
        if (sentence.length <= 420) return [sentence];

        const parts = sentence
          .split(/[,;:—-]\s+/)
          .map((p) => p.trim())
          .filter(Boolean);

        return parts.length ? parts : [sentence];
      });
  }

  function pauseMs(chunk: string) {
    if (/[?]$/.test(chunk)) return 25;
    if (/[!]$/.test(chunk)) return 18;
    if (/[,;:—-]/.test(chunk)) return 8;
    return 0;
  }

  function wait(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function stopBridgeSpeech() {
    if (bridgeTimerRef.current) {
      clearTimeout(bridgeTimerRef.current);
      bridgeTimerRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    bridgeSpeechRef.current = null;
  }

  function startBridgeSpeech() {
    return;
  }

  async function stopSpeech() {
    speechPlaybackGenerationRef.current += 1;
    clearSpeechQueue({
      setQueue: (queue) => {
        speechQueueRef.current = queue;
      },
      setStopped: (stopped) => {
        stopSpeechRef.current = stopped;
      },
    });
    stopBridgeSpeech();

    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current = null;
    }

    speakingRef.current = false;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }

  async function fetchSpeech(text: string, turnId?: string) {
    const speechText = normalizeBrandSpeech(text);
    // block TTS for Smart tier
    if (currentTier === "smart") {
      return null;
    }

    if (liveMode && turnId) {
      markLiveTtsRequestStart(turnId);
    }

    const res = await fetch(liveMode ? "/api/george/live/tts" : "/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: liveMode
        ? JSON.stringify({ text: speechText })
        : JSON.stringify({
            mode: activeCampaign ? "campaign" : "normal",
            forceClose,
            input: speechText,
            speed: liveMode
              ? determineLiveVoiceSpeed({
                  deliveryStyle: liveDeliveryStyle,
                  text,
                  receiverProfile: voiceOn ? "audio_visual" : "visual_only",
                }).speed
              : voiceSpeed,
            tier: currentTier,
            voice: voiceType,
          }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      console.error("[GEORGE TTS FAILED]", res.status, msg);
      throw new Error(`TTS failed: ${res.status}`);
    }

    const buffer = await res.arrayBuffer();

    if (liveMode && turnId) {
      markLiveTtsAudioReceived(turnId);
    }

    if (!buffer.byteLength) {
      throw new Error("TTS returned empty audio");
    }

    const blob = new Blob([buffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  function revealPendingAssistantMessage() {
    if (assistantRevealedRef.current) return;
    if (!pendingAssistantMessage) return;

    assistantRevealedRef.current = true;

    setMessages((prev) => {
      const next = [...prev, pendingAssistantMessage];
      messagesRef.current = next;

      try {
        const subscriberMetadata = getSubscriberSessionMetadata();
        if (subscriberMetadata) {
          updateActiveSessionMessages(
            next,
            liveMode ? "live" : "normal",
            subscriberMetadata,
          );
        }
      } catch {}
      return next;
    });

    setPendingAssistantMessage(null);

    // CLEAR ACTIVE PROMPT AFTER USE
    if (activePromptContext || activePromptLabel) {
      setActivePromptContext(null);
      setActivePromptLabel(null);
      setContextTurnCount(0);
    }
  }

  async function playQueue(
    liveTurnId?: string,
    playbackGeneration = speechPlaybackGenerationRef.current,
  ) {
    if (playbackGeneration !== speechPlaybackGenerationRef.current) return;
    if (isSpeakingRef.current) return;

    await drainSpeechQueue({
      getQueue: () => speechQueueRef.current,
      setQueue: (queue) => {
        speechQueueRef.current = queue;
      },
      isStopped: () => stopSpeechRef.current,
      setStopped: (stopped) => {
        stopSpeechRef.current = stopped;
      },
      beforeStart: () => {
        isSpeakingRef.current = true;
        stopSpeechRef.current = false;
        speakingRef.current = true;
        setIsSpeaking(true);
      },
      afterStop: () => {
        isSpeakingRef.current = false;
        speakingRef.current = false;
        audioRef.current?.stop();
        audioRef.current = null;
        setIsSpeaking(false);
      },
      pauseMs,
      wait,
      playChunk: async (chunk) => {
        const turnId = liveMode
          ? liveTurnId ||
            `tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          : undefined;

        if (turnId) {
          startLiveTtsTurn(turnId);
        }

        const url = await fetchSpeech(chunk, turnId);
        if (!url) return;

        if (playbackGeneration !== speechPlaybackGenerationRef.current) {
          URL.revokeObjectURL(url);
          console.info("[GEORGE LIVE AUDIO][STALE PLAYBACK DISCARDED]", {
            turnId,
            playbackGeneration,
            currentGeneration: speechPlaybackGenerationRef.current,
          });
          return;
        }

        const playback = createAudioPlayback({
          url,
          onStopRequested: () => stopSpeechRef.current,
          onBeforePlay: () => {
            if (playbackGeneration !== speechPlaybackGenerationRef.current)
              return;
            revealPendingAssistantMessage();
          },
          onPlaybackStart: () => {
            if (playbackGeneration !== speechPlaybackGenerationRef.current) {
              playback.stop();
              return;
            }
            if (turnId) {
              markLiveTtsPlaybackStart(turnId);
            }

            const audio = playback.audio;

            console.info("[GEORGE AUDIO PLAYING]", {
              muted: audio.muted,
              volume: audio.volume,
              duration: audio.duration,
              readyState: audio.readyState,
              currentSrc: audio.currentSrc ? "set" : "missing",
            });
          },
          onPlaybackEnd: () => {
            if (turnId) {
              markLiveTtsPlaybackEnd(turnId);
            }
          },
          onError: (event, audio) => {
            console.error("Audio playback failed", event, {
              currentSrc: audio.currentSrc,
              networkState: audio.networkState,
              readyState: audio.readyState,
              error: audio.error
                ? {
                    code: audio.error.code,
                    message: audio.error.message,
                  }
                : null,
            });
          },
        });

        if (playbackGeneration !== speechPlaybackGenerationRef.current) {
          playback.stop();
          return;
        }

        audioRef.current?.stop();
        audioRef.current = playback;
        stopBridgeSpeech();
        await playback.play();
      },
    });
  }

  const speakText = useCallback(
    async (
      text: string,
      options?: { source?: "hub" | "legacy"; turnId?: string },
    ) => {
      if (typeof window === "undefined") return;
      if (isIOS || !voiceOn || (!hasUserInteractedRef.current && !liveMode)) {
        return;
      }

      if (
        liveMode &&
        options?.source !== "hub" &&
        Date.now() < suppressLegacyLiveVoiceUntilRef.current
      ) {
        return;
      }

      if (liveMode && options?.source === "hub") {
        suppressLegacyLiveVoiceUntilRef.current = Date.now() + 8000;
      }

      try {
        setVoiceError("");
        await stopSpeech();
        const playbackGeneration = speechPlaybackGenerationRef.current;

        const cleaned = text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
          .replace(/\s+/g, " ")
          .trim();

        const chunks = splitForSpeech(cleaned);
        if (!chunks.length) {
          return;
        }

        if (liveMode) {
          const spokenMemory = rememberLiveSpokenLine({
            line: cleaned,
            previousRecentLines: liveRecentSpokenUtterancesRef.current,
          });

          liveLastSpokenUtteranceRef.current = spokenMemory.lastSpokenLine;
          liveRecentSpokenUtterancesRef.current =
            spokenMemory.recentSpokenLines;
        }

        if (liveMode && options?.source === "hub" && isSpeakingRef.current) {
          replaceSpeechQueue(
            {
              setQueue: (queue) => {
                speechQueueRef.current = queue;
              },
            },
            chunks.slice(-1),
          );
          return;
        }

        replaceSpeechQueue(
          {
            setQueue: (queue) => {
              speechQueueRef.current = queue;
            },
          },
          liveMode && options?.source === "hub" ? chunks.slice(-1) : chunks,
        );

        await playQueue(options?.turnId, playbackGeneration);
      } catch {
        revealPendingAssistantMessage();
        speakingRef.current = false;
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setVoiceError("Voice reply failed.");
      }
    },
    [interactionMode, isIOS, voiceOn, voiceSpeed, currentTier, liveMode],
  );

  // DEV: ACTIVATE FULL MODE (2 HOURS)
  const activateFullMode = () => {
    const twoHours = 2 * 60 * 60 * 1000;
    const end = Date.now() + twoHours;

    setIsFullMode(true);
    setWindowEndsAt(end);
    window.localStorage.setItem("george_full_until", String(end));
  };

  const handleSend = useCallback(
    async (
      overrideText?: string,
      options?: {
        hidden?: boolean;
        source?: Message["source"];
        preparationContext?: PreparationSessionV1;
        preparationEvidenceSufficiency?: "unresolved" | "sufficient";
        signalAcquisitionAllowed?: boolean;
        requestPurpose?: typeof NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST;
      },
    ) => {
      let text = (overrideText ?? input).trim();

      if (overrideText === undefined && !options?.hidden && text) {
        setComposerSendFeedbackSignal((current) => current + 1);
      }

      const liveRuntimeSetup = (() => {
        if (typeof window === "undefined" || !liveMode) return null;

        try {
          const raw = window.localStorage.getItem("george_live_setup_active");

          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      const preProviderResolution = resolvePreProviderSend({
        text,
        activePromptContext,
        activeMemoryFolder,
        previousUserMessages: messagesRef.current
          .filter((message) => message.role === "user")
          .map((message) => message.content || ""),
      });

      const detectedDomain = preProviderResolution.metadata.detectedDomain;
      const activeDomain = preProviderResolution.metadata.activeDomain;
      const providerSystemContext = preProviderResolution.systemContext || "";

      if (detectedDomain) {
        setLastDomain(detectedDomain);
      } else if (lastDomain && activeDomain === null) {
        setLastDomain(null);
      }

      if (preProviderResolution.guidedLine) {
        setLastGuidedLine(preProviderResolution.guidedLine);
      }

      if (
        !options?.preparationContext &&
        preProviderResolution.mode === "return"
      ) {
        return preProviderResolution.response;
      }

      if ((forceLive || liveMode) && isLiveIdentityQuestion(text)) {
        const identityUserMessage: Message = {
          role: "user",
          content: text,
          source: options?.source || "user_input",
        };

        const assistantMessage: Message = {
          role: "assistant",
          content: buildLiveSelfDescription(),
          source: "system_override",
        };

        const nextMessages: Message[] = [
          ...messagesRef.current,
          ...(options?.hidden ? [] : [identityUserMessage]),
          assistantMessage,
        ];

        setMessages(nextMessages);
        messagesRef.current = nextMessages;
        setInput("");
        setPendingImage(null);
        setInterimTranscript("");
        setVoiceError("");
        setConversationSignal("LIVE identity");
        setIsThinking(false);
        void speakText(assistantMessage.content);
        return;
      }

      if (!text && !pendingImage) {
        setVoiceError("Type a message first.");
        return;
      }

      if (!text && pendingImage) {
        text = `I uploaded image: ${pendingImage.name}. Describe the visible image briefly and help me use it. If a person appears, describe visible features only. Do not identify the person. Keep it concise.`;
      }

      if (!(forceLive || liveMode) && !options?.hidden) {
        const activeNormalSessionId = getActiveSessionIdForMode("normal");

        if (!activeNormalSessionId) {
          const subscriberMetadata = getSubscriberSessionMetadata() || {};

          createSession("normal", [], "New Session", subscriberMetadata);
        }

        setHasSentFirstNormalMessage(true);
      }

      // allow override while thinking
      if (isThinking) {
        await stopSpeech();
        setIsThinking(false);
      }

      hasUserInteractedRef.current = true;

      await stopSpeech();
      stopListening();

      const userMessage: Message | null = options?.hidden
        ? null
        : {
            role: "user",
            content: text.trim(),
            imageDataUrl: pendingImage?.dataUrl || null,
          };

      if (!liveMode && activePromptContext === "live_message_bar_setup") {
        const liveMessageBarResolution = resolveLiveMessageBarSetup({ text });

        if (liveMessageBarResolution.mode === "start_full_brief") {
          startLiveSignalAcquisition();
          setIsThinking(false);
          return;
        }

        if (liveMessageBarResolution.mode === "accept_current_session") {
          startLiveSignalAcquisition();
          setIsThinking(false);
          return;
        }

        const next: Message[] = [
          ...messagesRef.current,
          ...(userMessage ? [userMessage] : []),
          {
            role: "assistant",
            content: liveMessageBarResolution.assistantContent,
            source: "system_override",
          },
        ];

        setMessages(next);
        messagesRef.current = next;
        setInput("");
        setIsThinking(false);
        return;
      }

      if (!liveMode && activePromptContext === "live_intent_bridge") {
        let sourceContext: any = null;
        try {
          sourceContext = JSON.parse(
            window.localStorage.getItem("GEORGE_PRE_LIVE_SOURCE_CONTEXT") ||
              "null",
          );
        } catch {}

        const liveIntentStage =
          window.localStorage.getItem("GEORGE_LIVE_INTENT_STAGE") ||
          "confirm_intent";
        const liveIntentResult = resolveLiveIntentRuntime({
          text,
          stage: liveIntentStage,
          sourceContext,
        });

        if (liveIntentResult.clearStage) {
          try {
            window.localStorage.removeItem("GEORGE_LIVE_INTENT_STAGE");
          } catch {}
        }

        if (liveIntentResult.clearSourceContext) {
          try {
            window.localStorage.removeItem("GEORGE_PRE_LIVE_SOURCE_CONTEXT");
          } catch {}
        }

        if (liveIntentResult.nextStage) {
          window.localStorage.setItem(
            "GEORGE_LIVE_INTENT_STAGE",
            liveIntentResult.nextStage,
          );
        }

        if (liveIntentResult.preLiveSignals) {
          window.localStorage.setItem(
            "GEORGE_PRE_LIVE_SIGNALS",
            JSON.stringify(liveIntentResult.preLiveSignals),
          );

          normalLiveExplicitObjectiveRef.current =
            liveIntentStage === "collect_signal"
              ? String(
                  liveIntentResult.preLiveSignals.desiredOutcome || "",
                ).trim()
              : "";
        }

        if (liveIntentResult.navigateToLiveEntry) {
          const normalSignals = loadLivePreparationSignals();
          const preparationSession = beginNormalLivePreparation({
            signals: normalSignals,
            explicitObjective: normalLiveExplicitObjectiveRef.current,
            sourceContext: String(sourceContext?.summary || ""),
            checkpoint: { surface: "ready_room", phase: "mechanics" },
          });
          if (!preparationSession) return;

          window.location.href = buildNormalLiveEntryUrl(
            preparationSession,
            "message",
          );
          return;
        }

        const next: Message[] = [
          ...messagesRef.current,
          ...(userMessage ? [userMessage] : []),
          { role: "assistant", content: liveIntentResult.assistantContent },
        ];

        setMessages(next);
        messagesRef.current = next;

        if (liveIntentResult.clearPromptContext) {
          setActivePromptContext(null);
          setActivePromptLabel(null);
        }

        setInput("");
        setIsThinking(false);
        return;
      }

      const liveRuntimePrefix = buildLiveRuntimeContext({
        liveMode,
        runtimeSupport: liveRuntimeSupport || null,
        setup: liveRuntimeSetup || null,
        steeringLabels: getLiveRuntimeSteeringLabels(liveRuntimeSupport?.room),
      });

      const updatedMessages = [
        ...messagesRef.current,
        ...(!liveMode && providerSystemContext
          ? [{ role: "system", content: providerSystemContext } as Message]
          : []),
        ...(liveRuntimePrefix
          ? [
              {
                role: "system",
                content: liveRuntimePrefix,
                source: "system_override",
              } as Message,
            ]
          : []),
        ...(userMessage ? [userMessage] : []),
      ];

      if (!liveMode) {
        const nextSuggestedPrompts = getSuggestedPromptsFromMessages(
          updatedMessages,
          text,
        );

        setSuggestedPrompts((prev) => {
          const incoming = nextSuggestedPrompts || [];

          // MERGE EXISTING + NEW
          let merged = [...prev, ...incoming];

          // REMOVE DUPLICATES (by label)
          const seen = new Set();
          merged = merged.filter((p) => {
            if (seen.has(p.label)) return false;
            seen.add(p.label);
            return true;
          });

          // SIMPLE RELEVANCE SORT (newer first)
          merged = merged.reverse();

          // LIMIT TO 10
          const curated = merged.slice(0, tierSuggestedLimit);

          setSuggestedSignal(Date.now());
          setRerouteSignal(Date.now());

          return curated;
        });
      }
      setMessages(updatedMessages);

      messagesRef.current = updatedMessages;
      setInput("");
      setPendingImage(null);
      setInterimTranscript("");
      setVoiceError("");
      setIsThinking(true);
      startBridgeSpeech();

      try {
        const liveFastPath = liveMode
          ? tryLiveFastPath({
              input: text,
              room: liveRuntimeSupport?.room || liveRuntimeSetup?.room || null,
              chair: liveRuntimeSupport?.chair || null,
              objective:
                liveRuntimeSupport?.objective ||
                liveRuntimeSetup?.objective ||
                null,
              recentAssistant:
                messagesRef.current
                  .slice()
                  .reverse()
                  .find((message) => message.role === "assistant")?.content ||
                null,
            })
          : { handled: false as const };

        if (liveFastPath.handled) {
          stopBridgeSpeech();

          const assistantMessage: Message = {
            role: "assistant",
            content: liveFastPath.content,
            constrained: false,
            servingTags: liveFastPath.serving,
            source: "system_override",
          };

          assistantRevealedRef.current = false;

          setMessages((prev) => {
            const next = [...prev, assistantMessage];
            messagesRef.current = next;
            return next;
          });

          setPendingAssistantMessage(null);

          if (activePromptContext) {
            setContextTurnCount((prev) => prev + 1);
          }

          speakText(assistantMessage.content);
          return;
        }

        if (
          typeof window !== "undefined" &&
          window.localStorage.getItem("george_live_debug") === "1"
        ) {
          console.info("[GEORGE CHAT REQUEST]", {
            liveMode,
            text,
          });
        }

        const activeOperationalSession = getActiveSessionForMode(
          liveMode ? "live" : "normal",
        );

        const operationalMemoryContext = {
          roomType: liveMode
            ? liveRuntimeSupport?.room || liveRuntimeSetup?.room || "LIVE"
            : "NORMAL",
          objectiveType:
            liveRuntimeSetup?.objective ||
            activeOperationalSession?.userGoal ||
            activeOperationalSession?.metadata?.desiredOutcome ||
            activePromptContext ||
            undefined,
          observedSignalTypes: [],
        };

        const preparationContext = options?.preparationContext
          ? {
              session: options.preparationContext,
              activeNormalSessionId:
                activeOperationalSession?.mode === "normal"
                  ? activeOperationalSession.id
                  : null,
              linkedPreparationSessionId:
                activeOperationalSession?.mode === "normal"
                  ? activeOperationalSession.metadata?.preparationSessionId || null
                  : null,
              evidenceSufficiency:
                options.preparationEvidenceSufficiency || "sufficient",
              signalAcquisitionAllowed:
                options.signalAcquisitionAllowed !== false,
            }
          : null;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            mode: liveMode ? "conversation" : "normal",
            voiceMode: liveMode ? voiceOn : false,
            liveRuntimeContext: liveRuntimePrefix || null,
            isFirstSession: updatedMessages.length <= 2,
            promptContext: liveMode
              ? activePromptContext || "manual_live"
              : activePromptContext,
            promptLabel: activePromptLabel,
            contextTurnCount,
            tier: currentTier,
            language,
            operationalMemoryContext,
            preparationContext,
            requestPurpose: options?.requestPurpose,
          }),
        });

        if (
          typeof window !== "undefined" &&
          window.localStorage.getItem("george_live_debug") === "1"
        ) {
          console.info("[GEORGE CHAT RESPONSE]", {
            status: res.status,
          });
        }

        const data = await res.json().catch(() => null);

        if (
          typeof window !== "undefined" &&
          window.localStorage.getItem("george_live_debug") === "1"
        ) {
          if (
            typeof window !== "undefined" &&
            window.localStorage.getItem("george_live_debug") === "1"
          ) {
            console.info("[GEORGE CHAT DATA]", data);
          }
        }

        if (!res.ok) {
          console.error("/api/chat failed", { status: res.status, data });
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        setOperationalResourceMonitor(data?.operationalResourceMonitor || null);

        const runtimeAuthoritySnapshot = data?.runtimeAuthoritySnapshot
          ? (data.runtimeAuthoritySnapshot as GeorgeRuntimeAuthoritySnapshot)
          : null;

        if (runtimeAuthoritySnapshot) {
          setCanonicalRuntimeAuthority(
            runtimeAuthoritySnapshot,
          );
        }

        const operationalJudgmentResult =
          data?.operationalJudgmentResult as
            | NormalLiveOperationalJudgmentResult
            | null;

        if (
          options?.requestPurpose ===
          NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST
        ) {
          setPendingAssistantMessage(null);
          stopBridgeSpeech();

          if (
            !runtimeAuthoritySnapshot ||
            operationalJudgmentResult?.request !==
              NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST ||
            operationalJudgmentResult.source !== "operational_judgment"
          ) {
            return null;
          }

          return {
            runtimeAuthoritySnapshot,
            operationalJudgmentResult,
          };
        }

        let finalContent = String(data.message || "");

        if (typeof finalContent === "string" && liveMode && voiceOn) {
          finalContent = governLiveResponse(finalContent, {
            audio: voiceOn,
            userText: text,
          });
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: finalContent,
          constrained: false,
        };
        assistantRevealedRef.current = false;

        // IMMEDIATE RENDER FIX
        setMessages((prev) => {
          const next = [...prev, assistantMessage];
          messagesRef.current = next;
          return next;
        });

        const newPrompts = getPostResponseSuggestedPrompts({
          userInput: text,
          assistantResponse: assistantMessage.content,
          messages: messagesRef.current,
          tier: currentTier,
        });
        setSuggestedPrompts((prev) => {
          let merged = [...prev, ...newPrompts];

          const seen = new Set<string>();
          merged = merged.filter((p) => {
            if (seen.has(p.label)) return false;
            seen.add(p.label);
            return true;
          });

          const curated = merged.reverse().slice(0, tierSuggestedLimit);
          return curated;
        });
        setSuggestedSignal(Date.now());
        setRerouteSignal(Date.now());

        const reroute = getReroutePrompt({
          userInput: text,
          assistantResponse: assistantMessage.content,
          messages: messagesRef.current,
        });
        setReroutePrompt(reroute);
        if (reroute) {
          setRerouteSignal(Date.now());
        }

        setPendingAssistantMessage(null);

        if (activePromptContext) {
          setContextTurnCount((prev) => prev + 1);
        }

        stopBridgeSpeech();
        speakText(assistantMessage.content);
      } catch (err) {
        console.error("handleSend failed", err);
        stopBridgeSpeech();
        setVoiceError(err instanceof Error ? err.message : "Response failed.");
      } finally {
        setIsThinking(false);

        if (!liveMode && voiceOn) {
          setTimeout(() => {
            startListening();
          }, 700);
        }
      }
    },
    [
      input,
      isThinking,
      speakText,
      stopListening,
      startListening,
      pendingImage,
      activePromptContext,
    ],
  );

  normalOperationalJudgmentRequestRef.current = async (
    preparationSession,
    options,
  ) => {
    const reasoningAnchor =
      "Apply the Normal LIVE Operational Judgment request to the current validated evidence.";

    const result = await handleSend(reasoningAnchor, {
      hidden: true,
      source: "user_input",
      preparationContext: preparationSession,
      preparationEvidenceSufficiency: "unresolved",
      signalAcquisitionAllowed:
        options?.signalAcquisitionAllowed !== false,
      requestPurpose: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
    });

    if (
      !result ||
      typeof result !== "object" ||
      !("runtimeAuthoritySnapshot" in result) ||
      !("operationalJudgmentResult" in result)
    ) {
      return null;
    }

    return result as NormalPreparationJudgmentResult;
  };

  const handleLiveFinalTranscript = useCallback(
    (text: string) => {
      const clean = String(text || "").trim();
      if (!clean) return;

      const execution = resolveLiveFinalTranscriptExecution(clean);

      if (!execution) return;

      console.info("[GEORGE LIVE ACTION]", {
        transcript: clean,
        nextFinalTranscript: execution.nextFinalTranscript,
        authority: null,
      });

      if (execution.routing.shouldSuppressLegacy) {
        console.info("[GEORGE LIVE HUB ROUTE]", {
          route: "hub_only",
          deliveryStyle: liveDeliveryStyle,
          transcript: clean,
          suppressedLegacyAction: execution.routing.suppressedLegacyActionType,
          routing: execution.routing,
        });
        return;
      }

      const application = applyLiveFinalTranscriptExecution(execution);

      if (application.shouldLogIgnored) {
        if (
          typeof window !== "undefined" &&
          window.localStorage.getItem("george_live_debug") === "1"
        ) {
          console.warn("[GEORGE LIVE ACTION IGNORED]", {
            transcript: clean,
            reason: application.debugReason,
            verdict: application.debugVerdict,
            action: application.debugAction,
          });
        }
        return;
      }

      if (application.shouldStartBuyTime) {
        console.info("[GEORGE LIVE LOCAL]", "buy_time");

        const buyTimeUntil = Date.now() + application.buyTimeDurationMs;
        liveBuyTimeUntilRef.current = buyTimeUntil;

        window.setTimeout(() => {
          if (liveBuyTimeUntilRef.current === buyTimeUntil) {
            console.info("[GEORGE LIVE LOCAL]", "buy_time_expired");
          }
        }, application.buyTimeDurationMs);

        return;
      }

      if (application.shouldSpeak) {
        console.info("[GEORGE LIVE LOCAL]", "speak", {
          text: application.speechText,
        });
        void speakText(application.speechText);
        return;
      }

      if (application.shouldSend) {
        console.info("[GEORGE LIVE SEND]", { text: application.sendText });
        void handleSend(application.sendText, { source: "live_transcript" });
      }
    },
    [
      handleSend,
      liveDeliveryStyle,
      resolveLiveFinalTranscriptExecution,
      speakText,
    ],
  );

  useEffect(() => {
    liveTranscriptSubmitRef.current = handleLiveFinalTranscript;
  }, [handleLiveFinalTranscript]);

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const atTop = textarea.scrollTop <= 0;
      const atBottom =
        textarea.scrollTop + textarea.clientHeight >= textarea.scrollHeight - 4;

      if (
        (event.key === "ArrowUp" && atTop) ||
        (event.key === "ArrowDown" && atBottom)
      ) {
        event.preventDefault();

        scrollHostRef.current?.scrollBy({
          top: event.key === "ArrowDown" ? 120 : -120,
          behavior: "smooth",
        });

        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (isThinking) return;

      if (liveEntryReadyForOptionalSignal) {
        captureLiveEntryOptionalSignal();
        return;
      }

      if (!input.trim()) return;
      handleSend();
    }
  };

  useEffect(() => {
    const supported = Boolean(SpeechRecognitionCtor) && !isIOS;
    setVoiceSupported(supported);

    if (!supported) {
      setVoiceError(
        isIOS
          ? "Enhanced voice support is still expanding."
          : "Voice input is not available in this browser session.",
      );
      return;
    }

    const recognition = new (
      SpeechRecognitionCtor as NonNullable<typeof SpeechRecognitionCtor>
    )();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceError("");
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = "";
      let liveTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          liveTranscript += transcript;
        }
      }

      setInterimTranscript(liveTranscript);
      if (liveMode && liveTranscript.trim()) {
        liveLastSignalRef.current = Date.now();
      }
      lastSpeechTsRef.current = Date.now();

      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }

      // Legacy browser-STT LIVE decision engine removed from production path.
      // PRO LIVE / campaign concepts are preserved in docs/architecture/PRO_LIVE_CAMPAIGNS.bak.md.

      if (finalTranscript.trim()) {
        const clean = finalTranscript.trim();
        if (liveMode) {
          liveLastSignalRef.current = Date.now();
        }

        const outcomeSignal = detectLiveOutcomeSignal(clean);

        if (outcomeSignal) {
          recordLiveOutcomeSignal({
            signal: outcomeSignal,
            text: clean,
          });
        }
        setInterimTranscript("");

        if (liveMode) {
          // Browser SpeechRecognition no longer owns LIVE prompt construction or response decisions.
          // Deepgram LIVE Hub owns LIVE transcript interpretation, runtime evidence, and cue delivery.
          return;
        }

        const livePrompt = clean;

        responseTimerRef.current = setTimeout(() => {
          const now = Date.now();
          const delta = now - lastSpeechTsRef.current;

          if (delta < 2500) return;

          const lower = livePrompt.toLowerCase();

          const strongSignal =
            lower.includes("not interested") ||
            lower.includes("too expensive") ||
            lower.includes("i don’t know") ||
            lower.includes("i dont know") ||
            lower.includes("maybe") ||
            lower.includes("what do you think");

          const text = liveTranscript || "";
          const friction = detectLiveFriction(text);
          const score = scoreLiveFriction(text);

          if (!friction) return;

          const interventionNow = Date.now();
          const canIntervene =
            interventionNow - liveInterventionRef.current > 8000;

          if (score < 3) return;

          if (!isSpeaking) {
            void handleSend(livePrompt);
          }
        }, 2600);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorLike) => {
      const message =
        event?.error === "not-allowed"
          ? "Microphone permission was denied."
          : event?.error === "audio-capture"
            ? "No microphone was available."
            : event?.error === "no-speech"
              ? ""
              : "Voice input failed.";

      if (message) {
        setVoiceError(message);
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      // LIVE no longer uses browser SpeechRecognition restart loops.
      // Deepgram runtime owns LIVE listening authority.
      if (!liveMode && voiceOn && !isThinking) {
        setTimeout(() => {
          startListening();
        }, 250);
      }

      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop?.();
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionCtor, handleSend, isIOS]);

  const statusText = voiceError
    ? voiceError
    : isSpeaking
      ? "GEORGE is speaking..."
      : isThinking
        ? "GEORGE is working..."
        : isListening
          ? "GEORGE is listening..."
          : isIOS
            ? "Voice is coming later on iPhone."
            : voiceOn
              ? "Voice is on."
              : "Voice is off.";

  const normalConversationStarted = messages.some((message) => {
    if (message.role !== "user") return false;
    return String(message.content || "").trim().length > 0;
  });

  const hasVisibleThread = normalConversationStarted;

  useEffect(() => {
    if (hasSentFirstNormalMessage) return;

    const timer = window.setInterval(() => {
      setPreparationTaglineIndex(
        (index) => (index + 1) % GEORGE_PREPARATION_TAGLINES.length,
      );
    }, 180000);

    return () => window.clearInterval(timer);
  }, [hasSentFirstNormalMessage]);

  useEffect(() => {
    if (hasSentFirstNormalMessage) {
      setTypedPreparationTagline("");
      return;
    }

    setTypedPreparationTagline(
      `Start here because ${GEORGE_PREPARATION_TAGLINES[preparationTaglineIndex]}`,
    );
  }, [hasSentFirstNormalMessage, preparationTaglineIndex]);

  const hasDraftInput = input.trim().length > 0;
  const isPreLiveSignalAcquisition =
    activePromptContext === "pre_live_signal_acquisition";
  const showConversation =
    hasDraftInput || liveMode || normalConversationStarted;

  const showMobileHero =
    !(forceLive || liveMode) &&
    !normalConversationStarted &&
    !showPreLiveSignalSurface;

  const showGeorgeHeroTitle = true;
  const showGeorgeSupportCopy = !normalConversationStarted;
  const hasUserMessageForSurface = normalConversationStarted;

  const shouldKeepHeroVisible = !normalConversationStarted;

  const showIdleGeorgeSurface =
    showMobileHero &&
    !(forceLive || liveMode) &&
    !hasDraftInput &&
    !pendingImage &&
    (shouldKeepHeroVisible || isPreLiveSignalAcquisition);

  const showDesktopOperationalSurface = !hasUserMessageForSurface;

  const isRuntimeTransitioning = hasVisibleThread || liveMode;

  useEffect(() => {
    if (!showMobileHero || forceLive || liveMode) return;

    requestAnimationFrame(() => {
      scrollHostRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [showMobileHero, liveMode]);

  const normalPreparationCheckpoint = normalPreparationSession?.workflow.current;
  const normalPreparationObjective = normalizeExplicitNormalPreparationObjective(
    normalPreparationSession?.knowledge.objective,
  );
  const normalPreparationQuestion =
    normalPreparationSession?.briefing.currentQuestion || null;
  const normalBriefingCheckpoint =
    normalPreparationCheckpoint?.surface === "briefing"
      ? normalPreparationCheckpoint
      : null;
  const isNormalPreparationBriefingActive = Boolean(
    showPreLiveSignalSurface &&
      normalPreparationSession?.provenance.entrySource === "normal" &&
      normalBriefingCheckpoint,
  );
  const normalBriefingActionState =
    isNormalPreparationBriefingActive
      ? normalBriefingCheckpoint?.phase === "questions" &&
        normalPreparationQuestion
        ? "question"
        : normalBriefingCheckpoint?.phase === "decision"
          ? "decision"
          : null
      : null;
  const normalPreparationQuestionIsOptional = Boolean(
    normalPreparationQuestion &&
      !/^(desiredoutcome|intent|conversationintent|objective)$/i.test(
        normalPreparationQuestion.key,
      ),
  );
  const hasClosedNormalBriefing = Boolean(
    !showPreLiveSignalSurface &&
      normalPreparationSession?.provenance.entrySource === "normal" &&
      normalBriefingCheckpoint,
  );

  const submitPreLiveSignalAnswer = (
    answerOverride?: string,
    interactionStatusOverride?: "answered" | "skipped" | "unknown",
  ) => {
    const answer = String(answerOverride ?? input).trim();

    if (!showPreLiveSignalSurface || !answer || !currentPreLiveQuestion) {
      return false;
    }

    const preparationSession = loadPreparationSession();
    const activeNormalSession = getActiveSessionForMode("normal");

    if (
      preparationSession?.provenance.entrySource !== "normal" ||
      !activeNormalSession?.id ||
      preparationSession.relations.normalSessionId !== activeNormalSession.id ||
      preparationSession.briefing.currentQuestion?.key !==
        currentPreLiveQuestion.key
    ) {
      return false;
    }

    const normalizedAnswer = answer.toLowerCase().replace(/[.!?]+$/g, "");
    const interactionStatus =
      interactionStatusOverride ||
      (normalizedAnswer === "skip" ||
      normalizedAnswer === "skipped" ||
      normalizedAnswer === "pass"
        ? ("skipped" as const)
        : normalizedAnswer === "i don't know" ||
            normalizedAnswer === "i dont know" ||
            normalizedAnswer === "unknown"
          ? ("unknown" as const)
          : ("answered" as const));
    const nextSignals = {
      ...preparationSession.knowledge.additionalSignals,
      ...(interactionStatus === "answered"
        ? { [currentPreLiveQuestion.key]: answer }
        : {}),
    };
    const nextObjective =
      interactionStatus === "answered" &&
      currentPreLiveQuestion.key === "desiredOutcome"
        ? normalizeExplicitNormalPreparationObjective(answer)
        : preparationSession.knowledge.objective;
    const priorInteractions = normalizePreparationInteractions([
      ...preparationSession.briefing.priorInteractions,
      {
        key: currentPreLiveQuestion.key,
        question: currentPreLiveQuestion.question,
        answer: interactionStatus === "answered" ? answer : "",
        status: interactionStatus,
        evidenceNeed: currentPreLiveQuestion.evidenceNeed,
      },
    ]);

    const preparationAnswerMessage: Message = {
      role: "user",
      content: answer,
      source: "user_input",
      presentationMode: "live_preparation",
    };

    const latestVisibleMessage =
      messagesRef.current[messagesRef.current.length - 1];
    const answerAlreadyVisible =
      latestVisibleMessage?.role === "user" &&
      String(latestVisibleMessage.content || "").trim() === answer;
    const messagesWithPreparationAnswer = answerAlreadyVisible
      ? messagesRef.current
      : [...messagesRef.current, preparationAnswerMessage];

    messagesRef.current = messagesWithPreparationAnswer;
    setMessages(messagesWithPreparationAnswer);

    setPreLiveSignals(nextSignals);

    try {
      saveLivePreparationSignals(nextSignals);
      if (interactionStatus === "answered") {
        window.localStorage.setItem(
          `GEORGE_PRE_LIVE_${currentPreLiveQuestion.key.toUpperCase()}`,
          answer,
        );
      }
    } catch {}

    setInput("");
    const nextPreparationSession = beginNormalLivePreparation({
      signals: nextSignals,
      explicitObjective: nextObjective,
      briefing: {
        priorInteractions,
        currentQuestion: undefined,
      },
      checkpoint: {
        surface: "briefing",
        phase: "questions",
      },
    });

    setCurrentPreLiveQuestion(null);
    setPreLiveSignalComplete(false);
    setShowPreLiveSignalSurface(true);

    if (nextPreparationSession) {
      setActivePromptContext("pre_live_signal_acquisition");
      setActivePromptLabel("LIVE");
      void requestNormalAdaptiveQuestion(nextPreparationSession);
      return true;
    }

    setActivePromptContext("pre_live_signal_acquisition");
    setActivePromptLabel("LIVE");

    return true;
  };

  const normalPreparationActions: Array<{
    label: string;
    action: () => void;
    emphasis?: "primary" | "secondary";
  }> = [];

  if (normalBriefingActionState === "question") {
    if (normalPreparationQuestionIsOptional) {
      normalPreparationActions.push({
        label: "SKIP",
        action: () => {
          submitPreLiveSignalAnswer("Skip", "skipped");
        },
      });
    }

  }

  const normalDecisionSupportsLive =
    normalOperationalDisposition === "execution_ready" ||
    normalOperationalDisposition === "execution_opportunity";

  if (normalBriefingActionState === "decision") {
    if (normalDecisionSupportsLive && normalPreparationObjective) {
      normalPreparationActions.push(
        {
          label: "NEXT QUESTION",
          action: continueNormalAdaptiveBriefing,
          emphasis: "secondary",
        },
        {
          label: "START LIVE",
          action: openLiveEntry,
          emphasis: "primary",
        },
      );
    }

    normalPreparationActions.push(
      {
        label: "CLOSE",
        action: closeNormalPreparationBriefing,
      },
    );
  }

  const enterLiveConversation = () => {
    if (liveMode) return;

    startLiveSignalAcquisition();
    setShowLiveQuickMenu(false);
  };

  const startNewLiveConversation = () => {
    try {
      if (messagesRef.current.length > 2) {
        const parentSessionId =
          preLiveSessionIdRef.current || getActiveSessionIdForMode("normal");
        const preparationSession = loadPreparationSession();
        saveSessionToV2({
          mode: "live",
          title: getActiveLiveDesiredOutcomeTitle("LIVE Conversation"),
          messages: messagesRef.current,
          summary: "LIVE Conversation checkpoint before new LIVE conversation.",
          userGoal: "In progress",
          lastKnownState: "User started a new LIVE conversation.",
          suggestedRestart: "Resume this LIVE Conversation naturally.",
          metadata: {
            normalSessionId: parentSessionId,
            preparationSessionId: preparationSession?.preparationSessionId,
            surface: "live",
          },
        });
      }

      window.localStorage.setItem("george_start_new_live", "1");
      window.localStorage.removeItem("george_active_live_session_id");
      window.localStorage.removeItem("george_active_campaign_session_id");
      window.localStorage.removeItem("george_active_campaign");
      window.localStorage.removeItem("george_active_context");
      window.localStorage.removeItem("george_active_label");
    } catch {}

    setShowLiveQuickMenu(false);
    setActiveCampaignId(null);
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        active: false,
      })),
    );
    setConversationMode("manual_live");
    setActivePromptContext("manual_live");
    setActivePromptLabel("Conversation");
    setMessages([]);
    messagesRef.current = [];
    liveSessionWriteReadyRef.current = false;
  };

  useEffect(() => {
    if (showConversation) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showConversation]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: GEORGE_LIVE_VISUAL_COMPOSER_STYLE }}
      />
      <style>{`${georgeAmbientPulseStyles}

@keyframes georgeLiveTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

@keyframes georgeLiveBarShimmer {\n  0% { transform: translateX(0); opacity: 0; }\n  18% { opacity: 1; }\n  45% { transform: translateX(380%); opacity: 0; }\n  100% { transform: translateX(380%); opacity: 0; }\n}\n\n@keyframes georgeLiveScenarioStack {
  0%, 27% { transform: translateY(0); opacity: 1; }
  31%, 33% { transform: translateY(-34%); opacity: 0.72; }
  36%, 61% { transform: translateY(-34%); opacity: 1; }
  65%, 67% { transform: translateY(-68%); opacity: 0.72; }
  70%, 95% { transform: translateY(-68%); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes georgeComposerCursorBlink {
  0%, 46% { opacity: 0.72; }
  47%, 100% { opacity: 0; }
}

@keyframes georgeBxBreathe {
  0%, 82%, 100% { transform: translateX(0) scale(1); filter: brightness(1); }
  88% { transform: translateX(2px) scale(1.035); filter: brightness(1.08); }
  94% { transform: translateX(0) scale(1); filter: brightness(1); }
}
`}</style>

      <main
        className={`app-shell george-mobile-root pb-[120px] min-h-[100dvh] w-full overflow-x-hidden bg-[#000000] text-neutral-100 ${isAndroid ? "android-runtime android-sharp" : ""}`}
      >
        <LiveHubShadowBridge
          active={Boolean(forceLive || liveMode) && !showLiveEntrySequence}
          context={{
            room: String(
              liveRuntimeSupport?.room ||
                liveRuntimeSupport?.purview?.line ||
                liveRuntimeSupport?.purview ||
                "live",
            ),
            chair: String(
              liveRuntimeSupport?.chair ||
                liveRuntimeSupport?.userPosition ||
                "",
            ),
            objective: String(
              liveRuntimeSupport?.objective ||
                activeCampaign?.desiredOutcome ||
                activeCampaign?.currentGoal ||
                "",
            ),
            knownContext: String(
              liveRuntimeSupport?.knownContext ||
                liveRuntimeSupport?.purview?.body ||
                liveRuntimeSupport?.purview?.line ||
                "",
            ),
            briefingKnowledge: String(
              liveRuntimeSupport?.briefingKnowledge || "",
            ),
            secondaryOutcome: String(
              liveRuntimeSupport?.secondaryOutcome ||
                liveRuntimeSupport?.secondaryObjective ||
                "",
            ),
            secondaryObjective: String(
              liveRuntimeSupport?.secondaryObjective || "",
            ),
            intangibleObjective: String(
              liveRuntimeSupport?.intangibleObjective || "",
            ),
            userPosition: String(liveRuntimeSupport?.userPosition || ""),
            deliveryStyle: liveDeliveryStyle,
            runtimeSnapshot: canonicalRuntimeAuthority || undefined,
          }}
          transcript={liveHubShadowTranscript}
          transcriptFinal={true}
        />

        <LiveHubVisualCueBridge
          active={Boolean(forceLive || liveMode) && !showLiveEntrySequence}
          context={{
            room: String(
              liveRuntimeSupport?.room ||
                liveRuntimeSupport?.purview?.line ||
                liveRuntimeSupport?.purview ||
                "live",
            ),
            chair: String(
              liveRuntimeSupport?.chair ||
                liveRuntimeSupport?.userPosition ||
                "",
            ),
            objective: String(
              liveRuntimeSupport?.objective ||
                activeCampaign?.desiredOutcome ||
                activeCampaign?.currentGoal ||
                "",
            ),
            knownContext: String(
              liveRuntimeSupport?.knownContext ||
                liveRuntimeSupport?.purview?.body ||
                liveRuntimeSupport?.purview?.line ||
                "",
            ),
            briefingKnowledge: String(
              liveRuntimeSupport?.briefingKnowledge || "",
            ),
            secondaryOutcome: String(
              liveRuntimeSupport?.secondaryOutcome ||
                liveRuntimeSupport?.secondaryObjective ||
                "",
            ),
            secondaryObjective: String(
              liveRuntimeSupport?.secondaryObjective || "",
            ),
            intangibleObjective: String(
              liveRuntimeSupport?.intangibleObjective || "",
            ),
            userPosition: String(liveRuntimeSupport?.userPosition || ""),
            deliveryStyle: liveDeliveryStyle,
            runtimeSnapshot: canonicalRuntimeAuthority || undefined,
          }}
          voiceEnabled={voiceOn}
          receiverProfile={liveReceiverProfile}
          onSpeakCue={(cue, turnId) =>
            speakText(cue, { source: "hub", turnId })
          }
        />
        <div
          id="george-app-content"
          className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden"
        >
          {showSidebar && (
            <button
              type="button"
              aria-label="Close GEORGE sidebar"
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-[220] cursor-default bg-black george-motion-fade-soft/[0.18] backdrop-blur-[7px] transition-[opacity,background-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] xl:hidden"
            />
          )}

          <Sidebar
            currentTier={currentTier}
            liveMode={liveMode}
            onOpenLiveGate={() => {
              setShowSidebar(false);
              openLiveEntry();
            }}
            onOpenLogin={() => {
              setShowSidebar(false);
              setLoginEmailInput("");
              setLoginLinkSent(false);
              setShowUpgradeModal(true);
            }}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            voiceActive={voiceOn}
            activePromptLabel={activePromptLabel}
            activePromptContext={activePromptContext}
            onToggleScripture={() => {
              const turningOn = activePromptContext !== "bible_decision_lens";
              setActivePromptLabel(turningOn ? "Be as Christ" : null);
              setActivePromptContext(turningOn ? "bible_decision_lens" : null);
              setContextTurnCount(0);
              setToastMessage(
                turningOn ? "Be as Christ on" : "Be as Christ off",
              );
              setShowToast(true);
            }}
            onNewSession={() => {
              // Route boundary: /george/live must not render normal GEORGE in place.
              // Leaving LIVE must go through the save/stay/exit flow first.
              if (forceLive || liveMode) {
                requestExitLiveMode();
                return;
              }

              try {
                if (messagesRef.current.length > 1) {
                  saveSessionToV2({
                    mode: "normal",
                    title: deriveNormalSessionTitleFromMessages(
                      messagesRef.current,
                      activePromptLabel || "GEORGE Session",
                    ),
                    messages: messagesRef.current,
                    summary: "GEORGE session checkpoint.",
                    userGoal: activePromptLabel || "Not set",
                    lastKnownState:
                      "Saved before starting a new GEORGE session.",
                    suggestedRestart:
                      "Resume this GEORGE session and continue from the clearest next step.",
                  });
                }
              } catch {}

              createFreshNormalSession(
                [],
                "New Session",
                getSubscriberSessionMetadata() || {},
              );
              clearPreparationSession();
              preLiveSessionIdRef.current = null;

              setShowPreLiveSignalSurface(false);
              setNormalPreparationSession(null);
              setCurrentPreLiveQuestion(null);
              setPreLiveSignals({});
              setPreLiveSignalComplete(false);
              setConversationMode(null);

              try {
                window.localStorage.removeItem("GEORGE_PRE_LIVE_FROM_MESSAGE");
                window.localStorage.removeItem("GEORGE_LIVE_INTENT_STAGE");
                clearLivePreparationPreviewReady();
                window.localStorage.removeItem(
                  "GEORGE_PRE_LIVE_SOURCE_CONTEXT",
                );
                window.localStorage.removeItem(
                  "GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION",
                );
                window.localStorage.removeItem("george_start_new_live");
                window.localStorage.removeItem("george_fresh_live_entry");

                // A new workspace starts a new preparation context.
                clearLivePreparationSignals();
                window.localStorage.removeItem("GEORGE_PRE_LIVE_ROLE");
                window.localStorage.removeItem("GEORGE_PRE_LIVE_ROOM");
                window.localStorage.removeItem("GEORGE_PRE_LIVE_IDENTITY");
                window.localStorage.removeItem(
                  "GEORGE_PRE_LIVE_DESIREDOUTCOME",
                );
                window.localStorage.removeItem(
                  "GEORGE_PRE_LIVE_ACCEPTABLEOUTCOME",
                );
              } catch {}

              setMessages([]);
              messagesRef.current = [];
              setHasSentFirstNormalMessage(false);
              setHomepageHeroFlip({
                front: 0,
                back: 1,
                flipped: false,
                transitionEnabled: true,
              });
              setInput("");
              setInterimTranscript("");
              setVoiceError("");
              setActivePromptLabel(null);
              setActivePromptContext(null);
              setContextTurnCount(0);
              setReroutePrompt(null);
              setRerouteSignal(0);
              setSuggestedPrompts([]);
              setSuggestedSignal(0);
              setShowScrollHint(false);
              userPinnedBottomRef.current = true;

              window.requestAnimationFrame(() => {
                scrollHostRef.current?.scrollTo({ top: 0, behavior: "auto" });
                textareaRef.current?.focus();
              });
            }}
            onPromptSelect={(prompt: PromptSelection) => {
              if (
                prompt.context === "upgrade_intelligent" ||
                prompt.context === "upgrade_topup"
              ) {
                window.open("/top-up", "_blank");
                return;
              }

              setActivePromptLabel(prompt.label);
              setActivePromptContext(prompt.context);
              setContextTurnCount(0);
              setVoiceError("");

              if (prompt.context === "bible_decision_lens") {
                setShowSidebar(false);
                setToastMessage("Be as Christ on");
                setShowToast(true);
                textareaRef.current?.focus();
                return;
              }

              if (prompt.context === "strategy_recalculation") {
                setRerouteSignal(0);
              }

              const isPreTrainingCourse =
                prompt.context === "training_drivers_license" ||
                prompt.context === "training_cdl" ||
                prompt.context === "training_ged" ||
                prompt.context === "training_cna" ||
                prompt.context === "training_interview";

              if (isPreTrainingCourse) {
                const coursePrompt = prompt.text;
                const assistantText = buildTrainingIntakeOverride(coursePrompt);

                setShowSidebar(false);
                setInput("");
                setVoiceError("");

                const nextMessages: Message[] = [
                  ...messagesRef.current,
                  {
                    role: "user",
                    content: coursePrompt,
                    source: "sidebar_prompt",
                  },
                  {
                    role: "assistant",
                    content:
                      assistantText || "Good. We are building a passing path.",
                    constrained: false,
                  },
                ];

                setMessages(nextMessages);
                messagesRef.current = nextMessages;
                setActivePromptLabel(prompt.label);
                setActivePromptContext(prompt.context);
                setContextTurnCount(1);
                return;
              }

              if (prompt.context === "courses_expand") {
                setShowSidebar(false);
                setInput("");
                setVoiceError("");

                const nextMessages: Message[] = [
                  ...messagesRef.current,
                  {
                    role: "user",
                    content: prompt.text,
                    source: "sidebar_prompt",
                  },
                  {
                    role: "assistant",
                    content: resolveCoursesExpandResponse(),
                    constrained: false,
                  },
                ];

                setMessages(nextMessages);
                messagesRef.current = nextMessages;
                setContextTurnCount(1);
                return;
              }

              setShowSidebar(false);
              void handleSend(prompt.text, { source: "sidebar_prompt" });
            }}
          />

          <div
            className={`flex min-w-0 w-full flex-1 flex-col overflow-visible touch-pan-y transition-opacity duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] ${
              showSidebar ? "pointer-events-none" : ""
            }`}
          >
            <div
              className={`flex min-h-[100dvh] w-full flex-1 flex-col overflow-visible touch-pan-y px-4 pb-0 ${
                showPreLiveSignalSurface
                  ? "pt-[108px] md:pt-[78px]"
                  : "pt-[68px] md:pt-[78px]"
              } md:h-screen md:min-h-0 md:overflow-hidden md:overscroll-none md:px-10 md:pb-0 xl:px-16`}
            >
              <header className="fixed inset-x-0 top-0 z-[170] flex min-h-[60px] justify-center bg-[#000000]/92 px-4 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl transition duration-200">
                <div className="relative flex w-full max-w-6xl items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (!showSidebar) setShowSidebar(true);
                    }}
                    disabled={showSidebar}
                    className={`group inline-flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/[0.045] shadow-[0_14px_44px_rgba(0,0,0,0.34)] ring-1 ring-white/[0.06] backdrop-blur-xl transition-[transform,opacity,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] hover:bg-white/[0.075] hover:shadow-[0_16px_48px_rgba(0,0,0,0.42),0_0_20px_rgba(54,87,168,0.12)] active:scale-[0.96] xl:inline-flex ${
                      showSidebar
                        ? "pointer-events-none opacity-0"
                        : "opacity-100"
                    }`}
                    aria-label="Open GEORGE sidebar"
                    title="Open"
                  >
                    {normalConversationStarted ? (
                      <img
                        src="/logofav.png"
                        alt="Bx"
                        className="h-8 w-8 rounded-[0.8rem] object-contain opacity-95 [animation:georgeBxBreathe_10s_ease-in-out_infinite] group-hover:brightness-110"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="inline-flex h-8 w-8 items-center justify-center font-mono text-[22px] leading-none text-[#D7DBE4]/72 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-white"
                      >
                        ←
                      </span>
                    )}
                  </button>

                  <div className="hidden xl:grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5">
                    <div />

                    <div className="flex justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#D7DBE4]/20">
                          GEORGE
                        </span>
                        {!showMobileHero && !(forceLive || liveMode) && (
                          <div className="hidden xl:flex items-center gap-1.5"></div>
                        )}
                      </div>
                    </div>

                    <div className="hidden justify-end">
                      <button
                        type="button"
                        onClick={handleShareGeorge}
                        className="inline-flex h-5 items-center justify-center px-1 text-[6px] font-medium uppercase tracking-[0.08em] text-[#D7DBE4]/34 transition hover:text-[#D7DBE4]/62"
                        aria-label="Share GEORGE context"
                        title="Share GEORGE context"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-1 xl:hidden">
                    <button
                      type="button"
                      onClick={handleShareGeorge}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] bg-white/[0.025] text-[#D7DBE4]/52 ring-1 ring-white/[0.045] transition-[transform,background-color,color] duration-300 hover:bg-white/[0.055] hover:text-white active:scale-[0.97]"
                      aria-label="Share GEORGE context"
                      title="Share GEORGE context"
                    >
                      <ShareIcon className="h-[17px] w-[17px]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowIdentityMenu((value) => !value)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] bg-white/[0.035] text-[20px] leading-none text-[#D7DBE4]/58 shadow-[0_12px_34px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.05] transition hover:bg-white/[0.065] hover:text-white"
                      aria-label="Identity menu"
                      title="Identity"
                    >
                      ⋮
                    </button>

                    {showIdentityMenu && (
                      <>
                        <button
                          type="button"
                          aria-label="Close account menu"
                          onClick={() => setShowIdentityMenu(false)}
                          className="fixed inset-0 z-[85] cursor-default bg-transparent"
                        />

                        <div className="absolute right-0 top-full george-motion-collapse-down z-[90] mt-3 w-[168px] rounded-[18px] bg-[#07090E]/96 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.055] backdrop-blur-xl">
                          {subscriberEmail ? (
                            <button
                              type="button"
                              onClick={handleIdentitySignOut}
                              className="block w-full rounded-[0.7rem] px-3 py-2 text-left text-[12px] font-medium uppercase tracking-[0.14em] text-[#D7DBE4]/68 transition hover:bg-white/[0.035] hover:text-[#D7DBE4]"
                            >
                              Sign out
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setShowIdentityMenu(false);
                                setLoginEmailInput("");
                                setLoginLinkSent(false);
                                setShowUpgradeModal(true);
                              }}
                              className="block w-full rounded-[0.7rem] px-3 py-2 text-left text-[12px] font-medium uppercase tracking-[0.14em] text-[#D7DBE4]/68 transition hover:bg-white/[0.035] hover:text-[#D7DBE4]"
                            >
                              Access
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {!(forceLive || liveMode) && !showMobileHero && (
                <div className="pointer-events-none fixed inset-x-0 top-[58px] z-[34] h-[58px] bg-gradient-to-b from-[#000000]/95 via-[#000000]/72 to-transparent md:hidden" />
              )}
              {(forceLive || liveMode) && !showLiveEntrySequence && (
                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[54] h-[280px] bg-gradient-to-t from-[#000000] via-[#000000]/100 via-[70%] to-transparent" />
              )}
              {(forceLive || liveMode) && !showLiveEntrySequence && (
                <>
                  <div className="pointer-events-none fixed left-0 right-0 top-[54px] z-[37] h-[340px] bg-gradient-to-b from-[#000000] via-[#000000]/100 via-[82%] to-[#000000]/0" />
                  <div className="pointer-events-none fixed left-0 right-0 top-[96px] z-[160] flex justify-center px-4 pointer-events-none">
                    <div
                      ref={liveStatusStackRef}
                      className="w-full max-w-[430px] md:max-w-[720px] xl:max-w-[860px]"
                    >
                      <LiveRoomStatusPanel
                        isListening={isListening}
                        liveRoomActive={liveRoomActive}
                        voiceOn={voiceOn}
                        isThinking={isThinking}
                        roomLabel={
                          liveRuntimeSupport?.room ||
                          (liveRoomActive ? "LIVE conversation" : "inactive")
                        }
                        chairLabel={liveRuntimeSupport?.chair || "User"}
                        objectiveLabel={
                          liveRuntimeSupport?.objective || "Outcome pending"
                        }
                        steeringLabels={
                          getLiveRuntimeSteeringLabels(
                            liveRuntimeSupport?.room,
                          ).slice(0, 3) as [string, string, string]
                        }
                        receiverProfile={liveReceiverProfile}
                        receiverProfileLabel={activeLiveReceiverProfileLabel}
                        communicationStyle={getActiveLiveCommunicationStyle()}
                        onSupportSelected={(choice) => {
                          const nextStyle =
                            choice === "cue"
                              ? "cue"
                              : choice === "line"
                                ? "line"
                                : choice === "response"
                                  ? "response"
                                  : choice === "presentation"
                                    ? "expandedLine"
                                    : "advice";

                          setLiveDeliveryStyle(nextStyle);
                          window.localStorage.setItem(
                            "GEORGE_LIVE_SUPPORT_STYLE",
                            nextStyle,
                          );
                          window.localStorage.setItem(
                            "GEORGE_LIVE_DELIVERY_STYLE",
                            nextStyle,
                          );
                          window.localStorage.setItem(
                            "GEORGE_LIVE_SUPPORT_POLICY",
                            choice,
                          );

                          try {
                            const activeSetup = JSON.parse(
                              window.localStorage.getItem(
                                "george_live_setup_active",
                              ) || "{}",
                            );

                            window.localStorage.setItem(
                              "george_live_setup_active",
                              JSON.stringify({
                                ...activeSetup,
                                supportStyle: nextStyle,
                                deliveryStyle: nextStyle,
                                supportPolicy: choice,
                              }),
                            );
                          } catch {}

                          setToastMessage(
                            `Support: ${choice === "adaptive" ? "Adaptive" : choice}`,
                          );
                          setShowToast(true);
                        }}
                        onRewordSelected={(choice) => {
                          const nextStyle =
                            choice === "natural"
                              ? "Natural"
                              : choice.charAt(0).toUpperCase() +
                                choice.slice(1);

                          try {
                            const setup = JSON.parse(
                              window.localStorage.getItem(
                                "GEORGE_LIVE_SETUP",
                              ) || "{}",
                            );
                            window.localStorage.setItem(
                              "GEORGE_LIVE_SETUP",
                              JSON.stringify({
                                ...setup,
                                communicationStyle: nextStyle,
                              }),
                            );
                            window.localStorage.setItem(
                              "george_live_communication_style",
                              nextStyle,
                            );
                            window.localStorage.setItem(
                              "GEORGE_LIVE_REWORD_POLICY",
                              choice,
                            );
                          } catch {}

                          const approvedDelivery =
                            getLastGeorgeApprovedLiveDelivery();
                          const rewordRequest =
                            approvedDelivery && choice === "natural"
                              ? buildGeorgeApprovedDeliveryRewordRequest({
                                  delivery: approvedDelivery,
                                  choice,
                                })
                              : null;

                          if (rewordRequest) {
                            void handleSend(rewordRequest);
                          }

                          setToastMessage(
                            rewordRequest
                              ? `Communication: ${nextStyle}. Rewording current support.`
                              : `Communication: ${nextStyle}`,
                          );
                          setShowToast(true);
                        }}
                        onRepeatPressed={() => {
                          const approvedDelivery =
                            replayLastGeorgeApprovedLiveDelivery("repeat");
                          const lastLine =
                            approvedDelivery?.text ||
                            liveLastSpokenUtteranceRef.current.trim();

                          if (!lastLine) {
                            setToastMessage("No previous support to repeat.");
                            setShowToast(true);
                            return false;
                          }

                          if (voiceOn || liveReceiverProfile === "audio_only") {
                            void speakText(lastLine);
                          }

                          setToastMessage("Repeating last line.");
                          setShowToast(true);
                          return true;
                        }}
                        onExitLive={() => {
                          setShowNormalUtilityMenu(null);
                          requestExitLiveMode();
                        }}
                        onRoomToggle={() => {
                          const nextEnabled = !liveGeorgeEnabled;
                          setLiveGeorgeEnabled(nextEnabled);

                          if (!nextEnabled) {
                            stopListening();
                            setInterimTranscript("");
                            setToastMessage("Room quiet");
                          } else {
                            startListening();
                            setToastMessage("Room listening");
                          }

                          setShowToast(true);
                        }}
                        onVoiceToggle={() => {
                          if (currentTier === "smart") {
                            setToastMessage(
                              "Voice replies unlock above Smart.",
                            );
                            setShowToast(true);
                            return;
                          }

                          const nextVoice = !voiceOn;
                          hasUserInteractedRef.current = true;
                          setVoiceOn(nextVoice);
                          setInteractionMode(nextVoice ? "speech" : "text");
                          window.localStorage.setItem(
                            "george_voice",
                            nextVoice ? "on" : "off",
                          );
                          setToastMessage(nextVoice ? "Audio on" : "Audio off");
                          setShowToast(true);
                        }}
                        onPauseLive={() => {
                          if (isListening) {
                            stopListening();
                            setInterimTranscript("");
                            setToastMessage("LIVE paused");
                            setShowToast(true);
                            return;
                          }

                          startListening();
                          setToastMessage("LIVE resumed");
                          setShowToast(true);
                        }}
                        onReceiverPressed={() => {
                          cycleLiveReceiverProfile();
                        }}
                        onCommunicationPressed={() => {
                          setToastMessage(
                            `Communication: ${getActiveLiveCommunicationStyle()}`,
                          );
                          setShowToast(true);
                        }}
                        onConversationPressed={() => {
                          setShowLiveQuickMenu(false);

                          if (liveRoomActive) {
                            setToastMessage(
                              "Conversation record will open after LIVE.",
                            );
                            setShowToast(true);
                            return;
                          }

                          try {
                            const raw = window.localStorage.getItem(
                              "GEORGE_LAST_CONVERSATION_RECORD",
                            );
                            const record = raw
                              ? JSON.parse(raw)
                              : lastConversationRecord;
                            if (record) {
                              setLastConversationRecord(record);
                              setShowConversationRecord(true);
                              return;
                            }
                          } catch {}

                          setToastMessage(
                            "Conversation record is not available yet.",
                          );
                          setShowToast(true);
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              <div
                ref={scrollHostRef}
                tabIndex={0}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const nearBottom =
                    el.scrollHeight - el.scrollTop - el.clientHeight < 120;
                  userPinnedBottomRef.current = nearBottom;
                  setShowScrollHint(!nearBottom);
                }}
                onKeyDown={(e) => {
                  const el = e.currentTarget;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    el.scrollBy({ top: 96, behavior: "smooth" });
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    el.scrollBy({ top: -96, behavior: "smooth" });
                  }
                }}
                style={
                  (forceLive || liveMode) &&
                  !showLiveEntrySequence &&
                  liveStatusStackClearance
                    ? {
                        paddingTop: liveStatusStackClearance,
                        scrollPaddingTop: liveStatusStackClearance,
                      }
                    : undefined
                }
                className={`w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain bg-transparent px-3 md:[-webkit-overflow-scrolling:touch] ${(forceLive || liveMode) && !showLiveEntrySequence ? "pb-[390px] md:pb-[280px]" : showPreLiveSignalSurface ? "pb-[220px] md:pb-[250px]" : "pb-0"} md:px-6 space-y-3 ${
                  (forceLive || liveMode) && !showLiveEntrySequence
                    ? ""
                    : hasVisibleThread && !isPreLiveSignalAcquisition
                      ? "pt-[132px] md:pt-6"
                      : showMobileHero
                        ? "pt-3 md:pt-14"
                        : "pt-10 md:pt-6"
                } ${showNormalUtilityMenu || showLiveQuickMenu || showLiveSessionDetails || showExitPopup || showUpgradeModal || showTierModal || showProLiveComingSoon || showLiveChooser ? "blur-[8px] transition-[filter] duration-200" : "blur-0 transition-[filter] duration-200"}`}
              >
                {showMobileHero &&
                  !(forceLive || liveMode) &&
                  shouldKeepHeroVisible &&
                  !showPreLiveSignalSurface && (
                    <section
                      data-george-normal-hero
                      className="pointer-events-none fixed left-0 right-0 top-[92px] z-[35] mx-auto w-full max-w-[760px] px-8 pt-1 md:bottom-[220px] md:pt-4"
                    >
                      <div className="george-utility-presence">
                        <div className="george-utility-brand">
                          <img
                            src="/logofav.png"
                            alt=""
                            className="h-11 w-11 object-contain opacity-95"
                          />
                          <div className="sr-only">BRANESx</div>
                        </div>

                        <div className="george-utility-instrument">
                          <div className="george-utility-line" />
                          {showGeorgeHeroTitle &&
                            !hasSentFirstNormalMessage &&
                            !showPreLiveSignalSurface && (
                              <div className="george-utility-copy-loop min-h-[170px] pt-8 text-left sm:min-h-[210px] sm:pt-12">
                                <h1 className="mb-8 text-[42px] font-semibold tracking-[-0.06em] text-white sm:text-[64px]">
                                  Ask GEORGE
                                </h1>

                                <div className="[perspective:1600px]">
                                  <div
                                    className={`relative grid w-fit [transform-style:preserve-3d] ${
                                      homepageHeroFlip.transitionEnabled
                                        ? "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,0.72,0.18,1)]"
                                        : ""
                                    }`}
                                    style={{
                                      transform: homepageHeroFlip.flipped
                                        ? "rotateX(180deg)"
                                        : "rotateX(0deg)",
                                    }}
                                  >
                                    <div className="col-start-1 row-start-1 inline-flex w-fit max-w-[calc(100vw-40px)] rounded-[22px] border border-[#3657A8]/55 bg-[#172347] px-6 py-4 text-[26px] font-medium leading-8 tracking-[-0.03em] text-[#F4F8FF] shadow-[0_18px_60px_rgba(12,27,68,0.48)] [backface-visibility:hidden] sm:px-8 sm:py-5 sm:text-[34px]">
                                      {`${homepageHeroSequence[homepageHeroFlip.front]}?`}
                                    </div>

                                    <div className="col-start-1 row-start-1 inline-flex w-fit max-w-[calc(100vw-40px)] rounded-[22px] border border-[#3657A8]/55 bg-[#172347] px-6 py-4 text-[26px] font-medium leading-8 tracking-[-0.03em] text-[#F4F8FF] shadow-[0_18px_60px_rgba(12,27,68,0.48)] [backface-visibility:hidden] [transform:rotateX(180deg)] sm:px-8 sm:py-5 sm:text-[34px]">
                                      {`${homepageHeroSequence[homepageHeroFlip.back]}?`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                        </div>
                      </div>
                    </section>
                  )}

                {!liveMode &&
                  unfinishedTrajectories.length > 0 &&
                  !hasDraftInput && (
                    <div className="pointer-events-auto fixed inset-x-0 top-[96px] z-[62] mx-auto w-full max-w-[430px] px-5 md:hidden">
                      <div className="rounded-[1.15rem] border border-[#AEB6FF]/[0.08] bg-[#07090E]/72 px-3.5 py-3 shadow-[0_18px_54px_rgba(0,0,0,0.34)] ">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#AEB6FF]/70 shadow-[0_0_12px_rgba(174,182,255,0.52)]" />
                            <span className="text-[10px] uppercase tracking-[0.24em] text-[#D7DCFF]/38">
                              Project Tray
                            </span>
                          </div>
                          <span className="text-[10px] text-white/22">
                            confirmed goals
                          </span>
                        </div>

                        <div className="grid gap-1.5">
                          {unfinishedTrajectories.map((item) => (
                            <div
                              key={item.id}
                              className="group rounded-[0.85rem] border border-white/[0.035] bg-[#10131B]/72 px-4 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const session = getSessionsForMode(
                                      "normal",
                                    ).find((s) => s.id === item.id);
                                    if (!session) return;
                                    setActiveSessionIdForMode(
                                      "normal",
                                      item.id,
                                    );
                                    setActiveMode("normal");
                                    window.location.href = "/george";
                                  }}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <div className="truncate text-[12px] font-medium text-white/62">
                                    {item.title}
                                  </div>
                                  <div className="mt-0.5 truncate text-[11px] text-white/30">
                                    {item.summary}
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => dismissTrajectory(item.id)}
                                  className="shrink-0 text-[11px] text-white/24 transition hover:text-white/52"
                                  aria-label="Dismiss unfinished business"
                                  title="Dismiss"
                                >
                                  done
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {bridgeThinking && (
                  <div className="text-sm leading-7 text-[#D7DBE4]/70">
                    GEORGE is working
                  </div>
                )}
                {(forceLive || liveMode
                  ? messages.filter((message) => {
                      const clean = (message.content || "").trim();
                      if (
                        message.role === "assistant" &&
                        clean === greeting.trim()
                      )
                        return false;
                      return true;
                    })
                  : normalConversationStarted
                    ? messages
                    : []
                )
                  .filter((m, index) => {
                    if (m.role === "system") return false;
                    if (
                      !(forceLive || liveMode) &&
                      index ===
                        messages.findIndex(
                          (message) => message.role === "user",
                        ) &&
                      /^are you ready[,]?\s+george[?!.]*$/i.test(
                        String(m.content || "").trim(),
                      )
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((m, i, visibleMessages) => {
                    const latestAssistantIndex = visibleMessages
                      .map((msg) => msg.role)
                      .lastIndexOf("assistant");
                    const firstAssistantIndex = visibleMessages.findIndex(
                      (msg) => msg.role === "assistant",
                    );
                    const isLatestAssistant =
                      m.role === "assistant" && i === latestAssistantIndex;
                    const isLatestVisibleMessage =
                      i === visibleMessages.length - 1;
                    const isWelcomeAssistant =
                      m.role === "assistant" && i === firstAssistantIndex;

                    return (
                      <div
                        key={i}
                        className={`w-full max-w-full min-w-0 space-y-1 flex flex-col md:mx-auto md:max-w-[760px] ${
                          m.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          style={
                            m.role === "assistant" &&
                            !liveMode &&
                            m.presentationMode === "live_preparation"
                              ? {
                                  background:
                                    "linear-gradient(180deg, rgba(24,42,86,0.82), rgba(14,27,58,0.76))",
                                  borderColor: "rgba(69,105,188,0.32)",
                                  boxShadow: "0 12px 34px rgba(4,12,32,0.22)",
                                }
                              : undefined
                          }
                          data-george-message-presentation={
                            m.presentationMode || undefined
                          }
                          className={`relative whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[15.5px] md:text-[15.8px] landscape:text-[18px] ${forceLive || liveMode ? "leading-[1.72]" : "leading-[1.68]"} landscape:leading-8 tracking-[0.002em] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#D7DBE4]/88 ${
                            m.role === "user"
                              ? liveMode
                                ? "ml-auto self-end w-fit max-w-[72%] text-left rounded-[0.6rem] border-0 bg-[#F7F8FA] px-2.5 py-1.5 text-[#171717] shadow-[0_6px_16px_rgba(3,8,14,0.14)]"
                                : "message-user ml-auto self-end max-w-[min(82%,34rem)] text-left rounded-[1.05rem] border-0 bg-[#F7F8FA] px-3.5 py-2.5 text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
                              : liveMode
                                ? "w-fit max-w-[82%] text-left rounded-[0.6rem] border border-[#8FB6C9]/[0.045] bg-[linear-gradient(180deg,rgba(10,18,28,0.42),rgba(6,10,16,0.22))] px-3 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                                : m.presentationMode === "live_preparation"
                                  ? "w-fit max-w-[min(92%,42rem)] self-start rounded-[0.95rem] border px-4 py-3 text-left"
                                  : "message-assistant max-w-full text-left px-1 py-2"
                          }`}
                        >
                          {m.role === "assistant" ? (
                            renderAssistantContent(
                              typedMessageIndex === i
                                ? typedMessageContent || m.content
                                : m.content,
                              liveMode,
                            )
                          ) : (
                            <>
                              {m.imageDataUrl && (
                                <img
                                  src={m.imageDataUrl}
                                  alt="Uploaded image"
                                  className="mb-2 max-h-40 w-full rounded-[1rem] max-w-full border border-white/[0.05] object-cover"
                                />
                              )}
                              <span className="block max-w-full break-words [overflow-wrap:anywhere] text-[#171717] opacity-100">
                                {m.content}
                              </span>
                            </>
                          )}
                        </div>


                        {m.role === "user" && !liveMode && (
                          <div className="mt-2 flex items-center gap-1.5 pr-1 text-[#D7DBE4]/72">
                            <button
                              type="button"
                              onClick={() => {
                                handleFeedback(i, "up");
                                setToastMessage("Saved");
                                setShowToast(true);
                              }}
                              className={`relative flex items-center justify-center transition duration-150 ${
                                feedback[i] === "up"
                                  ? "text-[#D7DBE4]/82"
                                  : "text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80"
                              }`}
                              aria-label="Thumbs up"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-[17px] w-[17px]"
                                fill={
                                  feedback[i] === "up" ? "currentColor" : "none"
                                }
                                stroke="currentColor"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M14 10V5.8c0-1 .3-2 .9-2.8L16 1.5l2 1.9c.7.7 1 1.6 1 2.6v3h1.5c1.1 0 1.9 1 1.7 2.1l-1.1 6.4A2 2 0 0 1 19.1 19H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h6Z" />
                                <path d="M6 10H3v9h3" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleFeedback(i, "down");
                                setToastMessage("Saved");
                                setShowToast(true);
                              }}
                              className={`relative flex items-center justify-center transition duration-150 ${
                                feedback[i] === "down"
                                  ? "text-red-100/82"
                                  : "text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80"
                              }`}
                              aria-label="Thumbs down"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-[17px] w-[17px]"
                                fill={
                                  feedback[i] === "down"
                                    ? "currentColor"
                                    : "none"
                                }
                                stroke="currentColor"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M10 14v4.2c0 1-.3 2-.9 2.8L8 22.5l-2-1.9c-.7-.7-1-1.6-1-2.6v-3H3.5c-1.1 0-1.9-1-1.7-2.1l1.1-6.4A2 2 0 0 1 4.9 5H16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6Z" />
                                <path d="M18 14h3V5h-3" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {m.role === "assistant" && (
                          <div className="relative space-y-1.5">
                            {isLatestAssistant && liveMode && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#D7DBE4]/50">
                                <div className="relative bx-command-shimmer">
                                  {tonePopupIndex === i && (
                                    <div
                                      className={`absolute left-0 z-[80] w-48 rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 text-[11px] text-[#D7DBE4]/66 shadow-[0_22px_70px_rgba(0,0,0,0.48)]  transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                        tonePopupUpward
                                          ? "bottom-[34px]"
                                          : "top-[30px]"
                                      }`}
                                    >
                                      <div className="border-b border-white/[0.05] px-3 py-2 text-[10px] tracking-[0.16em] text-[#D7DBE4]/36">
                                        STYLE
                                      </div>

                                      <div className="p-1.5">
                                        {(
                                          [
                                            "assertive",
                                            "respectful",
                                            "concise",
                                            "direct",
                                            "warm",
                                            "firm",
                                          ] as const
                                        ).map((tone) => (
                                          <button
                                            key={tone}
                                            onClick={() => {
                                              setAssistTone(tone as any);
                                              setTonePopupIndex(null);
                                              setToastMessage(`Style: ${tone}`);
                                              setShowToast(true);
                                            }}
                                            className="block w-full rounded-lg px-1.5 py-1.5 text-left text-[11px] text-[#D7DBE4]/70 transition hover:bg-white/[0.022] hover:text-[#D7DBE4]/92"
                                          >
                                            More {tone}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {getLiveResponseServingTags(m, null).map(
                                      (tag) => (
                                        <span
                                          key={tag}
                                          className="rounded-full border border-white/[0.055] bg-white/[0.018] px-1.5.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#D7DBE4]/48"
                                        >
                                          {tag}
                                        </span>
                                      ),
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleFeedback(i, "up");
                                        recordLiveSupportPreference({
                                          tags: getLiveResponseServingTags(
                                            m,
                                            null,
                                          ),
                                          value: "up",
                                        });
                                        setToastMessage("Support type saved");
                                        setShowToast(true);
                                      }}
                                      className={`ml-1 flex items-center justify-center rounded-full px-1 py-1 transition ${
                                        feedback[i] === "up"
                                          ? "text-[#8FB6C9]/82"
                                          : "text-[#D7DBE4]/42 hover:text-[#D7DBE4]/78"
                                      }`}
                                      aria-label="This GEORGE support type helped"
                                      title="This support type helped"
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="h-[15px] w-[15px]"
                                        fill={
                                          feedback[i] === "up"
                                            ? "currentColor"
                                            : "none"
                                        }
                                        stroke="currentColor"
                                        strokeWidth="1.9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M14 10V5.8c0-1 .3-2 .9-2.8L16 1.5l2 1.9c.7.7 1 1.6 1 2.6v3h1.5c1.1 0 1.9 1 1.7 2.1l-1.1 6.4A2 2 0 0 1 19.1 19H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h6Z" />
                                        <path d="M6 10H3v9h3" />
                                      </svg>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleFeedback(i, "down");
                                        recordLiveSupportPreference({
                                          tags: getLiveResponseServingTags(
                                            m,
                                            null,
                                          ),
                                          value: "down",
                                        });
                                        setToastMessage("Support type saved");
                                        setShowToast(true);
                                      }}
                                      className={`flex items-center justify-center rounded-full px-1 py-1 transition ${
                                        feedback[i] === "down"
                                          ? "text-red-100/82"
                                          : "text-[#D7DBE4]/42 hover:text-[#D7DBE4]/78"
                                      }`}
                                      aria-label="This GEORGE support type did not help"
                                      title="This support type did not help"
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="h-[15px] w-[15px]"
                                        fill={
                                          feedback[i] === "down"
                                            ? "currentColor"
                                            : "none"
                                        }
                                        stroke="currentColor"
                                        strokeWidth="1.9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M10 14v4.2c0 1-.3 2-.9 2.8L8 22.5l-2-1.9c-.7-.7-1-1.6-1-2.6v-3H3.5c-1.1 0-1.9-1-1.7-2.1l1.1-6.4A2 2 0 0 1 4.9 5H16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6Z" />
                                        <path d="M18 14h3V5h-3" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {!liveMode && !liveMode && (
                              <div className="relative flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] text-[#D7DBE4]/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {
                                  <>
                                    {isLatestAssistant &&
                                      !isNormalPreparationBriefingActive && (
                                      <>
                                        {hasClosedNormalBriefing ? (
                                          <button
                                            type="button"
                                            onClick={
                                              resumeNormalPreparationBriefing
                                            }
                                            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[0.55rem] border border-[#5678C8]/28 bg-[#172347]/54 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.17em] text-[#B9C9F3]/74 transition hover:border-[#6F91DE]/44 hover:text-[#E4EBFF]/90 active:scale-[0.97]"
                                          >
                                            PREPARING LIVE
                                          </button>
                                        ) : (
                                          <LiveCapabilitySurface
                                            phase={
                                              preLiveSignalComplete
                                                ? "ready"
                                                : showPreLiveSignalSurface
                                                  ? "preparing"
                                                  : "available"
                                            }
                                            onPrepare={() => {
                                              handleNormalLiveControl();
                                            }}
                                            onStart={openLiveEntry}
                                          />
                                        )}

                                        {[
                                          {
                                            label: "DECK",
                                            prompt:
                                              "Help me build a presentation deck from this conversation.",
                                          },
                                        ].map((capability) => (
                                          <button
                                            key={capability.label}
                                            type="button"
                                            onClick={() => {
                                              setInput(capability.prompt);

                                              window.requestAnimationFrame(
                                                () => {
                                                  textareaRef.current?.focus();
                                                  textareaRef.current?.setSelectionRange(
                                                    capability.prompt.length,
                                                    capability.prompt.length,
                                                  );
                                                },
                                              );
                                            }}
                                            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[0.55rem] border border-white/[0.07] bg-white/[0.018] px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.17em] text-[#D7DBE4]/54 transition hover:border-[#75A4FF]/28 hover:bg-[#172347]/38 hover:text-[#E4EBFF]/88 active:scale-[0.97]"
                                            aria-label={`Use GEORGE to ${capability.label.toLowerCase()}`}
                                          >
                                            {capability.label}
                                          </button>
                                        ))}
                                      </>
                                    )}

                                    <div className="relative shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setResponseActionMenuIndex(
                                            responseActionMenuIndex === i
                                              ? null
                                              : i,
                                          );
                                        }}
                                        aria-label="More response actions"
                                        title="More"
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-[0.5rem] text-[#D7DBE4]/48 transition hover:bg-white/[0.035] hover:text-[#D7DBE4]/82"
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="h-4 w-4"
                                          fill="currentColor"
                                          aria-hidden="true"
                                        >
                                          <circle cx="12" cy="5" r="1.45" />
                                          <circle cx="12" cy="12" r="1.45" />
                                          <circle cx="12" cy="19" r="1.45" />
                                        </svg>
                                      </button>

                                      {responseActionMenuIndex === i && (
                                        <>
                                          <button
                                            type="button"
                                            aria-label="Close response actions"
                                            onClick={() =>
                                              setResponseActionMenuIndex(null)
                                            }
                                            className="fixed inset-0 z-[79] cursor-default bg-transparent"
                                          />

                                          <div className="absolute bottom-[34px] right-0 z-[80] min-w-[116px] overflow-hidden rounded-[0.75rem] border border-white/[0.075] bg-[#080B11]/96 p-1 shadow-[0_18px_54px_rgba(0,0,0,0.46)] backdrop-blur-xl">
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  await navigator.clipboard?.writeText(
                                                    m.content,
                                                  );
                                                  setToastMessage("Copied");
                                                  setShowToast(true);
                                                } catch {}

                                                setResponseActionMenuIndex(
                                                  null,
                                                );
                                              }}
                                              className="block w-full rounded-[0.5rem] px-3 py-2 text-left text-[11px] text-[#D7DBE4]/68 transition hover:bg-white/[0.045] hover:text-white"
                                            >
                                              Copy
                                            </button>

                                            <button
                                              type="button"
                                              onClick={async () => {
                                                const shareText = m.content;

                                                try {
                                                  if (navigator.share) {
                                                    await navigator.share({
                                                      title:
                                                        "GEORGE by BRANESx",
                                                      text: `GEORGE\n\n${shareText}`,
                                                      url:
                                                        window.location.origin +
                                                        "/",
                                                    });
                                                  } else if (
                                                    navigator.clipboard
                                                      ?.writeText
                                                  ) {
                                                    await navigator.clipboard.writeText(
                                                      shareText,
                                                    );
                                                    setToastMessage("Copied");
                                                    setShowToast(true);
                                                  }
                                                } catch {}

                                                setResponseActionMenuIndex(
                                                  null,
                                                );
                                              }}
                                              className="block w-full rounded-[0.5rem] px-3 py-2 text-left text-[11px] text-[#D7DBE4]/68 transition hover:bg-white/[0.045] hover:text-white"
                                            >
                                              Share
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </>
                                }

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleFeedback(i, "up");
                                    setToastMessage("Saved");
                                    setShowToast(true);
                                  }}
                                  className={`relative flex items-center justify-center transition duration-150 ${
                                    feedback[i] === "up"
                                      ? "text-[#D7DBE4]/82"
                                      : "text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80"
                                  } ${
                                    feedbackPulse[`${i}-up`]
                                      ? "scale-125 drop-shadow-[0_0_12px_rgba(174,182,255,0.55)]"
                                      : "scale-100"
                                  }`}
                                  aria-label="Thumbs up"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-[17px] w-[17px]"
                                    fill={
                                      feedback[i] === "up"
                                        ? "currentColor"
                                        : "none"
                                    }
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M14 10V5.8c0-1 .3-2 .9-2.8L16 1.5l2 1.9c.7.7 1 1.6 1 2.6v3h1.5c1.1 0 1.9 1 1.7 2.1l-1.1 6.4A2 2 0 0 1 19.1 19H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h6Z" />
                                    <path d="M6 10H3v9h3" />
                                  </svg>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleFeedback(i, "down");
                                    setToastMessage("Feedback received");
                                    setShowToast(true);
                                  }}
                                  className={`relative flex items-center justify-center transition duration-150 ${
                                    feedback[i] === "down"
                                      ? "text-[#D7DBE4]/82"
                                      : "text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80"
                                  } ${
                                    feedbackPulse[`${i}-down`]
                                      ? "scale-125 drop-shadow-[0_0_12px_rgba(174,182,255,0.55)]"
                                      : "scale-100"
                                  }`}
                                  aria-label="Thumbs down"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-[17px] w-[17px]"
                                    fill={
                                      feedback[i] === "down"
                                        ? "currentColor"
                                        : "none"
                                    }
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M14 14v4.2c0 1-.3 2-.9 2.8L12 22.5l-2-1.9c-.7-.7-1-1.6-1-2.6v-3H7.5c-1.1 0-1.9-1-1.7-2.1l1.1-6.4A2 2 0 0 1 8.9 5H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6Z" />
                                    <path d="M6 14H3V5h3" />
                                  </svg>
                                </button>
                              </div>
                            )}

                            {activeSaveIndex === i && (
                              <div
                                ref={savePickerRef}
                                className={`absolute z-30 w-[230px] max-w-[82vw] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 p-2 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  animate-[pickerTwistUp_180ms_cubic-bezier(0.22,1,0.36,1)] ${savePopupUpward ? "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom" : "top-full left-1/2 -translate-x-1/2 mt-2 origin-top"}`}
                              >
                                <div className="space-y-1.5">
                                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#D7DBE4]/48">
                                    Remember
                                  </div>

                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMemoryFolder("Sessions");
                                        saveMemory(m, i, "Sessions");
                                      }}
                                      className="rounded-lg border border-white/[0.06] bg-white/[0.018] px-1.5.5 py-2 text-[10px] font-medium leading-4 text-[#D7DBE4]/76 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                                    >
                                      Conversation
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => saveGoal(m, i)}
                                      className="rounded-lg border border-[#AEB6FF]/[0.12] bg-[#AEB6FF]/[0.055] px-1.5.5 py-2 text-[10px] font-medium leading-4 text-[#D7DCFF]/82 transition hover:border-[#AEB6FF]/[0.22] hover:bg-[#AEB6FF]/[0.09]"
                                    >
                                      Goal
                                    </button>
                                  </div>

                                  <div className="flex gap-1.5">
                                    {["Follow-ups"].map((folder) => (
                                      <button
                                        key={folder}
                                        type="button"
                                        onClick={() => {
                                          setActiveMemoryFolder(folder);
                                          saveMemory(m, i, folder);
                                        }}
                                        className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.018] px-1.5 py-1.5 text-[10px] font-medium text-[#D7DBE4]/76 transition hover:border-white/[0.09] hover:bg-white/[0.04] hover:text-[#D7DBE4]"
                                      >
                                        {folder}
                                      </button>
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const folder = getDefaultFolder();
                                      setActiveMemoryFolder(folder);
                                      saveMemory(m, i, folder);
                                    }}
                                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.018] px-1.5.5 py-2 text-[11px] font-medium leading-4 text-[#D7DBE4]/86 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                                  >
                                    Remember in {getDefaultFolder()}
                                  </button>

                                  {getExistingFolders().length > 0 && (
                                    <div className="space-y-1.5">
                                      <div className="text-[10px] text-neutral-500">
                                        Recent
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {getExistingFolders().map((folder) => (
                                          <button
                                            key={folder}
                                            type="button"
                                            onClick={() => {
                                              setActiveMemoryFolder(folder);
                                              saveMemory(m, i, folder);
                                            }}
                                            className={`max-w-full break-words rounded-full border px-1.5 py-1 text-[10px] leading-4 transition ${
                                              activeMemoryFolder === folder
                                                ? "border-white/[0.09] bg-white/[0.026] text-[#D7DBE4]"
                                                : "border-white/[0.08] text-neutral-300 hover:border-white/[0.12] hover:text-[#D7DBE4]"
                                            }`}
                                          >
                                            {folder}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {activeMemoryFolder &&
                                    getLatestSavedMemoryByFolder(
                                      activeMemoryFolder,
                                    ) && (
                                      <div className="rounded-xl border border-white/[0.06] bg-black/28 p-1.5 text-[10px] leading-4 text-neutral-500 break-words">
                                        {getLatestSavedMemoryByFolder(
                                          activeMemoryFolder,
                                        )}
                                      </div>
                                    )}

                                  <div className="space-y-1.5">
                                    <div className="text-[10px] text-neutral-500">
                                      New folder
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <input
                                        value={newFolderName}
                                        onChange={(e) =>
                                          setNewFolderName(e.target.value)
                                        }
                                        placeholder="New folder"
                                        className="w-full rounded-xl border border-white/[0.06] bg-black/24 px-1.5.5 py-1.5 text-[11px] leading-4 text-[#D7DBE4] outline-none placeholder:text-neutral-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const folder =
                                            newFolderName.trim() ||
                                            getDefaultFolder();
                                          setActiveMemoryFolder(folder);
                                          saveMemory(m, i, folder);
                                        }}
                                        className="w-full rounded-xl border border-white/[0.05] px-1.5.5 py-1.5 text-[11px] leading-4 text-[#D7DBE4] transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                                      >
                                        Remember
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isLatestVisibleMessage &&
                          normalBriefingActionState &&
                          normalPreparationActions.length > 0 && (
                            <div className="mt-1.5 flex w-fit max-w-[min(92%,42rem)] flex-wrap items-center gap-1.5 self-start rounded-[0.75rem] border border-[#5678C8]/18 bg-[#0B1225]/54 p-1.5">
                              {normalPreparationActions.map((action) => (
                                <button
                                  key={action.label}
                                  type="button"
                                  onClick={action.action}
                                  className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[0.5rem] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] transition active:scale-[0.97] ${
                                    action.emphasis === "primary"
                                      ? "border border-[#7EA1FF]/48 bg-[#172347] text-white hover:border-[#AEB6FF]/75 hover:bg-[#203268]"
                                      : action.emphasis === "secondary"
                                        ? "border border-white/[0.14] bg-white/[0.025] text-white/78 hover:border-white/30 hover:text-white"
                                        : "border border-white/[0.08] bg-transparent text-[#D7DBE4]/52 hover:border-white/[0.2] hover:text-[#D7DBE4]/88"
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}

                {showScrollHint && (
                  <div className="fixed bottom-[calc(286px+env(safe-area-inset-bottom))] left-1/2 z-[100] -translate-x-1/2 transition-opacity duration-200 md:bottom-[calc(300px+env(safe-area-inset-bottom))]">
                    <button
                      type="button"
                      onClick={() => {
                        userPinnedBottomRef.current = true;
                        messagesEndRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "end",
                        });
                        setShowScrollHint(false);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/72 text-[#D7DBE4]/58 shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md transition hover:border-[#4FA8FF] hover:text-[#D7DBE4]/86"
                      aria-label="Scroll to latest message"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                      <span className="sr-only">Scroll to latest message</span>
                    </button>
                  </div>
                )}

                {showLiveEntrySequence &&
                  (forceLive || liveMode) &&
                  (forceLive || messages.length === 0) && (
                    <div className="mx-auto w-full max-w-[430px] md:max-w-[780px] xl:max-w-[980px] px-4 pt-[95px] md:pt-[105px] xl:pt-[115px]">
                      <div className="min-h-[190px] overflow-visible">
                        <div className="font-mono whitespace-pre-line text-left text-[13px] leading-6 tracking-[0.01em] text-[#D7DBE4]/68">
                          {typedLiveEntryBriefing ||
                            "LIVE · Room phrases default\n\nGEORGE turns words into movement.\n\nI have the room.\n\nSpeak clearly. Remember your room phrases."}
                        </div>

                        {showLiveEntrySequence &&
                          liveEntryCheckpointState.showResponsibility &&
                          liveEntryTypingComplete && (
                            <button
                              type="button"
                              onClick={() =>
                                setLiveEntryResponsibilityConfirmed(true)
                              }
                              className="mt-6 w-full rounded-[1rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.035]"
                            >
                              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-white/28">
                                Responsibility
                              </span>
                              <span className="mt-2 block text-[13px] leading-6 text-[#D7DBE4]/68">
                                Responsibility remains with you. GEORGE assists.
                                You decide.
                              </span>
                            </button>
                          )}

                        {showLiveEntrySequence &&
                          liveEntryCheckpointState.showToa &&
                          liveEntryTypingComplete && (
                            <button
                              type="button"
                              onClick={() => setLiveEntryToaConfirmed(true)}
                              className="mt-6 w-full rounded-[1rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.035]"
                            >
                              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-white/28">
                                Terms of Assistance
                              </span>
                              <span className="mt-2 block text-[13px] leading-6 text-[#D7DBE4]/68">
                                Make sure the important facts are accurate.
                                GEORGE can only work from the signal available.
                              </span>
                            </button>
                          )}

                        {liveEntryReadyForOptionalSignal && (
                          <div className="mt-6 rounded-[1rem] border border-white/[0.06] bg-white/[0.014] px-4 py-3">
                            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/26">
                              Final signal
                            </div>

                            <div className="mt-2 text-[13px] leading-6 text-[#D7DBE4]/64">
                              Add pressure, constraints, hidden dynamics,
                              timing, or anything that changes the room.
                            </div>

                            <button
                              type="button"
                              onClick={captureLiveEntryOptionalSignal}
                              className="mt-4 text-[12px] font-medium tracking-[0.08em] text-[#D7DBE4]/52 transition hover:text-[#D7DBE4]/78"
                            >
                              Continue →
                            </button>
                          </div>
                        )}

                        <div className="relative mt-2 min-h-5 cursor-text overflow-hidden rounded-[0.9rem] border border-[#3657A8]/48 bg-[#172347] shadow-[0_12px_38px_rgba(12,27,68,0.34)]">
                          <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleComposerKeyDown}
                            rows={1}
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            onFocus={() => {
                              setComposerFocused(true);
                              setComposerSendFeedback(false);
                            }}
                            onBlur={() => setComposerFocused(false)}
                            placeholder={
                              composerFocused ? "" : composerPlaceholder
                            }
                            className="max-h-36 min-h-6 w-full resize-none appearance-none overflow-y-auto border-0 bg-transparent p-0 font-mono text-[13px] leading-6 tracking-[0.01em] text-[#D7DBE4]/76 outline-none ring-0 shadow-none placeholder:italic placeholder:text-[#D7DBE4]/26 focus:border-0 focus:border-transparent focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                          />

                          {!input.trim() && !composerFocused && (
                            <span className="pointer-events-none absolute left-0 top-[3px] h-[18px] w-px bg-[#D7DBE4]/60 [animation:georgeComposerCursorBlink_.48s_steps(1,end)_infinite]" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <div
                  ref={messagesEndRef}
                  className={`${
                    (forceLive || liveMode) && !showLiveEntrySequence
                      ? "h-[300px] md:h-[320px]"
                      : isNormalPreparationBriefingActive
                        ? "h-[294px] md:h-[320px]"
                      : "h-[24px] md:h-[32px]"
                  }`}
                />
              </div>

              <div
                className={`${(forceLive || liveMode) && !showLiveEntrySequence ? "contents" : "relative w-full flex-col bg-transparent flex transition duration-200 z-20"}`}
              >
                <div className="hidden">
                  {showNormalUtilityMenu && (
                    <button
                      type="button"
                      aria-label="Close GEORGE popup"
                      onClick={() => setShowNormalUtilityMenu(null)}
                      className="fixed inset-0 z-[300] cursor-default bg-transparent [backdrop-filter:blur(14px)] [-webkit-backdrop-filter:blur(14px)] transition-opacity duration-200"
                    />
                  )}

                  {showNormalUtilityMenu && (
                    <>
                      <button
                        type="button"
                        aria-label="Close GEORGE utility menu"
                        onClick={() => setShowNormalUtilityMenu(null)}
                        className="fixed inset-0 z-[300] cursor-default bg-transparent [backdrop-filter:blur(14px)] [-webkit-backdrop-filter:blur(14px)] transition-opacity duration-200"
                      />
                      <div
                        ref={normalUtilityMenuRef}
                        className={`fixed bottom-[112px] left-1/2 z-[320] flex max-w-[calc(100vw-32px)] -translate-x-1/2 gap-2 ${operationalMotion.surface}`}
                      >
                        {showNormalUtilityMenu === "help" && (
                          <>
                            <div
                              className={`w-[136px] px-3 py-2.5 md:w-[160px] md:px-5 md:py-4 ${operationalMotion.anchorPanel}`}
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
                                  Help
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setShowNormalUtilityMenu(null)}
                                  className="text-[13px] text-white/28 transition hover:text-white/72"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="space-y-1">
                                {[
                                  ["live", "LIVE"],
                                  ["continuity", "ACCESS"],
                                  ["memory", "WORKSPACE"],
                                  ["images", "IMAGES"],
                                  ["signal", "HELP"],
                                ].map(([id, label]) => (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() =>
                                      setActiveHelpTopic(id as any)
                                    }
                                    className={`block w-full py-1 text-left text-[13px] uppercase tracking-[0.16em] transition ${
                                      activeHelpTopic === id
                                        ? "text-white/82"
                                        : "text-white/38 hover:text-white/72"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div
                              className={`w-[190px] px-3 py-2.5 md:w-[220px] md:px-5 md:py-4 ${operationalMotion.anchorPanel}`}
                            >
                              <div className="mb-2 text-[9px] uppercase tracking-[0.22em] text-white/24">
                                {activeHelpTopic === "live" && "LIVE"}
                                {activeHelpTopic === "continuity" && "ACCESS"}
                                {activeHelpTopic === "memory" && "WORKSPACE"}
                                {activeHelpTopic === "images" && "IMAGES"}
                                {activeHelpTopic === "signal" && "HELP"}
                              </div>

                              <p className="text-[13px] leading-5 text-white/48">
                                {activeHelpTopic === "live" &&
                                  "LIVE helps you operate during real conversations where timing, pressure, and delivery matter."}
                                {activeHelpTopic === "continuity" &&
                                  "Access restores recognition, continuity, tier access, and LIVE eligibility across sessions."}
                                {activeHelpTopic === "memory" &&
                                  "Workspace keeps useful context available so GEORGE can continue work without starting over."}
                                {activeHelpTopic === "images" &&
                                  "Images help GEORGE understand visual context, references, screenshots, and creative direction."}
                                {activeHelpTopic === "signal" &&
                                  "Help opens supporting information without interrupting the work."}
                              </p>

                              {activeHelpTopic === "signal" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowNormalUtilityMenu(null);
                                    window.location.href = "/signal";
                                  }}
                                  className="mt-3 block py-1 text-[13px] uppercase tracking-[0.16em] text-white/36 transition hover:text-white"
                                >
                                  Open Help
                                </button>
                              )}

                              {activeHelpTopic === "memory" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowMemoryContinuityPanel(true);
                                    setShowNormalUtilityMenu(null);
                                  }}
                                  className="mt-3 block py-1 text-[13px] uppercase tracking-[0.16em] text-white/36 transition hover:text-white"
                                >
                                  Continuity
                                </button>
                              )}

                              <a
                                href="/help"
                                className="mt-3 block py-1 text-[13px] uppercase tracking-[0.16em] text-white/36 transition hover:text-white"
                              >
                                Help
                              </a>
                            </div>
                          </>
                        )}

                        {showNormalUtilityMenu === "language" && (
                          <div
                            className={`w-[190px] px-3 py-2.5 md:w-[220px] md:px-5 md:py-4 ${operationalMotion.anchorPanel}`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
                                Language
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowNormalUtilityMenu(null)}
                                className="text-[11px] text-white/28 transition hover:text-white/72"
                              >
                                ×
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                              {languageOptions.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    setLanguage(option);
                                    window.localStorage.setItem(
                                      "george_language",
                                      option,
                                    );
                                    setToastMessage(`Language set: ${option}`);
                                    setShowToast(true);
                                    setShowNormalUtilityMenu(null);
                                  }}
                                  className={`py-1 text-left text-[10px] uppercase tracking-[0.12em] transition active:scale-[0.98] ${
                                    language === option
                                      ? "text-white/82"
                                      : "text-white/34 hover:text-white/68"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden">
                  <div className="flex items-center gap-4 py-3 text-[#D7DBE4]/80 text-[13px]">
                    <div className="relative flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRecentFolders((prev) => !prev);
                          setActiveMemoryFolder(null);
                        }}
                        className={`group relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-150 ease-out ${
                          liveMode ||
                          activePromptContext?.includes("conversation") ||
                          activePromptContext?.includes("professional") ||
                          activePromptContext?.includes("brilliant_live")
                            ? "border-white/[0.12] bg-white/[0.04] text-[#D7DBE4]/82 shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
                            : "border-white/10 bg-white/[0.015] text-[#D7DBE4]/70 hover:border-white/20 hover:bg-white/[0.022] hover:text-[#D7DBE4]/92"
                        }`}
                        aria-label="Open memory folders"
                        title="Resume conversation continuity"
                      >
                        <span className="relative flex h-4 w-4 items-center justify-center">
                          <span className="absolute top-[3px] h-[2px] w-3 rounded-full bg-current opacity-80 transition group-hover:w-3.5" />
                          <span className="absolute top-[7px] h-[2px] w-3.5 rounded-full bg-current opacity-95 transition group-hover:w-4" />
                          <span className="absolute top-[11px] h-[2px] w-2.5 rounded-full bg-current opacity-70 transition group-hover:w-3" />
                        </span>
                      </button>

                      {(currentTier === "smart" ||
                        currentTier === "intelligent" ||
                        currentTier === "brilliant") && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (liveMode) {
                                requestExitLiveMode();
                              } else {
                                enterLiveConversation();
                              }
                            }}
                            className={`flex h-9 items-center justify-center px-1.5 text-[12px] font-medium tracking-[0.12em] transition ${
                              liveMode
                                ? "border border-red-200/[0.14] bg-red-200/[0.035] text-red-100/62 hover:text-red-100/86"
                                : "text-[#D7DBE4]/80 hover:text-[#D7DBE4]"
                            }`}
                          >
                            {liveMode ? "EXIT" : "LIVE"}
                          </button>

                          {liveMode && (
                            <button
                              type="button"
                              onClick={() => {
                                if (currentTier === "smart") {
                                  setToastMessage(
                                    "Voice replies unlock above Smart.",
                                  );
                                  setShowToast(true);
                                  return;
                                }

                                const nextVoice = !voiceOn;
                                hasUserInteractedRef.current = true;
                                setVoiceOn(nextVoice);
                                setInteractionMode(
                                  nextVoice ? "speech" : "text",
                                );
                                window.localStorage.setItem(
                                  "george_voice",
                                  nextVoice ? "on" : "off",
                                );
                                setToastMessage(
                                  nextVoice ? "Audio on" : "Audio off",
                                );
                                setShowToast(true);
                              }}
                              className={`flex h-9 items-center justify-center px-1.5 text-[12px] font-medium tracking-[0.12em] transition ${
                                voiceOn
                                  ? "text-[#D7DCFF]/72 hover:text-[#D7DCFF]"
                                  : "text-[#D7DBE4]/46 hover:text-[#D7DBE4]/78"
                              }`}
                              aria-label={
                                voiceOn ? "Turn audio off" : "Turn audio on"
                              }
                            >
                              {voiceOn ? "MUTE" : "UNMUTE"}
                            </button>
                          )}
                        </>
                      )}

                      {showRecentFolders && (
                        <div
                          ref={folderBrowserRef}
                          className="fixed bottom-[128px] left-1/2 -translate-x-1/2 z-50 w-[min(340px,calc(100vw-32px))] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 p-2 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  transition-all duration-200 ease-out animate-[pickerTwistUp_180ms_cubic-bezier(0.22,1,0.36,1)]"
                        >
                          <div className="space-y-3">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#D7DBE4]/25">
                              workspace
                            </div>

                            {getExistingFolders().length > 0 ? (
                              <div className="space-y-3">
                                {getExistingFolders().map((folder) => {
                                  return (
                                    <button
                                      key={folder}
                                      type="button"
                                      onClick={() => {
                                        setActiveMemoryFolder(folder);
                                      }}
                                      className={`block w-full rounded-xl px-3 py-1.5 text-left text-[13px] transition ${
                                        activeMemoryFolder === folder
                                          ? "bg-white/[0.08] text-[#D7DBE4]"
                                          : "text-[#D7DBE4]/34 hover:bg-white/[0.022] hover:text-[#D7DBE4]"
                                      }`}
                                    >
                                      {folder}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-[13px] text-[#D7DBE4]/30">
                                No saved work yet
                              </div>
                            )}

                            {activeMemoryFolder && (
                              <div className="mt-3 border-t border-transparent pt-3">
                                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#D7DBE4]/35">
                                  <span>{activeMemoryFolder}</span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveMemoryFolder(null)}
                                    className="text-[#D7DBE4]/30 transition hover:text-[#D7DBE4]"
                                  >
                                    Back
                                  </button>
                                </div>

                                <div className="max-h-[168px] space-y-2 overflow-y-auto pr-1">
                                  {getFolderItems(activeMemoryFolder)
                                    .filter(
                                      (item) =>
                                        (item.type || "memory") !== "campaign",
                                    )
                                    .map((item, idx) => {
                                      const textBlock =
                                        item.savedPair && item.userPromptContent
                                          ? `User: ${item.userPromptContent}\nGEORGE: ${item.content}`
                                          : item.content;

                                      const isLatest = idx === 0;

                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            const memoryContext = `Workspace context:\n${textBlock}\n\nUse this context, continue from it, or tell me what changed.`;

                                            const nextMessages = [
                                              ...messagesRef.current,
                                              {
                                                role: "assistant" as const,
                                                content: memoryContext,
                                              },
                                            ];

                                            setMessages(nextMessages);
                                            messagesRef.current = nextMessages;

                                            setShowRecentFolders(false);
                                            setActiveMemoryFolder(null);
                                          }}
                                          className={`block w-full rounded-xl border px-4 py-1.5 text-left text-xs transition ${
                                            isLatest
                                              ? "border-white/[0.12] bg-white/[0.04] text-[#D7DBE4]"
                                              : "border-white/[0.06] bg-black/28 text-neutral-300 hover:border-white/[0.12] hover:text-[#D7DBE4]"
                                          }`}
                                        >
                                          <div className="mb-1 flex items-center justify-between gap-1.5">
                                            <span className="truncate">
                                              {item.preview ||
                                                (item.content || "").slice(
                                                  0,
                                                  80,
                                                )}
                                            </span>
                                            {isLatest && (
                                              <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[#D7DBE4]/45">
                                                recent
                                              </span>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSaveIndex(null);
                          setShowRecentFolders(false);
                          setShowPromptMenu((prev) => !prev);
                          setShowConversationMenu(false);
                        }}
                        className="relative flex h-7 w-7 items-center justify-center text-[#D7DBE4]/85 transition hover:text-[#D7DBE4]"
                        aria-label="Make a better move"
                      >
                        <span className="text-[34px] leading-none">+</span>
                        <span
                          className={`absolute right-2 top-1 h-1 w-1 rounded-full ${
                            reroutePrompt ||
                            (suggestedPrompts !== tieredStarterPrompts &&
                              suggestedPrompts.length > 0)
                              ? "bg-white"
                              : "bg-[#4FA8FF]5"
                          } ${
                            suggestedSignal || rerouteSignal
                              ? "ring-1 ring-white/[0.18] shadow-[0_0_8px_rgba(255,255,255,0.14)] "
                              : ""
                          }`}
                        />
                      </button>

                      {showPromptMenu && (
                        <div
                          ref={promptMenuRef}
                          className="absolute bottom-full george-motion-collapse-up mb-2 left-0 z-50 w-[170px] max-w-[48vw] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 px-1.5.5 py-1.5 shadow-[0_22px_70px_rgba(0,0,0,0.48)]  transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        >
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => {
                                const turningOn =
                                  activePromptContext !== "bible_decision_lens";
                                setActivePromptLabel(
                                  turningOn ? "Be as Christ" : null,
                                );
                                setActivePromptContext(
                                  turningOn ? "bible_decision_lens" : null,
                                );
                                setContextTurnCount(0);
                                setShowPromptMenu(false);
                                setToastMessage(
                                  turningOn
                                    ? "Be as Christ on"
                                    : "Be as Christ off",
                                );
                                setShowToast(true);
                                textareaRef.current?.focus();
                              }}
                              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
                            >
                              Be as Christ
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (currentTier === "smart") {
                                  setToastMessage(
                                    "Voice replies unlock above Smart.",
                                  );
                                  setShowToast(true);
                                  return;
                                }
                                const nextVoice = !voiceOn;
                                hasUserInteractedRef.current = true;
                                setVoiceOn(nextVoice);
                                setInteractionMode(
                                  nextVoice ? "speech" : "text",
                                );
                                window.localStorage.setItem(
                                  "george_voice",
                                  nextVoice ? "on" : "off",
                                );
                                setToastMessage(
                                  nextVoice ? "Voice Active" : "Voice Standby",
                                );
                                setShowToast(true);
                              }}
                              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
                            >
                              Voice replies {voiceOn ? "ON" : "OFF"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (currentTier !== "brilliant") {
                                  setShowToast(true);
                                  return;
                                }
                                setShowPromptMenu(false);
                                setShowConversationMenu(true);
                              }}
                              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
                            ></button>

                            <button
                              type="button"
                              onClick={() => {
                                fileInputRef.current?.click();
                                setShowPromptMenu(false);
                              }}
                              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
                            >
                              Upload image / file
                            </button>

                            {reroutePrompt && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePromptLabel(reroutePrompt.label);
                                  setActivePromptContext(reroutePrompt.context);
                                  setShowPromptMenu(false);
                                  setRerouteSignal(0);
                                  void handleSend(reroutePrompt.text);
                                }}
                                className="block w-full py-1 text-left text-sm text-red-300 transition hover:text-red-100/82"
                              >
                                {reroutePrompt.label}
                              </button>
                            )}

                            {suggestedPrompts.map((prompt) => (
                              <button
                                key={prompt.label}
                                type="button"
                                onClick={() => {
                                  setActivePromptLabel(prompt.label);
                                  setActivePromptContext(prompt.context);
                                  if (prompt.context?.startsWith("brilliant_"))
                                    setConversationMode(prompt.context);
                                  setShowPromptMenu(false);
                                  void handleSend(prompt.text, {
                                    source: "sidebar_prompt",
                                  });
                                }}
                                className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]/72"
                              >
                                {prompt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}


                      {showProLiveComingSoon &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <>
                            <button
                              type="button"
                              aria-label="Close structured LIVE notice"
                              onClick={() => setShowProLiveComingSoon(false)}
                              className="fixed inset-0 z-[240] bg-black george-motion-fade-soft/68 -[10px]"
                            />

                            <div className="fixed inset-0 z-[141] flex items-center justify-center px-4">
                              <div className="w-full max-w-[360px] rounded-[1.5rem] border border-white/[0.07] bg-[#000000]/94 p-5 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  ">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/72">
                                  LIVE STRUCTURE
                                </div>

                                <div className="mt-2 text-[16px] font-semibold text-[#D7DBE4]">
                                  Coming soon.
                                </div>

                                <div className="mt-3 text-[12px] leading-5 text-[#D7DBE4]/58">
                                  LIVE is currently focused on stabilizing
                                  individual real-time assistance before
                                  expanding into structured LIVE environments.
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowProLiveComingSoon(false)
                                  }
                                  className="mt-5 w-full rounded-xl border border-white/[0.075] bg-white/[0.025] px-4 py-3 text-sm font-medium text-[#D7DBE4]/82 transition hover:border-white/[0.09] hover:bg-white/[0.026] hover:text-[#D7DBE4]"
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          </>,
                          document.body,
                        )}

                      {showLiveSessionDetails &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <div className="fixed inset-0 z-[340] flex items-end justify-center px-4 pb-6 pt-10 sm:items-center sm:pb-10">
                            <button
                              type="button"
                              aria-label="Close session details"
                              onClick={() => setShowLiveSessionDetails(false)}
                              className="absolute inset-0 bg-black/54 [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]"
                            />

                            <div className="relative w-full max-w-[420px] rounded-[1.15rem] border border-white/[0.075] bg-[#05080D]/94 p-4 shadow-[0_28px_92px_rgba(0,0,0,0.62)]">
                              <div className="mb-3 flex items-center justify-between gap-4">
                                <div>
                                  <div className="text-[9px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">
                                    LIVE
                                  </div>
                                  <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.035em] text-white/88">
                                    Session Details
                                  </h2>
                                </div>

                                <button
                                  type="button"
                                  aria-label="Close session details"
                                  onClick={() =>
                                    setShowLiveSessionDetails(false)
                                  }
                                  className="rounded-full border border-white/[0.07] px-2 py-1 text-[12px] leading-none text-white/44 transition hover:bg-white/[0.04] hover:text-white"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="divide-y divide-white/[0.055] border-y border-white/[0.055]">
                                {[
                                  ["Receiver", activeLiveReceiverProfileLabel],
                                  [
                                    "Communication",
                                    getActiveLiveCommunicationStyle(),
                                  ],
                                  ["Language Assist", "Automatic"],
                                  ["Voice", voiceOn ? "Audio On" : "Muted"],
                                  [
                                    "Conversation",
                                    liveRoomActive ? "Active" : "Inactive",
                                  ],
                                  [
                                    "Room",
                                    liveRuntimeSupport?.room || "Not specified",
                                  ],
                                  [
                                    "Role",
                                    liveRuntimeSupport?.chair ||
                                      liveRuntimeSupport?.userPosition ||
                                      "Not specified",
                                  ],
                                  [
                                    "Outcome",
                                    liveRuntimeSupport?.objective ||
                                      "Not specified",
                                  ],
                                  [
                                    "Secondary",
                                    liveRuntimeSupport?.secondaryOutcome ||
                                      liveRuntimeSupport?.secondaryObjective ||
                                      "None",
                                  ],
                                ].map(([label, value]) => (
                                  <div
                                    key={label}
                                    className="grid grid-cols-[112px_1fr] gap-3 py-2.5 text-[12px] leading-5"
                                  >
                                    <div className="uppercase tracking-[0.18em] text-white/28">
                                      {label}
                                    </div>
                                    <div className="text-[#D7DBE4]/68">
                                      {String(value)}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <p className="mt-3 text-[11px] leading-5 text-white/34">
                                These are the details GEORGE is using during
                                LIVE. They remain available without occupying
                                the runtime HUD.
                              </p>
                            </div>
                          </div>,
                          document.body,
                        )}

                      {showConversationRecord &&
                        lastConversationRecord &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black george-motion-fade-soft/58 px-4 backdrop-blur-[14px]">
                            <PostLiveConversationRecordPanel
                              record={lastConversationRecord}
                              onClose={finishActiveBriefing}
                              onAskGeorge={askWithinActiveBriefing}
                              onNextCall={beginNextRepeatedConversation}
                            />
                          </div>,
                          document.body,
                        )}

                      {showOutcomeExitReview &&
                        liveOutcomeReview &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label="Close outcome review"
                              onClick={() => setShowOutcomeExitReview(false)}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Escape" ||
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  setShowOutcomeExitReview(false);
                                }
                              }}
                              className="fixed inset-0 z-[220] flex items-center justify-center bg-black george-motion-fade-soft/58 px-4 backdrop-blur-[14px]"
                            >
                              <div
                                onClick={(event) => event.stopPropagation()}
                                className={`relative w-[min(380px,calc(100vw-32px))] px-3 py-3 md:px-5 md:py-4 ${operationalMotion.anchorPanel} ${operationalMotion.surface}`}
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
                                    Outcome Review
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowOutcomeExitReview(false)
                                    }
                                    className="text-[13px] text-white/28 transition hover:text-white/72"
                                  >
                                    ×
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  {liveOutcomeReview.milestone && (
                                    <div className="rounded-[0.75rem] border border-[#8FB6C9]/14 bg-[#8FB6C9]/[0.045] px-3 py-2">
                                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#D7DCFF]/44">
                                        Milestone
                                      </div>
                                      <div className="mt-1 text-[12px] leading-5 text-[#D7DCFF]/74">
                                        {liveOutcomeReview.milestone.replace(
                                          /^Milestone:\s*/i,
                                          "",
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <label className="block">
                                    <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
                                      Desired outcome
                                    </span>
                                    <Input
                                      value={liveOutcomeReview.desiredOutcome}
                                      onChange={(event) =>
                                        setLiveOutcomeReview({
                                          ...liveOutcomeReview,
                                          desiredOutcome: event.target.value,
                                        })
                                      }
                                      className="mt-1 w-full rounded-[0.65rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] text-[#D7DBE4]/72 outline-none focus:border-[#8FB6C9]/24"
                                    />
                                  </label>

                                  <div>
                                    <div className="mb-1 text-[9px] uppercase tracking-[0.18em] text-white/24">
                                      Observed progress
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {(
                                        [
                                          "unknown",
                                          "improving",
                                          "stable",
                                          "declining",
                                        ] as const
                                      ).map((state) => (
                                        <button
                                          key={state}
                                          type="button"
                                          onClick={() =>
                                            setLiveOutcomeReview({
                                              ...liveOutcomeReview,
                                              observedProgress: state,
                                            })
                                          }
                                          className={`rounded-[0.6rem] border px-2 py-1.5 text-left text-[10px] uppercase tracking-[0.12em] transition ${
                                            liveOutcomeReview.observedProgress ===
                                            state
                                              ? "border-[#8FB6C9]/24 bg-[#8FB6C9]/[0.06] text-[#D7DCFF]/78"
                                              : "border-white/[0.055] bg-black/[0.14] text-white/34 hover:text-white/62"
                                          }`}
                                        >
                                          {state}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <label className="block">
                                    <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
                                      Confidence ·{" "}
                                      {liveOutcomeReview.confidence}%
                                    </span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={liveOutcomeReview.confidence}
                                      onChange={(event) =>
                                        setLiveOutcomeReview({
                                          ...liveOutcomeReview,
                                          confidence: Number(
                                            event.target.value,
                                          ),
                                        })
                                      }
                                      className="mt-2 w-full"
                                    />
                                  </label>

                                  <label className="block">
                                    <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
                                      Possible secondary outcome
                                    </span>
                                    <Textarea
                                      value={
                                        liveOutcomeReview.possibleSecondaryOutcome
                                      }
                                      onChange={(event) =>
                                        setLiveOutcomeReview({
                                          ...liveOutcomeReview,
                                          possibleSecondaryOutcome:
                                            event.target.value,
                                        })
                                      }
                                      rows={2}
                                      className="mt-1 w-full resize-none rounded-[0.65rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] leading-5 text-[#D7DBE4]/72 outline-none focus:border-[#8FB6C9]/24"
                                    />
                                  </label>

                                  <label className="block">
                                    <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
                                      Notes
                                    </span>
                                    <Textarea
                                      value={liveOutcomeReview.notes}
                                      onChange={(event) =>
                                        setLiveOutcomeReview({
                                          ...liveOutcomeReview,
                                          notes: event.target.value,
                                        })
                                      }
                                      rows={2}
                                      className="mt-1 w-full resize-none rounded-[0.65rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] leading-5 text-[#D7DBE4]/72 outline-none focus:border-[#8FB6C9]/24"
                                    />
                                  </label>
                                </div>

                                <div className="mt-4 grid gap-1">
                                  <button
                                    type="button"
                                    onClick={finishLiveExitAfterOutcomeReview}
                                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/62 transition hover:text-white active:scale-[0.98]"
                                  >
                                    Accept and exit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowOutcomeExitReview(false);
                                      setPendingLiveExitAction(null);
                                    }}
                                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/42 transition hover:text-white/72 active:scale-[0.98]"
                                  >
                                    Continue LIVE
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>,
                          document.body,
                        )}

                      {showExitPopup && (
                        <style>{`
    .george-live-route {
      filter: blur(14px);
      transition: filter 180ms ease;
    }
  `}</style>
                      )}

                      {showExitPopup &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label="Close leave LIVE popup"
                              onClick={() => setShowExitPopup(false)}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Escape" ||
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  setShowExitPopup(false);
                                }
                              }}
                              className="fixed inset-0 z-[80] flex items-center justify-center bg-black george-motion-fade-soft/58 px-4 backdrop-blur-[14px]"
                            >
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`relative z-[181] w-[min(360px,calc(100vw-32px))] px-3 py-2.5 md:px-5 md:py-4 md:px-5 md:py-4 ${operationalMotion.anchorPanel} ${operationalMotion.surface}`}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
                                    Leave LIVE
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setShowExitPopup(false)}
                                    className="text-[13px] text-white/28 transition hover:text-white/72"
                                  >
                                    ×
                                  </button>
                                </div>

                                <p className="mb-3 text-[11px] leading-5 text-white/34">
                                  Save this LIVE conversation, leave without
                                  saving, or continue.
                                </p>

                                <div className="grid gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowExitPopup(false);
                                      window.localStorage.setItem(
                                        "george_start_new_live",
                                        "1",
                                      );
                                      openLiveEntry();
                                    }}
                                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-[#D7DBE4]/58 transition hover:text-white active:scale-[0.98]"
                                  >
                                    New LIVE
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openLiveOutcomeExitReview("save")
                                    }
                                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white active:scale-[0.98]"
                                  >
                                    Save and exit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openLiveOutcomeExitReview("discard")
                                    }
                                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-red-100/58 transition hover:text-red-100/88 active:scale-[0.98]"
                                  >
                                    Exit without saving
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setShowExitPopup(false)}
                                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white active:scale-[0.98]"
                                  >
                                    Continue LIVE
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>,
                          document.body,
                        )}

                    </div>
                  </div>
                </div>

                {showOutcomeBar && (
                  <div className="fixed bottom-[140px] left-0 right-0 z-[80] mx-auto w-[calc(100%-24px)] max-w-[600px] rounded-xl border border-white/[0.05] bg-black/72 -[10px] px-5 py-4 ">
                    <div className="text-[11px] text-[#D7DBE4]/60 mb-2">
                      What happened here?
                    </div>

                    <div className="flex justify-between gap-2">
                      {(
                        [
                          ["WIN", "✓ Won", "text-[#8FB6C9]"],
                          ["LOSS", "✗ Lost", "text-red-400"],
                          ["FOLLOW_UP", "↻ Follow-up", "text-yellow-400"],
                        ] as const
                      ).map(([signal, label, colorClass]) => (
                        <button
                          key={signal}
                          onClick={() => {
                            const history = JSON.parse(
                              window.localStorage.getItem("GEORGE_OUTCOMES") ||
                                "[]",
                            );
                            history.unshift({
                              signal,
                              context: lastOutcomeContext,
                              ts: Date.now(),
                            });
                            window.localStorage.setItem(
                              "GEORGE_OUTCOMES",
                              JSON.stringify(history.slice(0, 50)),
                            );

                            const sessions = getCampaignSessions();
                            const updatedSessions = Array.isArray(sessions)
                              ? sessions.map((session: any) => {
                                  if (
                                    activeCampaignId &&
                                    session.id !== activeCampaignId
                                  )
                                    return session;

                                  const perf = session.performance || {
                                    calls: 0,
                                    objections: 0,
                                    callbacks: 0,
                                    closes: 0,
                                    weakSpots: [],
                                    wins: 0,
                                    losses: 0,
                                    followUps: 0,
                                    history: [],
                                  };

                                  const nextPerf = {
                                    ...perf,
                                    wins:
                                      (perf.wins || 0) +
                                      (signal === "WIN" ? 1 : 0),
                                    losses:
                                      (perf.losses || 0) +
                                      (signal === "LOSS" ? 1 : 0),
                                    followUps:
                                      (perf.followUps || 0) +
                                      (signal === "FOLLOW_UP" ? 1 : 0),
                                    closes:
                                      (perf.closes || 0) +
                                      (signal === "WIN" ? 1 : 0),
                                    callbacks:
                                      (perf.callbacks || 0) +
                                      (signal === "FOLLOW_UP" ? 1 : 0),
                                    history: [
                                      {
                                        signal,
                                        context: lastOutcomeContext,
                                        ts: Date.now(),
                                        duration: attemptStartTime
                                          ? Date.now() - attemptStartTime
                                          : null,
                                      },
                                      ...((perf.history || []) as any[]),
                                    ].slice(0, 50),
                                  };

                                  return { ...session, performance: nextPerf };
                                })
                              : [];

                            updateCampaignSessionMetadata(
                              activeCampaignId,
                              (metadata) => {
                                const current = (metadata.performance ||
                                  {}) as any;
                                const next =
                                  updatedSessions.find(
                                    (item: any) => item.id === activeCampaignId,
                                  )?.performance || current;

                                return {
                                  ...metadata,
                                  performance: next,
                                };
                              },
                            );

                            setShowOutcomeBar(false);
                            setLastOutcomeContext(null);
                          }}
                          className={`flex-1 rounded-lg border border-white/[0.05] py-1 text-[12px] ${colorClass}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {liveMode && showLiveQuickMenu && (
                  <div className="pointer-events-none fixed inset-0 z-[71] bg-black george-motion-fade-soft/68 -[10px]" />
                )}

                {!(forceLive || liveMode) &&
                  isNormalPreparationBriefingActive && (
                    <>
                      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[40] h-[112px] bg-[#000000] md:h-[184px]" />
                      <div className="pointer-events-none fixed inset-x-0 bottom-[104px] z-[40] h-[40px] bg-gradient-to-t from-[#000000] via-[#000000]/88 to-transparent md:bottom-[176px] md:h-[56px]" />
                    </>
                  )}

                <style jsx global>{`
  @keyframes tierSignalPrimary {
    0%, 40% { opacity: 1; transform: translateY(0); }
    48%, 100% { opacity: 1; transform: translateY(-22px); }
  }

  @keyframes tierSignalSecondary {
    0%, 40% { opacity: 1; transform: translateY(22px); }
    48%, 88% { opacity: 1; transform: translateY(0); }
    96%, 100% { opacity: 1; transform: translateY(-22px); }
  }
    51%, 96% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-8px); }
  }
    50%, 94% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-9px); }
  }
`}</style>

                {!liveMode && (isThinking || isSpeaking || bridgeThinking) && (
                  <div
                    className={`${forceLive || liveMode ? "hidden" : "fixed"} bottom-[96px] left-0 right-0 z-[140] flex justify-center pointer-events-none`}
                  >
                    <div className="text-[10px] text-[#D7DBE4]/24 tracking-[0.16em]">
                      <span className="inline-flex items-center gap-[5px]"></span>
                    </div>
                  </div>
                )}



                {!(forceLive || liveMode) &&
                  !isNormalPreparationBriefingActive && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none fixed inset-x-0 bottom-0 z-[180] h-[130px] bg-black before:absolute before:inset-x-0 before:-top-[18px] before:h-[18px] before:bg-gradient-to-t before:from-black before:to-transparent md:h-[166px]"
                    />
                  )}

                <div
                  className={`${
                    forceLive || liveMode
                      ? "fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] md:bottom-[96px]"
                      : "fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] md:bottom-[112px]"
                  } george-live-composer-region z-[190] pointer-events-auto mx-auto w-[min(720px,calc(100vw-32px))] bg-transparent px-0 py-0`}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none mb-2 select-none text-center font-mono text-[8px] font-semibold uppercase tracking-[0.34em] text-white/22"
                  >
                    GEORGE can make mistakes. Check important information.
                  </div>

                  <div
                    className={`george-composer-shell relative z-[191] isolate flex-1 overflow-hidden rounded-[1.5rem] border pointer-events-auto touch-manipulation shadow-[0_12px_38px_rgba(4,10,28,0.46)] ${!(forceLive || liveMode) ? "border-[#4668B8]/65 !bg-[#101A36] shadow-[0_0_34px_rgba(8,18,48,0.48)]" : "border-[#2B457F]/48 bg-[#101A36]"}`}
                  >
                    {composerSendFeedback && (
                      <>
                        <span
                          aria-hidden="true"
                          className="george-composer-send-pulse pointer-events-none absolute inset-0 z-0"
                        />
                        <span
                          aria-hidden="true"
                          className="george-composer-send-shimmer pointer-events-none absolute inset-y-0 left-0 z-[1] w-px"
                        />
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const isImage = file.type.startsWith("image/");
                        const isText =
                          file.type === "text/plain" ||
                          file.name.toLowerCase().endsWith(".txt");
                        const isPdf =
                          file.type === "application/pdf" ||
                          file.name.toLowerCase().endsWith(".pdf");
                        const isDocx =
                          file.type.includes(
                            "officedocument.wordprocessingml.document",
                          ) || file.name.toLowerCase().endsWith(".docx");

                        const lowerFileName = file.name.toLowerCase();
                        const looksLikeResume =
                          lowerFileName.includes("resume") ||
                          lowerFileName.includes("résumé") ||
                          lowerFileName.includes("cv") ||
                          lowerFileName.includes("cover-letter") ||
                          lowerFileName.includes("cover_letter");

                        if (isPdf || isDocx) {
                          const formData = new FormData();
                          formData.append("file", file);

                          setToastMessage(`Reading ${file.name}...`);
                          setShowToast(true);

                          fetch("/api/extract-file", {
                            method: "POST",
                            body: formData,
                          })
                            .then(async (res) => {
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok) {
                                throw new Error(
                                  data?.error || "Unable to read this PDF.",
                                );
                              }

                              setPendingImage(null);
                              setInput(
                                `I uploaded file: ${data.name || file.name}. Help me understand and use it.\\n\\n${data.text}`,
                              );
                              setToastMessage(
                                `${data.name || file.name} loaded into GEORGE.`,
                              );
                              setShowToast(true);
                              textareaRef.current?.focus();
                            })
                            .catch((err) => {
                              setToastMessage(
                                err?.message || "Unable to read this PDF.",
                              );
                              setShowToast(true);
                            });

                          e.currentTarget.value = "";
                          return;
                        }

                        if (isText) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const fileText = String(reader.result || "").trim();
                            if (!fileText) {
                              setToastMessage("That text file appears empty.");
                              setShowToast(true);
                              return;
                            }

                            const clipped =
                              fileText.length > 12000
                                ? fileText.slice(0, 12000) +
                                  "\n\n[Text clipped for length.]"
                                : fileText;
                            setPendingImage(null);
                            setInput(`I uploaded text file: ${file.name}.

${
  looksLikeResume
    ? "This looks like a résumé or career document. Help me use it for interviews, role positioning, answer framing, and live conversation preparation. Pull out what matters most and what I should be ready to say."
    : "Tell me what this is, what matters most, and how I should use it."
}

${clipped}`);
                            setToastMessage(`${file.name} loaded into GEORGE.`);
                            setShowToast(true);
                            textareaRef.current?.focus();
                          };
                          reader.readAsText(file);
                          e.currentTarget.value = "";
                          return;
                        }

                        if (isImage) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = String(reader.result || "");
                            if (!dataUrl) return;
                            setPendingImage({ dataUrl, name: file.name });
                            setToastMessage(`${file.name} ready to send.`);
                            setShowToast(true);
                            textareaRef.current?.focus();
                          };
                          reader.readAsDataURL(file);
                          e.currentTarget.value = "";
                          return;
                        }

                        const starter = `I uploaded file: ${file.name}.

Tell me what this is, what matters most, and how GEORGE can help me use it effectively.`;
                        setPendingImage(null);
                        setInput(starter);
                        setToastMessage(`${file.name} attached to composer.`);
                        setShowToast(true);
                        textareaRef.current?.focus();
                        e.currentTarget.value = "";
                      }}
                    />
                    {pendingImage && (
                      <div className="absolute left-4 bottom-full george-motion-collapse-up mb-2 flex max-w-[180px] gap-1.5 overflow-hidden rounded-xl border border-white/[0.07] bg-[#05080D]/88 px-1.5 py-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.38)] ">
                        <div className="relative h-10 w-10 shrink-0">
                          <img
                            src={pendingImage.dataUrl}
                            alt="Image preview"
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPendingImage(null)}
                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-[10px] text-[#D7DBE4]/70 transition hover:text-[#D7DBE4]"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`${forceLive || liveMode ? "hidden" : "absolute left-1 top-1/2 z-[2] flex"} h-10 w-10 -translate-y-1/2 items-center justify-center border-0 bg-transparent text-[#D7DBE4]/44 transition hover:text-[#D7DBE4]/82 md:h-8 md:w-8`}
                      aria-label="Upload file"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5 fill-none stroke-current"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 16V4" />
                        <path d="M7 9l5-5 5 5" />
                        <path d="M5 20h14" />
                      </svg>
                    </button>

                    {(forceLive || liveMode) && !showLiveEntrySequence && (
                      <div className="absolute right-2 bottom-full george-motion-collapse-up mb-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cycleLiveReceiverProfile}
                          className="rounded-full border border-[#3657A8]/48 bg-[#172347] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42 backdrop-blur-xl transition hover:border-[#5579D7]/70 hover:text-[#D7DCFF]/78 active:scale-[0.98]"
                        >
                          {activeLiveReceiverProfileLabel}
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowLiveSteeringReference((value) => !value)
                            }
                            className="rounded-full border border-[#3657A8]/48 bg-[#172347] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42 backdrop-blur-xl transition hover:border-[#5579D7]/70 hover:text-[#D7DCFF]/78"
                          >
                            Steering
                          </button>

                          {showLiveSteeringReference && (
                            <div className="absolute bottom-full george-motion-collapse-up right-0 mb-2 w-[260px] rounded-[0.82rem] border border-white/[0.07] bg-[#05080D]/94 px-3 py-3 shadow-[0_18px_54px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
                              {(() => {
                                const defaults = {
                                  buyTime: "Let me think for a second...",
                                  clarify: "I want to make sure I understand.",
                                  expand: "Walk me through that.",
                                  changeDirection: "What matters now is...",
                                  slowDown: "Can we slow down?",
                                };

                                let saved = defaults;

                                try {
                                  const parsed = JSON.parse(
                                    window.localStorage.getItem(
                                      "GEORGE_LIVE_STEERING_PHRASES",
                                    ) || "null",
                                  );
                                  if (parsed && typeof parsed === "object") {
                                    saved = { ...defaults, ...parsed };
                                  }
                                } catch {}

                                return [
                                  ["Buy time", saved.buyTime],
                                  ["Clarify", saved.clarify],
                                  ["Expand", saved.expand],
                                  ["Change direction", saved.changeDirection],
                                  ["Slow down", saved.slowDown],
                                ].map(([label, phrase]) => (
                                  <div
                                    key={label}
                                    className="border-b border-white/[0.045] py-1.5 last:border-b-0"
                                  >
                                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/24">
                                      {label}
                                    </div>
                                    <div className="mt-0.5 text-[11px] leading-4 text-[#D7DBE4]/62">
                                      “{phrase}”
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNormalUtilityMenu((value) =>
                              value === "language" ? null : "language",
                            );
                          }}
                          className="rounded-full border border-[#3657A8]/48 bg-[#172347] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42 backdrop-blur-xl transition hover:border-[#5579D7]/70 hover:text-white/72"
                        >
                          {language === "English"
                            ? "EN"
                            : language === "Español"
                              ? "ES"
                              : language === "Français"
                                ? "FR"
                                : language === "العربية"
                                  ? "AR"
                                  : language === "中文"
                                    ? "ZH"
                                    : language === "日本語"
                                      ? "JA"
                                      : "EN"}
                        </button>

                        <button
                          type="button"
                          onClick={requestExitLiveMode}
                          aria-label="Leave LIVE"
                          title="Leave LIVE"
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-300/25 bg-red-950/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-red-100/78 shadow-[0_0_18px_rgba(248,113,113,0.10)] backdrop-blur-xl transition hover:border-red-200/45 hover:bg-red-950/50 hover:text-red-50 active:scale-[0.98]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-red-300/70 shadow-[0_0_8px_rgba(252,165,165,0.45)]" />
                          Exit
                        </button>
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (
                          showPreLiveSignalSurface &&
                          currentPreLiveQuestion &&
                          input.trim() &&
                          e.key === "Enter" &&
                          !e.shiftKey
                        ) {
                          e.preventDefault();
                          submitPreLiveSignalAnswer();
                          return;
                        }

                        handleComposerKeyDown(e);
                      }}
                      onFocus={() => {
                        setComposerFocused(true);
                        setComposerSendFeedback(false);
                      }}
                      onBlur={() => setComposerFocused(false)}
                      placeholder={composerFocused ? "" : composerPlaceholder}
                      rows={1}
                      onInput={autoResizeTextarea}
                      style={{
                        WebkitUserSelect: "text",
                        WebkitTouchCallout: "default",
                        touchAction: "manipulation",
                        minHeight: "40px",
                        maxHeight: "140px",
                      }}
                      className={`${forceLive || liveMode ? "min-h-[40px] pl-14 pr-[92px] py-2 md:min-h-[38px] md:pl-11 md:pr-[84px] md:py-2" : "min-h-[46px] pl-14 pr-[92px] py-2.5 md:min-h-[42px] md:pl-11 md:pr-[84px] md:py-2"} relative z-[2] pointer-events-auto touch-manipulation block w-full resize-none rounded-none border-0 bg-transparent text-[16px] leading-[1.35] font-normal tracking-[0.002em] text-[#F4F8FF]/92 shadow-none outline-none placeholder:italic placeholder:text-[#D7DBE4]/38 transition focus:border-0 focus:bg-transparent focus:outline-none focus:ring-0 md:text-[15px]`}
                    />

                    <div
                      className={`${forceLive || liveMode ? "hidden" : "absolute right-1 top-1/2 flex"} -translate-y-1/2 items-center gap-2`}
                    >
                      {(currentTier === "smart" ||
                        currentTier === "intelligent" ||
                        currentTier === "brilliant") && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (!voiceSupported || isThinking) return;

                              setInteractionMode("speech");
                              if (isListening) {
                                stopListening();
                                setInterimTranscript("");
                              } else {
                                startListening();
                              }
                            }}
                            disabled={!voiceSupported || isThinking}
                            className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#D7DBE4]/44 transition hover:text-[#D7DBE4]/82 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Voice"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4.5 w-4.5 fill-none stroke-current"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
                              <path d="M19 10a7 7 0 0 1-14 0" />
                              <path d="M12 17v4" />
                              <path d="M8 21h8" />
                            </svg>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (submitPreLiveSignalAnswer()) return;
                          handleSend();
                        }}
                        className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#D7DBE4]/42 transition hover:text-white"
                        aria-label="Share"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5 fill-none stroke-current"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 19V5" />
                          <path d="m5 12 7-7 7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showWalkthrough && (
          <div className="fixed inset-0 z-[95] bg-black george-motion-fade-soft/72 -[10px]  flex items-center justify-center px-4 ">
            <div className="w-full max-w-sm rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88  p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <p className="text-sm uppercase tracking-[0.18em] text-[#D7DBE4]/72 mb-2">
                Runtime
              </p>

              {walkthroughStep === 1 && (
                <p className="text-[#D7DBE4] text-sm leading-7">
                  Focus menu sets the room. Choose negotiation, interview,
                  debate, speech, study, or everyday pressure.
                </p>
              )}
              {walkthroughStep === 2 && (
                <p className="text-[#D7DBE4] text-sm leading-7">
                  Voice speed controls how fast GEORGE responds in your ear.
                </p>
              )}
              {walkthroughStep === 3 && (
                <p className="text-[#D7DBE4] text-sm leading-7">
                  Mic button lets GEORGE listen while you stay in motion.
                </p>
              )}
              {walkthroughStep === 4 && (
                <p className="text-[#D7DBE4] text-sm leading-7">
                  LIVE cues give fast lines, warnings, and framing in real time.
                </p>
              )}

              <div className="mt-5">
                {walkthroughStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setWalkthroughStep((s) => s + 1)}
                    className="w-full rounded-[1rem] max-w-full bg-white px-5 py-4 text-sm font-medium text-black"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.setItem(
                        "george_walkthrough_seen",
                        "1",
                      );
                      setShowWalkthrough(false);
                    }}
                    className="w-full rounded-[1rem] max-w-full bg-white px-5 py-4 text-sm font-medium text-black"
                  >
                    End
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showPersonalizeModal && (
          <div
            className="fixed inset-0 z-[92] flex items-end justify-center bg-black george-motion-fade-soft/68 px-4 -[10px] pb-4 "
            onClick={() => setShowPersonalizeModal(false)}
          >
            <div
              className="w-full max-w-[420px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[420px] md:max-w-[720px] xl:max-w-[920px] xl:max-w-[760px] max-h-[90vh] overflow-y-auto rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <p className="text-sm font-medium text-[#D7DBE4]">
                  Make GEORGE yours
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Optional. Same mind. Same standards. Choose GEORGE or
                  GEORGette, then keep the name or make it yours.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Voice
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 md:grid-cols-3 md:gap-3">
                    {[
                      { label: "Ash", value: "ash" },
                      { label: "Onyx", value: "onyx" },
                      { label: "Sage", value: "sage" },
                      { label: "Alloy", value: "alloy" },
                      { label: "Nova", value: "nova" },
                      { label: "Shimmer", value: "shimmer" },
                      { label: "Coral", value: "coral" },
                    ].map((voice) => (
                      <button
                        key={voice.value}
                        type="button"
                        onClick={() => setVoiceType(voice.value)}
                        className={`rounded-[1rem] border transition hover:scale-[1.01] px-5 py-4 text-sm ${
                          voiceType === voice.value
                            ? "border-white/[0.16] bg-white/[0.032] text-[#D7DBE4]"
                            : "border-white/[0.06] bg-black/28 text-neutral-500 hover:text-[#D7DBE4]"
                        }`}
                      >
                        {voice.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Name
                  </label>
                  <input
                    value={draftProfileName}
                    onChange={(e) => setDraftProfileName(e.target.value)}
                    placeholder=""
                    className="w-full rounded-[1rem] max-w-full border border-white/[0.07] bg-black/40 px-5 py-4 text-sm text-[#D7DBE4] outline-none transition placeholder:text-neutral-500 focus:border-white/[0.09]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (currentTier === "smart") return;

                    const cleanName = draftProfileName.trim().slice(0, 32);
                    setProfileName(cleanName);
                    window.localStorage.setItem("george_name", cleanName);
                    window.localStorage.setItem("george_voice_type", voiceType);
                    window.localStorage.setItem("george_personalized", "true");
                    window.localStorage.setItem("george_name_locked", "false");
                    window.localStorage.setItem("george_voice_locked", "false");
                    window.localStorage.setItem("george_walkthrough_seen", "1");
                    setShowPersonalizeModal(false);
                    setToastMessage("GEORGE is yours now.");
                    setShowToast(true);
                  }}
                  className="w-full rounded-[1rem] max-w-full bg-white px-5 py-4 text-sm font-medium text-black transition hover:opacity-55"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentTier === "smart") return;

                    window.localStorage.setItem("george_personalized", "true");
                    window.localStorage.setItem("george_name_locked", "false");
                    window.localStorage.setItem("george_voice_locked", "false");
                    window.localStorage.setItem("george_walkthrough_seen", "1");
                    setShowPersonalizeModal(false);
                    setToastMessage(
                      "Defaults kept. You can personalize later.",
                    );
                    setShowToast(true);
                  }}
                  className="w-full text-xs text-neutral-500 transition hover:text-[#D7DBE4]"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        )}

        {showTierModal &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              <button
                type="button"
                aria-label="Close access panel"
                onClick={() => setShowTierModal(false)}
                className="fixed inset-0 z-[200] cursor-default bg-black george-motion-fade-soft/45 backdrop-blur-[14px]"
              />

              <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto px-4 py-6">
                <div
                  className="pointer-events-auto w-full max-w-[390px] rounded-[1.35rem] border border-white/[0.07] bg-[#05070B]/86 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.52)] ring-1 ring-white/[0.025] backdrop-blur-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4">
                    <div className="inline-flex rounded-full border border-white/[0.055] bg-black/28 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/58">
                      GEORGE Access
                    </div>

                    <p className="mt-4 text-[12px] uppercase tracking-[0.22em] text-[#D7DBE4]/38">
                      {tierUpgradeAction.headline}
                    </p>

                    <p className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-[#F4F6FA]/94">
                      {tierUpgradeAction.currentLabel}
                    </p>
                  </div>

                  <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3.5">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DBE4]/32">
                      Includes
                    </div>

                    <div className="mt-3 grid gap-2">
                      {tierUpgradeAction.currentIncludes.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-[12px] leading-5 text-[#D7DBE4]/58"
                        >
                          <span className="h-1 w-1 rounded-full bg-[#AEB6FF]/54" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 rounded-[1rem] border border-[#AEB6FF]/[0.08] bg-[#AEB6FF]/[0.035] px-3.5 py-3 text-[12px] leading-5 text-[#D7DBE4]/52">
                    {tierUpgradeAction.nextCopy}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = tierUpgradeAction.href;
                    }}
                    className="mt-4 w-full rounded-full border border-white/[0.07] bg-[#D7DBE4]/88 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-[#05070B] transition hover:bg-white active:scale-[0.985]"
                  >
                    {tierUpgradeAction.cta}
                  </button>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.03] pt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTierModal(false);
                        setLoginEmailInput("");
                        setLoginLinkSent(false);
                        setShowUpgradeModal(true);
                      }}
                      className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
                    >
                      Restore access
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTierModal(false)}
                      className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )}

        {showUpgradeModal &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              <div
                role="button"
                tabIndex={0}
                aria-label="Close continuity panel"
                onClick={() => setShowUpgradeModal(false)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Escape" ||
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    setShowUpgradeModal(false);
                  }
                }}
                className="pointer-events-auto fixed inset-0 z-[200] bg-black george-motion-fade-soft/24 -[8px]"
              />

              <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center px-4 py-6 overflow-y-auto">
                <div
                  className="pointer-events-auto w-full max-w-[360px] rounded-[1.35rem] border border-white/[0.055] bg-[#05070B]/42 p-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.14)] ring-1 ring-white/[0.018] -[14px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4">
                    <div className="inline-flex rounded-full border border-white/[0.055] bg-black/28 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/58">
                      GEORGE Continuity
                    </div>

                    <p className="mt-4 text-[15px] font-medium text-[#F4F6FA]/92">
                      Restore this device.
                    </p>

                    <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/42">
                      A secured link verifies continuity, tier access, and LIVE
                      eligibility.
                    </p>
                  </div>

                  {loginLinkSent ? (
                    <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[12px] text-[#D7DBE4]">
                          ✓
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#D7DBE4]/90">
                            Link sent
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#D7DBE4]/42">
                            Check your email and open the GEORGE link.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setLoginLinkSent(false);
                          setLoginEmailInput("");
                        }}
                        className="mt-7 text-[11px] text-[#D7DBE4]/48 transition hover:text-[#D7DBE4]/80"
                      >
                        Use a different email
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-[1rem] border border-white/[0.05] bg-black/18 px-3.5 py-2.5">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D7DBE4]/38">
                          Email
                        </label>

                        <input
                          type="email"
                          value={loginEmailInput}
                          onChange={(event) =>
                            setLoginEmailInput(
                              event.target.value.trim().toLowerCase(),
                            )
                          }
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="mt-2 w-full bg-transparent text-sm text-[#D7DBE4] outline-none placeholder:text-[#D7DBE4]/22"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={loginSending}
                        onClick={async () => {
                          const email = loginEmailInput.trim().toLowerCase();

                          if (!email) {
                            setToastMessage("Enter your email first.");
                            setShowToast(true);
                            return;
                          }

                          setLoginSending(true);

                          try {
                            const response = await fetch(
                              "/api/continuity/request-link",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email }),
                              },
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              setToastMessage(
                                data?.error || "Unable to send login link.",
                              );
                              setShowToast(true);
                              return;
                            }

                            setLoginLinkSent(true);
                            setToastMessage("Secure link sent.");
                            setShowToast(true);
                          } catch {
                            setToastMessage("Unable to send login link.");
                            setShowToast(true);
                          } finally {
                            setLoginSending(false);
                          }
                        }}
                        className="w-full rounded-full border border-white/[0.07] bg-[#D7DBE4]/88 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-[#05070B] transition hover:bg-white disabled:opacity-45"
                      >
                        {loginSending ? "Sending…" : "Send secure link"}
                      </button>

                      <p className="px-1 text-[10.5px] leading-5 text-[#D7DBE4]/35">
                        Intelligent and Brilliant use verified continuity before
                        LIVE access.
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.03] pt-2.5">
                    <button
                      type="button"
                      onClick={redeemFounderCode}
                      className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
                    >
                      Founder code
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => window.open("/top-up", "_blank")}
                        className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
                      >
                        Options
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUpgradeModal(false)}
                        className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )}


        {activeCheckout &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              <button
                type="button"
                aria-label="Close activation"
                onClick={() => setActiveCheckout(null)}
                className="fixed inset-0 z-[240] bg-black george-motion-fade-soft/68 -[10px]"
              />

              <div className="fixed inset-0 z-[141] flex items-center justify-center px-4 py-6">
                <div className="w-full max-w-[430px]">
                  <GeorgePaymentElement
                    tier={activeCheckout}
                    onClose={() => setActiveCheckout(null)}
                    onLegacyCheckout={async (tier) => {
                      try {
                        const response = await fetch("/api/subscribe", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            tier,
                            email: subscriberEmail || undefined,
                          }),
                        });

                        const data = await response.json();

                        if (data?.url) {
                          window.location.href = data.url;
                          return;
                        }

                        setToastMessage(
                          data?.error || "Unable to open checkout.",
                        );
                        setShowToast(true);
                      } catch {
                        setToastMessage("Unable to open checkout.");
                        setShowToast(true);
                      }
                    }}
                  />
                </div>
              </div>
            </>,
            document.body,
          )}

        {showToast && (
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
            <div className="rounded-full border border-white/[0.05] bg-white/[0.018]/95 px-4 py-1.5 text-sm text-[#D7DBE4] shadow-[0_24px_72px_rgba(0,0,0,0.46)] ">
              {toastMessage}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
