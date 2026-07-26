import 'server-only'

import {
  adaptConversationRecordForOperationalMemory,
  type OperationalConversationRecordAdapterInput,
} from './conversation-record-adapter'
import { createOperationalMemory } from './operational-memory'
import { createRedisOperationalFormulaLibrary } from './redis-formula-library'

export type PersistOperationalLearningInput = Omit<
  OperationalConversationRecordAdapterInput,
  'userId'
> & {
  userId: string
}

export async function persistOperationalLearning(
  input: PersistOperationalLearningInput
) {
  const userId = String(input.userId || '').trim().toLowerCase()

  if (!userId) {
    throw new Error('Operational learning requires an authenticated user')
  }

  const operationalRecord = adaptConversationRecordForOperationalMemory({
    ...input,
    userId,
  })

  const operationalMemory = createOperationalMemory({
    formulaLibrary: createRedisOperationalFormulaLibrary(),
  })

  return operationalMemory.learn(operationalRecord)
}
