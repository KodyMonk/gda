import { NextResponse } from "next/server";
import { fetchRedditThreadEvents } from "@/lib/reddit-ingest";
import { classifySignal, summarizeGulfSituation } from "@/lib/ai-classifier";
import {
  addEvents,
  getEvents,
  getLastRedditSyncAt,
  isRedditSyncInProgress,
  setAICountryState,
  setGulfSummary,
  setLastRedditSyncAt,
  setRedditSyncInProgress,
} from "@/lib/store";
import { CommentEvent, Country } from "@/lib/types";

const MIN_SYNC_INTERVAL_MS = 60_000;
const COUNTRIES: Country[] = ["Bahrain", "Qatar", "UAE", "Dubai", "Saudi"];

const STRONG_SENSORY_PHRASES = [
  "loud thud",
  "big thud",
  "heard it",
  "heard that",
  "heard boom",
  "heard booms",
  "heard a boom",
  "heard explosions",
  "multiple explosions",
  "loud boom",
  "loud booms",
  "boom",
  "booms",
  "thud",
  "thuds",
  "blast",
  "blasts",
  "explosion",
  "explosions",
  "siren",
  "sirens",
  "interception overhead",
  "intercepted overhead",
  "intercept",
  "interception",
  "intercepted",
  "whoosh",
  "wuuush",
  "window shook",
  "windows shook",
  "house shook",
  "building shook",
  "shaking now",
  "just heard",
];

const WEAK_SENSORY_WORDS = [
  "heard",
  "loud",
  "sound",
  "sounds",
  "shook",
  "shaking",
  "interception",
  "intercepted",
  "intercept",
  "boom",
  "thud",
  "blast",
  "explosion",
  "sirens",
  "siren",
  "whoosh",
  "wuuush",
];

const LIVE_CONTEXT_WORDS = [
  "just now",
  "right now",
  "now",
  "outside",
  "overhead",
  "above us",
  "in manama",
  "in muharraq",
  "in juffair",
  "in doha",
  "in dubai",
  "in abu dhabi",
  "anyone else",
  "did you hear",
  "can hear",
  "i heard",
  "we heard",
  "im here",
  "i'm here",
  "here in",
];

const EXCLUSION_PHRASES = [
  "last night",
  "yesterday",
  "earlier",
  "previous",
  "before",
  "i remember",
  "hope they",
  "news says",
  "according to",
  "http://",
  "https://",
  "x.com/",
  "twitter.com/",
  "reddit.com/",
];

function normalizeText(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(normalizeText(phrase)));
}

function countMatches(text: string, phrases: string[]) {
  return phrases.filter((phrase) => text.includes(normalizeText(phrase))).length;
}

function isLikelyLiveSignalComment(text: string) {
  const lower = normalizeText(text);

  if (!lower || lower === "[deleted]" || lower === "[removed]") return false;
  if (lower.length < 3) return false;
  if (hasAny(lower, EXCLUSION_PHRASES)) return false;

  const hasStrong = hasAny(lower, STRONG_SENSORY_PHRASES);
  const weakCount = countMatches(lower, WEAK_SENSORY_WORDS);
  const hasLiveContext = hasAny(lower, LIVE_CONTEXT_WORDS);

  if (hasStrong) return true;
  if (weakCount >= 2 && hasLiveContext) return true;
  if (weakCount >= 3) return true;

  return false;
}

function getRecentCountryEvents(
  events: CommentEvent[],
  country: Country,
  minutes = 20
) {
  return events.filter((event) => {
    if (event.source !== "reddit") return false;
    if (event.country !== country) return false;

    if (event.createdAt) {
      const ageMs = Date.now() - new Date(event.createdAt).getTime();
      return ageMs <= minutes * 60 * 1000;
    }

    return (event.minutesAgo ?? 9999) <= minutes;
  });
}

function getRecentCountrySignalEvents(
  events: CommentEvent[],
  country: Country,
  minutes = 20
) {
  return getRecentCountryEvents(events, country, minutes).filter((event) => {
    if (!event.text) return false;
    return isLikelyLiveSignalComment(event.text);
  });
}

function mapAIStatus(status?: string): "Quiet" | "Suspicious" | "Being attacked" {
  const s = (status || "").toLowerCase();
  if (s.includes("being attacked")) return "Being attacked";
  if (s.includes("active")) return "Being attacked";
  if (s.includes("suspicious")) return "Suspicious";
  return "Quiet";
}

function mapAIConfidence(confidence: number): "Low" | "Medium" | "High" {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

function scoreFromAI(
  status: "Quiet" | "Suspicious" | "Being attacked",
  confidence: number
) {
  const base =
    status === "Being attacked"
      ? 90
      : status === "Suspicious"
      ? 55
      : 10;

  return Math.max(
    0,
    Math.min(100, Math.round(base * confidence + (status !== "Quiet" ? 8 : 0)))
  );
}

export async function POST() {
  const now = Date.now();
  const lastSync = await getLastRedditSyncAt();

  if (await isRedditSyncInProgress()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "sync already in progress",
      lastSync,
    });
  }

  if (now - lastSync < MIN_SYNC_INTERVAL_MS) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "rate limited locally",
      lastSync,
      nextAllowedInMs: MIN_SYNC_INTERVAL_MS - (now - lastSync),
    });
  }

  try {
    await setRedditSyncInProgress(true);

    const freshEvents = await fetchRedditThreadEvents();
    const syncedAt = Date.now();

    await addEvents(freshEvents);
    await setLastRedditSyncAt(syncedAt);

    const allStoredEvents = await getEvents();

    const aiResults: Array<{
      country: Country;
      signalCommentCount: number;
      uniqueUsers: number;
      ai: {
        status: "Quiet" | "Suspicious" | "Being attacked";
        confidence: "Low" | "Medium" | "High";
        score: number;
        reason: string;
      };
    }> = [];

    for (const country of COUNTRIES) {
      const signalEvents = getRecentCountrySignalEvents(allStoredEvents, country, 20);
      const uniqueUsers = new Set(signalEvents.map((e) => e.author)).size;

      let finalStatus: "Quiet" | "Suspicious" | "Being attacked" = "Quiet";
      let finalConfidence: "Low" | "Medium" | "High" = "Low";
      let finalScore = 10;
      let finalReason = "Not enough recent live signal comments.";

      if (signalEvents.length >= 2 && uniqueUsers >= 2) {
        const commentsForAI = signalEvents
          .slice(0, 8)
          .map((e) => `${e.author}: ${e.text}`);

        try {
          console.log("Calling Groq AI for", country, {
            signalEvents: signalEvents.length,
            uniqueUsers,
            commentsForAI,
          });

          const ai = await classifySignal(commentsForAI);
          console.log("Groq AI result for", country, ai);

          const mappedStatus = mapAIStatus(ai?.status);
          const confidenceNumber =
            typeof ai?.confidence === "number" ? ai.confidence : 0.5;

          finalStatus = mappedStatus;
          finalConfidence = mapAIConfidence(confidenceNumber);
          finalScore = scoreFromAI(mappedStatus, confidenceNumber);
          finalReason =
            typeof ai?.reason === "string" && ai.reason.trim()
              ? ai.reason
              : "AI returned no reason.";
        } catch (err) {
          console.error(`AI classification failed for ${country}`, err);
          finalStatus = "Suspicious";
          finalConfidence = "Medium";
          finalScore = 50;
          finalReason = "AI classification failed; using fallback suspicious state.";
        }
      } else if (signalEvents.length >= 1) {
        finalStatus = "Suspicious";
        finalConfidence = "Low";
        finalScore = 20;
        finalReason = "Single recent live signal comment detected.";
      }

      await setAICountryState({
        country,
        status: finalStatus,
        confidence: finalConfidence,
        score: finalScore,
        reason: finalReason,
        signalCommentCount: signalEvents.length,
        uniqueUsers,
        updatedAt: syncedAt,
      });

      aiResults.push({
        country,
        signalCommentCount: signalEvents.length,
        uniqueUsers,
        ai: {
          status: finalStatus,
          confidence: finalConfidence,
          score: finalScore,
          reason: finalReason,
        },
      });
    }

    const gulfSummaryInput = {
      bahrain: getRecentCountrySignalEvents(allStoredEvents, "Bahrain", 30)
        .slice(0, 8)
        .map((e) => `${e.author}: ${e.text}`),
      qatar: getRecentCountrySignalEvents(allStoredEvents, "Qatar", 30)
        .slice(0, 8)
        .map((e) => `${e.author}: ${e.text}`),
      uae: getRecentCountrySignalEvents(allStoredEvents, "UAE", 30)
        .slice(0, 8)
        .map((e) => `${e.author}: ${e.text}`),
      dubai: getRecentCountrySignalEvents(allStoredEvents, "Dubai", 30)
        .slice(0, 8)
        .map((e) => `${e.author}: ${e.text}`),
    };

    try {
      const summary = await summarizeGulfSituation(gulfSummaryInput);

      await setGulfSummary({
        headline: summary?.headline || "Gulf situation unclear",
        summary: summary?.summary || "No clear summary available.",
        regionalPattern:
          summary?.regionalPattern === "localized" ||
          summary?.regionalPattern === "spreading" ||
          summary?.regionalPattern === "quiet"
            ? summary.regionalPattern
            : "unclear",
        bahrainRiskHint:
          summary?.bahrainRiskHint === "high" ||
          summary?.bahrainRiskHint === "elevated"
            ? summary.bahrainRiskHint
            : "low",
        updatedAt: syncedAt,
      });
    } catch (err) {
      console.error("Gulf summary AI failed", err);

      await setGulfSummary({
        headline: "Gulf situation unclear",
        summary: "Summary generation failed.",
        regionalPattern: "unclear",
        bahrainRiskHint: "low",
        updatedAt: syncedAt,
      });
    }

    return NextResponse.json({
      ok: true,
      added: freshEvents.length,
      skipped: false,
      lastSync: syncedAt,
      aiResults,
    });
  } catch (error) {
    console.error("reddit-sync failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "reddit-sync failed",
        lastSync,
      },
      { status: 500 }
    );
  } finally {
    await setRedditSyncInProgress(false);
  }
}