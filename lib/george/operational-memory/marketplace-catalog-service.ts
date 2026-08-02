import type {
  OperationalFormulaAccessContext,
  OperationalFormulaLibrary,
} from "./formula-library";
import type { OperationalFormula } from "./types";

export type MarketplaceCatalogQuery = OperationalFormulaAccessContext & {
  search?: string;
  roomType?: string;
  objectiveType?: string;
  limit?: number;
};

export type MarketplaceCatalogEntry = {
  formula: OperationalFormula;
  publisher?: string;
  author?: string;
  listedAt?: number;
};

export type MarketplaceCatalogService = {
  browse(query: MarketplaceCatalogQuery): Promise<MarketplaceCatalogEntry[]>;
};

function normalizeSearch(value: string | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function searchableText(formula: OperationalFormula) {
  return [
    formula.name,
    formula.publication?.author,
    formula.publication?.publisher,
    ...(formula.bestUsedFor ?? []),
    ...formula.roomTypes,
    ...formula.objectiveTypes,
    ...(formula.publication?.provenBy ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesCatalogQuery(
  formula: OperationalFormula,
  query: MarketplaceCatalogQuery,
) {
  if (formula.publication?.state !== "marketplace_listed") {
    return false;
  }

  if (formula.verification?.verified !== true) {
    return false;
  }

  if (formula.status === "retired") {
    return false;
  }

  if (
    query.roomType &&
    formula.roomTypes.length > 0 &&
    !formula.roomTypes.includes(query.roomType)
  ) {
    return false;
  }

  if (
    query.objectiveType &&
    formula.objectiveTypes.length > 0 &&
    !formula.objectiveTypes.includes(query.objectiveType)
  ) {
    return false;
  }

  const search = normalizeSearch(query.search);

  return !search || searchableText(formula).includes(search);
}

export function createMarketplaceCatalogService(
  formulaLibrary: OperationalFormulaLibrary,
): MarketplaceCatalogService {
  return {
    async browse(query) {
      const formulas = await formulaLibrary.listAccessible({
        userId: query.userId,
        organizationId: query.organizationId,
      });

      const limit = Math.max(1, Math.min(100, query.limit ?? 24));

      return formulas
        .filter((formula) => matchesCatalogQuery(formula, query))
        .sort((left, right) => {
          const confidenceDifference = right.confidence - left.confidence;

          if (confidenceDifference !== 0) {
            return confidenceDifference;
          }

          return (
            (right.publication?.listedAt ?? right.updatedAt) -
            (left.publication?.listedAt ?? left.updatedAt)
          );
        })
        .slice(0, limit)
        .map((formula) => ({
          formula,
          publisher: formula.publication?.publisher,
          author: formula.publication?.author,
          listedAt: formula.publication?.listedAt,
        }));
    },
  };
}
