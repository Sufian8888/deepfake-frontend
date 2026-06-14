"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
}

function normalizeUser(user: any): User {
  return {
    id: user?.id,
    email: user?.email,
    full_name: user?.full_name ?? user?.username ?? user?.email ?? "",
    role: user?.role ?? "user",
    created_at: user?.created_at ?? "",
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

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const tokenPresent = typeof window !== "undefined" && localStorage.getItem("token");
        if (tokenPresent) {
          const serverUser = await authAPI.getMe();
          const normalized = normalizeUser(serverUser);
          setUser(normalized);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(normalized));
          }
          return;
        }

        const currentUser = authAPI.getCurrentUser();
        setUser(currentUser ? normalizeUser(currentUser) : null);
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
      setUser(normalizeUser(response.user));
      
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
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      await authAPI.signup(email, password, fullName);
      // After signup, automatically login
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Signup failed");
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
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
