'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import BxPageHeader from '@/components/BxPageHeader'
import { getActiveSessionForMode, getSessionsForMode, setActiveSessionIdForMode } from '@/lib/george/session/store'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'
import { getActiveRuntimeMotionContext } from '@/lib/george/operator/load-runtime-overlay'
import { PrepRoomResourcePopup } from '@/components/george/PrepRoomResourcePopup'
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

type ResourceEstimate = {
  prepSeconds: number
  runtimeMinutes: number
  estimatedCents: number
  intensity: 'Light' | 'Standard' | 'Heavy'
  resources: string[]
  reason: string
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

const OUTPUT_OPTIONS: SelectOption[] = [
  { label: 'Cues', helper: 'short directional support' },
  { label: 'Repeatable lines', helper: 'responses you can repeat or adapt' },
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

function getPrepDocumentPrompt(conversationType: string, audienceType: string) {
  if (conversationType === 'Interview') {
    return {
      label: 'Relevant document optional',
      action: 'Upload résumé',
      helper: 'Resume, job description, cover letter, or notes GEORGE should use.',
      resource: 'resume/document preload',
    }
  }

  if (conversationType === 'Boardroom') {
    return {
      label: 'Relevant document optional',
      action: 'Upload deck or memo',
      helper: 'Deck, board memo, metrics, forecast, agenda, objections, or executive notes.',
      resource: 'boardroom material preload',
    }
  }

  if (conversationType === 'Negotiation') {
    return {
      label: 'Relevant document optional',
      action: 'Upload offer or terms',
      helper: 'Offer, contract, pricing, terms, notes, or leverage points.',
      resource: 'terms/document preload',
    }
  }

  if (conversationType === 'Doctor Appointment') {
    return {
      label: 'Relevant document optional',
      action: 'Upload notes',
      helper: 'Symptoms, questions, lab notes, medications, timeline, or concerns.',
      resource: 'medical notes preload',
    }
  }

  if (conversationType === 'Sales Call') {
    return {
      label: 'Relevant document optional',
      action: 'Upload pitch notes',
      helper: 'Product notes, objection notes, pricing, offer, or prospect context.',
      resource: 'sales brief preload',
    }
  }

  if (conversationType === 'Presentation') {
    return {
      label: 'Relevant document optional',
      action: 'Upload outline',
      helper: 'Slides, outline, speaking notes, or audience context.',
      resource: 'presentation material preload',
    }
  }

  if (audienceType === 'Investor') {
    return {
      label: 'Relevant document optional',
      action: 'Upload deck or memo',
      helper: 'Pitch deck, one-pager, investor notes, traction, or risk notes.',
      resource: 'investor material preload',
    }
  }

  return {
    label: 'Relevant document optional',
    action: 'Upload context',
    helper: 'Agenda, brief, screenshot, notes, or anything GEORGE should account for.',
    resource: 'context document preload',
  }
}

const CONVERSATION_BASE: Record<string, { minutes: number; cents: number; resource: string }> = {
  Interview: { minutes: 24, cents: 21, resource: 'answer framing + proof recall' },
  Meeting: { minutes: 28, cents: 23, resource: 'decision tracking + timing cues' },
  Boardroom: { minutes: 34, cents: 36, resource: 'executive framing + metric defense cues' },
  Negotiation: { minutes: 34, cents: 34, resource: 'leverage tracking + restraint cues' },
  'Sales Call': { minutes: 30, cents: 29, resource: 'objection handling + close timing' },
  'Doctor Appointment': { minutes: 24, cents: 22, resource: 'question tracking + advocacy prompts' },
  Presentation: { minutes: 36, cents: 31, resource: 'flow support + recovery cues' },
  'Everyday Conversation': { minutes: 18, cents: 14, resource: 'tone support + clarity cues' },
}

const AUDIENCE_WEIGHT: Record<string, { cents: number; resource: string }> = {
  Executive: { cents: 5, resource: 'executive compression' },
  Investor: { cents: 8, resource: 'risk/upside framing' },
  Recruiter: { cents: 4, resource: 'fit and experience framing' },
  Customer: { cents: 4, resource: 'trust and value framing' },
  Physician: { cents: 5, resource: 'factual recall discipline' },
  'Spouse / Family': { cents: 3, resource: 'tone sensitivity' },
  Regulator: { cents: 9, resource: 'precision and compliance posture' },
  'Audience / Crowd': { cents: 6, resource: 'public clarity structure' },
}

function estimateResources({
  conversationType,
  audienceType,
  pacing,
  outputMode,
  objective,
}: {
  conversationType: string
  audienceType: string
  pacing: string
  outputMode: string
  objective: string
}): ResourceEstimate {
  const base = CONVERSATION_BASE[conversationType] || CONVERSATION_BASE.Meeting
  const audience = AUDIENCE_WEIGHT[audienceType] || AUDIENCE_WEIGHT.Executive
  const pacingCents = pacing === 'Sharp' ? 3 : pacing === 'Measured' ? 2 : 0
  const outputCents = outputMode === 'Repeatable lines' ? 4 : 1
  const objectiveCents = objective.trim().length > 20 ? 3 : 0
  const estimatedCents = base.cents + audience.cents + pacingCents + outputCents + objectiveCents
  const prepSeconds = Math.min(14, 5 + Math.ceil(estimatedCents / 9))
  const runtimeMinutes = base.minutes + (audience.cents >= 8 ? 6 : 0) + (outputMode === 'Repeatable lines' ? 3 : 0)
  const intensity = estimatedCents >= 44 ? 'Heavy' : estimatedCents >= 28 ? 'Standard' : 'Light'

  return {
    prepSeconds,
    runtimeMinutes,
    estimatedCents,
    intensity,
    resources: [
      base.resource,
      audience.resource,
      pacing === 'Sharp' ? 'compressed timing' : pacing === 'Measured' ? 'slower cue spacing' : 'balanced pacing',
      outputMode === 'Repeatable lines' ? 'repeatable line generation' : 'short cue generation',
      objective.trim().length > 20 ? 'objective-specific preload' : 'general room preload',
    ],
    reason: `${conversationType} + ${audienceType.toLowerCase()} audience requires ${intensity.toLowerCase()} runtime support.`,
  }
}

function estimateWithResources(base: ResourceEstimate, resources: string[]): ResourceEstimate {
  const delta = resources.length - base.resources.length
  const estimatedCents = Math.max(8, base.estimatedCents + delta * 3)
  const runtimeMinutes = Math.max(8, base.runtimeMinutes + delta * 2)
  const prepSeconds = Math.max(4, Math.min(16, base.prepSeconds + delta))
  const intensity = estimatedCents >= 44 ? 'Heavy' : estimatedCents >= 28 ? 'Standard' : 'Light'

  return {
    ...base,
    estimatedCents,
    runtimeMinutes,
    prepSeconds,
    intensity,
    resources,
  }
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
      mode === 'lines'
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
  children,
}: {
  label: string
  title: string
  stage: 1 | 2 | 3
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
    <main className="relative flex min-h-[100dvh] items-start justify-center overflow-y-auto bg-[#030405] px-4 py-5 text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${stageGlow}, transparent 30%), linear-gradient(180deg,#030405 0%,#07090E 48%,#030405 100%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-[560px]">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <img src="/logofav.png" alt="Bx" className="h-7 w-7 object-contain opacity-[0.94]" />
            <div className="text-[9px] uppercase tracking-[0.34em] text-white/38">
              BRANESx
            </div>
          </div>
        </div>

        <section
          className={`relative w-full overflow-hidden rounded-[1.45rem] border ${stageBorder} bg-[#080A0E]/[0.92] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48)]`}
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent" />

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
      className={`mt-5 w-full rounded-[1rem] border px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] transition ${
        active
          ? 'border-[#8FB6C9]/55 bg-[#8FB6C9]/[0.10] text-[#D7DCFF]/90 shadow-[0_0_28px_rgba(143,182,201,0.20)] hover:bg-[#8FB6C9]/[0.15] hover:text-white active:scale-[0.98]'
          : 'cursor-default border-white/[0.055] bg-white/[0.018] text-white/20'
      }`}
    >
      {children}
    </button>
  )
}



type LiveBriefingSupportPanelId = 'advice' | 'completion' | 'steering'

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
        label: 'Advice',
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
        label: 'Sentence Completion',
        defaultLine: 'Default: concise completion.',
        body: 'If you begin a thought and pause, I may offer a continuation that keeps the answer moving without inventing facts.',
        examples: [
          'You: “Here is what we need…”',
          'GEORGE: “…before we can move forward responsibly.”',
          'You can use it, reword it, or ignore it.',
        ],
        why: 'Investor rooms reward clear sequencing and controlled answers.',
      },
      {
        id: 'steering',
        label: 'Advanced Steering',
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
        label: 'Advice',
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
        label: 'Sentence Completion',
        defaultLine: 'Default: recovery completion.',
        body: 'If you begin an answer and pause, I may offer a continuation that helps you finish the thought cleanly.',
        examples: [
          'You: “The reason that mattered was…”',
          'GEORGE: “…because it showed I could make a decision under pressure.”',
          'Use it exactly, adjust it, or ignore it.',
        ],
        why: 'Unexpected questions can interrupt momentum; completion preserves continuity.',
      },
      {
        id: 'steering',
        label: 'Advanced Steering',
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
        label: 'Advice',
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
        label: 'Sentence Completion',
        defaultLine: 'Default: factual completion.',
        body: 'If you begin explaining symptoms or concerns and pause, I may offer a continuation that preserves the structure without inventing details.',
        examples: [
          'You: “What I want to understand is…”',
          'GEORGE: “…what changes after today and what I should watch for.”',
          'You remain responsible for the facts.',
        ],
        why: 'Completion should help organize facts, not create them.',
      },
      {
        id: 'steering',
        label: 'Advanced Steering',
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
        label: 'Advice',
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
        label: 'Sentence Completion',
        defaultLine: 'Default: controlled completion.',
        body: 'If you begin a position and pause, I may offer a continuation that protects the outcome without escalating unnecessarily.',
        examples: [
          'You: “Here is what I need…”',
          'GEORGE: “…before I can make a decision.”',
          'Use it, reshape it, or ignore it.',
        ],
        why: 'A clean next sentence can prevent rushed concessions.',
      },
      {
        id: 'steering',
        label: 'Advanced Steering',
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
      label: 'Advice',
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
      label: 'Sentence Completion',
      defaultLine: 'Default: sentence completion.',
      body: 'If you begin a thought and naturally pause, I may offer a continuation that keeps the conversation moving.',
      examples: [
        'You: “What matters most here…”',
        'GEORGE: “…is making sure we are solving the right problem.”',
        'Use it exactly, adjust it, or ignore it.',
      ],
      why: 'Completion gives you access to the next useful sentence without taking control.',
    },
    {
      id: 'steering',
      label: 'Advanced Steering',
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
  const [outputMode, setOutputMode] = useState('Repeatable lines')
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
  const [liveBriefingExpandedSupportPanel, setLiveBriefingExpandedSupportPanel] = useState<LiveBriefingSupportPanelId | null>(null)
  const [liveReadyAccepted, setLiveReadyAccepted] = useState(false)
  const [liveReadinessComplete, setLiveReadinessComplete] = useState(false)
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
  const [mandatorySignalStep, setMandatorySignalStep] = useState(0)
  const [mandatorySignalInput, setMandatorySignalInput] = useState('')
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

  const liveEntryMandatoryQuestions = useMemo(() => [
    {
      key: 'name',
      kicker: 'LIVE ENTRY',
      label: 'Signal 1',
      question: 'What should I call you in this room?',
      helper: 'Name, title, nickname, or whatever people in the room will recognize.',
      example: 'Lester, Mr. Sawyer, founder, Dr. Patel, Alex.',
    },
    {
      key: 'role',
      kicker: 'POSITION SIGNAL',
      label: 'Signal 2',
      question: 'What is your role in this conversation?',
      helper: 'This tells GEORGE where you stand in the room.',
      example: 'Founder, candidate, patient, manager, investor, customer.',
    },
    {
      key: 'desiredOutcome',
      kicker: 'OUTCOME SIGNAL',
      label: 'Signal 3',
      question: 'What outcome do you want from this conversation?',
      helper: 'Minimum signal for competence. More signal for excellence.',
      example: 'Secure a second meeting. Leave with a treatment plan. Get agreement on next steps.',
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

    const answer = mandatorySignalInput.trim()
    if (!answer) return false

    const key = currentMandatorySignalQuestion.key
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

    const nextStep = mandatorySignalStep + 1

    if (nextStep >= liveEntryMandatoryQuestions.length) {
      setLiveEntryMandatoryMode(false)
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
        setCurrentOptionalSignalQuestion(null)
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
    if (!showOpenAISignalSurface || currentOptionalSignalQuestion || optionalSignalLoading || optionalSignalComplete) return
    void requestNextOptionalSignalQuestion()
  }, [showOpenAISignalSurface, currentOptionalSignalQuestion?.key, optionalSignalLoading, optionalSignalComplete])

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

    Advice prioritizes truth.
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
      const acquiredSignals = JSON.parse(window.localStorage.getItem('GEORGE_PRE_LIVE_SIGNALS') || '{}') || {}
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

        setPreLiveSignals({})
        setShowOpenAISignalSurface(false)
        setShowPrepPreview(false)
        setShowLiveBriefingRoom(false)
        setLiveEntryMandatoryMode(true)
        setMandatorySignalStep(0)
        setMandatorySignalInput('')
        setObjective('')
        setKnownContext('')
        setChairs([])
        setCustomChair('')
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
      if (saved?.liveAssistMode === 'lines') setOutputMode('Repeatable lines')
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

  const liveAssistMode = outputMode === 'Repeatable lines' ? 'lines' : 'cues'

  const prepDocumentPrompt = useMemo(() => {
    return getPrepDocumentPrompt(resolvedConversationType, audienceType)
  }, [resolvedConversationType, audienceType])

  const resourceEstimate = useMemo(() => {
    const adjustedObjective = prepDocument
      ? `${objective}\n\nLoaded document: ${prepDocument.name}`
      : objective

    const estimate = estimateResources({ conversationType: resolvedConversationType, audienceType, pacing, outputMode, objective: adjustedObjective })

    if (!prepDocument) return estimate

    return {
      ...estimate,
      estimatedCents: estimate.estimatedCents + 3,
      runtimeMinutes: estimate.runtimeMinutes + 2,
      resources: Array.from(new Set([...estimate.resources, prepDocumentPrompt.resource])),
      reason: `${estimate.reason} Uploaded context adds document-aware support.`,
    }
  }, [resolvedConversationType, audienceType, pacing, outputMode, objective, prepDocument, prepDocumentPrompt.resource])

  useEffect(() => {
    setEditableResources(resourceEstimate.resources)
  }, [resolvedConversationType, audienceType, pacing, outputMode, objective, resourceEstimate.resources.join('|')])

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
      outputMode,
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
  }, [resolvedConversationType, audienceType, pacing, outputMode, objective, userPosition, knownContext, prepDocument?.summary])

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
    setShowOpenAISignalSurface(false)
    setCurrentOptionalSignalQuestion(null)
    setOptionalSignalLoading(false)
    setLiveEntryMandatoryMode(false)
    setLiveBriefingStep(1)
    setLiveBriefingToaAccepted(false)
    setLiveBriefingSupportAccepted(false)
    setLiveRecoveryAcknowledged(false)
    setLiveReadyAccepted(false)
    setLiveBriefingProofReply('')
    setLiveBriefingSttError('')
    setSpokenLiveBriefingStep(null)
    setShowLiveBriefingRoom(true)
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

    const runtimeSupport = {
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds: finalResources,
      selectedCapabilities: finalResources,
      baseRuntimeCents: finalEstimate.estimatedCents,
      capacityCents: finalEstimate.estimatedCents,
      estimatedCents: finalEstimate.estimatedCents,
      resourceEstimate: finalEstimate,
      runtimeBias: finalResources,
      audienceType,
      resolvedConversationType,
      userPosition,
      knownContext,
      chair,
      roomPackage,
      roomFormation,
      pacing,
      compactPrep: true,
      editedByUser: !skipPrep,
      prepRoomProfile,
      recoveryConstraints: liveRecoveryConstraints,
    }

    const liveSetup = {
      room: skipPrep ? 'Adaptive LIVE' : conversationType,
      audienceType,
      userPosition,
      chair,
      relatedSessionId,
      relatedSessionTitle: selectedRelatedSession?.title || null,
      knownContext,
      observedReality: knownContext,
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
      selectedCapabilityIds: finalResources,
      estimatedCents: finalEstimate.estimatedCents,
      compactPrep: true,
      prepRoomProfile,
      recoveryConstraints: liveRecoveryConstraints,
      createdAt: Date.now(),
    }

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
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          if (currentProofAudioRef.current === audio) currentProofAudioRef.current = null
          resolve()
        }

        void audio.play().catch(() => resolve())
      })
    } catch {}
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

    liveBriefingConfirmSequenceRef.current += 1
    const sequence = liveBriefingConfirmSequenceRef.current

    if (!liveBriefingToaAccepted) {
      setLiveBriefingReadyToContinue(false)

      if (!cleanBriefingValue(knownContext)) {
        liveBriefingRoomSignalEditedRef.current = false
      }

      if (liveBriefingTermsPreviouslyAcceptedRef.current) {
        liveBriefingTermsPreviouslyAcceptedRef.current = false
        liveBriefingHasReopenedEditsRef.current = true
        void speakLiveEntryLine('Take your time. I’ll stay with the room while you adjust it.')
      }

      return
    }

    liveBriefingTermsPreviouslyAcceptedRef.current = true
    setLiveBriefingReadyToContinue(false)

    void (async () => {
      const isRecheck = liveBriefingHasReopenedEditsRef.current

      if (!isRecheck) {
        await speakLiveEntryLine('Good. Hold here if the room still needs adjustment.')
        await waitForLiveEntryVoice(5000)

        if (liveBriefingConfirmSequenceRef.current !== sequence) return

        setLiveBriefingReadyToContinue(true)
        await speakLiveEntryLine("We can continue.")
        return
      }

      await speakLiveEntryLine('Alright. Check the room once more if you need to.')
      await waitForLiveEntryVoice(4000)

      if (liveBriefingConfirmSequenceRef.current !== sequence) return

      await speakLiveEntryLine('Confirm when the room is ready.')
      await waitForLiveEntryVoice(3000)

      if (liveBriefingConfirmSequenceRef.current !== sequence) return

      setLiveBriefingReadyToContinue(true)
      await speakLiveEntryLine("I’m ready when you are.")
    })()
  }, [showLiveBriefingRoom, liveBriefingStep, liveBriefingToaAccepted])

  useEffect(() => {
    if (!showLiveBriefingRoom) return
    if (spokenLiveBriefingStep === liveBriefingStep) return

    setSpokenLiveBriefingStep(liveBriefingStep)

    if (liveBriefingStep === 1) {
      const name = cleanBriefingValue(sessionEmail).split('@')[0] || 'You'
      void speakLiveEntryLine(`${name}, review the room. Edit anything that changed, then confirm responsibility before we continue.`)
    }
  }, [showLiveBriefingRoom, liveBriefingStep, spokenLiveBriefingStep, sessionEmail])

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
    void speakLiveEntryLine('I have your updates. I’ll carry them into the room.')
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
        primaryAction: 'Continue',
        canBeginLive: false,
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
          canBeginLive: hasRequiredLiveSignal,
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
            canBeginLive: hasRequiredLiveSignal,
          }
        : null

  if (liveEntryQuestionSurface) {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#06070A] px-4 py-8 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,182,201,0.075),transparent_32%),linear-gradient(180deg,#06070A_0%,#080A0F_52%,#06070A_100%)]" />

        <div className="absolute left-4 top-4 z-20">
          <img src="/logofav.png" alt="Bx" className="h-7 w-7 object-contain opacity-[0.94]" />
        </div>

        <section className="relative z-10 w-full max-w-[560px] rounded-[1.25rem] border border-[#8FB6C9]/[0.11] bg-white/[0.018] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.36)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/54">
              {liveEntryQuestionSurface.kicker}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/24">
              {liveEntryQuestionSurface.step}
            </div>
          </div>

          <h1 className="mt-3 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-white/90">
            {liveEntryQuestionSurface.canBeginLive ? 'GEORGE has enough signal.' : 'Bring GEORGE up to speed.'}
          </h1>

          <div className="mt-6 border-l border-[#AEB6FF]/24 pl-5 text-left">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/34">
              {liveEntryQuestionSurface.label}
            </div>

            <div className="mt-4 min-h-[72px] text-[22px] leading-8 tracking-[-0.02em] text-[#F2F4FF]/86">
              {liveEntryQuestionSurface.question}
              {!liveEntryQuestionSurface.loading && (
                <span className="ml-1 inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/60" />
              )}
            </div>

            <div className="mt-2 text-[13px] leading-5 text-white/42">
              {liveEntryQuestionSurface.helper}
            </div>

            {liveEntryQuestionSurface.example && (
              <div className="mt-5 rounded-[0.95rem] border border-white/[0.05] bg-white/[0.015] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/24">
                  Example
                </div>
                <div className="mt-2 text-[12.5px] leading-6 text-white/44">
                  {liveEntryQuestionSurface.example}
                </div>
              </div>
            )}

            {!liveEntryQuestionSurface.loading && (
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

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={liveEntryQuestionSurface.loading}
                onClick={() => { unlockLiveEntryVoice(); liveEntryQuestionSurface.submit() }}
                className="rounded-[0.95rem] border border-[#8FB6C9]/35 bg-[#8FB6C9]/[0.075] px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-[#D7DCFF]/88 transition hover:bg-[#8FB6C9]/[0.12] hover:text-white active:scale-[0.98] disabled:opacity-40"
              >
                {liveEntryQuestionSurface.primaryAction}
              </button>

              <button
                type="button"
                disabled={!liveEntryQuestionSurface.canBeginLive}
                onClick={() => {
                  setShowOpenAISignalSurface(false)
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
                {liveEntryQuestionSurface.canBeginLive ? 'Continue to Brief Room' : 'Add signal for LIVE'}
              </button>
            </div>
          </div>
        </section>
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
        <div className="w-full max-w-[420px] rounded-[1.25rem] border border-white/[0.05] bg-white/[0.018] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.30)]">
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

    const supportItems = buildBriefingSupport(roomLabel, audienceLabel, objectiveLabel, liveAssistMode)
    const estimatedCents = Math.max(0, Math.round(finalResourceEstimate.estimatedCents || 0))
    const proofReady = Boolean(liveBriefingProofReply.trim())

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
          title={liveBriefingToaAccepted ? 'The room has now taken shape.' : 'The room is taking shape.'}
          stage={1}
        >
          <div className="mt-5 space-y-3 rounded-[1rem] border border-[#8FB6C9]/[0.10] bg-black/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <div className="text-[13px] leading-6 text-[#D7DBE4]/64">
              Review the room. Edit anything that changed.
            </div>

            <label className="block">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Objective</div>
              <textarea
                value={objective}
                disabled={briefingInputsLocked}
                onChange={(event) => updateBriefingObjective(event.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-[0.75rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2 text-[14px] leading-6 text-[#F2F4FF]/86 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                placeholder={objectiveLabel}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Position</div>
                <input
                  value={userPosition}
                  disabled={briefingInputsLocked}
                  onChange={(event) => setUserPosition(event.target.value)}
                  className="mt-1 w-full rounded-[0.75rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2 text-[14px] text-white/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                  placeholder={positionLabel}
                />
              </label>

              <label className="block">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Audience</div>
                <input
                  value={audienceType}
                  disabled={briefingInputsLocked}
                  onChange={(event) => setAudienceType(event.target.value)}
                  className="mt-1 w-full rounded-[0.75rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2 text-[14px] text-white/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                  placeholder={audienceLabel}
                />
              </label>
            </div>

            <label className="block">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Room signal</div>
              <textarea
                value={knownContext}
                disabled={briefingInputsLocked}
                onChange={(event) => updateBriefingRoomSignal(event.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-[0.75rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2 text-[14px] leading-6 text-[#D7DBE4]/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                placeholder={observation}
              />
            </label>

            <label className="block">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/26">Secondary outcome</div>
              <textarea
                disabled={briefingInputsLocked}
                value={secondaryPosition}
                onChange={(event) => setBriefingSecondaryOutcome(event.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-[0.75rem] border border-white/[0.07] bg-white/[0.026] px-3 py-2 text-[14px] leading-6 text-[#D7DBE4]/78 outline-none transition placeholder:text-white/18 disabled:cursor-default disabled:opacity-55 disabled:cursor-default disabled:opacity-55 focus:border-[#8FB6C9]/42 focus:bg-[#8FB6C9]/[0.035]"
                placeholder="What should remain visible if the room shifts?"
              />
            </label>

            <div className="text-[12px] leading-5 text-[#8FB6C9]/70">
              Estimated LIVE support: {estimatedCents}¢
            </div>
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
              I agree to the Terms of Assistance.{' '}
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
                  className="rounded-[0.82rem] border border-white/[0.07] bg-white/[0.018] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48 transition hover:border-[#8FB6C9]/28 hover:bg-[#8FB6C9]/[0.055] hover:text-[#D7DCFF]/78 active:scale-[0.98]"
                >
                  Skip to Proof
                </button>

                {canBeginLiveFromBriefing && (
                  <button
                    type="button"
                    onClick={() => startLive(false, editableResources, true)}
                    className="rounded-[0.82rem] border border-[#8FB6C9]/28 bg-[#8FB6C9]/[0.055] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D7DCFF]/78 transition hover:border-[#8FB6C9]/42 hover:bg-[#8FB6C9]/[0.09] hover:text-white active:scale-[0.98]"
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
      const supportPanels = buildLiveBriefingSupportPanels({
        room: roomLabel,
        audience: audienceLabel,
        objective: objectiveLabel,
        position: positionLabel,
      })

      const recommendedSupportPanel =
        supportPanels.find((panel) => panel.id === 'completion') || supportPanels[0]

      const storedSupportPreference =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('george_live_entry_support_preference')
          : null

      const validStoredSupportPreference =
        storedSupportPreference === 'advice' ||
        storedSupportPreference === 'completion' ||
        storedSupportPreference === 'steering'
          ? storedSupportPreference
          : null

      const activeSupportStyle =
        liveBriefingActiveSupportStyle ||
        validStoredSupportPreference ||
        recommendedSupportPanel.id

      const activeSupportPanel =
        supportPanels.find((panel) => panel.id === activeSupportStyle) || recommendedSupportPanel

      const setActiveSupportStyle = (style: LiveBriefingSupportPanelId) => {
        setLiveBriefingActiveSupportStyle(style)

        try {
          window.localStorage.setItem('george_live_entry_support_preference', style)
          window.localStorage.setItem('george_live_entry_support_default', style)
        } catch {}
      }

      const georgeSupportItems = buildOutcomeTestedBriefingSupport({
        room: roomLabel,
        audience: audienceLabel,
        objective: objectiveLabel,
        observedReality: knownContext,
        previousPattern: '',
      })

      const confirmPrivacyAndContinue = () => {
        setLiveRecoveryAcknowledged(true)
        setLiveBriefingCapabilitiesConfirmed(true)
        setLiveBriefingExpandedSupportPanel(null)

        try {
          window.localStorage.setItem('george_live_entry_steering_seen', '1')
          window.localStorage.setItem('george_live_entry_privacy_acknowledged', '1')
          window.localStorage.setItem('george_live_entry_support_default', activeSupportPanel.id)
          window.localStorage.setItem('george_live_entry_support_preference', activeSupportPanel.id)
        } catch {}
      }

      return (
        <PanelShell label="BRIEF ROOM · CONSTRAINTS" title="Set how GEORGE supports the room." stage={2}>
          <div className="mt-3 space-y-3">
            <div className="rounded-[0.82rem] border border-white/[0.08] bg-[#10131A]/[0.92] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/48">
                Support style
              </div>

              <p className="mt-2 text-[13px] leading-5 text-[#D7DBE4]/62">
                GEORGE will use the support style that best protects the room.
              </p>

              <div className="mt-4 rounded-[0.7rem] border border-white/[0.06] bg-black/[0.16] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-[#D7DCFF]/42">
                  Recommended for this room.
                </div>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="text-[13px] font-semibold text-[#F2F4FF]/82">
                    {recommendedSupportPanel.label}
                  </div>

                  {activeSupportPanel.id === recommendedSupportPanel.id && (
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-white/46">
                      <span className="relative flex h-3 w-3">
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${liveBriefingSupportAccepted ? 'bg-[#8FB6C9]' : 'bg-white'} opacity-30`} />
                        <span className={`relative inline-flex h-3 w-3 rounded-full ${liveBriefingSupportAccepted ? 'bg-[#8FB6C9] shadow-[0_0_18px_rgba(143,182,201,0.55)]' : 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.42)]'}`} />
                      </span>
                      Active
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 divide-y divide-white/[0.055] border-t border-white/[0.055]">
                {supportPanels.map((panel) => {
                  const active = activeSupportPanel.id === panel.id
                  const open = liveBriefingExpandedSupportPanel === panel.id

                  return (
                    <div key={panel.id} className="py-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveSupportStyle(panel.id)}
                          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center"
                          aria-label={`Use ${panel.label}`}
                        >
                          {active ? (
                            <span className="relative flex h-3.5 w-3.5">
                              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${liveBriefingSupportAccepted ? 'bg-[#8FB6C9]' : 'bg-white'} opacity-30`} />
                              <span className={`relative inline-flex h-3.5 w-3.5 rounded-full ${liveBriefingSupportAccepted ? 'bg-[#8FB6C9] shadow-[0_0_18px_rgba(143,182,201,0.55)]' : 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.42)]'}`} />
                            </span>
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-white/[0.18]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveSupportStyle(panel.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className={`block text-[13px] font-semibold ${
                            active ? 'text-[#F2F4FF]/88' : 'text-[#D7DBE4]/58'
                          }`}>
                            {panel.label}
                          </span>

                          <span className="mt-0.5 block text-[11px] leading-4 text-[#D7DBE4]/36">
                            {panel.defaultLine}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setLiveBriefingExpandedSupportPanel(open ? null : panel.id)
                          }
                          className="shrink-0 px-1 text-[15px] leading-5 text-[#D7DCFF]/42"
                          aria-label={open ? `Collapse ${panel.label}` : `Expand ${panel.label}`}
                        >
                          {open ? '−' : '+'}
                        </button>
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          open ? 'mt-3 max-h-[340px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="space-y-3 border-l border-white/[0.07] pl-3">
                          <p className="text-[12px] leading-5 text-[#D7DBE4]/54">
                            {panel.body}
                          </p>

                          <div className="space-y-1.5">
                            {panel.examples.map((example) => (
                              <div key={example} className="text-[11px] leading-5 text-[#D7DBE4]/40">
                                {example}
                              </div>
                            ))}
                          </div>

                          <details>
                            <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.18em] text-[#D7DCFF]/42">
                              Why this
                            </summary>
                            <p className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/38">
                              {panel.why}
                            </p>
                          </details>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[0.72rem] border border-white/[0.055] bg-[#080A10]/[0.42] px-3.5 py-3 text-[11px] leading-5 text-[#D7DBE4]/42">
              Your choice becomes the default for future LIVE conversations until you change it.
            </div>

            {georgeSupportItems.length > 0 && (
              <div className="rounded-[0.82rem] border border-[#D7DCFF]/[0.09] bg-[#080A10]/[0.50] px-4 py-4">
                <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/48">
                  GEORGE Support · Optional
                </div>

                <p className="mt-3 text-[12px] leading-5 text-[#D7DBE4]/48">
                  These are outcome-tested signals GEORGE may watch for in the room.
                </p>

                <div className="mt-4 space-y-3">
                  {georgeSupportItems.map((item) => (
                    <div key={item.id} className="rounded-[0.7rem] border border-white/[0.055] bg-black/[0.16] px-3 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F2F4FF]/70">
                        {item.label}
                      </div>
                      <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/60">
                        {item.line}
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.18em] text-[#D7DCFF]/42">
                          Why this matters
                        </summary>
                        <p className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/38">
                          {item.why}
                        </p>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}



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
                    void speakLiveEntryLine('Good. I’ll keep this room tied to this session.')
                    return
                  }

                  setLiveRecoveryAcknowledged(false)
                  setLiveBriefingCapabilitiesConfirmed(false)
                }}
                className="mt-1 h-4 w-4 accent-[#D7DCFF]"
              />

              <span className="text-[12px] leading-5">
                I understand GEORGE should operate discreetly, and I remain responsible for the room.{' '}
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

      const name =
        cleanBriefingValue(window.localStorage.getItem('george_profile_name')) ||
        cleanBriefingValue(window.localStorage.getItem('george_user_name')) ||
        cleanBriefingValue(window.localStorage.getItem('george_name')) ||
        'Lester'

      void (async () => {
        await speakLiveEntryLine('Good. Hold here if the room still needs adjustment.')
        await waitForLiveEntryVoice(4500)

        if (liveReadyConfirmSequenceRef.current !== sequence) return

        await speakLiveEntryLine(`${name}, confirm when the room is ready.`)
        await waitForLiveEntryVoice(3000)

        if (liveReadyConfirmSequenceRef.current !== sequence) return

        setLiveReadinessComplete(true)
        await speakLiveEntryLine("Good. Enter LIVE when you are ready to carry the room.")
      })()
    }

    return (
      <PanelShell label="BRIEF ROOM · READINESS" title="Ready Room." stage={3}>
        <div className="mt-5 space-y-3 rounded-[0.82rem] border border-white/[0.08] bg-[#10131A]/[0.92] px-4 py-4 text-[13px] leading-6 text-[#D7DBE4]/68 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
          <p>Remember your earbuds.</p>
          <p>Speak normally. Be clear.</p>
          <p>Your voice I know.<br />The room I understand.</p>
          <p>If I need additional signal, I&apos;ll let you know.</p>
          <p>If the room changes, we adapt.</p>
        </div>

        <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-[0.82rem] border px-4 py-3 transition ${
          liveReadyAccepted
            ? 'border-[#D7DCFF]/28 bg-[#D7DCFF]/[0.06] text-[#F2F4FF]/86'
            : 'border-white/[0.08] bg-[#080A10]/[0.52] text-[#D7DBE4]/58 hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
        }`}>
          <input
            type="checkbox"
            checked={liveReadyAccepted}
            onChange={(event) => confirmReadyRoomAcknowledgement(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#D7DCFF]"
          />

          <span className="text-[12px] leading-5">
            I understand GEORGE will assist discreetly, and I remain responsible for what I say in the room.
          </span>
        </label>

        <AwakeButton active={liveReadinessComplete} onClick={() => startLive(false, editableResources, true)}>
          Now we go to work
        </AwakeButton>
      </PanelShell>
    )
  }

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-[#06070A] px-4 pb-24 pt-5 text-white sm:px-5 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.04),transparent_28%),linear-gradient(180deg,#06070A_0%,#080A0F_52%,#06070A_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-[linear-gradient(180deg,#06070A_0%,rgba(6,7,10,0.96)_42%,rgba(6,7,10,0.72)_68%,rgba(6,7,10,0)_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-[52vw] max-w-[760px] overflow-hidden lg:block">
        <img
          src="/frontviewstick.png"
          alt=""
          aria-hidden="true"
          className="absolute left-[-150px] top-[72px] w-[620px] select-none opacity-[0.105] blur-[0.25px] saturate-[0.82] xl:left-[-90px] xl:w-[700px]"
        />
        <div className="absolute left-[120px] top-[132px] h-[62vh] w-px bg-gradient-to-b from-transparent via-[#AEB6FF]/[0.13] to-transparent" />
        <div className="absolute left-[120px] top-[50vh] h-px w-[34vw] bg-gradient-to-r from-[#AEB6FF]/[0.13] to-transparent" />
        <div className="absolute left-[118px] top-[50vh] h-1.5 w-1.5 rounded-full bg-[#AEB6FF]/24 shadow-[0_0_22px_rgba(174,182,255,0.20)]" />
      </div>

      <div className="relative z-30 mx-auto w-full max-w-[640px]">
        <BxPageHeader backLabel="GEORGE" />

      </div>

      <div className="relative z-10 mx-auto w-full max-w-[640px] pt-2">

        <section className="rounded-[1.15rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.005))] p-3 shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:p-4">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">LIVE PREVIEW</div>

          <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-white/92 md:text-[40px]">
            GEORGE has enough signal.
          </h1>

          <p className="mt-3 text-[14px] leading-6 text-white/46">
            You can start LIVE now, but more signal betters your experience.
          </p>

          {hasLiveSession && (
            <button
              type="button"
              onClick={() => setShowResumeConversationList(true)}
              className="mt-3 w-full rounded-[0.82rem] border border-[#D7DCFF]/[0.16] bg-[#D7DCFF]/[0.055] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/76 transition hover:border-[#D7DCFF]/30 hover:bg-[#D7DCFF]/[0.10] hover:text-white"
            >
              Resume Conversation
            </button>
          )}

          {runtimeMotionContext && (
            <div className="mt-2 rounded-[0.82rem] border border-[#AEB6FF]/10 bg-[#AEB6FF]/[0.035] px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DCFF]/44">Inherited context</div>
              <div className="mt-1 text-[14px] font-medium text-white/78">{runtimeMotionContext.title}</div>
            </div>
          )}

          {contextSignalsCollapsed && !hideAcquiredMandatoryFields && (
            <div className="mt-2 rounded-[0.72rem] border border-white/[0.035] bg-black/12 px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  setContextSectionCollapsed(false)
                  setChairSectionCollapsed(false)
                }}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-white/24">Room signals</span>
                  <span className="mt-0.5 block truncate text-[12px] text-white/48">
                    {chair || 'Identity not selected'}
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">Open</span>
              </button>
            </div>
          )}

          {!contextSignalsCollapsed && !hideAcquiredMandatoryFields && (
          <div className={`${relatedSessions.length > 0 ? 'mt-2' : 'mt-3'} rounded-[0.82rem] border border-white/[0.04] bg-black/18 px-3 py-2`}>
            {chairSectionCollapsed ? (
              <button
                type="button"
                onClick={() => setChairSectionCollapsed(false)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Role / position</span>
                  <span className="mt-1 block truncate text-[13px] text-white/62">{chair || 'Not selected'}</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">Open</span>
              </button>
            ) : (
              <>
            <p className="mt-1 text-[11px] leading-5 text-white/36">Name, nickname, title, or whatever people in the room will recognize as you.</p>
<div className="text-[10px] uppercase tracking-[0.22em] text-white/24">How will the room address you?</div>
<p className="mt-1 text-[11px] leading-5 text-white/36">
  How shall I address you?
  <br />
  <br />
  Name, title, nickname, or moniker you'll use in the room.
</p>
            <label className="mt-2 block rounded-[0.72rem] border border-white/[0.035] bg-black/14 px-3 py-2">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/22">Choose role or position</span>
              <select
                value={chairs[0] || ''}
                onChange={(event) => {
                  const value = event.target.value
                  setChairs(value ? [value] : [])
                }}
                className="mt-2 w-full appearance-none bg-transparent text-[14px] text-white/72 outline-none"
              >
                <option value="" className="bg-[#090B10] text-white">Not selected</option>
                {CHAIR_OPTIONS.map((option) => (
                  <option key={option.label} value={option.label} className="bg-[#090B10] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {chairs.includes('Other') && (
              <label className="mt-2 block rounded-[0.72rem] border border-white/[0.035] bg-black/14 px-3 py-2">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-white/22">Write position</span>
                <input
                  value={customChair}
                  onChange={(event) => setCustomChair(event.target.value)}
                  placeholder={positionExamples[exampleIndex % positionExamples.length]}
                  className="mt-2 w-full caret-[#D7DCFF] bg-transparent text-[14px] text-white/72 outline-none placeholder:text-white/22"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => setChairSectionCollapsed(true)}
              className="mt-2 w-full rounded-[0.72rem] border border-[#8FB6C9]/[0.14] bg-[#8FB6C9]/[0.06] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#D7DCFF]/70 transition hover:text-white"
            >
              Done
            </button>
              </>
            )}
          </div>
          )}



          {showOpenAISignalSurface && optionalSignalLoading && (
            <div className="mt-6 max-w-[680px] border-l border-[#AEB6FF]/24 pl-5 text-left">
              <div className="text-[10px] uppercase tracking-[0.26em] text-[#AEB6FF]/48">
                Additional signal
              </div>
              <div className="mt-4 text-[16px] leading-7 text-white/54">
                GEORGE is determining the next useful signal…
              </div>
            </div>
          )}

          {showOpenAISignalSurface && currentOptionalSignalQuestion && (
            <div className="mt-6 max-w-[680px] border-l border-[#AEB6FF]/24 pl-5 text-left">
              <div className="text-[10px] uppercase tracking-[0.26em] text-[#AEB6FF]/48">
                Additional signal
              </div>

              <div className="mt-4 text-[13px] uppercase tracking-[0.2em] text-white/34">
                Optional. OpenAI determines the next useful signal.
              </div>

              <div
                key={currentOptionalSignalQuestion.key}
                className="mt-4 min-h-[64px] text-[20px] leading-8 tracking-[-0.02em] text-white/78"
              >
                {typedOptionalSignalQuestion}
                <span className="ml-1 inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/60" />
              </div>

              <div className="mt-2 text-[13px] leading-5 text-[#D7DBE4]/46">
                {currentOptionalSignalQuestion.why}
              </div>

              <div className="mt-6 flex items-center gap-5">
                <div className="relative min-h-[38px] flex-1">
                  {!optionalSignalInput.trim() && !optionalSignalInputFocused && (
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-[15px] text-white/22">
                      {typedOptionalAnswerExample}
                      <span className="ml-1 inline-block h-[16px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/50" />
                    </div>
                  )}

                  <input
                    value={optionalSignalInput}
                    onFocus={() => setOptionalSignalInputFocused(true)}
                    onBlur={() => {
                      if (!optionalSignalInput.trim()) setOptionalSignalInputFocused(false)
                    }}
                    onChange={(event) => setOptionalSignalInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        submitOptionalSignalAnswer()
                      }
                    }}
                    placeholder=""
                    className="min-h-[38px] w-full caret-[#D7DCFF] border-0 bg-transparent text-[15px] text-[#F2F4FF]/86 outline-none placeholder:text-transparent"
                  />
                </div>

                {optionalSignalInput.trim() && (
                  <button
                    type="button"
                    onClick={submitOptionalSignalAnswer}
                    className="text-[11px] uppercase tracking-[0.22em] text-[#D7DCFF]/62 transition hover:text-white active:scale-[0.98]"
                  >
                    Enter
                  </button>
                )}
              </div>

              <div className="mt-5 flex items-center gap-6">
                <button
                  type="button"
                  onClick={skipOptionalSignalQuestion}
                  className="text-[11px] uppercase tracking-[0.22em] text-white/34 transition hover:text-white/70 active:scale-[0.98]"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {optionalSignalSurfaceComplete && (
            <section className="mt-5 border-l border-[#AEB6FF]/24 pl-5">
              <div className="text-[10px] uppercase tracking-[0.26em] text-[#AEB6FF]/42">
                Room phrases
              </div>

              <div className="mt-3 text-[15px] leading-6 text-white/68">
                Use natural phrases during LIVE to subtly steer GEORGE without exposing GEORGE.
              </div>

              <label className="mt-4 flex items-start gap-3 text-[12px] leading-5 text-white/48">
                <input
                  type="checkbox"
                  checked={useRoomPhrases}
                  onChange={(event) => setUseRoomPhrases(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#8FB6C9]"
                />
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-white/28">
                    Use room phrases
                  </span>
                  If you do not add your own phrases, GEORGE will use quiet defaults you may use or ignore.
                </span>
              </label>

              {useRoomPhrases && (
                <label className="mt-5 block">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/24">
                    Phrases you could actually say
                  </span>

                  <div className="relative mt-2 min-h-[42px]">
                    {!customRoomPhrases.trim() && !roomPhraseFocused && (
                      <div className="pointer-events-none absolute inset-x-0 top-2 text-[13px] leading-6 text-white/22">
                        {typedRoomPhraseExample}
                        <span className="ml-1 inline-block h-[15px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/50" />
                      </div>
                    )}

                    <textarea
                      value={customRoomPhrases}
                      onFocus={() => setRoomPhraseFocused(true)}
                      onBlur={() => {
                        if (!customRoomPhrases.trim()) setRoomPhraseFocused(false)
                      }}
                      onChange={(event) => {
                        const value = event.target.value
                        setCustomRoomPhrases(value)
                        setControlWords(value.trim() || DEFAULT_ROOM_PHRASES.join(', '))
                      }}
                      rows={3}
                      placeholder=""
                      className="min-h-[92px] w-full resize-none caret-[#D7DCFF] bg-transparent text-[13px] leading-6 text-white/72 outline-none placeholder:text-transparent"
                    />
                  </div>

                  <div className="mt-3 text-[11px] leading-5 text-white/34">
                    Defaults include: {DEFAULT_ROOM_PHRASES.slice(0, 4).join(' · ')}
                  </div>
                </label>
              )}
            </section>
          )}

          {!hideAcquiredMandatoryFields && (
            <label className="mt-2 block rounded-[0.72rem] border border-white/[0.028] bg-black/14 px-3 py-2 backdrop-blur-md">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/22">Direction</span>
              <textarea
                id="george-desired-outcome"
                data-live-signal="desired-outcome"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                rows={2}
                placeholder={desiredOutcomeExamples[exampleIndex % desiredOutcomeExamples.length]}
                className="mt-2 w-full resize-none caret-[#D7DCFF] bg-transparent text-[15px] leading-5 text-white/76 outline-none placeholder:text-white/22"
              />
            </label>
          )}

          <details className="mt-5 rounded-[0.82rem] border border-white/[0.035] bg-black/12 px-3 py-2">
            <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.22em] text-white/34">
              Room controls
            </summary>

            <div className="mt-3 border-t border-white/[0.04] pt-3">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Output</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {OUTPUT_OPTIONS.map((option) => {
                  const active = outputMode === option.label

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setOutputMode(option.label)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                        active
                          ? 'border-[#AEB6FF]/38 bg-[#AEB6FF]/[0.08] text-white'
                          : 'border-white/[0.06] bg-white/[0.015] text-white/44 hover:text-white/72'
                      }`}
                    >
                      {option.label === 'Repeatable lines' ? 'Lines' : option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 border-t border-white/[0.04] pt-3">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Style</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMUNICATION_STYLE_OPTIONS.map((option) => {
                  const active = communicationStyle === option.label

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setCommunicationStyle(option.label)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                        active
                          ? 'border-[#AEB6FF]/38 bg-[#AEB6FF]/[0.08] text-white'
                          : 'border-white/[0.06] bg-white/[0.015] text-white/44 hover:text-white/72'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

          </details>

          <label className="mt-3 block rounded-[0.72rem] border border-[#8FB6C9]/[0.11] bg-[#8FB6C9]/[0.055] px-3 py-2 shadow-[0_10px_30px_rgba(80,130,190,0.10)] backdrop-blur-md">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/30">{prepDocumentPrompt.label}</span>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[12px] text-white/62">
                  {prepDocument ? prepDocument.name : prepDocumentPrompt.helper}
                </div>
                {prepDocument && (
                  <div className="mt-1 text-[11px] text-[#8FB6C9]/50">
                    Loaded into LIVE prep · {prepDocument.kind}
                  </div>
                )}
              </div>

              <input
                type="file"
                accept=".pdf,.docx,.txt,image/*"
                className="hidden"
                id="george-live-prep-document"
                onChange={(event) => {
                  void handlePrepDocumentUpload(event.target.files?.[0] || null)
                  event.currentTarget.value = ''
                }}
              />

              <span className="flex shrink-0 items-center gap-2">
                {prepDocument && (
                  <button
                    type="button"
                    onClick={() => setPrepDocument(null)}
                    className="text-[12px] text-white/34 transition hover:text-white/62"
                  >
                    Clear
                  </button>
                )}

                <span
                  onClick={() => document.getElementById('george-live-prep-document')?.click()}
                  className="cursor-pointer rounded-[0.8rem] border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.09] px-3 py-2 text-[12px] text-[#D7DCFF]/76 transition hover:bg-[#8FB6C9]/[0.16] hover:text-white"
                >
                  {prepDocumentReading ? 'Reading…' : prepDocumentPrompt.action}
                </span>
              </span>
            </div>
          </label>



          <div className="mt-2 flex items-center gap-2 text-[12px] leading-5 text-white/34">
            <span className="h-[5px] w-[5px] rounded-full bg-[#8FB6C9]/70 shadow-[0_0_12px_rgba(143,182,201,0.42)]" />
            <span>
              <span className="text-white/48">{loadedSummary}</span>
            </span>
          </div>

<div className="mt-5">
            <button
              type="button"
              
              onClick={() => {
                if (!hasRequiredLiveSignal) {
                  const missing = missingMandatoryLiveSignals
                    .map((signal) => signal.label)
                    .join(', ')

                  window.alert(`Add signal before LIVE: ${missing}.`)
                  return
                }

                startLive(false, editableResources)
              }}
              className={`w-full py-4 text-right text-[12px] font-semibold uppercase tracking-[0.24em] transition active:scale-[0.98] ${
                hasRequiredLiveSignal
                  ? 'text-[#D7DCFF]/92 hover:text-white'
                  : 'text-white/24'
              }`}
            >
              {hasRequiredLiveSignal ? 'Begin LIVE' : 'Add signal for LIVE'}
            </button>
          </div>

          {hasLiveSession && (
            <p className="mt-3 text-[12px] leading-5 text-white/34">
              A previous LIVE session exists. Starting LIVE creates a clean room so stale context does not bleed in.
            </p>
          )}
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
