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
  createOperationalFormulaDerivationService,
  type OperationalFormulaDerivationInput,
  type OperationalFormulaDerivationResult,
  type OperationalFormulaDerivationService,
} from './formula-derivation-service'
import {
  extractOperationalFormulas,
  type OperationalFormulaExtractionOptions,
} from './formula-extractor'
import type { OperationalFormulaLibrary } from './formula-library'
import type { OperationalLearningRecordRecorder } from './learning-record-recorder'
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
  formulaDerivationService?: OperationalFormulaDerivationService
  learningRecordRecorder?: OperationalLearningRecordRecorder
}

export type OperationalMemoryLearnOptions = {
  extraction?: OperationalFormulaExtractionOptions
  validation?: Partial<OperationalFormulaValidationPolicy>
}

export type OperationalRecommendationInput = FormulaRetrievalContext & {
  formulaLimit?: number
  alternativeLimit?: number
  priorFormulaId?: string
  briefingComplete?: boolean
}

export type OperationalRecommendationStrategyStatus =
  | 'initial'
  | 'confirmed'
  | 'refined'

export type OperationalRecommendation = {
  recommendedFormula: RetrievedOperationalFormula | null
  recommendedScript: OperationalScript | null
  alternativeFormulas: RetrievedOperationalFormula[]
  contextualConfidence: number
  reasons: string[]
  strategyStatus: OperationalRecommendationStrategyStatus
  recommendationSummary: string
  reviewRequired: boolean
}

export type OperationalMemory = {
  retrieve(
    context: FormulaRetrievalContext
  ): Promise<RetrievedOperationalFormula[]>
  recommend(
    input: OperationalRecommendationInput
  ): Promise<OperationalRecommendation>
  derive(
    input: OperationalFormulaDerivationInput
  ): Promise<OperationalFormulaDerivationResult>
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
    formulaDerivationService =
      createOperationalFormulaDerivationService({
        formulaLibrary,
        learningRecordRecorder: dependencies.learningRecordRecorder,
      }),
    learningRecordRecorder,
  } = dependencies

  return {
    retrieve(context) {
      return formulaLibrary.retrieve(context)
    },

    async recommend(input) {
      const formulaLimit = Math.max(
        1,
        input.formulaLimit ?? input.limit ?? 5
      )
      const alternativeLimit = Math.max(
        0,
        input.alternativeLimit ?? Math.max(0, formulaLimit - 1)
      )

      const rankedFormulas = await formulaLibrary.retrieve({
        userId: input.userId,
        organizationId: input.organizationId,
        roomType: input.roomType,
        objectiveType: input.objectiveType,
        observedSignalTypes: input.observedSignalTypes,
        limit: formulaLimit,
      })

      const recommendedFormula = rankedFormulas[0] ?? null
      const alternativeFormulas = rankedFormulas
        .slice(1, alternativeLimit + 1)

      let recommendedScript: OperationalScript | null = null

      if (recommendedFormula && scriptLibrary) {
        const ownedScripts = await scriptLibrary.listByOwner(input.userId)

        recommendedScript =
          ownedScripts
            .filter(
              (script) =>
                script.status === 'active' &&
                script.formulaId === recommendedFormula.formula.id &&
                script.formulaVersion === recommendedFormula.formula.version
            )
            .sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null
      }

      const priorFormulaId = String(input.priorFormulaId || '').trim()
      const recommendedFormulaId = recommendedFormula?.formula.id || ''

      const strategyStatus: OperationalRecommendationStrategyStatus =
        !input.briefingComplete
          ? 'initial'
          : priorFormulaId && priorFormulaId === recommendedFormulaId
            ? 'confirmed'
            : priorFormulaId && recommendedFormulaId
              ? 'refined'
              : 'confirmed'

      const recommendationSummary = !recommendedFormula
        ? input.briefingComplete
          ? 'GEORGE is preparing the strongest strategy from the briefing.'
          : 'GEORGE is preparing an initial strategy from the available context.'
        : strategyStatus === 'refined'
          ? 'Based on the briefing, GEORGE recommends a refined strategy.'
          : strategyStatus === 'confirmed'
            ? 'The briefing supports the current strategy.'
            : 'This is the initial strategy based on the available conversation context.'

      return {
        recommendedFormula,
        recommendedScript,
        alternativeFormulas,
        contextualConfidence: recommendedFormula?.score ?? 0,
        reasons: recommendedFormula?.reasons ?? [],
        strategyStatus,
        recommendationSummary,
        reviewRequired: recommendedFormula !== null,
      }
    },

    derive(input) {
      return formulaDerivationService.derive(input)
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

        if (learningRecordRecorder) {
          await learningRecordRecorder.saveReassessment(reassessment)
        }

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

          if (learningRecordRecorder) {
            await learningRecordRecorder.saveLineage(evolution.lineage)
          }
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
