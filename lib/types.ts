export type Source = "reddit" | "x" | "official";
export type Country =
  | "Bahrain"
  | "Qatar"
  | "UAE"
  | "Dubai"
  | "Saudi"
  | "Kuwait"
  | "Unknown";

export type StatusLevel = "Quiet" | "Suspicious" | "Being attacked";
export type ConfidenceLevel = "Low" | "Medium" | "High";

export type CommentEvent = {
  id: string;
  source: Source;
  country: Country;
  author: string;
  text: string;
  minutesAgo: number;
  upvotes?: number;
  createdAt?: string;
  threadKey?: string;
  threadLabel?: string;
  threadUrl?: string;
  xAccountKey?: string;
  xAccountLabel?: string;
  xUrl?: string;
};

export type DetectionResult = {
  totalRecentMentions: number;
  matchedEvents: Array<CommentEvent & { matchedTerms: string[] }>;
  status: StatusLevel;
  confidence: ConfidenceLevel;
};

export type CountryStatus = {
  country: Country;
  totalRecentMentions: number;
  status: StatusLevel;
  confidence: ConfidenceLevel;
};

export type ApiStatusResponse = {
  countries: CountryStatus[];
  bahrainRisk30: number;
  latestEvents: CommentEvent[];
  lastRedditSyncAt?: number;
  gulfSummary?: {
    headline: string;
    summary: string;
    regionalPattern: "localized" | "spreading" | "unclear" | "quiet";
    bahrainRiskHint: "low" | "elevated" | "high";
    updatedAt: number;
  };
};

export type XFeedPost = {
  id: string;
  accountKey: "aje" | "brics" | "moi";
  accountLabel: string;
  handle: string;
  avatarUrl: string;
  text: string;
  postedAt: string;
  xUrl: string;
};