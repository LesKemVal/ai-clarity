import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import type { WebSocket } from 'ws'
import type { LiveHubContext } from '../types/protocol.js'
import { sendJson } from '../transport/json.js'
import { resolveLocalCue } from '../george/local-cue-engine.js'
import { buildRuntimePacket } from '../george/runtime-packet.js'

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
  const pendingAudio: ArrayBuffer[] = []

  const dg = deepgram.listen.live({
    model: 'nova-2',
    smart_format: true,
    interim_results: true,
    endpointing: 350,
  })

  dg.on(LiveTranscriptionEvents.Open, () => {
    deepgramOpen = true
    console.log('[LIVE HUB][deepgram] open')

    while (pendingAudio.length) {
      const chunk = pendingAudio.shift()
      if (chunk) dg.send(chunk)
    }
  })

  dg.on(LiveTranscriptionEvents.Close, () => {
    deepgramOpen = false
    console.log('[LIVE HUB][deepgram] close')
  })

  dg.on(LiveTranscriptionEvents.Transcript, (payload) => {
    const transcript = payload?.channel?.alternatives?.[0]?.transcript?.trim() || ''
    if (!transcript) return

    const isFinal = Boolean(payload?.is_final || payload?.speech_final)

    if (isFinal) {
      const now = Date.now()
      const transcriptKey = transcript.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

      if (transcriptKey === lastFinalTranscriptKey && now - lastFinalAt < 1500) {
        return
      }

      lastFinalTranscriptKey = transcriptKey
      lastFinalAt = now
    }

    sendJson(params.ws, {
      type: isFinal ? 'TRANSCRIPT_FINAL' : 'TRANSCRIPT_PARTIAL',
      text: transcript,
      at: Date.now(),
    })

    const cue = resolveLocalCue({
      transcript,
      context: params.getContext(),
      isFinal,
    })

    if (cue) {
      const now = Date.now()
      const cueKey = `${cue.category}:${cue.cue}`

      const canUpgradeCue = cue.priority > lastCuePriority + 20

      if (cueKey !== lastCueKey || canUpgradeCue || now - lastCueAt > 3500) {
        lastCueKey = cueKey
        lastCueAt = now
        lastCuePriority = cue.priority

        sendJson(params.ws, {
          type: 'LOCAL_CUE',
          cue: cue.cue,
          reason: cue.reason,
          category: cue.category,
          confidence: cue.confidence,
        priority: cue.priority,
          at: now,
        })
      }
    }
  })

  dg.on(LiveTranscriptionEvents.Error, (error) => {
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

      console.log('[LIVE HUB][audio]', {
        bytes: chunk.byteLength,
        deepgramOpen,
      })

      if (!deepgramOpen) {
        pendingAudio.push(audio)
        return
      }

      dg.send(audio)
    },
    close() {
      try {
        dg.finish()
      } catch {}
    },
  }
}
