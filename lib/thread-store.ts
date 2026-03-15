import { Redis } from "@upstash/redis"
import { REDDIT_THREADS, RedditThreadConfig } from "./reddit-config"

type StoredThreadMap = Partial<Record<RedditThreadConfig["key"], string>>

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  return new Redis({
    url,
    token
  })
}

const THREADS_KEY = "reddit_threads_config"

export async function getConfiguredRedditThreads(): Promise<RedditThreadConfig[]> {

  const redis = getRedis()
  if (!redis) return REDDIT_THREADS

  const stored = await redis.get<StoredThreadMap>(THREADS_KEY)

  if (!stored) return REDDIT_THREADS

  return REDDIT_THREADS.map(thread => ({
    ...thread,
    url: stored[thread.key] && stored[thread.key]!.trim()
      ? stored[thread.key]!.trim()
      : thread.url
  }))
}

export async function saveConfiguredRedditThreads(input: StoredThreadMap) {

  const redis = getRedis()

  if (!redis) {
    throw new Error("Redis not configured")
  }

  await redis.set(THREADS_KEY, input)

  return getConfiguredRedditThreads()
}