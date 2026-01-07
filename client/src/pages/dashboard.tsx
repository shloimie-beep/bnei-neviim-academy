import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, CreditCard, Settings, LogOut, Plus, Trash2, Loader2, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { PhoneNumber } from "@shared/schema";

function SubscriptionStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    active: { label: "Active", variant: "default", icon: CheckCircle },
    trial: { label: "Free Trial", variant: "secondary", icon: Clock },
    cancelled: { label: "Cancelled", variant: "outline", icon: XCircle },
    past_due: { label: "Past Due", variant: "destructive", icon: AlertCircle },
    none: { label: "No Subscription", variant: "outline", icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.none;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function PhoneNumberCard({ phoneNumber, onDelete }: { phoneNumber: PhoneNumber; onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium" data-testid={`text-phone-${phoneNumber.id}`}>{phoneNumber.phoneNumber}</p>
          <p className="text-sm text-muted-foreground">
            {phoneNumber.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        data-testid={`button-delete-phone-${phoneNumber.id}`}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: phoneNumbers, isLoading: phonesLoading } = useQuery<PhoneNumber[]>({
    queryKey: ["/api/phone-numbers"],
  });

  const { data: subscription, isLoading: subLoading } = useQuery<any>({
    queryKey: ["/api/subscription"],
  });

  const addPhoneMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/phone-numbers", { phoneNumber });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-numbers"] });
      toast({ title: "Phone number added", description: "Your new phone number has been registered." });
      setNewPhoneNumber("");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to add phone", description: error.message, variant: "destructive" });
    },
  });

  const deletePhoneMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/phone-numbers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-numbers"] });
      toast({ title: "Phone number removed" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove phone", description: error.message, variant: "destructive" });
    },
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/create-checkout");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
    },
  });

  const createPortalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/create-portal");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({ title: "Portal access failed", description: error.message, variant: "destructive" });
    },
  });

  const handleAddPhone = async () => {
    if (!newPhoneNumber.trim()) return;
    setIsAddingPhone(true);
    await addPhoneMutation.mutateAsync(newPhoneNumber);
    setIsAddingPhone(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const daysRemaining = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Kids' Hotline</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" data-testid="button-admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Manage your subscription and phone numbers below.</p>
          </div>

          {/* Subscription Card - Hide for admins */}
          {user?.role !== "admin" && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription Status
                  </CardTitle>
                  <CardDescription>Your current plan and billing information</CardDescription>
                </div>
                <SubscriptionStatusBadge status={user?.subscriptionStatus || "none"} />
              </CardHeader>
              <CardContent>
                {subLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user?.subscriptionStatus === "trial" && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">Free Trial</p>
                        <p className="text-sm text-muted-foreground">
                          {daysRemaining > 0
                            ? `${daysRemaining} days remaining in your trial`
                            : "Your trial has ended"}
                        </p>
                      </div>
                    )}
                    {user?.subscriptionStatus === "active" && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">Monthly Subscription</p>
                        <p className="text-sm text-muted-foreground">$9.99/month - Renews automatically</p>
                      </div>
                    )}
                    {user?.subscriptionStatus === "none" && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">Start Your Free Trial</p>
                        <p className="text-sm text-muted-foreground">
                          Get 14 days free access. Card required - $9.99/month after trial ends.
                        </p>
                      </div>
                    )}
                    {user?.subscriptionStatus === "cancelled" && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">Subscription Cancelled</p>
                        <p className="text-sm text-muted-foreground">Resubscribe to regain access to the hotline</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {user?.subscriptionStatus === "none" && (
                  <Button
                    onClick={() => createCheckoutMutation.mutate()}
                    disabled={createCheckoutMutation.isPending}
                    data-testid="button-subscribe"
                  >
                    {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Start Free Trial
                  </Button>
                )}
                {(user?.subscriptionStatus === "cancelled" || (user?.subscriptionStatus === "trial" && daysRemaining <= 0)) && (
                  <Button
                    onClick={() => createCheckoutMutation.mutate()}
                    disabled={createCheckoutMutation.isPending}
                    data-testid="button-resubscribe"
                  >
                    {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Subscribe Now
                  </Button>
                )}
                {(user?.subscriptionStatus === "active" || user?.subscriptionStatus === "past_due" || user?.subscriptionStatus === "trial") && subscription?.stripeCustomerId && (
                  <Button
                    variant="outline"
                    onClick={() => createPortalMutation.mutate()}
                    disabled={createPortalMutation.isPending}
                    data-testid="button-manage-billing"
                  >
                    {createPortalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Manage Billing
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          {/* Phone Numbers Card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Registered Phone Numbers
                </CardTitle>
                <CardDescription>
                  {user?.role === "admin"
                    ? "These numbers can access the hotline"
                    : "Your registered phone number (limit: 1)"}
                </CardDescription>
              </div>
              {(user?.role === "admin" || !phoneNumbers || phoneNumbers.length === 0) ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-phone">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Number
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Phone Number</DialogTitle>
                      <DialogDescription>
                        Add a new phone number that can access the hotline.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          data-testid="input-new-phone"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddPhone}
                        disabled={isAddingPhone || !newPhoneNumber.trim()}
                        data-testid="button-confirm-add-phone"
                      >
                        {isAddingPhone && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Number
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </CardHeader>
            <CardContent>
              {phonesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : phoneNumbers && phoneNumbers.length > 0 ? (
                <div className="space-y-3">
                  {phoneNumbers.map((phone) => (
                    <PhoneNumberCard
                      key={phone.id}
                      phoneNumber={phone}
                      onDelete={() => deletePhoneMutation.mutate(phone.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No phone numbers registered yet.</p>
                  <p className="text-sm text-muted-foreground">Add a phone number to access the hotline.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How to Use Card */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use the Hotline</CardTitle>
              <CardDescription>Instructions for calling in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Call the Hotline</p>
                    <p className="text-sm text-muted-foreground">
                      Dial the hotline number from your registered phone.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Choose an Option</p>
                    <p className="text-sm text-muted-foreground">
                      Press 1 for the live call, or other numbers for stories.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Control Playback</p>
                    <p className="text-sm text-muted-foreground">
                      For stories: Press 2 to pause/play, 1 to rewind, 3 to fast forward, 0 for menu.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
