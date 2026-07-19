import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import type { WebSocket } from 'ws'
import type { LiveHubContext } from '../types/protocol.js'
import { sendJson } from '../transport/json.js'
import { resolveLocalCue } from '../george/local-cue-engine.js'
import { buildRuntimePacket } from '../george/runtime-packet.js'
import { resolveGroqFastCue } from '../llm/groq-fast-lane.js'
import { arbitrateCue } from '../george/cue-arbitrator.js'
import { markLatency } from '../metrics/latency.js'

function createRuntimeTurnId() {
  return `live-turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeTranscriptFragment(value: string) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function buildRecentTranscript(fragments: string[]) {
  return fragments
    .map(normalizeTranscriptFragment)
    .filter(Boolean)
    .slice(-8)
    .join('\n')
}

function readPositiveInteger(
  value: string | undefined,
  fallback: number
) {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : fallback
}

const maxPendingAudioChunks = readPositiveInteger(
  process.env.LIVE_HUB_DEEPGRAM_MAX_PENDING_CHUNKS,
  64
)
const maxPendingAudioBytes = readPositiveInteger(
  process.env.LIVE_HUB_DEEPGRAM_MAX_PENDING_BYTES,
  1_048_576
)
const maxPendingAudioAgeMs = readPositiveInteger(
  process.env.LIVE_HUB_DEEPGRAM_MAX_PENDING_AGE_MS,
  5_000
)

type PendingAudioChunk = {
  audio: ArrayBuffer
  bytes: number
  queuedAt: number
}

export function createDeepgramStream(params: {
  ws: WebSocket
  apiKey: string
  getContext: () => LiveHubContext
}) {
  const deepgram = createClient(params.apiKey)

  let deepgramOpen = false
  let lastCueKey = ''
  let lastCueAt = 0
  let lastCuePriority = 0
  let lastFinalTranscriptKey = ''
  let lastFinalAt = 0
  const pendingAudio: PendingAudioChunk[] = []
  let pendingAudioBytes = 0
  const recentTranscriptFragments: string[] = []

  const dg = deepgram.listen.live({
    model: 'nova-2',
    smart_format: true,
    interim_results: true,
    endpointing: 250,
  })

  function clearPendingAudio(reason: string) {
    if (!pendingAudio.length) return

    console.warn('[LIVE HUB][deepgram][pending-audio-cleared]', {
      reason,
      droppedChunks: pendingAudio.length,
      droppedBytes: pendingAudioBytes,
    })

    pendingAudio.length = 0
    pendingAudioBytes = 0
  }

  function evictExpiredPendingAudio(now = Date.now()) {
    let droppedChunks = 0
    let droppedBytes = 0

    while (
      pendingAudio.length &&
      now - pendingAudio[0].queuedAt > maxPendingAudioAgeMs
    ) {
      const dropped = pendingAudio.shift()
      if (!dropped) break

      pendingAudioBytes -= dropped.bytes
      droppedChunks += 1
      droppedBytes += dropped.bytes
    }

    if (droppedChunks) {
      console.warn('[LIVE HUB][deepgram][pending-audio-expired]', {
        droppedChunks,
        droppedBytes,
        remainingChunks: pendingAudio.length,
        remainingBytes: pendingAudioBytes,
        maxPendingAudioAgeMs,
      })
    }
  }

  function queuePendingAudio(audio: ArrayBuffer) {
    const now = Date.now()
    const bytes = audio.byteLength

    evictExpiredPendingAudio(now)

    if (bytes > maxPendingAudioBytes) {
      console.warn('[LIVE HUB][deepgram][pending-audio-rejected]', {
        reason: 'chunk_exceeds_byte_limit',
        chunkBytes: bytes,
        maxPendingAudioBytes,
      })
      return
    }

    let droppedChunks = 0
    let droppedBytes = 0

    while (
      pendingAudio.length &&
      (
        pendingAudio.length >= maxPendingAudioChunks ||
        pendingAudioBytes + bytes > maxPendingAudioBytes
      )
    ) {
      const dropped = pendingAudio.shift()
      if (!dropped) break

      pendingAudioBytes -= dropped.bytes
      droppedChunks += 1
      droppedBytes += dropped.bytes
    }

    if (droppedChunks) {
      console.warn('[LIVE HUB][deepgram][pending-audio-overflow]', {
        policy: 'drop_oldest',
        droppedChunks,
        droppedBytes,
        incomingBytes: bytes,
        remainingChunks: pendingAudio.length,
        remainingBytes: pendingAudioBytes,
        maxPendingAudioChunks,
        maxPendingAudioBytes,
      })
    }

    pendingAudio.push({ audio, bytes, queuedAt: now })
    pendingAudioBytes += bytes
  }

  function rememberTranscriptFragment(transcript: string, isFinal: boolean) {
    const clean = normalizeTranscriptFragment(transcript)
    if (!clean) return

    if (!isFinal && clean.length < 12) return

    const last = recentTranscriptFragments[recentTranscriptFragments.length - 1]
    if (last === clean) return

    recentTranscriptFragments.push(clean)

    while (recentTranscriptFragments.length > 12) {
      recentTranscriptFragments.shift()
    }
  }

  function processTranscript(input: {
    transcript: string
    isFinal: boolean
    source: 'deepgram' | 'client'
    turnId?: string
    deliveryStyle?: LiveHubContext['deliveryStyle']
  }) {
    const transcript = input.transcript.trim()
    if (!transcript) return

    const turnStartAt = Date.now()
    const activeTurnId = input.turnId || createRuntimeTurnId()
    const turnContext = input.deliveryStyle
      ? { ...params.getContext(), deliveryStyle: input.deliveryStyle }
      : params.getContext()
    const isFinal = input.isFinal

    console.log('[LIVE HUB][turn]', {
      turnId: activeTurnId,
      source: input.source,
      providedTurnId: Boolean(input.turnId),
    })

    console.log('[LIVE HUB][latency]', markLatency(turnStartAt, 'transcript_received'))

    if (isFinal) {
      const now = Date.now()
      const transcriptKey = transcript.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

      if (transcriptKey === lastFinalTranscriptKey && now - lastFinalAt < 1500) {
        return
      }

      lastFinalTranscriptKey = transcriptKey
      lastFinalAt = now
    }

    rememberTranscriptFragment(transcript, isFinal)
    const recentTranscript = buildRecentTranscript(recentTranscriptFragments)

    sendJson(params.ws, {
      type: isFinal ? 'TRANSCRIPT_FINAL' : 'TRANSCRIPT_PARTIAL',
      text: transcript,
      source: input.source,
      at: Date.now(),
    })

    const cue = resolveLocalCue({
      transcript,
      context: turnContext,
      isFinal,
    })

    if (!cue) return

    const now = Date.now()
    const cueKey = `${cue.category}:${cue.cue}`
    const canUpgradeCue = cue.priority > lastCuePriority + 20

    if (cueKey === lastCueKey && !canUpgradeCue && now - lastCueAt <= 3500) {
      return
    }

    lastCueKey = cueKey
    lastCueAt = now
    lastCuePriority = cue.priority

    const packet = buildRuntimePacket({
      transcript,
      recentTranscript,
      isFinal,
      context: turnContext,
      cue,
    })

    sendJson(params.ws, {
      type: 'LOCAL_CUE',
      turnId: activeTurnId,
      cue: cue.cue,
      reason: cue.reason,
      category: cue.category,
      confidence: cue.confidence,
      priority: cue.priority,
      packet,
      at: now,
    })

    const localActionCue = arbitrateCue({ packet })

    console.log('[LIVE HUB][metric]', {
      event: 'action_cue',
      turnId: activeTurnId,
      source: localActionCue.source,
      cue: localActionCue.cue,
    })

    const shouldSendLocalActionCue =
      packet.deliveryStyle !== 'response' && localActionCue.cue.trim()

    if (shouldSendLocalActionCue) {
      sendJson(params.ws, {
        type: 'ACTION_CUE',
        turnId: activeTurnId,
        cue: localActionCue.cue,
        reason: localActionCue.reason,
        source: localActionCue.source,
        localCue: localActionCue.localCue,
        fastCue: localActionCue.fastCue,
        evidence: localActionCue.evidence,
        category: localActionCue.category,
        confidence: localActionCue.confidence,
        priority: localActionCue.priority,
        at: localActionCue.at,
      })

      console.log('[LIVE HUB][latency]', markLatency(turnStartAt, 'local_cue_sent'))
    }

    console.log('[LIVE HUB][groq] queued', {
      turnId: activeTurnId,
      signal: packet.signal,
      cue: packet.cue,
      deliveryStyle: packet.deliveryStyle,
      recentTranscriptAvailable: Boolean(packet.recentTranscript),
    })

    console.log('[LIVE HUB][latency]', markLatency(turnStartAt, 'groq_request'))

    void resolveGroqFastCue(packet)
      .then((fastCue) => {
        console.log('[LIVE HUB][groq] resolved', {
          turnId: activeTurnId,
          fastCue,
        })
        console.log('[LIVE HUB][latency]', markLatency(turnStartAt, 'groq_response'))

        if (!fastCue) return

        sendJson(params.ws, {
          type: 'FAST_CUE',
          turnId: activeTurnId,
          cue: fastCue.cue,
          source: fastCue.source,
          model: fastCue.model,
          fromLocalCue: cue.cue,
          at: Date.now(),
        })

        const actionCue = arbitrateCue({
          packet,
          fastCue: fastCue.cue,
        })

        console.log('[LIVE HUB][metric]', {
          event: 'action_cue',
          turnId: activeTurnId,
          source: actionCue.source,
          cue: actionCue.cue,
        })

        sendJson(params.ws, {
          type: 'ACTION_CUE',
          turnId: activeTurnId,
          cue: actionCue.cue,
          reason: actionCue.reason,
          source: actionCue.source,
          localCue: actionCue.localCue,
          fastCue: actionCue.fastCue,
          evidence: actionCue.evidence,
          category: actionCue.category,
          confidence: actionCue.confidence,
          priority: actionCue.priority,
          at: actionCue.at,
        })

        console.log('[LIVE HUB][latency]', markLatency(turnStartAt, 'fast_cue_sent'))
      })
      .catch((error) => {
        console.warn('[LIVE HUB][groq]', error instanceof Error ? error.message : error)
      })
  }

  dg.on(LiveTranscriptionEvents.Open, () => {
    deepgramOpen = true
    console.log('[LIVE HUB][deepgram] open')

    evictExpiredPendingAudio()

    while (pendingAudio.length) {
      const chunk = pendingAudio.shift()
      if (!chunk) continue

      pendingAudioBytes -= chunk.bytes
      dg.send(chunk.audio)
    }

    pendingAudioBytes = 0
  })

  dg.on(LiveTranscriptionEvents.Close, () => {
    deepgramOpen = false
    clearPendingAudio('deepgram_close')
    console.log('[LIVE HUB][deepgram] close')
  })

  dg.on(LiveTranscriptionEvents.Transcript, (payload) => {
    const transcript = payload?.channel?.alternatives?.[0]?.transcript?.trim() || ''
    const isFinal = Boolean(payload?.is_final || payload?.speech_final)

    processTranscript({
      transcript,
      isFinal,
      source: 'deepgram',
    })
  })

  dg.on(LiveTranscriptionEvents.Error, (error) => {
    deepgramOpen = false
    clearPendingAudio('deepgram_error')

    sendJson(params.ws, {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Deepgram stream error.',
      at: Date.now(),
    })
  })

  return {
    sendAudio(chunk: Buffer) {
      const audio = chunk.buffer.slice(
        chunk.byteOffset,
        chunk.byteOffset + chunk.byteLength
      ) as ArrayBuffer

      if (!deepgramOpen) {
        queuePendingAudio(audio)
        return
      }

      dg.send(audio)
    },

    handleTranscriptInput(
      text: string,
      isFinal = true,
      turnId?: string,
      deliveryStyle?: LiveHubContext['deliveryStyle']
    ) {
      processTranscript({
        transcript: text,
        isFinal,
        source: 'client',
        turnId,
        deliveryStyle,
      })
    },

    close() {
      deepgramOpen = false
      clearPendingAudio('stream_close')

      try {
        dg.finish()
      } catch {}
    },
  }
}
