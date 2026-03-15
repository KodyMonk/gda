import { mapRedditCommentsToEvents } from "../lib/reddit-adapter";

/**
 * Later:
 * 1. fetch Reddit comments from chosen megathreads
 * 2. map them to events
 * 3. POST them to /api/events
 *
 * This is just a scaffold for now.
 */

async function run() {
  const mockComments = [
    {
      id: "abc123",
      author: "thread_user_1",
      body: "Loud thud in Manama just now",
      ups: 3,
      created_utc: Math.floor(Date.now() / 1000) - 60,
    },
    {
      id: "abc124",
      author: "thread_user_2",
      body: "Heard it in Muharraq too",
      ups: 2,
      created_utc: Math.floor(Date.now() / 1000) - 40,
    },
  ];

  const events = mapRedditCommentsToEvents(mockComments);

  await fetch("http://localhost:3000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });

  console.log(`Pushed ${events.length} Reddit events`);
}

run().catch(console.error);