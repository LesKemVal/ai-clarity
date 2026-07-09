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
import { LIVE_RECEIVER_PROFILE_PANELS, type LiveBriefingSupportPanelId, type LiveReceiverProfilePanelId } from '@/lib/george/capabilities/live-support-panels'
import { deriveLiveCapabilityIds } from '@/lib/george/capabilities/live-capability-registry'

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


function cleanBriefingValue(value: unknown) {
  return String(value || '').trim()
}

function titleBriefingValue(value: unknown, fallback = 'this room') {
  const clean = cleanBriefingValue(value)
  if (!clean) return fallback
  return clean
}

function buildBriefingObservation(room: string, audience: string, objective: string, context: string) {
  const signal = `${room} ${audience} ${objective} ${context}`.toLowerCase()

  if (/investor|capital|fundraising|raise|fund/.test(signal)) {
    return 'I am aware that credibility may matter before persuasion in this room.'
  }

  if (/ceo|board|executive|acquisition|strategy/.test(signal)) {
    return 'I am aware that precision, timing, and what stays unresolved may matter here.'
  }

  if (/interview|candidate|hiring|job/.test(signal)) {
    return 'I am aware that how you think may matter as much as the answer itself.'
  }

  if (/sales|client|customer|buyer/.test(signal)) {
    return 'I am aware that trust and signal may matter before pressure.'
  }

  if (/doctor|medical|patient|treatment|symptom/.test(signal)) {
    return 'I am aware that clarity and follow-through may matter more than speed.'
  }

  if (/negotiat|offer|terms|deal|price|counter/.test(signal)) {
    return 'I am aware that pressure may start shaping the language.'
  }

  return 'I am aware that the room may reveal more once the conversation begins.'
}

function buildNextBriefingBenefit(room: string, audience: string, objective: string, position: string) {
  const signal = `${room} ${audience} ${objective} ${position}`.toLowerCase()

  if (/interview|candidate|hiring|job|recruiter|amazon|warehouse|fulfillment/.test(signal)) {
    return 'The next question will help me tailor your answers to the role and what the interviewer is likely testing.'
  }

  if (/investor|capital|fundraising|raise|fund|terms|valuation/.test(signal)) {
    return 'The next question will help me anticipate objections, credibility tests, and timing pressure.'
  }

  if (/acquisition|merger|board|executive|enterprise|corporate/.test(signal)) {
    return 'The next question will help me protect precision, leverage, and decision authority in a high-consequence room.'
  }

  if (/negotiat|offer|deal|price|counter|buyer|seller/.test(signal)) {
    return 'The next question will help me recognize leverage, pressure, and better timing.'
  }

  if (/doctor|medical|patient|symptom|treatment|physician/.test(signal)) {
    return 'The next question will help me organize facts, unanswered questions, and next steps.'
  }

  if (/sales|client|customer|buyer/.test(signal)) {
    return 'The next question will help me notice trust, buying signals, objections, and moments to ask better questions.'
  }

  return 'The next question will help me make my guidance more specific to this room.'
}

function buildBriefingSupport(room: string, audience: string, objective: string, mode: string) {
  const signal = `${room} ${audience} ${objective}`.toLowerCase()

  if (/ceo|board|executive|acquisition|investor|capital|fundraising/.test(signal)) {
    return [
      'help you keep important details organized',
      'surface facts, numbers, or contradictions when they matter',
      'notice shifts in pressure, leverage, or credibility',
      'support precision without replacing your voice',
    ]
  }

  if (/interview|candidate|hiring|job/.test(signal)) {
    return [
      'help you organize your thinking under pressure',
      'notice what the interviewer may actually be testing',
      'support stronger examples when useful',
      mode === 'continue' || mode === 'response' || mode === 'presentation'
        ? 'help formulate important answers when precision matters'
        : 'keep support concise unless you ask for more',
    ]
  }

  if (/sales|client|customer|buyer/.test(signal)) {
    return [
      'notice buying signals and resistance',
      'track what the other side seems to value',
      'help you ask better questions',
      'support clarity without making you sound scripted',
    ]
  }

  if (/doctor|medical|patient|treatment|symptom/.test(signal)) {
    return [
      'help track symptoms, timelines, and unanswered questions',
      'surface details you may want to revisit',
      'support advocacy without taking over the conversation',
      'help organize decisions as information changes',
    ]
  }

  return [
    'help you notice what matters',
    'keep important details organized',
    'support precision when useful',
    'adapt as the room reveals itself',
  ]
}

function buildProofReply(input: string, objective: string, room: string) {
  const clean = cleanBriefingValue(input)
  const signal = `${clean} ${objective} ${room}`.toLowerCase()

  if (!clean) return ''

  if (/valuation|price|terms|leverage|capital|investor|fund/.test(signal)) {
    return 'Understood. Preserving momentum without losing leverage appears important here.'
  }

  if (/freeze|nervous|pressure|stumble|anxious/.test(signal)) {
    return 'Understood. Helping you organize your thinking under pressure may matter more than perfect wording.'
  }

  if (/answer|clarity|understand|doctor|medical|symptom/.test(signal)) {
    return 'Understood. Clarity, follow-through, and unanswered questions should stay visible.'
  }

  if (/trust|relationship|conflict|apology|repair/.test(signal)) {
    return 'Understood. Reducing threat and protecting trust may matter before trying to resolve everything.'
  }

  return 'Understood. I will keep that outcome visible as the conversation develops.'
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
      ? 'rgba(143,182,201,0.08)'
      : stage === 2
        ? 'rgba(143,182,201,0.12)'
        : 'rgba(174,182,255,0.16)'

  const stageBorder =
    stage === 1
      ? 'border-white/[0.055]'
      : stage === 2
        ? 'border-[#8FB6C9]/[0.12]'
        : 'border-[#AEB6FF]/[0.18]'

  return (
    <main className="relative flex min-h-[100dvh] items-start justify-center overflow-y-auto bg-black px-4 py-5 text-white">
      <div className="relative z-10 w-full max-w-[640px]">
        <div className="mb-5 flex items-center gap-4">
          <BxPageHeader
          backLabel="BACK"
          onBack={onBack}
          backHref="/george"
        />
        </div>

        <section
          className="relative mt-4 w-full overflow-hidden rounded-[28px] bg-[#050505] p-5 shadow-none  sm:p-6"
        >
          

          <div className="flex items-center justify-between gap-4">
            <div className="text-[9px] uppercase tracking-[0.32em] text-[#8FB6C9]/58">
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
          ? 'border-[#8FB6C9]/55 bg-[#8FB6C9]/[0.10] text-[#D7DCFF]/90 shadow-[0_0_28px_rgba(143,182,201,0.20)] hover:bg-[#8FB6C9]/[0.15] hover:text-white active:scale-[0.98]'
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
  const [liveBriefingToaAccepted, setLiveBriefingToaAccepted] = useState(false)
  const [liveBriefingSupportAccepted, setLiveBriefingSupportAccepted] = useState(false)
  const [liveRecoveryOptions, setLiveRecoveryOptions] = useState<LiveRecoveryOptionId[]>(DEFAULT_LIVE_RECOVERY_SELECTION)
  const [liveRecoveryAcknowledged, setLiveRecoveryAcknowledged] = useState(false)
  const [liveBriefingCapabilitiesConfirmed, setLiveBriefingCapabilitiesConfirmed] = useState(false)
  const [liveBriefingActiveSupportStyle, setLiveBriefingActiveSupportStyle] = useState<LiveBriefingSupportPanelId | null>(null)
  const [selectedReceiverProfile, setSelectedReceiverProfile] = useState<LiveReceiverProfilePanelId>('audio_only')
  const [liveBriefingOpenMechanicsPanel, setLiveBriefingOpenMechanicsPanel] = useState<'receiver' | 'speaking' | null>('receiver')
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
      ? 'Select the responsibilities you carry in this conversation.'
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
      question: 'What should I call you in this room?',
      helper: 'Name, title, nickname, or whatever people in the room will recognize.',
      example: 'Lester, Mr. Sawyer, Dr. Patel, Alex, Coach Rivera.',
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
      question: 'What is your responsibility in this conversation?',
      helper: 'Your responsibility tells GEORGE how you are expected to contribute, what authority you may have, and how best to support you.',
      example: 'Interviewee, founder, CEO, presenter, decision maker, parent, advisor, lead negotiator.',
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
        summary: 'File attached as room context. GEORGE should ask for clarification if the content is needed.',
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
      <main className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-black px-4 py-8 text-white">

        <div className="relative z-10 w-full max-w-[920px]">
          <div className="mb-5 flex items-center gap-4">
          <BxPageHeader backLabel="" />
        </div>

          <section className="relative w-full overflow-hidden rounded-[28px] bg-[#050505] p-5 shadow-none sm:p-6">
            <Image
            src="/images/live-entry/man1.png"
            alt=""
            width={420}
            height={720}
            priority
            className="pointer-events-none absolute bottom-[-8px] right-[-150px] z-20 hidden h-[520px] w-auto select-none object-contain opacity-95 lg:block"
          />

          <div className="relative z-30 max-w-[640px]">

          <div className="flex items-center justify-between gap-4">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/54">
              {liveEntryQuestionSurface.kicker}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/24">
              {liveEntryQuestionSurface.step}
            </div>
          </div>

          <h1 className="mt-3 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-white/90">
            {liveEntryQuestionSurface.readinessMessage ? "You're ready for LIVE." : liveEntryQuestionSurface.canBeginLive ? 'GEORGE has enough signal.' : 'Bring GEORGE up to speed.'}
          </h1>

          <div className="mt-6 border-l border-[#AEB6FF]/24 pl-5 text-left">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/34">
              {liveEntryQuestionSurface.label}
            </div>

            <div className={`mt-4 min-h-[72px] whitespace-pre-line ${liveEntryQuestionSurface.readinessMessage ? 'text-[17px] leading-7' : 'text-[22px] leading-8'} tracking-[-0.02em] text-[#F2F4FF]/86`}>
              {liveEntryQuestionSurface.question}
              {!liveEntryQuestionSurface.loading && !liveEntryQuestionSurface.readinessMessage && (
                <span className="ml-1 inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/60" />
              )}
            </div>

            <div className={`mt-2 text-[13px] leading-5 ${liveEntryQuestionSurface.readinessMessage ? 'text-[#8FB6C9]/72' : 'text-white/42'}`}>
              {liveEntryQuestionSurface.helper}
            </div>

            {!liveEntryQuestionSurface.readinessMessage && liveEntryQuestionSurface.example && (
              <div className="mt-5 rounded-[0.95rem] border border-white/[0.05] bg-white/[0.015] px-4 py-2.5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/24">
                  Example
                </div>
                <div className="mt-2 text-[12.5px] leading-6 text-white/44">
                  {liveEntryQuestionSurface.example}
                </div>
              </div>
            )}

            {!liveEntryQuestionSurface.loading && !liveEntryQuestionSurface.readinessMessage && currentMandatorySignalQuestion?.key === 'role' && (
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/28">
                  Suggested responsibilities
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
                            ? 'border-[#8FB6C9]/42 bg-[#8FB6C9]/[0.12] text-white'
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
                    className="mt-4 w-full border-0 border-b border-[#8FB6C9]/22 bg-transparent px-0 py-3 text-[16px] leading-7 text-[#D7DBE4]/88 outline-none placeholder:text-white/20 focus:border-[#8FB6C9]/46"
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
                className="mt-6 w-full border-0 border-b border-[#8FB6C9]/22 bg-transparent px-0 py-3 text-[18px] leading-7 text-[#D7DBE4]/88 outline-none placeholder:text-white/20 focus:border-[#8FB6C9]/46"
                placeholder="say it here..."
              />
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                disabled={liveEntryQuestionSurface.loading}
                onClick={() => { unlockLiveEntryVoice(); liveEntryQuestionSurface.submit() }}
                className="rounded-[0.95rem] border border-[#8FB6C9]/35 bg-[#8FB6C9]/[0.075] px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-[#D7DCFF]/88 transition hover:bg-[#8FB6C9]/[0.12] hover:text-white active:scale-[0.98] disabled:opacity-40"
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
                    ? 'border-[#D7DCFF]/[0.18] bg-[#D7DCFF]/[0.08] text-[#D7DCFF]/86 hover:border-[#D7DCFF]/32 hover:bg-[#D7DCFF]/[0.12] hover:text-white'
                    : 'cursor-default border-white/[0.055] bg-white/[0.018] text-white/20'
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
            LIVE uses session continuity and room context. Sign in so GEORGE can protect the room from stale or unowned context.
          </p>
          <a
            href="/george"
            className="mt-5 block rounded-[0.82rem] border border-[#8FB6C9]/[0.16] bg-[#8FB6C9]/[0.08] px-4 py-3 text-center text-[13px] font-semibold text-[#D7DCFF]/86 transition hover:bg-[#8FB6C9]/[0.14] hover:text-white"
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
      return (
        <PanelShell
          label="BRIEF ROOM · EDITABLE"
          title="Prepare Briefing"
          stage={1}
        >
          <div className="mt-4 space-y-2 rounded-[0.9rem] border border-[#8FB6C9]/[0.10] bg-black/22 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <div className="text-[11.5px] leading-5 text-[#D7DBE4]/52">
              Review the briefing. The more accurate the signal, the better GEORGE can support timing, judgment, and execution.
            </div>

            <label className="block">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Desired Outcome</div>
              <textarea
                value={objective}
                disabled={briefingInputsLocked}
                onChange={(event) => updateBriefingObjective(event.target.value)}
                rows={1}
                className="mt-1 w-full resize-none rounded-[0.72rem] border border-white/[0.07] bg-white/[0.026] px-3 py-1.5 text-[13px] leading-5 text-[#F2F4FF]/86 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                placeholder={objectiveLabel}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Your Role</div>
                <input
                  value={userPosition}
                  disabled={briefingInputsLocked}
                  onChange={(event) => setUserPosition(event.target.value)}
                  className="mt-1 w-full rounded-[0.72rem] border border-white/[0.07] bg-white/[0.026] px-3 py-1.5 text-[13px] leading-5 text-white/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                  placeholder={positionLabel}
                />
              </label>

              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Conversation With</div>
                <input
                  value={audienceType}
                  disabled={briefingInputsLocked}
                  onChange={(event) => setAudienceType(event.target.value)}
                  className="mt-1 w-full rounded-[0.72rem] border border-white/[0.07] bg-white/[0.026] px-3 py-1.5 text-[13px] leading-5 text-white/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                  placeholder={audienceLabel}
                />
              </label>
            </div>

            <label className="block">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Known Conversation Context</div>
              <textarea
                value={knownContext}
                disabled={briefingInputsLocked}
                onChange={(event) => updateBriefingRoomSignal(event.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-[0.72rem] border border-white/[0.07] bg-white/[0.026] px-3 py-1.5 text-[13px] leading-5 text-[#D7DBE4]/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                placeholder={observation}
              />
            </label>

            <label className="block">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Additional Context (Optional)</div>
              <textarea
                disabled={briefingInputsLocked}
                value={secondaryPosition}
                onChange={(event) => setBriefingSecondaryOutcome(event.target.value)}
                rows={1}
                className="mt-1 w-full resize-none rounded-[0.72rem] border border-white/[0.07] bg-white/[0.026] px-3 py-1.5 text-[13px] leading-5 text-[#D7DBE4]/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                placeholder="Optional. If empty, GEORGE treats this signal as inconclusive."
              />
              <div className="mt-1 text-[10px] leading-4 text-white/24">
                Add the next useful thing GEORGE should determine, remember, convey, watch for, or understand. Leave blank if inconclusive.
              </div>
            </label>

            {briefingUnderstandingSignals.length > 0 && (
              <div className="rounded-[0.82rem] border border-white/[0.055] bg-white/[0.018] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/30">
                  GEORGE understands
                </div>
                <div className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/48">
                  {briefingUnderstandingSignals.join(' • ')}
                </div>
              </div>
            )}

            {(briefingPreparation?.sufficientToBegin || briefingPreparation?.knownContext?.length > 0) && (
              <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.035] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-[#D7DCFF]/45">
                  Preparation memory
                </div>
                <div className="mt-2 space-y-1.5 text-[11px] leading-5 text-[#D7DBE4]/56">
                  {briefingPreparation?.opportunities?.[0] && (
                    <div>Opportunity: {briefingPreparation.opportunities[0]}</div>
                  )}
                  {briefingPreparation?.risks?.[0] && (
                    <div>Risk: {briefingPreparation.risks[0]}</div>
                  )}
                  {briefingPreparation?.reusableDocumentation?.length > 0 && (
                    <div>Reusable documentation: {briefingPreparation.reusableDocumentation.length}</div>
                  )}
                  <div>Confidence: {Math.round((briefingPreparation?.confidence || 0) * 100)}%</div>
                </div>
              </div>
            )}

            <RelevantDocumentationPanel
              recommendations={documentationRecommendations}
              document={prepDocument}
              reading={prepDocumentReading}
              onUpload={(file) => void handlePrepDocumentUpload(file)}
              onRemove={() => setPrepDocument(null)}
            />

          </div>

          <label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-[1rem] border px-4 py-2.5 transition ${
            liveBriefingToaAccepted
              ? 'border-[#D7DCFF]/70 bg-[#8FB6C9]/[0.12] shadow-[0_0_34px_rgba(174,182,255,0.28)]'
              : 'border-[#8FB6C9]/36 bg-[#8FB6C9]/[0.035]'
          }`}>
            <input
              type="checkbox"
              checked={liveBriefingToaAccepted}
              onChange={(event) => { unlockLiveEntryVoice(); setLiveBriefingToaAccepted(event.target.checked) }}
              className="mt-1 h-4 w-4 accent-[#8FB6C9]"
            />
            <span className="text-[12.5px] leading-5 text-[#D7DBE4]/72">
              I’ve reviewed this briefing. It accurately reflects what I want GEORGE to understand before entering LIVE.{' '}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  window.open('/legal/toa', '_blank')
                }}
                className="text-[#D7DCFF]/72 underline underline-offset-4"
              >
                Read terms
              </button>
            </span>
          </label>

          <AwakeButton active={liveBriefingReadyToContinue} onClick={() => setLiveBriefingStep(2)}>
            Continue
          </AwakeButton>

          {liveBriefingReadyToContinue && (
            <div className="mt-4 border-t border-white/[0.05] pt-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/24">
                Qualified shortcut
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setLiveBriefingStep(3)}
                  className="rounded-[0.72rem] border border-white/[0.07] bg-white/[0.018] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/48 transition hover:border-[#8FB6C9]/28 hover:bg-[#8FB6C9]/[0.055] hover:text-[#D7DCFF]/78 active:scale-[0.98]"
                >
                  Skip to Proof
                </button>

                {canBeginLiveFromBriefing && (
                  <button
                    type="button"
                    onClick={() => startLive(false, editableResources, true)}
                    className="rounded-[0.72rem] border border-[#8FB6C9]/28 bg-[#8FB6C9]/[0.055] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D7DCFF]/78 transition hover:border-[#8FB6C9]/42 hover:bg-[#8FB6C9]/[0.09] hover:text-white active:scale-[0.98]"
                  >
                    Begin LIVE
                  </button>
                )}
              </div>
            </div>
          )}
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
          window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', 'advice')
          window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', 'advice')
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
          window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', 'advice')
          window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', 'advice')
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
            <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.16] bg-[#8FB6C9]/[0.045] px-4 py-3">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
                Receiver selected
              </div>
              <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
                {activeReceiverPanel.label}
              </div>
              <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
                Tell GEORGE how you will receive support. GEORGE adapts guidance automatically based on the room.
              </div>

              <button
                type="button"
                onClick={() => setLiveBriefingOpenMechanicsPanel(liveBriefingOpenMechanicsPanel === 'receiver' ? null : 'receiver')}
                className="mt-3 rounded-[0.65rem] border border-[#8FB6C9]/18 bg-[#8FB6C9]/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#D7DCFF]/72 transition hover:border-[#8FB6C9]/34 hover:bg-[#8FB6C9]/[0.10]"
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
                          ? 'border-[#8FB6C9]/[0.24] bg-[#8FB6C9]/[0.055]'
                          : 'border-white/[0.06] bg-white/[0.018] hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold text-[#F2F4FF]/78">
                        {panel.label}
                      </span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/36">
                        {panel.line}
                      </span>
                      {active && (
                        <span className="mt-3 block border-l border-[#8FB6C9]/24 pl-3 text-[11px] leading-5 text-[#D7DBE4]/52">
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
                    className="shrink-0 rounded-[0.65rem] border border-[#8FB6C9]/24 bg-[#8FB6C9]/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#D7DCFF]/66 transition hover:border-[#8FB6C9]/38 hover:bg-[#8FB6C9]/[0.14] hover:text-white"
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
                              ? 'border-[#8FB6C9]/[0.24] bg-[#8FB6C9]/[0.055]'
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
                  className="w-full rounded-[0.72rem] border border-[#8FB6C9]/18 bg-[#8FB6C9]/[0.05] px-3 py-2.5 text-left text-[11px] font-semibold text-[#D7DCFF]/72 transition hover:border-[#8FB6C9]/34 hover:bg-[#8FB6C9]/[0.09]"
                >
                  Choose Speaking Style
                </button>
              )}
            </div>

            <label className={`flex cursor-pointer items-start gap-3 rounded-[0.82rem] border px-4 py-3 transition ${
              liveRecoveryAcknowledged
                ? 'border-[#D7DCFF]/28 bg-[#D7DCFF]/[0.06] text-[#F2F4FF]/86'
                : 'border-white/[0.08] bg-[#080A10]/[0.52] text-[#D7DBE4]/58 hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
            }`}>
              <input
                type="checkbox"
                checked={liveRecoveryAcknowledged}
                onChange={(event) => {
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
                I understand that GEORGE is {liveTierLabel}, but I am the final authority. If GEORGE&apos;s support doesn&apos;t fit the conversation, I may ignore it, revise it, or take another approach. I understand GEORGE will adapt its support as it learns what works best for me and the conversation while helping me {liveObjectiveLabel}.{' '}
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
              </span>
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!liveRecoveryAcknowledged}
                onClick={() => setLiveBriefingStep(3)}
                className={`rounded-[0.75rem] border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                  liveRecoveryAcknowledged
                    ? 'border-[#D7DCFF]/24 bg-[#D7DCFF]/[0.055] text-[#F2F4FF]/84 hover:bg-[#D7DCFF]/[0.08]'
                    : 'cursor-default border-white/[0.05] bg-transparent text-white/20'
                }`}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => startLive(false, editableResources, true)}
                className="rounded-[0.75rem] border border-white/[0.06] bg-transparent px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/36 transition hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035] hover:text-[#D7DCFF]/72"
              >
                Begin LIVE
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
      setLiveReadinessComplete(false)

      if (!checked) return

      setLiveReadinessComplete(true)
    }

    const liveRoomObjectiveOptions: Array<{
      id: LiveRoomObjectiveOptionId
      label: string
      line: string
    }> = [
      { id: 'project_strength', label: 'Project strength', line: 'Reinforce competence, confidence, and command of the conversation.' },
      { id: 'build_trust', label: 'Build trust', line: 'Reduce doubt and help the other side feel safer moving forward.' },
      { id: 'find_leverage', label: 'Find leverage', line: 'Surface information that may improve negotiating position later.' },
      { id: 'find_common_ground', label: 'Find common ground', line: 'Identify shared interests, mutual benefit, or a path to agreement.' },
      { id: 'surface_objections', label: 'Surface objections', line: 'Listen for resistance that may not be stated directly.' },
      { id: 'confirm_authority', label: 'Confirm authority', line: 'Determine who can approve, decide, buy, hire, or move the matter forward.' },
      { id: 'confirm_concern', label: 'Confirm concern', line: 'Clarify what is really creating hesitation, risk, or resistance.' },
      { id: 'confirm_timeline', label: 'Confirm timeline', line: 'Identify urgency, deadlines, delay risk, or next-step timing.' },
      { id: 'other', label: 'Other', line: 'Tell GEORGE what else to look for, reinforce, confirm, or help acquire.' },
    ]

    const visibleLiveRoomObjectiveOptions = liveRoomObjectiveOptions.slice(0, 3)
    const moreLiveRoomObjectiveOptions = liveRoomObjectiveOptions.slice(3)

    const selectedLiveRoomObjective =
      liveRoomObjectiveOptions.find((option) => option.id === liveRoomObjectiveOption)

    const moreOpen =
      Boolean(
        selectedLiveRoomObjective &&
        moreLiveRoomObjectiveOptions.some((option) => option.id === selectedLiveRoomObjective.id)
      )

    return (
      <PanelShell
          label="BRIEF ROOM · FINAL CHECK"
          title="Before we begin"
          stage={3}
          onBack={() => setLiveBriefingStep(2)}
        >
        {liveReadyAccepted && (
          <div className="mt-5 rounded-[0.82rem] border border-[#8FB6C9]/[0.16] bg-[#8FB6C9]/[0.045] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
                  Final check confirmed
                </div>
                <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
                  {selectedLiveRoomObjective ? selectedLiveRoomObjective.label : 'No additional objective'}
                </div>
                <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
                  {selectedLiveRoomObjective
                    ? 'GEORGE will keep this room signal in mind without treating it as required.'
                    : 'GEORGE will listen, preserve credibility, and support the room as useful signal appears.'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => confirmReadyRoomAcknowledgement(false)}
                className="shrink-0 rounded-full border border-white/[0.07] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/44 transition hover:border-[#D7DCFF]/20 hover:text-[#D7DCFF]/78"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {!liveReadyAccepted && (
        <div className="mt-5 rounded-[0.82rem] border border-white/[0.08] bg-[#10131A]/[0.92] px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/46">
Final check
          </div>

          <div className="mt-3 space-y-3 text-[13px] leading-6 text-[#D7DBE4]/64">
            <p>Is there anything else?</p>
            <p>Talk naturally to everyone else. Stay focused on your objective.</p>
            <p>Use what helps. Ignore what doesn't.</p>
            <p>I'll adapt my support while we're live. Afterward, I'll show you what changed, why it changed, whether it appeared to help, and ask what you want me to remember.</p>
          </div>

          <div className="mt-5 text-[10px] uppercase tracking-[0.22em] text-white/28">
Anything I should keep in mind?
          </div>

          <div className="mt-3 divide-y divide-white/[0.055] border-y border-white/[0.055]">
            {visibleLiveRoomObjectiveOptions.map((option) => {
              const active = liveRoomObjectiveOption === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setLiveRoomObjectiveOption(active ? '' : option.id)
                    if (option.id !== 'other') setCustomLiveRoomObjective('')
                  }}
                  className="w-full py-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-[6px] h-2 w-2 rounded-full transition ${
                      active
                        ? 'bg-[#8FB6C9] shadow-[0_0_10px_rgba(52,211,153,0.50)]'
                        : 'bg-white/[0.14]'
                    }`} />

                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-[#F2F4FF]/84">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-[#D7DBE4]/44">
                        {option.line}
                      </span>
                    </span>
                  </div>
                </button>
              )
            })}

            <details className="group" open={moreOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-left">
                <span>
                  <span className="block text-[12px] font-semibold text-[#F2F4FF]/84">
                    More
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-[#D7DBE4]/44">
                    Additional intangible objectives.
                  </span>
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/30 group-open:text-[#D7DCFF]/56">
                  {moreOpen ? 'Open' : 'More'}
                </span>
              </summary>

              <div className="divide-y divide-white/[0.055] border-t border-white/[0.055]">
                {moreLiveRoomObjectiveOptions.map((option) => {
                  const active = liveRoomObjectiveOption === option.id

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setLiveRoomObjectiveOption(active ? '' : option.id)
                        if (option.id !== 'other') setCustomLiveRoomObjective('')
                      }}
                      className="w-full py-3 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-[6px] h-2 w-2 rounded-full transition ${
                          active
                            ? 'bg-[#8FB6C9] shadow-[0_0_10px_rgba(52,211,153,0.50)]'
                            : 'bg-white/[0.14]'
                        }`} />

                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold text-[#F2F4FF]/84">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-[#D7DBE4]/44">
                            {option.line}
                          </span>
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </details>
          </div>

          {liveRoomObjectiveOption === 'other' && (
            <label className="mt-4 block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/28">
                Other
              </span>
              <textarea
                value={customLiveRoomObjective}
                onChange={(event) => setCustomLiveRoomObjective(event.target.value)}
                rows={3}
                placeholder="What should GEORGE help surface, reinforce, confirm, learn, or acquire?"
                className="mt-2 w-full resize-none rounded-[0.72rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2 text-[13px] leading-6 text-[#D7DBE4]/78 outline-none placeholder:text-white/20 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
              />
            </label>
          )}

          <div className="mt-4 rounded-[0.72rem] border border-white/[0.055] bg-[#080A10]/[0.42] px-3.5 py-3 text-[11px] leading-5 text-[#D7DBE4]/46">
            {selectedLiveRoomObjective
              ? `GEORGE will treat “${selectedLiveRoomObjective.label}” as an additional intangible objective. If it conflicts with the outcome, GEORGE should protect the primary outcome first.`
              : 'No intangible objective selected. GEORGE will focus on the desired outcome and adapt if useful signal appears.'}
          </div>
        </div>
        )}

        {!liveReadyAccepted && (
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[0.82rem] border border-white/[0.08] bg-[#080A10]/[0.52] px-4 py-3 text-[#D7DBE4]/58 transition hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]">
          <input
            type="checkbox"
            checked={liveReadyAccepted}
            onChange={(event) => confirmReadyRoomAcknowledgement(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#D7DCFF]"
          />

          <span className="text-[12px] leading-5">
{selectedLiveRoomObjective
              ? `I understand that GEORGE will keep “${selectedLiveRoomObjective.label}” in mind during this room without treating it as required or replacing the primary outcome.`
              : 'I understand that I do not need to add anything else. GEORGE will listen, preserve credibility, and support me as the room develops.'}
          </span>
        </label>
        )}

        <AwakeButton active={liveReadinessComplete} onClick={() => startLive(false, editableResources, true)}>
          Now we go to work
        </AwakeButton>
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

        <div className="relative z-10 mx-auto w-full max-w-[640px] pt-2">
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
                          ? 'bg-[#8FB6C9] shadow-[0_0_10px_rgba(52,211,153,0.50)]'
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
                          <span className="mt-3 block border-l border-[#8FB6C9]/24 pl-3 text-[11px] leading-5 text-[#D7DBE4]/52">
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
                        className="w-full rounded-[0.58rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] leading-5 text-[#D7DBE4]/70 outline-none transition placeholder:text-white/20 focus:border-[#8FB6C9]/24 focus:bg-[#8FB6C9]/[0.035]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startQuickLive}
              className="mt-5 w-full rounded-[0.95rem] border border-[#8FB6C9]/35 bg-[#8FB6C9]/[0.075] px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-[#D7DCFF]/88 transition hover:bg-[#8FB6C9]/[0.12] hover:text-white active:scale-[0.98]"
            >
              Let&apos;s go to work
            </button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-black px-4 pb-24 pt-5 text-white sm:px-5 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-black" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-black" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="relative z-30 mx-auto w-full max-w-[640px]">
        <div className="mb-5 flex items-center gap-4">
          <BxPageHeader backLabel="" />
        </div>

      </div>

      <div className="relative z-10 mx-auto w-full max-w-[640px] pt-2">

        <section className="rounded-[1.15rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.005))] p-3 shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:p-4">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">LIVE</div>

          <h1 className="mt-6 text-[34px] font-light uppercase leading-none tracking-[0.44em] text-[#D7DCFF]/82 sm:text-[44px]">
            <span className="inline-block animate-[liveWordPulse_3.8s_ease-in-out_infinite]">
              LIVE
            </span>
          </h1>

          <style jsx>{`
            @keyframes liveEntryScenarioTrack {
              0%, 7% { transform: translateY(0); }
              10%, 17% { transform: translateY(-210px); }
              20%, 27% { transform: translateY(-420px); }
              30%, 37% { transform: translateY(-630px); }
              40%, 47% { transform: translateY(-840px); }
              50%, 57% { transform: translateY(-1050px); }
              60%, 67% { transform: translateY(-1260px); }
              70%, 77% { transform: translateY(-1470px); }
              80%, 87% { transform: translateY(-1680px); }
              90%, 97% { transform: translateY(-1890px); }
              100% { transform: translateY(-2100px); }
            }
              18%, 100% { transform: scale(1); }
            }

            @keyframes liveWordPulse {
              0%, 100% {
                opacity: 0.72;
                text-shadow: 0 0 0 rgba(215, 220, 255, 0);
              }
              50% {
                opacity: 0.96;
                text-shadow: 0 0 18px rgba(174, 182, 255, 0.22);
              }
            }
          `}</style>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={openQuickLiveSetup}
              className="rounded-[0.95rem] border border-[#8FB6C9]/28 bg-[#8FB6C9]/[0.07] px-4 py-3 text-left transition hover:border-[#8FB6C9]/44 hover:bg-[#8FB6C9]/[0.11] active:scale-[0.99]"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/84">
                Quick LIVE
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-white/56">
                Enter LIVE immediately with minimal setup.
              </span>
              <span className="mt-2 block text-[12px] leading-5 text-white/34">
                Best when the conversation is less complex or when the user prefers to brief GEORGE organically as the conversation unfolds.
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
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F2F4FF]/76">
                Brief GEORGE
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-white/52">
                Brief GEORGE when your conversation requires complexity or specific context.
              </span>
              <span className="mt-2 block text-[12px] leading-5 text-white/34">
                Negotiations • Presentations • Board Meetings • Investor Meetings • Performance Reviews • Interviews • You Decide
              </span>
            </button>



            <button
              type="button"
              onClick={() => { window.location.href = "/george" }}
              className="rounded-[0.95rem] border border-[#6F86FF]/40 bg-[#4169E1] px-4 py-2.5 text-left text-white shadow-[0_0_26px_rgba(65,105,225,0.20)] transition hover:bg-[#5478F0] active:scale-[0.99]"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                Ask GEORGE
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-white/78">
                Think before you enter LIVE.
              </span>
              <span className="mt-3 inline-flex items-center text-[12px] font-medium tracking-[0.08em] text-white">
                Plan with GEORGE →
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
      <div className="pointer-events-none relative z-[12] mt-2 px-8 md:pointer-events-none md:fixed md:mt-0 md:px-0 md:left-[calc(50vw+365px)] md:top-[180px] md:w-[380px] lg:left-[calc(50vw+380px)] xl:left-[calc(50vw+400px)]">
        <div className="overflow-hidden bg-black/0 px-1 py-1 [mask-image:linear-gradient(180deg,transparent,black_10%,black_82%,transparent)]">
          <div className="relative h-[174px] overflow-hidden md:h-[280px]">
            <div className="absolute left-0 right-0 top-0 animate-[liveEntryScenarioTrack_90s_linear_infinite]">
              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">VC Meeting</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">VC: Why now?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Lead with timing.</div>
                  <div className="text-[#D7DBE4]/62">YOU: The market changed after Q2.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Anchor demand signal.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Customers are already pulling us forward.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Negotiation</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">BRAND: We need exclusivity.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Protect optionality.</div>
                  <div className="text-[#D7DBE4]/62">YOU: I can offer category exclusivity.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Ask for term limit.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Tie it to 60 days and performance.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Job Interview</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">INTERVIEWER: Why should we trust your judgment?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Pause. Lead with outcome.</div>
                  <div className="text-[#D7DBE4]/62">YOU: The strongest proof is what changed.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Anchor measurable result.</div>
                  <div className="text-[#D7DBE4]/62">YOU: I improved follow-through and kept the team aligned.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Sales Call</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">CLIENT: Why is this worth changing for?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Tie pain to cost.</div>
                  <div className="text-[#D7DBE4]/62">YOU: The real cost is delay.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Ask for decision path.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Who needs to be aligned?</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Board Meeting</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">BOARD: What changed this quarter?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Lead with signal.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Retention improved while acquisition slowed.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Separate risk from plan.</div>
                  <div className="text-[#D7DBE4]/62">YOU: The response is already underway.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Performance Review</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">MANAGER: Where did you struggle?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Own it, then show correction.</div>
                  <div className="text-[#D7DBE4]/62">YOU: I missed the signal early.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Name the adjustment.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Now I surface risk sooner.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Difficult Conversation</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">THEM: That is not fair.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Lower temperature.</div>
                  <div className="text-[#D7DBE4]/62">YOU: I hear that.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Return to shared outcome.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Let us separate impact from intent.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Presentation</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">AUDIENCE: What should we remember?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Repeat the frame.</div>
                  <div className="text-[#D7DBE4]/62">YOU: The point is simple.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Land the takeaway.</div>
                  <div className="text-[#D7DBE4]/62">YOU: This changes what we do next.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">Customer Support</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">CUSTOMER: I am frustrated.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Acknowledge first.</div>
                  <div className="text-[#D7DBE4]/62">YOU: I understand why.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Give a clear next step.</div>
                  <div className="text-[#D7DBE4]/62">YOU: Here is what I can do now.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black md:text-[10px]">You Decide</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">ROOM: The conversation shifts.</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Whatever the conversation, GEORGE has you covered.</div>
                  <div className="text-[#D7DBE4]/62">YOU: I know where to go next.</div>
                </div>
              </div>

              <div className="h-[210px]">
                <div className="text-[17px] font-semibold uppercase tracking-[0.22em] text-[#8FB6C9]/82 md:text-[16px]">VC Meeting</div>
                <div className="mt-5 space-y-3 text-[12px] leading-5 md:text-[12px]">
                  <div className="text-[#D7DBE4]/62">VC: Why now?</div>
                  <div className="text-[#D7DCFF]/78">GEORGE: Lead with timing.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
