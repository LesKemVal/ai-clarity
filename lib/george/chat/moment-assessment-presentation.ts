import type {
  MomentAssessment,
  MomentMarkerKind,
} from "@/lib/george/chat/message-types";

export type MomentAssessmentPresentationSource = {
  marker?: MomentMarkerKind | null;
  observed?: string | null;
  evidence?: readonly string[] | null;
  whyItMatters?: string | null;
  focus?: string | null;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Presentation gate only.
 *
 * This function does not classify a moment, infer user psychology,
 * choose a marker, or create operational evidence.
 *
 * Canonical operational judgment/evidence must supply the assessment.
 * Incomplete evidence produces no marker.
 */
export function resolveMomentAssessmentPresentation(
  source: MomentAssessmentPresentationSource | null | undefined,
): MomentAssessment | null {
  if (!source?.marker) return null;

  const observed = clean(source.observed);
  const whyItMatters = clean(source.whyItMatters);
  const focus = clean(source.focus);

  const evidence = Array.from(
    new Set(
      (source.evidence || [])
        .map(clean)
        .filter(Boolean),
    ),
  );

  // NO EVIDENCE -> NO MARKER.
  if (!observed || evidence.length === 0 || !whyItMatters || !focus) {
    return null;
  }

  return {
    marker: source.marker,
    observed,
    evidence,
    whyItMatters,
    focus,
  };
}
