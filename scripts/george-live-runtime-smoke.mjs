import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()

const pageSource = readFileSync(`${root}/app/george/page.tsx`, 'utf8')
const statusPanelSource = readFileSync(`${root}/components/george/live/LiveRoomStatusPanel.tsx`, 'utf8')
const deliveryRouterSource = readFileSync(`${root}/lib/george/live-delivery/delivery-router.ts`, 'utf8')

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
  deliveryRouterSource.includes('receiverProfile'),
  'LIVE delivery router should shape delivery by receiver profile'
)

console.log('GEORGE LIVE runtime smoke passed')
