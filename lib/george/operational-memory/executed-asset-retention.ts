import "server-only";

import {
  canAccessOperationalFormula,
  type OperationalFormulaLibrary,
} from "./formula-library";
import type { OperationalScriptLibrary } from "./script-library";

export type ExecutedAssetRetentionDisposition =
  | "formula"
  | "script"
  | "both"
  | "neither";

export type ExecutedFormulaRetentionReference = {
  formulaId: string;
  formulaVersion: number;
  source: "george" | "user";
};

export type ExecutedScriptRetentionReference = {
  scriptId: string;
  scriptVersion: number;
  formulaId: string;
  formulaVersion: number;
};

export type ExecutedAssetRetentionInput = {
  userId: string;
  organizationId?: string;
  conversationId: string;
  disposition: ExecutedAssetRetentionDisposition;
  formulaSelection?: ExecutedFormulaRetentionReference | null;
  scriptSelection?: ExecutedScriptRetentionReference | null;
  decidedAt?: number;
};

export type ExecutedAssetRetentionDecision = {
  id: string;
  userId: string;
  organizationId?: string;
  conversationId: string;
  disposition: ExecutedAssetRetentionDisposition;
  formula?: ExecutedFormulaRetentionReference;
  script?: ExecutedScriptRetentionReference;
  decidedAt: number;
};

export type ExecutedAssetRetentionDecisionRecorder = {
  save(decision: ExecutedAssetRetentionDecision): Promise<void>;
};

export type ExecutedAssetRetentionServiceDependencies = {
  formulaLibrary: OperationalFormulaLibrary;
  scriptLibrary: OperationalScriptLibrary;
  decisionRecorder: ExecutedAssetRetentionDecisionRecorder;
};

function required(value: unknown, label: string): string {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error(`Executed asset retention requires ${label}`);
  }

  return normalized;
}

function requiresFormula(disposition: ExecutedAssetRetentionDisposition) {
  return disposition === "formula" || disposition === "both";
}

function requiresScript(disposition: ExecutedAssetRetentionDisposition) {
  return disposition === "script" || disposition === "both";
}

export function createExecutedAssetRetentionService(
  dependencies: ExecutedAssetRetentionServiceDependencies,
) {
  return {
    async retain(
      input: ExecutedAssetRetentionInput,
    ): Promise<ExecutedAssetRetentionDecision> {
      const userId = required(input.userId, "a user id");
      const conversationId = required(
        input.conversationId,
        "a conversation id",
      );
      const organizationId = String(input.organizationId ?? "").trim();

      let retainedFormula:
        | ExecutedFormulaRetentionReference
        | undefined;
      let retainedScript:
        | ExecutedScriptRetentionReference
        | undefined;

      if (requiresFormula(input.disposition)) {
        const selection = input.formulaSelection;

        if (!selection) {
          throw new Error(
            "Formula retention requires an executed formula reference",
          );
        }

        const formulaId = required(
          selection.formulaId,
          "an executed formula id",
        );
        const formula = await dependencies.formulaLibrary.getById(formulaId);

        if (!formula) {
          throw new Error("Executed formula was not found");
        }

        if (
          formula.version !== selection.formulaVersion
        ) {
          throw new Error("Executed formula version no longer matches");
        }

        if (
          !canAccessOperationalFormula(formula, {
            userId,
            ...(organizationId ? { organizationId } : {}),
          })
        ) {
          throw new Error("Executed formula access denied");
        }

        retainedFormula = {
          formulaId,
          formulaVersion: selection.formulaVersion,
          source: selection.source,
        };
      }

      if (requiresScript(input.disposition)) {
        const selection = input.scriptSelection;

        if (!selection) {
          throw new Error(
            "Script retention requires an executed script reference",
          );
        }

        const scriptId = required(
          selection.scriptId,
          "an executed script id",
        );
        const script = await dependencies.scriptLibrary.getById(scriptId);

        if (!script) {
          throw new Error(
            "Executed script is not persisted and cannot yet be retained",
          );
        }

        if (script.ownerId !== userId) {
          throw new Error("Executed script access denied");
        }

        if (
          script.version !== selection.scriptVersion ||
          script.formulaId !== selection.formulaId ||
          script.formulaVersion !== selection.formulaVersion
        ) {
          throw new Error("Executed script reference no longer matches");
        }

        retainedScript = {
          scriptId,
          scriptVersion: selection.scriptVersion,
          formulaId: selection.formulaId,
          formulaVersion: selection.formulaVersion,
        };
      }

      const decision: ExecutedAssetRetentionDecision = {
        id: crypto.randomUUID(),
        userId,
        ...(organizationId ? { organizationId } : {}),
        conversationId,
        disposition: input.disposition,
        ...(retainedFormula ? { formula: retainedFormula } : {}),
        ...(retainedScript ? { script: retainedScript } : {}),
        decidedAt: input.decidedAt ?? Date.now(),
      };

      await dependencies.decisionRecorder.save(decision);

      return decision;
    },
  };
}
