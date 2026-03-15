import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CommentEvent, Country } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function detectCountry(text: string): Country {
  const t = normalizeText(text);

  if (t.includes("bahrain") || t.includes("manama") || t.includes("muharraq") || t.includes("juffair")) {
    return "Bahrain";
  }
  if (t.includes("qatar") || t.includes("doha")) return "Qatar";
  if (t.includes("uae") || t.includes("dubai") || t.includes("abu dhabi")) return "UAE";
  if (t.includes("saudi") || t.includes("riyadh") || t.includes("dammam") || t.includes("jeddah")) return "Saudi";
  if (t.includes("kuwait")) return "Kuwait";

  return "Unknown";
}

export function parsePastedEvents(raw: string): CommentEvent[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `p-${index}`,
      source: "reddit" as const,
      country: detectCountry(line),
      author: "pasted-feed",
      text: line,
      minutesAgo: index,
    }));
}