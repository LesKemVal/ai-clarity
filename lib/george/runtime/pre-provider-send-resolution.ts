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
      mode: 'direct'
      response: string
      authority: 'training' | 'domain'
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
 * 1. Training-owned early return
 * 2. Training-owned direct override
 * 3. Domain-owned direct override
 * 4. Domain context attached to provider generation
 * 5. Ordinary provider generation
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

  if (training.override) {
    return {
      mode: 'direct',
      response: training.override,
      authority: 'training',
      guidedLine,
      systemContext,
      metadata,
    }
  }

  if (domain.firstResponseOverride) {
    return {
      mode: 'direct',
      response: domain.firstResponseOverride,
      authority: 'domain',
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
