export type RuntimeControlMode = 'auto' | 'on' | 'off'

export type RuntimeControlModes = {
  adaptiveLearning: RuntimeControlMode
  continuity: RuntimeControlMode
  durableMemory: RuntimeControlMode
  earbudCompression: RuntimeControlMode
}

export const DEFAULT_RUNTIME_CONTROL_MODES: RuntimeControlModes = {
  adaptiveLearning: 'auto',
  continuity: 'auto',
  durableMemory: 'auto',
  earbudCompression: 'auto',
}

export function resolveRuntimeControlMode(
  mode: RuntimeControlMode,
  georgeDecision: boolean
) {
  if (mode === 'on') return true
  if (mode === 'off') return false

  return georgeDecision
}
