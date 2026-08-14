import type { PreparationSessionV1 } from '../live-runtime/live-preparation-controller'

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

const NORMAL_PREPARATION_SOURCES = new Set<string | null>([
  null,
  'signal',
  'message',
])

function resolveRoute(source: string | null): LiveEntryRoute {
  if (source === 'homepage') return 'homepage'
  if (source === 'orientation' || source === 'start' || !source) return 'direct'
  return 'normal'
}

export interface ValidateLiveEntryPreparationInput {
  source: string | null
  preparationSessionId: string | null
  normalSessionId?: string | null
  activeNormalSessionId?: string | null
  candidate: PreparationSessionV1 | null
}

/**
 * Establishes whether one canonical preparation belongs to the current entry
 * route. Browser storage existence is deliberately not part of this decision.
 */
export function validateLiveEntryPreparation(
  input: ValidateLiveEntryPreparationInput,
): PreparationSessionV1 | null {
  const candidate = input.candidate
  const preparationSessionId = String(
    input.preparationSessionId || '',
  ).trim()

  if (!candidate || !preparationSessionId) return null
  if (candidate.preparationSessionId !== preparationSessionId) return null

  if (NORMAL_PREPARATION_SOURCES.has(input.source)) {
    const normalSessionId = String(input.normalSessionId || '').trim()
    const activeNormalSessionId = String(
      input.activeNormalSessionId || '',
    ).trim()

    return normalSessionId &&
      activeNormalSessionId === normalSessionId &&
      candidate.provenance.entrySource === 'normal' &&
      candidate.relations.normalSessionId === normalSessionId
      ? candidate
      : null
  }

  if (
    input.source === 'homepage' &&
    candidate.provenance.entrySource === 'homepage'
  ) {
    return candidate
  }

  if (
    input.source === 'start' &&
    candidate.provenance.entrySource === 'traditional'
  ) {
    return candidate
  }

  return null
}

export interface ValidateLiveEntryPreparationReturnInput
  extends Omit<ValidateLiveEntryPreparationInput, 'candidate'> {
  snapshotPreparation: PreparationSessionV1 | null
  storedPreparation: PreparationSessionV1 | null
}

/**
 * Return-state semantics are valid only when the snapshot and the current
 * canonical storage pointer independently validate to the same route identity.
 */
export function validateLiveEntryPreparationReturn(
  input: ValidateLiveEntryPreparationReturnInput,
): PreparationSessionV1 | null {
  const snapshotPreparation = validateLiveEntryPreparation({
    ...input,
    candidate: input.snapshotPreparation,
  })
  const storedPreparation = validateLiveEntryPreparation({
    ...input,
    candidate: input.storedPreparation,
  })

  return snapshotPreparation &&
    storedPreparation?.preparationSessionId ===
      snapshotPreparation.preparationSessionId
    ? snapshotPreparation
    : null
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
