import { NextResponse } from "next/server";
import { getEvents } from "@/lib/store";

export async function GET() {
  const events = getEvents()
    .filter((event) => event.source === "x")
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return NextResponse.json({ events });
}