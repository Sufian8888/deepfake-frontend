"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type SubscriptionStatusIndicatorProps = {
  plan?: string | null;
  status?: string | null;
  compact?: boolean;
  className?: string;
};

export function SubscriptionStatusIndicator({
  plan = "free",
  status = "inactive",
  compact = false,
  className,
}: SubscriptionStatusIndicatorProps) {
  const planLabel = String(plan || "free").toUpperCase();
  const isActive = status === "active";
  const statusLabel = isActive ? "Active" : status ? String(status) : "Inactive";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            isActive ? "animate-ping bg-green-400" : "bg-muted-foreground/40"
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-muted-foreground/60"
          )}
        />
      </span>
      {compact ? (
        <span className="text-xs text-muted-foreground capitalize">
          {statusLabel} · {planLabel}
        </span>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-xs font-medium capitalize",
              isActive ? "text-green-400" : "text-muted-foreground"
            )}
          >
            {statusLabel}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0",
              plan !== "free"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-muted-foreground/30 text-muted-foreground"
            )}
          >
            {planLabel}
          </Badge>
        </div>
      )}
    </div>
  );
}
