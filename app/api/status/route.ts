import { NextResponse } from "next/server";
import {
  getEvents,
  getLastRedditSyncAt,
  getAICountryState,
  getGulfSummary,
} from "@/lib/store";

function computeBahrainRisk30(input: {
  bahrain: Awaited<ReturnType<typeof getAICountryState>>;
  qatar: Awaited<ReturnType<typeof getAICountryState>>;
  uae: Awaited<ReturnType<typeof getAICountryState>>;
  dubai: Awaited<ReturnType<typeof getAICountryState>>;
  gulfSummary: Awaited<ReturnType<typeof getGulfSummary>>;
}) {
  const { bahrain, qatar, uae, dubai, gulfSummary } = input;

  let score = 0;

  const bahrainMentions = bahrain?.signalCommentCount ?? 0;
  const qatarMentions = qatar?.signalCommentCount ?? 0;
  const uaeMentions = uae?.signalCommentCount ?? 0;
  const dubaiMentions = dubai?.signalCommentCount ?? 0;

  // 1) Bahrain direct live signals should NEVER keep risk at 0
  if (bahrainMentions >= 1) score = Math.max(score, 18);
  if (bahrainMentions >= 2) score = Math.max(score, 30);
  if (bahrainMentions >= 3) score = Math.max(score, 42);

  // 2) Bahrain AI status
  if (bahrain?.status === "Suspicious") score = Math.max(score, 32);
  if (bahrain?.status === "Being attacked") score = Math.max(score, 78);

  // 3) Bahrain AI confidence
  if (bahrain?.confidence === "Medium") score += 6;
  if (bahrain?.confidence === "High") score += 12;

  // 4) Gulf summary should directly influence the floor
  if (gulfSummary?.bahrainRiskHint === "elevated") {
    score = Math.max(score, 28);
  }

  if (gulfSummary?.bahrainRiskHint === "high") {
    score = Math.max(score, 55);
  }

  if (gulfSummary?.regionalPattern === "localized") {
    score += 6;
  }

  if (gulfSummary?.regionalPattern === "spreading") {
    score += 15;
    score = Math.max(score, 40);
  }

  // 5) Regional cascade logic
  if (qatar?.status === "Being attacked") score += 12;
  else if (qatar?.status === "Suspicious") score += 6;

  if (uae?.status === "Being attacked") score += 10;
  else if (uae?.status === "Suspicious") score += 5;

  if (dubai?.status === "Being attacked") score += 10;
  else if (dubai?.status === "Suspicious") score += 5;

  // 6) Regional mention count support
  if (qatarMentions >= 1) score += 3;
  if (uaeMentions >= 1) score += 3;
  if (dubaiMentions >= 1) score += 4;

  const activeRegionalCount = [qatar, uae, dubai].filter(
    (s) => s?.status === "Being attacked"
  ).length;

  const suspiciousRegionalCount = [qatar, uae, dubai].filter(
    (s) => s?.status === "Suspicious"
  ).length;

  if (activeRegionalCount >= 1) score += 8;
  if (activeRegionalCount >= 2) score += 12;
  if (activeRegionalCount >= 1 && suspiciousRegionalCount >= 1) score += 8;
  if (suspiciousRegionalCount >= 2) score += 6;

  // 7) Keep quiet state realistically low
  if (
    bahrainMentions === 0 &&
    bahrain?.status !== "Suspicious" &&
    bahrain?.status !== "Being attacked" &&
    gulfSummary?.bahrainRiskHint !== "elevated" &&
    gulfSummary?.bahrainRiskHint !== "high"
  ) {
    score = Math.min(score, 12);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function GET() {
  const events = await getEvents();
  const gulfSummary = await getGulfSummary();

  const bahrain = await getAICountryState("Bahrain");
  const qatar = await getAICountryState("Qatar");
  const uae = await getAICountryState("UAE");
  const saudi = await getAICountryState("Saudi");
  const dubai = await getAICountryState("Dubai");

  const bahrainRisk30 = computeBahrainRisk30({
    bahrain,
    qatar,
    uae,
    dubai,
    gulfSummary,
  });

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
    latestEvents: events
      .filter((event) => event.source === "reddit")
      .slice(0, 50),
    lastRedditSyncAt: await getLastRedditSyncAt(),
    gulfSummary,
  });
}