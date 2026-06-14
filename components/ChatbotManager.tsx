"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { FAQChatWidget } from "./FAQChatWidget";
import { AnalysisChatWidget } from "./AnalysisChatWidget";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

export function ChatbotManager() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { isLoading: planLoading, isProOrAbove } = useSubscription();

  // If loading authentication state, do not render any chatbot yet
  if (isLoading) return null;

  // Do not show any chatbot on admin dashboard pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Protected route prefixes
  const protectedPrefixes = ["/user-dashboard", "/upload", "/analysis", "/report"];
  
  // Check if current route starts with any of the protected prefixes
  const isProtectedPath = protectedPrefixes.some((prefix) => 
    pathname.startsWith(prefix)
  );

  // Show Analysis Assistant if authenticated, on protected path and on Pro+
  if (isAuthenticated && isProtectedPath) {
    if (planLoading) return null
    if (isProOrAbove) {
      return <AnalysisChatWidget />
    }

    // Authenticated but not Pro+: show upgrade CTA
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => router.push('/plans')} className="glow-blue">
          Upgrade to Pro to unlock Analysis Assistant
        </Button>
      </div>
    )
  }

  // Show FAQ Assistant if not authenticated and on a public/guest path
  if (!isAuthenticated && !isProtectedPath) {
    return <FAQChatWidget />;
  }

  // Fallback: If authenticated but visiting the public landing pages
  if (!isProtectedPath) {
    return <FAQChatWidget />;
  }

  return null;
}
