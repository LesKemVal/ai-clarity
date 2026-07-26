import { getRedis } from '@/lib/storage/redis'
import { rankOperationalFormulas } from './formula-library'
import type {
  FormulaRetrievalContext,
  OperationalFormula,
} from './types'
import type { OperationalFormulaLibrary } from './formula-library'

const FORMULA_INDEX_KEY = 'george:operational-memory:formulas'

function formulaKey(id: string) {
  return `george:operational-memory:formula:${id}`
}

function parseFormula(raw: string | null): OperationalFormula | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as OperationalFormula
    return parsed?.id ? parsed : null
  } catch {
    return null
  }
}

function parseFormulaIds(raw: string | null): string[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

async function readFormulaIds() {
  const redis = getRedis()
  return parseFormulaIds(await redis.get(FORMULA_INDEX_KEY))
}

async function writeFormulaIds(ids: string[]) {
  const redis = getRedis()
  await redis.set(FORMULA_INDEX_KEY, JSON.stringify([...new Set(ids)]))
}

export async function readOperationalFormula(id: string) {
  const redis = getRedis()
  return parseFormula(await redis.get(formulaKey(id)))
}

export async function readAllOperationalFormulas() {
  const ids = await readFormulaIds()
  const formulas = await Promise.all(ids.map((id) => readOperationalFormula(id)))

  return formulas.filter(
    (formula): formula is OperationalFormula => formula !== null
  )
}

export async function saveOperationalFormula(formula: OperationalFormula) {
  const redis = getRedis()
  const ids = await readFormulaIds()

  await redis.set(formulaKey(formula.id), JSON.stringify(formula))

  if (!ids.includes(formula.id)) {
    await writeFormulaIds([formula.id, ...ids])
  }
}

export async function deleteOperationalFormula(id: string) {
  const redis = getRedis()
  const ids = await readFormulaIds()

  await redis.del(formulaKey(id))
  await writeFormulaIds(ids.filter((formulaId) => formulaId !== id))
}

export function createRedisOperationalFormulaLibrary(): OperationalFormulaLibrary {
  return {
    async retrieve(context: FormulaRetrievalContext) {
      const formulas = await readAllOperationalFormulas()
      return rankOperationalFormulas(formulas, context)
    },

    getById(id: string) {
      return readOperationalFormula(id)
    },

    save(formula: OperationalFormula) {
      return saveOperationalFormula(formula)
    },
  }
}
