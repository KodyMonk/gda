"use client";

import { useState } from "react";
import { Navbar } from "./navbar";

export function AppShell({
  children,
}: {
  children: (props: { dark: boolean }) => React.ReactNode;
}) {
  const [dark, setDark] = useState(true);

  return (
    <div
      className={
        dark
          ? "dark min-h-screen bg-zinc-950 text-zinc-100"
          : "min-h-screen bg-stone-50 text-zinc-900"
      }
    >
      <div className="relative min-h-screen overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.10),transparent_22%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 to-transparent dark:from-white/[0.03]" />
        <Navbar dark={dark} onToggleTheme={() => setDark((value) => !value)} />
        <main className="relative mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12 lg:pt-6">
          {children({ dark })}
        </main>
      </div>
    </div>
  );
}
