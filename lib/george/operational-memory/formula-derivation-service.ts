import 'server-only'

import type { OperationalFormulaLibrary } from './formula-library'
import type { OperationalLearningRecordRecorder } from './learning-record-recorder'
import type {
  OperationalFormula,
  OperationalFormulaLineage,
  OperationalFormulaStep,
} from './types'

export type OperationalFormulaDerivationChanges = {
  name?: string
  roomTypes?: string[]
  objectiveTypes?: string[]
  prerequisites?: string[]
  steps?: OperationalFormulaStep[]
  failureConditions?: string[]
  bestUsedFor?: string[]
}

export type OperationalFormulaDerivationInput = {
  parent: OperationalFormula
  userId: string
  changes: OperationalFormulaDerivationChanges
  reasons?: string[]
  now?: number
}

export type OperationalFormulaDerivationResult = {
  formula: OperationalFormula
  lineage: OperationalFormulaLineage
}

export type OperationalFormulaDerivationService = {
  derive(
    input: OperationalFormulaDerivationInput
  ): Promise<OperationalFormulaDerivationResult>
}

export type OperationalFormulaDerivationDependencies = {
  formulaLibrary: OperationalFormulaLibrary
  learningRecordRecorder?: OperationalLearningRecordRecorder
}

function normalizeUserId(value: string) {
  return value.trim().toLowerCase()
}

export function createOperationalFormulaDerivationService(
  dependencies: OperationalFormulaDerivationDependencies
): OperationalFormulaDerivationService {
  const { formulaLibrary, learningRecordRecorder } = dependencies

  return {
    async derive(input) {
      const userId = normalizeUserId(input.userId)

      if (!userId) {
        throw new Error('Operational formula derivation requires a user')
      }

      const now = input.now ?? Date.now()
      const childFormulaId = crypto.randomUUID()

      const formula: OperationalFormula = {
        ...input.parent,
        ...input.changes,
        id: childFormulaId,
        version: 1,
        scope: 'personal',
        ownerId: userId,
        visibility: 'private',
        status: 'candidate',
        origin: 'derived',
        parentFormulaId: input.parent.id,
        uses: 0,
        verification: undefined,
        publication: undefined,
        confidence: 0.5,
        sampleCount: 0,
        successCount: 0,
        contradictionCount: 0,
        unknownCount: 0,
        reuseCount: 0,
        evidence: [],
        createdAt: now,
        updatedAt: now,
      }

      const lineage: OperationalFormulaLineage = {
        id: crypto.randomUUID(),
        kind: 'derived',
        source: 'user_edit',
        parentFormulaIds: [input.parent.id],
        childFormulaId,
        createdByUserId: userId,
        reasons:
          input.reasons?.length
            ? [...input.reasons]
            : ['user_derived_formula'],
        createdAt: now,
      }

      await formulaLibrary.save(formula)

      if (learningRecordRecorder) {
        await learningRecordRecorder.saveLineage(lineage)
      }

      return {
        formula,
        lineage,
      }
    },
  }
}
