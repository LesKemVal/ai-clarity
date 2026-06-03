export type GeorgeSessionTier = 'smart' | 'intelligent' | 'brilliant'

export type GeorgeSessionAuthority = {
  authenticated: boolean
  tier: GeorgeSessionTier
  liveAccess: boolean
  email: string
  source?: string
  expiresAt?: number
}

const SESSION_AUTHORITY_TTL_MS = 15_000
let authorityMemoryCache: GeorgeSessionAuthority | null = null
let authorityMemoryCacheAt = 0
let authorityInFlight: Promise<GeorgeSessionAuthority> | null = null

function normalizeTier(value: unknown): GeorgeSessionTier {
  return value === 'brilliant' || value === 'intelligent' ? value : 'smart'
}

function unauthenticatedAuthority(): GeorgeSessionAuthority {
  return {
    authenticated: false,
    tier: 'smart',
    liveAccess: false,
    email: '',
  }
}

function now() {
  return Date.now()
}

function isFreshMemoryCache() {
  return Boolean(authorityMemoryCache && now() - authorityMemoryCacheAt < SESSION_AUTHORITY_TTL_MS)
}

function rememberAuthority(authority: GeorgeSessionAuthority) {
  authorityMemoryCache = authority
  authorityMemoryCacheAt = now()
  return authority
}

export function readCachedGeorgeSessionAuthority(): GeorgeSessionAuthority {
  if (typeof window === 'undefined') {
    return unauthenticatedAuthority()
  }

  if (isFreshMemoryCache() && authorityMemoryCache) {
    return authorityMemoryCache
  }

  try {
    const email = (window.localStorage.getItem('george_email') || '').trim().toLowerCase()
    const tier = normalizeTier(window.localStorage.getItem('george_tier'))

    return rememberAuthority({
      authenticated: false,
      tier,
      liveAccess: false,
      email,
      source: email ? 'local-hint' : undefined,
    })
  } catch {
    return unauthenticatedAuthority()
  }
}

export function writeCachedGeorgeSessionAuthority(authority: GeorgeSessionAuthority) {
  rememberAuthority(authority)

  if (typeof window === 'undefined') return

  try {
    if (authority.email) {
      window.localStorage.setItem('george_email', authority.email.trim().toLowerCase())
    }

    window.localStorage.setItem('george_tier', normalizeTier(authority.tier))

    if (authority.authenticated) {
      window.localStorage.setItem('george_verified_continuity', 'true')
    } else {
      window.localStorage.removeItem('george_verified_continuity')
    }
  } catch {}
}

export function clearCachedGeorgeSessionAuthority() {
  authorityMemoryCache = null
  authorityMemoryCacheAt = 0
  authorityInFlight = null

  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem('george_email')
    window.localStorage.removeItem('george_verified_continuity')
    window.localStorage.removeItem('george_tier')
  } catch {}
}

async function fetchGeorgeSessionAuthorityUncached(): Promise<GeorgeSessionAuthority> {
  const cached = readCachedGeorgeSessionAuthority()

  try {
    const response = await fetch('/api/session', { cache: 'no-store' })
    const data = await response.json()

    if (data?.authenticated) {
      const tier = normalizeTier(data?.tier)
      const authority: GeorgeSessionAuthority = {
        authenticated: true,
        tier,
        liveAccess: Boolean(data?.liveAccess) || tier === 'intelligent' || tier === 'brilliant',
        email: String(data?.email || cached.email || '').trim().toLowerCase(),
        source: data?.source || 'session',
        expiresAt: data?.expiresAt,
      }

      writeCachedGeorgeSessionAuthority(authority)
      return authority
    }

    if (cached.email && cached.source) {
      const authority: GeorgeSessionAuthority = {
        authenticated: true,
        tier: cached.tier,
        liveAccess: cached.tier === 'intelligent' || cached.tier === 'brilliant',
        email: cached.email,
        source: cached.source,
      }

      return rememberAuthority(authority)
    }

    clearCachedGeorgeSessionAuthority()
    return rememberAuthority(unauthenticatedAuthority())
  } catch {
    return cached
  }
}

export async function fetchGeorgeSessionAuthority(): Promise<GeorgeSessionAuthority> {
  if (isFreshMemoryCache() && authorityMemoryCache) {
    return authorityMemoryCache
  }

  if (authorityInFlight) {
    return authorityInFlight
  }

  authorityInFlight = fetchGeorgeSessionAuthorityUncached()
    .then((authority) => rememberAuthority(authority))
    .finally(() => {
      authorityInFlight = null
    })

  return authorityInFlight
}
