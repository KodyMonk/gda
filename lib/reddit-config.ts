export type RedditThreadConfig = {
  key: string
  label: string
  country: "Bahrain" | "Qatar" | "UAE" | "Dubai" | "Saudi"
  url: string
}

export const REDDIT_THREADS: RedditThreadConfig[] = [
  {
    key: "bahrain",
    label: "Bahrain",
    country: "Bahrain",
    url: "https://www.reddit.com/r/Bahrain/comments/1rspfv5/megathread_day_13_update_iran_attacks_bahrain/"
  },
  {
    key: "qatar",
    label: "Qatar",
    country: "Qatar",
    url: "https://www.reddit.com/r/qatar/comments/1rtti24/megathread_day_16/"
  },
  {
    key: "uae",
    label: "UAE",
    country: "UAE",
    url: "https://www.reddit.com/r/UAE/comments/1rhe3ph/war_megathread/"
  },
  {
    key: "dubai",
    label: "Dubai",
    country: "Dubai",
    url: "https://www.reddit.com/r/dubai/comments/1ru1urz/attacks_megathread_part_22/"
  },
  {
    key: "saudi",
    label: "Saudi",
    country: "Saudi",
    url: "https://www.reddit.com/r/saudiarabia/comments/REPLACE_WITH_SAUDI_MEGATHREAD/"
  }
]

export function getRedditJsonUrl(url: string) {
  const clean = url.replace(/\/$/, "")
  return `${clean}.json?sort=new&limit=500&raw_json=1`
}