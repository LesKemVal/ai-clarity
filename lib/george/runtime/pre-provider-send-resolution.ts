import {
  resolveDomainRuntime,
  type GeorgeRuntimeDomain,
} from '@/lib/george/runtime/domain-router'
import { resolveTrainingRuntime } from '@/lib/george/runtime/training-runtime'

export type PreProviderSendMetadata = {
  detectedDomain: GeorgeRuntimeDomain | null
  activeDomain: GeorgeRuntimeDomain | null
  domain: {
    creditIntent?: string
    creditType?: string
    tradelineAdvice?: string
  }
}

type SharedResolutionFields = {
  guidedLine?: string
  systemContext?: string
  metadata: PreProviderSendMetadata
}

export type PreProviderSendResolution =
  | (SharedResolutionFields & {
      mode: 'provider'
    })
  | (SharedResolutionFields & {
      mode: 'provider_with_context'
      systemContext: string
    })
  | (SharedResolutionFields & {
      mode: 'return'
      response: string
      authority: 'training'
    })

export type ResolvePreProviderSendInput = {
  text: string
  activePromptContext?: string | null
  activeMemoryFolder?: string | null
  previousUserMessages?: string[]
}

/**
 * Canonical pre-provider send resolver.
 *
 * This resolver composes existing training and domain runtime owners.
 * It does not own LIVE behavior, response shaping, outcome strategy,
 * provider transport, message mutation, navigation, or UI state.
 *
 * Preserved precedence:
 * 1. Training-owned deterministic evaluation
 * 2. Domain context attached to canonical provider reasoning
 * 3. Ordinary canonical provider reasoning
 *
 * Training coaching and domain advice are not response authorities. Their
 * heuristic matches may contribute context, but operational user requests
 * continue through semantic proposal, Operational Judgment, and governed
 * execution.
 */
export function resolvePreProviderSend(
  input: ResolvePreProviderSendInput
): PreProviderSendResolution {
  const training = resolveTrainingRuntime({
    text: input.text,
    activePromptContext: input.activePromptContext ?? null,
  })

  const domain = resolveDomainRuntime({
    text: input.text,
    activeMemoryFolder: input.activeMemoryFolder,
    previousUserMessages: input.previousUserMessages,
  })

  const guidedLine = training.guidedLine || undefined
  const systemContext = domain.domainPrefix || undefined

  const metadata: PreProviderSendMetadata = {
    detectedDomain: domain.detectedDomain,
    activeDomain: domain.domain,
    domain: domain.metadata,
  }

  if (training.response) {
    return {
      mode: 'return',
      response: training.response,
      authority: 'training',
      guidedLine,
      systemContext,
      metadata,
    }
  }

  if (systemContext) {
    return {
      mode: 'provider_with_context',
      systemContext,
      guidedLine,
      metadata,
    }
  }

  return {
    mode: 'provider',
    guidedLine,
    metadata,
  }
}
