import {
  extractOperationalFormulas,
  type OperationalFormulaExtractionOptions,
} from './formula-extractor'
import type { OperationalFormulaLibrary } from './formula-library'
import {
  validateOperationalFormula,
  type OperationalFormulaValidationPolicy,
  type OperationalFormulaValidationResult,
} from './formula-validator'
import type {
  ConversationRecord,
  FormulaRetrievalContext,
  RetrievedOperationalFormula,
} from './types'

export type OperationalMemoryLearningResult = {
  conversationId: string
  extractedCount: number
  savedCount: number
  skippedCount: number
  validations: OperationalFormulaValidationResult[]
}

export type OperationalMemoryDependencies = {
  formulaLibrary: OperationalFormulaLibrary
}

export type OperationalMemoryLearnOptions = {
  extraction?: OperationalFormulaExtractionOptions
  validation?: Partial<OperationalFormulaValidationPolicy>
}

export type OperationalMemory = {
  retrieve(
    context: FormulaRetrievalContext
  ): Promise<RetrievedOperationalFormula[]>
  learn(
    record: ConversationRecord,
    options?: OperationalMemoryLearnOptions
  ): Promise<OperationalMemoryLearningResult>
}

export function createOperationalMemory(
  dependencies: OperationalMemoryDependencies
): OperationalMemory {
  const { formulaLibrary } = dependencies

  return {
    retrieve(context) {
      return formulaLibrary.retrieve(context)
    },

    async learn(record, options = {}) {
      const candidates = extractOperationalFormulas(record, options.extraction)
      const validations: OperationalFormulaValidationResult[] = []
      let savedCount = 0
      let skippedCount = 0

      for (const candidate of candidates) {
        const existing = await formulaLibrary.getById(candidate.id)
        const validation = validateOperationalFormula(
          existing,
          candidate,
          options.validation
        )

        validations.push(validation)

        if (!validation.changed) {
          skippedCount += 1
          continue
        }

        await formulaLibrary.save(validation.formula)
        savedCount += 1
      }

      return {
        conversationId: record.id,
        extractedCount: candidates.length,
        savedCount,
        skippedCount,
        validations,
      }
    },
  }
}
