export const GEORGE_PREPARATION_RESUME_EVENT_KEY =
  "GEORGE_PREPARATION_RESUME_EVENT";

export type GeorgePreparationResumeSource =
  | "homepage"
  | "normal"
  | "live-entry"
  | "marketplace"
  | "library";

export type GeorgePreparationResumeChange =
  | "formula_selected"
  | "formula_changed"
  | "script_selected"
  | "script_changed"
  | "none";

export type GeorgePreparationResumeAssetReference = {
  id: string;
  version: number;
  name?: string;
};

export type GeorgePreparationResumeEvent = {
  source: GeorgePreparationResumeSource;
  resumeState: "popup3";
  changes: GeorgePreparationResumeChange[];
  formula?: GeorgePreparationResumeAssetReference;
  script?: GeorgePreparationResumeAssetReference;
  createdAt: number;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeChanges(
  changes: GeorgePreparationResumeChange[],
): GeorgePreparationResumeChange[] {
  const normalized = Array.from(new Set(changes));

  if (normalized.length > 1) {
    return normalized.filter((change) => change !== "none");
  }

  return normalized.length ? normalized : ["none"];
}

export function createGeorgePreparationResumeEvent(
  input: Omit<GeorgePreparationResumeEvent, "resumeState" | "changes" | "createdAt"> & {
    changes?: GeorgePreparationResumeChange[];
    createdAt?: number;
  },
): GeorgePreparationResumeEvent {
  return {
    source: input.source,
    resumeState: "popup3",
    changes: normalizeChanges(input.changes ?? ["none"]),
    ...(input.formula ? { formula: input.formula } : {}),
    ...(input.script ? { script: input.script } : {}),
    createdAt: input.createdAt ?? Date.now(),
  };
}

export function parseGeorgePreparationResumeEvent(
  value: unknown,
): GeorgePreparationResumeEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const event = value as Partial<GeorgePreparationResumeEvent>;
  const source = clean(event.source);
  const sources: GeorgePreparationResumeSource[] = [
    "homepage",
    "normal",
    "live-entry",
    "marketplace",
    "library",
  ];

  if (!sources.includes(source as GeorgePreparationResumeSource)) {
    return null;
  }

  if (event.resumeState !== "popup3" || !Array.isArray(event.changes)) {
    return null;
  }

  const allowedChanges: GeorgePreparationResumeChange[] = [
    "formula_selected",
    "formula_changed",
    "script_selected",
    "script_changed",
    "none",
  ];
  const changes = event.changes.filter(
    (change): change is GeorgePreparationResumeChange =>
      allowedChanges.includes(change as GeorgePreparationResumeChange),
  );

  if (!changes.length) return null;

  return createGeorgePreparationResumeEvent({
    source: source as GeorgePreparationResumeSource,
    changes,
    ...(event.formula ? { formula: event.formula } : {}),
    ...(event.script ? { script: event.script } : {}),
    createdAt:
      typeof event.createdAt === "number" ? event.createdAt : Date.now(),
  });
}

export function describeGeorgePreparationResume(
  event: GeorgePreparationResumeEvent,
): string {
  const formulaName = clean(event.formula?.name) || "Formula";
  const scriptName = clean(event.script?.name) || "Script";
  const changes = new Set(event.changes);

  if (
    (changes.has("formula_selected") || changes.has("formula_changed")) &&
    (changes.has("script_selected") || changes.has("script_changed"))
  ) {
    return `${formulaName} and ${scriptName} are now selected. Preparation has been updated.`;
  }

  if (changes.has("formula_changed")) {
    return `${formulaName} is now selected. Preparation has been updated.`;
  }

  if (changes.has("formula_selected")) {
    return `${formulaName} selected. Preparation will use this operational strategy.`;
  }

  if (changes.has("script_changed")) {
    return `${scriptName} is now selected. Preparation has been updated.`;
  }

  if (changes.has("script_selected")) {
    return `${scriptName} selected. Preparation will use this execution asset.`;
  }

  return "Preparation resumed.";
}
