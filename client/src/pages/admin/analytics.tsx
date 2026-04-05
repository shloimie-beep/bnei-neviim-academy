import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Eye, Calendar } from "lucide-react";

interface AnalyticsData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  topVideos: { title: string; unique_viewers: number }[];
  topUsers: { email: string; family_name: string | null; videos_watched: number; last_active: string }[];
  activityByDay: { day: string; unique_users: number; total_views: number }[];
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatLastActive = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const maxDayUsers = Math.max(...(data?.activityByDay.map(d => parseInt(d.unique_users as any)) || [1]), 1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="text-muted-foreground text-sm">Active users = subscribers who watched at least one video in the period.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="stat-daily-active">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.dailyActiveUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">unique subscribers in last 24h</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-weekly-active">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.weeklyActiveUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">unique subscribers in last 7 days</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-monthly-active">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.monthlyActiveUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">unique subscribers in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily activity chart (last 14 days) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Daily Activity — Last 14 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.activityByDay.length ? (
            <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {[...data.activityByDay].reverse().map((day) => {
                const users = parseInt(day.unique_users as any);
                const views = parseInt(day.total_views as any);
                const pct = Math.round((users / maxDayUsers) * 100);
                return (
                  <div key={day.day} className="flex items-center gap-3" data-testid={`row-activity-${day.day}`}>
                    <span className="text-xs text-muted-foreground w-28 shrink-0">{formatDay(day.day)}</span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-24 text-right shrink-0">
                      {users} {users === 1 ? "user" : "users"} · {views} {views === 1 ? "view" : "views"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most active users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Active Members (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.topUsers.length ? (
              <p className="text-muted-foreground text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topUsers.map((u, i) => (
                  <div key={u.email} className="flex items-center justify-between" data-testid={`row-user-${i}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.family_name || u.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-xs text-muted-foreground">Last active: {formatLastActive(u.last_active)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-lg font-bold">{u.videos_watched}</span>
                      <p className="text-xs text-muted-foreground">videos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most popular videos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Popular Videos (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.topVideos.length ? (
              <p className="text-muted-foreground text-sm">No views recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topVideos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between gap-3" data-testid={`row-video-${i}`}>
                    <p className="text-sm truncate min-w-0">{v.title}</p>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold">{v.unique_viewers}</span>
                      <p className="text-xs text-muted-foreground">{parseInt(v.unique_viewers as any) === 1 ? "viewer" : "viewers"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
