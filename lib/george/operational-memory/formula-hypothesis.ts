import type { OperationalFormula } from "./types";

export type OperationalStrategyHypothesis = {
  name?: string;
  summary?: string;
  bestUsedFor?: string[];
  prerequisites?: string[];
  steps: Array<{
    signalType?: string;
    actionType?: string;
    expectedTransition?: string;
  }>;
  failureConditions?: string[];
};

export type MaterializeOperationalFormulaHypothesisInput = {
  userId: string;
  roomType?: string;
  objectiveType?: string;
  strategy: OperationalStrategyHypothesis;
  now?: number;
};

function normalized(value: unknown) {
  return String(value ?? "").trim();
}

export function materializeOperationalFormulaHypothesis(
  input: MaterializeOperationalFormulaHypothesisInput,
): OperationalFormula {
  const userId = normalized(input.userId);

  if (!userId) {
    throw new Error("Operational formula hypothesis requires a user");
  }

  const steps = input.strategy.steps
    .map((step) => ({
      signalType: normalized(step.signalType),
      actionType: normalized(step.actionType) || undefined,
      expectedTransition: normalized(step.expectedTransition) || undefined,
    }))
    .filter((step) => step.signalType);

  if (steps.length === 0) {
    throw new Error("Operational formula hypothesis requires strategy steps");
  }

  const now = input.now ?? Date.now();
  const roomType = normalized(input.roomType);
  const objectiveType = normalized(input.objectiveType);
  const name =
    normalized(input.strategy.name) ||
    normalized(input.strategy.summary);

  return {
    id: crypto.randomUUID(),
    version: 1,
    scope: "personal",
    ownerId: userId,
    ...(name ? { name } : {}),
    bestUsedFor: (input.strategy.bestUsedFor ?? [])
      .map(normalized)
      .filter(Boolean),
    visibility: "private",
    status: "candidate",
    origin: "hypothesis",
    roomTypes: roomType ? [roomType] : [],
    objectiveTypes: objectiveType ? [objectiveType] : [],
    prerequisites: (input.strategy.prerequisites ?? [])
      .map(normalized)
      .filter(Boolean),
    steps,
    failureConditions: (input.strategy.failureConditions ?? [])
      .map(normalized)
      .filter(Boolean),
    confidence: 0.5,
    sampleCount: 0,
    successCount: 0,
    contradictionCount: 0,
    unknownCount: 0,
    reuseCount: 0,
    evidence: [],
    createdAt: now,
    updatedAt: now,
  };
}
