import {
  createDefaultOperationalFormulaEvolutionEngine,
} from './default-formula-evolution-engine'
import {
  createDefaultOperationalFormulaReassessmentEngine,
} from './default-formula-reassessment-engine'
import type {
  OperationalFormulaEvolutionEngine,
  OperationalFormulaEvolutionResult,
} from './formula-evolution-engine'
import {
  extractOperationalFormulas,
  type OperationalFormulaExtractionOptions,
} from './formula-extractor'
import type { OperationalFormulaLibrary } from './formula-library'
import type {
  OperationalFormulaReassessmentEngine,
} from './formula-reassessment-engine'
import type { OperationalScriptExecutionRecorder } from './script-execution-recorder'
import {
  createOperationalScriptGenerator,
  type OperationalScriptGenerator,
} from './script-generator'
import type { OperationalScriptLibrary } from './script-library'
import {
  validateOperationalFormula,
  type OperationalFormulaValidationPolicy,
  type OperationalFormulaValidationResult,
} from './formula-validator'
import type {
  ConversationRecord,
  FormulaRetrievalContext,
  OperationalFormulaLineage,
  OperationalFormulaReassessment,
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
  reassessedCount: number
  evolvedCount: number
  generatedScripts: OperationalScript[]
  executionIds: string[]
  validations: OperationalFormulaValidationResult[]
  reassessments: OperationalFormulaReassessment[]
  evolutions: OperationalFormulaEvolutionResult[]
  lineages: OperationalFormulaLineage[]
}

export type OperationalMemoryDependencies = {
  formulaLibrary: OperationalFormulaLibrary
  scriptGenerator?: OperationalScriptGenerator
  scriptLibrary?: OperationalScriptLibrary
  scriptExecutionRecorder?: OperationalScriptExecutionRecorder
  formulaReassessmentEngine?: OperationalFormulaReassessmentEngine
  formulaEvolutionEngine?: OperationalFormulaEvolutionEngine
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
    formulaReassessmentEngine =
      createDefaultOperationalFormulaReassessmentEngine(),
    formulaEvolutionEngine =
      createDefaultOperationalFormulaEvolutionEngine(),
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
      const reassessments: OperationalFormulaReassessment[] = []
      const evolutions: OperationalFormulaEvolutionResult[] = []
      const lineages: OperationalFormulaLineage[] = []

      let savedCount = 0
      let skippedCount = 0
      let persistedCount = 0
      let evolvedCount = 0

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

        let execution: OperationalScriptExecution | undefined

        if (scriptExecutionRecorder) {
          const now = Date.now()

          execution = {
            id: crypto.randomUUID(),
            conversationId: record.id,
            userId: record.userId,
            organizationId: record.organizationId,
            scriptId: generatedScript.id,
            scriptVersion: generatedScript.version,
            formulaId: validation.formula.id,
            formulaVersion: validation.formula.version,
            startedAt: now,
            endedAt: record.endedAt,
            deviations: [],
            outcomes: record.outcomes,
            createdAt: now,
          }

          await scriptExecutionRecorder.save(execution)
          executionIds.push(execution.id)
        }

        const reassessment = await formulaReassessmentEngine.reassess({
          formula: validation.formula,
          conversation: record,
          scriptExecution: execution,
        })

        reassessments.push(reassessment)

        const evolution = await formulaEvolutionEngine.evolve({
          formula: validation.formula,
          conversation: record,
          reassessment,
          scriptExecution: execution,
        })

        evolutions.push(evolution)

        if (evolution.formula) {
          await formulaLibrary.save(evolution.formula)
          evolvedCount += 1
        }

        if (evolution.lineage) {
          lineages.push(evolution.lineage)
        }
      }

      return {
        conversationId: record.id,
        extractedCount: candidates.length,
        savedCount,
        skippedCount,
        generatedCount: generatedScripts.length,
        persistedCount,
        reassessedCount: reassessments.length,
        evolvedCount,
        generatedScripts,
        executionIds,
        validations,
        reassessments,
        evolutions,
        lineages,
      }
    },
  }
}
