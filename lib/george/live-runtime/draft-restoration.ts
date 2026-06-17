export type GeorgeNormalDraftState = {
  messages?: unknown[]
  conversationMode?: string
  activePromptContext?: string
}

export type GeorgeNormalDraftRestoreResult =
  | {
      restored: false
      draft: null
    }
  | {
      restored: true
      draft: GeorgeNormalDraftState
      messages: unknown[]
      conversationMode?: string
      activePromptContext?: string
    }

export function readGeorgeNormalDraft(storageKey: string): GeorgeNormalDraftRestoreResult {
  if (typeof window === 'undefined') {
    return {
      restored: false,
      draft: null,
    }
  }

  let draft: GeorgeNormalDraftState | null = null

  try {
    const rawDraft = window.localStorage.getItem(storageKey)
    draft = rawDraft ? JSON.parse(rawDraft) : null
  } catch {
    draft = null
  }

  if (!draft || !Array.isArray(draft.messages) || draft.messages.length === 0) {
    return {
      restored: false,
      draft: null,
    }
  }

  window.localStorage.removeItem(storageKey)

  return {
    restored: true,
    draft,
    messages: draft.messages,
    conversationMode: typeof draft.conversationMode === 'string' ? draft.conversationMode : undefined,
    activePromptContext: typeof draft.activePromptContext === 'string' ? draft.activePromptContext : undefined,
  }
}
