export type PreparedInterimReasoning<TResult> = {
  preparedTranscript: string
  ageMs: number
  result: Promise<TResult | null>
}

type Candidate<TResult> = {
  transcript: string
  createdAt: number
  result: Promise<TResult | null>
}

function normalizeTranscript(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function countWords(value: string) {
  return normalizeTranscript(value).split(' ').filter(Boolean).length
}

function isCompatibleInterim(interim: string, finalTranscript: string) {
  const prepared = normalizeTranscript(interim)
  const final = normalizeTranscript(finalTranscript)

  if (!prepared || !final) return false
  if (final === prepared || final.startsWith(`${prepared} `)) return true

  const preparedWords = prepared.split(' ')
  const finalWords = final.split(' ')
  const comparable = Math.min(preparedWords.length, finalWords.length)

  let matchingPrefixWords = 0
  while (
    matchingPrefixWords < comparable &&
    preparedWords[matchingPrefixWords] === finalWords[matchingPrefixWords]
  ) {
    matchingPrefixWords += 1
  }

  return matchingPrefixWords / preparedWords.length >= 0.8
}

export function createInterimReasoningPreparer<TPacket, TResult>(options?: {
  minimumCharacters?: number
  minimumWords?: number
  maximumAgeMs?: number
}) {
  const minimumCharacters = options?.minimumCharacters ?? 24
  const minimumWords = options?.minimumWords ?? 5
  const maximumAgeMs = options?.maximumAgeMs ?? 5_000

  let candidate: Candidate<TResult> | null = null

  return {
    prepare(input: {
      transcript: string
      packet: TPacket
      resolve: (packet: TPacket) => Promise<TResult | null>
      now?: number
    }) {
      const transcript = normalizeTranscript(input.transcript)
      const now = input.now ?? Date.now()

      if (
        transcript.length < minimumCharacters ||
        countWords(transcript) < minimumWords
      ) {
        return false
      }

      if (
        candidate &&
        (
          transcript === candidate.transcript ||
          transcript.startsWith(`${candidate.transcript} `)
        )
      ) {
        return false
      }

      candidate = {
        transcript,
        createdAt: now,
        result: input.resolve(input.packet).catch((error) => {
          console.warn(
            '[LIVE HUB][early-reasoning] preparation failed',
            error instanceof Error ? error.message : error
          )
          return null
        }),
      }

      return true
    },

    consume(finalTranscript: string, now = Date.now()): PreparedInterimReasoning<TResult> | null {
      const prepared = candidate
      candidate = null

      if (!prepared) return null

      const ageMs = now - prepared.createdAt
      if (ageMs > maximumAgeMs) return null
      if (!isCompatibleInterim(prepared.transcript, finalTranscript)) return null

      return {
        preparedTranscript: prepared.transcript,
        ageMs,
        result: prepared.result,
      }
    },

    clear() {
      candidate = null
    },
  }
}
