"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Brain,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [fullName, setFullName] = useState("");
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.sendOTP(email);
      setOtp("");
      setOtpError("");
      setShowOtpModal(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifying(true);

    try {
      await authAPI.verifyOTP(email, otp);

      setIsVerifying(false);
      setIsCreatingAccount(true);

      await signup(email, password, fullName);
      setShowOtpModal(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.";
      setOtpError(message);
    } finally {
      setIsVerifying(false);
      setIsCreatingAccount(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setIsResending(true);

    try {
      await authAPI.sendOTP(email);
      setOtp("");
      setOtpError("");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to resend verification code.";
      setOtpError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 p-2 hover:bg-muted rounded-lg transition-colors"
        title="Go back"
      >
        <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      </button>

      <div className="absolute inset-0 from-background via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(198,119,198,0.15),transparent)]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="p-3 rounded-xl bg-secondary/10 glow-purple group-hover:glow-blue transition-all duration-300">
              <Brain className="h-8 w-8 text-secondary" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            Create{" "}
            <span className="text-secondary text-glow-purple">Account</span>
          </h1>
          <p className="text-muted-foreground">
            Verify your email to start detecting deepfakes
          </p>
        </div>

        <div className="glass border border-border/50 rounded-2xl p-8 shadow-2xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground glow-purple h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending verification code...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full cursor-pointer border-border/50 hover:bg-secondary/5 hover:border-secondary/50 h-11"
            >
              Sign In Instead
            </Button>
          </Link>
        </div>
      </div>

      <Dialog
        open={showOtpModal}
        onOpenChange={(open) => {
          if (!isVerifying && !isCreatingAccount) {
            setShowOtpModal(open);
          }
        }}
      >
        <DialogContent
          showCloseButton={!isVerifying && !isCreatingAccount}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below
              to complete your registration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {otpError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{otpError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isVerifying || isCreatingAccount}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={isVerifying || isCreatingAccount || otp.length !== 6}
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendOtp}
                disabled={isResending || isVerifying || isCreatingAccount}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
