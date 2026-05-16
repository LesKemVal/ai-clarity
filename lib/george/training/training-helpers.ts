export type TrainingTrack = 'drivers' | 'cdl' | 'ged' | 'cna'

export function detectTrainingTrack(raw: string): TrainingTrack | null {
  const value = raw.toLowerCase()
  if (/driver'?s license|drivers license|driver'?s test|driving test|permit|road test|dmv/.test(value)) return 'drivers'
  if (/cdl/.test(value)) return 'cdl'
  if (/ged/.test(value)) return 'ged'
  if (/cna/.test(value)) return 'cna'
  return null
}

export function trainingNeedsJurisdiction(raw: string) {
  return /driver|cdl|cna/.test(raw.toLowerCase())
}

export function extractAnswers(raw: string) {
  const matches = raw.match(/[A-Da-d]/g)
  if (!matches) return []
  return matches.map((m) => m.toUpperCase())
}

export function evaluateDrivers(answers: string[]) {
  return scoreAnswers(answers, ['C', 'B', 'C', 'B'], 'drivers')
}

export function evaluateCDL(answers: string[]) {
  return scoreAnswers(answers, ['B', 'B', 'B', null], 'cdl')
}

export function evaluateGED(answers: string[]) {
  return scoreAnswers(answers, ['B', 'B', 'B', null], 'ged')
}

export function evaluateCNA(answers: string[]) {
  return scoreAnswers(answers, ['B', 'C', null, null], 'cna')
}

export function scoreAnswers(answers: string[], correct: (string | null)[], track: TrainingTrack) {
  let score = 0
  const feedback: string[] = []

  for (let i = 0; i < correct.length; i++) {
    if (!correct[i]) continue
    if (answers[i] === correct[i]) score++
    else feedback.push(`Question ${i + 1} is incorrect.`)
  }

  return {
    score,
    total: correct.filter(Boolean).length,
    feedback,
    track,
  }
}

export function buildFollowUpQuestions(track: string, result: any) {
  const { score, total, feedback } = result
  let questions: string[] = []

  if (track === 'drivers') {
    if (feedback.some((f: string) => f.includes('1'))) questions.push('Who yields at a 4-way stop when two cars arrive at the same time?')
    if (feedback.some((f: string) => f.includes('2'))) questions.push('What is the difference between a flashing red and flashing yellow light?')
    if (feedback.some((f: string) => f.includes('3'))) questions.push('Can you cross a solid yellow line to pass under any condition?')
  }

  if (track === 'ged' && score === total) {
    questions = ['Solve: 2x + 3 = 11', 'What is the main idea of a paragraph?']
  }

  return questions.slice(0, 3)
}

export function appendFollowUp(response: string, track: string, result: any) {
  const followUps = buildFollowUpQuestions(track, result)
  if (!followUps.length) return response

  let block = '\n\nNext — answer these:\n'
  followUps.forEach((q, i) => {
    block += `${i + 1}. ${q}\n`
  })

  return response + block
}

export function buildEvaluationResponse(result: any) {
  const { score, total, feedback } = result

  let response = `Score: ${score}/${total}\n\n`

  if (score === total) response += 'Good. You are closer than you think. We push speed and consistency now.\n\n'
  else if (score >= total / 2) response += 'You are partially there. Weak areas need tightening.\n\n'
  else response += 'You are not ready yet. We build from the ground up.\n\n'

  if (feedback.length) response += 'Fix these:\n' + feedback.join('\n') + '\n\n'

  response += 'Next step coming.'
  return response
}

export function buildTrainingFollowThrough(raw: string, promptContext: string | null) {
  const text = raw.trim()
  if (!text || text.length < 12) return null

  let track: TrainingTrack | null = null

  if (promptContext === 'training_drivers_license') track = 'drivers'
  if (promptContext === 'training_cdl') track = 'cdl'
  if (promptContext === 'training_ged') track = 'ged'
  if (promptContext === 'training_cna') track = 'cna'
  if (!track) return null

  if (/[Aa]\.|[Bb]\.|[Cc]\.|[Dd]\.|^[A-D](\s|,|$)/m.test(text)) return null

  const hasNumbers = /\d/.test(text)
  const mentionsTime = /minute|minutes|hour|hours|day|days|week|weeks|month|months|daily|night|tonight|tomorrow/i.test(text)
  const mentionsWeakness = /weak|hard|struggle|avoid|math|reading|writing|science|signs|rules|recall|pre-trip|skills|road|confidence|anxiety/i.test(text)

  if (!hasNumbers && !mentionsTime && !mentionsWeakness) return null

  if (track === 'ged') return "Good. That is enough to begin. We start with consistency, not perfection. Keep the standard real and sustainable. Tonight, give me 25 focused minutes on the weakest subject instead of trying to fix everything at once. Be honest with yourself about why you're doing this, but you do not need to explain every private reason to me. Come back tomorrow and we’ll tighten the weakest area without dragging this out."
  if (track === 'cdl') return 'Good. That is enough to work with. We build one weak point at a time and keep your effort steady. Start with 20 focused minutes on the weakest area tonight—pre-trip, permit knowledge, skills, or road judgment. Do not scatter your effort. Come back tomorrow and we’ll tighten the next weak point.'
  if (track === 'drivers') return 'Good. You are closer than it feels. We keep this simple and consistent. Start with 20 focused minutes on signs, rules, or right-of-way—whichever is weakest. Do not try to cover the whole manual in one sitting. Come back tomorrow and we’ll sharpen the next piece.'
  if (track === 'cna') return 'Good. That is enough to begin properly. We go one weak point at a time and keep your confidence tied to repetition, not pressure. Start with 20 focused minutes on your weakest area tonight—knowledge, procedure flow, or confidence under testing. Come back tomorrow and we’ll tighten the next step.'

  return null
}

export function buildTrainingIntakeOverride(raw: string) {
  const track = detectTrainingTrack(raw)
  if (!track) return null

  const map: Record<TrainingTrack, string> = {
    drivers: "Good. Driving tests usually break into written, driving skill, or nerves. Which part is actually in front of you right now?",
    cdl: 'Good. CDL issues usually come down to permit, pre-trip, backing, or road. Which part are we dealing with right now?',
    ged: 'Good. GED pressure usually comes from math, reading, writing, science, or delay. Which part is the real problem right now?',
    cna: 'Good. CNA exams usually break into knowledge, skills, timing, or confidence. Which part is actually blocking you right now?',
  }

  return map[track] || null
}
