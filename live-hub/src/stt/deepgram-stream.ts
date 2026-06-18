import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import type { WebSocket } from 'ws'
import type { LiveHubContext } from '../types/protocol.js'
import { sendJson } from '../transport/json.js'
import { resolveLocalCue } from '../george/local-cue-engine.js'

export function createDeepgramStream(params: {
  ws: WebSocket
  apiKey: string
  getContext: () => LiveHubContext
}) {
  const deepgram = createClient(params.apiKey)

  let deepgramOpen = false
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

    sendJson(params.ws, {
      type: isFinal ? 'TRANSCRIPT_FINAL' : 'TRANSCRIPT_PARTIAL',
      text: transcript,
      at: Date.now(),
    })

    const cue = resolveLocalCue({
      transcript,
      context: params.getContext(),
    })

    if (cue) {
      sendJson(params.ws, {
        type: 'LOCAL_CUE',
        cue: cue.cue,
        reason: cue.reason,
        at: Date.now(),
      })
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
