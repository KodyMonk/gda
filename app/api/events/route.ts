import { NextRequest, NextResponse } from "next/server";
import { addEvents, getEvents } from "@/lib/store";
import { CommentEvent } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ events: getEvents() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const events = (body.events ?? []) as CommentEvent[];
  addEvents(events);
  return NextResponse.json({ ok: true, count: events.length });
}