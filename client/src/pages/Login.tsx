import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Mail, Lock, Shield, Zap, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const parseErrorMessage = (error: any): string => {
    let message = error.message || "Something went wrong";
    
    try {
      const jsonMatch = message.match(/\{.*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.error) {
          message = parsed.error;
        }
      }
    } catch {
    }
    
    message = message.replace(/^\d+:\s*/, '');
    
    if (message.toLowerCase().includes('invalid credentials') || 
        message.toLowerCase().includes('invalid password') ||
        message.toLowerCase().includes('user not found')) {
      return "The email/username or password you entered is incorrect. Please try again.";
    }
    
    if (message.toLowerCase().includes('account') && message.toLowerCase().includes('disabled')) {
      return "Your account has been disabled. Please contact support.";
    }
    
    return message;
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: (user) => {
      setLoginError(null);
      onLogin(user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      if (user.role === "super_admin") {
        setLocation("/super-admin");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      const friendlyMessage = parseErrorMessage(error);
      setLoginError(friendlyMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/auth/forgot-password", { email });
    },
    onSuccess: (data) => {
      toast({
        title: "Email Sent",
        description: data.message || "If an account exists with this email, a password reset link has been sent",
      });
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPasswordEmail) {
      forgotPasswordMutation.mutate(forgotPasswordEmail);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#f6f8fc]">
      {/* Soft light canvas: faint navy glow and orbit rings that echo the Orvey mark */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-ink-100/80 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-200/50" />
        <div className="absolute left-1/2 top-1/2 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-200/30" />
        <div className="absolute left-[calc(50%+16rem)] top-[calc(50%-17rem)] h-3 w-3 rounded-full bg-brand-300/70" />
      </div>

      <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-ink-100 bg-white/95 p-8 shadow-[0_24px_60px_-24px_rgba(17,35,74,0.22)] backdrop-blur sm:p-10">
            <div className="flex items-center justify-center gap-2.5">
              <img src="/orvey-logo.svg" className="h-10 w-10" alt="" />
              <span className="text-xl font-semibold tracking-wide text-ink-700">Orvey</span>
            </div>

            <div className="mt-8 text-center">
              <h1 className="font-display text-[2.6rem] leading-none text-ink-800">Welcome back</h1>
              <p className="mt-3 text-sm text-ink-400">Sign in to your AI workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="username" className="text-[13px] font-medium text-ink-600">
                  Email or username
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="you@company.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    data-testid="input-username"
                    className="h-11 border-ink-200 bg-white pl-10 text-ink-800 placeholder:text-ink-300 focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/15 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[13px] font-medium text-ink-600">
                    Password
                  </Label>
                  <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-800"
                      >
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-ink-800">
                          <Mail className="h-5 w-5 text-brand-600" />
                          Reset your password
                        </DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="forgot-email" className="text-[13px] font-medium text-ink-600">
                            Email address
                          </Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@company.com"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                            className="mt-1.5 h-11 border-ink-200 bg-white"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsForgotPasswordOpen(false);
                              setForgotPasswordEmail("");
                            }}
                            className="h-11 flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="h-11 flex-1 bg-gradient-to-r from-brand-700 to-ink-800 text-white hover:from-brand-800 hover:to-ink-900"
                            disabled={forgotPasswordMutation.isPending}
                          >
                            {forgotPasswordMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Sending...
                              </span>
                            ) : (
                              "Send reset link"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                    className="h-11 border-ink-200 bg-white pl-10 text-ink-800 placeholder:text-ink-300 focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/15 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {loginError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <p className="text-sm leading-relaxed text-red-700">{loginError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="group mt-2 h-11 w-full bg-gradient-to-r from-brand-700 to-ink-800 text-[15px] font-medium text-white shadow-md shadow-brand-900/20 transition-all hover:from-brand-800 hover:to-ink-900 hover:shadow-lg"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-400">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Encrypted & GDPR-ready
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Works with Shopify, WooCommerce & more
            </span>
          </div>
          <p className="mt-3 text-center text-xs text-ink-300">© {new Date().getFullYear()} Orvey</p>
        </div>
      </div>
    </div>
  );
}
