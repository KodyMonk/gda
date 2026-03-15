import { CommentEvent } from "./types";
import { detectCountry } from "./utils";

type XPost = {
  id: string;
  text: string;
  author: string;
  createdAt?: string;
};

export function mapXPostsToEvents(posts: XPost[]): CommentEvent[] {
  const now = Date.now();

  return posts.map((post) => {
    const createdMs = post.createdAt ? new Date(post.createdAt).getTime() : now;
    const minutesAgo = Math.max(0, Math.round((now - createdMs) / 60000));

    return {
      id: `x-${post.id}`,
      source: "x",
      country: detectCountry(post.text),
      author: post.author,
      text: post.text,
      minutesAgo,
      createdAt: new Date(createdMs).toISOString(),
    };
  });
}