import { NextRequest, NextResponse } from "next/server";

import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";

export async function GET(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  const formulas =
    await createRedisOperationalFormulaLibrary().listAccessible({
      userId,
    });

  return NextResponse.json({
    ok: true,
    formulas,
  });
}
