'use client';

import { useState } from "react";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
const logoImg = '/logo-optimized.webp';
import { z } from "zod";
import { sendResetEmail } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      const result = await res.json();

      if (result.sent) {
        try {
          await sendResetEmail(data.email);
          setEmailSent(true);
          setSubmitted(true);
          toast({ title: "Reset email sent!", description: "Check your inbox for the password reset link." });
        } catch (fbError: any) {
          if (fbError.code === "auth/user-not-found") {
            setSubmitted(true);
            setEmailSent(false);
            toast({ title: "No account found", description: "No account exists with that email address.", variant: "destructive" });
          } else {
            throw fbError;
          }
        }
      } else {
        setSubmitted(true);
        setEmailSent(false);
        toast({ title: "No account found", description: "No account exists with that email address.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Forgot password error:", error?.code, error?.message, error);
      const errorMsg = error?.code === "auth/unauthorized-continue-uri"
        ? "Firebase domain not authorized. Please contact support."
        : error?.code === "auth/invalid-continue-uri"
        ? "Invalid reset URL configuration."
        : error?.message || "Something went wrong. Please try again.";
      toast({
        title: "Request failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
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
              <span className="font-bold text-xl" data-testid="text-brand-forgot">LaunchToken</span>
            </div>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" data-testid="text-forgot-title">
              {submitted && emailSent ? "Check Your Email" : "Forgot Password"}
            </CardTitle>
            <CardDescription>
              {submitted && emailSent
                ? "We've sent a password reset link to your email."
                : "Enter the email address you used to register."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted && emailSent ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  A password reset email has been sent to your inbox. Click the link in the email to set a new password.
                  Don't forget to check your spam folder.
                </p>
                <Button className="w-full" variant="outline" onClick={() => { setSubmitted(false); setEmailSent(false); }} data-testid="button-send-again">
                  Send Again
                </Button>
                <div className="text-center mt-4">
                  <Link href="/login">
                    <span className="text-sm text-primary cursor-pointer inline-flex items-center gap-1" data-testid="link-back-login">
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </span>
                  </Link>
                </div>
              </div>
            ) : submitted && !emailSent ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  No account was found with that email address. Please check your email and try again.
                </p>
                <Button className="w-full" variant="outline" onClick={() => { setSubmitted(false); setEmailSent(false); }} data-testid="button-try-again">
                  Try Again
                </Button>
                <div className="text-center mt-4">
                  <Link href="/login">
                    <span className="text-sm text-primary cursor-pointer inline-flex items-center gap-1" data-testid="link-back-login-notfound">
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10"
                                data-testid="input-forgot-email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-forgot">
                      {isLoading ? "Sending..." : "Send Reset Email"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-6 text-center">
                  <Link href="/login">
                    <span className="text-sm text-primary cursor-pointer inline-flex items-center gap-1" data-testid="link-back-login-form">
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </span>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
