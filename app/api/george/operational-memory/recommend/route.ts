import { NextRequest, NextResponse } from "next/server";

import {
  createOperationalMemory,
  type OperationalRecommendationInput,
} from "@/lib/george/operational-memory/operational-memory";
import type {
  OperationalRecommendationApiResponse,
  OperationalRecommendationRequest,
} from "@/lib/george/operational-memory/recommendation-api";
import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";
import { createRedisOperationalScriptLibrary } from "@/lib/george/operational-memory/redis-script-library";
import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

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

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => String(item ?? "").trim())
        .filter(Boolean),
    ),
  );
}

function normalizeOptionalLimit(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.floor(value));
}

export async function POST(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  let body: OperationalRecommendationRequest;

  try {
    body = (await req.json()) as OperationalRecommendationRequest;
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Request body is required");
  }

  const formulaLimit = normalizeOptionalLimit(body.formulaLimit);
  const alternativeLimit = normalizeOptionalLimit(body.alternativeLimit);

  const input: OperationalRecommendationInput = {
    userId,
    organizationId: normalizeOptionalString(body.organizationId),
    roomType: normalizeOptionalString(body.roomType),
    objectiveType: normalizeOptionalString(body.objectiveType),
    observedSignalTypes: normalizeStringArray(body.observedSignalTypes),
    priorFormulaId: normalizeOptionalString(body.priorFormulaId),
    briefingComplete: body.briefingComplete === true,
    ...(formulaLimit === undefined ? {} : { formulaLimit }),
    ...(alternativeLimit === undefined ? {} : { alternativeLimit }),
  };

  try {
    const operationalMemory = createOperationalMemory({
      formulaLibrary: createRedisOperationalFormulaLibrary(),
      scriptLibrary: createRedisOperationalScriptLibrary(),
    });

    const recommendation = await operationalMemory.recommend(input);

    /*
      Return the presentation-safe recommendation.

      Raw retrieval reasons and internal scores remain server-owned.
      Popup 3 receives the selected assets and lifecycle presentation state.
    */
    const responseBody: OperationalRecommendationApiResponse = {
      ok: true,
      recommendation: {
        recommendedFormula:
          recommendation.recommendedFormula?.formula ?? null,
        recommendedScript: recommendation.recommendedScript,
        alternativeFormulas: recommendation.alternativeFormulas.map(
          ({ formula }) => formula,
        ),
        strategyStatus: recommendation.strategyStatus,
        recommendationSummary: recommendation.recommendationSummary,
        reviewRequired: recommendation.reviewRequired,
      },
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error(
      "[GEORGE][OPERATIONAL_MEMORY][RECOMMEND_FAILED]",
      error,
    );

    return NextResponse.json(
      { ok: false, error: "Operational recommendation failed" },
      { status: 500 },
    );
  }
}
