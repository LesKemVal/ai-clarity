'use client'

import Image from 'next/image'
import BxPageHeader from '@/components/BxPageHeader'
import { useEffect, useMemo, useRef, useState } from 'react'
import { legacyAssistModeFromSupportStyle, normalizeLiveSupportStyle, type LiveSupportStyle } from '@/lib/george/live-runtime/support-style'
import { getActiveSessionForMode, getSessionsForMode, setActiveSessionIdForMode } from '@/lib/george/session/store'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'
import { getActiveRuntimeMotionContext } from '@/lib/george/operator/load-runtime-overlay'
import { PrepRoomResourcePopup } from '@/components/george/PrepRoomResourcePopup'
import { RelevantDocumentationPanel } from '@/components/george/live/RelevantDocumentationPanel'
import type { PrepRoomResourceProfile } from '@/lib/george/prep-room/resources'
import { deriveRoomFormation } from '@/lib/george/live/prep-room'
import {
  DEFAULT_LIVE_RECOVERY_SELECTION,
  GEORGE_LIVE_RECOVERY_STORAGE_KEY,
  LIVE_ENTRY_RECOVERY_QUESTION,
  LIVE_RECOVERY_OPTIONS,
  normalizeLiveRecoverySelection,
  type LiveRecoveryOptionId,
} from '@/lib/george/live-voice/runtime/recovery-options'
import { buildOutcomeTestedBriefingSupport } from '@/lib/george/live-runtime/live-entry-briefing'
import { prepareConversationFromPackage } from '@/lib/george/preparation/runtime.mjs'
import { getConversationResponsibilityOptions } from '@/lib/george/live-entry/responsibility-options'
import { estimateResources, estimateWithResources, getPrepDocumentPrompt, type ResourceEstimate } from '@/lib/george/capabilities/live-entry-resources'
import {
  LIVE_RECEIVER_PROFILE_PANELS,
  LIVE_SUPPORT_PANELS,
  type LiveBriefingSupportPanelId,
  type LiveReceiverProfilePanelId,
} from '@/lib/george/capabilities/live-support-panels'
import { deriveLiveCapabilityIds } from '@/lib/george/capabilities/live-capability-registry'

import {
  buildBriefingObservation,
  buildBriefingSupport,
  buildNextBriefingBenefit,
  buildProofReply,
  cleanBriefingValue,
  titleBriefingValue,
} from '@/lib/george/live-entry/outcome-briefing-presentation'

type Tier = 'smart' | 'intelligent' | 'brilliant'

type BriefingSpeechRecognitionResultLike = {
  isFinal: boolean
  0: {
    transcript: string
  }
}

type BriefingSpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<BriefingSpeechRecognitionResultLike>
}

type BriefingSpeechRecognitionErrorLike = {
  error?: string
}

type BriefingSpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onresult: ((event: BriefingSpeechRecognitionEventLike) => void) | null
  onerror: ((event: BriefingSpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
}

type BriefingSpeechRecognitionConstructor = new () => BriefingSpeechRecognitionInstance

declare global {
  interface Window {
    webkitSpeechRecognition?: BriefingSpeechRecognitionConstructor
    SpeechRecognition?: BriefingSpeechRecognitionConstructor
  }
}

type SelectOption = {
  label: string
  helper?: string
}


const CONVERSATION_TYPES: SelectOption[] = [
  { label: 'Interview', helper: 'answers, confidence, proof' },
  { label: 'Meeting', helper: 'clarity, timing, decisions' },
  { label: 'Boardroom', helper: 'numbers, pressure, executive framing' },
  { label: 'Negotiation', helper: 'leverage, restraint, asks' },
  { label: 'Sales Call', helper: 'objections, trust, close' },
  { label: 'Doctor Appointment', helper: 'questions, symptoms, advocacy' },
  { label: 'Presentation', helper: 'flow, points, recovery' },
  { label: 'Everyday Conversation', helper: 'tone, clarity, next words' },
  { label: 'Other', helper: 'custom room signal' },
]

const AUDIENCE_TYPES: SelectOption[] = [
  { label: 'Executive', helper: 'concise, proof-aware' },
  { label: 'Investor', helper: 'traction, risk, upside' },
  { label: 'Recruiter', helper: 'fit, experience, confidence' },
  { label: 'Customer', helper: 'value, objections, trust' },
  { label: 'Physician', helper: 'facts, symptoms, questions' },
  { label: 'Spouse / Family', helper: 'calm, honest, careful' },
  { label: 'Regulator', helper: 'precise, compliant, measured' },
  { label: 'Audience / Crowd', helper: 'clear, structured, steady' },
]

const PACING_OPTIONS: SelectOption[] = [
  { label: 'Measured', helper: 'slower, controlled' },
  { label: 'Balanced', helper: 'natural and clear' },
  { label: 'Sharp', helper: 'faster, compact' },
]

const SUPPORT_STYLE_OPTIONS: Array<SelectOption & { value: LiveSupportStyle }> = [
  { label: 'Cue', value: 'cue', helper: 'brief support delivered at the right moment' },
  { label: 'Continuation', value: 'continue', helper: 'GEORGE helps continue your thought' },
  { label: 'Response', value: 'response', helper: 'complete answer when pressure or questions require it' },
  { label: 'Presentation', value: 'presentation', helper: 'longer support for presenting or explaining' },
]

const COMMUNICATION_STYLE_OPTIONS: SelectOption[] = [
  { label: 'Direct', helper: 'clear and firm' },
  { label: 'Diplomatic', helper: 'careful, tactful, still effective' },
  { label: 'Conciliatory', helper: 'softens friction while preserving the goal' },
  { label: 'Executive', helper: 'brief, composed, high-authority' },
  { label: 'Warm', helper: 'human, reassuring, approachable' },
  { label: 'Assertive', helper: 'stronger posture without being reckless' },
  { label: 'Neutral', helper: 'balanced and factual' },
]

const DEFAULT_ROOM_PHRASES = [
  'That\'s fair.',
  'Help me understand that.',
  'Let\'s think through that.',
  'What\'s driving that concern?',
  'What am I missing?',
  'Can we unpack that?',
]

function getRoomPhraseExamples(role: string) {
  const clean = role.toLowerCase()

  if (/patient|doctor|medical/.test(clean)) {
    return [
      'E.g. Help me understand that.',
      'E.g. Can we slow down for a second?',
      'E.g. What are my options?',
      'E.g. I want to make sure I understand.',
    ]
  }

  if (/candidate|interviewee|interview/.test(clean)) {
    return [
      'E.g. Good question.',
      'E.g. Let me think about that.',
      'E.g. Could you clarify that?',
      'E.g. Can I expand on that?',
    ]
  }

  if (/ceo|founder|investor|executive/.test(clean)) {
    return [
      'E.g. That\'s fair.',
      'E.g. Help me understand that.',
      'E.g. What\'s driving that concern?',
      'E.g. Let\'s think through that.',
    ]
  }

  return [
    'E.g. That\'s fair.',
    'E.g. Help me understand that.',
    'E.g. Can we unpack that?',
    'E.g. What am I missing?',
  ]
}

const POSITION_OPTIONS: SelectOption[] = [
  { label: 'Seeking', helper: 'trying to obtain an outcome' },
  { label: 'Evaluating', helper: 'assessing people or opportunities' },
  { label: 'Deciding', helper: 'making a decision' },
  { label: 'Leading', helper: 'guiding the room' },
  { label: 'Negotiating', helper: 'maximizing terms or leverage' },
  { label: 'Advising', helper: 'improving another person’s outcome' },
]

const CHAIR_OPTIONS: SelectOption[] = [
  { label: 'Founder', helper: 'execution, risk, adoption, momentum' },
  { label: 'Operator', helper: 'systems, process, execution' },
  { label: 'Investor', helper: 'risk, return, future value' },
  { label: 'Candidate', helper: 'fit, proof, confidence' },
  { label: 'Board Member', helper: 'oversight, governance, allocation' },
  { label: 'Buyer', helper: 'value, terms, risk' },
  { label: 'Seller', helper: 'positioning, leverage, close' },
  { label: 'Patient', helper: 'facts, symptoms, questions' },
  { label: 'Parent', helper: 'care, judgment, responsibility' },
  { label: 'Advisor', helper: 'clarity, tradeoffs, protection' },
  { label: 'Other', helper: 'custom position' },
]

const OBSERVED_REALITY_EXAMPLES: Record<string, string> = {
  Founder: 'The investor wants board control.',
  Operator: 'The team missed the deadline.',
  Investor: 'The valuation feels too high.',
  Candidate: 'The interviewer challenged my experience.',
  'Board Member': 'The risk is not clearly explained.',
  Buyer: 'The terms feel unclear.',
  Seller: 'The buyer is hesitating on price.',
  Patient: 'The treatment options seem different.',
  Parent: 'My child is shutting down instead of talking.',
  Advisor: 'The client is missing the tradeoff.',
  Other: 'Something changed that affects the outcome.',
}


function CompactSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block rounded-[0.82rem] border border-white/[0.04] bg-black/20 px-3 py-2">
      <span className="block text-[10px] uppercase tracking-[0.22em] text-white/22">{label}</span>

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
  )
}

function PanelShell({
  label,
  title,
  stage,
  onBack,
  children,
}: {
  label: string
  title: string
  stage: 1 | 2 | 3
  onBack?: () => void
  children: React.ReactNode
}) {
  const stageGlow =
    stage === 1
      ? 'rgba(78,124,255,0.08)'
      : stage === 2
        ? 'rgba(78,124,255,0.12)'
        : 'rgba(174,182,255,0.16)'

  const stageBorder =
    stage === 1
      ? 'border-white/[0.055]'
      : stage === 2
        ? 'border-[#4E7CFF]/[0.12]'
        : 'border-[#AEB6FF]/[0.18]'

  return (
    <main className="relative flex min-h-[100dvh] items-start justify-center overflow-y-auto bg-black px-4 py-5 text-white">
      <div className="relative z-10 w-full max-w-[640px]">
        <div className="mb-2 flex items-center gap-4">
          <BxPageHeader
          backLabel="BACK"
          onBack={onBack}
          backHref="/"
        />
        </div>

        <section
          className="relative mt-4 w-full overflow-hidden rounded-[28px] bg-[#050505] p-5 shadow-none  sm:p-6"
        >


          <div className="flex items-center justify-between gap-4">
            <div className="text-[9px] uppercase tracking-[0.32em] text-[#D7DBE4]/52">
              {label}
            </div>

            <div className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-white/32">
              Step {stage}
            </div>
          </div>

          <h1 className="mt-5 max-w-[460px] text-[28px] font-semibold leading-[1.03] tracking-[-0.055em] text-white/92 sm:text-[32px]">
            {title}
          </h1>

          {children}
        </section>
      </div>
    </main>
  )
}

function AwakeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={!active}
      onClick={onClick}
      className={`mt-5 w-full rounded-[1rem] border px-4 py-2.5 text-center text-[12px] font-semibold uppercase tracking-[0.24em] transition ${
        active
          ? 'border-[#4E7CFF]/55 bg-[#4E7CFF]/[0.10] text-[#D7DCFF]/90 shadow-[0_0_28px_rgba(78,124,255,0.20)] hover:bg-[#4E7CFF]/[0.15] hover:text-white active:scale-[0.98]'
          : 'cursor-default border-white/[0.055] bg-white/[0.018] text-white/20'
      }`}
    >
      {children}
    </button>
  )
}



type LiveEntryRuntimeSupportStyle = 'advice' | 'continue' | 'response' | 'expandedLine'

function toRuntimeSupportStyle(style: LiveBriefingSupportPanelId): LiveEntryRuntimeSupportStyle {
  if (style === 'completion') return 'continue'
  if (style === 'presentation') return 'expandedLine'
  if (style === 'response') return 'response'
  return 'advice'
}

function toBriefingSupportPanelId(style: string | null): LiveBriefingSupportPanelId | null {
  if (style === 'continue') return 'completion'
  if (style === 'expandedLine') return 'presentation'
  if (
    style === 'advice' ||
    style === 'completion' ||
    style === 'response' ||
    style === 'presentation'
  ) {
    return style
  }
  return null
}


type LiveRoomObjectiveOptionId =
  | 'project_strength'
  | 'build_trust'
  | 'find_leverage'
  | 'find_common_ground'
  | 'surface_objections'
  | 'confirm_authority'
  | 'confirm_concern'
  | 'confirm_timeline'
  | 'other'

type LiveBriefingSupportPanel = {
  id: LiveBriefingSupportPanelId
  label: string
  defaultLine: string
  body: string
  examples: string[]
  why: string
}

function buildLiveBriefingSupportPanels({
  room,
  audience,
  objective,
  position,
}: {
  room: string
  audience: string
  objective: string
  position: string
}): LiveBriefingSupportPanel[] {
  const signal = `${room} ${audience} ${objective} ${position}`.toLowerCase()

  if (/investor|capital|fundraising|raise|fund|terms|valuation/.test(signal)) {
    return [
      {
        id: 'advice',
        label: 'Adaptive support',
        defaultLine: 'Default: observational advice.',
        body: 'In this room, I may help you notice objections, timing pressure, hesitation, leverage, or movement toward terms.',
        examples: [
          'They do not sound convinced by that yet.',
          'I think I would ask what specifically concerns them.',
          'They seem to be moving toward terms.',
        ],
        why: 'Capital conversations often turn on credibility, timing, and what the other side is really testing.',
      },
      {
        id: 'completion',
        label: 'Continue',
        defaultLine: 'Default: concise completion.',
        body: 'If you want help continuing a thought, I may offer the next useful sentence without inventing facts.',
        examples: [
          'You: “Here is what we need…”',
          'GEORGE: “…before we can move forward responsibly.”',
          'You can use it, reword it, or ignore it.',
        ],
        why: 'Investor rooms reward clear sequencing and controlled answers.',
      },
      {
        id: 'steering',
        label: 'Adjustments',
        defaultLine: 'Optional: natural phrases.',
        body: 'You do not need steering phrases. If you use phrases like “let me think” or “one second,” I can treat them as signal to slow down, clarify, or hold position.',
        examples: [
          '“Let me think” can signal: buy time.',
          '“Right” can signal: keep listening.',
          '“One second” can signal: hold support unless needed.',
        ],
        why: 'Natural phrases let you adjust support without exposing GEORGE.',
      },
    ]
  }

  if (/interview|candidate|hiring|job|recruiter/.test(signal)) {
    return [
      {
        id: 'advice',
        label: 'Adaptive support',
        defaultLine: 'Default: answer-shaping advice.',
        body: 'In this room, I may help you notice when the interviewer wants an example, when an answer is too broad, or when to return to the question.',
        examples: [
          'I think I would answer that more directly.',
          'They seem interested in the example.',
          'I would probably bring this back to what you actually did.',
        ],
        why: 'Interviews often shift quickly from prepared answers to proof under pressure.',
      },
      {
        id: 'completion',
        label: 'Continue',
        defaultLine: 'Default: recovery completion.',
        body: 'If you want help continuing an answer, I may offer a next sentence that preserves your meaning and momentum.',
        examples: [
          'You: “The reason that mattered was…”',
          'GEORGE: “…because it showed I could make a decision under pressure.”',
          'Use it exactly, adjust it, or ignore it.',
        ],
        why: 'Unexpected questions can interrupt momentum; completion preserves continuity.',
      },
      {
        id: 'steering',
        label: 'Adjustments',
        defaultLine: 'Optional: natural phrases.',
        body: 'You do not need steering phrases. If you use phrases like “good question” or “let me think,” I can treat them as signal to organize the answer.',
        examples: [
          '“Good question” can signal: prepare a structured answer.',
          '“Let me think” can signal: slow down.',
          '“Can I clarify?” can signal: protect accuracy.',
        ],
        why: 'Natural phrases create time without making the room feel mechanical.',
      },
    ]
  }

  if (/doctor|medical|patient|symptom|treatment|physician/.test(signal)) {
    return [
      {
        id: 'advice',
        label: 'Adaptive support',
        defaultLine: 'Default: clarification advice.',
        body: 'In this room, I may help you notice when a question remains unanswered, when the next step is unclear, or when details should be repeated.',
        examples: [
          'I do not think they answered your concern yet.',
          'I would ask what happens next.',
          'I think I would repeat the timeline clearly.',
        ],
        why: 'Medical conversations require accuracy, sequence, and follow-through.',
      },
      {
        id: 'completion',
        label: 'Continue',
        defaultLine: 'Default: factual completion.',
        body: 'If you want help organizing symptoms, concerns, or questions, I may suggest a next sentence without creating facts.',
        examples: [
          'You: “What I want to understand is…”',
          'GEORGE: “…what changes after today and what I should watch for.”',
          'You remain responsible for the facts.',
        ],
        why: 'Completion should help organize facts, not create them.',
      },
      {
        id: 'steering',
        label: 'Adjustments',
        defaultLine: 'Optional: natural phrases.',
        body: 'You do not need steering phrases. If you use phrases like “I want to make sure I understand,” I can prioritize clarity and unanswered questions.',
        examples: [
          '“Can we slow down?” can signal: clarify.',
          '“What are my options?” can signal: compare choices.',
          '“I want to understand” can signal: plain language.',
        ],
        why: 'Natural phrases help you advocate without losing the room.',
      },
    ]
  }

  if (/negotiat|offer|deal|price|counter|buyer|seller/.test(signal)) {
    return [
      {
        id: 'advice',
        label: 'Adaptive support',
        defaultLine: 'Default: leverage advice.',
        body: 'In this room, I may help you notice pressure, concessions, unclear terms, or moments where asking another question is stronger than answering.',
        examples: [
          'They seem to be trying to speed this up.',
          'I would probably ask what flexibility exists.',
          'I do not think I would agree yet.',
        ],
        why: 'Negotiation depends on timing, control, and knowing when not to fill silence.',
      },
      {
        id: 'completion',
        label: 'Continue',
        defaultLine: 'Default: controlled completion.',
        body: 'If you want help advancing a position, I may suggest a next sentence that protects the outcome without escalating unnecessarily.',
        examples: [
          'You: “Here is what I need…”',
          'GEORGE: “…before I can make a decision.”',
          'Use it, reshape it, or ignore it.',
        ],
        why: 'A clean next sentence can prevent rushed concessions.',
      },
      {
        id: 'steering',
        label: 'Adjustments',
        defaultLine: 'Optional: natural phrases.',
        body: 'You do not need steering phrases. If you use phrases like “let me think” or “walk me through that,” I can treat them as signal to slow pressure or clarify terms.',
        examples: [
          '“Let me think” can signal: buy time.',
          '“Walk me through that” can signal: make them explain.',
          '“I am not rushing this” can signal: hold position.',
        ],
        why: 'Natural phrases let you control pace without exposing support.',
      },
    ]
  }

  return [
    {
      id: 'advice',
      label: 'Adaptive support',
      defaultLine: 'Default: observational advice.',
      body: 'In this room, I may help you notice confusion, pressure, drift, unanswered questions, or moments where the conversation should return to the objective.',
      examples: [
        'I think I would ask another question.',
        'They seem unsure about that.',
        'I would probably bring this back to the main point.',
      ],
      why: 'Most rooms change through timing, pressure, and what people leave unsaid.',
    },
    {
      id: 'completion',
      label: 'Continue',
      defaultLine: 'Default: conversational continuation.',
      body: 'If you want help continuing a thought, I may suggest the next useful sentence while keeping you in control.',
      examples: [
        'You: “What matters most here…”',
        'GEORGE: “…is making sure we are solving the right problem.”',
        'Use it exactly, adjust it, or ignore it.',
      ],
      why: 'Completion gives you access to the next useful sentence without taking control.',
    },
    {
      id: 'steering',
      label: 'Adjustments',
      defaultLine: 'Optional: natural phrases.',
      body: 'You do not need steering phrases. Over time, phrases like “hmm,” “right,” “let me think,” or “one second” can help GEORGE adapt more precisely.',
      examples: [
        '“Let me think” can signal: slow down.',
        '“Right” can signal: keep listening.',
        '“One second” can signal: hold support.',
      ],
      why: 'Steering phrases are optional. GEORGE works without them.',
    },
  ]
}




type LiveOrientationIconKind =
  | 'conversation'
  | 'reading'
  | 'repeat'
  | 'support'
  | 'pause'
  | 'audio'

function LiveOrientationIcon({ kind }: { kind: LiveOrientationIconKind }) {
  if (kind === 'conversation') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
        <path d="M9 12h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H22l-8 6v-6H9a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" fill="currentColor" opacity=".88" />
        <path d="M15 21h13M15 27h9" stroke="#071016" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'reading') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
        <path d="M8 10h13a5 5 0 0 1 5 5v23H13a5 5 0 0 0-5 5V10Z" fill="currentColor" opacity=".82" />
        <path d="M40 10H27a5 5 0 0 0-5 5v23h13a5 5 0 0 1 5 5V10Z" fill="currentColor" opacity=".62" />
        <path d="M13 18h8M13 24h8M28 18h7M28 24h7" stroke="#071016" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'repeat') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M36 17a15 15 0 1 0 1 15" />
        <path d="m32 8 5 9-10 1" />
      </svg>
    )
  }

  if (kind === 'support') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
        <rect x="7" y="10" width="34" height="7" rx="3.5" fill="currentColor" opacity=".92" />
        <rect x="11" y="21" width="27" height="7" rx="3.5" fill="currentColor" opacity=".68" />
        <rect x="15" y="32" width="19" height="7" rx="3.5" fill="currentColor" opacity=".46" />
      </svg>
    )
  }

  if (kind === 'pause') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="currentColor" aria-hidden="true">
        <rect x="10" y="8" width="10" height="32" rx="4" />
        <rect x="28" y="8" width="10" height="32" rx="4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
      <path d="M24 29a8 8 0 0 0 8-8v-6a8 8 0 1 0-16 0v6a8 8 0 0 0 8 8Z" />
      <path d="M10 22a14 14 0 0 0 28 0M24 36v7" />
    </svg>
  )
}

export default function LiveEntryClient() {
  const [ready, setReady] = useState(false)
  const [tier, setTier] = useState<Tier>('smart')
  const [conversationType, setConversationType] = useState('Meeting')
  const [customConversationType, setCustomConversationType] = useState('')
  const [audienceType, setAudienceType] = useState('Executive')
  const [pacing, setPacing] = useState('Balanced')
  const [selectedSupportStyle, setSelectedSupportStyle] = useState<LiveSupportStyle>('cue')
  const [communicationStyle, setCommunicationStyle] = useState('Diplomatic')
  const [objective, setObjective] = useState('')
  const [userPosition, setUserPosition] = useState('Seeking')
  const [chairs, setChairs] = useState<string[]>([])
  const [customChair, setCustomChair] = useState('')
  const [knownContext, setKnownContext] = useState('')
  const observedRealityPlaceholder = OBSERVED_REALITY_EXAMPLES[chairs[0] || 'Other'] || OBSERVED_REALITY_EXAMPLES.Other
  const [sessionEmail, setSessionEmail] = useState('')
  const [relatedSessionId, setRelatedSessionId] = useState('not_related')
  const [relatedSessions, setRelatedSessions] = useState<any[]>([])
  const [liveToaAccepted, setLiveToaAccepted] = useState(false)
  const [liveBriefingReadyToContinue, setLiveBriefingReadyToContinue] = useState(false)
  const liveBriefingTermsPreviouslyAcceptedRef = useRef(false)
  const liveBriefingHasReopenedEditsRef = useRef(false)
  const liveBriefingConfirmSequenceRef = useRef(0)
  const liveReadyConfirmSequenceRef = useRef(0)
  const liveEntryAudioRef = useRef<HTMLAudioElement | null>(null)
  const liveEntryAudioUrlRef = useRef<string | null>(null)
  const liveEntrySpeechRequestRef = useRef(0)
  const liveBriefingRoomSignalEditedRef = useRef(false)
  const generatedBriefingRoomSignalRef = useRef('')
  const [liveBriefingEditAcknowledged, setLiveBriefingEditAcknowledged] = useState(false)
  const liveBriefingOriginalSignalRef = useRef({
    objective: '',
    userPosition: '',
    audienceType: '',
    knownContext: '',
  })
  const [contextSectionCollapsed, setContextSectionCollapsed] = useState(true)
  const [chairSectionCollapsed, setChairSectionCollapsed] = useState(true)
  const [roomSectionCollapsed, setRoomSectionCollapsed] = useState(false)
  const [prepDocument, setPrepDocument] = useState<{ name: string; summary: string; kind: string } | null>(null)
  const [prepDocumentReading, setPrepDocumentReading] = useState(false)
  const [controlWords, setControlWords] = useState(DEFAULT_ROOM_PHRASES.join(', '))
  const [useRoomPhrases, setUseRoomPhrases] = useState(true)
  const [customRoomPhrases, setCustomRoomPhrases] = useState('')
  const [roomPhraseFocused, setRoomPhraseFocused] = useState(false)
  const [typedRoomPhraseExample, setTypedRoomPhraseExample] = useState('')
  const [hasLiveSession, setHasLiveSession] = useState(false)
  const [showResumeConversationList, setShowResumeConversationList] = useState(false)
  const [showPrepPreview, setShowPrepPreview] = useState(false)
  const [showLiveBriefingRoom, setShowLiveBriefingRoom] = useState(false)
  const [liveBriefingStep, setLiveBriefingStep] = useState<1 | 2 | 3>(1)
  const [liveBriefingOpenSection, setLiveBriefingOpenSection] = useState<
    'outcome' | 'responsibility' | 'participants' | 'context' | 'additional' | 'documents' | null
  >('outcome')
  const [liveRoomMoreOpen, setLiveRoomMoreOpen] = useState(false)
  const [liveBriefingToaAccepted, setLiveBriefingToaAccepted] = useState(false)
  const [liveBriefingSupportAccepted, setLiveBriefingSupportAccepted] = useState(false)
  const [liveRecoveryOptions, setLiveRecoveryOptions] = useState<LiveRecoveryOptionId[]>(DEFAULT_LIVE_RECOVERY_SELECTION)
  const [liveRecoveryAcknowledged, setLiveRecoveryAcknowledged] = useState(false)
  const [liveRecoveryAcknowledgementOpen, setLiveRecoveryAcknowledgementOpen] = useState(false)
  const [liveBriefingCapabilitiesConfirmed, setLiveBriefingCapabilitiesConfirmed] = useState(false)
  const [liveBriefingActiveSupportStyle, setLiveBriefingActiveSupportStyle] = useState<LiveBriefingSupportPanelId | null>(null)
  const [selectedReceiverProfile, setSelectedReceiverProfile] = useState<LiveReceiverProfilePanelId>('audio_only')
  const [liveBriefingOpenMechanicsPanel, setLiveBriefingOpenMechanicsPanel] = useState<'support' | 'receiver' | 'speaking' | null>('support')
  const [liveBriefingExpandedSupportPanel, setLiveBriefingExpandedSupportPanel] = useState<LiveBriefingSupportPanelId | null>(null)
  const [liveBriefingCommunicationConfirmed, setLiveBriefingCommunicationConfirmed] = useState(false)
  const [showQuickLiveSetup, setShowQuickLiveSetup] = useState(false)
  const [quickLiveSupportStyle, setQuickLiveSupportStyle] = useState<LiveBriefingSupportPanelId>('advice')
  const [quickLiveExpandedSupport, setQuickLiveExpandedSupport] = useState<LiveBriefingSupportPanelId | 'recommended'>('recommended')
  const [quickLiveSteeringOpen, setQuickLiveSteeringOpen] = useState(false)
  const [quickLiveSteeringPhrases, setQuickLiveSteeringPhrases] = useState<Record<string, string>>({
    buyTime: 'Let me think for a second...',
    clarify: 'I want to make sure I understand.',
    expand: 'Walk me through that.',
    changeDirection: 'What matters now is...',
    slowDown: 'Can we slow down?',
  })
  const [liveReadyAccepted, setLiveReadyAccepted] = useState(false)
  const [liveControlsOrientationSeen, setLiveControlsOrientationSeen] = useState(false)
  const [liveControlsEntryReady, setLiveControlsEntryReady] = useState(false)
  const [liveApproachConfirmed, setLiveApproachConfirmed] = useState(false)
  const [liveApproachEditing, setLiveApproachEditing] = useState(true)
  const [liveReadinessComplete, setLiveReadinessComplete] = useState(false)
  const [liveRoomObjectiveOption, setLiveRoomObjectiveOption] = useState<LiveRoomObjectiveOptionId | ''>('')
  const [customLiveRoomObjective, setCustomLiveRoomObjective] = useState('')
  const [liveBriefingProofReply, setLiveBriefingProofReply] = useState('')
  const [liveBriefingSttError, setLiveBriefingSttError] = useState('')
  const [editableResources, setEditableResources] = useState<string[]>([])
  const [customResource, setCustomResource] = useState('')
  const [runtimeMotionContext, setRuntimeMotionContext] = useState<any>(null)
  const [prepRoomProfile, setPrepRoomProfile] = useState<PrepRoomResourceProfile | null>(null)
  const [preLiveSignals, setPreLiveSignals] = useState<Record<string, string>>({})
  const [optionalSignalInput, setOptionalSignalInput] = useState('')
  const [typedOptionalAnswerExample, setTypedOptionalAnswerExample] = useState('')
  const [optionalSignalInputFocused, setOptionalSignalInputFocused] = useState(false)
  const [optionalSignalAnswers, setOptionalSignalAnswers] = useState<Record<string, string>>({})
  const [showOpenAISignalSurface, setShowOpenAISignalSurface] = useState(false)
  const [typedOptionalSignalQuestion, setTypedOptionalSignalQuestion] = useState('')
  const [currentOptionalSignalQuestion, setCurrentOptionalSignalQuestion] = useState<{
    key: string
    label: string
    question: string
    why: string
    example: string
  } | null>(null)
  const [optionalSignalLoading, setOptionalSignalLoading] = useState(false)
  const [optionalSignalComplete, setOptionalSignalComplete] = useState(false)
  const [skippedOptionalSignalKeys, setSkippedOptionalSignalKeys] = useState<string[]>([])
  const [exampleIndex, setExampleIndex] = useState(0)
  const [preLivePreviewReady, setPreLivePreviewReady] = useState(false)
  const [liveEntryMandatoryMode, setLiveEntryMandatoryMode] = useState(false)
  const [liveEntryReadyMessageVisible, setLiveEntryReadyMessageVisible] = useState(false)
  const [mandatorySignalStep, setMandatorySignalStep] = useState(0)
  const [mandatorySignalInput, setMandatorySignalInput] = useState('')
  const [selectedConversationResponsibilities, setSelectedConversationResponsibilities] = useState<string[]>([])
  const [customConversationResponsibility, setCustomConversationResponsibility] = useState('')
  const [typedMandatorySignalQuestion, setTypedMandatorySignalQuestion] = useState('')
  const [founderAccessReady, setFounderAccessReady] = useState(false)

  const [proofTranscript, setProofTranscript] = useState<Array<{ speaker: 'george' | 'user'; text: string }>>([
    { speaker: 'george', text: 'Are you satisfied?' },
  ])
  const [proofInProgress, setProofInProgress] = useState(false)
  const [proofComplete, setProofComplete] = useState(false)
  const [spokenLiveBriefingStep, setSpokenLiveBriefingStep] = useState<1 | 2 | 3 | null>(null)
  const [liveEntryReasoning, setLiveEntryReasoning] = useState({
    roomObservation: '',
    supportSummary: '',
    commitmentStatement: '',
  })

  const toggleChair = (value: string) => {
    setChairs((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value)
        return next.length ? next : current
      }

      return [...current, value]
    })
  }


  const toggleLiveRecoveryOption = (option: LiveRecoveryOptionId) => {
    setLiveRecoveryAcknowledged(false)
    setLiveRecoveryOptions((current) => {
      if (option === 'none_realistic') {
        return current.includes('none_realistic') ? [] : ['none_realistic']
      }

      const withoutNone = current.filter((item) => item !== 'none_realistic')
      if (withoutNone.includes(option)) {
        const next = withoutNone.filter((item) => item !== option)
        return next.length ? next : DEFAULT_LIVE_RECOVERY_SELECTION
      }

      return Array.from(new Set([...withoutNone, option]))
    })
  }

  const chair = chairs
    .map((item) => item === 'Other' && customChair.trim() ? customChair.trim() : item)
    .join(' + ')

  const roomPhraseExamples = getRoomPhraseExamples(chair || String(preLiveSignals.role || ''))
  const currentRoomPhraseExample = roomPhraseExamples[exampleIndex % roomPhraseExamples.length]

  useEffect(() => {
    if (!useRoomPhrases || customRoomPhrases.trim() || roomPhraseFocused) {
      setTypedRoomPhraseExample('')
      return
    }

    setTypedRoomPhraseExample('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedRoomPhraseExample(currentRoomPhraseExample.slice(0, index))

      if (index >= currentRoomPhraseExample.length) {
        window.clearInterval(timer)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [currentRoomPhraseExample, customRoomPhrases, roomPhraseFocused, useRoomPhrases])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = JSON.parse(window.localStorage.getItem(GEORGE_LIVE_RECOVERY_STORAGE_KEY) || 'null')
      setLiveRecoveryOptions(normalizeLiveRecoverySelection(stored?.selected))
    } catch {
      setLiveRecoveryOptions(DEFAULT_LIVE_RECOVERY_SELECTION)
    }
  }, [])

  const contextSignalsCollapsed = chairSectionCollapsed

  const groundingSignalAvailable =
    knownContext.trim().length > 0 ||
    Boolean(prepDocument) ||
    Boolean(runtimeMotionContext) ||
    relatedSessionId !== 'not_related'

  const responsibilitySelectionLimit =
    tier === 'brilliant'
      ? 12
      : tier === 'intelligent'
        ? 2
        : 1

  const responsibilityLimitCopy =
    tier === 'brilliant'
      ? 'Select every role you carry in this conversation.'
      : tier === 'intelligent'
        ? 'Select up to 2 responsibilities.'
        : 'Select the responsibility that matters most.'

  const suggestedConversationResponsibilities = useMemo(
    () => getConversationResponsibilityOptions(preLiveSignals.desiredOutcome || objective || ''),
    [objective, preLiveSignals.desiredOutcome]
  )

  const toggleConversationResponsibility = (value: string) => {
    setSelectedConversationResponsibilities((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value)
      if (current.length >= responsibilitySelectionLimit) return current
      return [...current, value]
    })
  }

  const conversationResponsibilityAnswer = useMemo(() => {
    const selected = selectedConversationResponsibilities.filter((item) => item !== 'Other')
    const other = customConversationResponsibility.trim()

    return [
      ...selected,
      other ? `Other: ${other}` : '',
    ].filter(Boolean).join(', ')
  }, [customConversationResponsibility, selectedConversationResponsibilities])

  const liveEntryMandatoryQuestions = useMemo(() => [
    {
      key: 'name',
      kicker: 'LIVE ENTRY',
      label: 'Signal 1',
      question: 'What should I call you in this conversation?',
      helper: 'Name, title, nickname, or whatever people in the conversation will recognize.',
      example: 'Lester, Mr. Sawyer, Dr. Patel, Alex, Coach, etc.',
    },
    {
      key: 'desiredOutcome',
      kicker: 'OUTCOME SIGNAL',
      label: 'Signal 2',
      question: 'What outcome do you want from this conversation?',
      helper: 'Minimum signal for competence. More signal for excellence.',
      example: 'Secure a second meeting. Leave with a treatment plan. Get agreement on next steps.',
    },
    {
      key: 'role',
      kicker: 'RESPONSIBILITY SIGNAL',
      label: 'Signal 3',
      question: 'Who are you and what is your role in this conversation?',
      helper: 'Your role helps GEORGE understand your perspective, responsibilities, authority, and how best to support you.',
      example: 'Interviewee, founder, CEO, presenter, decision maker, parent, advisor, lead negotiator, coach, etc.',
    },
  ], [])

  const currentMandatorySignalQuestion = liveEntryMandatoryMode
    ? liveEntryMandatoryQuestions[mandatorySignalStep]
    : null

  useEffect(() => {
    if (!currentMandatorySignalQuestion?.question) {
      setTypedMandatorySignalQuestion('')
      return
    }

    let index = 0
    setTypedMandatorySignalQuestion('')

    const timer = window.setInterval(() => {
      index += 1
      setTypedMandatorySignalQuestion(currentMandatorySignalQuestion.question.slice(0, index))

      if (index >= currentMandatorySignalQuestion.question.length) {
        window.clearInterval(timer)
      }
    }, 26)

    return () => window.clearInterval(timer)
  }, [currentMandatorySignalQuestion?.key])

  const submitMandatoryLiveEntrySignal = () => {
    if (!currentMandatorySignalQuestion) return false

    const key = currentMandatorySignalQuestion.key
    const answer = key === 'role'
      ? conversationResponsibilityAnswer.trim()
      : mandatorySignalInput.trim()

    if (!answer) return false
    const nextSignals = {
      ...preLiveSignals,
      [key]: answer,
    }

    setPreLiveSignals(nextSignals)

    if (key === 'name') {
      try {
        window.localStorage.setItem('george_name', answer)
        window.localStorage.setItem('george_profile_name', answer)
        window.localStorage.setItem('george_user_name', answer)
      } catch {}
    }

    if (key === 'role') {
      setUserPosition(answer)
      setChairs(['Other'])
      setCustomChair(answer)
    }

    if (key === 'desiredOutcome') {
      setObjective(answer)
      setKnownContext((current) => {
        const existing = current.trim()
        const line = `Desired outcome: ${answer}`
        return existing ? `${existing}\n${line}` : line
      })
    }

    try {
      window.localStorage.setItem('GEORGE_PRE_LIVE_SIGNALS', JSON.stringify(nextSignals))
      window.localStorage.setItem(`GEORGE_PRE_LIVE_${key.toUpperCase()}`, answer)
    } catch {}

    setMandatorySignalInput('')
    setSelectedConversationResponsibilities([])
    setCustomConversationResponsibility('')

    const nextStep = mandatorySignalStep + 1

    if (nextStep >= liveEntryMandatoryQuestions.length) {
      setLiveEntryMandatoryMode(false)
      setLiveEntryReadyMessageVisible(true)
      setMandatorySignalStep(0)
      setPreLivePreviewReady(true)
      setShowOpenAISignalSurface(true)

      try {
        window.localStorage.setItem('GEORGE_PRE_LIVE_PREVIEW_READY', '1')
        window.localStorage.setItem('george_start_new_live', '1')
      } catch {}

      return true
    }

    setMandatorySignalStep(nextStep)
    return true
  }

  const requestNextOptionalSignalQuestion = async (answers = optionalSignalAnswers, skipped = skippedOptionalSignalKeys) => {
    if (!showOpenAISignalSurface) return

    try {
      setOptionalSignalLoading(true)
      setOptionalSignalComplete(false)

      const response = await fetch('/api/george/live/signal-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: preLiveSignals.role || chairs.join(', ') || customChair || userPosition,
          desiredOutcome: preLiveSignals.desiredOutcome || objective,
          acceptableOutcome: preLiveSignals.acceptableOutcome || '',
          audience: preLiveSignals.counterparty || audienceType,
          room: conversationType === 'Other' ? customConversationType : conversationType,
          knownContext,
          documentSummary: prepDocument?.summary || '',
          priorAnswers: answers,
          skippedQuestions: skipped,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.status === 'sufficient' || !data?.question) {
        setCurrentOptionalSignalQuestion({
          key: `ready_signal_${Date.now()}`,
          label: 'User signal',
          question: 'LIVE is ready. Add anything else GEORGE should know, or go to LIVE.',
          why: 'OpenAI does not have a sharper question right now. You may still add signal if it matters.',
          example: 'E.g. Board approval is required. Timeline is 60 days. Do not press on valuation.',
        })
        setOptionalSignalComplete(true)
        return
      }

      setCurrentOptionalSignalQuestion({
        key: String(data.key || `signal_${Date.now()}`),
        label: String(data.label || 'Additional signal'),
        question: String(data.question || ''),
        why: String(data.why || data.helper || 'This may improve GEORGE’s context, timing, and support.'),
        example: String(data.example || 'Answer if useful, or skip.'),
      })
    } catch {
      setCurrentOptionalSignalQuestion({
        key: `fallback_${Date.now()}`,
        label: 'Additional signal',
        question: 'What should GEORGE be especially ready for in this room?',
        why: 'This may improve GEORGE’s context, timing, and support.',
        example: 'Answer if useful, or skip.',
      })
    } finally {
      setOptionalSignalLoading(false)
    }
  }

  const optionalAnswerExamples = currentOptionalSignalQuestion?.example
    ? [currentOptionalSignalQuestion.example]
    : [
      'E.g. They may push back on valuation.',
      'E.g. I need GEORGE to keep me calm and concise.',
      'E.g. They may ask for proof, traction, or timing.',
    ]

  const desiredOutcomeExamples = [
    'E.g. Secure a second meeting.',
    'E.g. Get agreement on next steps.',
    'E.g. Leave with a clear decision.',
  ]

  const contextExamples = [
    'E.g. Speaking with an investor. Desired outcome: secure follow-up. Concern: valuation.',
    'E.g. The room may be tense. I need GEORGE to keep the language calm and useful.',
    'E.g. They care about timeline, risk, and whether I can defend the ask.',
  ]

  const positionExamples = [
    'E.g. CEO',
    'E.g. Candidate',
    'E.g. Patient advocate',
  ]

  const steeringExamples = [
    'E.g. softer, sharper, line, pause, clarify, plain',
    'E.g. diplomatic, concise, slow down, repeat line',
    'E.g. push, soften, explain simply, buy time',
  ]

  const currentOptionalAnswerExample = optionalAnswerExamples[exampleIndex % optionalAnswerExamples.length]

  useEffect(() => {
    if (optionalSignalInput.trim() || optionalSignalInputFocused) {
      setTypedOptionalAnswerExample('')
      return
    }

    setTypedOptionalAnswerExample('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedOptionalAnswerExample(currentOptionalAnswerExample.slice(0, index))

      if (index >= currentOptionalAnswerExample.length) {
        window.clearInterval(timer)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [currentOptionalAnswerExample, optionalSignalInput, optionalSignalInputFocused])

  const optionalSignalSurfaceComplete =
    showOpenAISignalSurface && optionalSignalComplete

  const hasGeorgeSurfaceSignals = Object.keys(preLiveSignals).length > 0
  const hideAcquiredMandatoryFields = hasGeorgeSurfaceSignals
  useEffect(() => {
    const timer = window.setInterval(() => {
      setExampleIndex((index) => index + 1)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!showOpenAISignalSurface || liveEntryReadyMessageVisible || currentOptionalSignalQuestion || optionalSignalLoading || optionalSignalComplete) return
    void requestNextOptionalSignalQuestion()
  }, [showOpenAISignalSurface, liveEntryReadyMessageVisible, currentOptionalSignalQuestion?.key, optionalSignalLoading, optionalSignalComplete])

  useEffect(() => {
    if (!currentOptionalSignalQuestion) {
      setTypedOptionalSignalQuestion('')
      return
    }

    const text = currentOptionalSignalQuestion.question
    setTypedOptionalSignalQuestion('')

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedOptionalSignalQuestion(text.slice(0, index))

      if (index >= text.length) {
        window.clearInterval(timer)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [currentOptionalSignalQuestion?.key])


  const submitOptionalSignalAnswer = () => {
    if (!currentOptionalSignalQuestion) return false

    const answer = optionalSignalInput.trim()
    if (!answer) return false

    const nextAnswers = {
      ...optionalSignalAnswers,
      [currentOptionalSignalQuestion.key]: answer,
    }

    setOptionalSignalAnswers(nextAnswers)

    const enrichedContextLine = `${currentOptionalSignalQuestion.label}: ${answer}`
    setKnownContext((current) => {
      const cleanCurrent = current.trim()
      return cleanCurrent
        ? `${cleanCurrent}\n${enrichedContextLine}`
        : enrichedContextLine
    })

    setOptionalSignalInput('')

    try {
      window.localStorage.setItem('GEORGE_PRE_LIVE_OPTIONAL_SIGNALS', JSON.stringify(nextAnswers))
    } catch {}

    setCurrentOptionalSignalQuestion(null)
    void requestNextOptionalSignalQuestion(nextAnswers, skippedOptionalSignalKeys)
    return true
  }

  const skipOptionalSignalQuestion = () => {
    if (!currentOptionalSignalQuestion) return

    const nextSkipped = [...skippedOptionalSignalKeys, currentOptionalSignalQuestion.key]
    setSkippedOptionalSignalKeys(nextSkipped)
    setCurrentOptionalSignalQuestion(null)
    void requestNextOptionalSignalQuestion(optionalSignalAnswers, nextSkipped)
  }


  /*
    GEORGE Doctrine

    The user decides the desired outcome.

    Minimum signal for competence.

    More signal for excellence.

    GEORGE optimizes for outcomes.

    Reality constrains strategy.

    Support prioritizes truth.
  */

const mandatoryLiveSignals = useMemo(() => {
    const cleanObjective = objective.trim()
    const hasObjective = cleanObjective.length > 0
    const hasGrounding = groundingSignalAvailable
    const hasPerspective = chairs.length > 0
    const multiPerspective = chairs.length > 1

    const signals = [
      {
        id: 'objective',
        label: "Current direction",
        met: hasObjective,
        helper: 'What should this interaction accomplish?',
      },
      {
        id: 'grounding',
        label: 'Current situation',
        met: hasGrounding,
        helper: 'What is happening, or what context should GEORGE use?',
      },
    ]

    if (multiPerspective) {
      signals.push({
        id: 'perspectives',
        label: 'Perspectives',
        met: hasPerspective,
        helper: 'Which positions should GEORGE consider before responding?',
      })
    }

    return signals
  }, [objective, groundingSignalAvailable, chairs.length])

  const completedMandatoryLiveSignalCount = mandatoryLiveSignals.filter((signal) => signal.met).length
  const missingMandatoryLiveSignals = mandatoryLiveSignals.filter((signal) => !signal.met)
  const objectiveSignalMet = objective.trim().length > 0
  const hasRequiredLiveSignal =
    objectiveSignalMet &&
    completedMandatoryLiveSignalCount >= 2 &&
    missingMandatoryLiveSignals.length === 0

  useEffect(() => {
    const cached = readCachedGeorgeSessionAuthority()
    setTier(cached.tier)
    setSessionEmail(cached.email || '')
    setFounderAccessReady(Boolean(cached.authenticated && cached.liveAccess && cached.source === 'founder'))

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        setTier(authority.tier)
        setSessionEmail(authority.email || '')
        setFounderAccessReady(Boolean(authority.authenticated && authority.liveAccess && authority.source === 'founder'))
      })
      .catch(() => {})

    try {
      const params = new URLSearchParams(window.location.search)
      const shouldResetLiveEntry =
        params.get('source') === 'start' ||
        window.localStorage.getItem('george_start_new_live') === '1'

      if (shouldResetLiveEntry) {
        window.localStorage.removeItem('GEORGE_PRE_LIVE_PREVIEW_READY')
        window.localStorage.removeItem('GEORGE_PRE_LIVE_SIGNALS')
        window.localStorage.removeItem('GEORGE_PRE_LIVE_OPTIONAL_SIGNALS')
        window.localStorage.removeItem('GEORGE_LAST_LIVE_SETUP')
        window.localStorage.removeItem('GEORGE_LIVE_SETUP')
        window.localStorage.removeItem('george_live_setup_active')
        window.localStorage.removeItem('george_live_runtime_support')
      }

      const acquiredSignals = shouldResetLiveEntry
        ? {}
        : JSON.parse(window.localStorage.getItem('GEORGE_PRE_LIVE_SIGNALS') || '{}') || {}
      setPreLiveSignals(acquiredSignals)

      if (acquiredSignals.name) {
        const normalizedName = String(acquiredSignals.name).trim()
        window.localStorage.setItem('george_name', normalizedName)
        window.localStorage.setItem('george_profile_name', normalizedName)
        window.localStorage.setItem('george_user_name', normalizedName)
      }

      if (acquiredSignals.role) {
        const normalizedRole = String(acquiredSignals.role).trim()
        const knownChair = CHAIR_OPTIONS.some((option) => option.label.toLowerCase() === normalizedRole.toLowerCase())
        if (knownChair) {
          const matched = CHAIR_OPTIONS.find((option) => option.label.toLowerCase() === normalizedRole.toLowerCase())
          setChairs(matched ? [matched.label] : [])
          setUserPosition(matched?.label || normalizedRole)
        } else {
          setChairs(['Other'])
          setCustomChair(normalizedRole)
          setUserPosition(normalizedRole)
        }
        setChairSectionCollapsed(true)
      }

      if (acquiredSignals.counterparty) {
        const normalizedAudience = String(acquiredSignals.counterparty).trim()
        const matchedAudience = AUDIENCE_TYPES.find((option) =>
          option.label.toLowerCase() === normalizedAudience.toLowerCase() ||
          option.label.toLowerCase() === normalizedAudience.toLowerCase().replace(/s$/, '')
        )

        setAudienceType(matchedAudience?.label || normalizedAudience)
      }

      if (acquiredSignals.desiredOutcome) {
        setObjective(String(acquiredSignals.desiredOutcome).trim())
      }

      const acquiredContext = [
        acquiredSignals.counterparty ? `Speaking with: ${acquiredSignals.counterparty}` : null,
        acquiredSignals.desiredOutcome ? `Desired outcome: ${acquiredSignals.desiredOutcome}` : null,
        acquiredSignals.acceptableOutcome ? `Acceptable outcome: ${acquiredSignals.acceptableOutcome}` : null,
      ].filter(Boolean).join('\n')

      if (acquiredContext && !knownContext.trim()) {
        setKnownContext(acquiredContext)
      }

      if (Object.keys(acquiredSignals).length > 0) {
        setShowOpenAISignalSurface(true)
      }
    } catch {}

    try {
      const params = new URLSearchParams(window.location.search)
      const source = params.get('source')
      const isStartSource = source === 'start'

      if (isStartSource) {
        window.localStorage.removeItem('GEORGE_PRE_LIVE_PREVIEW_READY')
        window.localStorage.removeItem('GEORGE_PRE_LIVE_SIGNALS')
        window.localStorage.removeItem('GEORGE_PRE_LIVE_OPTIONAL_SIGNALS')
        window.localStorage.removeItem('GEORGE_LAST_LIVE_SETUP')
        window.localStorage.removeItem('GEORGE_LIVE_SETUP')
        window.localStorage.removeItem('george_live_setup_active')
        window.localStorage.removeItem('george_live_runtime_support')
        window.localStorage.removeItem('george_active_live_session_id')
        window.localStorage.removeItem('george_active_campaign_session_id')
        window.localStorage.removeItem('george_active_campaign')
        window.localStorage.removeItem('george_active_context')
        window.localStorage.removeItem('george_active_label')

        setPreLiveSignals({})
        setOptionalSignalAnswers({})
        setSkippedOptionalSignalKeys([])
        setCurrentOptionalSignalQuestion(null)
        setOptionalSignalInput('')
        setOptionalSignalComplete(false)
        setShowOpenAISignalSurface(false)
        setLiveEntryReadyMessageVisible(false)
        setShowPrepPreview(false)
        setShowLiveBriefingRoom(false)
        setLiveEntryMandatoryMode(false)
        setPreLivePreviewReady(false)
        setMandatorySignalStep(0)
        setMandatorySignalInput('')
        setObjective('')
        setKnownContext('')
        setAudienceType('')
        setUserPosition('')
        setChairs([])
        setCustomChair('')
        setLiveRoomObjectiveOption('')
        setCustomLiveRoomObjective('')
        setLiveBriefingStep(1)
        setLiveBriefingToaAccepted(false)
        setLiveRecoveryAcknowledged(false)
        setLiveReadyAccepted(false)
        setLiveReadinessComplete(false)
      }

      const acquiredSignalsForAccess = isStartSource
        ? {}
        : JSON.parse(window.localStorage.getItem('GEORGE_PRE_LIVE_SIGNALS') || '{}') || {}

      const isFreshLiveStart =
        window.localStorage.getItem('george_start_new_live') === '1' ||
        params.get('source') === 'signal' ||
        params.get('source') === 'home' ||
        false ||
        params.get('source') === 'founder'

      const preLiveReady =
        !isFreshLiveStart && (
          window.localStorage.getItem('GEORGE_PRE_LIVE_PREVIEW_READY') === '1' ||
          params.get('devPreview') === '1' ||
          Object.keys(acquiredSignalsForAccess).length > 0 ||
          Boolean(window.localStorage.getItem('GEORGE_LIVE_SETUP')) ||
          Boolean(window.localStorage.getItem('george_live_setup_active'))
        )

      setPreLivePreviewReady(preLiveReady)

      const saved = JSON.parse(window.localStorage.getItem('GEORGE_LAST_LIVE_SETUP') || 'null')

      if (!isFreshLiveStart) {
        if (saved?.room) {
          const knownRoom = CONVERSATION_TYPES.some((option) => option.label === saved.room)
          setConversationType(knownRoom ? saved.room : 'Other')
          if (!knownRoom) setCustomConversationType(saved.room)
        }
        if (saved?.audienceType) setAudienceType(saved.audienceType)
        if (saved?.userPosition) setUserPosition(saved.userPosition)
      }

      if (saved?.cadence) setPacing(saved.cadence)
      if (saved?.supportStyle || saved?.liveAssistMode) {
        setSelectedSupportStyle(normalizeLiveSupportStyle(saved.supportStyle || saved.liveAssistMode))
      }
      if (saved?.controlWords) setControlWords(saved.controlWords)
      if (saved?.communicationStyle) setCommunicationStyle(saved.communicationStyle)
    } catch {}

    try {
      setRuntimeMotionContext(getActiveRuntimeMotionContext())
    } catch {
      setRuntimeMotionContext(null)
    }

    try {
      const activeNormal = getActiveSessionForMode('normal')
      const allSessions = JSON.parse(window.localStorage.getItem('GEORGE_SESSIONS_V2') || '[]')
      const normalSessions = Array.isArray(allSessions)
        ? allSessions
            .filter((session: any) => session?.mode === 'normal' && !session?.archived)
            .filter((session: any) => {
              const email = cached.email || ''
              if (!email) return true
              return !session?.metadata?.subscriberEmail || session.metadata.subscriberEmail === email
            })
            .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
        : []

      const merged = [
        ...(activeNormal ? [activeNormal] : []),
        ...normalSessions,
      ].filter((session: any, index: number, list: any[]) =>
        session?.id && list.findIndex((item: any) => item?.id === session.id) === index
      ).slice(0, 5)

      setRelatedSessions(merged)
      setRelatedSessionId(merged[0]?.id || 'not_related')
    } catch {
      setRelatedSessions([])
      setRelatedSessionId('not_related')
    }

    setHasLiveSession(!!getActiveSessionForMode('live'))
    setContextSectionCollapsed(false)
    setChairSectionCollapsed(false)
    setRoomSectionCollapsed(false)
    setRoomSectionCollapsed(false)
    setReady(true)
  }, [])

  const resolvedConversationType =
    conversationType === 'Other' && customConversationType.trim()
      ? customConversationType.trim()
      : conversationType

  const supportStyle = normalizeLiveSupportStyle(
    liveBriefingActiveSupportStyle
      ? toRuntimeSupportStyle(liveBriefingActiveSupportStyle)
      : selectedSupportStyle
  )
  const liveAssistMode = legacyAssistModeFromSupportStyle(supportStyle)

  const nextBriefingBenefit = buildNextBriefingBenefit(
    resolvedConversationType,
    audienceType,
    objective || String(preLiveSignals.desiredOutcome || ''),
    userPosition || chair || String(preLiveSignals.role || '')
  )

  const prepDocumentPrompt = useMemo(() => {
    return getPrepDocumentPrompt(resolvedConversationType, audienceType, objective)
  }, [resolvedConversationType, audienceType, objective])

  const resourceEstimate = useMemo(() => {
    const adjustedObjective = prepDocument
      ? `${objective}\n\nLoaded document: ${prepDocument.name}`
      : objective

    const estimate = estimateResources({ conversationType: resolvedConversationType, audienceType, pacing, outputMode: supportStyle === 'continue' ? 'Repeatable lines' : 'Cues', objective: adjustedObjective })

    if (!prepDocument) return estimate

    return {
      ...estimate,
      estimatedCents: estimate.estimatedCents + 3,
      runtimeMinutes: estimate.runtimeMinutes + 2,
      resources: Array.from(new Set([...estimate.resources, prepDocumentPrompt.resource])),
      reason: `${estimate.reason} Uploaded context adds document-aware support.`,
    }
  }, [resolvedConversationType, audienceType, pacing, supportStyle, objective, prepDocument, prepDocumentPrompt.resource])

  useEffect(() => {
    setEditableResources(resourceEstimate.resources)
  }, [resolvedConversationType, audienceType, pacing, supportStyle, objective, resourceEstimate.resources.join('|')])

  const finalResourceEstimate = useMemo(() => {
    return estimateWithResources(resourceEstimate, editableResources.length ? editableResources : resourceEstimate.resources)
  }, [resourceEstimate, editableResources])
  const showEstimatedLiveCost = hasRequiredLiveSignal

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!showEstimatedLiveCost) return

    window.localStorage.setItem('george_live_estimated_cents', String(finalResourceEstimate.estimatedCents))
    window.localStorage.setItem('george_live_estimated_cost_updated_at', String(Date.now()))
  }, [showEstimatedLiveCost, finalResourceEstimate.estimatedCents])

  const loadedSummary = useMemo(() => {
    return `Update GEORGE’s purview. If the room changes, the pressure shifts, or something important becomes visible, adjust GEORGE’s understanding before or during LIVE.`
  }, [])

  useEffect(() => {
    let cancelled = false

    const contextText = [
      resolvedConversationType,
      audienceType,
      pacing,
      supportStyle === 'continue' ? 'Repeatable lines' : 'Cues',
      communicationStyle,
      objective,
      userPosition,
      knownContext,
      prepDocument?.summary,
    ].filter(Boolean).join('\n')

    fetch('/api/george/prep-room/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextText }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.profile) {
          setPrepRoomProfile(data.profile)
        }
      })
      .catch(() => {
        if (!cancelled) setPrepRoomProfile(null)
      })

    return () => {
      cancelled = true
    }
  }, [resolvedConversationType, audienceType, pacing, supportStyle, objective, userPosition, knownContext, prepDocument?.summary])

  const handlePrepDocumentUpload = async (file: File | null) => {
    if (!file) return

    setPrepDocumentReading(true)

    try {
      const lower = file.name.toLowerCase()
      const isImage = file.type.startsWith('image/')
      const isText = file.type === 'text/plain' || lower.endsWith('.txt')
      const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf')
      const isDocx = file.type.includes('officedocument.wordprocessingml.document') || lower.endsWith('.docx')

      if (isPdf || isDocx) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/extract-file', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Unable to read document.')

        const text = String(data?.text || '').trim()
        setPrepDocument({
          name: data?.name || file.name,
          kind: isPdf ? 'pdf' : 'docx',
          summary: text.slice(0, 2400),
        })
        return
      }

      if (isText) {
        const text = await file.text()
        setPrepDocument({
          name: file.name,
          kind: 'text',
          summary: text.trim().slice(0, 2400),
        })
        return
      }

      if (isImage) {
        setPrepDocument({
          name: file.name,
          kind: 'image',
          summary: 'Image context uploaded. GEORGE should treat this as visual context for the room.',
        })
        return
      }

      setPrepDocument({
        name: file.name,
        kind: 'file',
        summary: 'File attached as conversation context. GEORGE should ask for clarification if the content is needed.',
      })
    } catch {
      setPrepDocument({
        name: file.name,
        kind: 'file',
        summary: 'File attached, but GEORGE could not extract readable text.',
      })
    } finally {
      setPrepDocumentReading(false)
    }
  }

  const addResource = () => {
    const clean = customResource.trim()
    if (!clean) return
    setEditableResources((items) => Array.from(new Set([...items, clean])))
    setCustomResource('')
  }

  const removeResource = (resource: string) => {
    setEditableResources((items) => items.filter((item) => item !== resource))
  }

  const selectedRelatedSession = relatedSessions.find((session) => session?.id === relatedSessionId) || null

  const relatedContextLabel =
    relatedSessions.length === 0 || relatedSessionId === 'not_related'
      ? 'No saved context selected'
      : selectedRelatedSession?.title || 'Selected context'

  const buildContinuityPackage = (session: any) => {
    if (!session) return null

    return {
      sessionId: session.id || null,
      title: session.title || 'Relevant context',
      direction: session.userGoal || session.metadata?.direction || session.title || 'Not established',
      outcome: session.metadata?.outcome || session.userGoal || 'Not established',
      openDecisions: session.metadata?.openDecisions || [],
      constraints: session.metadata?.constraints || [],
      lastKnownState: session.lastKnownState || session.summary || 'No state captured yet.',
      suggestedRestart: session.suggestedRestart || 'Continue from the clearest next useful move.',
      updatedAt: session.updatedAt || session.createdAt || null,
      source: 'selected_normal_session',
    }
  }

  const readLastConversationRecord = () => {
    if (typeof window === 'undefined') return null

    try {
      const raw = window.localStorage.getItem('GEORGE_LAST_CONVERSATION_RECORD')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const buildBriefRoomPreparation = () => {
    const relatedPackage = selectedRelatedSession
      ? {
          id: selectedRelatedSession.id || 'selected-related-session',
          desiredOutcome:
            selectedRelatedSession.metadata?.desiredOutcome ||
            selectedRelatedSession.userGoal ||
            selectedRelatedSession.currentGoal ||
            '',
          conversationContext:
            selectedRelatedSession.lastKnownState ||
            selectedRelatedSession.summary ||
            selectedRelatedSession.title ||
            '',
          liveSummaries: selectedRelatedSession.summary
            ? [{ summary: selectedRelatedSession.summary, source: 'selected_related_session' }]
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
      : null

    return prepareConversationFromPackage({
      conversationPackage: {
        id: 'live-entry-brief-room',
        desiredOutcome: objective,
        conversationType: resolvedConversationType,
        conversationContext: knownContext,
        conversationWith: audienceType,
        role: userPosition || chair,
        relevantDocumentation: prepDocument
          ? [{ id: prepDocument.name, title: prepDocument.name, type: prepDocument.kind, summary: prepDocument.summary }]
          : [],
      },
      relatedConversationPackages: relatedPackage ? [relatedPackage] : [],
      conversationRecord: readLastConversationRecord() || undefined,
    })
  }

  const resumeLiveConversation = (session: any) => {
    if (!session) return

    const metadata = session.metadata || {}
    const restoredOutcome = String(metadata.desiredOutcome || session.userGoal || session.currentGoal || '').trim()
    const restoredAudience = String(metadata.audience || metadata.audienceType || metadata.targetAudience || '').trim()
    const restoredChair = String(metadata.chair || metadata.userPosition || '').trim()
    const restoredContext = String(metadata.observedReality || metadata.knownContext || session.lastKnownState || session.summary || '').trim()

    setRelatedSessionId(session.id)
    setObjective(restoredOutcome)
    setAudienceType(restoredAudience)
    setUserPosition(restoredChair || 'Seeking')
    setChairs(restoredChair ? [restoredChair] : [])
    setKnownContext(restoredContext)
    setActiveSessionIdForMode('live', session.id)

    setShowResumeConversationList(false)
    setShowPrepPreview(false)
    const restoredHasOperationalSignal = Boolean(
      cleanBriefingValue(restoredContext) ||
      cleanBriefingValue(restoredChair)
    )

    setCurrentOptionalSignalQuestion(null)
    setOptionalSignalLoading(false)
    setLiveEntryMandatoryMode(!restoredHasOperationalSignal)
    setLiveBriefingStep(1)
    setLiveBriefingToaAccepted(false)
    setLiveBriefingSupportAccepted(false)
    setLiveBriefingCommunicationConfirmed(false)
    setLiveRecoveryAcknowledged(false)
    setLiveReadyAccepted(false)
    setLiveBriefingProofReply('')
    setLiveBriefingSttError('')
    setSpokenLiveBriefingStep(null)
    setShowOpenAISignalSurface(!restoredHasOperationalSignal)
    setShowLiveBriefingRoom(restoredHasOperationalSignal)
  }

  const editPrepRoomResource = <K extends keyof PrepRoomResourceProfile>(
    key: K,
    value: PrepRoomResourceProfile[K]
  ) => {
    setPrepRoomProfile((profile) => {
      if (!profile) return profile

      return {
        ...profile,
        [key]: value,
        userOverride: true,
      }
    })
  }

  const openQuickLiveSetup = () => {
    if (typeof window !== 'undefined') {
      const saved =
        window.localStorage.getItem('GEORGE_LIVE_SUPPORT_STYLE') ||
        window.localStorage.getItem('george_live_entry_support_preference')
      const savedPanel = toBriefingSupportPanelId(saved)
      if (savedPanel) {
        setQuickLiveSupportStyle(savedPanel)
        setQuickLiveExpandedSupport(savedPanel)
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const savedPhrases = JSON.parse(window.localStorage.getItem('GEORGE_LIVE_STEERING_PHRASES') || 'null')
        if (savedPhrases && typeof savedPhrases === 'object') {
          setQuickLiveSteeringPhrases((current) => ({
            ...current,
            ...savedPhrases,
          }))
        }
      } catch {}
    }

    setShowQuickLiveSetup(true)
    setQuickLiveSteeringOpen(false)
  }

  const startQuickLive = () => {
    if (typeof window === 'undefined') return

    try {
      const runtimeSupportStyle = toRuntimeSupportStyle(quickLiveSupportStyle)

      window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', runtimeSupportStyle)
      window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', runtimeSupportStyle)
      window.localStorage.setItem('george_live_entry_support_preference', quickLiveSupportStyle)
      window.localStorage.setItem('george_live_entry_support_default', quickLiveSupportStyle)
      window.localStorage.setItem('george_start_new_live', '1')
      window.localStorage.setItem('george_quick_live_entry', '1')
      window.localStorage.setItem('george_quick_live_message', "I'll become sharper as the interaction unfolds.")
      window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', runtimeSupportStyle)
      window.localStorage.setItem('george_live_entry_support_preference', quickLiveSupportStyle)
      window.localStorage.setItem('george_live_entry_support_default', quickLiveSupportStyle)
      window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', runtimeSupportStyle)
      window.localStorage.setItem('GEORGE_LIVE_STEERING_PHRASES', JSON.stringify(quickLiveSteeringPhrases))
    } catch {}

    window.location.href = '/george/live?ready=1'
  }

  const startLive = (skipPrep = false, resources = editableResources, bypassBriefing = false) => {
    if (typeof window === 'undefined') return

    if (!sessionEmail.trim() && !preLivePreviewReady && window.localStorage.getItem('george_founder_access') !== 'server-verified') {
      window.alert('Sign in to use LIVE.')
      return
    }

    const roomFormation = deriveRoomFormation({
      chairs,
      desiredOutcome: objective,
      observedReality: knownContext,
    })

    const liveRecoveryConstraints = {
      selected: normalizeLiveRecoverySelection(liveRecoveryOptions),
    }

    if (!hasRequiredLiveSignal) {
      const missing = missingMandatoryLiveSignals
        .map((signal) => signal.label)
        .join(', ')

      window.alert(`Add signal before LIVE: ${missing}.`)
      return
    }

    const continuityPackage = relatedSessionId === 'not_related'
      ? null
      : buildContinuityPackage(selectedRelatedSession)
    const preparationRuntime = buildBriefRoomPreparation()

    const roomPackage = {
      relatedSessionId,
      relatedSessionTitle: selectedRelatedSession?.title || null,
      relatedSessionMode: relatedSessionId === 'not_related' ? 'not_related' : 'normal',
      chair,
      chairs,
      desiredOutcome: objective.trim(),
      observedReality: knownContext.trim(),
      continuityPackage,
      roomFormation,
      recoveryConstraints: liveRecoveryConstraints,
      internalInstruction: [
        'Use the selected chair as a relevance signal, not as a separate brain or profession mode.',
        'User outcome is highest authority.',
        'Observed reality is second authority.',
        'Selected session context is fallback/supporting context only.',
        'Narrow all context to LIVE usefulness: what matters now, what decision is at stake, what cue or line may help.',
      ].join(' '),
    }

    const finalResources = Array.from(new Set([
      ...(skipPrep ? resourceEstimate.resources : (resources.length ? resources : resourceEstimate.resources)),
      ...(prepDocument ? [prepDocumentPrompt.resource] : []),
    ]))
    const finalEstimate = skipPrep ? resourceEstimate : estimateWithResources(resourceEstimate, finalResources)
    const selectedCapabilityIds = deriveLiveCapabilityIds({
      conversationType,
      audienceType,
      userPosition,
      objective,
      knownContext,
      resources: finalResources,
    })

    const liveRoomObjectiveLabels: Record<LiveRoomObjectiveOptionId, string> = {
      project_strength: 'Project strength',
      build_trust: 'Build trust',
      find_leverage: 'Find leverage',
      find_common_ground: 'Find common ground',
      surface_objections: 'Surface objections',
      confirm_authority: 'Confirm authority',
      confirm_concern: 'Confirm concern',
      confirm_timeline: 'Confirm timeline',
      other: 'Other',
    }

    const selectedLiveRoomObjectiveLabel =
      liveRoomObjectiveOption === 'other'
        ? customLiveRoomObjective.trim()
        : liveRoomObjectiveOption
          ? liveRoomObjectiveLabels[liveRoomObjectiveOption]
          : ''

    const optionalBriefingLines = Object.entries(optionalSignalAnswers)
      .map(([key, value]) => {
        const cleanValue = cleanBriefingValue(value)
        if (!cleanValue) return ''
        return `${key}: ${cleanValue}`
      })
      .filter(Boolean)

    const briefingKnowledge = [
      preLiveSignals.name ? `User name: ${preLiveSignals.name}` : '',
      preLiveSignals.role ? `User role in room: ${preLiveSignals.role}` : '',
      preLiveSignals.desiredOutcome ? `Desired outcome: ${preLiveSignals.desiredOutcome}` : '',
      cleanBriefingValue(knownContext) ? `Known context: ${cleanBriefingValue(knownContext)}` : '',
      optionalBriefingLines.length ? `Additional briefing: ${optionalBriefingLines.join(' | ')}` : '',
      preparationRuntime?.preparationBrief ? `Preparation: ${preparationRuntime.preparationBrief}` : '',
      preparationRuntime?.opportunities?.[0] ? `Preparation opportunity: ${preparationRuntime.opportunities[0]}` : '',
      preparationRuntime?.risks?.[0] ? `Preparation risk: ${preparationRuntime.risks[0]}` : '',
    ].filter(Boolean).join('\n')

    const secondaryOutcome =
      cleanBriefingValue((optionalSignalAnswers as any).fallbackOutcome) ||
      cleanBriefingValue((optionalSignalAnswers as any).secondaryOutcome) ||
      cleanBriefingValue((preLiveSignals as any).fallbackOutcome) ||
      cleanBriefingValue((preLiveSignals as any).secondaryOutcome) ||
      ''

    const intangibleObjective =
      selectedLiveRoomObjectiveLabel || ''

    const secondaryObjective = secondaryOutcome

    const runtimeSupport = {
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds,
      selectedCapabilities: finalResources,
      baseRuntimeCents: finalEstimate.estimatedCents,
      capacityCents: finalEstimate.estimatedCents,
      estimatedCents: finalEstimate.estimatedCents,
      resourceEstimate: finalEstimate,
      runtimeBias: finalResources,
      room: skipPrep ? 'Adaptive LIVE' : conversationType,
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
      supportStyle,
      deliveryStyle: supportStyle,
      receiverProfile: (typeof window !== 'undefined' ? (window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') || window.localStorage.getItem('george_live_entry_receiver_profile') || 'audio_only') : 'visual_only'),
    }

    const liveSetup = {
      room: skipPrep ? 'Adaptive LIVE' : conversationType,
      audienceType,
      userPosition,
      chair,
      relatedSessionId,
      relatedSessionTitle: selectedRelatedSession?.title || null,
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
      language: window.localStorage.getItem('george_live_language') || 'English',
      cadence: pacing,
      objective,
      prepDocument,
      prepDocumentPrompt,
      controlWords: useRoomPhrases
        ? (customRoomPhrases.trim() || DEFAULT_ROOM_PHRASES.join(', '))
        : '',
      useRoomPhrases,
      customRoomPhrases,
      communicationStyle,
      liveAssistMode,
      skipPrep,
      runtimeSupport,
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds,
      estimatedCents: finalEstimate.estimatedCents,
      compactPrep: true,
      prepRoomProfile,
      recoveryConstraints: liveRecoveryConstraints,
      supportStyle,
      deliveryStyle: supportStyle,
      receiverProfile: (typeof window !== 'undefined' ? (window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') || window.localStorage.getItem('george_live_entry_receiver_profile') || 'audio_only') : 'visual_only'),
      createdAt: Date.now(),
    }

    window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', supportStyle)
    window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', supportStyle)
    window.localStorage.setItem('GEORGE_LIVE_RECEIVER_PROFILE', (window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') || window.localStorage.getItem('george_live_entry_receiver_profile') || 'audio_only'))
    window.localStorage.setItem('george_live_entry_receiver_profile', (window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') || window.localStorage.getItem('george_live_entry_receiver_profile') || 'audio_only'))
    window.localStorage.setItem('george_live_entry_support_preference', (window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') || window.localStorage.getItem('george_live_entry_receiver_profile') || 'audio_only'))
    window.localStorage.setItem('george_live_entry_support_default', (window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') || window.localStorage.getItem('george_live_entry_receiver_profile') || 'audio_only'))
    window.localStorage.setItem('george_live_assist_mode', liveAssistMode)

    if (!bypassBriefing) {
      setLiveBriefingStep(1)
      setLiveBriefingToaAccepted(false)
      setLiveBriefingSupportAccepted(false)
      setLiveRecoveryAcknowledged(false)
      setLiveReadyAccepted(false)
      setLiveBriefingProofReply('')
      setLiveBriefingSttError('')
      if (typeof window !== 'undefined') window.sessionStorage.removeItem('george_panel3_proof_started')
      setSpokenLiveBriefingStep(null)
      setShowPrepPreview(false)
      setShowLiveBriefingRoom(true)
      return
    }

    window.localStorage.setItem('george_start_new_live', '1')
    window.localStorage.removeItem('george_active_live_session_id')
    window.localStorage.removeItem('george_active_campaign_session_id')
    window.localStorage.removeItem('george_active_campaign')
    window.localStorage.removeItem('george_active_context')
    window.localStorage.removeItem('george_active_label')
    const sanitizedLastSetup = {
      ...liveSetup,
      objective: '',
      knownContext: '',
      observedReality: '',
      prepDocument: null,
      roomPackage: {
        ...roomPackage,
        desiredOutcome: '',
        observedReality: '',
        secondaryOutcome: '',
        secondaryObjective: '',
        fallbackOutcome: '',
        intangibleObjective: '',
      },
    }

    window.localStorage.setItem('GEORGE_LIVE_SETUP', JSON.stringify(liveSetup))
    window.localStorage.setItem('GEORGE_LAST_LIVE_SETUP', JSON.stringify(sanitizedLastSetup))
    window.localStorage.setItem('george_live_setup_active', JSON.stringify(liveSetup))
    window.localStorage.setItem('george_live_assist_mode', liveAssistMode)
    window.localStorage.setItem('george_live_runtime_support', JSON.stringify(runtimeSupport))
    window.localStorage.setItem(GEORGE_LIVE_RECOVERY_STORAGE_KEY, JSON.stringify(liveRecoveryConstraints))
    window.localStorage.setItem('george_live_estimated_cents', String(finalEstimate.estimatedCents))

    setObjective('')
    setKnownContext('')
    setPrepDocument(null)
    setLiveToaAccepted(false)
    setContextSectionCollapsed(false)
    setChairSectionCollapsed(false)

    window.localStorage.setItem('george_live_prep_inputs_cleared', '1')

    window.location.href = '/george/live?ready=1'
  }



  const appendProofTranscript = (speaker: 'george' | 'user', message: string) => {
    setProofTranscript((current) => [...current, { speaker, text: message }])
  }

const beginProofOfAwareness = async () => {
    if (proofInProgress) return
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('george_panel3_proof_started') === '1') return
    if (typeof window !== 'undefined') window.sessionStorage.setItem('george_panel3_proof_started', '1')
    if (proofComplete) {
      return
    }

    setProofInProgress(true)
    setProofTranscript([{ speaker: 'george', text: 'Listening…' }])

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
        : null

    let heardUser = false
    let recognition: any = null

    const listenOnce = (timeoutMs = 3200) =>
      new Promise<string>((resolve) => {
        if (!SpeechRecognition) {
          setLiveBriefingSttError('Voice capture is unavailable in this browser. Continuing.')
          window.setTimeout(() => resolve(''), timeoutMs)
          return
        }

        recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.continuous = false
        recognition.interimResults = false

        const timer = window.setTimeout(() => {
          try { recognition.stop() } catch {}
          resolve('')
        }, timeoutMs)

        recognition.onresult = (event: any) => {
          const transcript = String(event?.results?.[0]?.[0]?.transcript || '').trim()
          window.clearTimeout(timer)
          resolve(transcript)
        }

        recognition.onerror = (event: any) => {
          setLiveBriefingSttError('I could not hear that clearly. Continuing.')
          window.clearTimeout(timer)
          resolve('')
        }

        recognition.onend = () => {}

        try {
          recognition.start()
        } catch {
          window.clearTimeout(timer)
          resolve('')
        }
      })

    const askAndListen = async (line: string, timeoutMs = 3200) => {
      appendProofTranscript('george', line)
      await speakLiveEntryLine(line)
      const heard = await listenOnce(timeoutMs)
      if (heard) {
        heardUser = true
        appendProofTranscript('user', heard)
      }
      return heard
    }

    const first = await askAndListen("Okay. Before we get started, is there anything you'd like me to know?")
    if (!first) {
      const second = await askAndListen('Anything at all? I can hear you.', 5000)
      if (!second) {
        appendProofTranscript('george', "Then let's go to work.")
        await speakLiveEntryLine("Then let's go to work.")
      }
    }

    if (heardUser) {
      let commitmentStatement = liveEntryReasoning.commitmentStatement || 'I’ll keep that in mind.'

      try {
        const response = await fetch('/api/george/live/entry-reasoning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objective,
            position: chair || userPosition,
            audience: audienceType,
            roomSignal: knownContext,
            secondaryPosition: (optionalSignalAnswers as any).fallbackOutcome || (optionalSignalAnswers as any).secondaryOutcome || '',
            userName:
              cleanBriefingValue(window.localStorage.getItem('george_profile_name')) ||
              cleanBriefingValue(window.localStorage.getItem('george_user_name')) ||
              cleanBriefingValue(window.localStorage.getItem('george_name')) ||
              'there',
            proofTranscript: first || '',
          }),
        })

        const data = await response.json().catch(() => ({}))
        commitmentStatement = String(data?.commitmentStatement || commitmentStatement).trim()
      } catch {}

      appendProofTranscript(
        'george',
        `Understood. ${commitmentStatement || 'I’ll keep that in mind.'}`
      )

      await speakLiveEntryLine(
        `Understood. ${commitmentStatement || 'I’ll keep that in mind.'}`
      )
    }

    setProofComplete(true)
    setProofInProgress(false)
    undefined
  }

  useEffect(() => {
    if (!showLiveBriefingRoom) return

    liveBriefingOriginalSignalRef.current = {
      objective: cleanBriefingValue(objective),
      userPosition: cleanBriefingValue(userPosition),
      audienceType: cleanBriefingValue(audienceType),
      knownContext: cleanBriefingValue(knownContext),
    }

    setLiveBriefingEditAcknowledged(false)
  }, [showLiveBriefingRoom])

  useEffect(() => {
    if (!showLiveBriefingRoom) return

    fetch('/api/george/live/entry-reasoning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objective,
        position: chair || userPosition,
        audience: audienceType,
        roomSignal: knownContext,
        secondaryPosition: userPosition,
        userName: sessionEmail ? sessionEmail.split('@')[0] : 'Lester',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLiveEntryReasoning({
          roomObservation: String(data?.roomObservation || ''),
          supportSummary: String(data?.supportSummary || ''),
          commitmentStatement: String(data?.commitmentStatement || ''),
        })
      })
      .catch(() => {})
  }, [showLiveBriefingRoom, objective, chair, userPosition, audienceType, knownContext, sessionEmail])


  const getLiveRoomUserName = () => {
    if (typeof window === 'undefined') return 'You'

    const roomName =
      cleanBriefingValue(window.localStorage.getItem('george_name')) ||
      cleanBriefingValue(window.localStorage.getItem('george_profile_name')) ||
      cleanBriefingValue(window.localStorage.getItem('george_user_name'))

    if (roomName) return roomName

    return 'You'
  }

  const waitForLiveEntryVoice = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

  const liveEntryVoiceUnlockedRef = useRef(false)

  const unlockLiveEntryVoice = () => {
    if (liveEntryVoiceUnlockedRef.current) return

    try {
      const audio = new Audio()
      audio.muted = true
      void audio.play()
        .then(() => {
          liveEntryVoiceUnlockedRef.current = true
          audio.pause()
        })
        .catch(() => {
          liveEntryVoiceUnlockedRef.current = true
        })
    } catch {
      liveEntryVoiceUnlockedRef.current = true
    }
  }

  const stopLiveEntryVoice = () => {
    try {
      if (liveEntryAudioRef.current) {
        liveEntryAudioRef.current.pause()
        liveEntryAudioRef.current.currentTime = 0
        liveEntryAudioRef.current = null
      }

      if (liveEntryAudioUrlRef.current) {
        URL.revokeObjectURL(liveEntryAudioUrlRef.current)
        liveEntryAudioUrlRef.current = null
      }
    } catch {}
  }

  const speakLiveEntryLine = async (message: string) => {
    const speechRequestId = liveEntrySpeechRequestRef.current + 1
    liveEntrySpeechRequestRef.current = speechRequestId

    stopLiveEntryVoice()

    try {
      const response = await fetch('/api/george/live/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, email: sessionEmail?.trim() || undefined }),
      })

      if (!response.ok) return
      if (liveEntrySpeechRequestRef.current !== speechRequestId) return

      const blob = await response.blob()
      if (liveEntrySpeechRequestRef.current !== speechRequestId) return

      const audioUrl = URL.createObjectURL(blob)

      if (liveEntrySpeechRequestRef.current !== speechRequestId) {
        URL.revokeObjectURL(audioUrl)
        return
      }

      const audio = new Audio(audioUrl)

      liveEntryAudioRef.current = audio
      liveEntryAudioUrlRef.current = audioUrl

      await new Promise<void>((resolve) => {
        const finish = () => {
          if (liveEntryAudioRef.current === audio) {
            liveEntryAudioRef.current = null
          }

          if (liveEntryAudioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl)
            liveEntryAudioUrlRef.current = null
          }

          resolve()
        }

        audio.onended = finish
        audio.onerror = finish

        void audio.play().catch(finish)
      })
    } catch {}
  }

  useEffect(() => {
    return () => {
      liveEntrySpeechRequestRef.current += 1
      stopLiveEntryVoice()
    }
  }, [])

  useEffect(() => {
    if (!showLiveBriefingRoom) return
    if (liveBriefingStep !== 1) return

    if (!liveBriefingToaAccepted) {
      setLiveBriefingReadyToContinue(false)

      if (!cleanBriefingValue(knownContext)) {
        liveBriefingRoomSignalEditedRef.current = false
      }

      if (liveBriefingTermsPreviouslyAcceptedRef.current) {
        liveBriefingTermsPreviouslyAcceptedRef.current = false
        liveBriefingHasReopenedEditsRef.current = true
      }

      return
    }

    const hasOperationalBriefingSignal =
      Boolean(cleanBriefingValue(knownContext)) ||
      Boolean(cleanBriefingValue(userPosition))

    liveBriefingTermsPreviouslyAcceptedRef.current = true
    setLiveBriefingReadyToContinue(hasOperationalBriefingSignal)
  }, [
    showLiveBriefingRoom,
    liveBriefingStep,
    liveBriefingToaAccepted,
    knownContext,
    userPosition,
  ])

  useEffect(() => {
    if (!showLiveBriefingRoom) return
    if (!liveBriefingToaAccepted) return
    if (liveBriefingEditAcknowledged) return

    const original = liveBriefingOriginalSignalRef.current

    const actualEditOccurred =
      cleanBriefingValue(objective) !== original.objective ||
      cleanBriefingValue(userPosition) !== original.userPosition ||
      cleanBriefingValue(audienceType) !== original.audienceType ||
      cleanBriefingValue(knownContext) !== original.knownContext

    if (!actualEditOccurred) return

    setLiveBriefingEditAcknowledged(true)
  }, [
    showLiveBriefingRoom,
    liveBriefingToaAccepted,
    liveBriefingEditAcknowledged,
    objective,
    userPosition,
    audienceType,
    knownContext,
  ])

  useEffect(() => {
    if (!showLiveBriefingRoom) return
    if (liveBriefingStep !== 3) return
    if (proofInProgress || proofComplete) return

    const timer = window.setTimeout(() => {
      void beginProofOfAwareness()
    }, 700)

    return () => window.clearTimeout(timer)
  }, [showLiveBriefingRoom, liveBriefingStep, proofInProgress, proofComplete])

  if (!ready) return null

  const liveEntryQuestionSurface = liveEntryMandatoryMode && currentMandatorySignalQuestion
    ? {
        kicker: currentMandatorySignalQuestion.kicker,
        label: currentMandatorySignalQuestion.label,
        question: typedMandatorySignalQuestion,
        helper: currentMandatorySignalQuestion.helper,
        example: currentMandatorySignalQuestion.example,
        inputValue: mandatorySignalInput,
        setInputValue: setMandatorySignalInput,
        submit: submitMandatoryLiveEntrySignal,
        loading: false,
        step: `${mandatorySignalStep + 1}/${liveEntryMandatoryQuestions.length}`,
        primaryAction: currentMandatorySignalQuestion.key === 'role' ? 'Send' : 'Continue',
        canBeginLive: false,
        readinessMessage: false,
      }
    : showOpenAISignalSurface && liveEntryReadyMessageVisible
      ? {
          kicker: 'LIVE READY',
          label: 'Minimum signal acquired',
          question: "You're ready for LIVE.\n\nI have enough information to begin supporting you.\n\nAdditional briefing can make my guidance more specific as I learn more about the room.",
          helper: nextBriefingBenefit,
          example: '',
          inputValue: '',
          setInputValue: () => {},
          submit: () => {
            setLiveEntryReadyMessageVisible(false)
            void requestNextOptionalSignalQuestion()
            return true
          },
          loading: false,
          step: 'Ready',
          primaryAction: 'Continue Briefing',
          canBeginLive: true,
          readinessMessage: true,
        }
    : showOpenAISignalSurface && currentOptionalSignalQuestion
      ? {
          kicker: 'ADDITIONAL SIGNAL',
          label: currentOptionalSignalQuestion.label || 'Optional signal',
          question: typedOptionalSignalQuestion,
          helper: currentOptionalSignalQuestion.why,
          example: currentOptionalSignalQuestion.example,
          inputValue: optionalSignalInput,
          setInputValue: setOptionalSignalInput,
          submit: submitOptionalSignalAnswer,
          loading: false,
          step: 'Optional',
          primaryAction: 'Continue preparing',
          canBeginLive: true,
          readinessMessage: false,
        }
      : showOpenAISignalSurface && optionalSignalLoading
        ? {
            kicker: 'ADDITIONAL SIGNAL',
            label: 'GEORGE is determining the next useful signal',
            question: 'One moment.',
            helper: 'OpenAI is reasoning over the room signal to sharpen GEORGE\'s support.',
            example: '',
            inputValue: '',
            setInputValue: () => {},
            submit: () => false,
            loading: true,
            step: 'Optional',
            primaryAction: 'Continue',
            canBeginLive: true,
            readinessMessage: false,
          }
        : null

  if (liveEntryQuestionSurface) {
    return (
      <main className="relative min-h-[100dvh] overflow-y-auto bg-black px-4 pb-8 pt-4 text-white sm:pt-5">

        <div className="relative z-10 mx-auto w-full max-w-[1120px]">
          <div className="mb-5 flex items-center gap-4">
          <BxPageHeader backLabel="BACK" backHref="/george" />
        </div>

          <section className="relative w-full overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#050505] px-5 pb-6 pt-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] sm:px-7 sm:pb-7 sm:pt-5">

          <div className="relative z-30 max-w-[760px]">

          <div className="flex items-center justify-between gap-4">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#D7DBE4]/52">
              {liveEntryQuestionSurface.kicker}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/24">
              {liveEntryQuestionSurface.step}
            </div>
          </div>

          <h1 className="mt-5 text-[24px] font-semibold leading-tight tracking-[-0.04em] text-white/90 sm:text-[27px]">
            {liveEntryQuestionSurface.readinessMessage ? "You're ready for LIVE." : liveEntryQuestionSurface.canBeginLive ? 'GEORGE has enough signal.' : 'Bring GEORGE up to speed.'}
          </h1>

          <div className="mt-3 border-l border-[#AEB6FF]/24 pl-4 text-left sm:pl-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/34">
              {liveEntryQuestionSurface.label}
            </div>

            <div className={`mt-5 min-h-[66px] whitespace-pre-line ${liveEntryQuestionSurface.readinessMessage ? 'text-[17px] leading-7' : 'text-[22px] leading-[1.55]'} tracking-[-0.02em] text-[#F2F4FF]/86`}>
              {liveEntryQuestionSurface.question}
              {!liveEntryQuestionSurface.loading && !liveEntryQuestionSurface.readinessMessage && (
                <span className="ml-1 inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/60" />
              )}
            </div>

            <div className={`mt-4 text-[13px] leading-6 ${liveEntryQuestionSurface.readinessMessage ? 'text-[#D7DBE4]/64' : 'text-white/42'}`}>
              {liveEntryQuestionSurface.helper}
            </div>

            {!liveEntryQuestionSurface.readinessMessage && liveEntryQuestionSurface.example && (
              <div className="mt-5 rounded-[0.85rem] border border-white/[0.05] bg-white/[0.012] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/24">
                  Example
                </div>
                <div className="mt-2.5 text-[12.5px] leading-6 text-white/44">
                  {liveEntryQuestionSurface.example}
                </div>
              </div>
            )}

            {!liveEntryQuestionSurface.loading && !liveEntryQuestionSurface.readinessMessage && currentMandatorySignalQuestion?.key === 'role' && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/28">
                  Suggested roles
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[...suggestedConversationResponsibilities, 'Other'].map((option) => {
                    const active = selectedConversationResponsibilities.includes(option)
                    const disabled = !active && selectedConversationResponsibilities.length >= responsibilitySelectionLimit

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleConversationResponsibility(option)}
                        className={`rounded-full border px-3 py-2 text-[11px] transition ${
                          active
                            ? 'border-[#4E7CFF]/42 bg-[#4E7CFF]/[0.12] text-white'
                            : disabled
                              ? 'cursor-not-allowed border-white/[0.035] bg-white/[0.012] text-white/20'
                              : 'border-white/[0.065] bg-white/[0.018] text-white/48 hover:border-[#D7DCFF]/20 hover:text-white/72'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 text-[12px] leading-5 text-white/34">
                  {responsibilityLimitCopy}
                </div>

                {selectedConversationResponsibilities.includes('Other') && (
                  <input
                    value={customConversationResponsibility}
                    onChange={(event) => setCustomConversationResponsibility(event.target.value)}
                    autoFocus
                    className="mt-4 w-full border-0 border-b border-[#4E7CFF]/22 bg-transparent px-0 py-3 text-[16px] leading-7 text-[#D7DBE4]/88 outline-none placeholder:text-white/20 focus:border-[#4E7CFF]/46"
                    placeholder="write another responsibility..."
                  />
                )}
              </div>
            )}

            {!liveEntryQuestionSurface.loading && !liveEntryQuestionSurface.readinessMessage && currentMandatorySignalQuestion?.key !== 'role' && (
              <input
                value={liveEntryQuestionSurface.inputValue}
                onChange={(event) => liveEntryQuestionSurface.setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    liveEntryQuestionSurface.submit()
                  }
                }}
                autoFocus
                className="mt-5 w-full border-0 border-b border-[#4E7CFF]/22 bg-transparent px-0 py-3 text-[18px] leading-7 text-[#D7DBE4]/88 outline-none placeholder:text-white/20 focus:border-[#4E7CFF]/46"
                placeholder="say it here..."
              />
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                disabled={liveEntryQuestionSurface.loading}
                onClick={() => { unlockLiveEntryVoice(); liveEntryQuestionSurface.submit() }}
                className="rounded-[0.95rem] border border-white/[0.16] bg-white/80 px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-black transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-40"
              >
                {liveEntryQuestionSurface.primaryAction}
              </button>

              {showOpenAISignalSurface &&
               currentOptionalSignalQuestion &&
               !liveEntryQuestionSurface.readinessMessage && (
                <button
                  type="button"
                  onClick={() => {
                    unlockLiveEntryVoice()
                    void requestNextOptionalSignalQuestion()
                  }}
                  className="rounded-[0.95rem] border border-white/[0.08] bg-transparent px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-white/46 transition hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035] hover:text-[#D7DCFF]/78"
                >
                  Skip
                </button>
              )}

              <button
                type="button"
                disabled={!liveEntryQuestionSurface.canBeginLive}
                onClick={() => {
                  setShowOpenAISignalSurface(false)
                  setLiveEntryReadyMessageVisible(false)
                  setCurrentOptionalSignalQuestion(null)
                  setOptionalSignalLoading(false)
                  setLiveEntryMandatoryMode(false)
                  setShowLiveBriefingRoom(true)
                  setLiveBriefingStep(1)
                }}
                className={`rounded-[0.95rem] border px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] transition active:scale-[0.98] ${
                  liveEntryQuestionSurface.canBeginLive
                    ? 'border-[#4E7CFF]/35 bg-[#4E7CFF] text-white hover:border-[#5A84FF] hover:bg-[#5A84FF]'
                    : 'cursor-default border-[#4E7CFF]/25 bg-[#4E7CFF] text-white opacity-35'
                }`}
              >
                {liveEntryQuestionSurface.canBeginLive ? 'Enter LIVE' : 'Add signal for LIVE'}
              </button>
            </div>
          </div>
          </div>
          </section>
        </div>
      </main>
    )
  }

  if (showResumeConversationList) {
    const liveSessions = getSessionsForMode('live').filter((session: any) => !session.archived)

    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center bg-[#06070A] px-4 text-white">
        <div className="w-full max-w-[440px] rounded-[1.25rem] border border-white/[0.07] bg-[#05080D]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/30">Resume Conversation</div>
              <div className="mt-1 text-[14px] text-white/70">Choose the room to brief before LIVE.</div>
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
              liveSessions.slice(0, 12).map((session: any) => {
                const metadata = session.metadata || {}
                const outcome = metadata.desiredOutcome || session.userGoal || session.currentGoal || 'Outcome not set'
                const audience = metadata.audience || metadata.audienceType || metadata.targetAudience || 'Audience not set'
                const updated = session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'Recent'

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => resumeLiveConversation(session)}
                    className="block w-full rounded-[1rem] border border-white/[0.065] bg-white/[0.018] p-4 text-left transition hover:border-[#BFC7FF]/28 hover:bg-[#BFC7FF]/[0.055]"
                  >
                    <div className="text-[14px] font-medium text-white/78">{session.title || 'LIVE Conversation'}</div>
                    <div className="mt-2 text-[12px] leading-5 text-white/44">Outcome: {String(outcome)}</div>
                    <div className="text-[12px] leading-5 text-white/34">Audience: {String(audience)}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/22">Last active: {updated}</div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </main>
    )
  }

  if (!sessionEmail.trim() && !preLivePreviewReady && window.localStorage.getItem('george_founder_access') !== 'server-verified') {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center bg-[#06070A] px-4 text-white">
        <div className="w-full max-w-[460px] rounded-[28px] bg-[#050505] p-6 shadow-none ">
          <div className="text-[10px] uppercase tracking-[0.26em] text-white/28">LIVE requires sign-in</div>
          <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white/90">Sign in to use LIVE.</h1>
          <p className="mt-2 text-[13px] leading-5 text-white/46">
            LIVE uses session continuity and conversation context. Sign in so GEORGE can protect the room from stale or unowned context.
          </p>
          <a
            href="/george"
            className="mt-5 block rounded-[0.82rem] border border-[#4E7CFF]/[0.16] bg-[#4E7CFF]/[0.08] px-4 py-3 text-center text-[13px] font-semibold text-[#D7DCFF]/86 transition hover:bg-[#4E7CFF]/[0.14] hover:text-white"
          >
            Return to GEORGE
          </a>
        </div>
      </main>
    )
  }

  if (showLiveBriefingRoom) {
    const displayName =
      cleanBriefingValue(window.localStorage.getItem('george_profile_name')) ||
      cleanBriefingValue(window.localStorage.getItem('george_user_name')) ||
      cleanBriefingValue(window.localStorage.getItem('george_name')) ||
      'You'

    const objectiveLabel = cleanBriefingValue(objective) || 'the desired outcome'
    const positionLabel = titleBriefingValue(userPosition || chair, 'your position')
    const audienceLabel = titleBriefingValue(audienceType, 'the audience')
    const roomLabel = titleBriefingValue(resolvedConversationType, 'this room')
    const secondaryPosition =
      cleanBriefingValue((optionalSignalAnswers as any).fallbackOutcome) ||
      cleanBriefingValue((optionalSignalAnswers as any).secondaryOutcome) ||
      cleanBriefingValue((preLiveSignals as any).fallbackOutcome) ||
      cleanBriefingValue((preLiveSignals as any).secondaryOutcome)

    const setBriefingSecondaryOutcome = (value: string) => {
      setOptionalSignalAnswers((previous: any) => ({
        ...previous,
        secondaryOutcome: value,
        fallbackOutcome: value,
      }))

      setPreLiveSignals((previous: any) => ({
        ...previous,
        secondaryOutcome: value,
        fallbackOutcome: value,
      }))
    }

    const briefingInputsLocked = liveBriefingToaAccepted

    const observation = buildBriefingObservation(roomLabel, audienceLabel, objectiveLabel, knownContext)

    if (!generatedBriefingRoomSignalRef.current) {
      generatedBriefingRoomSignalRef.current = observation
    }

    const updateBriefingObjective = (value: string) => {
      const nextObjectiveLabel = cleanBriefingValue(value) || 'the desired outcome'
      const nextObservation = buildBriefingObservation(roomLabel, audienceLabel, nextObjectiveLabel, '')

      setObjective(value)

      if (!liveBriefingRoomSignalEditedRef.current) {
        generatedBriefingRoomSignalRef.current = nextObservation
        setKnownContext(nextObservation)
      }
    }

    const updateBriefingRoomSignal = (value: string) => {
      liveBriefingRoomSignalEditedRef.current = true
      setKnownContext(value)
    }

    const previousLiveUserRecognized = Boolean(
      cleanBriefingValue(sessionEmail) ||
      cleanBriefingValue(relatedSessionId && relatedSessionId !== 'not_related' ? relatedSessionId : '') ||
      cleanBriefingValue(typeof window !== 'undefined' ? window.localStorage.getItem('george_live_previous_user') : '')
    )

    const hasSeenLiveSteering = Boolean(
      cleanBriefingValue(typeof window !== 'undefined' ? window.localStorage.getItem('george_live_steering_seen') : '') ||
      cleanBriefingValue(typeof window !== 'undefined' ? window.localStorage.getItem('george_live_entry_steering_seen') : '') ||
      cleanBriefingValue(typeof window !== 'undefined' ? window.localStorage.getItem(GEORGE_LIVE_RECOVERY_STORAGE_KEY) : '')
    )

    const canBeginLiveFromBriefing = liveBriefingReadyToContinue && previousLiveUserRecognized && hasSeenLiveSteering

    const supportItems = buildBriefingSupport(roomLabel, audienceLabel, objectiveLabel, supportStyle)
    const briefingPreparation = buildBriefRoomPreparation()
    const estimatedCents = Math.max(0, Math.round(finalResourceEstimate.estimatedCents || 0))
    const proofReady = Boolean(liveBriefingProofReply.trim())
    const briefingUnderstandingSignals = Array.from(new Set([
      roomLabel !== 'this room' ? roomLabel : '',
      audienceLabel !== 'the audience' ? audienceLabel : '',
      /vc|venture|investor|capital|fundraising|raise|financing|valuation|term sheet|series\s*[abc]|\$|billion|deal/i.test(objectiveLabel)
        ? 'Capital / investor signal'
        : '',
      /board|executive|ceo|strategy|acquisition|merger/i.test(`${roomLabel} ${audienceLabel} ${objectiveLabel}`)
        ? 'Executive room signal'
        : '',
      /negotiat|terms|offer|price|deal/i.test(`${roomLabel} ${objectiveLabel}`)
        ? 'Negotiation signal'
        : '',
      prepDocument ? 'Documentation attached' : '',
    ].filter(Boolean))).slice(0, 5)

    const documentationRecommendations = prepDocumentPrompt.recommendations.map((title) => ({
      title,
      reason: /pitch|financial|cap table|term|market|traction/i.test(title)
        ? 'Useful for credibility, proof, valuation, risk, or investor questions.'
        : 'Useful if it materially improves timing, judgment, or execution.',
    }))


    const skipLiveRecoveryConstraints = () => {
      const selected = normalizeLiveRecoverySelection(DEFAULT_LIVE_RECOVERY_SELECTION)
      setLiveRecoveryOptions(selected)
      setLiveRecoveryAcknowledged(true)

      try {
        window.localStorage.setItem(
          GEORGE_LIVE_RECOVERY_STORAGE_KEY,
          JSON.stringify({ selected })
        )
      } catch {}
    }


    if (liveBriefingStep === 1) {
      const toggleBriefingSection = (
        section:
          | 'outcome'
          | 'responsibility'
          | 'participants'
          | 'context'
          | 'additional'
          | 'documents'
      ) => {
        setLiveBriefingOpenSection((current) => (current === section ? null : section))
      }

      const briefingRows = [
        {
          id: 'outcome' as const,
          label: 'Desired outcome',
          summary: objective || objectiveLabel || 'Outcome pending',
        },
        {
          id: 'responsibility' as const,
          label: 'Your responsibility',
          summary: userPosition || positionLabel || 'Responsibility pending',
        },
        {
          id: 'participants' as const,
          label: 'Conversation with',
          summary: audienceType || audienceLabel || 'Participants pending',
        },
        {
          id: 'context' as const,
          label: 'Conversation and known context',
          summary: knownContext || observation || 'Context pending',
        },
        {
          id: 'additional' as const,
          label: 'Additional signal',
          summary: secondaryPosition || 'Nothing additional yet',
        },
        {
          id: 'documents' as const,
          label: 'Documents',
          summary: prepDocument?.name || 'No document added',
        },
      ]

      return (
        <PanelShell
          label={
            relatedSessionId !== 'not_related'
              ? 'BRIEF ROOM · UPDATE'
              : 'BRIEF ROOM · EDITABLE'
          }
          title={
            relatedSessionId !== 'not_related'
              ? 'Before we begin...'
              : 'Here’s what I understand'
          }
          stage={1}
        >
          <div className="mt-3 rounded-[1.15rem] border border-white/[0.065] bg-[#07090D]/84 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">
                Operational briefing
              </div>
              <p className="mt-2 max-w-[650px] text-[12px] leading-5 text-[#D7DBE4]/50">
                {relatedSessionId !== 'not_related'
                  ? 'Has anything changed?'
                  : 'Review everything GEORGE learned about the conversation. Open one section at a time to edit it.'}
              </p>
            </div>

            <div className="mt-4 divide-y divide-white/[0.045] rounded-[1rem] border border-white/[0.055] bg-black/20">
              {briefingRows.map((row) => {
                const open = liveBriefingOpenSection === row.id

                return (
                  <div key={row.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleBriefingSection(row.id)}
                      className={`relative flex w-full items-start justify-between gap-4 overflow-hidden px-4 py-3.5 text-left transition ${
                        row.id === 'documents'
                          ? 'border-[#4E7CFF]/22 bg-[#4E7CFF]/[0.07] hover:bg-[#4E7CFF]/[0.11]'
                          : 'hover:bg-white/[0.018]'
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

                      <span className="shrink-0 rounded-full border border-white/[0.07] px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] text-white/36">
                        {open ? 'Close' : 'Edit'}
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] ${
                        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="border-t border-white/[0.04] bg-white/[0.012] px-4 py-4">
                          {row.id === 'outcome' && (
                            <textarea
                              value={objective}
                              disabled={briefingInputsLocked}
                              onChange={(event) => updateBriefingObjective(event.target.value)}
                              rows={3}
                              className="w-full resize-none rounded-[0.85rem] border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[13px] leading-6 text-[#F2F4FF]/88 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={objectiveLabel}
                            />
                          )}

                          {row.id === 'responsibility' && (
                            <input
                              value={userPosition}
                              disabled={briefingInputsLocked}
                              onChange={(event) => setUserPosition(event.target.value)}
                              className="w-full rounded-[0.85rem] border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[13px] text-[#F2F4FF]/84 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={positionLabel}
                            />
                          )}

                          {row.id === 'participants' && (
                            <input
                              value={audienceType}
                              disabled={briefingInputsLocked}
                              onChange={(event) => setAudienceType(event.target.value)}
                              className="w-full rounded-[0.85rem] border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[13px] text-[#F2F4FF]/84 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={audienceLabel}
                            />
                          )}

                          {row.id === 'context' && (
                            <textarea
                              value={knownContext}
                              disabled={briefingInputsLocked}
                              onChange={(event) => updateBriefingRoomSignal(event.target.value)}
                              rows={4}
                              className="w-full resize-none rounded-[0.85rem] border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[13px] leading-6 text-[#D7DBE4]/80 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder={observation}
                            />
                          )}

                          {row.id === 'additional' && (
                            <textarea
                              value={secondaryPosition}
                              disabled={briefingInputsLocked}
                              onChange={(event) => setBriefingSecondaryOutcome(event.target.value)}
                              rows={3}
                              className="w-full resize-none rounded-[0.85rem] border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[13px] leading-6 text-[#D7DBE4]/80 outline-none placeholder:text-white/20 disabled:opacity-55"
                              placeholder="Anything else GEORGE should understand, remember, watch for, or help accomplish."
                            />
                          )}

                          {row.id === 'documents' && (
                            <div className="relative overflow-hidden rounded-[0.95rem] border border-[#4E7CFF]/[0.28] bg-[#4E7CFF]/[0.075] p-3.5 shadow-[0_0_30px_rgba(78,124,255,0.08)]">
                              <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent blur-[1px] animate-[briefingUploadShimmer_4.8s_ease-in-out_infinite]"
                              />
                              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D7DCFF]/64">
                                Add material GEORGE should know
                              </div>
                              <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/46">
                                Upload facts, history, proof, constraints, or language that should strengthen this briefing.
                              </p>

                              <div className="mt-3">
                                <RelevantDocumentationPanel
                                  recommendations={documentationRecommendations}
                                  document={prepDocument}
                                  reading={prepDocumentReading}
                                  onUpload={(file) => void handlePrepDocumentUpload(file)}
                                  onRemove={() => setPrepDocument(null)}
                                />
                              </div>

                              {prepDocument?.summary && (
                                <div className="mt-3 rounded-[0.8rem] border border-white/[0.055] bg-black/20 px-3 py-2.5">
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

                          {row.id !== 'documents' && (
                            <button
                              type="button"
                              onClick={() => setLiveBriefingOpenSection(null)}
                              className="mt-3 rounded-full border border-white/[0.07] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/40 transition hover:border-white/[0.14] hover:text-white/66"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {(briefingUnderstandingSignals.length > 0 ||
              briefingPreparation?.opportunities?.[0] ||
              briefingPreparation?.risks?.[0]) && (
              <div className="mt-3 rounded-[1rem] border border-white/[0.055] bg-white/[0.014] px-3.5 py-3">
                <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/28">
                  What GEORGE will carry into LIVE
                </div>

                {briefingUnderstandingSignals.length > 0 && (
                  <div className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/50">
                    {briefingUnderstandingSignals.join(' • ')}
                  </div>
                )}

                <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/42 sm:grid-cols-2">
                  {briefingPreparation?.opportunities?.[0] && (
                    <div>Opportunity: {briefingPreparation.opportunities[0]}</div>
                  )}
                  {briefingPreparation?.risks?.[0] && (
                    <div>Risk: {briefingPreparation.risks[0]}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <label
            className={`mt-4 flex cursor-pointer items-start gap-3 rounded-[1rem] border px-4 py-3 transition-[background-color,border-color,box-shadow] duration-500 ${
              liveBriefingToaAccepted
                ? 'border-[#D7DCFF]/70 bg-[#4E7CFF]/[0.12] shadow-[0_0_34px_rgba(174,182,255,0.20)]'
                : 'border-[#4E7CFF]/28 bg-[#4E7CFF]/[0.028]'
            }`}
          >
            <input
              type="checkbox"
              checked={liveBriefingToaAccepted}
              onChange={(event) => {
                unlockLiveEntryVoice()
                setLiveBriefingToaAccepted(event.target.checked)
                if (event.target.checked) setLiveBriefingOpenSection(null)
              }}
              className="mt-1 h-4 w-4 accent-[#4E7CFF]"
            />
            <span className="text-[12.5px] leading-5 text-[#D7DBE4]/72">
              I reviewed this briefing. It reflects what I want GEORGE to understand about this conversation before LIVE.
            </span>
          </label>

          <AwakeButton active={liveBriefingReadyToContinue} onClick={() => setLiveBriefingStep(2)}>
            Continue
          </AwakeButton>

          <style jsx>{`
            @keyframes briefingUploadShimmer {
              0%, 72% {
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
      )
    }

    if (liveBriefingStep === 2) {
      const storedReceiverProfile =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE') ||
            window.localStorage.getItem('george_live_entry_receiver_profile') ||
            window.localStorage.getItem('george_live_entry_support_preference')
          : null

      const validStoredReceiverProfile =
        storedReceiverProfile === 'visual_only' ||
        storedReceiverProfile === 'audio_only' ||
        storedReceiverProfile === 'audio_visual'
          ? storedReceiverProfile
          : null

      const activeReceiverProfile =
        selectedReceiverProfile ||
        validStoredReceiverProfile ||
        'audio_only'

      const activeReceiverPanel =
        LIVE_RECEIVER_PROFILE_PANELS.find((panel) => panel.id === activeReceiverProfile) ||
        LIVE_RECEIVER_PROFILE_PANELS[0]

      const activeAdaptiveSupportId: LiveBriefingSupportPanelId =
        liveBriefingActiveSupportStyle === 'response' ||
        selectedSupportStyle === 'response'
          ? 'response'
          : 'advice'

      const activeAdaptiveSupportPanel =
        LIVE_SUPPORT_PANELS.find(
          (panel) => panel.id === activeAdaptiveSupportId
        ) || LIVE_SUPPORT_PANELS[0]

      const setActiveAdaptiveSupport = (
        panelId: LiveBriefingSupportPanelId
      ) => {
        const runtimeStyle = toRuntimeSupportStyle(panelId)

        setLiveBriefingActiveSupportStyle(panelId)
        setSelectedSupportStyle(
          normalizeLiveSupportStyle(runtimeStyle)
        )
        setLiveRecoveryAcknowledged(false)
        setLiveBriefingCapabilitiesConfirmed(false)
        setLiveBriefingOpenMechanicsPanel(null)

        try {
          window.localStorage.setItem(
            'GEORGE_LIVE_SUPPORT_STYLE',
            runtimeStyle
          )
          window.localStorage.setItem(
            'GEORGE_LIVE_DELIVERY_STYLE',
            runtimeStyle
          )
          window.localStorage.setItem(
            'george_live_adaptive_support_preference',
            panelId === 'response' ? 'response' : 'cue'
          )
          window.dispatchEvent(
            new Event('george-live-support-style-change')
          )
        } catch {}
      }

      const setActiveReceiverProfile = (profile: LiveReceiverProfilePanelId) => {
        setSelectedReceiverProfile(profile)
        setLiveBriefingSupportAccepted(true)
        setLiveRecoveryAcknowledged(false)
        setLiveBriefingCapabilitiesConfirmed(false)
        setLiveBriefingOpenMechanicsPanel(null)

        try {
          window.localStorage.setItem('GEORGE_LIVE_RECEIVER_PROFILE', profile)
          window.localStorage.setItem('george_live_entry_receiver_profile', profile)
          window.localStorage.setItem('george_live_entry_support_preference', profile)
          const activeRuntimeStyle =
            toRuntimeSupportStyle(activeAdaptiveSupportId)

          window.localStorage.setItem(
            'GEORGE_LIVE_SUPPORT_STYLE',
            activeRuntimeStyle
          )
          window.localStorage.setItem(
            'GEORGE_LIVE_DELIVERY_STYLE',
            activeRuntimeStyle
          )
          window.dispatchEvent(new Event('george-live-receiver-profile-change'))
        } catch {}
      }

      const liveTierLabel = String(tier || 'smart').toUpperCase()
      const liveObjectiveLabel =
        objectiveLabel && objectiveLabel !== 'the desired outcome'
          ? objectiveLabel
          : 'move toward my desired outcome'

      const confirmPrivacyAndContinue = () => {
        setLiveRecoveryAcknowledged(true)
        setLiveBriefingCapabilitiesConfirmed(true)
        setLiveBriefingExpandedSupportPanel(null)

        try {
          window.localStorage.setItem('george_live_entry_steering_seen', '1')
          window.localStorage.setItem('george_live_entry_privacy_acknowledged', '1')
          window.localStorage.setItem('GEORGE_LIVE_RECEIVER_PROFILE', activeReceiverPanel.id)
          window.localStorage.setItem('george_live_entry_receiver_profile', activeReceiverPanel.id)
          window.localStorage.setItem('george_live_entry_support_preference', activeReceiverPanel.id)
          const activeRuntimeStyle =
            toRuntimeSupportStyle(activeAdaptiveSupportId)

          window.localStorage.setItem(
            'GEORGE_LIVE_SUPPORT_STYLE',
            activeRuntimeStyle
          )
          window.localStorage.setItem(
            'GEORGE_LIVE_DELIVERY_STYLE',
            activeRuntimeStyle
          )
        } catch {}
      }

      return (
        <PanelShell
          label="BRIEF ROOM · MECHANICS"
          title="Mechanics"
          stage={2}
          onBack={() => setLiveBriefingStep(1)}
        >
          <div className="mt-3 space-y-3">
            <div className="rounded-[0.82rem] border border-white/[0.08] bg-[#080A10]/[0.72] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.24em] text-white/34">
                    GEORGE&apos;s support
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
                    {activeAdaptiveSupportPanel.label}
                  </div>
                  <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/48">
                    {activeAdaptiveSupportPanel.line}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLiveBriefingOpenMechanicsPanel(
                      liveBriefingOpenMechanicsPanel === 'support' ? null : 'support'
                    )
                  }
                  className="shrink-0 rounded-[0.65rem] border border-white/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/46 transition hover:border-white/[0.16] hover:text-white/72"
                >
                  {liveBriefingOpenMechanicsPanel === 'support' ? 'Close' : 'Change'}
                </button>
              </div>

              <div
                className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] ${
                  liveBriefingOpenMechanicsPanel === 'support'
                    ? 'mt-4 grid-rows-[1fr] opacity-100'
                    : 'mt-0 grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {LIVE_SUPPORT_PANELS.map((panel) => {
                      const active = activeAdaptiveSupportPanel.id === panel.id

                      return (
                        <button
                          key={panel.id}
                          type="button"
                          onClick={() => setActiveAdaptiveSupport(panel.id)}
                          className={`rounded-[0.72rem] border px-3 py-3 text-left transition ${
                            active
                              ? 'border-[#4E7CFF]/35 bg-[#4E7CFF]/[0.075]'
                              : 'border-white/[0.06] bg-white/[0.018] hover:border-white/[0.14] hover:bg-white/[0.035]'
                          }`}
                        >
                          <span className="block text-[11px] font-semibold text-[#F2F4FF]/82">
                            {panel.label}
                          </span>
                          <span className="mt-1 block text-[10px] leading-4 text-white/40">
                            {panel.line}
                          </span>
                          {active && (
                            <span className="mt-3 block border-l border-white/[0.14] pl-3 text-[11px] leading-5 text-[#D7DBE4]/54">
                              {panel.detail}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[0.82rem] border border-[#4E7CFF]/[0.16] bg-[#4E7CFF]/[0.045] px-4 py-3">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
                Receiver selected
              </div>
              <div className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#F2F4FF]/88">
                <span>{activeReceiverPanel.label}</span>

                {(activeReceiverPanel.id === 'visual_only' ||
                  activeReceiverPanel.id === 'audio_visual') && (
                  <span className="inline-flex items-center rounded-full border border-[#7EA1FF]/45 bg-[#4E7CFF] px-2 py-[1px] text-[8px] font-bold uppercase tracking-[0.16em] text-white">
                    BETA
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
                Tell GEORGE how you will receive support. GEORGE adapts guidance automatically based on the room.
              </div>

              <button
                type="button"
                onClick={() => setLiveBriefingOpenMechanicsPanel(liveBriefingOpenMechanicsPanel === 'receiver' ? null : 'receiver')}
                className="mt-3 rounded-[0.65rem] border border-[#4E7CFF]/18 bg-[#4E7CFF]/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#D7DCFF]/72 transition hover:border-[#4E7CFF]/34 hover:bg-[#4E7CFF]/[0.10]"
              >
                {liveBriefingOpenMechanicsPanel === 'receiver' ? 'Collapse' : 'Change'}
              </button>

              {liveBriefingOpenMechanicsPanel === 'receiver' && (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {LIVE_RECEIVER_PROFILE_PANELS.map((panel) => {
                  const active = activeReceiverPanel.id === panel.id

                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setActiveReceiverProfile(panel.id)}
                      className={`rounded-[0.72rem] border px-3 py-2.5 text-left transition ${
                        active
                          ? 'border-[#4E7CFF]/[0.24] bg-[#4E7CFF]/[0.055]'
                          : 'border-white/[0.06] bg-white/[0.018] hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[11px] font-semibold text-[#F2F4FF]/78">
                        <span>{panel.label}</span>

                        {(panel.id === 'visual_only' || panel.id === 'audio_visual') && (
                          <span className="inline-flex items-center rounded-full border border-[#7EA1FF]/45 bg-[#4E7CFF] px-2 py-[1px] text-[8px] font-bold uppercase tracking-[0.16em] text-white">
                            BETA
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/36">
                        {panel.line}
                      </span>
                      {active && (
                        <span className="mt-3 block border-l border-[#4E7CFF]/24 pl-3 text-[11px] leading-5 text-[#D7DBE4]/52">
                          {panel.detail}
                        </span>
                      )}
                    </button>
                  )
                })}
                </div>
              )}
            </div>

            <div className="rounded-[0.82rem] border border-white/[0.08] bg-[#080A10]/[0.72] px-4 py-4">
              {liveBriefingCommunicationConfirmed ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
                      Speaking Style selected
                    </div>
                    <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
                      {communicationStyle}
                    </div>
                    <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
                      I’ll shape support around this speaking style during LIVE.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLiveBriefingCommunicationConfirmed(false)
                      setLiveRecoveryAcknowledged(false)
                      setLiveBriefingCapabilitiesConfirmed(false)
                      setLiveBriefingOpenMechanicsPanel('speaking')
                    }}
                    className="shrink-0 rounded-[0.65rem] border border-[#4E7CFF]/24 bg-[#4E7CFF]/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#D7DCFF]/66 transition hover:border-[#4E7CFF]/38 hover:bg-[#4E7CFF]/[0.14] hover:text-white"
                  >
                    Edit
                  </button>
                </div>
              ) : liveBriefingOpenMechanicsPanel === 'speaking' ? (
                <>
                  <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/48">
                    Communication
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-[#D7DBE4]/64">
                    Choose the speaking style that feels most natural to you.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {[
                      ['Adaptive', 'Recommended'],
                      ['Executive', 'Concise and composed'],
                      ['Conversational', 'Natural and direct'],
                    ].map(([label, helper]) => {
                      const active = communicationStyle === label

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            setCommunicationStyle(label)
                            setLiveBriefingCommunicationConfirmed(true)
                            setLiveRecoveryAcknowledged(false)
                            setLiveBriefingCapabilitiesConfirmed(false)
                            setLiveBriefingOpenMechanicsPanel(null)

                            try {
                              window.localStorage.setItem('george_live_communication_style', label)
                            } catch {}
                          }}
                          className={`rounded-[0.72rem] border px-3 py-2.5 text-left transition ${
                            active
                              ? 'border-[#4E7CFF]/[0.24] bg-[#4E7CFF]/[0.055]'
                              : 'border-white/[0.06] bg-white/[0.018] hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
                          }`}
                        >
                          <span className="block text-[11px] font-semibold text-[#F2F4FF]/78">
                            {label}
                          </span>
                          <span className="mt-1 block text-[10px] leading-4 text-white/36">
                            {helper}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setLiveBriefingOpenMechanicsPanel('speaking')}
                  className="w-full rounded-[0.72rem] border border-[#4E7CFF]/18 bg-[#4E7CFF]/[0.05] px-3 py-2.5 text-left text-[11px] font-semibold text-[#D7DCFF]/72 transition hover:border-[#4E7CFF]/34 hover:bg-[#4E7CFF]/[0.09]"
                >
                  Choose Speaking Style
                </button>
              )}
            </div>

            <div className={`rounded-[0.82rem] border px-4 py-3 transition ${
              liveRecoveryAcknowledged
                ? 'border-[#D7DCFF]/28 bg-[#D7DCFF]/[0.06] text-[#F2F4FF]/86'
                : liveRecoveryAcknowledgementOpen
                  ? 'border-[#D7DCFF]/18 bg-[#D7DCFF]/[0.035] text-[#D7DBE4]/72'
                  : 'border-white/[0.08] bg-[#080A10]/[0.52] text-[#D7DBE4]/58 hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
            }`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={liveRecoveryAcknowledged}
                  onChange={(event) => {
                    if (!liveRecoveryAcknowledgementOpen) {
                      setLiveRecoveryAcknowledgementOpen(true)
                      setLiveRecoveryAcknowledged(false)
                      setLiveBriefingCapabilitiesConfirmed(false)
                      return
                    }

                    if (event.target.checked) {
                      confirmPrivacyAndContinue()
                      return
                    }

                    setLiveRecoveryAcknowledged(false)
                    setLiveBriefingCapabilitiesConfirmed(false)
                  }}
                  className="mt-1 h-4 w-4 accent-[#D7DCFF]"
                />

                <span className="text-[12px] leading-5">
                  <span className="block font-semibold text-[#F2F4FF]/82">
                    GEORGE complements your judgment, communication style, and effort.
                  </span>

                  {!liveRecoveryAcknowledgementOpen && !liveRecoveryAcknowledged && (
                    <span className="mt-1 block text-[#D7DBE4]/50">
                      Check once to review. Check again to acknowledge.
                    </span>
                  )}
                </span>
              </label>

              {(liveRecoveryAcknowledgementOpen || liveRecoveryAcknowledged) && (
                <div className="mt-3 border-l border-[#D7DCFF]/18 pl-3 text-[12px] leading-5 text-[#D7DBE4]/64">
                  I understand that GEORGE is {liveTierLabel}, but I remain the final authority. GEORGE supports me by adapting how it listens, responds, and delivers help based on the mechanics I choose. If GEORGE&apos;s support does not fit the conversation, I may ignore it, revise it, or take another approach. GEORGE complements my effort; it does not replace my responsibility.{' '}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault()
                      window.open('/privacy', '_blank')
                    }}
                    className="text-[#D7DCFF]/72 underline underline-offset-4"
                  >
                    Privacy
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!liveRecoveryAcknowledged}
                onClick={() => setLiveBriefingStep(3)}
                className={`rounded-[0.75rem] border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                  liveRecoveryAcknowledged
                    ? 'border-[#4E7CFF]/65 bg-[#4E7CFF] text-white shadow-[0_10px_28px_rgba(78,124,255,0.26)] hover:border-[#7EA1FF]/80 hover:bg-[#5B86FF]'
                    : 'cursor-default border-white/[0.05] bg-transparent text-white/20'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </PanelShell>
      )
    }


    const confirmReadyRoomAcknowledgement = (checked: boolean) => {
      liveReadyConfirmSequenceRef.current += 1
      const sequence = liveReadyConfirmSequenceRef.current

      setLiveReadyAccepted(checked)
      setLiveControlsOrientationSeen(false)
      setLiveControlsEntryReady(false)
      setLiveReadinessComplete(false)

      if (!checked) return

      window.setTimeout(() => {
        if (liveReadyConfirmSequenceRef.current !== sequence) return
        setLiveControlsOrientationSeen(true)
      }, 700)

      window.setTimeout(() => {
        if (liveReadyConfirmSequenceRef.current !== sequence) return
        setLiveControlsEntryReady(true)
        setLiveReadinessComplete(true)
      }, 1450)
    }

    const totalBriefingSignal = [
      resolvedConversationType,
      audienceType,
      objective,
      knownContext,
      secondaryPosition,
      communicationStyle,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const liveApproachOptions: Array<{
      id: LiveRoomObjectiveOptionId
      label: string
      line: string
      compatible: boolean
    }> = [
      {
        id: 'project_strength',
        label: 'Confident and prepared',
        line: 'Present your position with command, proof, and composure.',
        compatible: true,
      },
      {
        id: 'build_trust',
        label: 'Warm and reassuring',
        line: 'Reduce unnecessary threat while keeping the objective visible.',
        compatible: !/discipline|termination|enforcement|breach|default/.test(totalBriefingSignal),
      },
      {
        id: 'find_leverage',
        label: 'Strategic and firm',
        line: 'Use lawful pressure, timing, and leverage without losing control.',
        compatible: !/medical|doctor|patient|grief|bereavement/.test(totalBriefingSignal),
      },
      {
        id: 'find_common_ground',
        label: 'Collaborative',
        line: 'Look for shared interests and a practical path forward.',
        compatible: !/termination|final warning|cease and desist/.test(totalBriefingSignal),
      },
      {
        id: 'surface_objections',
        label: 'Curious and diagnostic',
        line: 'Ask, listen, and uncover what is actually driving resistance.',
        compatible: true,
      },
      {
        id: 'confirm_authority',
        label: 'Direct and decisive',
        line: 'Move toward clarity, authority, and a concrete decision.',
        compatible: !/grief|bereavement|trauma|apology|repair trust/.test(totalBriefingSignal),
      },
      {
        id: 'confirm_concern',
        label: 'Diplomatic and careful',
        line: 'Protect the relationship while addressing the real issue.',
        compatible: true,
      },
      {
        id: 'confirm_timeline',
        label: 'Concise and time-aware',
        line: 'Keep the conversation focused on timing, next steps, and decisions.',
        compatible: !/therapy|grief|bereavement/.test(totalBriefingSignal),
      },
      {
        id: 'other',
        label: 'Describe your approach',
        line: 'Tell GEORGE how you want to show up in this conversation.',
        compatible: true,
      },
    ]

    const visibleLiveApproachOptions = liveApproachOptions.filter((option) => option.compatible)
    const selectedLiveApproach =
      liveApproachOptions.find((option) => option.id === liveRoomObjectiveOption)

    const customApproach = customLiveRoomObjective.trim()
    const approachText =
      liveRoomObjectiveOption === 'other'
        ? customApproach
        : selectedLiveApproach?.label || ''

    const unlawfulOrPhysicalThreat =
      /(?:physically|violence|violent|hurt|harm|attack|assault|kill|weapon|blackmail|extort|illegal threat|unlawful threat)/i.test(
        customApproach
      )

    const likelyOutcomeConflict =
      /preserve|repair|trust|relationship|de-escalat|reassur/i.test(totalBriefingSignal) &&
      /humiliat|bully|hostile|cruel|destroy|embarrass/i.test(customApproach)

    const approachInterpretation =
      liveRoomObjectiveOption === 'other'
        ? customApproach
          ? `GEORGE understands that you want to approach this conversation as: ${customApproach}`
          : 'Describe the approach you want GEORGE to understand.'
        : selectedLiveApproach
          ? `${selectedLiveApproach.label}. ${selectedLiveApproach.line}`
          : 'Choose an approach or describe your own.'

    const approachReady =
      Boolean(approachText) &&
      !unlawfulOrPhysicalThreat &&
      !likelyOutcomeConflict &&
      liveApproachConfirmed

    return (
      <PanelShell
        label="BRIEF ROOM · FINAL CHECK"
        title={liveReadyAccepted ? 'You’re ready' : 'Choose your approach'}
        stage={3}
        onBack={() => {
          setLiveRoomMoreOpen(false)
          setLiveApproachEditing(true)
          setLiveApproachConfirmed(false)
          setLiveBriefingStep(2)
        }}
      >
        {liveReadyAccepted ? (
          <div className="mt-5 live-controls-orientation">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
              LIVE controls
            </div>
            <p className="mt-2 text-[12px] leading-5 text-[#D7DBE4]/48">
              These controls will be available in the conversation. They are shown here for orientation only.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ['conversation', 'Conversation', 'Open the conversation record when available.'],
                ['reading', 'Reading', 'Make more room for discreet visual guidance.'],
                ['repeat', 'Repeat', 'Hear or see the last line again.'],
                ['support', 'Support', 'Change how GEORGE delivers help.'],
                ['pause', 'Pause', 'Pause or resume LIVE listening.'],
                ['audio', 'Audio', 'Turn spoken guidance on or off.'],
              ].map(([kind, label, instruction]) => (
                <div
                  key={kind}
                  aria-disabled="true"
                  className="rounded-[1rem] border border-white/[0.065] bg-white/[0.018] px-3 py-3 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/[0.07] bg-white/[0.02] text-[#D7E8EF]/82">
                    <LiveOrientationIcon kind={kind as LiveOrientationIconKind} />
                  </div>
                  <div className="mt-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/68">
                    {label}
                  </div>
                  <div className="mt-1.5 text-[10px] leading-4 text-white/36">
                    {instruction}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-5 transition-[opacity,transform] duration-500 ${
                liveControlsOrientationSeen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-2 opacity-0'
              }`}
            >
              <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/62">
                Let&apos;s go to work.
              </div>
            </div>

            {liveControlsEntryReady && (
              <AwakeButton
                active={liveReadinessComplete}
                onClick={() => startLive(false, editableResources, true)}
              >
                ENTER LIVE
              </AwakeButton>
            )}

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setLiveApproachEditing(false)
                  setLiveApproachConfirmed(false)
                  confirmReadyRoomAcknowledgement(false)
                }}
                className="text-center text-[9px] uppercase tracking-[0.16em] text-white/28 transition hover:text-white/52"
              >
                Back to Review
              </button>
            </div>

            <style jsx>{`
              @keyframes liveControlsOrientationIn {
                from {
                  opacity: 0;
                  transform: translateY(14px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .live-controls-orientation {
                animation: liveControlsOrientationIn 520ms
                  cubic-bezier(0.22, 0.72, 0.18, 1) both;
              }
            `}</style>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-[1rem] border border-white/[0.07] bg-[#090B10]/80 p-4">
              {!liveApproachEditing && approachText ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">
                      Approach
                    </div>
                    <div className="mt-2 text-[13px] font-semibold leading-5 text-[#F2F4FF]/84">
                      {approachText}
                    </div>
                    <div className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/46">
                      {approachInterpretation}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLiveApproachEditing(true)
                      setLiveApproachConfirmed(false)
                    }}
                    className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/42 transition hover:border-[#4E7CFF]/28 hover:text-[#D7DCFF]/78"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">
                    Approach
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-[#D7DBE4]/50">
                    GEORGE filtered these choices using the full briefing. Choose how you want to enter this conversation.
                  </p>

                  <div className="mt-4 divide-y divide-white/[0.05] border-y border-white/[0.05]">
                    {visibleLiveApproachOptions.map((option) => {
                      const active = liveRoomObjectiveOption === option.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setLiveRoomObjectiveOption(option.id)
                            setLiveApproachConfirmed(false)

                            if (option.id === 'other') {
                              setLiveApproachEditing(true)
                              return
                            }

                            setCustomLiveRoomObjective('')
                            setLiveApproachEditing(false)
                          }}
                          className="flex w-full items-start gap-3 py-3 text-left"
                        >
                          <span
                            className={`mt-[6px] h-2 w-2 rounded-full transition ${
                              active
                                ? 'bg-[#4E7CFF] shadow-[0_0_10px_rgba(78,124,255,0.50)]'
                                : 'bg-white/[0.14]'
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-semibold text-[#F2F4FF]/84">
                              {option.label}
                            </span>
                            <span className="mt-1 block text-[11px] leading-4 text-[#D7DBE4]/44">
                              {option.line}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {liveRoomObjectiveOption === 'other' && (
                    <label className="mt-4 block">
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-white/28">
                        Describe your approach
                      </span>
                      <textarea
                        value={customLiveRoomObjective}
                        onChange={(event) => {
                          setCustomLiveRoomObjective(event.target.value)
                          setLiveApproachConfirmed(false)
                        }}
                        onBlur={() => {
                          if (customLiveRoomObjective.trim()) {
                            setLiveApproachEditing(false)
                          }
                        }}
                        rows={3}
                        placeholder="For example: I want to be firm without making them defensive."
                        className="mt-2 w-full resize-none rounded-[0.8rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2.5 text-[13px] leading-6 text-[#D7DBE4]/78 outline-none placeholder:text-white/20 focus:border-[#4E7CFF]/42 focus:bg-[#4E7CFF]/[0.035]"
                      />
                    </label>
                  )}

                  <div
                    className={`mt-4 rounded-[0.8rem] border px-3.5 py-3 ${
                      unlawfulOrPhysicalThreat || likelyOutcomeConflict
                        ? 'border-amber-300/20 bg-amber-300/[0.045]'
                        : approachText
                          ? 'border-[#4E7CFF]/20 bg-[#4E7CFF]/[0.045]'
                          : 'border-white/[0.055] bg-white/[0.015]'
                    }`}
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                      GEORGE understands
                    </div>
                    <div className="mt-2 text-[11.5px] leading-5 text-[#D7DBE4]/58">
                      {unlawfulOrPhysicalThreat
                        ? 'Lawful strategic pressure is permitted. Physical threats, unlawful coercion, blackmail, and illegal intimidation are not. Revise the approach before LIVE.'
                        : likelyOutcomeConflict
                          ? 'This approach appears to conflict with the briefing objective. Clarify or revise it before LIVE.'
                          : approachInterpretation}
                    </div>
                  </div>
                </>
              )}
            </div>

            <label
              className={`mt-4 flex cursor-pointer items-start gap-3 rounded-[0.9rem] border px-4 py-3 transition ${
                approachReady
                  ? 'border-[#D7DCFF]/28 bg-[#D7DCFF]/[0.06] text-[#F2F4FF]/86'
                  : 'border-white/[0.08] bg-[#080A10]/[0.52] text-[#D7DBE4]/58'
              }`}
            >
              <input
                type="checkbox"
                checked={liveApproachConfirmed}
                disabled={!approachText || unlawfulOrPhysicalThreat || likelyOutcomeConflict}
                onChange={(event) => setLiveApproachConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#D7DCFF] disabled:opacity-30"
              />
              <span className="text-[12px] leading-5">
                I confirm that this reflects how I want GEORGE to support my approach in this conversation.
              </span>
            </label>

            <AwakeButton
              active={approachReady}
              onClick={() => confirmReadyRoomAcknowledgement(true)}
            >
              Show LIVE controls
            </AwakeButton>
          </>
        )}
      </PanelShell>
    )
  }

  if (showQuickLiveSetup) {
    const quickLiveOptions: Array<{
      id: LiveBriefingSupportPanelId | 'recommended'
      label: string
      line: string
      detail: string
    }> = [
      {
        id: 'recommended',
        label: 'Recommended',
        line: 'I choose support based on the room.',
        detail: 'I will start with brief cues and adapt support as I hear more signal from the conversation.',
      },
      {
        id: 'advice',
        label: 'Cue',
        line: 'Brief support delivered at the right moment.',
        detail: 'I provide short signals that help you recognize opportunities, avoid mistakes, recover your train of thought, identify risks, or decide what to do next.',
      },
      {
        id: 'completion',
        label: 'Continuation',
        line: 'I help continue your thought.',
        detail: 'Say 4–5 words and pause. I will continue the thought while preserving your point and objective.',
      },
      {
        id: 'response',
        label: 'Response',
        line: 'I provide a complete answer.',
        detail: 'Useful when answering questions, handling objections, responding under pressure, or discussing unfamiliar topics. I provide a complete response you can adapt, repeat, hear, or read.',
      },
      {
        id: 'presentation',
        label: 'Presentation',
        line: 'I help organize and deliver information.',
        detail: 'Useful when explaining ideas, presenting proposals, or walking someone through a topic. I structure information into a clear, easy-to-follow sequence.',
      },
    ]

    const steeringRows: Array<{ key: string; label: string }> = [
      { key: 'buyTime', label: 'Buy time' },
      { key: 'clarify', label: 'Clarify' },
      { key: 'expand', label: 'Expand' },
      { key: 'changeDirection', label: 'Change direction' },
      { key: 'slowDown', label: 'Slow down' },
    ]

    const updateQuickLiveSteeringPhrase = (key: string, value: string) => {
      setQuickLiveSteeringPhrases((current) => {
        const next = {
          ...current,
          [key]: value,
        }

        try {
          window.localStorage.setItem('GEORGE_LIVE_STEERING_PHRASES', JSON.stringify(next))
        } catch {}

        return next
      })
    }

    const selectQuickLiveSupport = (style: LiveBriefingSupportPanelId | 'recommended') => {
      const savedStyle = style === 'recommended' ? 'advice' : style
      const runtimeSupportStyle = toRuntimeSupportStyle(savedStyle)

      setQuickLiveSupportStyle(savedStyle)
      setQuickLiveExpandedSupport(style)
      setQuickLiveSteeringOpen(false)
      setSelectedSupportStyle(normalizeLiveSupportStyle(runtimeSupportStyle))

      try {
        window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', runtimeSupportStyle)
        window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', runtimeSupportStyle)
        window.localStorage.setItem('george_live_entry_support_preference', savedStyle)
        window.localStorage.setItem('george_live_entry_support_default', savedStyle)
      } catch {}
    }

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
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">QUICK LIVE</div>

            <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-white/92 md:text-[40px]">
              How should I support you?
            </h1>

            <p className="mt-3 text-[14px] leading-6 text-white/46">
              Choose how I should start supporting you. You can change this later.
            </p>

            <div className="mt-5 overflow-hidden transition-all duration-300 max-h-[620px] opacity-100">
              <div className="divide-y divide-white/[0.055] border-y border-white/[0.055]">
              {quickLiveOptions.map((option) => {
                const active =
                  option.id === 'recommended'
                    ? quickLiveExpandedSupport === 'recommended'
                    : quickLiveExpandedSupport !== 'recommended' && quickLiveSupportStyle === option.id
                const open = quickLiveExpandedSupport === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectQuickLiveSupport(option.id)}
                    className="w-full py-3 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-[6px] h-2 w-2 rounded-full transition ${
                        active
                          ? 'bg-[#4E7CFF] shadow-[0_0_10px_rgba(78,124,255,0.50)]'
                          : 'bg-white/[0.14]'
                      }`} />

                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-[#F2F4FF]/84">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[11px] leading-4 text-[#D7DBE4]/44">
                          {option.line}
                        </span>

                        <span className={`block overflow-hidden transition-all duration-300 ${
                          open ? 'max-h-44 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <span className="mt-3 block border-l border-[#4E7CFF]/24 pl-3 text-[11px] leading-5 text-[#D7DBE4]/52">
                            {option.detail}
                          </span>
                        </span>
                      </span>
                    </div>
                  </button>
                )
              })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setQuickLiveSteeringOpen((open) => {
                  return !open
                })
              }}
              className="mt-4 w-full rounded-[0.82rem] border border-white/[0.055] bg-[#080A10]/[0.42] px-3.5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D7DBE4]/58 transition hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035] hover:text-[#D7DCFF]/78"
            >
              {quickLiveSteeringOpen ? 'Hide steering' : 'View steering'}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${
              quickLiveSteeringOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="mt-3 rounded-[0.82rem] border border-white/[0.055] bg-[#080A10]/[0.42] px-3.5 py-3">
                <p className="text-[11px] leading-5 text-[#D7DBE4]/46">
                  If you are using earbuds alone, steering phrases help us adapt discreetly. You can use these defaults, edit them later, or control support directly from a phone, glasses, watch, or other visual device.
                </p>

                <div className="mt-3 divide-y divide-white/[0.045]">
                  {steeringRows.map((row) => (
                    <label key={row.key} className="grid gap-1 py-2 sm:grid-cols-[150px_1fr] sm:gap-3">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/28">
                        {row.label}
                      </span>
                      <input
                        value={quickLiveSteeringPhrases[row.key] || ''}
                        onChange={(event) => updateQuickLiveSteeringPhrase(row.key, event.target.value)}
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
    )
  }

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-black px-4 pb-10 pt-4 text-white sm:px-5 sm:pt-5">
      <div className="pointer-events-none absolute inset-0 bg-black" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-black" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="relative z-30 mx-auto w-full max-w-[640px]">
        <div className="mb-5 flex items-center gap-4">
          <BxPageHeader backLabel="" />
        </div>

      </div>

      <div className="relative z-10 mx-auto w-full max-w-[640px] pt-2">

        <section className="rounded-[1.25rem] border border-white/[0.045] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.004))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-5">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">ENTER LIVE</div>

          <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white/92 sm:text-[34px]">
            How do you want to enter?
          </h1>

          <p className="mt-2 max-w-[520px] text-[13px] leading-6 text-white/44">
            Enter immediately, brief GEORGE first, or return to Normal GEORGE to think and plan.
          </p>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={openQuickLiveSetup}
              className="rounded-[0.95rem] border border-[#4E7CFF]/28 bg-[#4E7CFF]/[0.07] px-4 py-3 text-left transition hover:border-[#4E7CFF]/44 hover:bg-[#4E7CFF]/[0.11] active:scale-[0.99]"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/84">
                Enter now
              </span>
              <span className="mt-1 block text-[13px] leading-5 text-white/58">
                Start LIVE with minimal preparation.
              </span>
              <span className="mt-2 block text-[11px] leading-5 text-white/32">
                GEORGE will learn from the room as the conversation unfolds.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOpenAISignalSurface(false)
                setCurrentOptionalSignalQuestion(null)
                setOptionalSignalLoading(false)
                setShowLiveBriefingRoom(false)
                setLiveEntryMandatoryMode(true)
                setMandatorySignalStep(0)
                setMandatorySignalInput('')
                setSelectedConversationResponsibilities([])
                setCustomConversationResponsibility('')
              }}
              className="rounded-[0.95rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-left transition hover:border-[#D7DCFF]/20 hover:bg-[#D7DCFF]/[0.045] active:scale-[0.99]"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F2F4FF]/82">
                Prepare with GEORGE
              </span>
              <span className="mt-1 block text-[13px] leading-5 text-white/58">
                Build a complete operational briefing before entering LIVE.
              </span>
              <span className="mt-2 block text-[11px] leading-5 text-white/32">
                Recommended when context, stakes, or the desired outcome require preparation.
              </span>
            </button>



            <button
              type="button"
              onClick={() => { window.location.href = "/george" }}
              className="rounded-[0.95rem] border border-[#4E7CFF]/40 bg-[#4E7CFF] px-4 py-2.5 text-left text-white shadow-[0_0_26px_rgba(78,124,255,0.20)] transition hover:bg-[#5478F0] active:scale-[0.99]"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                Normal GEORGE
              </span>
              <span className="mt-1 block text-[13px] leading-5 text-white/82">
                Think, plan, or prepare before entering LIVE.
              </span>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.08em] text-white/88">
                Open Normal GEORGE →
              </span>
            </button>

            {hasLiveSession && (
              <button
                type="button"
                onClick={() => setShowResumeConversationList(true)}
                className="rounded-[0.95rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-left transition hover:border-[#D7DCFF]/20 hover:bg-[#D7DCFF]/[0.045] active:scale-[0.99]"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F2F4FF]/76">
                  Resume Conversation
                </span>
                <span className="mt-1 block text-[12px] leading-5 text-white/52">
                  Continue an existing LIVE conversation.
                </span>
                <span className="mt-2 block text-[12px] leading-5 text-white/34">
                  GEORGE restores previous objectives, context, and conversation continuity before re-entering the room.
                </span>
              </button>
            )}
          </div>

        </section>


        {tier === 'smart' && (
          <p className="mt-2 text-center text-[12px] leading-5 text-[#D7DBE4]/36">
            LIVE access may require Intelligent or Brilliant depending on account state.
          </p>
        )}
      </div>

      <PrepRoomResourcePopup
        open={showPrepPreview}
        profile={prepRoomProfile}
        room={conversationType}
        relatedSessionTitle={relatedSessionId === 'not_related' ? null : selectedRelatedSession?.title || null}
        chairs={chair ? [chair] : chairs}
        desiredOutcome={objective}
        knownContext={knownContext}
        assistMode={liveAssistMode}
        signals={[
          liveAssistMode,
          knownContext ? 'Context received' : '',
          prepDocument ? prepDocument.name : '',
        ].filter(Boolean)}
        onClose={() => setShowPrepPreview(false)}
        onEditResource={editPrepRoomResource}
        sessionEmail={sessionEmail}
        onEnterLive={() => startLive(false, editableResources)}
      />
    </main>
  )
}
