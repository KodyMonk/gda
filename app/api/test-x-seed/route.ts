import { NextResponse } from "next/server";
import { addEvents } from "@/lib/store";
import { CommentEvent } from "@/lib/types";

export async function POST() {
  const now = Date.now();

  const sampleXEvents: CommentEvent[] = [
    {
      id: `x-aje-${now}`,
      source: "x",
      country: "Bahrain",
      author: "@AJENews",
      text: "Bahrain says warning sirens were activated after direct threats.",
      minutesAgo: 1,
      createdAt: new Date(now).toISOString(),
      xAccountKey: "aje",
      xAccountLabel: "AJE News",
      xUrl: "https://x.com/AJENews",
    },
    {
      id: `x-brics-${now + 1}`,
      source: "x",
      country: "Qatar",
      author: "@BRICSinfo",
      text: "New reports of regional tensions as Gulf states monitor airspace.",
      minutesAgo: 2,
      createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
      xAccountKey: "brics",
      xAccountLabel: "BRICS",
      xUrl: "https://x.com/BRICSinfo",
    },
    {
      id: `x-moi-${now + 2}`,
      source: "x",
      country: "Bahrain",
      author: "@moi_bahrain",
      text: "Official update from Bahrain authorities regarding public safety procedures.",
      minutesAgo: 3,
      createdAt: new Date(now - 3 * 60 * 1000).toISOString(),
      xAccountKey: "moi",
      xAccountLabel: "MOI Bahrain",
      xUrl: "https://x.com/moi_bahrain",
    },
  ];

  addEvents(sampleXEvents);

  return NextResponse.json({
    ok: true,
    added: sampleXEvents.length,
  });
}