"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Video,
  Shield,
  Activity,
  TrendingUp,
  Database,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  total_users: number;
  total_videos: number;
  total_predictions: number;
  deepfake_detected: number;
  genuine_detected: number;
  pending_analyses: number;
  storage_used_mb?: number;
  active_users_24h?: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getSystemStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      description: `${stats.active_users_24h || 0} active in 24h`,
      color: "text-blue-500",
    },
    {
      title: "Total Videos",
      value: stats.total_videos,
      icon: Video,
      description: "Uploaded videos",
      color: "text-purple-500",
    },
    {
      title: "Total Analyses",
      value: stats.total_predictions,
      icon: Activity,
      description: "Completed predictions",
      color: "text-green-500",
    },
    {
      title: "Deepfakes Detected",
      value: stats.deepfake_detected,
      icon: Shield,
      description: `${stats.genuine_detected} genuine`,
      color: "text-red-500",
    },
    {
      title: "Pending Analyses",
      value: stats.pending_analyses,
      icon: TrendingUp,
      description: "In queue",
      color: "text-yellow-500",
    },
    {
      title: "Storage Used",
      value: stats.storage_used_mb
        ? `${(stats.storage_used_mb / 1024).toFixed(1)}GB`
        : "0 GB",
      icon: Database,
      description: "Total storage",
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="glass border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
