"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiStatusResponse, Country, CommentEvent } from "@/lib/types";
import { CountryStatusCard } from "./country-status-card";
import { LiveEventCard } from "./live-event-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, RefreshCw } from "lucide-react";

type FilterKey = "All" | Country;

function formatLastSync(timestamp?: number) {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatUpdatedAgo(timestamp?: number) {
  if (!timestamp) return "";
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function DashboardView({ dark }: { dark: boolean }) {
  const [data, setData] = useState<ApiStatusResponse | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [syncMessage, setSyncMessage] = useState("");
  const [, forceTick] = useState(0);

  async function loadStatus() {
    const res = await fetch("/api/status", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  async function syncNow() {
    try {
      setSyncing(true);
      setSyncMessage("");

      const res = await fetch("/api/reddit-sync", {
        method: "POST",
        cache: "no-store",
      });

      const json = await res.json();

      if (json.skipped) {
        if (
          json.reason === "rate limited locally" &&
          typeof json.nextAllowedInMs === "number"
        ) {
          const secs = Math.ceil(json.nextAllowedInMs / 1000);
          setSyncMessage(`Sync limited. Try again in ${secs}s.`);
        } else if (json.reason === "sync already in progress") {
          setSyncMessage("Sync already in progress.");
        }
      } else {
        setSyncMessage(`Synced. Added ${json.added ?? 0} new events.`);
      }

      await loadStatus();
    } catch {
      setSyncMessage("Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function syncAndLoad() {
      try {
        await fetch("/api/reddit-sync", { method: "POST" });
        const res = await fetch("/api/status", { cache: "no-store" });
        const json = await res.json();
        if (mounted) setData(json);
      } catch (err) {
        console.error("Auto sync failed", err);
      }
    }

    syncAndLoad();
    const interval = setInterval(syncAndLoad, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      forceTick((v) => v + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    if (!data) return [];

    const redditOnly = data.latestEvents.filter(
      (event: CommentEvent) => event.source === "reddit"
    );

    if (activeFilter === "All") return redditOnly;

    return redditOnly.filter(
      (event: CommentEvent) => event.country === activeFilter
    );
  }, [data, activeFilter]);

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Loading live status...
        </div>
      </div>
    );
  }

  const filterTabs: FilterKey[] = ["All", "Bahrain", "Qatar", "UAE", "Dubai", "Saudi"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Live Bahrain signal based on Reddit megathreads.
          </p>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Last Reddit Sync: {formatLastSync(data.lastRedditSyncAt)}
            {data.lastRedditSyncAt ? ` • Updated ${formatUpdatedAgo(data.lastRedditSyncAt)}` : ""}
          </p>

          {syncMessage && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {syncMessage}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <Button onClick={syncNow} disabled={syncing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync now"}
          </Button>

          <Card className="w-full border-zinc-200 bg-white md:w-[320px] dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Bahrain next 30 min risk
                </div>
                <div className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {data.bahrainRisk30}%
                </div>
              </div>
              <Radio className="h-8 w-8 text-zinc-700 dark:text-zinc-200" />
            </CardContent>
          </Card>
        </div>
      </div>

{data.gulfSummary && (
  <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <CardContent className="p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Gulf Summary
            </div>

            <div className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.gulfSummary.headline}
            </div>

            <div className="mt-4 max-w-5xl text-base leading-7 text-zinc-700 dark:text-zinc-200">
              {data.gulfSummary.summary}
            </div>
          </div>

          <div className="shrink-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Last Update
            </div>
            <div className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {formatUpdatedAgo(data.gulfSummary.updatedAt)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${
              data.gulfSummary.regionalPattern === "quiet"
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : data.gulfSummary.regionalPattern === "spreading"
                ? "border-red-500/40 bg-red-500/15 text-red-200"
                : data.gulfSummary.regionalPattern === "localized"
                ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                : "border-zinc-600 bg-zinc-800 text-zinc-200"
            }`}
          >
            Pattern: {data.gulfSummary.regionalPattern}
          </span>

          <span
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${
              data.gulfSummary.bahrainRiskHint === "low"
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : data.gulfSummary.bahrainRiskHint === "high"
                ? "border-red-500/40 bg-red-500/15 text-red-200"
                : "border-amber-500/40 bg-amber-500/15 text-amber-200"
            }`}
          >
            Bahrain hint: {data.gulfSummary.bahrainRiskHint}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
)}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.countries.map((country) => (
          <CountryStatusCard
            key={country.country}
            label={country.country}
            status={country.status}
            confidence={country.confidence}
            totalRecentMentions={country.totalRecentMentions}
            dark={dark}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeFilter === tab ? "default" : "outline"}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredEvents.map((event: CommentEvent) => (
          <LiveEventCard key={event.id} event={event} dark={dark} />
        ))}
      </div>
    </div>
  );
}