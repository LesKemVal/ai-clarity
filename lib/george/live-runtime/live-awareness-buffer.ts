export type LiveAwarenessFragmentKind = 'partial' | 'final'

export type LiveAwarenessFragment = {
  kind: LiveAwarenessFragmentKind
  text: string
  at: number
  whileGeorgeSpeaking: boolean
  overlapLikely: boolean
  uncertainty: 'low' | 'medium' | 'high'
}

export function appendLiveAwarenessFragment(params: {
  buffer: LiveAwarenessFragment[]
  kind: LiveAwarenessFragmentKind
  text: string
  whileGeorgeSpeaking?: boolean
  now?: number
  limit?: number
}) {
  const clean = String(params.text || '').replace(/\s+/g, ' ').trim()
  const limit = Math.max(4, params.limit || 32)

  if (!clean) return params.buffer.slice(-limit)

  const previous = params.buffer[params.buffer.length - 1]
  const now = params.now ?? Date.now()
  const whileGeorgeSpeaking = Boolean(params.whileGeorgeSpeaking)

  if (
    previous &&
    previous.kind === params.kind &&
    previous.text === clean &&
    now - previous.at < 1200
  ) {
    return params.buffer.slice(-limit)
  }

  const overlapLikely =
    whileGeorgeSpeaking ||
    /\b(wait|hold on|stop|no|but|actually|listen|let me|that's not|that is not)\b/i.test(clean)

  const uncertainty: LiveAwarenessFragment['uncertainty'] =
    params.kind === 'partial'
      ? overlapLikely
        ? 'high'
        : 'medium'
      : overlapLikely
        ? 'medium'
        : 'low'

  return [
    ...params.buffer,
    {
      kind: params.kind,
      text: clean,
      at: now,
      whileGeorgeSpeaking,
      overlapLikely,
      uncertainty,
    },
  ].slice(-limit)
}

export function getRecentLiveAwarenessContext(buffer: LiveAwarenessFragment[]) {
  return buffer
    .slice(-12)
    .map((item) => ({
      text: item.text,
      uncertainty: item.uncertainty,
      overlapLikely: item.overlapLikely,
      whileGeorgeSpeaking: item.whileGeorgeSpeaking,
    }))
}
