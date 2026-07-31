/**
 * Canonical browser-host composition boundary for the GEORGE application.
 *
 * Application mount surfaces import host capabilities through this module
 * instead of coupling themselves to each individual browser-host owner.
 *
 * Portable runtime modules must never import this file.
 */

export { createAudioPlayback } from './audio-playback'

export {
  buildGeorgeSessionRestoreState,
  findGeorgeSessionToRestore,
  saveGeorgeSession,
} from './session-controller'

export { recordLiveOutcomeSignal } from './live-outcome-observation'

export { readGeorgeNormalDraft } from './draft-restoration'

export {
  consumePreparedLiveSetup,
  markLiveRuntimeStarted,
  persistActiveLiveRuntimeSupport,
  readActiveLiveRuntimeSupport,
} from './live-prep-storage'

export { reconcileActiveLiveRuntimeUsage } from './live-runtime-usage'

export {
  completeLiveConversation,
  prepareLiveCompletionReview,
  readLastLiveOutcomeObservation,
} from './live-completion'

export { recordLiveSupportPreference } from './live-support-preferences'
