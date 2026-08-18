export type MomentMarkerKind =
  | "momentum"
  | "alignment"
  | "movement"
  | "interaction"
  | "outcome"
  | "deft_excellence";

export type MomentAssessment = {
  marker: MomentMarkerKind;
  observed: string;
  evidence: string[];
  whyItMatters: string;
  focus: string;
};

export type GeorgeMessage = {
  role: "assistant" | "user" | "system";
  content: string;
  constrained?: boolean;
  imageDataUrl?: string | null;
  simplifiedFromIndex?: number;
  source?:
    | "user_input"
    | "sidebar_prompt"
    | "live_transcript"
    | "third_party_speech"
    | "system_override";
  servingTags?: string[];
  presentationMode?: "live_preparation";
  momentAssessment?: MomentAssessment | null;
};
