import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const route = readFileSync(`${root}/app/api/george/communications/route.ts`, 'utf8')
const sender = readFileSync(`${root}/lib/continuity/send-continuity-email.ts`, 'utf8')
const panel = readFileSync(`${root}/components/george/live/PostLiveConversationRecordPanel.tsx`, 'utf8')

assert(
  route.includes("readGeorgeSession(req)") &&
    route.includes("session.source === 'continuity'") &&
    route.includes("session.email"),
  'GEORGE communications must derive the recipient from authenticated user authority'
)

assert(
  !route.includes('body.email') &&
    !route.includes('body.recipient') &&
    !route.includes('body.to'),
  'GEORGE user communication route must not accept a third-party recipient'
)

assert(
  route.includes("url.origin !== req.nextUrl.origin"),
  'GEORGE user communication actions must remain on the GEORGE origin'
)

assert(
  sender.includes('sendGeorgeUserCommunication') &&
    sender.includes('operationalReason'),
  'GEORGE user communication transport should require operational value'
)

assert(
  panel.includes('GEORGE Actions') &&
    panel.includes('GEORGE can'),
  'Post-LIVE surface should present executable GEORGE actions'
)

console.log('GEORGE user communication smoke passed')
