'use client'

import { useMemo, useState, type ReactNode } from 'react'

import {
  GEORGE_CONVERSATION_PRESENTATION,
  resolveGeorgeConversationTextScale,
  type GeorgeConversationMessageContext,
} from '@/lib/george/ui/conversation-capability-state'

type GeorgeConversationMessageProps = {
  role: 'assistant' | 'user'
  context: GeorgeConversationMessageContext
  children: ReactNode
  contentLength?: number
  collapsible?: boolean
  defaultExpanded?: boolean
  attachment?: ReactNode
  actions?: ReactNode
}

const COLLAPSE_THRESHOLD = 1200

function resolveSurfaceClass(
  role: GeorgeConversationMessageProps['role'],
  context: GeorgeConversationMessageContext
) {
  if (role === 'user') {
    return 'ml-auto self-end max-w-[min(82%,34rem)] rounded-[1.05rem] border border-white/[0.045] bg-white/[0.035] px-3.5 py-2.5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.16)]'
  }

  const tone = GEORGE_CONVERSATION_PRESENTATION[context.capability].messageTone

  if (tone === 'blue') {
    return 'max-w-[min(92%,44rem)] rounded-[1.15rem] border border-[#4668B8]/45 bg-[#101A36]/88 px-4 py-3 text-left shadow-[0_12px_34px_rgba(4,10,28,0.32)]'
  }

  if (tone === 'light_green') {
    return 'max-w-[min(92%,44rem)] rounded-[1.15rem] border border-[#7FB99A]/35 bg-[#10251D]/82 px-4 py-3 text-left shadow-[0_12px_34px_rgba(4,18,11,0.28)]'
  }

  return 'max-w-[min(92%,44rem)] rounded-[1.15rem] border border-white/[0.045] bg-white/[0.026] px-4 py-3 text-left shadow-[0_10px_28px_rgba(0,0,0,0.12)]'
}

export default function GeorgeConversationMessage({
  role,
  context,
  children,
  contentLength = 0,
  collapsible = true,
  defaultExpanded = false,
  attachment,
  actions,
}: GeorgeConversationMessageProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const shouldCollapse = collapsible && contentLength > COLLAPSE_THRESHOLD
  const textScale = resolveGeorgeConversationTextScale(context.phase)

  const textClass = useMemo(
    () =>
      textScale === 'collection'
        ? 'text-[17px] leading-[1.7] md:text-[17.5px]'
        : 'text-[15.5px] leading-[1.68] md:text-[15.8px]',
    [textScale]
  )

  return (
    <div
      className={`w-full max-w-full min-w-0 space-y-1 flex flex-col md:mx-auto md:max-w-[760px] ${
        role === 'user' ? 'items-end' : 'items-start'
      }`}
      data-george-capability={context.capability}
      data-george-message-phase={context.phase}
    >
      <div
        className={`relative whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-[Inter,ui-sans-serif,system-ui,sans-serif] tracking-[0.002em] text-[#D7DBE4]/92 ${textClass} ${resolveSurfaceClass(
          role,
          context
        )}`}
      >
        {attachment}

        <div
          className={
            shouldCollapse && !expanded
              ? 'relative max-h-[18rem] overflow-hidden after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-20 after:bg-gradient-to-t after:from-[rgba(7,9,14,0.98)] after:to-transparent'
              : undefined
          }
        >
          {children}
        </div>

        {shouldCollapse && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="relative z-[1] mt-3 text-[11px] font-medium tracking-[0.08em] text-[#D7DBE4]/48 transition hover:text-[#D7DBE4]/82"
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {actions}
    </div>
  )
}
