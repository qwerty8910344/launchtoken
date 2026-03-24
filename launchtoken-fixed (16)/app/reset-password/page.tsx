'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
const logoImg = '/logo-optimized.webp';
import { z } from "zod";
import { verifyResetCode, confirmReset } from "@/lib/firebase";

const resetFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetFormSchema>;

function ResetPasswordInner() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParams;
  let oobCode = params.get("oobCode") || "";
  const token = params.get("token") || "";
  const mode = params.get("mode") || "";

  if (!oobCode) {
    const link = params.get("link");
    if (link) {
      try {
        const linkParams = new URLSearchParams(new URL(link).search);
        oobCode = linkParams.get("oobCode") || "";
      } catch {}
    }
  }
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const isFirebaseReset = !!oobCode || mode === "resetPassword";

  useEffect(() => {
    if (oobCode) {
      setVerifying(true);
      verifyResetCode(oobCode)
        .then((email) => {
          setVerifiedEmail(email);
          setVerifying(false);
        })
        .catch(() => {
          setVerifyError(true);
          setVerifying(false);
        });
    }
  }, [oobCode]);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      if (isFirebaseReset && oobCode) {
        await confirmReset(oobCode, data.password);

        if (verifiedEmail) {
          try {
            await apiRequest("POST", "/api/auth/sync-firebase-reset", {
              email: verifiedEmail,
              newPassword: data.password,
            });
          } catch {}
        }

        setSuccess(true);
        toast({ title: "Password reset!", description: "You can now log in with your new password." });
      } else if (token) {
        await apiRequest("POST", "/api/auth/reset-password", {
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
        setSuccess(true);
        toast({ title: "Password reset!", description: "You can now log in with your new password." });
      }
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: "Invalid or expired reset link. Please request a new one.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !oobCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Invalid reset link. Please request a new one.</p>
            <Link href="/forgot-password">
              <Button data-testid="button-request-new-reset">Request New Reset</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <p className="text-muted-foreground">This reset link is invalid or has expired.</p>
            <Link href="/forgot-password">
              <Button className="w-full" data-testid="button-request-new-reset">Request New Reset Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 cursor-pointer mb-4">
              <img src={logoImg} alt="LaunchToken" className="w-10 h-10 rounded-md object-cover" />
              <span className="font-bold text-xl">LaunchToken</span>
            </div>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" data-testid="text-reset-title">
              {success ? "Password Reset!" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {success ? "Your password has been updated." : verifiedEmail ? `Reset password for ${verifiedEmail}` : "Enter your new password below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <Link href="/login">
                  <Button className="w-full" data-testid="button-go-login">Go to Login</Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              data-testid="input-reset-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            data-testid="input-reset-confirm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-reset">
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{padding:"2rem",textAlign:"center"}}>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
