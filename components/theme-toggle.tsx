"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

type Props = {
  dark: boolean;
  onToggle: () => void;
};

export function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label="Toggle theme"
      className="h-10 w-10 rounded-full border-zinc-300/70 bg-white/70 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/70"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
