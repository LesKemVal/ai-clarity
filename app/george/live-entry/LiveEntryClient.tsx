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
  const [objective, setObjective] = useState('')
  const [userPosition, setUserPosition] = useState('Seeking')
  const [chairs, setChairs] = useState<string[]>(['Founder'])
  const [customChair, setCustomChair] = useState('')
  const [knownContext, setKnownContext] = useState('')
  const [sessionEmail, setSessionEmail] = useState('')
  const [relatedSessionId, setRelatedSessionId] = useState('not_related')
  const [relatedSessions, setRelatedSessions] = useState<any[]>([])
  const [liveToaAccepted, setLiveToaAccepted] = useState(false)
  const [sessionSectionCollapsed, setSessionSectionCollapsed] = useState(true)
  const [chairSectionCollapsed, setChairSectionCollapsed] = useState(true)
  const [roomSectionCollapsed, setRoomSectionCollapsed] = useState(false)
  const [prepDocument, setPrepDocument] = useState<{ name: string; summary: string; kind: string } | null>(null)
  const [prepDocumentReading, setPrepDocumentReading] = useState(false)
  const [controlWords, setControlWords] = useState('hmm, right, ok, let me think')
  const [hasLiveSession, setHasLiveSession] = useState(false)
  const [showPrepPreview, setShowPrepPreview] = useState(false)
  const [editableResources, setEditableResources] = useState<string[]>([])
  const [customResource, setCustomResource] = useState('')
  const [runtimeMotionContext, setRuntimeMotionContext] = useState<any>(null)
  const [prepRoomProfile, setPrepRoomProfile] = useState<PrepRoomResourceProfile | null>(null)

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

  const contextSignalsCollapsed =
    (relatedSessions.length === 0 || sessionSectionCollapsed) &&
    chairSectionCollapsed

  useEffect(() => {
    const cached = readCachedGeorgeSessionAuthority()
    setTier(cached.tier)
    setSessionEmail(cached.email || '')

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        setTier(authority.tier)
        setSessionEmail(authority.email || '')
      })
      .catch(() => {})

    try {
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
    setSessionSectionCollapsed(false)
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
  const showEstimatedLiveCost = objective.trim().length > 0 && knownContext.trim().length > 0

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!showEstimatedLiveCost) return

    window.localStorage.setItem('george_live_estimated_cents', String(finalResourceEstimate.estimatedCents))
    window.localStorage.setItem('george_live_estimated_cost_updated_at', String(Date.now()))
  }, [showEstimatedLiveCost, finalResourceEstimate.estimatedCents])

  const loadedSummary = useMemo(() => {
    return `You can steer GEORGE’s behavior naturally during the conversation.`
  }, [])

  useEffect(() => {
    let cancelled = false

    const contextText = [
      resolvedConversationType,
      audienceType,
      pacing,
      outputMode,
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

  const relatedSessionLabel =
    relatedSessions.length === 0 || relatedSessionId === 'not_related'
      ? 'Not related'
      : selectedRelatedSession?.title || 'Selected session'

  const buildContinuityPackage = (session: any) => {
    if (!session) return null

    return {
      sessionId: session.id || null,
      title: session.title || 'Related session',
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

    if (!sessionEmail.trim()) {
      window.alert('Sign in to use LIVE.')
      return
    }

    const roomFormation = deriveRoomFormation({
      chairs,
      desiredOutcome: objective,
      observedReality: knownContext,
    })

    if (!roomFormation.canEnterLive) {
      window.alert(roomFormation.confidence.suggestedQuestion || 'Additional signal required.')
      return
    }

    if (!liveToaAccepted) {
      window.alert('Acknowledge the LIVE notice before entering.')
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
      controlWords,
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
    setSessionSectionCollapsed(false)
    setChairSectionCollapsed(false)

    window.localStorage.setItem('george_live_prep_inputs_cleared', '1')

    window.location.href = '/george/live'
  }

  if (!ready) return null

  if (!sessionEmail.trim()) {
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
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/28">LIVE Signal</div>

          <h1 className="mt-1.5 text-[22px] font-semibold leading-[1.04] tracking-[-0.04em] text-white/92 sm:text-[32px]">
            Help GEORGE understand what's happening.
          </h1>

          <p className="mt-1.5 text-[13px] leading-5 text-white/48">
            The stronger the signal, the more effective GEORGE becomes.
          </p>

          {runtimeMotionContext && (
            <div className="mt-2 rounded-[0.82rem] border border-[#AEB6FF]/10 bg-[#AEB6FF]/[0.035] px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DCFF]/44">Loaded context</div>
              <div className="mt-1 text-[14px] font-medium text-white/78">{runtimeMotionContext.title}</div>
            </div>
          )}

          {contextSignalsCollapsed && (
            <div className="mt-2 rounded-[0.72rem] border border-white/[0.035] bg-black/12 px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  setSessionSectionCollapsed(false)
                  setChairSectionCollapsed(false)
                }}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-white/24">Context Signals</span>
                  <span className="mt-0.5 block truncate text-[12px] text-white/48">
                    {relatedSessionLabel} • {chair || 'Position not selected'}
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">Open</span>
              </button>
            </div>
          )}

          {relatedSessions.length > 0 && !contextSignalsCollapsed && (
          <div className="mt-3 rounded-[0.82rem] border border-white/[0.04] bg-black/18 px-3 py-2">
            {sessionSectionCollapsed ? (
              <button
                type="button"
                onClick={() => setSessionSectionCollapsed(false)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Related Session</span>
                  <span className="mt-1 block truncate text-[13px] text-white/62">
                    {relatedSessionId === 'not_related'
                      ? 'Not related'
                      : selectedRelatedSession?.title || 'Selected session'}
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">Open</span>
              </button>
            ) : (
              <>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/24">
              Which session is this LIVE conversation related to?
            </div>

            <div className="mt-2 grid gap-1.5">
              {relatedSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setRelatedSessionId(session.id)
                    setSessionSectionCollapsed(true)
                  }}
                  className={`rounded-[0.72rem] border px-3 py-2 text-left transition ${
                    relatedSessionId === session.id
                      ? 'border-[#8FB6C9]/[0.20] bg-[#8FB6C9]/[0.09] text-white'
                      : 'border-white/[0.035] bg-black/14 text-white/46 hover:text-white/76'
                  }`}
                >
                  <span className="block truncate text-[13px] font-medium">{session.title || 'GEORGE Session'}</span>
                  <span className="mt-1 block truncate text-[11px] text-white/34">
                    {session.lastKnownState || session.summary || session.userGoal || 'Last active normal session'}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setRelatedSessionId('not_related')
                  setSessionSectionCollapsed(true)
                }}
                className={`rounded-[0.72rem] border px-3 py-2 text-left transition ${
                  relatedSessionId === 'not_related'
                    ? 'border-[#8FB6C9]/[0.20] bg-[#8FB6C9]/[0.09] text-white'
                    : 'border-white/[0.035] bg-black/14 text-white/46 hover:text-white/76'
                }`}
              >
                <span className="block text-[13px] font-medium">Not related</span>
                <span className="mt-1 block text-[11px] text-white/34">Start LIVE without normal-session context.</span>
              </button>
            </div>
              </>
            )}
          </div>
          )}

          {!contextSignalsCollapsed && (
          <div className={`${relatedSessions.length > 0 ? 'mt-2' : 'mt-3'} rounded-[0.82rem] border border-white/[0.04] bg-black/18 px-3 py-2`}>
            {chairSectionCollapsed ? (
              <button
                type="button"
                onClick={() => setChairSectionCollapsed(false)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-white/24">Position (Optional)</span>
                  <span className="mt-1 block truncate text-[13px] text-white/62">{chair || 'Not selected'}</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">Open</span>
              </button>
            ) : (
              <>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/24">Position (Optional)</div>
            <p className="mt-1 text-[11px] leading-5 text-white/36">Use only if your position changes what matters.</p>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {CHAIR_OPTIONS.map((option) => {
                const active = chairs.includes(option.label)

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleChair(option.label)}
                    className={`rounded-[0.72rem] border px-3 py-2 text-left transition ${
                      active
                        ? 'border-[#8FB6C9]/[0.20] bg-[#8FB6C9]/[0.10] text-white'
                        : 'border-white/[0.035] bg-black/14 text-white/46 hover:text-white/76'
                    }`}
                  >
                    <span className="block text-[12px] font-medium">{option.label}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-white/34">{option.helper}</span>
                  </button>
                )
              })}
            </div>

            {chairs.includes('Other') && (
              <label className="mt-2 block rounded-[0.72rem] border border-white/[0.035] bg-black/14 px-3 py-2">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-white/22">Write position</span>
                <input
                  value={customChair}
                  onChange={(event) => setCustomChair(event.target.value)}
                  placeholder="Example: Sponsor, advocate, partner, owner"
                  className="mt-2 w-full bg-transparent text-[14px] text-white/72 outline-none placeholder:text-white/24"
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



          <label className="mt-2 block rounded-[0.72rem] border border-white/[0.028] bg-black/14 px-3 py-2 backdrop-blur-md">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-white/22">Desired Outcome</span>
            <textarea
              id="george-desired-outcome"
              data-live-signal="desired-outcome"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              rows={2}
              placeholder="What outcome are you hoping to achieve?"
              className="mt-2 w-full resize-none bg-transparent text-[15px] leading-5 text-white/76 outline-none placeholder:text-white/24"
            />
          </label>

          <label className="mt-2 block rounded-[0.72rem] border border-white/[0.028] bg-black/14 px-3 py-2 backdrop-blur-md">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-white/22">What is happening?</span>
            <textarea
              id="george-observed-reality"
              data-live-signal="observed-reality"
              value={knownContext}
              onChange={(event) => setKnownContext(event.target.value)}
              rows={2}
              placeholder="What is happening right now? What should be understood before LIVE begins?"
              className="mt-2 w-full resize-none bg-transparent text-[14px] leading-5 text-white/70 outline-none placeholder:text-white/24"
            />
          </label>

          {showEstimatedLiveCost && (
            <div className="mt-3 rounded-[0.82rem] border border-[#8FB6C9]/[0.09] bg-black/18 px-3 py-2 animate-[pickerTwistUp_180ms_cubic-bezier(0.22,1,0.36,1)]">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/34">
                Signal Status
              </div>
              <div className="mt-1 text-[12px] leading-5 text-white/70">
                You are free to go LIVE now, or continue strengthening your signal.
              </div>
            </div>
          )}

          {showEstimatedLiveCost && (
            <details className="mt-2 rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.035] px-3 py-2 animate-[pickerTwistUp_180ms_cubic-bezier(0.22,1,0.36,1)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/36">
                    Estimated LIVE cost
                  </span>
                  <span className="mt-1 block text-[12px] text-white/68">
                    <span className="text-[18px] font-semibold tracking-[-0.04em] text-white/88">{finalResourceEstimate.estimatedCents}¢</span>
                    <span className="ml-2 text-white/44">typical 30-minute LIVE session</span>
                  </span>
                </span>
                <span className="text-[18px] leading-none text-white/32">⌄</span>
              </summary>

              <div className="mt-3 border-t border-white/[0.05] pt-3">
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                  <div
                    className="h-full rounded-full bg-[#8FB6C9]/55 transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(12, finalResourceEstimate.estimatedCents * 2))}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-white/38">
                  <div>
                    <span className="block text-white/22">Prep</span>
                    {finalResourceEstimate.prepSeconds}s
                  </div>
                  <div>
                    <span className="block text-white/22">Runtime</span>
                    30m
                  </div>
                  <div>
                    <span className="block text-white/22">Typical</span>
                    ${(finalResourceEstimate.estimatedCents / 100).toFixed(2)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {finalResourceEstimate.resources.slice(0, 5).map((resource) => (
                    <span key={resource} className="rounded-full border border-white/[0.045] bg-black/18 px-2 py-1 text-[10px] text-white/38">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          )}

          <div className="mt-2 rounded-[0.72rem] border border-white/[0.028] bg-black/14 px-3 py-2 backdrop-blur-md">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-white/22">Assist</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {OUTPUT_OPTIONS.map((option) => {
                const active = outputMode === option.label

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setOutputMode(option.label)}
                    className={`rounded-[0.72rem] border px-3 py-2 text-left transition ${
                      active
                        ? 'border-[#8FB6C9]/[0.20] bg-[#8FB6C9]/[0.10] text-white'
                        : 'border-white/[0.04] bg-black/16 text-white/46 hover:text-white/76'
                    }`}
                  >
                    <span className="block text-[12px] font-medium">{option.label === 'Repeatable lines' ? 'Responses' : option.label}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-white/34">{option.helper}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="mt-2 block rounded-[0.72rem] border border-[#8FB6C9]/[0.11] bg-[#8FB6C9]/[0.055] px-3 py-2 shadow-[0_10px_30px_rgba(80,130,190,0.10)] backdrop-blur-md">
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

          <label className="mt-3 flex gap-3 rounded-[0.82rem] border border-white/[0.04] bg-black/18 px-3 py-3 text-[12px] leading-5 text-white/42">
            <input
              type="checkbox"
              checked={liveToaAccepted}
              onChange={(event) => setLiveToaAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#8FB6C9]"
            />
            <span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/28">LIVE Notice</span>
              GEORGE may misunderstand speech, miss context, provide imperfect guidance, or experience latency. GEORGE assists. You remain responsible for decisions and actions.
            </span>
          </label>

          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => setShowPrepPreview(true)}
              className="min-h-[50px] rounded-[0.82rem] border border-[#8FB6C9]/[0.18] bg-[linear-gradient(180deg,rgba(18,28,38,0.92),rgba(5,8,13,0.98))] px-5 py-3 text-[14px] font-semibold tracking-[-0.02em] text-[#D7DCFF]/86 shadow-[0_18px_48px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.045)] transition hover:scale-[1.01] hover:border-[#8FB6C9]/[0.28] hover:text-white"
            >
              Deploy LIVE
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
        chairs={chairs}
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
