"use client";
import { HomeHeroConversationTicker } from "@/components/home/HomeHeroConversationTicker";
import { RecommendedStrategyCard } from "@/components/george/live-entry/RecommendedStrategyCard";
import { FormulaScriptBrowserPanel } from "@/components/george/live-entry/FormulaScriptBrowserPanel";
import { ScriptCustomizationPanel } from "@/components/george/live-entry/ScriptCustomizationPanel";
import type {
  OperationalFormula,
  OperationalScript,
} from "@/lib/george/operational-memory/types";

type FormulaDecisionSource = "george" | "user";
import type {
  OperationalRecommendationApiResponse,
  OperationalRecommendationDto,
  OperationalRecommendationRequest,
} from "@/lib/george/operational-memory/recommendation-api";
import {
  GEORGE_PREPARATION_RESUME_EVENT_KEY,
  describeGeorgePreparationResume,
  parseGeorgePreparationResumeEvent,
} from "@/lib/george/live-entry/preparation-resume";

import {
  clearPreparationSession,
  clearLivePreparationPreviewReady,
  clearLivePreparationSignals,
  isLivePreparationPreviewReady,
  loadPreparationSession,
  markLivePreparationPreviewReady,
  savePreparationSession,
  saveLivePreparationSignals,
} from "@/lib/george/live-browser/live-preparation-browser-storage";

import Image from "next/image";
import BxPageHeader from "@/components/BxPageHeader";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  legacyAssistModeFromSupportStyle,
  normalizeLiveSupportStyle,
  type LiveSupportStyle,
} from "@/lib/george/live-runtime/support-style";
import {
  getActiveSessionForMode,
  getActiveSessionIdForMode,
  getSessionsForMode,
  updateSessionLinkage,
  setActiveMode,
  setActiveSessionIdForMode,
  type GeorgeStoredSession,
} from "@/lib/george/session/store";
import {
  fetchGeorgeSessionAuthority,
  readCachedGeorgeSessionAuthority,
} from "@/lib/george/session-authority";
import { getActiveRuntimeMotionContext } from "@/lib/george/operator/load-runtime-overlay";
import { RelevantDocumentationPanel } from "@/components/george/live/RelevantDocumentationPanel";
import type { PrepRoomResourceProfile } from "@/lib/george/prep-room/resources";
import { deriveRoomFormation } from "@/lib/george/live/prep-room";
import {
  DEFAULT_LIVE_RECOVERY_SELECTION,
  GEORGE_LIVE_RECOVERY_STORAGE_KEY,
  LIVE_ENTRY_RECOVERY_QUESTION,
  LIVE_RECOVERY_OPTIONS,
  normalizeLiveRecoverySelection,
  type LiveRecoveryOptionId,
} from "@/lib/george/live-voice/runtime/recovery-options";
import { buildOutcomeTestedBriefingSupport } from "@/lib/george/live-runtime/live-entry-briefing";
import {
  buildPreparationInteractions,
  createPreparationSession,
  normalizePreparationInteractions,
  normalizePreparationSession,
  resolveLivePreparationState,
  resolvePreparationSession,
  type PreparationCheckpoint,
  type PreparationSessionV1,
} from "@/lib/george/live-runtime/live-preparation-controller";
import { prepareConversationFromPackage } from "@/lib/george/preparation/runtime.mjs";
import {
  estimateResources,
  estimateWithResources,
  getPrepDocumentPrompt,
  type ResourceEstimate,
} from "@/lib/george/capabilities/live-entry-resources";
import {
  LIVE_RECEIVER_PROFILE_PANELS,
  LIVE_SUPPORT_PANELS,
  type LiveBriefingSupportPanelId,
  type LiveReceiverProfilePanelId,
} from "@/lib/george/capabilities/live-support-panels";
import { deriveLiveCapabilityIds } from "@/lib/george/capabilities/live-capability-registry";

import { LiveReceiverProfilePanel } from "@/components/george/live-entry/LiveReceiverProfilePanel";
import { LiveAdaptiveSupportPanel } from "@/components/george/live-entry/LiveAdaptiveSupportPanel";
import { LiveSpeakingStylePanel } from "@/components/george/live-entry/LiveSpeakingStylePanel";
import {
  buildBriefingObservation,
  buildNextBriefingBenefit,
  buildProofReply,
  cleanBriefingValue,
  titleBriefingValue,
} from "@/lib/george/live-entry/outcome-briefing-presentation";
import {
  resolveLiveEntry,
  validateLiveEntryPreparation,
  validateLiveEntryPreparationReturn,
  type HomepageLiveHandoff,
  type LiveEntryRoute,
} from "@/lib/george/live-entry/entry-resolution";

type HomepageBriefingHandoff = HomepageLiveHandoff & {
  workflowAction?: "continue_briefing" | "review_brief";
  conversationTypeId?: string;
  conversationGroup?: string;
  optionalSignals?: Record<string, string>;
  optionalQuestionHistory?: Record<string, string>;
  skippedOptionalQuestions?: string[];
  priorInteractions?: Array<{
    key: string;
    question: string;
    answer: string;
    status: "answered" | "skipped";
  }>;
  preparationSession?: unknown;
};

type LiveMechanicsSection = "support" | "receiver" | "speaking";
type QuickLiveSupportStyle = "advice" | "response";
type QuickLiveCommunicationMedium =
  | ""
  | "phone"
  | "video"
  | "in_person"
  | "written"
  | "other";
type QuickLiveSpeakingStyle = "Adaptive" | "Executive" | "Conversational";

const QUICK_LIVE_PLACEHOLDER_OUTCOMES = new Set([
  "in progress",
  "outcome not set",
  "outcome pending",
  "the desired outcome",
]);

function isValidQuickLiveDesiredOutcome(value: unknown) {
  const outcome = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "");

  return Boolean(outcome) && !QUICK_LIVE_PLACEHOLDER_OUTCOMES.has(outcome);
}

function resolveQuickLiveRecommendation(input: {
  desiredOutcome: string;
  context: string;
  audience: string;
  communicationMedium: QuickLiveCommunicationMedium;
  receiverEvidence: LiveReceiverProfilePanelId | "";
}) {
  const operationalSignal = [
    input.desiredOutcome,
    input.context,
    input.audience,
    input.communicationMedium,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const responseExecutionSignal =
    /answer|appointment|book|close|closing|objection|pitch|present|proposal|respond|response|sales|schedule|script|interview|negotiat|terms/.test(
      operationalSignal,
    );
  const supportStyle: QuickLiveSupportStyle = responseExecutionSignal
    ? "response"
    : "advice";

  const receiverProfile: LiveReceiverProfilePanelId =
    input.receiverEvidence || "visual_only";

  const executiveSignal =
    /board|business|buyer|commercial|decision.?maker|executive|founder|investor|leadership|manager|negotiat|professional|prospect|sales|stakeholder|vendor/.test(
      operationalSignal,
    );
  const conversationalSignal =
    /care|coach|customer service|family|friend|partner|patient|relationship|support|personal/.test(
      operationalSignal,
    );
  const speakingStyle: QuickLiveSpeakingStyle = executiveSignal
    ? "Executive"
    : conversationalSignal
      ? "Conversational"
      : "Adaptive";

  return {
    supportStyle,
    receiverProfile,
    speakingStyle,
  };
}

function resolveHomepageSupportRecommendation(
  signals: Record<string, unknown>,
  room: string,
) {
  const sessionSignal = [room, ...Object.values(signals)]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const presentationSession =
    /broadcast|camera|demo|interview|media|pitch|presentation|script|speech|teleprompter/.test(
      sessionSignal,
    );
  const executiveSession =
    /board|executive|founder|investor|leadership|negotiat|stakeholder/.test(
      sessionSignal,
    );
  const conversationalSession =
    /appointment|customer|discovery|network|recruit|relationship|service/.test(
      sessionSignal,
    );

  return {
    supportStyle: presentationSession ? "response" : "advice",
    receiverProfile: presentationSession ? "audio_visual" : "audio_only",
    communicationStyle: executiveSession
      ? "Executive"
      : conversationalSession
        ? "Conversational"
        : "Adaptive",
  } satisfies {
    supportStyle: LiveBriefingSupportPanelId;
    receiverProfile: LiveReceiverProfilePanelId;
    communicationStyle: string;
  };
}

type Tier = "smart" | "intelligent" | "brilliant";

type BriefingSpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type BriefingSpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<BriefingSpeechRecognitionResultLike>;
};

type BriefingSpeechRecognitionErrorLike = {
  error?: string;
};

type BriefingSpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: BriefingSpeechRecognitionEventLike) => void) | null;
  onerror: ((event: BriefingSpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type BriefingSpeechRecognitionConstructor =
  new () => BriefingSpeechRecognitionInstance;

declare global {
  interface Window {
    webkitSpeechRecognition?: BriefingSpeechRecognitionConstructor;
    SpeechRecognition?: BriefingSpeechRecognitionConstructor;
  }
}

type SelectOption = {
  label: string;
  helper?: string;
};

const CONVERSATION_TYPES: SelectOption[] = [
  { label: "Interview", helper: "answers, confidence, proof" },
  { label: "Meeting", helper: "clarity, timing, decisions" },
  { label: "Boardroom", helper: "numbers, pressure, executive framing" },
  { label: "Negotiation", helper: "leverage, restraint, asks" },
  { label: "Sales Call", helper: "objections, trust, close" },
  { label: "Doctor Appointment", helper: "questions, symptoms, advocacy" },
  { label: "Presentation", helper: "flow, points, recovery" },
  { label: "Everyday Conversation", helper: "tone, clarity, next words" },
  { label: "Other", helper: "custom room signal" },
];

const AUDIENCE_TYPES: SelectOption[] = [
  { label: "Executive", helper: "concise, proof-aware" },
  { label: "Investor", helper: "traction, risk, upside" },
  { label: "Recruiter", helper: "fit, experience, confidence" },
  { label: "Customer", helper: "value, objections, trust" },
  { label: "Physician", helper: "facts, symptoms, questions" },
  { label: "Spouse / Family", helper: "calm, honest, careful" },
  { label: "Regulator", helper: "precise, compliant, measured" },
  { label: "Audience / Crowd", helper: "clear, structured, steady" },
];

const PACING_OPTIONS: SelectOption[] = [
  { label: "Measured", helper: "slower, controlled" },
  { label: "Balanced", helper: "natural and clear" },
  { label: "Sharp", helper: "faster, compact" },
];

const SUPPORT_STYLE_OPTIONS: Array<SelectOption & { value: LiveSupportStyle }> =
  [
    {
      label: "Cue",
      value: "cue",
      helper: "brief support delivered at the right moment",
    },
    {
      label: "Continuation",
      value: "continue",
      helper: "GEORGE helps continue your thought",
    },
    {
      label: "Response",
      value: "response",
      helper: "complete answer when pressure or questions require it",
    },
    {
      label: "Presentation",
      value: "presentation",
      helper: "longer support for presenting or explaining",
    },
  ];

const COMMUNICATION_STYLE_OPTIONS: SelectOption[] = [
  { label: "Direct", helper: "clear and firm" },
  { label: "Diplomatic", helper: "careful, tactful, still effective" },
  {
    label: "Conciliatory",
    helper: "softens friction while preserving the goal",
  },
  { label: "Executive", helper: "brief, composed, high-authority" },
  { label: "Warm", helper: "human, reassuring, approachable" },
  { label: "Assertive", helper: "stronger posture without being reckless" },
  { label: "Neutral", helper: "balanced and factual" },
];

const DEFAULT_ROOM_PHRASES = [
  "That's fair.",
  "Help me understand that.",
  "Let's think through that.",
  "What's driving that concern?",
  "What am I missing?",
  "Can we unpack that?",
];

const POSITION_OPTIONS: SelectOption[] = [
  { label: "Seeking", helper: "trying to obtain an outcome" },
  { label: "Evaluating", helper: "assessing people or opportunities" },
  { label: "Deciding", helper: "making a decision" },
  { label: "Leading", helper: "guiding the room" },
  { label: "Negotiating", helper: "maximizing terms or leverage" },
  { label: "Advising", helper: "improving another person’s outcome" },
];

const CHAIR_OPTIONS: SelectOption[] = [
  { label: "Founder", helper: "execution, risk, adoption, momentum" },
  { label: "Operator", helper: "systems, process, execution" },
  { label: "Investor", helper: "risk, return, future value" },
  { label: "Candidate", helper: "fit, proof, confidence" },
  { label: "Board Member", helper: "oversight, governance, allocation" },
  { label: "Buyer", helper: "value, terms, risk" },
  { label: "Seller", helper: "positioning, leverage, close" },
  { label: "Patient", helper: "facts, symptoms, questions" },
  { label: "Parent", helper: "care, judgment, responsibility" },
  { label: "Advisor", helper: "clarity, tradeoffs, protection" },
  { label: "Other", helper: "custom position" },
];

const OBSERVED_REALITY_EXAMPLES: Record<string, string> = {
  Founder: "The investor wants board control.",
  Operator: "The team missed the deadline.",
  Investor: "The valuation feels too high.",
  Candidate: "The interviewer challenged my experience.",
  "Board Member": "The risk is not clearly explained.",
  Buyer: "The terms feel unclear.",
  Seller: "The buyer is hesitating on price.",
  Patient: "The treatment options seem different.",
  Parent: "My child is shutting down instead of talking.",
  Advisor: "The client is missing the tradeoff.",
  Other: "Something changed that affects the outcome.",
};

function CompactSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[0.82rem] border border-white/[0.04] bg-[#0A0C10] px-3 py-2">
      <span className="block text-[10px] uppercase tracking-[0.22em] text-white/22">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full appearance-none bg-transparent text-[15px] font-medium text-white/78 outline-none"
      >
        {options.map((option) => (
          <option
            key={option.label}
            value={option.label}
            className="bg-[#090B10] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      <span className="mt-1 block text-[12px] leading-5 text-white/34">
        {options.find((option) => option.label === value)?.helper}
      </span>
    </label>
  );
}

function PanelShell({
  label,
  title,
  stage,
  onBack,
  children,
}: {
  label: string;
  title: string;
  stage: 1 | 2 | 3;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-black px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="relative z-10 mx-auto w-full max-w-[760px]">
        <div className="flex items-center">
          <BxPageHeader
            backLabel="BACK"
            onBack={onBack}
            backClassName={stage === 1 ? "george-motion-fade" : ""}
            backTone={stage === 3 ? "silver" : "blue"}
          />
        </div>

        <div className="mt-14 sm:mt-20">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/34">
            {label}
          </div>

          <h1 className="mt-3 max-w-[680px] font-mono text-[25px] leading-[1.55] tracking-[-0.025em] text-white/92 sm:text-[30px]">
            {title}
          </h1>

          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes georgePopupGlideIn {
          from {
            transform: translateY(8px);
            opacity: 0;
          }

          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .george-popup-glide-in {
          animation: georgePopupGlideIn 180ms
            var(--george-motion-ease) both;
        }

        @keyframes georgePopupSettle {
          0% {
            transform: translateY(9px);
            opacity: 0;
            box-shadow: 0 0 0 rgba(175, 192, 255, 0);
          }

          28% {
            transform: translateY(0);
            opacity: 1;
            box-shadow: 0 0 0 rgba(175, 192, 255, 0);
          }

          43% {
            box-shadow:
              0 0 0 1px rgba(175, 192, 255, 0.18),
              0 0 18px rgba(175, 192, 255, 0.11);
          }

          55% {
            box-shadow: 0 0 0 rgba(175, 192, 255, 0);
          }

          69% {
            box-shadow:
              0 0 0 1px rgba(175, 192, 255, 0.14),
              0 0 15px rgba(175, 192, 255, 0.08);
          }

          82%,
          100% {
            transform: translateY(0);
            opacity: 1;
            box-shadow: 0 0 0 rgba(175, 192, 255, 0);
          }
        }

        .george-popup-settle {
          animation: georgePopupSettle 520ms
            var(--george-motion-ease) both;
          will-change: transform, opacity, box-shadow;
        }

        @media (prefers-reduced-motion: reduce) {
          .george-popup-glide-in,
          .george-popup-settle {
            animation: none !important;
            will-change: auto;
          }
        }
      `}</style>
    </main>
  );
}

function AwakeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      variant="primary"
      size="md"
      disabled={!active}
      onClick={onClick}
      className="mt-4 w-full rounded-[12px] px-4 py-2.5 text-center text-[10px] uppercase tracking-[0.19em] disabled:text-white/20"
    >
      {children}
    </Button>
  );
}

type LiveEntryRuntimeSupportStyle =
  "advice" | "continue" | "response" | "expandedLine";

function toRuntimeSupportStyle(
  style: LiveBriefingSupportPanelId,
): LiveEntryRuntimeSupportStyle {
  if (style === "completion") return "continue";
  if (style === "presentation") return "expandedLine";
  if (style === "response") return "response";
  return "advice";
}

type LiveRoomObjectiveOptionId =
  | "project_strength"
  | "build_trust"
  | "find_leverage"
  | "find_common_ground"
  | "surface_objections"
  | "confirm_authority"
  | "confirm_concern"
  | "confirm_timeline"
  | "other";

type LiveBriefingSupportPanel = {
  id: LiveBriefingSupportPanelId;
  label: string;
  defaultLine: string;
  body: string;
  examples: string[];
  why: string;
};

function buildLiveBriefingSupportPanels({
  room: _room,
  audience: _audience,
  objective: _objective,
  position: _position,
}: {
  room: string;
  audience: string;
  objective: string;
  position: string;
}): LiveBriefingSupportPanel[] {
  return [
    {
      id: "advice",
      label: "Adaptive support",
      defaultLine: "Default: observational advice.",
      body: "As the conversation develops, I may help you notice pressure, uncertainty, drift, unanswered questions, changing commitment, or moments where returning to the outcome would be useful.",
      examples: [
        "I think I would ask another question.",
        "They seem uncertain about that.",
        "I would bring this back to the outcome.",
      ],
      why: "GEORGE reasons from the objective, available signal, and what changes in the room—not from a separate room-specific playbook.",
    },
    {
      id: "completion",
      label: "Continue",
      defaultLine: "Default: concise continuation.",
      body: "If you want help continuing a thought, I may suggest the next useful sentence while preserving your meaning, the desired outcome, and your control.",
      examples: [
        "You: “What matters most here…”",
        "GEORGE: “…is making sure we are solving the right problem.”",
        "Use it exactly, adjust it, or ignore it.",
      ],
      why: "Continuation supports the same outcome-oriented reasoning without creating facts or replacing your judgment.",
    },
    {
      id: "steering",
      label: "Adjustments",
      defaultLine: "Optional: natural phrases.",
      body: "You do not need steering phrases. Natural phrases such as “let me think,” “help me understand,” or “one second” can provide additional signal about pace, clarity, or whether support should pause.",
      examples: [
        "“Let me think” can signal: slow down.",
        "“Help me understand” can signal: clarify.",
        "“One second” can signal: hold support.",
      ],
      why: "Steering phrases add signal to one GEORGE runtime; they do not switch to another intelligence or strategy engine.",
    },
  ];
}

export default function LiveEntryClient() {
  const [ready, setReady] = useState(false);
  const [liveEntryRoute, setLiveEntryRoute] =
    useState<LiveEntryRoute>("direct");
  const [isFreshTraditionalPreparation, setIsFreshTraditionalPreparation] =
    useState(false);
  const [
    priorPreparationExplicitlyRestored,
    setPriorPreparationExplicitlyRestored,
  ] = useState(false);
  const [tier, setTier] = useState<Tier>("smart");
  const [conversationType, setConversationType] = useState("Meeting");
  const [customConversationType, setCustomConversationType] = useState("");
  const [audienceType, setAudienceType] = useState("Executive");
  const [pacing, setPacing] = useState("Balanced");
  const [selectedSupportStyle, setSelectedSupportStyle] =
    useState<LiveSupportStyle>("cue");
  const [communicationStyle, setCommunicationStyle] = useState("Diplomatic");
  const [objective, setObjective] = useState("");
  const [userPosition, setUserPosition] = useState("Seeking");
  const [chairs, setChairs] = useState<string[]>([]);
  const [customChair, setCustomChair] = useState("");
  const [knownContext, setKnownContext] = useState("");
  const observedRealityPlaceholder =
    OBSERVED_REALITY_EXAMPLES[chairs[0] || "Other"] ||
    OBSERVED_REALITY_EXAMPLES.Other;
  const [sessionEmail, setSessionEmail] = useState("");
  const [relatedSessionId, setRelatedSessionId] = useState("not_related");
  const [relatedSessions, setRelatedSessions] =
    useState<GeorgeStoredSession[]>([]);
  const [liveBriefingReadyToContinue, setLiveBriefingReadyToContinue] =
    useState(false);
  const liveBriefingTermsPreviouslyAcceptedRef = useRef(false);
  const liveBriefingHasReopenedEditsRef = useRef(false);
  const liveBriefingConfirmSequenceRef = useRef(0);
  const liveReadyConfirmSequenceRef = useRef(0);
  const liveEntryAudioRef = useRef<HTMLAudioElement | null>(null);
  const liveEntryAudioUrlRef = useRef<string | null>(null);
  const liveEntrySpeechRequestRef = useRef(0);
  const traditionalPreparationIdentityRef = useRef<{
    preparationSessionId: string;
    createdAt: number;
  } | null>(null);
  const quickLivePreparationIdentityRef = useRef<{
    preparationSessionId: string;
    createdAt: number;
  } | null>(null);
  const homepagePreparationSeedRef = useRef<PreparationSessionV1 | null>(null);
  const normalPreparationSeedRef = useRef<PreparationSessionV1 | null>(null);
  const liveBriefingRoomSignalEditedRef = useRef(false);
  const generatedBriefingRoomSignalRef = useRef("");
  const [liveBriefingEditAcknowledged, setLiveBriefingEditAcknowledged] =
    useState(false);
  const liveBriefingOriginalSignalRef = useRef({
    objective: "",
    userPosition: "",
    audienceType: "",
    knownContext: "",
  });
  const [prepDocument, setPrepDocument] = useState<{
    name: string;
    summary: string;
    kind: string;
  } | null>(null);
  const [prepDocumentReading, setPrepDocumentReading] = useState(false);
  const [controlWords, setControlWords] = useState(
    DEFAULT_ROOM_PHRASES.join(", "),
  );
  const useRoomPhrases = true;
  const customRoomPhrases = "";
  const [showResumeConversationList, setShowResumeConversationList] =
    useState(false);
  const [showLiveBriefingRoom, setShowLiveBriefingRoom] = useState(false);
  const [liveBriefingStep, setLiveBriefingStep] = useState<1 | 2 | 3>(1);
  const [livePrepOpenSection, setLivePrepOpenSection] = useState<
    "formula" | "receiver" | "support" | "brief" | "ready"
  >("support");
  const [traditionalFormulaDetailsOpen, setTraditionalFormulaDetailsOpen] =
    useState(false);
  const [traditionalResourcesOpen, setTraditionalResourcesOpen] =
    useState(false);
  const [traditionalMechanicsCollapsed, setTraditionalMechanicsCollapsed] =
    useState(false);
  const [readyRoomTypedPrompt, setReadyRoomTypedPrompt] = useState("");
  const [readyRoomPromptComplete, setReadyRoomPromptComplete] =
    useState(false);

  type ReadyRoomSequenceStep =
    | "room"
    | "formula"
    | "authority"
    | "complete";

  const [readyRoomSequenceStep, setReadyRoomSequenceStep] =
    useState<ReadyRoomSequenceStep>("room");

  const [readyRoomCompletedSteps, setReadyRoomCompletedSteps] = useState<
    ReadyRoomSequenceStep[]
  >([]);

  const completeReadyRoomSequenceStep = (
    step: ReadyRoomSequenceStep,
    next: ReadyRoomSequenceStep,
  ) => {
    setReadyRoomCompletedSteps((current) =>
      current.includes(step) ? current : [...current, step],
    );

    window.setTimeout(() => {
      setReadyRoomSequenceStep(next);
    }, 190);
  };

  const reopenReadyRoomSequenceStep = (step: ReadyRoomSequenceStep) => {
    const order: ReadyRoomSequenceStep[] = [
      "room",
      "formula",
      "authority",
    ];

    const index = order.indexOf(step);

    setReadyRoomCompletedSteps((current) =>
      current.filter((candidate) => {
        const candidateIndex = order.indexOf(candidate);
        return candidateIndex >= 0 && candidateIndex < index;
      }),
    );

    if (step === "authority") {
      setLiveRecoveryAcknowledged(false);
    }

    setReadyRoomPromptComplete(false);
    setReadyRoomSequenceStep(step);
  };
  const [preparationResumeMessage, setPreparationResumeMessage] =
    useState("");
  type LivePreparationWorkflowState =
    | "questions"
    | "popup1"
    | "brief_review"
    | "premium_briefing"
    | "mechanics"
    | "prep";

  const livePreparationHistoryRef = useRef<LivePreparationWorkflowState[]>([]);
  const returnToReadyRoomAfterBriefingRef = useRef(false);

  const pushLivePreparationState = (
    state: LivePreparationWorkflowState,
  ) => {
    const history = livePreparationHistoryRef.current;
    if (history[history.length - 1] === state) return;
    history.push(state);
  };

  const transitionToLivePreparationState = ({
    previousState,
    nextStep,
  }: {
    previousState: LivePreparationWorkflowState;
    nextStep: 1 | 2 | 3;
  }) => {
    pushLivePreparationState(previousState);
    setShowLiveBriefingRoom(true);
    setLiveBriefingStep(nextStep);
  };

  const restoreValidatedNormalOrigin = () => {
    if (typeof window === "undefined") return false;

    const preparationSession = normalPreparationSeedRef.current;
    const normalSessionId = String(
      preparationSession?.relations.normalSessionId || "",
    ).trim();

    if (
      preparationSession?.provenance.entrySource !== "normal" ||
      !normalSessionId ||
      !getSessionsForMode("normal").some(
        (session) => session.id === normalSessionId,
      )
    ) {
      return false;
    }

    setActiveSessionIdForMode("normal", normalSessionId);
    setActiveMode("normal");

    const referrerReturnsToGeorge = (() => {
      try {
        const referrer = new URL(window.document.referrer);
        return (
          referrer.origin === window.location.origin &&
          referrer.pathname === "/george"
        );
      } catch {
        return false;
      }
    })();

    if (referrerReturnsToGeorge && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/george";
    }

    return true;
  };

  const linkNormalPreparationSurface = (
    surface: "preparation" | "live" | "post_live",
  ) => {
    const preparationSession = normalPreparationSeedRef.current;
    const normalSessionId = String(
      preparationSession?.relations.normalSessionId || "",
    ).trim();

    if (!normalSessionId || !preparationSession?.preparationSessionId) {
      return;
    }

    updateSessionLinkage(normalSessionId, {
      preparationSessionId: preparationSession.preparationSessionId,
      surface,
    });
  };

  const goToPreviousLivePreparationState = () => {
    const previous = livePreparationHistoryRef.current.pop();

    if (previous === "questions") {
      setShowLiveBriefingRoom(false);
      setLiveEntryReadyMessageVisible(false);
      setShowOpenAISignalSurface(true);
      return;
    }

    if (previous === "popup1") {
      setShowLiveBriefingRoom(true);
      setLiveBriefingStep(1);
      return;
    }

    if (previous === "mechanics") {
      setShowLiveBriefingRoom(true);
      setLiveBriefingStep(2);
      return;
    }

    if (previous === "prep") {
      setShowLiveBriefingRoom(true);
      setLiveBriefingStep(3);
      return;
    }

    if (previous === "brief_review") {
      window.location.href = "/?restore=brief-review";
      return;
    }

    if (previous === "premium_briefing") {
      setShowLiveBriefingRoom(false);
      setLiveEntryReadyMessageVisible(false);
      setShowOpenAISignalSurface(true);
      return;
    }

    if (restoreValidatedNormalOrigin()) return;

    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  };
  const [liveBriefingOpenSection, setLiveBriefingOpenSection] = useState<
    | "outcome"
    | "responsibility"
    | "participants"
    | "context"
    | "additional"
    | "documents"
    | null
  >(null);
  const [liveBriefingSignalsExpanded, setLiveBriefingSignalsExpanded] =
    useState(false);
  const [liveBriefingToaAccepted, setLiveBriefingToaAccepted] = useState(false);
  const [liveBriefingSupportAccepted, setLiveBriefingSupportAccepted] =
    useState(false);
  const [liveRecoveryOptions, setLiveRecoveryOptions] = useState<
    LiveRecoveryOptionId[]
  >(DEFAULT_LIVE_RECOVERY_SELECTION);
  const [liveRecoveryAcknowledged, setLiveRecoveryAcknowledged] =
    useState(false);
  const [liveRecoveryAcknowledgementOpen, setLiveRecoveryAcknowledgementOpen] =
    useState(false);
  const [
    liveBriefingCapabilitiesConfirmed,
    setLiveBriefingCapabilitiesConfirmed,
  ] = useState(false);
  const [liveBriefingActiveSupportStyle, setLiveBriefingActiveSupportStyle] =
    useState<LiveBriefingSupportPanelId | null>(null);
  const [selectedReceiverProfile, setSelectedReceiverProfile] =
    useState<LiveReceiverProfilePanelId>("audio_only");
  const [receiverProfileConfirmed, setReceiverProfileConfirmed] =
    useState(false);
  const [liveBriefingOpenMechanicsPanel, setLiveBriefingOpenMechanicsPanel] =
    useState<LiveMechanicsSection | null>(null);
  const [
    liveBriefingExpandedSupportPanel,
    setLiveBriefingExpandedSupportPanel,
  ] = useState<LiveBriefingSupportPanelId | null>(null);
  const [
    liveBriefingCommunicationConfirmed,
    setLiveBriefingCommunicationConfirmed,
  ] = useState(false);
  const [showQuickLiveSetup, setShowQuickLiveSetup] = useState(false);
  const [quickLiveDesiredOutcome, setQuickLiveDesiredOutcome] = useState("");
  const [quickLiveContext, setQuickLiveContext] = useState("");
  const [quickLiveAudience, setQuickLiveAudience] = useState("");
  const [quickLiveCommunicationMedium, setQuickLiveCommunicationMedium] =
    useState<QuickLiveCommunicationMedium>("");
  const [quickLiveReceiverEvidence, setQuickLiveReceiverEvidence] = useState<
    LiveReceiverProfilePanelId | ""
  >("");
  const [quickLiveSupportOverride, setQuickLiveSupportOverride] =
    useState<QuickLiveSupportStyle | null>(null);
  const [quickLiveReceiverOverride, setQuickLiveReceiverOverride] =
    useState<LiveReceiverProfilePanelId | null>(null);
  const [quickLiveSpeakingOverride, setQuickLiveSpeakingOverride] =
    useState<QuickLiveSpeakingStyle | null>(null);
  const [quickLiveSupportOpen, setQuickLiveSupportOpen] = useState(false);
  const [quickLiveReceiverOpen, setQuickLiveReceiverOpen] = useState(false);
  const [quickLiveSpeakingOpen, setQuickLiveSpeakingOpen] = useState(false);
  const [quickLiveValidationError, setQuickLiveValidationError] = useState("");
  const [quickLiveSteeringOpen, setQuickLiveSteeringOpen] = useState(false);
  const [quickLiveSteeringPhrases, setQuickLiveSteeringPhrases] = useState<
    Record<string, string>
  >({
    buyTime: "Let me think for a second...",
    clarify: "I want to make sure I understand.",
    expand: "Walk me through that.",
    changeDirection: "What matters now is...",
    slowDown: "Can we slow down?",
  });
  const quickLiveRecommendation = resolveQuickLiveRecommendation({
    desiredOutcome: quickLiveDesiredOutcome,
    context: quickLiveContext,
    audience: quickLiveAudience,
    communicationMedium: quickLiveCommunicationMedium,
    receiverEvidence: quickLiveReceiverEvidence,
  });
  const quickLiveSupportStyle =
    quickLiveSupportOverride || quickLiveRecommendation.supportStyle;
  const quickLiveReceiverProfile =
    quickLiveReceiverOverride || quickLiveRecommendation.receiverProfile;
  const quickLiveSpeakingStyle =
    quickLiveSpeakingOverride || quickLiveRecommendation.speakingStyle;
  const [liveReadyAccepted, setLiveReadyAccepted] = useState(false);
  const [liveReadinessComplete, setLiveReadinessComplete] = useState(false);
  const [liveRoomObjectiveOption, setLiveRoomObjectiveOption] = useState<
    LiveRoomObjectiveOptionId | ""
  >("");
  const [customLiveRoomObjective, setCustomLiveRoomObjective] = useState("");
  const [editableResources, setEditableResources] = useState<string[]>([]);
  const [runtimeMotionContext, setRuntimeMotionContext] = useState<unknown>(null);
  const [
    operationalRecommendation,
    setOperationalRecommendation,
  ] = useState<OperationalRecommendationDto | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [selectedFormula, setSelectedFormula] =
    useState<OperationalFormula | null>(null);
  const [selectedFormulaSource, setSelectedFormulaSource] =
    useState<FormulaDecisionSource | null>(null);
  const [selectedScript, setSelectedScript] =
    useState<OperationalScript | null>(null);
  const [sourceScript, setSourceScript] =
    useState<OperationalScript | null>(null);
  const [customizedScript, setCustomizedScript] =
    useState<OperationalScript | null>(null);
  const [scriptCustomizationOpen, setScriptCustomizationOpen] =
    useState(false);
  const [scriptBrowserFormula, setScriptBrowserFormula] =
    useState<OperationalFormula | null>(null);
  const [scriptBrowserOpen, setScriptBrowserOpen] = useState(false);
  const [scriptBrowserLoading, setScriptBrowserLoading] = useState(false);
  const [formulaScripts, setFormulaScripts] = useState<OperationalScript[]>([]);
  const [scriptBrowserError, setScriptBrowserError] = useState("");

  const [optionalSignalAnswers, setOptionalSignalAnswers] = useState<
    Record<string, string>
  >({});
  const [optionalSignalQuestionHistory, setOptionalSignalQuestionHistory] =
    useState<Record<string, string>>({});
  const [skippedOptionalSignalKeys, setSkippedOptionalSignalKeys] = useState<
    string[]
  >([]);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("return") !== "live-prep") return;

    const restoreTimer = window.setTimeout(() => {
      try {
        const rawSnapshot = window.sessionStorage.getItem(
          "GEORGE_LIVE_PREP_RETURN_STATE",
        );

        if (!rawSnapshot) return;

        const snapshot = JSON.parse(rawSnapshot) as {
          livePrepOpenSection?: "formula" | "receiver" | "support" | "brief" | "ready";
          liveBriefingSupportAccepted?: boolean;
          liveBriefingActiveSupportStyle?: LiveBriefingSupportPanelId | null;
          selectedReceiverProfile?: LiveReceiverProfilePanelId;
          receiverProfileConfirmed?: boolean;
          communicationStyle?: string;
          liveBriefingCommunicationConfirmed?: boolean;
          liveRecoveryAcknowledged?: boolean;
          liveBriefingCapabilitiesConfirmed?: boolean;
          selectedFormula?: OperationalFormula | null;
          selectedFormulaSource?: FormulaDecisionSource | null;
          selectedScript?: OperationalScript | null;
          sourceScript?: OperationalScript | null;
          customizedScript?: OperationalScript | null;
          scriptBrowserOpen?: boolean;
          scriptBrowserFormula?: OperationalFormula | null;
          optionalSignalAnswers?: Record<string, string>;
          optionalSignalQuestionHistory?: Record<string, string>;
          skippedOptionalSignalKeys?: string[];
          livePreparationHistory?: LivePreparationWorkflowState[];
          preparationSession?: unknown;
          georgeSessionId?: string;
          preparationSessionId?: string;
        };

        const snapshotPreparationSession = normalizePreparationSession(
          snapshot.preparationSession,
        );
        const source = new URLSearchParams(window.location.search).get(
          "source",
        );
        const preparationSessionId = params.get("preparationSessionId");
        const normalSessionId = params.get("normalSessionId");
        const activeNormalSession = getActiveSessionForMode("normal");
        const restoredPreparationSession =
          validateLiveEntryPreparationReturn({
            source,
            preparationSessionId,
            normalSessionId,
            activeNormalSessionId: activeNormalSession?.id,
            snapshotPreparation: snapshotPreparationSession,
            storedPreparation: loadPreparationSession(),
          });

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("return");
        window.history.replaceState({}, "", cleanUrl.toString());

        if (!restoredPreparationSession) return;

        if (source === "homepage") {
          homepagePreparationSeedRef.current = restoredPreparationSession;
        } else if (source === "start") {
          const resolvedTraditionalPreparation = resolvePreparationSession(
            restoredPreparationSession,
          );
          const traditionalSignals =
            resolvedTraditionalPreparation.signals;
          const traditionalRoom = String(
            restoredPreparationSession.knowledge.conversation.title || "",
          ).trim();
          const traditionalAudience = String(
            restoredPreparationSession.knowledge.audience ||
              traditionalSignals.counterparty ||
              "",
          ).trim();
          const traditionalRole = String(
            restoredPreparationSession.knowledge.role ||
              traditionalSignals.role ||
              "",
          ).trim();

          traditionalPreparationIdentityRef.current = {
            preparationSessionId:
              restoredPreparationSession.preparationSessionId,
            createdAt: restoredPreparationSession.createdAt,
          };
          setPreLiveSignals(traditionalSignals);
          setObjective(restoredPreparationSession.knowledge.objective);
          setKnownContext(
            restoredPreparationSession.knowledge.knownContext || "",
          );
          if (traditionalRoom) {
            const knownRoom = CONVERSATION_TYPES.some(
              (option) => option.label === traditionalRoom,
            );
            setConversationType(knownRoom ? traditionalRoom : "Other");
            if (!knownRoom) setCustomConversationType(traditionalRoom);
          }
          if (traditionalAudience) setAudienceType(traditionalAudience);
          if (traditionalRole) setUserPosition(traditionalRole);
          if (restoredPreparationSession.support.runtimePreferences.pacing) {
            setPacing(
              restoredPreparationSession.support.runtimePreferences.pacing,
            );
          }
          if (
            restoredPreparationSession.support.runtimePreferences
              .recoveryOptionIds.length > 0
          ) {
            setLiveRecoveryOptions(
              normalizeLiveRecoverySelection(
                restoredPreparationSession.support.runtimePreferences
                  .recoveryOptionIds,
              ),
            );
          }
          setIsFreshTraditionalPreparation(true);
        } else {
          normalPreparationSeedRef.current = restoredPreparationSession;
          linkNormalPreparationSurface("preparation");
        }

        savePreparationSession(restoredPreparationSession);

        setShowLiveBriefingRoom(true);
        setLiveBriefingStep(3);
        setLivePrepOpenSection(snapshot.livePrepOpenSection || "formula");
        setLiveBriefingSupportAccepted(
          Boolean(snapshot.liveBriefingSupportAccepted),
        );
        setLiveBriefingActiveSupportStyle(
          snapshot.liveBriefingActiveSupportStyle ?? null,
        );

        if (snapshot.selectedReceiverProfile) {
          setSelectedReceiverProfile(snapshot.selectedReceiverProfile);
        }
        setReceiverProfileConfirmed(
          Boolean(snapshot.receiverProfileConfirmed),
        );

        if (snapshot.communicationStyle) {
          setCommunicationStyle(snapshot.communicationStyle);
        }
        setLiveBriefingCommunicationConfirmed(
          Boolean(snapshot.liveBriefingCommunicationConfirmed),
        );
        setLiveRecoveryAcknowledged(
          Boolean(snapshot.liveRecoveryAcknowledged),
        );
        setLiveBriefingCapabilitiesConfirmed(
          Boolean(snapshot.liveBriefingCapabilitiesConfirmed),
        );

        setSelectedFormula(snapshot.selectedFormula ?? null);
        setSelectedFormulaSource(snapshot.selectedFormulaSource ?? null);
        setSelectedScript(snapshot.selectedScript ?? null);
        setSourceScript(snapshot.sourceScript ?? null);
        setCustomizedScript(snapshot.customizedScript ?? null);
        setScriptBrowserOpen(Boolean(snapshot.scriptBrowserOpen));
        setScriptBrowserFormula(snapshot.scriptBrowserFormula ?? null);

        if (snapshot.optionalSignalAnswers) {
          setOptionalSignalAnswers(snapshot.optionalSignalAnswers);
        }

        if (snapshot.optionalSignalQuestionHistory) {
          setOptionalSignalQuestionHistory(
            snapshot.optionalSignalQuestionHistory,
          );
        }

        if (Array.isArray(snapshot.skippedOptionalSignalKeys)) {
          setSkippedOptionalSignalKeys(snapshot.skippedOptionalSignalKeys);
        }

        if (Array.isArray(snapshot.livePreparationHistory)) {
          livePreparationHistoryRef.current = snapshot.livePreparationHistory;
        }

        const rawResumeEvent = window.sessionStorage.getItem(
          GEORGE_PREPARATION_RESUME_EVENT_KEY,
        );
        const resumeEvent = parseGeorgePreparationResumeEvent(
          rawResumeEvent ? JSON.parse(rawResumeEvent) : null,
        );

        if (resumeEvent) {
          setPreparationResumeMessage(
            describeGeorgePreparationResume(resumeEvent),
          );
          window.sessionStorage.removeItem(
            GEORGE_PREPARATION_RESUME_EVENT_KEY,
          );
        }

      } catch (error) {
        console.warn(
          "[GEORGE][LIVE_ENTRY][PREP_RETURN_RESTORE_FAILED]",
          error,
        );
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);
  const [prepRoomProfile, setPrepRoomProfile] =
    useState<PrepRoomResourceProfile | null>(null);
  const [preLiveSignals, setPreLiveSignals] = useState<Record<string, string>>(
    {},
  );
  const [optionalSignalInput, setOptionalSignalInput] = useState("");
  const [showOpenAISignalSurface, setShowOpenAISignalSurface] = useState(false);
  const [typedOptionalSignalQuestion, setTypedOptionalSignalQuestion] =
    useState("");
  const [traditionalBriefingProductThought, setTraditionalBriefingProductThought] =
    useState("");
  const [traditionalBriefingProductThoughtVisible, setTraditionalBriefingProductThoughtVisible] =
    useState(false);
  const [currentOptionalSignalQuestion, setCurrentOptionalSignalQuestion] =
    useState<{
      key: string;
      label: string;
      question: string;
      why: string;
      example: string;
    } | null>(null);
  const [optionalSignalLoading, setOptionalSignalLoading] = useState(false);
  const [optionalSignalComplete, setOptionalSignalComplete] = useState(false);
  const [traditionalBriefingExamples, setTraditionalBriefingExamples] =
    useState<string[]>([]);
  const [
    traditionalBriefingAskGeorgeActive,
    setTraditionalBriefingAskGeorgeActive,
  ] = useState(false);
  const [
    traditionalBriefingGeorgeResponse,
    setTraditionalBriefingGeorgeResponse,
  ] = useState("");
  const [
    traditionalBriefingExampleIndex,
    setTraditionalBriefingExampleIndex,
  ] = useState(0);
  const [preLivePreviewReady, setPreLivePreviewReady] = useState(false);
  const [liveEntryReadyMessageVisible, setLiveEntryReadyMessageVisible] =
    useState(false);

  const [proofTranscript, setProofTranscript] = useState<
    Array<{ speaker: "george" | "user"; text: string }>
  >([{ speaker: "george", text: "Are you satisfied?" }]);
  const [proofInProgress, setProofInProgress] = useState(false);
  const [proofComplete, setProofComplete] = useState(false);
  const [liveEntryReasoning, setLiveEntryReasoning] = useState({
    roomObservation: "",
    supportSummary: "",
    commitmentStatement: "",
  });

  const toggleChair = (value: string) => {
    setChairs((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value);
        return next.length ? next : current;
      }

      return [...current, value];
    });
  };

  const toggleLiveRecoveryOption = (option: LiveRecoveryOptionId) => {
    setLiveRecoveryAcknowledged(false);
    setLiveRecoveryOptions((current) => {
      if (option === "none_realistic") {
        return current.includes("none_realistic") ? [] : ["none_realistic"];
      }

      const withoutNone = current.filter((item) => item !== "none_realistic");
      if (withoutNone.includes(option)) {
        const next = withoutNone.filter((item) => item !== option);
        return next.length ? next : DEFAULT_LIVE_RECOVERY_SELECTION;
      }

      return Array.from(new Set([...withoutNone, option]));
    });
  };

  const chair = chairs
    .map((item) =>
      item === "Other" && customChair.trim() ? customChair.trim() : item,
    )
    .join(" + ");

  useEffect(() => {
    if (!showOpenAISignalSurface) {
      setTraditionalBriefingProductThought("");
      setTraditionalBriefingProductThoughtVisible(false);
      return;
    }

    const thoughts = [
      "Intelligent communication matters when circumstances are not equal.",
      "A useful conversation should change what happens next.",
      "The objective gives every signal in the room meaning.",
      "What is not said can matter as much as what is said.",
      "The right response depends on what just changed.",
      "A commitment is more useful than a promising conversation.",
      "Preparation improves what I can recognize while it is happening.",
      "The room can change. The outcome does not have to.",
    ];

    let thoughtIndex = 0;
    let characterIndex = 0;
    let typingTimer: number | null = null;
    let holdTimer: number | null = null;
    let transitionTimer: number | null = null;
    let cancelled = false;

    const clearTimers = () => {
      if (typingTimer !== null) window.clearInterval(typingTimer);
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      if (transitionTimer !== null) window.clearTimeout(transitionTimer);
      typingTimer = null;
      holdTimer = null;
      transitionTimer = null;
    };

    const presentThought = () => {
      if (cancelled) return;

      clearTimers();
      characterIndex = 0;

      const message = thoughts[thoughtIndex % thoughts.length];

      setTraditionalBriefingProductThought("");
      setTraditionalBriefingProductThoughtVisible(true);

      typingTimer = window.setInterval(() => {
        if (cancelled) return;

        characterIndex += 1;
        setTraditionalBriefingProductThought(
          message.slice(0, characterIndex),
        );

        if (characterIndex >= message.length) {
          if (typingTimer !== null) {
            window.clearInterval(typingTimer);
            typingTimer = null;
          }

          holdTimer = window.setTimeout(() => {
            if (cancelled) return;

            setTraditionalBriefingProductThoughtVisible(false);

            transitionTimer = window.setTimeout(() => {
              if (cancelled) return;

              thoughtIndex = (thoughtIndex + 1) % thoughts.length;
              presentThought();
            }, 900);
          }, 3200);
        }
      }, 32);
    };

    presentThought();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [showOpenAISignalSurface]);

  useEffect(() => {
    if (showLiveBriefingRoom && liveBriefingStep === 3) {
      const hasCompletedSupportConfiguration = Boolean(
        (liveBriefingActiveSupportStyle || selectedSupportStyle) &&
          selectedReceiverProfile &&
          String(communicationStyle || "").trim() &&
          (liveEntryRoute === "homepage" || liveRecoveryAcknowledged),
      );

      setLivePrepOpenSection((current) => {
        if (!hasCompletedSupportConfiguration) {
          return "support";
        }

        if (liveEntryRoute !== "homepage") {
          return "ready";
        }

        if (current === "ready") {
          return "ready";
        }

        return "formula";
      });

      if (liveEntryRoute !== "homepage") {
        setLiveBriefingSupportAccepted(hasCompletedSupportConfiguration);
      } else if (!hasCompletedSupportConfiguration) {
        setLiveBriefingSupportAccepted(false);
      }

      setReadyRoomTypedPrompt("");
      setReadyRoomPromptComplete(false);
    }
  }, [
    communicationStyle,
    liveBriefingActiveSupportStyle,
    liveBriefingStep,
    liveEntryRoute,
    liveRecoveryAcknowledged,
    selectedReceiverProfile,
    selectedSupportStyle,
    showLiveBriefingRoom,
  ]);

  useEffect(() => {
    if (
      !showLiveBriefingRoom ||
      liveBriefingStep !== 3 ||
      liveEntryRoute === "homepage" ||
      selectedFormula
    ) {
      return;
    }

    const recommendedFormula =
      operationalRecommendation?.recommendedFormula || null;

    if (!recommendedFormula) return;

    setSelectedFormula(recommendedFormula);
    setSelectedFormulaSource("george");
  }, [
    liveBriefingStep,
    liveEntryRoute,
    operationalRecommendation,
    selectedFormula,
    showLiveBriefingRoom,
  ]);

  useEffect(() => {
    if (!showLiveBriefingRoom || liveBriefingStep !== 3) {
      setReadyRoomTypedPrompt("");
      setReadyRoomPromptComplete(false);
      return;
    }

    const activeFormula =
      selectedFormula || operationalRecommendation?.recommendedFormula || null;
    const formulaName =
      activeFormula?.name?.trim() ||
      (activeFormula
        ? `Formula ${String(activeFormula.id || activeFormula.version)}`
        : "the selected operational formula");

    const text =
      livePrepOpenSection === "support"
        ? liveEntryRoute === "homepage"
          ? "Review GEORGE's recommended support configuration for this briefing."
          : "Your completed mechanics carry forward into this room."
        : livePrepOpenSection === "formula"
          ? preparationResumeMessage ||
            "Based on your briefing, I recommend this formula for the room."
          : livePrepOpenSection === "ready"
            ? activeFormula
              ? `I will use ${formulaName} as the operational reference for this room.`
              : "No formula is required. I will adapt from the briefing and the room as the conversation unfolds."
            : "";

    setReadyRoomTypedPrompt("");
    setReadyRoomPromptComplete(false);

    if (!text) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setReadyRoomTypedPrompt(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
        setReadyRoomPromptComplete(true);
      }
    }, 10);

    return () => window.clearInterval(timer);
  }, [
    liveBriefingStep,
    liveEntryRoute,
    livePrepOpenSection,
    operationalRecommendation,
    preparationResumeMessage,
    selectedFormula,
    showLiveBriefingRoom,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let savedScrollY = "";

    try {
      savedScrollY =
        window.sessionStorage.getItem("GEORGE_LIVE_PREP_SCROLL_Y") || "";
      window.sessionStorage.removeItem("GEORGE_LIVE_PREP_SCROLL_Y");
    } catch {}

    if (!savedScrollY) return;

    const parsedScrollY = Number(savedScrollY);
    if (!Number.isFinite(parsedScrollY)) return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: parsedScrollY, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = JSON.parse(
        window.localStorage.getItem(GEORGE_LIVE_RECOVERY_STORAGE_KEY) || "null",
      );
      setLiveRecoveryOptions(normalizeLiveRecoverySelection(stored?.selected));
    } catch {
      setLiveRecoveryOptions(DEFAULT_LIVE_RECOVERY_SELECTION);
    }
  }, []);

  const groundingSignalAvailable =
    knownContext.trim().length > 0 ||
    Boolean(prepDocument) ||
    Boolean(runtimeMotionContext) ||
    relatedSessionId !== "not_related";

  const returnToLiveEntryReadiness = () => {
    setCurrentOptionalSignalQuestion(null);
    setOptionalSignalComplete(true);
    setPreLivePreviewReady(true);

    try {
      markLivePreparationPreviewReady();
      window.localStorage.setItem("george_start_new_live", "1");
    } catch {}

    if (returnToReadyRoomAfterBriefingRef.current) {
      returnToReadyRoomAfterBriefingRef.current = false;
      setShowOpenAISignalSurface(false);
      setLiveEntryReadyMessageVisible(false);
      setShowLiveBriefingRoom(true);
      setLiveBriefingStep(3);
      return;
    }

    setLiveEntryReadyMessageVisible(true);
  };

  const continueBriefingFromReadyRoom = () => {
    returnToReadyRoomAfterBriefingRef.current = true;
    setShowOpenAISignalSurface(true);
    setLiveEntryReadyMessageVisible(false);
    setCurrentOptionalSignalQuestion(null);
    setOptionalSignalInput("");
    setOptionalSignalLoading(false);
    setOptionalSignalComplete(false);
  };

  const traditionalBriefingCoreQuestions = [
    {
      key: "clarify_desiredOutcome",
      label: "Goal",
      question: "What are you looking to gain from intelligent communication?",
    },
    {
      key: "clarify_role",
      label: "Role",
      question: "What is your role in this conversation?",
    },
    {
      key: "clarify_audience",
      label: "Speaking with",
      question: "Who are you speaking with?",
    },
  ] as const;

  const loadTraditionalBriefingExamples = async (
    question: {
      key: string;
      label: string;
      question: string;
    },
    answers: Record<string, string> = optionalSignalAnswers,
  ) => {
    setTraditionalBriefingExampleIndex(0);

    // The first question has no user signal yet.
    if (
      question.key === "clarify_desiredOutcome" &&
      Object.keys(answers).length === 0
    ) {
      setTraditionalBriefingExamples([
        "Get the job.",
        "Close the sale.",
        "Secure the investment.",
        "Win the contract.",
        "Get the promotion.",
        "Reach a settlement.",
        "Secure the partnership.",
        "Get the loan approved.",
        "Retain the client.",
        "Get the proposal approved.",
      ]);
      return;
    }

    try {
      const answeredQuestionKeys = new Set(Object.keys(answers));
      const priorInteractions = [
        ...Object.entries(answers).map(([key, answer]) => ({
          key,
          question: optionalSignalQuestionHistory[key] || "",
          answer: String(answer || "").trim(),
          status: "answered" as const,
        })),
        ...Array.from(new Set(skippedOptionalSignalKeys))
          .filter((key) => !answeredQuestionKeys.has(key))
          .map((key) => ({
            key,
            question: optionalSignalQuestionHistory[key] || "",
            answer: "",
            status: "skipped" as const,
          })),
      ];

      const response = await fetch("/api/george/live/signal-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interactionMode: "briefing_examples",
          userTurn: question.question,
          role:
            preLiveSignals.role ||
            chairs.join(", ") ||
            customChair ||
            userPosition,
          broadGoal: preLiveSignals.broadGoal || "",
          desiredOutcome:
            answers.clarify_desiredOutcome ||
            preLiveSignals.desiredOutcome ||
            objective,
          acceptableOutcome: preLiveSignals.acceptableOutcome || "",
          audience:
            answers.clarify_audience ||
            preLiveSignals.counterparty ||
            audienceType,
          room:
            conversationType === "Other"
              ? customConversationType
              : conversationType,
          knownContext:
            answers.clarify_knownContext ||
            preLiveSignals.conversationContext ||
            knownContext,
          documentSummary: prepDocument?.summary || "",
          priorAnswers: answers,
          priorInteractions,
          skippedQuestions: skippedOptionalSignalKeys,
        }),
      });

      const data = await response.json().catch(() => ({}));

      const keyedExample =
        data?.examples && !Array.isArray(data.examples)
          ? question.key === "clarify_role"
            ? data.examples.role
            : question.key === "clarify_audience"
              ? data.examples.counterparty
              : question.key === "clarify_knownContext"
                ? data.examples.context
                : ""
          : "";

      const rawExamples = Array.isArray(data?.examples)
        ? data.examples
        : typeof keyedExample === "string" && keyedExample.trim()
          ? [keyedExample]
          : Array.isArray(data?.likelyAnswers)
            ? data.likelyAnswers
            : typeof data?.example === "string"
              ? [data.example]
              : typeof data?.response === "string"
                ? data.response
                    .split("\n")
                    .map((line: string) =>
                      line.replace(/^[-*•\d.)\s]+/, "").trim(),
                    )
                    .filter(Boolean)
                : [];

      const cleanExamples = rawExamples
        .map((value: unknown) => String(value || "").trim())
        .filter(Boolean)
        .slice(0, 4);

      setTraditionalBriefingExamples(cleanExamples);
    } catch {
      // Examples are assistive presentation only.
      // Failure must never interrupt briefing or LIVE access.
      setTraditionalBriefingExamples([]);
    }
  };

  const beginTraditionalSequentialBriefing = () => {
    const firstQuestion = traditionalBriefingCoreQuestions.find(
      (question) => !optionalSignalAnswers[question.key],
    );

    if (!firstQuestion) {
      returnToLiveEntryReadiness();
      return;
    }

    const nextQuestion = {
      ...firstQuestion,
      why: "",
      example: "",
    };

    setCurrentOptionalSignalQuestion(nextQuestion);
    setOptionalSignalQuestionHistory((current) => ({
      ...current,
      [nextQuestion.key]:
        current[nextQuestion.key] || nextQuestion.question,
    }));
    setOptionalSignalInput("");
    setOptionalSignalLoading(false);
    setOptionalSignalComplete(false);
    void loadTraditionalBriefingExamples(nextQuestion);
  };

  const requestNextOptionalSignalQuestion = async (
    answers = optionalSignalAnswers,
    skipped = skippedOptionalSignalKeys,
  ) => {
    if (!showOpenAISignalSurface) return;

    try {
      setOptionalSignalLoading(true);
      setOptionalSignalComplete(false);

      const answeredQuestionKeys = new Set(Object.keys(answers));
      const priorInteractions = [
        ...Object.entries(answers).map(([key, answer]) => ({
          key,
          question: optionalSignalQuestionHistory[key] || "",
          answer: String(answer || "").trim(),
          status: "answered" as const,
        })),
        ...Array.from(new Set(skipped))
          .filter((key) => !answeredQuestionKeys.has(key))
          .map((key) => ({
            key,
            question: optionalSignalQuestionHistory[key] || "",
            answer: "",
            status: "skipped" as const,
          })),
      ];

      const response = await fetch("/api/george/live/signal-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role:
            preLiveSignals.role ||
            chairs.join(", ") ||
            customChair ||
            userPosition,
          broadGoal: preLiveSignals.broadGoal || "",
          desiredOutcome: preLiveSignals.desiredOutcome || objective,
          acceptableOutcome: preLiveSignals.acceptableOutcome || "",
          audience: preLiveSignals.counterparty || audienceType,
          room:
            conversationType === "Other"
              ? customConversationType
              : conversationType,
          knownContext,
          documentSummary: prepDocument?.summary || "",
          priorAnswers: answers,
          priorInteractions,
          skippedQuestions: skipped,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.status === "sufficient" || !data?.question) {
        returnToLiveEntryReadiness();
        return;
      }

      const nextQuestion = {
        key: String(data.key || `signal_${Date.now()}`),
        label: String(data.label || "Additional signal"),
        question: String(data.question || ""),
        why: String(
          data.why ||
            data.helper ||
            "This may improve my context, timing, and support.",
        ),
        example: String(data.example || "Answer if useful, or skip."),
      };

      setCurrentOptionalSignalQuestion(nextQuestion);
      setOptionalSignalQuestionHistory((current) => ({
        ...current,
        [nextQuestion.key]:
          current[nextQuestion.key] || nextQuestion.question,
      }));

      const responseExamples = Array.isArray(data?.examples)
        ? data.examples
            .map((value: unknown) => String(value || "").trim())
            .filter(Boolean)
            .slice(0, 4)
        : typeof data?.example === "string" && data.example.trim()
          ? [data.example.trim()]
          : [];

      if (responseExamples.length > 0) {
        setTraditionalBriefingExamples(responseExamples);
        setTraditionalBriefingExampleIndex(0);
      } else {
        void loadTraditionalBriefingExamples(nextQuestion, answers);
      }
    } catch {
      const fallbackQuestion = {
        key: `fallback_${Date.now()}`,
        label: "Additional signal",
        question: "What should I be especially ready for in this room?",
        why: "This may improve my context, timing, and support.",
        example: "Answer if useful, or skip.",
      };

      setCurrentOptionalSignalQuestion(fallbackQuestion);
      setOptionalSignalQuestionHistory((current) => ({
        ...current,
        [fallbackQuestion.key]:
          current[fallbackQuestion.key] || fallbackQuestion.question,
      }));
    } finally {
      setOptionalSignalLoading(false);
    }
  };

  useEffect(() => {
    if (
      !showOpenAISignalSurface ||
      !isFreshTraditionalPreparation ||
      liveEntryReadyMessageVisible ||
      currentOptionalSignalQuestion ||
      optionalSignalLoading ||
      optionalSignalComplete
    ) {
      return;
    }

    const hasAnyTraditionalBriefingSignal =
      Boolean(String(preLiveSignals.desiredOutcome || "").trim()) ||
      Boolean(String(preLiveSignals.role || "").trim()) ||
      Boolean(String(preLiveSignals.counterparty || "").trim()) ||
      Boolean(String(preLiveSignals.conversationContext || "").trim()) ||
      Object.keys(optionalSignalAnswers).length > 0;

    if (!hasAnyTraditionalBriefingSignal) {
      beginTraditionalSequentialBriefing();
      return;
    }

    returnToLiveEntryReadiness();
  }, [
    showOpenAISignalSurface,
    isFreshTraditionalPreparation,
    liveEntryReadyMessageVisible,
    currentOptionalSignalQuestion?.key,
    optionalSignalLoading,
    optionalSignalComplete,
  ]);

  useEffect(() => {
    if (!currentOptionalSignalQuestion) {
      setTypedOptionalSignalQuestion("");
      return;
    }

    const text = currentOptionalSignalQuestion.question;
    setTypedOptionalSignalQuestion("");

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedOptionalSignalQuestion(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, 10);

    return () => window.clearInterval(timer);
  }, [currentOptionalSignalQuestion?.key]);

  useEffect(() => {
    if (traditionalBriefingExamples.length <= 1) {
      setTraditionalBriefingExampleIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setTraditionalBriefingExampleIndex(
        (current) =>
          (current + 1) % traditionalBriefingExamples.length,
      );
    }, 2600);

    return () => window.clearInterval(timer);
  }, [
    currentOptionalSignalQuestion?.key,
    traditionalBriefingExamples,
  ]);

  const submitTraditionalAskGeorge = async () => {
    if (!currentOptionalSignalQuestion) return false;

    const userTurn = optionalSignalInput.trim();
    if (!userTurn) return false;

    const answeredQuestionKeys = new Set(
      Object.keys(optionalSignalAnswers),
    );

    const priorInteractions = [
      ...Object.entries(optionalSignalAnswers).map(([key, answer]) => ({
        key,
        question: optionalSignalQuestionHistory[key] || "",
        answer: String(answer || "").trim(),
        status: "answered" as const,
      })),
      ...Array.from(new Set(skippedOptionalSignalKeys))
        .filter((key) => !answeredQuestionKeys.has(key))
        .map((key) => ({
          key,
          question: optionalSignalQuestionHistory[key] || "",
          answer: "",
          status: "skipped" as const,
        })),
    ];

    setOptionalSignalLoading(true);
    setTraditionalBriefingGeorgeResponse("");

    try {
      const response = await fetch("/api/george/live/signal-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interactionMode: "ask_george",
          userTurn,
          role:
            preLiveSignals.role ||
            chairs.join(", ") ||
            customChair ||
            userPosition,
          broadGoal: preLiveSignals.broadGoal || "",
          desiredOutcome:
            preLiveSignals.desiredOutcome ||
            optionalSignalAnswers.clarify_desiredOutcome ||
            objective,
          acceptableOutcome: preLiveSignals.acceptableOutcome || "",
          audience:
            preLiveSignals.counterparty ||
            optionalSignalAnswers.clarify_audience ||
            audienceType,
          room:
            conversationType === "Other"
              ? customConversationType
              : conversationType,
          knownContext:
            preLiveSignals.conversationContext ||
            knownContext,
          documentSummary: prepDocument?.summary || "",
          priorAnswers: optionalSignalAnswers,
          priorInteractions,
          skippedQuestions: skippedOptionalSignalKeys,
        }),
      });

      const data = await response.json().catch(() => ({}));

      setTraditionalBriefingGeorgeResponse(
        String(data?.response || "").trim() ||
          "I can help with that while keeping this briefing question open.",
      );

      setOptionalSignalInput("");
      return true;
    } catch {
      setTraditionalBriefingGeorgeResponse(
        "I couldn't answer that just now. I still have the current briefing question ready.",
      );
      return false;
    } finally {
      setOptionalSignalLoading(false);
    }
  };

  const submitOptionalSignalAnswer = async () => {
    if (!currentOptionalSignalQuestion) return false;

    const answer = optionalSignalInput.trim();
    if (!answer) return false;

    setTraditionalBriefingProductThoughtVisible(false);
    setTraditionalBriefingProductThought("");

    setTraditionalBriefingAskGeorgeActive(false);
    setTraditionalBriefingGeorgeResponse("");

    const nextAnswers = {
      ...optionalSignalAnswers,
      [currentOptionalSignalQuestion.key]: answer,
    };

    setOptionalSignalAnswers(nextAnswers);

    const enrichedContextLine = `${currentOptionalSignalQuestion.label}: ${answer}`;
    setKnownContext((current) => {
      const cleanCurrent = current.trim();
      return cleanCurrent
        ? `${cleanCurrent}\n${enrichedContextLine}`
        : enrichedContextLine;
    });

    setOptionalSignalInput("");

    try {
      window.localStorage.setItem(
        "GEORGE_PRE_LIVE_OPTIONAL_SIGNALS",
        JSON.stringify(nextAnswers),
      );
    } catch {}

    if (isFreshTraditionalPreparation) {
      const clarificationKey = currentOptionalSignalQuestion.key;

      if (clarificationKey === "clarify_role") {
        setPreLiveSignals((current) => ({
          ...current,
          role: answer,
        }));
      } else if (clarificationKey === "clarify_audience") {
        setPreLiveSignals((current) => ({
          ...current,
          counterparty: answer,
        }));
      } else if (clarificationKey === "clarify_knownContext") {
        setPreLiveSignals((current) => ({
          ...current,
          conversationContext: answer,
        }));
        setKnownContext(answer);
      } else if (clarificationKey === "clarify_desiredOutcome") {
        setPreLiveSignals((current) => ({
          ...current,
          desiredOutcome: answer,
        }));
        setObjective(answer);
      }

      setCurrentOptionalSignalQuestion(null);
      setTraditionalBriefingExamples([]);
      setTraditionalBriefingExampleIndex(0);
      setOptionalSignalComplete(false);

      await requestNextOptionalSignalQuestion(
        nextAnswers,
        skippedOptionalSignalKeys,
      );
      return true;
    }

    returnToLiveEntryReadiness();
    return true;
  };

  const skipOptionalSignalQuestion = () => {
    if (!currentOptionalSignalQuestion) return;

    const nextSkipped = [
      ...skippedOptionalSignalKeys,
      currentOptionalSignalQuestion.key,
    ];
    setSkippedOptionalSignalKeys(nextSkipped);
    setOptionalSignalInput("");
    returnToLiveEntryReadiness();
  };

  /*
    GEORGE Doctrine

    The user decides the desired outcome.

    Minimum signal for competence.

    More signal for excellence.

    GEORGE optimizes for outcomes.

    Reality constrains strategy.

    Support prioritizes truth.
  */

  const traditionalPreparationSession = useMemo(() => {
    if (!isFreshTraditionalPreparation || showQuickLiveSetup) return null;

    if (!traditionalPreparationIdentityRef.current) {
      const seed = createPreparationSession({
        provenance: { entrySource: "traditional" },
      });

      traditionalPreparationIdentityRef.current = {
        preparationSessionId: seed.preparationSessionId,
        createdAt: seed.createdAt,
      };
    }

    const identity = traditionalPreparationIdentityRef.current;
    const resolvedRoom =
      conversationType === "Other" && customConversationType.trim()
        ? customConversationType.trim()
        : conversationType;
    const resolvedRole =
      preLiveSignals.role ||
      chairs.join(", ") ||
      customChair ||
      userPosition;
    const resolvedContext =
      preLiveSignals.conversationContext || knownContext;
    const resolvedObjective =
      preLiveSignals.desiredOutcome || objective;
    const secondaryOutcome =
      cleanBriefingValue(optionalSignalAnswers.fallbackOutcome) ||
      cleanBriefingValue(optionalSignalAnswers.secondaryOutcome) ||
      cleanBriefingValue(preLiveSignals.fallbackOutcome) ||
      cleanBriefingValue(preLiveSignals.secondaryOutcome);
    const roomObjective =
      liveRoomObjectiveOption === "other"
        ? customLiveRoomObjective
        : liveRoomObjectiveOption;
    const toCheckpoint = (
      state: LivePreparationWorkflowState,
    ): PreparationCheckpoint => {
      if (state === "questions") {
        return { surface: "briefing", phase: "questions" };
      }

      if (state === "brief_review") {
        return { surface: "briefing", phase: "review" };
      }

      if (state === "popup1") {
        return { surface: "ready_room", phase: "brief" };
      }

      if (state === "mechanics") {
        return { surface: "ready_room", phase: "mechanics" };
      }

      return { surface: "ready_room", phase: "readiness" };
    };
    const currentCheckpoint: PreparationCheckpoint = showLiveBriefingRoom
      ? liveBriefingStep === 1
        ? { surface: "ready_room", phase: "brief" }
        : liveBriefingStep === 2
          ? { surface: "ready_room", phase: "mechanics" }
          : {
              surface: "ready_room",
              phase: "readiness",
              section:
                livePrepOpenSection === "formula"
                  ? "formula"
                  : livePrepOpenSection === "ready"
                    ? "ready"
                    : "support",
            }
      : {
          surface: "briefing",
          phase: liveEntryReadyMessageVisible ? "decision" : "questions",
        };
    const returnCheckpoint: PreparationCheckpoint | undefined =
      returnToReadyRoomAfterBriefingRef.current
        ? { surface: "ready_room", phase: "readiness" }
        : undefined;
    const steeringPhrases = useRoomPhrases
      ? (customRoomPhrases.trim() || controlWords)
          .split(",")
          .map((phrase) => phrase.trim())
          .filter(Boolean)
      : [];

    return createPreparationSession({
      preparationSessionId: identity.preparationSessionId,
      provenance: { entrySource: "traditional" },
      createdAt: identity.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        objective: resolvedObjective,
        name: preLiveSignals.name,
        role: resolvedRole,
        participants: audienceType ? [audienceType] : [],
        audience: preLiveSignals.counterparty || audienceType,
        perspectives: chairs,
        conversation: {
          title: resolvedRoom,
        },
        knownContext: resolvedContext,
        acceptableOutcome: preLiveSignals.acceptableOutcome,
        secondaryOutcome,
        roomObjective,
        additionalSignals: preLiveSignals,
        documents: prepDocument
          ? [
              {
                id: prepDocument.name,
                name: prepDocument.name,
                kind: prepDocument.kind,
                summary: prepDocument.summary,
              },
            ]
          : [],
      },
      briefing: {
        priorInteractions: buildPreparationInteractions({
          answers: optionalSignalAnswers,
          questionHistory: optionalSignalQuestionHistory,
          skippedKeys: skippedOptionalSignalKeys,
        }),
        currentQuestion: currentOptionalSignalQuestion,
      },
      assets: {
        ...(selectedFormula && selectedFormulaSource
          ? {
              formula: {
                id: selectedFormula.id,
                version: selectedFormula.version,
                source: selectedFormulaSource,
              },
            }
          : {}),
        ...(selectedScript
          ? {
              script: {
                id: selectedScript.id,
                version: selectedScript.version,
              },
            }
          : {}),
        ...(customizedScript ? { customizedScript } : {}),
      },
      support: {
        overrides: {
          behavior:
            liveBriefingActiveSupportStyle === "response" ||
            selectedSupportStyle === "response"
              ? "response"
              : "cue",
          receiver: selectedReceiverProfile,
          speakingStyle: communicationStyle,
        },
        confirmations: {
          briefingReviewed: liveBriefingToaAccepted,
          supportAssessmentAgreed: liveBriefingSupportAccepted,
          receiverConfirmed: receiverProfileConfirmed,
          speakingStyleConfirmed: liveBriefingCommunicationConfirmed,
          mechanicsConfirmed: liveBriefingCapabilitiesConfirmed,
          recoveryAcknowledged: liveRecoveryAcknowledged,
          readyRoomConfirmed: liveReadyAccepted || liveReadinessComplete,
        },
        runtimePreferences: {
          pacing,
          recoveryOptionIds: liveRecoveryOptions,
          steeringEnabled: useRoomPhrases,
          steeringPhrases,
          selectedResources: editableResources,
        },
      },
      workflow: {
        current: currentCheckpoint,
        history: livePreparationHistoryRef.current.map(toCheckpoint),
        ...(returnCheckpoint ? { returnTo: returnCheckpoint } : {}),
      },
      relations: {
        ...(relatedSessionId !== "not_related"
          ? { normalSessionId: relatedSessionId }
          : {}),
      },
    });
  }, [
    audienceType,
    chairs,
    communicationStyle,
    conversationType,
    controlWords,
    currentOptionalSignalQuestion,
    customChair,
    customConversationType,
    customizedScript,
    customLiveRoomObjective,
    customRoomPhrases,
    editableResources,
    isFreshTraditionalPreparation,
    knownContext,
    liveBriefingActiveSupportStyle,
    liveBriefingCapabilitiesConfirmed,
    liveBriefingCommunicationConfirmed,
    liveBriefingStep,
    liveBriefingSupportAccepted,
    liveBriefingToaAccepted,
    liveEntryReadyMessageVisible,
    livePrepOpenSection,
    liveReadinessComplete,
    liveReadyAccepted,
    liveRecoveryAcknowledged,
    liveRecoveryOptions,
    liveRoomObjectiveOption,
    objective,
    optionalSignalAnswers,
    optionalSignalQuestionHistory,
    pacing,
    preLiveSignals,
    prepDocument,
    receiverProfileConfirmed,
    relatedSessionId,
    selectedFormula,
    selectedFormulaSource,
    selectedReceiverProfile,
    selectedScript,
    selectedSupportStyle,
    showQuickLiveSetup,
    skippedOptionalSignalKeys,
    useRoomPhrases,
    userPosition,
  ]);

  useEffect(() => {
    if (!traditionalPreparationSession) return;
    savePreparationSession(traditionalPreparationSession);
  }, [traditionalPreparationSession]);

  const quickLivePreparationSession = useMemo(() => {
    if (!showQuickLiveSetup) return null;

    if (!quickLivePreparationIdentityRef.current) {
      const seed = createPreparationSession({
        provenance: { entrySource: "quick_live" },
      });

      quickLivePreparationIdentityRef.current = {
        preparationSessionId: seed.preparationSessionId,
        createdAt: seed.createdAt,
      };
    }

    const identity = quickLivePreparationIdentityRef.current;

    return createPreparationSession({
      preparationSessionId: identity.preparationSessionId,
      provenance: { entrySource: "quick_live" },
      createdAt: identity.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        objective: quickLiveDesiredOutcome,
        participants: quickLiveAudience ? [quickLiveAudience] : [],
        audience: quickLiveAudience,
        perspectives: [],
        conversation: { title: "Quick LIVE" },
        knownContext: quickLiveContext,
        communicationMedium: quickLiveCommunicationMedium,
        receiverEvidence: quickLiveReceiverEvidence || undefined,
        additionalSignals: {},
        documents: [],
      },
      briefing: {
        priorInteractions: [],
      },
      support: {
        recommendation: {
          behavior:
            quickLiveRecommendation.supportStyle === "response"
              ? "response"
              : "cue",
          receiver: quickLiveRecommendation.receiverProfile,
          speakingStyle: quickLiveRecommendation.speakingStyle,
        },
        overrides: {
          ...(quickLiveSupportOverride
            ? {
                behavior:
                  quickLiveSupportOverride === "response"
                    ? ("response" as const)
                    : ("cue" as const),
              }
            : {}),
          ...(quickLiveReceiverOverride
            ? { receiver: quickLiveReceiverOverride }
            : {}),
          ...(quickLiveSpeakingOverride
            ? { speakingStyle: quickLiveSpeakingOverride }
            : {}),
        },
        runtimePreferences: {
          recoveryOptionIds: [],
          steeringEnabled: true,
          steeringPhrases: Object.values(quickLiveSteeringPhrases),
          selectedResources: [],
        },
      },
      workflow: {
        current: { surface: "briefing", phase: "review" },
        history: [],
      },
    });
  }, [
    quickLiveAudience,
    quickLiveCommunicationMedium,
    quickLiveContext,
    quickLiveDesiredOutcome,
    quickLiveReceiverEvidence,
    quickLiveReceiverOverride,
    quickLiveRecommendation.receiverProfile,
    quickLiveRecommendation.speakingStyle,
    quickLiveRecommendation.supportStyle,
    quickLiveSpeakingOverride,
    quickLiveSteeringPhrases,
    quickLiveSupportOverride,
    showQuickLiveSetup,
  ]);

  useEffect(() => {
    if (!quickLivePreparationSession) return;
    savePreparationSession(quickLivePreparationSession);
  }, [quickLivePreparationSession]);

  const homepagePreparationSession = useMemo(() => {
    const seed = homepagePreparationSeedRef.current;
    if (liveEntryRoute !== "homepage" || !seed) return null;

    const resolvedAudience = String(
      preLiveSignals.counterparty || seed.knowledge.audience || "",
    ).trim();
    const recommendation = seed.support.recommendation;
    const currentBehavior =
      liveBriefingActiveSupportStyle === "response" ||
      selectedSupportStyle === "response"
        ? ("response" as const)
        : ("cue" as const);
    const currentCheckpoint: PreparationCheckpoint = showOpenAISignalSurface
      ? { surface: "briefing", phase: "questions" }
      : {
          surface: "ready_room",
          phase: "readiness",
          section:
            livePrepOpenSection === "formula"
              ? "formula"
              : livePrepOpenSection === "ready"
                ? "ready"
                : "support",
        };
    const currentInteractions = buildPreparationInteractions({
      answers: optionalSignalAnswers,
      questionHistory: optionalSignalQuestionHistory,
      skippedKeys: skippedOptionalSignalKeys,
    });

    return createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        objective:
          preLiveSignals.desiredOutcome ||
          objective ||
          seed.knowledge.objective,
        name: preLiveSignals.name || seed.knowledge.name,
        role: preLiveSignals.role || seed.knowledge.role,
        participants: resolvedAudience
          ? [resolvedAudience]
          : seed.knowledge.participants,
        audience: resolvedAudience,
        perspectives: seed.knowledge.perspectives,
        conversation: seed.knowledge.conversation,
        knownContext:
          preLiveSignals.conversationContext ||
          knownContext ||
          seed.knowledge.knownContext,
        communicationMedium: seed.knowledge.communicationMedium,
        receiverEvidence: seed.knowledge.receiverEvidence,
        acceptableOutcome:
          preLiveSignals.acceptableOutcome ||
          seed.knowledge.acceptableOutcome,
        secondaryOutcome:
          preLiveSignals.secondaryOutcome ||
          preLiveSignals.fallbackOutcome ||
          seed.knowledge.secondaryOutcome,
        roomObjective:
          liveRoomObjectiveOption === "other"
            ? customLiveRoomObjective
            : liveRoomObjectiveOption || seed.knowledge.roomObjective,
        additionalSignals: {
          ...seed.knowledge.additionalSignals,
          ...preLiveSignals,
        },
        documents: prepDocument
          ? [
              {
                id: prepDocument.name,
                name: prepDocument.name,
                kind: prepDocument.kind,
                summary: prepDocument.summary,
              },
            ]
          : seed.knowledge.documents,
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions,
          ...currentInteractions,
        ]),
        currentQuestion: currentOptionalSignalQuestion,
      },
      assets: {
        ...(selectedFormula && selectedFormulaSource
          ? {
              formula: {
                id: selectedFormula.id,
                version: selectedFormula.version,
                source: selectedFormulaSource,
              },
            }
          : seed.assets.formula
            ? { formula: seed.assets.formula }
            : {}),
        ...(selectedScript
          ? {
              script: {
                id: selectedScript.id,
                version: selectedScript.version,
              },
            }
          : seed.assets.script
            ? { script: seed.assets.script }
            : {}),
        ...(customizedScript
          ? { customizedScript }
          : seed.assets.customizedScript
            ? { customizedScript: seed.assets.customizedScript }
            : {}),
      },
      support: {
        recommendation,
        overrides: {
          ...(recommendation?.behavior !== currentBehavior
            ? { behavior: currentBehavior }
            : {}),
          ...(recommendation?.receiver !== selectedReceiverProfile
            ? { receiver: selectedReceiverProfile }
            : {}),
          ...(recommendation?.speakingStyle !== communicationStyle
            ? { speakingStyle: communicationStyle }
            : {}),
        },
        confirmations: {
          briefingReviewed: liveBriefingToaAccepted,
          supportAssessmentAgreed: liveBriefingSupportAccepted,
          receiverConfirmed: receiverProfileConfirmed,
          speakingStyleConfirmed: liveBriefingCommunicationConfirmed,
          mechanicsConfirmed: liveBriefingCapabilitiesConfirmed,
          recoveryAcknowledged: liveRecoveryAcknowledged,
          readyRoomConfirmed: liveReadyAccepted || liveReadinessComplete,
        },
        runtimePreferences: {
          ...seed.support.runtimePreferences,
          pacing,
          recoveryOptionIds: liveRecoveryOptions,
          selectedResources: editableResources,
        },
      },
      workflow: {
        current: currentCheckpoint,
        history: seed.workflow.history,
        ...(seed.workflow.returnTo
          ? { returnTo: seed.workflow.returnTo }
          : {}),
      },
      relations: seed.relations,
    });
  }, [
    communicationStyle,
    currentOptionalSignalQuestion,
    customLiveRoomObjective,
    customizedScript,
    editableResources,
    knownContext,
    liveBriefingActiveSupportStyle,
    liveBriefingCapabilitiesConfirmed,
    liveBriefingCommunicationConfirmed,
    liveBriefingSupportAccepted,
    liveBriefingToaAccepted,
    liveEntryRoute,
    livePrepOpenSection,
    liveReadinessComplete,
    liveReadyAccepted,
    liveRecoveryAcknowledged,
    liveRecoveryOptions,
    liveRoomObjectiveOption,
    objective,
    optionalSignalAnswers,
    optionalSignalQuestionHistory,
    pacing,
    preLiveSignals,
    prepDocument,
    receiverProfileConfirmed,
    selectedFormula,
    selectedFormulaSource,
    selectedReceiverProfile,
    selectedScript,
    selectedSupportStyle,
    showOpenAISignalSurface,
    skippedOptionalSignalKeys,
  ]);

  useEffect(() => {
    if (!homepagePreparationSession) return;
    homepagePreparationSeedRef.current = homepagePreparationSession;
    savePreparationSession(homepagePreparationSession);
  }, [homepagePreparationSession]);

  const normalPreparationSession = useMemo(() => {
    const seed = normalPreparationSeedRef.current;
    if (!seed) return null;

    const resolvedAudience = String(
      preLiveSignals.counterparty || seed.knowledge.audience || "",
    ).trim();
    const currentCheckpoint: PreparationCheckpoint = showOpenAISignalSurface
      ? { surface: "briefing", phase: "questions" }
      : showLiveBriefingRoom
        ? liveBriefingStep === 1
          ? { surface: "ready_room", phase: "brief" }
          : liveBriefingStep === 2
            ? { surface: "ready_room", phase: "mechanics" }
            : {
                surface: "ready_room",
                phase: "readiness",
                section:
                  livePrepOpenSection === "formula"
                    ? "formula"
                    : livePrepOpenSection === "ready"
                      ? "ready"
                      : "support",
              }
        : liveEntryReadyMessageVisible
          ? { surface: "briefing", phase: "decision" }
          : seed.workflow.current;
    const currentInteractions = buildPreparationInteractions({
      answers: optionalSignalAnswers,
      questionHistory: optionalSignalQuestionHistory,
      skippedKeys: skippedOptionalSignalKeys,
    });
    const selectedBehavior = liveBriefingActiveSupportStyle
      ? liveBriefingActiveSupportStyle === "response"
        ? ("response" as const)
        : ("cue" as const)
      : undefined;

    return createPreparationSession({
      preparationSessionId: seed.preparationSessionId,
      provenance: seed.provenance,
      createdAt: seed.createdAt,
      updatedAt: Date.now(),
      knowledge: {
        objective: objective || seed.knowledge.objective,
        name: preLiveSignals.name || seed.knowledge.name,
        role: preLiveSignals.role || seed.knowledge.role,
        participants: resolvedAudience
          ? [resolvedAudience]
          : seed.knowledge.participants,
        audience: resolvedAudience,
        perspectives: seed.knowledge.perspectives,
        conversation: seed.knowledge.conversation,
        knownContext:
          preLiveSignals.conversationContext ||
          knownContext ||
          seed.knowledge.knownContext,
        communicationMedium: seed.knowledge.communicationMedium,
        receiverEvidence: seed.knowledge.receiverEvidence,
        acceptableOutcome:
          preLiveSignals.acceptableOutcome ||
          seed.knowledge.acceptableOutcome,
        secondaryOutcome:
          preLiveSignals.secondaryOutcome ||
          preLiveSignals.fallbackOutcome ||
          seed.knowledge.secondaryOutcome,
        roomObjective:
          liveRoomObjectiveOption === "other"
            ? customLiveRoomObjective
            : liveRoomObjectiveOption || seed.knowledge.roomObjective,
        additionalSignals: {
          ...seed.knowledge.additionalSignals,
          ...preLiveSignals,
        },
        documents: prepDocument
          ? [
              {
                id: prepDocument.name,
                name: prepDocument.name,
                kind: prepDocument.kind,
                summary: prepDocument.summary,
              },
            ]
          : seed.knowledge.documents,
      },
      briefing: {
        priorInteractions: normalizePreparationInteractions([
          ...seed.briefing.priorInteractions,
          ...currentInteractions,
        ]),
        currentQuestion: currentOptionalSignalQuestion,
      },
      assets: {
        ...(selectedFormula && selectedFormulaSource
          ? {
              formula: {
                id: selectedFormula.id,
                version: selectedFormula.version,
                source: selectedFormulaSource,
              },
            }
          : seed.assets.formula
            ? { formula: seed.assets.formula }
            : {}),
        ...(selectedScript
          ? {
              script: {
                id: selectedScript.id,
                version: selectedScript.version,
              },
            }
          : seed.assets.script
            ? { script: seed.assets.script }
            : {}),
        ...(customizedScript
          ? { customizedScript }
          : seed.assets.customizedScript
            ? { customizedScript: seed.assets.customizedScript }
            : {}),
      },
      support: {
        recommendation: seed.support.recommendation,
        overrides: {
          ...seed.support.overrides,
          ...(selectedBehavior ? { behavior: selectedBehavior } : {}),
          ...(receiverProfileConfirmed
            ? { receiver: selectedReceiverProfile }
            : {}),
          ...(liveBriefingCommunicationConfirmed
            ? { speakingStyle: communicationStyle }
            : {}),
        },
        confirmations: {
          briefingReviewed: liveBriefingToaAccepted,
          supportAssessmentAgreed: liveBriefingSupportAccepted,
          receiverConfirmed: receiverProfileConfirmed,
          speakingStyleConfirmed: liveBriefingCommunicationConfirmed,
          mechanicsConfirmed: liveBriefingCapabilitiesConfirmed,
          recoveryAcknowledged: liveRecoveryAcknowledged,
          readyRoomConfirmed: liveReadyAccepted || liveReadinessComplete,
        },
        runtimePreferences: {
          ...seed.support.runtimePreferences,
          ...(liveBriefingCapabilitiesConfirmed ? { pacing } : {}),
          recoveryOptionIds: liveRecoveryOptions,
          selectedResources: editableResources,
        },
      },
      workflow: {
        current: currentCheckpoint,
        history: seed.workflow.history,
        ...(seed.workflow.returnTo
          ? { returnTo: seed.workflow.returnTo }
          : {}),
      },
      relations: seed.relations,
    });
  }, [
    communicationStyle,
    currentOptionalSignalQuestion,
    customLiveRoomObjective,
    customizedScript,
    editableResources,
    knownContext,
    liveBriefingActiveSupportStyle,
    liveBriefingCapabilitiesConfirmed,
    liveBriefingCommunicationConfirmed,
    liveBriefingStep,
    liveBriefingSupportAccepted,
    liveBriefingToaAccepted,
    liveEntryReadyMessageVisible,
    livePrepOpenSection,
    liveReadinessComplete,
    liveReadyAccepted,
    liveRecoveryAcknowledged,
    liveRecoveryOptions,
    liveRoomObjectiveOption,
    objective,
    optionalSignalAnswers,
    optionalSignalQuestionHistory,
    pacing,
    preLiveSignals,
    prepDocument,
    receiverProfileConfirmed,
    selectedFormula,
    selectedFormulaSource,
    selectedReceiverProfile,
    selectedScript,
    showLiveBriefingRoom,
    showOpenAISignalSurface,
    skippedOptionalSignalKeys,
  ]);

  useEffect(() => {
    if (!normalPreparationSession) return;
    normalPreparationSeedRef.current = normalPreparationSession;
    savePreparationSession(normalPreparationSession);
  }, [normalPreparationSession]);

  const mandatoryLiveSignals = useMemo(() => {
    const cleanObjective = objective.trim();
    const hasObjective = cleanObjective.length > 0;
    const hasGrounding = groundingSignalAvailable;
    const hasPerspective = chairs.length > 0;
    const multiPerspective = chairs.length > 1;

    const signals = [
      {
        id: "objective",
        label: "Current direction",
        met: hasObjective,
        helper: "What should this interaction accomplish?",
      },
      {
        id: "grounding",
        label: "Current situation",
        met: hasGrounding,
        helper: "What is happening, or what context should GEORGE use?",
      },
    ];

    if (multiPerspective) {
      signals.push({
        id: "perspectives",
        label: "Perspectives",
        met: hasPerspective,
        helper: "Which positions should GEORGE consider before responding?",
      });
    }

    return signals;
  }, [objective, groundingSignalAvailable, chairs.length]);

  const completedMandatoryLiveSignalCount = mandatoryLiveSignals.filter(
    (signal) => signal.met,
  ).length;
  const missingMandatoryLiveSignals = mandatoryLiveSignals.filter(
    (signal) => !signal.met,
  );
  const objectiveSignalMet = objective.trim().length > 0;
  const hasRequiredLiveSignal =
    objectiveSignalMet &&
    completedMandatoryLiveSignalCount >= 2 &&
    missingMandatoryLiveSignals.length === 0;
  const canonicalPreparationReadiness = useMemo(
    () => {
      if (traditionalPreparationSession) {
        return resolvePreparationSession(traditionalPreparationSession)
          .readiness;
      }

      return resolveLivePreparationState({
        ...preLiveSignals,
        role:
          preLiveSignals.role ||
          chairs.join(", ") ||
          customChair ||
          userPosition,
        conversationContext:
          preLiveSignals.conversationContext || knownContext,
        desiredOutcome: preLiveSignals.desiredOutcome || objective,
      }).readiness;
    },
    [
      chairs,
      customChair,
      knownContext,
      objective,
      preLiveSignals,
      traditionalPreparationSession,
      userPosition,
    ],
  );

  useEffect(() => {
    const cached = readCachedGeorgeSessionAuthority();
    setTier(cached.tier);
    setSessionEmail(cached.email || "");

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        setTier(authority.tier);
        setSessionEmail(authority.email || "");
      })
      .catch(() => {});

    try {
      const params = new URLSearchParams(window.location.search);
      const isPreparationReturn = params.get("return") === "live-prep";
      const shouldResetLiveEntry =
        !isPreparationReturn &&
        (params.get("source") === "start" ||
          window.localStorage.getItem("george_start_new_live") === "1");

      if (shouldResetLiveEntry) {
        clearLivePreparationPreviewReady();
        clearLivePreparationSignals();
        window.localStorage.removeItem("GEORGE_PRE_LIVE_OPTIONAL_SIGNALS");
        window.localStorage.removeItem("GEORGE_LAST_LIVE_SETUP");
        window.localStorage.removeItem("GEORGE_LIVE_SETUP");
        window.localStorage.removeItem("george_live_setup_active");
        window.localStorage.removeItem("george_live_runtime_support");
      }
    } catch {}

    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("source");

      let homepageHandoff: HomepageBriefingHandoff | null = null;

      if (source === "homepage") {
        try {
          const rawHomepageHandoff = window.localStorage.getItem(
            "GEORGE_HOMEPAGE_LIVE_HANDOFF",
          );

          homepageHandoff = rawHomepageHandoff
            ? JSON.parse(rawHomepageHandoff)
            : null;
        } catch {
          homepageHandoff = null;
        }
      }

      let homepagePreparationSeed: PreparationSessionV1 | null = null;

      if (source === "homepage") {
        const submittedPreparationSession = normalizePreparationSession(
          homepageHandoff?.preparationSession,
        );
        homepagePreparationSeed = validateLiveEntryPreparation({
          source,
          preparationSessionId:
            submittedPreparationSession?.preparationSessionId || null,
          candidate: submittedPreparationSession,
        });

        if (!homepagePreparationSeed && homepageHandoff) {
          const legacySignals = homepageHandoff.signals || {};
          const legacyAudience = String(
            legacySignals.counterparty || legacySignals.audience || "",
          ).trim();
          const legacyInteractions = Array.isArray(
            homepageHandoff.priorInteractions,
          )
            ? normalizePreparationInteractions(
                homepageHandoff.priorInteractions,
              )
            : buildPreparationInteractions({
                answers: homepageHandoff.optionalSignals,
                questionHistory: homepageHandoff.optionalQuestionHistory,
                skippedKeys: homepageHandoff.skippedOptionalQuestions,
              });

          homepagePreparationSeed = createPreparationSession({
            provenance: { entrySource: "homepage" },
            knowledge: {
              objective: legacySignals.desiredOutcome || "",
              role: legacySignals.role || "",
              participants: legacyAudience ? [legacyAudience] : [],
              audience: legacyAudience,
              perspectives: [],
              conversation: {
                id: homepageHandoff.conversationTypeId,
                title: homepageHandoff.conversationType,
                group: homepageHandoff.conversationGroup,
              },
              knownContext: legacySignals.conversationContext,
              additionalSignals: legacySignals,
              documents: [],
            },
            briefing: {
              priorInteractions: legacyInteractions,
            },
            support: {
              overrides: {},
            },
            workflow: {
              current: {
                surface: "ready_room",
                phase: "readiness",
                section: "support",
              },
              history: [],
            },
          });
        }

        if (homepagePreparationSeed) {
          homepagePreparationSeedRef.current = homepagePreparationSeed;
          savePreparationSession(homepagePreparationSeed);

          const homepageDocument =
            homepagePreparationSeed.knowledge.documents[0];
          if (homepageDocument) {
            setPrepDocument({
              name: homepageDocument.name,
              summary: homepageDocument.summary || "",
              kind: homepageDocument.kind,
            });
          }
        }
      }

      const handedPreparationSessionId = params.get("preparationSessionId");
      const handedNormalSessionId = params.get("normalSessionId");
      const activeNormalSession = getActiveSessionForMode("normal");
      const storedNormalPreparationSession = loadPreparationSession();
      const normalPreparationSeed = validateLiveEntryPreparation({
        source,
        preparationSessionId: handedPreparationSessionId,
        normalSessionId: handedNormalSessionId,
        activeNormalSessionId: activeNormalSession?.id,
        candidate: storedNormalPreparationSession,
      });

      if (normalPreparationSeed) {
        normalPreparationSeedRef.current = normalPreparationSeed;
        savePreparationSession(normalPreparationSeed);
        linkNormalPreparationSurface("preparation");

        const normalDocument = normalPreparationSeed.knowledge.documents[0];
        if (normalDocument) {
          setPrepDocument({
            name: normalDocument.name,
            summary: normalDocument.summary || "",
            kind: normalDocument.kind,
          });
        }
      } else {
        normalPreparationSeedRef.current = null;
      }

      const homepageWorkflowAction = String(
        homepageHandoff?.workflowAction || "",
      );

      const isStartSource =
        source === "start" && params.get("return") !== "live-prep";
      setIsFreshTraditionalPreparation(isStartSource);
      setPriorPreparationExplicitlyRestored(false);

      if (isStartSource) {
        traditionalPreparationIdentityRef.current = null;
        clearPreparationSession();
        clearLivePreparationPreviewReady();
        clearLivePreparationSignals();
        window.localStorage.removeItem("GEORGE_PRE_LIVE_OPTIONAL_SIGNALS");
        window.localStorage.removeItem("GEORGE_LAST_LIVE_SETUP");
        window.localStorage.removeItem("GEORGE_LIVE_SETUP");
        window.localStorage.removeItem("george_live_setup_active");
        window.localStorage.removeItem("george_live_runtime_support");
        window.localStorage.removeItem("george_active_live_session_id");
        window.localStorage.removeItem("george_active_campaign_session_id");
        window.localStorage.removeItem("george_active_campaign");
        window.localStorage.removeItem("george_active_context");
        window.localStorage.removeItem("george_active_label");

        setPreLiveSignals({});
        setOptionalSignalAnswers({});
        setOptionalSignalQuestionHistory({});
        setSkippedOptionalSignalKeys([]);
        setCurrentOptionalSignalQuestion(null);
        setOptionalSignalInput("");
        setOptionalSignalComplete(false);
        setShowOpenAISignalSurface(false);
        setLiveEntryReadyMessageVisible(false);
        setShowLiveBriefingRoom(false);
        setPreLivePreviewReady(false);
        setConversationType("");
        setCustomConversationType("");
        setObjective("");
        setKnownContext("");
        setAudienceType("");
        setUserPosition("");
        setChairs([]);
        setCustomChair("");
        setLiveRoomObjectiveOption("");
        setCustomLiveRoomObjective("");
        livePreparationHistoryRef.current = [];
        setLiveBriefingStep(1);
        setLiveBriefingToaAccepted(false);
        setLiveRecoveryAcknowledged(false);
        setLiveReadyAccepted(false);
        setLiveReadinessComplete(false);
      }

      const storedPreparationSignals = isStartSource
        ? {}
        : normalPreparationSeed
          ? resolvePreparationSession(normalPreparationSeed).signals
          : {};

      const entryResolution = resolveLiveEntry({
        source,
        homepageHandoff: homepagePreparationSeed
          ? {
              ...(homepageHandoff || {}),
              conversationType:
                homepagePreparationSeed.knowledge.conversation.title,
              signals: resolvePreparationSession(homepagePreparationSeed)
                .signals,
            }
          : homepageHandoff,
        storedPreparationSignals,
        preparationPreviewReady: isLivePreparationPreviewReady(),
        devPreview: params.get("devPreview") === "1",
        startNewLive:
          params.get("return") !== "live-prep" &&
          window.localStorage.getItem("george_start_new_live") === "1",
        hasLiveSetup: Boolean(window.localStorage.getItem("GEORGE_LIVE_SETUP")),
        hasActiveLiveSetup: Boolean(
          window.localStorage.getItem("george_live_setup_active"),
        ),
      });

      const {
        acquiredSignals: acquiredSignalsForAccess,
        isFreshLiveStart,
        preLiveReady,
      } = entryResolution;

      setLiveEntryRoute(entryResolution.route);

      if (entryResolution.firstStep === "orientation") {
        setShowQuickLiveSetup(false);
        setShowLiveBriefingRoom(false);
        setShowOpenAISignalSurface(false);
        setLiveEntryReadyMessageVisible(false);
      } else if (entryResolution.firstStep === "questions") {
        setShowQuickLiveSetup(false);
        setShowLiveBriefingRoom(false);
        setShowOpenAISignalSurface(true);
      }

      setPreLivePreviewReady(preLiveReady);

      if (normalPreparationSeed) {
        const resolvedNormalPreparation = resolvePreparationSession(
          normalPreparationSeed,
        );
        const normalSignals = resolvedNormalPreparation.signals;
        const normalAudience = String(
          normalPreparationSeed.knowledge.audience ||
            normalSignals.counterparty ||
            "",
        ).trim();
        const normalRole = String(
          normalPreparationSeed.knowledge.role || normalSignals.role || "",
        ).trim();
        const normalRoom = String(
          normalPreparationSeed.knowledge.conversation.title || "",
        ).trim();
        const normalContext = String(
          normalPreparationSeed.knowledge.knownContext ||
            normalSignals.conversationContext ||
            "",
        ).trim();

        setPreLiveSignals(normalSignals);
        setObjective(normalPreparationSeed.knowledge.objective);
        if (normalContext) setKnownContext(normalContext);
        if (normalAudience) {
          const matchedAudience = AUDIENCE_TYPES.find(
            (option) =>
              option.label.toLowerCase() === normalAudience.toLowerCase() ||
              option.label.toLowerCase() ===
                normalAudience.toLowerCase().replace(/s$/, ""),
          );
          setAudienceType(matchedAudience?.label || normalAudience);
        }
        if (normalRole) {
          const matchedRole = CHAIR_OPTIONS.find(
            (option) =>
              option.label.toLowerCase() === normalRole.toLowerCase(),
          );
          if (matchedRole) {
            setChairs([matchedRole.label]);
            setUserPosition(matchedRole.label);
          } else {
            setChairs(["Other"]);
            setCustomChair(normalRole);
            setUserPosition(normalRole);
          }
        }
        if (normalRoom) {
          const knownRoom = CONVERSATION_TYPES.some(
            (option) => option.label === normalRoom,
          );
          setConversationType(knownRoom ? normalRoom : "Other");
          if (!knownRoom) setCustomConversationType(normalRoom);
        }

        const normalSupport = resolvedNormalPreparation.supportConfiguration;
        if (normalSupport.behavior) {
          const supportPanel =
            normalSupport.behavior === "response" ? "response" : "advice";
          setLiveBriefingActiveSupportStyle(supportPanel);
          setSelectedSupportStyle(
            normalizeLiveSupportStyle(toRuntimeSupportStyle(supportPanel)),
          );
        }
        if (normalSupport.receiver) {
          setSelectedReceiverProfile(normalSupport.receiver);
          setReceiverProfileConfirmed(
            normalPreparationSeed.support.confirmations.receiverConfirmed,
          );
        }
        if (normalSupport.speakingStyle) {
          setCommunicationStyle(normalSupport.speakingStyle);
          setLiveBriefingCommunicationConfirmed(
            normalPreparationSeed.support.confirmations
              .speakingStyleConfirmed,
          );
        }
        setLiveBriefingCapabilitiesConfirmed(
          normalPreparationSeed.support.confirmations.mechanicsConfirmed,
        );
        setLiveBriefingSupportAccepted(
          normalPreparationSeed.support.confirmations.supportAssessmentAgreed,
        );
        setLiveRecoveryAcknowledged(
          normalPreparationSeed.support.confirmations.recoveryAcknowledged,
        );
        setLiveReadyAccepted(
          normalPreparationSeed.support.confirmations.readyRoomConfirmed,
        );
        if (normalPreparationSeed.support.runtimePreferences.pacing) {
          setPacing(normalPreparationSeed.support.runtimePreferences.pacing);
        }
        if (
          normalPreparationSeed.support.runtimePreferences.recoveryOptionIds
            .length > 0
        ) {
          setLiveRecoveryOptions(
            normalizeLiveRecoverySelection(
              normalPreparationSeed.support.runtimePreferences
                .recoveryOptionIds,
            ),
          );
        }
      }

      if (
        entryResolution.route === "homepage" &&
        (homepageHandoff || Object.keys(acquiredSignalsForAccess).length > 0)
      ) {
        const preservedHomepageRecommendation =
          homepagePreparationSeed?.support.recommendation;
        const generatedHomepageRecommendation =
          preservedHomepageRecommendation?.behavior &&
          preservedHomepageRecommendation.receiver &&
          preservedHomepageRecommendation.speakingStyle
            ? {
                supportStyle:
                  preservedHomepageRecommendation.behavior === "response"
                    ? ("response" as const)
                    : ("advice" as const),
                receiverProfile: preservedHomepageRecommendation.receiver,
                communicationStyle:
                  preservedHomepageRecommendation.speakingStyle,
              }
            : resolveHomepageSupportRecommendation(
                acquiredSignalsForAccess,
                String(
                  homepagePreparationSeed?.knowledge.conversation.title ||
                    homepageHandoff?.conversationType ||
                    "",
                ),
              );
        const recommendation = {
          behavior:
            homepagePreparationSeed?.support.recommendation?.behavior ||
            (generatedHomepageRecommendation.supportStyle === "response"
              ? ("response" as const)
              : ("cue" as const)),
          receiver:
            homepagePreparationSeed?.support.recommendation?.receiver ||
            generatedHomepageRecommendation.receiverProfile,
          speakingStyle:
            homepagePreparationSeed?.support.recommendation?.speakingStyle ||
            generatedHomepageRecommendation.communicationStyle,
        };
        const recommendedHomepageSession = homepagePreparationSeed
          ? createPreparationSession({
              preparationSessionId:
                homepagePreparationSeed.preparationSessionId,
              provenance: homepagePreparationSeed.provenance,
              createdAt: homepagePreparationSeed.createdAt,
              updatedAt: Date.now(),
              knowledge: homepagePreparationSeed.knowledge,
              briefing: homepagePreparationSeed.briefing,
              assets: homepagePreparationSeed.assets,
              support: {
                ...homepagePreparationSeed.support,
                recommendation,
              },
              workflow: homepagePreparationSeed.workflow,
              relations: homepagePreparationSeed.relations,
            })
          : null;
        const effectiveHomepageSupport = recommendedHomepageSession
          ? resolvePreparationSession(recommendedHomepageSession)
              .supportConfiguration
          : recommendation;
        const homepageSupportStyle: LiveBriefingSupportPanelId =
          effectiveHomepageSupport.behavior === "response"
            ? "response"
            : "advice";
        const homepageReceiverProfile =
          effectiveHomepageSupport.receiver ||
          generatedHomepageRecommendation.receiverProfile;
        const homepageCommunicationStyle =
          effectiveHomepageSupport.speakingStyle ||
          generatedHomepageRecommendation.communicationStyle;
        const runtimeSupportStyle = toRuntimeSupportStyle(
          homepageSupportStyle,
        );

        if (recommendedHomepageSession) {
          homepagePreparationSeed = recommendedHomepageSession;
          homepagePreparationSeedRef.current = recommendedHomepageSession;
          savePreparationSession(recommendedHomepageSession);
        }

        setLiveBriefingActiveSupportStyle(
          homepageSupportStyle,
        );
        setSelectedSupportStyle(
          normalizeLiveSupportStyle(runtimeSupportStyle),
        );
        setSelectedReceiverProfile(homepageReceiverProfile);
        setReceiverProfileConfirmed(true);
        setCommunicationStyle(homepageCommunicationStyle);
        setLiveBriefingCommunicationConfirmed(true);
        setLiveBriefingSupportAccepted(
          Boolean(
            recommendedHomepageSession?.support.confirmations
              .supportAssessmentAgreed,
          ),
        );

        window.localStorage.setItem(
          "GEORGE_LIVE_SUPPORT_STYLE",
          runtimeSupportStyle,
        );
        window.localStorage.setItem(
          "GEORGE_LIVE_DELIVERY_STYLE",
          runtimeSupportStyle,
        );
        window.localStorage.setItem(
          "GEORGE_LIVE_RECEIVER_PROFILE",
          homepageReceiverProfile,
        );
        window.localStorage.setItem(
          "george_live_entry_receiver_profile",
          homepageReceiverProfile,
        );
        window.localStorage.setItem(
          "george_live_communication_style",
          homepageCommunicationStyle,
        );
      }

      if (homepageHandoff) {
        const canonicalInteractions = homepagePreparationSeed
          ? homepagePreparationSeed.briefing.priorInteractions
          : Array.isArray(homepageHandoff.priorInteractions)
            ? homepageHandoff.priorInteractions
            : null;

        if (canonicalInteractions) {
          const answeredQuestionKeys = new Set(
            canonicalInteractions
              .filter((interaction) => interaction.status === "answered")
              .map((interaction) => String(interaction.key || "").trim())
              .filter(Boolean),
          );
          const hydratedAnswers: Record<string, string> = {};
          const hydratedQuestionHistory: Record<string, string> = {
            ...(homepageHandoff.optionalQuestionHistory || {}),
          };

          for (const interaction of canonicalInteractions) {
            const key = String(interaction.key || "").trim();
            const question = String(interaction.question || "").trim();

            if (!key) continue;
            if (question) hydratedQuestionHistory[key] = question;

            if (interaction.status === "answered") {
              hydratedAnswers[key] = String(interaction.answer || "").trim();
            }
          }

          const hydratedSkippedKeys = Array.from(
            new Set(
              canonicalInteractions
                .filter((interaction) => interaction.status === "skipped")
                .map((interaction) => String(interaction.key || "").trim())
                .filter(Boolean),
            ),
          ).filter((key) => !answeredQuestionKeys.has(key));

          setOptionalSignalAnswers(hydratedAnswers);
          setOptionalSignalQuestionHistory(hydratedQuestionHistory);
          setSkippedOptionalSignalKeys(hydratedSkippedKeys);
        } else {
          setOptionalSignalAnswers(homepageHandoff.optionalSignals || {});
          setOptionalSignalQuestionHistory(
            homepageHandoff.optionalQuestionHistory || {},
          );
          setSkippedOptionalSignalKeys(
            Array.isArray(homepageHandoff.skippedOptionalQuestions)
              ? Array.from(new Set(homepageHandoff.skippedOptionalQuestions))
              : [],
          );
        }

        if (homepagePreparationSeed?.briefing.currentQuestion) {
          setCurrentOptionalSignalQuestion(
            homepagePreparationSeed.briefing.currentQuestion,
          );
        }
      }

      if (
        homepageWorkflowAction === "continue_briefing" &&
        homepageHandoff
      ) {
        setPreLiveSignals(acquiredSignalsForAccess);
        setLiveEntryReadyMessageVisible(false);
        setCurrentOptionalSignalQuestion(null);
        setOptionalSignalInput("");
        setOptionalSignalLoading(false);
        setOptionalSignalComplete(false);
        setShowLiveBriefingRoom(false);
        setShowOpenAISignalSurface(true);

        const homepageConversationType = String(
          homepageHandoff.conversationType || "",
        ).trim();

        if (homepageConversationType) {
          const knownHomepageRoom = CONVERSATION_TYPES.some(
            (option) => option.label === homepageConversationType,
          );

          setConversationType(
            knownHomepageRoom ? homepageConversationType : "Other",
          );

          if (!knownHomepageRoom) {
            setCustomConversationType(homepageConversationType);
          }
        }

        const homepageSignals =
          acquiredSignalsForAccess as Record<string, unknown>;

        const homepageOutcome = String(
          homepageSignals.desiredOutcome || "",
        ).trim();
        const homepageContext = String(
          homepageSignals.conversationContext || "",
        ).trim();
        const homepageRole = String(
          homepageSignals.role || "",
        ).trim();

        if (homepageOutcome) {
          setObjective(homepageOutcome);
        }

        if (homepageContext) {
          setKnownContext(homepageContext);
        }

        if (homepageRole) {
          setUserPosition(homepageRole);
        }

        window.localStorage.removeItem(
          "GEORGE_HOMEPAGE_LIVE_HANDOFF",
        );
      } else if (
        homepageWorkflowAction === "review_brief" &&
        entryResolution.firstStep === "prep" &&
        homepageHandoff
      ) {
        setPreLiveSignals(acquiredSignalsForAccess);
        setLiveEntryReadyMessageVisible(false);
        setShowOpenAISignalSurface(false);

        const homepageConversationType = String(
          homepageHandoff.conversationType || "",
        ).trim();

        if (homepageConversationType) {
          const knownHomepageRoom = CONVERSATION_TYPES.some(
            (option) => option.label === homepageConversationType,
          );

          setConversationType(
            knownHomepageRoom ? homepageConversationType : "Other",
          );

          if (!knownHomepageRoom) {
            setCustomConversationType(homepageConversationType);
          }
        }

        /*
         * Homepage owns its briefing. LIVE Entry provides a current-session
         * support recommendation at the shared readiness surface.
         */
        livePreparationHistoryRef.current = ["brief_review"];
        setLiveBriefingStep(3);
        setReadyRoomCompletedSteps([]);
        setReadyRoomSequenceStep("room");
        setReadyRoomPromptComplete(false);
        setLiveBriefingToaAccepted(true);
        setLiveBriefingSupportAccepted(false);
        setLiveBriefingCommunicationConfirmed(true);
        setLiveRecoveryAcknowledged(false);
        setLiveReadyAccepted(false);
        setLiveReadinessComplete(false);
        setShowLiveBriefingRoom(true);

        window.localStorage.removeItem("GEORGE_HOMEPAGE_LIVE_HANDOFF");
      } else if (entryResolution.firstStep === "mechanics") {
        setPreLiveSignals(acquiredSignalsForAccess);
        setLiveEntryReadyMessageVisible(false);
        setShowOpenAISignalSurface(false);
        livePreparationHistoryRef.current = [];
        setLiveBriefingStep(2);
        setLiveBriefingToaAccepted(true);
        setLiveBriefingSupportAccepted(false);
        setLiveBriefingCommunicationConfirmed(false);
        setLiveRecoveryAcknowledged(false);
        setLiveReadyAccepted(false);
        setLiveReadinessComplete(false);
        setShowLiveBriefingRoom(true);
      }

      const saved = JSON.parse(
        window.localStorage.getItem("GEORGE_LAST_LIVE_SETUP") || "null",
      );

      if (entryResolution.route !== "homepage" && !normalPreparationSeed) {
        if (!isFreshLiveStart) {
          if (saved?.room) {
            const knownRoom = CONVERSATION_TYPES.some(
              (option) => option.label === saved.room,
            );
            setConversationType(knownRoom ? saved.room : "Other");
            if (!knownRoom) setCustomConversationType(saved.room);
          }
          if (saved?.audienceType) setAudienceType(saved.audienceType);
          if (saved?.userPosition) setUserPosition(saved.userPosition);
        }

        if (saved?.cadence) setPacing(saved.cadence);
        if (saved?.supportStyle || saved?.liveAssistMode) {
          setSelectedSupportStyle(
            normalizeLiveSupportStyle(
              saved.supportStyle || saved.liveAssistMode,
            ),
          );
        }
        if (saved?.controlWords) setControlWords(saved.controlWords);
        if (saved?.communicationStyle)
          setCommunicationStyle(saved.communicationStyle);
      }
    } catch {}

    try {
      setRuntimeMotionContext(getActiveRuntimeMotionContext());
    } catch {
      setRuntimeMotionContext(null);
    }

    try {
      const activeNormal = getActiveSessionForMode("normal");
      const email = cached.email || "";
      const normalSessions = getSessionsForMode("normal")
        .filter((session) => !session.archived)
        .filter((session) => {
          const subscriberEmail = session.metadata?.subscriberEmail;
          return (
            !email ||
            typeof subscriberEmail !== "string" ||
            subscriberEmail === email
          );
        })
        .sort((a, b) => b.updatedAt - a.updatedAt);

      const merged = [
        ...(activeNormal ? [activeNormal] : []),
        ...normalSessions,
      ]
        .filter(
          (session, index, list) =>
            list.findIndex((item) => item.id === session.id) === index,
        )
        .slice(0, 5);

      setRelatedSessions(merged);
      const source = new URLSearchParams(window.location.search).get("source");
      const validatedNormalSessionId =
        normalPreparationSeedRef.current?.relations.normalSessionId;
      setRelatedSessionId(
        source === "start" || source === "homepage"
          ? "not_related"
          : validatedNormalSessionId || merged[0]?.id || "not_related",
      );
    } catch {
      setRelatedSessions([]);
      setRelatedSessionId("not_related");
    }

    setReady(true);
  }, []);

  const resolvedConversationType =
    conversationType === "Other" && customConversationType.trim()
      ? customConversationType.trim()
      : conversationType;

  const supportStyle = normalizeLiveSupportStyle(
    liveBriefingActiveSupportStyle
      ? toRuntimeSupportStyle(liveBriefingActiveSupportStyle)
      : selectedSupportStyle,
  );

  const nextBriefingBenefit = buildNextBriefingBenefit(
    resolvedConversationType,
    audienceType,
    objective || String(preLiveSignals.desiredOutcome || ""),
    userPosition || chair || String(preLiveSignals.role || ""),
  );

  const prepDocumentPrompt = useMemo(() => {
    return getPrepDocumentPrompt(
      resolvedConversationType,
      audienceType,
      objective,
    );
  }, [resolvedConversationType, audienceType, objective]);

  const resourceEstimate = useMemo(() => {
    const adjustedObjective = prepDocument
      ? `${objective}\n\nLoaded document: ${prepDocument.name}`
      : objective;

    const estimate = estimateResources({
      conversationType: resolvedConversationType,
      audienceType,
      pacing,
      outputMode: supportStyle === "continue" ? "Repeatable lines" : "Cues",
      objective: adjustedObjective,
    });

    if (!prepDocument) return estimate;

    return {
      ...estimate,
      estimatedCents: estimate.estimatedCents + 3,
      runtimeMinutes: estimate.runtimeMinutes + 2,
      resources: Array.from(
        new Set([...estimate.resources, prepDocumentPrompt.resource]),
      ),
      reason: `${estimate.reason} Uploaded context adds document-aware support.`,
    };
  }, [
    resolvedConversationType,
    audienceType,
    pacing,
    supportStyle,
    objective,
    prepDocument,
    prepDocumentPrompt.resource,
  ]);

  useEffect(() => {
    setEditableResources(resourceEstimate.resources);
  }, [
    resolvedConversationType,
    audienceType,
    pacing,
    supportStyle,
    objective,
    resourceEstimate.resources.join("|"),
  ]);

  const finalResourceEstimate = useMemo(() => {
    return estimateWithResources(
      resourceEstimate,
      editableResources.length ? editableResources : resourceEstimate.resources,
    );
  }, [resourceEstimate, editableResources]);
  const showEstimatedLiveCost = hasRequiredLiveSignal;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!showEstimatedLiveCost) return;

    window.localStorage.setItem(
      "george_live_estimated_cents",
      String(finalResourceEstimate.estimatedCents),
    );
    window.localStorage.setItem(
      "george_live_estimated_cost_updated_at",
      String(Date.now()),
    );
  }, [showEstimatedLiveCost, finalResourceEstimate.estimatedCents]);

  useEffect(() => {
    let cancelled = false;

    const contextText = [
      resolvedConversationType,
      audienceType,
      pacing,
      supportStyle === "continue" ? "Repeatable lines" : "Cues",
      communicationStyle,
      objective,
      userPosition,
      knownContext,
      prepDocument?.summary,
    ]
      .filter(Boolean)
      .join("\n");

    fetch("/api/george/prep-room/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextText }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.profile) {
          setPrepRoomProfile(data.profile);
        }
      })
      .catch(() => {
        if (!cancelled) setPrepRoomProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    resolvedConversationType,
    audienceType,
    pacing,
    supportStyle,
    objective,
    userPosition,
    knownContext,
    prepDocument?.summary,
  ]);

  const handlePrepDocumentUpload = async (file: File | null) => {
    if (!file) return;

    setPrepDocumentReading(true);

    try {
      const lower = file.name.toLowerCase();
      const isImage = file.type.startsWith("image/");
      const isText = file.type === "text/plain" || lower.endsWith(".txt");
      const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
      const isDocx =
        file.type.includes("officedocument.wordprocessingml.document") ||
        lower.endsWith(".docx");

      if (isPdf || isDocx) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/extract-file", {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Unable to read document.");

        const text = String(data?.text || "").trim();
        setPrepDocument({
          name: data?.name || file.name,
          kind: isPdf ? "pdf" : "docx",
          summary: text.slice(0, 2400),
        });
        return;
      }

      if (isText) {
        const text = await file.text();
        setPrepDocument({
          name: file.name,
          kind: "text",
          summary: text.trim().slice(0, 2400),
        });
        return;
      }

      if (isImage) {
        setPrepDocument({
          name: file.name,
          kind: "image",
          summary:
            "Image context uploaded. GEORGE should treat this as visual context for the room.",
        });
        return;
      }

      setPrepDocument({
        name: file.name,
        kind: "file",
        summary:
          "File attached as conversation context. GEORGE should ask for clarification if the content is needed.",
      });
    } catch {
      setPrepDocument({
        name: file.name,
        kind: "file",
        summary: "File attached, but GEORGE could not extract readable text.",
      });
    } finally {
      setPrepDocumentReading(false);
    }
  };

  const selectedRelatedSession =
    relatedSessions.find((session) => session?.id === relatedSessionId) || null;

  const buildContinuityPackage = (session: GeorgeStoredSession | null) => {
    if (!session) return null;

    return {
      sessionId: session.id || null,
      title: session.title || "Relevant context",
      direction:
        session.userGoal ||
        session.metadata?.direction ||
        session.title ||
        "Not established",
      outcome:
        session.metadata?.outcome || session.userGoal || "Not established",
      openDecisions: session.metadata?.openDecisions || [],
      constraints: session.metadata?.constraints || [],
      lastKnownState:
        session.lastKnownState || session.summary || "No state captured yet.",
      suggestedRestart:
        session.suggestedRestart ||
        "Continue from the clearest next useful move.",
      updatedAt: session.updatedAt || session.createdAt || null,
      source: "selected_normal_session",
    };
  };

  const readLastConversationRecord = () => {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(
        "GEORGE_LAST_CONVERSATION_RECORD",
      );
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const buildBriefRoomPreparation = () => {
    const relatedPackage = selectedRelatedSession
      ? {
          id: selectedRelatedSession.id || "selected-related-session",
          desiredOutcome:
            selectedRelatedSession.metadata?.desiredOutcome ||
            selectedRelatedSession.userGoal ||
            "",
          conversationContext:
            selectedRelatedSession.lastKnownState ||
            selectedRelatedSession.summary ||
            selectedRelatedSession.title ||
            "",
          liveSummaries: selectedRelatedSession.summary
            ? [
                {
                  summary: selectedRelatedSession.summary,
                  source: "selected_related_session",
                },
              ]
            : [],
          learning: selectedRelatedSession.metadata?.learning || [],
          futureActions:
            selectedRelatedSession.metadata?.futureActions ||
            selectedRelatedSession.metadata?.nextActions ||
            [],
          relevantDocumentation:
            selectedRelatedSession.metadata?.relevantDocumentation ||
            selectedRelatedSession.metadata?.documents ||
            [],
        }
      : null;

    return prepareConversationFromPackage({
      conversationPackage: {
        id: "live-entry-brief-room",
        desiredOutcome: objective,
        conversationType: resolvedConversationType,
        conversationContext: knownContext,
        conversationWith: audienceType,
        role: userPosition || chair,
        formulaSelection:
          selectedFormula && selectedFormulaSource
            ? {
                formulaId: selectedFormula.id,
                formulaVersion: selectedFormula.version,
                source: selectedFormulaSource,
              }
            : null,
        relevantDocumentation: prepDocument
          ? [
              {
                id: prepDocument.name,
                title: prepDocument.name,
                type: prepDocument.kind,
                summary: prepDocument.summary,
              },
            ]
          : [],
      },
      relatedConversationPackages: relatedPackage ? [relatedPackage] : [],
      conversationRecord: isFreshTraditionalPreparation
        ? undefined
        : readLastConversationRecord() || undefined,
    });
  };

  const buildOperationalRecommendationInput = () => {
    const receiverProfile =
      typeof window !== "undefined"
        ? window.localStorage.getItem("GEORGE_LIVE_RECEIVER_PROFILE") ||
          window.localStorage.getItem(
            "george_live_entry_receiver_profile",
          ) ||
          "audio_only"
        : "visual_only";

    const observedSignalTypes = Array.from(
      new Set(
        [
          ...Object.keys(preLiveSignals),
          ...Object.keys(optionalSignalAnswers),
          resolvedConversationType
            ? `conversation:${resolvedConversationType}`
            : "",
          audienceType ? `audience:${audienceType}` : "",
          receiverProfile ? `receiver:${receiverProfile}` : "",
          supportStyle ? `support:${supportStyle}` : "",
          knownContext.trim() ? "context:available" : "",
          prepDocument ? "documentation:available" : "",
        ].filter(Boolean),
      ),
    );

    const preparationSession =
      showQuickLiveSetup
        ? quickLivePreparationSession
        : liveEntryRoute === "homepage"
          ? homepagePreparationSession
          : liveEntryRoute === "normal"
            ? normalPreparationSession
            : traditionalPreparationSession;

    const preparationKnowledge = preparationSession?.knowledge;
    const preparationInteractions =
      preparationSession?.briefing.priorInteractions || [];

    const knownFacts = Array.from(
      new Set(
        [
          ...(preparationKnowledge?.baselineAssumptions || []),
          ...Object.entries(
            preparationKnowledge?.additionalSignals || {},
          ).map(([key, value]) => {
            const cleanValue = String(value || "").trim();
            return cleanValue ? `${key}: ${cleanValue}` : "";
          }),
          ...preparationInteractions.map((interaction) => {
            const question = String(interaction.question || "").trim();
            const answer = String(interaction.answer || "").trim();

            if (!answer) return "";
            return question ? `${question}: ${answer}` : answer;
          }),
          ...(preparationKnowledge?.documents || []).map((document) => {
            const summary = String(document.summary || "").trim();
            return summary
              ? `Document ${document.name}: ${summary}`
              : `Document available: ${document.name}`;
          }),
        ].filter(Boolean),
      ),
    );

    const input: OperationalRecommendationRequest = {
      roomType:
        preparationKnowledge?.conversation.title ||
        resolvedConversationType,
      objectiveType:
        preparationKnowledge?.objective ||
        objective,
      observedSignalTypes,
      briefingComplete: liveBriefingToaAccepted,
      preparationContext: {
        role:
          preparationKnowledge?.role ||
          userPosition ||
          chair,
        desiredOutcome:
          preparationKnowledge?.objective ||
          objective,
        conversationContext:
          preparationKnowledge?.knownContext ||
          knownContext,
        audience:
          preparationKnowledge?.audience ||
          preparationKnowledge?.participants.join(", ") ||
          audienceType,
        knownFacts,
      },
    };

    return input;
  };

  const loadOperationalRecommendation = async () => {
    setRecommendationLoading(true);

    try {
      const response = await fetch(
        "/api/george/operational-memory/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildOperationalRecommendationInput()),
        },
      );

      const payload =
        (await response.json()) as OperationalRecommendationApiResponse;

      if (!payload.ok) {
        throw new Error(
          payload.error || "Operational recommendation failed",
        );
      }

      if (!response.ok) {
        throw new Error("Operational recommendation failed");
      }

      setOperationalRecommendation(payload.recommendation);
    } catch (error) {
      setOperationalRecommendation(null);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const beginFormulaSelection = () => {
    console.info("[GEORGE][LIVE_ENTRY][FORMULA_SELECTION_REQUESTED]");

    try {
      const activePreparationSession = showQuickLiveSetup
        ? quickLivePreparationSession
        : homepagePreparationSession ||
          normalPreparationSession ||
          traditionalPreparationSession;
      const returnUrl = new URL(window.location.href);
      returnUrl.searchParams.set("return", "live-prep");
      if (activePreparationSession?.preparationSessionId) {
        returnUrl.searchParams.set(
          "preparationSessionId",
          activePreparationSession.preparationSessionId,
        );
      }

      window.sessionStorage.setItem(
        "GEORGE_LIVE_PREP_RETURN_URL",
        returnUrl.toString(),
      );
      window.sessionStorage.setItem(
        "GEORGE_LIVE_PREP_SCROLL_Y",
        String(window.scrollY),
      );
        window.sessionStorage.setItem(
          "GEORGE_LIVE_PREP_RETURN_STATE",
          JSON.stringify({
          livePrepOpenSection,
          liveBriefingSupportAccepted,
          liveBriefingActiveSupportStyle,
          selectedReceiverProfile,
          receiverProfileConfirmed,
          communicationStyle,
          liveBriefingCommunicationConfirmed,
          liveRecoveryAcknowledged,
          liveBriefingCapabilitiesConfirmed,
          selectedFormula,
          selectedFormulaSource,
          selectedScript,
          sourceScript,
          customizedScript,
          scriptBrowserOpen,
          scriptBrowserFormula,
          optionalSignalAnswers,
          optionalSignalQuestionHistory,
          skippedOptionalSignalKeys,
          livePreparationHistory: livePreparationHistoryRef.current,
          georgeSessionId:
            activePreparationSession?.relations.normalSessionId,
          preparationSessionId:
            activePreparationSession?.preparationSessionId,
          preparationSession: activePreparationSession,
        }),
      );

      if (activePreparationSession) {
        savePreparationSession(activePreparationSession);
      }
    } catch (error) {
      console.warn(
        "[GEORGE][LIVE_ENTRY][PREP_RETURN_SAVE_FAILED]",
        error,
      );
    }

    window.location.href = "/george/library?asset=formulas&source=live-prep";
  };

  useEffect(() => {
    if (!scriptBrowserOpen || !scriptBrowserFormula) {
      setScriptBrowserLoading(false);
      setFormulaScripts([]);
      setScriptBrowserError("");
      return;
    }

    let cancelled = false;

    const loadFormulaScripts = async () => {
      setScriptBrowserLoading(true);
      setFormulaScripts([]);
      setScriptBrowserError("");

      try {
        const params = new URLSearchParams({
          formulaId: scriptBrowserFormula.id,
          formulaVersion: String(scriptBrowserFormula.version),
        });

        const response = await fetch(
          `/api/george/operational-memory/scripts?${params.toString()}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          scripts?: OperationalScript[];
          error?: string;
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || "Unable to load operational scripts");
        }

        if (!cancelled) {
          setFormulaScripts(
            Array.isArray(payload.scripts) ? payload.scripts : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setFormulaScripts([]);
          setScriptBrowserError(
            error instanceof Error
              ? error.message
              : "Unable to load operational scripts",
          );
        }
      } finally {
        if (!cancelled) {
          setScriptBrowserLoading(false);
        }
      }
    };

    void loadFormulaScripts();

    return () => {
      cancelled = true;
    };
  }, [
    scriptBrowserOpen,
    scriptBrowserFormula?.id,
    scriptBrowserFormula?.version,
  ]);

  const selectFormulaScript = (script: OperationalScript) => {
    const workingCopy: OperationalScript = {
      ...script,
      lines: script.lines.map((line) => ({ ...line })),
    };

    setSelectedScript(script);
    setSourceScript(script);
    setCustomizedScript(workingCopy);
    setScriptBrowserOpen(false);
    setScriptCustomizationOpen(true);

    console.info("[GEORGE][LIVE_ENTRY][SCRIPT_SELECTED]", {
      scriptId: script.id,
      scriptVersion: script.version,
      formulaId: script.formulaId,
      formulaVersion: script.formulaVersion,
    });
  };

  const resetCustomizedScript = () => {
    if (!sourceScript) return;

    setCustomizedScript({
      ...sourceScript,
      lines: sourceScript.lines.map((line) => ({ ...line })),
    });
  };

  const finishScriptCustomization = () => {
    if (!customizedScript) return;

    setScriptCustomizationOpen(false);
    console.info("[GEORGE][LIVE_ENTRY][SCRIPT_CUSTOMIZED]", {
      scriptId: customizedScript.id,
      scriptVersion: customizedScript.version,
      lineCount: customizedScript.lines.length,
      sessionOnly: true,
    });
  };

  const resumeLiveConversation = (session: GeorgeStoredSession) => {
    if (!session) return;

    const metadata = session.metadata || {};
    const restoredOutcome = String(
      metadata.desiredOutcome || session.userGoal || "",
    ).trim();
    const restoredAudience = String(
      metadata.audience ||
        metadata.audienceType ||
        metadata.targetAudience ||
        "",
    ).trim();
    const restoredChair = String(
      metadata.chair || metadata.userPosition || "",
    ).trim();
    const restoredContext = String(
      metadata.observedReality ||
        metadata.knownContext ||
        session.lastKnownState ||
        session.summary ||
        "",
    ).trim();

    setRelatedSessionId(session.id);
    setObjective(restoredOutcome);
    setAudienceType(restoredAudience);
    setUserPosition(restoredChair || "Seeking");
    setChairs(restoredChair ? [restoredChair] : []);
    setKnownContext(restoredContext);
    setActiveSessionIdForMode("live", session.id);

    setShowResumeConversationList(false);
    const restoredHasOperationalSignal = Boolean(
      cleanBriefingValue(restoredContext) || cleanBriefingValue(restoredChair),
    );
    setPriorPreparationExplicitlyRestored(
      Boolean(cleanBriefingValue(restoredOutcome)) &&
        restoredHasOperationalSignal,
    );
    setIsFreshTraditionalPreparation(false);

    setCurrentOptionalSignalQuestion(null);
    setOptionalSignalLoading(false);
    setShowOpenAISignalSurface(true);
    setLiveBriefingStep(1);
    setLiveBriefingToaAccepted(false);
    setLiveBriefingSupportAccepted(false);
    setLiveBriefingCommunicationConfirmed(false);
    setLiveRecoveryAcknowledged(false);
    setLiveReadyAccepted(false);
    setShowOpenAISignalSurface(!restoredHasOperationalSignal);
    setShowLiveBriefingRoom(restoredHasOperationalSignal);
  };

  const openQuickLiveSetup = () => {
    quickLivePreparationIdentityRef.current = null;
    clearPreparationSession();
    setQuickLiveDesiredOutcome("");
    setQuickLiveContext("");
    setQuickLiveAudience("");
    setQuickLiveCommunicationMedium("");
    setQuickLiveReceiverEvidence("");
    setQuickLiveSupportOverride(null);
    setQuickLiveReceiverOverride(null);
    setQuickLiveSpeakingOverride(null);
    setQuickLiveSupportOpen(false);
    setQuickLiveReceiverOpen(false);
    setQuickLiveSpeakingOpen(false);
    setQuickLiveValidationError("");
    setShowQuickLiveSetup(true);
    setQuickLiveSteeringOpen(false);
  };

  const startQuickLive = () => {
    if (typeof window === "undefined") return;

    const quickLivePreparation = quickLivePreparationSession
      ? resolvePreparationSession(quickLivePreparationSession)
      : null;
    const desiredOutcome = (
      quickLivePreparation?.session.knowledge.objective ||
      quickLiveDesiredOutcome
    ).trim();

    if (!isValidQuickLiveDesiredOutcome(desiredOutcome)) {
      setQuickLiveValidationError(
        "A specific desired outcome is required for Quick LIVE.",
      );
      return;
    }

    setQuickLiveValidationError("");

    try {
      const sessionSupportBehavior =
        quickLivePreparation?.supportConfiguration.behavior;
      const resolvedQuickLiveSupportStyle: QuickLiveSupportStyle =
        sessionSupportBehavior === "response" ? "response" : "advice";
      const resolvedQuickLiveReceiverProfile =
        quickLivePreparation?.supportConfiguration.receiver ||
        quickLiveReceiverProfile;
      const sessionSpeakingStyle =
        quickLivePreparation?.supportConfiguration.speakingStyle;
      const resolvedQuickLiveSpeakingStyle: QuickLiveSpeakingStyle =
        sessionSpeakingStyle === "Executive" ||
        sessionSpeakingStyle === "Conversational" ||
        sessionSpeakingStyle === "Adaptive"
          ? sessionSpeakingStyle
          : quickLiveSpeakingStyle;
      const runtimeSupportStyle = toRuntimeSupportStyle(
        resolvedQuickLiveSupportStyle,
      );
      const supportStyle = normalizeLiveSupportStyle(runtimeSupportStyle);
      const communicationMedium =
        quickLivePreparation?.session.knowledge.communicationMedium ||
        quickLiveCommunicationMedium;
      const sessionContext =
        quickLivePreparation?.session.knowledge.knownContext ||
        quickLiveContext;
      const sessionAudience =
        quickLivePreparation?.session.knowledge.audience || quickLiveAudience;
      const medium = communicationMedium
        ? communicationMedium.replace("_", " ")
        : "";
      const currentSessionContext = [
        sessionContext.trim(),
        sessionAudience.trim()
          ? `Conversation with: ${sessionAudience.trim()}`
          : "",
        medium ? `Communication medium: ${medium}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const quickLiveSetup = {
        room: "Quick LIVE",
        objective: desiredOutcome,
        knownContext: currentSessionContext,
        observedReality: currentSessionContext,
        communicationStyle: resolvedQuickLiveSpeakingStyle,
        receiverProfile: resolvedQuickLiveReceiverProfile,
        supportStyle,
        liveAssistMode: legacyAssistModeFromSupportStyle(supportStyle),
        skipPrep: true,
        runtimeSupport: {
          room: "Quick LIVE",
          objective: desiredOutcome,
          knownContext: currentSessionContext,
          briefingKnowledge: currentSessionContext,
        },
        createdAt: Date.now(),
      };

      if (quickLivePreparationSession) {
        savePreparationSession(quickLivePreparationSession);
      }

      window.localStorage.removeItem("GEORGE_LAST_LIVE_SETUP");
      window.localStorage.removeItem("george_live_runtime_support_active");
      window.localStorage.removeItem("george_live_runtime_support");
      window.localStorage.setItem(
        "GEORGE_LIVE_SETUP",
        JSON.stringify(quickLiveSetup),
      );
      window.localStorage.setItem(
        "george_live_setup_active",
        JSON.stringify(quickLiveSetup),
      );

      window.localStorage.setItem(
        "GEORGE_LIVE_SUPPORT_STYLE",
        runtimeSupportStyle,
      );
      window.localStorage.setItem(
        "GEORGE_LIVE_DELIVERY_STYLE",
        runtimeSupportStyle,
      );
      window.localStorage.setItem(
        "george_live_entry_support_preference",
        resolvedQuickLiveSupportStyle,
      );
      window.localStorage.setItem(
        "george_live_entry_support_default",
        resolvedQuickLiveSupportStyle,
      );
      window.localStorage.setItem(
        "GEORGE_LIVE_RECEIVER_PROFILE",
        resolvedQuickLiveReceiverProfile,
      );
      window.localStorage.setItem(
        "george_live_entry_receiver_profile",
        resolvedQuickLiveReceiverProfile,
      );
      window.localStorage.setItem(
        "george_live_communication_style",
        resolvedQuickLiveSpeakingStyle,
      );
      window.localStorage.setItem("george_start_new_live", "1");
      window.localStorage.setItem("george_quick_live_entry", "1");
      window.localStorage.setItem(
        "george_quick_live_message",
        "I'll become sharper as the interaction unfolds.",
      );
      window.localStorage.setItem(
        "GEORGE_LIVE_STEERING_PHRASES",
        JSON.stringify(quickLiveSteeringPhrases),
      );
    } catch {}

    window.location.href = "/george/live?ready=1";
  };

  const startLive = (
    skipPrep = false,
    resources = editableResources,
    bypassBriefing = false,
  ) => {
    if (typeof window === "undefined") return;

    const resolvedHomepagePreparation =
      liveEntryRoute === "homepage" && homepagePreparationSession
        ? resolvePreparationSession(homepagePreparationSession)
        : null;
    const resolvedNormalPreparation = normalPreparationSession
      ? resolvePreparationSession(normalPreparationSession)
      : null;
    const resolvedCanonicalPreparation =
      resolvedHomepagePreparation || resolvedNormalPreparation;

    if (homepagePreparationSession) {
      savePreparationSession(homepagePreparationSession);
    }
    if (normalPreparationSession) {
      savePreparationSession(normalPreparationSession);
    }

    const entrySupportStyle = resolvedCanonicalPreparation
      ? normalizeLiveSupportStyle(
          toRuntimeSupportStyle(
            resolvedCanonicalPreparation.supportConfiguration.behavior ===
              "response"
              ? "response"
              : "advice",
          ),
        )
      : supportStyle;
    const entryReceiverProfile =
      resolvedCanonicalPreparation?.supportConfiguration.receiver ||
      (resolvedNormalPreparation
        ? selectedReceiverProfile
        : window.localStorage.getItem("GEORGE_LIVE_RECEIVER_PROFILE") ||
          window.localStorage.getItem(
            "george_live_entry_receiver_profile",
          ) ||
          "audio_only");
    const entryCommunicationStyle =
      resolvedCanonicalPreparation?.supportConfiguration.speakingStyle ||
      communicationStyle;
    const entryLiveAssistMode = legacyAssistModeFromSupportStyle(
      entrySupportStyle,
    );

    if (
      !sessionEmail.trim() &&
      !preLivePreviewReady &&
      window.localStorage.getItem("george_founder_access") !== "server-verified"
    ) {
      window.alert("Sign in to use LIVE.");
      return;
    }

    const roomFormation = deriveRoomFormation({
      chairs,
      desiredOutcome: objective,
      observedReality: knownContext,
    });

    const liveRecoveryConstraints = {
      selected: normalizeLiveRecoverySelection(liveRecoveryOptions),
    };

    if (!hasRequiredLiveSignal) {
      const missing = missingMandatoryLiveSignals
        .map((signal) => signal.label)
        .join(", ");

      window.alert(`Add signal before LIVE: ${missing}.`);
      return;
    }

    const continuityPackage =
      relatedSessionId === "not_related"
        ? null
        : buildContinuityPackage(selectedRelatedSession);
    const preparationRuntime = buildBriefRoomPreparation();

    const roomPackage = {
      relatedSessionId,
      relatedSessionTitle: selectedRelatedSession?.title || null,
      relatedSessionMode:
        relatedSessionId === "not_related" ? "not_related" : "normal",
      chair,
      chairs,
      desiredOutcome: objective.trim(),
      observedReality: knownContext.trim(),
      continuityPackage,
      roomFormation,
      recoveryConstraints: liveRecoveryConstraints,
      internalInstruction: [
        "Use the selected chair as a relevance signal, not as a separate brain or profession mode.",
        "User outcome is highest authority.",
        "Observed reality is second authority.",
        "Selected session context is fallback/supporting context only.",
        "Narrow all context to LIVE usefulness: what matters now, what decision is at stake, what cue or line may help.",
      ].join(" "),
    };

    const finalResources = Array.from(
      new Set([
        ...(skipPrep
          ? resourceEstimate.resources
          : resources.length
            ? resources
            : resourceEstimate.resources),
        ...(prepDocument ? [prepDocumentPrompt.resource] : []),
      ]),
    );
    const finalEstimate = skipPrep
      ? resourceEstimate
      : estimateWithResources(resourceEstimate, finalResources);
    const selectedCapabilityIds = deriveLiveCapabilityIds({
      conversationType,
      audienceType,
      userPosition,
      objective,
      knownContext,
      resources: finalResources,
    });

    const liveRoomObjectiveLabels: Record<LiveRoomObjectiveOptionId, string> = {
      project_strength: "Project strength",
      build_trust: "Build trust",
      find_leverage: "Find leverage",
      find_common_ground: "Find common ground",
      surface_objections: "Surface objections",
      confirm_authority: "Confirm authority",
      confirm_concern: "Confirm concern",
      confirm_timeline: "Confirm timeline",
      other: "Other",
    };

    const selectedLiveRoomObjectiveLabel =
      liveRoomObjectiveOption === "other"
        ? customLiveRoomObjective.trim()
        : liveRoomObjectiveOption
          ? liveRoomObjectiveLabels[liveRoomObjectiveOption]
          : "";

    const optionalBriefingLines = Object.entries(optionalSignalAnswers)
      .map(([key, value]) => {
        const cleanValue = cleanBriefingValue(value);
        if (!cleanValue) return "";
        return `${key}: ${cleanValue}`;
      })
      .filter(Boolean);

    const briefingKnowledge = [
      preLiveSignals.name ? `User name: ${preLiveSignals.name}` : "",
      preLiveSignals.role ? `User role in room: ${preLiveSignals.role}` : "",
      preLiveSignals.desiredOutcome
        ? `Desired outcome: ${preLiveSignals.desiredOutcome}`
        : "",
      cleanBriefingValue(knownContext)
        ? `Known context: ${cleanBriefingValue(knownContext)}`
        : "",
      optionalBriefingLines.length
        ? `Additional briefing: ${optionalBriefingLines.join(" | ")}`
        : "",
      preparationRuntime?.preparationBrief
        ? `Preparation: ${preparationRuntime.preparationBrief}`
        : "",
      preparationRuntime?.opportunities?.[0]
        ? `Preparation opportunity: ${preparationRuntime.opportunities[0]}`
        : "",
      preparationRuntime?.risks?.[0]
        ? `Preparation risk: ${preparationRuntime.risks[0]}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const secondaryOutcome =
      cleanBriefingValue(optionalSignalAnswers.fallbackOutcome) ||
      cleanBriefingValue(optionalSignalAnswers.secondaryOutcome) ||
      cleanBriefingValue(preLiveSignals.fallbackOutcome) ||
      cleanBriefingValue(preLiveSignals.secondaryOutcome) ||
      "";

    const intangibleObjective = selectedLiveRoomObjectiveLabel || "";

    const secondaryObjective = secondaryOutcome;

    const runtimeSupport = {
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds,
      selectedCapabilities: finalResources,
      baseRuntimeCents: finalEstimate.estimatedCents,
      capacityCents: finalEstimate.estimatedCents,
      estimatedCents: finalEstimate.estimatedCents,
      resourceEstimate: finalEstimate,
      runtimeBias: finalResources,
      room: skipPrep ? "Adaptive LIVE" : conversationType,
      objective,
      audienceType,
      resolvedConversationType,
      userPosition,
      knownContext,
      briefingKnowledge,
      secondaryOutcome,
      secondaryObjective,
      intangibleObjective,
      liveRoomObjectiveOption,
      customLiveRoomObjective,
      chair,
      roomPackage,
      roomFormation,
      pacing,
      compactPrep: true,
      editedByUser: !skipPrep,
      prepRoomProfile,
      preparationRuntime,
      recoveryConstraints: liveRecoveryConstraints,
      supportStyle: entrySupportStyle,
      deliveryStyle: entrySupportStyle,
      receiverProfile: entryReceiverProfile,
    };

    const liveSetup = {
      room: skipPrep ? "Adaptive LIVE" : conversationType,
      audienceType,
      userPosition,
      chair,
      relatedSessionId,
      relatedSessionTitle: selectedRelatedSession?.title || null,
      formulaSelection:
        selectedFormula && selectedFormulaSource
          ? {
              formulaId: selectedFormula.id,
              formulaVersion: selectedFormula.version,
              source: selectedFormulaSource,
            }
          : null,
      customizedScript: customizedScript
        ? {
            ...customizedScript,
            lines: customizedScript.lines.map((line) => ({ ...line })),
          }
        : null,
      knownContext,
      briefingKnowledge,
      observedReality: knownContext,
      secondaryOutcome,
      secondaryObjective,
      fallbackOutcome: secondaryOutcome,
      intangibleObjective,
      liveRoomObjectiveOption,
      customLiveRoomObjective,
      roomPackage,
      language:
        window.localStorage.getItem("george_live_language") || "English",
      cadence: pacing,
      objective,
      prepDocument,
      prepDocumentPrompt,
      controlWords: useRoomPhrases
        ? customRoomPhrases.trim() || DEFAULT_ROOM_PHRASES.join(", ")
        : "",
      useRoomPhrases,
      customRoomPhrases,
      communicationStyle: entryCommunicationStyle,
      liveAssistMode: entryLiveAssistMode,
      skipPrep,
      runtimeSupport,
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds,
      estimatedCents: finalEstimate.estimatedCents,
      compactPrep: true,
      prepRoomProfile,
      recoveryConstraints: liveRecoveryConstraints,
      supportStyle: entrySupportStyle,
      deliveryStyle: entrySupportStyle,
      receiverProfile: entryReceiverProfile,
      createdAt: Date.now(),
    };

    window.localStorage.setItem("GEORGE_LIVE_SUPPORT_STYLE", entrySupportStyle);
    window.localStorage.setItem("GEORGE_LIVE_DELIVERY_STYLE", entrySupportStyle);
    window.localStorage.setItem(
      "GEORGE_LIVE_RECEIVER_PROFILE",
      entryReceiverProfile,
    );
    window.localStorage.setItem(
      "george_live_entry_receiver_profile",
      entryReceiverProfile,
    );
    window.localStorage.setItem(
      "george_live_entry_support_preference",
      window.localStorage.getItem("GEORGE_LIVE_RECEIVER_PROFILE") ||
        window.localStorage.getItem("george_live_entry_receiver_profile") ||
        "audio_only",
    );
    window.localStorage.setItem(
      "george_live_entry_support_default",
      window.localStorage.getItem("GEORGE_LIVE_RECEIVER_PROFILE") ||
        window.localStorage.getItem("george_live_entry_receiver_profile") ||
        "audio_only",
    );
    window.localStorage.setItem("george_live_assist_mode", entryLiveAssistMode);

    if (!bypassBriefing) {
      setLiveBriefingStep(1);
      setLiveBriefingToaAccepted(false);
      setLiveBriefingSupportAccepted(false);
      setLiveRecoveryAcknowledged(false);
      setLiveReadyAccepted(false);
          if (typeof window !== "undefined")
        window.sessionStorage.removeItem("george_panel3_proof_started");
        setShowLiveBriefingRoom(true);
      return;
    }

    window.localStorage.setItem("george_start_new_live", "1");
    window.localStorage.removeItem("george_active_live_session_id");
    window.localStorage.removeItem("george_active_campaign_session_id");
    window.localStorage.removeItem("george_active_campaign");
    window.localStorage.removeItem("george_active_context");
    window.localStorage.removeItem("george_active_label");
    const sanitizedLastSetup = {
      ...liveSetup,
      objective: "",
      knownContext: "",
      observedReality: "",
      prepDocument: null,
      roomPackage: {
        ...roomPackage,
        desiredOutcome: "",
        observedReality: "",
        secondaryOutcome: "",
        secondaryObjective: "",
        fallbackOutcome: "",
        intangibleObjective: "",
      },
    };

    window.localStorage.setItem("GEORGE_LIVE_SETUP", JSON.stringify(liveSetup));
    window.localStorage.setItem(
      "GEORGE_LAST_LIVE_SETUP",
      JSON.stringify(sanitizedLastSetup),
    );
    window.localStorage.setItem(
      "george_live_setup_active",
      JSON.stringify(liveSetup),
    );
    window.localStorage.setItem(
      "george_live_assist_mode",
      entryLiveAssistMode,
    );
    window.localStorage.setItem(
      "george_live_runtime_support",
      JSON.stringify(runtimeSupport),
    );
    window.localStorage.setItem(
      GEORGE_LIVE_RECOVERY_STORAGE_KEY,
      JSON.stringify(liveRecoveryConstraints),
    );
    window.localStorage.setItem(
      "george_live_estimated_cents",
      String(finalEstimate.estimatedCents),
    );

    setObjective("");
    setKnownContext("");
    setPrepDocument(null);

    window.localStorage.setItem("george_live_prep_inputs_cleared", "1");

    window.location.href = "/george/live?ready=1";
  };

  const appendProofTranscript = (
    speaker: "george" | "user",
    message: string,
  ) => {
    setProofTranscript((current) => [...current, { speaker, text: message }]);
  };

  const beginProofOfAwareness = async () => {
    if (proofInProgress) return;
    if (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("george_panel3_proof_started") === "1"
    )
      return;
    if (typeof window !== "undefined")
      window.sessionStorage.setItem("george_panel3_proof_started", "1");
    if (proofComplete) {
      return;
    }

    setProofInProgress(true);
    setProofTranscript([{ speaker: "george", text: "Listening…" }]);

    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    let heardUser = false;

    const listenOnce = (timeoutMs = 3200) =>
      new Promise<string>((resolve) => {
        if (!SpeechRecognition) {
          window.setTimeout(() => resolve(""), timeoutMs);
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        const timer = window.setTimeout(() => {
          try {
            recognition.stop();
          } catch {}
          resolve("");
        }, timeoutMs);

        recognition.onresult = (event) => {
          const transcript = String(
            event.results[0]?.[0]?.transcript || "",
          ).trim();
          window.clearTimeout(timer);
          resolve(transcript);
        };

        recognition.onerror = () => {
          window.clearTimeout(timer);
          resolve("");
        };

        recognition.onend = () => {};

        try {
          recognition.start();
        } catch {
          window.clearTimeout(timer);
          resolve("");
        }
      });

    const askAndListen = async (line: string, timeoutMs = 3200) => {
      appendProofTranscript("george", line);
      await speakLiveEntryLine(line);
      const heard = await listenOnce(timeoutMs);
      if (heard) {
        heardUser = true;
        appendProofTranscript("user", heard);
      }
      return heard;
    };

    const first = await askAndListen(
      "Okay. Before we get started, is there anything you'd like me to know?",
    );
    if (!first) {
      const second = await askAndListen(
        "Anything at all? I can hear you.",
        5000,
      );
      if (!second) {
        appendProofTranscript("george", "Then let's go to work.");
        await speakLiveEntryLine("Then let's go to work.");
      }
    }

    if (heardUser) {
      let commitmentStatement =
        liveEntryReasoning.commitmentStatement || "I’ll keep that in mind.";

      try {
        const response = await fetch("/api/george/live/entry-reasoning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objective,
            position: chair || userPosition,
            audience: audienceType,
            roomSignal: knownContext,
            secondaryPosition:
              optionalSignalAnswers.fallbackOutcome ||
              optionalSignalAnswers.secondaryOutcome ||
              "",
            userName:
              cleanBriefingValue(
                window.localStorage.getItem("george_profile_name"),
              ) ||
              cleanBriefingValue(
                window.localStorage.getItem("george_user_name"),
              ) ||
              cleanBriefingValue(window.localStorage.getItem("george_name")) ||
              "there",
            proofTranscript: first || "",
          }),
        });

        const data = await response.json().catch(() => ({}));
        commitmentStatement = String(
          data?.commitmentStatement || commitmentStatement,
        ).trim();
      } catch {}

      appendProofTranscript(
        "george",
        `Understood. ${commitmentStatement || "I’ll keep that in mind."}`,
      );

      await speakLiveEntryLine(
        `Understood. ${commitmentStatement || "I’ll keep that in mind."}`,
      );
    }

    setProofComplete(true);
    setProofInProgress(false);
    undefined;
  };

  useEffect(() => {
    if (!showLiveBriefingRoom) return;

    liveBriefingOriginalSignalRef.current = {
      objective: cleanBriefingValue(objective),
      userPosition: cleanBriefingValue(userPosition),
      audienceType: cleanBriefingValue(audienceType),
      knownContext: cleanBriefingValue(knownContext),
    };

    setLiveBriefingEditAcknowledged(false);
  }, [showLiveBriefingRoom]);

  useEffect(() => {
    if (!showLiveBriefingRoom) return;

    fetch("/api/george/live/entry-reasoning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective,
        position: chair || userPosition,
        audience: audienceType,
        roomSignal: knownContext,
        secondaryPosition: userPosition,
        userName: sessionEmail ? sessionEmail.split("@")[0] : "Lester",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLiveEntryReasoning({
          roomObservation: String(data?.roomObservation || ""),
          supportSummary: String(data?.supportSummary || ""),
          commitmentStatement: String(data?.commitmentStatement || ""),
        });
      })
      .catch(() => {});
  }, [
    showLiveBriefingRoom,
    objective,
    chair,
    userPosition,
    audienceType,
    knownContext,
    sessionEmail,
  ]);

  const liveEntryVoiceUnlockedRef = useRef(false);

  const unlockLiveEntryVoice = () => {
    if (liveEntryVoiceUnlockedRef.current) return;

    try {
      const audio = new Audio();
      audio.muted = true;
      void audio
        .play()
        .then(() => {
          liveEntryVoiceUnlockedRef.current = true;
          audio.pause();
        })
        .catch(() => {
          liveEntryVoiceUnlockedRef.current = true;
        });
    } catch {
      liveEntryVoiceUnlockedRef.current = true;
    }
  };

  const stopLiveEntryVoice = () => {
    try {
      if (liveEntryAudioRef.current) {
        liveEntryAudioRef.current.pause();
        liveEntryAudioRef.current.currentTime = 0;
        liveEntryAudioRef.current = null;
      }

      if (liveEntryAudioUrlRef.current) {
        URL.revokeObjectURL(liveEntryAudioUrlRef.current);
        liveEntryAudioUrlRef.current = null;
      }
    } catch {}
  };

  const speakLiveEntryLine = async (message: string) => {
    const speechRequestId = liveEntrySpeechRequestRef.current + 1;
    liveEntrySpeechRequestRef.current = speechRequestId;

    stopLiveEntryVoice();

    try {
      const response = await fetch("/api/george/live/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          email: sessionEmail?.trim() || undefined,
        }),
      });

      if (!response.ok) return;
      if (liveEntrySpeechRequestRef.current !== speechRequestId) return;

      const blob = await response.blob();
      if (liveEntrySpeechRequestRef.current !== speechRequestId) return;

      const audioUrl = URL.createObjectURL(blob);

      if (liveEntrySpeechRequestRef.current !== speechRequestId) {
        URL.revokeObjectURL(audioUrl);
        return;
      }

      const audio = new Audio(audioUrl);

      liveEntryAudioRef.current = audio;
      liveEntryAudioUrlRef.current = audioUrl;

      await new Promise<void>((resolve) => {
        const finish = () => {
          if (liveEntryAudioRef.current === audio) {
            liveEntryAudioRef.current = null;
          }

          if (liveEntryAudioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl);
            liveEntryAudioUrlRef.current = null;
          }

          resolve();
        };

        audio.onended = finish;
        audio.onerror = finish;

        void audio.play().catch(finish);
      });
    } catch {}
  };

  useEffect(() => {
    return () => {
      liveEntrySpeechRequestRef.current += 1;
      stopLiveEntryVoice();
    };
  }, []);

  useEffect(() => {
    if (!showLiveBriefingRoom) return;
    if (liveBriefingStep !== 1) return;

    if (!liveBriefingToaAccepted) {
      setLiveBriefingReadyToContinue(false);

      if (!cleanBriefingValue(knownContext)) {
        liveBriefingRoomSignalEditedRef.current = false;
      }

      if (liveBriefingTermsPreviouslyAcceptedRef.current) {
        liveBriefingTermsPreviouslyAcceptedRef.current = false;
        liveBriefingHasReopenedEditsRef.current = true;
      }

      return;
    }

    const hasOperationalBriefingSignal =
      Boolean(cleanBriefingValue(knownContext)) ||
      Boolean(cleanBriefingValue(userPosition));

    liveBriefingTermsPreviouslyAcceptedRef.current = true;
    setLiveBriefingReadyToContinue(hasOperationalBriefingSignal);
  }, [
    showLiveBriefingRoom,
    liveBriefingStep,
    liveBriefingToaAccepted,
    knownContext,
    userPosition,
  ]);

  useEffect(() => {
    if (!showLiveBriefingRoom) return;
    if (!liveBriefingToaAccepted) return;
    if (liveBriefingEditAcknowledged) return;

    const original = liveBriefingOriginalSignalRef.current;

    const actualEditOccurred =
      cleanBriefingValue(objective) !== original.objective ||
      cleanBriefingValue(userPosition) !== original.userPosition ||
      cleanBriefingValue(audienceType) !== original.audienceType ||
      cleanBriefingValue(knownContext) !== original.knownContext;

    if (!actualEditOccurred) return;

    setLiveBriefingEditAcknowledged(true);
  }, [
    showLiveBriefingRoom,
    liveBriefingToaAccepted,
    liveBriefingEditAcknowledged,
    objective,
    userPosition,
    audienceType,
    knownContext,
  ]);

  useEffect(() => {
    if (!showLiveBriefingRoom) return;
    if (liveBriefingStep !== 3) return;
    if (proofInProgress || proofComplete) return;

    const timer = window.setTimeout(() => {
      void beginProofOfAwareness();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [showLiveBriefingRoom, liveBriefingStep, proofInProgress, proofComplete]);

  if (!ready) return null;

  const goBackFromLiveEntryQuestionSurface = () => {
    if (!returnToReadyRoomAfterBriefingRef.current) {
      goToPreviousLivePreparationState();
      return;
    }

    returnToReadyRoomAfterBriefingRef.current = false;
    setShowOpenAISignalSurface(false);
    setLiveEntryReadyMessageVisible(false);
    setCurrentOptionalSignalQuestion(null);
    setOptionalSignalLoading(false);
    setOptionalSignalComplete(true);
    setShowLiveBriefingRoom(true);
    setLiveBriefingStep(3);
  };

  const enterLiveFromBriefingSurface = () => {
    // If briefing was opened from Ready Room, the user has already
    // completed the Traditional popup sequence. Enter LIVE from there.
    if (returnToReadyRoomAfterBriefingRef.current) {
      returnToReadyRoomAfterBriefingRef.current = false;
      startLive(false, editableResources, true);
      return;
    }

    // Initial Traditional briefing does not own LIVE execution.
    // Hand back to the established Traditional preparation route:
    // Popup 1 -> Popup 2 Mechanics -> Popup 3 Ready Room.
    setShowOpenAISignalSurface(false);
    setLiveEntryReadyMessageVisible(false);
    setCurrentOptionalSignalQuestion(null);
    setOptionalSignalLoading(false);
    setOptionalSignalComplete(true);

    livePreparationHistoryRef.current = ["questions"];

    setShowLiveBriefingRoom(true);
    setLiveBriefingStep(1);
  };

  if (showOpenAISignalSurface) {
    const briefingSignalLabel = (key: string) => {
      const normalized = key.toLowerCase();

      if (
        normalized === "clarify_desiredoutcome" ||
        normalized === "desiredoutcome" ||
        normalized === "intent"
      ) {
        return "Goal";
      }

      if (
        normalized === "clarify_role" ||
        normalized.includes("role") ||
        normalized.includes("position")
      ) {
        return "Role";
      }

      if (
        normalized === "clarify_audience" ||
        normalized.includes("audience") ||
        normalized.includes("counterparty") ||
        normalized.includes("decisionmaker")
      ) {
        return "Speaking with";
      }

      if (
        normalized === "clarify_knowncontext" ||
        normalized.includes("context")
      ) {
        return "Context";
      }

      if (
        normalized.includes("success") ||
        normalized.includes("condition")
      ) {
        return "Success";
      }

      return key
        .replace(/^signal_\d+$/, "Additional signal")
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (character) => character.toUpperCase());
    };

    const compactBriefingSignalValue = (value: string) => {
      const compact = value
        .trim()
        .replace(/^i(?:'m| am)\s+/i, "")
        .replace(/^i want to\s+/i, "")
        .replace(/^i'm looking to\s+/i, "");

      if (compact.length <= 34) return compact;

      return `${compact.slice(0, 31).trimEnd()}…`;
    };

    const completedTraditionalSignals = Object.entries(
      optionalSignalAnswers,
    )
      .map(([key, value]) => {
        const answer = String(value || "").trim();

        if (!answer) return null;

        return {
          key,
          label: briefingSignalLabel(key),
          answer: compactBriefingSignalValue(answer),
          fullAnswer: answer,
        };
      })
      .filter((signal) => signal !== null);

    const briefingSummary = [
      optionalSignalAnswers.clarify_desiredOutcome
        ? `Goal: ${String(
            optionalSignalAnswers.clarify_desiredOutcome,
          ).replace(/[.]+$/, "")}.`
        : "",
      optionalSignalAnswers.clarify_role
        ? `In this conversation I am ${String(
            optionalSignalAnswers.clarify_role,
          ).replace(/[.]+$/, "")}.`
        : "",
      optionalSignalAnswers.clarify_audience
        ? `I'm speaking with ${String(
            optionalSignalAnswers.clarify_audience,
          ).replace(/[.]+$/, "")}.`
        : "",
      optionalSignalAnswers.clarify_knownContext
        ? `The conversation is about ${String(
            optionalSignalAnswers.clarify_knownContext,
          ).replace(/[.]+$/, "")}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <main className="relative min-h-[100dvh] overflow-y-auto bg-black px-5 py-10 text-white sm:px-8 sm:py-14">
        <div className="relative z-10 mx-auto w-full max-w-[760px]">
          <div className="flex items-center">
            <BxPageHeader
              backLabel="BACK"
              onBack={goBackFromLiveEntryQuestionSurface}
            />
          </div>

          <div className="mt-14 sm:mt-20">
            {completedTraditionalSignals.length > 0 && (
              <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-3 transition-all duration-500">
                {completedTraditionalSignals.map((signal) => (
                  <div
                    key={signal.key}
                    className="flex items-start gap-3 font-mono text-[11px] leading-6 text-white/50 transition-all duration-500"
                  >
                    <span className="mt-[1px] text-[#AFC0FF]/80">✓</span>
                    <span>
                      <span className="uppercase tracking-[0.16em] text-white/34">
                        {signal.label}
                      </span>
                      <span
                        className="ml-3 text-white/66"
                        title={signal.fullAnswer}
                      >
                        {signal.answer}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {optionalSignalLoading && (
              <div
                className="george-thinking-dots flex h-[35px] items-center gap-2"
                role="status"
                aria-label="GEORGE is thinking"
              >
                <span />
                <span />
                <span />
              </div>
            )}

            {!optionalSignalLoading &&
              currentOptionalSignalQuestion &&
              !liveEntryReadyMessageVisible && (
                <div>
                  <div className="min-h-[92px] font-mono text-[25px] leading-[1.55] tracking-[-0.025em] text-white/92 sm:text-[30px]">
                    {typedOptionalSignalQuestion}
                  </div>

                  <input
                    value={optionalSignalInput}
                    onChange={(event) =>
                      setOptionalSignalInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();

                        if (traditionalBriefingAskGeorgeActive) {
                          void submitTraditionalAskGeorge();
                          return;
                        }

                        void submitOptionalSignalAnswer();
                      }
                    }}
                    autoFocus
                    placeholder={
                      traditionalBriefingAskGeorgeActive
                        ? "Ask me..."
                        : "Type your answer..."
                    }
                    className="mt-10 w-full border-0 border-b border-white/20 bg-transparent px-0 py-4 font-mono text-[18px] leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-[#8FAEFF]/70"
                  />

                  {!optionalSignalInput.trim() &&
                    traditionalBriefingExamples.length > 0 && (
                      <div
                        key={`${currentOptionalSignalQuestion.key}-${traditionalBriefingExampleIndex}`}
                        className="mt-3 font-mono text-[12px] leading-5 text-white/30 transition-opacity duration-500"
                      >
                        {
                          traditionalBriefingExamples[
                            traditionalBriefingExampleIndex %
                              traditionalBriefingExamples.length
                          ]
                        }
                      </div>
                    )}

                  {traditionalBriefingGeorgeResponse && (
                    <div className="mt-7 max-w-[660px] font-mono text-[14px] leading-7 text-white/68">
                      {traditionalBriefingGeorgeResponse}
                    </div>
                  )}

                  <div className="mt-10 max-w-[660px] font-mono text-[11px] leading-6 text-white/36">
                    You may enter LIVE now, or continue briefing—which will
                    sharpen my support.
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={enterLiveFromBriefingSurface}
                      className="george-live-primary-shimmer relative overflow-hidden rounded-[11px] bg-[#4E7CFF] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#5A84FF]"
                    >
                      ENTER LIVE
                    </button>

                    <button
                      type="button"
                      aria-pressed={traditionalBriefingAskGeorgeActive}
                      onClick={() => {
                        setTraditionalBriefingAskGeorgeActive((current) => !current);
                        setTraditionalBriefingGeorgeResponse("");
                        setOptionalSignalInput("");
                      }}
                      className={`rounded-[11px] border px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] transition ${
                        traditionalBriefingAskGeorgeActive
                          ? "border-[#8FAEFF]/50 bg-[#10182D] text-white"
                          : "border-white/[0.12] text-white/58 hover:border-white/28 hover:text-white"
                      }`}
                    >
                      {traditionalBriefingAskGeorgeActive
                        ? "ANSWER BRIEFING"
                        : "ASK GEORGE"}
                    </button>
                  </div>

                  <div
                    aria-hidden="true"
                    className={`mt-8 min-h-[58px] max-w-[680px] transition-opacity duration-700 ${
                      traditionalBriefingProductThoughtVisible
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    {traditionalBriefingProductThought && (
                      <p className="font-mono text-[16px] leading-7 tracking-[-0.015em] text-white/48 sm:text-[18px] sm:leading-8">
                        <span className="text-[#8FAEFF]/44">“</span>
                        {traditionalBriefingProductThought}
                        <span className="text-[#8FAEFF]/44">”</span>
                        <span className="ml-1 text-white/20">|</span>
                      </p>
                    )}
                  </div>

                </div>
              )}

            {liveEntryReadyMessageVisible && (
              <div className="transition-all duration-700">
                {briefingSummary && (
                  <div className="font-mono text-[22px] leading-[1.75] tracking-[-0.02em] text-white/82 sm:text-[26px]">
                    {briefingSummary}
                  </div>
                )}

                <div className="mt-7 max-w-[660px] font-mono text-[11px] leading-6 text-white/38">
                  I have enough signal to support you in LIVE. Continue briefing
                  if there&apos;s something important I should know.
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={enterLiveFromBriefingSurface}
                    className="george-live-primary-shimmer relative overflow-hidden rounded-[12px] bg-[#4E7CFF] px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#5A84FF]"
                  >
                    ENTER LIVE
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLiveEntryReadyMessageVisible(false);
                      void requestNextOptionalSignalQuestion();
                    }}
                    className="rounded-[12px] border border-white/[0.12] px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62 transition hover:border-white/28 hover:text-white"
                  >
                    CONTINUE BRIEFING
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (showResumeConversationList) {
    const liveSessions = getSessionsForMode("live").filter(
      (session) => !session.archived,
    );

    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center bg-[#06070A] px-4 text-white">
        <div className="w-full max-w-[440px] rounded-[1.25rem] border border-white/[0.07] bg-[#05080D]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/30">
                Resume Conversation
              </div>
              <div className="mt-1 text-[14px] text-white/70">
                Choose the room to brief before LIVE.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowResumeConversationList(false)}
              className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/44 hover:border-white/[0.18] hover:text-white/72"
            >
              Back
            </button>
          </div>

          <div className="mt-3 max-h-[58dvh] space-y-2 overflow-y-auto pr-1">
            {liveSessions.length === 0 ? (
              <div className="rounded-[1rem] border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] leading-6 text-white/42">
                No saved LIVE conversations yet.
              </div>
            ) : (
              liveSessions.slice(0, 12).map((session) => {
                const metadata = session.metadata || {};
                const outcome =
                  metadata.desiredOutcome ||
                  session.userGoal ||
                  "Outcome not set";
                const audience =
                  metadata.audience ||
                  metadata.audienceType ||
                  metadata.targetAudience ||
                  "Audience not set";
                const updated = session.updatedAt
                  ? new Date(session.updatedAt).toLocaleDateString()
                  : "Recent";

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => resumeLiveConversation(session)}
                    className="block w-full rounded-[1rem] border border-white/[0.065] bg-white/[0.018] p-4 text-left transition hover:border-[#BFC7FF]/28 hover:bg-[#BFC7FF]/[0.055]"
                  >
                    <div className="text-[14px] font-medium text-white/78">
                      {session.title || "LIVE Conversation"}
                    </div>
                    <div className="mt-2 text-[12px] leading-5 text-white/44">
                      Outcome: {String(outcome)}
                    </div>
                    <div className="text-[12px] leading-5 text-white/34">
                      Audience: {String(audience)}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/22">
                      Last active: {updated}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </main>
    );
  }

  if (
    !sessionEmail.trim() &&
    !preLivePreviewReady &&
    window.localStorage.getItem("george_founder_access") !== "server-verified"
  ) {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center bg-[#06070A] px-4 text-white">
        <div className="w-full max-w-[460px] rounded-[28px] bg-[#050505] p-6 shadow-none ">
          <div className="text-[10px] uppercase tracking-[0.26em] text-white/28">
            LIVE requires sign-in
          </div>
          <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white/90">
            Sign in to use LIVE.
          </h1>
          <p className="mt-2 text-[13px] leading-5 text-white/46">
            LIVE uses session continuity and conversation context. Sign in so
            GEORGE can protect the room from stale or unowned context.
          </p>
          <a
            href="/george"
            className="mt-5 block rounded-[0.82rem] border border-[#4E7CFF]/[0.16] bg-[#4E7CFF]/[0.08] px-4 py-3 text-center text-[13px] font-semibold text-[#D7DCFF]/86 transition hover:bg-[#4E7CFF]/[0.14] hover:text-white"
          >
            Return to GEORGE
          </a>
        </div>
      </main>
    );
  }

  const setActiveAdaptiveSupport = (
    panelId: LiveBriefingSupportPanelId,
  ) => {
    const runtimeStyle = toRuntimeSupportStyle(panelId);

    setLiveBriefingActiveSupportStyle(panelId);
    setSelectedSupportStyle(normalizeLiveSupportStyle(runtimeStyle));
    setLiveBriefingSupportAccepted(false);
    setLiveRecoveryAcknowledged(false);
    setLiveRecoveryAcknowledgementOpen(false);
    setLiveBriefingCapabilitiesConfirmed(false);
    setLiveBriefingOpenMechanicsPanel(null);

    try {
      window.localStorage.setItem(
        "GEORGE_LIVE_SUPPORT_STYLE",
        runtimeStyle,
      );
      window.localStorage.setItem(
        "GEORGE_LIVE_DELIVERY_STYLE",
        runtimeStyle,
      );
      window.localStorage.setItem(
        "george_live_adaptive_support_preference",
        panelId === "response" ? "response" : "cue",
      );
      window.dispatchEvent(new Event("george-live-support-style-change"));
    } catch {}
  };

  const setActiveReceiverProfile = (
    profile: LiveReceiverProfilePanelId,
  ) => {
    setSelectedReceiverProfile(profile);
    setReceiverProfileConfirmed(true);
    setLiveBriefingSupportAccepted(false);
    setLiveRecoveryAcknowledged(false);
    setLiveRecoveryAcknowledgementOpen(false);
    setLiveBriefingCapabilitiesConfirmed(false);
    setLiveBriefingOpenMechanicsPanel(null);

    const activeSupportPanelId: LiveBriefingSupportPanelId =
      liveBriefingActiveSupportStyle === "response" ||
      selectedSupportStyle === "response"
        ? "response"
        : "advice";

    try {
      window.localStorage.setItem("GEORGE_LIVE_RECEIVER_PROFILE", profile);
      window.localStorage.setItem(
        "george_live_entry_receiver_profile",
        profile,
      );
      window.localStorage.setItem(
        "george_live_entry_support_preference",
        profile,
      );

      const activeRuntimeStyle =
        toRuntimeSupportStyle(activeSupportPanelId);

      window.localStorage.setItem(
        "GEORGE_LIVE_SUPPORT_STYLE",
        activeRuntimeStyle,
      );
      window.localStorage.setItem(
        "GEORGE_LIVE_DELIVERY_STYLE",
        activeRuntimeStyle,
      );
      window.dispatchEvent(
        new Event("george-live-receiver-profile-change"),
      );
    } catch {}
  };

  const setActiveCommunicationStyle = (style: string) => {
    setCommunicationStyle(style);
    setLiveBriefingCommunicationConfirmed(true);
    setLiveBriefingSupportAccepted(false);
    setLiveRecoveryAcknowledged(false);
    setLiveRecoveryAcknowledgementOpen(false);
    setLiveBriefingCapabilitiesConfirmed(false);
    setLiveBriefingOpenMechanicsPanel(null);

    try {
      window.localStorage.setItem("george_live_communication_style", style);
    } catch {}
  };

  if (showLiveBriefingRoom) {
    const objectiveLabel =
      cleanBriefingValue(objective) || "the desired outcome";
    const positionLabel = titleBriefingValue(
      userPosition || chair,
      "your position",
    );
    const audienceLabel = titleBriefingValue(audienceType, "the audience");
    const roomLabel = titleBriefingValue(resolvedConversationType, "this room");
    const secondaryPosition =
      cleanBriefingValue(optionalSignalAnswers.fallbackOutcome) ||
      cleanBriefingValue(optionalSignalAnswers.secondaryOutcome) ||
      cleanBriefingValue(preLiveSignals.fallbackOutcome) ||
      cleanBriefingValue(preLiveSignals.secondaryOutcome);

    const setBriefingSecondaryOutcome = (value: string) => {
      setOptionalSignalAnswers((previous) => ({
        ...previous,
        secondaryOutcome: value,
        fallbackOutcome: value,
      }));

      setPreLiveSignals((previous) => ({
        ...previous,
        secondaryOutcome: value,
        fallbackOutcome: value,
      }));
    };

    const briefingInputsLocked = liveBriefingToaAccepted;
    const activeSupportPanelId: LiveBriefingSupportPanelId =
      liveBriefingActiveSupportStyle === "response" ||
      selectedSupportStyle === "response"
        ? "response"
        : "advice";
    const activeAdaptiveSupportPanel =
      LIVE_SUPPORT_PANELS.find(
        (panel) => panel.id === activeSupportPanelId,
      ) || LIVE_SUPPORT_PANELS[0];
    const activeReceiverPanel =
      LIVE_RECEIVER_PROFILE_PANELS.find(
        (panel) => panel.id === selectedReceiverProfile,
      ) || LIVE_RECEIVER_PROFILE_PANELS[0];
    const mechanicsSelectionsComplete = Boolean(
      activeSupportPanelId &&
        selectedReceiverProfile &&
        String(communicationStyle || "").trim(),
    );

    const compactMechanicsChoice = ({
      label,
      value,
      summary,
      onChange,
      recommended = false,
    }: {
      label: string;
      value: string;
      summary: string;
      onChange: () => void;
      recommended?: boolean;
    }) => (
      <div className="george-popup-settle flex items-start gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.018] px-3 py-2.5 font-mono text-[11px] leading-6 text-white/50">
        <span className="mt-[1px] shrink-0 text-[#AFC0FF]/80">✓</span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="uppercase tracking-[0.16em] text-white/34">
              {label}
            </span>
            <span className="text-white/66">{value}</span>

            {recommended && (
              <span className="text-[8px] uppercase tracking-[0.14em] text-[#AFC0FF]/54">
                Recommended
              </span>
            )}
          </div>

          <div className="mt-0.5 text-[9.5px] leading-4 text-white/30">
            {summary}
          </div>
        </div>

        <button
          type="button"
          onClick={onChange}
          className="george-edit-gleam relative shrink-0 overflow-hidden px-1 py-0.5 text-[8px] uppercase tracking-[0.15em] text-white/38 transition hover:text-white/72"
        >
          Edit
        </button>
      </div>
    );

    const observation = buildBriefingObservation(
      roomLabel,
      audienceLabel,
      objectiveLabel,
      knownContext,
    );

    if (
      !isFreshTraditionalPreparation &&
      !generatedBriefingRoomSignalRef.current
    ) {
      generatedBriefingRoomSignalRef.current = observation;
    }

    const updateBriefingObjective = (value: string) => {
      const nextObjectiveLabel =
        cleanBriefingValue(value) || "the desired outcome";
      const nextObservation = buildBriefingObservation(
        roomLabel,
        audienceLabel,
        nextObjectiveLabel,
        "",
      );

      setObjective(value);

      if (
        !isFreshTraditionalPreparation &&
        !liveBriefingRoomSignalEditedRef.current
      ) {
        generatedBriefingRoomSignalRef.current = nextObservation;
        setKnownContext(nextObservation);
      }
    };

    const updateBriefingRoomSignal = (value: string) => {
      liveBriefingRoomSignalEditedRef.current = true;
      setKnownContext(value);
    };

    const briefingPreparation = buildBriefRoomPreparation();
    const briefingUnderstandingSignals = Array.from(
      new Set(
        [
          roomLabel !== "this room" ? roomLabel : "",
          audienceLabel !== "the audience" ? audienceLabel : "",
          /vc|venture|investor|capital|fundraising|raise|financing|valuation|term sheet|series\s*[abc]|\$|billion|deal/i.test(
            objectiveLabel,
          )
            ? "Capital / investor signal"
            : "",
          /board|executive|ceo|strategy|acquisition|merger/i.test(
            `${roomLabel} ${audienceLabel} ${objectiveLabel}`,
          )
            ? "Executive room signal"
            : "",
          /negotiat|terms|offer|price|deal/i.test(
            `${roomLabel} ${objectiveLabel}`,
          )
            ? "Negotiation signal"
            : "",
          prepDocument ? "Documentation attached" : "",
        ].filter(Boolean),
      ),
    ).slice(0, 5);

    const documentationRecommendations = prepDocumentPrompt.recommendations.map(
      (title) => ({
        title,
        reason: /pitch|financial|cap table|term|market|traction/i.test(title)
          ? "Useful for credibility, proof, valuation, risk, or investor questions."
          : "Useful if it materially improves timing, judgment, or execution.",
      }),
    );

    if (liveBriefingStep === 1) {
      const toggleBriefingSection = (
        section:
          | "outcome"
          | "responsibility"
          | "participants"
          | "context"
          | "additional"
          | "documents",
      ) => {
        setLiveBriefingOpenSection((current) =>
          current === section ? null : section,
        );
      };

      const resolvedBriefingOutcome =
        cleanBriefingValue(preLiveSignals.desiredOutcome) ||
        cleanBriefingValue(objective);

      const resolvedBriefingResponsibility =
        cleanBriefingValue(preLiveSignals.role) ||
        cleanBriefingValue(userPosition || chair);

      const resolvedBriefingParticipants =
        cleanBriefingValue(preLiveSignals.counterparty) ||
        cleanBriefingValue(audienceType);

      const resolvedBriefingContext =
        cleanBriefingValue(preLiveSignals.conversationContext) ||
        cleanBriefingValue(knownContext);

      const resolvedAdditionalSignal =
        cleanBriefingValue(secondaryPosition) ||
        Object.values(optionalSignalAnswers)
          .map((value) => cleanBriefingValue(String(value || "")))
          .find(Boolean) ||
        "";

      const briefingRows = [
        {
          id: "outcome" as const,
          label: "Desired outcome",
          summary: resolvedBriefingOutcome || "Outcome pending",
        },
        {
          id: "responsibility" as const,
          label: "Your responsibility",
          summary:
            resolvedBriefingResponsibility || "Responsibility pending",
        },
        {
          id: "participants" as const,
          label: "Conversation with",
          summary:
            resolvedBriefingParticipants || "Participants pending",
        },
        {
          id: "context" as const,
          label: "Conversation and known context",
          summary: resolvedBriefingContext || "Context pending",
        },
        {
          id: "additional" as const,
          label: "Additional signal",
          summary:
            resolvedAdditionalSignal || "Nothing additional yet",
        },
        ...(prepDocument
          ? [
              {
                id: "documents" as const,
                label: "Documents",
                summary: prepDocument.name,
              },
            ]
          : []),
      ];

      return (
        <PanelShell
          label={
            priorPreparationExplicitlyRestored
              ? "BRIEF ROOM · UPDATE"
              : "BRIEF ROOM · EDITABLE"
          }
          title={
            priorPreparationExplicitlyRestored
              ? "Before we begin..."
              : liveBriefingToaAccepted
                ? "Here’s what I understand"
                : "Review my signals..."
          }
          stage={1}
          onBack={goToPreviousLivePreparationState}
        >
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {briefingRows.map((row) => (
                <div
                  key={`briefing-signal-${row.id}`}
                  className="george-popup-settle flex items-start gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.018] px-3 py-2.5 font-mono text-[11px] leading-6 text-white/50"
                >
                  <span className="mt-[1px] shrink-0 text-[#AFC0FF]/80">✓</span>
                  <span className="min-w-0">
                    <span className="uppercase tracking-[0.16em] text-white/34">
                      {row.label}
                    </span>
                    <span className="ml-3 text-white/66">
                      {row.summary}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-[650px] text-[12px] leading-5 text-[#D7DBE4]/50">
              {priorPreparationExplicitlyRestored
                ? "Has anything changed?"
                : isFreshTraditionalPreparation
                  ? "Review the briefing. Open one section at a time to add or edit it."
                  : "Review everything GEORGE learned about the conversation. Open one section at a time to edit it."}
            </p>

            <div className="mt-4 overflow-hidden border-y border-white/[0.06]">
              <button
                type="button"
                aria-expanded={liveBriefingSignalsExpanded}
                onClick={() => {
                  setLiveBriefingSignalsExpanded((current) => {
                    const next = !current;

                    if (!next) {
                      setLiveBriefingOpenSection(null);
                    }

                    return next;
                  });
                }}
                className="relative flex w-full items-center justify-between gap-4 overflow-hidden py-3 text-left transition hover:text-white"
              >
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/38">
                    Clarify Signals
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-white/30">
                    Review or edit what GEORGE will carry into LIVE.
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`shrink-0 text-[13px] text-white/36 transition-transform duration-[var(--george-motion-fast)] ease-[var(--george-motion-ease)] ${
                    liveBriefingSignalsExpanded ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity,transform] duration-[var(--george-motion-deliberate)] ease-[var(--george-motion-ease)] ${
                  liveBriefingSignalsExpanded
                    ? "grid-rows-[1fr] translate-y-0 opacity-100"
                    : "pointer-events-none grid-rows-[0fr] -translate-y-2 opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="divide-y divide-white/[0.04] border-t border-white/[0.04]">
              {briefingRows.map((row) => {
                const open = liveBriefingOpenSection === row.id;

                return (
                  <div key={row.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleBriefingSection(row.id)}
                      className={`relative flex w-full items-start justify-between gap-4 overflow-hidden px-3.5 py-2.5 text-left transition ${
                        row.id === "documents"
                          ? "border-[#4E7CFF]/22 bg-[#4E7CFF]/[0.07] hover:bg-[#4E7CFF]/[0.11]"
                          : "hover:bg-white/[0.018]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/28">
                          {row.label}
                        </span>
                        <span className="mt-1.5 block line-clamp-2 text-[12.5px] leading-5 text-[#F2F4FF]/74">
                          {row.summary}
                        </span>
                      </span>

                      <span className="george-edit-gleam relative shrink-0 overflow-hidden rounded-[0.55rem] border border-white/[0.12] bg-white/[0.012] px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] text-white/46 transition hover:border-white/[0.22] hover:text-white/72">
                        {open ? "Close" : "Edit"}
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-[var(--george-motion-deliberate)] ease-[var(--george-motion-ease)] ${
                        open
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="border-t border-white/[0.04] bg-white/[0.012] px-4 py-4">
                          {row.id === "outcome" && (
                            <textarea
                              value={objective}
                              disabled={briefingInputsLocked}
                              onChange={(event) =>
                                updateBriefingObjective(event.target.value)
                              }
                              rows={3}
                              className="w-full resize-none rounded-[0.85rem] border border-white/[0.06] bg-[#0A0C10] px-3 py-2.5 text-[13px] leading-6 text-[#F2F4FF]/88 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={objectiveLabel}
                            />
                          )}

                          {row.id === "responsibility" && (
                            <input
                              value={userPosition}
                              disabled={briefingInputsLocked}
                              onChange={(event) =>
                                setUserPosition(event.target.value)
                              }
                              className="w-full rounded-[0.85rem] border border-white/[0.06] bg-[#0A0C10] px-3 py-2.5 text-[13px] text-[#F2F4FF]/84 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={positionLabel}
                            />
                          )}

                          {row.id === "participants" && (
                            <input
                              value={audienceType}
                              disabled={briefingInputsLocked}
                              onChange={(event) =>
                                setAudienceType(event.target.value)
                              }
                              className="w-full rounded-[0.85rem] border border-white/[0.06] bg-[#0A0C10] px-3 py-2.5 text-[13px] text-[#F2F4FF]/84 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={audienceLabel}
                            />
                          )}

                          {row.id === "context" && (
                            <textarea
                              value={knownContext}
                              disabled={briefingInputsLocked}
                              onChange={(event) =>
                                updateBriefingRoomSignal(event.target.value)
                              }
                              rows={4}
                              className="w-full resize-none rounded-[0.85rem] border border-white/[0.06] bg-[#0A0C10] px-3 py-2.5 text-[13px] leading-6 text-[#D7DBE4]/80 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={
                                isFreshTraditionalPreparation
                                  ? "Context pending"
                                  : observation
                              }
                            />
                          )}

                          {row.id === "additional" && (
                            <textarea
                              value={secondaryPosition}
                              disabled={briefingInputsLocked}
                              onChange={(event) =>
                                setBriefingSecondaryOutcome(event.target.value)
                              }
                              rows={3}
                              className="w-full resize-none rounded-[0.85rem] border border-white/[0.06] bg-[#0A0C10] px-3 py-2.5 text-[13px] leading-6 text-[#D7DBE4]/80 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder="Anything else GEORGE should understand, remember, watch for, or help accomplish."
                            />
                          )}

                          {row.id === "documents" && (
                            <div className="relative overflow-hidden rounded-[0.95rem] border border-[#4E7CFF]/[0.28] bg-[#4E7CFF]/[0.075] p-3.5 shadow-[0_0_30px_rgba(78,124,255,0.08)]">
                              <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent blur-[1px] animate-[briefingUploadShimmer_4.8s_ease-in-out_infinite]"
                              />
                              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D7DCFF]/64">
                                Add material GEORGE should know
                              </div>
                              <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/46">
                                Upload facts, history, proof, constraints, or
                                language that should strengthen this briefing.
                              </p>

                              <div className="mt-3">
                                <RelevantDocumentationPanel
                                  recommendations={documentationRecommendations}
                                  document={prepDocument}
                                  reading={prepDocumentReading}
                                  onUpload={(file) =>
                                    void handlePrepDocumentUpload(file)
                                  }
                                  onRemove={() => setPrepDocument(null)}
                                />
                              </div>

                              {prepDocument?.summary && (
                                <div className="mt-3 rounded-[0.8rem] border border-white/[0.055] bg-[#0A0C10] px-3 py-2.5">
                                  <div className="text-[9px] uppercase tracking-[0.18em] text-white/28">
                                    Incorporated from document
                                  </div>
                                  <div className="mt-1.5 text-[11px] leading-5 text-white/48">
                                    {prepDocument.summary}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {row.id !== "documents" && (
                            <button
                              type="button"
                              onClick={() => setLiveBriefingOpenSection(null)}
                              className="george-edit-gleam relative mt-3 overflow-hidden rounded-[0.55rem] border border-white/[0.12] bg-white/[0.012] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/46 transition hover:border-white/[0.22] hover:text-white/72"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                  </div>
                </div>
              </div>
            </div>

            {(briefingUnderstandingSignals.length > 0 ||
              briefingPreparation?.opportunities?.[0] ||
              briefingPreparation?.risks?.[0]) && (
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/28">
                  What I will carry into LIVE
                </div>

                {briefingUnderstandingSignals.length > 0 && (
                  <div className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/50">
                    {briefingUnderstandingSignals.join(" • ")}
                  </div>
                )}

                <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/42 sm:grid-cols-2">
                  {briefingPreparation?.opportunities?.[0] && (
                    <div>
                      Opportunity: {briefingPreparation.opportunities[0]}
                    </div>
                  )}
                  {briefingPreparation?.risks?.[0] && (
                    <div>Risk: {briefingPreparation.risks[0]}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <label
            className={`mt-4 flex cursor-pointer items-start gap-3 rounded-[1rem] border px-4 py-3 transition-[background-color,border-color,box-shadow] duration-[var(--george-motion-standard)] ease-[var(--george-motion-ease)] ${
              liveBriefingToaAccepted
                ? "border-[#D7DCFF]/70 bg-[#4E7CFF]/[0.12] shadow-[0_0_34px_rgba(174,182,255,0.20)]"
                : "border-[#4E7CFF]/28 bg-[#4E7CFF]/[0.028]"
            }`}
          >
            <input
              type="checkbox"
              checked={liveBriefingToaAccepted}
              onChange={(event) => {
                unlockLiveEntryVoice();
                setLiveBriefingToaAccepted(event.target.checked);

                if (event.target.checked) {
                  setLiveBriefingOpenSection(null);
                  setLiveBriefingSignalsExpanded(false);
                }
              }}
              className="mt-1 h-4 w-4 accent-[#4E7CFF]"
            />
            <span className="text-[12.5px] leading-5 text-[#D7DBE4]/72">
              I reviewed this briefing. It reflects what I want GEORGE to
              understand about this conversation before LIVE.
            </span>
          </label>

          <AwakeButton
            active={liveBriefingReadyToContinue}
            onClick={() => {
              transitionToLivePreparationState({
                previousState: "popup1",
                nextStep: 2,
              });
            }}
          >
            Continue
          </AwakeButton>

          <style jsx>{`
            @keyframes briefingUploadShimmer {
              0%,
              72% {
                transform: translateX(0);
                opacity: 0;
              }
              78% {
                opacity: 0.42;
              }
              100% {
                transform: translateX(430%);
                opacity: 0;
              }
            }
          `}</style>
        </PanelShell>
      );
    }

    if (liveBriefingStep === 2) {
      const liveTierLabel = String(tier || "smart").toUpperCase();
      const goBackFromMechanics = () => {
        goToPreviousLivePreparationState();
      };
      const confirmPrivacyAndContinue = () => {
        if (!mechanicsSelectionsComplete) return;

        setLiveRecoveryAcknowledged(true);
        setLiveBriefingCapabilitiesConfirmed(true);
        setLiveBriefingSupportAccepted(true);
        setLiveBriefingExpandedSupportPanel(null);

        try {
          window.localStorage.setItem("george_live_entry_steering_seen", "1");
          window.localStorage.setItem(
            "george_live_entry_privacy_acknowledged",
            "1",
          );
          window.localStorage.setItem(
            "GEORGE_LIVE_RECEIVER_PROFILE",
            activeReceiverPanel.id,
          );
          window.localStorage.setItem(
            "george_live_entry_receiver_profile",
            activeReceiverPanel.id,
          );
          window.localStorage.setItem(
            "george_live_entry_support_preference",
            activeReceiverPanel.id,
          );
          const activeRuntimeStyle = toRuntimeSupportStyle(activeSupportPanelId);

          window.localStorage.setItem(
            "GEORGE_LIVE_SUPPORT_STYLE",
            activeRuntimeStyle,
          );
          window.localStorage.setItem(
            "GEORGE_LIVE_DELIVERY_STYLE",
            activeRuntimeStyle,
          );
        } catch {}
      };

      return (
        <PanelShell
          label="BRIEF ROOM · MECHANICS"
          title="Mechanics"
          stage={2}
          onBack={goBackFromMechanics}
        >
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              {compactMechanicsChoice({
                label: "GEORGE's support",
                value: activeAdaptiveSupportPanel.label,
                summary: activeAdaptiveSupportPanel.line,
                onChange: () =>
                  setLiveBriefingOpenMechanicsPanel((current) =>
                    current === "support" ? null : "support",
                  ),
              })}

              <div
                className={`grid transition-[grid-template-rows,opacity,transform,margin] duration-[var(--george-motion-deliberate)] ease-[var(--george-motion-ease)] ${
                  liveBriefingOpenMechanicsPanel === "support"
                    ? "mt-2 grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <LiveAdaptiveSupportPanel
                    activePanel={activeAdaptiveSupportPanel}
                    open={true}
                    panels={LIVE_SUPPORT_PANELS}
                    onToggle={() =>
                      setLiveBriefingOpenMechanicsPanel(null)
                    }
                    onSelect={setActiveAdaptiveSupport}
                  />

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setLiveBriefingOpenMechanicsPanel(null)
                      }
                      className="george-edit-gleam relative shrink-0 overflow-hidden rounded-[0.55rem] border border-white/[0.12] bg-white/[0.012] px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] text-white/46 transition hover:border-white/[0.22] hover:text-white/72"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {compactMechanicsChoice({
                label: "Delivery profile",
                value: activeReceiverPanel.label,
                summary: activeReceiverPanel.line,
                onChange: () =>
                  setLiveBriefingOpenMechanicsPanel((current) =>
                    current === "receiver" ? null : "receiver",
                  ),
              })}

              <div
                className={`grid transition-[grid-template-rows,opacity,transform,margin] duration-[var(--george-motion-deliberate)] ease-[var(--george-motion-ease)] ${
                  liveBriefingOpenMechanicsPanel === "receiver"
                    ? "mt-2 grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <LiveReceiverProfilePanel
                    activePanel={activeReceiverPanel}
                    open={true}
                    panels={LIVE_RECEIVER_PROFILE_PANELS}
                    onToggle={() =>
                      setLiveBriefingOpenMechanicsPanel(null)
                    }
                    onSelect={setActiveReceiverProfile}
                  />

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setLiveBriefingOpenMechanicsPanel(null)
                      }
                      className="george-edit-gleam relative shrink-0 overflow-hidden rounded-[0.55rem] border border-white/[0.12] bg-white/[0.012] px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] text-white/46 transition hover:border-white/[0.22] hover:text-white/72"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {compactMechanicsChoice({
                label: "Speaking style",
                value: communicationStyle,
                summary: "Support will follow this speaking style in LIVE.",
                onChange: () =>
                  setLiveBriefingOpenMechanicsPanel((current) =>
                    current === "speaking" ? null : "speaking",
                  ),
              })}

              <div
                className={`grid transition-[grid-template-rows,opacity,transform,margin] duration-[var(--george-motion-deliberate)] ease-[var(--george-motion-ease)] ${
                  liveBriefingOpenMechanicsPanel === "speaking"
                    ? "mt-2 grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <LiveSpeakingStylePanel
                    confirmed={false}
                    open={true}
                    selectedStyle={communicationStyle}
                    onEdit={() =>
                      setLiveBriefingOpenMechanicsPanel("speaking")
                    }
                    onOpen={() =>
                      setLiveBriefingOpenMechanicsPanel("speaking")
                    }
                    onSelect={setActiveCommunicationStyle}
                  />

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setLiveBriefingOpenMechanicsPanel(null)
                      }
                      className="george-edit-gleam relative shrink-0 overflow-hidden rounded-[0.55rem] border border-white/[0.12] bg-white/[0.012] px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] text-white/46 transition hover:border-white/[0.22] hover:text-white/72"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!mechanicsSelectionsComplete}
                onClick={() => {
                  setReadyRoomCompletedSteps([]);
                  setReadyRoomSequenceStep("room");
                  setReadyRoomPromptComplete(false);
                  setLiveRecoveryAcknowledged(false);

                  transitionToLivePreparationState({
                    previousState: "mechanics",
                    nextStep: 3,
                  });

                  void loadOperationalRecommendation();
                }}
                className={`rounded-[0.75rem] border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                  mechanicsSelectionsComplete
                    ? "george-live-primary-shimmer border-[#D8DEE8]/70 bg-[#4E7CFF] text-white shadow-[0_10px_28px_rgba(78,124,255,0.26)] hover:border-[#EEF1F6]/80 hover:bg-[#5B86FF]"
                    : "cursor-default border-white/[0.05] bg-transparent text-white/20"
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </PanelShell>
      );
    }

    const supportLabel =
      activeSupportPanelId === "response"
        ? "Adaptive response"
        : "Adaptive cues";

    const activeFormula =
      selectedFormula || operationalRecommendation?.recommendedFormula || null;
    const activeFormulaLabel =
      activeFormula?.name?.trim() ||
      (activeFormula
        ? `Formula ${String(activeFormula.id || activeFormula.version)}`
        : "Pending");

    const readyRoomGoal = String(
      preLiveSignals.desiredOutcome ||
        optionalSignalAnswers.clarify_desiredOutcome ||
        preLiveSignals.broadGoal ||
        objective ||
        "",
    ).trim();

    const readyRoomAudience = String(
      preLiveSignals.counterparty ||
        optionalSignalAnswers.clarify_audience ||
        audienceType ||
        "",
    ).trim();

    const formulaOperatingMoves = (activeFormula?.steps || [])
      .map((step) =>
        String(
          step.actionType ||
            step.expectedTransition ||
            step.signalType ||
            "",
        )
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean)
      .slice(0, 4);

    const viewFormulaScripts = (
      formula: OperationalFormula,
    ) => {
      setScriptBrowserFormula(formula);
      setScriptBrowserOpen(true);
    };

    const useRecommendedFormulaInReadyRoom = (
      formula: OperationalFormula,
    ) => {
      const recommendedFormula =
        operationalRecommendation?.recommendedFormula || null;

      const isGeorgeRecommendation = Boolean(
        recommendedFormula &&
          String(recommendedFormula.id) === String(formula.id) &&
          String(recommendedFormula.version) === String(formula.version),
      );

      setSelectedFormula(formula);
      setSelectedFormulaSource((current) =>
        current || (isGeorgeRecommendation ? "george" : "user"),
      );

      setLivePrepOpenSection("ready");
    };

    const goToPreviousPrepSection = () => {
      goToPreviousLivePreparationState();
    };

    const readyRoomStepComplete = (step: ReadyRoomSequenceStep) =>
      readyRoomCompletedSteps.includes(step);

    const roomSummary =
      `${supportLabel} · ${activeReceiverPanel.label} · ${communicationStyle}`;

    const readyRoomCompletedBox = ({
      step,
      label,
      value,
    }: {
      step: ReadyRoomSequenceStep;
      label: string;
      value: string;
    }) => (
      <div className="george-popup-settle">
        <div className="flex w-full items-start gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.018] px-3 py-2.5 font-mono text-[11px] leading-6 text-white/50">
          <span className="mt-[1px] shrink-0 text-[#AFC0FF]/80">
            ✓
          </span>

          <div className="min-w-0 flex-1">
            <span className="uppercase tracking-[0.16em] text-white/34">
              {label}
            </span>

            <span className="ml-3 text-white/68">
              {value}
            </span>
          </div>

          <button
            type="button"
            onClick={() => reopenReadyRoomSequenceStep(step)}
            className="group george-edit-gleam shrink-0 px-1 py-0.5 text-[8px] uppercase tracking-[0.15em] text-white/38 transition hover:text-white/72"
          >
            <span>Edit</span>
            <span
              aria-hidden="true"
              className="ml-1.5 inline-block text-[7px] text-white/28 transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px"
            >
              ↗
            </span>
          </button>
        </div>
      </div>
    );

    const activeReadyRoomSurface = (
      step: ReadyRoomSequenceStep,
      children: React.ReactNode,
    ) =>
      readyRoomSequenceStep === step ? (
        <div className="george-popup-glide-in mt-5 border-l border-white/[0.08] pl-4">
          {children}
        </div>
      ) : null;

    return (
      <PanelShell
        label="BRIEF ROOM · READINESS"
        title="Ready Room."
        stage={3}
        onBack={goToPreviousPrepSection}
      >
        <div className="mt-10 space-y-4">

          {/* =================================================
              1. READY FOR THE ROOM
              Popup 1 + Popup 2 synthesized.
             ================================================= */}

          {readyRoomStepComplete("room") &&
            readyRoomCompletedBox({
              step: "room",
              label: "Ready for the room",
              value: roomSummary,
            })}

          {activeReadyRoomSurface(
            "room",
            <>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/34">
                Ready for the room
              </div>

              <div className="mt-3 flex items-start gap-3 font-mono text-[12px] leading-6 text-white/58">
                <span className="mt-[1px] text-[#AFC0FF]/76">✓</span>
                <span>{roomSummary}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-6">
                <button
                  type="button"
                  onClick={() =>
                    completeReadyRoomSequenceStep(
                      "room",
                      "formula",
                    )
                  }
                  className="group font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-[#AFC0FF]/76 transition hover:text-white"
                >
                  <span>Continue</span>
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block text-[8px] transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    pushLivePreparationState("prep");
                    setLiveBriefingStep(2);
                  }}
                  className="group font-mono text-[9px] uppercase tracking-[0.17em] text-white/34 transition hover:text-white/68"
                >
                  <span>Edit</span>
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block text-[7px] transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px"
                  >
                    ↗
                  </span>
                </button>
              </div>
            </>,
          )}


          {/* =================================================
              2. FORMULA FOR OUTCOME
             ================================================= */}

          {readyRoomStepComplete("formula") &&
            readyRoomCompletedBox({
              step: "formula",
              label: "Formula for outcome",
              value: activeFormulaLabel,
            })}

          {activeReadyRoomSurface(
            "formula",
            <>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/34">
                Formula for outcome
              </div>

              <h2 className="mt-2 max-w-[620px] font-mono text-[18px] leading-7 text-white/86">
                {activeFormulaLabel}
              </h2>

              <p className="mt-2 max-w-[610px] text-[11px] leading-5 text-white/42">
                This is the operational strategy GEORGE will use to move the
                conversation toward your outcome.
              </p>

              <div className="mt-5 border-t border-white/[0.06] pt-5">
                <RecommendedStrategyCard
                  recommendation={operationalRecommendation}
                  loading={recommendationLoading}
                  selectedFormula={selectedFormula}
                  onChooseAnother={beginFormulaSelection}
                  onUseFormula={useRecommendedFormulaInReadyRoom}
                  onViewScripts={viewFormulaScripts}
                />

                <FormulaScriptBrowserPanel
                  open={scriptBrowserOpen}
                  loading={scriptBrowserLoading}
                  formula={scriptBrowserFormula}
                  scripts={formulaScripts}
                  selectedScript={selectedScript}
                  error={scriptBrowserError}
                  onSelectScript={selectFormulaScript}
                  onClose={() => setScriptBrowserOpen(false)}
                />

                <ScriptCustomizationPanel
                  open={scriptCustomizationOpen}
                  script={customizedScript}
                  onChange={setCustomizedScript}
                  onReset={resetCustomizedScript}
                  onDone={finishScriptCustomization}
                  onClose={() => setScriptCustomizationOpen(false)}
                />
              </div>

              {activeFormula && (
                <button
                  type="button"
                  onClick={() =>
                    completeReadyRoomSequenceStep(
                      "formula",
                      "authority",
                    )
                  }
                  className="group mt-5 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-[#AFC0FF]/76 transition hover:text-white"
                >
                  <span>Use {activeFormulaLabel}</span>
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block text-[8px] transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </button>
              )}
            </>,
          )}


          {/* =================================================
              3. FINAL AUTHORITY
             ================================================= */}

          {readyRoomStepComplete("authority") &&
            readyRoomCompletedBox({
              step: "authority",
              label: "Final authority",
              value: "Acknowledged",
            })}

          {activeReadyRoomSurface(
            "authority",
            <>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={liveRecoveryAcknowledged}
                  onChange={(event) => {
                    const checked = event.target.checked;

                    setLiveRecoveryAcknowledged(checked);

                    if (!checked) return;

                    setReadyRoomPromptComplete(true);

                    completeReadyRoomSequenceStep(
                      "authority",
                      "complete",
                    );
                  }}
                  className="mt-1 h-3.5 w-3.5 shrink-0 accent-[#D7DCFF]"
                />

                <span>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-white/34">
                    Final authority
                  </span>

                  <span className="mt-2 block max-w-[620px] text-[11px] leading-5 text-white/58">
                    I retain final judgment, responsibility, and control over
                    what I say and do in the room.
                  </span>
                </span>
              </label>
            </>,
          )}


          {/* =================================================
              FINAL STATE
             ================================================= */}

          {readyRoomSequenceStep === "complete" && (
            <div className="george-popup-glide-in pt-5">
              <div className="george-live-primary-shimmer relative overflow-hidden rounded-[1rem]">
                <AwakeButton
                  active={true}
                  onClick={() =>
                    startLive(false, editableResources, true)
                  }
                >
                  ENTER LIVE
                </AwakeButton>
              </div>

              <button
                type="button"
                onClick={continueBriefingFromReadyRoom}
                className="group mt-4 w-full text-center font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/34 transition hover:text-white/62"
              >
                <span>Add more context</span>
                <span
                  aria-hidden="true"
                  className="ml-2 inline-block text-[7px] transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px"
                >
                  ↗
                </span>
              </button>
            </div>
          )}
        </div>
      </PanelShell>
    );
  }

  if (showQuickLiveSetup) {
    const activeQuickLiveSupportPanel =
      LIVE_SUPPORT_PANELS.find(
        (panel) => panel.id === quickLiveSupportStyle,
      ) || LIVE_SUPPORT_PANELS[0];
    const quickLiveReceiverPanels = LIVE_RECEIVER_PROFILE_PANELS.map(
      (panel) => ({
        ...panel,
        label:
          panel.id === "audio_visual"
            ? "Audio + Visual"
            : panel.id === "visual_only"
              ? "Visual"
              : "Audio",
      }),
    );
    const activeQuickLiveReceiverPanel =
      quickLiveReceiverPanels.find(
        (panel) => panel.id === quickLiveReceiverProfile,
      ) || quickLiveReceiverPanels[0];
    const quickLiveSpeakingStyles: QuickLiveSpeakingStyle[] = [
      "Adaptive",
      "Executive",
      "Conversational",
    ];

    const steeringRows: Array<{ key: string; label: string }> = [
      { key: "buyTime", label: "Buy time" },
      { key: "clarify", label: "Clarify" },
      { key: "expand", label: "Expand" },
      { key: "changeDirection", label: "Change direction" },
      { key: "slowDown", label: "Slow down" },
    ];

    const updateQuickLiveSteeringPhrase = (key: string, value: string) => {
      setQuickLiveSteeringPhrases((current) => {
        const next = {
          ...current,
          [key]: value,
        };

        try {
          window.localStorage.setItem(
            "GEORGE_LIVE_STEERING_PHRASES",
            JSON.stringify(next),
          );
        } catch {}

        return next;
      });
    };

    const selectQuickLiveSupport = (style: LiveBriefingSupportPanelId) => {
      if (style !== "advice" && style !== "response") return;
      setQuickLiveSupportOverride(style);
      setQuickLiveSteeringOpen(false);
    };

    return (
      <main className="relative min-h-[100dvh] overflow-y-auto bg-black px-4 pb-[260px] pt-5 text-white sm:px-5 sm:pb-24 sm:pt-6">
        <div className="pointer-events-none absolute inset-0 bg-black" />
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-black" />
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

        <div className="relative z-30 mx-auto w-full max-w-[640px]">
          <div className="mb-5 flex items-center gap-4">
            <BxPageHeader backLabel="" />
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[640px] pt-0">
          <section className="rounded-[1.05rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.014),rgba(255,255,255,0.004))] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.18)] sm:p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">
              QUICK LIVE
            </div>

            <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-white/92 md:text-[40px]">
              What should this LIVE conversation accomplish?
            </h1>

            <p className="mt-3 text-[14px] leading-6 text-white/46">
              Give GEORGE the outcome. Add only the context that matters now.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block rounded-[0.82rem] border border-white/[0.08] bg-[#080A10]/[0.72] px-4 py-3">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/54">
                  Desired outcome · Required
                </span>
                <textarea
                  value={quickLiveDesiredOutcome}
                  onChange={(event) => {
                    setQuickLiveDesiredOutcome(event.target.value);
                    setQuickLiveValidationError("");
                  }}
                  rows={2}
                  aria-invalid={Boolean(quickLiveValidationError)}
                  placeholder="What should happen as a result of this conversation?"
                  className="mt-2 w-full resize-none rounded-[0.7rem] border border-white/[0.07] bg-black/[0.24] px-3 py-2.5 text-[13px] leading-5 text-[#F2F4FF]/86 outline-none placeholder:text-white/24 focus:border-[#4E7CFF]/38"
                />
                {quickLiveValidationError && (
                  <span className="mt-2 block text-[11px] leading-4 text-[#FFB4B4]/76">
                    {quickLiveValidationError}
                  </span>
                )}
              </label>

              <label className="block rounded-[0.82rem] border border-white/[0.06] bg-[#080A10]/[0.52] px-4 py-3">
                <span className="text-[9px] uppercase tracking-[0.22em] text-white/34">
                  One-line context · Optional
                </span>
                <input
                  value={quickLiveContext}
                  onChange={(event) => setQuickLiveContext(event.target.value)}
                  placeholder="What is happening right now?"
                  className="mt-2 w-full rounded-[0.7rem] border border-white/[0.06] bg-black/[0.20] px-3 py-2.5 text-[12px] text-[#D7DBE4]/78 outline-none placeholder:text-white/22 focus:border-[#4E7CFF]/30"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block rounded-[0.82rem] border border-white/[0.06] bg-[#080A10]/[0.52] px-4 py-3">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/34">
                    Conversation with · Optional
                  </span>
                  <input
                    value={quickLiveAudience}
                    onChange={(event) =>
                      setQuickLiveAudience(event.target.value)
                    }
                    placeholder="Buyer, manager, customer..."
                    className="mt-2 w-full rounded-[0.7rem] border border-white/[0.06] bg-black/[0.20] px-3 py-2.5 text-[12px] text-[#D7DBE4]/78 outline-none placeholder:text-white/22 focus:border-[#4E7CFF]/30"
                  />
                </label>

                <label className="block rounded-[0.82rem] border border-white/[0.06] bg-[#080A10]/[0.52] px-4 py-3">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/34">
                    Communication medium · Optional
                  </span>
                  <select
                    value={quickLiveCommunicationMedium}
                    onChange={(event) =>
                      setQuickLiveCommunicationMedium(
                        event.target.value as QuickLiveCommunicationMedium,
                      )
                    }
                    className="mt-2 w-full rounded-[0.7rem] border border-white/[0.06] bg-[#080A10] px-3 py-2.5 text-[12px] text-[#D7DBE4]/78 outline-none focus:border-[#4E7CFF]/30"
                  >
                    <option value="">Not specified</option>
                    <option value="phone">Phone call</option>
                    <option value="video">Video call</option>
                    <option value="in_person">In person</option>
                    <option value="written">Written / chat</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <label className="block rounded-[0.82rem] border border-white/[0.06] bg-[#080A10]/[0.52] px-4 py-3">
                <span className="text-[9px] uppercase tracking-[0.22em] text-white/34">
                  Available receiver · Optional
                </span>
                <select
                  value={quickLiveReceiverEvidence}
                  onChange={(event) => {
                    setQuickLiveReceiverEvidence(
                      event.target.value as LiveReceiverProfilePanelId | "",
                    );
                    setQuickLiveReceiverOverride(null);
                  }}
                  className="mt-2 w-full rounded-[0.7rem] border border-white/[0.06] bg-[#080A10] px-3 py-2.5 text-[12px] text-[#D7DBE4]/78 outline-none focus:border-[#4E7CFF]/30"
                >
                  <option value="">No receiver evidence — use Visual</option>
                  <option value="audio_only">Earbuds or audio receiver</option>
                  <option value="visual_only">Browser screen</option>
                  <option value="audio_visual">Audio and screen</option>
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-[0.95rem] border border-[#4E7CFF]/[0.14] bg-[#4E7CFF]/[0.035] p-3">
              <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/58">
                GEORGE&apos;s current-session recommendation
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/46">
                Review or change this configuration. GEORGE will continue
                adapting moment by moment in LIVE.
              </p>

              <div className="mt-3 space-y-3">
                <LiveAdaptiveSupportPanel
                  activePanel={activeQuickLiveSupportPanel}
                  open={quickLiveSupportOpen}
                  panels={LIVE_SUPPORT_PANELS}
                  onToggle={() =>
                    setQuickLiveSupportOpen((current) => !current)
                  }
                  onSelect={selectQuickLiveSupport}
                />

                <LiveReceiverProfilePanel
                  activePanel={activeQuickLiveReceiverPanel}
                  open={quickLiveReceiverOpen}
                  panels={quickLiveReceiverPanels}
                  onToggle={() =>
                    setQuickLiveReceiverOpen((current) => !current)
                  }
                  onSelect={(profile) =>
                    setQuickLiveReceiverOverride(profile)
                  }
                />

                <div className="rounded-[0.82rem] border border-white/[0.08] bg-[#080A10]/[0.72] px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
                        Speaking style
                      </div>
                      <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
                        {quickLiveSpeakingStyle}
                      </div>
                      <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
                        GEORGE will shape guidance around this speaking style.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setQuickLiveSpeakingOpen((current) => !current)
                      }
                      className="shrink-0 rounded-[0.65rem] border border-white/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/46 transition hover:border-white/[0.16] hover:text-white/72"
                    >
                      {quickLiveSpeakingOpen ? "Close" : "Change"}
                    </button>
                  </div>

                  {quickLiveSpeakingOpen && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {quickLiveSpeakingStyles.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            setQuickLiveSpeakingOverride(style);
                            setQuickLiveSpeakingOpen(false);
                          }}
                          className={`rounded-[0.72rem] border px-3 py-2.5 text-left text-[11px] font-semibold transition ${
                            quickLiveSpeakingStyle === style
                              ? "border-[#4E7CFF]/[0.24] bg-[#4E7CFF]/[0.055] text-[#F2F4FF]/84"
                              : "border-white/[0.06] bg-white/[0.018] text-[#F2F4FF]/64 hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setQuickLiveSteeringOpen((open) => {
                  return !open;
                });
              }}
              className="mt-4 w-full rounded-[0.82rem] border border-white/[0.055] bg-[#080A10]/[0.42] px-3.5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D7DBE4]/58 transition hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035] hover:text-[#D7DCFF]/78"
            >
              {quickLiveSteeringOpen ? "Hide steering" : "View steering"}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                quickLiveSteeringOpen
                  ? "max-h-[420px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="mt-3 rounded-[0.82rem] border border-white/[0.055] bg-[#080A10]/[0.42] px-3.5 py-3">
                <p className="text-[11px] leading-5 text-[#D7DBE4]/46">
                  If you are using earbuds alone, steering phrases help us adapt
                  discreetly. You can use these defaults, edit them later, or
                  control support directly from a phone, glasses, watch, or
                  other visual device.
                </p>

                <div className="mt-3 divide-y divide-white/[0.045]">
                  {steeringRows.map((row) => (
                    <label
                      key={row.key}
                      className="grid gap-1 py-2 sm:grid-cols-[150px_1fr] sm:gap-3"
                    >
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/28">
                        {row.label}
                      </span>
                      <input
                        value={quickLiveSteeringPhrases[row.key] || ""}
                        onChange={(event) =>
                          updateQuickLiveSteeringPhrase(
                            row.key,
                            event.target.value,
                          )
                        }
                        className="w-full rounded-[0.58rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] leading-5 text-[#D7DBE4]/70 outline-none transition placeholder:text-white/20 focus:border-[#4E7CFF]/24 focus:bg-[#4E7CFF]/[0.035]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startQuickLive}
              className="mt-5 w-full rounded-[0.95rem] border border-[#4E7CFF]/35 bg-[#4E7CFF]/[0.075] px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-[#D7DCFF]/88 transition hover:bg-[#4E7CFF]/[0.12] hover:text-white active:scale-[0.98]"
            >
              Let&apos;s go to work
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto overflow-x-hidden bg-black text-white">
      {liveEntryRoute !== "direct" && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <HomeHeroConversationTicker />
        </div>
      )}

      {liveEntryRoute !== "direct" && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      )}

      <div className="relative z-10 w-full">
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
          <div className="mx-auto w-full max-w-5xl px-6 pt-4 sm:px-8 sm:pt-5">
            <a
              href="/"
              aria-label="Go to BRANESx home"
              className="pointer-events-auto inline-flex"
            >
              <img
                src="/logofav.png"
                alt="Bx"
                className="h-[80px] w-[80px] object-contain opacity-[0.96] sm:h-[90px] sm:w-[90px]"
              />
            </a>
          </div>
        </div>
        <section className="george-live-orientation relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">

          <div className="relative z-10">
            {/* LIVE ENTRY ORIENTATION */}
            <div className="mx-auto w-full max-w-5xl px-6 pb-5 pt-[124px] sm:px-8 sm:pt-[138px]">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-white/36">
                GEORGE LIVE · CHOOSE YOUR ROUTE
              </div>
            </div>

            {/* PREPARATION ROUTES */}
            <section className="mx-auto w-full max-w-5xl px-6 pb-20 sm:px-8 sm:pb-24">
              <div className="border-t border-white/[0.08]">

                <div className="border-b border-white/[0.07] py-10 sm:py-12">
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-white/30">
                    ROLE FIRST / CONVERSATION SETUP
                  </div>

                  <h1 className="mt-4 max-w-3xl font-mono text-[26px] font-medium leading-[1.12] tracking-[-0.03em] text-white/92 sm:text-[31px]">
                    Start from your role in the discussion. Who are you?
                  </h1>

                  <p className="mt-4 max-w-[46rem] text-[13px] leading-[1.8] text-white/46">
                    Choose your role and the kind of conversation you are preparing for.
                    GEORGE uses that setup to establish the room before you decide how to enter LIVE.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/#conversation-setup";
                    }}
                    className="group mt-5 inline-flex items-center font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-white/56 transition-colors hover:text-white"
                  >
                    ROLE / CONVERSATION SETUP
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>


                <div className="border-b border-white/[0.07] py-7 sm:py-8">
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-white/48">
                    TRADITIONAL LIVE
                  </div>

                  <h2 className="mt-4 max-w-3xl font-mono text-[26px] font-medium leading-[1.12] tracking-[-0.03em] text-white sm:text-[31px]">
                    Brief GEORGE directly, step by step.
                  </h2>

                  <p className="mt-4 max-w-[46rem] text-[13px] leading-[1.8] text-white/50">
                    Traditional LIVE walks you through the desired outcome, participants,
                    known context, support mechanics, and final readiness before entering the room.
                    Use it when you want the full briefing process before LIVE begins.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.setItem("george_start_new_live", "1");
                      window.location.href = "/george/live-entry?source=start";
                    }}
                    className="group mt-5 inline-flex items-center font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-white/78 transition-colors hover:text-white"
                  >
                    BEGIN TRADITIONAL LIVE
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>


                <div className="py-10 sm:py-12">
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-white/30">
                    NORMAL GEORGE
                  </div>

                  <h2 className="mt-3 max-w-[620px] font-mono text-[23px] font-medium leading-[1.16] tracking-[-0.025em] text-white/90 sm:text-[27px]">
                    Work with GEORGE first, then move into LIVE.
                  </h2>

                  <p className="mt-3 max-w-[600px] text-[13px] leading-[1.75] text-white/44">
                    Use Normal GEORGE to think, prepare, decide, write, or work through the situation.
                    When you move into LIVE, the relevant objective and preparation carry forward.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/george";
                    }}
                    className="group mt-5 inline-flex items-center font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-white/56 transition-colors hover:text-white"
                  >
                    OPEN NORMAL GEORGE
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>

              </div>
            </section>
          </div>

        </section>

        {tier === "smart" && (
          <p className="mt-2 text-center text-[12px] leading-5 text-[#D7DBE4]/36">
            LIVE access may require Intelligent or Brilliant depending on
            account state.
          </p>
        )}
      </div>
</main>
  );
}
