"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Settings,
  User,
  Crown,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/hooks/use-subscription";
import { billingAPI } from "@/lib/api";
import { SubscriptionStatusIndicator } from "./subscription-status-indicator";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserSettingsMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { plan, status, isPremium } = useSubscription();
  const [isManageLoading, setIsManageLoading] = useState(false);

  const planLabel = user?.subscription_plan ?? plan ?? "free";
  const planStatus = user?.subscription_status ?? status ?? "inactive";

  const handleManageSubscription = async () => {
    if (!isPremium) {
      router.push("/plans");
      return;
    }

    setIsManageLoading(true);
    try {
      const data = await billingAPI.createPortalSession();
      if (data?.url) {
        window.location.assign(data.url);
      }
    } finally {
      setIsManageLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-border/60 bg-card/80 hover:bg-primary/5">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 glass border-border/50">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 px-2 py-3">
            <Avatar className="h-11 w-11 border-2 border-primary/40">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user?.full_name || user?.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.full_name || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="px-2 py-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Subscription
          </p>
          <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
            <SubscriptionStatusIndicator plan={planLabel} status={planStatus} />
            <p className="mt-1 text-xs text-muted-foreground capitalize">
              {planLabel} plan · {user?.subscription_cycle ?? "monthly"} billing
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Settings
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleManageSubscription}
          disabled={isManageLoading}
        >
          {isPremium ? (
            <CreditCard className="h-4 w-4" />
          ) : (
            <Crown className="h-4 w-4 text-primary" />
          )}
          {isManageLoading
            ? "Opening..."
            : isPremium
              ? "Manage Subscription"
              : "Upgrade Plan"}
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/plans" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            View All Plans
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
