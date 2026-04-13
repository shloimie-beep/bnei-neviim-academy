import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, TrendingUp, Eye, Calendar, Play, Music, LogIn, Heart,
  ArrowLeft, Search, RefreshCw, Activity, Star, Clock, CheckCircle2,
  BarChart3, Pause, Video, FileAudio, ThumbsUp, Bookmark, Percent,
  AlertTriangle, Flame, Zap, UserX, Moon,
} from "lucide-react";
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

interface SummaryData {
  totals: {
    total_video_plays: number;
    total_audio_plays: number;
    total_completions: number;
    total_logins: number;
    total_tracked_users: number;
    total_unique_content_played: number;
  };
  subscriptionBreakdown: { subscription_status: string; count: number }[];
  completionStats: { completed_count: number; total_count: number; avg_watch_pct: number };
  dailyTrend: { day: string; unique_users: number; total_events: number; video_plays: number; audio_plays: number; completions: number }[];
}

interface ContentRow {
  video_id: string;
  title: string;
  media_type: string;
  total_plays: number;
  unique_viewers: number;
  completions: number;
  last_played: string;
  avg_watch_pct: number | null;
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

interface ProgressRow {
  video_id: string;
  title: string | null;
  position_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  updated_at: string;
}

interface FavoriteRow { title: string | null; created_at: string; }

interface UserDetail {
  email: string;
  summary: {
    total_video_plays: number;
    total_audio_plays: number;
    total_completions: number;
    total_logins: number;
    unique_videos_watched: number;
    unique_audio_played: number;
    first_seen: string;
    last_active: string;
    completion_rate: number | null;
    avg_watch_pct: number | null;
    total_watch_seconds: number;
    favorites_count: number;
  };
  videoStats: { resource_title: string; resource_id: string; play_count: number; last_played: string }[];
  recentEvents: EventRow[];
  progressData: ProgressRow[];
  favoritesData: FavoriteRow[];
}

interface RetentionData {
  growth: { week: string; new_users: number; paid_signups: number }[];
  atRisk: { email: string; family_name: string | null; subscription_status: string; created_at: string; last_activity: string | null }[];
  powerUsers: { user_email: string; family_name: string | null; subscription_status: string; video_plays: number; audio_plays: number; completions: number; total_plays: number; last_active: string }[];
  peakHours: { hour: number; plays: number; unique_users: number }[];
  neverActive: { email: string; family_name: string | null; subscription_status: string; created_at: string }[];
  bingeWatchers: { user_email: string; family_name: string | null; max_day_plays: number; binge_days: number }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function relTime(dateStr: string) {
  if (!dateStr) return "never";
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

function fmtSeconds(secs: number) {
  if (!secs || secs <= 0) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtTime(secs: number) {
  if (!secs || secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function statColor(status: string | null) {
  if (status === "active") return "text-green-500";
  if (status === "trialing") return "text-blue-500";
  if (status === "canceled" || status === "cancelled") return "text-red-400";
  return "text-muted-foreground";
}

const EVENT_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  video_play:    { label: "Watched video",  icon: Play,          color: "text-blue-500" },
  audio_play:    { label: "Played audio",   icon: Music,         color: "text-purple-500" },
  video_complete:{ label: "Finished video", icon: CheckCircle2,  color: "text-green-500" },
  login:         { label: "Logged in",      icon: LogIn,         color: "text-emerald-500" },
  page_view:     { label: "Visited site",   icon: Eye,           color: "text-gray-400" },
  video_save:    { label: "Saved video",    icon: Bookmark,      color: "text-pink-500" },
  audio_save:    { label: "Saved audio",    icon: Bookmark,      color: "text-pink-400" },
  video_unsave:  { label: "Unsaved video",  icon: Bookmark,      color: "text-gray-400" },
  audio_unsave:  { label: "Unsaved audio",  icon: Bookmark,      color: "text-gray-400" },
  video_like:    { label: "Liked video",    icon: ThumbsUp,      color: "text-orange-500" },
  video_unlike:  { label: "Unliked video",  icon: ThumbsUp,      color: "text-gray-400" },
};

function EventIcon({ type }: { type: string }) {
  const cfg = EVENT_LABELS[type] || { icon: Activity, color: "text-gray-400" };
  const Icon = cfg.icon;
  return <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />;
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: any; sub?: string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 bg-muted`}><Icon className={`h-5 w-5 ${color}`} /></div>
        <div className="min-w-0">
          <div className="text-2xl font-bold">{value ?? "—"}</div>
          <div className="text-xs text-muted-foreground leading-tight">{label}</div>
          {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function PctBar({ pct, completed }: { pct: number | null; completed?: boolean }) {
  if (pct === null) return <span className="text-xs text-muted-foreground">—</span>;
  const safe = Math.max(Math.min(pct, 100), 2);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden min-w-[60px]">
        <div className={`h-full rounded-full ${completed || pct >= 95 ? "bg-green-500" : "bg-amber-400"}`} style={{ width: `${safe}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── User Detail View ───────────────────────────────────────────────────────
function UserDetailView({ email, onBack }: { email: string; onBack: () => void }) {
  const [detailTab, setDetailTab] = useState<"progress" | "activity" | "favorites">("progress");
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
  const prog = data?.progressData || [];
  const progWithDur = prog.filter(p => p.duration_seconds && p.duration_seconds > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="h-4 w-4" />All Users</Button>
        <div>
          <h2 className="font-bold text-lg">{email}</h2>
          {s && <p className="text-xs text-muted-foreground">Member since {s.first_seen ? absTime(s.first_seen) : "unknown"} · Last active {s.last_active ? relTime(s.last_active) : "never"}</p>}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Video plays" value={s?.total_video_plays ?? 0} icon={Play} color="text-blue-500" />
        <StatCard label="Audio plays" value={s?.total_audio_plays ?? 0} icon={Music} color="text-purple-500" />
        <StatCard label="Completions" value={s?.total_completions ?? 0} icon={CheckCircle2} color="text-green-500" />
        <StatCard label="Watch time" value={fmtSeconds(s?.total_watch_seconds ?? 0)} icon={Clock} color="text-amber-500" />
        <StatCard label="Avg watched" value={s?.avg_watch_pct != null ? `${s.avg_watch_pct}%` : "—"} icon={Percent} color="text-cyan-500" />
        <StatCard label="Saved" value={s?.favorites_count ?? 0} icon={Heart} color="text-pink-500" />
      </div>

      {/* Inner tabs */}
      <div className="flex gap-1 border-b">
        {(["progress", "activity", "favorites"] as const).map(t => (
          <button
            key={t}
            onClick={() => setDetailTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              detailTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "progress" ? `Content Progress (${progWithDur.length})` : t === "activity" ? `Activity (${data?.recentEvents?.length ?? 0})` : `Saved (${s?.favorites_count ?? 0})`}
          </button>
        ))}
      </div>

      {/* Progress tab */}
      {detailTab === "progress" && (
        <div className="space-y-2">
          {!prog.length && !data?.videoStats?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No content played yet.</p>
          ) : (() => {
            const progressMap = new Map(prog.map(p => [p.video_id, p]));
            const rows = (data?.videoStats || []).map(v => ({
              id: v.resource_id,
              title: v.resource_title || "Unknown",
              playCount: parseInt(v.play_count as any),
              lastPlayed: v.last_played,
              progress: progressMap.get(v.resource_id),
            }));
            prog.forEach(p => {
              if (!rows.find(r => r.id === p.video_id)) {
                rows.push({ id: p.video_id, title: p.title || "Unknown", playCount: 1, lastPlayed: p.updated_at, progress: p });
              }
            });
            return (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_70px_120px_80px] gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
                  <span>Content</span>
                  <span className="text-center">Plays</span>
                  <span>Progress</span>
                  <span className="text-right">Last played</span>
                </div>
                {rows.map(row => {
                  const p = row.progress;
                  const pct = p && p.duration_seconds && p.duration_seconds > 0
                    ? Math.min(100, Math.round((p.position_seconds / p.duration_seconds) * 100))
                    : null;
                  const isCompleted = p?.completed || (pct !== null && pct >= 95);
                  const isPaused = !isCompleted && pct !== null && pct > 5;
                  return (
                    <div key={row.id || row.title} className="grid grid-cols-[1fr_70px_120px_80px] gap-2 px-3 py-2 rounded-lg hover:bg-muted/40 items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.title}</p>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {isCompleted && (
                            <Badge className="text-[9px] h-4 bg-green-500 text-white border-0">
                              ✓ Watched full{p?.duration_seconds ? ` (${fmtTime(p.duration_seconds)})` : ""}
                            </Badge>
                          )}
                          {isPaused && p && (
                            <Badge variant="outline" className="text-[9px] h-4 text-amber-500 border-amber-400">
                              ⏸ Stopped at {fmtTime(p.position_seconds)}{p.duration_seconds ? ` of ${fmtTime(p.duration_seconds)}` : ""}
                            </Badge>
                          )}
                          {!p && <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground">No position saved</Badge>}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold">{row.playCount}</span>
                      </div>
                      <PctBar pct={pct} completed={isCompleted} />
                      <p className="text-[11px] text-muted-foreground text-right">{relTime(row.lastPlayed)}</p>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Activity tab */}
      {detailTab === "activity" && (
        <div className="space-y-1">
          {!data?.recentEvents?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity recorded.</p>
          ) : data.recentEvents.map((ev, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-muted/40 text-sm">
              <EventIcon type={ev.event_type} />
              <div className="min-w-0 flex-1">
                <span className="font-medium">{EVENT_LABELS[ev.event_type]?.label || ev.event_type}</span>
                {ev.resource_title && <span className="text-muted-foreground"> — {ev.resource_title}</span>}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{relTime(ev.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Favorites tab */}
      {detailTab === "favorites" && (
        <div className="space-y-1">
          {!data?.favoritesData?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No saved content yet.</p>
          ) : data.favoritesData.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/40">
              <p className="text-sm font-medium">{f.title || "Unknown"}</p>
              <span className="text-xs text-muted-foreground">{relTime(f.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab() {
  const [sort, setSort] = useState<"plays" | "unique" | "completions" | "avgpct">("plays");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: content = [], isLoading } = useQuery<ContentRow[]>({
    queryKey: ["/api/admin/analytics/content"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/content", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
  });

  const filtered = content
    .filter(c => typeFilter === "all" || c.media_type === typeFilter)
    .filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "plays") return parseInt(b.total_plays as any) - parseInt(a.total_plays as any);
      if (sort === "unique") return parseInt(b.unique_viewers as any) - parseInt(a.unique_viewers as any);
      if (sort === "completions") return parseInt(b.completions as any) - parseInt(a.completions as any);
      if (sort === "avgpct") return (b.avg_watch_pct ?? 0) - (a.avg_watch_pct ?? 0);
      return 0;
    });

  const maxPlays = Math.max(...filtered.map(c => parseInt(c.total_plays as any)), 1);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search content…" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="plays">Sort: Total plays</SelectItem>
            <SelectItem value="unique">Sort: Unique viewers</SelectItem>
            <SelectItem value="completions">Sort: Completions</SelectItem>
            <SelectItem value="avgpct">Sort: Avg % watched</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{filtered.length} items</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-muted rounded" />)}</div>
      ) : !filtered.length ? (
        <div className="text-center py-12 text-muted-foreground">No content found yet. Data appears here once users start watching.</div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_70px_70px_70px_100px_80px] gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
            <span>Title</span>
            <span className="text-center">Plays</span>
            <span className="text-center">Viewers</span>
            <span className="text-center">Finished</span>
            <span>Avg watched</span>
            <span className="text-right">Last played</span>
          </div>
          {filtered.map(c => {
            const plays = parseInt(c.total_plays as any);
            const viewers = parseInt(c.unique_viewers as any);
            const comps = parseInt(c.completions as any);
            const compRate = viewers > 0 ? Math.round((comps / viewers) * 100) : 0;
            const barPct = Math.round((plays / maxPlays) * 100);
            return (
              <div key={c.video_id} className="px-3 py-2.5 rounded-lg hover:bg-muted/40 space-y-1.5">
                <div className="grid grid-cols-[1fr_70px_70px_70px_100px_80px] gap-2 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.title || "Untitled"}</p>
                    <div className="flex gap-1 mt-0.5">
                      {c.media_type === "audio"
                        ? <Badge variant="outline" className="text-[9px] h-4 text-purple-400 border-purple-400"><FileAudio className="h-2.5 w-2.5 mr-0.5" />Audio</Badge>
                        : <Badge variant="outline" className="text-[9px] h-4 text-blue-400 border-blue-400"><Video className="h-2.5 w-2.5 mr-0.5" />Video</Badge>
                      }
                    </div>
                  </div>
                  <div className="text-center font-bold text-blue-500">{plays}</div>
                  <div className="text-center font-bold text-indigo-400">{viewers}</div>
                  <div className="text-center">
                    <span className="font-bold text-green-500">{comps}</span>
                    {viewers > 0 && <p className="text-[9px] text-muted-foreground">{compRate}%</p>}
                  </div>
                  <PctBar pct={c.avg_watch_pct !== null ? Math.round(c.avg_watch_pct) : null} />
                  <p className="text-[11px] text-muted-foreground text-right">{relTime(c.last_played)}</p>
                </div>
                {/* Mini bar */}
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 rounded-full" style={{ width: `${Math.max(barPct, 1)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Retention Tab ──────────────────────────────────────────────────────────
function RetentionTab({ onSelectEmail }: { onSelectEmail: (email: string) => void }) {
  const { data, isLoading } = useQuery<RetentionData>({
    queryKey: ["/api/admin/analytics/retention"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/retention", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
  });

  if (isLoading) return <div className="animate-pulse space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-36 bg-muted rounded" />)}</div>;
  if (!data) return null;

  const peakMax = Math.max(...(data.peakHours.map(h => parseInt(h.plays as any))), 1);
  const growthMax = Math.max(...(data.growth.map(g => parseInt(g.new_users as any))), 1);

  const formatWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatHour = (h: number) => {
    if (h === 0) return "12am";
    if (h < 12) return `${h}am`;
    if (h === 12) return "12pm";
    return `${h - 12}pm`;
  };

  return (
    <div className="space-y-6">
      {/* Summary alert row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="At-risk subscribers" value={data.atRisk.length} icon={AlertTriangle} color="text-amber-500" sub="No activity 30+ days" />
        <StatCard label="Never watched" value={data.neverActive.length} icon={UserX} color="text-red-500" sub="Subscribed, no plays" />
        <StatCard label="Power users" value={data.powerUsers.length} icon={Flame} color="text-orange-500" sub="All-time top watchers" />
        <StatCard label="Binge watchers" value={data.bingeWatchers.length} icon={Zap} color="text-yellow-500" sub="3+ plays in a day" />
      </div>

      {/* Growth chart */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />New Signups — Last 12 Weeks</CardTitle></CardHeader>
        <CardContent>
          {!data.growth.length ? (
            <p className="text-sm text-muted-foreground">No signup data yet.</p>
          ) : (
            <div className="space-y-1.5">
              {[...data.growth].reverse().map(g => {
                const total = parseInt(g.new_users as any);
                const paid = parseInt(g.paid_signups as any);
                const pct = Math.round((total / growthMax) * 100);
                return (
                  <div key={g.week} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">Wk {formatWeek(g.week)}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                    <span className="text-xs font-medium w-36 text-right shrink-0 text-muted-foreground">
                      {total} total · <span className="text-emerald-400">{paid} paid</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak hours chart */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-4 w-4" />Peak Activity Hours (last 60 days, UTC)</CardTitle></CardHeader>
        <CardContent>
          {!data.peakHours.length ? (
            <p className="text-sm text-muted-foreground">No activity data yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-28">
              {Array.from({ length: 24 }, (_, h) => {
                const row = data.peakHours.find(p => parseInt(p.hour as any) === h);
                const plays = row ? parseInt(row.plays as any) : 0;
                const heightPct = Math.round((plays / peakMax) * 100);
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div
                      className="w-full bg-blue-500/60 rounded-t hover:bg-blue-500 transition-colors"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                    {h % 3 === 0 && (
                      <span className="text-[9px] text-muted-foreground leading-none mt-0.5">{formatHour(h)}</span>
                    )}
                    {/* tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-popover border rounded px-1.5 py-1 text-[10px] shadow whitespace-nowrap z-10 flex-col items-center">
                      <span className="font-semibold">{formatHour(h)}</span>
                      <span>{plays} plays</span>
                      <span className="text-muted-foreground">{row ? parseInt(row.unique_users as any) : 0} users</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-risk subscribers */}
        <Card className="border-amber-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-500"><AlertTriangle className="h-4 w-4" />At-Risk Subscribers</CardTitle></CardHeader>
          <CardContent>
            {!data.atRisk.length ? (
              <p className="text-sm text-muted-foreground">No at-risk subscribers — great!</p>
            ) : (
              <div className="space-y-2">
                {data.atRisk.map(u => (
                  <div key={u.email} className="flex items-center justify-between gap-2 hover:bg-muted/50 rounded p-1.5 -mx-1.5 cursor-pointer" onClick={() => onSelectEmail(u.email)}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.family_name || u.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-amber-500 font-medium">{u.last_activity ? relTime(u.last_activity) : "never active"}</p>
                      <Badge variant="outline" className={`text-[9px] h-4 ${statColor(u.subscription_status)} border-current`}>{u.subscription_status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Never active */}
        <Card className="border-red-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-red-500"><UserX className="h-4 w-4" />Subscribed But Never Watched</CardTitle></CardHeader>
          <CardContent>
            {!data.neverActive.length ? (
              <p className="text-sm text-muted-foreground">Everyone has watched something!</p>
            ) : (
              <div className="space-y-2">
                {data.neverActive.map(u => (
                  <div key={u.email} className="flex items-center justify-between gap-2 hover:bg-muted/50 rounded p-1.5 -mx-1.5 cursor-pointer" onClick={() => onSelectEmail(u.email)}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.family_name || u.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Joined {relTime(u.created_at)}</p>
                      <Badge variant="outline" className={`text-[9px] h-4 ${statColor(u.subscription_status)} border-current`}>{u.subscription_status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Power users */}
        <Card className="border-orange-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-orange-500"><Flame className="h-4 w-4" />Power Users — All Time</CardTitle></CardHeader>
          <CardContent>
            {!data.powerUsers.length ? (
              <p className="text-sm text-muted-foreground">No activity tracked yet.</p>
            ) : (
              <div className="space-y-2">
                {data.powerUsers.map((u, i) => (
                  <div key={u.user_email} className="flex items-center gap-3 hover:bg-muted/50 rounded p-1.5 -mx-1.5 cursor-pointer" onClick={() => onSelectEmail(u.user_email)}>
                    <span className="text-xs text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.family_name || u.user_email}</p>
                      <p className="text-xs text-muted-foreground">{parseInt(u.video_plays as any)} videos · {parseInt(u.audio_plays as any)} audio · {parseInt(u.completions as any)} finished</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-orange-500">{parseInt(u.total_plays as any)}</span>
                      <p className="text-[10px] text-muted-foreground">total plays</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Binge watchers */}
        <Card className="border-yellow-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-500"><Zap className="h-4 w-4" />Binge Watchers</CardTitle></CardHeader>
          <CardContent>
            {!data.bingeWatchers.length ? (
              <p className="text-sm text-muted-foreground">No binge sessions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {data.bingeWatchers.map(u => (
                  <div key={u.user_email} className="flex items-center gap-3 hover:bg-muted/50 rounded p-1.5 -mx-1.5 cursor-pointer" onClick={() => onSelectEmail(u.user_email)}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.family_name || u.user_email}</p>
                      <p className="text-xs text-muted-foreground">{parseInt(u.binge_days as any)} binge day{parseInt(u.binge_days as any) !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-yellow-500">{parseInt(u.max_day_plays as any)}</span>
                      <p className="text-[10px] text-muted-foreground">max in a day</p>
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

// ── Main Analytics Page ────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "content" | "users" | "events" | "retention">("overview");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [userSort, setUserSort] = useState<"last_active" | "video_plays" | "audio_plays">("last_active");

  const { data: legacy, isLoading: legacyLoading, refetch: refetchLegacy } = useQuery<LegacyAnalytics>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<SummaryData>({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/summary", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
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
      const params = new URLSearchParams({ limit: "300" });
      if (eventFilter !== "all") params.set("type", eventFilter);
      const res = await fetch(`/api/admin/analytics/events?${params}`, { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
  });

  const handleRefreshAll = () => { refetchLegacy(); refetchSummary(); refetchUsers(); refetchEvents(); };

  // If a user is selected, show their detail view
  if (selectedEmail) {
    return <UserDetailView email={selectedEmail} onBack={() => setSelectedEmail(null)} />;
  }

  const filteredUsers = users
    .filter(u => !search || u.user_email.toLowerCase().includes(search.toLowerCase()) || (u.family_name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (userSort === "video_plays") return parseInt(b.video_plays as any) - parseInt(a.video_plays as any);
      if (userSort === "audio_plays") return parseInt(b.audio_plays as any) - parseInt(a.audio_plays as any);
      return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
    });

  const totals = summary?.totals;
  const cs = summary?.completionStats;
  const overallCompRate = cs && parseInt(cs.total_count as any) > 0
    ? Math.round((parseInt(cs.completed_count as any) / parseInt(cs.total_count as any)) * 100)
    : null;

  const trendMax = Math.max(...(summary?.dailyTrend.map(d => parseInt(d.unique_users as any)) || [1]), 1);

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" />Refresh
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {(["overview", "content", "users", "retention", "events"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "overview" ? "Overview" : t === "content" ? "Content" : t === "users" ? `Members (${users.length})` : t === "retention" ? "Retention" : "Live Feed"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Platform-wide stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Active today" value={legacyLoading ? "—" : (legacy?.dailyActiveUsers ?? 0)} icon={Users} color="text-blue-500" />
            <StatCard label="Active this week" value={legacyLoading ? "—" : (legacy?.weeklyActiveUsers ?? 0)} icon={TrendingUp} color="text-indigo-500" />
            <StatCard label="Active this month" value={legacyLoading ? "—" : (legacy?.monthlyActiveUsers ?? 0)} icon={Calendar} color="text-violet-500" />
            <StatCard label="Total video plays" value={summaryLoading ? "—" : (totals?.total_video_plays ?? 0)} icon={Play} color="text-blue-400" />
            <StatCard label="Total audio plays" value={summaryLoading ? "—" : (totals?.total_audio_plays ?? 0)} icon={Music} color="text-purple-400" />
            <StatCard label="Total completions" value={summaryLoading ? "—" : (totals?.total_completions ?? 0)} icon={CheckCircle2} color="text-green-500" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total logins" value={summaryLoading ? "—" : (totals?.total_logins ?? 0)} icon={LogIn} color="text-emerald-500" />
            <StatCard label="Tracked members" value={summaryLoading ? "—" : (totals?.total_tracked_users ?? 0)} icon={Users} color="text-cyan-500" />
            <StatCard label="Overall completion rate" value={overallCompRate !== null ? `${overallCompRate}%` : "—"} icon={Percent} color="text-amber-500" sub="of started sessions" />
            <StatCard label="Avg % watched" value={cs?.avg_watch_pct != null ? `${Math.round(cs.avg_watch_pct as any)}%` : "—"} icon={BarChart3} color="text-orange-500" sub="across all content" />
          </div>

          {/* Subscription breakdown */}
          {summary?.subscriptionBreakdown && summary.subscriptionBreakdown.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />Subscription Status Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {summary.subscriptionBreakdown.map(sb => (
                    <div key={sb.subscription_status} className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${statColor(sb.subscription_status)}`}>{sb.count}</span>
                      <span className="text-sm text-muted-foreground capitalize">{sb.subscription_status || "unknown"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 30-day daily trend */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />Daily Activity — Last 30 Days</CardTitle></CardHeader>
            <CardContent>
              {!summary?.dailyTrend.length ? (
                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {[...summary.dailyTrend].reverse().map((day) => {
                    const usersCount = parseInt(day.unique_users as any);
                    const plays = parseInt(day.video_plays as any) + parseInt(day.audio_plays as any);
                    const comps = parseInt(day.completions as any);
                    const pct = Math.round((usersCount / trendMax) * 100);
                    return (
                      <div key={day.day} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-28 shrink-0">{formatDay(day.day)}</span>
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                        </div>
                        <span className="text-xs font-medium w-52 text-right shrink-0">
                          {usersCount} {usersCount === 1 ? "user" : "users"} · {plays} plays · {comps} finished
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most active members */}
            <Card>
              <CardHeader><CardTitle className="text-base">Most Active Members (30 days)</CardTitle></CardHeader>
              <CardContent>
                {!legacy?.topUsers.length ? (
                  <p className="text-muted-foreground text-sm">No activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {legacy.topUsers.map((u) => (
                      <div key={u.email} className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 rounded p-1.5 -mx-1.5" onClick={() => setSelectedEmail(u.email)}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.family_name || u.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          <p className="text-xs text-muted-foreground">Last active: {relTime(u.last_active)}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="text-lg font-bold text-blue-500">{u.videos_watched}</span>
                          <p className="text-xs text-muted-foreground">videos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most popular content */}
            <Card>
              <CardHeader><CardTitle className="text-base">Most Popular Content (30 days)</CardTitle></CardHeader>
              <CardContent>
                {!legacy?.topVideos.length ? (
                  <p className="text-muted-foreground text-sm">No views recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {legacy.topVideos.map((v, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <p className="text-sm truncate min-w-0">{v.title}</p>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-indigo-500">{v.unique_viewers}</span>
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

      {/* ── CONTENT TAB ── */}
      {tab === "content" && <ContentTab />}

      {/* ── RETENTION TAB ── */}
      {tab === "retention" && <RetentionTab onSelectEmail={setSelectedEmail} />}

      {/* ── MEMBERS TAB ── */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by email or name…" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={userSort} onValueChange={v => setUserSort(v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="last_active">Sort: Last active</SelectItem>
                <SelectItem value="video_plays">Sort: Most videos</SelectItem>
                <SelectItem value="audio_plays">Sort: Most audio</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{filteredUsers.length} member{filteredUsers.length !== 1 ? "s" : ""}</p>
          </div>

          {usersLoading ? (
            <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded" />)}</div>
          ) : !filteredUsers.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "No members match that search." : "No activity tracked yet."}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_70px_70px_80px_90px] gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
                <span>Member</span>
                <span className="text-center">Videos</span>
                <span className="text-center">Audio</span>
                <span className="text-center">Unique content</span>
                <span className="text-right">Last active</span>
              </div>
              {filteredUsers.map(u => (
                <div
                  key={u.user_email}
                  className="grid grid-cols-[1fr_70px_70px_80px_90px] gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEmail(u.user_email)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.family_name || u.user_email}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.user_email}</p>
                    {u.subscription_status && (
                      <Badge variant="outline" className={`text-[9px] h-4 mt-0.5 ${statColor(u.subscription_status)} border-current`}>
                        {u.subscription_status}
                      </Badge>
                    )}
                  </div>
                  <div className="text-center"><span className="text-sm font-bold text-blue-500">{u.video_plays}</span></div>
                  <div className="text-center"><span className="text-sm font-bold text-purple-500">{u.audio_plays}</span></div>
                  <div className="text-center"><span className="text-sm font-bold text-indigo-400">{u.unique_videos}</span></div>
                  <div className="text-right"><span className="text-xs text-muted-foreground">{relTime(u.last_active)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LIVE FEED TAB ── */}
      {tab === "events" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="video_play">Video plays</SelectItem>
                <SelectItem value="audio_play">Audio plays</SelectItem>
                <SelectItem value="video_complete">Completions</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="video_save">Saves</SelectItem>
                <SelectItem value="video_like">Likes</SelectItem>
                <SelectItem value="page_view">Page views</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetchEvents()} className="gap-1"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
            <p className="text-sm text-muted-foreground">{events.length} events</p>
          </div>

          {eventsLoading ? (
            <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded" />)}</div>
          ) : !events.length ? (
            <div className="text-center py-12 text-muted-foreground">No events found.</div>
          ) : (
            <div className="space-y-0.5">
              {events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/40 text-sm">
                  <EventIcon type={ev.event_type} />
                  <div className="min-w-0 flex-1">
                    <span
                      className="font-medium text-blue-400 hover:underline cursor-pointer"
                      onClick={() => setSelectedEmail(ev.user_email)}
                    >
                      {ev.family_name || ev.user_email}
                    </span>
                    <span className="text-muted-foreground"> {EVENT_LABELS[ev.event_type]?.label?.toLowerCase() || ev.event_type}</span>
                    {ev.resource_title && <span className="text-muted-foreground"> — <span className="text-foreground">{ev.resource_title}</span></span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{relTime(ev.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
