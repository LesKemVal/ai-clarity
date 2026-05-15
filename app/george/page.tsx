'use client'


import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import Sidebar from '@/components/Sidebar'
import ContinuityCapsule from '@/components/george/ContinuityCapsule'
import LiveChooser from '@/components/george/LiveChooser'
import { getSteering } from '@/lib/george/steering'
import { getGoalState } from '@/lib/george/goal-engine'
import { adaptCueForUser, buildBrilliantLiveTriggerResponse, buildLiveGuidance, detectConversationProfile, detectConversationPersonProfile, detectVocalState, interpretVoiceState, decideNextMove, detectUserDeliveryLevel } from '@/lib/george/conversation-engine'
import { createSession, getActiveMode, getActiveSessionForMode, getActiveSessionIdForMode, setActiveSessionIdForMode, setActiveMode, updateActiveSessionMessages, upsertSession, updateCampaignSessionMetadata, getCampaignSessions, getSessionsForMode, deleteSession, hasMeaningfulUserMessage, getLatestSubscriberSession } from '@/lib/george/session/store'

type Message = {
  role: 'assistant' | 'user' | 'system'
  content: string
  constrained?: boolean
  imageDataUrl?: string | null
  simplifiedFromIndex?: number
  source?: 'user_input' | 'sidebar_prompt' | 'live_transcript' | 'third_party_speech' | 'system_override'
}

type PromptSelection = {
  label: string
  text: string
  context: string
}

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
  mode: 'normal' | 'live' | 'campaign'
  title: string
  messages: Message[]
  summary?: string
  userGoal?: string
  lastKnownState?: string
  suggestedRestart?: string
  metadata?: Record<string, unknown>
}) {
  const subscriberEmail =
    typeof window !== 'undefined'
      ? (window.localStorage.getItem('george_email') || '').trim().toLowerCase()
      : ''

  if (!subscriberEmail) return

  const now = Date.now()

  upsertSession({
    id: params.id || `session_${now}`,
    type: 'session',
    mode: params.mode,
    title: params.title,
    createdAt: now,
    updatedAt: now,
    messages: params.messages,
    summary: params.summary,
    userGoal: params.userGoal,
    lastKnownState: params.lastKnownState,
    suggestedRestart: params.suggestedRestart,
    metadata: {
      source:
        params.mode === 'campaign'
          ? 'pro_live_campaign'
          : params.mode === 'live'
            ? 'live_conversation'
            : 'normal',
      subscriberEmail,
      ...params.metadata,
    },
  })
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


function detectTrainingTrack(raw: string) {
  const value = raw.toLowerCase()
  if (/driver'?s license|drivers license|driver'?s test|driving test|permit|road test|dmv/.test(value)) return 'drivers'
  if (/cdl/.test(value)) return 'cdl'
  if (/ged/.test(value)) return 'ged'
  if (/cna/.test(value)) return 'cna'
  return null
}


function trainingNeedsJurisdiction(raw: string) {
  return /driver|cdl|cna/.test(raw.toLowerCase())
}



function extractAnswers(raw: string) {
  const matches = raw.match(/[A-Da-d]/g)
  if (!matches) return []
  return matches.map(m => m.toUpperCase())
}

function evaluateDrivers(answers: string[]) {
  const correct = ['C', 'B', 'C', 'B']
  return scoreAnswers(answers, correct, 'drivers')
}

function evaluateCDL(answers: string[]) {
  const correct = ['B', 'B', 'B', null]
  return scoreAnswers(answers, correct, 'cdl')
}

function evaluateGED(answers: string[]) {
  const correct = ['B', 'B', 'B', null]
  return scoreAnswers(answers, correct, 'ged')
}

function evaluateCNA(answers: string[]) {
  const correct = ['B', 'C', null, null]
  return scoreAnswers(answers, correct, 'cna')
}

function scoreAnswers(answers: string[], correct: (string | null)[], track: string) {
  let score = 0
  let feedback = []

  for (let i = 0; i < correct.length; i++) {
    if (!correct[i]) continue
    if (answers[i] === correct[i]) {
      score++
    } else {
      feedback.push(`Question ${i + 1} is incorrect.`)
    }
  }

  const total = correct.filter(Boolean).length

  return {
    score,
    total,
    feedback,
    track
  }
}









function buildFollowUpQuestions(track: string, result: any) {
  const { score, total, feedback } = result
  let questions: string[] = []

  if (track === 'drivers') {
    if (feedback.some((f: string) => f.includes("1"))) {
      questions.push("Who yields at a 4-way stop when two cars arrive at the same time?")
    }
    if (feedback.some((f: string) => f.includes("2"))) {
      questions.push("What is the difference between a flashing red and flashing yellow light?")
    }
    if (feedback.some((f: string) => f.includes("3"))) {
      questions.push("Can you cross a solid yellow line to pass under any condition?")
    }
  }

  if (track === 'ged' && score === total) {
    questions = [
      "Solve: 2x + 3 = 11",
      "What is the main idea of a paragraph?"
    ]
  }

  return questions.slice(0, 3)
}

function appendFollowUp(response: string, track: string, result: any) {
  const followUps = buildFollowUpQuestions(track, result)
  if (!followUps.length) return response

  let block = "\n\nNext — answer these:\n"
  followUps.forEach((q, i) => {
    block += `${i + 1}. ${q}\n`
  })

  return response + block
}

function buildEvaluationResponse(result: any) {
  const { score, total, feedback, track } = result

  let response = `Score: ${score}/${total}\n\n`

  if (score === total) {
    response += "Good. You are closer than you think. We push speed and consistency now.\n\n"
  } else if (score >= total / 2) {
    response += "You are partially there. Weak areas need tightening.\n\n"
  } else {
    response += "You are not ready yet. We build from the ground up.\n\n"
  }

  if (feedback.length) {
    response += "Fix these:\n" + feedback.join("\n") + "\n\n"
  }

  response += "Next step coming."

  return response
}



function buildTrainingFollowThrough(raw: string, promptContext: string | null) {
  const text = raw.trim()
  if (!text || text.length < 12) return null

  let track: string | null = null

  if (promptContext === 'training_drivers_license') track = 'drivers'
  if (promptContext === 'training_cdl') track = 'cdl'
  if (promptContext === 'training_ged') track = 'ged'
  if (promptContext === 'training_cna') track = 'cna'
  if (!track) return null

  // let scoring logic handle quiz-style answers first
  if (/[Aa]\.|[Bb]\.|[Cc]\.|[Dd]\.|^[A-D](\s|,|$)/m.test(text)) return null

  const hasNumbers = /\d/.test(text)
  const mentionsTime =
    /minute|minutes|hour|hours|day|days|week|weeks|month|months|daily|night|tonight|tomorrow/i.test(text)
  const mentionsWeakness =
    /weak|hard|struggle|avoid|math|reading|writing|science|signs|rules|recall|pre-trip|skills|road|confidence|anxiety/i.test(text)

  if (!hasNumbers && !mentionsTime && !mentionsWeakness) return null

  if (track === 'ged') {
    return "Good. That is enough to begin. We start with consistency, not perfection. Keep the standard real and sustainable. Tonight, give me 25 focused minutes on the weakest subject instead of trying to fix everything at once. Be honest with yourself about why you're doing this, but you do not need to explain every private reason to me. Come back tomorrow and we’ll tighten the weakest area without dragging this out."
  }

  if (track === 'cdl') {
    return "Good. That is enough to work with. We build one weak point at a time and keep your effort steady. Start with 20 focused minutes on the weakest area tonight—pre-trip, permit knowledge, skills, or road judgment. Do not scatter your effort. Come back tomorrow and we’ll tighten the next weak point."
  }

  if (track === 'drivers') {
    return "Good. You are closer than it feels. We keep this simple and consistent. Start with 20 focused minutes on signs, rules, or right-of-way—whichever is weakest. Do not try to cover the whole manual in one sitting. Come back tomorrow and we’ll sharpen the next piece."
  }

  if (track === 'cna') {
    return "Good. That is enough to begin properly. We go one weak point at a time and keep your confidence tied to repetition, not pressure. Start with 20 focused minutes on your weakest area tonight—knowledge, procedure flow, or confidence under testing. Come back tomorrow and we’ll tighten the next step."
  }

  return null
}

function buildTrainingIntakeOverride(raw: string) {
  const track = detectTrainingTrack(raw)
  if (!track) return null

  const map: Record<string,string> = {
    drivers: "Good. Driving tests usually break into written, driving skill, or nerves. Which part is actually in front of you right now?",
    cdl: "Good. CDL issues usually come down to permit, pre-trip, backing, or road. Which part are we dealing with right now?",
    ged: "Good. GED pressure usually comes from math, reading, writing, science, or delay. Which part is the real problem right now?",
    cna: "Good. CNA exams usually break into knowledge, skills, timing, or confidence. Which part is actually blocking you right now?"
  }

  return map[track] || null
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
  if (!liveMode) return text

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-7">
      {paragraphs.map((paragraph, index) => (
        <div key={index} className="block">
          {paragraph}
        </div>
      ))}
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
        !/GEORGE|clarity, direction|execution system|You are GEORGE|not a chatbot|not a therapist/i.test(line)
      )

    return firstUsable || 'Stay calm. Let them answer.'
  })()

  let backup = normalizeLine(backupMatch?.[1] || '', opts.audio ? 10 : 16)
  if (/^(budget|timing|performance|band|market|low counter|process|hr|title|if)\b/i.test(backup)) {
    backup = ''
  }

  const liveUserText = String(opts.userText || '').toLowerCase()
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

  const cue = normalizeLine(cueMatch?.[1] || (/\bid\b|identification|license|registration/i.test(liveUserText) ? 'Hands visible. Move slowly.' : 'Slow down. Let him answer.'), opts.audio ? 8 : 10)

  if (opts.audio) {
    return say || cue
  }

  return [
    say ? `Say:\n${say}` : '',
    backup ? `\nBackup:\n${backup}` : '',
    cue ? `\nCue:\n${cue}` : '',
  ].filter(Boolean).join('\n').trim()
}



const georgeAmbientPulseStyles = `
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

  const firstTimeGreeting = `Whatever you want to become, build, or understand — ask GEORGE.` 

  const earlyUserGreeting = `What are we solving today?` 

  const greetingPool = [
    `${timeGreeting} Most distractions are noise. What matters today?`,
    `${timeGreeting} We can drift, or we can execute. Which is it?`,
    `${timeGreeting} Bring me something real.`,
    `${timeGreeting} Comfort costs. What is the bottleneck?`,
    `${timeGreeting} Protect momentum. What’s the next decisive step?`,
    `${timeGreeting} Focus on what lasts. What durable problem are we solving?`,
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

  function handleInstallGeorge() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isiPhone = /iPhone|iPad|iPod/i.test(ua)
    const url = typeof window !== 'undefined' ? `${window.location.origin}/george` : '/george'

    if (isiPhone) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: 'GEORGE by BRANESx',
          text: 'Want to get something done? GEORGE is your guide.',
          url,
        }).catch(() => {
          setToastMessage('iPhone: Send → Edit Actions → Add to Home Screen')
          setShowToast(true)
        })
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {})
      }
      setToastMessage('iPhone: Send → Edit Actions → Add to Home Screen')
      setShowToast(true)
      return
    }

    if (typeof window !== 'undefined' && (window as any).__branesInstallPrompt) {
      const promptEvent = (window as any).__branesInstallPrompt
      promptEvent.prompt()
      promptEvent.userChoice.finally(() => {
        ;(window as any).__branesInstallPrompt = null
      })
      return
    }

    const isMac = /Macintosh|Mac OS X/i.test(ua)
    const isWindows = /Windows/i.test(ua)

    if (isMac) {
      setToastMessage('Mac: Browser menu → Install App or Add to Dock')
      setShowToast(true)
      return
    }

    if (isWindows) {
      setToastMessage('Desktop: Browser menu → Install App')
      setShowToast(true)
      return
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setToastMessage('GEORGE link copied')
    setShowToast(true)
  }

const [messages, setMessages] = useState<Message[]>([])
const normalSessionBootedRef = useRef(false)
const normalSessionWriteReadyRef = useRef(false)
const liveSessionWriteReadyRef = useRef(false)
const preLiveSessionIdRef = useRef<string | null>(null)
const [pendingImage, setPendingImage] = useState<{ dataUrl: string; name: string } | null>(null)
const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({})
const [feedbackPulse, setFeedbackPulse] = useState<Record<string, boolean>>({})
const [conversationMode, setConversationMode] = useState<string | null>(null)
const [showWalkthrough, setShowWalkthrough] = useState(false)
const [walkthroughStep, setWalkthroughStep] = useState(1)


  useEffect(() => {
    // 🚫 NEVER run greeting if LIVE or Conversation Mode is active
    if (liveMode || isManualLive) return

    const greeting = getInitialGreeting()


    setMessages((prev) => {

      if (
        prev.length === 1 &&
        prev[0]?.role === 'assistant' &&
        prev[0]?.content.includes("Tell me what matters today?")
      ) {
        return [{ role: 'assistant', content: greeting }]
      }
      return prev
    })

    if (
      messagesRef.current.length === 1 &&
      messagesRef.current[0]?.role === 'assistant' &&
      messagesRef.current[0]?.content.includes("Tell me what matters today?")
    ) {
      messagesRef.current = [{ role: 'assistant', content: greeting }]
    }
  }, [])

  function handleFeedback(index: number, type: 'up' | 'down') {
    setFeedback((prev) => ({
      ...prev,
      [index]: type,
    }))

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

      setFeedback((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
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
  const isManualLive =
    conversationMode === 'manual_live' ||
    activePromptContext === 'manual_live'
  const [campaigns, setCampaigns] = useState<GeorgeCampaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [showCampaignMenu, setShowCampaignMenu] = useState(false)
  const [language, setLanguage] = useState<'EN' | 'ES'>('EN')

  const activeCampaign = campaigns.find((campaign) => campaign.id === activeCampaignId) || null
  const resolvedLivePosture =
    activeCampaign?.assistMode === 'negotiation'
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
    (resolvedLivePosture === 'negotiation'
      ? 'say_ask_boundary_close'
      : resolvedLivePosture === 'response'
        ? 'repeatable_lines'
        : 'short_cues')

  const liveContextBufferRef = useRef<string[]>([])
  const liveLastSignalRef = useRef<number>(0)
const liveInterventionRef = useRef<number>(0)
const lastCueTsRef = useRef<number>(0)
const liveConversationStateRef = useRef({
  objectionCount: 0,
  dismissCount: 0,
  pressureCount: 0,
  lastCue: '',
  outcomeState: 'neutral',
  activeGoal: 'clarity'
})

const [contextTurnCount, setContextTurnCount] = useState(0)
  const [reroutePrompt, setReroutePrompt] = useState<PromptSelection | null>(null)
  const [rerouteSignal, setRerouteSignal] = useState(0)
  const [currentTier, setCurrentTier] = useState<'smart' | 'intelligent' | 'brilliant'>('smart')
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

    try {
      const savedCampaigns = getCampaignSessions().map((session: any) => ({
        id: session.id,
        name: session.metadata?.campaignName || session.title || 'LIVE Session',
        mode: 'firm',
        productOrService: session.metadata?.productOrService || '',
        targetMarket: session.metadata?.targetAudience || '',
        desiredOutcome: session.metadata?.desiredOutcome || session.userGoal || '',
        defaultAnswersEnabled: true,
      }))

      setCampaigns(savedCampaigns as GeorgeCampaign[])

      const activeCampaignSession = getActiveSessionForMode('campaign')
      if (activeCampaignSession) {
        setActiveCampaignId(activeCampaignSession.metadata?.activeCampaignId as string || activeCampaignSession.id)
      }
    } catch {
      setCampaigns([])
      setActiveCampaignId(null)
    }
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
  campaignId: string | null,
  updates: Partial<{
    assistMode: string
    outputStyle: string
    deliveryMode: string
    assistTone: string
  }>
) => {
  if (!campaignId) return

  updateCampaignSessionMetadata(campaignId, (metadata) => {
    const currentEnvironment = (metadata.savedEnvironment || {}) as any

    return {
      ...metadata,
      savedEnvironment: {
        ...currentEnvironment,
        ...updates,
      },
    }
  })
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

  if (activeCampaignId) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === activeCampaignId
          ? { ...c, assistMode: 'negotiation', outputStyle: 'say_ask_boundary_close' }
          : c
      )
    )
    syncCampaignEnvironment(activeCampaignId, {
      assistMode: 'negotiation',
      outputStyle: 'say_ask_boundary_close',
      assistTone,
    })
  }

  setToastMessage('Negotiation guidance active.')
  setShowToast(true)
  replaceLastLiveGuidance('Good. I’ll help you stay composed, reduce leakage, and move toward leverage.')
}

const activateResponsePosture = () => {
  setActivePromptContext('live_response')
  setConversationMode('live_response')

  if (activeCampaignId) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === activeCampaignId
          ? { ...c, assistMode: 'objection_handling', outputStyle: 'repeatable_lines' }
          : c
      )
    )
    syncCampaignEnvironment(activeCampaignId, {
      assistMode: 'objection_handling',
      outputStyle: 'repeatable_lines',
      assistTone,
    })
  }

  setToastMessage('Response handling active.')
  setShowToast(true)
  replaceLastLiveGuidance('Good. I’ll help you answer pressure, objections, or confusion without overexplaining.')
}

const [forceClose, setForceClose] = useState(false)

const [suggestedSignal, setSuggestedSignal] = useState(0)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
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
  const [smartMicUses, setSmartMicUses] = useState(0)
  const SMART_MIC_LIMIT = 3
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
  const [profileName, setProfileName] = useState('')
  const [subscriberEmail, setSubscriberEmail] = useState('')

  const getSubscriberSessionMetadata = useCallback(() => {
    const email = subscriberEmail.trim().toLowerCase()
    return email ? { subscriberEmail: email } : null
  }, [subscriberEmail])

  const [birthdayMD, setBirthdayMD] = useState('')
  const [showPromptMenu, setShowPromptMenu] = useState(false)
  const [showConversationMenu, setShowConversationMenu] = useState(false)
  const [showLiveQuickMenu, setShowLiveQuickMenu] = useState(false)
  const [showLiveToolsMenu, setShowLiveToolsMenu] = useState(false)

  useEffect(() => {
    // LIVE route ownership now belongs exclusively to /george/live
    // Keep disabled to prevent modal/state hydration conflicts.
  }, [])

  const [liveSegueIndex, setLiveSegueIndex] = useState(0)
  const [showAccessCodeEntry, setShowAccessCodeEntry] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')
  const [showEarbudOverlay, setShowEarbudOverlay] = useState(false)
  const [showSessionPicker, setShowSessionPicker] = useState(false)
  const [showProLiveComingSoon, setShowProLiveComingSoon] = useState(false)
  const [showLiveChooser, setShowLiveChooser] = useState(false)
  const [sessionPickerMode, setSessionPickerMode] = useState<'live' | 'campaign'>('live')
  const [sessionPickerClosing, setSessionPickerClosing] = useState(false)
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<string | null>(null)
  const [preLiveMessages, setPreLiveMessages] = useState<Message[] | null>(null)

  const [showExitPopup, setShowExitPopup] = useState(false)
  const [showSaveNaming, setShowSaveNaming] = useState(false)
  const [pendingSessionTitle, setPendingSessionTitle] = useState('')

  const [conversationMenuLane, setConversationMenuLane] = useState<'selector' | 'personal' | 'professional'>('selector')
  const [showSidebar, setShowSidebar] = useState(false)

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

    const tier = ACCESS_CODES[normalized]

    if (!tier) {
      setAccessCodeError('Invalid access code.')
      return
    }

    setCurrentTier(tier)

    if (typeof window !== 'undefined') {
      localStorage.setItem('george_tier', tier)
    }

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
      title: 'GEORGE watches the room.',
      body: 'LIVE cues help you slow down, redirect, recover control, or sharpen the next sentence before momentum slips.'
    },
    {
      title: 'This is not normal chat mode.',
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
      normalSessionBootedRef.current = true
      setActiveMode('live')
      setLiveMode(true)
      setConversationMode('manual_live')
      setActivePromptContext('manual_live')

      const activeLiveSession = getActiveSessionForMode('live')

      // do not auto-restore LIVE session by default
      // user can resume later via sessions if needed

      const startNewLiveRequested = window.localStorage.getItem('george_start_new_live') === '1'
      if (startNewLiveRequested) {
        window.localStorage.removeItem('george_start_new_live')
        setActiveCampaignId(null)
      }

      let existingLive =
        subscriberEmail.trim()
          ? getLatestSubscriberSession(subscriberEmail, 'live')
          : null

if (!startNewLiveRequested && existingLive?.mode === 'live' && Array.isArray(existingLive.messages) && existingLive.messages.length > 0) {
        skipNextTypewriterRef.current = true
        restoredMessagesSignatureRef.current = getMessagesSignature(existingLive.messages)
        setMessages(existingLive.messages)
        messagesRef.current = existingLive.messages
        liveSessionWriteReadyRef.current = true
        setVoiceOn(true)
        setInteractionMode('speech')
        setShowEarbudOverlay(true)
        window.setTimeout(() => setShowEarbudOverlay(false), 5200)
        setTimeout(() => startListening(), 120)
        return
      }

      let liveSetup: { room?: string; objective?: string; controlWords?: string; createdAt?: number } | null = null

      try {
        const rawLiveSetup = window.localStorage.getItem('GEORGE_LIVE_SETUP')
        liveSetup = rawLiveSetup ? JSON.parse(rawLiveSetup) : null
        window.localStorage.removeItem('GEORGE_LIVE_SETUP')
      } catch {
        liveSetup = null
      }

      const roomLine = liveSetup?.room
        ? `${liveSetup.room} mode active.`
        : 'LIVE mode active.'

      const objectiveLine = liveSetup?.objective?.trim()
        ? `Objective: ${liveSetup.objective.trim()}`
        : ''

      const controlLine = liveSetup?.controlWords?.trim()
        ? `Control words: ${liveSetup.controlWords.trim()}`
        : ''

      const liveIntro: Message = {
        role: 'assistant',
        content: `${roomLine}

Room calibrated.
GEORGE is listening.${objectiveLine ? `

${objectiveLine}` : ''}${controlLine ? `

${controlLine}` : ''}`
      }

      const subscriberMetadata = getSubscriberSessionMetadata()
      if (subscriberMetadata) {
        createSession('live', [liveIntro], 'LIVE Assistance', subscriberMetadata)
        liveSessionWriteReadyRef.current = true
      }
      setMessages([liveIntro])
      messagesRef.current = [liveIntro]
      setVoiceOn(true)
      setInteractionMode('speech')
      setShowEarbudOverlay(true)
      window.setTimeout(() => setShowEarbudOverlay(false), 5200)
      setTimeout(() => startListening(), 120)
      return
    }

    if (liveMode || isManualLive) return

    normalSessionBootedRef.current = true

    // /george always boots into normal GEORGE.
    setActiveMode('normal')
    const activeSession =
      subscriberEmail.trim()
        ? getLatestSubscriberSession(subscriberEmail, 'normal')
        : null


    if (activeSession?.mode === 'normal' && Array.isArray(activeSession.messages) && activeSession.messages.length > 0) {
      skipNextTypewriterRef.current = true
      restoredMessagesSignatureRef.current = getMessagesSignature(activeSession.messages)
      setMessages(activeSession.messages)
      messagesRef.current = activeSession.messages
      normalSessionWriteReadyRef.current = true
      return
    }

    const greeting = getInitialGreeting(profileName, currentTier)
    bumpVisitCount()

    const firstMessage: Message[] = [{ role: 'assistant', content: greeting }]
    const subscriberMetadata = getSubscriberSessionMetadata()
    if (subscriberMetadata) {
      createSession('normal', firstMessage, 'Untitled session', subscriberMetadata)
      normalSessionWriteReadyRef.current = true
    }
    setMessages(firstMessage)
    messagesRef.current = firstMessage
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


const georgeProfile = detectConversationProfile(input, interimTranscript)

  const liveGuidance = buildLiveGuidance({
    liveMode,
    currentTier,
    isListening,
    interimTranscript,
    input,
    profile: georgeProfile,
  })

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
const redeemFounderCode = () => {
  const code = window.prompt('Enter founder access code')

  if (!code) return

  const normalized = code.trim().toUpperCase()

  const intelligentFounder = /^INTEL-FOUNDER-\d{3}$/.test(normalized)
  const brilliantFounder = normalized === 'BRILLIANT-FOUNDER'

  if (intelligentFounder) {
    setCurrentTier('intelligent')
    window.localStorage.setItem('george_tier', 'intelligent')
    window.localStorage.setItem('george_founder_code', normalized)
    setToastMessage('Founder Intelligent access activated.')
    setShowToast(true)
    setShowUpgradeModal(false)
    return
  }

  if (brilliantFounder) {
    setCurrentTier('brilliant')
    window.localStorage.setItem('george_tier', 'brilliant')
    window.localStorage.setItem('george_founder_code', normalized)
    setToastMessage('Founder Brilliant access activated.')
    setShowToast(true)
    setShowUpgradeModal(false)
    return
  }

  setToastMessage('Invalid founder code.')
  setShowToast(true)
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
  const [goalState, setGoalState] = useState<null | {
    statedObjective: string | null
    likelyTrueObjective: string | null
    chosenPath: string | null
    bottleneck: string | null
    urgency: 'low' | 'medium' | 'high'
    resistance: 'low' | 'medium' | 'high'
    todayMove: string | null
    futureRisk: string | null
    upgradeRelevance: 'none' | 'intelligent' | 'brilliant'
  }>(null)


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
    const savedTier = window.localStorage.getItem('george_tier')

    if (continuityToken) {
      void fetch('/api/continuity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: continuityToken }),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            setToastMessage(data?.error || 'Continuity link could not be verified.')
            setShowToast(true)
            window.history.replaceState({}, '', window.location.pathname)
            return
          }

          const verifiedEmail = String(data?.email || '').trim().toLowerCase()
          const verifiedTier = data?.currentTier

          if (verifiedEmail) {
            setSubscriberEmail(verifiedEmail)
            window.localStorage.setItem('george_email', verifiedEmail)
            window.localStorage.setItem('george_verified_continuity', 'true')
          }

          if (verifiedTier === 'intelligent' || verifiedTier === 'brilliant') {
            setCurrentTier(verifiedTier)
            window.localStorage.setItem('george_tier', verifiedTier)
          } else {
            setCurrentTier('smart')
            window.localStorage.setItem('george_tier', 'smart')
          }

          setToastMessage('Continuity verified.')
          setShowToast(true)
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch(() => {
          setToastMessage('Continuity link could not be verified.')
          setShowToast(true)
          window.history.replaceState({}, '', window.location.pathname)
        })

      return
    }
    const savedEmail = window.localStorage.getItem('george_email') || ''
    const cleanSavedEmail = savedEmail.trim().toLowerCase()
    if (cleanSavedEmail) setSubscriberEmail(cleanSavedEmail)

    const validTier = tierParam === 'smart' || tierParam === 'intelligent' || tierParam === 'brilliant'

    if (validTier) {
      setCurrentTier(tierParam)
      window.localStorage.setItem('george_tier', tierParam)

      if (subStatus === 'success') {
        setToastMessage(`${tierParam.charAt(0).toUpperCase() + tierParam.slice(1)} is active.`)
        setShowToast(true)
        window.history.replaceState({}, '', window.location.pathname)
      }

      return
    }

    if (savedTier === 'intelligent' || savedTier === 'brilliant') {
      setCurrentTier(savedTier)
    }

    void fetch(`/api/subscription-state${cleanSavedEmail ? `?email=${encodeURIComponent(cleanSavedEmail)}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        const serverTier = data?.currentTier
        if (data?.email) {
          const restoredEmail = String(data.email).trim().toLowerCase()
          if (restoredEmail) {
            setSubscriberEmail(restoredEmail)
            window.localStorage.setItem('george_email', restoredEmail)
          }
        }

        if (serverTier === 'intelligent' || serverTier === 'brilliant') {
          setCurrentTier(serverTier)
          window.localStorage.setItem('george_tier', serverTier)
        } else {
          setCurrentTier('smart')
        }

        if (subStatus === 'success') {
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
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
  const speechQueueRef = useRef<string[]>([])
  const isSpeakingRef = useRef(false)
  const stopSpeechRef = useRef(false)
  const savePickerRef = useRef<HTMLDivElement | null>(null)
  const folderBrowserRef = useRef<HTMLDivElement | null>(null)
  const bridgeSpeechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const bridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    { role: 'assistant', content: 'Hello, build something worth at least 10 or 100 X the cost of Brilliant tier.. and I know we’ll be fine.' },
  ])

  const enterLiveMode = () => {
    preLiveSessionIdRef.current = getActiveSessionIdForMode('normal')
setPreLiveMessages([...messagesRef.current])
    setLiveMode(true)
  }

  const requestExitLiveMode = () => {
    setShowExitPopup(true)
  }

  const exitLiveMode = () => {
    try {
      stopListening()
      window.speechSynthesis.cancel()
    } catch {}

    setLiveMode(false)
    setVoiceOn(false)
    setInteractionMode('text')
    setConversationMode(null)
router.push('/george')
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

    if (preLiveMessages) {
  skipNextTypewriterRef.current = true
  if (preLiveSessionIdRef.current) {
    setActiveSessionIdForMode('normal', preLiveSessionIdRef.current)
  }

  // 🔒 FORCE NORMAL MODE + BREAK LIVE STATE
  setActiveMode('normal')
  liveSessionWriteReadyRef.current = false
  normalSessionWriteReadyRef.current = true

  // 🔒 CLEAR ANY LIVE CONTEXT FLAGS
  setLiveMode(false)
  setConversationMode(null)
router.push('/george')
  setActivePromptContext(null)

  setMessages(preLiveMessages)
  messagesRef.current = preLiveMessages
  setTypedMessageIndex(null) // prevent re-type animation
  setTypedMessageContent('')
}
// save LIVE conversation if meaningful
if (messagesRef.current.length > 2) {
  try {
    saveSessionToV2({
      mode: activeCampaignId ? 'campaign' : 'live',
      title: activeCampaignId ? 'LIVE Session' : 'LIVE Conversation',
      messages: messagesRef.current,
      summary: activeCampaignId
        ? 'Structured LIVE checkpoint.'
        : 'LIVE Conversation checkpoint.',
      userGoal: activeCampaign?.desiredOutcome || 'In progress',
      lastKnownState: 'User exited LIVE mode.',
      suggestedRestart: activeCampaignId
        ? 'Resume this LIVE Session from the strongest operational next move.'
        : 'Resume this LIVE Conversation naturally.',
      metadata: {
        activeCampaignId: activeCampaignId || null,
        campaignName: activeCampaign?.name || null,
        productOrService: activeCampaign?.productOrService || null,
        targetAudience: activeCampaign?.targetMarket || null,
        desiredOutcome: activeCampaign?.desiredOutcome || null,
      },
    })
  } catch {}
}

setPreLiveMessages(null)
  }
  const startNewGeorgeSession = (openingMessage: Message, sessionLabel = 'GEORGE Session') => {
    if (typeof window !== 'undefined' && messagesRef.current.length > 1) {
      try {
        saveSessionToV2({
          mode: liveMode ? 'live' : 'normal',
          title: sessionLabel,
          messages: messagesRef.current,
          summary: liveMode ? 'LIVE Conversation saved before starting a new session.' : 'Normal GEORGE session saved before starting a new session.',
          userGoal: activePromptLabel || 'Not set',
          lastKnownState: 'Saved after user interaction.',
          suggestedRestart: liveMode
            ? 'Resume this LIVE Conversation naturally.'
            : 'Resume this Normal GEORGE session from the clearest next step.',
        })
      } catch {}
    }

    if (conversationMode === 'manual_live') {
  // hard override any existing messages
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
    createSession('live', [liveIntro], 'LIVE Assistance', subscriberMetadata)
    liveSessionWriteReadyRef.current = true
  }
  setMessages([liveIntro])
  messagesRef.current = [liveIntro]
} else {
  const subscriberMetadataForOpening = getSubscriberSessionMetadata()
  if (subscriberMetadataForOpening) {
    createSession('live', [openingMessage], 'LIVE Assistance', subscriberMetadataForOpening)
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

Goal:
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

            // 🔥 campaign intelligence layer
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
            mode: 'campaign',
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

    window.addEventListener('focus', activatePendingIntake)
    document.addEventListener('visibilitychange', activatePendingIntake)

    return () => {
      window.removeEventListener('focus', activatePendingIntake)
      document.removeEventListener('visibilitychange', activatePendingIntake)
    }
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
  const userPinnedBottomRef = useRef(true)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
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

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_MEMORY') || '[]')
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

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_MEMORY') || '[]') as any[]

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

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_MEMORY') || '[]') as Array<{
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

  const saveMemory = (message: Message, messageIndex: number, folderOverride?: string) => {
    if (typeof window === 'undefined') return

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_MEMORY') || '[]')
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

    window.localStorage.setItem('GEORGE_MEMORY', JSON.stringify(existing))
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

      if (!insideSavePicker && !insideFolderBrowser && !insidePromptMenu) {
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
    setIsIOS(/iPhone|iPad|iPod/i.test(window.navigator.userAgent))

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


  function getSuggestedPromptsFromMessage(input: string): PromptSelection[] {
    const value = input.toLowerCase()

    const hasAny = (...terms: string[]) => terms.some((term) => value.includes(term))

    if (hasAny('money', '$', 'income', 'paid', 'paycheck', 'cash', 'bills', 'broke')) {
      return [
        { label: 'Make money this week', text: 'Give me one way to make money this week.', context: 'money_this_week' },
        { label: 'Make $500 fast', text: 'How can I make $500 fast without doing anything illegal or reckless?', context: 'money_fast_safe' },
        { label: 'Skill to income', text: 'Help me turn one skill into income.', context: 'money_skill_to_income' },
      ]
    }

    if (hasAny('job', 'decision', 'choose', 'option', 'should i', 'which one', 'compare')) {
      return [
        { label: 'Make a decision', text: 'Help me make a decision.', context: 'decision_support' },
        { label: 'Compare options', text: 'Compare these options and tell me which is stronger.', context: 'decision_comparison' },
        { label: 'Next move', text: 'What is the smartest next move here?', context: 'decision_next_move' },
      ]
    }

    if (hasAny('business', 'build', 'product', 'app', 'start', 'launch', 'mvp', 'project')) {
      return [
        { label: 'Start building', text: 'Help me start building this.', context: 'build_start' },
        { label: '1-week plan', text: 'Build me a small plan I can execute this week.', context: 'build_week_plan' },
        { label: 'First steps', text: 'Break this into the first real steps.', context: 'build_first_steps' },
      ]
    }

    if (hasAny('message', 'email', 'text', 'rewrite', 'wording', 'say this', 'reply')) {
      return [
        { label: 'Fix message', text: 'Fix this message.', context: 'writing_fix_message' },
        { label: 'Make it stronger', text: 'Rewrite this so it sounds stronger and clearer.', context: 'writing_stronger_clearer' },
        { label: 'Say it better', text: 'Help me say this better without changing the meaning.', context: 'writing_preserve_meaning' },
      ]
    }

    if (hasAny('bible', 'scripture', 'verse', 'kjv', 'proverbs', 'ecclesiastes', 'matthew', 'john')) {
      return [
      ]
    }

    if (hasAny('stuck', 'problem', 'confused', 'overlooked', 'missed', 'wrong', 'issue', 'mess')) {
      return [
        { label: 'Untangle', text: 'Help me untangle this problem.', context: 'problem_untangle' },
        { label: 'Step by step', text: 'Break this down step by step.', context: 'problem_step_by_step' },
        { label: 'Blind spots', text: 'Tell me what I am not seeing here.', context: 'problem_blind_spots' },
      ]
    }

    return []
  }

  function getSuggestedPromptsFromMessages(messages: Message[], currentInput: string): PromptSelection[] {
    const recentUserText = messages
      .filter((m) => m.role === 'user')
      .slice(-4)
      .map((m) => m.content)
      .join(' \n ')
      .trim()

    const combined = `${recentUserText} ${currentInput}`.trim()
    return getSuggestedPromptsFromMessage(combined)
  }

  function samePromptSet(a: PromptSelection[], b: PromptSelection[]) {
    if (a.length !== b.length) return false
    return a.every((item, index) =>
      item.label === b[index]?.label &&
      item.text === b[index]?.text &&
      item.context === b[index]?.context
    )
  }

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.()
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
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

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
            mode: liveMode
              ? 'conversation'
              : activeCampaign
              ? 'campaign'
              : 'normal',
        forceClose,
 input: text, speed: voiceSpeed, tier: currentTier, voice: voiceType }),
    })

    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      console.error('TTS failed:', res.status, msg)
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
          updateActiveSessionMessages(next, activeCampaignId ? 'campaign' : liveMode ? 'live' : 'normal', subscriberMetadata)
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

          audio.oncanplaythrough = () => {
            revealPendingAssistantMessage()

            setTimeout(() => {
              if (stopSpeechRef.current) {
                resolve()
                return
              }

              audio.play().catch((err) => {
                if (stopSpeechRef.current) {
                  resolve()
                  return
                }

                console.error('audio.play() failed', err)
                reject(err)
              })
            }, 120)
          }
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
      if (isIOS || !voiceOn || !hasUserInteractedRef.current) {        return
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
    [interactionMode, isIOS, voiceOn, voiceSpeed, currentTier]
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
      console.log('[GEORGE handleSend]', {
        overrideText,
        input,
        text,
        isThinking,
        activePromptContext,
        activePromptLabel,
      })

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

      const brilliantLiveTrigger = buildBrilliantLiveTriggerResponse(
        text,
        currentTier,
        activePromptContext,
        conversationMode
      )
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

      const updatedMessages = [
        ...messagesRef.current,
        ...(domainPrefix ? [{ role: 'system', content: domainPrefix } as Message] : []),
        ...(userMessage ? [userMessage] : [])
      ]
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

      

      console.log('[GEORGE setMessages user]', {
        updatedMessagesLength: updatedMessages.length,
        lastUserMessage: updatedMessages[updatedMessages.length - 1]?.content,
      })
      setMessages(updatedMessages)

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

      messagesRef.current = updatedMessages
      setInput('')
      setPendingImage(null)
      setInterimTranscript('')
      setVoiceError('')
      setIsThinking(true)
      startBridgeSpeech()



      try {
        if (firstResponseOverride) {
          console.log('[GEORGE firstResponseOverride hit]', {
            firstResponseOverride,
            activePromptContext,
            activePromptLabel,
          })
          stopBridgeSpeech()
        const assistantMessage: Message = {
            role: 'assistant',
            content: firstResponseOverride,
            constrained: false,
          }

          assistantRevealedRef.current = false

          setMessages((prev) => {
            const next = [...prev, assistantMessage]
            console.log('[GEORGE setMessages assistant override]', {
              prevLength: prev.length,
              nextLength: next.length,
              assistantPreview: assistantMessage.content.slice(0, 80),
            })
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
          liveMode ||
          activePromptContext?.includes('conversation') ||
          activePromptContext?.includes('professional') ||
          activePromptContext?.includes('brilliant_live')

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
            voiceMode: false,
            isFirstSession: updatedMessages.length <= 2,
            promptContext: activePromptContext,
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

        const data = await res.json().catch(() => null)

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
          ? `We can go further here.

For deeper step-by-step work, upgrade when you want stronger continuity and execution support.`
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
      if (liveMode && liveTranscript) {
        const state = liveConversationStateRef.current
        if (!state.activeGoal) {
          state.activeGoal = activeCampaign?.desiredOutcome || 'clarity'
        }

        const vocalState = detectVocalState(liveTranscript)


        const lower = liveTranscript.toLowerCase()

        if (/close|sell|buy|sign/.test(lower)) state.activeGoal = 'close'
        if (/understand|clarify|explain/.test(lower)) state.activeGoal = 'clarity'
        if (/diagnose|symptom|pain|doctor/.test(lower)) state.activeGoal = 'diagnosis'


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

          const fire = () => {
            lastCueTsRef.current = Date.now()
            state.lastCue = finalProactiveCue
            setPendingAssistantMessage(null);
setPendingAssistantMessage(null);
setPendingAssistantMessage({
              role: 'assistant',
              content: finalProactiveCue
            })
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

// 🔥 live sales signal detection
      if (liveMode && liveTranscript) {

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

setPendingAssistantMessage(null);
setPendingAssistantMessage(null);
setPendingAssistantMessage({
              role: 'assistant',
              content: 'Pause. Control the next sentence.'
            })
            setConversationSignal('LIVE urgent')
            setAdaptiveCueLabel('Pressure detected')
            return
          }
          stopListening()

          const personProfile = detectConversationPersonProfile(input, liveTranscript)
          const profileLabel = `${personProfile.role} — ${personProfile.posture}`
          const shouldShowProfileLabel = personProfile.confidence >= 0.55 && personProfile.role !== 'unknown'
          const liveLineOutput = shouldShowProfileLabel ? profileLabel + "\\n" + lineText : lineText

          setPendingAssistantMessage(null);
setPendingAssistantMessage(null);
setPendingAssistantMessage({
            role: 'assistant',
            content: intent === "line"
              ? profileLabel + "\n" + lineText
              : intent === "reword"
              ? "Say: “Let me put that another way…”"
              : intent === "cue"
              ? "Cue: Slow down. Control the next sentence."
              : intent === "word"
              ? "Word: [clear single word]"
              : "Focus. Control the next sentence."
          })
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

Use:
Word:
Say:
Cue:
Need:`
            : `I don’t have enough of the room yet.

Tell me who you're speaking to, what this is about, or what outcome you want.`
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

  if (liveMode && strongSignal) {
    stopListening()
    setPendingAssistantMessage(null);
setPendingAssistantMessage(null);
setPendingAssistantMessage({
      role: 'assistant',
      content: 'Say: “Let me make this simple…”'
    })
    setConversationSignal('LIVE strong signal')
    setAdaptiveCueLabel('Strong opportunity detected')
    return
  }

  const text = liveTranscript || ""
  const friction = detectFriction(text)
  const score = scoreFriction(text)

  if (!friction) return

  const interventionNow = Date.now()
  const canIntervene = interventionNow - liveInterventionRef.current > 8000

  if (liveMode && canIntervene && score >= 3) {
    stopListening()

    if (score >= 5) {
      setPendingAssistantMessage(null);
setPendingAssistantMessage(null);
setPendingAssistantMessage({
        role: 'assistant',
        content: 'Pause. Take control of the next sentence.\n\nSay: “Let me clarify the main point.”'
      })
    } else {
      setPendingAssistantMessage(null);
setPendingAssistantMessage(null);
setPendingAssistantMessage({
        role: 'assistant',
        content: 'Cue: Slow down. Ask one clean question.'
      })
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
      if (liveMode && voiceOn && !isThinking) {
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

  const showConversation = input.trim().length > 0 || hasVisibleThread || liveMode
  const showMobileHero = !showConversation && messages.length <= 1
  const enterLiveConversation = () => {
    window.location.href = '/george/live-entry'
  }

  const startNewLiveConversation = () => {
    try {
      if (messagesRef.current.length > 2) {
        saveSessionToV2({
          mode: activeCampaignId ? 'campaign' : 'live',
          title: activeCampaignId ? 'LIVE Session' : 'LIVE Conversation',
          messages: messagesRef.current,
          summary: activeCampaignId
            ? 'Structured LIVE checkpoint before new LIVE conversation.'
            : 'LIVE Conversation checkpoint before new LIVE conversation.',
          userGoal: activeCampaign?.desiredOutcome || 'In progress',
          lastKnownState: 'User started a new LIVE conversation.',
          suggestedRestart: activeCampaignId
            ? 'Resume this LIVE Session from the strongest operational next move.'
            : 'Resume this LIVE Conversation naturally.',
          metadata: {
            activeCampaignId: activeCampaignId || null,
            campaignName: activeCampaign?.name || null,
            productOrService: activeCampaign?.productOrService || null,
            targetAudience: activeCampaign?.targetMarket || null,
            desiredOutcome: activeCampaign?.desiredOutcome || null,
          },
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
    setShowLiveToolsMenu(false)
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

    <div className="text-[32px] font-semibold tracking-[0.25em] text-white">
      GEORGE
    </div>

    <div className="mt-2 text-[12px] tracking-[0.18em] text-neutral-500">
      Smart. Intelligent. Brilliant.
    </div>

    <div className="mt-4 flex items-center gap-[7px]">
      <span className="h-[4px] w-[4px] rounded-full bg-[#AEB6FF]/70 " />
      <span className="h-[4px] w-[4px] rounded-full bg-[#AEB6FF]/48 " />
      <span className="h-[4px] w-[4px] rounded-full bg-[#AEB6FF]/30 " />
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
      <style>{georgeAmbientPulseStyles}</style>
      <main className="app-shell pb-[120px] min-h-[100dvh] w-full overflow-x-hidden bg-[#0B0D12] text-neutral-100">
      <div id="george-app-content" className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden">
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-[40] bg-white/[0.045] backdrop-blur-[20px] backdrop-saturate-85 backdrop-brightness-110 xl:hidden"
          />
        )}

        <Sidebar
          currentTier={currentTier}
          liveMode={liveMode}
            onOpenLiveGate={() => {
              setShowSidebar(false)
              window.location.href = '/george/live-entry'
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
            try {
              if (messagesRef.current.length > 1) {
                saveSessionToV2({
                  mode: 'normal',
                  title: activePromptLabel || 'Normal GEORGE Session',
                  messages: messagesRef.current,
                  summary: 'Normal GEORGE session checkpoint.',
                  userGoal: activePromptLabel || 'Not set',
                  lastKnownState: 'Saved before starting a new Normal session.',
                  suggestedRestart: 'Resume this Normal GEORGE session and continue from the clearest next step.',
                })
              }
            } catch {}

            const greeting = getInitialGreeting(profileName, currentTier)
            setTimeout(() => {
              setMessages([{ role: 'assistant', content: greeting }])
              messagesRef.current = [{ role: 'assistant', content: greeting }]
            }, 1000)
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

        <div className="flex min-w-0 w-full flex-1 flex-col overflow-visible">
          <div className="flex h-[100dvh] min-h-0 w-full flex-1 flex-col overflow-hidden px-4 pb-0 pt-[68px] md:h-screen md:px-8 md:pb-0 md:pt-[98px] xl:pl-[280px] xl:pr-12">
            <header className={`fixed top-0 left-0 right-0 xl:pl-[280px] flex justify-center border-b border-white/[0.04] bg-[#0F1117]/82 backdrop-blur-xl px-4 py-1.5 transition duration-200 ${"z-50"}`}>
              <div className="relative flex w-full max-w-6xl items-center justify-between">
                <div className="flex items-center gap-2 xl:hidden">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(true)}
                    onTouchStart={() => setShowSidebar(true)}
                    onPointerDown={() => setShowSidebar(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.045] bg-[#171B26]/72 text-[#AAB4FF] shadow-[0_0_12px_rgba(124,140,255,0.14)] pointer-events-auto"
                    aria-label="Open menu"
                  >
                    <span className="flex flex-col items-center justify-center gap-[3px]">
                      <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                      <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                      <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLanguage(prev => prev === 'EN' ? 'ES' : 'EN')
                    }}
                    className="flex h-8 items-center gap-1 rounded-full border border-white/[0.04] bg-white/[0.015] px-2 text-[10px] font-medium tracking-[0.14em] text-white/45 transition hover:text-white/75"
                    aria-label="Change language"
                  >
                    <span>{language === 'EN' ? '🇺🇸' : '🇪🇸'}</span>
                    <span>{language}</span>
                  </button>
                </div>

                <div className="hidden xl:grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5">

                  <div />

                  <div className="flex justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/20">
                        GEORGE
                      </span>
                      {!showMobileHero && (
                        <div className="hidden xl:flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
                          <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
                          <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
                          <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleInstallGeorge}
                      className="inline-flex h-9 items-center justify-center px-2 text-[12px] font-medium uppercase tracking-[0.18em] text-white/42 transition hover:text-white/72"
                      aria-label="Send George"
                      title="Send George"
                    >
                      <span className="tracking-[0.18em] uppercase"><span className="text-[#7C8CFF]">G.</span></span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstallGeorge}
                  className="inline-flex h-9 items-center justify-center px-2 text-[12px] font-medium uppercase tracking-[0.18em] text-white/42 transition hover:text-white/72 xl:hidden"
                  aria-label="Send George"
                  title="Send George"
                >
                      <span className="tracking-[0.18em] uppercase"><span className="text-[#7C8CFF]">G.</span></span>
                    </button>
              </div>
            </header>

            

{!showMobileHero && (
  <div className="fixed top-[72px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 md:hidden">
    <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
    <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
    <span className="h-1 w-1 rounded-full bg-[#7C8CFF] " />
  </div>
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
  className={`flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-3 ${liveMode ? "pb-[118px] md:pb-[140px]" : "pb-[270px] md:pb-[300px]"} md:px-6 space-y-3 ${liveMode ? "pt-3 md:pt-8" : showMobileHero ? "pt-3 md:pt-14" : "pt-10 md:pt-6"}`}>
  {showMobileHero && (
    <div className="flex min-h-[92px] flex-col items-center justify-start px-4 pt-3 md:hidden">
      <div className="text-center text-[32px] md:text-[40px] font-[300] tracking-[0.24em] text-white/42">
        GEORGE
      </div>

      <div className="mt-2 text-center text-[12px] font-[300] tracking-[0.28em] text-white/22">
        Operational fluency.
      </div>

      <ContinuityCapsule
        email={subscriberEmail}
        onClear={() => {
          setSubscriberEmail('')
          setCurrentTier('smart')
          window.localStorage.removeItem('george_email')
          window.localStorage.removeItem('george_tier')
          window.localStorage.removeItem('george_verified_continuity')
          window.localStorage.removeItem('GEORGE_SESSIONS_V2')
          window.localStorage.removeItem('GEORGE_ACTIVE_SESSION_ID')
          window.localStorage.removeItem('GEORGE_ACTIVE_NORMAL_SESSION_ID')
          window.localStorage.removeItem('GEORGE_ACTIVE_LIVE_SESSION_ID')
          window.localStorage.removeItem('GEORGE_ACTIVE_CAMPAIGN_SESSION_ID')
          setMessages([])
          messagesRef.current = []
          window.location.reload()
        }}
      />

      <div className="hidden">
        <span className="h-[4px] w-[4px] rounded-full bg-[#AEB6FF]/70 " />
        <span className="h-[4px] w-[4px] rounded-full bg-[#AEB6FF]/48 " />
        <span className="h-[4px] w-[4px] rounded-full bg-[#AEB6FF]/30 " />
      </div>
    </div>
  )}
  {liveMode && (
    <div className="pointer-events-none flex justify-center pt-1 pb-0 overflow-visible">
      <img
        src="/earbudlive500.png"
        alt=""
        className="h-[76px] w-auto max-w-[78vw] object-contain opacity-72 drop-shadow-[0_0_18px_rgba(124,140,255,0.12)]"
      />
    </div>
  )}

  {bridgeThinking && (
    <div className="text-sm leading-7 text-white/70">
      GEORGE is working
    </div>
  )}
  {messages
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
        className={`relative whitespace-pre-wrap text-[15.5px] md:text-[15.5px] landscape:text-[18px] ${liveMode ? 'leading-[1.65]' : 'leading-[1.5]'} landscape:leading-8 tracking-[0em] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-white/88 ${
          m.role === 'user'
            ? (liveMode
              ? 'max-w-[82%] text-right rounded-[0.95rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/5 px-3.5 py-2.5 shadow-none'
              : 'max-w-[82%] text-right rounded-[0.95rem] border border-white/[0.045] bg-white/[0.02] px-3.5 py-2.5 shadow-none')
 : 'max-w-full text-left'
        } ${
          !expandedMessages[i] && (m.content || '').length > 420
            ? 'max-h-[220px] overflow-hidden'
            : ''
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

      {(m.content || '').length > 420 && (
        <button
          type="button"
          onClick={() =>
            setExpandedMessages((prev) => ({
              ...prev,
              [i]: !prev[i],
            }))
          }
          className="mt-1 px-1 text-[11px] tracking-[0.12em] text-white/34 transition hover:text-white/62"
        >
          {expandedMessages[i] ? 'See less' : 'See more'}
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
              className="rounded-full border border-[#7C8CFF]/25 bg-[#7C8CFF]/[0.055] px-5 py-4 text-xs text-white transition hover:border-[#7C8CFF]/50 hover:bg-[#7C8CFF]/15"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {m.role === 'user' && (
        <div className="flex items-center gap-1.5 text-white/72">
          <button
            type="button"
            onClick={() => {
              handleFeedback(i, 'up')
              setToastMessage('Saved')
              setShowToast(true)
            }}
            className={`relative flex items-center justify-center transition duration-150 ${
              feedback[i] === 'up'
                ? 'text-[#AEB6FF]/82'
                : 'text-white/50 hover:text-white/80'
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
                : 'text-white/50 hover:text-white/80'
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

          {false && (isLatestAssistant && liveMode) && (
  <div className="flex items-center justify-end gap-1 mt-2 text-[11px] text-white/55">

    <button onClick={() => saveMemory(m, i)}>
      Quick Save
    </button>

    <button onClick={() => {
      setShowPromptMenu(false)
      setShowRecentFolders(false)
      setActiveSaveIndex((prev) => (prev === i ? null : i))
    }}>
      Save to Folder
    </button>

    <div className="relative">
      {rewordPopupIndex === i && (
        <div
          className={`absolute left-0 z-[80] w-44 rounded-[1.15rem] border border-[#7C8CFF]/28 bg-[#11131A]/88 text-[11px] text-white/66 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl ring-1 ring-white/[0.04] animate-[menuLift_140ms_ease-out] ${
            rewordPopupUpward ? 'bottom-[40px]' : 'top-[34px]'
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1 border-b border-[#7C8CFF]/10">
            <span className="text-[10px] tracking-[0.12em] text-white/62">REWORD</span>
            <button
              onClick={() => setRewordPopupIndex(null)}
              className="text-white/30 hover:text-white transition text-[12px]"
            >
              ✕
            </button>
          </div>

          <div className="p-1.5">
            {(['Reword','Rescript','Shorter','Stronger'] as const).map((action) => (
              <button
                key={action}
                onClick={() => {
                  const goal = activeCampaign?.currentGoal || activeCampaign?.desiredOutcome || 'the active conversation goal'
                  const mode = resolvedLivePosture || 'manual'
                  const prompt = `Rewrite the line below for a live call.

Goal: ${goal}
Mode: ${mode}
Original line:
${m.content}

Return only:
Say:
Backup:
Cue:`

                  setRewordPopupIndex(null)
                  void handleSend(prompt)
                }}
                className="block w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-white/70 transition hover:bg-white/[0.022] hover:text-white/92"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={(event) => {
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
          const roomAbove = rect.top
          const roomBelow = window.innerHeight - rect.bottom
          setRewordPopupUpward(roomAbove > 180 || roomAbove > roomBelow)
          setRewordPopupIndex((prev) => (prev === i ? null : i))
        }}
      >
        Reword
      </button>
    </div>

    <button onClick={() => {
      const goal = activeCampaign?.currentGoal || activeCampaign?.desiredOutcome || 'the active conversation goal'
      const mode = resolvedLivePosture || 'manual'
      const style = resolvedOutputStyle
      const delivery = resolvedDeliveryMode
      const closingDirective = forceClose
  ? "\n\n[DIRECTIVE: Stay in close. Continue pushing for a decision. Do not drift.]"
  : ""

const prompt = `GEORGE, give me the next live cue.${closingDirective}


Goal: ${goal}
Mode: ${mode}
Output style: ${style}
Tone: ${resolvedAssistTone}
Delivery: ${delivery}

Use the active campaign context, constraints, and what is happening now.

Rules:
- If delivery is text: return structured Say / Backup / Cue.
- If delivery is audio: give a speakable line with a delivery instruction, not emotional performance.
- If delivery is repeat: give one short repeatable line.
- Do not explain.

Return only:
Say:
Backup:
Cue:`

      void handleSend(prompt)
    }}>
      Cue
    </button>

    <button
      type="button"
      onClick={() => {
        void handleSend(`SCREENER / GATEKEEPER → DECISION MAKER.

You are GEORGE.

User is either:
1) speaking to a gatekeeper
2) or has reached the decision maker

Your job:
- identify who you're speaking to immediately
- if gatekeeper → get past them clean
- if decision maker → switch tone instantly and begin control
- do NOT pitch prematurely
- stay tight and directive
- move toward a close or next step

Rules:
- detect role (gatekeeper vs decision maker)
- adapt language accordingly
- once decision maker is confirmed → shift to closing posture

Return ONLY:

Say:
Backup:
Cue:`)
      }}
      className="ml-2 rounded-lg px-2 py-1 text-[11px] text-white/70 transition hover:bg-white/[0.022] hover:text-white/92"
      title="Screener"
    >
      🎯
    </button>

    <div className="relative">
      {tonePopupIndex === i && (
        <div
          className={`absolute left-0 z-[80] w-44 rounded-[1.15rem] border border-[#7C8CFF]/28 bg-[#11131A]/88 text-[11px] text-white/66 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl ring-1 ring-white/[0.04] animate-[menuLift_140ms_ease-out] ${
            tonePopupUpward ? 'bottom-[40px]' : 'top-[34px]'
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1 border-b border-[#7C8CFF]/10">
            <span className="text-[10px] tracking-[0.12em] text-white/62">TONE</span>
            <button
              onClick={() => setTonePopupIndex(null)}
              className="text-white/30 hover:text-white transition text-[12px]"
            >
              ✕
            </button>
          </div>

          <div className="p-1.5">
            {(['calm','direct','assertive','firm','warm','neutral'] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => {
                  setAssistTone(tone)
                  setTonePopupIndex(null)
                  setToastMessage(`Tone: ${tone}`)
                  setShowToast(true)
                }}
                className="block w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-white/70 transition hover:bg-white/[0.022] hover:text-white/92"
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={(event) => {
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
          const roomAbove = rect.top
          const roomBelow = window.innerHeight - rect.bottom
          setTonePopupUpward(roomAbove > 180 || roomAbove > roomBelow)
          setTonePopupIndex((prev) => (prev === i ? null : i))
        }}
      >
        Tone
      </button>
    </div>

  </div>
)}

          {m.constrained && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 pl-1">
                <span className="h-1 w-4 rounded-full bg-[#7C8CFF] " />
                <span className="h-1 w-4 rounded-full bg-[#7C8CFF] " />
                <span className="h-1 w-4 rounded-full bg-[#7C8CFF] " />
              </div>
              <span className="text-xs text-[#7C8CFF]">
                This requires deeper support.
              </span>
            </div>
          )}

          {false && activePromptContext &&
            (
              activePromptContext?.startsWith('conversation_assist_') ||
              activePromptContext?.startsWith('professional_') ||
              activePromptContext?.startsWith('brilliant_')
            ) && (
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto divide-x divide-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setVoiceOn(false)
                  setInteractionMode('text')
                  window.localStorage.setItem('george_voice', 'off')
                  setToastMessage('Text guidance active')
                  setShowToast(true)
                }}
                className={`rounded-full border px-3 py-1.5 font-semibold tracking-[0.08em] transition ${
                  !voiceOn
                    ? 'border-[#7C8CFF]/85 bg-[#7C8CFF]/25 text-white shadow-[0_0_18px_rgba(124,140,255,0.22)]'
                    : 'border-[#7C8CFF]/20 bg-[#7C8CFF]/8 text-white/65 hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/14 hover:text-white'
                }`}
              >
                Text Assist
              </button>

              <button
                type="button"
                onClick={() => {
                  setVoiceOn(true)
                  setInteractionMode('speech')
                  window.localStorage.setItem('george_voice', 'on')
                  setTimeout(() => startListening(), 120)
                  setToastMessage('Audio guidance active')
                  setShowToast(true)
                }}
                className={`rounded-full border px-3 py-1.5 font-semibold tracking-[0.08em] transition ${
                  voiceOn
                    ? 'border-[#7C8CFF]/85 bg-[#7C8CFF]/25 text-white shadow-[0_0_18px_rgba(124,140,255,0.22)]'
                    : 'border-[#7C8CFF]/20 bg-[#7C8CFF]/8 text-white/65 hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/14 hover:text-white'
                }`}
              >
                Audio Assist
              </button>

              <button
                type="button"
                onClick={() => {
                  stopListening()
                  exitLiveMode()
                  setVoiceOn(false)
                  setInteractionMode('text')
                  setConversationMode(null)
router.push('/george')
                  setShowConversationMenu(false)
                  setConversationMenuLane('selector')
                  setActivePromptContext(null)
                  setActivePromptLabel(null)
                  setStableLiveGuidance(null)
                  window.localStorage.removeItem('george_active_context')
                  window.localStorage.removeItem('george_active_label')
                  window.localStorage.setItem('george_voice', 'off')
                  setToastMessage('Back to GEORGE')
                  setShowToast(true)
                }}
                className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-red-100/82 transition hover:border-red-300/45 hover:bg-red-500/15"
              >
                Exit
              </button>
            </div>
          )}

          {!isWelcomeAssistant &&
            !liveMode && (
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto divide-x divide-white/10 text-[11px] text-neutral-500">
            {!isWelcomeAssistant && (
              <>
            <button
              type="button"
              onClick={(event) => {
                const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
                const roomAbove = rect.top
                const roomBelow = window.innerHeight - rect.bottom
                setSavePopupUpward(roomAbove > 260 || roomAbove > roomBelow)
                setShowPromptMenu(false)
      setShowRecentFolders(false)
      setActiveSaveIndex((prev) => (prev === i ? null : i))
                setActiveMemoryFolder(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/[0.055] hover:bg-white/[0.022] hover:text-white/92"
            >
              <span className="h-1 w-1 rounded-full bg-[#7C8CFF]" />
              
            </button>

            <button
              type="button"
              onClick={async () => {
                const shareText = m.content
                try {
                  if (navigator.share) {
                    await navigator.share({ title: 'GEORGE by BRANESx', text: `Want to get something done? GEORGE is your guide.\n\n${shareText}`, url: window.location.origin + '/george' })
                  } else if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareText)
                    setToastMessage('Copied')
                    setShowToast(true)
                  }
                } catch {}
              }}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/[0.055] hover:bg-white/[0.022] hover:text-white/92"
            >
              Send
            </button>

            <button
              type="button"
              onClick={() => {
                const simplifyTarget = m.content

                const prompt = `Simplify this GEORGE response into short, plain, everyday language.

Remove:
- jargon
- business language
- complicated explanations
- unnecessary detail

Replace terms like:
KPI, ROI, funnel, wedge, SKU, ACV, positioning, conversion, objection handling

with normal human language.

Keep the meaning.
Keep the tone calm and direct.
Return ONLY the simplified response.

Response:
${simplifyTarget}`

                setConversationSignal('Simplifying…')
                void handleSend(prompt, { hidden: true })
              }}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition hover:border-[#7C8CFF]/45 hover:bg-white/[0.022] hover:text-white/92"
            >
              Simplify
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
                  ? 'text-[#AEB6FF]/82'
                  : 'text-white/50 hover:text-white/80'
              } ${
                feedbackPulse[`${i}-up`]
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(124,140,255,0.55)]'
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
                  ? 'text-[#AEB6FF]/82'
                  : 'text-white/50 hover:text-white/80'
              } ${
                feedbackPulse[`${i}-down`]
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(124,140,255,0.55)]'
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
              className={`absolute z-30 w-[230px] max-w-[82vw] rounded-[1.15rem] border border-[#7C8CFF]/28 bg-[#11131A]/90 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.50),0_0_18px_rgba(124,140,255,0.10)] backdrop-blur-xl animate-[menuLift_140ms_ease-out] ${savePopupUpward ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom' : 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top'}` }
            >
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#D7DDFF]">
                  Save
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
                      className="flex-1 rounded-lg border border-[#7C8CFF]/18 bg-[#7C8CFF]/8 px-2 py-1.5 text-[10px] font-medium text-white/76 transition hover:border-[#7C8CFF]/40 hover:bg-[#7C8CFF]/14 hover:text-white"
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
                  className="w-full rounded-lg border border-[#7C8CFF]/20 bg-[#7C8CFF]/8 px-2.5 py-2 text-[11px] font-medium leading-4 text-white/86 transition hover:border-[#7C8CFF]/50 hover:bg-[#7C8CFF]/14"
                >
                  Save to {getDefaultFolder()}
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
                          className={`max-w-full break-words rounded-full border px-2 py-1 text-[10px] leading-4 transition ${
                            activeMemoryFolder === folder
                              ? 'border-[#7C8CFF]/50 bg-[#7C8CFF]/[0.055] text-white'
                              : 'border-white/10 text-neutral-300 hover:border-[#7C8CFF]/35 hover:text-white'
                          }`}
                        >
                          {folder}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeMemoryFolder && getLatestSavedMemoryByFolder(activeMemoryFolder) && (
                  <div className="rounded-xl border border-[#7C8CFF]/14 bg-black/35 p-1.5 text-[10px] leading-4 text-neutral-500 break-words">
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
                      className="w-full rounded-xl border border-[#7C8CFF]/14 bg-black/30 px-2.5 py-1.5 text-[11px] leading-4 text-white outline-none placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const folder = newFolderName.trim() || getDefaultFolder()
                        setActiveMemoryFolder(folder)
                        saveMemory(m, i, folder)
                      }}
                      className="w-full rounded-xl border border-white/[0.05] px-2.5 py-1.5 text-[11px] leading-4 text-white transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/[0.055]"
                    >
                      Save
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
  <div className={`fixed bottom-[190px] left-1/2 z-[90] -translate-x-1/2 ${liveMode ? "hidden" : "flex"} items-center justify-center opacity-70 transition hover:opacity-100`}>

    <div className="absolute h-10 w-10 rounded-full border border-[#7C8CFF]/12 bg-black/30 shadow-[0_14px_34px_rgba(0,0,0,0.34),0_0_14px_rgba(124,140,255,0.08)] backdrop-blur-md" />

    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-black/36 shadow-[inset_0_0_14px_rgba(255,255,255,0.02)]">

      <button
        type="button"
        onClick={() => {
          userPinnedBottomRef.current = true
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
          setShowScrollHint(false)
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C8CFF]/72 text-black shadow-[0_10px_24px_rgba(0,0,0,0.28),0_0_16px_rgba(124,140,255,0.18)] transition hover:bg-[#8D9BFF]/88 hover:scale-[1.03]"
        aria-label="Scroll to latest message"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v13" />
          <path d="m6 12 6 6 6-6" />
        </svg>
      </button>

    </div>
  </div>
)}

<div ref={messagesEndRef} className="h-[120px] md:h-[140px]" />

</div>


            

            <div className={`fixed bottom-0 md:bottom-0 left-0 right-0 w-full xl:pl-[280px] flex-col bg-black flex transition duration-200 ${"z-50"}`}>
              

              <div className={`fixed bottom-[88px] left-0 right-0 z-[70] mx-auto ${liveMode ? "hidden" : "flex"} w-full max-w-[900px] px-3 md:w-[calc(100%-24px)] items-center justify-between pointer-events-none`}>
                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.open('/help','_blank')}
                    className="rounded-full border border-white/[0.04] bg-white/[0.018] px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white/42 transition hover:bg-white/[0.022] hover:text-white/72"
                  >
                    Help
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLanguage(prev => prev === 'EN' ? 'ES' : 'EN')
                    }}
                    className="rounded-full border border-white/[0.04] bg-white/[0.018] px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white/42 transition hover:bg-white/[0.022] hover:text-white/72"
                    aria-label="Change language"
                  >
                    <span className="mr-1">{language === 'EN' ? '🇺🇸' : '🇪🇸'}</span>
                    {language}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={enterLiveConversation}
                  className="pointer-events-auto rounded-full border border-[#7C8CFF]/16 bg-[#11131A]/78 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-[#C7D0FF]/84 shadow-[0_0_18px_rgba(124,140,255,0.08)] transition hover:border-[#7C8CFF]/28 hover:bg-[#7C8CFF]/[0.055] hover:text-white"
                >
                  ◉ LIVE
                </button>

              </div>

              <div className="hidden">
  <div className="flex items-center gap-4 py-3 text-white/80 text-[13px]">
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
            ? 'border-[#7C8CFF]/35 bg-[#7C8CFF]/[0.055] text-[#AEB6FF]/82 shadow-[0_0_8px_rgba(124,140,255,0.16)]'
            : 'border-white/10 bg-white/[0.015] text-white/70 hover:border-white/20 hover:bg-white/[0.022] hover:text-white/92'
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
  stopListening()
  exitLiveMode()
  setShowConversationMenu(false)
  setConversationMenuLane('selector')
  setActivePromptContext(null)
  setActivePromptLabel(null)
  setToastMessage('Back to GEORGE')
  setShowToast(true)
  window.localStorage.removeItem('george_active_context')
  window.localStorage.removeItem('george_active_label')
} else {
  enterLiveConversation()
}
}}
          className={`flex h-9 items-center justify-center px-2 text-[12px] font-medium tracking-[0.12em] transition ${
            liveMode
              ? 'border border-[#7C8CFF]/40 bg-[#7C8CFF]/20 text-[#7C8CFF]'
              : 'text-white/80 hover:text-white'
          }`}
        >
          LIVE
        </button>

        
        </>
      )}


      {showRecentFolders && (
        <div
          ref={folderBrowserRef}
          className="fixed bottom-[128px] left-1/2 -translate-x-1/2 z-50 w-[min(340px,calc(100vw-32px))] rounded-[1.05rem] border border-[#7C8CFF]/28 bg-[#11131A]/90 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.42),0_0_18px_rgba(124,140,255,0.10)] backdrop-blur-xl transition-all duration-200 ease-out animate-[menuLift_140ms_ease-out]"
        >
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">
              saved memory
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
                          ? 'bg-white/[0.08] text-white'
                          : 'text-white/62 hover:bg-white/[0.022] hover:text-white'
                      }`}
                    >
                      {folder}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-[13px] text-white/30">
                No saved memories yet
              </div>
            )}

            {activeMemoryFolder && (
              <div className="mt-3 border-t border-transparent pt-3">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/35">
                  <span>{activeMemoryFolder}</span>
                  <button
                    type="button"
                    onClick={() => setActiveMemoryFolder(null)}
                    className="text-white/30 transition hover:text-white"
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
                          const memoryContext = `You saved this earlier:\n${textBlock}\n\nDo you want me to respond, or leave it as-is?`

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
                            ? 'border-[#7C8CFF]/40 bg-[#7C8CFF]/[0.055] text-white'
                            : 'border-[#7C8CFF]/14 bg-black/35 text-neutral-300 hover:border-[#7C8CFF]/35 hover:text-white'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-1.5">
                          <span className="truncate">
                            {item.preview || (item.content || '').slice(0, 80)}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-white/45">
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
        className="relative flex h-7 w-7 items-center justify-center text-white/85 transition hover:text-white"
        aria-label="Make a better move"
      >
        <span className="text-[34px] leading-none">+</span>
        <span
          className={`absolute right-2 top-1 h-1 w-1 rounded-full ${
            reroutePrompt || suggestedPrompts !== tieredStarterPrompts && suggestedPrompts.length > 0
              ? 'bg-[#7C8CFF]'
              : 'bg-white/85'
          } ${
            suggestedSignal || rerouteSignal
              ? 'ring-1 ring-[#7C8CFF]/45 shadow-[0_0_6px_#7C8CFF,0_0_12px_#7C8CFF] '
              : ''
          }`}
        />
      </button>

      {showPromptMenu && (
        <div
          ref={promptMenuRef}
          className="absolute bottom-full mb-2 left-0 z-50 w-[170px] max-w-[48vw] rounded-[1.15rem] border border-[#7C8CFF]/28 bg-[#11131A]/90 px-2.5 py-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.50),0_0_18px_rgba(124,140,255,0.10)] backdrop-blur-xl animate-[menuLift_140ms_ease-out]">
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
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
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
                setVoiceOn(nextVoice)
                setInteractionMode(nextVoice ? 'speech' : 'text')
                window.localStorage.setItem('george_voice', nextVoice ? 'on' : 'off')
                setToastMessage(nextVoice ? 'Voice on' : 'Voice off')
                setShowToast(true)
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
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
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
            >
              
            </button>

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click()
                setShowPromptMenu(false)
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
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
                className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

{showEarbudOverlay && (
  <div className="fixed inset-x-0 top-[92px] z-[260] flex justify-center pointer-events-none">
    <div className="flex flex-col items-center gap-3 px-6 text-center animate-[menuLift_700ms_ease-out]">
      <div className="relative h-[122px] w-[122px]">
        <img
          src="/earbudlive500.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-45 blur-[1.2px]"
        />
        <img
          src="/earbudlive500.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-82 drop-shadow-[0_0_18px_rgba(124,140,255,0.18)] [clip-path:circle(35%_at_50%_50%)]"
        />
        <div className="absolute inset-0 rounded-full border border-[#7C8CFF]/10 bg-[#7C8CFF]/[0.025] blur-[0.2px]" />
      </div>

      <div className="rounded-[1rem] border border-[#7C8CFF]/18 bg-black/74 px-4 py-2 text-[12px] leading-5 text-white/74 shadow-[0_14px_40px_rgba(0,0,0,0.50)] backdrop-blur-xl">
        Use one earbud if possible.
        <br />
        GEORGE is listening.
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
      className="fixed inset-0 z-[240] bg-black/60 backdrop-blur-[10px]"
    />

    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] rounded-[1.5rem] border border-[#7C8CFF]/24 bg-black/94 p-5 shadow-[0_20px_56px_rgba(0,0,0,0.42)] backdrop-blur-xl ">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#7C8CFF]">
          STRUCTURED LIVE
        </div>

        <div className="mt-2 text-[16px] font-semibold text-white">
          Coming soon.
        </div>

        <div className="mt-3 text-[12px] leading-5 text-white/58">
          LIVE is currently focused on stabilizing individual real-time assistance before expanding into structured LIVE environments.
        </div>

        <button
          type="button"
          onClick={() => setShowProLiveComingSoon(false)}
          className="mt-5 w-full rounded-xl border border-[#7C8CFF]/24 bg-[#7C8CFF]/[0.055] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#7C8CFF]/16"
        >
          Continue
        </button>
      </div>
    </div>
  </>,
  document.body
)}


{showExitPopup && typeof document !== 'undefined' && createPortal(
  <>
    <div
      role="button"
      tabIndex={0}
      onClick={() => setShowExitPopup(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          setShowExitPopup(false)
        }
      }}
      className="fixed inset-0 z-[220] bg-black/34 backdrop-blur-[10px] transition-opacity duration-150"
    />

    <div className="fixed inset-0 z-[230] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-[1.6rem] border border-white/[0.07] bg-[#0B0D12]/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-150 ease-out">
        <div className="mb-2 text-[11px] tracking-[0.22em] text-[#7C8CFF]">
          LEAVE LIVE
        </div>

        <div className="text-[15px] font-semibold text-white">
          Exit
        </div>

        <div className="mt-2 text-[12px] leading-5 text-white/62">
          GEORGE will return you to normal mode and preserve the session through V2 continuity.
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              setShowExitPopup(false)
              exitLiveMode()
            }}
            className="w-full rounded-xl border border-[#7C8CFF]/35 bg-[#7C8CFF]/[0.055] px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-[#7C8CFF]/20"
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
            className="w-full rounded-xl border border-red-400/12 bg-red-400/[0.045] px-4 py-3 text-left text-sm font-medium text-red-100/82 transition hover:bg-red-400/[0.045]"
          >
            Exit without saving
          </button>

          <button
            type="button"
            onClick={() => setShowExitPopup(false)}
            className="w-full rounded-xl border border-[#7C8CFF]/16 bg-[#7C8CFF]/8 px-4 py-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/[0.07]"
          >
            Continue session
          </button>
        </div>
      </div>
    </div>
  </>,
  document.body
)}

{showSessionPicker && typeof document !== 'undefined' && createPortal(
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
      className={`fixed inset-0 z-[200] bg-black/20 backdrop-blur-[6px] backdrop-saturate-150 transition-opacity duration-150 ${sessionPickerClosing ? 'opacity-0' : 'opacity-100'}`}
    />

    <div className="fixed inset-0 z-[210] flex items-end justify-center px-4 pb-[132px] md:items-center md:pb-0">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[360px] max-h-[48dvh] overflow-y-auto rounded-[1.05rem] border ${sessionPickerMode === 'campaign' ? 'border-[#7C8CFF]/20' : 'border-[#7C8CFF]/28'} bg-[#11131A]/90 px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.55),0_0_18px_rgba(124,140,255,0.10)] backdrop-blur-xl transition-all duration-200 ease-out ${sessionPickerClosing ? 'translate-y-10 opacity-0 scale-[0.98]' : 'translate-y-0 opacity-100 scale-100'}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="pr-12">
            <div className="text-[11px] tracking-[0.18em] text-[#7C8CFF]">
              {sessionPickerMode === 'campaign' ? 'RESUME LIVE' : 'RESUME CONVERSATION'}
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              {sessionPickerMode === 'campaign' ? 'Structured LIVE continuity memory.' : 'Immediate LIVE Conversation memory.'}
            </div>
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
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 transition hover:border-[#7C8CFF]/50 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {(() => {
            let sessions: any[] = []
            try {
              sessions = (sessionPickerMode === 'campaign'
                ? getCampaignSessions()
                : getSessionsForMode('live')).filter(hasMeaningfulUserMessage)
            } catch {
              sessions = []
            }

            if (!sessions.length) {
              return (
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-2 text-[12px] text-white/65">
                  {sessionPickerMode === 'campaign' ? 'No saved campaigns yet.' : 'No saved conversations yet.'}
                </div>
              )
            }

            return sessions.slice(0, 12).map((session) => (
              <div
                key={session.id}
                className="group relative overflow-hidden rounded-[1rem] border border-transparent bg-black/20 transition hover:bg-[#7C8CFF]/[0.055]"
              >
                <button
                  onClick={() => {
                  setSessionPickerClosing(true)
                  window.setTimeout(() => {
                    setShowSessionPicker(false)
                    setSessionPickerClosing(false)
                  }, 170)
                  // LIVE handled by state/session
                  if (sessionPickerMode === 'campaign') {
                    const campaignId = typeof session.metadata?.activeCampaignId === 'string' ? session.metadata.activeCampaignId : session.id
                    const savedEnvironment = session.savedEnvironment || session.metadata?.savedEnvironment || {}
                    const restoredAssistMode = savedEnvironment.assistMode || session.assistMode || 'live_assist'
                    const restoredOutputStyle = savedEnvironment.outputStyle || session.outputStyle || 'short_cues'
                    const restoredDeliveryMode = savedEnvironment.deliveryMode || session.deliveryMode || 'text'
                    const restoredTone = savedEnvironment.assistTone || session.assistTone || assistTone

                    setActiveCampaignId(campaignId)
                    setConversationMode(restoredAssistMode === 'negotiation' ? 'live_negotiation' : restoredAssistMode === 'objection_handling' ? 'live_response' : 'live_assist')
                    setActivePromptContext(restoredAssistMode === 'negotiation' ? 'live_negotiation' : restoredAssistMode === 'objection_handling' ? 'live_response' : 'live_assist')
                    setActivePromptLabel(session.title || 'LIVE Session')
                    setAssistTone(restoredTone)
                    setVoiceOn(restoredDeliveryMode === 'audio' || restoredDeliveryMode === 'both')
                    setInteractionMode(restoredDeliveryMode === 'audio' || restoredDeliveryMode === 'both' ? 'speech' : 'text')
                    setCampaigns((prev) =>
                      prev.map((c) =>
                        c.id === campaignId
                          ? { ...c, assistMode: restoredAssistMode, outputStyle: restoredOutputStyle, deliveryMode: restoredDeliveryMode }
                          : c
                      )
                    )
                  } else {
                    setConversationMode('manual_live')
                    setActivePromptContext('manual_live')
                    setActivePromptLabel(session.title || 'Conversation')
                    setVoiceOn(false)
                    setInteractionMode('text')
                  }

                  const goal = session.userGoal || session.currentGoal || session.desiredOutcome || 'Not set'
                  const state = session.lastKnownState || session.summary || 'Unknown'
                  const restart = session.suggestedRestart || 'Continue from the strongest next move, or tell me what changed.'

                  const restartBrief: Message = {
                    role: 'assistant',
                    content: `Welcome back.

Goal:
${goal}

Last known state:
${state}

Recommended next move:
${restart}

Choose one:
1. Continue from here.
2. Tell me what changed.
3. Start fresh.`
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
                className="w-full text-left px-3 py-2 pr-14 text-[12px] text-white/82"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 font-semibold text-white">
                    {session.title || session.label || session.name || 'Conversation'}
                  </div>

                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] ${
                    sessionPickerMode === 'campaign'
                      ? 'bg-[#7C8CFF]/14 text-[#C8CEFF]'
                      : 'bg-white/[0.022] text-white/52'
                  }`}>
                    {sessionPickerMode === 'campaign' ? '⚡ Structured' : '◉ LIVE'}
                  </span>
                </div>

                <div className="mt-1.5 line-clamp-1 text-[11px] text-white/55">
                  Goal: {session.userGoal || session.currentGoal || session.desiredOutcome || 'Not set'}
                </div>

                <div className="mt-0.5 line-clamp-1 text-[11px] text-white/38">
                  Last state: {session.lastKnownState || session.summary || 'No state captured yet'}
                </div>

                <div className="mt-1.5 text-[10px] text-neutral-500">
                  {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'Saved conversation'}
                </div>
              </button>

              <div className="absolute right-2 top-2 hidden md:flex items-center">
                {pendingDeleteSessionId === session.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteSession(session.id)
                      setPendingDeleteSessionId(null)
                      setToastMessage('Session deleted.')
                      setShowToast(true)
                    }}
                    className="rounded-full bg-red-400/[0.045] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-red-100/82 transition hover:bg-red-400/[0.08]"
                  >
                    CONFIRM
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteSessionId(session.id)
                    }}
                    className="rounded-full px-2 py-1 text-[14px] text-white/38 transition hover:bg-white/[0.022] hover:text-white/92"
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
  <div className="fixed bottom-[140px] left-0 right-0 z-[80] mx-auto w-[calc(100%-24px)] max-w-[600px] rounded-xl border border-white/[0.05] bg-black/82 px-5 py-4 backdrop-blur-xl">

    <div className="text-[11px] text-white/60 mb-2">
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

{liveMode && (showLiveQuickMenu || showLiveToolsMenu) && (
                <div className="pointer-events-none fixed inset-0 z-[71] bg-black/30" />
              )}

{liveMode && (() => {
                const isNegotiationStyle = resolvedLivePosture === 'negotiation'
                const isResponseStyle = resolvedLivePosture === 'response'

                return (
                <div
                  className={`fixed bottom-[72px] left-0 right-0 z-[72] mx-auto flex w-full max-w-[900px] px-2 md:w-[calc(100%-24px)] items-center overflow-visible rounded-[1.15rem] border px-2.5 py-1 backdrop-blur-xl transition-all duration-150 ease-out ${
                    isNegotiationStyle
                      ? 'border-[#7C8CFF]/16 bg-[rgba(8,10,18,0.82)] shadow-[0_-16px_42px_rgba(0,0,0,0.44)]'
                      : isResponseStyle
                        ? 'border-white/10 bg-[rgba(10,10,12,0.78)] shadow-[0_-14px_38px_rgba(0,0,0,0.38)]'
                        : 'border-[#7C8CFF]/10 bg-black/74 shadow-[0_-14px_38px_rgba(0,0,0,0.38)]'
                  }`}
                >
                  <div className="flex min-w-0 w-full items-center gap-2 overflow-visible py-0 text-white/76 text-[12px] [scrollbar-width:none]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLiveChooser(true)
                        setShowLiveToolsMenu(false)
                      }}
                      className="shrink-0 rounded-full bg-[#7C8CFF]/[0.055] px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#AEB6FF]/82 transition hover:bg-[#7C8CFF]/18"
                      aria-label="Open LIVE chooser"
                    >
                      ◉ LIVE
                    </button>

                    <div className="relative shrink-0">
                      
                    </div>

                    <span
                      title={voiceOn ? 'Audio guidance active' : 'Audio guidance off'}
                      className={`mx-1 shrink-0 h-2 w-2 rounded-full transition ${
                        voiceOn
                          ? 'bg-[#7C8CFF]/72 shadow-[0_0_8px_rgba(124,140,255,0.28)]'
                          : 'bg-[#7C8CFF]/55'
                      }`}
                    />

                    {(isThinking || isSpeaking) && (
                      <span className="shrink-0 text-[10px] text-white/24 tracking-[0.16em]">
                        {isThinking ? `GEORGE${'.'.repeat(thinkingDots)}` : 'VOICE'}
                      </span>
                    )}

                    {adaptiveCueLabel && (
                      <span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-amber-100">
                        {adaptiveCueLabel}
                      </span>
                    )}

                    <div className="hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceOn(false)
                        setInteractionMode('text')
                        setCampaigns((prev) =>
                          prev.map((c) =>
                            c.id === activeCampaignId
                              ? { ...c, deliveryMode: 'text' }
                              : c
                          )
                        )
                        window.localStorage.setItem('george_voice', 'off')
                        syncCampaignEnvironment(activeCampaignId, {
                          deliveryMode: 'text',
                          assistTone,
                        })
                        setToastMessage('Text guidance active.')
                        setShowToast(true)
                      }}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] transition ${
                        !voiceOn
                          ? 'border-[#7C8CFF]/35 bg-[#7C8CFF]/12 text-white shadow-[0_0_14px_rgba(124,140,255,0.12)]'
                          : 'border-transparent text-white/26 hover:bg-[#7C8CFF]/7 hover:text-white/62'
                      }`}
                    >
                      Text
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVoiceOn(true)
                        setInteractionMode('speech')
                        setCampaigns((prev) =>
                          prev.map((c) =>
                            c.id === activeCampaignId
                              ? { ...c, deliveryMode: 'audio' }
                              : c
                          )
                        )
                        window.localStorage.setItem('george_voice', 'on')
                        syncCampaignEnvironment(activeCampaignId, {
                          deliveryMode: 'audio',
                          assistTone,
                        })
                        setTimeout(() => startListening(), 120)
                        setToastMessage('Audio guidance active.')
                        setShowToast(true)
                      }}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] transition ${
                        voiceOn
                          ? 'border-[#7C8CFF]/35 bg-[#7C8CFF]/12 text-white shadow-[0_0_14px_rgba(124,140,255,0.12)]'
                          : 'border-transparent text-white/26 hover:bg-[#7C8CFF]/7 hover:text-white/62'
                      }`}
                    >
                      Audio
                    </button>

                    <>
                        <button
                          type="button"
                          onClick={activateNegotiationPosture}
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] transition ${
                            isNegotiationStyle
                              ? 'border-[#7C8CFF]/35 bg-[#7C8CFF]/12 text-white shadow-[0_0_14px_rgba(124,140,255,0.12)]'
                              : 'border-transparent text-white/26 hover:bg-[#7C8CFF]/7 hover:text-white/62'
                          }`}
                        >
                          Negotiate
                        </button>

                        <button
                          type="button"
                          onClick={activateResponsePosture}
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] transition ${
                            isResponseStyle
                              ? 'border-[#7C8CFF]/35 bg-[#7C8CFF]/12 text-white shadow-[0_0_14px_rgba(124,140,255,0.12)]'
                              : 'border-transparent text-white/26 hover:bg-[#7C8CFF]/7 hover:text-white/62'
                          }`}
                        >
                          Respond
                        </button>
                    </>

                    </div>

                    <div className="relative shrink-0">
                        {showLiveToolsMenu && (
                          <>
                            <button
                              type="button"
                              aria-label="Close LIVE tools"
                              onClick={() => setShowLiveToolsMenu(false)}
                              className="fixed inset-0 z-[91] cursor-default bg-transparent"
                            />

                            <div className="absolute bottom-full left-[-8px] z-[95] mb-1.5 w-[240px]">
                              <div className="overflow-hidden rounded-[1.05rem] border border-[#7C8CFF]/20 bg-[#11131A]/90 shadow-[0_16px_44px_rgba(0,0,0,0.56)] backdrop-blur-xl">

                                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                  <div className="text-[11px] tracking-[0.32em] text-[#8E96FF]">
                                    TOOLS
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setShowLiveToolsMenu(false)}
                                    className="text-white/72 transition hover:text-white"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="px-4 pb-4">

                                  <button
                                    type="button"
                                    onClick={() => {
                                      activateResponsePosture()
                                      setShowLiveToolsMenu(false)
                                    }}
                                    className="flex w-full items-start gap-3 border-b border-white/6 px-2 py-3 text-left transition hover:bg-white/[0.018]"
                                  >
                                    <div className="pt-[1px] text-[#8E96FF]">✎</div>
                                    <div>
                                      <div className="text-[15px] text-white/92">Reword</div>
                                      <div className="mt-0.5 text-[12px] text-white/38">
                                        Rewrite this for impact
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowLiveQuickMenu(true)
                                      setShowLiveToolsMenu(false)
                                    }}
                                    className="flex w-full items-start gap-3 border-b border-white/6 px-2 py-3 text-left transition hover:bg-white/[0.018]"
                                  >
                                    <div className="pt-[1px] text-[#8E96FF]">⚡</div>
                                    <div>
                                      <div className="text-[15px] text-white/92">Cue</div>
                                      <div className="mt-0.5 text-[12px] text-white/38">
                                        Get the next live cue
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={activateNegotiationPosture}
                                    className="flex w-full items-start gap-3 border-b border-white/6 px-2 py-3 text-left transition hover:bg-white/[0.018]"
                                  >
                                    <div className="pt-[1px] text-[#8E96FF]">◎</div>
                                    <div>
                                      <div className="text-[15px] text-white/92">Screener</div>
                                      <div className="mt-0.5 text-[12px] text-white/38">
                                        Handle gatekeepers
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAssistTone('firm')
                                      setShowLiveToolsMenu(false)
                                    }}
                                    className="flex w-full items-start gap-3 border-b border-white/6 px-2 py-3 text-left transition hover:bg-white/[0.018]"
                                  >
                                    <div className="pt-[1px] text-[#8E96FF]">≋</div>
                                    <div>
                                      <div className="text-[15px] text-white/92">Tone</div>
                                      <div className="mt-0.5 text-[12px] text-white/38">
                                        Adjust tone & style
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveSaveIndex(messages.length - 1)
                                      setShowLiveToolsMenu(false)
                                    }}
                                    className="flex w-full items-start gap-3 px-2 pt-3 pb-1 text-left transition hover:bg-white/[0.018]"
                                  >
                                    <div className="pt-[1px] text-[#8E96FF]">⌑</div>
                                    <div>
                                      <div className="text-[15px] text-white/92">Save</div>
                                      <div className="mt-0.5 text-[12px] text-white/38">
                                        Save to memory or folder
                                      </div>
                                    </div>
                                  </button>

                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowLiveToolsMenu((prev) => !prev)
                            setShowLiveQuickMenu(false)
                          }}
                          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] text-white/42 transition hover:bg-[#7C8CFF]/[0.055] hover:text-[#AEB6FF]/82"
                        >
                          Tools
                        </button>
                      </div>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSessionPickerClosing(false)
                          setSessionPickerMode('live')
                          setShowSessionPicker(true)
                        }}
                        className="shrink-0 rounded-full px-2 py-1 text-[10px] font-medium tracking-[0.16em] text-white/32 transition hover:bg-[#7C8CFF]/[0.055] hover:text-[#AEB6FF]/82"
                        aria-label="Open LIVE conversation memory"
                        title="Resume conversation continuity"
                      >
                        Resume
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          requestExitLiveMode()
                        }}
                        className="shrink-0 rounded-full bg-red-500/8 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-red-100/82 transition hover:bg-red-400/[0.045] hover:text-red-100/82"
                      >
                        EXIT
                      </button>
                    </div>
                  </div>
                </div>
                )
              })()}

              <div className="pointer-events-none fixed bottom-0 left-0 right-0 xl:left-[280px] z-[55] h-[88px] bg-[#0B0D12]" />
              <div className="pointer-events-none fixed bottom-[112px] left-0 right-0 xl:left-[280px] z-[55] h-[48px] bg-gradient-to-t from-[#0B0D12] to-transparent" />

              


{!liveMode && (isThinking || isSpeaking || bridgeThinking) && (
  <div className="fixed bottom-[96px] left-0 right-0 z-[140] flex justify-center pointer-events-none">
    <div className="text-[10px] text-white/24 tracking-[0.16em]">
      <span className="inline-flex items-center gap-[5px]">
        <span className="h-[3px] w-[3px] rounded-full bg-[#AEB6FF]/62 " />
        <span className="h-[3px] w-[3px] rounded-full bg-[#AEB6FF]/44 " />
        <span className="h-[3px] w-[3px] rounded-full bg-[#AEB6FF]/28 " />
      </span>
    </div>
  </div>
)}

<div className={`

${(showConversation || liveMode) ? 'fixed bottom-[6px]' : 'fixed top-[57%] md:top-[60%] -translate-y-1/2'} left-0 right-0 ${liveMode ? 'z-[80] border-t-0 bg-[#0F1117]/78 px-2 py-1 shadow-none' : 'z-[80] border-t border-transparent bg-[#0B0D12]/90 px-2 py-1.5 shadow-[0_-14px_38px_rgba(0,0,0,0.26)]'} flex items-center w-full max-w-[900px] mx-auto backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
                    <div className="relative flex-1 rounded-[0.95rem] border border-white/[0.045] bg-[#141821]/52 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl">

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
                        <div className="absolute left-4 bottom-full mb-2 flex max-w-[180px] gap-1.5 overflow-hidden rounded-xl border border-[#7C8CFF]/18 bg-[#11131A]/90 px-2 py-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                          <div className="relative h-10 w-10 shrink-0">
                            <img
                              src={pendingImage.dataUrl}
                              alt="Image preview"
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPendingImage(null)}
                              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-[10px] text-white/70 transition hover:text-white"
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
                        className="absolute left-2.5 top-1/2 z-[2] flex -translate-y-1/2 items-center justify-center rounded-full text-white/34 transition hover:text-white/78"
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
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder="Ask GEORGE"
                        rows={1}
                        onInput={autoResizeTextarea}
                        style={{ WebkitUserSelect: 'text', minHeight: '40px', maxHeight: '140px' }}
                        className="min-h-[44px] w-full resize-none rounded-[1rem] border-0 bg-transparent pl-11 pr-[84px] py-2.5 text-[15.5px] leading-[1.5] font-normal tracking-[0em] text-white/90 outline-none placeholder:text-white/22 focus:ring-0"
                      />

                      <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        {(currentTier === 'smart' || currentTier === 'intelligent' || currentTier === 'brilliant') && (
                          <>

                            <button
                              type="button"
                              onClick={() => {
                                if (!voiceSupported || isThinking) return

                                if (currentTier === 'smart' && smartMicUses >= SMART_MIC_LIMIT) {
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      role: 'assistant',
                                      content: 'Upgrade to continue — your upgrade helps put GEORGE into the hands of people who need this companion most.'
                                    }
                                  ])
                                  return
                                }

                                setInteractionMode('speech')
                                if (isListening) {
                                  stopListening()
                                  setInterimTranscript('')
                                } else {
                                  if (currentTier === 'smart') {
                                    setSmartMicUses((prev) => prev + 1)
                                  }
                                  startListening()
                                }
                              }}
                              disabled={!voiceSupported || isThinking}
                              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                                  currentTier === 'smart' && smartMicUses >= SMART_MIC_LIMIT
                                    ? 'text-amber-300'
                                    : 'text-white/52 hover:text-white/82'
                                } disabled:cursor-not-allowed disabled:opacity-40`}
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
                            console.log('[GEORGE arrow click]', { input, isThinking, activePromptContext })
                            handleSend()
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#7C8CFF]/22 bg-[#7C8CFF]/[0.055] text-[#C7D0FF] transition hover:bg-[#7C8CFF]/16 hover:text-white"
                          aria-label="Send"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5"/>
                            <path d="m5 12 7-7 7 7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                <div className="mt-1 min-h-[0.7rem] px-2 text-xs text-neutral-500">
                  {voiceError ? (
                    <span className="block w-full text-center text-neutral-500">{voiceError}</span>
                  ) : currentTier === 'smart' ? (
                    <span className="text-neutral-500"></span>
                  ) : (
                    <span className={isListening ? 'text-[#AEB6FF]/82' : ''}>
                      {isListening ? 'LIVE' : ''}
                    </span>
                  )}
                </div>

                {!liveMode && !input.trim() && !pendingImage && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setInput('Help me interpret this document and explain what matters most.')}
                        className="rounded-full border border-white/[0.06] bg-white/[0.018] px-3 py-1.5 text-white/46 transition hover:border-white/[0.12] hover:text-white"
                      >
                        📄 Interpret documents
                      </button>

                      <button
                        type="button"
                        onClick={() => setInput('Help me create an image.')}
                        className="rounded-full border border-white/[0.06] bg-white/[0.018] px-3 py-1.5 text-white/46 transition hover:border-white/[0.12] hover:text-white"
                      >
                        ◌ Create images
                      </button>

                      <button
                        type="button"
                        onClick={() => setInput('Help me build a business strategy.')}
                        className="rounded-full border border-white/[0.06] bg-white/[0.018] px-3 py-1.5 text-white/46 transition hover:border-white/[0.12] hover:text-white"
                      >
                        ⬢ Build a business
                      </button>
                    </div>

                    <div className="pointer-events-none text-[11px] tracking-[0.16em] text-white/26">
                      {currentTier === 'smart'
                        ? 'BE INTELLIGENT'
                        : currentTier === 'intelligent'
                          ? 'BE BRILLIANT'
                          : 'STAY BRILLIANT'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      
      {showWalkthrough && (
        <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 ">
          <div className="w-full max-w-sm rounded-[1.65rem] border border-[#7C8CFF]/28 bg-[#11131A]/90  p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[#7C8CFF] mb-2">Conversation Engine</p>

            {walkthroughStep === 1 && <p className="text-white text-sm leading-7">Focus menu sets the room. Choose negotiation, interview, speech, study, or everyday pressure.</p>}
            {walkthroughStep === 2 && <p className="text-white text-sm leading-7">Voice speed controls how fast GEORGE responds in your ear.</p>}
            {walkthroughStep === 3 && <p className="text-white text-sm leading-7">Mic button lets GEORGE listen while you stay in motion.</p>}
            {walkthroughStep === 4 && <p className="text-white text-sm leading-7">LIVE cues give fast lines, warnings, and framing in real time.</p>}

            <div className="mt-5">
              {walkthroughStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setWalkthroughStep((s) => s + 1)}
                  className="w-full rounded-[1rem] max-w-full bg-[#7C8CFF] px-5 py-4 text-sm font-medium text-black"
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
                  className="w-full rounded-[1rem] max-w-full bg-[#7C8CFF] px-5 py-4 text-sm font-medium text-black"
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
          className="fixed inset-0 z-[92] flex items-end justify-center bg-black/60 px-4 pb-4 backdrop-blur-sm"
          onClick={() => setShowPersonalizeModal(false)}
        >
          <div
            className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[1.65rem] border border-[#7C8CFF]/28 bg-[#11131A]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-white">Make GEORGE yours</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Optional. Same mind. Same standards. Choose GEORGE or GEORGette, then keep the name or make it yours.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">Voice</p>
                <div className="grid grid-cols-2 gap-2">
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
                      className={`rounded-[1rem] border transition hover:scale-[1.01] px-5 py-4 text-sm transition ${
                        voiceType === voice.value
                          ? 'border-[#7C8CFF]/60 bg-[#7C8CFF]/15 text-white'
                          : 'border-[#7C8CFF]/14 bg-black/35 text-neutral-500 hover:text-white'
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
                  placeholder="GEORGE"
                  className="w-full rounded-[1rem] max-w-full border border-[#7C8CFF]/16 bg-black/40 px-5 py-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#7C8CFF]/50"
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
                className="w-full rounded-[1rem] max-w-full bg-[#7C8CFF] px-5 py-4 text-sm font-medium text-black transition hover:opacity-55"
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
                className="w-full text-xs text-neutral-500 transition hover:text-white"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}


      {showUpgradeModal && typeof document !== 'undefined' && createPortal(
  <>
    <div
      role="button"
      tabIndex={0}
      aria-label="Close upgrade menu"
      onClick={() => setShowUpgradeModal(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          setShowUpgradeModal(false)
        }
      }}
      className="pointer-events-auto fixed inset-0 z-[200] bg-black/60 backdrop-blur-[16px]" />

    <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div
        className="pointer-events-auto w-full max-w-[400px] rounded-[1.65rem] border border-white/[0.045] bg-[#11131A]/92 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.54)] ring-1 ring-white/[0.04]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#C7D0FF]/78">
            GEORGE Continuity
          </p>

          <p className="mt-3 text-sm font-medium text-white">
            Restore continuity and LIVE runtime
          </p>

          <p className="mt-1 text-xs leading-6 text-neutral-500">
            Restore how GEORGE recognizes you, your tier, and your LIVE continuity.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1rem] border border-white/[0.045] bg-black/28 px-4 py-3">
            <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              Continuity identity
            </label>
            <ContinuityCapsule
              email={subscriberEmail}
              label="Recognized as"
              onClear={() => {
                setSubscriberEmail('')
                window.localStorage.removeItem('george_email')
                window.localStorage.removeItem('george_verified_continuity')
              }}
            />

            <ContinuityCapsule
              email={subscriberEmail}
              label="Recognized as"
              onClear={() => {
                setSubscriberEmail('')
                window.localStorage.removeItem('george_email')
                window.localStorage.removeItem('george_verified_continuity')
              }}
            />

            <input
              type="email"
              value={subscriberEmail}
              onChange={(event) => {
                const value = event.target.value.trim().toLowerCase()
                setSubscriberEmail(value)
                if (value) {
                  window.localStorage.setItem('george_email', value)
                } else {
                  window.localStorage.removeItem('george_email')
                }
              }}
              placeholder="you@example.com"
              className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-700"
            />
            <p className="mt-2 text-[11px] leading-5 text-neutral-500">
              Your continuity link restores your tier and LIVE access on this device.
            </p>

            <button
              type="button"
              onClick={async () => {
                const email = subscriberEmail.trim().toLowerCase()

                if (!email) {
                  setToastMessage('Enter your email first.')
                  setShowToast(true)
                  return
                }

                try {
                  const response = await fetch('/api/continuity/request-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    setToastMessage(data?.error || 'Unable to send continuity link.')
                    setShowToast(true)
                    return
                  }

                  setToastMessage('Continuity link sent.')
                  setShowToast(true)
                } catch {
                  setToastMessage('Unable to send continuity link.')
                  setShowToast(true)
                }
              }}
              className="mt-3 w-full rounded-full border border-[#7C8CFF]/20 bg-[#7C8CFF]/[0.045] px-4 py-2 text-[11px] font-medium tracking-[0.08em] text-[#C7D0FF] transition hover:bg-[#7C8CFF]/[0.12] hover:text-white"
            >
              Send continuity link
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tier: 'intelligent',
                    email: subscriberEmail || undefined,
                  }),
                })

                const data = await response.json()

                if (data?.url) {
                  if (data.url && data.url.startsWith('http')) {
                    window.location.href = data.url
                  } else {
                    router.replace(data.url)
                  }
                  return
                }

                setToastMessage(data?.error || 'Unable to open checkout.')
                setShowToast(true)
              } catch {
                setToastMessage('Unable to open checkout.')
                setShowToast(true)
              }
            }}
            className="block w-full rounded-[1rem] max-w-full border border-white/[0.045] bg-white/[0.02] px-4 py-3 text-left transition hover:border-[#7C8CFF]/24 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Intelligent</div>
                <div className="mt-1 text-xs leading-5 text-neutral-500">
                  Subscriber continuity and stronger execution support.
                </div>
              </div>

              <div className="text-[11px] font-medium text-[#C7D0FF]">
                $9.99
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tier: 'brilliant',
                    email: subscriberEmail || undefined,
                  }),
                })

                const data = await response.json()

                if (data?.url) {
                  if (data.url && data.url.startsWith('http')) {
                    window.location.href = data.url
                  } else {
                    router.replace(data.url)
                  }
                  return
                }

                setToastMessage(data?.error || 'Unable to open checkout.')
                setShowToast(true)
              } catch {
                setToastMessage('Unable to open checkout.')
                setShowToast(true)
              }
            }}
            className="block w-full rounded-[1rem] max-w-full border border-[#7C8CFF]/24 bg-[#7C8CFF]/8 px-4 py-3 text-left transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/12"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Brilliant</div>
                <div className="mt-1 text-xs leading-5 text-neutral-300">
                  LIVE conversational assistance and restored LIVE continuity.
                </div>
              </div>

              <div className="text-[11px] font-medium text-[#C7D0FF]">
                $25
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 border-t border-white/5 pt-4 space-y-3">
          <button
            type="button"
            onClick={redeemFounderCode}
            className="w-full rounded-full border border-white/[0.045] bg-white/[0.018] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 transition hover:border-[#7C8CFF]/35 hover:bg-[#7C8CFF]/[0.055] hover:text-white"
          >
            Enter Founder Code
          </button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="text-xs text-neutral-500 transition hover:text-white"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => window.open('/top-up','_blank')}
              className="text-xs text-[#7C8CFF] transition hover:opacity-80"
            >
              See full options
            </button>
          </div>
        </div>
      </div>
    </div>
  </>,
  document.body
)}

      {showCampaignUpgradeGate && (
        <div className="fixed inset-x-0 bottom-[96px] transition-all duration-150 ease-out z-[95] flex justify-center px-4">
          <div className="w-full max-w-[420px] rounded-[1.65rem] border border-white/[0.07] bg-[#0B0D12]/92 px-5 py-4 shadow-[0_20px_56px_rgba(0,0,0,0.42)] backdrop-blur-xl ">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#7C8CFF] mb-2">Structured LIVE</p>
                <p className="mt-0.5 text-[14px] font-semibold text-white mt-1 mb-2">This is a structured LIVE session.</p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-500">Structured LIVE continuity is being prepared.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCampaignUpgradeGate(false)}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-neutral-500 transition hover:border-white/25 hover:bg-white/[0.022] hover:text-white/92"
              >
                Close
              </button>
            </div>

            <div className="rounded-[1rem] border border-white/[0.05] bg-black/35 px-5 py-4 text-xs leading-6 text-neutral-300 shadow-inner shadow-black/30">
              <div className="font-medium text-white/80">Structured LIVE will let you:</div>
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
              className="mt-4 w-full rounded-[1.15rem] max-w-full border transition duration-150 hover:-translate-y-[1px] border-[#7C8CFF]/45 bg-[#7C8CFF]/16 px-5 py-4 text-sm font-semibold text-white shadow-[0_0_14px_rgba(124,140,255,0.08)] hover:border-[#7C8CFF]/80 hover:bg-[#7C8CFF]/22"
            >
              Upgrade to continue this campaign
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div className="rounded-full border border-white/[0.05] bg-white/[0.018]/95 px-4 py-1.5 text-sm text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {toastMessage}
          </div>
        </div>
      )}
      </main>

      <LiveChooser
        open={showLiveChooser}
        hasAccess={
          currentTier === 'intelligent' ||
          currentTier === 'brilliant'
        }
        hasLiveSession={
          !!getActiveSessionForMode('live')
        }
        onClose={() => setShowLiveChooser(false)}
        onStartLiveConversation={() => {
          setShowLiveChooser(false)
          startNewLiveConversation()
        }}
        onResumeLiveConversation={() => {
          setShowLiveChooser(false)
          resumeLiveConversation()
        }}
        onUpgrade={() => {
          setShowLiveChooser(false)
          router.push('/top-up')
        }}
        onEnterCode={() => {
          setShowLiveChooser(false)
          setShowUpgradeModal(true)
        }}
      />

    </>
  )
}
