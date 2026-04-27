"use client";

import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Video,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityItem {
  id: number;
  type: "upload" | "analysis" | "result";
  filename: string;
  user_name: string;
  timestamp: string;
  status?: string;
  is_deepfake?: boolean;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await dashboardAPI.getRecentActivity();
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const getActivityIcon = (type: string, isDeepfake?: boolean) => {
    switch (type) {
      case "upload":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "analysis":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "result":
        return isDeepfake ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        );
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case "upload":
        return `uploaded ${activity.filename}`;
      case "analysis":
        return `started analysis on ${activity.filename}`;
      case "result":
        return `${activity.filename} detected as ${
          activity.is_deepfake ? "deepfake" : "genuine"
        }`;
      default:
        return activity.filename;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 h-150 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-150 pr-4">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="mt-0.5 p-2 rounded-full bg-muted/50">
                      {getActivityIcon(activity.type, activity.is_deepfake)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user_name}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {getActivityDescription(activity)}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                        {activity.status && (
                          <Badge
                            variant="outline"
                            className="text-xs h-5 bg-primary/10 text-primary border-primary/50"
                          >
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
