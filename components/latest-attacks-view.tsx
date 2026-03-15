"use client";

import { useEffect, useState } from "react";
import { CommentEvent } from "@/lib/types";
import { LiveEventCard } from "./live-event-card";
import { Card, CardContent } from "@/components/ui/card";
import { Siren, TimerReset } from "lucide-react";

export function LatestAttacksView({ dark }: { dark: boolean }) {
  const [events, setEvents] = useState<CommentEvent[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-zinc-200/80 bg-white/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/75 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-200">
              <Siren className="h-3.5 w-3.5" />
              Latest attacks
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Most recent attack-related signals and mentions
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              A responsive event list built for quick scanning on mobile and desktop, using the same visual system as the dashboard.
            </p>
          </div>

          <Card className="border-zinc-200/80 bg-white/85 shadow-none dark:border-zinc-800/80 dark:bg-zinc-900/75">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                <TimerReset className="h-3.5 w-3.5" />
                Events loaded
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                {events.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/65 dark:text-zinc-400">
          No events available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <LiveEventCard key={event.id} event={event} dark={dark} />
          ))}
        </div>
      )}
    </div>
  );
}
