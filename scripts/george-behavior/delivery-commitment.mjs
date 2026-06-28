import fs from 'node:fs'
import {
  GEORGE_OPERATIONAL_BRIDGES,
  evaluateGeorgeDeliveryCommitment,
  isGeorgeOperationalBridge,
} from '../../lib/george/live-delivery/delivery-commitment.ts'

export function run() {
  const failed = []

  const first = evaluateGeorgeDeliveryCommitment({
    current: null,
    candidate: {
      text: 'Ask what evidence would make the timeline credible.',
      now: 100,
      confidence: 0.72,
      priority: 4,
    },
  })

  if (first.action !== 'arm') {
    failed.push('First valid line should arm.')
  }

  const minorReplacement = evaluateGeorgeDeliveryCommitment({
    current: {
      text: 'Ask what evidence would make the timeline credible.',
      armedAt: 100,
      confidence: 0.72,
      priority: 4,
    },
    candidate: {
      text: 'Ask which proof would make the timeline more credible.',
      now: 450,
      generatedAt: 100,
      confidence: 0.76,
      priority: 4,
    },
  })

  if (minorReplacement.action !== 'keep_armed') {
    failed.push('Minor improvement should not replace an armed line.')
  }

  const majorReplacement = evaluateGeorgeDeliveryCommitment({
    current: {
      text: 'Ask what evidence would make the timeline credible.',
      armedAt: 100,
      confidence: 0.72,
      priority: 4,
    },
    candidate: {
      text: 'Ask which proof would earn the next investor conversation.',
      now: 650,
      generatedAt: 100,
      confidence: 0.94,
      priority: 7,
    },
  })

  if (majorReplacement.action !== 'replace') {
    failed.push('Material improvement inside deadline should replace armed line.')
  }

  const lateReplacement = evaluateGeorgeDeliveryCommitment({
    current: {
      text: 'Ask what evidence would make the timeline credible.',
      armedAt: 100,
      confidence: 0.72,
      priority: 4,
    },
    candidate: {
      text: 'Ask which proof would earn the next investor conversation.',
      now: 1800,
      generatedAt: 100,
      confidence: 0.94,
      priority: 7,
    },
  })

  if (lateReplacement.action !== 'keep_armed') {
    failed.push('Late improvement should not replace timely authenticity.')
  }

  const committedReplacement = evaluateGeorgeDeliveryCommitment({
    current: {
      text: 'Ask what evidence would make the timeline credible.',
      armedAt: 100,
      committed: true,
      deliveryStarted: true,
      confidence: 0.72,
      priority: 4,
    },
    candidate: {
      text: 'Ask which proof would earn the next investor conversation.',
      now: 300,
      generatedAt: 100,
      confidence: 0.99,
      priority: 9,
      materiallyBetter: true,
    },
  })

  if (committedReplacement.action !== 'keep_committed') {
    failed.push('Committed delivery should never be replaced.')
  }

  if (GEORGE_OPERATIONAL_BRIDGES.some((bridge) => /slow down/i.test(bridge))) {
    failed.push('Bridge library should not include Slow down.')
  }

  for (const bridge of ['Say...', 'Ask why...', 'Find out...', 'Did you notice...', 'Try not to miss...']) {
    if (!isGeorgeOperationalBridge(bridge)) {
      failed.push(`Bridge phrase missing: ${bridge}`)
    }
  }

  const router = fs.readFileSync('lib/george/live-delivery/delivery-router.ts', 'utf8')
  if (/reassess\|slow\|pause/.test(router)) {
    failed.push('Delivery router still treats slow as an imperative cue pattern.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
