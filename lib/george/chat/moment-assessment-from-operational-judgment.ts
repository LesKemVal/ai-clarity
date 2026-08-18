import type { OperationalJudgment } from "@/lib/george/runtime/operational-judgment";
import type {
  MomentAssessment,
  MomentMarkerKind,
} from "@/lib/george/chat/message-types";
import { resolveMomentAssessmentPresentation } from "@/lib/george/chat/moment-assessment-presentation";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveMarker(
  judgment: OperationalJudgment,
): MomentMarkerKind | null {
  const disposition = judgment.operationalDisposition;

  /*
   * Presentation mapping only.
   *
   * Operational Judgment has already decided what the moment means
   * operationally. This mapping does not reassess evidence, infer
   * psychology, or decide whether progress occurred.
   */

  if (
    disposition.interactionUseful &&
    disposition.liveMateriallyImprovesExecution
  ) {
    return "interaction";
  }

  switch (disposition.disposition) {
    case "execution_ready":
      return "outcome";

    case "execution_opportunity":
      return "movement";

    case "continue_normal":
      return "momentum";

    default:
      return null;
  }
}

/**
 * Downstream projection of canonical Operational Judgment.
 *
 * NO Operational Judgment acceptance -> NO marker.
 * NO canonical evidence -> NO marker.
 * NO useful next action -> NO marker.
 *
 * This function does not create a second judgment lane.
 */
export function resolveMomentAssessmentFromOperationalJudgment(
  judgment: OperationalJudgment | null | undefined,
): MomentAssessment | null {
  if (!judgment) return null;

  const disposition = judgment.operationalDisposition;

  if (!disposition.providerProposalAccepted) {
    return null;
  }

  const marker = resolveMarker(judgment);

  if (!marker) {
    return null;
  }

  const evidence = Array.from(
    new Set(
      disposition.knownEvidence
        .map(clean)
        .filter(Boolean),
    ),
  ).slice(0, 3);

  if (evidence.length === 0) {
    return null;
  }

  const operationalObjective = clean(
    disposition.operationalObjective,
  );

  const purpose = clean(disposition.purpose);

  const desiredResult = clean(
    disposition.desiredResult,
  );

  const strongestNextStep = clean(
    disposition.strongestNextStep,
  );

  const materialLiveBenefit = clean(
    disposition.materialLiveBenefit,
  );

  if (
    !operationalObjective ||
    !strongestNextStep
  ) {
    return null;
  }

  const observed =
    purpose ||
    operationalObjective;

  const whyItMatters =
    materialLiveBenefit ||
    desiredResult;

  if (!whyItMatters) {
    return null;
  }

  return resolveMomentAssessmentPresentation({
    marker,
    observed,
    evidence,
    whyItMatters,
    focus: strongestNextStep,
  });
}
