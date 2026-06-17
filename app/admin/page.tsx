"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { AdminStats } from "@/components/admin/admin-stats";
import { UsersTable } from "@/components/admin/users-table";
import { VideosTable } from "@/components/admin/videos-table";
import { RecentActivity } from "@/components/admin/recent-activity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Video, Activity, Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "admin") {
        router.push("/upload");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 sm:p-3 glow-blue shrink-0">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Admin <span className="text-primary text-glow-blue">Panel</span>
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                System overview and management dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <AdminStats />
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass h-auto w-full flex-wrap justify-start gap-1 border border-border/50 p-1">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UsersTable />
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <VideosTable />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
