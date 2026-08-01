import type {
  OperationalFormula,
  OperationalScript,
} from "./types";

export type OperationalRecommendationStrategyStatus =
  | "initial"
  | "confirmed"
  | "refined";

export type OperationalRecommendationRequest = {
  organizationId?: string;
  roomType?: string;
  objectiveType?: string;
  observedSignalTypes: string[];
  formulaLimit?: number;
  alternativeLimit?: number;
  priorFormulaId?: string;
  briefingComplete?: boolean;
};

export type OperationalRecommendationDto = {
  recommendedFormula: OperationalFormula | null;
  recommendedScript: OperationalScript | null;
  alternativeFormulas: OperationalFormula[];
  strategyStatus: OperationalRecommendationStrategyStatus;
  recommendationSummary: string;
  reviewRequired: boolean;
};

export type OperationalRecommendationApiResponse =
  | {
      ok: true;
      recommendation: OperationalRecommendationDto;
    }
  | {
      ok: false;
      error: string;
    };
