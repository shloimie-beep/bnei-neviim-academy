import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, CreditCard, Settings, LogOut, Plus, Trash2, Loader2, Clock, CheckCircle, AlertCircle, XCircle, Video, Play, FileVideo } from "lucide-react";
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
import { useState, useRef } from "react";
import type { PhoneNumber, Video as VideoType } from "@shared/schema";

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

function VideoPlayer({ video, onClose }: { video: VideoType; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <DialogContent className="max-w-4xl p-0 overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={`/api/videos/${video.id}/stream`}
          controls
          autoPlay
          className="w-full aspect-video bg-black"
          data-testid={`video-player-${video.id}`}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
        )}
      </div>
    </DialogContent>
  );
}

function VideoCard({ video }: { video: VideoType }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2" data-testid={`card-video-${video.id}`}>
          <div className="aspect-video bg-muted flex items-center justify-center relative group">
            <FileVideo className="h-12 w-12 text-muted-foreground" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-6 w-6 text-primary-foreground ml-1" />
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium line-clamp-1" data-testid={`text-video-title-${video.id}`}>
              {video.title}
            </h3>
            {video.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {video.description}
              </p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <VideoPlayer video={video} onClose={() => setIsOpen(false)} />
    </Dialog>
  );
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);

  const { data: phoneNumbers, isLoading: phonesLoading } = useQuery<PhoneNumber[]>({
    queryKey: ["/api/phone-numbers"],
  });

  const { data: subscription, isLoading: subLoading } = useQuery<any>({
    queryKey: ["/api/subscription"],
  });

  const { data: videos, isLoading: videosLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos"],
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
      setIsPhoneDialogOpen(false);
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

  const hasActiveSubscription = user?.subscriptionStatus === "active" || 
    (user?.subscriptionStatus === "trial" && daysRemaining > 0);

  const registeredPhone = phoneNumbers?.[0];

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <SubscriptionStatusBadge status={user?.subscriptionStatus || "none"} />
                {user?.subscriptionStatus === "trial" && daysRemaining > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {daysRemaining} days left in trial
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2" data-testid="button-manage-phone">
                    <Phone className="h-5 w-5" />
                    {registeredPhone ? "Manage Phone" : "Add Phone Number"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {registeredPhone ? "Your Registered Phone" : "Add Phone Number"}
                    </DialogTitle>
                    <DialogDescription>
                      {registeredPhone 
                        ? "Your phone number for accessing the hotline" 
                        : "Add a phone number to access the hotline"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {registeredPhone ? (
                    <div className="py-4">
                      <PhoneNumberCard
                        phoneNumber={registeredPhone}
                        onDelete={() => {
                          deletePhoneMutation.mutate(registeredPhone.id);
                          setIsPhoneDialogOpen(false);
                        }}
                      />
                    </div>
                  ) : (
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
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
                      Close
                    </Button>
                    {!registeredPhone && (
                      <Button
                        onClick={handleAddPhone}
                        disabled={isAddingPhone || !newPhoneNumber.trim()}
                        data-testid="button-confirm-add-phone"
                      >
                        {isAddingPhone && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Number
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {user?.role !== "admin" && (
                <>
                  {user?.subscriptionStatus === "none" && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => createCheckoutMutation.mutate()}
                      disabled={createCheckoutMutation.isPending}
                      data-testid="button-subscribe"
                    >
                      {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Start Free Trial
                    </Button>
                  )}
                  {(user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trial") && subscription?.stripeCustomerId && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => createPortalMutation.mutate()}
                      disabled={createPortalMutation.isPending}
                      data-testid="button-manage-billing"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Billing
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {hasActiveSubscription ? (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  Video Library
                </h2>
                {videosLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-video" />
                        <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : videos && videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileVideo className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No Videos Yet</h3>
                      <p className="text-muted-foreground">
                        Check back soon for new video content!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    How to Use the Hotline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-lg font-bold text-primary">1</span>
                      </div>
                      <h4 className="font-medium mb-1">Call the Hotline</h4>
                      <p className="text-sm text-muted-foreground">
                        Dial from your registered phone number
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-lg font-bold text-primary">2</span>
                      </div>
                      <h4 className="font-medium mb-1">Choose an Option</h4>
                      <p className="text-sm text-muted-foreground">
                        Press 1 for live call, or other numbers for stories
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-lg font-bold text-primary">3</span>
                      </div>
                      <h4 className="font-medium mb-1">Control Playback</h4>
                      <p className="text-sm text-muted-foreground">
                        Press 2 to pause, 1 to rewind, 3 to fast forward
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h2 className="text-2xl font-bold mb-2">Unlock Video Content</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Subscribe to access our library of exclusive video content for kids, 
                  plus phone hotline access with stories and live calls.
                </p>
                <Button
                  size="lg"
                  onClick={() => createCheckoutMutation.mutate()}
                  disabled={createCheckoutMutation.isPending}
                  data-testid="button-subscribe-videos"
                >
                  {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Start 14-Day Free Trial
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  $9.99/month after trial ends. Cancel anytime.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
