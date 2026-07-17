import type { LiveSupportTag } from '@/lib/george/live-runtime/live-support-ranking'

export type { LiveSupportTag }

export type LiveSupportPreferenceProfile = {
  liked: Record<string, number>
  disliked: Record<string, number>
  updatedAt: number
}

const LIVE_SUPPORT_PREFERENCES_KEY = 'george_live_support_preferences'

function emptyProfile(): LiveSupportPreferenceProfile {
  return {
    liked: {},
    disliked: {},
    updatedAt: Date.now(),
  }
}

export function readLiveSupportPreferenceProfile(): LiveSupportPreferenceProfile {
  if (typeof window === 'undefined') return emptyProfile()

  try {
    const raw = window.localStorage.getItem(LIVE_SUPPORT_PREFERENCES_KEY)
    if (!raw) return emptyProfile()

    const parsed = JSON.parse(raw)
    return {
      liked: parsed?.liked && typeof parsed.liked === 'object' ? parsed.liked : {},
      disliked:
        parsed?.disliked && typeof parsed.disliked === 'object'
          ? parsed.disliked
          : {},
      updatedAt: Number(parsed?.updatedAt || Date.now()),
    }
  } catch {
    return emptyProfile()
  }
}

export function recordLiveSupportPreference(params: {
  tags: string[]
  value: 'up' | 'down'
}) {
  if (typeof window === 'undefined') return emptyProfile()

  const profile = readLiveSupportPreferenceProfile()
  const cleanTags = params.tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)

  for (const tag of cleanTags) {
    if (params.value === 'up') {
      profile.liked[tag] = (profile.liked[tag] || 0) + 1
    } else {
      profile.disliked[tag] = (profile.disliked[tag] || 0) + 1
    }
  }

  profile.updatedAt = Date.now()
  window.localStorage.setItem(
    LIVE_SUPPORT_PREFERENCES_KEY,
    JSON.stringify(profile)
  )
  return profile
}

export function getPreferredLiveSupportTags(
  profile = readLiveSupportPreferenceProfile()
) {
  const allTags = Array.from(
    new Set([
      ...Object.keys(profile.liked || {}),
      ...Object.keys(profile.disliked || {}),
    ])
  )

  return allTags
    .filter(
      (tag) =>
        (profile.liked[tag] || 0) - (profile.disliked[tag] || 0) > 0
    )
    .sort((a, b) => {
      const scoreA =
        (profile.liked[a] || 0) - (profile.disliked[a] || 0)
      const scoreB =
        (profile.liked[b] || 0) - (profile.disliked[b] || 0)
      return scoreB - scoreA
    })
    .slice(0, 3)
}
