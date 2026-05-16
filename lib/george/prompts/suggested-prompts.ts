export type PromptSelection = {
  label: string
  text: string
  context: string
}

type PromptMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string
}

export function getSuggestedPromptsFromMessage(input: string): PromptSelection[] {
  const value = input.toLowerCase()
  const hasAny = (...terms: string[]) => terms.some((term) => value.includes(term))

  if (hasAny('money', '$', 'income', 'paid', 'paycheck', 'cash', 'bills', 'broke')) {
    return [
      { label: 'Make money this week', text: 'Give me one way to make money this week.', context: 'money_this_week' },
      { label: 'Make $500 fast', text: 'How can I make $500 fast without doing anything illegal or reckless?', context: 'money_fast_safe' },
      { label: 'Skill to income', text: 'Help me turn one skill into income.', context: 'money_skill_to_income' },
    ]
  }

  if (hasAny('job', 'decision', 'choose', 'option', 'should i', 'which one', 'compare')) {
    return [
      { label: 'Make a decision', text: 'Help me make a decision.', context: 'decision_support' },
      { label: 'Compare options', text: 'Compare these options and tell me which is stronger.', context: 'decision_comparison' },
      { label: 'Next move', text: 'What is the smartest next move here?', context: 'decision_next_move' },
    ]
  }

  if (hasAny('business', 'build', 'product', 'app', 'start', 'launch', 'mvp', 'project')) {
    return [
      { label: 'Start building', text: 'Help me start building this.', context: 'build_start' },
      { label: '1-week plan', text: 'Build me a small plan I can execute this week.', context: 'build_week_plan' },
      { label: 'First steps', text: 'Break this into the first real steps.', context: 'build_first_steps' },
    ]
  }

  if (hasAny('message', 'email', 'text', 'rewrite', 'wording', 'say this', 'reply')) {
    return [
      { label: 'Fix message', text: 'Fix this message.', context: 'writing_fix_message' },
      { label: 'Make it stronger', text: 'Rewrite this so it sounds stronger and clearer.', context: 'writing_stronger_clearer' },
      { label: 'Say it better', text: 'Help me say this better without changing the meaning.', context: 'writing_preserve_meaning' },
    ]
  }

  if (hasAny('bible', 'scripture', 'verse', 'kjv', 'proverbs', 'ecclesiastes', 'matthew', 'john')) {
    return []
  }

  if (hasAny('stuck', 'problem', 'confused', 'overlooked', 'missed', 'wrong', 'issue', 'mess')) {
    return [
      { label: 'Untangle', text: 'Help me untangle this problem.', context: 'problem_untangle' },
      { label: 'Step by step', text: 'Break this down step by step.', context: 'problem_step_by_step' },
      { label: 'Blind spots', text: 'Tell me what I am not seeing here.', context: 'problem_blind_spots' },
    ]
  }

  return []
}

export function getSuggestedPromptsFromMessages(messages: PromptMessage[], currentInput: string): PromptSelection[] {
  const recentUserText = messages
    .filter((m) => m.role === 'user')
    .slice(-4)
    .map((m) => m.content)
    .join(' \n ')
    .trim()

  const combined = `${recentUserText} ${currentInput}`.trim()
  return getSuggestedPromptsFromMessage(combined)
}

export function samePromptSet(a: PromptSelection[], b: PromptSelection[]) {
  if (a.length !== b.length) return false
  return a.every((item, index) =>
    item.label === b[index]?.label &&
    item.text === b[index]?.text &&
    item.context === b[index]?.context
  )
}
