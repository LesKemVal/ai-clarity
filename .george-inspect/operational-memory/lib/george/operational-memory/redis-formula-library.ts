import 'server-only'

import { getRedis } from '@/lib/storage/redis'
import {
  rankOperationalFormulas,
  type OperationalFormulaLibrary,
} from './formula-library'
import type {
  FormulaRetrievalContext,
  OperationalFormula,
} from './types'

const FORMULA_INDEX_KEY = 'george:operational-memory:formula-ids:v1'
const FORMULA_KEY_PREFIX = 'george:operational-memory:formula:v1:'

function formulaKey(id: string) {
  return `${FORMULA_KEY_PREFIX}${encodeURIComponent(id)}`
}

function parseFormula(raw: string | null): OperationalFormula | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as OperationalFormula

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.id !== 'string' ||
      !parsed.id.trim()
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

async function loadAllFormulas(): Promise<OperationalFormula[]> {
  const redis = getRedis()
  const ids = await redis.sMembers(FORMULA_INDEX_KEY)

  if (ids.length === 0) return []

  const values = await Promise.all(
    ids.map((id) => redis.get(formulaKey(id)))
  )

  return values
    .map(parseFormula)
    .filter((formula): formula is OperationalFormula => formula !== null)
}

export function createRedisOperationalFormulaLibrary(): OperationalFormulaLibrary {
  return {
    async retrieve(context: FormulaRetrievalContext) {
      const formulas = await loadAllFormulas()
      return rankOperationalFormulas(formulas, context)
    },

    async getById(id: string) {
      const normalizedId = String(id || '').trim()
      if (!normalizedId) return null

      const redis = getRedis()
      return parseFormula(await redis.get(formulaKey(normalizedId)))
    },

    async save(formula: OperationalFormula) {
      const normalizedId = String(formula.id || '').trim()

      if (!normalizedId) {
        throw new Error('Operational formula requires an id')
      }

      const redis = getRedis()

      await redis
        .multi()
        .set(formulaKey(normalizedId), JSON.stringify(formula))
        .sAdd(FORMULA_INDEX_KEY, normalizedId)
        .exec()
    },
  }
}
