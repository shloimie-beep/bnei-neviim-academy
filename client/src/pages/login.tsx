import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Info, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginSchema, type LoginInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/qt=q_95_1767830887218.webp";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = form.watch("email");

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setLoginFailed(false);
    setResetSent(false);
    try {
      const user = await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      setLoginFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendResetEmail = async () => {
    const email = emailValue;
    if (!email) return;
    setIsSendingReset(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setResetSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">

          {/* Notice banner */}
          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold">Password not working?</p>
              <p>
                We recently restored all accounts after a system update. Your subscription is fully intact —
                just reset your password and you're good to go.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <img src={logoImage} alt="OneTimeOneTime" className="h-12 w-auto mx-auto mb-4" />
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your OneTimeOneTime account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            data-testid="input-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>

              {/* Shown after a failed login */}
              {loginFailed && !resetSent && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Password didn't work
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Click below and we'll email you a reset link right away — it only takes a moment.
                  </p>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={sendResetEmail}
                    disabled={isSendingReset || !emailValue}
                    data-testid="button-send-reset"
                  >
                    {isSendingReset ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    {isSendingReset ? "Sending..." : `Send reset link to ${emailValue || "my email"}`}
                  </Button>
                </div>
              )}

              {/* Shown after reset email sent */}
              {resetSent && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-4 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <p className="font-semibold">Reset link sent!</p>
                    <p>Check your email for a link to reset your password.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Link href="/forgot-password" className="w-full" data-testid="link-forgot-password">
                <Button variant="ghost" className="w-full text-muted-foreground text-sm">
                  Use a different email to reset password
                </Button>
              </Link>
              <div className="w-full pt-3 border-t text-center">
                <p className="text-sm text-muted-foreground mb-3">Don't have an account?</p>
                <Link href="/register">
                  <Button variant="outline" className="w-full" data-testid="link-register">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
