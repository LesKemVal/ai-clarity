import {
  DEFAULT_RUNTIME_CONTROL_MODES,
  resolveRuntimeControlMode,
  type RuntimeControlModes,
} from '@/lib/george/runtime/runtime-control-modes'

export type ResolvedRuntimeControls = {
  adaptiveLearningEnabled: boolean
  continuityEnabled: boolean
  durableMemoryEnabled: boolean
  earbudCompressionEnabled: boolean
}

export function resolveRuntimeControls(input?: {
  modes?: Partial<RuntimeControlModes>
  george?: Partial<ResolvedRuntimeControls>
}): ResolvedRuntimeControls {
  const modes = {
    ...DEFAULT_RUNTIME_CONTROL_MODES,
    ...(input?.modes ?? {}),
  }

  const george = {
    adaptiveLearningEnabled:
      input?.george?.adaptiveLearningEnabled ?? true,

    continuityEnabled:
      input?.george?.continuityEnabled ?? true,

    durableMemoryEnabled:
      input?.george?.durableMemoryEnabled ?? true,

    earbudCompressionEnabled:
      input?.george?.earbudCompressionEnabled ?? true,
  }

  return {
    adaptiveLearningEnabled: resolveRuntimeControlMode(
      modes.adaptiveLearning,
      george.adaptiveLearningEnabled
    ),

    continuityEnabled: resolveRuntimeControlMode(
      modes.continuity,
      george.continuityEnabled
    ),

    durableMemoryEnabled: resolveRuntimeControlMode(
      modes.durableMemory,
      george.durableMemoryEnabled
    ),

    earbudCompressionEnabled: resolveRuntimeControlMode(
      modes.earbudCompression,
      george.earbudCompressionEnabled
    ),
  }
}
