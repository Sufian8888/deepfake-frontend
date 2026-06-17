"use client";

import { useState, type ReactNode } from "react";
import { Menu, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/ui/app-sidebar";

type AppShellProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  fullHeight?: boolean;
};

export function AppShell({
  children,
  className,
  mainClassName,
  fullHeight = false,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex min-h-screen min-w-0 bg-background",
        fullHeight && "h-screen overflow-hidden",
        className
      )}
    >
      <div className="hidden shrink-0 lg:block">
        <AppSidebar variant="desktop" />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 max-w-[85vw] border-border/50 bg-background p-0 [&>button]:hidden"
        >
          <AppSidebar variant="drawer" onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[var(--app-sidebar-width,16rem)]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/90 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate font-semibold">DeepFake</span>
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 p-4 sm:p-6 lg:p-8",
            fullHeight && "overflow-auto",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
