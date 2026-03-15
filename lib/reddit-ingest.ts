import { z } from "zod";
import { CommentEvent } from "./types";
import { detectCountry, normalizeText } from "./utils";
import { REDDIT_THREADS, getRedditJsonUrl } from "./reddit-config";
import { hasSeenEvent } from "./store";

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
];

const EXCLUSION_PHRASES = [
  "yesterday",
  "let's hope",
  "hope they",
  "managed to",
  "rate of attacks",
  "missile launchers",
  "article",
  "report says",
  "according to",
  "source:",
  "x.com/",
  "twitter.com/",
  "http://",
  "https://",
  "reddit.com/",
  "news",
  "breaking:",
  "analyst",
  "probably",
  "i think iran",
  "usa were striking",
  "were striking iran",
  "intercepted and destroyed",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function flattenComments(children: any[], out: any[] = []) {
  for (const child of children ?? []) {
    if (!child || child.kind !== "t1") continue;

    const data = child.data;
    out.push(data);

    const repliesChildren =
      data?.replies?.data?.children && Array.isArray(data.replies.data.children)
        ? data.replies.data.children
        : [];

    if (repliesChildren.length > 0) {
      flattenComments(repliesChildren, out);
    }
  }
  return out;
}

function hasAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(normalizeText(phrase)));
}

function countMatches(text: string, phrases: string[]) {
  return phrases.filter((phrase) => text.includes(normalizeText(phrase))).length;
}

function isLikelyLiveAttackComment(body: string) {
  const text = normalizeText(body);

  if (!text || text === "[deleted]" || text === "[removed]") return false;
  if (text.length < 3) return false;
  if (hasAny(text, EXCLUSION_PHRASES)) return false;

  const hasStrong = hasAny(text, STRONG_SENSORY_PHRASES);
  const weakCount = countMatches(text, WEAK_SENSORY_WORDS);
  const hasLiveContext = hasAny(text, LIVE_CONTEXT_WORDS);

  if (hasStrong) return true;
  if (weakCount >= 2 && hasLiveContext) return true;
  if (weakCount >= 3) return true;

  return false;
}

export async function fetchRedditThreadEvents(): Promise<CommentEvent[]> {
  const allEvents: CommentEvent[] = [];
  const now = Date.now();

  for (const thread of REDDIT_THREADS) {
    const jsonUrl = getRedditJsonUrl(thread.url);

    try {
      const res = await fetch(jsonUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 GulfAttackMonitor/0.1",
          "Accept": "application/json",
        },
        cache: "no-store",
      });

      if (res.status === 429) {
        console.warn(`Failed Reddit fetch for ${thread.label}: 429`);
        await sleep(1500);
        continue;
      }

      if (!res.ok) {
        console.warn(`Failed Reddit fetch for ${thread.label}: ${res.status}`);
        await sleep(800);
        continue;
      }

      const payload = await res.json();
      if (!Array.isArray(payload) || payload.length < 2) {
        await sleep(500);
        continue;
      }

      const commentsListing = payload[1];
      const commentChildren = commentsListing?.data?.children ?? [];
      const flatComments = flattenComments(commentChildren);

      const parsedComments = flatComments
        .map((rawComment) =>
          z
            .object({
              id: z.string(),
              author: z.string().catch("unknown"),
              body: z.string().catch(""),
              ups: z.number().optional(),
              created_utc: z.number().optional(),
            })
            .safeParse(rawComment)
        )
        .filter((x) => x.success)
        .map((x) => x.data)
        .sort((a, b) => (b.created_utc ?? 0) - (a.created_utc ?? 0))
        .slice(0, 120); // don't process huge thread every time

      for (const c of parsedComments) {
        if (!isLikelyLiveAttackComment(c.body)) continue;

        const createdMs = (c.created_utc ?? Math.floor(now / 1000)) * 1000;
        const minutesAgo = Math.max(0, Math.round((now - createdMs) / 60000));

        const inferredCountry = detectCountry(c.body);
        const country = inferredCountry === "Unknown" ? thread.country : inferredCountry;

        const event: CommentEvent = {
          id: `reddit-${thread.key}-${c.id}`,
          source: "reddit",
          country,
          author: c.author,
          text: c.body,
          minutesAgo,
          upvotes: c.ups ?? 0,
          createdAt: new Date(createdMs).toISOString(),
          threadKey: thread.key,
          threadLabel: thread.label,
          threadUrl: thread.url,
        };

        if (!hasSeenEvent(event.id)) {
          allEvents.push(event);
        }
      }

      await sleep(1200); // important: slow down between threads
    } catch (error) {
      console.error(`Reddit fetch crashed for ${thread.label}`, error);
      await sleep(1000);
    }
  }

  return allEvents.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}