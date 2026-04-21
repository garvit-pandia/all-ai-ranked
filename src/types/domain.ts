export type ModelSource = "paid" | "free_api";

export type CapabilityTag =
  | "coding"
  | "reasoning"
  | "writing"
  | "speed"
  | "multimodal"
  | "long-context"
  | "research"
  | "no-signup";

export type SignupType = "none" | "email" | "phone";

export interface ModelEntry {
  id: string;
  slug: string;
  name: string;
  provider: string;
  source: ModelSource;
  context: string;
  speed: 1 | 2 | 3 | 4 | 5;
  costLabel: string;
  tags: CapabilityTag[];
  isNew2026: boolean;
  status: "active" | "retired" | "unverified";
  note?: string;
}

export interface ChatbotEntry {
  id: string;
  slug: string;
  rank: number;
  name: string;
  provider: string;
  bestFor: string;
  freeModel: string;
  context: string;
  signup: SignupType;
  webSearch: boolean;
  limit: string;
  url: string;
  tags: CapabilityTag[];
}

export interface SuggestPick {
  source: "model" | "chatbot";
  slug: string;
  name: string;
  provider: string;
  reason: string;
  url?: string;
}

export interface SuggestResponse {
  picks: SuggestPick[];
  usedModel: string;
  fallback: boolean;
}
