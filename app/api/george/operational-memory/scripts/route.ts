import { NextRequest, NextResponse } from "next/server";

import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

import { createRedisOperationalScriptLibrary } from "@/lib/george/operational-memory/redis-script-library";
import type {
  OperationalScript,
  OperationalScriptLine,
} from "@/lib/george/operational-memory/types";

export async function GET(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  const formulaId = String(
    req.nextUrl.searchParams.get("formulaId") || "",
  ).trim();
  const rawFormulaVersion = req.nextUrl.searchParams.get("formulaVersion");
  const formulaVersion =
    rawFormulaVersion === null ? undefined : Number(rawFormulaVersion);

  if (
    rawFormulaVersion !== null &&
    (!Number.isInteger(formulaVersion) || Number(formulaVersion) < 1)
  ) {
    return NextResponse.json(
      { ok: false, error: "Formula version is invalid" },
      { status: 400 },
    );
  }

  const scriptLibrary = createRedisOperationalScriptLibrary();
  const scripts = formulaId
    ? await scriptLibrary.listByFormula(userId, formulaId, formulaVersion)
    : await scriptLibrary.listByOwner(userId);

  return NextResponse.json({
    ok: true,
    scripts,
  });
}

function normalizeScriptLines(value: unknown): OperationalScriptLine[] {
  if (!Array.isArray(value)) {
    throw new Error("Script lines are required");
  }

  const lines = value.map((candidate, index) => {
    if (!candidate || typeof candidate !== "object") {
      throw new Error(`Script line ${index + 1} is invalid`);
    }

    const input = candidate as Record<string, unknown>;
    const lineText = String(input.text ?? "").trim();

    if (!lineText) {
      throw new Error(`Script line ${index + 1} requires text`);
    }

    const rawOrder = Number(input.order ?? index);
    const purpose = String(input.purpose ?? "").trim();

    return {
      id: String(input.id ?? "").trim() || crypto.randomUUID(),
      order: Number.isInteger(rawOrder) && rawOrder >= 0 ? rawOrder : index,
      text: lineText,
      ...(purpose ? { purpose } : {}),
    };
  });

  if (!lines.length) {
    throw new Error("At least one script line is required");
  }

  return lines.sort((left, right) => left.order - right.order);
}

export async function POST(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await req.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Request body is invalid");
    }

    body = parsed as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Request body is invalid",
      },
      { status: 400 },
    );
  }

  const formulaId = String(body.formulaId ?? "").trim();
  const formulaVersion = Number(body.formulaVersion);
  const name = String(body.name ?? "").trim();
  const organizationId = String(body.organizationId ?? "").trim();

  if (!formulaId) {
    return NextResponse.json(
      { ok: false, error: "Formula id is required" },
      { status: 400 },
    );
  }

  if (!Number.isInteger(formulaVersion) || formulaVersion < 1) {
    return NextResponse.json(
      { ok: false, error: "Formula version is invalid" },
      { status: 400 },
    );
  }

  let lines: OperationalScriptLine[];

  try {
    lines = normalizeScriptLines(body.lines);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Script lines are invalid",
      },
      { status: 400 },
    );
  }

  const now = Date.now();

  const script: OperationalScript = {
    id: crypto.randomUUID(),
    version: 1,
    ownerId: userId,
    ...(organizationId ? { organizationId } : {}),
    formulaId,
    formulaVersion,
    ...(name ? { name } : {}),
    status: "draft",
    lines,
    createdAt: now,
    updatedAt: now,
  };

  const scriptLibrary = createRedisOperationalScriptLibrary();
  await scriptLibrary.save(script);

  return NextResponse.json(
    {
      ok: true,
      script,
    },
    { status: 201 },
  );
}
