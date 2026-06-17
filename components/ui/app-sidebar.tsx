"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Upload,
  Video,
  Shield,
  LogOut,
  Brain,
  ChevronLeft,
  ChevronRight,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionStatusIndicator } from "@/components/user-dashboard/subscription-status-indicator";

type AppSidebarProps = {
  variant?: "desktop" | "drawer";
  onNavigate?: () => void;
};

export function AppSidebar({ variant = "desktop", onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { plan, status } = useSubscription();
  const planLabel = user?.subscription_plan ?? plan ?? "free";
  const planStatus = user?.subscription_status ?? status ?? "inactive";
  const isDrawer = variant === "drawer";
  const showLabels = isDrawer || !isCollapsed;

  useEffect(() => {
    if (typeof document === "undefined" || isDrawer) return;

    const updateSidebarWidth = () => {
      const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
      if (!isLargeScreen) {
        document.documentElement.style.setProperty("--app-sidebar-width", "0px");
        return;
      }

      document.documentElement.style.setProperty(
        "--app-sidebar-width",
        isCollapsed ? "5rem" : "16rem"
      );
    };

    updateSidebarWidth();
    window.addEventListener("resize", updateSidebarWidth);
    return () => window.removeEventListener("resize", updateSidebarWidth);
  }, [isCollapsed, isDrawer]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
  };

  const userLinks = [
    { href: "/user-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/analysis", label: "Analysis", icon: Video },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [{ href: "/admin", label: "Admin Panel", icon: Shield }];
  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <div
      className={cn(
        "flex h-full flex-col border-border/50 glass",
        isDrawer
          ? "h-full w-full border-r-0"
          : "fixed left-0 top-0 bottom-0 z-40 border-r transition-all duration-300",
        !isDrawer && (isCollapsed ? "w-20" : "w-64")
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
        {showLabels ? (
          <Link
            href={user?.role === "admin" ? "/admin" : "/user-dashboard"}
            className="flex min-w-0 items-center gap-2"
            onClick={onNavigate}
          >
            <div className="rounded-lg bg-primary/10 p-2 glow-blue">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="truncate font-bold">DeepFake</span>
          </Link>
        ) : (
          <Link
            href={user?.role === "admin" ? "/admin" : "/user-dashboard"}
            className="mx-auto"
            onClick={onNavigate}
          >
            <div className="rounded-lg bg-primary/10 p-2 glow-blue">
              <Brain className="h-5 w-5 text-primary" />
            </div>
          </Link>
        )}

        {isDrawer ? (
          <Button variant="ghost" size="icon" onClick={onNavigate} className="h-8 w-8 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 shrink-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/50">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {getInitials(user?.full_name || user?.email || "U")}
            </AvatarFallback>
          </Avatar>
          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.full_name || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <div className="mt-2">
                <SubscriptionStatusIndicator plan={planLabel} status={planStatus} compact />
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className={cn("space-y-2", !showLabels && "space-y-3")}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  !showLabels && "justify-center px-0 py-3 min-h-12",
                  isActive
                    ? "bg-primary/10 text-primary glow-blue"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                title={!showLabels ? link.label : undefined}
              >
                <Icon className={cn("h-5 w-5", !showLabels && "h-6 w-6")} />
                {showLabels && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="cursor-pointer border-t border-border/50 p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
            !showLabels && "justify-center px-0"
          )}
        >
          <LogOut className={cn("h-5 w-5", !showLabels && "h-6 w-6")} />
          {showLabels && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
