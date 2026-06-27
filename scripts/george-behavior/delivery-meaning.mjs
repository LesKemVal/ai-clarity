import fs from 'node:fs'

export function run() {
  const delivery = fs.readFileSync('lib/george/live-delivery/delivery-router.ts', 'utf8')

  if (delivery.includes('violatesEvidenceAuthority')) {
    throw new Error('Delivery still owns evidence authority.')
  }

  if (delivery.includes('safeContinuationReplacement')) {
    throw new Error('Delivery still owns continuation repair.')
  }

  return true
}
