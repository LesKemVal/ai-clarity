function expandMoneyAbbreviation(match: string, amount: string, unit: string) {
  const cleanAmount = amount.replace(/,/g, '')
  const suffix = unit.toUpperCase()

  const word =
    suffix === 'K'
      ? 'thousand'
      : suffix === 'M'
        ? 'million'
        : suffix === 'B'
          ? 'billion'
          : suffix === 'T'
            ? 'trillion'
            : ''

  if (!word) return match

  return `${cleanAmount} ${word} dollars`
}

export function normalizeTextForSpeech(text: string) {
  return String(text || '')
    .replace(/\$([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)([KMBT])\b/gi, expandMoneyAbbreviation)
    .replace(/\b([0-9]+(?:\.[0-9]+)?)([KMBT])\s+dollars\b/gi, (_match, amount, unit) => {
      const suffix = String(unit).toUpperCase()
      const word =
        suffix === 'K'
          ? 'thousand'
          : suffix === 'M'
            ? 'million'
            : suffix === 'B'
              ? 'billion'
              : suffix === 'T'
                ? 'trillion'
                : ''
      return word ? `${amount} ${word} dollars` : _match
    })
    .replace(/\b([0-9]+(?:\.[0-9]+)?)\s*%\b/g, '$1 percent')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeGeorgeBrandForSpeech(value: string) {
  return String(value || '')
    .replace(/\bGEORGE\b/g, 'George')
    .replace(/\bBRANESx\b/g, 'Brains')
}
