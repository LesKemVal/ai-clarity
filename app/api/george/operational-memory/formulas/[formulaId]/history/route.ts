import { NextRequest, NextResponse } from "next/server";

import { canAccessOperationalFormula } from "@/lib/george/operational-memory/formula-library";
import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";
import { createRedisOperationalLearningRecordRecorder } from "@/lib/george/operational-memory/redis-learning-record-recorder";
import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    formulaId: string;
  }>;
};

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

function forbidden() {
  return NextResponse.json(
    { ok: false, error: "Formula access denied" },
    { status: 403 },
  );
}

export async function GET(
  req: NextRequest,
  context: RouteContext,
) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  const { formulaId: rawFormulaId } = await context.params;
  const formulaId = String(rawFormulaId || "").trim();

  if (!formulaId) {
    return NextResponse.json(
      { ok: false, error: "Formula id is required" },
      { status: 400 },
    );
  }

  try {
    const formulaLibrary = createRedisOperationalFormulaLibrary();
    const formula = await formulaLibrary.getById(formulaId);

    if (!formula) {
      return NextResponse.json(
        { ok: false, error: "Formula not found" },
        { status: 404 },
      );
    }

    if (!canAccessOperationalFormula(formula, { userId })) {
      return forbidden();
    }

    const recorder =
      createRedisOperationalLearningRecordRecorder();

    const [reassessments, lineages] = await Promise.all([
      recorder.listReassessmentsByFormula(formulaId),
      recorder.listLineagesByFormula(formulaId),
    ]);

    return NextResponse.json({
      ok: true,
      formulaId,
      reassessments,
      lineages,
    });
  } catch (error) {
    console.error(
      "[GEORGE][OPERATIONAL_MEMORY][FORMULA_HISTORY_FAILED]",
      error,
    );

    return NextResponse.json(
      { ok: false, error: "Formula history could not be loaded" },
      { status: 500 },
    );
  }
}
