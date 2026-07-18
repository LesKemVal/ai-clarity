export const LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS = {
  terminal: 90,
  standard: 140,
  fragment: 210,
} as const

export function resolveLiveFinalTranscriptReleaseDelayMs(
  transcript: string
): number {
  const clean = String(transcript || '').trim()

  if (!clean) {
    return LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS.standard
  }

  if (/[.!?]["”']?$/.test(clean)) {
    return LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS.terminal
  }

  const wordCount = clean.split(/\s+/).filter(Boolean).length

  if (wordCount <= 3) {
    return LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS.fragment
  }

  return LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS.standard
}
