export type LiveSupportTag =
  | 'Continuation'
  | 'Cues'
  | 'Advise'
  | 'Outcome'
  | 'Close'

export function rankLiveSupportTags(
  tags: string[],
  preferredTags: string[] | null | undefined
) {
  const preferenceOrder = new Map(
    (preferredTags || []).map((tag, index) => [String(tag), index])
  )

  return tags
    .map((tag, index) => ({
      tag,
      index,
      preference: preferenceOrder.get(tag),
    }))
    .sort((a, b) => {
      const aPreferred = a.preference !== undefined
      const bPreferred = b.preference !== undefined

      if (aPreferred && bPreferred) {
        return (a.preference as number) - (b.preference as number)
      }

      if (aPreferred) return -1
      if (bPreferred) return 1
      return a.index - b.index
    })
    .map(({ tag }) => tag)
}
