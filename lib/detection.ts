import { CommentEvent, ConfidenceLevel, Country, DetectionResult, StatusLevel } from "./types";
import { normalizeText } from "./utils";

export function analyzeCountry(
  country: Country,
  events: CommentEvent[],
  keywords: string[],
  recentWindowMinutes: number,
  threshold: number
): DetectionResult {
  const normalizedKeywords = keywords.map(normalizeText).filter(Boolean);

  const matchedEvents = events
    .filter((event) => event.country === country)
    .filter((event) => event.minutesAgo <= recentWindowMinutes)
    .map((event) => {
      const text = normalizeText(event.text);
      const matchedTerms = normalizedKeywords.filter((k) => text.includes(k));
      return { ...event, matchedTerms };
    })
    .filter((event) => event.matchedTerms.length > 0);

  const uniqueUsers = new Set(matchedEvents.map((e) => e.author)).size;
  const hasOfficial = matchedEvents.some((e) => e.source === "official");

  let status: StatusLevel = "Quiet";
  let confidence: ConfidenceLevel = "Low";

  if (uniqueUsers >= threshold || (uniqueUsers >= 2 && hasOfficial)) {
    status = "Being attacked";
    confidence = hasOfficial || uniqueUsers >= threshold + 1 ? "High" : "Medium";
  } else if (uniqueUsers >= Math.max(1, threshold - 1)) {
    status = "Suspicious";
    confidence = "Low";
  }

  return {
    totalRecentMentions: matchedEvents.length,
    matchedEvents,
    status,
    confidence,
  };
}