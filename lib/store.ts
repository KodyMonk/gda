import { Redis } from "@upstash/redis";
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

type StoreShape = {
  events: CommentEvent[];
  seenIds: string[];
  lastRedditSyncAt: number;
  redditSyncInProgress: boolean;
  aiStates: Partial<Record<Country, StoredAIState>>;
  gulfSummary: GulfSummaryState | null;
};

const STORE_KEY = "gulf_attack_monitor_store";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Upstash Redis is not configured.");
  }

  return new Redis({ url, token });
}

function getDefaultStore(): StoreShape {
  return {
    events: [],
    seenIds: [],
    lastRedditSyncAt: 0,
    redditSyncInProgress: false,
    aiStates: {},
    gulfSummary: null,
  };
}

async function readStore(): Promise<StoreShape> {
  const redis = getRedis();
  const stored = await redis.get<StoreShape>(STORE_KEY);

  if (!stored) return getDefaultStore();

  return {
    events: stored.events ?? [],
    seenIds: stored.seenIds ?? [],
    lastRedditSyncAt: stored.lastRedditSyncAt ?? 0,
    redditSyncInProgress: stored.redditSyncInProgress ?? false,
    aiStates: stored.aiStates ?? {},
    gulfSummary: stored.gulfSummary ?? null,
  };
}

async function writeStore(store: StoreShape) {
  const redis = getRedis();
  await redis.set(STORE_KEY, store);
}

export async function getEvents(): Promise<CommentEvent[]> {
  const store = await readStore();
  return store.events;
}

export async function addEvents(newEvents: CommentEvent[]) {
  const store = await readStore();
  const seenIds = new Set(store.seenIds);

  const deduped = newEvents.filter((e) => !seenIds.has(e.id));

  for (const event of deduped) {
    seenIds.add(event.id);
  }

  store.events = [...deduped, ...store.events]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 1000);

  store.seenIds = Array.from(seenIds).slice(-5000);

  await writeStore(store);
}

export async function clearEvents() {
  const store = await readStore();
  store.events = [];
  store.seenIds = [];
  await writeStore(store);
}

export async function hasSeenEvent(id: string): Promise<boolean> {
  const store = await readStore();
  return store.seenIds.includes(id);
}

export async function getLastRedditSyncAt(): Promise<number> {
  const store = await readStore();
  return store.lastRedditSyncAt;
}

export async function setLastRedditSyncAt(timestamp: number) {
  const store = await readStore();
  store.lastRedditSyncAt = timestamp;
  await writeStore(store);
}

export async function isRedditSyncInProgress(): Promise<boolean> {
  const store = await readStore();
  return store.redditSyncInProgress;
}

export async function setRedditSyncInProgress(value: boolean) {
  const store = await readStore();
  store.redditSyncInProgress = value;
  await writeStore(store);
}

export async function setAICountryState(state: StoredAIState) {
  const store = await readStore();
  store.aiStates[state.country] = state;
  await writeStore(store);
}

export async function getAICountryState(country: Country): Promise<StoredAIState | undefined> {
  const store = await readStore();
  return store.aiStates[country];
}

export async function getAllAICountryStates(): Promise<Partial<Record<Country, StoredAIState>>> {
  const store = await readStore();
  return store.aiStates;
}

export async function setGulfSummary(summary: GulfSummaryState) {
  const store = await readStore();
  store.gulfSummary = summary;
  await writeStore(store);
}

export async function getGulfSummary(): Promise<GulfSummaryState | null> {
  const store = await readStore();
  return store.gulfSummary;
}