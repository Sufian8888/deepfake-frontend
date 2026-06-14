import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicNavbar } from "@/components/ui/public-navbar";
import { PricingPlans } from "@/components/plans/pricing-plans";

export const metadata: Metadata = {
  title: "Plans | DeepFake Detection System",
  description:
    "Choose a Free, Pro, or Enterprise plan and subscribe securely with Stripe Checkout.",
};

export default function PlansPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <Suspense fallback={null}>
        <PricingPlans />
      </Suspense>
    </div>
  );
}