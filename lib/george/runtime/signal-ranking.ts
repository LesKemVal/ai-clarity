export type RankedSignal = {
  name: string
  score: number
}

export function rankSignals(text: string): RankedSignal[] {
  const t = text.toLowerCase()

  const signals: RankedSignal[] = []

  if (/churn|customer loss|retention/.test(t)) {
    signals.push({ name: 'customer_churn', score: 90 })
  }

  if (/revenue|sales decline|revenue drop|10%/.test(t)) {
    signals.push({ name: 'revenue_decline', score: 75 })
  }

  if (/ceo|board|investor|decision maker/.test(t)) {
    signals.push({ name: 'authority', score: 85 })
  }

  if (/deadline|last chance|final round/.test(t)) {
    signals.push({ name: 'risk', score: 80 })
  }

  if (/relationship|second meeting|future opportunity|access/.test(t)) {
    signals.push({ name: 'outcome_asset', score: 88 })
  }

  return signals.sort((a, b) => b.score - a.score)
}
