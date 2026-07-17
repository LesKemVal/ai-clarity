import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()

const pageSource = readFileSync(`${root}/app/george/page.tsx`, 'utf8')
const statusPanelSource = readFileSync(`${root}/components/george/live/LiveRoomStatusPanel.tsx`, 'utf8')
const deliveryRouterSource = readFileSync(`${root}/lib/george/live-delivery/delivery-router.ts`, 'utf8')
const receiverPolicySource = readFileSync(`${root}/lib/george/live-delivery/receiver-policy.ts`, 'utf8')
const deliveryBridgeSource = readFileSync(`${root}/components/george/live/LiveHubDeliveryBridge.tsx`, 'utf8')

assert(
  pageSource.includes('cycleLiveReceiverProfile'),
  'LIVE runtime console should cycle receiver profiles'
)

assert(
  pageSource.includes('liveReceiverProfile'),
  'LIVE runtime console should preserve selected receiver profile'
)

assert(
  pageSource.includes('receiverProfile={liveReceiverProfile}'),
  'LIVE runtime bridges should receive explicit receiver profile'
)

assert(
  !pageSource.includes('cycleLiveSupportStyle'),
  'LIVE runtime console should not expose legacy support-style cycling'
)

assert(
  !statusPanelSource.includes('activeSupportLabel'),
  'LIVE status panel should not expose legacy support label'
)

assert(
  !statusPanelSource.includes('onSupportPressed'),
  'LIVE status panel should not expose legacy support control'
)

assert(
  pageSource.includes(
    "window.localStorage.setItem('GEORGE_LIVE_SUPPORT_STYLE', nextStyle)"
  ) &&
    pageSource.includes(
      "window.localStorage.setItem('GEORGE_LIVE_DELIVERY_STYLE', nextStyle)"
    ) &&
    pageSource.includes(
      "window.localStorage.setItem('GEORGE_LIVE_SUPPORT_POLICY', choice)"
    ),
  'LIVE controls persist canonical support style, delivery style, and explicit support policy'
)

assert(
  pageSource.includes("setLiveDeliveryStyle(nextStyle)") &&
    pageSource.includes("'george_live_setup_active'") &&
    pageSource.includes("supportStyle: nextStyle") &&
    pageSource.includes("deliveryStyle: nextStyle"),
  'LIVE controls immediately supersede stored track defaults and active setup behavior'
)

assert(
  statusPanelSource.includes('receiverProfileLabel'),
  'LIVE status panel should expose receiver profile label'
)

assert(
  statusPanelSource.includes('onReceiverPressed'),
  'LIVE status panel should expose receiver profile control'
)

assert(
  statusPanelSource.includes('onRoomToggle'),
  'LIVE status panel must preserve room/mic listening toggle'
)

assert(
  statusPanelSource.includes('onVoiceToggle'),
  'LIVE status panel must preserve audio output toggle'
)

assert(
  deliveryRouterSource.includes('resolveGeorgeReceiverDeliveryPolicy'),
  'LIVE delivery router should delegate receiver realization to canonical receiver policy'
)

assert(
  !deliveryRouterSource.includes('function shapeAudioText') &&
    !deliveryRouterSource.includes('function shapeVisualOnlyText') &&
    !deliveryRouterSource.includes('function resolveDeliveryModes'),
  'LIVE delivery router must not duplicate receiver-specific shaping or surface selection'
)

assert(
  receiverPolicySource.includes('export function resolveGeorgeReceiverDeliveryPolicy'),
  'LIVE receiver policy should expose the canonical receiver realization boundary'
)

assert(
  receiverPolicySource.includes("receiverProfile === 'visual_only'") &&
    receiverPolicySource.includes("receiverProfile === 'audio_only'") &&
    receiverPolicySource.includes("['voice', 'visual']"),
  'LIVE receiver policy should explicitly support visual-only, audio-only, and audio-visual profiles'
)

assert(
  receiverPolicySource.includes('shapeAudioText') &&
    receiverPolicySource.includes('shapeVisualOnlyText') &&
    receiverPolicySource.includes('shapeVisualReferenceText'),
  'LIVE receiver policy should own distinct audio, visual-only, and audio-visual reference shaping'
)

assert(
  receiverPolicySource.includes("return input.voiceEnabled ? ['voice'] : ['silent']"),
  'Audio-only receiver policy should suppress unavailable audio instead of creating an unauthorized visual fallback'
)

assert(
  deliveryBridgeSource.includes('routeGeorgeDeliveryCues') &&
    !deliveryBridgeSource.includes('shapeAudioText') &&
    !deliveryBridgeSource.includes('shapeVisualOnlyText'),
  'LIVE delivery bridge should dispatch routed cues without owning receiver shaping'
)

console.log('GEORGE LIVE runtime smoke passed')
