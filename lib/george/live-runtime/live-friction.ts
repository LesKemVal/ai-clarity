export function scoreLiveFriction(text: string) {
  const lower = text.toLowerCase()
  let score = 0

  if (lower.includes("not sure") || lower.includes("not certain")) score += 2
  if (lower.includes("won’t work") || lower.includes("wont work")) score += 3
  if (lower.includes("we usually don’t") || lower.includes("we usually dont")) score += 2
  if (lower.includes("what do you want to do")) score += 3
  if (lower.includes("where do we go from here")) score += 3
  if (lower.includes("maybe")) score += 1
  if (lower.includes("i guess")) score += 1

  return score
}

export function detectLiveFriction(text: string) {
  const lower = text.toLowerCase()

  return (
    lower.includes("that won’t work") ||
    lower.includes("that wont work") ||
    lower.includes("i’m not sure") ||
    lower.includes("im not sure") ||
    lower.includes("we usually don’t") ||
    lower.includes("we usually dont") ||
    lower.includes("what do you want to do") ||
    lower.includes("where do we go from here")
  )
}
