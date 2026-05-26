import type { GeorgeMode } from '@/lib/george/behavior/mode'
import { isProLiveShelved } from '@/lib/george/live-runtime/pro-live-boundary'

export type CurrentGeorgeRuntime = 'normal_george' | 'live_george'

export function normalizeCurrentGeorgeMode(input: unknown): GeorgeMode {
  if (input === 'conversation') return 'conversation'

  if (input === 'campaign' && isProLiveShelved()) {
    return 'conversation'
  }

  if (input === 'campaign') return 'campaign'

  return 'normal'
}

export function getCurrentGeorgeRuntime(mode: GeorgeMode): CurrentGeorgeRuntime {
  return mode === 'conversation' || mode === 'campaign'
    ? 'live_george'
    : 'normal_george'
}

export function shouldApplyLegacyCampaignContext(input: {
  mode: GeorgeMode
  activeCampaign: unknown
}) {
  if (isProLiveShelved()) return false
  return input.mode === 'campaign' && Boolean(input.activeCampaign)
}

export function getShelvedCampaignRuntimeNote() {
  if (!isProLiveShelved()) return ''

  return `
CURRENT PRODUCT RUNTIME
- GEORGE currently has two active experiences: normal GEORGE and LIVE GEORGE.
- Legacy Pro LIVE campaign logic is shelved and must not govern the response.
- If campaign-era context appears, translate only useful primitives into individual LIVE support: pressure handling, objection detection, cadence, tone, next move, and speakable lines.
- Do not assume firm mode, CRM workflow, sales pipeline, campaign management, or team governance.
`.trim()
}
