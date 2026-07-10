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

export function getPostResponseSuggestedPrompts(input: {
  userInput: string
  assistantResponse: string
  messages: PromptMessage[]
  tier: 'smart' | 'intelligent' | 'brilliant'
}): PromptSelection[] {
  const prompts: PromptSelection[] = []

  const recent = input.messages
    .slice(-4)
    .map((message) => message.content)
    .join(' ')
    .toLowerCase()

  const constrainedResponse =
    input.tier === 'smart' &&
    /i’m going to give you the right direction here, but i’m not carrying this fully in this mode/i.test(
      input.assistantResponse
    )

  if (constrainedResponse) {
    return [
      {
        label: 'Work around this',
        text: 'Give me the best workaround you can carry in Smart.',
        context: 'smart_workaround',
      },
      {
        label: 'Lighter version',
        text: 'Break this into the lighter version you can carry right now.',
        context: 'smart_lighter_version',
      },
      {
        label: 'Smaller first move',
        text: 'What is the strongest first move you can give me in this mode?',
        context: 'smart_first_move',
      },
      {
        label: 'Make G. Intelligent',
        text: 'Take me to Intelligent level support.',
        context: 'upgrade_intelligent',
      },
      {
        label: 'Pricing',
        text: 'Show me the upgrade path for deeper support.',
        context: 'upgrade_topup',
      },
    ]
  }

  if (
    /build|app|product|platform/i.test(input.userInput) ||
    /build|app|product/.test(recent)
  ) {
    prompts.push(
      {
        label: 'Define user',
        text: 'Who is the exact user for this?',
        context: 'clarify audience',
      },
      {
        label: 'Core problem',
        text: 'What is the one core problem this solves?',
        context: 'focus problem',
      }
    )
  }

  if (
    /money|income|revenue|make money/i.test(input.userInput) ||
    /money|income/.test(recent)
  ) {
    prompts.push({
      label: 'Fast revenue',
      text: 'What is the fastest way to get paid for this?',
      context: 'monetization',
    })
  }

  if (prompts.length === 0) {
    prompts.push({
      label: 'Next step',
      text: 'What is the next step from here?',
      context: 'progress',
    })
  }

  const fallbackPrompts: PromptSelection[] = [
    {
      label: 'Clarify goal',
      text: 'What are we actually trying to achieve here?',
      context: 'clarity',
    },
    {
      label: 'Constraints',
      text: 'What constraints matter most here?',
      context: 'constraints',
    },
    {
      label: 'Clarify',
      text: 'Can we simplify this into one clear move?',
      context: 'simplify',
    },
    {
      label: 'Better question',
      text: 'What is the better question to ask right now?',
      context: 'better_question',
    },
  ]

  for (const prompt of fallbackPrompts) {
    if (
      prompts.length < 5 &&
      !prompts.some((candidate) => candidate.label === prompt.label)
    ) {
      prompts.push(prompt)
    }
  }

  return prompts.filter((prompt) => {
    const label = prompt.label.toLowerCase()

    if (label.includes('next step') && prompts.length > 3) return false
    if (label.includes('clarify goal') && prompts.length > 4) return false

    return true
  })
}

export function getReroutePrompt(input: {
  userInput: string
  assistantResponse: string
  messages: PromptMessage[]
}): PromptSelection | null {
  const recent = input.messages
    .slice(-6)
    .map((message) => message.content)
    .join(' ')
    .toLowerCase()

  const current =
    `${input.userInput} ${input.assistantResponse}`.toLowerCase()

  const weakSignals = [
    /i don't know/,
    /not sure/,
    /maybe/,
    /stuck/,
    /confused/,
    /overwhelmed/,
    /nothing works/,
    /i need money/,
    /make money fast/,
    /build an app and also/,
    /too many things/,
    /all over the place/,
  ]

  const matched = weakSignals.some(
    (pattern) => pattern.test(current) || pattern.test(recent)
  )

  return matched
    ? {
        label: 'New strategy',
        text: 'New strategy',
        context: 'reroute',
      }
    : null
}

