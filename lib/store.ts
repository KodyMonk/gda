import { CommentEvent, Country } from "./types";

type StoredAIState = {
  country: Country;
  status: "Quiet" | "Suspicious" | "Being attacked";
  confidence: "Low" | "Medium" | "High";
  score: number;
  reason: string;
  signalCommentCount: number;
  uniqueUsers: number;
  updatedAt: number;
};

type GulfSummaryState = {
  headline: string;
  summary: string;
  regionalPattern: "localized" | "spreading" | "unclear" | "quiet";
  bahrainRiskHint: "low" | "elevated" | "high";
  updatedAt: number;
};

let events: CommentEvent[] = [];
const seenIds = new Set<string>();

let lastRedditSyncAt = 0;
let redditSyncInProgress = false;

const aiStates: Partial<Record<Country, StoredAIState>> = {};
let gulfSummary: GulfSummaryState | null = null;

export function getEvents(): CommentEvent[] {
  return events;
}

export function addEvents(newEvents: CommentEvent[]) {
  const deduped = newEvents.filter((e) => !seenIds.has(e.id));

  for (const event of deduped) {
    seenIds.add(event.id);
  }

  events = [...deduped, ...events]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 1000);
}

export function clearEvents() {
  events = [];
  seenIds.clear();
}

export function hasSeenEvent(id: string): boolean {
  return seenIds.has(id);
}

export function getLastRedditSyncAt() {
  return lastRedditSyncAt;
}

export function setLastRedditSyncAt(timestamp: number) {
  lastRedditSyncAt = timestamp;
}

export function isRedditSyncInProgress() {
  return redditSyncInProgress;
}

export function setRedditSyncInProgress(value: boolean) {
  redditSyncInProgress = value;
}

export function setAICountryState(state: StoredAIState) {
  aiStates[state.country] = state;
}

export function getAICountryState(country: Country) {
  return aiStates[country];
}

export function setGulfSummary(summary: GulfSummaryState) {
  gulfSummary = summary;
}

export function getGulfSummary() {
  return gulfSummary;
}