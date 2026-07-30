import "server-only";

import { getRedis } from "@/lib/storage/redis";
import {
  canAccessOperationalFormula,
  rankOperationalFormulas,
  type OperationalFormulaLibrary,
} from "./formula-library";
import type { FormulaRetrievalContext, OperationalFormula } from "./types";

const FORMULA_INDEX_KEY = "george:operational-memory:formula-ids:v1";
const FORMULA_KEY_PREFIX = "george:operational-memory:formula:v1:";

function formulaKey(id: string) {
  return `${FORMULA_KEY_PREFIX}${encodeURIComponent(id)}`;
}

function normalizeRequired(value: unknown, label: string) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error(`Operational formula requires ${label}`);
  }

  return normalized;
}

function parseFormula(raw: string | null): OperationalFormula | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OperationalFormula;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      !parsed.id.trim()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function loadAllFormulas(): Promise<OperationalFormula[]> {
  const redis = getRedis();
  const ids = await redis.sMembers(FORMULA_INDEX_KEY);

  if (ids.length === 0) return [];

  const values = await Promise.all(ids.map((id) => redis.get(formulaKey(id))));

  return values
    .map(parseFormula)
    .filter((formula): formula is OperationalFormula => formula !== null);
}

export function createRedisOperationalFormulaLibrary(): OperationalFormulaLibrary {
  return {
    async retrieve(context: FormulaRetrievalContext) {
      const formulas = await loadAllFormulas();
      return rankOperationalFormulas(formulas, context);
    },

    async getById(id: string) {
      const normalizedId = String(id || "").trim();
      if (!normalizedId) return null;

      const redis = getRedis();
      return parseFormula(await redis.get(formulaKey(normalizedId)));
    },

    async save(formula: OperationalFormula) {
      const normalizedId = normalizeRequired(formula.id, "an id");

      if (
        formula.scope !== "general" &&
        !String(formula.ownerId ?? "").trim()
      ) {
        throw new Error(
          "Personal and organization formulas require an owner id",
        );
      }

      const redis = getRedis();

      await redis
        .multi()
        .set(formulaKey(normalizedId), JSON.stringify(formula))
        .sAdd(FORMULA_INDEX_KEY, normalizedId)
        .exec();
    },

    async delete(id: string, ownerId: string) {
      const normalizedId = normalizeRequired(id, "an id");
      const normalizedOwnerId = normalizeRequired(ownerId, "an owner id");

      const redis = getRedis();
      const existing = parseFormula(await redis.get(formulaKey(normalizedId)));

      if (!existing) return;

      if (existing.ownerId !== normalizedOwnerId) {
        throw new Error(
          "Operational formula cannot be deleted by a different owner",
        );
      }

      await redis
        .multi()
        .del(formulaKey(normalizedId))
        .sRem(FORMULA_INDEX_KEY, normalizedId)
        .exec();
    },

    async listByOwner(ownerId: string) {
      const normalizedOwnerId = String(ownerId ?? "").trim();
      if (!normalizedOwnerId) return [];

      const formulas = await loadAllFormulas();

      return formulas
        .filter((formula) => formula.ownerId === normalizedOwnerId)
        .sort((left, right) => right.updatedAt - left.updatedAt);
    },

    async listAccessible(context) {
      const formulas = await loadAllFormulas();

      return formulas
        .filter((formula) => canAccessOperationalFormula(formula, context))
        .sort((left, right) => right.updatedAt - left.updatedAt);
    },
  };
}
