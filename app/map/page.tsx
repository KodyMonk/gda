"use client";

import { AppShell } from "@/components/app-shell";
import { MapView } from "@/components/map-view";

export default function MapPage() {
  return <AppShell>{({ dark }) => <MapView dark={dark} />}</AppShell>;
}