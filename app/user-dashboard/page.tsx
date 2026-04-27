"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { UserStats } from "@/components/user-dashboard/user-stats";
import { UserVideos } from "@/components/user-dashboard/user-videos";
import { useAuth } from "@/contexts/auth-context";
import { BarChart3, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 glow-blue">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                      My{" "}
                      <span className="text-primary text-glow-blue">
                        Dashboard
                      </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Welcome back, {user?.full_name}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/upload")}
                  className="glow-blue gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Video
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="mb-8">
              <UserStats />
            </div>

            {/* Videos List */}
            <div>
              <UserVideos />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
