import { NextRequest, NextResponse } from "next/server";

import {
  canAccessOperationalFormula,
  type OperationalFormulaLibrary,
} from "@/lib/george/operational-memory/formula-library";
import {
  createOperationalMemory,
} from "@/lib/george/operational-memory/operational-memory";
import {
  createRedisOperationalFormulaLibrary,
} from "@/lib/george/operational-memory/redis-formula-library";
import {
  createRedisOperationalLearningRecordRecorder,
} from "@/lib/george/operational-memory/redis-learning-record-recorder";
import type {
  OperationalFormulaDerivationChanges,
} from "@/lib/george/operational-memory/formula-derivation-service";
import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

type DeriveFormulaRequestBody = {
  parentFormulaId?: unknown;
  changes?: unknown;
  reasons?: unknown;
};

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

function badRequest(error: string) {
  return NextResponse.json(
    { ok: false, error },
    { status: 400 },
  );
}

function forbidden() {
  return NextResponse.json(
    { ok: false, error: "Formula access denied" },
    { status: 403 },
  );
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function normalizeChanges(
  value: unknown,
): OperationalFormulaDerivationChanges | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const changes: OperationalFormulaDerivationChanges = {};

  if (typeof input.name === "string") {
    const name = input.name.trim();
    if (name) changes.name = name;
  }

  const roomTypes = normalizeStringArray(input.roomTypes);
  if (roomTypes) changes.roomTypes = roomTypes;

  const objectiveTypes = normalizeStringArray(input.objectiveTypes);
  if (objectiveTypes) changes.objectiveTypes = objectiveTypes;

  const prerequisites = normalizeStringArray(input.prerequisites);
  if (prerequisites) changes.prerequisites = prerequisites;

  const failureConditions = normalizeStringArray(input.failureConditions);
  if (failureConditions) changes.failureConditions = failureConditions;

  const bestUsedFor = normalizeStringArray(input.bestUsedFor);
  if (bestUsedFor) changes.bestUsedFor = bestUsedFor;

  if (Array.isArray(input.steps)) {
    changes.steps =
      input.steps as OperationalFormulaDerivationChanges["steps"];
  }

  return changes;
}

async function readAuthenticatedUserId(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  return session && userId ? userId : null;
}

export async function GET(req: NextRequest) {
  const userId = await readAuthenticatedUserId(req);

  if (!userId) {
    return unauthorized();
  }

  const formulas =
    await createRedisOperationalFormulaLibrary().listAccessible({
      userId,
    });

  return NextResponse.json({
    ok: true,
    formulas,
    ownedFormulaIds: formulas
      .filter((formula) => formula.ownerId === userId)
      .map((formula) => formula.id),
  });
}

export async function POST(req: NextRequest) {
  const userId = await readAuthenticatedUserId(req);

  if (!userId) {
    return unauthorized();
  }

  let body: DeriveFormulaRequestBody;

  try {
    body = (await req.json()) as DeriveFormulaRequestBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parentFormulaId = String(body.parentFormulaId ?? "").trim();

  if (!parentFormulaId) {
    return badRequest("A parent formula id is required");
  }

  const changes = normalizeChanges(body.changes);

  if (!changes) {
    return badRequest("Formula changes are required");
  }

  const reasons = normalizeStringArray(body.reasons);
  const formulaLibrary: OperationalFormulaLibrary =
    createRedisOperationalFormulaLibrary();

  const parent = await formulaLibrary.getById(parentFormulaId);

  if (!parent) {
    return NextResponse.json(
      { ok: false, error: "Formula not found" },
      { status: 404 },
    );
  }

  if (!canAccessOperationalFormula(parent, { userId })) {
    return forbidden();
  }

  const operationalMemory = createOperationalMemory({
    formulaLibrary,
    learningRecordRecorder:
      createRedisOperationalLearningRecordRecorder(),
  });

  const result = await operationalMemory.derive({
    parent,
    userId,
    changes,
    reasons,
  });

  return NextResponse.json(
    {
      ok: true,
      formula: result.formula,
      lineage: result.lineage,
    },
    { status: 201 },
  );
}
