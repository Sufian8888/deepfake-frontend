"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { UserStats } from "@/components/user-dashboard/user-stats";
import { UserVideos } from "@/components/user-dashboard/user-videos";
import { useAuth } from "@/contexts/auth-context";
import { billingAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Crown, Sparkles, Upload, Settings2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { syncSubscriptionInfo } from "@/lib/subscription";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isManageLoading, setIsManageLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "warning"; message: string } | null>(null);
  const { plan, status, cycle, isPremium } = useSubscription();

  const planLabel = user?.subscription_plan ?? plan ?? "free";
  const planStatus = user?.subscription_status ?? status ?? "inactive";
  const planCycle = user?.subscription_cycle ?? cycle ?? "monthly";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("session_id");
    const upgrade = searchParams.get("upgrade");
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "1" && sessionId) {
      const confirmPayment = async () => {
        try {
          const data = await billingAPI.confirmCheckoutSession(sessionId);
          syncSubscriptionInfo({
            plan: data.subscription_plan ?? "free",
            status: data.subscription_status ?? "inactive",
            cycle: data.subscription_cycle ?? "monthly",
            isPremium: Boolean(data.is_premium),
          });
          setStatusBanner({
            type: "success",
            message: `Upgrade successful. Your account is now ${String(data.subscription_plan).toUpperCase()}.`,
          });
          router.replace("/user-dashboard");
        } catch (error) {
          setStatusBanner({
            type: "warning",
            message:
              error instanceof Error
                ? error.message
                : "Payment completed, but the account update is still syncing. Refresh in a few seconds.",
          });
        }
      };

      confirmPayment();
    } else if (upgrade === "success") {
      setStatusBanner({ type: "success", message: "Plan updated successfully." });
      router.replace("/user-dashboard");
    } else if (canceled === "1") {
      setStatusBanner({ type: "warning", message: "Checkout was canceled. Your current plan remains unchanged." });
      router.replace("/user-dashboard");
    }
  }, [router]);

  const handleManageSubscription = async () => {
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
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="flex-1 ml-[var(--app-sidebar-width,16rem)] p-8">
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

            {/* Plan Overview */}
            <div className="mb-8">
              {statusBanner ? (
                <div
                  className={
                    statusBanner.type === "success"
                      ? "mb-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                      : "mb-4 flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300"
                  }
                >
                  {statusBanner.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {statusBanner.message}
                </div>
              ) : null}
              <Card className="glass border-border/50 overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Crown className="h-5 w-5 text-primary" />
                      Subscription Status
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your account usage is based on the active plan attached to this user.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isPremium
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                    }
                  >
                    {planLabel.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Plan
                    </div>
                    <div className="mt-2 text-2xl font-bold capitalize">{planLabel}</div>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="text-sm text-muted-foreground">Billing cycle</div>
                    <div className="mt-2 text-2xl font-bold capitalize">{planCycle}</div>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="text-sm text-muted-foreground">Account status</div>
                    <div className="mt-2 text-2xl font-bold capitalize">{planStatus}</div>
                  </div>
                </CardContent>
                <div className="px-6 pb-6 flex items-center justify-end">
                  {isPremium ? (
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={isManageLoading}
                      className="gap-2"
                    >
                      <Settings2 className="h-4 w-4" />
                      {isManageLoading ? "Opening..." : "Manage Subscription"}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => router.push("/plans")} className="gap-2 cursor-pointer">
                      <Crown className="h-4 w-4" />
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </Card>
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
