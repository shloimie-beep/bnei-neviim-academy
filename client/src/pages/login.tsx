import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/hooks/use-track-event";
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
  const [isSendingPassword, setIsSendingPassword] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

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
    setPasswordSent(false);
    try {
      const user = await login(data.email, data.password);
      trackEvent({ eventType: "login", resourceType: "page", resourceTitle: "Login" });
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

  const sendNewPassword = async () => {
    const email = emailValue;
    if (!email) return;
    setIsSendingPassword(true);
    try {
      await apiRequest("POST", "/api/auth/send-new-password", { email });
      setPasswordSent(true);
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSendingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">

          <Card>
            <CardHeader className="text-center">
              <img src={logoImage} alt="OneTimeOneTime" className="h-12 w-auto mx-auto mb-4" />
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your OneTimeOneTime account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {/* Shown after a failed login attempt */}
              {loginFailed && !passwordSent && (
                <div className="rounded-lg border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 p-5 space-y-3">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 text-base">
                    Password not working?
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    No worries — this happens to many subscribers after our recent update.
                    We'll email you a brand new password right now so you can get back in.
                  </p>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    onClick={sendNewPassword}
                    disabled={isSendingPassword || !emailValue}
                    data-testid="button-send-new-password"
                  >
                    {isSendingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending your new password...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Email me a new password
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Shown after new password is sent */}
              {passwordSent && (
                <div className="rounded-lg border-2 border-green-400 bg-green-50 dark:bg-green-950/40 p-5 flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-green-800 dark:text-green-200">New password sent!</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Check your email — your new password is on its way. Use it to log in above, then you can change it in your account settings.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <div className="w-full text-center">
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
