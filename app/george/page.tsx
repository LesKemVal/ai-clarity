'use client'


import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getSteering } from '@/lib/george/steering'
import { getGoalState } from '@/lib/george/goal-engine'
import { buildBrilliantLiveTriggerResponse, buildLiveGuidance, detectConversationProfile } from '@/lib/george/conversation-engine'

type Message = {
  role: 'assistant' | 'user' | 'system'
  content: string
  constrained?: boolean
  imageDataUrl?: string | null
}

type PromptSelection = {
  label: string
  text: string
  context: string
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

export default function Page() {
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

  const firstTimeGreeting = `${timeGreeting}
Whatever it is you want to do, just say so—right now.

I’ll map a step-by-step path for you from A to Z.

I’ll do most of the heavy lifting once you set the direction.

Ready?`

  const earlyUserGreeting = `${timeGreeting}
Whatever it is you want to do, just say so—right now.

I’ll map a step-by-step path for you from A to Z.

I’ll do most of the heavy lifting once you set the direction.

Ready?`

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
          setToastMessage('iPhone: Share → Edit Actions → Add to Home Screen')
          setShowToast(true)
        })
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {})
      }
      setToastMessage('iPhone: Share → Edit Actions → Add to Home Screen')
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
const [pendingImage, setPendingImage] = useState<{ dataUrl: string; name: string } | null>(null)
const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({})
const [feedbackPulse, setFeedbackPulse] = useState<Record<string, boolean>>({})
const [conversationMode, setConversationMode] = useState<string | null>(null)
const [showWalkthrough, setShowWalkthrough] = useState(false)
const [walkthroughStep, setWalkthroughStep] = useState(1)


  useEffect(() => {
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
    }, 260)

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
  const [contextTurnCount, setContextTurnCount] = useState(0)
  const [reroutePrompt, setReroutePrompt] = useState<PromptSelection | null>(null)
  const [rerouteSignal, setRerouteSignal] = useState(0)
  const [currentTier, setCurrentTier] = useState<'smart' | 'intelligent' | 'brilliant'>('smart')
  const tieredStarterPrompts = useMemo<PromptSelection[]>(() => {
    if (currentTier === 'brilliant') {
      return [
        {
          label: 'Fastest revenue',
          text: 'I need to make money as fast as legally and safely possible, and I want GEORGE to find the fastest path based on my real constraints.',
          context: 'money_fast_safe',
        },
        {
          label: 'Build with leverage',
          text: 'I want to build something with real leverage, and I want GEORGE to ask what matters first before choosing the strongest path.',
          context: 'build_start',
        },
        {
          label: 'Break the bottleneck',
          text: 'I am stuck, and I want GEORGE to identify the bottleneck, remove noise, and tell me the next decisive move.',
          context: 'unstuck_start',
        },
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
  const [suggestedSignal, setSuggestedSignal] = useState(0)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
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
  const [isIOS, setIsIOS] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [birthdayMD, setBirthdayMD] = useState('')
  const [showPromptMenu, setShowPromptMenu] = useState(false)
  const [showConversationMenu, setShowConversationMenu] = useState(false)
  const [conversationMenuLane, setConversationMenuLane] = useState<'selector' | 'personal' | 'professional'>('selector')
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeSaveIndex, setActiveSaveIndex] = useState<number | null>(null)
const [savePopupUpward, setSavePopupUpward] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [showRecentFolders, setShowRecentFolders] = useState(false)
  const [activeMemoryFolder, setActiveMemoryFolder] = useState<string | null>(null)
const [lastDomain, setLastDomain] = useState<string | null>(null)
  const [memoryVersion, setMemoryVersion] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
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
    if (messagesRef.current.length > 0) return

    const greeting = getInitialGreeting(profileName, currentTier)
    bumpVisitCount()
    const timer = window.setTimeout(() => {
      const firstMessage: Message[] = [{ role: 'assistant', content: greeting }]
      setMessages(firstMessage)
      messagesRef.current = firstMessage
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [profileName, currentTier])

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
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
    const tierParam = params.get('tier')
    const subStatus = params.get('subscription')
    const validTier = tierParam === 'smart' || tierParam === 'intelligent' || tierParam === 'brilliant'

    if (validTier) {
      setCurrentTier(tierParam)

      if (subStatus === 'success') {
        setToastMessage(`${tierParam.charAt(0).toUpperCase() + tierParam.slice(1)} is active.`)
        setShowToast(true)
        window.history.replaceState({}, '', window.location.pathname)
      }

      return
    }

    void fetch('/api/subscription-state')
      .then((res) => res.json())
      .then((data) => {
        const serverTier = data?.currentTier
        if (serverTier === 'intelligent' || serverTier === 'brilliant') {
          setCurrentTier(serverTier)
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




  const assistantRevealedRef = useRef(false)

  // CHATGPT-STYLE TYPING ENGINE
  useEffect(() => {
    if (!messages.length) return

    const lastIndex = messages.length - 1
    const lastMessage = messages[lastIndex]

    if (lastMessage.role !== 'assistant') return

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
  const messagesRef = useRef<Message[]>([
    { role: 'assistant', content: 'Hello, build something worth at least 10 or 100 X the cost of Brilliant tier.. and I know we’ll be fine.' },
  ])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
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
          .filter(Boolean)
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
      .filter((item) => (item.folder || '').trim() === folder.trim())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }

  const getLatestSavedMemoryByFolder = (folder: string) => {
    if (typeof window === 'undefined') return null

    const existing = JSON.parse(window.localStorage.getItem('GEORGE_MEMORY') || '[]') as Array<{
      content?: string
      role?: string
      folder?: string
      timestamp?: number
      savedPair?: boolean
      userPromptContent?: string | null
    }>

    const matches = existing
      .filter((item) => (item.folder || '').trim() === folder.trim())
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
    if (!showToast) return
    const timer = setTimeout(() => {
      setShowToast(false)
    }, 1600)
    return () => clearTimeout(timer)
  }, [showToast])

  useEffect(() => {
    if (!userPinnedBottomRef.current) return
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
        // delay close so click on trigger doesn't instantly cancel
        setTimeout(() => {
          setShowPromptMenu(false)
          setShowRecentFolders(false)
          setActiveMemoryFolder(null)
        }, 120)

        setActiveSaveIndex(null)
      }
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPromptMenu(false)
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
      body: JSON.stringify({ input: text, speed: voiceSpeed, tier: currentTier, voice: voiceType }),
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
          label: 'Simplify',
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
    async (overrideText?: string) => {
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

      const userMessage: Message = {
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
        userMessage
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

      // Brilliant conversation rhythm signal
      if (currentTier === 'brilliant') {
        const shortInput = text.length < 40
        const rapidTurn = Date.now() - signalTimestamp < 4000

        if (shortInput || rapidTurn) {
          setConversationSignal('Stay in rhythm — increase GEORGE’s speed')
          setSignalTimestamp(Date.now())
        }
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

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: firstResponseOverride
            ? [
                ...updatedMessages,
                {
                  role: 'system',
                  content: "You must respond with this exact guidance and tone. Do not generalize, soften, or replace it:\n\nI can be direct—even brash. Stay with me, and you can succeed.\n\n" + firstResponseOverride
                }
              ]
            : updatedMessages,
            voiceMode: false,
            isFirstSession: updatedMessages.length <= 2,
            promptContext: activePromptContext,
            promptLabel: activePromptLabel,
            contextTurnCount,
            tier: currentTier,
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

This takes more time and step-by-step work than this tier allows. Top up to continue.`
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

        if (activePromptContext?.startsWith('conversation_assist_')) {
          setTimeout(() => {
            startListening()
          }, 700)
        }
      }
  },
  [input, isThinking, speakText, stopListening, startListening, pendingImage, activePromptContext]
)

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
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
          ? 'Enhanced voice support is rolling out during beta.'
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

      if (finalTranscript.trim()) {
        const clean = finalTranscript.trim()
        setInterimTranscript('')
        void handleSend(clean)
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
        ? 'GEORGE is thinking...'
        : isListening
          ? 'GEORGE is listening...'
          : isIOS
            ? 'Voice is coming later on iPhone.'
            : voiceOn
              ? 'Voice is on.'
              : 'Voice is off.'

  const showConversation = messages.length > 1 || isThinking
  const showMobileHero = !showConversation

{showMobileHero && (
  <div className="flex flex-col items-center justify-center text-center pt-28 pb-10">

    <div className="text-[32px] font-semibold tracking-[0.25em] text-white">
      GEORGE
    </div>

    <div className="mt-2 text-[12px] tracking-[0.18em] text-neutral-400">
      Smart. Intelligent. Brilliant.
    </div>

    <div className="mt-4 flex items-center gap-1.5">
      <span className="h-1 w-1 rounded-full bg-[#7C8CFF] pulse-dot pulse-dot-1" />
      <span className="h-1 w-1 rounded-full bg-[#7C8CFF] pulse-dot pulse-dot-2" />
      <span className="h-1 w-1 rounded-full bg-[#7C8CFF] pulse-dot pulse-dot-3" />
    </div>

  </div>
)}

  useEffect(() => {
    if (showConversation) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [showConversation])


return (
    <main className="app-shell min-h-[100dvh] w-full overflow-x-hidden bg-black text-neutral-100">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden">
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-[40] bg-black/50 backdrop-blur-sm xl:hidden"
          />
        )}

        <Sidebar
          currentTier={currentTier}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          voiceActive={voiceOn}
          reroutePrompt={reroutePrompt}
          rerouteSignal={rerouteSignal}
          suggestedPrompts={suggestedPrompts}
          suggestedSignal={suggestedSignal}
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
              const existing = JSON.parse(window.localStorage.getItem('GEORGE_SESSIONS') || '[]')
              if (messagesRef.current.length > 1) {
                existing.unshift({
                  id: Date.now(),
                  createdAt: new Date().toISOString(),
                  messages: messagesRef.current
                })
                window.localStorage.setItem('GEORGE_SESSIONS', JSON.stringify(existing.slice(0, 25)))
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
                  { role: 'user', content: coursePrompt },
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
                  { role: 'user', content: prompt.text },
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
              void handleSend(prompt.text)
            }}
        />

        <div className="flex min-w-0 w-full flex-1 flex-col overflow-hidden">
          <div className="flex h-[100dvh] min-h-0 w-full flex-1 flex-col overflow-hidden px-4 pb-0 pt-[68px] md:h-screen md:px-8 md:pb-0 md:pt-[98px] xl:pl-[280px] xl:pr-12">
            <header className={`fixed top-0 left-0 right-0 xl:pl-[280px] flex justify-center border-b border-white/5 bg-black/96 backdrop-blur-xl px-4 py-2 ${showSidebar ? "z-10 md:z-50" : "z-50"}`}>
              <div className="relative flex w-full max-w-6xl items-center justify-between">
                <div className="flex items-center gap-1.5.5 xl:hidden">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(true)}
                    onTouchStart={() => setShowSidebar(true)}
                    onPointerDown={() => setShowSidebar(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black text-[#7C8CFF] shadow-[0_0_12px_rgba(124,140,255,0.14)] pointer-events-auto"
                    aria-label="Open menu"
                  >
                    <span className="flex flex-col items-center justify-center gap-[3px]">
                      <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                      <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                      <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                    </span>
                  </button>

                  <span className="text-[12px] font-medium uppercase tracking-[0.28em] text-white/28">
                    GEORGE
                  </span>
                </div>

                <div className="hidden xl:grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6">

                  <div />

                  <div className="flex justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/18">
                        GEORGE
                      </span>
                      {!showMobileHero && (
                        <div className="hidden xl:flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] pulse-dot-1" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] pulse-dot-2" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] pulse-dot-3" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] pulse-dot-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleInstallGeorge}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d7dcff] transition hover:border-[#7C8CFF]/60 hover:bg-[#7C8CFF]/16 hover:text-white"
                      aria-label="Share G."
                      title="Share G."
                    >
                      Share G.
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstallGeorge}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d7dcff] transition hover:border-[#7C8CFF]/60 hover:bg-[#7C8CFF]/16 hover:text-white xl:hidden"
                  aria-label="Share G."
                  title="Share G."
                >
                      Share G.
                    </button>
              </div>
            </header>

            
{conversationSignal && (
  <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#7C8CFF]/30 bg-[#0B0F1A]/90 px-4 py-2 text-xs text-[#7C8CFF] shadow-[0_0_20px_rgba(124,140,255,0.25)] backdrop-blur-xl animate-pulse">
    {conversationSignal}
  </div>
)}



{!showMobileHero && (
  <div className="fixed top-[72px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 md:hidden">
    <span className="h-1 w-1 rounded-full bg-[#7C8CFF] pulse-dot-1" />
    <span className="h-1 w-1 rounded-full bg-[#7C8CFF] pulse-dot-2" />
    <span className="h-1 w-1 rounded-full bg-[#7C8CFF] pulse-dot-3" />
  </div>
)}
<div
  ref={scrollHostRef}
  onScroll={(e) => {
    const el = e.currentTarget
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    userPinnedBottomRef.current = nearBottom
  }}
  className={`flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-3 pb-[220px] md:px-6 md:pb-[240px] space-y-5 ${showMobileHero ? "pt-5 md:pt-14" : "pt-1 md:pt-4"} `}>
  {showMobileHero && (
    <div className="flex min-h-[calc(100dvh-560px)] flex-col items-center justify-start px-4 pt-6 md:hidden">
      <div className="bg-gradient-to-r from-white via-[#d8dcff] to-[#7C8CFF] bg-clip-text text-center text-[30px] md:text-3xl font-semibold tracking-[0.12em] text-transparent">
        GEORGE
      </div>

      <div className="mt-2 text-center text-[12px] tracking-[0.22em] text-neutral-400">
        Smart. Intelligent. Brilliant.
      </div>

      <div className="mt-3 flex items-end justify-center gap-1.5 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] pulse-smile-1" />
        <span className="h-2 w-2 rounded-full bg-[#7C8CFF] pulse-smile-2" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#7C8CFF] pulse-smile-3" />
        <span className="h-2 w-2 rounded-full bg-[#7C8CFF] pulse-smile-4" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] pulse-smile-5" />
      </div>
    </div>
  )}

  {bridgeThinking && (
    <div className="text-sm leading-7 text-white/70">
      Thinking...
    </div>
  )}
  {messages
  .filter((m) => m.role !== 'system')
  .map((m, i) => (
    <div
      key={i}
      className={`space-y-1.5 flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`whitespace-pre-wrap text-[15px] md:text-[15.5px] leading-8 tracking-[0.01em] text-white/92 ${
          m.role === 'user' ? 'max-w-[78%] text-right rounded-[1.35rem] border border-white/6 bg-white/[0.03] px-4 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.18)]' : 'max-w-full text-left'
        }`}
      >
        {m.role === 'assistant' ? (
          <TypewriterText text={m.content} />
        ) : (
          <>
            {m.imageDataUrl && (
              <img
                src={m.imageDataUrl}
                alt="Uploaded image"
                className="mb-3 max-h-40 w-full rounded-2xl border border-white/10 object-cover"
              />
            )}

          </>
        )}
      </div>

      {m.role === 'assistant' && m.content.includes('How should GEORGE assist?') && (
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
              className="rounded-full border border-[#7C8CFF]/25 bg-[#7C8CFF]/10 px-3 py-2 text-xs text-white transition hover:border-[#7C8CFF]/50 hover:bg-[#7C8CFF]/15"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {m.role === 'assistant' && !m.content.includes('How should GEORGE assist?') && (
        <div className="relative space-y-2">
          {m.constrained && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 pl-1">
                <span className="h-1.5 w-6 rounded-full bg-[#7C8CFF] animate-pulse" />
                <span className="h-1.5 w-6 rounded-full bg-[#7C8CFF] animate-pulse" />
                <span className="h-1.5 w-6 rounded-full bg-[#7C8CFF] animate-pulse" />
              </div>
              <span className="text-xs text-[#7C8CFF]">
                This requires deeper support.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400">
            <button
              type="button"
              onClick={(event) => {
                const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
                const roomAbove = rect.top
                const roomBelow = window.innerHeight - rect.bottom
                setSavePopupUpward(roomAbove > 260 || roomAbove > roomBelow)
                setActiveSaveIndex((prev) => (prev === i ? null : i))
                setShowRecentFolders(true)
                setActiveMemoryFolder(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF]" />
              <span>Keep this</span>
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
                    setToastMessage('Copied to clipboard')
                    setShowToast(true)
                  }
                } catch {}
              }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              Share
            </button>

            <button
              type="button"
              onClick={() => {
                const prompt = "Show me related memory for this."
                setInput(prompt)
                void handleSend(prompt)
              }}
              className="rounded-full border border-[#7C8CFF]/20 bg-[#7C8CFF]/10 px-3 py-1.5 transition hover:border-[#7C8CFF]/40 hover:text-[#7C8CFF]"
            >
              Related
            </button>

            <button
              type="button"
              onClick={() => {
                const prompt = "Simplify your last response into plain language with only what matters most."
                setInput(prompt)
                void handleSend(prompt)
              }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 transition hover:border-white/20 hover:text-white"
            >
              Simplify
            </button>

            <button
              type="button"
              onClick={() => {
                handleFeedback(i, 'up')
                setToastMessage('Noted')
                setShowToast(true)
              }}
              className={`relative flex items-center justify-center transition duration-150 ${
                feedback[i] === 'up'
                  ? 'text-[#7C8CFF] drop-shadow-[0_0_10px_rgba(124,140,255,0.35)]'
                  : 'text-white/85 hover:text-white'
              } ${
                feedbackPulse[`${i}-up`]
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(124,140,255,0.55)]'
                  : 'scale-100'
              }`}
              aria-label="Thumbs up"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
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
                setToastMessage('Got it')
                setShowToast(true)
              }}
              className={`relative flex items-center justify-center transition duration-150 ${
                feedback[i] === 'down'
                  ? 'text-[#7C8CFF] drop-shadow-[0_0_10px_rgba(124,140,255,0.35)]'
                  : 'text-white/85 hover:text-white'
              } ${
                feedbackPulse[`${i}-down`]
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(124,140,255,0.55)]'
                  : 'scale-100'
              }`}
              aria-label="Thumbs down"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
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

          {activeSaveIndex === i && (
            <div
              ref={savePickerRef}
              className={`absolute left-0 z-30 w-[184px] max-w-[62vw] rounded-[16px] border border-white/10 bg-black/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl ${savePopupUpward ? 'bottom-full mb-2' : 'top-full mt-2'}` }
            >
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Save memory
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const folder = getDefaultFolder()
                    setActiveMemoryFolder(folder)
                    saveMemory(m, i, folder)
                  }}
                  className="w-full rounded-xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-2.5 py-2 text-[11px] leading-4 text-white transition hover:border-[#7C8CFF]/60 hover:bg-[#7C8CFF]/15"
                >
                  Save to {getDefaultFolder()}
                </button>

                {getExistingFolders().length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-neutral-500">Recent folders</div>
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
                              ? 'border-[#7C8CFF]/50 bg-[#7C8CFF]/10 text-white'
                              : 'border-white/10 text-neutral-300 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {folder}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeMemoryFolder && getLatestSavedMemoryByFolder(activeMemoryFolder) && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-1.5 text-[10px] leading-4 text-neutral-400 break-words">
                    {getLatestSavedMemoryByFolder(activeMemoryFolder)}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="text-[11px] text-neutral-500">Create folder</div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder"
                      className="w-full rounded-xl border border-white/10 bg-transparent px-2.5 py-2 text-[11px] leading-4 text-white outline-none placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const folder = newFolderName.trim() || getDefaultFolder()
                        setActiveMemoryFolder(folder)
                        saveMemory(m, i, folder)
                      }}
                      className="w-full rounded-xl border border-white/10 px-2.5 py-2 text-[11px] leading-4 text-white transition hover:border-white/20"
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
  ))}
  <div ref={messagesEndRef} />
</div>


            {liveMode && currentTier === 'brilliant' && stableLiveGuidance && (
              <div className="fixed bottom-[88px] left-0 right-0 z-50 flex justify-center px-2">
                <div className="w-full max-w-md rounded-[1.2rem] border border-[#7C8CFF]/30 bg-black/80 px-4 py-3 text-center shadow-[0_0_20px_rgba(124,140,255,0.25)] backdrop-blur-xl">
                  <div className="text-[14px] font-semibold tracking-[0.12em] text-[#7C8CFF]">
                    {stableLiveGuidance.signal}
                  </div>
                  <div className="mt-1 text-[13px] leading-5 text-white/92">
                    {stableLiveGuidance.say}
                  </div>
                </div>
              </div>
            )}

            <div className={`fixed bottom-0 left-0 right-0 w-full xl:pl-[280px] flex-col bg-black ${showSidebar ? "hidden md:flex" : "flex"} ${showSidebar ? "z-10 md:z-50" : "z-50"}`}>
              

              <div className="relative z-[60] mx-auto flex w-full max-w-5xl items-center justify-between px-4 pb-2">

  <div className="flex items-center gap-4 text-white/80 text-[13px]">
    <button
      type="button"
      onClick={() => {
        setActivePromptLabel('Focus')
        setActivePromptContext('focus_mode')
        setConversationSignal('FOCUS patched in')
        setMessages((prev) => {
          const next: Message[] = [
            ...prev,
            {
              role: 'assistant',
              content: 'FOCUS patched in. I’m sharper now. Continue.',
            },
          ]
          messagesRef.current = next
          return next
        })
      }}
      className="transition hover:text-white"
      aria-label="Focus"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    </button>

    <button
      type="button"
      onClick={() => window.open('/help','_blank')}
      className="transition hover:text-white"
    >
      Help
    </button>

    <button
      type="button"
      onClick={async () => {
        if (isSharingGeorgeLink) return

        const url = window.location.origin + '/george'

        try {
          setIsSharingGeorgeLink(true)

          if (navigator.share) {
            await navigator.share({ title: 'GEORGE by BRANESx', text: 'Want to get something done? GEORGE is your guide.', url })
          } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url)
            setToastMessage('GEORGE link copied')
            setShowToast(true)
          }
        } catch (error: any) {
          if (error?.name !== 'AbortError' && error?.name !== 'InvalidStateError') {
            setToastMessage('Unable to share right now')
            setShowToast(true)
          }
        } finally {
          setIsSharingGeorgeLink(false)
        }
      }}
      className="transition hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
        <circle cx="18" cy="5" r="2"/>
        <circle cx="6" cy="12" r="2"/>
        <circle cx="18" cy="19" r="2"/>
        <path d="M8 12l8-6M8 12l8 6"/>
      </svg>
    </button>

    <div ref={promptMenuRef} className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setShowRecentFolders((prev) => !prev)
          setActiveMemoryFolder(null)
        }}
        className="relative flex h-9 w-9 items-center justify-center text-white/85 transition hover:text-white"
        aria-label="Open memory folders"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
        </svg>
      </button>

      {(currentTier === 'smart' || currentTier === 'intelligent' || currentTier === 'brilliant') && (
        <button
          type="button"
          onClick={() => setLiveMode((prev) => !prev)}
          className={`flex h-9 items-center justify-center px-2 text-[12px] font-medium tracking-[0.12em] transition ${
            liveMode
              ? 'border border-[#7C8CFF]/40 bg-[#7C8CFF]/20 text-[#7C8CFF]'
              : 'text-white/80 hover:text-white'
          }`}
        >
          LIVE
        </button>
      )}

      {showRecentFolders && (
        <div
          ref={folderBrowserRef}
          className="absolute bottom-[52px] left-0 z-50 w-[320px] rounded-2xl border border-white/10 bg-neutral-950/95 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="space-y-3.5">
            <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
              Save memory
            </div>

            {getExistingFolders().length > 0 ? (
              <div className="space-y-2">
                {getExistingFolders().map((folder) => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => {
                      setActiveMemoryFolder(folder)
                    }}
                    className={`block w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      activeMemoryFolder === folder
                        ? 'border-[#7C8CFF]/50 bg-[#7C8CFF]/10 text-white'
                        : 'border-white/10 text-neutral-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                No saved folders yet
              </div>
            )}

            {activeMemoryFolder && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-neutral-500">
                  <span>{activeMemoryFolder}</span>
                  <button
                    type="button"
                    onClick={() => setActiveMemoryFolder(null)}
                    className="text-neutral-400 hover:text-white transition"
                  >
                    Back
                  </button>
                </div>

                <div className="max-h-[168px] space-y-2 overflow-y-auto pr-1">
                  {getMemoriesByFolder(activeMemoryFolder).map((item, idx) => {
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
                          setInput(textBlock)
                          if (textareaRef.current) {
                          }
                          setShowRecentFolders(false)
                          setActiveMemoryFolder(null)
                        }}
                        className={`block w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                          isLatest
                            ? 'border-[#7C8CFF]/40 bg-[#7C8CFF]/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-1.5">
                          <span className="truncate">
                            {item.preview || (item.content || '').slice(0, 80)}
                          </span>
                          {isLatest && (
                            <span className="text-[14px] uppercase tracking-[0.14em] text-[#7C8CFF]">
                              Latest
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
          setShowPromptMenu((prev) => !prev)
          setShowConversationMenu(false)
        }}
        className="relative flex h-9 w-9 items-center justify-center text-white/85 transition hover:text-white"
        aria-label="Make a better move"
      >
        <span className="text-[34px] leading-none">+</span>
        <span
          className={`absolute right-2 top-1 h-1.5 w-1.5 rounded-full ${
            reroutePrompt || suggestedPrompts.length > 0
              ? 'bg-[#7C8CFF]'
              : 'bg-white/85'
          } ${
            suggestedSignal || rerouteSignal
              ? 'ring-2 ring-[#7C8CFF]/60 shadow-[0_0_10px_#7C8CFF,0_0_20px_#7C8CFF] animate-pulse'
              : ''
          }`}
        />
      </button>

      {showPromptMenu && (
        <div className="absolute bottom-[52px] left-0 z-50 w-[170px] max-w-[48vw] rounded-xl border border-white/10 bg-neutral-950/95 px-2.5 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
                setToastMessage(nextVoice ? 'Voice replies on' : 'Voice replies off')
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
                  setToastMessage('Conversation Mode belongs to Brilliant.')
                  setShowToast(true)
                  return
                }
                setShowPromptMenu(false)
                setShowConversationMenu(true)
              }}
              className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
            >
              Conversation Mode ›
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
                className="block w-full py-1 text-left text-sm text-red-300 transition hover:text-red-200"
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
                  void handleSend(prompt.text)
                }}
                className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showConversationMenu && (
        <>
          <button
            type="button"
            aria-label="Close conversation modes"
            onClick={() => setShowConversationMenu(false)}
            className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[2px]"
          />
          <div className="absolute bottom-[52px] left-0 z-[80] w-[270px] rounded-2xl border border-[#7C8CFF]/30 bg-[radial-gradient(circle_at_top_left,rgba(124,140,255,0.16),transparent_38%),linear-gradient(180deg,rgba(18,18,22,0.97),rgba(6,6,9,0.99))] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_28px_rgba(124,140,255,0.14)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#D7DDFF]">Conversation Assistance</span>
            <button type="button" onClick={() => setShowConversationMenu(false)} className="text-white/45 transition hover:text-white">×</button>
          </div>
          <div className="space-y-2">
            {conversationMenuLane === 'selector' && (
              <>
                <button
                  type="button"
                  onClick={() => setConversationMenuLane('personal')}
                  className="block w-full rounded-xl border border-[#7C8CFF]/25 bg-white/[0.025] px-3 py-3 text-left text-sm text-neutral-200 transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/10 hover:text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">Personal</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-[#7C8CFF] animate-pulse"></span>
                      <span className="h-1 w-1 rounded-full bg-[#7C8CFF]/70 animate-pulse"></span>
                    </span>
                  </div>
                  <span className="mt-1 block text-[11px] text-white/55">
                    Everyday pressure, interviews, deals, and personal conversations.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setConversationMenuLane('professional')}
                  className="block w-full rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-3 text-left text-sm text-neutral-200 transition hover:border-[#22c55e]/45 hover:bg-[#22c55e]/15 hover:text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">Professional</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-[#22c55e] animate-pulse"></span>
                      <span className="h-1 w-1 rounded-full bg-[#22c55e]/70 animate-pulse"></span>
                    </span>
                  </div>
                  <span className="mt-1 block text-[11px] text-white/55">
                    Calls, appointments, donations, scripts, and firm outcomes.
                  </span>
                </button>
              </>
            )}

            {conversationMenuLane === 'personal' && (
              <div className="space-y-2">
                {[
                  ['Everyday Conversation Assistant', 'brilliant_everyday'],
                  ['Negotiation Assistant', 'brilliant_negotiation'],
                  ['Job Interview Assistant', 'brilliant_interview'],
                  ['Sales / Customer Service Assistant', 'brilliant_sales'],
                  ['Custom Setup', 'brilliant_custom'],
                ].map(([label, context]) => (
                  <button
                    key={context}
                    type="button"
                    onClick={() => {
                      setConversationMode(context)
                      setActivePromptContext(context)
                      setActivePromptLabel(label)
                      setShowConversationMenu(false)
                      setConversationMenuLane('selector')

                      const setupMessage = `${label} is active.

How should GEORGE assist?

Choose below, then tell me who you are speaking with and what outcome matters most.`

                      const assistantMessage: Message = {
                        role: 'assistant',
                        content: setupMessage,
                      }

                      setSuggestedPrompts([
                        {
                          label: 'Text Help',
                          text: 'Use Text Help. Give me short onscreen guidance for this conversation.',
                          context: `${context}_text`,
                        },
                        {
                          label: 'Audio Help',
                          text: 'Use Audio Help. Speak useful guidance when I need it.',
                          context: `${context}_audio`,
                        },
                        {
                          label: 'Stay Listening',
                          text: 'Stay Listening. Keep listening until I exit this conversation mode.',
                          context: `${context}_listening`,
                        },
                        {
                          label: 'Short Answers',
                          text: 'Use Short Answers. Keep guidance brief and usable in the moment.',
                          context: `${context}_short`,
                        },
                        {
                          label: 'Full Sentences',
                          text: 'Use Full Sentences. Give me exact lines I can say.',
                          context: `${context}_sentences`,
                        },
                        {
                          label: 'Probing Questions',
                          text: 'Use Probing Questions. Give me sharp questions that move the conversation forward.',
                          context: `${context}_questions`,
                        },
                        {
                          label: 'Silent Insight',
                          text: 'Use Silent Insight. Only alert me when leverage, tone, or risk shifts.',
                          context: `${context}_silent`,
                        },
                      ])

                      const nextMessages = [...messagesRef.current, assistantMessage]
                      setMessages(nextMessages)
                      messagesRef.current = nextMessages
                    }}
                    className="block w-full rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-left text-sm text-neutral-200 transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/10 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {conversationMenuLane === 'professional' && (
              <div className="space-y-2">
                {[
                  ['Appointment Setting Partner', 'professional_appointment_setting'],
                  ['Telemarketing Partner', 'professional_telemarketing'],
                  ['Fundraising / Donations Partner', 'professional_fundraising'],
                  ['Script Building Partner', 'professional_script_building'],
                  ['Custom Setup', 'professional_custom'],
                ].map(([label, context]) => (
                  <button
                    key={context}
                    type="button"
                    onClick={() => {
                      setConversationMode(context)
                      setActivePromptContext(context)
                      setActivePromptLabel(label)
                      setShowConversationMenu(false)
                      setConversationMenuLane('selector')

                      const setupMessage = `${label} is active.

GEORGE will help with live responses, scripts, objections, and outcome-focused conversation support.

Tell me the firm, campaign, audience, desired outcome, and any boundaries GEORGE must respect.`

                      const assistantMessage: Message = {
                        role: 'assistant',
                        content: setupMessage,
                      }

                      setSuggestedPrompts([
                        {
                          label: 'Text Help',
                          text: 'Use Text Help. Give me short onscreen guidance for this professional conversation.',
                          context: `${context}_text`,
                        },
                        {
                          label: 'Audio Help',
                          text: 'Use Audio Help. Speak useful guidance when I need it.',
                          context: `${context}_audio`,
                        },
                        {
                          label: 'Stay Listening',
                          text: 'Stay Listening. Keep listening until I exit this conversation mode.',
                          context: `${context}_listening`,
                        },
                        {
                          label: 'Short Answers',
                          text: 'Use Short Answers. Keep guidance brief and usable in the moment.',
                          context: `${context}_short`,
                        },
                        {
                          label: 'Full Sentences',
                          text: 'Use Full Sentences. Give me exact lines I can say.',
                          context: `${context}_sentences`,
                        },
                        {
                          label: 'Probing Questions',
                          text: 'Use Probing Questions. Give me sharp questions that move the conversation forward.',
                          context: `${context}_questions`,
                        },
                        {
                          label: 'Silent Insight',
                          text: 'Use Silent Insight. Only alert me when leverage, tone, or risk shifts.',
                          context: `${context}_silent`,
                        },
                      ])

                      const nextMessages = [...messagesRef.current, assistantMessage]
                      setMessages(nextMessages)
                      messagesRef.current = nextMessages
                    }}
                    className="block w-full rounded-xl border border-[#22c55e]/20 bg-white/[0.025] px-3 py-2.5 text-left text-sm text-neutral-200 transition hover:border-[#22c55e]/45 hover:bg-[#22c55e]/10 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </>
      )}

    </div>
  </div>

  <button
    type="button"
    onClick={() => {
      setShowUpgradeModal(true)
    }}
    className="rounded-full border border-[#7C8CFF]/40 bg-[#7C8CFF]/15 px-3 py-1.5 text-[12px] tracking-[0.12em]"
  >
    {currentTier === 'smart'
      ? 'GO INTELLIGENT'
      : currentTier === 'intelligent'
      ? 'GO BRILLIANT'
      : 'STAY BRILLIANT'}
  </button>

</div>

              <div className="sticky bottom-0 z-[60] flex items-center w-full border-t border-white/10 bg-black px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="relative flex-1 rounded-[1.8rem] border border-white/15 bg-white/[0.05] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">

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
                              setInput(`I uploaded text file: ${file.name}. Help me understand and use it.\n\n${clipped}`)
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

                          const starter = `I uploaded file: ${file.name}. Help me understand and use this file.`
                          setPendingImage(null)
                          setInput(starter)
                          setToastMessage(`${file.name} attached to composer.`)
                          setShowToast(true)
                          textareaRef.current?.focus()
                          e.currentTarget.value = ''
                        }}
                      />
                      {activePromptContext?.startsWith('conversation_assist_') && (
                        <div className="mb-2 rounded-2xl border border-[#7C8CFF]/20 bg-[#7C8CFF]/10 p-2">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-[0.16em] text-[#D7DDFF]">
                              {activePromptLabel || 'Conversation Assist'} Active
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                stopListening()
                                setVoiceOn(false)
                                setInteractionMode('text')
                                setActivePromptContext(null)
                                setActivePromptLabel(null)
                                window.localStorage.setItem('george_voice', 'off')
                              }}
                              className="text-[10px] uppercase tracking-[0.14em] text-white/45 transition hover:text-white"
                            >
                              Exit
                            </button>
                          </div>

                          <div className="flex gap-1.5 overflow-x-auto">
                            {[
                              ['Text Assist', false, 'Onscreen guidance'],
                              ['Audio Assist', true, 'Earbud / spoken help'],
                              ['Full Sentence', false, 'Exact words to say'],
                              ['Silent Insight', false, 'Later critique / key alerts only'],
                            ].map(([label, audio, hint]) => (
                              <button
                                key={String(label)}
                                type="button"
                                title={String(hint)}
                                aria-label={`${String(label)} — ${String(hint)}`}
                                onClick={() => {
                                  const labelText = String(label)
                                  const wantsAudio = Boolean(audio)
                                  setActivePromptLabel(labelText)
                                  setActivePromptContext(`conversation_assist_${labelText.toLowerCase().replace(/ /g, '_')}`)
                                  setVoiceOn(wantsAudio)
                                  setInteractionMode('speech')
                                  window.localStorage.setItem('george_voice', wantsAudio ? 'on' : 'off')
                                  setTimeout(() => startListening(), 120)
                                  setToastMessage(`${labelText} active`)
                                  setShowToast(true)
                                }}
                                className={`group relative shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] transition ${
                                  activePromptLabel === label
                                    ? 'border-[#7C8CFF]/60 bg-[#7C8CFF]/20 text-white'
                                    : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-[#7C8CFF]/25 bg-[#7C8CFF]/10 px-3 py-1.5 text-[10px] text-white shadow-[0_0_18px_rgba(124,140,255,0.12)] group-hover:block">
                                  {hint}
                                </span>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {pendingImage && (
                        <div className="mb-1.5 flex max-w-full gap-1.5 overflow-x-auto rounded-xl border border-white/8 bg-white/[0.03] px-2 py-1.5">
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

                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder="What are we working on?"
                        rows={1}
                        onInput={autoResizeTextarea}
                        style={{ WebkitUserSelect: 'text', minHeight: '44px', maxHeight: '180px' }}
                        className="min-h-[44px] w-full resize-none rounded-[1.6rem] border-0 bg-transparent pl-4 pr-[92px] py-2.5 text-[17px] leading-7 font-medium tracking-[0.01em] text-white outline-none placeholder:text-white/60 focus:ring-0"
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
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                  currentTier === 'smart' && smartMicUses >= SMART_MIC_LIMIT
                                    ? 'text-amber-300'
                                    : 'text-white/90 hover:text-white'
                                } disabled:cursor-not-allowed disabled:opacity-40`}
                              aria-label="Use speech"
                            >
                              <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90 glow-soft glow-focus glow-press"
                          aria-label="Send"
                        >
                          <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5"/>
                            <path d="m5 12 7-7 7 7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                <div className="mt-1.5 min-h-[1rem] px-2 text-xs text-neutral-500">
                  {voiceError ? (
                    <span className="block w-full text-center text-neutral-400">{voiceError}</span>
                  ) : currentTier === 'smart' ? (
                    <span className="text-neutral-600">Voice unlocks above Smart.</span>
                  ) : (
                    <span className={isListening ? 'text-[#7C8CFF] drop-shadow-[0_0_10px_rgba(124,140,255,0.35)]' : ''}>
                      {isListening ? 'Voice is listening…' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      
      {showWalkthrough && (
        <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-950 p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[#7C8CFF] mb-3">Conversation Engine</p>

            {walkthroughStep === 1 && <p className="text-white text-sm leading-7">Focus menu sets the room. Choose negotiation, interview, speech, study, or everyday pressure.</p>}
            {walkthroughStep === 2 && <p className="text-white text-sm leading-7">Voice speed controls how fast GEORGE responds in your ear.</p>}
            {walkthroughStep === 3 && <p className="text-white text-sm leading-7">Mic button lets GEORGE listen while you stay in motion.</p>}
            {walkthroughStep === 4 && <p className="text-white text-sm leading-7">LIVE cues give fast lines, warnings, and framing in real time.</p>}

            <div className="mt-5">
              {walkthroughStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setWalkthroughStep((s) => s + 1)}
                  className="w-full rounded-2xl bg-[#7C8CFF] px-4 py-3 text-sm font-medium text-black"
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
                  className="w-full rounded-2xl bg-[#7C8CFF] px-4 py-3 text-sm font-medium text-black"
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
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-neutral-950/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 text-center">
              <p className="text-sm font-medium text-white">Make GEORGE yours</p>
              <p className="mt-1 text-xs leading-6 text-neutral-400">
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
                      className={`rounded-2xl border px-4 py-3 text-sm transition ${
                        voiceType === voice.value
                          ? 'border-[#7C8CFF]/60 bg-[#7C8CFF]/15 text-white'
                          : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white'
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
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#7C8CFF]/50"
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
                className="w-full rounded-2xl bg-[#7C8CFF] px-4 py-3 text-sm font-medium text-black transition hover:opacity-90"
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

{showUpgradeModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 text-center">
              <p className="text-sm font-medium text-white">Take GEORGE further</p>
              <p className="mt-1 text-xs leading-6 text-neutral-400">
                Choose the level of support you want.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-left">
                <div className="text-sm font-medium text-white">Beta checkout instructions</div>
                <div className="mt-2 text-xs leading-6 text-neutral-300">
                  Intelligent currently uses Stripe test mode.<br />
                  Card: 4242 4242 4242 4242<br />
                  Use any future date, any 3-digit CVC, and any name or email you want.
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/subscribe', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ tier: 'intelligent' }),
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
                className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-[#7C8CFF]/35 hover:bg-[#7C8CFF]/10"
              >
                <div className="text-sm font-medium text-white">Explore Intelligent — Beta Test Checkout</div>
                <div className="mt-1 text-xs leading-6 text-neutral-400">
                  Structure your thinking, make faster decisions, and execute with clarity.
                </div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/subscribe', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ tier: 'brilliant' }),
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
                className="block w-full rounded-2xl border border-[#7C8CFF]/35 bg-[#7C8CFF]/10 px-4 py-3.5 text-left transition hover:border-[#7C8CFF] hover:bg-[#7C8CFF]/15"
              >
                <div className="text-sm font-medium text-white">Go Brilliant</div>
                <div className="mt-1 text-xs leading-6 text-neutral-300">
                  Conversation Engine, LIVE cues, room-awareness, premium execution support.
                </div>
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
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
      )}

      {showToast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div className="rounded-full border border-white/10 bg-neutral-950/95 px-4 py-2 text-sm text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {toastMessage}
          </div>
        </div>
      )}
</main>
  )
}
