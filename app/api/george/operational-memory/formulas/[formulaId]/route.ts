import { NextRequest, NextResponse } from "next/server";

import { createOperationalFormulaPublicationLifecycleService } from "@/lib/george/operational-memory/publication-lifecycle-service";
import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";
import type {
  OperationalFormulaPublication,
} from "@/lib/george/operational-memory/types";
import { readGeorgeSession } from "@/lib/security/george-session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    formulaId: string;
  }>;
};

type UpdateFormulaMetadataRequestBody = {
  name?: unknown;
  bestUsedFor?: unknown;
  publication?: unknown;
  publicationTransition?: unknown;
};

const PUBLICATION_TRANSITIONS = [
  "request_verification",
  "mark_verified",
  "publish",
  "list_marketplace",
  "unlist_marketplace",
  "retire",
  "withdraw",
] as const;

type PublicationTransition = (typeof PUBLICATION_TRANSITIONS)[number];

function normalizePublicationTransition(
  value: unknown,
): PublicationTransition | null {
  if (typeof value !== "string") return null;

  return PUBLICATION_TRANSITIONS.includes(value as PublicationTransition)
    ? (value as PublicationTransition)
    : null;
}

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
    { ok: false, error: "Formula modification denied" },
    { status: 403 },
  );
}

function normalizeOptionalString(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = String(value).trim();
  return normalized || null;
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function normalizePublication(
  value: unknown,
  current: OperationalFormulaPublication | undefined,
): OperationalFormulaPublication | undefined | null {
  if (value === null) return undefined;

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const next: OperationalFormulaPublication = {
    ...current,
  };

  let changed = false;

  if (Object.prototype.hasOwnProperty.call(input, "author")) {
    const author = normalizeOptionalString(input.author);
    next.author = author ?? undefined;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(input, "publisher")) {
    const publisher = normalizeOptionalString(input.publisher);
    next.publisher = publisher ?? undefined;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(input, "marketplaceReady")) {
    if (typeof input.marketplaceReady !== "boolean") {
      return null;
    }

    next.marketplaceReady = input.marketplaceReady;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(input, "provenBy")) {
    const provenBy = normalizeStringArray(input.provenBy);

    if (!provenBy) {
      return null;
    }

    next.provenBy = provenBy;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(input, "alternatives")) {
    const alternatives = normalizeStringArray(input.alternatives);

    if (!alternatives) {
      return null;
    }

    next.alternatives = alternatives;
    changed = true;
  }

  return changed ? next : null;
}

export async function PATCH(
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
    return badRequest("Formula id is required");
  }

  let body: UpdateFormulaMetadataRequestBody;

  try {
    body = (await req.json()) as UpdateFormulaMetadataRequestBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Formula metadata is required");
  }

  const formulaLibrary = createRedisOperationalFormulaLibrary();
  const formula = await formulaLibrary.getById(formulaId);

  if (!formula) {
    return NextResponse.json(
      { ok: false, error: "Formula not found" },
      { status: 404 },
    );
  }

  if (formula.ownerId !== userId) {
    return forbidden();
  }

  if (Object.prototype.hasOwnProperty.call(body, "publicationTransition")) {
    if (
      Object.prototype.hasOwnProperty.call(body, "name") ||
      Object.prototype.hasOwnProperty.call(body, "bestUsedFor") ||
      Object.prototype.hasOwnProperty.call(body, "publication")
    ) {
      return badRequest(
        "Publication transitions cannot be combined with metadata changes",
      );
    }

    const transition = normalizePublicationTransition(
      body.publicationTransition,
    );

    if (!transition) {
      return badRequest("Publication transition is invalid");
    }

    try {
      const lifecycle =
        createOperationalFormulaPublicationLifecycleService();
      const updatedFormula = lifecycle.transition(formula, transition);

      await formulaLibrary.save(updatedFormula);

      return NextResponse.json({
        ok: true,
        formula: updatedFormula,
      });
    } catch (error) {
      return badRequest(
        error instanceof Error
          ? error.message
          : "Publication transition failed",
      );
    }
  }

  const updates: {
    name?: string;
    bestUsedFor?: string[];
    publication?: OperationalFormulaPublication;
  } = {};

  let changed = false;

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    const name = normalizeOptionalString(body.name);

    if (name === undefined) {
      return badRequest("Formula name is invalid");
    }

    updates.name = name ?? undefined;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(body, "bestUsedFor")) {
    const bestUsedFor = normalizeStringArray(body.bestUsedFor);

    if (!bestUsedFor) {
      return badRequest("Best-used-for metadata must be an array");
    }

    updates.bestUsedFor = bestUsedFor;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(body, "publication")) {
    const publication = normalizePublication(
      body.publication,
      formula.publication,
    );

    if (publication === null) {
      return badRequest("Publication metadata is invalid");
    }

    updates.publication = publication;
    changed = true;
  }

  if (!changed) {
    return badRequest("No supported formula metadata changes were provided");
  }

  const now = Date.now();
  const lifecycle = createOperationalFormulaPublicationLifecycleService();
  const invalidatedFormula = lifecycle.invalidateVerification(formula, now);

  const updatedFormula = {
    ...invalidatedFormula,
    ...updates,
    version: formula.version + 1,
    updatedAt: now,
  };

  await formulaLibrary.save(updatedFormula);

  return NextResponse.json({
    ok: true,
    formula: updatedFormula,
  });
}

export async function DELETE(
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
    return badRequest("Formula id is required");
  }

  const formulaLibrary = createRedisOperationalFormulaLibrary();
  const formula = await formulaLibrary.getById(formulaId);

  if (!formula) {
    return NextResponse.json(
      { ok: false, error: "Formula not found" },
      { status: 404 },
    );
  }

  if (formula.ownerId !== userId) {
    return forbidden();
  }

  await formulaLibrary.delete(formulaId, userId);

  return NextResponse.json({
    ok: true,
    formulaId,
  });
}
