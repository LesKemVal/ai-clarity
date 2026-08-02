import { NextRequest, NextResponse } from "next/server";

import { createMarketplaceCatalogService } from "@/lib/george/operational-memory/marketplace-catalog-service";
import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";
import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

function normalizeOptional(value: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizeLimit(value: string | null) {
  if (value === null) return undefined;

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return Math.min(parsed, 100);
}

export async function GET(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email || "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  const limit = normalizeLimit(req.nextUrl.searchParams.get("limit"));

  if (limit === null) {
    return NextResponse.json(
      { ok: false, error: "Catalog limit is invalid" },
      { status: 400 },
    );
  }

  const catalog = createMarketplaceCatalogService(
    createRedisOperationalFormulaLibrary(),
  );

  const entries = await catalog.browse({
    userId,
    search: normalizeOptional(req.nextUrl.searchParams.get("q")),
    roomType: normalizeOptional(req.nextUrl.searchParams.get("roomType")),
    objectiveType: normalizeOptional(
      req.nextUrl.searchParams.get("objectiveType"),
    ),
    limit,
  });

  return NextResponse.json({
    ok: true,
    entries,
  });
}
