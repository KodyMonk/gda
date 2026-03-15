import { NextResponse } from "next/server";
import { addEvents } from "@/lib/store";
import { CommentEvent } from "@/lib/types";

let lastXSyncAt = 0;
let xSyncInProgress = false;

const MIN_X_SYNC_INTERVAL_MS = 60_000;

function makeMockXEvents(): CommentEvent[] {
  const now = Date.now();

  return [
    {
      id: `x-aje-${now}`,
      source: "x",
      country: "Unknown",
      author: "@AJENews",
      text: "Regional developments continue across the Gulf as officials monitor the situation.",
      minutesAgo: 1,
      createdAt: new Date(now - 60_000).toISOString(),
      xAccountKey: "aje",
      xAccountLabel: "AJE News",
      xUrl: "https://x.com/AJENews",
    },
    {
      id: `x-brics-${now + 1}`,
      source: "x",
      country: "Unknown",
      author: "@BRICSinfo",
      text: "Fresh updates are emerging from the region as countries assess security conditions.",
      minutesAgo: 2,
      createdAt: new Date(now - 120_000).toISOString(),
      xAccountKey: "brics",
      xAccountLabel: "BRICS",
      xUrl: "https://x.com/BRICSinfo",
    },
    {
      id: `x-moi-${now + 2}`,
      source: "x",
      country: "Bahrain",
      author: "@moi_bahrain",
      text: "The siren has been sounded. Citizens and residents are urged to remain calm and head to the nearest safe place.",
      minutesAgo: 3,
      createdAt: new Date(now - 180_000).toISOString(),
      xAccountKey: "moi",
      xAccountLabel: "MOI Bahrain",
      xUrl: "https://x.com/moi_bahrain",
    },
  ];
}

export async function POST() {
  const now = Date.now();

  if (xSyncInProgress) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "x sync already in progress",
      lastSync: lastXSyncAt,
    });
  }

  if (now - lastXSyncAt < MIN_X_SYNC_INTERVAL_MS) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "x sync rate limited locally",
      lastSync: lastXSyncAt,
      nextAllowedInMs: MIN_X_SYNC_INTERVAL_MS - (now - lastXSyncAt),
    });
  }

  try {
    xSyncInProgress = true;

    const events = makeMockXEvents();
    addEvents(events);
    lastXSyncAt = Date.now();

    return NextResponse.json({
      ok: true,
      added: events.length,
      lastSync: lastXSyncAt,
    });
  } finally {
    xSyncInProgress = false;
  }
}