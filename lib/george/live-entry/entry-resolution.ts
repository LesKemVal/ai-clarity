export type LiveEntryRoute = 'homepage' | 'normal' | 'direct'

export type LiveEntryFirstStep =
  | 'orientation'
  | 'questions'
  | 'mechanics'
  | 'prep'
  | 'ready-room'
  | 'enter-live'

export type LiveEntrySignals = Record<string, string>

export interface HomepageLiveHandoff {
  conversationType?: string
  signals?: LiveEntrySignals
}

export interface ResolveLiveEntryInput {
  source: string | null
  homepageHandoff: HomepageLiveHandoff | null
  storedPreparationSignals: LiveEntrySignals
  preparationPreviewReady: boolean
  devPreview: boolean
  startNewLive: boolean
  hasLiveSetup: boolean
  hasActiveLiveSetup: boolean
}

export interface LiveEntryResolution {
  route: LiveEntryRoute
  acquiredSignals: LiveEntrySignals
  isFreshLiveStart: boolean
  preLiveReady: boolean
  firstStep: LiveEntryFirstStep
}

const FRESH_DIRECT_SOURCES = new Set(['signal', 'home', 'founder'])

function resolveRoute(source: string | null): LiveEntryRoute {
  if (source === 'homepage') return 'homepage'
  if (source === 'orientation' || source === 'start' || !source) return 'direct'
  return 'normal'
}

export function resolveLiveEntry(
  input: ResolveLiveEntryInput
): LiveEntryResolution {
  const route = resolveRoute(input.source)

  const acquiredSignals =
    route === 'homepage' && input.homepageHandoff?.signals
      ? {
          ...input.storedPreparationSignals,
          ...input.homepageHandoff.signals,
        }
      : input.storedPreparationSignals

  const isFreshLiveStart =
    input.startNewLive ||
    (input.source ? FRESH_DIRECT_SOURCES.has(input.source) : false)

  const preLiveReady =
    route === 'homepage' ||
    (!isFreshLiveStart &&
      (
        input.preparationPreviewReady ||
        input.devPreview ||
        Object.keys(acquiredSignals).length > 0 ||
        input.hasLiveSetup ||
        input.hasActiveLiveSetup
      ))

  return {
    route,
    acquiredSignals,
    isFreshLiveStart,
    preLiveReady,
    firstStep:
      input.source === 'orientation'
        ? 'orientation'
        : route === 'homepage' && input.homepageHandoff
          ? 'prep'
          : route === 'normal'
            ? 'mechanics'
            : 'questions',
  }
}
