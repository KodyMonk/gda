"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, List, Map, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  dark: boolean;
  onToggleTheme: () => void;
};

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/latest-attacks", label: "Latest Attacks", icon: List },
  { href: "/map", label: "Map", icon: Map },
  { href: "/live-feed", label: "Live Feed", icon: Activity },
];

export function Navbar({ dark, onToggleTheme }: Props) {
  const pathname = usePathname();

  return (
    <header
      className={
        dark
          ? "sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl"
          : "sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl"
      }
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-500 dark:text-sky-300">
                <Radar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  Gulf Attack Monitor
                </h1>
                <p className={dark ? "text-sm text-zinc-400" : "text-sm text-zinc-600"}>
                  Real-time situational awareness across Gulf pages
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-2 sm:-mx-1 sm:flex sm:snap-x sm:overflow-x-auto sm:px-1 sm:pb-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "default" : "outline"}
                className={
                  active
                    ? "h-10 w-full gap-2 rounded-full px-4 sm:w-auto sm:shrink-0 sm:snap-start"
                    : "h-10 w-full gap-2 rounded-full border-zinc-300/70 bg-white/70 px-4 text-zinc-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900 sm:w-auto sm:shrink-0 sm:snap-start"
                }
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
