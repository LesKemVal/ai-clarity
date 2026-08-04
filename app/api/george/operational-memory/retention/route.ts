import { NextRequest, NextResponse } from "next/server";

import {
  createExecutedAssetRetentionService,
  type ExecutedAssetRetentionDecision,
  type ExecutedAssetRetentionDisposition,
} from "@/lib/george/operational-memory/executed-asset-retention";
import { createRedisOperationalFormulaLibrary } from "@/lib/george/operational-memory/redis-formula-library";
import { createRedisOperationalScriptLibrary } from "@/lib/george/operational-memory/redis-script-library";
import { readGeorgeSession } from "@/lib/security/george-session";
import { getRedis } from "@/lib/storage/redis";

export const runtime = "nodejs";

const RETENTION_KEY_PREFIX =
  "george:operational-memory:asset-retention:v1:";
const RETENTION_USER_INDEX_PREFIX =
  "george:operational-memory:user-asset-retentions:v1:";
const RETENTION_CONVERSATION_INDEX_PREFIX =
  "george:operational-memory:conversation-asset-retentions:v1:";

function retentionKey(id: string) {
  return `${RETENTION_KEY_PREFIX}${encodeURIComponent(id)}`;
}

function userIndexKey(userId: string) {
  return `${RETENTION_USER_INDEX_PREFIX}${encodeURIComponent(userId)}`;
}

function conversationIndexKey(conversationId: string) {
  return (
    RETENTION_CONVERSATION_INDEX_PREFIX +
    encodeURIComponent(conversationId)
  );
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

function normalizeDisposition(
  value: unknown,
): ExecutedAssetRetentionDisposition | null {
  return value === "formula" ||
    value === "script" ||
    value === "both" ||
    value === "neither"
    ? value
    : null;
}

export async function POST(req: NextRequest) {
  const session = await readGeorgeSession(req);
  const userId = String(session?.email ?? "")
    .trim()
    .toLowerCase();

  if (!session || !userId) {
    return unauthorized();
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await req.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return badRequest("Request body is invalid");
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const conversationId = String(body.conversationId ?? "").trim();
  const disposition = normalizeDisposition(body.disposition);

  if (!conversationId) {
    return badRequest("A conversation id is required");
  }

  if (!disposition) {
    return badRequest("A valid retention disposition is required");
  }

  const service = createExecutedAssetRetentionService({
    formulaLibrary: createRedisOperationalFormulaLibrary(),
    scriptLibrary: createRedisOperationalScriptLibrary(),
    decisionRecorder: {
      async save(decision: ExecutedAssetRetentionDecision) {
        const redis = getRedis();

        await redis
          .multi()
          .set(retentionKey(decision.id), JSON.stringify(decision))
          .sAdd(userIndexKey(decision.userId), decision.id)
          .sAdd(
            conversationIndexKey(decision.conversationId),
            decision.id,
          )
          .exec();
      },
    },
  });

  try {
    const decision = await service.retain({
      userId,
      conversationId,
      disposition,
      formulaSelection:
        body.formulaSelection &&
        typeof body.formulaSelection === "object" &&
        !Array.isArray(body.formulaSelection)
          ? (body.formulaSelection as {
              formulaId: string;
              formulaVersion: number;
              source: "george" | "user";
            })
          : null,
      scriptSelection:
        body.scriptSelection &&
        typeof body.scriptSelection === "object" &&
        !Array.isArray(body.scriptSelection)
          ? (body.scriptSelection as {
              scriptId: string;
              scriptVersion: number;
              formulaId: string;
              formulaVersion: number;
            })
          : null,
    });

    return NextResponse.json(
      {
        ok: true,
        decision,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Executed asset retention failed",
      },
      { status: 400 },
    );
  }
}
