"use client";

import { AppShell } from "@/components/app-shell";
import { LiveFeedView } from "@/components/live-feed-view";

export default function LiveFeedPage() {
  return <AppShell>{({ dark }) => <LiveFeedView dark={dark} />}</AppShell>;
}