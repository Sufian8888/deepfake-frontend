"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { FAQChatWidget } from "./FAQChatWidget";
import { AnalysisChatWidget } from "./AnalysisChatWidget";

export function ChatbotManager() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

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

  // Show Analysis Assistant if authenticated and on a protected path
  if (isAuthenticated && isProtectedPath) {
    return <AnalysisChatWidget />;
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
