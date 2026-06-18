'use client'


import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { operationalMotion } from '@/lib/george/ui/operational-motion'
import Sidebar from '@/components/Sidebar'
import ContinuityCapsule from '@/components/george/ContinuityCapsule'
import MemoryContinuityPanel from '@/components/george/settings/MemoryContinuityPanel'
import TypingPrescriptionSurface from '@/components/george/TypingPrescriptionSurface'
import DesktopOperationalSurface from '@/components/george/DesktopOperationalSurface'
import GeorgePaymentElement from '@/components/george/checkout/GeorgePaymentElement'
import HeadsetOperatorIcon from '@/components/george/HeadsetOperatorIcon'
import LiveChooser from '@/components/george/LiveChooser'
import { getSteering } from '@/lib/george/steering'
import { getGoalState, type GoalState } from '@/lib/george/goal-engine'
import { adaptCueForUser, buildBrilliantLiveTriggerResponse, buildLiveGuidance, detectConversationProfile, detectConversationPersonProfile, detectVocalState, interpretVoiceState, decideNextMove, detectUserDeliveryLevel } from '@/lib/george/conversation-engine'
import { createSession, getActiveMode, getActiveSessionForMode, getActiveSessionIdForMode, setActiveSessionIdForMode, setActiveMode, updateActiveSessionMessages, updateCampaignSessionMetadata, getCampaignSessions, getSessionsForMode, deleteSession, hasMeaningfulUserMessage, hydrateSessionsFromServer } from '@/lib/george/session/store'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority, writeCachedGeorgeSessionAuthority, clearCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'
import { buildGeorgeSessionRestoreState, findGeorgeSessionToRestore, saveGeorgeSession } from '@/lib/george/live-runtime/session-controller'
import { readGeorgeNormalDraft } from '@/lib/george/live-runtime/draft-restoration'
import { appendFollowUp, buildEvaluationResponse, buildTrainingFollowThrough, buildTrainingIntakeOverride, detectTrainingTrack, evaluateCDL, evaluateCNA, evaluateDrivers, evaluateGED, extractAnswers, trainingNeedsJurisdiction } from '@/lib/george/training/training-helpers'
import { getSuggestedPromptsFromMessages, samePromptSet } from '@/lib/george/prompts/suggested-prompts'
import { applyRuntimeOverlayFromCode } from '@/lib/george/operator/load-runtime-overlay'
import {
  applyPreparedRuntimeMemory,
  markLiveRuntimeStarted,
  persistActiveLiveRuntimeSupport,
  readActiveLiveRuntimeSupport,
  consumePreparedLiveSetup,
  reconcileActiveLiveRuntimeUsage,
  type LivePrepSetup,
} from '@/lib/george/live-runtime/prep-runtime'
import { buildLiveEntryBriefing } from '@/lib/george/live-runtime/live-entry-briefing'
import { buildGeorgeCoreInterpretation } from '@/lib/george/core/build-interpretation'
import { buildOutcomeReassessmentRuntimeBlock } from '@/lib/george/live-runtime/outcome-reassessment'
import { tryLiveFastPath } from '@/lib/george/live-runtime/live-fast-path'
import { recordLiveSupportPreference } from '@/lib/george/live-runtime/live-support-preferences'
import { buildLiveRuntimeContext } from '@/lib/george/live-runtime/live-runtime-context'
import { LiveFooterControls } from '@/components/george/live/LiveFooterControls'
import { LiveRoomStatusPanel } from '@/components/george/live/LiveRoomStatusPanel'
import { useLiveAudioRuntime } from '@/hooks/useLiveAudioRuntime'
import { useLiveReflexListener } from '@/hooks/useLiveReflexListener'
import { type LastLiveFinalTranscript } from '@/lib/george/live-runtime/transcript-routing'
import { appendLiveContextSignal as appendLiveContextSignalValue } from '@/lib/george/live-runtime/context-signals'
import { resolveGeorgeCoreLiveExecution } from '@/lib/george/core/live-execution'
import { resolveLiveTranscriptDecision } from '@/lib/george/live-runtime/live-transcript-controller'
import { rememberLiveSpokenLine } from '@/lib/george/live-runtime/spoken-memory'
import { appendLiveAwarenessFragment, type LiveAwarenessFragment } from '@/lib/george/live-runtime/live-awareness-buffer'
import { reconcileLiveAwareness } from '@/lib/george/live-runtime/live-awareness-reconciliation'
import { recoverLiveOverlapContext } from '@/lib/george/live-runtime/live-overlap-recovery'
import { buildLiveSelfDescription, isLiveIdentityQuestion } from '@/lib/george/identity/live-self-description'

const GEORGE_LAST_NORMAL_DRAFT = 'george_last_normal_draft'


const LIVE_ENTRY_RESPONSIBILITY_MARKER = '[RESPONSIBILITY_CHECKPOINT]'
const LIVE_ENTRY_TOA_MARKER = '[TOA_CHECKPOINT]'
const LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED = false


function getLiveEntryCheckpointState(
  briefing: string | null,
  responsibilityConfirmed: boolean,
  toaConfirmed: boolean
) {
  const source = String(briefing || '')

  const responsibilityIndex = source.indexOf(LIVE_ENTRY_RESPONSIBILITY_MARKER)
  const toaIndex = source.indexOf(LIVE_ENTRY_TOA_MARKER)

  if (!source || responsibilityIndex < 0 || toaIndex < 0) {
    return {
      text: source,
      showResponsibility: false,
      showToa: false,
    }
  }

  const beforeResponsibility = source.slice(0, responsibilityIndex).trim()
  const afterResponsibility = source
    .slice(responsibilityIndex + LIVE_ENTRY_RESPONSIBILITY_MARKER.length, toaIndex)
    .trim()
  const afterToa = source.slice(toaIndex + LIVE_ENTRY_TOA_MARKER.length).trim()

  if (!responsibilityConfirmed) {
    return {
      text: beforeResponsibility,
      showResponsibility: true,
      showToa: false,
    }
  }

  if (!toaConfirmed) {
    return {
      text: [beforeResponsibility, afterResponsibility].filter(Boolean).join('\n\n'),
      showResponsibility: false,
      showToa: true,
    }
  }

  return {
    text: [beforeResponsibility, afterResponsibility, afterToa].filter(Boolean).join('\n\n'),
    showResponsibility: false,
    showToa: false,
  }
}

function deriveSessionTitle(
  desiredOutcome?: string | null,
  fallback?: string | null
) {
  const outcome = String(desiredOutcome || '').trim()

  if (outcome.length > 0) {
    return outcome.length > 72
      ? outcome.slice(0, 72).trim() + '…'
      : outcome
  }

  const fb = String(fallback || '').trim()

  if (fb.length > 0) {
    return fb.length > 72
      ? fb.slice(0, 72).trim() + '…'
      : fb
  }

  return 'In Progress'
}

function getActiveLiveDesiredOutcomeTitle(fallback?: string | null) {
  if (typeof window === 'undefined') return deriveSessionTitle(null, fallback)

  try {
    const activeSetup =
      JSON.parse(window.localStorage.getItem('george_live_setup_active') || 'null') ||
      JSON.parse(window.localStorage.getItem('GEORGE_LAST_LIVE_SETUP') || 'null') ||
      JSON.parse(window.localStorage.getItem('GEORGE_LIVE_SETUP') || 'null')

    return deriveSessionTitle(
      activeSetup?.objective || activeSetup?.room || null,
      fallback
    )
  } catch {
    return deriveSessionTitle(null, fallback)
  }
}

function deriveNormalSessionTitleFromMessages(messages: Message[], fallback?: string | null) {
  const firstUser = messages.find((message) => message.role === 'user')?.content?.trim()
  const cleaned = firstUser
    ?.replace(/\s+/g, ' ')
    .replace(/^(can you|could you|please|help me|i need to|i want to)\s+/i, '')
    .trim()

  return deriveSessionTitle(cleaned, fallback || 'GEORGE Session')
}



const OPERATIONAL_SIGNALS = [
  'Add visual context during LIVE. GEORGE can reference documents, screenshots, and photos in real time.',
  'Say “shorter” if you want compressed responses.',
  'Say “line” if you want exact wording.',
  'Use your outcome-shift phrase when the room may be changing direction.',
  'LIVE works best with one earbud.',
]

function getLiveRuntimeSteeringLabels(room?: string | null) {
  const clean = String(room || '').trim().toLowerCase()

  if (clean.includes('interview')) return ['Answer', 'Example', 'Redirect']
  if (clean.includes('negotiation')) return ['Probe', 'Anchor', 'Protect']
  if (clean.includes('doctor') || clean.includes('medical')) return ['Clarify', 'Challenge', 'Escalate']
  if (clean.includes('investor') || clean.includes('capital') || clean.includes('fundraising')) return ['Explore', 'Position', 'Close']
  if (clean.includes('sales')) return ['Trust', 'Objection', 'Close']
  if (clean.includes('board') || clean.includes('executive')) return ['Frame', 'Evidence', 'Decision']

  return ['Approach', 'Momentum', 'Trust']
}

function getLiveResponseServingTags(message: Message, liveAssistMode?: string | null) {
  if (Array.isArray(message.servingTags) && message.servingTags.length > 0) {
    return message.servingTags.slice(0, 3)
  }

  const content = String(message.content || '').toLowerCase()
  const tags: string[] = []

  const add = (tag: string) => {
    if (!tags.includes(tag)) tags.push(tag)
  }

  if (/outcome|objective|goal|shift|pivot|reframe/.test(content)) add('Outcome')
  if (/say|tell them|open with|close with|ask them|respond/.test(content)) add('Continuation')
  if (/cue|watch|listen|notice|pressure|timing|signal/.test(content)) add('Cues')
  if (/should|best move|recommend|i would|next step|let's/.test(content)) add('Advise')
  if (/confirm|commit|owner|when|next step/.test(content)) add('Close')

  if (tags.length === 0) {
    if (liveAssistMode === 'lines') add('Continuation')
    else add('Cues')
    add('Advise')
  }

  return tags.slice(0, 3)
}

function getLiveRoomSignal(room: string) {
  if (room === 'Interview') {
    return 'Interview loaded. GEORGE is watching credibility, proof, pacing, pressure, and answer clarity.'
  }

  if (room === 'Meeting') {
    return 'Meeting loaded. GEORGE is watching alignment, decision pressure, timing, and the next useful move.'
  }

  if (room === 'Boardroom') {
    return 'Boardroom loaded. GEORGE is watching assumptions, methodology, evidence, variance, forecast confidence, and executive clarity.'
  }

  if (room === 'Negotiation') {
    return 'Negotiation loaded. GEORGE is watching leverage, concessions, timing, alternatives, pressure, and control.'
  }

  if (room === 'Sales Call') {
    return 'Sales call loaded. GEORGE is watching trust, objections, timing, buying signals, and closing movement.'
  }

  if (room === 'Debate') {
    return 'Debate loaded. GEORGE is watching contradiction, proof demands, interruptions, framing, and control.'
  }

  if (room === 'Doctor Appointment') {
    return 'Doctor appointment loaded. GEORGE is watching symptoms, diagnosis clarity, treatment risk, questions, and what cannot be missed.'
  }

  if (room === 'Presentation') {
    return 'Presentation loaded. GEORGE is watching pacing, audience pressure, message clarity, proof, and the close.'
  }

  if (room === 'Everyday Conversation') {
    return 'Conversation loaded. GEORGE is watching tone, timing, pressure, and the next useful line.'
  }

  return 'LIVE loaded. GEORGE is watching the room, the chair, the outcome, and the next useful signal.'
}

type Message = {
  role: 'assistant' | 'user' | 'system'
  content: string
  constrained?: boolean
  imageDataUrl?: string | null
  simplifiedFromIndex?: number
  source?: 'user_input' | 'sidebar_prompt' | 'live_transcript' | 'third_party_speech' | 'system_override'
  servingTags?: string[]
}

type PromptSelection = {
  label: string
  text: string
  context: string
}

// PRO LIVE / campaign architecture is shelved.
// Keep remaining campaign code inert until it is extracted or deleted.
// See docs/architecture/PRO_LIVE_CAMPAIGNS.bak.md.

type GeorgeCampaign = {
  id: string
  name: string
  mode: 'solo' | 'firm'
  productOrService?: string
  targetMarket?: string
  callingFromRegion?: string
  callingToRegion?: string
  desiredOutcome?: string
  assistMode?: 'manual' | 'negotiation' | 'objection_handling' | 'discovery' | 'closing' | 'compliance'
  deliveryMode?: 'text' | 'audio' | 'both'
  outputStyle?: 'say_ask_boundary_close' | 'short_cues' | 'repeatable_lines'
  successSignal?: string
  currentGoal?: string
  complianceBoundaries?: string
  requiredLanguage?: string[]
  forbiddenClaims?: string[]
  timingRules?: string[]
  qualificationRules?: string[]
  dataToPreserve?: string[]
  defaultAnswersEnabled: boolean
}

type GeorgeConversation = {
  id: string
  type: "conversation"
  title?: string
  createdAt: number
  updatedAt: number
  messages: Message[]

  summary?: string
  personOrRole?: string
  setting?: string
  userGoal?: string
  lastKnownState?: string
  suggestedRestart?: string
}

function saveSessionToV2(params: {
  id?: string
  mode: 'normal' | 'live'
  title: string
  messages: Message[]
  summary?: string
  userGoal?: string
  lastKnownState?: string
  suggestedRestart?: string
  metadata?: Record<string, unknown>
}) {
  return saveGeorgeSession(params)
}


const REROUTE_PROMPT: PromptSelection = {
  label: 'New strategy',
  text: 'Give me a new strategy from where I am now.',
  context: 'strategy_recalculation',
}

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: {
    transcript: string
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionErrorLike = {
  error?: string
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor
    SpeechRecognition?: SpeechRecognitionConstructor
  }
}




function TypewriterText({
  text,
  speed = 14,
}: {
  text: string
  speed?: number
}) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    let i = 0
    setDisplay('')

    const interval = setInterval(() => {
      i += 1
      setDisplay(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <>{display}</>
}

function renderAssistantContent(text: string, liveMode: boolean) {
  const cleaned = String(text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^###\s+/gm, '')
    .replace(/^##\s+/gm, '')
    .replace(/^#\s+/gm, '')
    .trim()

  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className={`flex flex-col ${liveMode ? 'gap-7' : 'gap-5'}`}>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)

        const bulletLines = lines.filter((line) =>
          /^[-•*]\s+/.test(line)
        )

        const numberedLines = lines.filter((line) =>
          /^\d+[.)]\s+/.test(line)
        )

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
                    <li key={i}>
                      {line.replace(/^[-•*]\s+/, '• ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <ol className="space-y-3">
                  {lines.map((line, i) => (
                    <li key={i}>
                      {line}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )
        }

        return (
          <div key={index} className="flex flex-col gap-3">
            {lines.map((line, lineIndex) => {
              if (/^[-•*]\s+/.test(line)) {
                return (
                  <div key={lineIndex} className="pl-5 -indent-5">
                    {line.replace(/^[-•*]\s+/, '• ')}
                  </div>
                )
              }

              if (/^\d+[.)]\s+/.test(line)) {
                return (
                  <div key={lineIndex} className="pl-5 -indent-5">
                    {line}
                  </div>
                )
              }

              return (
                <div key={lineIndex}>
                  {line}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function governLiveResponse(raw: string, opts: { audio: boolean; userText?: string }) {
  const text = String(raw || '').trim()
  if (!text) return text

  const cleaned = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(strongest move|clean opener|next move|quick prep|close|if they|if he|if she|if budget|if timing|if pushback|what number|one thing|your opener|use this instead|try|consider|you should|lead with|drop)/i.test(line))
    .filter((line) => !/^(budget|timing|performance|band|market|low counter|process|hr|title-first|vague no):/i.test(line))
    .join('\n')

  const sayMatch = cleaned.match(/Say:\s*\n?([\s\S]*?)(?=\n(?:Backup:|Cue:|Do:|Boundary:|Ask:|$))/i)
  const backupMatch = cleaned.match(/Backup:\s*\n?([\s\S]*?)(?=\n(?:Say:|Cue:|Do:|Boundary:|Ask:|$))/i)
  const cueMatch = cleaned.match(/(?:Cue:|Do:)\s*\n?([\s\S]*?)(?=\n(?:Say:|Backup:|Boundary:|Ask:|$))/i)

  const normalizeLine = (value: string, maxWords: number) => {
    let line = String(value || '')
      .split('\n')
      .map((part) => part.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean)[0] || ''

    line = line.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim()

    const words = line.split(/\s+/).filter(Boolean)
    const maxChars = maxWords <= 10 ? 120 : 180

    if (words.length > maxWords && line.length > maxChars) {
      const sentenceEnd = line.slice(0, maxChars).match(/^([\s\S]*?[.!?][”"]?)(\s|$)/)
      const clauseEnd = line.slice(0, maxChars).match(/^([\s\S]*?[,;:][”"]?)(\s|$)/)

      line =
        sentenceEnd?.[1]?.trim() ||
        clauseEnd?.[1]?.replace(/[,;:][”"]?$/, '').trim() ||
        words.slice(0, maxWords).join(' ').replace(/[,:;.-]*$/, '').trim()
    }

    return line
  }

  const fallbackLine = (() => {
    const firstQuoted = cleaned.match(/[“"]([^”"]{3,160})[”"]/)
    if (firstQuoted?.[1]) return `“${firstQuoted[1]}”`

    const firstUsable = cleaned
      .split('\n')
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .find((line) =>
        line &&
        !/^(Say|Backup|Cue|Do|Ask|Boundary):/i.test(line) &&
        !/^pause\.?\s*hold\.?/i.test(line) &&
        !/^holding/i.test(line) &&
        !/do not give another line unless asked/i.test(line) &&
        !/what outcome|outcome matters|trying to accomplish|move forward right now|what matters most/i.test(line) &&
        !/GEORGE|clarity, direction|execution system|You are GEORGE|not a chatbot|not a therapist/i.test(line)
      )

    if (/^hi\b|^hello\b|^hey\b/i.test(firstUsable || '')) {
      return 'I’m listening.'
    }

    return firstUsable || 'I’m listening.'
  })()

  let backup = normalizeLine(backupMatch?.[1] || '', opts.audio ? 10 : 16)
  if (/^(budget|timing|performance|band|market|low counter|process|hr|title|if)\b/i.test(backup)) {
    backup = ''
  }

  const liveUserText = String(opts.userText || '').toLowerCase()
  const storedAssistMode =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('george_live_assist_mode')
      : null

  let say = normalizeLine(sayMatch?.[1] || fallbackLine, opts.audio ? 10 : 18)

  if (/raise|compensation|pay/.test(liveUserText) && /sir|discuss|talk|raise|compensation|pay/.test(liveUserText)) {
    if (/book|schedule|set .*minute|grab .*minute|this week|email|chat|slack/i.test(say)) {
      say = '“I wanted to talk about my compensation for a minute.”'
    }
  }

  if (/\bid\b|identification|license|registration/i.test(liveUserText)) {
    if (/GEORGE|clarity, direction|execution system|not a chatbot|not a therapist/i.test(say) || !say) {
      say = '“Yes, officer. May I reach for it?”'
    }
  }

  const cue = normalizeLine(cueMatch?.[1] || (/\bid\b|identification|license|registration/i.test(liveUserText) ? 'Hands visible. Move slowly.' : 'Give one clean next move.'), opts.audio ? 8 : 10)

  const stripOperationalLabels = (value: string) =>
    String(value || '')
      .replace(/^\s*(Word|Say|Cue|Need|Style|Pause|Backup):\s*/i, '')
      .replace(/\[pause\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

  say = stripOperationalLabels(say)
  const cleanCue = stripOperationalLabels(cue)

  if (opts.audio) {
    return say || cleanCue
  }

  const wantsCue =
    storedAssistMode === 'cues' ||
    /cue|slow down|listen/i.test(liveUserText) ||
    /\b(pause|hold|wait)\b/i.test(liveUserText)

  const wantsLine =
    storedAssistMode === 'lines' ||
    /what should i say|what do i say|how do i say|give me a line|exact line|exact wording/i.test(liveUserText)

  if (wantsLine) {
    return say || cleanCue || ''
  }

  if (wantsCue) {
    return cleanCue || say || ''
  }

  return say || cleanCue || ''
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
`

export default function Page({ forceLive = false }: { forceLive?: boolean } = {}) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [composerPlaceholder, setComposerPlaceholder] = useState('say it here...')
  const [lastGuidedLine, setLastGuidedLine] = useState('')
  const [liveMode, setLiveMode] = useState(false)

  function getVisitCount() {
    if (typeof window === 'undefined') return 0
    const raw = window.localStorage.getItem('george_visit_count')
    const count = Number(raw || '0')
    return Number.isFinite(count) ? count : 0
  }

  function bumpVisitCount() {
    if (typeof window === 'undefined') return
    const next = getVisitCount() + 1
    window.localStorage.setItem('george_visit_count', String(next))
  }

  function getInitialGreeting(name = '', tier = 'smart') {
  const hour = new Date().getHours()
  const visitCount = getVisitCount()

  const timeGreeting =
    hour < 12 ? "Good morning."
    : hour < 18 ? "Good afternoon."
    : "Good evening."

  const firstTimeGreeting = `An intelligent utility for decisions, preparation, and words that matter.` 

  // Normal GEORGE opens with continuity posture.
  // Scope: non-LIVE normal sessions only.
  // This is behavioral orientation, not session restoration.
  // Saved conversations, LIVE Conversations, and room prep continuation remain handled by pickers.
  const earlyUserGreeting = `Continue current direction\nor switch projects?` 

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
  ]

  if (visitCount === 0) {
    return firstTimeGreeting
  }

  if (visitCount > 0 && visitCount < 5) {
    return earlyUserGreeting
  }

  if (tier === 'smart') {
    return greetingPool[Math.floor(Date.now() / 60000) % greetingPool.length]
  }

  if (tier === 'intelligent') {
    return greetingPool[Math.floor(Date.now() / 60000) % greetingPool.length]
  }

  if (tier === 'brilliant') {
    return greetingPool[Math.floor(Date.now() / 60000) % greetingPool.length]
  }

  return `${timeGreeting} What do you want to do?`
}

  async function handleShareGeorge() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : '/'

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'GEORGE by BRANESx',
          text: 'Some conversations change everything, so be...\n\nMore knowledgeable.\n\nMore centered.\n\nMore persuasive.\n\nMore expansive.\n\nwith GEORGE in any room.',
          url,
        })

        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setToastMessage('GEORGE link copied')
        setShowToast(true)
      }
    } catch {}
  }

  useEffect(() => {
    if (input.trim()) return

    let mounted = true
    const phrases = ['say it here...', 'ask it here...']
    let phraseIndex = phrases.indexOf(composerPlaceholder)
    if (phraseIndex < 0) phraseIndex = 0

    const timer = window.setInterval(() => {
      if (!mounted) return
      phraseIndex = (phraseIndex + 1) % phrases.length
      setComposerPlaceholder(phrases[phraseIndex])
    }, 5000)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [input, composerPlaceholder])

const [messages, setMessages] = useState<Message[]>([])
const normalSessionBootedRef = useRef(false)
const normalSessionWriteReadyRef = useRef(false)
const liveSessionWriteReadyRef = useRef(false)
const preLiveSessionIdRef = useRef<string | null>(null)
const liveEntryBootedRef = useRef(false)
const [pendingImage, setPendingImage] = useState<{ dataUrl: string; name: string } | null>(null)
const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({})
const [feedbackPulse, setFeedbackPulse] = useState<Record<string, boolean>>({})
const [conversationMode, setConversationMode] = useState<string | null>(null)
const [dismissedTrajectoryIds, setDismissedTrajectoryIds] = useState<string[]>([])
const [showWalkthrough, setShowWalkthrough] = useState(false)
const [walkthroughStep, setWalkthroughStep] = useState(1)


  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = JSON.parse(window.localStorage.getItem('GEORGE_DISMISSED_TRAJECTORIES') || '[]')
      setDismissedTrajectoryIds(Array.isArray(saved) ? saved : [])
    } catch {
      setDismissedTrajectoryIds([])
    }
  }, [])

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('GEORGE_FEEDBACK_STATE') || '{}'
      )

      if (saved && typeof saved === 'object') {
        setFeedback(saved)
      }
    } catch {}
  }, [])


  const dismissTrajectory = (id: string) => {
    setDismissedTrajectoryIds((prev) => {
      const next = Array.from(new Set([...prev, id]))
      window.localStorage.setItem('GEORGE_DISMISSED_TRAJECTORIES', JSON.stringify(next))
      return next
    })
  }

  const unfinishedTrajectories = useMemo(() => {
    if (typeof window === 'undefined') return []

    try {
      const existing = JSON.parse(window.localStorage.getItem('GEORGE_WORKSPACE') || '[]') as any[]

      return existing
        .filter((item) => item?.type === 'goal')
        .filter((item) => (item.status || 'active') !== 'completed')
        .filter((item) => !dismissedTrajectoryIds.includes(item.id))
        .sort((a, b) => (b.updatedAt || b.timestamp || 0) - (a.updatedAt || a.timestamp || 0))
        .slice(0, 3)
        .map((item) => {
          const title = String(item.trajectoryTitle || item.preview || 'Active direction').replace(/\s+/g, ' ').trim()
          const summary = String(item.trajectorySummary || 'Still in chamber. Ready when you are.').replace(/\s+/g, ' ').trim()

          return {
            id: item.id,
            title: title.length > 78 ? `${title.slice(0, 78)}…` : title,
            summary: summary.length > 92 ? `${summary.slice(0, 92)}…` : summary,
          }
        })
    } catch {
      return []
    }
  }, [dismissedTrajectoryIds])

  useEffect(() => {
    // 🚫 NEVER run greeting if LIVE or Conversation Mode is active
    if (forceLive || liveMode || isManualLive) return

    const greeting = getInitialGreeting()


    setMessages((prev) => {
      if (prev.length === 0) {
        const next = [{ role: 'assistant' as const, content: greeting }]
        messagesRef.current = next
        return next
      }

      if (
        prev.length === 1 &&
        prev[0]?.role === 'assistant' &&
        prev[0]?.content.includes("Tell me what matters today?")
      ) {
        const next = [{ role: 'assistant' as const, content: greeting }]
        messagesRef.current = next
        return next
      }

      return prev
    })

    if (messagesRef.current.length === 0) {
      messagesRef.current = [{ role: 'assistant', content: greeting }]
    }

    if (
      messagesRef.current.length === 1 &&
      messagesRef.current[0]?.role === 'assistant' &&
      messagesRef.current[0]?.content.includes("Tell me what matters today?")
    ) {
      messagesRef.current = [{ role: 'assistant', content: greeting }]
    }
  }, [])

  function handleFeedback(index: number, type: 'up' | 'down') {
    setFeedback((prev) => {
      const current = prev[index]

      const next = {
        ...prev,
      }

      if (current === type) {
        delete next[index]
      } else {
        next[index] = type
      }

      try {
        localStorage.setItem('GEORGE_FEEDBACK_STATE', JSON.stringify(next))
      } catch {}

      return next
    })

    const pulseKey = `${index}-${type}`
    setFeedbackPulse((prev) => ({
      ...prev,
      [pulseKey]: true,
    }))

    window.setTimeout(() => {
      setFeedbackPulse((prev) => ({
        ...prev,
        [pulseKey]: false,
      }))
    }, 520)

    const msg = messagesRef.current[index]
    if (!msg || msg.role !== 'assistant') return

    const key = type === 'up' ? 'GEORGE_POSITIVE' : 'GEORGE_NEGATIVE'
    const existing = JSON.parse(localStorage.getItem(key) || "[]")

    existing.push({
      content: msg.content,
      timestamp: Date.now()
    })

    localStorage.setItem(key, JSON.stringify(existing))
  }

  const [interimTranscript, setInterimTranscript] = useState('')
const [voiceError, setVoiceError] = useState('')
  const [interactionMode, setInteractionMode] = useState<'text' | 'speech'>('text')
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<Message | null>(null)
  const [activePromptLabel, setActivePromptLabel] = useState<string | null>(null)
  const [activePromptContext, setActivePromptContext] = useState<string | null>(null)
  const [showPreLiveSignalSurface, setShowPreLiveSignalSurface] = useState(false)
  const [preLiveSignalStep, setPreLiveSignalStep] = useState(0)
  const [preLiveSignals, setPreLiveSignals] = useState<Record<string, string>>({})
  const [preLiveSignalComplete, setPreLiveSignalComplete] = useState(false)
  const isManualLive =
    conversationMode === 'manual_live' ||
    activePromptContext === 'manual_live'

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (liveEntryBootedRef.current) return

    const params = new URLSearchParams(window.location.search)
    const pendingLiveSignal =
      window.localStorage.getItem('GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION') === 'start'

    const shouldStartNewLive =
      pendingLiveSignal ||
      params.get('start') === '1' ||
      (
        params.get('live') === '1' &&
        params.get('start') === '1'
      )

    if (!shouldStartNewLive) return

    liveEntryBootedRef.current = true
    setShowPreLiveSignalSurface(true)
    setPreLiveSignalStep(0)
    setPreLiveSignals({})
    setPreLiveSignalComplete(false)
    window.localStorage.removeItem('GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION')

    const nextMessages: Message[] = [
      {
        role: 'assistant',
        content: 'Give GEORGE signal.\n\nQuestion 1\n\nWhat is your role in the conversation — your position or title?\n\nExamples: interviewer, interviewee, CEO, founder, manager, patient, customer, candidate, etc.',
        source: 'system_override',
      },
    ]

    // Start New LIVE begins in normal GEORGE.
    // GEORGE collects signal first; LIVE starts only after enough signal exists.
    setLiveMode(false)
    setConversationMode(null)
    setActivePromptContext('pre_live_signal_acquisition')
    setActivePromptLabel('Start New LIVE')
    setInput('')
    setInterimTranscript('')
    setMessages(nextMessages)
    messagesRef.current = nextMessages
    setActiveMode('normal')
  }, [])
  const [campaigns, setCampaigns] = useState<GeorgeCampaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [showCampaignMenu, setShowCampaignMenu] = useState(false)
  const [language, setLanguage] = useState('English')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const languageOptions = ['English', 'Español', 'Français', 'العربية', '中文', '日本語']

  const activeCampaign = campaigns.find((campaign) => campaign.id === activeCampaignId) || null
  const resolvedLivePosture =
    conversationMode === 'live_debate' || activePromptContext === 'live_debate'
      ? 'debate'
      : activeCampaign?.assistMode === 'negotiation'
      ? 'negotiation'
      : activeCampaign?.assistMode === 'objection_handling'
        ? 'response'
        : conversationMode === 'live_negotiation' ||
            activePromptContext === 'live_negotiation' ||
            conversationMode === 'professional_negotiation' ||
            activePromptContext === 'professional_negotiation'
          ? 'negotiation'
          : conversationMode === 'live_response' ||
              activePromptContext === 'live_response' ||
              conversationMode === 'professional_objection_handling' ||
              activePromptContext === 'professional_objection_handling'
            ? 'response'
            : isManualLive
              ? 'manual'
              : 'default'

  const resolvedOutputStyle =
    activeCampaign?.outputStyle ||
    (resolvedLivePosture === 'debate'
      ? 'repeatable_lines'
      : resolvedLivePosture === 'negotiation'
      ? 'say_ask_boundary_close'
      : resolvedLivePosture === 'response'
        ? 'repeatable_lines'
        : 'short_cues')

  const liveContextBufferRef = useRef<string[]>([])
  const liveRuntimeMemoryRef = useRef({
    acceptedCarryCount: 0,
    overrideCount: 0,
    hesitationCount: 0,
    preferredForce: 'balanced' as 'light' | 'balanced' | 'strong',
    toneCorrection: 'neutral' as 'softer' | 'firmer' | 'neutral',
  })
  const liveLastSignalRef = useRef<number>(0)
const liveInterventionRef = useRef<number>(0)
const lastCueTsRef = useRef<number>(0)
const liveConversationStateRef = useRef({
  objectionCount: 0,
  dismissCount: 0,
  pressureCount: 0,
  lastCue: '',
  outcomeState: 'neutral',
  activeDirection: 'clarity'
})

const [contextTurnCount, setContextTurnCount] = useState(0)
  const [reroutePrompt, setReroutePrompt] = useState<PromptSelection | null>(null)
  const [rerouteSignal, setRerouteSignal] = useState(0)
  const [currentTier, setCurrentTier] = useState<'smart' | 'intelligent' | 'brilliant'>('smart')
const [tierSignalPhase, setTierSignalPhase] = useState(0)
const [showNormalUtilityMenu, setShowNormalUtilityMenu] = useState<'help' | 'language' | null>(null)
const [showMemoryContinuityPanel, setShowMemoryContinuityPanel] = useState(false)
const normalUtilityMenuRef = useRef<HTMLDivElement | null>(null)
const [activeHelpTopic, setActiveHelpTopic] = useState<'live' | 'continuity' | 'memory' | 'images' | 'signal'>('live')

useEffect(() => {
  if (typeof window === 'undefined') return

  const setGeorgeViewportHeight = () => {
    const height = window.visualViewport?.height || window.innerHeight
    document.documentElement.style.setProperty('--george-vh', `${height}px`)
  }

  setGeorgeViewportHeight()

  window.addEventListener('resize', setGeorgeViewportHeight)
  window.visualViewport?.addEventListener('resize', setGeorgeViewportHeight)
  window.visualViewport?.addEventListener('scroll', setGeorgeViewportHeight)

  return () => {
    window.removeEventListener('resize', setGeorgeViewportHeight)
    window.visualViewport?.removeEventListener('resize', setGeorgeViewportHeight)
    window.visualViewport?.removeEventListener('scroll', setGeorgeViewportHeight)
  }
}, [])

useEffect(() => {
  if (typeof window === 'undefined') return

  const timer = window.setInterval(() => {
    setTierSignalPhase((phase) => (phase + 1) % 2)
  }, 3800)

  return () => window.clearInterval(timer)
}, [])

const hasLiveGeorgeAccess = currentTier === 'intelligent' || currentTier === 'brilliant'
const tierUpgradeAction =
  currentTier === 'smart'
    ? {
        label: 'BE INTELLIGENT',
        headline: 'Current Access',
        currentLabel: 'Smart',
        currentIncludes: ['Ask GEORGE', 'Limited continuity', 'Limited LIVE capacity', 'Basic restoration'],
        nextCopy: 'Intelligent includes everything in Smart, plus stronger continuity, contextual awareness, expanded LIVE resources, and operational support.',
        cta: 'Understand More',
        href: '/activate?tier=intelligent&intent=be-intelligent',
      }
    : currentTier === 'intelligent'
      ? {
          label: 'BE BRILLIANT',
          headline: 'Current Access',
          currentLabel: 'Intelligent',
          currentIncludes: ['Expanded continuity', 'Contextual awareness', 'Operational support', 'Expanded LIVE capacity'],
          nextCopy: 'Brilliant includes everything in Intelligent, plus deeper continuity, stronger awareness, persistent operational support, and the highest LIVE capacity.',
          cta: 'Understand More',
          href: '/activate?tier=brilliant&intent=be-brilliant',
        }
      : {
          label: 'STAY BRILLIANT',
          headline: 'Current Access',
          currentLabel: 'Brilliant',
          currentIncludes: ['Maximum continuity', 'Deep contextual awareness', 'Persistent operational support', 'Highest LIVE capacity'],
          nextCopy: 'Highest Access Active. Based on recent usage, Intelligent may also be sufficient.',
          cta: 'Manage Access',
          href: '/activate?tier=brilliant&intent=stay-brilliant',
        }

const tierPrimarySignal =
  currentTier === 'smart'
    ? 'Go Intelligent'
    : currentTier === 'intelligent'
      ? 'Go Brilliant'
      : 'Stay Brilliant'
const tierSignalText = hasLiveGeorgeAccess && tierSignalPhase === 1
  ? 'You have access to LIVE GEORGE'
  : tierPrimarySignal
const showLiveGeorgeFlame = hasLiveGeorgeAccess && tierSignalPhase === 1
const tieredStarterPrompts = useMemo<PromptSelection[]>(() => {
    if (currentTier === 'brilliant') {
      return [
        
        
        
      ]
    }

    if (currentTier === 'intelligent') {
      return [
        {
          label: 'Faster revenue',
          text: 'I need to make money faster, and I want GEORGE to ask the right question first, then build a practical execution plan.',
          context: 'money_skill_to_income',
        },
        {
          label: 'Build correctly',
          text: 'I want to build something, and I want GEORGE to help me define the target, sequence the work, and avoid wasted steps.',
          context: 'build_start',
        },
        {
          label: 'Get moving',
          text: 'I am stuck, and I want GEORGE to clarify what is blocking me and turn this into an executable next step.',
          context: 'unstuck_start',
        },
      ]
    }

    return [
      {
        label: 'Fast revenue',
        text: 'I need to make money, and I want the clearest realistic path before I choose a direction.',
        context: 'money_this_week',
      },
      {
        label: 'Build something',
        text: 'I want to build something, and I need GEORGE to help me see the strongest starting point.',
        context: 'build_start',
      },
      {
        label: 'Get unstuck',
        text: 'I am stuck, and I need GEORGE to show me what matters most and what to do first.',
        context: 'unstuck_start',
      },
    ]
  }, [currentTier])

  const [suggestedPrompts, setSuggestedPrompts] = useState<PromptSelection[]>(tieredStarterPrompts)

  useEffect(() => {
    setSuggestedPrompts(tieredStarterPrompts)
  }, [tieredStarterPrompts])
  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false

    fetch('/api/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return

        if (data?.tier === 'intelligent' || data?.tier === 'brilliant') {
          setCurrentTier(data.tier)
          window.localStorage.setItem('george_tier', data.tier)

          if (data?.email) {
            const restoredEmail = String(data.email).trim().toLowerCase()
            setSubscriberEmail(restoredEmail)
            window.localStorage.setItem('george_email', restoredEmail)
            window.localStorage.setItem('george_verified_continuity', 'true')
            void hydrateSessionsFromServer()
          }
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedLanguage = window.localStorage.getItem('george_language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    const savedCadence = window.localStorage.getItem('george_live_cadence')
    if (savedCadence) {
      setLiveCadence(savedCadence)
    }

    try {
      const rawLiveSetup = window.localStorage.getItem('GEORGE_LIVE_SETUP')

      if (rawLiveSetup) {
        const parsed = JSON.parse(rawLiveSetup)

        if (parsed?.controlWords) {
          const firstPhrase = parsed.controlWords
            .split(',')
            .map((v: string) => v.trim())
            .filter(Boolean)[0]

          if (firstPhrase) {
            setLiveSteeringPhrase(firstPhrase)
          }
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    // PRO LIVE / campaign architecture is archived.
    // Do not auto-load campaigns or restore campaign sessions into active GEORGE/LIVE runtime.
    setCampaigns([])
    setActiveCampaignId(null)
  }, [])

  useEffect(() => {
    // Campaign persistence is V2-owned. Keep local state only for the active UI session.
    return
  }, [campaigns, activeCampaignId])
  const [tonePopupIndex, setTonePopupIndex] = useState<number | null>(null)
  const [tonePopupUpward, setTonePopupUpward] = useState(true)
  const [rewordPopupIndex, setRewordPopupIndex] = useState<number | null>(null)
const [recommendedControl, setRecommendedControl] = useState<string | null>(null)
  const [rewordPopupUpward, setRewordPopupUpward] = useState(true)
const [assistTone, setAssistTone] = useState<'calm' | 'direct' | 'assertive' | 'firm' | 'warm' | 'neutral'>('direct')
const resolvedAssistTone =
  assistTone ||
  (resolvedLivePosture === 'negotiation'
    ? 'firm'
    : resolvedLivePosture === 'response'
      ? 'calm'
      : 'direct')

const syncCampaignEnvironment = (
  _campaignId: string | null,
  _updates: Partial<{
    assistMode: string
    outputStyle: string
    deliveryMode: string
    assistTone: string
  }>
) => {
  // PRO LIVE / campaign architecture is archived.
  // This helper remains only as a legacy no-op until campaign code is extracted or deleted.
  return
}

const replaceLastLiveGuidance = (guidance: string) => {
  const existingMessages = [...messagesRef.current]
  const lastMessage = existingMessages[existingMessages.length - 1]

  const shouldReplaceLastGuidance =
    lastMessage?.role === 'assistant' &&
    typeof lastMessage?.content === 'string' &&
    (
      lastMessage.content.includes('reduce leakage') ||
      lastMessage.content.includes('without overexplaining')
    )

  const nextMessages = shouldReplaceLastGuidance
    ? [
        ...existingMessages.slice(0, -1),
        {
          role: 'assistant' as const,
          content: guidance,
        },
      ]
    : [
        ...existingMessages,
        {
          role: 'assistant' as const,
          content: guidance,
        },
      ]

  window.setTimeout(() => {
    setMessages(nextMessages)
    messagesRef.current = nextMessages
  }, 220)
}

const activateNegotiationPosture = () => {
  setActivePromptContext('live_negotiation')
  setConversationMode('live_negotiation')

  setToastMessage('Negotiation guidance active.')
  setShowToast(true)
  replaceLastLiveGuidance('Good. I’ll help you stay composed, reduce leakage, and move toward leverage.')
}

const activateResponsePosture = () => {
  setActivePromptContext('live_response')
  setConversationMode('live_response')

  setToastMessage('Response handling active.')
  setShowToast(true)
  replaceLastLiveGuidance('Good. I’ll help you answer pressure, objections, or confusion without overexplaining.')
}

const [forceClose, setForceClose] = useState(false)

const [suggestedSignal, setSuggestedSignal] = useState(0)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
const [liveGeorgeEnabled, setLiveGeorgeEnabled] = useState(true)
  const resolvedDeliveryMode =
    activeCampaign?.deliveryMode ||
    (voiceOn ? 'audio' : 'text')
  const [voiceSpeed, setVoiceSpeed] = useState(1.2)
  const [voiceType, setVoiceType] = useState('ash')
  

const [otherSpeaking, setOtherSpeaking] = useState(false)
const [lastTranscriptTime, setLastTranscriptTime] = useState(0)

function detectLiveInterruption(interim: string) {
  const now = Date.now()

  if (interim && interim.trim().length > 0) {
    setOtherSpeaking(true)
    setLastTranscriptTime(now)
  }

  // if silence for 1.2s → other person stopped
  if (now - lastTranscriptTime > 1200) {
    setOtherSpeaking(false)
  }

  // if both talking → interruption
  if (isListening && otherSpeaking) {
    return true
  }

  return false
}

const [isListening, setIsListening] = useState(false)
const liveRoomActive = Boolean(forceLive || liveMode) && liveGeorgeEnabled
const liveStatusStackRef = useRef<HTMLDivElement | null>(null)
const [liveStatusStackClearance, setLiveStatusStackClearance] = useState(0)

    const [stableLiveGuidance, setStableLiveGuidance] = useState<{ signal: string; say: string } | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [thinkingDots, setThinkingDots] = useState(1)
  const [bridgeThinking, setBridgeThinking] = useState(false)
  const [conversationSignal, setConversationSignal] = useState<string | null>(null)
  const [signalTimestamp, setSignalTimestamp] = useState(0)

  const [adaptiveCueLabel, setAdaptiveCueLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!adaptiveCueLabel) return

    const timer = setTimeout(() => {
      setAdaptiveCueLabel(null)
    }, 2400)

    return () => clearTimeout(timer)
  }, [adaptiveCueLabel])

  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [subscriberEmail, setSubscriberEmail] = useState('')

  const getSubscriberSessionMetadata = useCallback(() => {
    const email = subscriberEmail.trim().toLowerCase()
    return email ? { subscriberEmail: email } : { localOnly: true }
  }, [subscriberEmail])

  const [birthdayMD, setBirthdayMD] = useState('')
  const [showPromptMenu, setShowPromptMenu] = useState(false)
  const [showConversationMenu, setShowConversationMenu] = useState(false)
  const [showLiveQuickMenu, setShowLiveQuickMenu] = useState(false)

  useEffect(() => {
    // LIVE route ownership now belongs exclusively to /george/live
    // Keep disabled to prevent modal/state hydration conflicts.
  }, [])

  const [liveSegueIndex, setLiveSegueIndex] = useState(0)
  const [showAccessCodeEntry, setShowAccessCodeEntry] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')
  const [showEarbudOverlay, setShowEarbudOverlay] = useState(true)
  const [showSessionPicker, setShowSessionPicker] = useState(false)

useEffect(() => {
  function handlePointerDown(event: MouseEvent) {
    if (
      normalUtilityMenuRef.current &&
      !normalUtilityMenuRef.current.contains(event.target as Node)
    ) {
      setShowNormalUtilityMenu(null)
    }
  }

  document.addEventListener('mousedown', handlePointerDown)

  return () => {
    document.removeEventListener('mousedown', handlePointerDown)
  }
}, [])

  const [showProLiveComingSoon, setShowProLiveComingSoon] = useState(false)
  const [showLiveChooser, setShowLiveChooser] = useState(false)
  const [liveEntryBlinking, setLiveEntryBlinking] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.localStorage.getItem('george_open_live_access_after_home') === '1') {
      window.localStorage.removeItem('george_open_live_access_after_home')
      window.localStorage.setItem('george_pending_live_after_access', '1')
      setShowSidebar(false)
      openLiveEntry()
      return
    }

    if (window.localStorage.getItem('george_open_live_chooser_after_home') === '1') {
      window.localStorage.removeItem('george_open_live_chooser_after_home')
      setShowSessionPicker(false)
      startLiveSignalAcquisition()
      return
    }

    if (window.localStorage.getItem('george_resume_live_after_home') !== '1') return

    window.localStorage.removeItem('george_resume_live_after_home')
    window.localStorage.removeItem('george_start_new_live')
    window.localStorage.removeItem('george_fresh_live_entry')
    window.localStorage.removeItem('GEORGE_LIVE_SETUP')
    setShowLiveChooser(false)
    setSessionPickerClosing(false)
    setSessionPickerMode('live')
    setShowSessionPicker(true)
  }, [])

  const [liveCadence, setLiveCadence] = useState('Balanced')
  const [liveSteeringPhrase, setLiveSteeringPhrase] = useState('hmm')
  const [sessionPickerMode, setSessionPickerMode] = useState<'live' | 'campaign'>('live')
  const [sessionPickerClosing, setSessionPickerClosing] = useState(false)
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<string | null>(null)
  const [preLiveMessages, setPreLiveMessages] = useState<Message[] | null>(null)
  const [showLiveEntrySequence, setShowLiveEntrySequence] = useState(Boolean(forceLive || liveMode))
  const [liveEntryBriefing, setLiveEntryBriefing] = useState<string | null>(null)
const [typedLiveEntryBriefing, setTypedLiveEntryBriefing] = useState('')
const [liveEntryTypingComplete, setLiveEntryTypingComplete] = useState(false)
const [liveEntryResponsibilityConfirmed, setLiveEntryResponsibilityConfirmed] = useState(false)
const [liveEntryToaConfirmed, setLiveEntryToaConfirmed] = useState(false)
const [liveEntryOptionalSignalComplete, setLiveEntryOptionalSignalComplete] = useState(false)

const liveEntryCheckpointState = useMemo(
  () =>
    getLiveEntryCheckpointState(
      liveEntryBriefing,
      liveEntryResponsibilityConfirmed,
      liveEntryToaConfirmed
    ),
  [liveEntryBriefing, liveEntryResponsibilityConfirmed, liveEntryToaConfirmed]
)

useEffect(() => {
  if (!(forceLive || liveMode) || showLiveEntrySequence) {
    setLiveStatusStackClearance(0)
    return
  }

  const measure = () => {
    const node = liveStatusStackRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    setLiveStatusStackClearance(Math.ceil(rect.bottom + 48))
  }

  measure()

  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null

  if (resizeObserver && liveStatusStackRef.current) {
    resizeObserver.observe(liveStatusStackRef.current)
  }

  window.addEventListener('resize', measure)

  return () => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', measure)
  }
}, [
  forceLive,
  liveMode,
  showLiveEntrySequence,
  liveRoomActive,
  isListening,
  voiceOn,
])


useEffect(() => {
  setLiveEntryResponsibilityConfirmed(false)
  setLiveEntryToaConfirmed(false)
  setLiveEntryOptionalSignalComplete(false)
  setShowLiveEntrySequence(Boolean(liveEntryBriefing))
}, [liveEntryBriefing])

useEffect(() => {
  const briefingText = liveEntryCheckpointState.text

  if (!(forceLive || liveMode) || !briefingText) {
    setTypedLiveEntryBriefing('')
    setLiveEntryTypingComplete(false)
    return
  }

  let index = 0
  setLiveEntryTypingComplete(false)
  setTypedLiveEntryBriefing('')

  const timer = window.setInterval(() => {
    index += 1
    setTypedLiveEntryBriefing(briefingText.slice(0, index))

    if (index >= briefingText.length) {
      window.clearInterval(timer)
      setLiveEntryTypingComplete(true)
    }
  }, 18)

  return () => window.clearInterval(timer)
}, [forceLive, liveMode, liveEntryCheckpointState.text])

const liveEntryReadyForOptionalSignal =
  showLiveEntrySequence &&
  Boolean(forceLive || liveMode) &&
  liveEntryToaConfirmed &&
  !liveEntryCheckpointState.showResponsibility &&
  !liveEntryCheckpointState.showToa &&
  !liveEntryOptionalSignalComplete &&
  liveEntryTypingComplete

const captureLiveEntryOptionalSignal = () => {
  const finalSignal = input.trim()

  if (finalSignal) {
    try {
      window.localStorage.setItem('GEORGE_LIVE_FINAL_SIGNAL', finalSignal)
    } catch {}

    liveContextBufferRef.current = [...liveContextBufferRef.current, finalSignal].slice(-12)
    setTypedLiveEntryBriefing((current) => `${current}\n\nI'll account for that.`)
  } else {
    setTypedLiveEntryBriefing((current) => `${current}\n\nUnderstood.`)
  }

  setInput('')
  setLiveEntryOptionalSignalComplete(true)

  window.setTimeout(() => {
    setLiveEntryBriefing(null)
    setShowLiveEntrySequence(false)
  }, 500)

  textareaRef.current?.focus()
}

  const [showExitPopup, setShowExitPopup] = useState(false)
  const [showSaveNaming, setShowSaveNaming] = useState(false)
  const [pendingSessionTitle, setPendingSessionTitle] = useState('')
  const [conversationMenuLane, setConversationMenuLane] = useState<'selector' | 'personal' | 'professional'>('selector')
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const key = 'george_removed_upgrade_test_sessions_v1'
    if (window.localStorage.getItem(key) === '1') return

    const badPatterns = [
      /we can go further here/i,
      /upgrade/i,
      /support the work/i,
      /go brilliant/i,
      /go intelligent/i,
      /test question/i,
    ]

    try {
      for (const storageKey of ['GEORGE_SESSIONS_V2', 'GEORGE_SESSIONS']) {
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) continue

        const sessions = JSON.parse(raw)
        if (!Array.isArray(sessions)) continue

        const cleaned = sessions.filter((session) => {
          const text = JSON.stringify(session || '')
          return !badPatterns.some((pattern) => pattern.test(text))
        })

        window.localStorage.setItem(storageKey, JSON.stringify(cleaned))
      }

      window.localStorage.removeItem('george_last_normal_draft')
      window.localStorage.removeItem('GEORGE_LAST_NORMAL_DRAFT')
      window.localStorage.setItem(key, '1')
    } catch {
      window.localStorage.setItem(key, '1')
    }
  }, [])

useEffect(() => {
  if (typeof window === 'undefined') return

  const syncSidebar = () => {
    setShowSidebar(window.innerWidth >= 1280)
  }

  syncSidebar()
  window.addEventListener('resize', syncSidebar)
  return () => window.removeEventListener('resize', syncSidebar)
}, [])
  const [activeSaveIndex, setActiveSaveIndex] = useState<number | null>(null)
const [savePopupUpward, setSavePopupUpward] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [showRecentFolders, setShowRecentFolders] = useState(false)
  const [activeMemoryFolder, setActiveMemoryFolder] = useState<string | null>(null)
const [lastDomain, setLastDomain] = useState<string | null>(null)
  const [memoryVersion, setMemoryVersion] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const recordActiveLiveRuntimeUsage = () => {
    if (typeof window === 'undefined') return null

    let setup: LivePrepSetup | null = null

    try {
      const rawSetup = window.localStorage.getItem('george_live_setup_active')
      setup = rawSetup ? JSON.parse(rawSetup) : null
    } catch {
      setup = null
    }

    const record = reconcileActiveLiveRuntimeUsage({
      setup,
      runtimeSupport: readActiveLiveRuntimeSupport(),
    })

    if (!record) return null

    window.localStorage.setItem('george_last_live_runtime_summary', record.summary)

    const actual = typeof record.actualCents === 'number' ? `${record.actualCents}¢` : 'not estimated'
    setToastMessage(`Actual runtime usage: ${actual} · ${record.summary}`)
    setShowToast(true)

    return record
  }

  const ACCESS_CODES: Record<string, 'intelligent' | 'brilliant'> = {
    ...Object.fromEntries(
      Array.from({ length: 100 }, (_, index) => [
        `INTEL-FOUNDER-${String(index + 1).padStart(3, '0')}`,
        'intelligent' as const,
      ])
    ),
    'BRILLIANT-FOUNDERS': 'brilliant',
  }

  const redeemAccessCode = () => {
    const normalized = accessCode.trim().toUpperCase()

    const runtimeOverlay = applyRuntimeOverlayFromCode(normalized)
    const tier = runtimeOverlay?.tier || ACCESS_CODES[normalized]

    if (!tier) {
      setAccessCodeError('Invalid access code.')
      return
    }

    setCurrentTier(tier)

    if (typeof window !== 'undefined') {
      localStorage.setItem('george_tier', tier)
    }

    setToastMessage(
      runtimeOverlay
        ? `${runtimeOverlay.overlay.title} loaded.`
        : `${tier === 'brilliant' ? 'Brilliant' : 'Intelligent'} access loaded.`
    )
    setShowToast(true)
    setAccessCode('')
    setAccessCodeError('')
    setShowAccessCodeEntry(false)
  }

  const LIVE_SEGUES = [
    {
      title: 'LIVE listens with you.',
      body: 'Use one earbud if you can. GEORGE helps with timing, pressure, escalation, hesitation, and next responses in real time.'
    },
    {
      title: 'You do not need to explain everything first.',
      body: 'LIVE is designed for movement. Interviews, negotiation, conflict, uncertainty, pressure, sales, and difficult conversations.'
    },
    {
      title: 'GEORGE tracks the room.',
      body: 'LIVE cues help you slow down, redirect, recover control, or sharpen the next sentence before momentum slips.'
    },
    {
      title: 'LIVE changes runtime behavior.',
      body: 'LIVE is optimized for timing and response delivery while conversations are actually happening.'
    }
  ]
  const [isSharingGeorgeLink, setIsSharingGeorgeLink] = useState(false)
  const [typedMessageIndex, setTypedMessageIndex] = useState<number | null>(null)
  const [typedMessageContent, setTypedMessageContent] = useState('')

  const tierSuggestedLimit =
    currentTier === 'brilliant'
      ? 5
      : currentTier === 'intelligent'
        ? 3
        : 2

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (normalSessionBootedRef.current) return

    const liveParam = new URLSearchParams(window.location.search).get('live')

    if (forceLive && liveParam !== 'segue') {
      const cachedTier = window.localStorage.getItem('george_tier')
      const cachedLiveAccess = cachedTier === 'intelligent' || cachedTier === 'brilliant'
      const liveAccessKnown = hasLiveGeorgeAccess || cachedLiveAccess

      const hasLocalLiveSetup =
        Boolean(window.localStorage.getItem('GEORGE_LIVE_SETUP')) ||
        Boolean(window.localStorage.getItem('george_live_setup_active'))

      if (liveAccessKnown === false && hasLocalLiveSetup === false) {
        normalSessionBootedRef.current = true
        window.localStorage.removeItem('george_fresh_live_entry')
        window.localStorage.removeItem('george_start_new_live')
        window.localStorage.removeItem('GEORGE_LIVE_SETUP')
        window.localStorage.removeItem('GEORGE_LAST_LIVE_SETUP')
        window.localStorage.removeItem('george_live_setup_active')
        window.localStorage.removeItem('george_active_live_session_id')
        window.localStorage.removeItem('GEORGE_ACTIVE_LIVE_SESSION_ID')
        setActiveMode('normal')
        setLiveMode(false)
        router.replace('/george')
        return
      }

      normalSessionBootedRef.current = true

      if (typeof window !== 'undefined') {
        const existingNormalMessages = messagesRef.current

        if (
          Array.isArray(existingNormalMessages) &&
          existingNormalMessages.length > 0 &&
          hasMeaningfulUserMessage(existingNormalMessages)
        ) {
          window.localStorage.setItem(
            GEORGE_LAST_NORMAL_DRAFT,
            JSON.stringify({
              messages: existingNormalMessages,
              conversationMode,
              activePromptContext,
              currentTier,
              updatedAt: Date.now(),
            })
          )
        }
      }

      setActiveMode('live')
      setMessages([])
      messagesRef.current = []

      setLiveMode(true)
      setConversationMode('manual_live')
      setActivePromptContext('manual_live')

      const activeLiveSession = getActiveSessionForMode('live')

      // do not auto-restore LIVE session by default
      // user can resume later via sessions if needed

      const startNewLiveRequested = window.localStorage.getItem('george_start_new_live') === '1'
      if (startNewLiveRequested) {
        window.localStorage.removeItem('george_start_new_live')

        window.localStorage.removeItem('george_active_live_session_id')
        window.localStorage.removeItem('george_active_campaign_session_id')
        window.localStorage.removeItem('george_active_campaign')
        window.localStorage.removeItem('george_active_context')
        window.localStorage.removeItem('george_active_label')

        setActiveCampaignId(null)
        setMessages([])
        messagesRef.current = []
      }

      // LIVE auto-restore is disabled for now.
      // A new LIVE route must boot cleanly and must not reattach stale "hold/resume" room state.
      // Resume will return later only after it is scoped to verified LIVE sessions.
      const existingLive = null

      const liveSetup: LivePrepSetup | null = consumePreparedLiveSetup()

      markLiveRuntimeStarted()
      persistActiveLiveRuntimeSupport(liveSetup)
      liveRuntimeMemoryRef.current = applyPreparedRuntimeMemory(liveRuntimeMemoryRef.current, liveSetup)

      if (liveSetup) {
        window.localStorage.setItem('george_live_setup_active', JSON.stringify(liveSetup))

        const contextSummary = [
          liveSetup.room ? `Room: ${liveSetup.room}` : null,
          liveSetup.objective ? `BRANESx: ${liveSetup.objective}` : null,
          liveSetup.cadence ? `Cadence: ${liveSetup.cadence}` : null,
          liveSetup.liveAssistMode ? `Mode: ${liveSetup.liveAssistMode}` : null,
        ].filter(Boolean).join(' · ')
} else {
        window.localStorage.removeItem('george_live_setup_active')
      }

      const setupRoom = liveSetup?.room || ''

      if (setupRoom === 'Debate') {
        setConversationMode('live_debate')
        setActivePromptContext('live_debate')
      }
      const liveRoom = String(liveSetup?.room || '').trim()
      const liveBRANESx = String(liveSetup?.objective || '').trim()
      const liveContext = String((liveSetup as any)?.observedReality || (liveSetup as any)?.knownContext || '').trim()
      const liveChair = String((liveSetup as any)?.chair || '').trim()

      const subscriberMetadata = getSubscriberSessionMetadata()
      if (subscriberMetadata) {
        liveSessionWriteReadyRef.current = true
      }

      setLiveEntryBriefing(null)
      setShowLiveEntrySequence(false)
      setMessages([])
      messagesRef.current = []
      setVoiceOn(true)
      setInteractionMode('speech')
      setShowEarbudOverlay(true)
      window.setTimeout(() => setShowEarbudOverlay(false), 5200)

      return
    }

    if (liveMode || isManualLive) return

    normalSessionBootedRef.current = true

    // /george boots into normal GEORGE.
    // Browser reload means start clean.
    // Internal site navigation can restore last known workspace.
    setLiveEntryBriefing(null)
    setActiveMode('normal')

    const browserReload =
      typeof window !== 'undefined' &&
      performance.getEntriesByType('navigation').some(
        (entry) => (entry as PerformanceNavigationTiming).type === 'reload'
      )

    if (browserReload) {
      window.localStorage.removeItem(GEORGE_LAST_NORMAL_DRAFT)
      skipNextTypewriterRef.current = true
      restoredMessagesSignatureRef.current = ''
      setMessages([])
      messagesRef.current = []
      normalSessionWriteReadyRef.current = true
      return
    }

    const activeSession = findGeorgeSessionToRestore({
      mode: 'normal',
      subscriberEmail,
    })

    const transientDraft = readGeorgeNormalDraft(GEORGE_LAST_NORMAL_DRAFT)

    if (transientDraft.restored) {
      const draftMessages = transientDraft.messages as Message[]

      skipNextTypewriterRef.current = true
      restoredMessagesSignatureRef.current = getMessagesSignature(draftMessages)

      setMessages(draftMessages)
      messagesRef.current = draftMessages

      if (transientDraft.conversationMode) {
        setConversationMode(transientDraft.conversationMode as typeof conversationMode)
      }

      if (transientDraft.activePromptContext) {
        setActivePromptContext(transientDraft.activePromptContext)
      }

      normalSessionWriteReadyRef.current = true
      return
    }

    const sessionRestoreState = buildGeorgeSessionRestoreState(activeSession)

    if (sessionRestoreState.restored) {
      const restoredMessages = sessionRestoreState.messages as Message[]

      // Normal GEORGE restores the user's active workspace on refresh.
      // Sessions remain user-owned continuity, not assistant-first startup messages.
      skipNextTypewriterRef.current = true
      restoredMessagesSignatureRef.current = getMessagesSignature(restoredMessages)

      setMessages(restoredMessages)
      messagesRef.current = restoredMessages
      normalSessionWriteReadyRef.current = true
      return
    }

    bumpVisitCount()

    normalSessionWriteReadyRef.current = true
    setMessages([])
    messagesRef.current = []
  }, [profileName, currentTier, liveMode, conversationMode, activePromptContext, forceLive])

  useEffect(() => {
    // Session bootstrap is now handled by the normal session store effect above.
    // Keep this disabled so refresh does not overwrite restored conversations.
    return
  }, [profileName, currentTier])

  


const scoreFriction = (text: string) => {
  const lower = text.toLowerCase()
  let score = 0

  if (lower.includes("not sure") || lower.includes("not certain")) score += 2
  if (lower.includes("won’t work") || lower.includes("wont work")) score += 3
  if (lower.includes("we usually don’t") || lower.includes("we usually dont")) score += 2
  if (lower.includes("what do you want to do")) score += 3
  if (lower.includes("where do we go from here")) score += 3
  if (lower.includes("maybe")) score += 1
  if (lower.includes("i guess")) score += 1

  return score
}

const detectFriction = (text: string) => {
  const lower = text.toLowerCase()

  return (
    lower.includes("that won’t work") ||
    lower.includes("that wont work") ||
    lower.includes("i’m not sure") ||
    lower.includes("im not sure") ||
    lower.includes("we usually don’t") ||
    lower.includes("we usually dont") ||
    lower.includes("what do you want to do") ||
    lower.includes("where do we go from here")
  )
}

const detectTriggerIntent = (text: string) => {
  const lower = text.toLowerCase()

  if (
    lower.includes("what's the word") ||
    lower.includes("whats the word") ||
    lower.includes("word i'm looking for") ||
    lower.includes("word im looking for")
  ) {
    return "word"
  }

  if (lower.includes("what should i say") || lower.includes("how do i say")) {
    return "line"
  }

  if (
    lower.includes("to be clear") ||
    lower.includes("to clarify") ||
    lower.includes("what i mean is") ||
    lower.includes("i mean") ||
    lower.includes("let me put it another way") ||
    lower.includes("say that better") ||
    lower.includes("clean that up") ||
    lower.includes("give me the word") ||
    lower.includes("what's the word") ||
    lower.includes("whats the word") ||
    lower.includes("what's a better word") ||
    lower.includes("whats a better word")
  ) {
    return "reword"
  }

  if (lower.includes("give me a second") || lower.includes("hold on")) {
    return "cue"
  }

  if (lower.includes("help me here")) {
    return "urgent"
  }

  if (lower.includes("stay with me") || lower.includes("just listen")) {
    return "listen"
  }

  return null
}



// LEGACY LIVE GOVERNOR BRIDGE.
// This powers the older injectGovernedLiveCue() path through /api/george/live/govern.
// It is not part of the active Deepgram transcript -> router -> controller -> action-authority path.
// Preserve until Pro LIVE / legacy cue governance is fully classified.
async function canGovernorInjectLiveCue(transcript: string) {
  if (!transcript.trim()) return false

  try {
    const res = await fetch('/api/george/live/govern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        mode: 'voice_live',
        audio: true,
        shadowMap: liveContextBufferRef.current.join('\n'),
        lastFiveSeconds: transcript,
        liveAssistMode:
          typeof window !== 'undefined' && window.localStorage.getItem('george_live_assist_mode') === 'lines'
            ? 'lines'
            : 'cues',
        runtimeMemory: liveRuntimeMemoryRef.current,
        runtimeSupport: (() => {
          try {
            return JSON.parse(window.localStorage.getItem('george_live_runtime_support_active') || 'null')
          } catch {
            return null
          }
        })(),
      }),
    })

    const packet = await res.json().catch(() => null)
    return Boolean(packet?.shouldSpeak)
  } catch {
    return false
  }
}

async function injectGovernedLiveCue(transcript: string, content: string) {
  const allowed = await canGovernorInjectLiveCue(transcript)
  const memory = liveRuntimeMemoryRef.current
  const lower = transcript.toLowerCase()

  if (/^(ok|okay|got it|i got it|i've got it|ive got it)$/.test(lower.trim())) {
    memory.overrideCount += 1
    memory.preferredForce = memory.overrideCount >= 3 ? 'light' : memory.preferredForce
  }

  if (
    /^(ok|okay|hold|pause|wait|stop)$/.test(lower.trim()) &&
    !allowed
  ) {
    memory.overrideCount += 1
    memory.preferredForce = memory.overrideCount >= 3 ? 'light' : memory.preferredForce
  }

  if (/hmm|maybe|i guess|i don’t know|i don't know|i dont know/.test(lower)) {
    memory.hesitationCount += 1
  }

  if (!allowed) return false

  memory.acceptedCarryCount += 1
  if (memory.acceptedCarryCount >= 3 && memory.overrideCount < 2) {
    memory.preferredForce = 'strong'
  }

  setPendingAssistantMessage(null)
  setPendingAssistantMessage({
    role: 'assistant',
    content,
  })

  return true
}


const georgeProfile = detectConversationProfile(input, interimTranscript)
const liveRuntimeSupport = readActiveLiveRuntimeSupport()

  const liveGuidance = buildLiveGuidance({
    liveMode,
    currentTier,
    isListening,
    interimTranscript,
    input,
    profile: georgeProfile,
    userPosition: liveRuntimeSupport?.userPosition,
  })

  const outcomeGovernorSnapshot = useMemo(() => {
    if (!liveMode) return null

    const knownContext =
      liveRuntimeSupport?.knownContext ||
      liveRuntimeSupport?.purview?.body ||
      ''

    const objectiveKnown = Boolean(
      input.trim() ||
      activeCampaign?.desiredOutcome ||
      activeCampaign?.currentGoal ||
      liveRuntimeSupport?.knownContext ||
      liveRuntimeSupport?.purview?.body ||
      liveRuntimeSupport?.purview?.line
    )

    const knownContextAvailable = Boolean(
      knownContext ||
      interimTranscript.trim() ||
      stableLiveGuidance?.signal
    )

    const desiredOutcome =
      activeCampaign?.desiredOutcome ||
      activeCampaign?.currentGoal ||
      liveRuntimeSupport?.purview?.line ||
      input.trim() ||
      ''

    const interpretation = buildGeorgeCoreInterpretation({
      transcript: interimTranscript.trim() || stableLiveGuidance?.signal || '',
      room: liveRuntimeSupport?.room || liveRuntimeSupport?.knownContext,
      desiredOutcome,
      knownContext,
      userPosition: liveRuntimeSupport?.userPosition,
      knownUserSpeaking: true,
    })

    return interpretation.outcomeGovernor
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
  ])

  useEffect(() => {
    if (!liveMode || currentTier !== 'brilliant' || !liveGuidance) {
      setStableLiveGuidance(null)
      return
    }

    const adaptiveDelay =
      liveGuidance.signal === 'PRESSURE DETECTED'
        ? 250
        : liveGuidance.signal === 'FOCUS ON TERMS'
          ? 350
          : liveGuidance.signal === 'STATE YOUR POSITION'
            ? 500
            : liveGuidance.signal === 'CLARITY GAP'
              ? 650
              : liveGuidance.signal === 'READ THE ROOM'
                ? 800
                : 700

    const timer = window.setTimeout(() => {
      setStableLiveGuidance((prev) => {
        if (
          prev &&
          prev.signal === liveGuidance.signal &&
          prev.say === liveGuidance.say
        ) {
          return prev
        }
        return liveGuidance
      })
    }, adaptiveDelay)

    return () => window.clearTimeout(timer)
  }, [liveMode, currentTier, liveGuidance])
  const [attemptStartTime, setAttemptStartTime] = useState<number | null>(null)
const [showOutcomeBar, setShowOutcomeBar] = useState(false)
const [lastOutcomeContext, setLastOutcomeContext] = useState<string | null>(null)

const [showUpgradeModal, setShowUpgradeModal] = useState(false)
const [showTierModal, setShowTierModal] = useState(false)
const [loginEmailInput, setLoginEmailInput] = useState('')
const [showIdentityMenu, setShowIdentityMenu] = useState(false)

const handleIdentitySignOut = () => {
  setShowIdentityMenu(false)
  setSubscriberEmail('')
  setCurrentTier('smart')
  clearCachedGeorgeSessionAuthority()
  window.localStorage.removeItem('george_founder_restore')
  window.localStorage.removeItem('george_founder_access')
  setToastMessage('Signed out.')
  setShowToast(true)
}
const [loginLinkSent, setLoginLinkSent] = useState(false)
const [loginSending, setLoginSending] = useState(false)
const [activeCheckout, setActiveCheckout] = useState<'intelligent' | 'brilliant' | 'brilliant_day' | null>(null)
const redeemFounderCode = async () => {
  const code = window.prompt('Enter founder access code')

  if (!code) return

  try {
    const response = await fetch('/api/founder-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        email: subscriberEmail.trim().toLowerCase() || undefined,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || (data.tier !== 'intelligent' && data.tier !== 'brilliant')) {
      setToastMessage(data.error || 'Invalid founder code.')
      setShowToast(true)
      return
    }

    setCurrentTier(data.tier)
    writeCachedGeorgeSessionAuthority({
      authenticated: true,
      email: subscriberEmail.trim().toLowerCase() || `founder:${code.trim().toUpperCase()}`,
      tier: data.tier,
      liveAccess: true,
      source: 'founder',
    })
    window.localStorage.setItem('george_founder_access', 'server-verified')
    setToastMessage(`Founder ${data.tier === 'brilliant' ? 'Brilliant' : 'Intelligent'} access activated.`)

    if (window.localStorage.getItem('george_pending_live_after_access') === '1') {
      window.localStorage.removeItem('george_pending_live_after_access')
      window.localStorage.setItem('george_start_new_live', '1')
      window.setTimeout(() => {
        window.location.href = '/george/live-entry?source=founder'
      }, 250)
      return
    }
    setShowToast(true)
    setShowUpgradeModal(false)
  } catch {
    setToastMessage('Founder code check failed.')
    setShowToast(true)
  }
}

  const [showCampaignUpgradeGate, setShowCampaignUpgradeGate] = useState(false)
  const [upgradeCtaWord, setUpgradeCtaWord] = useState<'Intelligent' | 'Brilliant'>('Intelligent')

  useEffect(() => {
    if (currentTier === 'brilliant') return

    setUpgradeCtaWord(currentTier === 'smart' ? 'Intelligent' : 'Brilliant')

    const timer = window.setInterval(() => {
      setUpgradeCtaWord((word) => (word === 'Intelligent' ? 'Brilliant' : 'Intelligent'))
    }, 2600)

    return () => window.clearInterval(timer)
  }, [currentTier])
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [draftProfileName, setDraftProfileName] = useState('')

  const [steeringHint, setSteeringHint] = useState<null | {
    signal: string | null
    label: string
    reason: string
    pulse: boolean
  }>(null)
  const [goalState, setGoalState] = useState<GoalState | null>(null)


  // FULL GEORGE WINDOW SYSTEM
  const [isFullMode, setIsFullMode] = useState(false)
  const [windowEndsAt, setWindowEndsAt] = useState<number | null>(null)

  // Dynamic greeting
  const [greeting, setGreeting] = useState('Welcome back. Pick up where we left off.')
  const accentSymbol = useMemo(() => {
    const accents = ['♥', '🍒', '🍎', '🍇']
    return accents[new Date().getDate() % accents.length]
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const continuityToken = params.get('continuity')
    const tierParam = params.get('tier')
    const subStatus = params.get('subscription')
    const cachedAuthority = readCachedGeorgeSessionAuthority()

    setSubscriberEmail(cachedAuthority.email)
    setCurrentTier(cachedAuthority.tier)

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        setSubscriberEmail(authority.email)
        setCurrentTier(authority.tier)
      })
      .catch(() => {})

    if (continuityToken) {
      void fetch('/api/continuity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: continuityToken }),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            setToastMessage(data?.error || 'Login link could not be verified.')
            setShowToast(true)
            window.history.replaceState({}, '', window.location.pathname)
            return
          }

          const verifiedEmail = String(data?.email || '').trim().toLowerCase()
          const verifiedTier = data?.currentTier

          const normalizedTier =
            verifiedTier === 'intelligent' || verifiedTier === 'brilliant'
              ? verifiedTier
              : 'smart'

          setSubscriberEmail(verifiedEmail)
          setCurrentTier(normalizedTier)

          writeCachedGeorgeSessionAuthority({
            authenticated: Boolean(verifiedEmail),
            email: verifiedEmail,
            tier: normalizedTier,
            liveAccess: normalizedTier === 'intelligent' || normalizedTier === 'brilliant',
            source: 'continuity',
          })

          setToastMessage('Login verified.')
          setShowToast(true)
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch(() => {
          setToastMessage('Login link could not be verified.')
          setShowToast(true)
          window.history.replaceState({}, '', window.location.pathname)
        })

      return
    }
    const cleanSavedEmail = cachedAuthority.email
    if (cleanSavedEmail) setSubscriberEmail(cleanSavedEmail)

    const validTier = tierParam === 'smart' || tierParam === 'intelligent' || tierParam === 'brilliant'

    if (validTier && subStatus === 'success') {
      setToastMessage(`${tierParam.charAt(0).toUpperCase() + tierParam.slice(1)} is being verified.`)
      setShowToast(true)
    }

    if (!cleanSavedEmail) {
      setCurrentTier('smart')
      return
    }

    void fetch(`/api/subscription-state?email=${encodeURIComponent(cleanSavedEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        const serverTier = data?.currentTier
        const restoredEmail = String(data?.email || cleanSavedEmail || '').trim().toLowerCase()
        const normalizedTier =
          serverTier === 'intelligent' || serverTier === 'brilliant'
            ? serverTier
            : 'smart'

        setSubscriberEmail(restoredEmail)
        setCurrentTier(normalizedTier)

        writeCachedGeorgeSessionAuthority({
          authenticated: Boolean(restoredEmail),
          email: restoredEmail,
          tier: normalizedTier,
          liveAccess: normalizedTier === 'intelligent' || normalizedTier === 'brilliant',
          source: 'subscription-state',
        })

        if (subStatus === 'success') {
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
          setToastMessage(serverTier === 'intelligent' || serverTier === 'brilliant'
            ? `${serverTier.charAt(0).toUpperCase() + serverTier.slice(1)} verified.`
            : 'Access will restore after payment confirmation.')
          setShowToast(true)
        }
      })
      .catch(() => {
        setCurrentTier('smart')
      })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    
const savedContext = window.localStorage.getItem('george_active_context')
    const savedLabel = window.localStorage.getItem('george_active_label')
    const savedVoice = window.localStorage.getItem('george_voice')

    // Disabled auto LIVE restore — GEORGE must start in normal mode


    if (savedLabel) {
      setActivePromptLabel(savedLabel)
    }

    if (savedVoice === 'on') {
      setVoiceOn(true)
      setInteractionMode('speech')
      setTimeout(() => startListening(), 900)
    }
  }, [])

  const assistantRevealedRef = useRef(false)
const skipNextTypewriterRef = useRef(false)
const restoredMessagesSignatureRef = useRef<string | null>(null)

function getMessagesSignature(items: Message[]) {
  return items.map((item) => `${item.role}:${item.content}`).join('|')
}

  // CHATGPT-STYLE TYPING ENGINE
  useEffect(() => {
    if (skipNextTypewriterRef.current) {
      skipNextTypewriterRef.current = false
      setTypedMessageIndex(null)
      setTypedMessageContent('')
      return
    }

    if (!messages.length) return

    const signature = getMessagesSignature(messages)
    if (restoredMessagesSignatureRef.current === signature) {
      setTypedMessageIndex(null)
      setTypedMessageContent('')
      return
    }

    const lastIndex = messages.length - 1
    const lastMessage = messages[lastIndex]

    if (lastMessage.role !== 'assistant') {
      restoredMessagesSignatureRef.current = null
      return
    }

    let i = 0
    const fullText = lastMessage.content || ''

    setTypedMessageIndex(lastIndex)
    setTypedMessageContent('')

    const interval = setInterval(() => {
      i++

      setTypedMessageContent((prev) => fullText.slice(0, i))

      if (i >= fullText.length) {
        clearInterval(interval)
        setTypedMessageIndex(null)
      }
    }, 12)

    return () => clearInterval(interval)
  }, [messages])

  
const lastSpeechTsRef = useRef<number>(0)
const responseTimerRef = useRef<any>(null)

const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const speakingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const liveTranscriptSubmitRef = useRef<(text: string) => void>(() => {})
  const lastLiveFinalTranscriptRef = useRef<LastLiveFinalTranscript>(null)
  const liveBuyTimeUntilRef = useRef<number>(0)
  const liveLastSpokenUtteranceRef = useRef<string>('')
  const liveRecentSpokenUtterancesRef = useRef<string[]>([])
  const liveAwarenessBufferRef = useRef<LiveAwarenessFragment[]>([])

  const appendLiveContextSignal = useCallback((text: string) => {
    liveContextBufferRef.current = appendLiveContextSignalValue(
      liveContextBufferRef.current,
      text
    )
  }, [])

  const processLivePartialTranscript = useCallback((text: string) => {
    setVoiceError('')
    setInterimTranscript(text)
    liveLastSignalRef.current = Date.now()
    lastSpeechTsRef.current = Date.now()
    liveContextBufferRef.current = [...liveContextBufferRef.current, text].slice(-12)
  }, [appendLiveContextSignal])

  const processLiveFinalTranscript = useCallback((text: string) => {
    const clean = String(text || '').trim()
    if (!clean) return

    if (liveBuyTimeUntilRef.current > Date.now()) {
      liveBuyTimeUntilRef.current = 0
      console.info('[GEORGE LIVE LOCAL]', 'buy_time_cancelled')
    }

    setInterimTranscript('')
    liveLastSignalRef.current = Date.now()
    lastSpeechTsRef.current = Date.now()
    appendLiveContextSignal(clean)
    liveAwarenessBufferRef.current = appendLiveAwarenessFragment({
      buffer: liveAwarenessBufferRef.current,
      kind: 'final',
      text: clean,
      whileGeorgeSpeaking: isSpeakingRef.current,
    })

    const awarenessState = reconcileLiveAwareness(liveAwarenessBufferRef.current)
    const overlapRecovery = recoverLiveOverlapContext(awarenessState)
    if (
      awarenessState.overlapDetected ||
      overlapRecovery.requiresAttention
    ) {
      console.info('[GEORGE LIVE AWARENESS]', {
        awarenessState,
        overlapRecovery,
      })
    }

    setInput('')
    liveTranscriptSubmitRef.current(clean)
  }, [appendLiveContextSignal])

  const processLiveAudioError = useCallback((error: unknown) => {
    console.warn('[GEORGE LIVE AUDIO]', error)
    setVoiceError('LIVE speech connection failed.')
    setIsListening(false)
  }, [])

  const liveAudioRuntime = useLiveAudioRuntime({
    enabled: Boolean(forceLive || liveMode),
    onPartialTranscript: processLivePartialTranscript,
    onFinalTranscript: processLiveFinalTranscript,
    onError: processLiveAudioError,
  })
  const startLiveAudioRuntime = liveAudioRuntime.start
  const stopLiveAudioRuntimeDirect = liveAudioRuntime.stop
  const emergencyStopLiveAudioRuntime = liveAudioRuntime.emergencyStop
  const speechQueueRef = useRef<string[]>([])
  const isSpeakingRef = useRef(false)
  const stopSpeechRef = useRef(false)
  const savePickerRef = useRef<HTMLDivElement | null>(null)
  const folderBrowserRef = useRef<HTMLDivElement | null>(null)
  const bridgeSpeechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const bridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopLiveAudioRuntime = useCallback(() => {
    stopLiveAudioRuntimeDirect()
    setIsListening(false)
  }, [stopLiveAudioRuntimeDirect])


  useLiveReflexListener({
    enabled: Boolean(forceLive || liveMode),
    active: Boolean(isSpeaking),
    onReflex: (event) => {
      console.info('[GEORGE LIVE REFLEX]', event)

      if (event.intent === 'pause') {
        stopSpeechRef.current = true
        void stopSpeech()
        return
      }

      if (event.intent === 'repeat_last_line') {
        const lastLine = liveLastSpokenUtteranceRef.current.trim()
        if (lastLine) void speakText(lastLine)
        return
      }

      if (event.intent === 'compress_last_line') {
        const action = resolveLiveTranscriptDecision({
          decision: { type: 'local', content: 'compress_last_line' },
          transcript: event.transcript,
          lastSpokenLine: liveLastSpokenUtteranceRef.current,
        })

        if (action.type === 'speak') {
          void speakText(action.text)
        }
        return
      }

      if (event.intent === 'buy_time') {
        liveBuyTimeUntilRef.current = Date.now() + 3500
      }
    },
  })

  useEffect(() => {
    if (!(forceLive || liveMode)) {
      stopLiveAudioRuntimeDirect()
      return
    }

    ;(window as any).__GEORGE_STOP_LIVE_MIC__ = () => {
      emergencyStopLiveAudioRuntime()
      setIsListening(false)
    }

    if (voiceOn) {
      startLiveAudioRuntime()
    } else {
      stopLiveAudioRuntimeDirect()
      setIsListening(false)
    }
  }, [forceLive, liveMode, voiceOn, emergencyStopLiveAudioRuntime, startLiveAudioRuntime, stopLiveAudioRuntimeDirect])

  const interruptAndListen = () => {
    try {
      stopSpeechRef.current = true
      window.speechSynthesis.cancel()
    } catch {}

    setVoiceOn(true)
    setInteractionMode('speech')
    setTimeout(() => startListening(), 80)
  }

  const messagesRef = useRef<Message[]>([
    { role: 'assistant', content: 'GEORGE' },
  ])

  const preserveNormalDraft = () => {
    if (typeof window === 'undefined') return

    const normalMessages = [...messagesRef.current]

    const hasUserMessage = normalMessages.some(
      (message) => message.role === 'user' && String(message.content || '').trim().length > 0
    )

    if (normalMessages.length > 0 && hasUserMessage) {
      window.localStorage.setItem(
        GEORGE_LAST_NORMAL_DRAFT,
        JSON.stringify({
          messages: normalMessages,
          conversationMode,
          activePromptContext,
          currentTier,
          updatedAt: Date.now(),
        })
      )
    }
  }

  const openLiveEntry = () => {
    if (typeof window === 'undefined') return

    preserveNormalDraft()

    if (currentTier === 'smart') {
      setShowUpgradeModal(true)
      return
    }

    window.location.href = '/george/live-entry'
  }

  const openLiveEntryFromMessage = (message: Message) => {
    if (typeof window === 'undefined') return

    const content = String(message?.content || '').trim()

    preserveNormalDraft()

    if (currentTier === 'smart') {
      setShowUpgradeModal(true)
      return
    }

    try {
      window.localStorage.setItem('GEORGE_LIVE_INTENT_STAGE', 'confirm_intent')
      window.localStorage.setItem(
        'GEORGE_PRE_LIVE_SOURCE_CONTEXT',
        JSON.stringify({
          source: 'message_action',
          title: content.slice(0, 72) || 'GEORGE context',
          summary: content.slice(0, 900),
          selectedAt: Date.now(),
        })
      )
    } catch {}

    setShowSidebar(false)
    setShowConversationMenu(false)
    setShowNormalUtilityMenu(null)
    setShowPromptMenu(false)
    setActivePromptLabel('LIVE')
    setActivePromptContext('live_intent_bridge')
    setContextTurnCount(0)

    const liveBridge = (() => {
      try {
        const lowered = content.toLowerCase()

        const hasAny = (signals: string[]) =>
          signals.some((signal) => lowered.includes(signal))

        if (hasAny(['investor', 'pitch', 'raise', 'capital', 'fundraising', 'funding', 'deck', 'market', 'mass market'])) {
          return "Later, you may decide to meet with investors.\n\nBesides you, who knows this opportunity better?\n\nI've helped shape the positioning, challenge assumptions, and prepare for the questions ahead.\n\nIf the conversation moves into the room, I'll be ready. Just ask when you're ready, or tap LIVE in the sidebar."
        }

        if (hasAny(['interview', 'candidate', 'resume', 'hiring', 'recruiter', 'job offer'])) {
          return "Eventually, preparation becomes the interview itself.\n\nBesides you, who better understands the work you've done to get here?\n\nI've helped organize your thinking and prepare for the questions ahead.\n\nIf the conversation moves into the room, I'll be ready. Just ask when you're ready, or tap LIVE in the sidebar."
        }

        if (hasAny(['doctor', 'appointment', 'symptom', 'medical', 'diagnosis', 'treatment', 'clinic'])) {
          return "We've already organized your concerns and prepared the questions you wanted answered.\n\nBesides you, who has followed this situation more closely?\n\nIf the conversation moves into the room, I'll be ready. Just ask when you're ready, or tap LIVE in the sidebar."
        }

        if (hasAny(['negotiat', 'offer', 'counteroffer', 'contract', 'terms', 'deal', 'leverage'])) {
          return "We've already explored the tradeoffs.\n\nBesides you, who better understands what matters most?\n\nI've helped clarify priorities and prepare for difficult moments.\n\nIf the conversation moves into the room, I'll be ready. Just ask when you're ready, or tap LIVE in the sidebar."
        }

        if (hasAny(['meeting', 'client', 'customer', 'board', 'presentation', 'sales call', 'call', 'conversation'])) {
          return "This may eventually move from preparation into a real conversation.\n\nBesides you, who has followed the work this closely?\n\nIf the conversation moves into the room, I'll be ready. Just ask when you're ready, or tap LIVE in the sidebar."
        }
      } catch {}

      return `If this work becomes a consequential conversation, LIVE may help GEORGE stay with the room in real time.

[LIVE]`
    })()

    const bridgeMessage: Message = {
      role: 'assistant',
      content: liveBridge,
    }

    setMessages((prev) => {
      const next = [...prev, bridgeMessage]
      messagesRef.current = next
      return next
    })

    setInput('')
    setInterimTranscript('')
    setSuggestedSignal(Date.now())
  }

  const startLiveSignalAcquisition = () => {
    if (typeof window === 'undefined') return

    setShowSidebar(false)
    setShowLiveChooser(false)
    setShowConversationMenu(false)
    setShowNormalUtilityMenu(null)
    setActivePromptLabel('LIVE')
    setActivePromptContext('live_signal_acquisition')
    setContextTurnCount(0)

    const liveSignalMessage: Message = {
      role: 'assistant',
      content:
        "LIVE Entry.\n\nFirst, give me the signal I need to understand the room.\n\nWhat is your role in the conversation — your position or title?\n\nExamples: founder, candidate, patient, manager, investor, customer, or decision maker.",
    }

    setMessages((prev) => {
      const visible = prev.filter((message) => String(message.content || '').trim() !== 'GEORGE')
      const next = [...visible, liveSignalMessage]
      messagesRef.current = next
      return next
    })

    setInput('')
    setInterimTranscript('')
    setVoiceError('')
    setSuggestedPrompts([])
    setSuggestedSignal(Date.now())
    setRerouteSignal(0)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)

    if (params.get('start') === '1') {
      window.location.href = '/george/live-entry?source=start'
      return
    }

    if (params.get('live') !== '1') return

    const shouldResume = params.get('resume') === '1'

    window.history.replaceState({}, '', '/george')

    if (shouldResume) {
      window.setTimeout(() => {
        setToastMessage('Open the sidebar to resume LIVE conversations.')
        setShowToast(true)
        setShowSidebar(true)
      }, 80)
      return
    }

    window.setTimeout(() => startLiveSignalAcquisition(), 80)
  }, [])

  const restoreNormalDraft = () => {
    if (typeof window === 'undefined') return false

    try {
      const rawDraft = window.localStorage.getItem(GEORGE_LAST_NORMAL_DRAFT)
      const draft = rawDraft ? JSON.parse(rawDraft) : null
      const draftMessages = Array.isArray(draft?.messages) ? draft.messages : []

      if (!draftMessages.length) return false

      skipNextTypewriterRef.current = true
      restoredMessagesSignatureRef.current = getMessagesSignature(draftMessages)

      setMessages(draftMessages)
      messagesRef.current = draftMessages

      if (typeof draft?.conversationMode === 'string') {
        setConversationMode(draft.conversationMode as typeof conversationMode)
      } else {
        setConversationMode(null)
      }

      if (typeof draft?.activePromptContext === 'string') {
        setActivePromptContext(draft.activePromptContext)
      } else {
        setActivePromptContext(null)
      }

      normalSessionWriteReadyRef.current = true
      liveSessionWriteReadyRef.current = false
      setActiveMode('normal')

      return true
    } catch {
      return false
    }
  }

  const enterLiveMode = () => {
    const normalMessages = [...messagesRef.current]

    preLiveSessionIdRef.current = getActiveSessionIdForMode('normal')
    setPreLiveMessages(normalMessages)
    preserveNormalDraft()

    setLiveMode(true)
  }

  const requestExitLiveMode = () => {
    setShowExitPopup(true)
  }

  const exitLiveMode = () => {
    try {
      stopLiveAudioRuntime()
      stopListening()
      window.speechSynthesis.cancel()
    } catch {}

    setLiveMode(false)
    setVoiceOn(false)
    setInteractionMode('text')
    setConversationMode(null)
    setShowConversationMenu(false)
    setConversationMenuLane('selector')
    setShowSessionPicker(false)
    setShowCampaignMenu(false)
    setShowRecentFolders(false)
    setActivePromptContext(null)
    setActivePromptLabel(null)
    setStableLiveGuidance(null)
    setInterimTranscript('')
    setVoiceError('')

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('george_active_context')
      window.localStorage.removeItem('george_active_label')
      window.localStorage.setItem('george_voice', 'off')
    }

    const restoredDraft = restoreNormalDraft()

    if (!restoredDraft && preLiveMessages) {
      skipNextTypewriterRef.current = true

      if (preLiveSessionIdRef.current) {
        setActiveSessionIdForMode('normal', preLiveSessionIdRef.current)
      }

      setActiveMode('normal')
      liveSessionWriteReadyRef.current = false
      normalSessionWriteReadyRef.current = true

      setLiveMode(false)
      setConversationMode(null)
      setActivePromptContext(null)

      setMessages(preLiveMessages)
      messagesRef.current = preLiveMessages
      setTypedMessageIndex(null)
      setTypedMessageContent('')
    }
// save LIVE conversation if meaningful
if (messagesRef.current.length > 2) {
  try {
    saveSessionToV2({
      mode: 'live',
      title: getActiveLiveDesiredOutcomeTitle('LIVE Conversation'),
      messages: messagesRef.current,
      summary: 'LIVE Conversation checkpoint.',
      userGoal: 'In progress',
      lastKnownState: 'User exited LIVE mode.',
      suggestedRestart: 'Resume this LIVE Conversation naturally.',
      metadata: {},
    })
  } catch {}
}

setPreLiveMessages(null)

    if (typeof window !== 'undefined' && window.location.pathname === '/george/live') {
      router.replace('/george')
    }
  }
  const startNewGeorgeSession = (openingMessage: Message, sessionLabel = 'GEORGE Session') => {
    if (typeof window !== 'undefined' && messagesRef.current.length > 1) {
      try {
        saveSessionToV2({
          mode: liveMode ? 'live' : 'normal',
          title: liveMode
            ? getActiveLiveDesiredOutcomeTitle(sessionLabel)
            : deriveNormalSessionTitleFromMessages(messagesRef.current, sessionLabel),
          messages: messagesRef.current,
          summary: liveMode ? 'LIVE Conversation saved before starting a new session.' : 'GEORGE session saved before starting a new session.',
          userGoal: activePromptLabel || 'Not set',
          lastKnownState: 'Saved after user interaction.',
          suggestedRestart: liveMode
            ? 'Resume this LIVE Conversation naturally.'
            : 'Resume this GEORGE session from the clearest next step.',
        })
      } catch {}
    }

    if (conversationMode === 'manual_live') {
  // initialize LIVE surface
  setMessages([])
  messagesRef.current = []
  const liveIntro: Message = {
    role: 'assistant',
    content: `I’m listening.

You don’t have to explain everything up front.
As you speak, I’ll pick up the room.

If you need help, just say things like:
“hold on…”
“how do I say this?”
“what’s the word I’m looking for?”
“let me put that another way…”
“help me here”

I’ll stay with you.`
  }

  const subscriberMetadata = getSubscriberSessionMetadata()
  if (subscriberMetadata) {
    liveSessionWriteReadyRef.current = true
  }
  setMessages([liveIntro])
  messagesRef.current = [liveIntro]
} else {
  const subscriberMetadataForOpening = getSubscriberSessionMetadata()
  if (subscriberMetadataForOpening) {
    liveSessionWriteReadyRef.current = true
  }
  setMessages([openingMessage])
  messagesRef.current = [openingMessage]
}
    setInput('')
    setInterimTranscript('')
    setVoiceError('')
    setSuggestedPrompts([])
    setSuggestedSignal(0)
    setReroutePrompt(null)
    setRerouteSignal(0)
    setContextTurnCount(0)
  }
  useEffect(() => {
    if (typeof window === 'undefined') return

    const activatePendingIntake = () => {
      const pending = window.localStorage.getItem('george_intake_pending')

      if (pending !== 'pro') return

      window.localStorage.removeItem('george_intake_pending')

      // LIVE handled by state/session
setAttemptStartTime(Date.now())
      setConversationMode('professional_intake')
      setActivePromptContext('professional_intake')
      setActivePromptLabel('Pro Conversation Partner')
      setShowConversationMenu(false);

      (async () => {
        try {
          const res = await fetch('/api/typeform')
          const data = await res.json()

          const latestSubmission = Array.isArray(data?.submissions) ? data.submissions[0] : null
          const mapped = latestSubmission?.mapped || {}

          const productOrService = mapped.product_service || mapped.product_or_service || mapped.offer || 'the product or service'
          const targetAudience = mapped.target_audience || mapped.audience || mapped.customer || 'the target audience'
          const campaignGoal = mapped.goal || mapped.outcome || mapped.objective || 'move the conversation toward the next clear step'
          const campaignConstraints = mapped.constraints || mapped.guardrails || mapped.notes || 'stay clear, respectful, and compliant'

          const campaignLabel = `${campaignGoal} — ${productOrService}`.slice(0, 72)

          const campaignContext = `

Product / Service:
${productOrService}

Target Audience:
${targetAudience}

Direction:
${campaignGoal}

Constraints:
${campaignConstraints}

GEORGE will:
- give you repeatable lines
- guide you in real time
- help you stay in control of the conversation

If you're using this to close deals or set appointments:

Pro:
- remembers every interaction
- tracks what works and what fails
- improves your next attempt automatically
- prepares your next conversation with advantage

(30-day access requires a payment method)

Start by giving the user one strong opening line, one backup line, and one cue.`

          const newCampaign = {
            id: `campaign_${Date.now()}`,
            type: 'campaign',
            label: campaignLabel,
            createdAt: Date.now(),

            //  campaign intelligence layer
            intelligence: {
              productOrService,
              targetAudience,
              campaignGoal,
              campaignConstraints,

              // future Typeform expansion
              dataToDetect: mapped.data_to_detect || [],
              dataToSave: mapped.data_to_save || [],
              deliveryTarget: mapped.delivery_target || 'user',
              region: mapped.region || 'general',
              userWeakness: mapped.user_weakness || 'unknown',
              channel: mapped.channel || 'phone'
            },

            // 📊 performance tracking
            performance: {
              calls: 0,
              objections: 0,
              callbacks: 0,
              closes: 0,
              weakSpots: []
            },

            campaignContext,
            savedEnvironment: {
              context: campaignContext,
              assistMode: "professional_live",
              outputStyle: "short_cues",
              deliveryMode: "text"
            }
          }

          saveSessionToV2({
            id: newCampaign.id,
            mode: 'live',
            title: newCampaign.label || 'LIVE Session',
            messages: [
              {
                role: 'assistant',
                content: campaignContext,
              },
            ],
            summary: 'Structured LIVE session created from setup.',
            userGoal: newCampaign.intelligence?.campaignGoal || 'LIVE continuity',
            lastKnownState: 'LIVE continuity loaded.',
            suggestedRestart: 'Resume this LIVE Session and continue from the strongest operational next move.',
            metadata: {
              activeCampaignId: newCampaign.id,
              campaignName: newCampaign.label,
              productOrService: newCampaign.intelligence?.productOrService,
              targetAudience: newCampaign.intelligence?.targetAudience,
              desiredOutcome: newCampaign.intelligence?.campaignGoal,
              campaignContext,
            },
          })

          startNewGeorgeSession(
            {
              role: 'assistant',
              content: campaignContext
            },
            'LIVE Loaded'
          )

        } catch (e) {
          console.error("Campaign creation failed", e)
        }
      })()
    }

    activatePendingIntake()
  }, [])

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [showScrollHint, setShowScrollHint] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const checkScroll = () => {
      const el = messagesEndRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight

      setShowScrollHint(!inView)
    }

    window.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      window.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [isThinking, bridgeThinking])

  const scrollHostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleArrowScroll = (event: globalThis.KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

      const active = document.activeElement
      const isComposer = active === textareaRef.current
      const isEditing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)

      if (isEditing && (!isComposer || input.trim())) return

      event.preventDefault()

      window.scrollBy({
        top: event.key === 'ArrowDown' ? 120 : -120,
        behavior: 'smooth',
      })
    }

    window.addEventListener('keydown', handleArrowScroll)
    return () => window.removeEventListener('keydown', handleArrowScroll)
  }, [input])
  const userPinnedBottomRef = useRef(true)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

useEffect(() => {
  const el = textareaRef.current
  if (!el) return

  el.style.height = '0px'
  const nextHeight = Math.min(Math.max(el.scrollHeight, 24), 144)
  el.style.height = `${nextHeight}px`
}, [input])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const autoResizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    const maxHeight = 180
    const next = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    autoResizeTextarea()
  }, [input, interimTranscript, autoResizeTextarea])
  const promptMenuRef = useRef<HTMLDivElement | null>(null)
  const hasUserInteractedRef = useRef(false)

  const getExistingFolders = () => {
    if (typeof window === 'undefined') return [] as string[]

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_WORKSPACE') || '[]')
    const folders = Array.from(
      new Set(
        existing
          .map((item: { folder?: string }) => (item.folder || '').trim())
          .filter((folder: string) => folder && folder !== 'Scripts')
      )
    ) as string[]

    const lastUsedFolder = (window.localStorage.getItem('GEORGE_LAST_FOLDER') || '').trim()
    if (!lastUsedFolder) return folders

    return [
      lastUsedFolder,
      ...folders.filter((folder) => folder !== lastUsedFolder),
    ]
  }

  const getDefaultFolder = () => {
    if (typeof window === 'undefined') return 'general'
    const existingFolders = getExistingFolders()
    const lastUsedFolder = (window.localStorage.getItem('GEORGE_LAST_FOLDER') || '').trim()
    return lastUsedFolder || existingFolders[0] || 'general'
  }

  const getMemoriesByFolder = (folder: string) => {
    if (typeof window === 'undefined') return []

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_WORKSPACE') || '[]') as any[]

    return existing
      .filter((item) => (item.type || 'memory') === 'memory' && (item.folder || '').trim() === folder.trim())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }

  const getCampaigns = () => {
    if (typeof window === 'undefined') return []

    try {
      return getCampaignSessions()
    } catch {
      return []
    }
  }

  const getFolderItems = (folder: string) => {
    if (typeof window === 'undefined') return []

    const memoryItems = getMemoriesByFolder(folder)

    const campaigns = getCampaigns()

    const campaignItems = campaigns.map((session: any) => ({
      ...session,
      type: "campaign",
      folder: "campaigns",
    }))

    return [...memoryItems, ...campaignItems]
  }


  const getLatestSavedMemoryByFolder = (folder: string) => {
    if (typeof window === 'undefined') return null

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_WORKSPACE') || '[]') as Array<{
      type?: 'memory' | 'campaign'
      content?: string
      role?: string
      folder?: string
      timestamp?: number
      savedPair?: boolean
      userPromptContent?: string | null
    }>

    const matches = existing
      .filter((item) => (item.type || 'memory') === 'memory' && (item.folder || '').trim() === folder.trim())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    if (!matches.length) return null

    const latest = matches[0]
    const assistantPart = (latest.content || '').trim()
    const userPart = (latest.userPromptContent || '').trim()

    if (latest.savedPair && userPart && assistantPart) {
      return `Continuation memory (${folder})\nUser: ${userPart}\nGEORGE: ${assistantPart}`
    }

    if (assistantPart) {
      return `Continuation memory (${folder})\n${assistantPart}`
    }

    return null
  }

  const saveGoal = (message: Message, messageIndex: number) => {
    if (typeof window === 'undefined') return

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_WORKSPACE') || '[]')
    const previousUserMessage =
      message.role === 'assistant'
        ? [...messagesRef.current.slice(0, messageIndex)].reverse().find((item) => item.role === 'user') || null
        : null

    const sourceText = previousUserMessage?.content || message.content || ''
    const assistantText = message.role === 'assistant' ? message.content || '' : ''
    const titleSource = sourceText || assistantText || 'Active direction'
    const cleanTitle = titleSource.replace(/\s+/g, ' ').trim().slice(0, 110)
    const cleanSummary = assistantText.replace(/\s+/g, ' ').trim().slice(0, 220)

    existing.push({
      id: `goal_${Date.now()}`,
      type: 'goal',
      status: 'active',
      trajectoryTitle: cleanTitle || 'Active direction',
      trajectorySummary: cleanSummary || 'GEORGE will keep this in chamber until you finish, clear, or share it.',
      content: message.content,
      preview: cleanTitle || 'Active direction',
      role: message.role,
      folder: 'Goals',
      timestamp: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      savedPair: message.role === 'assistant',
      userPromptContent: previousUserMessage?.content || null,
      completionState: 'unfinished',
      source: 'user_classified_goal',
    })

    window.localStorage.setItem('GEORGE_WORKSPACE', JSON.stringify(existing))
    window.localStorage.setItem('GEORGE_LAST_FOLDER', 'Goals')
    setMemoryVersion((prev) => prev + 1)
    setToastMessage('Kept in chamber')
    setShowToast(true)
    setActiveSaveIndex(null)
    setNewFolderName('')
  }

  const saveMemory = (message: Message, messageIndex: number, folderOverride?: string) => {
    if (typeof window === 'undefined') return

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_WORKSPACE') || '[]')
    const chosenFolder = (folderOverride || getDefaultFolder()).trim() || 'general'

    const previousUserMessage =
      message.role === 'assistant'
        ? [...messagesRef.current.slice(0, messageIndex)].reverse().find((item) => item.role === 'user') || null
        : null

    const abbreviated =
      message.role === 'assistant'
        ? (message.content || '').split('\n')[0].slice(0, 120)
        : (message.content || '').slice(0, 120)

    existing.push({
      type: 'memory',
      content: message.content,
      preview: abbreviated,
      role: message.role,
      folder: chosenFolder,
      timestamp: Date.now(),
      savedPair: message.role === 'assistant',
      userPromptContent: previousUserMessage?.content || null,
    })

    window.localStorage.setItem('GEORGE_WORKSPACE', JSON.stringify(existing))
    window.localStorage.setItem('GEORGE_LAST_FOLDER', chosenFolder)
    setMemoryVersion((prev) => prev + 1)
    setToastMessage(`Saved to ${chosenFolder}`)
    setShowToast(true)
    setActiveSaveIndex(null)
    setNewFolderName('')
  }

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (liveMode || isManualLive) return
    if (!Array.isArray(messages) || messages.length === 0) return

    const hasUserMessage = messages.some(
      (message) => message.role === 'user' && String(message.content || '').trim().length > 0
    )

    if (!hasUserMessage) return

    window.localStorage.setItem(
      GEORGE_LAST_NORMAL_DRAFT,
      JSON.stringify({
        messages,
        conversationMode,
        activePromptContext,
        currentTier,
        updatedAt: Date.now(),
      })
    )
  }, [messages, liveMode, conversationMode, activePromptContext, currentTier])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!normalSessionWriteReadyRef.current) return
    if (liveMode || isManualLive) return
    if (!messages.length) return

    const subscriberMetadata = getSubscriberSessionMetadata()
    if (!subscriberMetadata) return
    updateActiveSessionMessages(messages, 'normal', subscriberMetadata)
  }, [messages, liveMode, conversationMode, activePromptContext])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!liveSessionWriteReadyRef.current) return
    if (!liveMode && !isManualLive) return
    if (!messages.length) return

    const subscriberMetadata = getSubscriberSessionMetadata()
    if (!subscriberMetadata) return
    updateActiveSessionMessages(messages, 'live', subscriberMetadata)
  }, [messages, liveMode, conversationMode, activePromptContext])

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => {
      setShowToast(false)
    }, 1600)
    return () => clearTimeout(timer)
  }, [showToast])

  useEffect(() => {
    if (!userPinnedBottomRef.current && !liveMode) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
requestAnimationFrame(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
})
  }, [messages, isThinking])


  useEffect(() => {
    if (!isThinking) return
    const interval = setInterval(() => {
      setThinkingDots((d) => (d % 3) + 1)
    }, 400)
    return () => clearInterval(interval)
  }, [isThinking])


  useEffect(() => {
    if (!windowEndsAt) return

    const interval = setInterval(() => {
      if (Date.now() >= windowEndsAt) {
        setIsFullMode(false)
        setWindowEndsAt(null)
        window.localStorage.removeItem('george_full_until')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [windowEndsAt])



  const availableFolders = useMemo(() => getExistingFolders(), [messages, activeSaveIndex, memoryVersion])
  const recentFolders = useMemo(() => availableFolders, [availableFolders])

  const SpeechRecognitionCtor = useMemo(() => {
    if (typeof window === 'undefined') return null
    return window.SpeechRecognition || window.webkitSpeechRecognition || null
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return

      const insideSavePicker = savePickerRef.current?.contains(target) ?? false
      const insideFolderBrowser = folderBrowserRef.current?.contains(target) ?? false
      const insidePromptMenu = promptMenuRef.current?.contains(target) ?? false
      const insideLanguageMenu = (target as Element | null)?.closest?.('[data-george-language-menu]') ?? false

      if (!insideSavePicker && !insideFolderBrowser && !insidePromptMenu && !insideLanguageMenu) {
        setShowLanguageMenu(false)
        setShowPromptMenu(false)
        setShowRecentFolders(false)
        setActiveMemoryFolder(null)
        setActiveSaveIndex(null)
        setRewordPopupIndex(null)
        setTonePopupIndex(null)
      }
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()

      const typing =
        tag === 'input' ||
        tag === 'textarea' ||
        target?.isContentEditable

      if (event.key === 'Escape') {
        setShowPromptMenu(false)
        setShowLanguageMenu(false)
      }

      if (typing && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      if (typing && event.shiftKey) return

      const scrollHost = scrollHostRef.current

      if (!scrollHost) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()

        scrollHost.scrollBy({
          top: 120,
          behavior: 'smooth',
        })
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()

        scrollHost.scrollBy({
          top: -120,
          behavior: 'smooth',
        })
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOpenMemoryFolder = (event: Event) => {
      const folder = (event as CustomEvent<string>).detail
      if (!folder) return

      const prompt =
        folder === 'Credit'
          ? "Help me tighten my credit situation and show me the strongest path."
          : folder === 'Business'
          ? "Help me improve the business path in front of me."
          : folder === 'Legal'
          ? "Help me understand the legal issue clearly and cautiously."
          : folder === 'Funding'
          ? "Help me think clearly about funding and show me the strongest path."
          : "Help me find the strongest next move." 

      setInput(prompt)

      setTimeout(() => {
        void handleSend(prompt)
      }, 0)

      setShowRecentFolders(false)
      setActiveMemoryFolder(folder)
      setShowSidebar(false)
    }

    window.addEventListener('open-memory-folder', handleOpenMemoryFolder as EventListener)

    return () => {
      window.removeEventListener('open-memory-folder', handleOpenMemoryFolder as EventListener)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = window.navigator.userAgent
    setIsIOS(/iPhone|iPad|iPod/i.test(ua))
    setIsAndroid(/Android/i.test(ua))

    const storedName = window.localStorage.getItem('george_name') || ''
    const storedBirthdayMD = window.localStorage.getItem('george_birthday_md') || ''
    const storedVoiceSpeed = Number(window.localStorage.getItem('george_voice_speed') || '1.4')
    const storedVoiceType = window.localStorage.getItem('george_voice_type') || 'ash'
    const nameLocked = window.localStorage.getItem('george_name_locked') === 'true'
    const voiceLocked = window.localStorage.getItem('george_voice_locked') === 'true'

    const storedWindowEnd = window.localStorage.getItem('george_full_until')
    if (storedWindowEnd) {
      const end = Number(storedWindowEnd)
      if (Date.now() < end) {
        setIsFullMode(true)
        setWindowEndsAt(end)
      } else {
        window.localStorage.removeItem('george_full_until')
      }
    }

    const personalized = window.localStorage.getItem('george_personalized') === 'true'

    if (currentTier === 'smart') {
      setProfileName('')
      window.localStorage.setItem('george_name_locked', 'true')
      window.localStorage.setItem('george_voice_locked', 'true')
    } else {
      setProfileName(personalized ? storedName : '')
      setDraftProfileName(personalized ? storedName : '')
      window.localStorage.setItem('george_name_locked', personalized ? 'false' : 'true')
      window.localStorage.setItem('george_voice_locked', personalized ? 'false' : 'true')
    }

    if (personalized && ['ash', 'coral'].includes(storedVoiceType)) {
      setVoiceType(storedVoiceType)
    }

    setBirthdayMD(storedBirthdayMD)

    if ([0.8, 1, 1.2, 1.4].includes(storedVoiceSpeed)) {
      setVoiceSpeed(storedVoiceSpeed)
    }

    if (currentTier === 'smart') {
      setInteractionMode('text')
      setVoiceOn(false)
      window.localStorage.setItem('george_voice', 'off')
    } else {
      setInteractionMode('text')
      setVoiceOn(false)
      window.localStorage.setItem('george_voice', 'off')

    }

    const params = new URLSearchParams(window.location.search)
    const shared = params.get('shared')
    const prompt = params.get('prompt')
    const context = params.get('context')
    const label = params.get('label')
    if (shared) {
      setInput(shared)
      if (textareaRef.current) {
      }
    }

    if (prompt) {
      setInput(prompt)
      if (textareaRef.current) {
      }
    }

    if (context) {
      setActivePromptContext(context)
      setContextTurnCount(0)
    }

    if (label) {
      setActivePromptLabel(label)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (currentTier === 'smart') {
      setVoiceOn(false)
      if (interactionMode === 'speech') {
        setInteractionMode('text')
      }
      window.localStorage.setItem('george_voice', 'off')
      return
    }

    window.localStorage.setItem('george_voice', voiceOn ? 'on' : 'off')
  }, [currentTier, interactionMode, voiceOn])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (currentTier === 'smart') return
    window.localStorage.setItem('george_voice_speed', String(voiceSpeed))
  }, [voiceSpeed, currentTier])


  const tagline = `I will not contradict the Holy Bible (KJV).`

  const heroTitle = useMemo(() => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const monthDay = `${month}-${day}`
    const hour = now.getHours()
    const nameSuffix = profileName ? `, ${profileName}` : ''

    if (birthdayMD && monthDay === birthdayMD) {
      return `Happy birthday${nameSuffix}.`
    }

    if (monthDay === '01-01') {
      return 'Happy New Year.'
    }

    if (monthDay === '12-25') {
      return 'Merry Christmas.'
    }

    return getInitialGreeting(profileName, currentTier)
  }, [birthdayMD, profileName, currentTier])



  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.()
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (liveMode) {
      return
    }

    if (!recognitionRef.current || isIOS) {
      setVoiceError('Voice input is not available on this device yet.')
      return
    }

    if (isListening || isThinking || speakingRef.current) return

    setVoiceError('')
    setInterimTranscript('')

    try {
      recognitionRef.current.start()
    } catch {
      // browser timing collisions
    }
  }, [isIOS, isListening, isThinking])

  function splitForSpeech(text: string): string[] {
    const cleaned = text.replace(/\s+/g, ' ').trim()
    if (!cleaned) return []
    if (cleaned.length <= 420) return [cleaned]

    return cleaned
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .flatMap((sentence) => {
        if (sentence.length <= 420) return [sentence]

        const parts = sentence
          .split(/[,;:—-]\s+/)
          .map((p) => p.trim())
          .filter(Boolean)

        return parts.length ? parts : [sentence]
      })
  }

  function pauseMs(chunk: string) {
    if (/[?]$/.test(chunk)) return 25
    if (/[!]$/.test(chunk)) return 18
    if (/[,;:—-]/.test(chunk)) return 8
    return 0
  }

  function wait(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
  }

  function stopBridgeSpeech() {
    if (bridgeTimerRef.current) {
      clearTimeout(bridgeTimerRef.current)
      bridgeTimerRef.current = null
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    bridgeSpeechRef.current = null
  }

  function startBridgeSpeech() {
    return
  }

  async function stopSpeech() {
    stopSpeechRef.current = true
    speechQueueRef.current = []
    stopBridgeSpeech()

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.oncanplaythrough = null
      audioRef.current = null
    }

    speakingRef.current = false
    isSpeakingRef.current = false
    setIsSpeaking(false)
  }

  async function fetchSpeech(text: string) {
    // block TTS for Smart tier
    if (currentTier === 'smart') {
      return null
    }

    const res = await fetch(liveMode ? '/api/george/live/tts' : '/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: liveMode
        ? JSON.stringify({ text })
        : JSON.stringify({
            mode: activeCampaign ? 'campaign' : 'normal',
            forceClose,
            input: text,
            speed: voiceSpeed,
            tier: currentTier,
            voice: voiceType,
          }),
    })

    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      console.error('[GEORGE TTS FAILED]', res.status, msg)
      throw new Error(`TTS failed: ${res.status}`)
    }

    const buffer = await res.arrayBuffer()
    if (!buffer.byteLength) {
      throw new Error('TTS returned empty audio')
    }

    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }

    const base64 = btoa(binary)
    const dataUrl = `data:audio/mpeg;base64,${base64}`
    return dataUrl
  }

  function revealPendingAssistantMessage() {
    if (assistantRevealedRef.current) return
    if (!pendingAssistantMessage) return

    assistantRevealedRef.current = true

    setMessages((prev) => {
      const next = [...prev, pendingAssistantMessage]
      messagesRef.current = next

      try {
        const subscriberMetadata = getSubscriberSessionMetadata()
        if (subscriberMetadata) {
          updateActiveSessionMessages(next, liveMode ? 'live' : 'normal', subscriberMetadata)
        }
      } catch {}
      return next
    })

    setPendingAssistantMessage(null)

// CLEAR ACTIVE PROMPT AFTER USE
if (activePromptContext || activePromptLabel) {
  setActivePromptContext(null)
  setActivePromptLabel(null)
  setContextTurnCount(0)
}

  }

  async function playQueue() {
    if (isSpeakingRef.current) return

    isSpeakingRef.current = true
    stopSpeechRef.current = false
    speakingRef.current = true
    setIsSpeaking(true)

    try {
      while (speechQueueRef.current.length && !stopSpeechRef.current) {
        const chunk = speechQueueRef.current.shift()
        if (!chunk) continue

        const url = await fetchSpeech(chunk)
        if (!url) continue

        await new Promise<void>((resolve, reject) => {
          const audio = new Audio()
          audioRef.current = audio
          stopBridgeSpeech()

          audio.preload = 'auto'
          audio.setAttribute('playsinline', 'true')
          audio.src = url

          audio.onended = () => {
            resolve()
          }

          audio.onerror = (event) => {
            if (stopSpeechRef.current) {
              resolve()
              return
            }

            console.error('Audio playback failed', event, {
              currentSrc: audio.currentSrc,
              networkState: audio.networkState,
              readyState: audio.readyState,
              error: audio.error ? {
                code: audio.error.code,
                message: audio.error.message,
              } : null,
            })
            reject(new Error('Audio playback failed'))
          }

          let playStarted = false

          const startAudioPlayback = () => {
            if (playStarted) return
            playStarted = true

            revealPendingAssistantMessage()

            setTimeout(() => {
              if (stopSpeechRef.current) {
                resolve()
                return
              }

              audio.play().then(() => {
                console.info('[GEORGE AUDIO PLAYING]')
              }).catch((err) => {
                if (stopSpeechRef.current) {
                  resolve()
                  return
                }

                console.error('audio.play() failed', err)
                reject(err)
              })
            }, 80)
          }

          audio.oncanplaythrough = startAudioPlayback
          audio.oncanplay = startAudioPlayback
          audio.onloadeddata = startAudioPlayback

          audio.load()
          setTimeout(startAudioPlayback, 450)
        })

        if (!stopSpeechRef.current) {
          await wait(pauseMs(chunk))
        }
      }
    } finally {
      isSpeakingRef.current = false
      speakingRef.current = false
      audioRef.current = null
      setIsSpeaking(false)
    }
  }

  const speakText = useCallback(
    async (text: string) => {      if (typeof window === 'undefined') return
      if (isIOS || !voiceOn || (!hasUserInteractedRef.current && !liveMode)) {
        return
      }

      try {
        setVoiceError('')
        await stopSpeech()

        const cleaned = text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
          .replace(/\s+/g, ' ')
          .trim()

        const chunks = splitForSpeech(cleaned)
        if (!chunks.length) {          return
        }

        if (liveMode) {
          const spokenMemory = rememberLiveSpokenLine({
            line: cleaned,
            previousRecentLines: liveRecentSpokenUtterancesRef.current,
          })

          liveLastSpokenUtteranceRef.current = spokenMemory.lastSpokenLine
          liveRecentSpokenUtterancesRef.current = spokenMemory.recentSpokenLines
        }

        speechQueueRef.current = chunks
        await playQueue()
      } catch {
        revealPendingAssistantMessage()
        speakingRef.current = false
        isSpeakingRef.current = false
        setIsSpeaking(false)
        setVoiceError('Voice reply failed.')
      }
    },
    [interactionMode, isIOS, voiceOn, voiceSpeed, currentTier, liveMode]
  )

  const generateReroutePrompt = (input: string, response: string, messages: any[]) => {
    const recent = messages.slice(-6).map((m: any) => m.content).join(' ').toLowerCase()
    const current = `${input} ${response}`.toLowerCase()

    const weakSignals = [
      /i don't know/,
      /not sure/,
      /maybe/,
      /stuck/,
      /confused/,
      /overwhelmed/,
      /nothing works/,
      /i need money/,
      /make money fast/,
      /build an app and also/,
      /too many things/,
      /all over the place/,
    ]

    const matched = weakSignals.some((pattern) => pattern.test(current) || pattern.test(recent))

    if (!matched) return null

    return {
      label: 'New strategy',
      text: 'New strategy',
      context: 'reroute',
    }
  }

  const generatePrompts = (input: string, response: string, messages: any[]) => {
    const prompts: PromptSelection[] = []

    const recent = messages.slice(-4).map(m => m.content).join(' ').toLowerCase()
    const constrainedResponse =
      currentTier === 'smart' &&
      /i’m going to give you the right direction here, but i’m not carrying this fully in this mode/i.test(response)

    if (constrainedResponse) {
      prompts.push({
        label: 'Work around this',
        text: 'Give me the best workaround you can carry in Smart.',
        context: 'smart_workaround',
      })

      prompts.push({
        label: 'Lighter version',
        text: 'Break this into the lighter version you can carry right now.',
        context: 'smart_lighter_version',
      })

      prompts.push({
        label: 'Smaller first move',
        text: 'What is the strongest first move you can give me in this mode?',
        context: 'smart_first_move',
      })

      prompts.push({
        label: 'Make G. Intelligent',
        text: 'Take me to Intelligent level support.',
        context: 'upgrade_intelligent',
      })

      prompts.push({
        label: 'Pricing',
        text: 'Show me the upgrade path for deeper support.',
        context: 'upgrade_topup',
      })

      return prompts
    }

    if (/build|app|product|platform/i.test(input) || /build|app|product/.test(recent)) {
      prompts.push({
        label: 'Define user',
        text: 'Who is the exact user for this?',
        context: 'clarify audience',
      })

      prompts.push({
        label: 'Core problem',
        text: 'What is the one core problem this solves?',
        context: 'focus problem',
      })
    }

    if (/money|income|revenue|make money/i.test(input) || /money|income/.test(recent)) {
      prompts.push({
        label: 'Fast revenue',
        text: 'What is the fastest way to get paid for this?',
        context: 'monetization',
      })
    }

    if (prompts.length === 0) {
      prompts.push({
        label: 'Next step',
        text: 'What is the next step from here?',
        context: 'progress',
      })
    }

    if (prompts.length < 5) {
      const fallbackPrompts = [
        {
          label: 'Clarify goal',
          text: 'What are we actually trying to achieve here?',
          context: 'clarity',
        },
        {
          label: 'Constraints',
          text: 'What constraints matter most here?',
          context: 'constraints',
        },
        {
          label: 'Clarify',
          text: 'Can we simplify this into one clear move?',
          context: 'simplify',
        },
        {
          label: 'Better question',
          text: 'What is the better question to ask right now?',
          context: 'better_question',
        },
      ]

      fallbackPrompts.forEach((prompt) => {
        if (prompts.length < 5 && !prompts.some((p) => p.label === prompt.label)) {
          prompts.push(prompt)
        }
      })
    }

    return prompts
  }

  

  // DEV: ACTIVATE FULL MODE (2 HOURS)
  const activateFullMode = () => {
    const twoHours = 2 * 60 * 60 * 1000
    const end = Date.now() + twoHours

    setIsFullMode(true)
    setWindowEndsAt(end)
    window.localStorage.setItem('george_full_until', String(end))
  }






function detectDomain(text: string) {
  const t = text.toLowerCase()

  if (t.includes('credit') || t.includes('tradeline') || t.includes('score')) {
    return 'credit'
  }

  if (t.includes('cdl') || t.includes('truck') || t.includes('trucking')) {
    return 'cdl'
  }

  if (t.includes('ged') || t.includes('high school equivalency')) {
    return 'ged'
  }

  if (t.includes('cna') || t.includes('nursing assistant')) {
    return 'cna'
  }

  return null
}

const handleSend = useCallback(
    async (
      overrideText?: string,
      options?: {
        hidden?: boolean
        source?: Message['source']
      }
    ) => {
      let text = (overrideText ?? input).trim()

      const isConversationAssistContext =
        activePromptContext?.startsWith('conversation_assist_')

      const shouldForceNormalSend =
        !liveMode &&
        conversationMode !== 'manual_live' &&
        isConversationAssistContext

      if (shouldForceNormalSend) {

        setActivePromptContext(null)
        setActivePromptLabel(null)
      }

      const liveRuntimeSetup = (() => {
        if (typeof window === 'undefined' || !liveMode) return null

        try {
          const raw =
            window.localStorage.getItem('george_live_setup_active')

          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      })()

      const domain = detectDomain(text)

      const memoryDomain =
        activeMemoryFolder === 'Credit' ? 'credit' :
        activeMemoryFolder === 'Legal' ? null :
        activeMemoryFolder === 'Health' ? null :
        activeMemoryFolder === 'Business' ? null :
        activeMemoryFolder === 'Goals' ? null :
        activeMemoryFolder === 'Writing' ? null :
        activeMemoryFolder === 'Personal' ? null :
        null

      let activeDomain = domain || memoryDomain || null

      // persist domain only when explicitly detected from current text
      if (domain) {
        setLastDomain(domain)
      } else if (lastDomain && activeDomain === null) {
        setLastDomain(null)
      }

      let domainPrefix = ""
      let creditIntent = ""
      let lastCreditIntent = messagesRef.current
        .slice()
        .reverse()
        .find(m =>
          m.role === 'user' &&
          /tradeline|authorized user/i.test(m.content || '')
        ) ? "tradelines" : ""
      let creditType = ""
      let firstResponseOverride = null

      const brilliantLiveTrigger = liveMode
        ? buildBrilliantLiveTriggerResponse(
            text,
            currentTier,
            activePromptContext,
            conversationMode
          )
        : null
      if (brilliantLiveTrigger) {
        setConversationSignal('LIVE cue')
        setAdaptiveCueLabel('Guidance update')
        setLastGuidedLine('Brilliant live cue used.')
        setInput('')
        setInterimTranscript('')
        if (textareaRef.current) {
          textareaRef.current.focus()
        }

        const userMessage: Message = {
          role: 'user',
          content: text,
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: brilliantLiveTrigger,
        }

        const nextMessages: Message[] = [...messagesRef.current, userMessage, assistantMessage]
        setMessages(nextMessages)
setTimeout(() => {
  setShowOutcomeBar(true)
  setLastOutcomeContext("post_call")
}, 1200)


        messagesRef.current = nextMessages
        return
      }

      

      const answers = extractAnswers(text)
      if (answers.length >= 3) {
        const track = detectTrainingTrack(text)

        if (track === 'drivers') {
          const result = evaluateDrivers(answers)
          setLastGuidedLine(result.score === result.total ? "You’re solid. Move forward." : `You got ${result.score}/${result.total}. Fix weak points and try again.`)
          return buildEvaluationResponse(result)
        }

        if (track === 'cdl') {
          const result = evaluateCDL(answers)
          setLastGuidedLine(result.score === result.total ? "You’re solid. Move forward." : `You got ${result.score}/${result.total}. Fix weak points and try again.`)
          return buildEvaluationResponse(result)
        }

        if (track === 'ged') {
          const result = evaluateGED(answers)
          setLastGuidedLine(result.score === result.total ? "You’re solid. Move forward." : `You got ${result.score}/${result.total}. Fix weak points and try again.`)
          return buildEvaluationResponse(result)
        }

        if (track === 'cna') {
          const result = evaluateCNA(answers)
          setLastGuidedLine(result.score === result.total ? "You’re solid. Move forward." : `You got ${result.score}/${result.total}. Fix weak points and try again.`)
          return buildEvaluationResponse(result)
        }
      }


const trainingFollowThrough = buildTrainingFollowThrough(text, activePromptContext)
      if (trainingFollowThrough) {
        firstResponseOverride = trainingFollowThrough
      }

      const trainingOverride = buildTrainingIntakeOverride(text)
      if (!firstResponseOverride && trainingOverride) {
        firstResponseOverride = trainingOverride
      }



      if ((forceLive || liveMode) && isLiveIdentityQuestion(text)) {
        const identityUserMessage: Message = {
          role: 'user',
          content: text,
          source: options?.source || 'user_input',
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: buildLiveSelfDescription(),
          source: 'system_override',
        }

        const nextMessages: Message[] = [
          ...messagesRef.current,
          ...(options?.hidden ? [] : [identityUserMessage]),
          assistantMessage,
        ]

        setMessages(nextMessages)
        messagesRef.current = nextMessages
        setInput('')
        setPendingImage(null)
        setInterimTranscript('')
        setVoiceError('')
        setConversationSignal('LIVE identity')
        setIsThinking(false)
        void speakText(assistantMessage.content)
        return
      }

      if (!firstResponseOverride && activeDomain === 'credit') {
        const t = text.toLowerCase()

        let tradelineAdvice = ""

        if (
          t.includes('maxed') ||
          t.includes('maxed out') ||
          t.includes('cards are maxed') ||
          t.includes('credit cards are maxed') ||
          t.includes('utilization') ||
          t.includes('balance') ||
          t.includes('balances')
        ) {
          creditType = "utilization"
        } else if (t.includes('collection') || t.includes('charge off') || t.includes('late')) {
          creditType = "derogatory"
        } else if (t.includes('no credit') || t.includes('no history') || t.includes('thin file')) {
          creditType = "thin"
        } else if (t.includes('tradeline') || t.includes('authorized user')) {
          creditType = "tradelines"
        }

        if (creditType === "thin") {
          tradelineAdvice = "Tradelines may help if your file is thin, but they need to be clean, aged, and low utilization to matter."
        } else if (creditType === "utilization") {
          tradelineAdvice = "Tradelines won’t fix high utilization. Lowering your balances will have a much stronger impact."
        } else if (creditType === "derogatory") {
          tradelineAdvice = "Tradelines won’t remove negative marks. You need to focus on resolving or removing derogatory items first."
        } else if (creditType === "tradelines") {
          tradelineAdvice = "Tradelines can help in specific situations, but they are often overrated and misused."
        }

        if (
          t.includes('raise score') ||
          t.includes('increase score') ||
          t.includes('improve score') ||
          t.includes('boost score') ||
          t.includes('improve my score') ||
          t.includes('raise my score') ||
          t.includes('build my credit') ||
          t.includes('improve my credit')
        ) {
          creditIntent = "score"
        } else if (
          t.includes('approval') ||
          t.includes('approved') ||
          t.includes('loan') ||
          t.includes('car') ||
          t.includes('mortgage') ||
          t.includes('apartment')
        ) {
          creditIntent = "approval"
        } else if (
          t.includes('fix credit') ||
          t.includes('repair credit') ||
          t.includes('clean up credit')
        ) {
          creditIntent = "repair"
        } else if (
          t.includes('tradeline') ||
          t.includes('authorized user')
        ) {
          creditIntent = "tradelines"
        }

        if (!creditIntent && lastCreditIntent) {
          creditIntent = lastCreditIntent
        }

        domainPrefix = `You are helping with credit.

First, identify the user's real goal (raise score, get approved, fix profile).

Then:
- If utilization is the issue → focus on paydown timing and balance strategy
- If derogatories → focus on removal, not score tricks
- If thin file → tradelines may be relevant
- If tradelines mentioned → evaluate if they actually help or are a distraction

Do NOT assume tradelines are the answer.

Ask one sharp question that reveals what is actually holding them back.

Credit type detected: ${creditType || "unknown"}\nUser intent: ${creditIntent || "unknown"}\nTradeline guidance: ${tradelineAdvice || "evaluate case by case"}`
      }

      if (domain === 'cdl') {
        domainPrefix = "You are helping with CDL path. Focus on permit, training, test, endorsements, and job placement. Give the fastest credible path to income."
      }

      if (domain === 'ged') {
        domainPrefix = "You are helping with GED. Focus on passing strategy, weakest subject, scheduling, and speed to completion."
      }

      if (domain === 'cna') {
        domainPrefix = "You are helping with CNA. Focus on certification steps, exam, skills check, and fastest path to employment."
      }

      if (!text && !pendingImage) {
        setVoiceError('Type a message first.')
        return
      }

      if (!text && pendingImage) {
        text = `I uploaded image: ${pendingImage.name}. Describe the visible image briefly and help me use it. If a person appears, describe visible features only. Do not identify the person. Keep it concise.`
      }

      // allow override while thinking
      if (isThinking) {
        await stopSpeech()
        setIsThinking(false)
      }

      hasUserInteractedRef.current = true

      await stopSpeech()
      stopListening()

      const userMessage: Message | null = options?.hidden
        ? null
        : {
            role: 'user',
            content: text.trim(),
            imageDataUrl: pendingImage?.dataUrl || null,
          }

      if (!liveMode && activePromptContext === 'live_intent_bridge') {
        const lower = text.trim().toLowerCase()
        const noIntent = /^(no|nah|not now|cancel|accident|wrong|mistake|nevermind|never mind)\b/.test(lower)
        const yesIntent = /^(yes|yeah|yep|correct|right|that|this|do it|continue|live)\b/.test(lower)

        if (noIntent) {
          try {
            window.localStorage.removeItem('GEORGE_LIVE_INTENT_STAGE')
            window.localStorage.removeItem('GEORGE_PRE_LIVE_SOURCE_CONTEXT')
          } catch {}

          const next: Message[] = [
            ...messagesRef.current,
            ...(userMessage ? [userMessage] : []),
            { role: 'assistant', content: 'No problem. We’ll stay here.' },
          ]

          setMessages(next)
          messagesRef.current = next
          setActivePromptContext(null)
          setActivePromptLabel(null)
          setInput('')
          setIsThinking(false)
          return
        }

        let sourceContext: any = null
        try {
          sourceContext = JSON.parse(window.localStorage.getItem('GEORGE_PRE_LIVE_SOURCE_CONTEXT') || 'null')
        } catch {}

        const stage = window.localStorage.getItem('GEORGE_LIVE_INTENT_STAGE') || 'confirm_intent'

        if (stage === 'confirm_intent') {
          window.localStorage.setItem('GEORGE_LIVE_INTENT_STAGE', 'confirm_relation')

          const next: Message[] = [
            ...messagesRef.current,
            ...(userMessage ? [userMessage] : []),
            {
              role: 'assistant',
              content: yesIntent
                ? 'Good. Is LIVE for this session, or a different room you’re walking into?'
                : 'I can do that. Is LIVE for this session, or a different room you’re walking into?',
            },
          ]

          setMessages(next)
          messagesRef.current = next
          setInput('')
          setIsThinking(false)
          return
        }

        if (stage === 'confirm_relation') {
          const relatedToThis = /\b(this|same|here|yes|yeah|yep|related|current|conversation|session|thread)\b/.test(lower)

          if (relatedToThis && sourceContext?.summary) {
            const source = String(sourceContext.summary || '').toLowerCase()
            const direction =
              /reg cf|cf-spv|broker|dealer|portal|capital|investor|raise|funding/.test(source)
                ? 'Select structure and vendor path'
                : /interview|hiring|candidate/.test(source)
                  ? 'Prepare the room and answer clearly'
                  : /negotiation|terms|price|deal/.test(source)
                    ? 'Protect position and move toward terms'
                    : 'Carry this session into LIVE'

            const signals = {
              role: '',
              counterparty: '',
              desiredOutcome: direction,
              sourceContext: String(sourceContext.summary || '').slice(0, 700),
            }

            window.localStorage.setItem('GEORGE_PRE_LIVE_SIGNALS', JSON.stringify(signals))
            window.localStorage.setItem('GEORGE_LIVE_INTENT_STAGE', 'confirm_preview')

            const next: Message[] = [
              ...messagesRef.current,
              ...(userMessage ? [userMessage] : []),
              {
                role: 'assistant',
                content: `I think I have enough.\n\nSession: current GEORGE session\nDirection: ${direction}\n\nSay “confirm” and I’ll prepare the room.`,
              },
            ]

            setMessages(next)
            messagesRef.current = next
            setInput('')
            setIsThinking(false)
            return
          }

          window.localStorage.setItem('GEORGE_LIVE_INTENT_STAGE', 'collect_signal')

          const next: Message[] = [
            ...messagesRef.current,
            ...(userMessage ? [userMessage] : []),
            {
              role: 'assistant',
              content: 'Tell me the room and the outcome. For example: “interview with hiring manager — get the offer.”',
            },
          ]

          setMessages(next)
          messagesRef.current = next
          setInput('')
          setIsThinking(false)
          return
        }

        if (stage === 'collect_signal') {
          const signals = {
            role: '',
            counterparty: '',
            desiredOutcome: text.trim(),
            sourceContext: sourceContext?.summary || '',
          }

          window.localStorage.setItem('GEORGE_PRE_LIVE_SIGNALS', JSON.stringify(signals))
          window.localStorage.setItem('GEORGE_LIVE_INTENT_STAGE', 'confirm_preview')

          const next: Message[] = [
            ...messagesRef.current,
            ...(userMessage ? [userMessage] : []),
            {
              role: 'assistant',
              content: `I think I have enough.\n\nDirection: ${text.trim()}\n\nSay “confirm” and I’ll prepare the room.`,
            },
          ]

          setMessages(next)
          messagesRef.current = next
          setInput('')
          setIsThinking(false)
          return
        }

        if (stage === 'confirm_preview') {
          if (/\b(confirm|yes|yeah|yep|continue|go|start|preview)\b/.test(lower)) {
            try {
              window.localStorage.removeItem('GEORGE_LIVE_INTENT_STAGE')
            } catch {}
            window.location.href = '/george/live-entry?source=message'
            return
          }

          const next: Message[] = [
            ...messagesRef.current,
            ...(userMessage ? [userMessage] : []),
            {
              role: 'assistant',
              content: 'Say “confirm” when you want me to prepare the room.',
            },
          ]

          setMessages(next)
          messagesRef.current = next
          setInput('')
          setIsThinking(false)
          return
        }
      }


      if (!firstResponseOverride && activeDomain === 'credit') {
        // KEEP ONLY THE STRONGEST LOCAL INTERRUPT:
        // if utilization is explicitly present, we can answer fast.
        const multiProblem =
          /interview|job|boss|meeting|business|income|car|transportation|relationship|court|doctor/i.test(text)

        if (
          /maxed|maxed|balance|balances|utilization/i.test(text) &&
          !multiProblem
        ) {
          firstResponseOverride = "Your cards being maxed out is the issue. Tradelines will not fix that. Bring each card under 30%—under 10% if possible. Paydown or balance shifting is the move. I can help you build a paydown plan, or I can show you the fastest way to lower utilization without adding new debt."
        }
      }

      const liveRuntimePrefix = buildLiveRuntimeContext({
        liveMode,
        runtimeSupport: liveRuntimeSupport || null,
        setup: liveRuntimeSetup || null,
        steeringLabels: getLiveRuntimeSteeringLabels(liveRuntimeSupport?.room),
      })

      const updatedMessages = [
        ...messagesRef.current,
        ...(!liveMode && domainPrefix ? [{ role: 'system', content: domainPrefix } as Message] : []),
        ...(liveRuntimePrefix ? [{ role: 'system', content: liveRuntimePrefix, source: 'system_override' } as Message] : []),
        ...(userMessage ? [userMessage] : [])
      ]

      if (!liveMode) {
        const nextSuggestedPrompts = getSuggestedPromptsFromMessages(updatedMessages, text)

        setSuggestedPrompts((prev) => {
  const incoming = nextSuggestedPrompts || []

  // MERGE EXISTING + NEW
  let merged = [...prev, ...incoming]

  // REMOVE DUPLICATES (by label)
  const seen = new Set()
  merged = merged.filter(p => {
    if (seen.has(p.label)) return false
    seen.add(p.label)
    return true
  })

  // SIMPLE RELEVANCE SORT (newer first)
  merged = merged.reverse()

  // LIMIT TO 10
  const curated = merged.slice(0, tierSuggestedLimit)

  setSuggestedSignal(Date.now())
  setRerouteSignal(Date.now())

  return curated
})
      }
      setMessages(updatedMessages)

      if (!liveMode) {
        const steer = getSteering({
          userText: text,
          tier: currentTier,
          conversationMode,
        })
        setSteeringHint(steer)

        const goal = getGoalState({
          userText: text,
          tier: currentTier,
        })
        setGoalState(goal)
      }

      messagesRef.current = updatedMessages
      setInput('')
      setPendingImage(null)
      setInterimTranscript('')
      setVoiceError('')
      setIsThinking(true)
      startBridgeSpeech()



      try {
        if (firstResponseOverride) {
          stopBridgeSpeech()
        const assistantMessage: Message = {
            role: 'assistant',
            content: firstResponseOverride,
            constrained: false,
          }

          assistantRevealedRef.current = false

          setMessages((prev) => {
            const next = [...prev, assistantMessage]
            messagesRef.current = next
            return next
          })

          setPendingAssistantMessage(null)

          if (activePromptContext) {
            setContextTurnCount((prev) => prev + 1)
          }

          stopBridgeSpeech()
          speakText(assistantMessage.content)
          return
        }

        const campaignContextActive =
          !liveMode &&
          (
            activePromptContext?.includes('conversation') ||
            activePromptContext?.includes('professional') ||
            activePromptContext?.includes('brilliant_live')
          )

        const liveFastPath = liveMode
          ? tryLiveFastPath({
              input: text,
              room: liveRuntimeSupport?.room || liveRuntimeSetup?.room || null,
              chair: liveRuntimeSupport?.chair || null,
              objective: liveRuntimeSupport?.objective || liveRuntimeSetup?.objective || null,
              recentAssistant: messagesRef.current
                .slice()
                .reverse()
                .find((message) => message.role === 'assistant')?.content || null,
            })
          : { handled: false as const }

        if (liveFastPath.handled) {
          stopBridgeSpeech()

          const assistantMessage: Message = {
            role: 'assistant',
            content: liveFastPath.content,
            constrained: false,
            servingTags: liveFastPath.serving,
            source: 'system_override',
          }

          assistantRevealedRef.current = false

          setMessages((prev) => {
            const next = [...prev, assistantMessage]
            messagesRef.current = next
            return next
          })

          setPendingAssistantMessage(null)

          if (activePromptContext) {
            setContextTurnCount((prev) => prev + 1)
          }

          speakText(assistantMessage.content)
          return
        }

        console.info('[GEORGE CHAT REQUEST]', {
          liveMode,
          text,
          source,
        })

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: firstResponseOverride
            ? [
                ...updatedMessages,
                {
                  role: 'system',
                  content: "You must respond with this exact guidance and tone. Do not generalize, soften, or replace it:\n\nI can be direct—even brash. Stay with me, and you can succeed.\n\n" + firstResponseOverride,
                  source: 'system_override'
                }
              ]
            : updatedMessages,
            voiceMode: liveMode ? voiceOn : false,
            liveRuntimeContext: liveRuntimePrefix || null,
            isFirstSession: updatedMessages.length <= 2,
            promptContext: liveMode ? (activePromptContext || 'manual_live') : activePromptContext,
            promptLabel: activePromptLabel,
            activeCampaign: activeCampaign && campaignContextActive
              ? {
                  ...activeCampaign,
                  assistTone,
                  deliveryMode: activeCampaign.deliveryMode || 'text',
                }
              : null,
            campaignDefaultsEnabled: campaignContextActive ? (activeCampaign?.defaultAnswersEnabled ?? true) : false,
            contextTurnCount,
            tier: currentTier,
            language,
          }),
        })

        console.info('[GEORGE CHAT RESPONSE]', {
          status: res.status,
        })

        const data = await res.json().catch(() => null)

        console.info('[GEORGE CHAT DATA]', data)

        if (!res.ok) {
          console.error('/api/chat failed', { status: res.status, data })
          throw new Error(data?.error || `Request failed (${res.status})`)
        }

        const isSmart = currentTier === 'smart'

        const isHeavy =
          text.length > 120 ||
          /plan|build|strategy|business|system|step by step|full|complete|execute/i.test(text)

        const constrained = isSmart && isHeavy

        let finalContent = firstResponseOverride ?? (constrained
          ? `I can help with the next useful step.

Tell me the outcome you want, and I’ll help you move toward it.`
          : data.message)

        if (!constrained && typeof finalContent === 'string') {
          if (conversationMode === 'brilliant_negotiation') {
            finalContent = finalContent
              .split('. ')
              .map((s: string) => s.trim())
              .filter(Boolean)
              .map((s) => (s.length > 120 ? s.slice(0, 120).trim() : s))
              .join('. ')
          }

          if (conversationMode === 'brilliant_lecture') {
            finalContent = `Let’s break this down step by step.

${finalContent}`
          }

          if (conversationMode === 'brilliant_speech') {
            finalContent = finalContent
              .split('. ')
              .map((s: string) => s.trim())
              .filter(Boolean)
              .join('.\n')
          }

          if (conversationMode === 'brilliant_everyday') {
            finalContent = finalContent
          }

          if (conversationMode === 'brilliant_tutor') {
            finalContent = `Explain this to someone else as you go:

${finalContent}`
          }
        }

        if (!constrained && typeof finalContent === 'string' && liveMode) {
          finalContent = governLiveResponse(finalContent, { audio: voiceOn, userText: text })
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: finalContent,
          constrained,
        }
        assistantRevealedRef.current = false

        // IMMEDIATE RENDER FIX
        setMessages((prev) => {
          const next = [...prev, assistantMessage]
          messagesRef.current = next
          return next
        })

        const rawPrompts = generatePrompts(input, assistantMessage.content, messagesRef.current)

// FILTER LOW-SIGNAL / GENERIC PROMPTS
const newPrompts = rawPrompts.filter(p => {
  const label = p.label.toLowerCase()

if (label.includes('next step') && rawPrompts.length > 3) return false
if (label.includes('clarify goal') && rawPrompts.length > 4) return false

return true
})
        setSuggestedPrompts((prev) => {
          let merged = [...prev, ...newPrompts]

          const seen = new Set<string>()
          merged = merged.filter((p) => {
            if (seen.has(p.label)) return false
            seen.add(p.label)
            return true
          })

          const curated = merged.reverse().slice(0, tierSuggestedLimit)
          return curated
        })
        setSuggestedSignal(Date.now())
        setRerouteSignal(Date.now())

        const reroute = generateReroutePrompt(input, assistantMessage.content, messagesRef.current)
        setReroutePrompt(reroute)
        if (reroute) {
          setRerouteSignal(Date.now())
        }

        setPendingAssistantMessage(null)

        if (activePromptContext) {
          setContextTurnCount((prev) => prev + 1)
        }

        stopBridgeSpeech()
        speakText(assistantMessage.content)
      } catch (err) {
        console.error('handleSend failed', err)
        stopBridgeSpeech()
        setVoiceError(err instanceof Error ? err.message : 'Response failed.')
      } finally {
        setIsThinking(false)

        if (
          activePromptContext?.startsWith('conversation_assist_') ||
          activePromptContext?.startsWith('professional_') ||
          activePromptContext?.startsWith('brilliant_')
        ) {
          setTimeout(() => {
            startListening()
          }, 700)
        }
      }
  },
  [input, isThinking, speakText, stopListening, startListening, pendingImage, activePromptContext]
)

  const handleLiveFinalTranscript = useCallback((text: string) => {
    const clean = String(text || '').trim()
    if (!clean) return

    const execution = resolveGeorgeCoreLiveExecution({
      transcript: clean,
      lastFinalTranscript: lastLiveFinalTranscriptRef.current,
      routingContext: {
        isThinking,
        isSpeaking: isSpeakingRef.current,
        liveMode,
        buyTimeUntil: liveBuyTimeUntilRef.current,
      },
      lastSpokenLine: liveLastSpokenUtteranceRef.current,
      isGeorgeSpeaking: isSpeakingRef.current,
      isThinking,
      overlapDetected: liveAwarenessBufferRef.current.some((fragment) => fragment.overlapLikely),
      overlapRequiresAttention: false,
      desiredOutcome: liveRuntimeSupport?.objective || activeCampaign?.desiredOutcome || activeCampaign?.currentGoal || '',
    })

    lastLiveFinalTranscriptRef.current = execution.nextFinalTranscript

    const authority = execution.authority

    console.info('[GEORGE LIVE ACTION]', {
      transcript: clean,
      nextFinalTranscript: execution.nextFinalTranscript,
      authority,
    })

    if (authority.action.type === 'ignore') {
      console.warn('[GEORGE LIVE ACTION IGNORED]', {
        transcript: clean,
        reason: authority.reason,
        verdict: authority.verdict,
        action: authority.action,
      })
      return
    }

    if (authority.action.type === 'start_buy_time') {
      console.info('[GEORGE LIVE LOCAL]', 'buy_time')

      const buyTimeUntil = Date.now() + authority.action.durationMs
      liveBuyTimeUntilRef.current = buyTimeUntil

      window.setTimeout(() => {
        if (liveBuyTimeUntilRef.current === buyTimeUntil) {
          console.info('[GEORGE LIVE LOCAL]', 'buy_time_expired')
        }
      }, authority.action.durationMs)

      return
    }

    if (authority.action.type === 'speak') {
      console.info('[GEORGE LIVE LOCAL]', 'speak', { text: authority.action.text })
      void speakText(authority.action.text)
      return
    }

    if (authority.action.type === 'send') {
      console.info('[GEORGE LIVE SEND]', { text: authority.action.text })
      void handleSend(authority.action.text, { source: 'live_transcript' })
    }
  }, [handleSend, isThinking, liveMode, liveRuntimeSupport?.objective, activeCampaign?.desiredOutcome, activeCampaign?.currentGoal, speakText])

  useEffect(() => {
    liveTranscriptSubmitRef.current = handleLiveFinalTranscript
  }, [handleLiveFinalTranscript])

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const atTop = textarea.scrollTop <= 0
      const atBottom =
        textarea.scrollTop + textarea.clientHeight >= textarea.scrollHeight - 4

      if (
        (event.key === 'ArrowUp' && atTop) ||
        (event.key === 'ArrowDown' && atBottom)
      ) {
        event.preventDefault()

        scrollHostRef.current?.scrollBy({
          top: event.key === 'ArrowDown' ? 120 : -120,
          behavior: 'smooth',
        })

        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (isThinking) return

      if (liveEntryReadyForOptionalSignal) {
        captureLiveEntryOptionalSignal()
        return
      }

      if (!input.trim()) return
      handleSend()
    }
  }

  useEffect(() => {
    const supported = Boolean(SpeechRecognitionCtor) && !isIOS
    setVoiceSupported(supported)

    if (!supported) {
      setVoiceError(
        isIOS
          ? 'Enhanced voice support is still expanding.'
          : 'Voice input is not available in this browser session.'
      )
      return
    }

    const recognition = new (SpeechRecognitionCtor as NonNullable<typeof SpeechRecognitionCtor>)()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {      setVoiceError('')
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEventLike) => {      let finalTranscript = ''
      let liveTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript ?? ''
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          liveTranscript += transcript
        }
      }

      setInterimTranscript(liveTranscript)
      if (liveMode && liveTranscript.trim()) {
        const cleanLiveSignal = liveTranscript.trim()
        liveLastSignalRef.current = Date.now()
        liveContextBufferRef.current = [...liveContextBufferRef.current, cleanLiveSignal].slice(-12)
      }
lastSpeechTsRef.current = Date.now()

if (responseTimerRef.current) {
  clearTimeout(responseTimerRef.current)
}

      // ⚡ proactive conversational guidance
      if (LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED && liveMode && liveTranscript) {
        const state = liveConversationStateRef.current
        if (!state.activeDirection) {
          state.activeDirection = activeCampaign?.desiredOutcome || 'clarity'
        }

        const vocalState = detectVocalState(liveTranscript)


        const lower = liveTranscript.toLowerCase()

        if (/close|sell|buy|sign/.test(lower)) state.activeDirection = 'close'
        if (/understand|clarify|explain/.test(lower)) state.activeDirection = 'clarity'
        if (/diagnose|symptom|pain|doctor/.test(lower)) state.activeDirection = 'diagnosis'


        const now = Date.now()
        const delta = now - lastSpeechTsRef.current

        // prevent spam
        if (delta < 1800) return

        const voiceSignal = interpretVoiceState(liveTranscript)

        const decisionCue = decideNextMove({
          vocalState,
          posture: 'unknown',
          signals: []
        })

        const rawProactiveCue = decisionCue
          ? decisionCue
          : voiceSignal.state === 'pressuring' && voiceSignal.intensity >= 3
          ? "Cue: High pressure. Slow this down now."
          : voiceSignal.state === 'dismissive' && voiceSignal.control === 'low'
          ? "Cue: They’re brushing you off. Ask one direct question."
          : voiceSignal.state === 'uncertain'
          ? "Cue: They sound unsure. Make it simple."
          : vocalState === 'pressuring'
          ? "Cue: They’re rushing you. Slow this down."
          : vocalState === 'dismissive'
          ? "Cue: They’re brushing you off. Regain control."
          : /okay|alright|i guess|if you want/.test(lower)
          ? "Cue: You’re conceding. Reset your position."
          : /because|let me explain|what i mean is/.test(lower)
          ? "Cue: Stop explaining. Control the next sentence."
          : liveTranscript.length > 120 && !lower.includes("?")
          ? "Cue: Pause. Ask a question."
          : null

        const deliveryLevel = detectUserDeliveryLevel(input, liveTranscript)
        const proactiveCue = rawProactiveCue ? adaptCueForUser(rawProactiveCue, deliveryLevel) : null

        if (proactiveCue) {
          const now = Date.now()

          // prevent repeat cue by shifting angle instead of going silent
          const finalProactiveCue =
            state.lastCue === proactiveCue
              ? proactiveCue.includes("Slow")
                ? "Cue: Reset the pace. Ask one clean question."
                : proactiveCue.includes("dismiss")
                ? "Cue: Change angle. Make them answer one direct question."
                : proactiveCue.includes("conceding") || proactiveCue.includes("giving in")
                ? "Cue: Stop giving ground. Restate your point."
                : "Cue: New angle. Say less and ask more."
              : proactiveCue

          // 5 second cooldown
          if (now - lastCueTsRef.current < 5000) return

          const isInterrupt =
            /conceding|reset your position/.test(proactiveCue)

          const fire = async () => {
            const injected = await injectGovernedLiveCue(liveTranscript, finalProactiveCue)
            if (!injected) return

            lastCueTsRef.current = Date.now()
            state.lastCue = finalProactiveCue
          }

          if (isInterrupt) {
            fire()
          } else {
            setTimeout(() => {
              fire()
            }, 1200)
          }

          return
        }
      }

//  live sales signal detection
      if (LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED && liveMode && liveTranscript) {

        const intent = detectTriggerIntent(liveTranscript)

        if (intent === "listen") return

        if (intent) {

          const lineText = (() => {
            const lowerSignal = liveTranscript.toLowerCase()

            const personProfile = detectConversationPersonProfile(input, liveTranscript)

            const isHighConfidence = personProfile.confidence >= 0.7
            const isResistant = personProfile.posture === 'resistant'
            const isRushed = personProfile.posture === 'rushed'

            const profileLabel = `${personProfile.role} — ${personProfile.posture}`

            if (personProfile.role === 'doctor') {
              if (personProfile.posture === 'rushed') return 'Doctor — rushed\n\nSay: “I’ll be brief. Here are the symptoms, when they started, and what worries me most.”'
              if (personProfile.posture === 'confused') return 'Doctor — confused\n\nSay: “Let me restate this clearly so I do not miss anything important.”'
              return 'Doctor — Say: “I’ll keep this clear. Here are the symptoms, when they started, and what worries me most.”'
            }

            if (personProfile.role === 'lawyer') {
              if (personProfile.posture === 'pressuring') return 'Lawyer — pressuring\n\nSay: “I need that explained in plain language before I agree to anything.”'
              return 'Lawyer — Say: “Explain that in plain language before I agree to anything.”'
            }

            if (personProfile.role === 'authority') {
              if (personProfile.posture === 'pressuring') return 'Authority — pressuring\n\nSay: “I understand. Tell me the exact requirement and the next step.”'
              return 'Authority — Say: “Help me understand the exact requirement and the next step.”'
            }

            if (personProfile.role === 'gatekeeper') {
              if (personProfile.posture === 'rushed') return 'Gatekeeper — rushed\n\nSay: “I’ll be brief — I only need 20 seconds.”'
              return 'Gatekeeper — Say: “I only need 20 seconds to see if this belongs on their desk.”'
            }

            if (/not interested|no thanks|don't need|dont need|not right now|already have|have someone/.test(lowerSignal)) {
              return 'Say: “I understand. Here’s the simple version — [pause] then you can decide.”'
            }

            if (/too expensive|cost|price|budget|no budget|can't afford|cant afford/.test(lowerSignal)) {
              return [
  'Say: “Fair. Let me show you why this makes sense — [pause] before price becomes the issue.”',
  'Say: “I hear you — [pause] but let me show you where this actually pays off.”',
  'Say: “Price matters — [pause] let me show you what this really does first.”'
][Math.floor(Date.now() % 3)]
            }

            if (/send me|email me|call me later|next week|follow up/.test(lowerSignal)) {
              return 'Say: “I can do that — [pause] but first, what actually matters most to you here?”'
            }

            if (/not sure|maybe|i guess|i don’t know|i dont know/.test(lowerSignal)) {
              return [
  'Say: “Good. Let’s make the decision clear right now.”',
  'Say: “Good — [pause] let’s get clear right now.”',
  'Say: “Alright. Let’s lock this in — [pause] right now.”'
][Math.floor(Date.now() % 3)]
            }

            if (isHighConfidence && isResistant) {
              return 'Say: “Listen — here’s the simple version, then you decide.”'
            }

            if (isHighConfidence && isRushed) {
              return 'Say: “Quick version — this is what matters most.”'
            }

            return [
  'Say: “Here’s the simple version — [pause] then you can decide.”',
  'Say: “Let me simplify this — [pause] then you tell me.”',
  'Say: “Quick version — [pause] then you decide.”'
][Math.floor(Date.now() % 3)]
          })()

          // urgency override (instant response)
          if (intent === "urgent") {
            stopListening()
            const personProfile = detectConversationPersonProfile(input, liveTranscript)
          const profileLabel = `${personProfile.role} — ${personProfile.posture}`

void injectGovernedLiveCue(liveTranscript, 'Pause. Control the next sentence.').then((injected) => {
              if (!injected) return
              setConversationSignal('LIVE urgent')
              setAdaptiveCueLabel('Pressure detected')
            })
            return
          }
          stopListening()

          const personProfile = detectConversationPersonProfile(input, liveTranscript)
          const profileLabel = `${personProfile.role} — ${personProfile.posture}`
          const shouldShowProfileLabel = personProfile.confidence >= 0.55 && personProfile.role !== 'unknown'
          const liveLineOutput = shouldShowProfileLabel ? profileLabel + "\\n" + lineText : lineText

          void injectGovernedLiveCue(
            liveTranscript,
            intent === "line"
              ? profileLabel + "\n" + lineText
              : intent === "reword"
              ? "Say: “Let me put that another way…”"
              : intent === "cue"
              ? "Cue: Slow down. Control the next sentence."
              : intent === "word"
              ? "Word: [clear single word]"
              : "Focus. Control the next sentence."
          )
          return
        }
        const lower = liveTranscript.toLowerCase()

        const existing = getCampaignSessions()

        const updated = existing.map((c: any) => {
          if (c.id !== activeCampaignId) return c

          const perf = c.performance || {
            calls: 0,
            objections: 0,
            callbacks: 0,
            closes: 0,
            weakSpots: []
          }

          // detect objection
          if (/already|have someone|not interested|too expensive|no budget/.test(lower)) {
            perf.objections += 1
            perf.weakSpots.push('objection')
          }

          // detect delay / callback
          if (/call me|later|next week|send me|follow up/.test(lower)) {
            perf.callbacks += 1
          }

          // detect close intent
          if (/yes|let's do it|i'm in|sounds good/.test(lower)) {
            perf.closes += 1
          }

          return { ...c, performance: perf }
        })

        updateCampaignSessionMetadata(activeCampaignId, (metadata) => {
          const current = (metadata.performance || {}) as any
          const next = updated.find((item: any) => item.id === activeCampaignId)?.performance || current

          return {
            ...metadata,
            performance: next,
          }
        })
      }

      if (finalTranscript.trim()) {
        const clean = finalTranscript.trim()
        if (liveMode) {
          liveLastSignalRef.current = Date.now()
          liveContextBufferRef.current = [...liveContextBufferRef.current, clean].slice(-12)
        }

const outcomeSignal = (() => {
  const text = clean.toLowerCase()

  if (text.includes("closed") || text.includes("deal done")) return "WIN"
  if (text.includes("call me") || text.includes("next week")) return "CALLBACK"
  if (text.includes("not interested") || text.includes("no thanks")) return "LOSS"
  if (text.includes("send") || text.includes("info")) return "STALL"

  return null
})()

if (outcomeSignal) {
  const history = JSON.parse(window.localStorage.getItem('GEORGE_OUTCOMES') || '[]')
  history.unshift({
    signal: outcomeSignal,
    text: clean,
    ts: Date.now()
  })
  window.localStorage.setItem('GEORGE_OUTCOMES', JSON.stringify(history.slice(0, 50)))
}
        setInterimTranscript('')

        const liveContextSnapshot = liveContextBufferRef.current.join("\n")
        const hasEnoughLiveSignal = liveContextSnapshot.length > 40

        const livePrompt = liveMode
          ? hasEnoughLiveSignal
            ? `LIVE CONVERSATION CONTEXT:
${liveContextSnapshot}

LATEST HEARD:
${clean}

You are GEORGE in Conversation Mode.

Respond ONLY from what you actually heard.

Keep responses:
- short
- usable out loud
- natural

Return ONLY ONE operational deliverable.

If no room was selected or context is unclear:
- do not interrogate the user
- do not assume context from a single word, name, joke, greeting, or slang phrase
- “what’s up doc” does not mean medical context
- listen first
- if enough signal appears, ask one short confirmation such as “Interview?” or “Doctor context?”
- otherwise give a neutral listening cue or a minimal next move

If assist mode is:
- cues → return one short cue only
- lines → return one short repeatable line only

Never output labels like:
Word:
Say:
Cue:
Need:
Style:
Pause:
Backup:

Never explain your reasoning.
Never format as sections.
Never return multiple options.

${resolvedLivePosture === 'debate' ? 'Debate posture: detect contradictions, protect the frame, answer proof demands, handle interruptions, and keep lines short and sharp.' : ''}`
            : `What's happening right now?`
          : clean

        
responseTimerRef.current = setTimeout(() => {
  const now = Date.now()
  const delta = now - lastSpeechTsRef.current

  if (delta < 2500) return

  const lower = livePrompt.toLowerCase()

  const strongSignal =
    lower.includes("not interested") ||
    lower.includes("too expensive") ||
    lower.includes("i don’t know") ||
    lower.includes("i dont know") ||
    lower.includes("maybe") ||
    lower.includes("what do you think")

  if (LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED && liveMode && strongSignal) {
    stopListening()
    void injectGovernedLiveCue(livePrompt, 'Say: “Let me make this simple…”').then((injected) => {
      if (!injected) return
      setConversationSignal('LIVE strong signal')
      setAdaptiveCueLabel('Strong opportunity detected')
    })
    return
  }

  const text = liveTranscript || ""
  const friction = detectFriction(text)
  const score = scoreFriction(text)

  if (!friction) return

  const interventionNow = Date.now()
  const canIntervene = interventionNow - liveInterventionRef.current > 8000

  if (LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED && liveMode && canIntervene && score >= 3) {
    stopListening()

    if (score >= 5) {
      void injectGovernedLiveCue(
        text,
        'Pause. Take control of the next sentence.\n\nSay: “Let me clarify the main point.”'
      )
    } else {
      void injectGovernedLiveCue(text, 'Cue: Slow down. Ask one clean question.')
    }

    liveInterventionRef.current = interventionNow
    setConversationSignal('LIVE intervention')
    setAdaptiveCueLabel(score >= 4 ? 'Objection detected' : 'Adjust delivery')
    return
  }

  if (score < 3) return

  if (!isSpeaking) {
    void handleSend(livePrompt)
  }
}, 2600)

      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorLike) => {
      const message =
        event?.error === 'not-allowed'
          ? 'Microphone permission was denied.'
          : event?.error === 'audio-capture'
            ? 'No microphone was available.'
            : event?.error === 'no-speech'
              ? ''
              : 'Voice input failed.'

      if (message) {
        setVoiceError(message)
      }

      setIsListening(false)
    }

    recognition.onend = () => {
      // LIVE no longer uses browser SpeechRecognition restart loops.
      // Deepgram runtime owns LIVE listening authority.
      if (!liveMode && voiceOn && !isThinking) {
        setTimeout(() => {
          startListening()
        }, 250)
      }

      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop?.()
      recognitionRef.current = null
    }
  }, [SpeechRecognitionCtor, handleSend, isIOS])

  const statusText = voiceError
    ? voiceError
    : isSpeaking
      ? 'GEORGE is speaking...'
      : isThinking
        ? 'GEORGE is working...'
        : isListening
          ? 'GEORGE is listening...'
          : isIOS
            ? 'Voice is coming later on iPhone.'
            : voiceOn
              ? 'Voice is on.'
              : 'Voice is off.'

  const hasVisibleThread = messages.some((m) => {
    if (m.role === 'system') return false
    const clean = (m.content || '').trim()
    if (!clean) return false
    if (m.role === 'assistant' && clean === greeting.trim()) return false
    return m.role === 'user'
  })

  const hasDraftInput = input.trim().length > 0
  const isPreLiveSignalAcquisition = activePromptContext === 'pre_live_signal_acquisition'
  const showConversation = hasDraftInput || liveMode || (hasVisibleThread && !isPreLiveSignalAcquisition)
  const normalUserTurnCount = messages.filter((message) => message.role === 'user').length
  const showMobileHero = !(forceLive || liveMode) && normalUserTurnCount === 0
  const showGeorgeHeroTitle = true
  const showGeorgeHeroTagline = normalUserTurnCount === 0
  const showGeorgeSupportCopy = normalUserTurnCount === 0
  const hasUserMessageForSurface = messages.some((message) => message.role === 'user')

  const shouldKeepHeroVisible =
    normalUserTurnCount === 0

  const showIdleGeorgeSurface =
    showMobileHero &&
    !(forceLive || liveMode) &&
    !hasDraftInput &&
    !pendingImage &&
    (shouldKeepHeroVisible || isPreLiveSignalAcquisition)

  const showDesktopOperationalSurface =
    !hasUserMessageForSurface

  const showTypingPrescription =
    hasDraftInput &&
    !pendingImage &&
    shouldKeepHeroVisible

  const isRuntimeTransitioning =
    hasVisibleThread ||
    liveMode

useEffect(() => {
  if (!showMobileHero || forceLive || liveMode) return

  requestAnimationFrame(() => {
    scrollHostRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  })
}, [showMobileHero, liveMode])

  const preLiveQuestions = [
    {
      key: 'name',
      kicker: 'Bring GEORGE up to speed',
      label: 'Question 1',
      question: 'What should I call you in this room?',
      examples: 'Examples: Lester, Mr. Sawyer, Coach, Dr. Patel, Alex, etc.',
    },
    {
      key: 'role',
      kicker: 'Position signal',
      label: 'Question 2',
      question: 'What is your role in the conversation — your position or title?',
      examples: 'Examples: interviewer, interviewee, CEO, founder, manager, patient, customer, candidate, etc.',
    },
    {
      key: 'counterparty',
      kicker: 'Room signal',
      label: 'Question 3',
      question: 'Who are you speaking with?',
      examples: 'Examples: investor, hiring manager, doctor, customer, employee, client, board member, etc.',
    },
    {
      key: 'desiredOutcome',
      kicker: 'Outcome signal',
      label: 'Question 4',
      question: 'What do you want from this conversation?',
      examples: 'Name the result you are trying to move toward.',
    },
    {
      key: 'acceptableOutcome',
      kicker: 'Settlement signal',
      label: 'Question 5',
      question: 'If your ideal outcome is not available, what would you settle for?',
      examples: 'This helps GEORGE understand the floor, not just the target.',
    },
  ]

  const currentPreLiveQuestion = showPreLiveSignalSurface
    ? preLiveQuestions[preLiveSignalStep]
    : null

  const isPreLiveEarbudReady = showPreLiveSignalSurface && preLiveSignalComplete

  const submitPreLiveSignalAnswer = () => {
    const answer = input.trim()

    if (!showPreLiveSignalSurface || !answer || !currentPreLiveQuestion) {
      return false
    }

    const nextSignals = {
      ...preLiveSignals,
      [currentPreLiveQuestion.key]: answer,
    }

    setPreLiveSignals(nextSignals)

    try {
      window.localStorage.setItem('GEORGE_PRE_LIVE_SIGNALS', JSON.stringify(nextSignals))
      window.localStorage.setItem(`GEORGE_PRE_LIVE_${currentPreLiveQuestion.key.toUpperCase()}`, answer)
    } catch {}

    setInput('')

    const nextStep = preLiveSignalStep + 1

    if (nextStep >= preLiveQuestions.length) {
      setPreLiveSignalStep(preLiveQuestions.length)
      setPreLiveSignalComplete(true)
      setShowPreLiveSignalSurface(true)
      setActivePromptContext('pre_live_signal_ready')
      setActivePromptLabel('LIVE Ready')

      try {
        window.localStorage.setItem('GEORGE_PRE_LIVE_PREVIEW_READY', '1')
        window.localStorage.setItem('george_start_new_live', '1')
      } catch {}

      window.setTimeout(() => {
        window.location.href = '/george/live-entry?source=signal'
      }, 900)

      return true
    }

    setPreLiveSignalStep(nextStep)
    setActivePromptContext('pre_live_signal_acquisition')
    setActivePromptLabel(`Question ${nextStep + 1}`)

    return true
  }

  const enterLiveConversation = () => {
    if (liveMode) return

    startLiveSignalAcquisition()
    setShowLiveQuickMenu(false)
  }

  const startNewLiveConversation = () => {
    try {
      if (messagesRef.current.length > 2) {
        saveSessionToV2({
          mode: 'live',
          title: getActiveLiveDesiredOutcomeTitle('LIVE Conversation'),
          messages: messagesRef.current,
          summary: 'LIVE Conversation checkpoint before new LIVE conversation.',
          userGoal: 'In progress',
          lastKnownState: 'User started a new LIVE conversation.',
          suggestedRestart: 'Resume this LIVE Conversation naturally.',
          metadata: {},
        })
      }

      window.localStorage.setItem('george_start_new_live', '1')
      window.localStorage.removeItem('george_active_live_session_id')
      window.localStorage.removeItem('george_active_campaign_session_id')
      window.localStorage.removeItem('george_active_campaign')
      window.localStorage.removeItem('george_active_context')
      window.localStorage.removeItem('george_active_label')
    } catch {}

    setShowLiveQuickMenu(false)
    setActiveCampaignId(null)
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        active: false,
      }))
    )
    setConversationMode('manual_live')
    setActivePromptContext('manual_live')
    setActivePromptLabel('Conversation')
    setMessages([])
    messagesRef.current = []
    liveSessionWriteReadyRef.current = false
  }

  const resumeLiveConversation = () => {
  }


{false && showMobileHero && (
  <div className="flex flex-col items-center justify-center text-center pt-20 pb-6 md:pt-28 md:pb-10">

    <div className="text-[32px] font-semibold tracking-[0.25em] text-[#D7DBE4]">
      GEORGE
    </div>

    <div className="mt-2 text-[12px] tracking-[0.18em] text-neutral-500">
      Smart. Intelligent. Brilliant.
    </div>

    <div className="mt-4 flex items-center gap-[7px]">
    </div>

  </div>
)}

  useEffect(() => {
    if (showConversation) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [showConversation])


return (
    <>
      <style>{`${georgeAmbientPulseStyles}

@keyframes georgeComposerCursorBlink {
  0%, 46% { opacity: 0.72; }
  47%, 100% { opacity: 0; }
}
`}</style>
  
        

    <main className={`app-shell george-mobile-root pb-[120px] min-h-[100dvh] w-full overflow-x-hidden bg-[#0B0D12] text-neutral-100 ${isAndroid ? "android-runtime android-sharp" : ""}`}>
      <div id="george-app-content" className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden">
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-[40] bg-black/48 -[10px] xl:hidden"
          />
        )}

        <Sidebar
          currentTier={currentTier}
          liveMode={liveMode}
            onOpenLiveGate={() => {
              setShowSidebar(false)
              openLiveEntry()
            }}
            onOpenLogin={() => {
              setShowSidebar(false)
              setLoginEmailInput('')
              setLoginLinkSent(false)
              setShowUpgradeModal(true)
            }}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          voiceActive={voiceOn}
          activePromptLabel={activePromptLabel}
          activePromptContext={activePromptContext}
          onToggleScripture={() => {
            const turningOn = activePromptContext !== 'bible_decision_lens'
            setActivePromptLabel(turningOn ? 'Be as Christ' : null)
            setActivePromptContext(turningOn ? 'bible_decision_lens' : null)
            setContextTurnCount(0)
            setToastMessage(turningOn ? 'Be as Christ on' : 'Be as Christ off')
            setShowToast(true)
          }}
          onNewSession={() => {
            // Route boundary: /george/live must not render normal GEORGE in place.
            // Leaving LIVE must go through the save/stay/exit flow first.
            if (forceLive || liveMode) {
              requestExitLiveMode()
              return
            }

            try {
              if (messagesRef.current.length > 1) {
                saveSessionToV2({
                  mode: 'normal',
                  title: deriveNormalSessionTitleFromMessages(messagesRef.current, activePromptLabel || 'GEORGE Session'),
                  messages: messagesRef.current,
                  summary: 'GEORGE session checkpoint.',
                  userGoal: activePromptLabel || 'Not set',
                  lastKnownState: 'Saved before starting a new GEORGE session.',
                  suggestedRestart: 'Resume this GEORGE session and continue from the clearest next step.',
                })
              }
            } catch {}

            setTimeout(() => {
              setMessages([])
              messagesRef.current = []
            }, 250)
            setInput('')
            setInterimTranscript('')
            setVoiceError('')
            setActivePromptLabel(null)
            setActivePromptContext(null)
            setContextTurnCount(0)
            setReroutePrompt(null)
            setRerouteSignal(0)
            setSuggestedPrompts([])
            setSuggestedSignal(0)
          }}
          onPromptSelect={(prompt: PromptSelection) => {
              if (prompt.context === 'upgrade_intelligent' || prompt.context === 'upgrade_topup') {
                window.open('/top-up','_blank')
                return
              }

              setActivePromptLabel(prompt.label)
              setActivePromptContext(prompt.context)
              setContextTurnCount(0)
              setVoiceError('')

              if (prompt.context === 'bible_decision_lens') {
                setShowSidebar(false)
                setToastMessage('Be as Christ on')
                setShowToast(true)
                textareaRef.current?.focus()
                return
              }

              if (prompt.context === 'strategy_recalculation') {
                setRerouteSignal(0)
              }

              const isPreTrainingCourse =
                prompt.context === 'training_drivers_license' ||
                prompt.context === 'training_cdl' ||
                prompt.context === 'training_ged' ||
                prompt.context === 'training_cna' ||
                prompt.context === 'training_interview'

              if (isPreTrainingCourse) {
                const coursePrompt = prompt.text
                const assistantText = buildTrainingIntakeOverride(coursePrompt)

                setShowSidebar(false)
                setInput('')
                setVoiceError('')

                const nextMessages: Message[] = [
                  ...messagesRef.current,
                  { role: 'user', content: coursePrompt, source: 'sidebar_prompt' },
                  {
                    role: 'assistant',
                    content: assistantText || "Good. We are building a passing path.",
                    constrained: false,
                  },
                ]

                setMessages(nextMessages)
                messagesRef.current = nextMessages
                setActivePromptLabel(prompt.label)
                setActivePromptContext(prompt.context)
                setContextTurnCount(1)
                return
              }

              if (prompt.context === 'courses_expand') {
                setShowSidebar(false)
                setInput('')
                setVoiceError('')

                const nextMessages: Message[] = [
                  ...messagesRef.current,
                  { role: 'user', content: prompt.text, source: 'sidebar_prompt' },
                  {
                    role: 'assistant',
                    content: "There are other courses not shown here. Some could help you now. Some may mean nothing right now. Some may even be boring to you. Tell me what you want to earn, fix, avoid, build, understand, or become—and I’ll point to what matters.",
                    constrained: false,
                  },
                ]

                setMessages(nextMessages)
                messagesRef.current = nextMessages
                setContextTurnCount(1)
                return
              }

              setShowSidebar(false)
              void handleSend(prompt.text, { source: 'sidebar_prompt' })
            }}
        />

        <div className="flex min-w-0 w-full flex-1 flex-col overflow-visible touch-pan-y">
          <div className={`flex min-h-[var(--george-vh,100dvh)] w-full flex-1 flex-col overflow-visible touch-pan-y px-4 pb-0 ${
            showPreLiveSignalSurface
              ? 'pt-[108px] md:pt-[78px]'
              : 'pt-[68px] md:pt-[78px]'
          } md:h-screen md:min-h-0 md:overflow-hidden md:overscroll-none md:px-8 md:pb-0 xl:px-12`}>
            <header className={`fixed top-0 left-0 right-0 flex justify-center border-b border-white/[0.04] bg-[#0F1117]/82  px-4 py-1.5 transition duration-200 ${"z-50"}`}>
              
              {!(forceLive || liveMode) && !showMobileHero && (
                <div
                  data-mobile-george-center
                  className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D7DBE4]/62 md:hidden"
                >
                  GEORGE
                </div>
              )}
<div className="relative flex w-full max-w-6xl items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (!showSidebar) setShowSidebar(true)
                  }}
                  disabled={showSidebar}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[18px] text-[#D7DBE4]/58 transition hover:bg-white/[0.035] hover:text-[#D7DBE4]/90 active:scale-[0.96] xl:hidden ${showSidebar ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                  aria-label="Open GEORGE sidebar"
                  title="Open"
                >
                  ←
                </button>

                <div className="hidden xl:grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5">

                  <div />

                  <div className="flex justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#D7DBE4]/20">
                        GEORGE
                      </span>
                      {!showMobileHero && !(forceLive || liveMode) && (
                        <div className="hidden xl:flex items-center gap-1.5">
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleShareGeorge}
                      className="inline-flex h-5 items-center justify-center px-1 text-[6px] font-medium uppercase tracking-[0.08em] text-[#D7DBE4]/34 transition hover:text-[#D7DBE4]/62"
                      aria-label="Share GEORGE context"
                      title="Share GEORGE context"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          className="h-[9px] w-[9px] text-[#D7DBE4]/42"
                        >
                          <path d="M7 12v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7" />
                          <path d="M12 3v12" />
                          <path d="M8 7l4-4 4 4" />
                        </svg>

                        <span className="tracking-[0.08em] uppercase text-[#D7DBE4]/58">
                          Share
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center gap-1 xl:hidden">
                  <button
                    type="button"
                    onClick={handleShareGeorge}
                    className="inline-flex h-5 items-center justify-center px-1 text-[6px] font-medium uppercase tracking-[0.08em] text-[#D7DBE4]/34 transition hover:text-[#D7DBE4]/62"
                    aria-label="Share GEORGE context"
                    title="Share GEORGE context"
                  >
                    <span className="tracking-[0.08em] uppercase text-[#D7DBE4]/58">
                      Share
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowIdentityMenu((value) => !value)}
                    className="inline-flex h-9 w-8 items-center justify-center rounded-full text-[20px] leading-none text-[#D7DBE4]/52 transition hover:bg-white/[0.035] hover:text-[#D7DBE4]/82"
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

                      <div className="absolute right-0 top-full z-[90] mt-2 w-[150px] rounded-[0.9rem] border border-white/[0.065] bg-[#05080D]/94 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.42)] -[14px]">
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
                              setShowIdentityMenu(false)
                              setLoginEmailInput('')
                              setLoginLinkSent(false)
                              setShowUpgradeModal(true)
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
  <div className="pointer-events-none fixed left-0 right-0 top-[52px] z-[34] h-[132px] bg-gradient-to-b from-[#0B0D12] via-[#0B0D12]/96 via-[72%] to-transparent md:hidden" />
)}
{(forceLive || liveMode) && !showLiveEntrySequence && (
  <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[54] h-[260px] bg-gradient-to-t from-[#05060A] via-[#05060A]/96 via-[66%] to-transparent xl:left-[280px]" />
)}
{(forceLive || liveMode) && !showLiveEntrySequence && (
  <>
    <div className="pointer-events-none fixed left-0 right-0 top-[54px] z-[37] h-[340px] bg-gradient-to-b from-[#05060A] via-[#05060A]/100 via-[82%] to-[#05060A]/0" />
    <div className="pointer-events-none fixed left-0 right-0 top-[96px] z-[160] flex justify-center px-4 pointer-events-none">
    <div ref={liveStatusStackRef} className="w-full max-w-[430px] md:max-w-[720px] xl:max-w-[860px]">
      <LiveRoomStatusPanel
        isListening={isListening}
        liveRoomActive={liveRoomActive}
        voiceOn={voiceOn}
        isThinking={isThinking}
        roomLabel={liveRuntimeSupport?.room || (liveRoomActive ? 'LIVE room' : 'inactive')}
        chairLabel={liveRuntimeSupport?.chair || 'User'}
        objectiveLabel={liveRuntimeSupport?.objective || 'Outcome pending'}
        steeringLabels={getLiveRuntimeSteeringLabels(liveRuntimeSupport?.room).slice(0, 3) as [string, string, string]}
        onRoomToggle={() => {
          const nextEnabled = !liveGeorgeEnabled
          setLiveGeorgeEnabled(nextEnabled)

          if (!nextEnabled) {
            stopListening()
            setInterimTranscript('')
            setToastMessage('Room quiet')
          } else {
            startListening()
            setToastMessage('Room listening')
          }

          setShowToast(true)
        }}
        onVoiceToggle={() => {
          if (currentTier === 'smart') {
            setToastMessage('Voice replies unlock above Smart.')
            setShowToast(true)
            return
          }

          const nextVoice = !voiceOn
          hasUserInteractedRef.current = true
          setVoiceOn(nextVoice)
          setInteractionMode(nextVoice ? 'speech' : 'text')
          window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
          setToastMessage(nextVoice ? 'Audio on' : 'Audio off')
          setShowToast(true)
        }}
        onPauseLive={() => {
          stopListening()
          setInterimTranscript('')
          setToastMessage('LIVE paused')
          setShowToast(true)
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
    const el = e.currentTarget
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    userPinnedBottomRef.current = nearBottom
    setShowScrollHint(!nearBottom)
  }}
  onKeyDown={(e) => {
    const el = e.currentTarget

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      el.scrollBy({ top: 96, behavior: 'smooth' })
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      el.scrollBy({ top: -96, behavior: 'smooth' })
    }
  }}
  style={(forceLive || liveMode) && !showLiveEntrySequence && liveStatusStackClearance
    ? {
        paddingTop: liveStatusStackClearance,
        scrollPaddingTop: liveStatusStackClearance,
      }
    : undefined}
  className={`w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain px-3 md:[-webkit-overflow-scrolling:touch] ${(forceLive || liveMode) && !showLiveEntrySequence ? "pb-[390px] md:pb-[280px]" : showPreLiveSignalSurface ? "pb-[360px] md:pb-[250px]" : "pb-[280px] md:pb-[250px]"} md:px-6 space-y-3 ${(forceLive || liveMode) && !showLiveEntrySequence || (hasVisibleThread && !isPreLiveSignalAcquisition) ? "" : showMobileHero ? "pt-3 md:pt-14" : "pt-10 md:pt-6"} ${(showNormalUtilityMenu || showLiveQuickMenu || showSessionPicker || showExitPopup || showUpgradeModal || showTierModal || showProLiveComingSoon || showLiveChooser) ? "blur-[8px] transition-[filter] duration-200" : "blur-0 transition-[filter] duration-200"}`}>
  

{showMobileHero && !(forceLive || liveMode) && (shouldKeepHeroVisible || showPreLiveSignalSurface) && (
  <section
    data-george-normal-hero
    className={`${showPreLiveSignalSurface ? 'pointer-events-auto bottom-[188px] overflow-y-auto overscroll-contain pb-10' : 'pointer-events-none'} fixed left-0 right-0 top-[92px] z-[35] mx-auto w-full max-w-[760px] px-8 pt-1 md:bottom-[220px] md:pt-4`}
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
        {showGeorgeHeroTitle && <h1 className='mb-4'>GEORGE</h1>}
        {showGeorgeHeroTagline && (
          <p>
            {showPreLiveSignalSurface ? (
              'Start with your desired outcome.'
            ) : (
              <>
                <span className="block text-[15px] leading-[1.3] text-[#D7DBE4]/72">
                  Start with your desired outcome.
                </span>
                <span className="mt-1 block text-[15px] leading-[1.3] text-[#D7DBE4]/72">
                  Your words create motion.
                </span>
                {showGeorgeSupportCopy && (
                  <>
                    <span className="mt-3 block hidden text-[13px] leading-6 text-[#D7DBE4]/42 sm:block">
                      Conversation moves trust, money, care, conflict, opportunity, and work.
                    </span>
                    <span className="mt-1 block text-[13px] leading-6 text-[#D7DBE4]/58" />
                  </>
                )}
              </>
            )}
          </p>
        )}

        {showPreLiveSignalSurface && (
          <div className="mt-7 max-w-[860px] xl:max-w-[980px] md:max-w-[860px] xl:max-w-[1080px] md:max-w-[780px] xl:max-w-[920px] md:max-w-[780px] xl:max-w-[920px] border-l border-[#AEB6FF]/24 pl-5 text-left">
            {!isPreLiveEarbudReady && currentPreLiveQuestion && (
              <>
                <div className="mb-5 flex items-center justify-end border-b border-white/[0.06] pb-3">
                  {preLiveSignalStep > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreLiveSignalStep((step) => Math.max(0, step - 1))
                        setActivePromptContext('pre_live_signal_acquisition')
                        setActivePromptLabel(`Question ${Math.max(1, preLiveSignalStep)}`)
                      }}
                      className="mr-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D7DBE4]/38 transition hover:text-white"
                    >
                      Previous signal
                    </button>
                  )}

                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DBE4]/24">
                    {preLiveSignalStep + 1}/{preLiveQuestions.length}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#AEB6FF]/48">
                  {currentPreLiveQuestion.kicker}
                </div>

                <div className="mt-4 text-[13px] uppercase tracking-[0.2em] text-white/34">
                  {currentPreLiveQuestion.label}
                </div>

                <div className="mt-3 text-[19px] leading-8 tracking-[-0.02em] text-white/76">
                  {currentPreLiveQuestion.question}
                </div>

                <div className="mt-4 max-w-[34rem] rounded-[0.95rem] border border-white/[0.05] bg-white/[0.015] px-4 py-3">
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/24">
                    Example
                  </div>

                  <div className="mt-2 break-words text-[12.5px] leading-6 text-white/44">
                    {currentPreLiveQuestion.examples}
                  </div>
                </div>
              </>
            )}

            {isPreLiveEarbudReady && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#AEB6FF]/48">
                  LIVE Entry ready
                </div>

                <div className="mt-4 text-[19px] leading-8 tracking-[-0.02em] text-white/76">
                  Opening Brief Room.
                </div>              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </section>
)}

{false && null}

{false && showTypingPrescription && !liveMode && (
    <TypingPrescriptionSurface />
  )}

  

  {!liveMode && unfinishedTrajectories.length > 0 && !hasDraftInput && (
    <div className="pointer-events-auto fixed inset-x-0 top-[96px] z-[62] mx-auto w-full max-w-[430px] px-5 md:hidden">
      <div className="rounded-[1.15rem] border border-[#AEB6FF]/[0.08] bg-[#07090E]/72 px-3.5 py-3 shadow-[0_18px_54px_rgba(0,0,0,0.34)] ">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AEB6FF]/70 shadow-[0_0_12px_rgba(174,182,255,0.52)]" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#D7DCFF]/38">
              Project Tray
            </span>
          </div>
          <span className="text-[10px] text-white/22">confirmed goals</span>
        </div>

        <div className="grid gap-1.5">
          {unfinishedTrajectories.map((item) => (
            <div key={item.id} className="group rounded-[0.85rem] border border-white/[0.035] bg-[#10131B]/72 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const session = getSessionsForMode('normal').find((s) => s.id === item.id)
                    if (!session) return
                    setActiveSessionIdForMode('normal', item.id)
                    setActiveMode('normal')
                    window.location.href = '/george'
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate text-[12px] font-medium text-white/62">{item.title}</div>
                  <div className="mt-0.5 truncate text-[11px] text-white/30">{item.summary}</div>
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
  {((forceLive || liveMode) ? messages.filter((message) => {
  const clean = (message.content || '').trim()
  if (message.role === 'assistant' && clean === greeting.trim()) return false
  return true
}) : (messages.some((message) => message.role === 'user') ? messages : []))
  .filter((m) => m.role !== 'system')
  .map((m, i, visibleMessages) => {
    const latestAssistantIndex = visibleMessages.map((msg) => msg.role).lastIndexOf('assistant')
    const firstAssistantIndex = visibleMessages.findIndex((msg) => msg.role === 'assistant')
    const isLatestAssistant = m.role === 'assistant' && i === latestAssistantIndex
    const isWelcomeAssistant = m.role === 'assistant' && i === firstAssistantIndex

    return (
    <div
      key={i}
      className={`space-y-1 flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`relative whitespace-pre-wrap text-[15.5px] md:text-[15.8px] landscape:text-[18px] ${(forceLive || liveMode) ? 'leading-[1.72]' : 'leading-[1.68]'} landscape:leading-8 tracking-[0.002em] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#D7DBE4]/88 ${
          m.role === 'user'
            ? (liveMode
              ? 'max-w-[82%] text-right rounded-[0.95rem] border border-[#8FB6C9]/[0.06] bg-[linear-gradient(180deg,rgba(20,32,48,0.52),rgba(10,16,24,0.34))] px-3.5 py-2.5 shadow-[0_10px_24px_rgba(3,8,14,0.18)]'
              : 'message-user max-w-[78%] text-left rounded-[1.2rem] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.12)]')
 : (liveMode
              ? 'max-w-full text-left rounded-[1.15rem] border border-[#8FB6C9]/[0.045] bg-[linear-gradient(180deg,rgba(10,18,28,0.42),rgba(6,10,16,0.22))] px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.14)]'
              : 'message-assistant max-w-full text-left px-1 py-2')

        }`}
      >
        {m.role === 'assistant' ? (
          renderAssistantContent(
            typedMessageIndex === i ? (typedMessageContent || m.content) : m.content,
            liveMode
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
            <span>{m.content}</span>
          </>
        )}
      </div>

      {false && (m.content || '').length > 420 && (
        <button
          type="button"
          onClick={() =>
            setExpandedMessages((prev) => ({
              ...prev,
              [i]: !prev[i],
            }))
          }
          className="mt-1 px-1 text-[11px] tracking-[0.12em] text-[#D7DBE4]/34 transition hover:text-[#D7DBE4]/34"
        >
          {expandedMessages[i] ? 'See less' : 'Continue'}
        </button>
      )}

      {false && m.role === 'assistant' && m.content.includes('How should GEORGE assist?') && (
        <div className="flex flex-wrap gap-2">
          {[
            ['Text Assist', 'Use Text Assist. Give me short onscreen guidance for this conversation.'],
            ['Audio Assist', 'Use Audio Assist. Give me spoken help for earbud use, only when it is useful.'],
            ['Full Sentence', 'Use Full Sentence Assist. Give me exact lines I can say in this conversation.'],
            ['Silent Insight', 'Use Silent Insight. Only alert me when leverage, tone, or risk shifts.'],
          ].map(([label, prompt]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                const isAudioAssist = label === 'Audio Assist'
                const isTextAssist = label === 'Text Assist'
                const isFullSentence = label === 'Full Sentence'
                const isSilentInsight = label === 'Silent Insight'

                if (isAudioAssist) {
                  setVoiceOn(true)
                  setInteractionMode('speech')
                  window.localStorage.setItem('george_voice', 'on')
                  setTimeout(() => startListening(), 120)
                }

                if (isTextAssist || isFullSentence || isSilentInsight) {
                  setVoiceOn(false)
                  setInteractionMode('speech')
                  window.localStorage.setItem('george_voice', 'off')
                  setTimeout(() => startListening(), 120)
                }

                setActivePromptLabel(label)
                setActivePromptContext(`conversation_assist_${label.toLowerCase().replace(/ /g, '_')}`)

                const assistantMessage: Message = {
                  role: 'assistant',
                  content: `${label} active.

I am listening now. Speak naturally. I will respond ${
                    isAudioAssist
                      ? 'through audio when help is useful.'
                      : isFullSentence
                      ? 'with exact lines you can say.'
                      : isSilentInsight
                      ? 'only when leverage, tone, or risk shifts.'
                      : 'with short onscreen guidance.'
                  }`,
                }

                const nextMessages = [...messagesRef.current, assistantMessage]
                setMessages(nextMessages)
                messagesRef.current = nextMessages
              }}
              className="rounded-full border border-white/[0.07] bg-white/[0.026] px-5 py-4 text-xs text-[#D7DBE4]/82 transition hover:border-white/[0.09] hover:bg-white/[0.026]"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {m.role === 'user' && !liveMode && (
        <div className="flex items-center gap-1.5 text-[#D7DBE4]/72">
          <button
            type="button"
            onClick={() => {
              handleFeedback(i, 'up')
              setToastMessage('Saved')
              setShowToast(true)
            }}
            className={`relative flex items-center justify-center transition duration-150 ${
              feedback[i] === 'up'
                ? 'text-[#D7DBE4]/82'
                : 'text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80'
            }`}
            aria-label="Thumbs up"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[17px] w-[17px]"
              fill={feedback[i] === 'up' ? 'currentColor' : 'none'}
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
              handleFeedback(i, 'down')
              setToastMessage('Saved')
              setShowToast(true)
            }}
            className={`relative flex items-center justify-center transition duration-150 ${
              feedback[i] === 'down'
                ? 'text-red-100/82'
                : 'text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80'
            }`}
            aria-label="Thumbs down"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[17px] w-[17px]"
              fill={feedback[i] === 'down' ? 'currentColor' : 'none'}
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

      {m.role === 'assistant' && (
        <div className="relative space-y-1.5">

          {isLatestAssistant && liveMode && (
  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#D7DBE4]/50">

    <div className="relative bx-command-shimmer">
      {tonePopupIndex === i && (
        <div
          className={`absolute left-0 z-[80] w-48 rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 text-[11px] text-[#D7DBE4]/66 shadow-[0_22px_70px_rgba(0,0,0,0.48)]  transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            tonePopupUpward ? 'bottom-[34px]' : 'top-[30px]'
          }`}
        >
          <div className="border-b border-white/[0.05] px-3 py-2 text-[10px] tracking-[0.16em] text-[#D7DBE4]/36">
            STYLE
          </div>

          <div className="p-1.5">
            {([
              'assertive',
              'respectful',
              'concise',
              'direct',
              'warm',
              'firm'
            ] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => {
                  setAssistTone(tone as any)
                  setTonePopupIndex(null)
                  setToastMessage(`Style: ${tone}`)
                  setShowToast(true)
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
        {getLiveResponseServingTags(m, null).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/[0.055] bg-white/[0.018] px-1.5.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#D7DBE4]/48"
          >
            {tag}
          </span>
        ))}

        <button
          type="button"
          onClick={() => {
            handleFeedback(i, 'up')
            recordLiveSupportPreference({
              tags: getLiveResponseServingTags(m, null),
              value: 'up',
            })
            setToastMessage('Support type saved')
            setShowToast(true)
          }}
          className={`ml-1 flex items-center justify-center rounded-full px-1 py-1 transition ${
            feedback[i] === 'up'
              ? 'text-[#8FF0C7]/82'
              : 'text-[#D7DBE4]/42 hover:text-[#D7DBE4]/78'
          }`}
          aria-label="This GEORGE support type helped"
          title="This support type helped"
        >
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill={feedback[i] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 10V5.8c0-1 .3-2 .9-2.8L16 1.5l2 1.9c.7.7 1 1.6 1 2.6v3h1.5c1.1 0 1.9 1 1.7 2.1l-1.1 6.4A2 2 0 0 1 19.1 19H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h6Z" />
            <path d="M6 10H3v9h3" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            handleFeedback(i, 'down')
            recordLiveSupportPreference({
              tags: getLiveResponseServingTags(m, null),
              value: 'down',
            })
            setToastMessage('Support type saved')
            setShowToast(true)
          }}
          className={`flex items-center justify-center rounded-full px-1 py-1 transition ${
            feedback[i] === 'down'
              ? 'text-red-100/82'
              : 'text-[#D7DBE4]/42 hover:text-[#D7DBE4]/78'
          }`}
          aria-label="This GEORGE support type did not help"
          title="This support type did not help"
        >
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill={feedback[i] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 14v4.2c0 1-.3 2-.9 2.8L8 22.5l-2-1.9c-.7-.7-1-1.6-1-2.6v-3H3.5c-1.1 0-1.9-1-1.7-2.1l1.1-6.4A2 2 0 0 1 4.9 5H16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6Z" />
            <path d="M18 14h3V5h-3" />
          </svg>
        </button>
      </div>
    </div>

    

  </div>
)}

          {!liveMode &&
            !liveMode && (
          <div className="flex items-center gap-3 flex-nowrap overflow-x-auto text-[11px] text-[#D7DBE4]/50">
            {(
              <>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard?.writeText(m.content)
                  setToastMessage('Copied')
                  setShowToast(true)
                } catch {}
              }}
              className="px-1 py-1 text-[11px] text-[#D7DBE4]/50 transition hover:text-[#D7DBE4]/85 active:text-[#D7DBE4]/85"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={async () => {
                const shareText = m.content
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: 'GEORGE by BRANESx',
                      text: `GEORGE\n\n${shareText}`,
                      url: window.location.origin + '/',
                    })
                  } else if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareText)
                    setToastMessage('Copied')
                    setShowToast(true)
                  }
                } catch {}
              }}
              className="px-1 py-1 text-[11px] text-[#D7DBE4]/50 transition hover:text-[#D7DBE4]/85 active:text-[#D7DBE4]/85"
            >
              Share
            </button>

            <button
              type="button"
              onClick={() => openLiveEntryFromMessage(m)}
              className="px-1 py-1 text-[11px] text-[#8FB6C9]/62 transition hover:text-[#D7DCFF] active:text-white"
            >
              Earbuds
            </button>

              </>
            )}

            <button
              type="button"
              onClick={() => {
                handleFeedback(i, 'up')
                setToastMessage('Saved')
                setShowToast(true)
              }}
              className={`relative flex items-center justify-center transition duration-150 ${
                feedback[i] === 'up'
                  ? 'text-[#D7DBE4]/82'
                  : 'text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80'
              } ${
                feedbackPulse[`${i}-up`]
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(174,182,255,0.55)]'
                  : 'scale-100'
              }`}
              aria-label="Thumbs up"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[17px] w-[17px]"
                fill={feedback[i] === 'up' ? 'currentColor' : 'none'}
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
                handleFeedback(i, 'down')
                setToastMessage('Feedback received')
                setShowToast(true)
              }}
              className={`relative flex items-center justify-center transition duration-150 ${
                feedback[i] === 'down'
                  ? 'text-[#D7DBE4]/82'
                  : 'text-[#D7DBE4]/50 hover:text-[#D7DBE4]/80'
              } ${
                feedbackPulse[`${i}-down`]
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(174,182,255,0.55)]'
                  : 'scale-100'
              }`}
              aria-label="Thumbs down"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[17px] w-[17px]"
                fill={feedback[i] === 'down' ? 'currentColor' : 'none'}
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
              className={`absolute z-30 w-[230px] max-w-[82vw] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 p-2 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  animate-[pickerTwistUp_180ms_cubic-bezier(0.22,1,0.36,1)] ${savePopupUpward ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom' : 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top'}` }
            >
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#D7DBE4]/48">
                  Remember
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMemoryFolder('Sessions')
                      saveMemory(m, i, 'Sessions')
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
                  {['Follow-ups'].map((folder) => (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => {
                        setActiveMemoryFolder(folder)
                        saveMemory(m, i, folder)
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
                    const folder = getDefaultFolder()
                    setActiveMemoryFolder(folder)
                    saveMemory(m, i, folder)
                  }}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.018] px-1.5.5 py-2 text-[11px] font-medium leading-4 text-[#D7DBE4]/86 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  Remember in {getDefaultFolder()}
                </button>

                {getExistingFolders().length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-neutral-500">Recent</div>
                    <div className="flex flex-wrap gap-1">
                      {getExistingFolders().map((folder) => (
                        <button
                          key={folder}
                          type="button"
                          onClick={() => {
                            setActiveMemoryFolder(folder)
                            saveMemory(m, i, folder)
                          }}
                          className={`max-w-full break-words rounded-full border px-1.5 py-1 text-[10px] leading-4 transition ${
                            activeMemoryFolder === folder
                              ? 'border-white/[0.09] bg-white/[0.026] text-[#D7DBE4]'
                              : 'border-white/[0.08] text-neutral-300 hover:border-white/[0.12] hover:text-[#D7DBE4]'
                          }`}
                        >
                          {folder}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeMemoryFolder && getLatestSavedMemoryByFolder(activeMemoryFolder) && (
                  <div className="rounded-xl border border-white/[0.06] bg-black/28 p-1.5 text-[10px] leading-4 text-neutral-500 break-words">
                    {getLatestSavedMemoryByFolder(activeMemoryFolder)}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="text-[10px] text-neutral-500">New folder</div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder"
                      className="w-full rounded-xl border border-white/[0.06] bg-black/24 px-1.5.5 py-1.5 text-[11px] leading-4 text-[#D7DBE4] outline-none placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const folder = newFolderName.trim() || getDefaultFolder()
                        setActiveMemoryFolder(folder)
                        saveMemory(m, i, folder)
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
    </div>
    )
  })}
  
{showScrollHint && (
  <div className="fixed bottom-[calc(184px+env(safe-area-inset-bottom))] left-1/2 z-[90] -translate-x-1/2 transition-opacity duration-200">
    <button
      type="button"
      onClick={() => {
        userPinnedBottomRef.current = true
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        setShowScrollHint(false)
      }}
      className="text-[14px] font-medium tracking-[0.06em] text-[#D7DBE4]/44 transition hover:text-[#D7DBE4]/72"
      aria-label="Continue"
    >
      Continue ↓
    </button>
  </div>
)}

{false && null}

{showLiveEntrySequence && (forceLive || liveMode) && (forceLive || messages.length === 0) && (
  <div className="mx-auto w-full max-w-[430px] md:max-w-[780px] xl:max-w-[980px] px-4 pt-[95px] md:pt-[105px] xl:pt-[115px]">
    <div className="min-h-[190px] overflow-visible">
      <div className="font-mono whitespace-pre-line text-left text-[13px] leading-6 tracking-[0.01em] text-[#D7DBE4]/68">
        {typedLiveEntryBriefing || "LIVE · Room phrases default\n\nGEORGE turns words into movement.\n\nI have the room.\n\nSpeak clearly. Remember your room phrases."}
      </div>

      {showLiveEntrySequence && liveEntryCheckpointState.showResponsibility && liveEntryTypingComplete && (
        <button
          type="button"
          onClick={() => setLiveEntryResponsibilityConfirmed(true)}
          className="mt-6 w-full rounded-[1rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.035]"
        >
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-white/28">
            Responsibility
          </span>
          <span className="mt-2 block text-[13px] leading-6 text-[#D7DBE4]/68">
            Responsibility remains with you. GEORGE assists. You decide.
          </span>
        </button>
      )}

      {showLiveEntrySequence && liveEntryCheckpointState.showToa && liveEntryTypingComplete && (
        <button
          type="button"
          onClick={() => setLiveEntryToaConfirmed(true)}
          className="mt-6 w-full rounded-[1rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.035]"
        >
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-white/28">
            Terms of Assistance
          </span>
          <span className="mt-2 block text-[13px] leading-6 text-[#D7DBE4]/68">
            Make sure the important facts are accurate. GEORGE can only work from the signal available.
          </span>
        </button>
      )}

      {liveEntryReadyForOptionalSignal && (
        <div className="mt-6 rounded-[1rem] border border-white/[0.06] bg-white/[0.014] px-4 py-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/26">
            Final signal
          </div>

          <div className="mt-2 text-[13px] leading-6 text-[#D7DBE4]/64">
            Add pressure, constraints, hidden dynamics, timing, or anything that changes the room.
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

      <div className="relative mt-2 min-h-5 cursor-text">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          rows={1}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={composerPlaceholder}
          className="max-h-36 min-h-6 w-full resize-none appearance-none overflow-y-auto border-0 bg-transparent p-0 font-mono text-[13px] leading-6 tracking-[0.01em] text-[#D7DBE4]/76 outline-none ring-0 shadow-none placeholder:italic placeholder:text-[#D7DBE4]/26 focus:border-0 focus:border-transparent focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />

        {!input.trim() && (
          <span className="pointer-events-none absolute left-0 top-[3px] h-[18px] w-px bg-[#D7DBE4]/60 [animation:georgeComposerCursorBlink_.48s_steps(1,end)_infinite]" />
        )}
      </div>
    </div>
  </div>
)}

<div ref={messagesEndRef} className={`${(forceLive || liveMode) && !showLiveEntrySequence ? 'h-[104px] md:h-[124px]' : 'h-[54px] md:h-[64px]'}`} />

</div>


            

            <div className={`${(forceLive || liveMode) && !showLiveEntrySequence ? 'contents' : 'relative w-full flex-col bg-transparent flex transition duration-200 z-20'}`}>
              

              <div className={`fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-0 right-0 z-[330] mx-auto flex w-full max-w-[900px] px-3 md:w-[calc(100%-24px)] items-center justify-center pointer-events-auto leading-none`}>
                <LiveFooterControls
                  language={language}
                  liveMode={liveMode}
                  voiceOn={voiceOn}
                  tierLabel={tierUpgradeAction.currentLabel}
                  tierActionLabel={tierUpgradeAction.label}
                  motionHoverText={operationalMotion.hoverText}
                  motionPress={operationalMotion.press}
                  onHelp={() => {
                    setActiveHelpTopic('live')
                    setShowLanguageMenu(false)
                    setShowNormalUtilityMenu((value) => value === 'help' ? null : 'help')
                  }}
                  onLanguage={(e) => {
                    e.stopPropagation()
                    setShowNormalUtilityMenu((value) => value === 'language' ? null : 'language')
                  }}
                  onExitOrTier={() => {
                    if (liveMode) {
                      setShowNormalUtilityMenu(null)
                      requestExitLiveMode()
                      return
                    }

                    setShowNormalUtilityMenu(null)
                    setShowTierModal(true)
                  }}
                  onVoiceToggle={() => {
                    if (currentTier === 'smart') {
                      setToastMessage('Voice replies unlock above Smart.')
                      setShowToast(true)
                      return
                    }

                    const nextVoice = !voiceOn
                    hasUserInteractedRef.current = true
                    setVoiceOn(nextVoice)
                    setInteractionMode(nextVoice ? 'speech' : 'text')
                    window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
                    setToastMessage(nextVoice ? 'Audio on' : 'Audio off')
                    setShowToast(true)
                  }}
                />

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
                      <div ref={normalUtilityMenuRef} className={`fixed bottom-[112px] left-1/2 z-[320] flex max-w-[calc(100vw-32px)] -translate-x-1/2 gap-2 ${operationalMotion.surface}`}>
                      {showNormalUtilityMenu === 'help' && (
                        <>
                          <div className={`w-[136px] px-3 py-2.5 md:w-[160px] md:px-5 md:py-4 ${operationalMotion.anchorPanel}`}>
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
                                ['live', 'LIVE'],
                                ['continuity', 'ACCESS'],
                                ['memory', 'WORKSPACE'],
                                ['images', 'IMAGES'],
                                ['signal', 'HELP'],
                              ].map(([id, label]) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setActiveHelpTopic(id as any)}
                                  className={`block w-full py-1 text-left text-[13px] uppercase tracking-[0.16em] transition ${
                                    activeHelpTopic === id
                                      ? 'text-white/82'
                                      : 'text-white/38 hover:text-white/72'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={`w-[190px] px-3 py-2.5 md:w-[220px] md:px-5 md:py-4 ${operationalMotion.anchorPanel}`}>
                            <div className="mb-2 text-[9px] uppercase tracking-[0.22em] text-white/24">
                              {activeHelpTopic === 'live' && 'LIVE'}
                              {activeHelpTopic === 'continuity' && 'ACCESS'}
                              {activeHelpTopic === 'memory' && 'WORKSPACE'}
                              {activeHelpTopic === 'images' && 'IMAGES'}
                              {activeHelpTopic === 'signal' && 'HELP'}
                            </div>

                            <p className="text-[13px] leading-5 text-white/48">
                              {activeHelpTopic === 'live' && 'LIVE helps you operate during real conversations where timing, pressure, and delivery matter.'}
                              {activeHelpTopic === 'continuity' && 'Access restores recognition, continuity, tier access, and LIVE eligibility across sessions.'}
                              {activeHelpTopic === 'memory' && 'Workspace keeps useful context available so GEORGE can continue work without starting over.'}
                              {activeHelpTopic === 'images' && 'Images help GEORGE understand visual context, references, screenshots, and creative direction.'}
                              {activeHelpTopic === 'signal' && 'Help opens supporting information without interrupting the work.'}
                            </p>

                            {activeHelpTopic === 'signal' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNormalUtilityMenu(null)
                                  window.location.href = '/signal'
                                }}
                                className="mt-3 block py-1 text-[13px] uppercase tracking-[0.16em] text-white/36 transition hover:text-white"
                              >
                                Open Help
                              </button>
                            )}

                            {activeHelpTopic === 'memory' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowMemoryContinuityPanel(true)
                                  setShowNormalUtilityMenu(null)
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

                      {showNormalUtilityMenu === 'language' && (
                        <div className={`w-[190px] px-3 py-2.5 md:w-[220px] md:px-5 md:py-4 ${operationalMotion.anchorPanel}`}>
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
                                  setLanguage(option)
                                  window.localStorage.setItem('george_language', option)
                                  setToastMessage(`Language set: ${option}`)
                                  setShowToast(true)
                                  setShowNormalUtilityMenu(null)
                                }}
                                className={`py-1 text-left text-[10px] uppercase tracking-[0.12em] transition active:scale-[0.98] ${
                                  language === option
                                    ? 'text-white/82'
                                    : 'text-white/34 hover:text-white/68'
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
          e.stopPropagation()
          setShowRecentFolders(prev => !prev)
          setActiveMemoryFolder(null)
        }}
        className={`group relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-150 ease-out ${
          liveMode || activePromptContext?.includes('conversation') || activePromptContext?.includes('professional') || activePromptContext?.includes('brilliant_live')
            ? 'border-white/[0.12] bg-white/[0.04] text-[#D7DBE4]/82 shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
            : 'border-white/10 bg-white/[0.015] text-[#D7DBE4]/70 hover:border-white/20 hover:bg-white/[0.022] hover:text-[#D7DBE4]/92'
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

      {(currentTier === 'smart' || currentTier === 'intelligent' || currentTier === 'brilliant') && (
        <>
        <button
          type="button"
          onClick={() => {
if (liveMode) {
  requestExitLiveMode()
} else {
  enterLiveConversation()
}
}}
          className={`flex h-9 items-center justify-center px-1.5 text-[12px] font-medium tracking-[0.12em] transition ${
            liveMode
              ? 'border border-red-200/[0.14] bg-red-200/[0.035] text-red-100/62 hover:text-red-100/86'
              : 'text-[#D7DBE4]/80 hover:text-[#D7DBE4]'
          }`}
        >
          {liveMode ? 'EXIT' : 'LIVE'}
        </button>

        {liveMode && (
          <button
            type="button"
            onClick={() => {
              if (currentTier === 'smart') {
                setToastMessage('Voice replies unlock above Smart.')
                setShowToast(true)
                return
              }

              const nextVoice = !voiceOn
              hasUserInteractedRef.current = true
              setVoiceOn(nextVoice)
              setInteractionMode(nextVoice ? 'speech' : 'text')
              window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
              setToastMessage(nextVoice ? 'Audio on' : 'Audio off')
              setShowToast(true)
            }}
            className={`flex h-9 items-center justify-center px-1.5 text-[12px] font-medium tracking-[0.12em] transition ${
              voiceOn
                ? 'text-emerald-100/72 hover:text-emerald-100'
                : 'text-[#D7DBE4]/46 hover:text-[#D7DBE4]/78'
            }`}
            aria-label={voiceOn ? 'Turn audio off' : 'Turn audio on'}
          >
            {voiceOn ? 'MUTE' : 'UNMUTE'}
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
                        setActiveMemoryFolder(folder)
                      }}
                      className={`block w-full rounded-xl px-3 py-1.5 text-left text-[13px] transition ${
                        activeMemoryFolder === folder
                          ? 'bg-white/[0.08] text-[#D7DBE4]'
                          : 'text-[#D7DBE4]/34 hover:bg-white/[0.022] hover:text-[#D7DBE4]'
                      }`}
                    >
                      {folder}
                    </button>
                  )
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
  .filter(item => (item.type || 'memory') !== 'campaign')
  .map((item, idx) => {
                    const textBlock =
                      item.savedPair && item.userPromptContent
                        ? `User: ${item.userPromptContent}\nGEORGE: ${item.content}`
                        : item.content

                    const isLatest = idx === 0

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const memoryContext = `Workspace context:\n${textBlock}\n\nUse this context, continue from it, or tell me what changed.`

                          const nextMessages = [
                            ...messagesRef.current,
                            { role: 'assistant' as const, content: memoryContext }
                          ]

                          setMessages(nextMessages)
                          messagesRef.current = nextMessages

                          setShowRecentFolders(false)
                          setActiveMemoryFolder(null)
                        }}
                        className={`block w-full rounded-xl border px-4 py-1.5 text-left text-xs transition ${
                          isLatest
                            ? 'border-white/[0.12] bg-white/[0.04] text-[#D7DBE4]'
                            : 'border-white/[0.06] bg-black/28 text-neutral-300 hover:border-white/[0.12] hover:text-[#D7DBE4]'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-1.5">
                          <span className="truncate">
                            {item.preview || (item.content || '').slice(0, 80)}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[#D7DBE4]/45">
                              recent
                            </span>
                          )}
                        </div>
                      </button>
                    )
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
          e.stopPropagation()
          setActiveSaveIndex(null)
          setShowRecentFolders(false)
          setShowPromptMenu((prev) => !prev)
          setShowConversationMenu(false)
        }}
        className="relative flex h-7 w-7 items-center justify-center text-[#D7DBE4]/85 transition hover:text-[#D7DBE4]"
        aria-label="Make a better move"
      >
        <span className="text-[34px] leading-none">+</span>
        <span
          className={`absolute right-2 top-1 h-1 w-1 rounded-full ${
            reroutePrompt || suggestedPrompts !== tieredStarterPrompts && suggestedPrompts.length > 0
              ? 'bg-white'
              : 'bg-white/85'
          } ${
            suggestedSignal || rerouteSignal
              ? 'ring-1 ring-white/[0.18] shadow-[0_0_8px_rgba(255,255,255,0.14)] '
              : ''
          }`}
        />
      </button>

      {showPromptMenu && (
        <div
          ref={promptMenuRef}
          className="absolute bottom-full mb-2 left-0 z-50 w-[170px] max-w-[48vw] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 px-1.5.5 py-1.5 shadow-[0_22px_70px_rgba(0,0,0,0.48)]  transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                const turningOn = activePromptContext !== 'bible_decision_lens'
                setActivePromptLabel(turningOn ? 'Be as Christ' : null)
                setActivePromptContext(turningOn ? 'bible_decision_lens' : null)
                setContextTurnCount(0)
                setShowPromptMenu(false)
                setToastMessage(turningOn ? 'Be as Christ on' : 'Be as Christ off')
                setShowToast(true)
                textareaRef.current?.focus()
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
            >
              Be as Christ
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentTier === 'smart') {
                  setToastMessage('Voice replies unlock above Smart.')
                  setShowToast(true)
                  return
                }
                const nextVoice = !voiceOn
                hasUserInteractedRef.current = true
                setVoiceOn(nextVoice)
                setInteractionMode(nextVoice ? 'speech' : 'text')
                window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
                setToastMessage(nextVoice ? 'Voice Active' : 'Voice Standby')
                setShowToast(true)
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
            >
              Voice replies {voiceOn ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentTier !== 'brilliant') {
                  
                  setShowToast(true)
                  return
                }
                setShowPromptMenu(false)
                setShowConversationMenu(true)
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
            >
              
            </button>

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click()
                setShowPromptMenu(false)
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]"
            >
              Upload image / file
            </button>

            {reroutePrompt && (
              <button
                type="button"
                onClick={() => {
                  setActivePromptLabel(reroutePrompt.label)
                  setActivePromptContext(reroutePrompt.context)
                  setShowPromptMenu(false)
                  setRerouteSignal(0)
                  void handleSend(reroutePrompt.text)
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
                  setActivePromptLabel(prompt.label)
                  setActivePromptContext(prompt.context)
                  if (prompt.context?.startsWith('brilliant_')) setConversationMode(prompt.context)
                  setShowPromptMenu(false)
                  void handleSend(prompt.text, { source: 'sidebar_prompt' })
                }}
                className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#D7DBE4]/72"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

{false && liveMode && (
  <div className="fixed inset-x-0 top-[58px] z-[260] flex justify-center pointer-events-none">
    <div className="flex flex-col items-center gap-3 px-6 text-center animate-[pickerTwistUp_220ms_cubic-bezier(0.22,1,0.36,1)]">
      <div className="relative h-[122px] w-[122px]">
        <img
          src="/1earbud.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-45 blur-[1.2px]"
        />
        <img
          src="/1earbud.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-82 drop-shadow-[0_0_18px_rgba(174,182,255,0.18)] [clip-path:circle(35%_at_50%_50%)]"
        />
        <div className="absolute inset-0 rounded-full border border-white/[0.06] bg-white/[0.025] blur-[0.2px]" />
      </div>

      <div className="rounded-[1rem] border border-white/[0.08] bg-black/74 px-4 py-2 text-[12px] leading-5 text-[#D7DBE4]/74 shadow-[0_14px_40px_rgba(0,0,0,0.50)] ">
        LIVE GEORGE
      </div>
    </div>
  </div>
)}






{showProLiveComingSoon && typeof document !== 'undefined' && createPortal(
  <>
    <button
      type="button"
      aria-label="Close structured LIVE notice"
      onClick={() => setShowProLiveComingSoon(false)}
      className="fixed inset-0 z-[240] bg-black/68 -[10px]"
    />

    <div className="fixed inset-0 z-[141] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] rounded-[1.5rem] border border-white/[0.07] bg-[#0B0D12]/94 p-5 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  ">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/72">
          LIVE STRUCTURE
        </div>

        <div className="mt-2 text-[16px] font-semibold text-[#D7DBE4]">
          Coming soon.
        </div>

        <div className="mt-3 text-[12px] leading-5 text-[#D7DBE4]/58">
          LIVE is currently focused on stabilizing individual real-time assistance before expanding into structured LIVE environments.
        </div>

        <button
          type="button"
          onClick={() => setShowProLiveComingSoon(false)}
          className="mt-5 w-full rounded-xl border border-white/[0.075] bg-white/[0.025] px-4 py-3 text-sm font-medium text-[#D7DBE4]/82 transition hover:border-white/[0.09] hover:bg-white/[0.026] hover:text-[#D7DBE4]"
        >
          Continue
        </button>
      </div>
    </div>
  </>,
  document.body
)}


{showExitPopup && (
  <style>{`
    .george-live-route {
      filter: blur(14px);
      transition: filter 180ms ease;
    }
  `}</style>
)}

{showExitPopup && typeof document !== 'undefined' && createPortal(
  <>
    <button
      type="button"
      aria-label="Close leave LIVE popup"
      onClick={() => setShowExitPopup(false)}
      className="fixed inset-0 z-[220] bg-black/58 backdrop-blur-[14px]"
    />

    <div className="fixed inset-0 z-[230] flex items-center justify-center px-4">
      <div className={`relative w-[min(360px,calc(100vw-32px))] px-3 py-2.5 md:px-5 md:py-4 md:px-5 md:py-4 ${operationalMotion.anchorPanel} ${operationalMotion.surface}`}>
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
          Return to GEORGE.
        </p>

        <div className="grid gap-1">
          <button
            type="button"
            onClick={() => {
              setShowExitPopup(false)
              window.localStorage.setItem('george_start_new_live', '1')
              openLiveEntry()
            }}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-[#D7DBE4]/58 transition hover:text-white active:scale-[0.98]"
          >
            New LIVE
          </button>

          <button
            type="button"
            onClick={() => {
              setShowExitPopup(false)
              recordActiveLiveRuntimeUsage()
              exitLiveMode()
            }}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white active:scale-[0.98]"
          >
            Save and exit
          </button>

          <button
            type="button"
            onClick={() => {
              setShowExitPopup(false)
              window.localStorage.removeItem('george_active_live_session_id')
              window.localStorage.removeItem('george_active_campaign_session_id')
              exitLiveMode()
            }}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-red-100/58 transition hover:text-red-100/88 active:scale-[0.98]"
          >
            Leave without saving
          </button>

          <button
            type="button"
            onClick={() => setShowExitPopup(false)}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white active:scale-[0.98]"
          >
            Continue session
          </button>
        </div>
      </div>
    </div>
  </>,
  document.body
)}

{false && showSessionPicker && typeof document !== 'undefined' && createPortal(
  <>
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        setSessionPickerClosing(true)
        window.setTimeout(() => {
          setShowSessionPicker(false)
          setSessionPickerClosing(false)
        }, 170)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          setSessionPickerClosing(true)
          window.setTimeout(() => {
            setShowSessionPicker(false)
            setSessionPickerClosing(false)
          }, 170)
        }
      }}
      className={`fixed inset-0 z-[200] bg-black/72  transition-opacity duration-150 ${sessionPickerClosing ? 'opacity-0' : 'opacity-100'}`}
    />

    <div className="fixed inset-0 z-[210] flex items-end justify-center px-4 pb-[132px] md:items-center md:pb-0">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[360px] max-h-[48dvh] overflow-y-auto rounded-[1.05rem] border ${sessionPickerMode === 'campaign' ? 'border-white/[0.07]' : 'border-white/[0.075]'} bg-[#05080D]/88 px-3 py-3 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  transition-all duration-200 ease-out ${sessionPickerClosing ? 'translate-y-10 opacity-0 scale-[0.98]' : 'translate-y-0 opacity-100 scale-100'}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="pr-12">
            <div className="text-[11px] tracking-[0.18em] text-[#D7DBE4]/72">
              {false ? 'RESUME LIVE' : 'RESUME CONVERSATION'}
            </div>
            <div className="mt-1 text-[11px] text-[#D7DBE4]/45">
              {false ? 'Saved LIVE sessions.' : 'Recent LIVE conversations.'}
            </div>

            <button
              type="button"
              onClick={() => {
                const sessions = getSessionsForMode('live')

                sessions.forEach((session: any) => deleteSession(session.id))

                setPendingDeleteSessionId(null)
                setShowSessionPicker(false)
                setToastMessage(false ? 'LIVE sessions cleared.' : 'LIVE conversations cleared.')
                setShowToast(true)
              }}
              className="mt-2 text-[11px] text-red-100/48 transition hover:text-red-100/82"
            >
              Clear saved LIVE
            </button>
          </div>
          <button
            type="button"
            aria-label="Close resume picker"
            onClick={() => {
              setSessionPickerClosing(true)
              window.setTimeout(() => {
                setShowSessionPicker(false)
                setSessionPickerClosing(false)
              }, 170)
            }}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/72 -[10px] text-[#D7DBE4]/70 transition hover:border-white/[0.09] hover:text-[#D7DBE4]"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {(() => {
            let sessions: any[] = []
            try {
              sessions = getSessionsForMode('live')
                  .filter(hasMeaningfulUserMessage)
                  .sort((a, b) => {
                    const activeId = getActiveSessionIdForMode('live')
                    if (a.id === activeId) return -1
                    if (b.id === activeId) return 1
                    return b.updatedAt - a.updatedAt
                  })
            } catch {
              sessions = []
            }

            if (!sessions.length) {
              return (
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-2 text-[12px] text-[#D7DBE4]/65">
                  {false ? 'No saved LIVE sessions yet.' : 'No saved conversations yet.'}
                </div>
              )
            }

            return sessions.slice(0, 12).map((session) => (
              <div
                key={session.id}
                className="group relative overflow-hidden rounded-[1rem] border border-transparent bg-black/20 transition hover:bg-white/[0.035]"
              >
                <button
                  onClick={() => {
                  setSessionPickerClosing(true)
                  window.setTimeout(() => {
                    setShowSessionPicker(false)
                    setSessionPickerClosing(false)
                  }, 170)
                  // LIVE resume is conversation-only. PRO LIVE / campaign resume is archived.
                  setConversationMode('manual_live')
                  setActivePromptContext('manual_live')
                  setActivePromptLabel(session.title || 'Conversation')
                  setVoiceOn(false)
                  setInteractionMode('text')

                  const goal = session.userGoal || session.currentGoal || session.desiredOutcome || 'Not set'
                  const state = session.lastKnownState || session.summary || 'Unknown'
                  const restart = session.suggestedRestart || 'Continue from the strongest next move, or tell me what changed.'

                  const restartBrief: Message = {
                    role: 'assistant',
                    content: `Welcome back.

Direction:
${goal}

Current position:
${state}

Next move:
${restart}


Continue from here, tell me what changed, or start fresh.`
                  }

                  const restored = Array.isArray(session.messages)
                    ? session.messages
                    : []

                  // Welcome back restore message FIRST
                  const smartResumeEntry: Message = restartBrief

                  // keep history behind it (hidden until user scrolls)
                  const merged = [smartResumeEntry, ...restored]

                  setMessages(merged)
                  messagesRef.current = merged

                  setToastMessage(`${session.title || 'Conversation'} restored.`)
                  setShowToast(true)
                }}
                className="w-full text-left px-3 py-2 pr-14 text-[12px] text-[#D7DBE4]/82"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 font-semibold text-[#D7DBE4]">
                    {session.title || session.label || session.name || 'Conversation'}
                  </div>

                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.14em] ${
                    sessionPickerMode === 'campaign'
                      ? 'bg-white/[0.026] text-[#D7DBE4]/72'
                      : 'bg-white/[0.022] text-[#D7DBE4]/52'
                  }`}>
                    
                  </span>
                </div>

                <div className="mt-1.5 line-clamp-1 text-[11px] text-[#D7DBE4]/55">
                  Direction: {session.userGoal || session.currentGoal || session.desiredOutcome || 'Not set'}
                </div>

                <div className="mt-0.5 line-clamp-1 text-[11px] text-[#D7DBE4]/38">
                  Last position: {session.lastKnownState || session.summary || 'No state captured yet'}
                </div>

                <div className="mt-1.5 text-[10px] text-neutral-500">
                  {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'Saved conversation'}
                </div>
              </button>

              <div className="absolute right-2 top-2 flex items-center">
                {pendingDeleteSessionId === session.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteSession(session.id)
                      setPendingDeleteSessionId(null)
                      setToastMessage('Session deleted.')
                      setShowToast(true)
                    }}
                    className="rounded-full bg-red-400/[0.045] px-1.5.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-red-100/82 transition hover:bg-red-400/[0.08]"
                  >
                    CONFIRM
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteSessionId(session.id)
                    }}
                    className="rounded-full px-1.5 py-1 text-[14px] text-[#D7DBE4]/38 transition hover:bg-white/[0.022] hover:text-[#D7DBE4]/92"
                  >
                    ⋯
                  </button>
                )}
              </div>
            </div>
            ))
          })()}
        </div>
      </div>
    </div>
  </>,
  document.body
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

      {([
        ['WIN', '✓ Won', 'text-green-400'],
        ['LOSS', '✗ Lost', 'text-red-400'],
        ['FOLLOW_UP', '↻ Follow-up', 'text-yellow-400'],
      ] as const).map(([signal, label, colorClass]) => (
        <button
          key={signal}
          onClick={() => {
            const history = JSON.parse(window.localStorage.getItem('GEORGE_OUTCOMES') || '[]')
            history.unshift({ signal, context: lastOutcomeContext, ts: Date.now() })
            window.localStorage.setItem('GEORGE_OUTCOMES', JSON.stringify(history.slice(0,50)))

            const sessions = getCampaignSessions()
            const updatedSessions = Array.isArray(sessions)
              ? sessions.map((session: any) => {
                  if (activeCampaignId && session.id !== activeCampaignId) return session

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
                  }

                  const nextPerf = {
                    ...perf,
                    wins: (perf.wins || 0) + (signal === 'WIN' ? 1 : 0),
                    losses: (perf.losses || 0) + (signal === 'LOSS' ? 1 : 0),
                    followUps: (perf.followUps || 0) + (signal === 'FOLLOW_UP' ? 1 : 0),
                    closes: (perf.closes || 0) + (signal === 'WIN' ? 1 : 0),
                    callbacks: (perf.callbacks || 0) + (signal === 'FOLLOW_UP' ? 1 : 0),
                    history: [
                      {
                        signal,
                        context: lastOutcomeContext,
                        ts: Date.now(),
                        duration: attemptStartTime ? (Date.now() - attemptStartTime) : null
                      },
                      ...((perf.history || []) as any[]),
                    ].slice(0, 50),
                  }

                  return { ...session, performance: nextPerf }
                })
              : []

            updateCampaignSessionMetadata(activeCampaignId, (metadata) => {
              const current = (metadata.performance || {}) as any
              const next = updatedSessions.find((item: any) => item.id === activeCampaignId)?.performance || current

              return {
                ...metadata,
                performance: next,
              }
            })

            setShowOutcomeBar(false)
            setLastOutcomeContext(null)
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
                <div className="pointer-events-none fixed inset-0 z-[71] bg-black/68 -[10px]" />
              )}




              {!(forceLive || liveMode) && (
                <>
                  <div className="pointer-events-none fixed bottom-0 left-0 right-0 xl:left-[280px] z-[55] h-[212px] bg-[#0B0D12]" />
                  <div className="pointer-events-none fixed bottom-[196px] left-0 right-0 xl:left-[280px] z-[55] h-[92px] bg-gradient-to-t from-[#0B0D12] to-transparent" />
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
  <div className={`${(forceLive || liveMode) ? 'hidden' : 'fixed'} bottom-[96px] left-0 right-0 z-[140] flex justify-center pointer-events-none`}>
    <div className="text-[10px] text-[#D7DBE4]/24 tracking-[0.16em]">
      <span className="inline-flex items-center gap-[5px]">
      </span>
    </div>
  </div>
)}

{false && liveMode && stableLiveGuidance && (
  <div className={`${(forceLive || liveMode) ? 'hidden' : 'fixed'} bottom-[118px] left-0 right-0 z-[88] mx-auto flex w-full max-w-[900px] justify-center px-4`}>
    <div className="w-full max-w-[420px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[420px] md:max-w-[720px] xl:max-w-[920px] xl:max-w-[760px] rounded-[0.9rem] border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 md:px-5 md:py-4 md:px-5 md:py-4 -[10px]">
      {stableLiveGuidance && (
        <>
          <div className="mb-1 text-[9px] uppercase tracking-[0.22em] text-[#AEB6FF]/52">
            {stableLiveGuidance?.signal}
          </div>
          <div className="text-[13px] leading-5 text-[#F4F6FA]/88">
            {stableLiveGuidance?.say?.replace(/^Say:\s*/i, '')}
          </div>
        </>
      )}

      {outcomeGovernorSnapshot && (
        <div className={`${stableLiveGuidance ? 'mt-2 border-t border-white/[0.055] pt-2' : ''}`}>
          <div className="text-[9px] uppercase tracking-[0.22em] text-white/22">
            GOVERNOR
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 md:grid-cols-3 md:gap-3 text-[10px] leading-4 text-white/42">
            <div>
              <span className="block text-white/24">Move</span>
              {outcomeGovernorSnapshot?.move}
            </div>
            <div>
              <span className="block text-white/24">Movement</span>
              {outcomeGovernorSnapshot?.movementState}
            </div>
            <div>
              <span className="block text-white/24">Missing</span>
              {outcomeGovernorSnapshot?.missingSignal || 'none'}
            </div>
          </div>
          <div className="mt-1 hidden">
            {outcomeGovernorSnapshot?.missingSignalReason}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{false && liveMode && (
  <div className={`${(forceLive || liveMode) ? 'hidden' : 'fixed'} bottom-[72px] left-0 right-0 z-[90] mx-auto flex w-full max-w-[900px] justify-center px-4`}>
    <div className="relative flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={() => {
          setShowLiveQuickMenu(false)
          setShowLanguageMenu(false)
          setActiveHelpTopic('live')
          setShowNormalUtilityMenu((value) => value === 'help' ? null : 'help')
        }}
        className="px-1 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-red-100/52 hover:text-red-100/82 ${operationalMotion.press}"
      >
        HELP
      </button>

      <button
        type="button"
        onClick={() => {
          setShowNormalUtilityMenu(null)
          setActiveHelpTopic('live')
          setShowLanguageMenu(false)
          setShowLiveQuickMenu((value) => !value)
        }}
        className="inline-flex items-center gap-2 px-1 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#D7DBE4]/52 ${operationalMotion.hoverText} ${operationalMotion.press}"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-200/36 shadow-[0_0_10px_rgba(248,113,113,0.18)]" />
        EXIT
      </button>

      <button
        type="button"
        onClick={() => {
          if (currentTier === 'smart') {
            setToastMessage('Voice replies unlock above Smart.')
            setShowToast(true)
            return
          }

          const nextVoice = !voiceOn
          hasUserInteractedRef.current = true
          setVoiceOn(nextVoice)
          setInteractionMode(nextVoice ? 'speech' : 'text')
          window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
          setToastMessage(nextVoice ? 'Audio on' : 'Audio off')
          setShowToast(true)
        }}
        className={`inline-flex items-center gap-2 px-1 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ${voiceOn ? 'text-[#D7DBE4]/72' : 'text-[#D7DBE4]/38'} ${operationalMotion.hoverText} ${operationalMotion.press}`}
        aria-label={voiceOn ? 'Turn audio off' : 'Turn audio on'}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${voiceOn ? 'bg-emerald-200/70 shadow-[0_0_10px_rgba(110,231,183,0.28)]' : 'bg-white/24'}`} />
        {voiceOn ? 'MUTE' : 'UNMUTE'}
      </button>

      {showLiveQuickMenu && (
        <>
          <button
            type="button"
            aria-label="Close LIVE controls"
            onClick={() => setShowLiveQuickMenu(false)}
            className="fixed inset-0 z-[310] cursor-default bg-transparent [backdrop-filter:blur(14px)] [-webkit-backdrop-filter:blur(14px)] transition-opacity duration-200"
          />

          <div data-george-language-menu className={`absolute bottom-full left-1/2 z-[90] mb-3 w-[220px] -translate-x-1/2 px-3 py-2.5 md:px-5 md:py-4 md:px-5 md:py-4 ${operationalMotion.anchorPanel} ${operationalMotion.surface}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
              Execution
            </div>
            <button
              type="button"
              aria-label="Close LIVE controls"
              onClick={() => setShowLiveQuickMenu(false)}
              className="rounded-full border border-white/[0.06] px-1.5 py-0.5 text-[12px] leading-none text-white/44 transition hover:bg-white/[0.04] hover:text-white"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentTier === 'smart') {
                setToastMessage('Voice replies unlock above Smart.')
                setShowToast(true)
                return
              }

              const nextVoice = !voiceOn
              hasUserInteractedRef.current = true
              setVoiceOn(nextVoice)
              setInteractionMode(nextVoice ? 'speech' : 'text')
              window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
              setToastMessage(nextVoice ? 'Audio on' : 'Audio off')
              setShowToast(true)
            }}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white active:scale-[0.98]"
          >
            {voiceOn ? 'Audio on' : 'Audio off'}
          </button>

          <div className="border-t border-white/[0.045] pt-2 mt-1">
            <div className="mb-1 text-[9px] uppercase tracking-[0.20em] text-white/22">
              Language
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {languageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setLanguage(option)
                    window.localStorage.setItem('george_language', option)
                    setToastMessage(`Language set: ${option}`)
                    setShowToast(true)
                    setShowLiveQuickMenu(false)
                  }}
                  className={`py-1 text-left text-[10px] uppercase tracking-[0.12em] transition active:scale-[0.98] ${
                    language === option
                      ? 'text-white/82'
                      : 'text-white/34 hover:text-white/68'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-1 border-t border-white/[0.045] pt-2">
            <button
              type="button"
              onClick={() => {
                setShowLiveQuickMenu(false)
                window.localStorage.setItem('george_start_new_live', '1')
                openLiveEntry()
              }}
              className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-[#D7DBE4]/58 transition hover:text-white active:scale-[0.98]"
            >
              New LIVE
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLiveQuickMenu(false)
                requestExitLiveMode()
              }}
              className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-red-100/56 transition hover:text-red-100/86 active:scale-[0.98]"
            >
              Leave LIVE
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  </div>
)}

<div className={`${(forceLive || liveMode) ? 'fixed bottom-[96px] left-0 right-0 mx-auto' : 'fixed bottom-[112px] left-0 right-0 mx-auto'} z-[80] w-[min(680px,calc(100vw-72px))] bg-transparent px-0 py-0`}>

                    <div className="george-composer-shell relative flex-1 overflow-visible border-0 bg-transparent shadow-none">

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          const isImage = file.type.startsWith('image/')
                          const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
                          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                          const isDocx = file.type.includes('officedocument.wordprocessingml.document') || file.name.toLowerCase().endsWith('.docx')

                          const lowerFileName = file.name.toLowerCase()
                          const looksLikeResume =
                            lowerFileName.includes('resume') ||
                            lowerFileName.includes('résumé') ||
                            lowerFileName.includes('cv') ||
                            lowerFileName.includes('cover-letter') ||
                            lowerFileName.includes('cover_letter')


                          if (isPdf || isDocx) {
                            const formData = new FormData()
                            formData.append('file', file)

                            setToastMessage(`Reading ${file.name}...`)
                            setShowToast(true)

                            fetch('/api/extract-file', {
                              method: 'POST',
                              body: formData,
                            })
                              .then(async (res) => {
                                const data = await res.json().catch(() => ({}))
                                if (!res.ok) {
                                  throw new Error(data?.error || 'Unable to read this PDF.')
                                }

                                setPendingImage(null)
                                setInput(`I uploaded file: ${data.name || file.name}. Help me understand and use it.\\n\\n${data.text}`)
                                setToastMessage(`${data.name || file.name} loaded into GEORGE.`)
                                setShowToast(true)
                                textareaRef.current?.focus()
                              })
                              .catch((err) => {
                                setToastMessage(err?.message || 'Unable to read this PDF.')
                                setShowToast(true)
                              })

                            e.currentTarget.value = ''
                            return
                          }

                          if (isText) {
                            const reader = new FileReader()
                            reader.onload = () => {
                              const fileText = String(reader.result || '').trim()
                              if (!fileText) {
                                setToastMessage('That text file appears empty.')
                                setShowToast(true)
                                return
                              }

                              const clipped = fileText.length > 12000 ? fileText.slice(0, 12000) + '\n\n[Text clipped for length.]' : fileText
                              setPendingImage(null)
                              setInput(`I uploaded text file: ${file.name}.

${looksLikeResume
  ? 'This looks like a résumé or career document. Help me use it for interviews, role positioning, answer framing, and live conversation preparation. Pull out what matters most and what I should be ready to say.'
  : 'Tell me what this is, what matters most, and how I should use it.'}

${clipped}`)
                              setToastMessage(`${file.name} loaded into GEORGE.`)
                              setShowToast(true)
                              textareaRef.current?.focus()
                            }
                            reader.readAsText(file)
                            e.currentTarget.value = ''
                            return
                          }

                          if (isImage) {
                            const reader = new FileReader()
                            reader.onload = () => {
                              const dataUrl = String(reader.result || '')
                              if (!dataUrl) return
                              setPendingImage({ dataUrl, name: file.name })
                              setToastMessage(`${file.name} ready to send.`)
                              setShowToast(true)
                              textareaRef.current?.focus()
                            }
                            reader.readAsDataURL(file)
                            e.currentTarget.value = ''
                            return
                          }

                          const starter = `I uploaded file: ${file.name}.

Tell me what this is, what matters most, and how GEORGE can help me use it effectively.`
                          setPendingImage(null)
                          setInput(starter)
                          setToastMessage(`${file.name} attached to composer.`)
                          setShowToast(true)
                          textareaRef.current?.focus()
                          e.currentTarget.value = ''
                        }}
                      />
                      {pendingImage && (
                        <div className="absolute left-4 bottom-full mb-2 flex max-w-[180px] gap-1.5 overflow-hidden rounded-xl border border-white/[0.07] bg-[#05080D]/88 px-1.5 py-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.38)] ">
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
                        className={`${(forceLive || liveMode) ? 'hidden' : 'absolute left-1 top-1/2 z-[2] flex'} h-10 w-10 -translate-y-1/2 items-center justify-center border-0 bg-transparent text-[#D7DBE4]/44 transition hover:text-[#D7DBE4]/82 md:h-8 md:w-8`}
                        aria-label="Upload file"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5 fill-none stroke-current"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 16V4"/>
                          <path d="M7 9l5-5 5 5"/>
                          <path d="M5 20h14"/>
                        </svg>
                      </button>

                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (
                            showPreLiveSignalSurface &&
                            input.trim() &&
                            e.key === 'Enter' &&
                            !e.shiftKey
                          ) {
                            e.preventDefault()
                            submitPreLiveSignalAnswer()
                            return
                          }

                          handleComposerKeyDown(e)
                        }}
                        placeholder={composerPlaceholder}
                        rows={1}
                        onInput={autoResizeTextarea}
                        style={{ WebkitUserSelect: 'text', minHeight: '40px', maxHeight: '140px' }}
                        className={`${(forceLive || liveMode) ? 'min-h-[22px] pl-14 pr-[92px] py-0 md:min-h-[22px] md:pl-11 md:pr-[84px] md:py-0' : 'min-h-[42px] pl-14 pr-[92px] py-2 md:min-h-[38px] md:pl-11 md:pr-[84px] md:py-2'} w-full resize-none border-0 bg-transparent text-[16px] leading-[1.35] font-normal tracking-[0.002em] text-[#D7DBE4]/92 outline-none placeholder:italic placeholder:text-[#D7DBE4]/26 focus:ring-0 md:text-[15px]`}
                      />

                      <div className={`${(forceLive || liveMode) ? 'hidden' : 'absolute right-1 top-1/2 flex'} -translate-y-1/2 items-center gap-2`}>
                        {(currentTier === 'smart' || currentTier === 'intelligent' || currentTier === 'brilliant') && (
                          <>

                            <button
                              type="button"
                              onClick={() => {
                                if (!voiceSupported || isThinking) return

                                setInteractionMode('speech')
                                if (isListening) {
                                  stopListening()
                                  setInterimTranscript('')
                                } else {
                                  startListening()
                                }
                              }}
                              disabled={!voiceSupported || isThinking}
                              className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#D7DBE4]/44 transition hover:text-[#D7DBE4]/82 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Voice"
                            >
                              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/>
                                <path d="M19 10a7 7 0 0 1-14 0"/>
                                <path d="M12 17v4"/>
                                <path d="M8 21h8"/>
                              </svg>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (submitPreLiveSignalAnswer()) return
                            handleSend()
                          }}
                          className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#D7DBE4]/42 transition hover:text-white"
                          aria-label="Share"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5"/>
                            <path d="m5 12 7-7 7 7"/>
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
        <div className="fixed inset-0 z-[95] bg-black/72 -[10px]  flex items-center justify-center px-4 ">
          <div className="w-full max-w-sm rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88  p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[#D7DBE4]/72 mb-2">Runtime</p>

            {walkthroughStep === 1 && <p className="text-[#D7DBE4] text-sm leading-7">Focus menu sets the room. Choose negotiation, interview, debate, speech, study, or everyday pressure.</p>}
            {walkthroughStep === 2 && <p className="text-[#D7DBE4] text-sm leading-7">Voice speed controls how fast GEORGE responds in your ear.</p>}
            {walkthroughStep === 3 && <p className="text-[#D7DBE4] text-sm leading-7">Mic button lets GEORGE listen while you stay in motion.</p>}
            {walkthroughStep === 4 && <p className="text-[#D7DBE4] text-sm leading-7">LIVE cues give fast lines, warnings, and framing in real time.</p>}

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
                    window.localStorage.setItem("george_walkthrough_seen","1")
                    setShowWalkthrough(false)
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
          className="fixed inset-0 z-[92] flex items-end justify-center bg-black/68 px-4 -[10px] pb-4 "
          onClick={() => setShowPersonalizeModal(false)}
        >
          <div
            className="w-full max-w-[420px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[420px] md:max-w-[720px] xl:max-w-[920px] xl:max-w-[760px] max-h-[90vh] overflow-y-auto rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-[#D7DBE4]">Make GEORGE yours</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Optional. Same mind. Same standards. Choose GEORGE or GEORGette, then keep the name or make it yours.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">Voice</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 md:grid-cols-3 md:gap-3">
                  {[
                    { label: 'Ash', value: 'ash' },
                    { label: 'Onyx', value: 'onyx' },
                    { label: 'Sage', value: 'sage' },
                    { label: 'Alloy', value: 'alloy' },
                    { label: 'Nova', value: 'nova' },
                    { label: 'Shimmer', value: 'shimmer' },
                    { label: 'Coral', value: 'coral' },
                  ].map((voice) => (
                    <button
                      key={voice.value}
                      type="button"
                      onClick={() => setVoiceType(voice.value)}
                      className={`rounded-[1rem] border transition hover:scale-[1.01] px-5 py-4 text-sm ${
                        voiceType === voice.value
                          ? 'border-white/[0.16] bg-white/[0.032] text-[#D7DBE4]'
                          : 'border-white/[0.06] bg-black/28 text-neutral-500 hover:text-[#D7DBE4]'
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
                  if (currentTier === 'smart') return

                  const cleanName = draftProfileName.trim().slice(0, 32)
                  setProfileName(cleanName)
                  window.localStorage.setItem('george_name', cleanName)
                  window.localStorage.setItem('george_voice_type', voiceType)
                  window.localStorage.setItem('george_personalized', 'true')
                  window.localStorage.setItem('george_name_locked', 'false')
                  window.localStorage.setItem('george_voice_locked', 'false')
                  window.localStorage.setItem('george_walkthrough_seen', '1')
                  setShowPersonalizeModal(false)
                  setToastMessage('GEORGE is yours now.')
                  setShowToast(true)
                }}
                className="w-full rounded-[1rem] max-w-full bg-white px-5 py-4 text-sm font-medium text-black transition hover:opacity-55"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentTier === 'smart') return

                  window.localStorage.setItem('george_personalized', 'true')
                  window.localStorage.setItem('george_name_locked', 'false')
                  window.localStorage.setItem('george_voice_locked', 'false')
                  window.localStorage.setItem('george_walkthrough_seen', '1')
                  setShowPersonalizeModal(false)
                  setToastMessage('Defaults kept. You can personalize later.')
                  setShowToast(true)
                }}
                className="w-full text-xs text-neutral-500 transition hover:text-[#D7DBE4]"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}



      {showTierModal && typeof document !== 'undefined' && createPortal(
  <>
    <button
      type="button"
      aria-label="Close access panel"
      onClick={() => setShowTierModal(false)}
      className="fixed inset-0 z-[200] cursor-default bg-black/45 backdrop-blur-[14px]"
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
              <div key={item} className="flex items-center gap-2 text-[12px] leading-5 text-[#D7DBE4]/58">
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
            window.location.href = tierUpgradeAction.href
          }}
          className="mt-4 w-full rounded-full border border-white/[0.07] bg-[#D7DBE4]/88 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-[#05070B] transition hover:bg-white active:scale-[0.985]"
        >
          {tierUpgradeAction.cta}
        </button>

        <div className="mt-3 flex items-center justify-between border-t border-white/[0.03] pt-2.5">
          <button
            type="button"
            onClick={() => {
              setShowTierModal(false)
              setLoginEmailInput('')
              setLoginLinkSent(false)
              setShowUpgradeModal(true)
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
  document.body
)}


      {showUpgradeModal && typeof document !== 'undefined' && createPortal(
  <>
    <div
      role="button"
      tabIndex={0}
      aria-label="Close continuity panel"
      onClick={() => setShowUpgradeModal(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          setShowUpgradeModal(false)
        }
      }}
      className="pointer-events-auto fixed inset-0 z-[200] bg-black/24 -[8px]"
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
            A secured link verifies continuity, tier access, and LIVE eligibility.
          </p>
        </div>

        {loginLinkSent ? (
          <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[12px] text-[#D7DBE4]">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium text-[#D7DBE4]/90">Link sent</p>
                <p className="mt-0.5 text-[11px] text-[#D7DBE4]/42">
                  Check your email and open the GEORGE link.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setLoginLinkSent(false)
                setLoginEmailInput('')
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
                onChange={(event) => setLoginEmailInput(event.target.value.trim().toLowerCase())}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-2 w-full bg-transparent text-sm text-[#D7DBE4] outline-none placeholder:text-[#D7DBE4]/22"
              />
            </div>

            <button
              type="button"
              disabled={loginSending}
              onClick={async () => {
                const email = loginEmailInput.trim().toLowerCase()

                if (!email) {
                  setToastMessage('Enter your email first.')
                  setShowToast(true)
                  return
                }

                setLoginSending(true)

                try {
                  const response = await fetch('/api/continuity/request-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    setToastMessage(data?.error || 'Unable to send login link.')
                    setShowToast(true)
                    return
                  }

                  setLoginLinkSent(true)
                  setToastMessage('Secure link sent.')
                  setShowToast(true)
                } catch {
                  setToastMessage('Unable to send login link.')
                  setShowToast(true)
                } finally {
                  setLoginSending(false)
                }
              }}
              className="w-full rounded-full border border-white/[0.07] bg-[#D7DBE4]/88 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-[#05070B] transition hover:bg-white disabled:opacity-45"
            >
              {loginSending ? 'Sending…' : 'Send secure link'}
            </button>

            <p className="px-1 text-[10.5px] leading-5 text-[#D7DBE4]/35">
              Intelligent and Brilliant use verified continuity before LIVE access.
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
              onClick={() => window.open('/top-up','_blank')}
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
  document.body
)}

      {false && showCampaignUpgradeGate && (
        <div className="fixed inset-x-0 bottom-[96px] transition-all duration-150 ease-out z-[95] flex justify-center px-4">
          <div className="w-full max-w-[420px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[420px] md:max-w-[720px] xl:max-w-[920px] xl:max-w-[760px] rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88 px-5 py-4 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  ">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/72 mb-2">Structured LIVE</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#D7DBE4] mt-1 mb-2">This is a structured LIVE session.</p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-500">Structured LIVE support is being prepared.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCampaignUpgradeGate(false)}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5.5 py-1 text-[11px] text-neutral-500 transition hover:border-white/25 hover:bg-white/[0.022] hover:text-[#D7DBE4]/92"
              >
                Close
              </button>
            </div>

            <div className="rounded-[1rem] border border-white/[0.05] bg-black/35 px-5 py-4 text-xs leading-6 text-neutral-300 shadow-inner shadow-black/30">
              <div className="font-medium text-[#D7DBE4]/80">Structured LIVE will let you:</div>
              <div className="mt-1.5 space-y-1">
                <div>• resume structured conversations</div>
                <div>• use scripts and guided flow</div>
                <div>• continue where you left off</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCampaignUpgradeGate(false)
                setShowUpgradeModal(true)
              }}
              className="mt-4 w-full rounded-[1.2rem] max-w-full border transition duration-150 border-white/[0.09] bg-white/[0.032] px-5 py-4 text-sm font-semibold text-[#D7DBE4] shadow-[0_12px_28px_rgba(0,0,0,0.24)] hover:border-white/[0.18] hover:bg-white/[0.075]"
            >
              Upgrade to continue this campaign
            </button>
          </div>
        </div>
      )}

      {activeCheckout && typeof document !== 'undefined' && createPortal(
        <>
          <button
            type="button"
            aria-label="Close activation"
            onClick={() => setActiveCheckout(null)}
            className="fixed inset-0 z-[240] bg-black/68 -[10px]"
          />

          <div className="fixed inset-0 z-[141] flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-[430px]">
              <GeorgePaymentElement
                tier={activeCheckout}
                onClose={() => setActiveCheckout(null)}
                onLegacyCheckout={async (tier) => {
                  try {
                    const response = await fetch('/api/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tier,
                        email: subscriberEmail || undefined,
                      }),
                    })

                    const data = await response.json()

                    if (data?.url) {
                      window.location.href = data.url
                      return
                    }

                    setToastMessage(data?.error || 'Unable to open checkout.')
                    setShowToast(true)
                  } catch {
                    setToastMessage('Unable to open checkout.')
                    setShowToast(true)
                  }
                }}
              />
            </div>
          </div>
        </>,
        document.body
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
  )
}
