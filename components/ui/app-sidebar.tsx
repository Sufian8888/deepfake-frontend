"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Upload,
  Video,
  FileText,
  Shield,
  Users,
  BarChart3,
  LogOut,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import { Separator } from "./separator";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Different links for admin and regular users
  const userLinks = [
    { href: "/user-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/analysis", label: "Analysis", icon: Video },
    // { href: "/report", label: "Reports", icon: FileText },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Panel", icon: Shield },
    //   { href: "/admin", label: "Users", icon: Users },
    //   { href: "/admin", label: "Videos", icon: BarChart3 },
  ];

  const links = user?.role === "admin" ? adminLinks : userLinks;
  //   const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <div
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col glass border-r border-border/50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        {!isCollapsed && (
          <Link
            href={user?.role === "admin" ? "/admin" : "/user-dashboard"}
            className="flex items-center gap-2"
          >
            <div className="p-2 rounded-lg bg-primary/10 glow-blue">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold">DeepFake</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user?.email || "U")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary glow-blue"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
