import { Badge } from "@/components/ui/badge";
import { CommentEvent } from "@/lib/types";
import { Clock3 } from "lucide-react";

function sourceBadge(source: string) {
  if (source === "reddit") {
    return (
      <Badge className="border-none bg-orange-500 text-white hover:bg-orange-600">
        Reddit
      </Badge>
    );
  }

  if (source === "x") {
    return (
      <Badge className="border-none bg-black text-white hover:bg-zinc-800">
        X
      </Badge>
    );
  }

  if (source === "official") {
    return (
      <Badge className="border-none bg-blue-600 text-white hover:bg-blue-700">
        Official
      </Badge>
    );
  }

  return <Badge variant="secondary">{source}</Badge>;
}

function formatAbsoluteTime(dateString?: string, minutesAgo?: number) {
  if (dateString) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  if (typeof minutesAgo === "number") {
    const timestamp = Date.now() - minutesAgo * 60 * 1000;
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return "";
}

function formatRelativeTime(dateString?: string, minutesAgo?: number) {
  if (dateString) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));

    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  }

  if (typeof minutesAgo === "number") {
    if (minutesAgo < 60) return `${minutesAgo}m ago`;

    const hours = Math.floor(minutesAgo / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return "";
}

export function LiveEventCard({
  event,
  dark,
}: {
  event: CommentEvent;
  dark: boolean;
}) {
  const absoluteTime = formatAbsoluteTime(event.createdAt, event.minutesAgo);
  const relativeTime = formatRelativeTime(event.createdAt, event.minutesAgo);

  return (
    <div
      className={
        dark
          ? "rounded-[24px] border border-zinc-800/80 bg-zinc-950/75 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]"
          : "rounded-[24px] border border-zinc-200/80 bg-white/85 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.25)]"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{event.country}</Badge>

        {sourceBadge(event.source)}

        {event.threadLabel && (
          <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
            {event.threadLabel}
          </Badge>
        )}

        {event.xAccountLabel && (
          <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
            {event.xAccountLabel}
          </Badge>
        )}

        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {event.author}
        </span>

        <span
          className={
            dark
              ? "flex items-center gap-1 text-xs text-zinc-400"
              : "flex items-center gap-1 text-xs text-zinc-500"
          }
        >
          <Clock3 className="h-3.5 w-3.5" />
          {absoluteTime}
          {relativeTime ? ` • ${relativeTime}` : ""}
        </span>
      </div>

      <p
        className={
          dark
            ? "mt-3 text-sm leading-6 text-zinc-200"
            : "mt-3 text-sm leading-6 text-zinc-800"
        }
      >
        {event.text}
      </p>
    </div>
  );
}
