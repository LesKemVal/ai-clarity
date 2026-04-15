'use client'

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

type Message = {
  role: 'assistant' | 'user'
  content: string
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

export default function Page() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Most of what people want, I can handle right here. If what we’re building is real, we’ll carry it properly.\n\nWhat are we working on?' },
  ])
  const [interimTranscript, setInterimTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const [interactionMode, setInteractionMode] = useState<'text' | 'speech'>('text')
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<Message | null>(null)
  const [activePromptLabel, setActivePromptLabel] = useState<string | null>(null)
  const [activePromptContext, setActivePromptContext] = useState<string | null>(null)
  const [contextTurnCount, setContextTurnCount] = useState(0)
  const [reroutePrompt, setReroutePrompt] = useState<PromptSelection | null>(null)
  const [rerouteSignal, setRerouteSignal] = useState(0)
  const [suggestedPrompts, setSuggestedPrompts] = useState<PromptSelection[]>([
  { label: 'Make money', text: 'I need to make money', context: 'money_start' },
  { label: 'Build something', text: 'I want to build something', context: 'build_start' },
  { label: 'Get unstuck', text: 'I am stuck and need the next move', context: 'unstuck_start' },
])
  const [suggestedSignal, setSuggestedSignal] = useState(0)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [thinkingDots, setThinkingDots] = useState(1)
  const [isIOS, setIsIOS] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [birthdayMD, setBirthdayMD] = useState('')
  const [showPromptMenu, setShowPromptMenu] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeSaveIndex, setActiveSaveIndex] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showRecentFolders, setShowRecentFolders] = useState(false)
  const [activeMemoryFolder, setActiveMemoryFolder] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [typedMessageIndex, setTypedMessageIndex] = useState<number | null>(null)
  const [typedMessageContent, setTypedMessageContent] = useState('')
  const [currentTier, setCurrentTier] = useState<'smart' | 'intelligent' | 'brilliant'>('smart')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)


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

  void fetch('/api/subscription-state')
    .then((res) => res.json())
    .then((data) => {
      const serverTier = data?.currentTier

      if (serverTier === 'intelligent' || serverTier === 'brilliant') {
        setCurrentTier(serverTier)
      } else {
        setCurrentTier('smart')
      }

      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    })
    .catch(() => {
      setCurrentTier('smart')

      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    })
}, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    void fetch('/api/subscription-state')
      .then((res) => res.json())
      .then((data) => {
        const serverTier = data?.currentTier

        if (serverTier === 'intelligent' || serverTier === 'brilliant') {
          setCurrentTier(serverTier)
        } else {
          setCurrentTier('smart')
        }

        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      })
      .catch(() => {
        setCurrentTier('smart')

        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
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

      setTypedMessageContent(fullText.slice(0, i))

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
  const bridgeSpeechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const bridgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesRef = useRef<Message[]>([
    { role: 'assistant', content: 'Most of what people want, I can handle right here. If what we’re building is real, we’ll carry it properly.\n\nWhat are we working on?' },
  ])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isThinking])

  useEffect(() => {
    const lastIndex = messages.length - 1
    const lastMessage = messages[lastIndex]

    if (!lastMessage || lastMessage.role !== 'assistant') {
      setTypedMessageIndex(null)
      setTypedMessageContent('')
      return
    }

    if (isThinking) return

    setTypedMessageIndex(lastIndex)
    setTypedMessageContent('')

    let i = 0
    const full = lastMessage.content
    const timer = window.setInterval(() => {
      i += 3
      const next = full.slice(0, i)
      setTypedMessageContent(next)
      if (i >= full.length) {
        window.clearInterval(timer)
      }
    }, 12)

    return () => window.clearInterval(timer)
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



  const availableFolders = useMemo(() => getExistingFolders(), [messages, activeSaveIndex])
  const recentFolders = useMemo(() => availableFolders.slice(0, 5), [availableFolders])

  const SpeechRecognitionCtor = useMemo(() => {
    if (typeof window === 'undefined') return null
    return window.SpeechRecognition || window.webkitSpeechRecognition || null
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return

      const insidePromptMenu = promptMenuRef.current?.contains(target) ?? false
      const insideSavePicker = savePickerRef.current?.contains(target) ?? false

      if (!insidePromptMenu) {
        // delay close so click on trigger doesn't instantly cancel
        setTimeout(() => {
          setShowPromptMenu(false)
          setShowRecentFolders(false)
          setActiveMemoryFolder(null)
        }, 120)
      }

      if (!insidePromptMenu && !insideSavePicker) {
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
    setIsIOS(/iPhone|iPad|iPod/i.test(window.navigator.userAgent))

    const storedName = window.localStorage.getItem('george_name') || ''
    const storedBirthdayMD = window.localStorage.getItem('george_birthday_md') || ''

    const storedVoice = window.localStorage.getItem('george_voice') || 'off'

    

    // LOAD FULL MODE STATE
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


    setProfileName(storedName)
    setBirthdayMD(storedBirthdayMD)

    if (storedVoice === 'on') {
      setInteractionMode('speech')
      setVoiceOn(true)
    } else {
      setInteractionMode('text')
      setVoiceOn(false)
    }

    const params = new URLSearchParams(window.location.search)
    const shared = params.get('shared')
    const prompt = params.get('prompt')
    const context = params.get('context')
    const label = params.get('label')

    if (shared) {
      setInput(shared)
      if (textareaRef.current) {
        textareaRef.current.value = shared
        // removed auto-focus to prevent mobile jump
      }
    }

    if (prompt) {
      setInput(prompt)
      if (textareaRef.current) {
        textareaRef.current.value = prompt
        // removed auto-focus to prevent mobile jump
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

    if (hour < 12) {
      return `Good morning${nameSuffix}. What can I do for you today?`
    }

    if (hour < 18) {
      return `Hi${nameSuffix}, what can I do for you right now?`
    }

    return `Good evening${nameSuffix}. I'm here with you.`
  }, [birthdayMD, profileName])


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
      .map((s) => s.trim())
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
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text }),
    })

    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      console.error('TTS failed:', res.status, msg)
      throw new Error(`TTS failed: ${res.status}`)
    }

    const buffer = await res.arrayBuffer()
    console.log('TTS buffer bytes:', buffer.byteLength)

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
    console.log('TTS data URL generated')

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
    async (text: string) => {
      console.log('speakText called', { text, isIOS, voiceOn })
      if (typeof window === 'undefined') return
      if (isIOS || !voiceOn || !hasUserInteractedRef.current) {
        console.log('speakText aborted', { isIOS, voiceOn })
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
        console.log('speech chunks', chunks)

        if (!chunks.length) {
          console.log('No speech chunks generated')
          return
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
    [interactionMode, isIOS, voiceOn]
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
    const prompts = []

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
        label: 'Make G. smarter',
        text: 'Take me to the level that lets you carry this properly.',
        context: 'upgrade_intelligent',
      })

      prompts.push({
        label: 'Top up',
        text: 'Show me the upgrade path for deeper support.',
        context: 'upgrade_topup',
      })

      return prompts.slice(0, 5)
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

    return prompts.slice(0, 5)
  }

  

  // DEV: ACTIVATE FULL MODE (2 HOURS)
  const activateFullMode = () => {
    const twoHours = 2 * 60 * 60 * 1000
    const end = Date.now() + twoHours

    setIsFullMode(true)
    setWindowEndsAt(end)
    window.localStorage.setItem('george_full_until', String(end))
  }


const handleSend = useCallback(
    async (overrideText?: string) => {
      const liveValue = textareaRef.current?.value ?? input
      const text = (overrideText ?? liveValue).trim()

      if (!text || isThinking) {
        setVoiceError(text ? '' : 'Type a message first.')
        return
      }

      hasUserInteractedRef.current = true

      await stopSpeech()
      stopListening()

      const userMessage: Message = {
        role: 'user',
        content: text,
      }

      const updatedMessages = [...messagesRef.current, userMessage]
      const nextSuggestedPrompts = getSuggestedPromptsFromMessages(updatedMessages, text).slice(0, 5)

      setSuggestedPrompts((prev) => {
        if (!samePromptSet(prev, nextSuggestedPrompts)) {
          setSuggestedSignal(Date.now())
        setRerouteSignal(Date.now())
          return nextSuggestedPrompts
        }
        return prev
      })

      

      setMessages(updatedMessages)
      messagesRef.current = updatedMessages
      setInput('')
      setInterimTranscript('')
      setVoiceError('')
      setIsThinking(true)
      startBridgeSpeech()

      if (textareaRef.current) {
        textareaRef.current.value = ''
      }

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            voiceMode: false,
            isFirstSession: updatedMessages.length <= 2,
            promptContext: activePromptContext,
            promptLabel: activePromptLabel,
            contextTurnCount,
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

        const assistantMessage: Message = {
          role: 'assistant',
          content: constrained
            ? `I’ll give you the lay of the land—but I won’t carry the full build or project.\n\n${data.message}\n\nThat takes more support than this level unlocks.`
            : data.message,
          constrained,
        }

        console.log('assistant reply received', assistantMessage.content)

        assistantRevealedRef.current = false

        setMessages((prev) => {
          const next = [...prev, assistantMessage]
          messagesRef.current = next
          return next
        })

        const newPrompts = generatePrompts(input, assistantMessage.content, messagesRef.current)
        setSuggestedPrompts(newPrompts)
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
      }
    },
    [input, isThinking, speakText, stopListening]
  )

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    setVoiceSupported(Boolean(SpeechRecognitionCtor) && !isIOS)
    if (!SpeechRecognitionCtor || isIOS) return

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setVoiceError('')
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = ''
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
            className="fixed inset-0 z-30 bg-black/50 xl:hidden"
          />
        )}

        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          voiceActive={voiceOn}
          reroutePrompt={reroutePrompt}
          rerouteSignal={rerouteSignal}
          suggestedPrompts={suggestedPrompts}
          suggestedSignal={suggestedSignal}
          activePromptLabel={activePromptLabel}
          onNewSession={() => {
            setMessages([{ role: 'assistant', content: 'Most of what people want, I can handle right here. If what we’re building is real, we’ll carry it properly.\n\nWhat are we working on?' }])
            messagesRef.current = [{ role: 'assistant', content: 'Most of what people want, I can handle right here. If what we’re building is real, we’ll carry it properly.\n\nWhat are we working on?' }]
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
            if (textareaRef.current) {
              textareaRef.current.value = ''
            }
          }}
          onPromptSelect={(prompt: PromptSelection) => {
            if (prompt.context === 'upgrade_intelligent' || prompt.context === 'upgrade_topup') {
              router.push('/top-up')
              return
            }

            setInput(prompt.text)
            setActivePromptLabel(prompt.label)
            setActivePromptContext(prompt.context)
            setContextTurnCount(0)
            setVoiceError('')

            if (prompt.context === 'strategy_recalculation') {
              setRerouteSignal(0)
            }

            if (textareaRef.current) {
              textareaRef.current.value = prompt.text
              // removed auto-focus to prevent mobile jump
            }
          }}
        />

        <div className="flex min-w-0 w-full flex-1 flex-col overflow-x-hidden">
          <div className="flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden px-4 pb-4 pt-5 md:h-screen md:px-6 md:pb-4 md:pt-16">
            <header className="hidden flex-none border-b border-neutral-800 pb-4 md:block">
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  GEORGE
                </h1>

                <div className="flex items-center gap-1.5 rounded-full border border-[#7C8CFF]/20 bg-black/70 px-2.5 py-1 backdrop-blur">
                  <span className={`h-2 w-2 rounded-full ${isFullMode ? "bg-[#7C8CFF]" : "bg-[#ff1a1a]"} branes-pulse-1`} />
                  <span className={`h-2 w-2 rounded-full ${isFullMode ? "bg-[#7C8CFF]" : "bg-[#ff1a1a]"} branes-pulse-2`} />
                  <span className={`h-2 w-2 rounded-full ${isFullMode ? "bg-[#7C8CFF]" : "bg-[#ff1a1a]"} branes-pulse-3`} />
                </div>
              </div>

              <p className="mt-1.5 text-neutral-400">{tagline}</p>

              </header>

            <div className="mt-5 hidden text-sm text-neutral-400 md:block">We can move step by step, or build something more strategic. Either way, we’ll get you there.</div>

            
<div className="flex-1 w-full overflow-y-auto px-2 pt-4 space-y-5">
  {messages.map((m, i) => (
    <div key={i} className="space-y-2">
      <div className="text-sm leading-7 text-white/90">
        {typedMessageIndex === i ? typedMessageContent : m.content}
      </div>

      {m.role === 'assistant' && (
        <div className="space-y-2">
          {m.constrained && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-6 rounded-full bg-red-500 animate-pulse" />
                <span className="h-1.5 w-6 rounded-full bg-red-500 animate-pulse" />
                <span className="h-1.5 w-6 rounded-full bg-red-500 animate-pulse" />
              </div>
              <span className="text-xs text-red-400">
                This requires deeper support.
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => {
                setActiveSaveIndex((prev) => (prev === i ? null : i))
                setShowRecentFolders(true)
                setActiveMemoryFolder(getDefaultFolder())
              }}
              className="inline-flex items-center gap-2 transition hover:text-white"
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
                    await navigator.share({ text: shareText })
                  } else if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareText)
                    setToastMessage('Copied to clipboard')
                    setShowToast(true)
                  }
                } catch {}
              }}
              className="transition hover:text-white"
            >
              Share
            </button>
          </div>

          {activeSaveIndex === i && (
            <div
              ref={savePickerRef}
              className="max-w-[360px] rounded-2xl border border-white/10 bg-neutral-950/95 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  Save memory
                </div>

                {showRecentFolders && recentFolders.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500">Recent folders</div>
                    <div className="flex flex-wrap gap-2">
                      {recentFolders.map((folder) => (
                        <button
                          key={folder}
                          type="button"
                          onClick={() => {
                            setActiveMemoryFolder(folder)
                            saveMemory(m, i, folder)
                          }}
                          className={`rounded-full border px-3 py-1 text-xs transition ${
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
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-neutral-400">
                    {getLatestSavedMemoryByFolder(activeMemoryFolder)}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">Create folder</div>
                  <div className="flex items-center gap-2">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder"
                      className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const folder = newFolderName.trim() || getDefaultFolder()
                        setActiveMemoryFolder(folder)
                        saveMemory(m, i, folder)
                      }}
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white transition hover:border-white/20"
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


            <div className="sticky bottom-0 z-40 w-full flex flex-col gap-2 px-2 pt-2 pb-2 bg-black/80 backdrop-blur-xl">
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivePromptLabel('Focus')
                    setActivePromptContext('focus_mode')
                    void handleSend('Help me focus on the main objective.')
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[10px] font-medium tracking-[0.1em] text-white/85 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/8"
                >
                  FOCUS
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/help')}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[10px] font-medium tracking-[0.1em] text-white/85 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/8"
                >
                  HELP
                </button>

                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-medium tracking-[0.1em] text-white/85 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/8"
                >
                  {currentTier === 'smart' ? 'MAKE G. SMARTER' : currentTier === 'intelligent' ? 'INTELLIGENT' : 'BRILLIANT'}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const shareText = 'Talk to George — clarity, direction, execution.'
                    try {
                      if (navigator.share) {
                        await navigator.share({ text: shareText, url: window.location.origin + '/george' })
                      } else if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(window.location.origin + '/george')
                        setToastMessage('GEORGE link copied')
                        setShowToast(true)
                      }
                    } catch {}
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[10px] font-medium tracking-[0.1em] text-white/85 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/8"
                >
                  SHARE G.
                </button>
              </div>

              <div className="flex items-center gap-2 w-full">
                <div ref={promptMenuRef} className="relative">
                  <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRecentFolders((prev) => !prev)
                            setActiveMemoryFolder(getDefaultFolder())
                          }}
                          className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
                          aria-label="Open memory folders"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
                          </svg>
                        </button>

                        {showRecentFolders && (
                          <div
                            ref={savePickerRef}
                            className="absolute bottom-[52px] left-0 z-50 w-[260px] rounded-xl border border-white/10 bg-neutral-950/95 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                          >
                            <div className="space-y-3">
                              <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                                Memory folders
                              </div>

                              {recentFolders.length > 0 ? (
                                <div className="space-y-2">
                                  {recentFolders.map((folder) => (
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

                                  <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
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
                                              textareaRef.current.value = textBlock
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
                                          <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="truncate">
                                              {item.preview || (item.content || '').slice(0, 80)}
                                            </span>
                                            {isLatest && (
                                              <span className="text-[10px] uppercase tracking-[0.14em] text-[#7C8CFF]">
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
                          onClick={() => setShowPromptMenu((prev) => !prev)}
                          className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
                          aria-label="Make a better move"
                        >
                          <span className="text-[34px] leading-none">+</span>
                          <span
                            className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full ${
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
                          <div className="absolute bottom-[52px] left-0 z-50 w-max max-w-[220px] rounded-xl border border-white/10 bg-neutral-950/95 px-2.5 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const scriptureText = 'Guide by scripture'
                                  setActivePromptLabel('Guide by scripture')
                                  setActivePromptContext('bible_decision_lens')
                                  setShowPromptMenu(false)
                                  void handleSend(scriptureText)
                                }}
                                className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
                              >
                                Guide by scripture
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  fileInputRef.current?.click()
                                  setShowPromptMenu(false)
                                }}
                                className="block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-white"
                              >
                                Upload file or image
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
                                  className={`block w-full py-1 text-left text-sm text-red-300 transition hover:text-red-200 ${rerouteSignal ? 'alert-dot-twice' : ''}`}
                                >
                                  {reroutePrompt.label}
                                </button>
                              )}

                              {suggestedPrompts.slice(0, 5).map((prompt) => (
                                <button
                                  key={prompt.label}
                                  type="button"
                                  onClick={() => {
                                    setActivePromptLabel(prompt.label)
                                    setActivePromptContext(prompt.context)
                                    setShowPromptMenu(false)
                                    void handleSend(prompt.text)
                                  }}
                                  className={`block w-full py-1 text-left text-sm transition ${activePromptLabel === prompt.label ? 'text-white' : 'text-neutral-300 hover:text-[#7C8CFF]'} ${suggestedSignal ? 'glow-twice' : ''}`}
                                >
                                  {prompt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative flex-1 rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          console.log('File selected:', file)
                        }}
                      />
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder=""
                        rows={1}
                        style={{ WebkitUserSelect: 'text' }}
                        className="min-h-[48px] w-full resize-none rounded-[1.6rem] border-0 bg-transparent px-2 py-2.5 pr-24 text-[17px] leading-7 font-medium tracking-[0.01em] text-white outline-none placeholder:text-white/60 focus:ring-0"
                      />

                      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (interactionMode === 'speech') {
                              setInteractionMode('text')
                              stopListening()
                              setInterimTranscript('')
                              return
                            }
                            if (!voiceSupported || isThinking) return
                            if (isListening) {
                              stopListening()
                            } else {
                              startListening()
                            }
                          }}
                          disabled={!voiceSupported || isThinking}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Use speech"
                        >
                          <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/>
                            <path d="M19 10a7 7 0 0 1-14 0"/>
                            <path d="M12 17v4"/>
                            <path d="M8 21h8"/>
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleSend()
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90 glow-soft glow-focus glow-press"
                          aria-label="Move"
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
                    <span className="text-red-400">{voiceError}</span>
                  ) : (
                    <span className={isListening ? 'text-[#7C8CFF]' : ''}>
                      {isListening ? 'Voice is listening…' : ''}
                    </span>
                  )}
              </div>
          </div>
        </div>
      </div>
    </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 px-4 pb-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <div className="mb-4">
              <p className="text-sm font-medium text-white">Take GEORGE further</p>
              <p className="mt-1 text-xs leading-6 text-neutral-400">
                Choose the level of support you want, or see full options.
              </p>
            </div>

            <div className="space-y-3">
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
                className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/8"
              >
                <div className="text-sm font-medium text-white">Intelligent GEORGE — $9.99</div>
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
                className="block w-full rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-left transition hover:border-[#7C8CFF]/50 hover:bg-[#7C8CFF]/14"
              >
                <div className="text-sm font-medium text-white">Brilliant GEORGE — $25</div>
                <div className="mt-1 text-xs leading-6 text-neutral-300">
                  Absorb complexity, refine judgment, and execute with precision under pressure.
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="text-xs text-neutral-500 transition hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => router.push('/top-up')}
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
