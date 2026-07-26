import {
  extractOperationalFormulas,
  type OperationalFormulaExtractionOptions,
} from './formula-extractor'
import type { OperationalFormulaLibrary } from './formula-library'
import type { OperationalScriptLibrary } from './script-library'
import type { OperationalScriptExecutionRecorder } from './script-execution-recorder'
import {
  createOperationalScriptGenerator,
  type OperationalScriptGenerator,
} from './script-generator'
import {
  validateOperationalFormula,
  type OperationalFormulaValidationPolicy,
  type OperationalFormulaValidationResult,
} from './formula-validator'
import type {
  ConversationRecord,
  FormulaRetrievalContext,
  OperationalScript,
  OperationalScriptExecution,
  RetrievedOperationalFormula,
} from './types'

export type OperationalMemoryLearningResult = {
  conversationId: string
  extractedCount: number
  savedCount: number
  skippedCount: number
  generatedCount: number
  persistedCount: number
  generatedScripts: OperationalScript[]
  executionIds: string[]
  validations: OperationalFormulaValidationResult[]
}

export type OperationalMemoryDependencies = {
  formulaLibrary: OperationalFormulaLibrary
  scriptGenerator?: OperationalScriptGenerator
  scriptLibrary?: OperationalScriptLibrary
  scriptExecutionRecorder?: OperationalScriptExecutionRecorder
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
  const {
    formulaLibrary,
    scriptGenerator = createOperationalScriptGenerator(),
    scriptLibrary,
    scriptExecutionRecorder,
  } = dependencies

  return {
    retrieve(context) {
      return formulaLibrary.retrieve(context)
    },

    async learn(record, options = {}) {
      const candidates = extractOperationalFormulas(record, options.extraction)
      const validations: OperationalFormulaValidationResult[] = []
      const generatedScripts: OperationalScript[] = []
      const executionIds: string[] = []
      let savedCount = 0
      let skippedCount = 0
      let persistedCount = 0

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

        const generatedScript = await scriptGenerator.generate(
          validation.formula
        )
        generatedScripts.push(generatedScript)

        if (scriptLibrary) {
          await scriptLibrary.save(generatedScript)
          persistedCount += 1
        }

        if (scriptExecutionRecorder) {
          const execution: OperationalScriptExecution = {
            id: crypto.randomUUID(),
            conversationId: record.id,
            userId: record.userId,
            scriptId: generatedScript.id,
            scriptVersion: generatedScript.version,
            formulaId: validation.formula.id,
            formulaVersion: validation.formula.version,
            startedAt: Date.now(),
            endedAt: undefined,
            deviations: [],
            outcomes: [],
            createdAt: Date.now(),
          }

          await scriptExecutionRecorder.save(execution)

          executionIds.push(execution.id)
        }
      }

      return {
        conversationId: record.id,
        extractedCount: candidates.length,
        savedCount,
        skippedCount,
        generatedCount: generatedScripts.length,
        persistedCount,
        generatedScripts,
        executionIds,
        validations,
      }
    },
  }
}
