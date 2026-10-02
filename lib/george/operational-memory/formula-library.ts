import type {
  FormulaRetrievalContext,
  OperationalFormula,
  RetrievedOperationalFormula,
} from "./types";

export type OperationalFormulaAccessContext = {
  userId: string;
  organizationId?: string;
};

export type OperationalFormulaLibrary = {
  retrieve(
    context: FormulaRetrievalContext,
  ): Promise<RetrievedOperationalFormula[]>;
  getById(id: string): Promise<OperationalFormula | null>;
  save(formula: OperationalFormula): Promise<void>;
  delete(id: string, ownerId: string): Promise<void>;
  listByOwner(ownerId: string): Promise<OperationalFormula[]>;
  listAccessible(
    context: OperationalFormulaAccessContext,
  ): Promise<OperationalFormula[]>;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function canAccessOperationalFormula(
  formula: OperationalFormula,
  context: OperationalFormulaAccessContext,
) {
  const userId = String(context.userId ?? "").trim();
  const organizationId = String(context.organizationId ?? "").trim();

  if (userId && formula.ownerId === userId) {
    return true;
  }

  if (formula.scope === "personal") {
    return false;
  }

  if (formula.scope === "organization") {
    return (
      !!organizationId &&
      formula.ownerId === organizationId &&
      formula.visibility !== "private"
    );
  }

  return formula.visibility !== "private";
}

export async function resolveSelectedOperationalFormula(
  library: OperationalFormulaLibrary,
  input: {
    selection?: {
      id: string;
      version: number;
    } | null;
    userId: string;
    organizationId?: string;
  },
): Promise<RetrievedOperationalFormula | null> {
  const formulaId = String(input.selection?.id || "").trim();
  const formulaVersion = Number(input.selection?.version);

  if (!formulaId || !Number.isFinite(formulaVersion)) return null;

  const formula = await library.getById(formulaId);

  if (
    !formula ||
    formula.version !== formulaVersion ||
    !canAccessOperationalFormula(formula, {
      userId: input.userId,
      organizationId: input.organizationId,
    })
  ) {
    return null;
  }

  return {
    formula,
    score: 1,
    reasons: ["selected_current_preparation"],
  };
}

function includesOrUnrestricted(values: string[], value?: string) {
  return values.length === 0 || (!!value && values.includes(value));
}

export function scoreOperationalFormula(
  formula: OperationalFormula,
  context: FormulaRetrievalContext,
): RetrievedOperationalFormula | null {
  const reasons: string[] = [];
  const status = formula.status;

  if (status === "retired") {
    return null;
  }

  if (formula.scope === "personal" && formula.ownerId !== context.userId) {
    return null;
  }

  if (
    formula.scope === "organization" &&
    (!context.organizationId || formula.ownerId !== context.organizationId)
  ) {
    return null;
  }

  if (!includesOrUnrestricted(formula.roomTypes, context.roomType)) {
    return null;
  }

  if (!includesOrUnrestricted(formula.objectiveTypes, context.objectiveType)) {
    return null;
  }

  /*
   * Formula retrieval first establishes eligibility above. Ranking then asks a
   * different question: among eligible strategies, which has the strongest
   * contextual evidence of succeeding here?
   *
   * Scope controls access. It is not evidence that a strategy will succeed,
   * so personal / organization / general ownership receives no ranking bonus.
   *
   * This is a contextual success score, not a calibrated probability.
   */
  const sampleCount = Math.max(0, formula.sampleCount || 0);
  const successCount = Math.max(0, formula.successCount || 0);
  const contradictionCount = Math.max(0, formula.contradictionCount || 0);

  // Use a neutral prior equivalent to several unknown executions so that
  // tiny samples remain informative without dominating established evidence.
  // This is ranking evidence, not a calibrated probability of success.
  const priorWeight = 6;
  const priorSuccessRate = 0.5;
  const contextualSuccessEvidence =
    (successCount + priorWeight * priorSuccessRate) /
    (sampleCount + priorWeight);
  const evidenceReliability = sampleCount / (sampleCount + priorWeight);

  let score =
    formula.confidence * 0.30 +
    contextualSuccessEvidence * 0.32;

  reasons.push(`confidence:${formula.confidence.toFixed(2)}`);
  reasons.push(`execution_success:${successCount}/${sampleCount}`);
  reasons.push(
    `contextual_success_evidence:${contextualSuccessEvidence.toFixed(2)}`,
  );
  reasons.push(`evidence_reliability:${evidenceReliability.toFixed(2)}`);

  if (status === "validated") {
    score += 0.08;
    reasons.push("status:validated");
  } else if (status === "contested") {
    score -= 0.12;
    reasons.push("status:contested");
  } else if (status === "candidate") {
    score -= 0.04;
    reasons.push("status:candidate");
  }

  if (context.roomType && formula.roomTypes.includes(context.roomType)) {
    score += 0.10;
    reasons.push("room");
  }

  if (
    context.objectiveType &&
    formula.objectiveTypes.includes(context.objectiveType)
  ) {
    score += 0.10;
    reasons.push("objective");
  }

  const requiredSignals = formula.prerequisites;
  const matchedSignals = requiredSignals.filter((signalType) =>
    context.observedSignalTypes.includes(signalType),
  );

  if (requiredSignals.length > 0) {
    const prerequisiteMatch = matchedSignals.length / requiredSignals.length;
    score += prerequisiteMatch * 0.10;
    reasons.push(
      `prerequisites:${matchedSignals.length}/${requiredSignals.length}`,
    );
  }

  // Contradictions are relevant evidence, but they do not declare a Formula
  // wrong. Their influence is bounded and becomes meaningful with repetition.
  if (contradictionCount > 0) {
    const contradictionPressure =
      contradictionCount / (contradictionCount + 6);
    score -= contradictionPressure * 0.08;
    reasons.push(`contradictions:${contradictionCount}`);
  }

  return {
    formula,
    score: clamp01(score),
    reasons,
  };
}

export function rankOperationalFormulas(
  formulas: OperationalFormula[],
  context: FormulaRetrievalContext,
) {
  const limit = Math.max(1, context.limit ?? 5);

  return formulas
    .map((formula) => scoreOperationalFormula(formula, context))
    .filter((result): result is RetrievedOperationalFormula => result !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
