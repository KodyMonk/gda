"use client";

import { AppShell } from "@/components/app-shell";
import { LatestAttacksView } from "@/components/latest-attacks-view";

export default function LatestAttacksPage() {
  return <AppShell>{({ dark }) => <LatestAttacksView dark={dark} />}</AppShell>;
}