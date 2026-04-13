import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Eye, Calendar, Play, Music, LogIn, Heart, ArrowLeft, Search, RefreshCw, Activity, Star, Clock } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-context";

// ── Types ──────────────────────────────────────────────────────────────────
interface LegacyAnalytics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  topVideos: { title: string; unique_viewers: number }[];
  topUsers: { email: string; family_name: string | null; videos_watched: number; last_active: string }[];
  activityByDay: { day: string; unique_users: number; total_views: number }[];
}

interface UserRow {
  user_email: string;
  family_name: string | null;
  subscription_status: string | null;
  total_events: number;
  video_plays: number;
  audio_plays: number;
  unique_videos: number;
  last_active: string;
  first_seen: string;
}

interface EventRow {
  id: string;
  user_email: string;
  family_name: string | null;
  event_type: string;
  resource_id: string | null;
  resource_title: string | null;
  resource_type: string | null;
  metadata: string | null;
  created_at: string;
}

interface UserDetail {
  email: string;
  summary: {
    total_video_plays: number;
    total_audio_plays: number;
    total_completions: number;
    total_logins: number;
    unique_videos_watched: number;
    first_seen: string;
    last_active: string;
  };
  videoStats: { resource_title: string; resource_id: string; play_count: number; last_played: string }[];
  recentEvents: EventRow[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function relTime(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function absTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const EVENT_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  video_play:    { label: "Watched video",  icon: Play,    color: "text-blue-500" },
  audio_play:    { label: "Played audio",   icon: Music,   color: "text-purple-500" },
  video_complete:{ label: "Finished video", icon: Star,    color: "text-yellow-500" },
  login:         { label: "Logged in",      icon: LogIn,   color: "text-green-500" },
  page_view:     { label: "Visited site",   icon: Eye,     color: "text-gray-400" },
  video_save:    { label: "Saved video",    icon: Heart,   color: "text-pink-500" },
  audio_save:    { label: "Saved audio",    icon: Heart,   color: "text-pink-400" },
  video_unsave:  { label: "Unsaved video",  icon: Heart,   color: "text-gray-400" },
  audio_unsave:  { label: "Unsaved audio",  icon: Heart,   color: "text-gray-400" },
  video_like:    { label: "Liked video",    icon: TrendingUp, color: "text-orange-500" },
  video_unlike:  { label: "Unliked video",  icon: TrendingUp, color: "text-gray-400" },
};

function EventIcon({ type }: { type: string }) {
  const cfg = EVENT_LABELS[type] || { icon: Activity, color: "text-gray-400" };
  const Icon = cfg.icon;
  return <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />;
}

function EventLabel({ type }: { type: string }) {
  return <span>{EVENT_LABELS[type]?.label || type}</span>;
}

// ── User Detail View ───────────────────────────────────────────────────────
function UserDetailView({ email, onBack }: { email: string; onBack: () => void }) {
  const { data, isLoading } = useQuery<UserDetail>({
    queryKey: ["/api/admin/analytics/user", email],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/user/${encodeURIComponent(email)}`, {
        headers: getAuthHeaders(), credentials: "include",
      });
      return res.json();
    },
  });

  if (isLoading) return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="h-4 w-4" />Back</Button>
      <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded" />)}</div>
    </div>
  );

  const s = data?.summary;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="h-4 w-4" />All Users</Button>
        <div>
          <h2 className="font-bold text-lg">{email}</h2>
          {s && <p className="text-xs text-muted-foreground">Member since {s.first_seen ? absTime(s.first_seen) : "unknown"} · Last active {s.last_active ? relTime(s.last_active) : "never"}</p>}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Video plays", value: s?.total_video_plays ?? 0, icon: Play, color: "text-blue-500" },
          { label: "Unique videos", value: s?.unique_videos_watched ?? 0, icon: Eye, color: "text-indigo-500" },
          { label: "Audio plays", value: s?.total_audio_plays ?? 0, icon: Music, color: "text-purple-500" },
          { label: "Logins", value: s?.total_logins ?? 0, icon: LogIn, color: "text-green-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-6 w-6 ${color}`} />
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Videos watched */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Play className="h-4 w-4" />Videos Watched (by play count)</CardTitle></CardHeader>
          <CardContent>
            {!data?.videoStats.length ? <p className="text-sm text-muted-foreground">No videos played yet.</p> : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.videoStats.map((v) => (
                  <div key={v.resource_id || v.resource_title} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate min-w-0">{v.resource_title || "Unknown"}</span>
                    <div className="text-right shrink-0">
                      <Badge variant="secondary">{v.play_count}×</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{relTime(v.last_played)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {!data?.recentEvents.length ? <p className="text-sm text-muted-foreground">No activity recorded.</p> : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.recentEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <EventIcon type={ev.event_type} />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium"><EventLabel type={ev.event_type} /></span>
                      {ev.resource_title && <span className="text-muted-foreground"> — {ev.resource_title}</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{relTime(ev.created_at)}</span>
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

// ── Main Analytics Page ────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "users" | "events">("overview");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const { data: legacy, isLoading: legacyLoading } = useQuery<LegacyAnalytics>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<UserRow[]>({
    queryKey: ["/api/admin/analytics/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/users", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
  });

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<EventRow[]>({
    queryKey: ["/api/admin/analytics/events", eventFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "200" });
      if (eventFilter !== "all") params.set("type", eventFilter);
      const res = await fetch(`/api/admin/analytics/events?${params}`, { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
  });

  // If a user is selected, show their detail view
  if (selectedEmail) {
    return <UserDetailView email={selectedEmail} onBack={() => setSelectedEmail(null)} />;
  }

  const filteredUsers = users.filter(u =>
    !search || u.user_email.toLowerCase().includes(search.toLowerCase()) || (u.family_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const maxDayUsers = Math.max(...(legacy?.activityByDay.map(d => parseInt(d.unique_users as any)) || [1]), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetchUsers(); refetchEvents(); }} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </Button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b">
        {(["overview", "users", "events"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "overview" ? "Overview" : t === "users" ? `Users (${users.length})` : `Live Feed`}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">Active users = subscribers who watched at least one video in the period.</p>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="stat-daily-active">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{legacyLoading ? "—" : (legacy?.dailyActiveUsers ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">unique subscribers in last 24h</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-weekly-active">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{legacyLoading ? "—" : (legacy?.weeklyActiveUsers ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">unique subscribers in last 7 days</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-monthly-active">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{legacyLoading ? "—" : (legacy?.monthlyActiveUsers ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">unique subscribers in last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily activity chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />Daily Activity — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              {!legacy?.activityByDay.length ? (
                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {[...legacy.activityByDay].reverse().map((day) => {
                    const usersCount = parseInt(day.unique_users as any);
                    const views = parseInt(day.total_views as any);
                    const pct = Math.round((usersCount / maxDayUsers) * 100);
                    return (
                      <div key={day.day} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-28 shrink-0">{formatDay(day.day)}</span>
                        <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                        <span className="text-xs font-medium w-28 text-right shrink-0">
                          {usersCount} {usersCount === 1 ? "user" : "users"} · {views} views
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
              <CardHeader><CardTitle className="text-base">Most Active Members (30 days)</CardTitle></CardHeader>
              <CardContent>
                {!legacy?.topUsers.length ? (
                  <p className="text-muted-foreground text-sm">No activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {legacy.topUsers.map((u, i) => (
                      <div key={u.email} className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 rounded p-1 -mx-1" onClick={() => { setSelectedEmail(u.email); }}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.family_name || u.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          <p className="text-xs text-muted-foreground">Last active: {relTime(u.last_active)}</p>
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
              <CardHeader><CardTitle className="text-base">Most Popular Videos (30 days)</CardTitle></CardHeader>
              <CardContent>
                {!legacy?.topVideos.length ? (
                  <p className="text-muted-foreground text-sm">No views recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {legacy.topVideos.map((v, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
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
      )}

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by email or name…" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <p className="text-sm text-muted-foreground">{filteredUsers.length} member{filteredUsers.length !== 1 ? "s" : ""}</p>
          </div>

          {usersLoading ? (
            <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded" />)}</div>
          ) : !filteredUsers.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "No members match that search." : "No activity tracked yet. Activity will appear here once members start using the site."}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
                <span>Member</span>
                <span className="text-center">Video plays</span>
                <span className="text-center">Audio plays</span>
                <span className="text-center">Unique videos</span>
                <span className="text-right">Last active</span>
              </div>
              {filteredUsers.map(u => (
                <div
                  key={u.user_email}
                  className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEmail(u.user_email)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.family_name || u.user_email}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.user_email}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-blue-500">{u.video_plays}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-purple-500">{u.audio_plays}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold">{u.unique_videos}</span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {u.last_active ? relTime(u.last_active) : "never"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EVENTS / LIVE FEED TAB ── */}
      {tab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="video_play">Video plays</SelectItem>
                <SelectItem value="audio_play">Audio plays</SelectItem>
                <SelectItem value="video_complete">Completions</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="page_view">Page views</SelectItem>
                <SelectItem value="video_save">Saves</SelectItem>
                <SelectItem value="video_like">Likes</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetchEvents()} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </Button>
            <p className="text-sm text-muted-foreground">{events.length} events shown</p>
          </div>

          {eventsLoading ? (
            <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded" />)}</div>
          ) : !events.length ? (
            <div className="text-center py-12 text-muted-foreground">No events recorded yet.</div>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[140px_1fr_160px_90px] gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
                <span>Email</span>
                <span>Event</span>
                <span>Content</span>
                <span className="text-right">When</span>
              </div>
              {events.map(ev => (
                <div
                  key={ev.id}
                  className="grid grid-cols-[140px_1fr_160px_90px] gap-2 px-3 py-2 rounded hover:bg-muted/40 cursor-pointer text-sm"
                  onClick={() => setSelectedEmail(ev.user_email)}
                >
                  <span className="truncate text-xs text-muted-foreground" title={ev.user_email}>{ev.user_email}</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <EventIcon type={ev.event_type} />
                    <EventLabel type={ev.event_type} />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{ev.resource_title || ""}</span>
                  <span className="text-right text-xs text-muted-foreground">{relTime(ev.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
