import type { OperationalJudgment } from "@/lib/george/runtime/operational-judgment";

export type NormalLiveVerificationOpportunity = Readonly<{
  objective: string;
  interaction: string;
  uncertainty: string;
  benefit: string;
  purpose: string;
  desiredResult: string;
}>;

/**
 * Presentation adapter only.
 *
 * Operational Judgment remains the sole authority for deciding whether
 * a legitimate interaction exists and whether LIVE materially improves it.
 */
export function resolveNormalLiveVerificationOpportunity(
  judgment: OperationalJudgment | null | undefined,
): NormalLiveVerificationOpportunity | null {
  if (!judgment) return null;

  const disposition = judgment.operationalDisposition;

  if (
    disposition.disposition !== "execution_opportunity" ||
    !disposition.interactionUseful ||
    !disposition.liveMateriallyImprovesExecution
  ) {
    return null;
  }

  const objective = String(disposition.operationalObjective || "").trim();
  const interaction = String(disposition.interaction || "").trim();
  const uncertainty = String(
    disposition.consequentialUncertainty || "",
  ).trim();
  const benefit = String(disposition.materialLiveBenefit || "").trim();
  const purpose = String(disposition.purpose || "").trim();
  const desiredResult = String(disposition.desiredResult || "").trim();

  if (!interaction || !uncertainty || !benefit) {
    return null;
  }

  return {
    objective:
      objective ||
      purpose ||
      `Verify whether ${uncertainty} still holds`,
    interaction,
    uncertainty,
    benefit,
    purpose,
    desiredResult,
  };
}
