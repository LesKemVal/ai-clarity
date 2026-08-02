import { NextRequest, NextResponse } from "next/server";

import { createMarketplaceEntitlementService } from "@/lib/george/operational-memory/marketplace-entitlement-service";
import { createRedisMarketplaceEntitlementStore } from "@/lib/george/operational-memory/redis-marketplace-entitlement-store";
import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";
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

export async function GET(
  req: NextRequest,
  context: RouteContext,
) {
  const session = await readGeorgeSession(req);

  if (!session) {
    return unauthorized();
  }

  const { formulaId: rawFormulaId } = await context.params;
  const formulaId = String(rawFormulaId ?? "").trim();

  if (!formulaId) {
    return NextResponse.json(
      { ok: false, error: "Formula id is required" },
      { status: 400 },
    );
  }

  const formula = await createRedisOperationalFormulaLibrary().getById(
    formulaId,
  );

  if (!formula) {
    return NextResponse.json(
      { ok: false, error: "Formula not found" },
      { status: 404 },
    );
  }

  const entitlement = createMarketplaceEntitlementService(
    createRedisMarketplaceEntitlementStore(),
  );

  const decision = await entitlement.decide({
    userId: session.email,
    currentTier: session.tier,
    formula,
  });

  return NextResponse.json({
    ok: true,
    formulaId,
    decision,
  });
}
