import { NextResponse } from "next/server";
import {
  getEvents,
  getLastRedditSyncAt,
  getAICountryState,
  getGulfSummary,
} from "@/lib/store";

function computeBahrainRisk30() {
  const bahrain = getAICountryState("Bahrain");
  const qatar = getAICountryState("Qatar");
  const uae = getAICountryState("UAE");
  const dubai = getAICountryState("Dubai");

  let score = 0;

  // Direct Bahrain status matters most
  if (bahrain?.status === "Being attacked") score += 70;
  else if (bahrain?.status === "Suspicious") score += 35;

  // Regional cascade logic
  if (qatar?.status === "Being attacked") score += 12;
  else if (qatar?.status === "Suspicious") score += 6;

  if (uae?.status === "Being attacked") score += 10;
  else if (uae?.status === "Suspicious") score += 5;

  if (dubai?.status === "Being attacked") score += 10;
  else if (dubai?.status === "Suspicious") score += 5;

  // If multiple nearby countries show activity, Bahrain risk rises
  const activeRegionalCount = [qatar, uae, dubai].filter(
    (s) => s?.status === "Being attacked"
  ).length;

  const suspiciousRegionalCount = [qatar, uae, dubai].filter(
    (s) => s?.status === "Suspicious"
  ).length;

  if (activeRegionalCount >= 2) score += 12;
  if (activeRegionalCount >= 1 && suspiciousRegionalCount >= 1) score += 8;

  return Math.max(0, Math.min(100, score));
}

export async function GET() {
  const events = getEvents();
  const gulfSummary = getGulfSummary();

  const bahrain = getAICountryState("Bahrain");
  const qatar = getAICountryState("Qatar");
  const uae = getAICountryState("UAE");
  const saudi = getAICountryState("Saudi");
  const dubai = getAICountryState("Dubai");

  const bahrainRisk30 = computeBahrainRisk30();

  return NextResponse.json({
    countries: [
      {
        country: "Bahrain",
        totalRecentMentions: bahrain?.signalCommentCount ?? 0,
        status: bahrain?.status ?? "Quiet",
        confidence: bahrain?.confidence ?? "Low",
      },
      {
        country: "Qatar",
        totalRecentMentions: qatar?.signalCommentCount ?? 0,
        status: qatar?.status ?? "Quiet",
        confidence: qatar?.confidence ?? "Low",
      },
      {
        country: "UAE",
        totalRecentMentions: uae?.signalCommentCount ?? 0,
        status: uae?.status ?? "Quiet",
        confidence: uae?.confidence ?? "Low",
      },
      {
        country: "Saudi",
        totalRecentMentions: saudi?.signalCommentCount ?? 0,
        status: saudi?.status ?? "Quiet",
        confidence: saudi?.confidence ?? "Low",
      },
      {
        country: "Dubai",
        totalRecentMentions: dubai?.signalCommentCount ?? 0,
        status: dubai?.status ?? "Quiet",
        confidence: dubai?.confidence ?? "Low",
      },
    ],
    bahrainRisk30,
    latestEvents: events.filter((event) => event.source === "reddit").slice(0, 50),
    lastRedditSyncAt: getLastRedditSyncAt(),
    gulfSummary,
  });
}