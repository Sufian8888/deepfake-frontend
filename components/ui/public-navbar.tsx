"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "./avatar";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Documentation" },
  { href: "/faq", label: "FAQ" },
  { href: "/plans", label: "Plans" },
  { href: "/contact", label: "Contact" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const dashboardHref = user?.role === "admin" ? "/admin" : "/user-dashboard";
  const showProfile = Boolean(user);
  const showAuthButtons = !user;
  const authReady = !isLoading;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 glow-blue group-hover:glow-purple transition-all duration-300">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              DeepFake Detector
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-primary/10 text-primary glow-blue"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Area */}
          {!authReady ? (
            <div className="hidden md:block h-11 w-32 rounded-2xl bg-muted/30 animate-pulse" />
          ) : showProfile ? (
            <Link
              href={dashboardHref}
              className="hidden md:flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-3 py-2 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
            >
              <Avatar className="h-11 w-11 border-2 border-primary/40">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(user?.full_name || user?.email || "Client")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="max-w-40 truncate text-sm font-semibold leading-5">
                  {user?.full_name || "Client"}
                </p>
                <p className="max-w-40 truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </Link>
          ) : null}

          {authReady && showAuthButtons ? (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="glow-blue" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          ) : null}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <div className="px-4 py-4 space-y-2">
            {authReady && showProfile ? (
              <Link
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="mb-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm"
              >
                <Avatar className="h-12 w-12 border-2 border-primary/40">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(user?.full_name || user?.email || "Client")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-5">
                    {user?.full_name || "Client"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </Link>
            ) : null}

            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}

            {authReady && showAuthButtons ? (
              <div className="pt-4 space-y-2 border-t border-border/50 mt-4">
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="w-full glow-blue" asChild>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
