import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Radar, Route, Shield } from "lucide-react";

export function MapView({ dark }: { dark: boolean }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-zinc-200/80 bg-white/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/75 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
              <Map className="h-3.5 w-3.5" />
              Map view
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Geographic situational layer for Gulf events
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              This page is prepared for a live map integration with event markers, alert corridors, and country-level overlays.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/75">
              <Radar className="h-4 w-4 text-sky-500 dark:text-sky-300" />
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Layer
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Threat markers
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/75">
              <Route className="h-4 w-4 text-amber-500 dark:text-amber-300" />
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Layer
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Flight paths
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/75">
              <Shield className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Layer
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Safety zones
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card
        className={
          dark
            ? "border-zinc-800/80 bg-zinc-950/75 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]"
            : "border-zinc-200/80 bg-white/80 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.25)]"
        }
      >
        <CardHeader className="pb-0">
          <CardTitle className="text-xl sm:text-2xl">Map canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={
              dark
                ? "mt-2 flex min-h-[340px] items-center justify-center rounded-[28px] border border-dashed border-zinc-700 bg-[linear-gradient(135deg,rgba(14,165,233,0.10),rgba(9,9,11,0.7)),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px] p-6 text-zinc-400 sm:min-h-[460px]"
                : "mt-2 flex min-h-[340px] items-center justify-center rounded-[28px] border border-dashed border-zinc-300 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0.86)),linear-gradient(rgba(24,24,27,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px] p-6 text-zinc-500 sm:min-h-[460px]"
            }
          >
            <div className="max-w-md text-center">
              <Map className="mx-auto mb-4 h-10 w-10" />
              <p className="text-lg font-medium">Interactive map placeholder</p>
              <p className="mt-2 text-sm leading-6">
                Next step: plug in Leaflet or Google Maps and project live event markers, radar zones, and country summaries into this canvas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
