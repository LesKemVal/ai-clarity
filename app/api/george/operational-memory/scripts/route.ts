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
