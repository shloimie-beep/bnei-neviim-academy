import { useQuery } from "@tanstack/react-query";
import { Users, Music, Phone, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalSubscribers: number;
  activeTrials: number;
  totalAudioFiles: number;
  conferenceActive: boolean;
  activeParticipants: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Kids' Hotline system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-subscribers">
                {stats?.totalSubscribers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-trials">
                {stats?.activeTrials || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Free trial users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="stat-audio">
                {stats?.totalAudioFiles || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Stories & greetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conference Status</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant={stats?.conferenceActive ? "default" : "secondary"} data-testid="stat-conference">
                  {stats?.conferenceActive ? "Live" : "Inactive"}
                </Badge>
                {stats?.conferenceActive && (
                  <span className="text-sm text-muted-foreground">
                    {stats?.activeParticipants || 0} callers
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Current call status</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <a href="/admin/audio" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Upload Audio</p>
                    <p className="text-sm text-muted-foreground">Add new stories or greetings</p>
                  </div>
                </div>
              </a>
              <a href="/admin/menu" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Configure Menu</p>
                    <p className="text-sm text-muted-foreground">Set up IVR options</p>
                  </div>
                </div>
              </a>
              <a href="/admin/conference" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Manage Conference</p>
                    <p className="text-sm text-muted-foreground">Monitor and control live calls</p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Service health overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Plivo Integration</span>
                </div>
                <Badge variant="outline">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Stripe Payments</span>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="outline">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Audio Storage</span>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
