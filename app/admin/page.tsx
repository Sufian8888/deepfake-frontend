"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/ui/app-sidebar";
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
    <div className="flex min-h-screen">
      <AppSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10 glow-blue">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Admin{" "}
                  <span className="text-primary text-glow-blue">Panel</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  System overview and management dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8">
            <AdminStats />
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="glass border border-border/50 p-1">
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
              <div>
                <RecentActivity />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
