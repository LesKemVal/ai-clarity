'use client'

import { formatDelivery } from '@/lib/george/live-voice/runtime/format-delivery'
import { useEffect, useRef, useState } from 'react'
import { georgeAudioQueue } from '@/lib/george/live-voice/runtime/queue'
import { georgeTurnManager } from '@/lib/george/live-voice/runtime/turn-manager'
import { transcriptBuffer } from '@/lib/george/live-voice/runtime/transcript-buffer'
import { partialTranscriptRuntime } from '@/lib/george/live-voice/runtime/partial-stream'
import { georgePrewarmCache } from '@/lib/george/live-voice/runtime/prewarm-cache'
import { georgeInterruptionEngine } from '@/lib/george/live-voice/runtime/interruption-engine'
import { georgeSilenceDetector } from '@/lib/george/live-voice/runtime/silence-detector'
import { finalTranscriptRuntime } from '@/lib/george/live-voice/runtime/final-stream'
import { georgeLatencyMetrics, type LatencySnapshot } from '@/lib/george/live-voice/runtime/latency-metrics'
import { LIVE_TEXT_SCENARIOS } from '@/lib/george/live-voice/runtime/text-scenarios'
import { DELIVERY_PROFILES, compressForDelivery, type DeliveryProfileId } from '@/lib/george/live-voice/runtime/delivery-profile'
import { georgeEmotionalVelocity } from '@/lib/george/live-voice/runtime/emotional-velocity'
import { LIVE_OBJECTIVES, inferObjectiveFromText, reinforceObjective, type LiveObjectiveId } from '@/lib/george/live-voice/runtime/objective-engine'
import { evaluateLiveSafety } from '@/lib/george/live-voice/runtime/safety-gate'
import { georgeLiveRuntimeState, type LiveRuntimeSnapshot } from '@/lib/george/live-voice/runtime/live-runtime-state'
import { georgePressureMemory } from '@/lib/george/live-voice/runtime/pressure-memory'
import { orchestrateLiveTurn } from '@/lib/george/live-voice/runtime/orchestrator'
import { georgeCancelEngine } from '@/lib/george/live-voice/runtime/cancel-engine'
import { georgeDeliverySessionManager } from '@/lib/george/live-voice/runtime/delivery-session-manager'
import { inferLiveSpeaker } from '@/lib/george/live-voice/runtime/room-analyzer'
import { inferSpeakerRole } from '@/lib/george/live-voice/runtime/speaker-role'
import { georgeRuntimeDecisionEngine } from '@/lib/george/live-voice/runtime/runtime-decision-engine'
import type { LiveRuntimeTier } from '@/lib/george/live-voice/runtime/tier-runtime'

type LiveLifecycleState =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'interrupted'
  | 'tearing_down'
  | 'failed'

type LivePacket = {
  speaker: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  shouldSpeak: boolean
  volley: string
  cue: string
  status: string
  confidence: number
  shadowUsed?: boolean
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  liveAssistMode?: 'cues' | 'lines'
  runtimeForce?: 'light' | 'balanced' | 'strong'
  runtimeMemoryApplied?: boolean
}

export default function LiveVoicePage() {

function isForceIntervention(text: string) {
  return /george|help me|what do i say|tell me what to say|say something|jump in|i need help/i.test(
    text.toLowerCase()
  )
}

  const [running, setRunning] = useState(false)
  const [liveLifecycle, setLiveLifecycle] = useState<LiveLifecycleState>('idle')
  const liveActive = liveLifecycle === 'connecting' || liveLifecycle === 'active'
  const [transcript, setTranscript] = useState('')
  const [packet, setPacket] = useState<LivePacket | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState('')
  const [shadowMap, setShadowMap] = useState('')
  const [latency, setLatency] = useState<LatencySnapshot>(georgeLatencyMetrics.get())
  const [deliveryProfileId, setDeliveryProfileId] = useState<DeliveryProfileId>('whisperer')
  const [objectiveId, setObjectiveId] = useState<LiveObjectiveId>('clarify')
  const [runtimeState, setRuntimeState] = useState<LiveRuntimeSnapshot>(georgeLiveRuntimeState.get())
  const [liveTier, setLiveTier] = useState<LiveRuntimeTier>('brilliant')


  const socketRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastGovernedRef = useRef('')
  const processingQueueRef = useRef(false)
  const wakeLockRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const stoppingRef = useRef(false)
  const intentionalStopRef = useRef(false)
  const reconnectEligibleRef = useRef(false)
  const reconnectEligibleUntilRef = useRef(0)
  const lastDisconnectReasonRef = useRef('')
  const liveSessionIdRef = useRef(0)
  const lastGovernAtRef = useRef(0)
  const liveRuntimeMemoryRef = useRef({
    acceptedCarryCount: 0,
    overrideCount: 0,
    hesitationCount: 0,
    preferredForce: 'balanced' as 'light' | 'balanced' | 'strong',
    toneCorrection: 'neutral' as 'softer' | 'firmer' | 'neutral',
  })


  function getAdaptiveDeliverable(text: string) {
    if (latency.totalMs > 2400) {
      return ''
    }

    const profile = DELIVERY_PROFILES[deliveryProfileId]
    const compressed = compressForDelivery(text, profile)

    if (latency.totalMs > 1400) {
      return compressed
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .join(' ')
    }

    return compressed
  }



  function triggerHaptic(pattern: number | number[]) {
    if (
      typeof window !== 'undefined' &&
      'vibrate' in navigator
    ) {
      navigator.vibrate(pattern)
    }
  }



  async function requestWakeLock() {
    try {
      if (
        typeof navigator !== 'undefined' &&
        'wakeLock' in navigator
      ) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        pushLog('Wake lock active.')
      }
    } catch {
      pushLog('Wake lock unavailable.')
    }
  }

  async function releaseWakeLock() {
    try {
      await wakeLockRef.current?.release?.()
      wakeLockRef.current = null
      pushLog('Wake lock released.')
    } catch {}
  }



  function stopGeorgeAudio(reason = 'Playback interrupted.') {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current.src = ''

    georgeTurnManager.markIdle()
    void georgeDeliverySessionManager.interrupt(reason)

    pushLog(reason)
  }


  async function processAudioQueue() {
    if (processingQueueRef.current) return

    processingQueueRef.current = true

    try {
      while (georgeAudioQueue.size() > 0) {
        const next = georgeAudioQueue.next()
        if (!next) continue

        if (
          georgeTurnManager.shouldSuppressStaleCue(next.createdAt)
        ) {
          pushLog('Dropped stale LIVE cue.')
          continue
        }

        await speak(next.text)
      }
    } finally {
      processingQueueRef.current = false
    }
  }


  function pushLog(line: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} — ${line}`, ...prev].slice(0, 12))
  }

  async function prewarm(text: string) {
    const clean = text.trim().toLowerCase()

    if (!clean) return

    const existing = georgePrewarmCache.get(clean)

    if (existing) {
      pushLog(`Prewarm cache hit: ${clean}`)
      return
    }

    const guessVolley =
      /id|license|registration|insurance/i.test(clean)
        ? 'Yes, officer. One moment.'
        : /raise|salary|compensation/i.test(clean)
          ? 'I wanted a direct conversation.'
          : 'Let me answer that clearly.'

    const guessCue =
      /officer|license|registration/i.test(clean)
        ? 'Slow movements.'
        : 'Stay composed.'

    georgePrewarmCache.set(
      clean,
      guessVolley,
      guessCue
    )

    pushLog(`Prewarmed: ${guessVolley}`)
  }


  useEffect(() => {
    try {
      const savedTier = window.localStorage.getItem('george_tier')

      if (savedTier === 'intelligent' || savedTier === 'brilliant') {
        setLiveTier(savedTier)
      }
    } catch {}
  }, [])


  async function govern(text: string, audio = false, transcriptAt = Date.now(), generation = georgeCancelEngine.current()) {

    const now = Date.now()

    if (
      liveTier === 'intelligent' &&
      now - lastGovernAtRef.current < 1100
    ) {
      pushLog('Intelligent cadence throttle engaged.')
      return
    }

    lastGovernAtRef.current = now


    const clean = text.trim()
    const governStart = Date.now()
    if (!clean || clean === lastGovernedRef.current) return

    lastGovernedRef.current = clean

    const res = await fetch('/api/george/live/govern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: clean,
        mode: 'voice_live',
        audio,
        shadowMap,
        lastFiveSeconds: clean,
        liveAssistMode:
          typeof window !== 'undefined' && window.localStorage.getItem('george_live_assist_mode') === 'lines'
            ? 'lines'
            : 'cues',
        runtimeMemory: liveRuntimeMemoryRef.current,
      }),
    })

    const nextPacket = await res.json()

    if (georgeCancelEngine.isExpired(generation)) {
      pushLog('Dropped stale LIVE response.')
      return
    }

    setLatency(
      georgeLatencyMetrics.update({
        transcriptToGovernMs: governStart - transcriptAt,
        governMs: Date.now() - governStart,
      })
    )

    setPacket(nextPacket)

    if (nextPacket?.shouldSpeak && (nextPacket?.volley || nextPacket?.cue)) {
      pushLog(`GEORGE: ${nextPacket.volley || nextPacket.cue}`)
    }

    return nextPacket as LivePacket
  }

  function isLiveDeliveryCurrent(sessionId: number, generation: number) {
    return (
      sessionId === liveSessionIdRef.current &&
      !georgeCancelEngine.isExpired(generation) &&
      !stoppingRef.current
    )
  }

  async function speak(text: string) {
    const deliverySessionId = liveSessionIdRef.current
    const deliveryGeneration = georgeCancelEngine.current()
    const deliveryProfile = DELIVERY_PROFILES[deliveryProfileId]
    const deliverable = getAdaptiveDeliverable(text)
    const formattedDelivery = formatDelivery(deliverable)

    if (!formattedDelivery.spokenText.trim()) {
      if (latency.totalMs > 2400) {
        pushLog('Latency too high. Using visual cues only.')
      } else {
        pushLog('Silent profile suppressed speech.')
      }
      return
    }

    if (latency.totalMs > 1400) {
      pushLog('Latency elevated. Compacting spoken cue.')
    }

    const ttsStart = Date.now()

    if (formattedDelivery.pauseMs > 0) {
      pushLog(`GEORGE holding ${formattedDelivery.pauseMs}ms before speaking.`)
      await new Promise((resolve) => window.setTimeout(resolve, formattedDelivery.pauseMs))

      if (!isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration)) {
        pushLog('Dropped stale LIVE delivery after hold.')
        return
      }
    }

    if (formattedDelivery.chuckle) {
      pushLog('Delivery cue: small chuckle before speaking.')
    }

    if (formattedDelivery.lowerTone) {
      pushLog('Delivery cue: lower tone.')
    }

    if (
      !isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration) ||
      georgeTurnManager.shouldInterruptGeorge()
    ) {
      pushLog('Speech interrupted by room activity.')
      return
    }

    georgeTurnManager.markGeorgeSpeaking()

    const res = await fetch('/api/george/live/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: formattedDelivery.spokenText }),
    })

    if (!isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration)) {
      georgeTurnManager.markIdle()
      pushLog('Dropped stale LIVE TTS response.')
      return
    }

    if (!res.ok) {
      pushLog('ElevenLabs unavailable. Falling back to browser voice.')

      if (
        isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration) &&
        'speechSynthesis' in window
      ) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(formattedDelivery.spokenText)
        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = deliveryProfile.volume
        window.speechSynthesis.speak(utterance)
      }

      georgeTurnManager.markIdle()
      return
    }

    const blob = await res.blob()

    if (!isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration)) {
      georgeTurnManager.markIdle()
      pushLog('Dropped stale LIVE audio blob.')
      return
    }

    setLatency((prev) =>
      georgeLatencyMetrics.update({
        ttsMs: Date.now() - ttsStart,
        totalMs:
          prev.transcriptToGovernMs +
          prev.governMs +
          (Date.now() - ttsStart),
      })
    )

    const url = URL.createObjectURL(blob)
    let audioUrlReleased = false
    const releaseAudioUrl = () => {
      if (audioUrlReleased) return
      URL.revokeObjectURL(url)
      audioUrlReleased = true
    }

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    if (
      !isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration) ||
      georgeTurnManager.shouldInterruptGeorge()
    ) {
      releaseAudioUrl()
      georgeTurnManager.markIdle()
      pushLog('Playback invalidated before audio start.')
      return
    }

    audioRef.current.src = url
    audioRef.current.volume = deliveryProfile.volume
    await audioRef.current.play().catch(() => {
      pushLog('Audio blocked until user interaction.')
    })

    const interruptionPoll = window.setInterval(() => {
      if (
        !isLiveDeliveryCurrent(deliverySessionId, deliveryGeneration) ||
        georgeTurnManager.shouldInterruptGeorge()
      ) {
        stopGeorgeAudio('LIVE playback interrupted by room activity.')
        releaseAudioUrl()
        window.clearInterval(interruptionPoll)
      }
    }, 120)

    audioRef.current.onended = () => {
      window.clearInterval(interruptionPoll)
      releaseAudioUrl()
      georgeTurnManager.markIdle()
    }
  }

  function isReconnectEligible(code?: number) {
    return (
      !intentionalStopRef.current &&
      (code === 1006 || code === 1011 || code === 1012 || code === 1013)
    )
  }

  function isReconnectStillValid() {
    return reconnectEligibleRef.current && Date.now() <= reconnectEligibleUntilRef.current
  }

  function teardownLiveSession(reason = 'Stopped.', intentional = true, finalState: LiveLifecycleState | null = null) {
    stoppingRef.current = true
    intentionalStopRef.current = intentional
    if (intentional) {
      reconnectEligibleRef.current = false
      reconnectEligibleUntilRef.current = 0
    }
    setLiveLifecycle('tearing_down')
    liveSessionIdRef.current += 1
    georgeCancelEngine.bump()
    georgeAudioQueue.clear()
    processingQueueRef.current = false
    stopGeorgeAudio('LIVE session teardown interrupted playback.')

    recorderRef.current?.stop()
    recorderRef.current = null

    try {
      audioProcessorRef.current?.disconnect()
      if (audioProcessorRef.current) {
        audioProcessorRef.current.onaudioprocess = null
      }
    } catch {}
    audioProcessorRef.current = null

    try {
      audioSourceRef.current?.disconnect()
    } catch {}
    audioSourceRef.current = null

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close()
    }
    audioContextRef.current = null

    if (
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    ) {
      socketRef.current.close()
    }
    socketRef.current = null

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    setRunning(false)
    setLiveLifecycle(finalState || (reason === 'Stopped.' || reason.includes('unmounted') ? 'idle' : 'failed'))
    void releaseWakeLock()
    pushLog(reason)
  }

  async function manualReconnect() {
    if (!isReconnectStillValid()) {
      pushLog('Reconnect window expired.')
      reconnectEligibleRef.current = false
      reconnectEligibleUntilRef.current = 0
      setLiveLifecycle('failed')
      return
    }

    const reconnectReason = lastDisconnectReasonRef.current || 'unknown disconnect'
    pushLog(`Manual reconnect requested after: ${reconnectReason}`)
    await start()
  }

  async function start() {
    if (liveActive || running || socketRef.current) {
      pushLog('LIVE session already active.')
      return
    }

    stoppingRef.current = false
    intentionalStopRef.current = false
    reconnectEligibleRef.current = false
    reconnectEligibleUntilRef.current = 0
    lastDisconnectReasonRef.current = ''
    setLiveLifecycle('connecting')
    setError('')
    setTranscript('')
    setPacket(null)
    lastGovernedRef.current = ''
    partialTranscriptRuntime.clear()
    finalTranscriptRuntime.clear()
    georgeLatencyMetrics.clear()
    georgeEmotionalVelocity.clear()
    georgePressureMemory.clear()
    setRuntimeState(georgeLiveRuntimeState.clear())
    setLatency(georgeLatencyMetrics.get())

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const socket = new WebSocket(
        process.env.NEXT_PUBLIC_LIVE_PROXY_WS || 'ws://localhost:8787/live'
      )

      const sessionId = liveSessionIdRef.current + 1
      liveSessionIdRef.current = sessionId
      socketRef.current = socket

      socket.onopen = () => {
        pushLog('GEORGE LIVE proxy socket opened.')
        setRunning(true)
        setLiveLifecycle('active')
        void requestWakeLock()

        const audioContext = new AudioContext({ sampleRate: 16000 })
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(4096, 1, 1)

        audioContextRef.current = audioContext
        audioSourceRef.current = source
        audioProcessorRef.current = processor

        source.connect(processor)
        processor.connect(audioContext.destination)

        pushLog('PCM capture active: linear16 @ 16kHz')

        processor.onaudioprocess = (event) => {
          if (stoppingRef.current || socket !== socketRef.current || socket.readyState !== WebSocket.OPEN) return

          const input = event.inputBuffer.getChannelData(0)
          const pcm = new Int16Array(input.length)

          for (let i = 0; i < input.length; i += 1) {
            const sample = Math.max(-1, Math.min(1, input[i]))
            pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
          }

          socket.send(pcm.buffer)
        }


      }

      socket.onmessage = async (message) => {
        if (sessionId !== liveSessionIdRef.current || socket !== socketRef.current) {
          pushLog('Ignored stale LIVE socket message.')
          return
        }

        let data: any = null

        try {
          data = JSON.parse(message.data)
        } catch {
          pushLog('Ignored malformed LIVE proxy message.')
          return
        }

        const messageReceivedAt = Date.now()

        if (sessionId !== liveSessionIdRef.current || socket !== socketRef.current) {
          pushLog('Ignored stale LIVE proxy payload.')
          return
        }

        if (data?.type === 'proxy_open') {
          pushLog('LIVE proxy acknowledged stream.')
          return
        }

        if (data?.type === 'proxy_error') {
          const proxyError = data?.error || 'Unknown LIVE proxy error.'
          setError(proxyError)
          pushLog(`LIVE proxy error: ${proxyError}`)
          return
        }

        if (data?.type === 'proxy_close') {
          const proxyClose = `LIVE proxy closed: ${data?.code || 'unknown'}${data?.reason ? ` — ${data.reason}` : ''}`
          setError(proxyClose)
          pushLog(proxyClose)
          return
        }

        const text = data?.channel?.alternatives?.[0]?.transcript || ''
        const isFinal = Boolean(data?.is_final)

        if (!text.trim()) return

        const partialSpeaker = inferLiveSpeaker(text, shadowMap)

        const partialChanged = partialTranscriptRuntime.update({
          text,
          receivedAt: Date.now(),
          speaker: partialSpeaker.speaker,
        })

        georgeSilenceDetector.markSpeech()

        if (!partialChanged && !isFinal) return

        georgeSilenceDetector.markSpeech()

        if (
          !isFinal &&
          partialTranscriptRuntime.shouldPrewarm(text)
        ) {
          pushLog(`Prewarming: ${text}`)
          await prewarm(text)
        }

        if (isFinal) {
          if (!finalTranscriptRuntime.shouldAccept(text)) {
            pushLog('Ignored duplicate final transcript.')
            return
          }

          setTranscript((prev) => `${prev} ${text}`.trim())

          partialTranscriptRuntime.markStable(text)
          pushLog(`Heard: ${text}`)

          const inferredSpeaker = inferLiveSpeaker(text, shadowMap)

          pushLog(`Speaker: ${inferredSpeaker.speaker} (${Math.round(inferredSpeaker.confidence * 100)}%)`)

          const interruptionDetected =
            georgeInterruptionEngine.detect({
              text,
              speaker: inferredSpeaker.speaker,
              timestamp: Date.now(),
            })

          if (interruptionDetected) {
            pushLog('Conversation interruption detected.')
          }

          const forcedIntervention =
            inferredSpeaker.speaker === 'user' &&
            isForceIntervention(text)

          if (forcedIntervention) {
            georgeAudioQueue.clear()

            pushLog('FORCE_INTERVENTION triggered.')
            pushLog('Force intervention cleared queued speech.')
          }

          if (inferredSpeaker.speaker === 'user') {
            georgeAudioQueue.clear()
            georgeCancelEngine.bump()

            stopGeorgeAudio('Yield protocol interrupted LIVE playback.')

            pushLog('Yield protocol: cleared LIVE audio queue.')
          }

          georgeTurnManager.update({
            transcript: text,
            isFinal,
            speaker: inferredSpeaker.speaker,
            timestamp: Date.now(),
          })

          const inferredRole = inferSpeakerRole(text, inferredSpeaker.speaker)

          transcriptBuffer.add({
            id: crypto.randomUUID(),
            text,
            speaker: inferredSpeaker.speaker,
            role: inferredRole.role,
            roleConfidence: inferredRole.confidence,
            createdAt: Date.now(),
          })

          pushLog(`Speaker role: ${inferredRole.role} (${Math.round(inferredRole.confidence * 100)}%)`)

          setShadowMap(transcriptBuffer.buildShadowMap())

          const cachedPrewarm = georgePrewarmCache.get(
            text.trim().toLowerCase()
          )

          const safety = evaluateLiveSafety(text)

          if (!safety.allowed) {
            pushLog(`Safety gate: ${safety.reason}`)

            setPacket({
              speaker: 'george_instruction',
              shouldSpeak: false,
              volley: '',
              cue: '',
              status: safety.reason,
              confidence: 0,
            })

            return
          }

          const inferredObjective = inferObjectiveFromText(text)

          if (objectiveId === 'clarify' && inferredObjective !== 'clarify') {
            setObjectiveId(inferredObjective)
            pushLog(`Objective: ${LIVE_OBJECTIVES[inferredObjective].label}`)
          }

          const activeObjective =
            LIVE_OBJECTIVES[
              objectiveId === 'clarify'
                ? inferredObjective
                : objectiveId
            ]

          const generation = georgeCancelEngine.bump()
          const nextPacket = await govern(text, true, messageReceivedAt, generation)

          if (georgeCancelEngine.isExpired(generation)) {
            pushLog('Skipped stale LIVE orchestration.')
            return
          }

          const usedPrewarm =
            Boolean(cachedPrewarm) &&
            Boolean(nextPacket) &&
            nextPacket?.speaker === 'other_party'

          if (
            cachedPrewarm &&
            nextPacket &&
            nextPacket.speaker === 'other_party'
          ) {
            nextPacket.volley = cachedPrewarm.volley
            nextPacket.cue = cachedPrewarm.cue
            nextPacket.status = 'Used prewarmed next move.'
            pushLog(`Using prewarm cache.`)
          }

          const orchestrated = nextPacket
            ? orchestrateLiveTurn({
                text,
                packet: nextPacket,
                activeObjective,
                deliveryProfileId,
                usedPrewarm,
                tier: liveTier,
              })
            : null

          let shouldHoldByRuntime = true
          let shouldQueueByRuntime = false
          let runtimeDecisionReason = 'No runtime decision available.'

          if (orchestrated) {
            if (georgeCancelEngine.isExpired(generation)) {
              pushLog('Skipped stale LIVE packet commit.')
              return
            }

            setRuntimeState(orchestrated.runtimeSnapshot)
            setPacket({ ...orchestrated.packet })

            const runtimeDecision = georgeRuntimeDecisionEngine.decide()
            shouldHoldByRuntime =
              runtimeDecision.decision === 'hold' ||
              runtimeDecision.decision === 'yield' ||
              runtimeDecision.decision === 'suppress'
            shouldQueueByRuntime =
              runtimeDecision.decision === 'speak' ||
              runtimeDecision.decision === 'whisper' ||
              runtimeDecision.decision === 'interrupt' ||
              runtimeDecision.decision === 'queue'
            runtimeDecisionReason = runtimeDecision.reason

            pushLog(`Runtime decision: ${runtimeDecision.decision} (${Math.round(runtimeDecision.confidence * 100)}%)`)

            if (
              orchestrated.runtimeSnapshot.interventionUrgency === 'high'
            ) {
              triggerHaptic([120, 80, 120])
            } else if (
              (orchestrated.runtimeSnapshot.escalationLikelihood || 0) > 0.72
            ) {
              triggerHaptic([90, 60, 90])
            } else if (
              orchestrated.packet.shouldSpeak &&
              !shouldHoldByRuntime
            ) {
              triggerHaptic(40)
            }

            pushLog(`Runtime: ${orchestrated.runtimeSnapshot.trajectory} / ${orchestrated.runtimeSnapshot.posture} / ${orchestrated.runtimeSnapshot.load}`)
            pushLog(`Objective anchor: ${activeObjective.anchor}`)

            if (
              liveTier === 'brilliant' &&
              orchestrated.runtimeSnapshot.interventionUrgency === 'high'
            ) {
              shouldHoldByRuntime = false
              pushLog('Brilliant escalation override bypassed runtime hold state.')
            }

            if (shouldHoldByRuntime) {
              pushLog(`Hold: ${runtimeDecisionReason}`)
            }
          }

          if (
            !georgeCancelEngine.isExpired(generation) &&
            orchestrated?.packet.shouldSpeak &&
            orchestrated.queueText &&
            (
              forcedIntervention ||
              shouldQueueByRuntime
            ) &&
            (
              forcedIntervention ||
              shouldQueueByRuntime
            ) &&
            georgeSilenceDetector.isSilenceWindow()
          ) {
            const approvedPacket = orchestrated.packet as LivePacket
            const approvedSpeech =
              approvedPacket.liveAssistMode === 'lines'
                ? approvedPacket.volley
                : approvedPacket.cue

            if (!approvedSpeech?.trim()) {
              pushLog('No approved LIVE audio channel to speak.')
              return
            }

            liveRuntimeMemoryRef.current.acceptedCarryCount += 1
            if (
              liveRuntimeMemoryRef.current.acceptedCarryCount >= 3 &&
              liveRuntimeMemoryRef.current.overrideCount < 2
            ) {
              liveRuntimeMemoryRef.current.preferredForce = 'strong'
            }

            georgeAudioQueue.enqueue(
              approvedSpeech,
              forcedIntervention
                ? 40
                : (
                    (
                      orchestrated.packet.speaker === 'other_party'
                        ? (
                            liveTier === 'brilliant'
                              ? 10
                              : 4
                          )
                        : 1
                    ) +
                    (
                      liveTier === 'brilliant'
                        ? georgeInterruptionEngine.getPriorityBoost()
                        : 0
                    )
                  ),
              orchestrated.packet.roomPressure === 'authority'
                ? 3500
                : orchestrated.packet.interruptionRisk && orchestrated.packet.interruptionRisk > 0.7
                  ? 1200
                  : 2200
            )

            await processAudioQueue()
          } else {
            if (
              !forcedIntervention &&
              !georgeSilenceDetector.isSilenceWindow()
            ) {
              pushLog('Waiting for silence window.')
            } else {
              pushLog(`Speech suppressed by runtime decision: ${runtimeDecisionReason}`)
            }
          }
        }
      }

      socket.onerror = (event) => {
        console.error('Deepgram socket error event:', event)
        setError('Deepgram socket error. Check browser console for websocket details.')
        pushLog('Deepgram socket error.')
      }

      socket.onclose = (event) => {
        const reason = `Deepgram socket closed: code ${event.code}${event.reason ? ` — ${event.reason}` : ''}`

        console.warn(reason, event)

        if (intentionalStopRef.current) {
          pushLog('LIVE session closed intentionally.')
          return
        }

        if (isReconnectEligible(event.code)) {
          reconnectEligibleRef.current = true
          reconnectEligibleUntilRef.current = Date.now() + 8000
          lastDisconnectReasonRef.current = reason
          setError(reason)
          teardownLiveSession(reason, false, 'interrupted')
          pushLog('LIVE transport interrupted. Reconnect eligible.')
          return
        }

        if (!stoppingRef.current) {
          setError(reason)
          teardownLiveSession(reason, false)
        }
      }
    } catch (err) {
      setError('Mic start failed. Check browser mic permission.')
      pushLog('Mic start failed.')
      teardownLiveSession('Mic start failed.', false)
    }
  }

  function stop() {
    teardownLiveSession('Stopped.')
  }

  useEffect(() => {
    return () => {
      teardownLiveSession('LIVE diagnostic unmounted.')
    }
  }, [])

  async function testText(value: string) {
    setTranscript(value)

    const safety = evaluateLiveSafety(value)

    if (!safety.allowed) {
      pushLog(`Safety gate: ${safety.reason}`)
      return
    }

    const nextPacket = await govern(value, false)

    if (nextPacket?.volley) {
      pushLog(`Test packet: ${nextPacket.volley}`)
    }
  }

  async function runScenario(lines: string[]) {
    setTranscript('')
    setPacket(null)
    transcriptBuffer.clear()
    partialTranscriptRuntime.clear()
    finalTranscriptRuntime.clear()
    georgeLatencyMetrics.clear()
    georgeEmotionalVelocity.clear()
    georgePressureMemory.clear()
    setRuntimeState(georgeLiveRuntimeState.clear())
    setLatency(georgeLatencyMetrics.get())
    setShadowMap('')
    lastGovernedRef.current = ''

    for (const line of lines) {
      const receivedAt = Date.now()

      pushLog(`Scenario input: ${line}`)

      setTranscript((prev) =>
        `${prev}\n${line}`.trim()
      )

      const inferredSpeaker = inferLiveSpeaker(line, transcriptBuffer.buildShadowMap())

      pushLog(`Scenario speaker: ${inferredSpeaker.speaker} (${Math.round(inferredSpeaker.confidence * 100)}%)`)

      georgeTurnManager.update({
        transcript: line,
        isFinal: true,
        speaker: inferredSpeaker.speaker,
        timestamp: receivedAt,
      })

      const inferredRole = inferSpeakerRole(line, inferredSpeaker.speaker)

      transcriptBuffer.add({
        id: crypto.randomUUID(),
        text: line,
        speaker: inferredSpeaker.speaker,
        role: inferredRole.role,
        roleConfidence: inferredRole.confidence,
        createdAt: receivedAt,
      })

      pushLog(`Scenario role: ${inferredRole.role} (${Math.round(inferredRole.confidence * 100)}%)`)

      const nextShadowMap = transcriptBuffer.buildShadowMap()
      setShadowMap(nextShadowMap)

      const inferredObjective = inferObjectiveFromText(line)

      if (objectiveId === 'clarify' && inferredObjective !== 'clarify') {
        setObjectiveId(inferredObjective)
        pushLog(`Objective: ${LIVE_OBJECTIVES[inferredObjective].label}`)
      }

      const nextPacket = await govern(line, false, receivedAt)

      if (nextPacket?.volley) {
        pushLog(`Scenario output: ${nextPacket.volley}`)
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 650)
      )
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/35">BRANESx / GEORGE · INTERNAL</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">LIVE Runtime Diagnostic</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Internal diagnostic surface for mic capture, transcript interpretation, LIVE governor behavior, and earbud playback. This is not the user-facing LIVE experience.
          </p>
        </div>

        <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.035] p-5 shadow-2xl">
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.values(LIVE_OBJECTIVES)).map((objective) => (
              <button
                key={objective.id}
                type="button"
                onClick={() => {
                  setObjectiveId(objective.id)
                  pushLog(`Objective: ${objective.label}`)
                }}
                className={`rounded-[1rem] border px-4 py-2 text-xs transition ${
                  objectiveId === objective.id
                    ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-50'
                    : 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {objective.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.values(DELIVERY_PROFILES)).map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setDeliveryProfileId(profile.id)
                  pushLog(`Delivery profile: ${profile.label}`)
                }}
                className={`rounded-[1rem] border px-4 py-2 text-xs transition ${
                  deliveryProfileId === profile.id
                    ? 'border-purple-300/40 bg-purple-300/15 text-purple-50'
                    : 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {profile.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {!liveActive ? (
              <>
                <button
                  type="button"
                  onClick={start}
                  className="rounded-[1rem] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
                >
                  Start LIVE mic
                </button>

                {isReconnectStillValid() ? (
                  <button
                    type="button"
                    onClick={manualReconnect}
                    className="rounded-[1rem] border border-amber-300/25 bg-amber-300/[0.08] px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/[0.14]"
                  >
                    Reconnect LIVE
                  </button>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="rounded-[1rem] border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Stop
              </button>
            )}

            <button
              type="button"
              onClick={() => testText('do you have an ID?')}
              className="rounded-[1rem] border border-white/[0.05] px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
            >
              Test: ID question
            </button>

            <button
              type="button"
              onClick={() => testText("sir, let's discuss a raise")}
              className="rounded-[1rem] border border-white/[0.05] px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
            >
              Test: raise opener
            </button>

            {LIVE_TEXT_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => runScenario(scenario.transcript)}
                className="rounded-[1rem] border border-cyan-400/15 bg-cyan-400/[0.04] px-5 py-3 text-sm text-cyan-100/75 transition hover:bg-cyan-400/[0.12]"
              >
                Scenario: {scenario.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-[1rem] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}
        </div>

        <section className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">Transcript</p>
          <p className="mt-3 min-h-20 whitespace-pre-wrap text-lg leading-8 text-white/80">
            {transcript || 'No transcript yet.'}
          </p>
        </section>

        <section
          className={`rounded-[1rem] border p-5 transition-all duration-500 ${
            runtimeState.interventionUrgency === 'high'
              ? 'border-red-400/35 bg-red-500/[0.08] shadow-[0_0_45px_rgba(255,40,40,0.16)]'
              : runtimeState.leverageState === 'user_gaining_leverage'
                ? 'border-emerald-400/25 bg-emerald-500/[0.06] shadow-[0_0_38px_rgba(16,185,129,0.12)]'
                : 'border-amber-300/15 bg-amber-300/[0.04]'
          }`}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-amber-100/45">
            Unified Runtime State
          </p>

          <div className="mt-4 grid gap-2 text-xs leading-5 text-amber-50/75 md:grid-cols-2">
            <p>Objective: {runtimeState.objective}</p>
            <p>Speaker: {runtimeState.speaker}</p>
            <p>Confidence: {runtimeState.confidence}</p>
            <p>Pressure: {runtimeState.roomPressure}</p>
            <p>Velocity: {runtimeState.velocity}</p>
            <p>Power: {runtimeState.powerFrame}</p>
            <p>Trajectory: {runtimeState.trajectory}</p>
            <p>Recovery: {runtimeState.recovery}</p>
            <p>Posture: {runtimeState.posture}</p>
            <p>Load: {runtimeState.load}</p>
            <p>Silence: {runtimeState.silence}</p>
            <p>Delivery: {runtimeState.deliveryProfile}</p>
            <p>Tier: {liveTier}</p>
            <p>Lifecycle: {liveLifecycle}</p>
            <p>Intentional Stop: {String(intentionalStopRef.current)}</p>
            <p>Reconnect Eligible: {String(isReconnectStillValid())}</p>
            <p>Disconnect: {lastDisconnectReasonRef.current || '—'}</p>
            <p>Session: {liveSessionIdRef.current}</p>
            <p>Leverage: {runtimeState.leverageState || 'stable'}</p>
            <p>Escalation: {runtimeState.escalationLikelihood ?? 0}</p>
            <p>Urgency: {runtimeState.interventionUrgency || 'low'}</p>
            <p>Pressure Memory: {runtimeState.status.includes('Pressure memory')
              ? runtimeState.status.match(/Pressure memory[^.]*\./)?.[0] || 'stable'
              : 'stable'}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-amber-50/70">
              Next: {runtimeState.nextMove || '—'}
            </p>

            {runtimeState.onDeck ? (
              <div className="rounded-[1rem] border border-cyan-400/15 bg-cyan-400/[0.05] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/45">
                  On Deck
                </p>

                <p className="mt-1 text-sm text-cyan-50/80">
                  {runtimeState.onDeck}
                </p>
              </div>
            ) : null}

            {runtimeState.calmingLine ? (
              <div className="rounded-[1rem] border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/45">
                  Counter Velocity
                </p>

                <p className="mt-1 text-sm text-emerald-50/80">
                  {runtimeState.calmingLine}
                </p>
              </div>
            ) : null}

            {runtimeState.postureCue ? (
              <div className="rounded-[1rem] border border-fuchsia-400/15 bg-fuchsia-400/[0.05] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-100/45">
                  Physical Cue
                </p>

                <p className="mt-1 text-sm font-medium tracking-[0.08em] text-fuchsia-50/90">
                  {runtimeState.postureCue}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[1rem] border border-purple-400/20 bg-purple-400/[0.06] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-100/45">Governor Packet</p>

          {packet ? (
            <div className="mt-4 grid gap-3 text-sm">
              <p><span className="text-white/35">Speaker:</span> {packet.speaker}</p>
              <p><span className="text-white/35">Should speak:</span> {String(packet.shouldSpeak)}</p>
              <p><span className="text-white/35">Volley:</span> {packet.volley || '—'}</p>
              <p><span className="text-white/35">Cue:</span> {packet.cue || '—'}</p>
              <p><span className="text-white/35">Status:</span> {packet.status || '—'}</p>
              <p><span className="text-white/35">Confidence:</span> {packet.confidence}</p>
              <p><span className="text-white/35">Shadow used:</span> {String(Boolean(packet.shadowUsed))}</p>
              <p><span className="text-white/35">Room pressure:</span> {packet.roomPressure || 'low'}</p>
              <p><span className="text-white/35">Interruption risk:</span> {packet.interruptionRisk || 0}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/45">No packet yet.</p>
          )}
        </section>

        <section className="rounded-[1rem] border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/45">
            Latency
          </p>

          <div className="mt-4 grid gap-2 text-sm text-emerald-50/70">
            <p>Transcript → Govern: {latency.transcriptToGovernMs}ms</p>
            <p>Governor: {latency.governMs}ms</p>
            <p>TTS: {latency.ttsMs}ms</p>
            <p>Total measured: {latency.totalMs}ms</p>
          </div>
        </section>

        <section className="rounded-[1rem] border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/45">
            Shadow Map
          </p>

          <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-cyan-50/70">
{shadowMap || 'No room-state memory yet.'}
          </pre>
        </section>

        <section className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">Runtime Log</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/55">
            {log.length ? log.map((line, index) => <p key={index}>{line}</p>) : <p>No events yet.</p>}
          </div>
        </section>
      </div>
    </main>
  )
}
