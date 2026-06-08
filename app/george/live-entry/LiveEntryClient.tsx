'use client'

import { useEffect, useMemo, useState } from 'react'
import BxPageHeader from '@/components/BxPageHeader'
import { getActiveSessionForMode } from '@/lib/george/session/store'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'
import { getActiveRuntimeMotionContext } from '@/lib/george/operator/load-runtime-overlay'
import { PrepRoomResourcePopup } from '@/components/george/PrepRoomResourcePopup'
import type { PrepRoomResourceProfile } from '@/lib/george/prep-room/resources'
import { deriveRoomFormation } from '@/lib/george/live/prep-room'

type Tier = 'smart' | 'intelligent' | 'brilliant'

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
          <option key={option.label} value={option.label} className="bg-[#090B10] text-white">
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
  const [showPrepPreview, setShowPrepPreview] = useState(false)
  const [editableResources, setEditableResources] = useState<string[]>([])
  const [customResource, setCustomResource] = useState('')
  const [runtimeMotionContext, setRuntimeMotionContext] = useState<any>(null)
  const [prepRoomProfile, setPrepRoomProfile] = useState<PrepRoomResourceProfile | null>(null)
  const [preLiveSignals, setPreLiveSignals] = useState<Record<string, string>>({})
  const [optionalSignalStep, setOptionalSignalStep] = useState(0)
  const [optionalSignalInput, setOptionalSignalInput] = useState('')
  const [typedOptionalAnswerExample, setTypedOptionalAnswerExample] = useState('')
  const [optionalSignalInputFocused, setOptionalSignalInputFocused] = useState(false)
  const [optionalSignalAnswers, setOptionalSignalAnswers] = useState<Record<string, string>>({})
  const [showOpenAISignalSurface, setShowOpenAISignalSurface] = useState(false)
  const [typedOptionalSignalQuestion, setTypedOptionalSignalQuestion] = useState('')
  const [exampleIndex, setExampleIndex] = useState(0)
  const [preLivePreviewReady, setPreLivePreviewReady] = useState(false)
  const [founderAccessReady, setFounderAccessReady] = useState(false)

  const toggleChair = (value: string) => {
    setChairs((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value)
        return next.length ? next : current
      }

      return [...current, value]
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

  const contextSignalsCollapsed = chairSectionCollapsed

  const groundingSignalAvailable =
    knownContext.trim().length > 0 ||
    Boolean(prepDocument) ||
    Boolean(runtimeMotionContext) ||
    relatedSessionId !== 'not_related'

  const optionalOpenAISignalQuestions = useMemo(() => {
    const role = String(preLiveSignals.role || '').toLowerCase()

    const base = [
      {
        key: 'primaryConcern',
        kicker: 'Optional OpenAI signal',
        label: 'Additional signal',
        question: role.includes('patient')
          ? 'What must not be missed in this appointment?'
          : role.includes('interview')
            ? 'What concern or objection do you want GEORGE ready for?'
            : role.includes('founder') || role.includes('ceo')
              ? 'What objection, pressure, or risk do you expect?'
              : 'What concern should GEORGE be ready for?',
        examples: 'Answer if useful, or skip.',
      },
      {
        key: 'avoid',
        kicker: 'Optional OpenAI signal',
        label: 'Boundary',
        question: 'Is there anything GEORGE should avoid saying or doing in this conversation?',
        examples: 'Tone, topics, claims, pressure, promises, or anything sensitive.',
      },
      {
        key: 'successSignal',
        kicker: 'Optional OpenAI signal',
        label: 'Success signal',
        question: 'What would tell you this conversation is going well?',
        examples: 'A yes, a second meeting, a clearer answer, calmer tone, agreement, or useful information.',
      },
    ]

    return base.filter((question) => !preLiveSignals[question.key] && !optionalSignalAnswers[question.key])
  }, [preLiveSignals, optionalSignalAnswers])

  const currentOptionalSignalQuestion = showOpenAISignalSurface
    ? optionalOpenAISignalQuestions[optionalSignalStep] || null
    : null

  const optionalAnswerExamples = [
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
    showOpenAISignalSurface && optionalOpenAISignalQuestions.length === 0

  const hasGeorgeSurfaceSignals = Object.keys(preLiveSignals).length > 0
  const hideAcquiredMandatoryFields = hasGeorgeSurfaceSignals
  useEffect(() => {
    const timer = window.setInterval(() => {
      setExampleIndex((index) => index + 1)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

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

    if (optionalSignalStep + 1 >= optionalOpenAISignalQuestions.length) {
      setShowOpenAISignalSurface(false)
      setOptionalSignalStep(0)
      return true
    }

    setOptionalSignalStep((step) => step + 1)
    return true
  }

  const skipOptionalSignalQuestion = () => {
    if (optionalSignalStep + 1 >= optionalOpenAISignalQuestions.length) {
      setShowOpenAISignalSurface(false)
      setOptionalSignalStep(0)
      return
    }

    setOptionalSignalStep((step) => step + 1)
  }

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

      if (acquiredSignals.role) {
        const normalizedRole = String(acquiredSignals.role).trim()
        const knownChair = CHAIR_OPTIONS.some((option) => option.label.toLowerCase() === normalizedRole.toLowerCase())
        if (knownChair) {
          const matched = CHAIR_OPTIONS.find((option) => option.label.toLowerCase() === normalizedRole.toLowerCase())
          setChairs(matched ? [matched.label] : [])
        } else {
          setChairs(['Other'])
          setCustomChair(normalizedRole)
        }
        setChairSectionCollapsed(true)
      }

      if (acquiredSignals.desiredOutcome && !objective.trim()) {
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
      const acquiredSignalsForAccess = JSON.parse(window.localStorage.getItem('GEORGE_PRE_LIVE_SIGNALS') || '{}') || {}

      const isFreshLiveStart =
        window.localStorage.getItem('george_start_new_live') === '1' ||
        params.get('source') === 'home' ||
        params.get('source') === 'start' ||
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
      if (saved?.room) {
        const knownRoom = CONVERSATION_TYPES.some((option) => option.label === saved.room)
        setConversationType(knownRoom ? saved.room : 'Other')
        if (!knownRoom) setCustomConversationType(saved.room)
      }
      if (saved?.audienceType) setAudienceType(saved.audienceType)
      if (saved?.cadence) setPacing(saved.cadence)
      if (saved?.liveAssistMode === 'lines') setOutputMode('Repeatable lines')
      if (saved?.userPosition) setUserPosition(saved.userPosition)
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

  const startLive = (skipPrep = false, resources = editableResources) => {
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
      createdAt: Date.now(),
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

  if (!ready) return null

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

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-[#06070A] px-4 pb-24 pt-5 text-white sm:px-5 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.04),transparent_28%),linear-gradient(180deg,#06070A_0%,#080A0F_52%,#06070A_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[640px]">
        <BxPageHeader backLabel="GEORGE" />

        <section className="rounded-[1.15rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.005))] p-3 shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:p-4">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">LIVE PREVIEW</div>

          <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-white/92 md:text-[40px]">
            GEORGE has enough signal.
          </h1>

          <p className="mt-3 text-[14px] leading-6 text-white/46">
            You can start LIVE now.
          </p>

          {objective.trim() && (
            <div className="mt-3 rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.045] px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DCFF]/44">Current Direction</div>
              <div className="mt-1 text-[14px] font-medium leading-5 text-white/78">{objective.trim()}</div>
            </div>
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



          {showOpenAISignalSurface && currentOptionalSignalQuestion && (
            <div className="mt-6 max-w-[680px] border-l border-[#AEB6FF]/24 pl-5 text-left">
              <div className="text-[10px] uppercase tracking-[0.26em] text-[#AEB6FF]/48">
                Additional signal
              </div>

              <div className="mt-4 text-[13px] uppercase tracking-[0.2em] text-white/34">
                Optional.
              </div>

              <div
                key={currentOptionalSignalQuestion.key}
                className="mt-4 min-h-[64px] text-[20px] leading-8 tracking-[-0.02em] text-white/78"
              >
                {typedOptionalSignalQuestion}
                <span className="ml-1 inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-[#D7DBE4]/60" />
              </div>

              <div className="mt-3 text-[13px] leading-6 text-white/38">
                {currentOptionalSignalQuestion.examples}
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
                    className="min-h-[38px] w-full caret-[#D7DCFF] border-0 bg-transparent text-[15px] text-white/82 outline-none placeholder:text-transparent"
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
                  Next signal
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

          <details className="mt-3 border-l border-[#AEB6FF]/20 pl-5">
            <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.22em] text-white/34">
              Advanced controls
            </summary>

            <div className="mt-4">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Output</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {OUTPUT_OPTIONS.map((option) => {
                  const active = outputMode === option.label

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setOutputMode(option.label)}
                      className={`border-l px-3 py-2 text-left transition ${
                        active
                          ? 'border-[#AEB6FF]/42 text-white'
                          : 'border-white/[0.08] text-white/42 hover:text-white/72'
                      }`}
                    >
                      <span className="block text-[12px] font-medium">{option.label === 'Repeatable lines' ? 'Lines' : option.label}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/34">{option.helper}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Communication style</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {COMMUNICATION_STYLE_OPTIONS.map((option) => {
                  const active = communicationStyle === option.label

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setCommunicationStyle(option.label)}
                      className={`border-l px-3 py-2 text-left transition ${
                        active
                          ? 'border-[#AEB6FF]/42 text-white'
                          : 'border-white/[0.08] text-white/42 hover:text-white/72'
                      }`}
                    >
                      <span className="block text-[12px] font-medium">{option.label}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/34">{option.helper}</span>
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
              
              onClick={() => setShowPrepPreview(true)}
              className="w-full py-4 text-right text-[12px] font-semibold uppercase tracking-[0.24em] text-[#D7DCFF]/86 transition hover:text-white active:scale-[0.98]"
            >
              Continue to LIVE
            </button>
          </div>

          {hasLiveSession && (
            <p className="mt-3 text-[12px] leading-5 text-white/34">
              A previous LIVE session exists. Starting LIVE creates a clean room so stale context does not bleed in.
            </p>
          )}
        </section>

        {tier === 'smart' && (
          <p className="mt-2 text-center text-[12px] leading-5 text-white/32">
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
        onEnterLive={() => startLive(false, editableResources)}
      />
    </main>
  )
}
