"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { UserStats } from "@/components/user-dashboard/user-stats";
import { UserVideos } from "@/components/user-dashboard/user-videos";
import { UserSettingsMenu } from "@/components/user-dashboard/user-settings-menu";
import { useAuth } from "@/contexts/auth-context";
import { billingAPI } from "@/lib/api";
import { BarChart3, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { syncSubscriptionInfo } from "@/lib/subscription";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "warning"; message: string } | null>(null);

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

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 sm:p-3 glow-blue shrink-0">
                  <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    My <span className="text-primary text-glow-blue">Dashboard</span>
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground truncate">
                    Welcome back, {user?.full_name}
                  </p>
                </div>
              </div>
              <div className="self-start sm:self-auto">
                <UserSettingsMenu />
              </div>
            </div>

            {statusBanner ? (
              <div
                className={
                  statusBanner.type === "success"
                    ? "mt-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                    : "mt-4 flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300"
                }
              >
                {statusBanner.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                {statusBanner.message}
              </div>
            ) : null}
          </div>

          <div className="mb-6 sm:mb-8">
            <UserStats />
          </div>

          <UserVideos />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
