import { CommentEvent } from "./types";
import { detectCountry } from "./utils";

type RedditComment = {
  id: string;
  author: string;
  body: string;
  ups?: number;
  created_utc?: number;
};

export function mapRedditCommentsToEvents(comments: RedditComment[]): CommentEvent[] {
  const now = Date.now();

  return comments.map((comment) => {
    const createdMs = (comment.created_utc ?? Math.floor(now / 1000)) * 1000;
    const minutesAgo = Math.max(0, Math.round((now - createdMs) / 60000));

    return {
      id: `reddit-${comment.id}`,
      source: "reddit",
      country: detectCountry(comment.body),
      author: comment.author || "unknown",
      text: comment.body,
      minutesAgo,
      upvotes: comment.ups ?? 0,
      createdAt: new Date(createdMs).toISOString(),
    };
  });
}