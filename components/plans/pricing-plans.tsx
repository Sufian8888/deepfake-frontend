"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { billingAPI } from "@/lib/api";
import { getSubscription, syncSubscriptionInfo } from "@/lib/subscription";

type BillingCycle = "monthly" | "yearly";
type PlanKey = "free" | "pro" | "enterprise";

type Feature = {
  label: string;
  includedIn: PlanKey[];
};

const features: Feature[] = [
  { label: "Basic deepfake detection", includedIn: ["free", "pro", "enterprise"] },
  { label: "Basic report summary", includedIn: ["free", "pro", "enterprise"] },
  { label: "Detailed explanation report", includedIn: ["pro", "enterprise"] },
  { label: "Download report", includedIn: ["pro", "enterprise"] },
  { label: "Video upload history", includedIn: ["pro", "enterprise"] },
  { label: "Priority processing", includedIn: ["enterprise"] },
  { label: "Custom team onboarding", includedIn: ["enterprise"] },
];

const planMeta: Record<PlanKey, {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  highlight?: boolean;
}> = {
  free: {
    name: "Free",
    description: "Try the core detection flow with a basic report summary.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start free",
  },
  pro: {
    name: "Pro",
    description: "Best for creators and researchers who need detailed, downloadable reports.",
    monthlyPrice: 19,
    yearlyPrice: 190,
    cta: "Subscribe now",
    highlight: true,
  },
  enterprise: {
    name: "Enterprise",
    description: "For teams that need priority support, report downloads, and custom onboarding.",
    monthlyPrice: 99,
    yearlyPrice: 990,
    cta: "Subscribe now",
  },
};

function formatSavings() {
  return Math.round((planMeta.pro.monthlyPrice * 12 - planMeta.pro.yearlyPrice) / 12);
}

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const confirmedSessionRef = useRef<string | null>(null);

  const yearlySavings = useMemo(() => formatSavings(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadBillingState = async () => {
      if (typeof window === "undefined") {
        return;
      }

      if (!localStorage.getItem("token")) {
        return;
      }

      try {
        const plan = await getSubscription();
        setCurrentPlan(plan ? `${plan.toUpperCase()}` : null);
      } catch {
        setCurrentPlan(null);
      }
    };

    loadBillingState();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (
      !sessionId ||
      sessionId === confirmedSessionRef.current ||
      typeof window === "undefined" ||
      !localStorage.getItem("token")
    ) {
      return;
    }

    const confirmCheckout = async () => {
      confirmedSessionRef.current = sessionId;
      try {
        const data = await billingAPI.confirmCheckoutSession(sessionId);
        syncSubscriptionInfo({
          plan: data.subscription_plan ?? "free",
          status: data.subscription_status ?? "inactive",
          cycle: data.subscription_cycle ?? "monthly",
          isPremium: Boolean(data.is_premium),
        });
        setCurrentPlan(data.subscription_plan ? `${data.subscription_plan} (${data.subscription_status})` : null);
        setErrorMessage(null);
        router.replace("/user-dashboard?upgrade=success");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Payment was received, but the account could not be updated yet. Please refresh after a few seconds.",
        );
      }
    };

    confirmCheckout();
  }, [router, searchParams]);

  const handleCheckout = async (plan: Exclude<PlanKey, "free">) => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login?redirect=/plans");
      return;
    }

    setLoadingPlan(plan);
    setErrorMessage(null);

    try {
      const data = await billingAPI.createCheckoutSession(plan, billingCycle);

      if (!data.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(data.url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.7_0.18_230/0.18),transparent_30%),radial-gradient(circle_at_bottom_right,oklch(0.65_0.2_290/0.18),transparent_28%)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 px-3 py-1 text-primary">
            Flexible plans
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Pick a plan that fits your workflow
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Clear pricing, secure Stripe Checkout, and a simple upgrade path when your usage grows.
          </p>
          {currentPlan ? (
            <div className="mt-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              Current account plan: {currentPlan}
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:gap-4">
          <Label htmlFor="billing-cycle" className="text-sm font-medium text-muted-foreground">
            Monthly
          </Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label htmlFor="billing-cycle" className="text-sm font-medium text-muted-foreground">
            Yearly
          </Label>
          <Badge variant="secondary" className="ml-2">
            Save {yearlySavings} / mo on Pro
          </Badge>
        </div>

        {errorMessage ? (
          <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {Object.entries(planMeta).map(([key, plan]) => {
            const planKey = key as PlanKey;
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isFree = planKey === "free";
            const isLoading = loadingPlan === planKey;

            return (
              <Card
                key={planKey}
                className={cn(
                  "relative overflow-hidden border-border/60 bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  plan.highlight && "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]",
                )}
              >
                {plan.highlight ? (
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                ) : null}

                <CardHeader className={cn(plan.highlight && "pb-3") }>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-12 text-sm leading-6">{plan.description}</CardDescription>
                  <div className="pt-2">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">
                        {price === 0 ? "Free" : `$${price}`}
                      </span>
                      {price > 0 ? (
                        <span className="pb-1 text-sm text-muted-foreground">
                          {billingCycle === "yearly" ? "/year" : "/month"}
                        </span>
                      ) : null}
                    </div>
                    {plan.highlight && billingCycle === "yearly" ? (
                      <p className="mt-1 text-sm text-primary">Annual billing reduces the monthly cost.</p>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {features.map((feature) => {
                      const included = feature.includedIn.includes(planKey);

                      return (
                        <div key={feature.label} className="flex items-start gap-3 text-sm">
                          <span
                            className={cn(
                              "mt-0.5 inline-flex size-5 items-center justify-center rounded-full border",
                              included
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border bg-muted/30 text-muted-foreground",
                            )}
                          >
                            {included ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                          </span>
                          <span
                            className={cn(
                              included ? "text-foreground" : "text-muted-foreground line-through opacity-70",
                            )}
                          >
                            {feature.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 cursor-pointer">
                    {isFree ? (
                      <Button className="w-full" asChild>
                        <Link href="/signup">
                          Start free
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className={cn("w-full cursor-pointer", plan.highlight && "glow-blue")}
                        onClick={() => handleCheckout(planKey as Exclude<PlanKey, "free">)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Stripe Checkout handles the payment flow securely and returns the user to this app after success.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-1 text-primary hover:underline">
              Talk to sales
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}