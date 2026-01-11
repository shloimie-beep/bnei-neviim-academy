import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, ArrowLeft, Loader2, Check, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { registerSchema, type RegisterInput } from "@shared/schema";

const countryCodes = [
  { code: "+1", country: "USA/Canada", flag: "US" },
  { code: "+972", country: "Israel", flag: "IL" },
  { code: "+44", country: "UK", flag: "GB" },
  { code: "+61", country: "Australia", flag: "AU" },
  { code: "+33", country: "France", flag: "FR" },
  { code: "+49", country: "Germany", flag: "DE" },
  { code: "+27", country: "South Africa", flag: "ZA" },
  { code: "+52", country: "Mexico", flag: "MX" },
  { code: "+55", country: "Brazil", flag: "BR" },
  { code: "+91", country: "India", flag: "IN" },
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      familyName: "",
      location: "",
      phoneNumber: "",
      countryCode: "+1",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await register(data);
      toast({
        title: "Account created!",
        description: "Your 2-week free trial has started. Enjoy the hotline!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      <div className="bg-red-600 text-white py-4 px-4" data-testid="banner-development-warning">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <div className="text-center">
            <p className="font-bold text-lg">The Hotline is Still in Development</p>
            <p className="text-sm mt-1">
              The hotline phone line is not working yet. In the meantime, you can{" "}
              <a 
                href="https://academy.onetimeonetime.com/the-onetime-onetime-academy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-yellow-300"
                data-testid="link-old-academy-signup"
              >
                sign up for the old Academy
              </a>
              {" "}or{" "}
              <a 
                href="https://academy.onetimeonetime.com/login" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-yellow-300"
                data-testid="link-old-academy-login"
              >
                login if you already have an account
              </a>.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block space-y-6 p-6">
            <h2 className="text-2xl font-bold">Start Your Free Trial</h2>
            <p className="text-muted-foreground">
              Get full access to the Kids' Hotline for 2 weeks, absolutely free.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Unlimited Story Access</p>
                  <p className="text-sm text-muted-foreground">Listen to all available stories anytime</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Join Group Calls</p>
                  <p className="text-sm text-muted-foreground">Participate in moderated conference calls</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Cancel Anytime</p>
                  <p className="text-sm text-muted-foreground">No commitment, no strings attached</p>
                </div>
              </li>
            </ul>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Sign up for your 2-week free trial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="familyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your family name"
                            data-testid="input-family-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City, State/Country"
                            data-testid="input-location"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          e.g., Baltimore, MD or London, UK
                        </FormDescription>
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
                            placeholder="Create a strong password"
                            data-testid="input-password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Must be 8+ characters with uppercase, lowercase, and number
                        </FormDescription>
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
                            placeholder="Confirm your password"
                            data-testid="input-confirm-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Phone Number</FormLabel>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-country-code">
                                  <SelectValue placeholder="+1" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryCodes.map((cc) => (
                                  <SelectItem key={cc.code} value={cc.code}>
                                    {cc.code} {cc.country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="555-123-4567"
                                data-testid="input-phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This number will be used to access the hotline
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-submit-register"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Start Free Trial
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
