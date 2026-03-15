import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { CountryStatus } from "@/lib/types";

function countryFlag(label: string) {
  const flags: Record<string, string> = {
    Bahrain: "🇧🇭",
    Qatar: "🇶🇦",
    UAE: "🇦🇪",
    Dubai: "🇦🇪",
    Saudi: "🇸🇦",
    Kuwait: "🇰🇼",
    Oman: "🇴🇲",
  };

  return flags[label];
}

function StatusIcon({ status }: { status: CountryStatus["status"] }) {
  if (status === "Being attacked") return <ShieldAlert className="h-4 w-4" />;
  if (status === "Suspicious") return <AlertTriangle className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />;
}

function statusTone(status: CountryStatus["status"], dark: boolean) {
  if (status === "Being attacked") return dark ? "bg-red-500/20 text-red-200 border-red-400/40" : "bg-red-100 text-red-800 border-red-200";
  if (status === "Suspicious") return dark ? "bg-amber-500/20 text-amber-200 border-amber-400/40" : "bg-amber-100 text-amber-800 border-amber-200";
  return dark ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40" : "bg-emerald-100 text-emerald-800 border-emerald-200";
}

export function CountryStatusCard({
  label,
  status,
  confidence,
  totalRecentMentions,
  dark,
}: {
  label: string;
  status: CountryStatus["status"];
  confidence: string;
  totalRecentMentions: number;
  dark: boolean;
}) {
  const flag = countryFlag(label);

  return (
    <Card
      className={
        dark
          ? "border-zinc-800/80 bg-zinc-950/75 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]"
          : "border-zinc-200/80 bg-white/85 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.25)]"
      }
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-base">
          <span className="flex items-center gap-2">
            {flag ? (
              <span aria-hidden="true" className="text-lg leading-none">
                {flag}
              </span>
            ) : null}
            <span>{label}</span>
          </span>
          <Badge variant="outline" className={`gap-1 ${statusTone(status, dark)}`}>
            <StatusIcon status={status} />
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={
          dark
            ? "space-y-3 text-sm text-zinc-300"
            : "space-y-3 text-sm text-zinc-700"
        }
      >
        <div className="flex items-center justify-between rounded-2xl bg-zinc-100/70 px-3 py-2 dark:bg-white/5">
          <span>Recent mentions</span>
          <span className="font-medium">{totalRecentMentions}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-zinc-100/70 px-3 py-2 dark:bg-white/5">
          <span>Confidence</span>
          <span className="font-medium">{confidence}</span>
        </div>
      </CardContent>
    </Card>
  );
}
