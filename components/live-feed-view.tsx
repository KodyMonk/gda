"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Globe2, RadioTower, ShieldCheck } from "lucide-react";

const SOURCES = [
  {
    key: "aje",
    label: "Al Jazeera",
    handle: "@AJENews",
    url: "https://x.com/AJENews",
    description: "Breaking regional and international news coverage.",
  },
  {
    key: "brics",
    label: "BRICS",
    handle: "@BRICSinfo",
    url: "https://x.com/BRICSinfo",
    description: "Geopolitical and regional updates relevant to the Gulf.",
  },
  {
    key: "moi",
    label: "MOI Bahrain",
    handle: "@moi_bahrain",
    url: "https://x.com/moi_bahrain",
    description: "Official Bahrain public safety and alert updates.",
  },
];

export function LiveFeedView({ dark }: { dark: boolean }) {
  return (
    <div className="space-y-6" data-theme={dark ? "dark" : "light"}>
      <div className="rounded-[28px] border border-zinc-200/80 bg-white/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/75 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">
              <RadioTower className="h-3.5 w-3.5" />
              Live feed
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Official and media signal sources in one place
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Quick access to the feeds most relevant to Bahrain and Gulf situational monitoring, with a layout that stays readable on mobile.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/75">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                <Globe2 className="h-3.5 w-3.5" />
                Source count
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                {SOURCES.length}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/75">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Focus
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                Bahrain alerts, regional coverage, geopolitical context
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SOURCES.map((source) => (
          <div
            key={source.key}
            className="rounded-[28px] border border-zinc-200/80 bg-white/85 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/75 sm:p-6"
          >
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                  {source.label}
                </div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {source.handle}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {source.description}
              </p>

              <div className="pt-2">
                <Button asChild className="h-10 w-full gap-2 rounded-full sm:w-auto">
                  <a href={source.url} target="_blank" rel="noreferrer">
                    Open on X
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white/70 p-4 text-sm leading-6 text-zinc-600 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/65 dark:text-zinc-400">
        X embeds are not rendering reliably here, so this page is temporarily set up as a stable source hub instead of a broken fake feed.
      </div>
    </div>
  );
}
