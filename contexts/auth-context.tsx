"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authAPI, billingAPI } from "@/lib/api";
import { syncSubscriptionInfo, invalidateSubscriptionCache } from "@/lib/subscription";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
  subscription_plan?: "free" | "pro" | "enterprise";
  subscription_status?: string;
  subscription_cycle?: string;
  is_premium?: boolean;
}

function normalizeUser(user: any): User {
  return {
    id: user?.id,
    email: user?.email,
    full_name: user?.full_name ?? user?.username ?? user?.email ?? "",
    role: user?.role ?? "user",
    created_at: user?.created_at ?? "",
    subscription_plan: user?.subscription_plan,
    subscription_status: user?.subscription_status,
    subscription_cycle: user?.subscription_cycle,
    is_premium: user?.is_premium,
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const clearAuthStorage = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const hydrateSubscriptionState = async (user: Partial<User>) => {
    if (user.subscription_plan) {
      syncSubscriptionInfo({
        plan: user.subscription_plan,
        status: user.subscription_status ?? "inactive",
        cycle: user.subscription_cycle ?? "monthly",
        isPremium: Boolean(user.is_premium),
      });
      return;
    }

    invalidateSubscriptionCache();

    if (user.role === "admin") {
      return;
    }

    try {
      const billingInfo = await billingAPI.getMe();
      syncSubscriptionInfo({
        plan: billingInfo.subscription_plan ?? "free",
        status: billingInfo.subscription_status ?? "inactive",
        cycle: billingInfo.subscription_cycle ?? "monthly",
        isPremium: Boolean(billingInfo.is_premium),
      });
    } catch {
      // Keep cache invalidated so the next subscription read retries the API.
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const cachedUser = authAPI.getCurrentUser();
        if (cachedUser) {
          setUser(normalizeUser(cachedUser));
          setIsLoading(false);
        }

        const tokenPresent = typeof window !== "undefined" && localStorage.getItem("token");
        if (tokenPresent) {
          const serverUser = await authAPI.getMe();
          const normalized = normalizeUser(serverUser);
          setUser(normalized);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(normalized));
          }
          // Sync subscription into shared store so UI updates immediately
          if (normalized.subscription_plan) {
            syncSubscriptionInfo({
              plan: normalized.subscription_plan,
              status: normalized.subscription_status ?? 'inactive',
              cycle: normalized.subscription_cycle ?? 'monthly',
              isPremium: Boolean(normalized.is_premium),
            })
          }
          return;
        }
        if (!cachedUser) {
          setUser(null);
        }
      } catch (error) {
        clearAuthStorage();
        setUser(null);

        if (!(error instanceof Error) || error.message !== "Could not validate credentials") {
          console.error("Failed to load user:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const normalized = normalizeUser(response.user);
      setUser(normalized);
      await hydrateSubscriptionState(response.user);
      // Check if there's a redirect URL in sessionStorage or query parameter
      let redirectUrl = "/user-dashboard";
      if (typeof window !== "undefined") {
        const storedRedirect = sessionStorage.getItem("redirectAfterLogin");
        if (storedRedirect && storedRedirect !== "/login") {
          redirectUrl = storedRedirect;
          sessionStorage.removeItem("redirectAfterLogin");
        } else if (response.user.role === "admin") {
          redirectUrl = "/admin";
        }
      } else if (response.user.role === "admin") {
        redirectUrl = "/admin";
      }
      
      router.push(redirectUrl);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Login failed";
      throw new Error(message);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authAPI.signup(email, password, fullName);
      const normalized = normalizeUser(response.user);
      setUser(normalized);
      await hydrateSubscriptionState(response.user);

      let redirectUrl = "/user-dashboard";
      if (typeof window !== "undefined") {
        const storedRedirect = sessionStorage.getItem("redirectAfterLogin");
        if (storedRedirect && storedRedirect !== "/login") {
          redirectUrl = storedRedirect;
          sessionStorage.removeItem("redirectAfterLogin");
        } else if (response.user.role === "admin") {
          redirectUrl = "/admin";
        }
      } else if (response.user.role === "admin") {
        redirectUrl = "/admin";
      }

      router.push(redirectUrl);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Signup failed";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      invalidateSubscriptionCache();
      router.push("/login");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
