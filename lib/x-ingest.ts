import { CommentEvent } from "./types";
import { X_FEEDS } from "./x-config";
import { detectCountry } from "./utils";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Placeholder parser.
// Later we can adapt this for whatever source works best.
function extractPostCandidates(rawHtml: string): string[] {
  const text = stripHtml(rawHtml);

  // Very rough split to create candidates.
  // This is only a starter scaffold.
  return text
    .split(" · ")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 40)
    .slice(0, 20);
}

export async function fetchXFeedEvents(): Promise<CommentEvent[]> {
  const allEvents: CommentEvent[] = [];
  const now = Date.now();

  for (const feed of X_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 GulfAttackMonitor/0.1",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`X fetch failed for ${feed.label}: ${res.status}`);
        await sleep(1000);
        continue;
      }

      const html = await res.text();
      const candidates = extractPostCandidates(html);

      candidates.forEach((text, index) => {
        const createdMs = now - index * 60_000;

        allEvents.push({
          id: `x-${feed.key}-${createdMs}-${index}`,
          source: "x",
          country: detectCountry(text),
          author: `@${feed.username}`,
          text,
          minutesAgo: index,
          createdAt: new Date(createdMs).toISOString(),
          xAccountKey: feed.key,
          xAccountLabel: feed.label,
          xUrl: feed.url,
        });
      });

      await sleep(1200);
    } catch (error) {
      console.error(`X ingest failed for ${feed.label}`, error);
      await sleep(1000);
    }
  }

  return allEvents;
}