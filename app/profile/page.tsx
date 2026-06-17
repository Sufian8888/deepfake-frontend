"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/contexts/auth-context";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubscriptionStatusIndicator } from "@/components/user-dashboard/subscription-status-indicator";
import { useSubscription } from "@/hooks/use-subscription";
import { User, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { plan, status, cycle } = useSubscription();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const isAdmin = user?.role === "admin";
  const planLabel = user?.subscription_plan ?? plan ?? "free";
  const planStatus = user?.subscription_status ?? status ?? "inactive";
  const planCycle = user?.subscription_cycle ?? cycle ?? "monthly";

  const handleProfileSave = async () => {
    if (!fullName.trim()) {
      toast({ title: "Name cannot be empty.", variant: "destructive" });
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedUser = await authAPI.updateProfile(fullName.trim());
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("user");
        const parsed = cached ? JSON.parse(cached) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            full_name: updatedUser.username ?? fullName.trim(),
            username: updatedUser.username ?? fullName.trim(),
          })
        );
      }
      toast({ title: "Profile updated successfully." });
      window.location.reload();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setIsSavingPassword(true);
    try {
      await authAPI.updatePassword(currentPassword, newPassword);
      toast({ title: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 sm:mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 sm:p-3 glow-blue shrink-0">
              <User className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Profile <span className="text-primary text-glow-blue">Settings</span>
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                {isAdmin
                  ? "Manage your account and security"
                  : "Manage your account, subscription and security"}
              </p>
            </div>
          </div>

          <Card className="glass border-border/50 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-14 w-14 border-2 border-primary/50 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {getInitials(user?.full_name || user?.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg sm:text-xl">
                      {user?.full_name || "User"}
                    </CardTitle>
                    <CardDescription className="truncate">{user?.email}</CardDescription>
                  </div>
                </div>
                {!isAdmin ? (
                  <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
                    <SubscriptionStatusIndicator plan={planLabel} status={planStatus} />
                    <p className="mt-1.5 text-xs text-muted-foreground capitalize">
                      {planLabel} plan · {planCycle} billing
                    </p>
                  </div>
                ) : null}
              </div>
              {user?.created_at ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
              ) : null}
            </CardHeader>

            <CardContent className="space-y-8 p-4 sm:p-6">
              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Update your display name shown across the app
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Display Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your name"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted/30"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">Security</h2>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <PasswordInput
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <PasswordInput
                        id="newPassword"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <PasswordInput
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                Your account is protected with secure authentication and encrypted passwords.
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingPassword || !currentPassword}
                  onClick={handlePasswordSave}
                  className="w-full sm:w-auto"
                >
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={handleProfileSave}
                  className="w-full sm:w-auto glow-blue"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
