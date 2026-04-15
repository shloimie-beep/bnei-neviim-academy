import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, CreditCard, Settings, LogOut, Plus, Trash2, Loader2, Clock, CheckCircle, AlertCircle, XCircle, Video, Play, Pause, FileVideo, Volume2, VolumeX, Maximize, Minimize, Edit2, Music, FileText, ExternalLink, Lock, ChevronLeft, ChevronRight, Disc, SkipBack, SkipForward, TrendingUp, Eye, EyeOff, Star, MonitorPlay, MessageSquare, Send, Heart, ThumbsUp, Bell, BellDot, History, Shield, ShieldCheck, ShieldAlert, TimerReset, User, Shuffle, X, Smile, Sparkles, ArrowRight, Search, CheckCheck, BookmarkPlus, BookmarkCheck, WifiOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTrackEvent, trackEvent } from "@/hooks/use-track-event";
import { useAuth, getAuthHeaders, getStoredAuthToken } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocumentViewer } from "@/components/document-viewer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef, useMemo, useEffect, createContext, useContext } from "react";
import type { PhoneNumber, Video as VideoType, VideoCategory, Document, Album, AlbumTrack } from "@shared/schema";

const countryCodes = [
  { code: "+1", country: "USA/Canada" },
  { code: "+972", country: "Israel" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+27", country: "South Africa" },
  { code: "+52", country: "Mexico" },
  { code: "+55", country: "Brazil" },
  { code: "+91", country: "India" },
];

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

function CommentsSection({ videoId }: { videoId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = (user as any)?.role === "admin";
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  type CommentWithUser = {
    id: string;
    videoId: string;
    userId: string;
    text: string;
    parentId: string | null;
    isAdminReply: boolean | null;
    createdAt: string | null;
    userEmail: string;
    familyName: string | null;
  };

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/videos", videoId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  const postMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) =>
      apiRequest("POST", `/api/videos/${videoId}/comments`, { text, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", videoId, "comments"] });
      setNewComment("");
      setReplyTo(null);
      setReplyText("");
    },
    onError: () => toast({ title: "Failed to post comment", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/videos", videoId, "comments"] }),
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (id: string) => comments.filter(c => c.parentId === id);

  const formatTime = (d: string | null) => {
    if (!d) return "";
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-4 border-t">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comments {topLevel.length > 0 ? `(${topLevel.length})` : ""}
      </h4>

      <div className="mb-4 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="text-sm resize-none"
          rows={2}
          data-testid="input-new-comment"
        />
        <Button
          size="sm"
          onClick={() => postMutation.mutate({ text: newComment })}
          disabled={!newComment.trim() || postMutation.isPending}
          data-testid="button-submit-comment"
        >
          {postMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
          Post Comment
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {topLevel.map(comment => (
            <div key={comment.id}>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">{comment.familyName || comment.userEmail}</span>
                    <span className="text-xs text-muted-foreground ml-2">{formatTime(comment.createdAt)}</span>
                    <p className="text-sm mt-1 break-words">{comment.text}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        data-testid={`button-reply-${comment.id}`}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(comment.id)}
                        data-testid={`button-delete-comment-${comment.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {getReplies(comment.id).map(reply => (
                <div key={reply.id} className="ml-6 mt-1 bg-primary/5 border-l-2 border-primary rounded-r-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-primary">Rabbi Eli</span>
                      <span className="text-xs text-muted-foreground ml-2">{formatTime(reply.createdAt)}</span>
                      <p className="text-sm mt-1 break-words">{reply.text}</p>
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive shrink-0"
                        onClick={() => deleteMutation.mutate(reply.id)}
                        data-testid={`button-delete-reply-${reply.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {isAdmin && replyTo === comment.id && (
                <div className="ml-6 mt-2 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="text-sm resize-none"
                    rows={2}
                    data-testid={`input-reply-${comment.id}`}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => postMutation.mutate({ text: replyText, parentId: comment.id })}
                      disabled={!replyText.trim() || postMutation.isPending}
                      data-testid={`button-submit-reply-${comment.id}`}
                    >
                      {postMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      Post Reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyTo(null); setReplyText(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoEmbedPlayer({ video }: { video: VideoType }) {
  const { toast } = useToast();
  const [currentVideo, setCurrentVideo] = useState<any>(video);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Vimeo postMessage state
  const [vimeoDuration, setVimeoDuration] = useState(0);
  const [vimeoCurrentTime, setVimeoCurrentTime] = useState(0);
  const [showPauseNudge, setShowPauseNudge] = useState(false);
  const [showWhatNext, setShowWhatNext] = useState(false);
  const whatNextShownRef = useRef(false);
  const pauseNudgeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Progress tracking refs ──────────────────────────────────────────────────
  const currentTimeRef = useRef(0);
  const durationRef2 = useRef(0); // mirrors vimeoDurationRef for save callback
  const saveIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const isPlayingRef = useRef(false);
  const resumeAppliedRef = useRef(false);

  // Fetch saved progress for this video
  const { data: savedProgress } = useQuery<{ position_seconds: number; duration_seconds: number; completed: boolean } | null>({
    queryKey: ["/api/videos", currentVideo.id, "progress"],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${currentVideo.id}/progress`, { credentials: "include", headers: getAuthHeaders() });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 0,
  });
  // Keep a ref so event handlers always see the latest savedProgress without stale closure
  const savedProgressRef = useRef(savedProgress);
  useEffect(() => {
    savedProgressRef.current = savedProgress;
    // If player already ready but resume not yet applied (data loaded late), apply now
    if (!resumeAppliedRef.current && vimeoReadyRef.current && savedProgress && !savedProgress.completed && savedProgress.position_seconds > 10) {
      resumeAppliedRef.current = true;
      setTimeout(() => sendVimeo('setCurrentTime', savedProgress.position_seconds), 400);
    }
  }, [savedProgress]);

  const saveProgress = (completed = false) => {
    const pos = currentTimeRef.current;
    const dur = durationRef2.current;
    if (dur < 5 || pos < 3) return;
    fetch(`/api/videos/${currentVideo.id}/progress`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ positionSeconds: Math.round(pos), durationSeconds: Math.round(dur), completed }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/continue-watching"] });
    }).catch(() => {});
  };

  const vimeoVideoId = currentVideo.vimeoVideoId || currentVideo.vimeo_video_id;
  const storedEmbedUrl = currentVideo.vimeoEmbedUrl || currentVideo.vimeo_embed_url;

  // Include api=1&player_id=vimeo1 so Vimeo postMessage API works
  const VIMEO_PLAYER_ID = 'vimeo1';
  const embedUrl = (() => {
    const extra = `autoplay=1&api=1&player_id=${VIMEO_PLAYER_ID}`;
    if (storedEmbedUrl) {
      return storedEmbedUrl.includes('?') ? `${storedEmbedUrl}&${extra}` : `${storedEmbedUrl}?${extra}`;
    }
    return `https://player.vimeo.com/video/${vimeoVideoId}?${extra}&title=0&byline=0&portrait=0`;
  })();

  // Vimeo postMessage API: send command to iframe
  const sendVimeo = (method: string, value?: any) => {
    if (!iframeRef.current?.contentWindow) return;
    const msg: any = { method };
    if (value !== undefined) msg.value = value;
    iframeRef.current.contentWindow.postMessage(JSON.stringify(msg), 'https://player.vimeo.com');
  };

  // pending seek: stores the fraction (0-1) to jump to once duration is known
  const pendingSkipRef = useRef<number | null>(null);
  // track if Vimeo player is ready to receive commands
  const vimeoReadyRef = useRef(false);
  // store duration in a ref too so message handler always reads latest value
  const vimeoDurationRef = useRef(0);

  const registerVimeoListeners = () => {
    sendVimeo('addEventListener', 'pause');
    sendVimeo('addEventListener', 'play');
    sendVimeo('addEventListener', 'timeupdate');
    sendVimeo('addEventListener', 'ended');
    sendVimeo('getDuration');
  };

  // onLoad fires when the iframe HTML loads; Vimeo will then fire "ready" via postMessage
  const handleIframeLoad = () => {
    // Fallback: try registering immediately AND wait for ready message
    // (some Vimeo embeds fire ready before onLoad completes)
    vimeoReadyRef.current = false;
    setTimeout(() => {
      if (!vimeoReadyRef.current) registerVimeoListeners();
    }, 800);
  };

  // Reset engagement state when video changes
  useEffect(() => {
    setShowPauseNudge(false);
    setShowWhatNext(false);
    whatNextShownRef.current = false;
    vimeoReadyRef.current = false;
    pendingSkipRef.current = null;
    setVimeoDuration(0);
    setVimeoCurrentTime(0);
    vimeoDurationRef.current = 0;
    currentTimeRef.current = 0;
    durationRef2.current = 0;
    isPlayingRef.current = false;
    resumeAppliedRef.current = false;
    clearTimeout(pauseNudgeTimerRef.current);
    clearInterval(saveIntervalRef.current);
  }, [currentVideo.id]);

  // Listen to Vimeo messages
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      // Only handle messages from Vimeo
      if (typeof e.origin === 'string' && e.origin !== 'https://player.vimeo.com') return;
      let data: any;
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!data || typeof data !== 'object') return;
      // Filter to our player only (player_id check)
      if (data.player_id && data.player_id !== VIMEO_PLAYER_ID) return;

      // Vimeo fires {event:"ready"} when player is initialized — register listeners then
      if (data.event === 'ready') {
        vimeoReadyRef.current = true;
        registerVimeoListeners();
        // Resume from saved position (if >10s into video and not completed)
        if (!resumeAppliedRef.current) {
          resumeAppliedRef.current = true;
          const saved = savedProgressRef.current;
          if (saved && !saved.completed && saved.position_seconds > 10) {
            setTimeout(() => {
              sendVimeo('setCurrentTime', saved.position_seconds);
            }, 600);
          }
        }
        return;
      }

      // Response to getDuration: {method:"getDuration", value: N}
      if (data.method === 'getDuration' && typeof data.value === 'number' && data.value > 0) {
        setVimeoDuration(data.value);
        vimeoDurationRef.current = data.value;
        durationRef2.current = data.value;
        if (pendingSkipRef.current !== null) {
          const frac = pendingSkipRef.current;
          pendingSkipRef.current = null;
          sendVimeo('setCurrentTime', data.value * frac);
          sendVimeo('play');
        }
        return;
      }

      if (data.event === 'pause') {
        const ct = data.data?.seconds ?? 0;
        const dur = data.data?.duration ?? vimeoDurationRef.current;
        isPlayingRef.current = false;
        clearInterval(saveIntervalRef.current);
        // Save position on pause
        if (ct > 3) { currentTimeRef.current = ct; }
        if (dur > 0) { durationRef2.current = dur; }
        saveProgress(false);
        if (dur > 0 && ct > 8 && ct < dur - 8) {
          clearTimeout(pauseNudgeTimerRef.current);
          pauseNudgeTimerRef.current = setTimeout(() => setShowPauseNudge(true), 1200);
        }
      }
      if (data.event === 'play') {
        clearTimeout(pauseNudgeTimerRef.current);
        setShowPauseNudge(false);
        isPlayingRef.current = true;
        // Auto-save every 15 seconds while playing
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = setInterval(() => {
          if (isPlayingRef.current) saveProgress(false);
        }, 15000);
      }
      if (data.event === 'timeupdate') {
        const ct = data.data?.seconds ?? 0;
        const dur = data.data?.duration ?? 0;
        setVimeoCurrentTime(ct);
        currentTimeRef.current = ct;
        if (dur > 0) { setVimeoDuration(dur); vimeoDurationRef.current = dur; durationRef2.current = dur; }
        if (!whatNextShownRef.current && dur > 30 && ct / dur > 0.35 && ct / dur < 0.38) {
          whatNextShownRef.current = true;
          setShowWhatNext(true);
          sendVimeo('pause');
        }
      }
      if (data.event === 'ended') {
        setShowPauseNudge(false);
        setShowWhatNext(false);
        isPlayingRef.current = false;
        clearInterval(saveIntervalRef.current);
        // Mark as completed
        saveProgress(true);
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
      clearTimeout(pauseNudgeTimerRef.current);
      clearInterval(saveIntervalRef.current);
      // Save position on dialog close if mid-video
      saveProgress(false);
    };
  }, [currentVideo.id, savedProgress]);

  const doSkip = (fraction: number) => {
    const dur = vimeoDurationRef.current;
    if (dur > 0) {
      sendVimeo('setCurrentTime', dur * fraction);
      sendVimeo('play');
    } else {
      // duration not yet known — store pending and request it
      pendingSkipRef.current = fraction;
      sendVimeo('getDuration');
    }
  };

  const handleSkipToCraziestPart = () => doSkip(0.72);

  const handleKeepWatching = () => {
    setShowPauseNudge(false);
    sendVimeo('play');
  };

  const handleWhatNextContinue = () => {
    setShowWhatNext(false);
    sendVimeo('play');
  };

  useEffect(() => {
    fetch(`/api/videos/${currentVideo.id}/view`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
    }).catch(() => {});
  }, [currentVideo.id]);

  // Likes
  const { data: userLikes = [] } = useQuery<string[]>({
    queryKey: ["/api/user/likes"],
  });
  const isLiked = userLikes.includes(currentVideo.id);

  const { data: likeCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/videos", currentVideo.id, "like-count"],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${currentVideo.id}/like-count`, { credentials: "include", headers: getAuthHeaders() });
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${currentVideo.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/likes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos", currentVideo.id, "like-count"] });
    },
    onError: () => toast({ title: "Failed to update like", variant: "destructive" }),
  });

  // Favorites
  const { data: userFavorites = [] } = useQuery<string[]>({
    queryKey: ["/api/user/favorites"],
  });
  const isFavorited = userFavorites.includes(currentVideo.id);

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${currentVideo.id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
    onError: () => toast({ title: "Failed to update favorite", variant: "destructive" }),
  });

  // Related videos
  const { data: relatedVideos = [], isLoading: relatedLoading } = useQuery<any[]>({
    queryKey: ["/api/videos", currentVideo.id, "related"],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${currentVideo.id}/related`, { credentials: "include", headers: getAuthHeaders() });
      return res.json();
    },
  });

  const playRelated = (rv: any) => {
    setCurrentVideo({
      id: rv.id,
      title: rv.title,
      description: rv.description || null,
      vimeoVideoId: rv.vimeo_video_id,
      vimeo_video_id: rv.vimeo_video_id,
      bunnyVideoId: rv.bunny_video_id,
      bunny_video_id: rv.bunny_video_id,
      thumbnailPath: rv.thumbnail_path,
      thumbnail_path: rv.thumbnail_path,
      categoryId: rv.category_id,
      category_id: rv.category_id,
      vimeoEmbedUrl: rv.vimeo_embed_url || null,
      vimeo_embed_url: rv.vimeo_embed_url || null,
      createdAt: rv.created_at,
    });
  };

  const watchNextVideos = relatedVideos.slice(0, 3);

  return (
    <DialogContent className="max-w-4xl p-0 overflow-y-auto max-h-[90vh]">
      <div className="relative bg-black">
        <iframe
          key={currentVideo.id}
          ref={iframeRef}
          src={embedUrl}
          className="w-full aspect-video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          data-testid={`video-player-${currentVideo.id}`}
        />

        {/* Pause Nudge Overlay */}
        {showPauseNudge && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 animate-in fade-in duration-300">
            <div className="rounded-2xl px-6 py-6 text-center max-w-[260px] shadow-2xl border border-[#EDE518]/20"
              style={{ background: "linear-gradient(145deg, #0b1829 0%, #0d2040 100%)" }}>
              <div className="text-5xl mb-3">⏸️</div>
              <h3 className="text-white font-black text-lg leading-tight">Don't stop now!</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">You're so close to the best part! 👀</p>
              <button
                onClick={handleKeepWatching}
                className="mt-4 w-full py-2.5 rounded-xl font-black text-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_18px_rgba(237,229,24,0.4)]"
                style={{ background: "linear-gradient(135deg, #EDE518 0%, #f5c800 100%)" }}
                data-testid="button-keep-watching"
              >
                ▶ Keep Watching
              </button>
            </div>
          </div>
        )}

        {/* What Happens Next Overlay */}
        {showWhatNext && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 animate-in fade-in duration-300">
            <div className="rounded-2xl px-6 py-6 text-center max-w-[280px] shadow-2xl border border-[#08779C]/30"
              style={{ background: "linear-gradient(145deg, #060e1a 0%, #0a1a30 100%)" }}>
              <div className="text-5xl mb-3">🤔</div>
              <h3 className="text-white font-black text-lg leading-tight">What happens next?</h3>
              <p className="text-slate-400 text-sm mt-2">This is where it gets really good...</p>
              <div className="space-y-2 mt-4 text-left">
                {[
                  { emoji: "🤯", text: "Something totally unexpected!" },
                  { emoji: "😊", text: "Everything works out great" },
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={handleWhatNextContinue}
                    className="w-full px-4 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-3 border border-white/10 hover:border-[#08779C]/40 transition-colors active:scale-[0.98]"
                    style={{ background: i === 0 ? "rgba(8,119,156,0.2)" : "rgba(237,229,24,0.08)" }}
                  >
                    <span className="text-xl">{opt.emoji}</span> {opt.text}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowWhatNext(false); sendVimeo('play'); }} className="text-slate-600 hover:text-slate-400 text-xs mt-3 underline transition-colors">
                Skip
              </button>
            </div>
          </div>
        )}
      </div>


      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
            {currentVideo.description && (
              <p className="text-sm text-muted-foreground mt-1">{currentVideo.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`gap-1.5 ${isLiked ? "text-[#08779C]" : "text-muted-foreground hover:text-[#08779C]"}`}
              data-testid={`button-like-${currentVideo.id}`}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{likeCountData?.count ?? 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              className={`gap-1.5 ${isFavorited ? "text-[#EDE518]" : "text-muted-foreground hover:text-[#EDE518]"}`}
              data-testid={`button-favorite-${currentVideo.id}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              <span className="text-xs">{isFavorited ? "Saved" : "Save"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Watch Next — always shown for every video */}
      <div className="bg-[#060e1a]">
        <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[#EDE518]/20">
          <Play className="h-3.5 w-3.5 text-[#EDE518] fill-[#EDE518]" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#EDE518]">Watch Next</span>
        </div>
        <div className="grid grid-cols-3 gap-2 px-3 py-3">
          {relatedLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="rounded-xl overflow-hidden aspect-video bg-white/5 animate-pulse" />
            ))
          ) : watchNextVideos.length > 0 ? (
            watchNextVideos.map((rv: any) => (
              <button
                key={rv.id}
                onClick={() => playRelated(rv)}
                className="group relative rounded-xl overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-[#EDE518]"
                data-testid={`button-watch-next-${rv.id}`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  {rv.thumbnail_path ? (
                    <img
                      src={`/api/videos/${rv.id}/thumbnail`}
                      alt={rv.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0d1a35] flex items-center justify-center">
                      <Play className="h-6 w-6 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-full p-2.5 transition-all duration-200 group-hover:scale-110"
                      style={{ background: "rgba(237,229,24,0.15)", border: "1.5px solid rgba(237,229,24,0.4)" }}
                    >
                      <Play className="h-5 w-5 text-[#EDE518] fill-[#EDE518]" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{rv.title}</p>
                    <p className="text-[#EDE518] text-[10px] font-bold mt-0.5">Tap to watch</p>
                  </div>
                </div>
              </button>
            ))
          ) : null}
        </div>
      </div>

      <CommentsSection videoId={currentVideo.id} />
      <div className="h-4" />
    </DialogContent>
  );
}

function LegacyVideoPlayer({ video, onClose, onMinimize }: { video: VideoType; onClose: () => void; onMinimize?: (streamUrl: string, currentTime: number, isAudio: boolean) => void }) {
  const [currentVideo, setCurrentVideo] = useState<any>(video);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const trackEv = useTrackEvent();
  // Live refs for progress saving (avoid stale closure)
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const isEndedRef = useRef(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(() => parseFloat(localStorage.getItem("pref_defaultSpeed") || "1"));
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [thumbnailCacheBust] = useState(() => Date.now());
  const [isEnded, setIsEnded] = useState(false);
  const [guessState, setGuessState] = useState<'hidden' | 'asking' | 'answered'>('hidden');
  const [guessChoice, setGuessChoice] = useState<string | null>(null);
  const [guessTriggeredAt, setGuessTriggeredAt] = useState(0);

  // Related items for Listen/Watch Next
  const { data: relatedItems = [] } = useQuery<any[]>({
    queryKey: ["/api/videos", currentVideo.id, "related"],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${currentVideo.id}/related`, { credentials: "include", headers: getAuthHeaders() });
      return res.json();
    },
  });
  const nextItems = relatedItems.slice(0, 3);
  const isAudioMedia = currentVideo.mediaType === "audio" || currentVideo.media_type === "audio";

  const playNext = (rv: any) => {
    setCurrentVideo({
      id: rv.id,
      title: rv.title,
      description: rv.description || null,
      mediaType: rv.media_type || rv.mediaType || "audio",
      media_type: rv.media_type || rv.mediaType || "audio",
      thumbnailPath: rv.thumbnail_path,
      thumbnail_path: rv.thumbnail_path,
      categoryId: rv.category_id,
      category_id: rv.category_id,
    });
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  useEffect(() => {
    setStreamUrl(null);
    setStreamLoading(true);
    setStreamError(null);

    const loadStream = async () => {
      fetch(`/api/videos/${currentVideo.id}/stream?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
        headers: getAuthHeaders(),
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to load");
          const contentType = res.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            return res.json().then(data => {
              if (data.localAudio && data.streamUrl) {
                const token = getStoredAuthToken();
                const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
                setStreamUrl(`${data.streamUrl}${tokenParam}`);
              } else if (data.cdnUrl) {
                setStreamUrl(data.cdnUrl);
              } else if (data.embedUrl) {
                setStreamUrl(data.embedUrl);
              } else {
                setStreamError("Media not available");
              }
              setStreamLoading(false);
            });
          } else {
            const legacyToken = getStoredAuthToken();
            const legacyTokenParam = legacyToken ? `&token=${encodeURIComponent(legacyToken)}` : "";
            setStreamUrl(`/api/videos/${currentVideo.id}/stream?t=${Date.now()}${legacyTokenParam}`);
            setStreamLoading(false);
          }
        })
        .catch(() => {
          setStreamError("Failed to load video");
          setStreamLoading(false);
        });
    };

    loadStream();
  }, [currentVideo.id]);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      const d = videoRef.current.duration || 0;
      setCurrentTime(t);
      currentTimeRef.current = t;
      durationRef.current = d;
      if (d > 0) {
        _liveVideoProgress.videoId = currentVideo.id;
        _liveVideoProgress.pct = t / d;
        // Guess the Ending — trigger once per video at ~70% for non-audio, one-time-ever
        const pct = t / d;
        if (!isAudioMedia && pct >= 0.68 && pct < 0.73 && guessState === 'hidden' && guessTriggeredAt === 0) {
          try {
            const shown = localStorage.getItem("guess_ending_shown");
            if (!shown) {
              setGuessState('asking');
              setGuessTriggeredAt(t);
              videoRef.current.pause();
            }
          } catch {}
        }
      }
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      durationRef.current = d;
    }
  };

  // Reset refs when video changes so we don't save stale position for new video
  useEffect(() => {
    currentTimeRef.current = 0;
    durationRef.current = 0;
    isEndedRef.current = false;
  }, [currentVideo.id]);

  // Save progress to server every 10 seconds while playing, and on unmount
  useEffect(() => {
    const vid = currentVideo.id;
    const save = (forceComplete?: boolean) => {
      const pos = currentTimeRef.current;
      const dur = durationRef.current;
      if (pos < 3 || dur <= 0) return;
      const completed = forceComplete || isEndedRef.current || (pos / dur >= 0.95);
      apiRequest("POST", `/api/videos/${vid}/progress`, {
        positionSeconds: Math.round(pos),
        durationSeconds: Math.round(dur),
        completed,
      }).catch(() => {});
    };
    const interval = setInterval(() => save(), 10000);
    return () => {
      clearInterval(interval);
      // On unmount save final position (unless already saved as complete by handleEnded)
      if (!isEndedRef.current) save();
    };
  }, [currentVideo.id]);

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    isEndedRef.current = true;
    // Save completion immediately
    const pos = currentTimeRef.current;
    const dur = durationRef.current;
    if (dur > 0) {
      apiRequest("POST", `/api/videos/${currentVideo.id}/progress`, {
        positionSeconds: Math.round(dur),
        durationSeconds: Math.round(dur),
        completed: true,
      }).catch(() => {});
      // Fire analytics event for video completion
      trackEv({ eventType: "video_complete", resourceId: currentVideo.id, resourceTitle: currentVideo.title, resourceType: isAudioMedia ? "audio" : "video" });
    }
  };

  const handleReplayBestMoment = () => {
    if (videoRef.current && duration > 0) {
      // "Best moment" = around 20-30% in (typically the hook/punchline setup)
      const replayAt = duration * 0.2;
      videoRef.current.currentTime = replayAt;
      videoRef.current.play().catch(() => {});
      setIsEnded(false);
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const vol = value[0];
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  const isAudio = isAudioMedia;

  if (streamLoading) {
    return (
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
        </div>
      </DialogContent>
    );
  }

  if (streamError || !streamUrl) {
    return (
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          <p className="text-white">{streamError || "Media not available"}</p>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl p-0 overflow-y-auto max-h-[90vh]">
      <div 
        className="relative bg-black group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {isAudio ? (
          <div className="w-full aspect-video flex items-center justify-center bg-black">
            <audio
              key={currentVideo.id}
              ref={videoRef as React.RefObject<HTMLAudioElement>}
              src={streamUrl}
              autoPlay
              preload="auto"
              className="hidden"
              onPlay={() => { setIsPlaying(true); setIsEnded(false); }}
              onPause={() => setIsPlaying(false)}
              onEnded={handleEnded}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              data-testid={`audio-player-${currentVideo.id}`}
            />
            {currentVideo.thumbnailPath ? (
              <img 
                src={`/api/videos/${currentVideo.id}/thumbnail?v=${thumbnailCacheBust}`}
                alt={currentVideo.title}
                className="max-h-[50%] max-w-[50%] object-contain rounded-lg"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-muted/20 flex items-center justify-center">
                <Music className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={streamUrl}
            autoPlay
            preload="auto"
            loop={localStorage.getItem("pref_loopVideo") === "true"}
            className="w-full aspect-video"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onPlay={() => { setIsPlaying(true); setIsEnded(false); }}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            data-testid={`video-player-${currentVideo.id}`}
          />
        )}
        
        <div 
          className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={handlePlayPause}
        >
          {!isPlaying && !isEnded && (
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          )}
        </div>

        {/* ── Guess the Ending overlay ───────────────────────────────── */}
        {guessState !== 'hidden' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-in fade-in duration-400"
            style={{ background: "rgba(4, 10, 24, 0.93)", backdropFilter: "blur(4px)" }}>
            {guessState === 'asking' && (
              <div className="flex flex-col items-center gap-4 px-6 text-center max-w-sm">
                <div className="text-5xl animate-bounce">🤔</div>
                <h2 className="text-white font-black text-2xl leading-tight">
                  Guess the Ending!
                </h2>
                <p className="text-slate-300 text-sm">What do you think happens next?</p>
                <div className="flex flex-col gap-3 w-full mt-2">
                  {[
                    { id: "A", label: "Something totally unexpected happens! 🤯", color: "#08779C" },
                    { id: "B", label: "Everyone lives happily ever after 😊", color: "#EDE518" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setGuessChoice(opt.id);
                        setGuessState('answered');
                        try { localStorage.setItem("guess_ending_shown", "1"); } catch {}
                      }}
                      className="w-full px-5 py-3.5 rounded-2xl font-bold text-sm text-left flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform border border-white/10"
                      style={{ background: opt.color === "#EDE518" ? "rgba(237,229,24,0.12)" : "rgba(8,119,156,0.15)", color: "white" }}
                    >
                      <span className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-black text-sm"
                        style={{ background: opt.color, color: opt.color === "#EDE518" ? "#000" : "#fff" }}
                      >{opt.id}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => {
                  setGuessState('hidden');
                  try { localStorage.setItem("guess_ending_shown", "1"); } catch {}
                  if (videoRef.current) videoRef.current.play().catch(() => {});
                }} className="text-slate-600 hover:text-slate-400 text-xs mt-1 underline transition-colors">
                  Skip
                </button>
              </div>
            )}
            {guessState === 'answered' && (
              <div className="flex flex-col items-center gap-4 px-6 text-center max-w-sm animate-in fade-in duration-300">
                <div className="text-5xl">🎬</div>
                <h2 className="text-white font-black text-xl">You picked {guessChoice}!</h2>
                <p className="text-slate-300 text-sm">Let's see what actually happens... 👀</p>
                <button
                  onClick={() => {
                    setGuessState('hidden');
                    if (videoRef.current) videoRef.current.play().catch(() => {});
                  }}
                  className="px-8 py-3 rounded-2xl font-black text-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_24px_rgba(237,229,24,0.5)]"
                  style={{ background: "linear-gradient(135deg, #EDE518 0%, #f5c800 100%)" }}
                >
                  ▶ Reveal the ending!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Replay That Moment overlay */}
        {isEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 z-10 animate-in fade-in duration-400">
            <div className="text-center mb-2">
              <p className="text-white/60 text-sm uppercase tracking-widest font-bold">Finished!</p>
              <h3 className="text-white font-black text-xl mt-1">{currentVideo.title}</h3>
            </div>
            <button
              onClick={handleReplayBestMoment}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-black text-sm shadow-[0_0_24px_rgba(237,229,24,0.5)] hover:scale-105 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #EDE518 0%, #f5c800 100%)" }}
              data-testid="button-replay-best-moment"
            >
              <SkipBack className="h-4 w-4" />
              Watch best part again ✨
            </button>
            <button
              onClick={() => { setIsEnded(false); if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); } }}
              className="text-white/60 hover:text-white text-xs underline transition-colors"
            >
              Watch from beginning
            </button>
          </div>
        )}

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            ref={progressRef}
            className="relative h-1 bg-muted-foreground/30 rounded-full cursor-pointer mb-3 group/progress"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute h-full bg-muted-foreground/50 rounded-full"
              style={{ width: `${bufferedProgress}%` }}
            />
            <div 
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute h-3 w-3 bg-primary rounded-full -top-1 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handlePlayPause}
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
                data-testid="button-mute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
            
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <div className="flex-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 text-xs px-2"
                  data-testid="button-speed"
                >
                  {playbackRate}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[80px]">
                {speedOptions.map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={playbackRate === speed ? "bg-accent" : ""}
                    data-testid={`speed-option-${speed}`}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {onMinimize && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  if (streamUrl) {
                    const t = videoRef.current?.currentTime ?? 0;
                    onMinimize(streamUrl, t, isAudioMedia);
                    onClose();
                  }
                }}
                title="Play while browsing"
                data-testid="button-minimize-player"
              >
                <ChevronLeft className="h-5 w-5 rotate-90" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
              data-testid="button-fullscreen"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
        {currentVideo.description && (
          <p className="text-sm text-muted-foreground mt-1">{currentVideo.description}</p>
        )}
      </div>
      {/* Listen Next / Watch Next strip — shown before comments */}
      {nextItems.length > 0 && (
        <div className="bg-[#060e1a]">
          <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[#EDE518]/20">
            {isAudio ? (
              <Music className="h-3.5 w-3.5 text-[#EDE518]" />
            ) : (
              <Play className="h-3.5 w-3.5 text-[#EDE518] fill-[#EDE518]" />
            )}
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#EDE518]">
              {isAudio ? "Listen Next" : "Watch Next"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 px-3 pb-3">
            {nextItems.map((rv: any) => (
              <button
                key={rv.id}
                onClick={() => playNext(rv)}
                className="group relative rounded-xl overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-[#EDE518]"
                data-testid={`button-next-${rv.id}`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0d1a35]">
                  {rv.thumbnail_path ? (
                    <img
                      src={`/api/videos/${rv.id}/thumbnail`}
                      alt={rv.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isAudio ? <Music className="h-6 w-6 text-white/20" /> : <Play className="h-6 w-6 text-white/20" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-full p-2.5 transition-all duration-200 group-hover:scale-110"
                      style={{ background: "rgba(237,229,24,0.15)", border: "1.5px solid rgba(237,229,24,0.4)" }}
                    >
                      {isAudio ? (
                        <Music className="h-5 w-5 text-[#EDE518]" />
                      ) : (
                        <Play className="h-5 w-5 text-[#EDE518] fill-[#EDE518]" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{rv.title}</p>
                    <p className="text-[#EDE518] text-[10px] font-bold mt-0.5">
                      {isAudio ? "Tap to listen" : "Tap to watch"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <CommentsSection videoId={currentVideo.id} />
      <div className="h-4" />
    </DialogContent>
  );
}

function VideoPlayer({ video, onClose, onMinimize }: { video: VideoType; onClose: () => void; onMinimize?: (streamUrl: string, currentTime: number, isAudio: boolean) => void }) {
  if ((video as any).vimeoVideoId) {
    return <VideoEmbedPlayer video={video} />;
  }
  return <LegacyVideoPlayer video={video} onClose={onClose} onMinimize={onMinimize} />;
}

// ─── Category Theme System ───────────────────────────────────────────────────

type CardVariant = "default" | "portrait" | "square" | "wide" | "list";

interface CategoryTheme {
  accent: string;
  accentSecondary: string;
  headerBg: string;
  headerText: string;
  cardBorder: string;
  cardBg: string;
  gridCols: string;
  cardVariant: CardVariant;
  featuredFirst: boolean;
  emoji: string;
  tagline: string;
  bannerStyle: "stories" | "shorts" | "music" | "films" | "torah" | "podcast" | "vlog" | "interview" | "comedy" | "default";
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Stories": {
    accent: "#F59E0B", accentSecondary: "#D97706",
    headerBg: "linear-gradient(135deg, #1c0f02 0%, #2d1a06 50%, #1a0e04 100%)",
    headerText: "#FCD34D", cardBorder: "border-amber-700/40", cardBg: "linear-gradient(145deg, #1c1205 0%, #120c03 100%)",
    gridCols: "grid-cols-2 md:grid-cols-3", cardVariant: "default", featuredFirst: true,
    emoji: "📖", tagline: "Tales & Adventures", bannerStyle: "stories",
  },
  "Shorts": {
    accent: "#EC4899", accentSecondary: "#A855F7",
    headerBg: "linear-gradient(135deg, #1a0030 0%, #2d0050 40%, #0d0020 100%)",
    headerText: "#F472B6", cardBorder: "border-pink-500/40", cardBg: "linear-gradient(145deg, #1a0030 0%, #100020 100%)",
    gridCols: "grid-cols-3 sm:grid-cols-4 gap-2", cardVariant: "portrait", featuredFirst: false,
    emoji: "📱", tagline: "Quick & Snappy", bannerStyle: "shorts",
  },
  "Music Videos": {
    accent: "#A855F7", accentSecondary: "#EC4899",
    headerBg: "linear-gradient(135deg, #0d0020 0%, #1e003a 50%, #0a0015 100%)",
    headerText: "#C084FC", cardBorder: "border-purple-500/40", cardBg: "linear-gradient(145deg, #150028 0%, #0d0020 100%)",
    gridCols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4", cardVariant: "square", featuredFirst: false,
    emoji: "🎵", tagline: "Feel the Beat", bannerStyle: "music",
  },
  "Films": {
    accent: "#DC2626", accentSecondary: "#F59E0B",
    headerBg: "linear-gradient(135deg, #0a0000 0%, #1a0505 50%, #0a0000 100%)",
    headerText: "#FCA5A5", cardBorder: "border-red-800/40", cardBg: "linear-gradient(145deg, #1a0505 0%, #0e0202 100%)",
    gridCols: "grid-cols-1 md:grid-cols-2", cardVariant: "wide", featuredFirst: true,
    emoji: "🎬", tagline: "Lights, Camera, Action", bannerStyle: "films",
  },
  "Mishnayos": {
    accent: "#FBBF24", accentSecondary: "#2563EB",
    headerBg: "linear-gradient(135deg, #020b18 0%, #051a30 50%, #020b18 100%)",
    headerText: "#FDE68A", cardBorder: "border-blue-800/40", cardBg: "linear-gradient(145deg, #051a30 0%, #030f1e 100%)",
    gridCols: "grid-cols-1", cardVariant: "list", featuredFirst: false,
    emoji: "📜", tagline: "Daily Learning", bannerStyle: "torah",
  },
  "Pirkei Avos": {
    accent: "#F59E0B", accentSecondary: "#7C3AED",
    headerBg: "linear-gradient(135deg, #0f0520 0%, #1a0835 50%, #0a0318 100%)",
    headerText: "#FCD34D", cardBorder: "border-yellow-700/40", cardBg: "linear-gradient(145deg, #1a0835 0%, #0f0520 100%)",
    gridCols: "grid-cols-1", cardVariant: "list", featuredFirst: false,
    emoji: "🕍", tagline: "Words of Wisdom", bannerStyle: "torah",
  },
  "OneDafOneDaf": {
    accent: "#3B82F6", accentSecondary: "#FBBF24",
    headerBg: "linear-gradient(135deg, #020a1a 0%, #051530 50%, #020a1a 100%)",
    headerText: "#93C5FD", cardBorder: "border-blue-700/40", cardBg: "linear-gradient(145deg, #051530 0%, #030d22 100%)",
    gridCols: "grid-cols-1 md:grid-cols-2", cardVariant: "default", featuredFirst: false,
    emoji: "📚", tagline: "One Page Every Day", bannerStyle: "torah",
  },
  "Interviews": {
    accent: "#0D9488", accentSecondary: "#6366F1",
    headerBg: "linear-gradient(135deg, #00100e 0%, #001c1a 50%, #000e0c 100%)",
    headerText: "#5EEAD4", cardBorder: "border-teal-700/40", cardBg: "linear-gradient(145deg, #001c1a 0%, #00100e 100%)",
    gridCols: "grid-cols-1 md:grid-cols-2", cardVariant: "wide", featuredFirst: true,
    emoji: "🎙️", tagline: "One-on-One Conversations", bannerStyle: "interview",
  },
  "Just Kidding Podcast": {
    accent: "#F97316", accentSecondary: "#EDE518",
    headerBg: "linear-gradient(135deg, #180a00 0%, #2d1200 50%, #180a00 100%)",
    headerText: "#FB923C", cardBorder: "border-orange-600/40", cardBg: "linear-gradient(145deg, #2d1200 0%, #1a0a00 100%)",
    gridCols: "grid-cols-2 md:grid-cols-3", cardVariant: "default", featuredFirst: false,
    emoji: "🎤", tagline: "Laugh, Learn & Listen", bannerStyle: "comedy",
  },
  "Vloging with Reb Eli": {
    accent: "#F97316", accentSecondary: "#EDE518",
    headerBg: "linear-gradient(135deg, #100800 0%, #1e1000 50%, #100800 100%)",
    headerText: "#FDBA74", cardBorder: "border-orange-700/40", cardBg: "linear-gradient(145deg, #1e1000 0%, #100800 100%)",
    gridCols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3", cardVariant: "default", featuredFirst: false,
    emoji: "🎥", tagline: "Life Behind the Lens", bannerStyle: "vlog",
  },
  "Navi": {
    accent: "#34D399", accentSecondary: "#059669",
    headerBg: "linear-gradient(135deg, #00140a 0%, #002918 50%, #00140a 100%)",
    headerText: "#6EE7B7", cardBorder: "border-emerald-700/40", cardBg: "linear-gradient(145deg, #001f10 0%, #000f08 100%)",
    gridCols: "grid-cols-1", cardVariant: "list", featuredFirst: false,
    emoji: "📜", tagline: "Prophets & Visions", bannerStyle: "torah",
  },
  "Gemara": {
    accent: "#60A5FA", accentSecondary: "#FBBF24",
    headerBg: "linear-gradient(135deg, #020a1a 0%, #041830 50%, #020a1a 100%)",
    headerText: "#BFDBFE", cardBorder: "border-blue-700/40", cardBg: "linear-gradient(145deg, #041830 0%, #020a14 100%)",
    gridCols: "grid-cols-1", cardVariant: "list", featuredFirst: false,
    emoji: "🕯️", tagline: "Deep Torah Study", bannerStyle: "torah",
  },
  "Series / Ongoing": {
    accent: "#A78BFA", accentSecondary: "#C084FC",
    headerBg: "linear-gradient(135deg, #0a0318 0%, #150828 50%, #0a0318 100%)",
    headerText: "#DDD6FE", cardBorder: "border-violet-700/40", cardBg: "linear-gradient(145deg, #150828 0%, #0a0318 100%)",
    gridCols: "grid-cols-1 md:grid-cols-2", cardVariant: "default", featuredFirst: true,
    emoji: "📺", tagline: "Multi-Part Learning", bannerStyle: "default",
  },
};

function getCategoryTheme(categoryName: string | null): CategoryTheme | null {
  if (!categoryName) return null;
  return CATEGORY_THEMES[categoryName] || null;
}

function CategoryBanner({ category, theme }: { category: VideoCategory; theme: CategoryTheme }) {
  const { bannerStyle, accent, accentSecondary, headerBg, headerText, emoji, tagline } = theme;

  if (bannerStyle === "stories") return (
    <div className="relative overflow-hidden rounded-xl mb-6" style={{ background: headerBg, border: `1px solid ${accent}30` }}>
      {/* Diagonal line texture */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `repeating-linear-gradient(135deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 28px)` }} />
      {/* Glow orb */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: accent }} />
      {/* Decorative SVG stars */}
      <svg className="absolute right-8 top-1/2 -translate-y-1/2 opacity-15" width="120" height="80" viewBox="0 0 120 80" fill="none">
        <polygon points="60,4 67,24 88,24 72,37 78,57 60,44 42,57 48,37 32,24 53,24" fill={accent} />
        <polygon points="96,20 99.5,30 110,30 101.5,36 105,46 96,40 87,46 90.5,36 82,30 92.5,30" fill={accentSecondary} opacity="0.7" />
        <polygon points="24,20 27.5,30 38,30 29.5,36 33,46 24,40 15,46 18.5,36 10,30 20.5,30" fill={accentSecondary} opacity="0.7" />
      </svg>
      <div className="relative z-10 p-6 pr-36">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 rounded" style={{ background: accent }} />
          <span className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>Rabbi Eli Scheller</span>
        </div>
        <h2 className="text-3xl font-black leading-tight" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1.5 font-medium" style={{ color: `${headerText}99` }}>{tagline}</p>
        <div className="flex gap-0.5 mt-3">
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={accent}><polygon points="7,1 8.5,5 13,5 9.5,7.5 11,12 7,9.5 3,12 4.5,7.5 1,5 5.5,5"/></svg>
          ))}
        </div>
      </div>
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${accent}80, ${accent}20, transparent)` }} />
    </div>
  );

  if (bannerStyle === "shorts") return (
    <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: `1px solid ${accent}30` }}>
      <span className="text-xl">{emoji}</span>
      <h2 className="text-xl font-bold" style={{ color: headerText }}>{category.name}</h2>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: `${accent}20`, color: accent }}>{tagline}</span>
    </div>
  );

  if (bannerStyle === "music") return (
    <div className="relative overflow-hidden rounded-xl mb-6 p-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15">
        <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center" style={{ borderColor: accent }}>
          <div className="w-8 h-8 rounded-full" style={{ background: accent }} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${accent}, ${accentSecondary}, ${accent})` }} />
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>🎵 Now Playing</div>
        <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
        <div className="flex gap-0.5 mt-3 items-end h-6">
          {[4,7,3,8,5,9,4,6,7,3,8,5].map((h, i) => (
            <div key={i} className="w-1.5 rounded-t animate-pulse" style={{ height: `${h*8}%`, background: i%2 ? accent : accentSecondary, animationDelay: `${i*0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (bannerStyle === "films") return (
    <div className="relative overflow-hidden rounded-xl mb-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="absolute top-0 left-0 right-0 h-4 flex gap-2 px-2 items-center" style={{ background: "rgba(0,0,0,0.8)" }}>
        {[...Array(12)].map((_, i) => <div key={i} className="w-4 h-3 rounded-sm flex-shrink-0" style={{ background: accent+'40', border: `1px solid ${accent}60` }} />)}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-4 flex gap-2 px-2 items-center" style={{ background: "rgba(0,0,0,0.8)" }}>
        {[...Array(12)].map((_, i) => <div key={i} className="w-4 h-3 rounded-sm flex-shrink-0" style={{ background: accent+'40', border: `1px solid ${accent}60` }} />)}
      </div>
      <div className="relative z-10 p-8 pt-8 flex items-center gap-6">
        <div className="text-6xl select-none">{emoji}</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>Now Showing</div>
          <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
          <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
        </div>
      </div>
    </div>
  );

  if (bannerStyle === "torah") return (
    <div className="relative overflow-hidden rounded-xl mb-6 p-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(0deg, ${accent} 0px, transparent 1px, transparent 40px)` }} />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-15 select-none">{emoji}</div>
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>Torah Learning</div>
        <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
        <div className="mt-3 h-0.5 w-24 rounded" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      </div>
    </div>
  );

  if (bannerStyle === "interview") return (
    <div className="relative overflow-hidden rounded-xl mb-6 p-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-3 opacity-15">
        <div className="w-8 h-16 rounded-full" style={{ background: accent }} />
        <div className="w-8 h-16 rounded-full mt-4" style={{ background: accentSecondary }} />
      </div>
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>🎙️ Studio Sessions</div>
        <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
      </div>
    </div>
  );

  if (bannerStyle === "comedy") return (
    <div className="relative overflow-hidden rounded-xl mb-6 p-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none rotate-12">😂</div>
      <div className="absolute top-2 left-2 text-2xl opacity-30 rotate-[-20deg]">🎤</div>
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>{emoji} Podcast</div>
        <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
      </div>
    </div>
  );

  if (bannerStyle === "vlog") return (
    <div className="relative overflow-hidden rounded-xl mb-6 p-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${accent} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${accentSecondary} 0%, transparent 50%)` }} />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none">{emoji}</div>
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>Follow Along</div>
        <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
      </div>
    </div>
  );

  // default
  return (
    <div className="relative overflow-hidden rounded-xl mb-6 p-6" style={{ background: headerBg, border: `1px solid ${accent}40` }}>
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>{emoji} Category</div>
        <h2 className="text-3xl font-black" style={{ color: headerText }}>{category.name}</h2>
        <p className="text-sm mt-1 opacity-60" style={{ color: headerText }}>{tagline}</p>
      </div>
    </div>
  );
}

// ─── Spotlight Card (rotating daily featured video) ──────────────────────────

function SpotlightCard({ video, theme, onView }: { video: VideoType; theme: CategoryTheme | null; onView?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheBust] = useState(() => Date.now());
  const { setMiniPlayer } = useContext(MiniPlayerContext);
  const thumbnailSrc = video.thumbnailPath ? `/api/videos/${video.id}/thumbnail?v=${cacheBust}` : null;
  const accent = theme?.accent || "#EDE518";

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && onView) onView();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="relative rounded-2xl overflow-hidden cursor-pointer group mb-6 shadow-2xl" style={{ border: `1px solid ${accent}25` }} data-testid={`spotlight-${video.id}`}>
          <div className="aspect-[21/9] sm:aspect-[3/1] relative overflow-hidden bg-[#060e1a]">
            {thumbnailSrc ? (
              <img src={thumbnailSrc} alt={video.title} className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
            ) : (
              <div className="absolute inset-0" style={{ background: theme?.headerBg || "linear-gradient(135deg, #060e1a, #0d1828)" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${accent}08 0%, transparent 60%)` }} />
            {/* Animated corner accent */}
            <div className="absolute top-0 left-0 w-24 h-24 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at top left, ${accent}, transparent 70%)` }} />
          </div>
          <div className="absolute inset-0 flex items-end p-4 sm:p-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}40` }}>
                  <span className="animate-pulse">★</span> Today's Spotlight
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg line-clamp-2">{video.title}</h3>
              {video.description && <p className="text-sm text-white/55 mt-1 line-clamp-1 hidden sm:block">{video.description}</p>}
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-200" style={{ background: accent, boxShadow: `0 0 28px ${accent}60` }}>
                <Play className="h-6 w-6 sm:h-7 sm:w-7 text-black ml-0.5" fill="black" />
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <VideoPlayer video={video} onClose={() => setIsOpen(false)} />
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parental Controls Context — shared with VideoCard
type ParentalControlsCtx = {
  isEnabled: boolean;
  isVideoBlocked: (categoryId?: string | null) => boolean;
  requestUnlock: (callback: () => void) => void;
  timeUsedSeconds: number;
  timeLimitSeconds: number;
  timePeriod: string;
};
const ParentalControlsContext = createContext<ParentalControlsCtx>({
  isEnabled: false,
  isVideoBlocked: () => false,
  requestUnlock: (cb) => cb(),
  timeUsedSeconds: 0,
  timeLimitSeconds: 0,
  timePeriod: 'day',
});


function VideoCard({ video, isNew, onView, categoryName, variant = "default", autoOpen, onAutoOpenConsumed }: { video: VideoType; isNew?: boolean; onView?: () => void; categoryName?: string; variant?: CardVariant; autoOpen?: boolean; onAutoOpenConsumed?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (autoOpen) { setIsOpen(true); onAutoOpenConsumed?.(); }
  }, [autoOpen]);
  const isAudio = video.mediaType === "audio" || (video as any).media_type === "audio";
  const { toast } = useToast();
  const trackEv = useTrackEvent();

  const { data: userFavorites = [] } = useQuery<string[]>({
    queryKey: ["/api/user/favorites"],
  });
  const isFavorited = userFavorites.includes(video.id);

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${video.id}/favorite`),
    onSuccess: (_data, _vars, _ctx) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      const nowFav = !isFavorited;
      trackEv({
        eventType: isAudio ? (nowFav ? "audio_save" : "audio_unsave") : (nowFav ? "video_save" : "video_unsave"),
        resourceId: video.id,
        resourceTitle: video.title,
        resourceType: isAudio ? "audio" : "video",
      });
    },
    onError: () => toast({ title: "Failed to update favorite", variant: "destructive" }),
  });

  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number | null | undefined): string | null => {
    if (!seconds || seconds <= 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durationText = formatDuration(video.duration);

  // Use a stable cache-bust value per page load to avoid infinite rerenders
  const [cacheBust] = useState(() => Date.now());

  // Always route through our API endpoint so thumbnail handling is centralised.
  // The endpoint handles: Vimeo CDN URLs (redirect), Object Storage paths, local paths.
  const thumbnailSrc = video.thumbnailPath
    ? `/api/videos/${video.id}/thumbnail?v=${cacheBust}`
    : null;

  const parental = useContext(ParentalControlsContext);
  const isLocked = parental.isVideoBlocked(video.categoryId);
  const progressMap = useContext(VideoProgressContext);

  // Hover preview handled via CSS group-hover (instant, no iframe needed)
  const progressPct = progressMap.get(video.id) ?? 0;
  const { setMiniPlayer } = useContext(MiniPlayerContext);
  const handleMinimize = (streamUrl: string, currentTime: number, isAudioType: boolean) => {
    setMiniPlayer({ video, streamUrl, currentTime, isAudio: isAudioType });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open && isLocked) {
      parental.requestUnlock(() => {
        setIsOpen(true);
        if (onView) onView();
      });
      return;
    }
    if (!open && isOpen) {
      // "Almost Done" — show toast when user closes mid-video
      if (_liveVideoProgress.videoId === video.id) {
        const pct = _liveVideoProgress.pct;
        if (pct >= 0.65 && pct < 0.95) {
          setTimeout(() => toast({
            title: "You're almost done! 🎉",
            description: "Just a little more — tap to finish it!",
            duration: 5000,
          }), 400);
        } else if (pct >= 0.3 && pct < 0.65) {
          setTimeout(() => toast({
            title: "Don't stop now! 👀",
            description: "You were halfway through — come back and finish!",
            duration: 5000,
          }), 400);
        }
        _liveVideoProgress.videoId = "";
        _liveVideoProgress.pct = 0;
      }
    }
    setIsOpen(open);
    if (open) {
      if (onView) onView();
      trackEv({
        eventType: "video_play",
        resourceId: video.id,
        resourceTitle: video.title,
        resourceType: isAudio ? "audio" : "video",
        metadata: { categoryName },
      });
    }
  };

  // Track watch time while video is open
  const watchStartRef = useRef<number>(0);
  useEffect(() => {
    if (!isOpen) return;
    watchStartRef.current = Date.now();
    const logDate = new Date().toISOString().split('T')[0];
    const interval = setInterval(() => {
      apiRequest("POST", "/api/watch-time", { videoId: video.id, seconds: 30, logDate });
      queryClient.invalidateQueries({ queryKey: ["/api/parental-controls"] });
    }, 30000);
    return () => {
      clearInterval(interval);
      const elapsed = Math.round((Date.now() - watchStartRef.current) / 1000) % 30;
      if (elapsed > 0) {
        apiRequest("POST", "/api/watch-time", { videoId: video.id, seconds: elapsed, logDate });
        queryClient.invalidateQueries({ queryKey: ["/api/parental-controls"] });
      }
    };
  }, [isOpen]);

  const aspectClass = variant === "portrait" ? "aspect-[9/16]"
    : variant === "square" ? "aspect-square"
    : variant === "wide" ? "aspect-[16/7]"
    : "aspect-video";

  // List variant: horizontal layout
  if (variant === "list") {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <div className="flex gap-4 p-4 rounded-xl cursor-pointer border border-white/10 hover:border-white/25 transition-all group" style={{background: "linear-gradient(135deg, #051a30 0%, #030f1e 100%)"}} data-testid={`card-video-${video.id}`}>
            <div className="flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden relative bg-[#060e1a]">
              {thumbnailSrc ? (
                <img src={thumbnailSrc} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : isAudio ? (
                <div className="w-full h-full flex items-center justify-center"
                  style={{background: categoryName === "Just Kidding Podcast"
                    ? "linear-gradient(135deg, #1a0800 0%, #2d1200 100%)"
                    : "linear-gradient(135deg, #051a30 0%, #030d22 100%)"}}>
                  <span className="text-2xl select-none">
                    {categoryName === "Just Kidding Podcast" ? "🎤" : "🎵"}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-white/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 rounded-full bg-[#FBBF24] flex items-center justify-center">
                  <Play className="h-3 w-3 text-black ml-0.5" />
                </div>
              </div>
              {durationText && (
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">{durationText}</div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-start gap-2">
                <h3 className="font-semibold text-white line-clamp-2 flex-1" data-testid={`text-video-title-${video.id}`}>{video.title}</h3>
                {isNew && <Badge className="text-xs bg-[#FBBF24] text-black font-bold flex-shrink-0" data-testid={`badge-new-${video.id}`}>New</Badge>}
              </div>
              {video.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{video.description}</p>}
            </div>
          </div>
        </DialogTrigger>
        <VideoPlayer video={video} onClose={() => setIsOpen(false)} onMinimize={handleMinimize} />
      </Dialog>
    );
  }

  return (
    <div className="relative">
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card
          className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 border border-white/10 hover:border-white/25 transition-colors relative"
          style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}}
          data-testid={`card-video-${video.id}`}
        >
          <div className={`${aspectClass} flex items-center justify-center relative group overflow-hidden bg-[#060e1a]`}>
            {thumbnailSrc ? (
              <>
                <img 
                  src={thumbnailSrc} 
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {isAudio && (
                  <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                )}
              </>
            ) : isAudio ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-3"
                style={{background: categoryName === "Just Kidding Podcast"
                  ? "linear-gradient(135deg, #1a0800 0%, #2d1200 40%, #1a0800 100%)"
                  : "linear-gradient(135deg, #051a30 0%, #030d22 100%)"}}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 rounded-full opacity-20 blur-xl"
                    style={{background: categoryName === "Just Kidding Podcast" ? "#F97316" : "#08779C"}} />
                  <span className="text-4xl select-none relative z-10">
                    {categoryName === "Just Kidding Podcast" ? "🎤" : "🎵"}
                  </span>
                </div>
                <p className="text-center text-xs font-semibold line-clamp-2 leading-tight"
                  style={{color: categoryName === "Just Kidding Podcast" ? "#FB923C" : "#93C5FD"}}>
                  {video.title}
                </p>
              </div>
            ) : (
              <FileVideo className="h-12 w-12 text-[#08779C]" />
            )}
            {isNew && (
              <div className="absolute top-2 right-2 z-20">
                <Badge className="text-xs bg-[#EDE518] text-black font-bold" data-testid={`badge-new-${video.id}`}>New</Badge>
              </div>
            )}
            {!isNew && (
              <button
                className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-all ${isFavorited ? "bg-black/70 opacity-100" : "bg-black/50 opacity-0 group-hover:opacity-100"}`}
                onClick={e => { e.stopPropagation(); favoriteMutation.mutate(); }}
                data-testid={`button-card-favorite-${video.id}`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-[#EDE518] text-[#EDE518]" : "text-white"}`} />
              </button>
            )}
            {durationText && (
              <div className="absolute bottom-2 right-2 z-20 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium" data-testid={`duration-${video.id}`}>
                {durationText}
              </div>
            )}
            {isLocked ? (
              <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center gap-1.5">
                <div className="h-12 w-12 rounded-full bg-[#EDE518]/10 border border-[#EDE518]/40 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-[#EDE518]" />
                </div>
                <span className="text-[10px] font-bold text-[#EDE518]/80 uppercase tracking-widest">Time limit reached</span>
              </div>
            ) : (
              <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="h-14 w-14 rounded-full bg-[#EDE518] flex items-center justify-center shadow-[0_0_30px_rgba(237,229,24,0.7)] scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play className="h-6 w-6 text-black ml-1" />
                </div>
              </div>
            )}
          </div>
          {variant !== "square" && variant !== "portrait" && (
            <CardContent className="p-3 pb-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold line-clamp-1 flex-1 text-white text-sm" data-testid={`text-video-title-${video.id}`}>
                  {video.title}
                </h3>
                {isAudio && (
                  <span className="text-xs text-[#08779C] flex items-center gap-1 flex-shrink-0">
                    <Music className="h-3 w-3" />
                  </span>
                )}
              </div>
              {categoryName && (
                <span className="mt-1 inline-block text-xs font-semibold text-[#EDE518] uppercase tracking-wider" data-testid={`badge-category-${video.id}`}>
                  {categoryName}
                </span>
              )}
              {video.description && variant === "wide" && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {video.description}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-2 pb-2.5 border-t border-white/5 pt-2">
                {isAudio ? (
                  <>
                    <button
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${isFavorited ? "bg-[#08779C] text-white" : "bg-white/10 text-white/70 hover:bg-white/15"}`}
                      onClick={e => { e.stopPropagation(); favoriteMutation.mutate(); }}
                      data-testid={`button-card-save-${video.id}`}
                    >
                      {isFavorited ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <BookmarkPlus className="h-3 w-3" />
                      )}
                      {isFavorited ? "Saved" : "Save story"}
                    </button>
                    <span className="text-[10px] text-slate-500 ml-auto">tap to play →</span>
                  </>
                ) : (
                  <>
                    <button
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${isFavorited ? "bg-[#EDE518] text-black" : "bg-white/10 text-white/70 hover:bg-white/15"}`}
                      onClick={e => { e.stopPropagation(); favoriteMutation.mutate(); }}
                      data-testid={`button-card-save-${video.id}`}
                    >
                      {isFavorited ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <BookmarkPlus className="h-3 w-3" />
                      )}
                      {isFavorited ? "Saved" : "Save"}
                    </button>
                    <span className="text-[10px] text-slate-500 ml-auto">tap to open →</span>
                  </>
                )}
              </div>
            </CardContent>
          )}
          {(variant === "square" || variant === "portrait") && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 pt-6">
              <h3 className="font-bold line-clamp-2 text-white text-xs leading-tight" data-testid={`text-video-title-${video.id}`}>{video.title}</h3>
            </div>
          )}
          {progressPct > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
              <div className="h-full bg-[#EDE518]" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </Card>
      </DialogTrigger>
      <VideoPlayer
        video={video}
        onClose={() => setIsOpen(false)}
        onMinimize={(streamUrl, currentTime, isAudioType) => {
          setMiniPlayer({ video, streamUrl, currentTime, isAudio: isAudioType });
          setIsOpen(false);
        }}
      />
    </Dialog>
    </div>
  );
}

function DocumentCard({ doc }: { doc: Document }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 border border-white/10 hover:border-[#08779C]/40 transition-colors" 
        style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}}
        onClick={() => setIsViewerOpen(true)}
        data-testid={`card-doc-${doc.id}`}
      >
        <div className="aspect-video bg-[#060e1a] flex items-center justify-center relative group">
          <FileText className="h-12 w-12 text-[#08779C]" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-14 w-14 rounded-full bg-[#08779C] flex items-center justify-center shadow-[0_0_20px_rgba(8,119,156,0.5)]">
              <ExternalLink className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold line-clamp-1 flex-1 text-white" data-testid={`text-doc-title-${doc.id}`}>
              {doc.title}
            </h3>
            <span className="text-xs font-bold text-[#08779C] border border-[#08779C]/30 px-1.5 py-0.5 rounded flex-shrink-0">PDF</span>
          </div>
          {doc.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {doc.description}
            </p>
          )}
        </CardContent>
      </Card>
      {isViewerOpen && (
        <DocumentViewer
          documentId={doc.id}
          title={doc.title}
          onClose={() => setIsViewerOpen(false)}
          allowDownload={doc.allowDownload ?? false}
        />
      )}
    </>
  );
}

function AlbumCard({ album }: { album: Album & { trackCount: number } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tracks, setTracks] = useState<AlbumTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackEv = useTrackEvent();
  const isPlayingAllRef = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Sort tracks by trackNumber for proper ordering
  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
  }, [tracks]);

  const currentTrack = useMemo(() => {
    return sortedTracks.find(t => t.id === playingTrackId) || null;
  }, [sortedTracks, playingTrackId]);

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingAllRef.current = isPlayingAll;
  }, [isPlayingAll]);

  const fetchTracks = async () => {
    setLoadingTracks(true);
    try {
      const res = await fetch(`/api/albums/${album.id}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (err) {
      console.error("Failed to fetch album tracks:", err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchTracks();
  };

  const handleClose = () => {
    setIsOpen(false);
    stopPlaying();
    setIsPlayingAll(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const playTrackAtIndex = (index: number) => {
    if (index >= sortedTracks.length) {
      setPlayingTrackId(null);
      setIsPlayingAll(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    
    const track = sortedTracks[index];
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const token = getStoredAuthToken();
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
    const audio = new Audio(`/api/albums/${album.id}/tracks/${track.id}/stream${tokenParam}`);
    
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    
    audio.play();
    audioRef.current = audio;
    setPlayingTrackId(track.id);
    trackEv({ eventType: "audio_play", resourceId: track.id, resourceTitle: track.title || `Track ${track.trackNumber}`, resourceType: "audio", metadata: { albumTitle: album.title, albumId: album.id } });
    
    audio.onended = () => {
      if (isPlayingAllRef.current && index < sortedTracks.length - 1) {
        playTrackAtIndex(index + 1);
      } else {
        setPlayingTrackId(null);
        setIsPlayingAll(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }
    };
  };

  const playTrack = (track: AlbumTrack) => {
    const trackIndex = sortedTracks.findIndex(t => t.id === track.id);
    playTrackAtIndex(trackIndex >= 0 ? trackIndex : 0);
  };

  const playAll = () => {
    if (sortedTracks.length === 0) return;
    setIsPlayingAll(true);
    isPlayingAllRef.current = true;
    playTrackAtIndex(0);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const playNext = () => {
    if (!currentTrack) return;
    const currentIndex = sortedTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < sortedTracks.length - 1) {
      playTrackAtIndex(currentIndex + 1);
    }
  };

  const playPrev = () => {
    if (!currentTrack) return;
    const currentIndex = sortedTracks.findIndex(t => t.id === currentTrack.id);
    if (currentTime > 3) {
      // Restart current track if more than 3 seconds in
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else if (currentIndex > 0) {
      playTrackAtIndex(currentIndex - 1);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingTrackId(null);
    setIsPlayingAll(false);
    isPlayingAllRef.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 border border-white/10 hover:border-[#EDE518]/40 transition-colors" 
        style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}}
        onClick={handleOpen}
        data-testid={`card-album-${album.id}`}
      >
        <div className="aspect-video bg-[#060e1a] flex items-center justify-center relative group">
          {album.thumbnailPath ? (
            <img 
              src={`/api/albums/${album.id}/thumbnail`} 
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Disc className="h-12 w-12 text-[#EDE518]" />
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-14 w-14 rounded-full bg-[#EDE518] flex items-center justify-center shadow-[0_0_20px_rgba(237,229,24,0.5)]">
              <Play className="h-6 w-6 text-black ml-1" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold line-clamp-1 flex-1 text-white" data-testid={`text-album-title-${album.id}`}>
              {album.title}
            </h3>
            <span className="text-xs font-bold text-[#EDE518] border border-[#EDE518]/30 px-1.5 py-0.5 rounded flex-shrink-0">
              {album.trackCount} {album.trackCount === 1 ? "track" : "tracks"}
            </span>
          </div>
          {album.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {album.description}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0">
          {/* Player Section with Thumbnail */}
          <div className="bg-muted/50 p-4">
            <div className="flex gap-4">
              {/* Album Thumbnail */}
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {album.thumbnailPath ? (
                  <img 
                    src={`/api/albums/${album.id}/thumbnail`} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Track Info & Controls */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-semibold truncate" data-testid="text-album-player-title">
                  {album.title}
                </h3>
                {currentTrack ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {currentTrack.title}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {sortedTracks.length} {sortedTracks.length === 1 ? "track" : "tracks"}
                  </p>
                )}
                
                {/* Progress Bar */}
                {playingTrackId && (
                  <div className="mt-2">
                    <div 
                      ref={progressRef}
                      className="h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
                      onClick={handleSeek}
                      data-testid="progress-bar"
                    >
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                )}
                
                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={playPrev}
                    disabled={!currentTrack}
                    data-testid="button-prev"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon"
                    onClick={currentTrack ? togglePlayPause : playAll}
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={playNext}
                    disabled={!currentTrack || sortedTracks.findIndex(t => t.id === currentTrack.id) >= sortedTracks.length - 1}
                    data-testid="button-next"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Track List */}
          <div className="flex-1 overflow-y-auto p-4 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Tracks</h4>
            {loadingTracks ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sortedTracks.length > 0 ? (
              <div className="space-y-1">
                {sortedTracks.map((track, index) => (
                  <div 
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer ${playingTrackId === track.id ? 'bg-primary/10' : ''}`}
                    onClick={() => {
                      if (playingTrackId === track.id) {
                        togglePlayPause();
                      } else {
                        setIsPlayingAll(false);
                        playTrack(track);
                      }
                    }}
                    data-testid={`track-${track.id}`}
                  >
                    <span className={`w-6 text-center text-sm ${playingTrackId === track.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {playingTrackId === track.id && isPlaying ? (
                        <Volume2 className="h-4 w-4 mx-auto" />
                      ) : (
                        track.trackNumber || index + 1
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${playingTrackId === track.id ? 'font-medium text-primary' : ''}`}>
                        {track.title}
                      </p>
                    </div>
                    <Button 
                      size="icon" 
                      variant={playingTrackId === track.id ? "default" : "ghost"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playingTrackId === track.id) {
                          togglePlayPause();
                        } else {
                          setIsPlayingAll(false);
                          playTrack(track);
                        }
                      }}
                    >
                      {playingTrackId === track.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tracks in this album yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const ANNOUNCEMENT_TRUNCATE_AT = 120;

function AnnouncementBanner({ text, imageUrl }: { text: string; imageUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [imageCollapsed, setImageCollapsed] = useState(false);
  const isTruncated = text.length > ANNOUNCEMENT_TRUNCATE_AT;
  const displayText = isTruncated ? text.slice(0, ANNOUNCEMENT_TRUNCATE_AT).trimEnd() + "…" : text;

  return (
    <div className="bg-primary text-primary-foreground" data-testid="banner-announcement">
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="shrink-0 text-xs font-bold uppercase tracking-widest opacity-80 border-r border-primary-foreground/30 pr-3">
          Update
        </span>
        <p className="text-sm font-medium flex-1">{displayText}</p>
        {isTruncated && (
          <>
            <button
              onClick={() => setOpen(true)}
              className="shrink-0 text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap"
              data-testid="button-announcement-read-more"
            >
              Read more
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Announcement</DialogTitle>
                </DialogHeader>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        {imageUrl && (
          <button
            onClick={() => setImageCollapsed((c) => !c)}
            className="shrink-0 text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap"
            data-testid="button-announcement-toggle-image"
          >
            {imageCollapsed ? "Show image" : "Hide image"}
          </button>
        )}
      </div>
      {imageUrl && !imageCollapsed && (
        <div className="px-4 pb-3" data-testid="announcement-image-container">
          <img
            src="/api/announcement/image"
            alt="Announcement"
            className="max-h-72 w-auto rounded-lg object-contain"
            data-testid="img-announcement"
          />
        </div>
      )}
    </div>
  );
}

const SLIDE_ACCENTS = ["#EDE518", "#08779C", "#e8800a", "#9b6ee0", "#e0245e", "#11a867"];
const SLIDE_DARK_OVERLAYS = [
  "linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.15) 100%)",
  "linear-gradient(105deg, rgba(0,5,20,0.93) 0%, rgba(0,10,30,0.78) 45%, rgba(0,0,0,0.1) 100%)",
  "linear-gradient(105deg, rgba(20,0,5,0.93) 0%, rgba(30,5,0,0.78) 45%, rgba(0,0,0,0.1) 100%)",
  "linear-gradient(105deg, rgba(10,0,25,0.93) 0%, rgba(15,0,35,0.78) 45%, rgba(0,0,0,0.1) 100%)",
  "linear-gradient(105deg, rgba(25,0,5,0.93) 0%, rgba(35,0,5,0.78) 45%, rgba(0,0,0,0.1) 100%)",
  "linear-gradient(105deg, rgba(0,15,5,0.93) 0%, rgba(0,25,8,0.78) 45%, rgba(0,0,0,0.1) 100%)",
];

type BannerItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  videoId: string | null;
  isActive: boolean;
};

// ── Built-in feature announcement cards (always visible) ─────────────────────
const FEATURE_PROMO_CARDS = [
  {
    id: "feat-mishnayos",
    badge: "📖 New Series",
    title: "Mishnayos Daily",
    subtitle: "Learn a Mishna every day with Reb Eli — quick, fun, and clear!",
    emoji: "📖",
    bg: "linear-gradient(135deg, #003d5c 0%, #086b8a 100%)",
    accent: "#08779C",
    glow: "#08779Caa",
    videoId: null as string | null,
    imageUrl: null as string | null,
    action: null as string | null,
  },
  {
    id: "feat-parental",
    badge: "🛡️ New Feature",
    title: "Parental Controls",
    subtitle: "Set daily, weekly, or monthly screen-time limits. Tap here to set it up now!",
    emoji: "🛡️",
    bg: "linear-gradient(135deg, #2d1463 0%, #4c1d95 100%)",
    accent: "#8b5cf6",
    glow: "#8b5cf6aa",
    videoId: null as string | null,
    imageUrl: null as string | null,
    action: "settings" as string | null,
  },
  {
    id: "feat-offline",
    badge: "⬇️ New Feature",
    title: "Save Stories",
    subtitle: "Tap \"Save story\" on any audio card to add it to your personal Saved Stories section!",
    emoji: "⬇️",
    bg: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
    accent: "#10b981",
    glow: "#10b981aa",
    videoId: null as string | null,
    imageUrl: null as string | null,
    action: null as string | null,
  },
];

function DashboardBannerSlideshow({ banners, videos, onOpenSettings }: { banners: BannerItem[]; videos: VideoType[]; onOpenSettings?: () => void }) {
  const [current, setCurrent] = useState(0);
  const [openVideo, setOpenVideo] = useState<VideoType | null>(null);
  const [isOpenVideo, setIsOpenVideo] = useState(false);

  // Combine built-in promo slides + admin banners
  const allSlides = [
    ...FEATURE_PROMO_CARDS,
    ...banners.map(b => ({
      id: b.id,
      badge: "✨ Featured",
      title: b.title,
      subtitle: b.subtitle ?? "",
      emoji: "🎬",
      bg: "linear-gradient(135deg, #0d1a35 0%, #1a2a4a 100%)",
      accent: "#EDE518",
      glow: "#EDE518aa",
      videoId: b.videoId ?? null,
      imageUrl: b.imageUrl
        ? b.imageUrl.startsWith("/objects/") ? `/api/banners/${b.id}/image` : b.imageUrl
        : null,
      action: null as string | null,
    })),
  ];

  const total = allSlides.length;

  const goTo = (idx: number) => setCurrent(((idx % total) + total) % total);
  const prevSlide = () => goTo(current - 1);
  const nextSlide = () => goTo(current + 1);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 6000);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;

  const slide = allSlides[current];
  const accent = slide.accent;

  return (
    <>
      <div
        className="relative overflow-hidden select-none"
        style={{ minHeight: 220, background: "#060e1a" }}
        data-testid="banner-slideshow"
      >
        {/* Full-bleed background image */}
        {slide.imageUrl && (
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.42) saturate(1.2)" }}
          />
        )}

        {/* Rich gradient for promo slides */}
        {!slide.imageUrl && (
          <div className="absolute inset-0" style={{ background: slide.bg }} />
        )}

        {/* Directional overlay — dark on text side */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.10) 55%, rgba(0,0,0,0.45) 100%)" }} />
        {/* Bottom fade behind dots */}
        <div className="absolute bottom-0 left-0 right-0 h-14" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }} />

        {/* Accent glow — left column */}
        <div className="absolute -left-20 top-0 bottom-0 w-80 pointer-events-none" style={{ background: `radial-gradient(ellipse at left center, ${accent}22 0%, transparent 70%)` }} />
        {/* Subtle accent glow — bottom right */}
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: accent, opacity: 0.10 }} />

        {/* Top accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px]" style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}00 55%)` }} />

        {/* Content */}
        <div
          className={`relative flex items-center gap-5 px-5 sm:px-8 py-5 ${(slide.videoId || slide.action) ? "cursor-pointer" : ""}`}
          style={{ minHeight: 220 }}
          onClick={() => {
            if (slide.action === "settings") { onOpenSettings?.(); return; }
            if (!slide.videoId) return;
            const v = videos.find(v => v.id === slide.videoId);
            if (v) {
              setOpenVideo(v); setIsOpenVideo(true);
              trackEvent({ eventType: "video_play", resourceId: v.id, resourceTitle: v.title, resourceType: "video", metadata: { source: "banner" } });
            }
          }}
        >
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <span
              className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.13em] px-2.5 py-1 rounded-full mb-2.5"
              style={{ background: `${accent}18`, color: accent, border: `1.5px solid ${accent}38` }}
            >
              {slide.badge}
            </span>

            {/* Emoji row — promo only */}
            {!slide.imageUrl && (
              <div className="text-4xl mb-1.5 leading-none" style={{ filter: `drop-shadow(0 3px 10px ${accent}55)` }}>
                {slide.emoji}
              </div>
            )}

            {/* Title — big bold */}
            <h2
              className="font-black text-white leading-[1.08] mb-1.5"
              style={{
                fontSize: "clamp(1.35rem, 5vw, 1.9rem)",
                textShadow: `0 2px 18px rgba(0,0,0,0.92), 0 0 40px ${accent}20`,
                letterSpacing: "-0.015em",
              }}
            >
              {slide.title}
            </h2>

            {/* Subtitle */}
            {slide.subtitle && (
              <p className="text-white/65 text-sm leading-snug mb-3 max-w-xs line-clamp-2">
                {slide.subtitle}
              </p>
            )}

            {/* CTA button */}
            {(slide.videoId || slide.action) && (
              <button
                className="inline-flex items-center gap-1.5 font-black rounded-full transition-all active:scale-95"
                style={{
                  background: accent,
                  color: accent === "#EDE518" ? "#080808" : "#fff",
                  fontSize: "0.75rem",
                  padding: "0.45rem 1.1rem",
                  boxShadow: `0 3px 14px ${accent}45`,
                }}
              >
                {slide.videoId
                  ? <><Play className="h-3.5 w-3.5 fill-current" /> Watch Now</>
                  : <><Settings className="h-3.5 w-3.5" /> Open Settings</>
                }
              </button>
            )}
          </div>

          {/* Right: thumbnail for video banners */}
          {slide.imageUrl && (
            <div
              className="hidden sm:block flex-shrink-0 rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: 150, height: 105,
                border: `1.5px solid ${accent}45`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.65), 0 0 20px ${accent}22`,
              }}
            >
              <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center transition-all hover:scale-110 z-10 backdrop-blur-sm"
              data-testid="button-banner-prev"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center transition-all hover:scale-110 z-10 backdrop-blur-sm"
              data-testid="button-banner-next"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10" data-testid="banner-dots">
            {allSlides.map((s, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 24 : 6,
                  height: 6,
                  background: i === current ? s.accent : "rgba(255,255,255,0.3)",
                  boxShadow: i === current ? `0 0 8px ${s.accent}` : "none",
                }}
                data-testid={`banner-dot-${i}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {total > 1 && (
          <div className="absolute top-3 right-3 text-[10px] text-white/40 font-bold tabular-nums z-10">
            {current + 1} / {total}
          </div>
        )}
      </div>

      {openVideo && (
        <Dialog open={isOpenVideo} onOpenChange={(o) => { setIsOpenVideo(o); if (!o) setOpenVideo(null); }}>
          <VideoPlayer video={openVideo} onClose={() => { setIsOpenVideo(false); setOpenVideo(null); }} />
        </Dialog>
      )}
    </>
  );
}

// Shared ref so VideoCard can read LegacyVideoPlayer's live progress on close
const _liveVideoProgress = { videoId: "", pct: 0 };

// ── Joke Book ──────────────────────────────────────────────────────────────
const JOKES: { title: string; body: string }[] = [
  { title: "Bus #180", body: "An Amish man named Jeremiah asked which bus goes to the mall. A lady said, 'Bus 180.' That evening she sees him still waiting. He says, 'I'm still waiting — 176 buses passed, just four more!'" },
  { title: "Losing Weight", body: "Jeremiah sees a man go into an elevator, heavy — and come out skinny. He shouts 'Jacob, come quick!' and they race inside together." },
  { title: "Dropping Weight", body: "Jacob joins a gym. Three minutes later he's back in tears. 'There's a sign that says DO NOT DROP THE WEIGHT — but the whole reason I signed up was to drop the weight!'" },
  { title: "Press It with Your Elbow", body: "Grandmother calls: 'Why do I press all the buttons with my elbow?' Grandson: 'I'm sure your hands will be full of presents you're bringing me.'" },
  { title: "It Hurts Because It's Empty", body: "Jacob tells his stomachache secret: 'It hurts because it's empty — fill it up.' Weeks later the rabbi has a headache, and Jacob cheerfully suggests the same remedy." },
  { title: "Building a House", body: "A man builds a house exactly as the Gemara says. It collapses the next day. He runs to the rabbi. The rabbi says: 'Actually, Tosfos asks that question.'" },
  { title: "Peanuts", body: "The rabbi eats Mrs. Gold's peanuts while she talks. He apologizes. She smiles: 'Don't worry, Rabbi — I can't eat peanuts. I just like to nibble the chocolate off them.'" },
  { title: "Getting an Aliyah", body: "Izzy practiced the Torah blessings all week. At the bar mitzvah he stands up confidently and says 'Borechu es Hashem Hamevorach.' Everyone responds. He shouts: 'EVERYONE QUIET! I can do it myself!'" },
  { title: "Flucky", body: "Zalman got hit by a car. His wife panics: 'You have flucky!' Neighbors argue ice vs. heat. She calls the doctor: 'He got off LUCKY.'" },
  { title: "Up and Down", body: "Kids say 'wait UP, hold UP, stay UP.' Parents say 'calm DOWN, sit DOWN.' Then an adult says 'meet UP for ice cream?' And the kid says 'I'm DOWN.'" },
  { title: "75th Floor", body: "No elevator — 75 floors to climb! Guy 1 tells jokes, guy 2 sings, guy 3 tells sad stories. Floor 74: 'I have the saddest story of all… we left the key at the front desk.'" },
  { title: "A Worrier", body: "Robert hired someone to do all his worrying for him. His friend Steven asks: 'Where are you getting the money to pay him?' Robert says: 'Let him worry about that.'" },
  { title: "Dr. Geezer", body: "The farmer-turned-doctor cures Mark's lost taste with 'gasoline.' Then restores his memory with the same — 'That's gasoline!' — 'Congratulations, you got your memory back. $500 please.' When Mark claims lost vision: 'Here's $1000.' 'But it's only $500!' 'Congratulations — you got your vision back.'" },
  { title: "Too Many Questions", body: "Yossel saw his neighbor's Christmas tree and asked: which species of tree? Minimum height? Maximum? How close to the window? Do too many decorations disqualify it? The neighbor's father stormed over furious." },
  { title: "Hagbah", body: "Moishe, the weakest man, trained six months after an embarrassing Hagbah. He lifts the Torah perfectly, spins around, smiles at the gabbai. Gabbai: 'That was very nice. But we called you up for Shishi.'" },
  { title: "My Mother", body: "A girl skips school and calls in herself: 'Hi, Lauren Feldman is sick today.' Secretary: 'Who's calling?' Girl: '…This is my mother.'" },
  { title: "Slippers", body: "'I've got good news and bad news. Bad first?' 'Your legs have to come off.' 'And the good news?' 'Jose, our gardener, may be interested in buying your slippers.'" },
  { title: "Half Are Crooks", body: "Editor: HEADLINE: 'Half the Shul Members Are Crooks.' After pressure, the retraction: 'Half the Shul Members Are NOT Crooks.'" },
  { title: "Darts", body: "'Throw this dart at the map — wherever it lands, that's our vacation.' She throws it. They spend the vacation behind the fridge." },
  { title: "Detergent", body: "Grandfather's dirty plates: 'As clean as Detergent can clean them.' At the end: 'Detergent, get out of the way!' The dog's name was Detergent." },
  { title: "The Three Answers", body: "Zevi memorizes Nachum's answers: different place every day, three trillion, and 'the president is investigating.' The counselor asks Zevi's address. 'It's in a different place every day.' 'Your phone number?' 'Three trillion.'" },
  { title: "Unique", body: "Friend: 'When there's U-E at the end, they're silent. It's UNIQUE.' Other guy: 'Okay, I'm not going to ARG with you.'" },
  { title: "The Janitor's Vacuum", body: "Scientists couldn't explain why patients in Room 152 died every Tuesday at 11:25. They livestreamed it. At 11:25, the janitor walked in, unplugged the life support, and plugged in his vacuum." },
  { title: "Robert's Watch", body: "A truck knocked off Robert's car door — and his arm. The officer said 'Your arm is gone!' Robert screamed: 'MY WATCH! My brand-new watch is gone!'" },
  { title: "Yoni's Chessed", body: "'I did a great kindness today — me and nine friends helped an old lady cross the street!' Father: 'Why nine friends?' Yoni: 'She didn't really want to cross.'" },
  { title: "Lefties", body: "Lefties get a bad deal: two left hands, two left feet, left field, leftovers… and where did all the party guests go? THEY LEFT." },
  { title: "Vladimir's Electronics", body: "Vladimir's store was tiny, sandwiched between two huge electronics stores. His rabbi said: put up a sign reading 'CHEAP ELECTRONICS – MAIN ENTRANCE.'" },
  { title: "Cats #1", body: "Steven chases the cat out of the house. He finally gets in the Uber: 'Sorry I was late — the annoying thing was hiding under the bed and I had to poke her with a coat hanger to get her out.' The Uber driver now thinks he's talking about his mother-in-law." },
  { title: "Shema Yisroel", body: "The horse runs toward a cliff. Gavriel panics, can't remember the stop word. Tries every prayer he knows. Finally remembers — 'SHEMA YISRAEL!' Horse stops right at the cliff's edge. Gavriel exhales: 'Baruch Hashem!' — and the horse bolts again." },
  { title: "Carlos the Painter", body: "The can said 'For best results, use two coats' — so Carlos put on two coats. His own coat and one he found in the house." },
  { title: "Mud Coffee", body: "Carlos: 'This coffee tastes like mud.' Waiter points to the can: 'FRESH GROUND.'" },
  { title: "Brose", body: "Carlos: 'I was sniffing a brose.' Friend: 'You mean a ROSE?' Carlos: 'No, a brose.' Friend: 'There's no B in rose.' Carlos: 'Well, there was a bee in that rose.'" },
  { title: "Give Me a Push", body: "3am knock on the door: 'I need someone to push me!' The man sends him away. Wife guilts him into going back out. He searches in the dark: 'SIR, WHERE ARE YOU?' 'Over here — on the swings!'" },
  { title: "The Bottom Line", body: "When I was 20, I cared what everyone thought about me. At 30, I didn't care what others thought. At 60, I realized — no one was thinking about me at all." },
  { title: "Breaking News", body: "Breaking news: kidnapping at school at 12:15. Numerous rabbis and principals converged. At 12:40, the lunch bell rang — and the kid who was napping finally woke up." },
];

function JokeButton({ onGoToDocs }: { onGoToDocs: () => void }) {
  const [open, setOpen] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(() => Math.floor(Math.random() * JOKES.length));
  const [isAnimating, setIsAnimating] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  // Periodic speech bubble that peeks out from the joke button
  useEffect(() => {
    const BUBBLE_PHRASES = ["Need a laugh? 😂", "Tap me! 👆", "Joke time! 🎭", "Make me smile! 😁"];
    let phraseIdx = 0;
    const show = () => {
      setBubbleVisible(true);
      phraseIdx = (phraseIdx + 1) % BUBBLE_PHRASES.length;
      setTimeout(() => setBubbleVisible(false), 3200);
    };
    // first show after 8 seconds, then every 40 seconds
    const firstTimer = setTimeout(show, 8000);
    const interval = setInterval(show, 40000);
    return () => { clearTimeout(firstTimer); clearInterval(interval); };
  }, []);

  const nextJoke = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setJokeIndex(Math.floor(Math.random() * JOKES.length));
      setIsAnimating(false);
    }, 200);
  };

  const joke = JOKES[jokeIndex];

  const BUBBLE_PHRASES = ["Need a laugh? 😂", "Tap me! 👆", "Joke time! 🎭", "Make me smile! 😁"];
  const bubbleText = BUBBLE_PHRASES[jokeIndex % BUBBLE_PHRASES.length];

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[9000] flex flex-col items-end gap-1">
        {/* Animated speech bubble */}
        <div
          className="flex items-end gap-1 transition-all duration-500"
          style={{ opacity: bubbleVisible ? 1 : 0, transform: bubbleVisible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.9)", pointerEvents: "none" }}
        >
          <div className="relative bg-[#EDE518] text-black text-[11px] font-black px-3 py-1.5 rounded-2xl rounded-br-none shadow-lg whitespace-nowrap max-w-[140px]">
            {bubbleText}
            <div className="absolute bottom-0 right-0 w-0 h-0" style={{ borderLeft: "8px solid transparent", borderTop: "8px solid #EDE518", transform: "translateX(4px)" }} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 group">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg border border-white/10 pointer-events-none">
            Click for a one-time joke! 😂
          </div>
          <button
            onClick={() => { setJokeIndex(Math.floor(Math.random() * JOKES.length)); setOpen(true); setBubbleVisible(false); }}
            className="h-14 w-14 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_16px_rgba(237,229,24,0.25)] flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #EDE518 0%, #f5c800 100%)" }}
            data-testid="button-random-joke"
          >
            😂
          </button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" style={{ background: "linear-gradient(145deg, #060e1a 0%, #0a1628 100%)", border: "1px solid rgba(237,229,24,0.2)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#EDE518]">
              <span className="text-xl">😂</span> Today's Joke
            </DialogTitle>
          </DialogHeader>
          <div
            className="py-4 transition-all duration-200"
            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(8px)' : 'translateY(0)' }}
          >
            <h3 className="font-black text-white text-lg mb-3">{joke.title}</h3>
            <p className="text-slate-300 leading-relaxed text-sm">{joke.body}</p>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Button onClick={nextJoke} className="bg-[#EDE518] text-black font-bold hover:bg-[#f5d800] gap-2 w-full">
              <Shuffle className="h-4 w-4" /> Next Joke
            </Button>
            <Button
              variant="ghost"
              className="text-[#EDE518]/70 hover:text-[#EDE518] text-xs gap-1 border border-[#EDE518]/20 hover:border-[#EDE518]/50"
              onClick={() => { setOpen(false); onGoToDocs(); }}
            >
              <FileText className="h-3.5 w-3.5" /> Did you see the full joke book? Get it here →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Video Progress Context ──────────────────────────────────────────────────
const VideoProgressContext = createContext<Map<string, number>>(new Map());

// ── Mini Player Context ─────────────────────────────────────────────────────
type MiniPlayerState = { video: VideoType; streamUrl: string; currentTime: number; isAudio: boolean } | null;
const MiniPlayerContext = createContext<{ setMiniPlayer: (s: MiniPlayerState) => void }>({ setMiniPlayer: () => {} });

// ── Floating Mini Player ────────────────────────────────────────────────────
function FloatingMiniPlayer({ state, onClose, onExpand }: { state: MiniPlayerState; onClose: () => void; onExpand: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (audioRef.current && state?.isAudio) {
      audioRef.current.currentTime = state.currentTime;
      audioRef.current.play().catch(() => {});
    }
  }, [state]);

  useEffect(() => {
    if (!state?.isAudio) return;
    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        setElapsed(audioRef.current.currentTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  if (!state) return null;
  const thumbSrc = state.video.thumbnailPath ? `/api/videos/${state.video.id}/thumbnail` : null;
  const videoEmbedBase = !state.isAudio
    ? ((state.video as any).vimeoEmbedUrl || (state.video as any).vimeo_embed_url)
    : null;
  const miniVideoEmbedUrl = videoEmbedBase
    ? videoEmbedBase + (videoEmbedBase.includes("?") ? "&" : "?") + `autoplay=1&muted=0&t=${Math.floor(state.currentTime)}`
    : null;

  // Video mini player — YouTube-style corner player
  if (!state.isAudio && miniVideoEmbedUrl) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] w-[min(90vw,320px)] animate-in slide-in-from-bottom-4 duration-300 group">
        <div className="relative rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.9)] border border-white/10">
          {/* Video iframe */}
          <div className="aspect-video bg-black">
            <iframe
              src={miniVideoEmbedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              frameBorder="0"
              title={state.video.title}
            />
          </div>
          {/* Controls overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none group-hover:pointer-events-auto">
            {/* Top row: close */}
            <div className="flex justify-end">
              <button onClick={onClose} className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            {/* Bottom row: title + expand */}
            <div className="flex items-end gap-2">
              <p className="text-white text-xs font-semibold flex-1 line-clamp-1 drop-shadow">{state.video.title}</p>
              <button
                onClick={onExpand}
                className="h-8 w-8 rounded-full bg-[#EDE518] flex items-center justify-center flex-shrink-0 hover:bg-[#EDE518]/80"
              >
                <Maximize className="h-3.5 w-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Audio mini player (or video without embed URL — show compact bar)
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[min(90vw,420px)] animate-in slide-in-from-bottom-4 duration-300">
      {state.isAudio && (
        <audio ref={audioRef} src={state.streamUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} className="hidden" />
      )}
      <div className="bg-[#060e1a] border border-[#EDE518]/30 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(237,229,24,0.1)] overflow-hidden">
        <div className="flex items-center gap-3 p-2.5">
          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d1a35] flex items-center justify-center">
            {thumbSrc ? <img src={thumbSrc} alt="" className="w-full h-full object-cover" /> : <Music className="h-5 w-5 text-[#08779C]" />}
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
            <p className="text-white text-sm font-semibold truncate">{state.video.title}</p>
            <p className="text-slate-400 text-xs">{state.isAudio ? "Now Playing" : "Tap to resume"}</p>
          </div>
          {state.isAudio && (
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                }
              }}
              className="h-9 w-9 rounded-full bg-[#EDE518] flex items-center justify-center hover:bg-[#EDE518]/80 transition-colors flex-shrink-0"
            >
              {isPlaying ? <Pause className="h-4 w-4 text-black" /> : <Play className="h-4 w-4 text-black ml-0.5" />}
            </button>
          )}
          {!state.isAudio && (
            <button onClick={onExpand} className="h-9 w-9 rounded-full bg-[#EDE518] flex items-center justify-center hover:bg-[#EDE518]/80 flex-shrink-0">
              <Play className="h-4 w-4 text-black ml-0.5" />
            </button>
          )}
          <button onClick={onClose} className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0">
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        {state.isAudio && (
          <div className="h-0.5 bg-[#EDE518]/20 mx-2.5 mb-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#EDE518] transition-all duration-1000" style={{ width: `${state.video.duration ? Math.min(100, (elapsed / state.video.duration) * 100) : 0}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Branded Intro Animation ─────────────────────────────────────────────────
function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 2400);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none transition-opacity duration-700"
      style={{
        background: "linear-gradient(135deg, #020813 0%, #060e1a 50%, #030b18 100%)",
        opacity: phase === 'out' ? 0 : 1,
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      <div
        className="flex flex-col items-center gap-4 transition-all duration-500"
        style={{ opacity: phase === 'in' ? 0 : 1, transform: phase === 'in' ? 'scale(0.85) translateY(16px)' : 'scale(1) translateY(0)' }}
      >
        <div className="relative">
          <div className="absolute -inset-6 rounded-full blur-3xl opacity-30 animate-pulse" style={{ background: "#EDE518" }} />
          <div className="relative h-24 w-24 rounded-full bg-[#EDE518] flex items-center justify-center shadow-[0_0_60px_rgba(237,229,24,0.5)]">
            <Play className="h-12 w-12 text-black ml-1" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: "0 0 40px rgba(237,229,24,0.4)" }}>
            One Time<span style={{ color: "#EDE518" }}>.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">Rabbi Eli Scheller</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-[#EDE518]"
              style={{
                width: phase === 'hold' ? (i === 1 ? 24 : 6) : 6,
                opacity: phase === 'hold' ? (i === 1 ? 1 : 0.4) : 0.3,
                transition: `all 0.4s ease ${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();

  // Track dashboard page view once on load
  useEffect(() => {
    trackEvent({ eventType: "page_view", resourceType: "page", resourceTitle: "Dashboard" });
  }, []);

  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Display Preferences (localStorage) ────────────────────────────────────
  const [textSize, setTextSizeState] = useState<'small'|'normal'|'large'>(() => {
    return (localStorage.getItem("pref_textSize") as any) || "normal";
  });
  const [cardSize, setCardSizeState] = useState<'compact'|'normal'|'large'>(() => {
    return (localStorage.getItem("pref_cardSize") as any) || "normal";
  });
  const [autoplayNext, setAutoplayNextState] = useState<boolean>(() => {
    return localStorage.getItem("pref_autoplayNext") === "true";
  });
  const [showCardDescriptions, setShowCardDescriptionsState] = useState<boolean>(() => {
    return localStorage.getItem("pref_showCardDescriptions") !== "false";
  });
  const [sortOrder, setSortOrderState] = useState<'default'|'newest'|'oldest'|'az'|'popular'>(() => {
    return (localStorage.getItem("pref_sortOrder") as any) || "default";
  });
  const [hideWatched, setHideWatchedState] = useState<boolean>(() => localStorage.getItem("pref_hideWatched") === "true");
  const [showNewBadges, setShowNewBadgesState] = useState<boolean>(() => localStorage.getItem("pref_showNewBadges") !== "false");
  const [showViewCounts, setShowViewCountsState] = useState<boolean>(() => localStorage.getItem("pref_showViewCounts") !== "false");
  const [loopVideo, setLoopVideoState] = useState<boolean>(() => localStorage.getItem("pref_loopVideo") === "true");
  const [defaultSpeed, setDefaultSpeedState] = useState<number>(() => parseFloat(localStorage.getItem("pref_defaultSpeed") || "1"));
  const [defaultCategory, setDefaultCategoryState] = useState<string>(() => localStorage.getItem("pref_defaultCategory") || "");

  const applyTextSize = (v: 'small'|'normal'|'large') => {
    document.documentElement.style.fontSize = v === 'small' ? '13px' : v === 'large' ? '18px' : '16px';
  };
  useEffect(() => { applyTextSize(textSize); }, [textSize]);
  const setTextSize = (v: 'small'|'normal'|'large') => { setTextSizeState(v); localStorage.setItem("pref_textSize", v); applyTextSize(v); };
  const setCardSize = (v: 'compact'|'normal'|'large') => { setCardSizeState(v); localStorage.setItem("pref_cardSize", v); };
  const setAutoplayNext = (v: boolean) => { setAutoplayNextState(v); localStorage.setItem("pref_autoplayNext", String(v)); };
  const setShowCardDescriptions = (v: boolean) => { setShowCardDescriptionsState(v); localStorage.setItem("pref_showCardDescriptions", String(v)); };
  const setSortOrder = (v: 'default'|'newest'|'oldest'|'az'|'popular') => { setSortOrderState(v); localStorage.setItem("pref_sortOrder", v); };
  const setHideWatched = (v: boolean) => { setHideWatchedState(v); localStorage.setItem("pref_hideWatched", String(v)); };
  const setShowNewBadges = (v: boolean) => { setShowNewBadgesState(v); localStorage.setItem("pref_showNewBadges", String(v)); };
  const setShowViewCounts = (v: boolean) => { setShowViewCountsState(v); localStorage.setItem("pref_showViewCounts", String(v)); };
  const setLoopVideo = (v: boolean) => { setLoopVideoState(v); localStorage.setItem("pref_loopVideo", String(v)); };
  const setDefaultSpeed = (v: number) => { setDefaultSpeedState(v); localStorage.setItem("pref_defaultSpeed", String(v)); };
  const setDefaultCategory = (v: string) => { setDefaultCategoryState(v); localStorage.setItem("pref_defaultCategory", v); };
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [surpriseVideoId, setSurpriseVideoId] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const liveViewerCount = useMemo(() => Math.floor(Math.random() * 16) + 8, []);
  const [previewMode, setPreviewMode] = useState<"standard" | "plus">("standard");
  const recentScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const [trendingCanScrollLeft, setTrendingCanScrollLeft] = useState(false);
  const [trendingCanScrollRight, setTrendingCanScrollRight] = useState(true);
  const [showTrending, setShowTrending] = useState(true);

  // ── Parental Controls state ────────────────────────────────────────────────
  const [isPinUnlockOpen, setIsPinUnlockOpen] = useState(false);
  const [pinUnlockEntry, setPinUnlockEntry] = useState("");
  const [pinUnlockError, setPinUnlockError] = useState("");
  const [pinUnlockCallback, setPinUnlockCallback] = useState<(() => void) | null>(null);
  const [parentalUnlockExpiry, setParentalUnlockExpiry] = useState<number | null>(null);
  const parentalUnlockExpiryRef = useRef<number | null>(null);
  const [isParentalSetupOpen, setIsParentalSetupOpen] = useState(false);
  const [pcSetupStep, setPcSetupStep] = useState<'form' | 'confirm'>('form');
  const [pcEmail, setPcEmail] = useState("");
  const [pcPin, setPcPin] = useState("");
  const [pcPinConfirm, setPcPinConfirm] = useState("");
  const [pcCurrentPin, setPcCurrentPin] = useState("");
  const [pcLimitHours, setPcLimitHours] = useState("1");
  const [pcPeriod, setPcPeriod] = useState("day");
  const [pcCategoryAll, setPcCategoryAll] = useState(true);
  const [pcCategoryIds, setPcCategoryIds] = useState<string[]>([]);
  const [pcStep, setPcStep] = useState(0);
  const [pcPromoStep, setPcPromoStep] = useState(0);
  const [isDisablingParental, setIsDisablingParental] = useState(false);
  const [pcDisablePin, setPcDisablePin] = useState("");

  // ── Fuzzy search helper - normalizes and checks if search terms appear in text
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query.trim()) return true;
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    return terms.every(term => {
      const normalizedTerm = term.replace(/[^a-z0-9]/g, '');
      return normalizedText.includes(normalizedTerm);
    });
  };

  const { data: announcement } = useQuery<{ text: string; isActive: boolean; imageUrl: string | null }>({
    queryKey: ["/api/announcement"],
    refetchInterval: 60_000,
  });

  const { data: banners = [] } = useQuery<BannerItem[]>({
    queryKey: ["/api/banners"],
    refetchInterval: 120_000,
  });

  // Record a session ping when the dashboard loads
  useEffect(() => {
    fetch("/api/session-ping", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    }).catch(() => {});
  }, []);

  const { data: phoneNumbers, isLoading: phonesLoading } = useQuery<PhoneNumber[]>({
    queryKey: ["/api/phone-numbers"],
  });

  const { data: subscription, isLoading: subLoading } = useQuery<any>({
    queryKey: ["/api/subscription"],
  });

  // Calculate subscription status early so we can conditionally fetch content
  const daysRemaining = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const hasActiveSubscription = user?.subscriptionStatus === "active" || 
    (user?.subscriptionStatus === "trial" && daysRemaining > 0) ||
    user?.isWhitelistedEmail === true;

  // Only fetch content if user has active subscription
  const { data: videos, isLoading: videosLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos"],
    enabled: hasActiveSubscription,
  });

  const { data: categories = [] } = useQuery<VideoCategory[]>({
    queryKey: ["/api/video-categories"],
  });

  // Parental Controls query
  const { data: parentalData } = useQuery<any>({
    queryKey: ["/api/parental-controls"],
    refetchInterval: 60_000,
    enabled: hasActiveSubscription && user?.role !== "admin",
  });

  const isParentalUnlocked = parentalUnlockExpiry !== null && Date.now() < parentalUnlockExpiry;

  // Keep ref in sync so isVideoBlocked always reads the latest value (no stale closure)
  useEffect(() => {
    parentalUnlockExpiryRef.current = parentalUnlockExpiry;
  }, [parentalUnlockExpiry]);

  const isVideoBlocked = (categoryId?: string | null): boolean => {
    if (!parentalData?.isEnabled) return false;
    // Use the ref so this always checks the live unlock state
    const expiry = parentalUnlockExpiryRef.current;
    if (expiry !== null && Date.now() < expiry) return false;
    const timeLimitSeconds = (parentalData.timeLimitMinutes ?? 0) * 60;
    const timeUsedSeconds = parentalData.timeUsedSeconds ?? 0;
    if (timeUsedSeconds < timeLimitSeconds) return false;
    // Check if restriction applies to this category
    if (!parentalData.categoryIds || parentalData.categoryIds.length === 0) return true;
    return !!categoryId && parentalData.categoryIds.includes(categoryId);
  };

  const requestUnlock = (callback: () => void) => {
    setPinUnlockCallback(() => callback);
    setPinUnlockEntry("");
    setPinUnlockError("");
    setIsPinUnlockOpen(true);
  };

  const verifyPinMutation = useMutation({
    mutationFn: (pin: string) => apiRequest("POST", "/api/parental-controls/verify-pin", { pin }),
    onSuccess: async (data: any) => {
      if (data.valid) {
        const expiry = Date.now() + 30 * 60 * 1000;
        parentalUnlockExpiryRef.current = expiry;
        setParentalUnlockExpiry(expiry);
        setIsPinUnlockOpen(false);
        if (pinUnlockCallback) {
          pinUnlockCallback();
          setPinUnlockCallback(null);
        }
        toast({ title: "Unlocked for 30 minutes" });
      } else {
        setPinUnlockError("Incorrect PIN. Please try again.");
      }
    },
    onError: () => setPinUnlockError("Something went wrong. Try again."),
  });

  const setupParentalMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/parental-controls", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parental-controls"] });
      setIsParentalSetupOpen(false);
      setPcPin(""); setPcPinConfirm(""); setPcCurrentPin(""); setPcEmail("");
      toast({ title: "Parental controls saved" });
    },
    onError: (err: any) => toast({ title: err.message || "Failed to save parental controls", variant: "destructive" }),
  });

  const disableParentalMutation = useMutation({
    mutationFn: (pin: string) => apiRequest("POST", "/api/parental-controls/disable", { pin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parental-controls"] });
      setIsDisablingParental(false);
      setPcDisablePin("");
      toast({ title: "Parental controls disabled" });
    },
    onError: (err: any) => toast({ title: err.message || "Incorrect PIN", variant: "destructive" }),
  });

  const parentalCtxValue: ParentalControlsCtx = {
    isEnabled: !!parentalData?.isEnabled,
    isVideoBlocked,
    requestUnlock,
    timeUsedSeconds: parentalData?.timeUsedSeconds ?? 0,
    timeLimitSeconds: (parentalData?.timeLimitMinutes ?? 0) * 60,
    timePeriod: parentalData?.timePeriod ?? 'day',
  };

  // Top-level categories (no parent) for display
  const topLevelCategories = useMemo(() => {
    return categories.filter(c => !c.parentCategoryId);
  }, [categories]);

  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parentCategoryId === parentId);
  };

  // Track expanded categories (showing subcategories)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: trendingVideos = [] } = useQuery<VideoType[]>({
    queryKey: ["/api/videos/trending"],
    enabled: hasActiveSubscription,
  });

  const { data: viewedData } = useQuery<{ viewedVideoIds: string[] }>({
    queryKey: ["/api/videos/viewed"],
    enabled: hasActiveSubscription,
  });
  const viewedVideoIds = viewedData?.viewedVideoIds || [];

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: hasActiveSubscription,
  });

  const { data: albums, isLoading: albumsLoading } = useQuery<(Album & { trackCount: number })[]>({
    queryKey: ["/api/albums"],
    enabled: hasActiveSubscription,
  });

  const isPlus = user?.role === "admin" ? previewMode === "plus" : user?.accountType === "plus";

  const liveMeetingEndpoint = user?.role === "admin" ? "/api/admin/live-meeting" : "/api/live-meeting";

  const { data: liveMeeting } = useQuery<{ meetingUrl: string; isActive: boolean; updatesText: string }>({
    queryKey: [liveMeetingEndpoint],
    queryFn: async () => {
      const res = await fetch(liveMeetingEndpoint, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Not available");
      return res.json();
    },
    enabled: isPlus,
    refetchInterval: 10_000,
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: hasActiveSubscription,
    refetchInterval: 60_000,
  });
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  // ── Email Notification Preference ──────────────────────────────────────────
  const emailPrefMutation = useMutation({
    mutationFn: (emailNotifications: boolean) => apiRequest("PATCH", "/api/user/preferences", { emailNotifications }),
    onSuccess: () => { refreshUser(); toast({ title: "Notification preference saved" }); },
    onError: () => toast({ title: "Failed to save preference", variant: "destructive" }),
  });

  // ── Family Name ─────────────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameMutation = useMutation({
    mutationFn: (familyName: string) => apiRequest("PATCH", "/api/user/preferences", { familyName }),
    onSuccess: () => { refreshUser(); setEditingName(false); toast({ title: "Name updated" }); },
    onError: () => toast({ title: "Failed to update name", variant: "destructive" }),
  });

  // ── Favorites & Saved Stories ──────────────────────────────────────────────
  const { data: favoritedIds = [] } = useQuery<string[]>({
    queryKey: ["/api/user/favorites"],
    enabled: hasActiveSubscription,
  });
  const savedStories = useMemo(() => {
    if (!videos || !favoritedIds.length) return [];
    return favoritedIds
      .map(id => videos.find(v => v.id === id))
      .filter(Boolean)
      .filter(v => (v as VideoType).mediaType === "audio" || (v as any).media_type === "audio") as VideoType[];
  }, [videos, favoritedIds]);
  const favoriteVideos = useMemo(() => {
    if (!videos || !favoritedIds.length) return [];
    return favoritedIds
      .map(id => videos.find(v => v.id === id))
      .filter(Boolean)
      .filter(v => (v as VideoType).mediaType !== "audio" && (v as any).media_type !== "audio") as VideoType[];
  }, [videos, favoritedIds]);

  // ── Continue Watching ──────────────────────────────────────────────────────
  const { data: continueWatching = [] } = useQuery<any[]>({
    queryKey: ["/api/user/continue-watching"],
    enabled: hasActiveSubscription,
  });

  // ── Mini Player & Intro Animation state ───────────────────────────────────
  const [miniPlayerState, setMiniPlayerState] = useState<MiniPlayerState>(null);
  const [miniExpandVideo, setMiniExpandVideo] = useState<VideoType | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try { return !sessionStorage.getItem("intro_shown"); } catch { return false; }
  });

  // ── Video Progress Map ─────────────────────────────────────────────────────
  const progressMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of continueWatching) {
      if (item.duration_seconds > 0) {
        m.set(String(item.video_id), Math.min(99, Math.round((item.position_seconds / item.duration_seconds) * 100)));
      }
    }
    return m;
  }, [continueWatching]);

  // ── Mood Filter Logic ──────────────────────────────────────────────────────
  // Each keyword is matched against lowercase category names using `name.includes(kw)`
  // Actual DB categories: Eiruvin, Emunah Stories, Everyday Life, Films, Gemara, History & Miracles,
  // Interviews, Just Kidding Podcast, Middos & Character, Mishnayos, Music Videos, Navi, OneDafOneDaf,
  // Pesachim, Pirkei Avos, Series / Ongoing, Shabbos, Shabbos Stories, Shekalim, Shorts, Stories,
  // Taanis, Tzaddikim Stories, Vloging with Reb Eli, Yom Tov Stories
  const MOOD_KEYWORDS: Record<string, string[]> = {
    funny:  ["just kidding","kidding","films","shorts","vloging","vlog","funny","comedy","purim","shpiel","prank","laugh"],
    crazy:  ["everyday life","everyday","history","miracles","interview","series","ongoing","adventure","wild","sport"],
    smart:  ["gemara","navi","eiruvin","mishnayos","pesachim","pirkei","avos","shekalim","taanis","onedaf","middos","character","shabbos","learning"],
    chill:  ["music","emunah","tzaddikim","yom tov","stories","story"],
  };

  const moodMatchedVideoIds = useMemo<Set<string> | null>(() => {
    if (!moodFilter || moodFilter === "open" || !videos || !categories) return null;
    const keywords = MOOD_KEYWORDS[moodFilter] || [];
    const matchedCatIds = new Set<string>();
    categories.forEach((cat: any) => {
      const name = (cat.name || "").toLowerCase();
      if (keywords.some(kw => name.includes(kw))) matchedCatIds.add(cat.id);
    });
    const matchedVideoIds = new Set<string>();
    videos.forEach(v => {
      // Admin-assigned mood override takes priority
      const customMood = (v as any).customMood || (v as any).custom_mood;
      if (customMood) {
        if (customMood === moodFilter) matchedVideoIds.add(v.id);
        return; // Don't also check keyword matching if admin assigned a mood
      }
      // Keyword-based category matching
      const inMatchedCat = v.categoryId && matchedCatIds.has(v.categoryId);
      const titleMatch = keywords.some(kw => (v.title || "").toLowerCase().includes(kw));
      if (inMatchedCat || titleMatch) matchedVideoIds.add(v.id);
    });
    return matchedVideoIds;
  }, [moodFilter, videos, categories]);

  const videosByCategory = useMemo(() => {
    if (!videos) return {};
    const grouped: Record<string, VideoType[]> = {};
    const uncategorized: VideoType[] = [];
    
    videos.forEach(video => {
      if (video.categoryId) {
        if (!grouped[video.categoryId]) {
          grouped[video.categoryId] = [];
        }
        grouped[video.categoryId].push(video);
      } else {
        uncategorized.push(video);
      }
    });

    return { grouped, uncategorized };
  }, [videos]);

  const getCategoryVideoCount = (categoryId: string): number => {
    const grouped = (videosByCategory as any).grouped || {};
    const subcats = getSubcategories ? getSubcategories(categoryId) : [];
    let count = (grouped[categoryId] || []).length;
    subcats.forEach((s: any) => { count += (grouped[s.id] || []).length; });
    return count;
  };

  const handleSurpriseMe = () => {
    if (!videos || videos.length === 0) return;
    const pool = videos.filter(v => v.mediaType !== "album" && v.mediaType !== "document");
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseVideoId(pick.id);
    if (pick.categoryId) {
      setSelectedCategory(pick.categoryId);
    }
    setSearchQuery("");
  };

  // Set default category to preference or first available category when loaded
  useEffect(() => {
    if (selectedCategory === null && categories.length > 0) {
      const preferred = defaultCategory && categories.find(c => c.id === defaultCategory);
      const target = preferred || categories[0];
      setSelectedCategory(target.id);
      if (!target.parentCategoryId) {
        setExpandedCategory(target.id);
      }
    }
  }, [categories, selectedCategory]);

  const markVideoViewedMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/viewed`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/viewed"] });
    },
  });

  // Check if a video is new (uploaded in last 24 hours and not viewed by user)
  const isVideoNew = (video: VideoType): boolean => {
    if (!showNewBadges) return false;
    if (!video.createdAt) return false;
    const uploadedAt = new Date(video.createdAt);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isRecent = uploadedAt > oneDayAgo;
    const hasViewed = viewedVideoIds.includes(video.id);
    return isRecent && !hasViewed;
  };

  // Get 10 most recent videos for the Recent section (excluding videos marked as excluded)
  const recentVideos = useMemo(() => {
    if (!videos) return [];
    return [...videos]
      .filter(v => !v.excludeFromRecent)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [videos]);

  // Get search results (when searching)
  const searchResults = useMemo(() => {
    if (!videos || !searchQuery.trim()) return [];
    return videos.filter(v => fuzzyMatch(v.title, searchQuery));
  }, [videos, searchQuery]);
  
  // Get filtered content based on selected category (always shows category videos)
  // When a main category is selected, show ALL videos from that category AND its subcategories
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (selectedCategory === null) return [];
    if (selectedCategory === "documents") return [];
    if (selectedCategory === "albums") return [];
    let result: VideoType[];
    if (selectedCategory === "uncategorized") {
      result = videos.filter(v => !v.categoryId);
    } else {
      const isMainCategory = topLevelCategories.some(c => c.id === selectedCategory);
      if (isMainCategory) {
        const subcategoryIds = getSubcategories(selectedCategory).map(s => s.id);
        result = videos.filter(v => v.categoryId === selectedCategory || subcategoryIds.includes(v.categoryId || ""));
      } else {
        result = videos.filter(v => v.categoryId === selectedCategory);
      }
    }
    if (hideWatched) {
      result = result.filter(v => !viewedVideoIds.includes(v.id));
    }
    if (moodFilter && moodMatchedVideoIds) {
      result = result.filter(v => moodMatchedVideoIds.has(v.id));
    }
    return result;
  }, [videos, selectedCategory, topLevelCategories, getSubcategories, hideWatched, viewedVideoIds, moodFilter, moodMatchedVideoIds]);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (recentScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = recentScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Scroll functions for Recent section
  const scrollRecent = (direction: "left" | "right") => {
    if (recentScrollRef.current) {
      const scrollAmount = 300;
      recentScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Check scroll position on mount and when videos change
  useEffect(() => {
    checkScrollPosition();
    const scrollEl = recentScrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", checkScrollPosition);
      return () => scrollEl.removeEventListener("scroll", checkScrollPosition);
    }
  }, [recentVideos]);

  // Check trending scroll position
  const checkTrendingScrollPosition = () => {
    if (trendingScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trendingScrollRef.current;
      setTrendingCanScrollLeft(scrollLeft > 5);
      setTrendingCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Scroll functions for Trending section
  const scrollTrending = (direction: "left" | "right") => {
    if (trendingScrollRef.current) {
      const scrollAmount = 300;
      trendingScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Check trending scroll position on mount and when videos change
  useEffect(() => {
    checkTrendingScrollPosition();
    const scrollEl = trendingScrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", checkTrendingScrollPosition);
      return () => scrollEl.removeEventListener("scroll", checkTrendingScrollPosition);
    }
  }, [trendingVideos]);

  const addPhoneMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/phone-numbers", { phoneNumber });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-numbers"] });
      toast({ title: "Phone number added", description: "Your new phone number has been registered." });
      setNewPhoneNumber("");
      setPhoneCountryCode("+1");
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

  const updatePhoneMutation = useMutation({
    mutationFn: async ({ id, phoneNumber }: { id: string; phoneNumber: string }) => {
      const res = await apiRequest("PUT", `/api/phone-numbers/${id}`, { phoneNumber });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-numbers"] });
      toast({ title: "Phone number updated" });
      setIsEditingPhone(false);
      setNewPhoneNumber("");
      setPhoneCountryCode("+1");
    },
    onError: (error: any) => {
      toast({ title: "Failed to update phone", description: error.message, variant: "destructive" });
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

  const createPlusCheckoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/create-plus-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
    },
  });

  // Direct Messaging (Plus-only)
  const [dmText, setDmText] = useState("");
  const { data: dmMessages = [], refetch: refetchDms } = useQuery<{ id: string; text: string; fromAdmin: boolean; createdAt: string }[]>({
    queryKey: ["/api/direct-messages"],
    enabled: isPlus,
    refetchInterval: isPlus ? 8000 : false,
  });
  const sendDmMutation = useMutation({
    mutationFn: (text: string) => apiRequest("POST", "/api/direct-messages", { text }),
    onSuccess: () => {
      setDmText("");
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages"] });
    },
    onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/auth/change-password", { currentPassword, newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to change password", description: error.message, variant: "destructive" });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

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

  const registeredPhone = phoneNumbers?.[0];

  return (
    <MiniPlayerContext.Provider value={{ setMiniPlayer: setMiniPlayerState }}>
    <VideoProgressContext.Provider value={progressMap}>
    <ParentalControlsContext.Provider value={parentalCtxValue}>
    {/* ── PIN Unlock Dialog ────────────────────────────────────────────── */}
    <Dialog open={isPinUnlockOpen} onOpenChange={(o) => { setIsPinUnlockOpen(o); if (!o) setPinUnlockCallback(null); }}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-[#EDE518]" />Parent Unlock</DialogTitle>
          <DialogDescription>Enter your 4-digit parental PIN to unlock videos for 30 minutes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter PIN"
            value={pinUnlockEntry}
            onChange={(e) => { setPinUnlockEntry(e.target.value); setPinUnlockError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" && pinUnlockEntry) verifyPinMutation.mutate(pinUnlockEntry); }}
            data-testid="input-parental-pin-unlock"
            autoFocus
          />
          {pinUnlockError && <p className="text-xs text-red-400">{pinUnlockError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsPinUnlockOpen(false)}>Cancel</Button>
          <Button onClick={() => verifyPinMutation.mutate(pinUnlockEntry)} disabled={!pinUnlockEntry || verifyPinMutation.isPending} data-testid="button-parental-pin-submit">
            {verifyPinMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Unlock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ── Parental Controls Setup Dialog ──────────────────────────────── */}
    <Dialog open={isParentalSetupOpen} onOpenChange={setIsParentalSetupOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[92vh] p-0" style={{ background: "linear-gradient(145deg, #060e1a 0%, #0a1628 100%)", border: "1px solid rgba(237,229,24,0.15)" }}>
        {/* Header */}
        <div className="relative overflow-hidden px-6 pt-6 pb-4 border-b border-white/5">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15 blur-3xl" style={{ background: "#EDE518" }} />
          <div className="flex items-center gap-3 relative">
            <div className="h-11 w-11 rounded-2xl bg-[#EDE518] flex items-center justify-center shadow-[0_0_20px_rgba(237,229,24,0.3)]">
              <ShieldCheck className="h-6 w-6 text-black" />
            </div>
            <div>
              <DialogTitle className="text-white font-black text-lg">
                {parentalData ? "Edit Parental Controls" : "Set Up Parental Controls"}
              </DialogTitle>
              <p className="text-slate-400 text-xs mt-0.5">Kids stay safe — you stay in control</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* How to activate — step-by-step slideshow */}
          {(() => {
            const PC_STEPS = [
              { emoji: "⚙️", title: "Open Settings", text: "Tap the gear icon in the top right corner of the dashboard." },
              { emoji: "🛡️", title: "Tap Parental Controls", text: "Find 'Parental Controls' in the settings menu and tap it." },
              { emoji: "🔒", title: "Create a Secret PIN", text: "Choose a 4–6 digit PIN that only YOU know — kids can't guess it!" },
              { emoji: "⏱️", title: "Set Time Limits", text: "Pick a daily, weekly, or monthly time limit. Choose which categories to restrict." },
              { emoji: "✅", title: "Save & Done!", text: "Tap 'Activate Parental Controls' — protection starts right away!" },
            ];
            return (
              <div className="rounded-2xl border border-[#EDE518]/25 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(237,229,24,0.04) 0%, rgba(8,119,156,0.04) 100%)" }}>
                <div className="px-5 pt-5 pb-4 text-center min-h-[120px] flex flex-col items-center justify-center gap-2">
                  <div className="text-4xl mb-1">{PC_STEPS[pcStep].emoji}</div>
                  <p className="text-[#EDE518] font-black text-sm">{PC_STEPS[pcStep].title}</p>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-xs">{PC_STEPS[pcStep].text}</p>
                </div>
                <div className="px-5 pb-4 flex items-center gap-3">
                  <button
                    onClick={() => setPcStep(s => Math.max(0, s - 1))}
                    disabled={pcStep === 0}
                    className="h-7 w-7 rounded-full flex items-center justify-center border border-white/10 transition-all disabled:opacity-25 hover:border-[#EDE518]/40"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1.5">
                    {PC_STEPS.map((_, i) => (
                      <button key={i} onClick={() => setPcStep(i)}
                        className="rounded-full transition-all"
                        style={{ width: i === pcStep ? 20 : 6, height: 6, background: i === pcStep ? "#EDE518" : "rgba(255,255,255,0.2)" }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setPcStep(s => Math.min(PC_STEPS.length - 1, s + 1))}
                    disabled={pcStep === PC_STEPS.length - 1}
                    className="h-7 w-7 rounded-full flex items-center justify-center border border-white/10 transition-all disabled:opacity-25 hover:border-[#EDE518]/40"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Form fields */}
          <div className="space-y-4">
            {parentalData && (
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Current PIN (required to make changes)</Label>
                <Input type="password" inputMode="numeric" maxLength={6} placeholder="Your current PIN" value={pcCurrentPin} onChange={(e) => setPcCurrentPin(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-[#EDE518]/50" data-testid="input-pc-current-pin" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Parent Email</Label>
              <Input type="email" placeholder="parent@example.com" value={pcEmail} onChange={(e) => setPcEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-[#EDE518]/50" data-testid="input-pc-email" />
              <p className="text-xs text-slate-600">For your records only</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">New PIN</Label>
                <Input type="password" inputMode="numeric" maxLength={6} placeholder="4–6 digits" value={pcPin} onChange={(e) => setPcPin(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-[#EDE518]/50" data-testid="input-pc-pin" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Confirm PIN</Label>
                <Input type="password" inputMode="numeric" maxLength={6} placeholder="Same PIN" value={pcPinConfirm} onChange={(e) => setPcPinConfirm(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-[#EDE518]/50" data-testid="input-pc-pin-confirm" />
              </div>
            </div>
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Screen Time Limit</span>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Limit</Label>
                  <Select value={pcLimitHours} onValueChange={setPcLimitHours}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-pc-limit"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["0.25","0.5","1","1.5","2","3","4","5","6","8","10","12","15","20"].map(h => (
                        <SelectItem key={h} value={h}>
                          {Number(h) < 1 ? `${Number(h)*60} min` : `${h} hr${Number(h) !== 1 ? 's' : ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Period</Label>
                  <Select value={pcPeriod} onValueChange={setPcPeriod}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-pc-period"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Per Day</SelectItem>
                      <SelectItem value="week">Per Week</SelectItem>
                      <SelectItem value="month">Per Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Apply limit to</Label>
              <p className="text-xs text-slate-600">Tap to select which categories to restrict:</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setPcCategoryAll(true); setPcCategoryIds([]); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${pcCategoryAll || pcCategoryIds.length === 0 ? 'bg-[#EDE518] text-black border-[#EDE518]' : 'border-white/10 text-slate-400 bg-white/5 hover:border-[#EDE518]/40'}`}
                  data-testid="button-pc-all-categories">All Categories</button>
                {categories.map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => { setPcCategoryAll(false); setPcCategoryIds(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]); }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${pcCategoryIds.includes(cat.id) ? 'bg-[#EDE518] text-black border-[#EDE518]' : 'border-white/10 text-slate-400 bg-white/5 hover:border-[#EDE518]/40'}`}
                    data-testid={`button-pc-cat-${cat.id}`}>
                    {cat.parentCategoryId ? `↳ ${cat.name}` : cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="border-white/10 text-slate-400 hover:text-white hover:border-white/20" onClick={() => setIsParentalSetupOpen(false)}>Cancel</Button>
          <Button
            className="flex-1 bg-[#EDE518] text-black font-bold hover:bg-[#EDE518]/90 shadow-[0_0_16px_rgba(237,229,24,0.3)]"
            onClick={() => {
              if (pcPin !== pcPinConfirm) { toast({ title: "PINs do not match", variant: "destructive" }); return; }
              if (pcPin.length < 4) { toast({ title: "PIN must be at least 4 digits", variant: "destructive" }); return; }
              if (!pcEmail) { toast({ title: "Parent email is required", variant: "destructive" }); return; }
              const limitMinutes = Math.round(Number(pcLimitHours) * 60);
              setupParentalMutation.mutate({
                pin: pcPin, currentPin: pcCurrentPin || undefined,
                parentEmail: pcEmail, timeLimitMinutes: limitMinutes,
                timePeriod: pcPeriod, categoryIds: pcCategoryAll ? [] : pcCategoryIds,
              });
            }}
            disabled={setupParentalMutation.isPending}
            data-testid="button-pc-save"
          >
            {setupParentalMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
            {parentalData ? "Save Changes" : "Activate Parental Controls"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <div className="min-h-screen" style={{background: "radial-gradient(ellipse at 15% 10%, rgba(237,229,24,0.13) 0%, transparent 45%), radial-gradient(ellipse at 85% 15%, rgba(8,119,156,0.18) 0%, transparent 45%), radial-gradient(ellipse at 75% 60%, rgba(237,229,24,0.09) 0%, transparent 40%), radial-gradient(ellipse at 20% 75%, rgba(8,119,156,0.14) 0%, transparent 45%), radial-gradient(ellipse at 50% 40%, rgba(8,50,120,0.20) 0%, transparent 60%), linear-gradient(160deg, #060e20 0%, #071830 40%, #060f1e 70%, #07101f 100%)"}}>
      <header className="sticky top-0 z-50 border-b border-[#EDE518]/20" style={{background: "linear-gradient(90deg, #040d1a 0%, #081630 50%, #040d1a 100%)", backdropFilter: "blur(12px)"}}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.webp" 
              alt="OneTimeOneTime" 
              className="h-10 w-auto"
            />
            <div>
              <span className="text-xl font-bold text-white block leading-tight">OneTimeOneTime</span>
              {user?.familyName && (
                <span className="text-xs text-[#EDE518]/80 font-medium leading-tight block">Hello, {user.familyName}!</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {hasActiveSubscription && (
              <DropdownMenu open={isNotifOpen} onOpenChange={(o) => { setIsNotifOpen(o); if (o && unreadCount > 0) markAllReadMutation.mutate(); }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 min-h-[44px] min-w-[44px]" data-testid="button-notifications">
                    {unreadCount > 0 ? <BellDot className="h-5 w-5 text-[#EDE518]" /> : <Bell className="h-5 w-5 text-white/80" />}
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#EDE518] text-black text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.map((n: any) => (
                      <DropdownMenuItem key={n.id} className={`flex flex-col items-start gap-1 py-3 ${!n.read_at ? "bg-[#EDE518]/5" : ""}`}>
                        <div className="flex items-center gap-2 w-full">
                          <span className="font-medium text-sm flex-1">{n.title}</span>
                          {!n.read_at && <span className="h-2 w-2 rounded-full bg-[#EDE518] flex-shrink-0" />}
                        </div>
                        {n.body && <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="destructive" size="sm" data-testid="button-admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 min-h-[44px] min-w-[44px]" title="Settings" data-testid="button-account-settings">
                    <Settings className="h-5 w-5 text-white/80" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md overflow-y-auto max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                      Manage your account, phone number, and billing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Email Display */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Account</h3>
                      <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium" data-testid="text-user-email">{user?.email}</p>
                      </div>
                    </div>

                    {/* Family Name */}
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Display Name
                      </h3>
                      {editingName ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. The Goldberg Family"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            autoFocus
                            data-testid="input-family-name"
                          />
                          <Button size="sm" onClick={() => nameMutation.mutate(nameInput)} disabled={nameMutation.isPending} data-testid="button-save-name">
                            {nameMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>✕</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{user?.familyName || <span className="text-muted-foreground italic">Not set</span>}</p>
                            <p className="text-xs text-muted-foreground">Shown in your dashboard greeting</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => { setNameInput(user?.familyName || ""); setEditingName(true); }} data-testid="button-edit-name">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Hotline Phone Number
                      </h3>
                      <p className="text-xs text-muted-foreground -mt-1">The phone number your child calls the hotline from at (605) 313-4793</p>
                      {registeredPhone ? (
                        <div className="p-4 border rounded-lg">
                          {isEditingPhone ? (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                                  <SelectTrigger className="w-32" data-testid="select-edit-country-code">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countryCodes.map((cc) => (
                                      <SelectItem key={cc.code} value={cc.code}>
                                        {cc.code} {cc.country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="tel"
                                  placeholder="555-123-4567"
                                  value={newPhoneNumber}
                                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                                  data-testid="input-edit-phone"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const fullNumber = phoneCountryCode + newPhoneNumber.replace(/^0+/, '');
                                    updatePhoneMutation.mutate({ id: registeredPhone.id, phoneNumber: fullNumber });
                                  }}
                                  disabled={updatePhoneMutation.isPending || !newPhoneNumber.trim()}
                                  data-testid="button-save-phone"
                                >
                                  {updatePhoneMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditingPhone(false);
                                    setNewPhoneNumber("");
                                    setPhoneCountryCode("+1");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="font-medium" data-testid="text-current-phone">{registeredPhone.phoneNumber}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingPhone(true)}
                                data-testid="button-edit-phone"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                              <SelectTrigger className="w-32" data-testid="select-add-country-code">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countryCodes.map((cc) => (
                                  <SelectItem key={cc.code} value={cc.code}>
                                    {cc.code} {cc.country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="tel"
                              placeholder="555-123-4567"
                              value={newPhoneNumber}
                              onChange={(e) => setNewPhoneNumber(e.target.value)}
                              data-testid="input-add-phone"
                            />
                          </div>
                          <Button
                            onClick={() => {
                              const fullNumber = phoneCountryCode + newPhoneNumber.replace(/^0+/, '');
                              addPhoneMutation.mutate(fullNumber);
                            }}
                            disabled={isAddingPhone || !newPhoneNumber.trim()}
                            data-testid="button-add-phone"
                          >
                            {isAddingPhone && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Phone Number
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </h3>
                      {isChangingPassword ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              data-testid="input-current-password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password (min 8 characters)"
                              data-testid="input-new-password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Confirm new password"
                              data-testid="input-confirm-password"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleChangePassword}
                              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmNewPassword}
                              data-testid="button-save-password"
                            >
                              {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                              Save Password
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsChangingPassword(false);
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmNewPassword("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsChangingPassword(true)}
                          data-testid="button-change-password"
                        >
                          Change Password
                        </Button>
                      )}
                    </div>

                    {/* Parental Controls */}
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Parental Controls
                        {parentalData?.isEnabled && <Badge className="text-xs bg-[#EDE518] text-black">On</Badge>}
                      </h3>
                      {parentalData ? (
                        <div className="rounded-lg border border-[#EDE518]/20 bg-[#EDE518]/5 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {parentalData.timeLimitMinutes >= 60
                                  ? `${Math.floor(parentalData.timeLimitMinutes/60)}h${parentalData.timeLimitMinutes%60>0?` ${parentalData.timeLimitMinutes%60}m`:''}`
                                  : `${parentalData.timeLimitMinutes}m`} per {parentalData.timePeriod}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {parentalData.categoryIds?.length > 0
                                  ? parentalData.categoryIds.map((id: string) => categories.find((c: any) => c.id === id)?.name).filter(Boolean).join(", ") || `${parentalData.categoryIds.length} categories`
                                  : "All categories"}
                              </p>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-[#EDE518]" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Used this {parentalData.timePeriod}</span>
                              <span>{Math.floor((parentalData.timeUsedSeconds||0)/60)}m / {parentalData.timeLimitMinutes}m</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#EDE518] rounded-full transition-all" style={{width: `${Math.min(100, ((parentalData.timeUsedSeconds||0) / (parentalData.timeLimitMinutes*60)) * 100)}%`}} />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                              setPcEmail(parentalData.parentEmail || "");
                              setPcLimitHours(String(parentalData.timeLimitMinutes/60));
                              setPcPeriod(parentalData.timePeriod);
                              setPcCategoryAll(!parentalData.categoryIds?.length);
                              setPcCategoryIds(parentalData.categoryIds || []);
                              setIsParentalSetupOpen(true);
                            }} data-testid="button-edit-parental">Edit</Button>
                            {isDisablingParental ? (
                              <div className="flex gap-2 flex-1">
                                <Input type="password" inputMode="numeric" maxLength={6} placeholder="Enter PIN" value={pcDisablePin} onChange={(e) => setPcDisablePin(e.target.value)} className="text-sm h-8" />
                                <Button size="sm" variant="destructive" onClick={() => disableParentalMutation.mutate(pcDisablePin)} disabled={disableParentalMutation.isPending || !pcDisablePin} data-testid="button-confirm-disable-parental">
                                  {disableParentalMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Off"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setIsDisablingParental(false); setPcDisablePin(""); }}>✕</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-400/10" onClick={() => setIsDisablingParental(true)} data-testid="button-disable-parental">Disable</Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" className="w-full" onClick={() => { setPcEmail(""); setPcPin(""); setPcPinConfirm(""); setPcCurrentPin(""); setPcLimitHours("1"); setPcPeriod("day"); setPcCategoryAll(true); setPcCategoryIds([]); setIsParentalSetupOpen(true); }} data-testid="button-setup-parental">
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Set Up Parental Controls
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Billing
                        {isPlus && <Badge variant="default" className="text-xs"><Star className="h-3 w-3 mr-1" />Plus</Badge>}
                      </h3>
                      <div className="space-y-2">
                        {/* Manage billing portal — only when Stripe customer exists */}
                        {subscription?.stripeCustomerId && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => createPortalMutation.mutate()}
                            disabled={createPortalMutation.isPending}
                            data-testid="button-manage-billing-settings"
                          >
                            {createPortalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Manage Billing
                          </Button>
                        )}

                        {/* Start subscription — when no active sub */}
                        {(user?.subscriptionStatus === "none" || user?.subscriptionStatus === "cancelled") && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => createCheckoutMutation.mutate()}
                            disabled={createCheckoutMutation.isPending}
                            data-testid="button-start-trial-settings"
                          >
                            {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {user?.hasUsedTrial ? "Subscribe Now — $9.99/mo" : "Start 7-Day Free Trial"}
                          </Button>
                        )}

                        {/* Email Notifications Toggle */}
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Email Notifications</p>
                              <p className="text-xs text-muted-foreground">Receive emails when new content is added</p>
                            </div>
                            <Switch
                              checked={user?.emailNotifications !== false}
                              onCheckedChange={(checked) => emailPrefMutation.mutate(checked)}
                              disabled={emailPrefMutation.isPending}
                              data-testid="switch-email-notifications"
                            />
                          </div>
                        </div>

                        {/* Upgrade to Plus — always visible for non-Plus subscribers */}
                        {!isPlus && (
                          <Button
                            variant="outline"
                            className="w-full border-primary/50 text-primary hover:bg-primary/5"
                            onClick={() => createPlusCheckoutMutation.mutate()}
                            disabled={createPlusCheckoutMutation.isPending}
                            data-testid="button-upgrade-plus"
                          >
                            {createPlusCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Star className="h-4 w-4 mr-2" />
                            Upgrade to Plus — $29.99/mo
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* ── Appearance ────────────────────────────────────── */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-medium flex items-center gap-2 text-[#EDE518]">
                        <Settings className="h-4 w-4" />
                        Appearance
                      </h3>

                      {/* Text Size */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Text Size</p>
                        <div className="flex gap-2">
                          {([['small','A','Small'],['normal','Aa','Normal'],['large','AAA','Large']] as const).map(([v,icon,label]) => (
                            <button key={v} onClick={() => setTextSize(v)} data-testid={`button-textsize-${v}`}
                              className={`flex-1 py-2 rounded-lg border text-center transition-colors ${textSize === v ? "bg-[#EDE518] text-black border-[#EDE518] font-bold" : "bg-muted/40 text-foreground/70 border-border hover:border-[#EDE518]/50"}`}>
                              <span className="block font-medium">{icon}</span>
                              <span className="block text-xs mt-0.5">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Size */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Video Card Size</p>
                        <div className="flex gap-2">
                          {([['compact','⊞','Compact'],['normal','▣','Normal'],['large','▢','Large']] as const).map(([v,icon,label]) => (
                            <button key={v} onClick={() => setCardSize(v)} data-testid={`button-cardsize-${v}`}
                              className={`flex-1 py-2 rounded-lg border text-center transition-colors ${cardSize === v ? "bg-[#EDE518] text-black border-[#EDE518] font-bold" : "bg-muted/40 text-foreground/70 border-border hover:border-[#EDE518]/50"}`}>
                              <span className="block text-lg">{icon}</span>
                              <span className="block text-xs mt-0.5">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Appearance Toggles */}
                      <div className="space-y-3">
                        {[
                          { label: "Show Descriptions", desc: "Show video descriptions under thumbnails", val: showCardDescriptions, set: setShowCardDescriptions, id: "switch-show-descriptions" },
                          { label: 'Show "New" Badges', desc: "Show NEW badge on recently uploaded videos", val: showNewBadges, set: setShowNewBadges, id: "switch-show-new-badges" },
                        ].map(({ label, desc, val, set, id }) => (
                          <div key={id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <Switch checked={val} onCheckedChange={set} data-testid={id} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Video Playback ─────────────────────────────────── */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-medium flex items-center gap-2 text-[#EDE518]">
                        <Play className="h-4 w-4" />
                        Video Playback
                      </h3>

                      {/* Default Playback Speed */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Default Speed</p>
                        <p className="text-xs text-muted-foreground">Speed when an audio/video player opens</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {[0.75, 1, 1.25, 1.5, 2].map(s => (
                            <button key={s} onClick={() => setDefaultSpeed(s)} data-testid={`button-speed-${s}`}
                              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${defaultSpeed === s ? "bg-[#EDE518] text-black border-[#EDE518]" : "bg-muted/40 text-foreground/70 border-border hover:border-[#EDE518]/50"}`}>
                              {s}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Playback Toggles */}
                      <div className="space-y-3">
                        {[
                          { label: "Autoplay Next Video", desc: "Automatically go to the next video when one ends", val: autoplayNext, set: setAutoplayNext, id: "switch-autoplay" },
                          { label: "Loop Video", desc: "Replay the same video when it ends", val: loopVideo, set: setLoopVideo, id: "switch-loop" },
                        ].map(({ label, desc, val, set, id }) => (
                          <div key={id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <Switch checked={val} onCheckedChange={set} data-testid={id} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Content Filters ────────────────────────────────── */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-medium flex items-center gap-2 text-[#EDE518]">
                        <Eye className="h-4 w-4" />
                        Content & Sorting
                      </h3>

                      {/* Sort Order */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Sort Videos By</p>
                        <div className="grid grid-cols-2 gap-2">
                          {([['default','Default order'],['newest','Newest first'],['oldest','Oldest first'],['az','A → Z'],['popular','Most popular']] as const).map(([v,label]) => (
                            <button key={v} onClick={() => setSortOrder(v)} data-testid={`button-sort-${v}`}
                              className={`py-2 px-3 rounded-lg border text-sm text-left transition-colors ${sortOrder === v ? "bg-[#EDE518] text-black border-[#EDE518] font-bold" : "bg-muted/40 text-foreground/70 border-border hover:border-[#EDE518]/50"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Toggles */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Hide Watched Videos</p>
                            <p className="text-xs text-muted-foreground">Remove videos you've already watched from the grid</p>
                          </div>
                          <Switch checked={hideWatched} onCheckedChange={setHideWatched} data-testid="switch-hide-watched" />
                        </div>
                      </div>

                      {/* Default Category */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Default Category on Load</p>
                        <p className="text-xs text-muted-foreground">Which category opens when you first visit</p>
                        <select
                          value={defaultCategory}
                          onChange={(e) => setDefaultCategory(e.target.value)}
                          data-testid="select-default-category"
                          className="w-full rounded-lg border border-border bg-muted/40 text-foreground px-3 py-2 text-sm"
                        >
                          <option value="">Home screen (default)</option>
                          {topLevelCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                </DialogContent>
              </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-red-400 hover:bg-red-500/10 border border-white/15" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Hotline Phone Number Banner */}
      <div className="bg-[#EDE518] py-2 text-center" data-testid="banner-hotline-number">
        <span className="text-black text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Call the Hotline at (605) 313-4793
        </span>
      </div>


      {/* Dashboard Banner Slideshow */}
      <DashboardBannerSlideshow banners={banners} videos={videos || []} onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* ── Full Mood Page — fixed overlay above everything (z-[60] > header z-50) ── */}
      {selectedMood && (() => {
        const MOOD_META: Record<string, { emoji: string; label: string; tagline: string; color: string; bg: string }> = {
          funny: { emoji: "😂", label: "Just for Laughs", tagline: "Podcasts, skits & videos that'll have you rolling on the floor!", color: "#f59e0b", bg: "linear-gradient(135deg, #1a0f00 0%, #0d1828 60%)" },
          crazy: { emoji: "🤩", label: "Action & Adventure", tagline: "Real life, history & mind-blowing moments!", color: "#8b5cf6", bg: "linear-gradient(135deg, #0d0a1a 0%, #0d1828 60%)" },
          smart: { emoji: "🧠", label: "Torah Time", tagline: "Gemara, Navi, Mishnayos & deep Torah learning!", color: "#08779C", bg: "linear-gradient(135deg, #001524 0%, #0d1828 60%)" },
          chill: { emoji: "😌", label: "Stories & Chill", tagline: "Inspiring stories, music & good vibes only.", color: "#10b981", bg: "linear-gradient(135deg, #001a10 0%, #0d1828 60%)" },
        };
        const meta = MOOD_META[selectedMood] || MOOD_META.funny;
        const moodVideos = moodMatchedVideoIds
          ? (videos || []).filter(v => moodMatchedVideoIds.has(v.id))
          : (videos || []);
        return (
          <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ background: "#0d1828" }}>
            {/* Hero header */}
            <div className="relative overflow-hidden" style={{ background: meta.bg }}>
              <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(circle at 30% 50%, ${meta.color}, transparent 70%)` }} />
              <div className="relative px-5 pt-5 pb-6 max-w-4xl mx-auto">
                <button
                  onClick={() => { setSelectedMood(null); setMoodFilter(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold w-fit px-3 py-1.5 rounded-full border mb-4 transition-all active:scale-95"
                  style={{ color: "#94a3b8", borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)" }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to Home
                </button>
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{meta.emoji}</div>
                  <div>
                    <h1 className="text-3xl font-black text-white leading-tight">{meta.label}</h1>
                    <p className="text-sm mt-1" style={{ color: meta.color }}>{meta.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: meta.color }} />
                  <span className="text-xs font-semibold text-slate-400">{moodVideos.length} videos in this vibe</span>
                </div>
              </div>
            </div>
            {/* Video grid */}
            <div className="px-4 py-5 max-w-4xl mx-auto pb-20">
              {moodVideos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {moodVideos.map(video => {
                    const cat = categories?.find((c: any) => c.id === video.categoryId);
                    return (
                      <VideoCard
                        key={video.id}
                        video={video}
                        isNew={isVideoNew(video)}
                        onView={() => markVideoViewedMutation.mutate(video.id)}
                        categoryName={cat?.name}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">
                  <div className="text-5xl mb-3">{meta.emoji}</div>
                  <p className="font-semibold">Nothing here yet — check back soon!</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {hasActiveSubscription ? (
            <>
              {/* Plus Member Panel */}
              {isPlus && (
                <Card className="border-[#EDE518]/30 bg-gradient-to-br from-[#0d1a2e] to-[#0a1020]" data-testid="card-plus-panel">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <Star className="h-4 w-4 text-[#EDE518]" />
                      Plus Member
                      <Badge className="text-xs ml-1 bg-[#EDE518] text-black">Plus</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Live Meeting */}
                      <div className="rounded-lg border bg-background p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Live Meeting</span>
                        </div>
                        {liveMeeting?.isActive && liveMeeting.meetingUrl ? (
                          <a
                            href={liveMeeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="button-join-meeting"
                          >
                            <Button className="w-full gap-2" size="sm">
                              <MonitorPlay className="h-4 w-4" />
                              Join Live Meeting
                            </Button>
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No meeting happening right now</p>
                        )}
                      </div>

                      {/* Updates */}
                      {liveMeeting?.updatesText?.trim() && (
                        <div className="rounded-lg border bg-background p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Updates</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {liveMeeting.updatesText}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ask the Rabbi — Plus only */}
              {isPlus && (
                <Card className="border-[#EDE518]/30 bg-gradient-to-br from-[#0d1a2e] to-[#0a1020]" data-testid="card-dm-panel">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <MessageSquare className="h-4 w-4 text-[#EDE518]" />
                      Ask Rabbi Eli
                      <Badge className="text-xs ml-auto bg-[#EDE518]/20 text-[#EDE518] border border-[#EDE518]/30">
                        Plus Only
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-white/50 mt-1">Ask about life, personal growth, emunah, parenting, or anything on your mind. Rabbi Eli replies personally.</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Message thread */}
                    <div className="rounded-xl bg-black/30 border border-white/5 p-3 space-y-3 max-h-72 overflow-y-auto">
                      {dmMessages.length === 0 ? (
                        <div className="text-center py-6">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-white/20" />
                          <p className="text-sm text-white/40">Ask your first question — Rabbi Eli is here to help!</p>
                        </div>
                      ) : (
                        dmMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.fromAdmin ? "justify-start" : "justify-end"}`}>
                            {msg.fromAdmin && (
                              <div className="w-7 h-7 rounded-full bg-[#EDE518] flex items-center justify-center shrink-0 mr-2 mt-0.5 text-black font-bold text-xs">R</div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                msg.fromAdmin
                                  ? "bg-white/10 text-white rounded-tl-sm"
                                  : "bg-[#EDE518] text-black rounded-tr-sm font-medium"
                              }`}
                            >
                              {msg.fromAdmin && (
                                <p className="text-[10px] text-[#EDE518] font-semibold mb-1">Rabbi Eli Scheller</p>
                              )}
                              <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                              <p className={`text-[10px] mt-1 ${msg.fromAdmin ? "text-white/40" : "text-black/50"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Compose box */}
                    <div className="flex gap-2">
                      <Textarea
                        data-testid="input-dm-message"
                        value={dmText}
                        onChange={e => setDmText(e.target.value)}
                        placeholder="Ask your question — about life, growth, emunah, parenting…"
                        className="min-h-[44px] max-h-28 resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#EDE518]/50"
                        rows={1}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (dmText.trim()) sendDmMutation.mutate(dmText.trim());
                          }
                        }}
                      />
                      <Button
                        data-testid="button-send-dm"
                        onClick={() => { if (dmText.trim()) sendDmMutation.mutate(dmText.trim()); }}
                        disabled={!dmText.trim() || sendDmMutation.isPending}
                        size="icon"
                        className="shrink-0 h-10 w-10 bg-[#EDE518] hover:bg-[#EDE518]/80 text-black"
                      >
                        {sendDmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── Start Here Banner ─────────────────────────────────────── */}
              {!selectedCategory && !searchQuery.trim() && !moodFilter && (() => {
                const startHereVideos = (videos || []).slice(0, 5);
                if (startHereVideos.length === 0) return null;
                return (
                  <div
                    className="relative overflow-hidden rounded-2xl border border-[#EDE518]/25 cursor-pointer group"
                    style={{ background: "linear-gradient(135deg, #0a1830 0%, #0d2040 60%, #0a1628 100%)" }}
                    onClick={() => {
                      const v = startHereVideos[0];
                      if (v) {
                        const el = document.querySelector(`[data-video-id="${v.id}"]`) as HTMLElement;
                        el?.click();
                      }
                    }}
                    data-testid="banner-start-here"
                  >
                    {/* Glow effect */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EDE518]/60 to-transparent" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: "#EDE518" }} />
                    <div className="flex items-center gap-4 p-4">
                      <div className="h-12 w-12 rounded-2xl bg-[#EDE518] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(237,229,24,0.4)] group-hover:shadow-[0_0_30px_rgba(237,229,24,0.6)] transition-shadow">
                        <Play className="h-6 w-6 text-black ml-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-[#EDE518]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#EDE518]">New here?</span>
                        </div>
                        <p className="text-white font-black text-lg leading-tight">Start Here 👉</p>
                        <p className="text-slate-400 text-xs mt-0.5">Jump straight to our best videos — picked just for you</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#EDE518]/60 group-hover:text-[#EDE518] group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                    {/* Thumbnail strip */}
                    <div className="flex gap-1 px-4 pb-3">
                      {startHereVideos.slice(0, 4).map(v => (
                        <div
                          key={v.id}
                          className="flex-1 aspect-video rounded-lg overflow-hidden bg-[#0d1828] opacity-70 group-hover:opacity-90 transition-opacity"
                        >
                          {v.thumbnailPath ? (
                            <img src={`/api/videos/${v.id}/thumbnail`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="h-4 w-4 text-slate-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ── Parental Controls Promo Slideshow ───────────────── */}
              {!selectedCategory && !searchQuery.trim() && !moodFilter && (() => {
                const PC_PROMO_SLIDES = [
                  {
                    bg: "linear-gradient(135deg, #0d2235 0%, #0a3352 50%, #083060 100%)",
                    accent: "#38bdf8",
                    icon: (
                      <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
                        <circle cx="40" cy="40" r="36" fill="rgba(56,189,248,0.15)" />
                        <path d="M40 12 L62 22 L62 42 C62 55 52 65 40 70 C28 65 18 55 18 42 L18 22 Z" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M32 40 L38 46 L50 34" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ),
                    title: "Keep Your Kids Safe",
                    subtitle: "Parental Controls",
                    text: "Set screen-time limits so your kids enjoy great content — without going overboard.",
                  },
                  {
                    bg: "linear-gradient(135deg, #1a1035 0%, #2d1a52 50%, #1e1060 100%)",
                    accent: "#a78bfa",
                    icon: (
                      <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
                        <circle cx="40" cy="40" r="36" fill="rgba(167,139,250,0.15)" />
                        <circle cx="40" cy="40" r="14" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
                        <circle cx="40" cy="40" r="5" fill="#a78bfa"/>
                        {[0,45,90,135,180,225,270,315].map((deg, i) => {
                          const r = 26;
                          const x = 40 + r * Math.cos(deg * Math.PI / 180);
                          const y = 40 + r * Math.sin(deg * Math.PI / 180);
                          return <circle key={i} cx={x} cy={y} r="3" fill="#a78bfa" opacity="0.6"/>;
                        })}
                      </svg>
                    ),
                    title: "Step 1 — Open Settings",
                    subtitle: "Getting Started",
                    text: "Tap the gear icon ⚙️ in the top-right corner of your dashboard to open Account Settings.",
                  },
                  {
                    bg: "linear-gradient(135deg, #0d2a1a 0%, #0a3d25 50%, #083520 100%)",
                    accent: "#34d399",
                    icon: (
                      <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
                        <circle cx="40" cy="40" r="36" fill="rgba(52,211,153,0.15)" />
                        <rect x="24" y="38" width="32" height="22" rx="4" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="2"/>
                        <path d="M30 38 L30 30 C30 22 50 22 50 30 L50 38" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="40" cy="50" r="4" fill="#34d399"/>
                        <line x1="40" y1="54" x2="40" y2="57" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ),
                    title: "Step 2 — Create a PIN",
                    subtitle: "Secret Protection",
                    text: "Choose a 4–6 digit PIN that only YOU know. This PIN protects your parental settings.",
                  },
                  {
                    bg: "linear-gradient(135deg, #2a1a0d 0%, #3d2a0a 50%, #352008 100%)",
                    accent: "#fb923c",
                    icon: (
                      <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
                        <circle cx="40" cy="40" r="36" fill="rgba(251,146,60,0.15)" />
                        <circle cx="40" cy="40" r="18" fill="rgba(251,146,60,0.15)" stroke="#fb923c" strokeWidth="2"/>
                        <line x1="40" y1="40" x2="40" y2="26" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
                        <line x1="40" y1="40" x2="50" y2="46" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="40" cy="40" r="3" fill="#fb923c"/>
                      </svg>
                    ),
                    title: "Step 3 — Set Time Limits",
                    subtitle: "Control Screen Time",
                    text: "Pick daily, weekly, or monthly limits. Optionally restrict specific content categories.",
                  },
                  {
                    bg: "linear-gradient(135deg, #2a2600 0%, #3d3800 50%, #201e00 100%)",
                    accent: "#EDE518",
                    icon: (
                      <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
                        <circle cx="40" cy="40" r="36" fill="rgba(237,229,24,0.15)" />
                        <circle cx="40" cy="40" r="22" fill="rgba(237,229,24,0.15)" stroke="#EDE518" strokeWidth="2"/>
                        <path d="M28 40 L36 48 L54 32" stroke="#EDE518" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ),
                    title: "You're All Set!",
                    subtitle: "Protection Active",
                    text: "Tap 'Activate Parental Controls' and kids are protected from the moment you're done.",
                  },
                ];
                const slide = PC_PROMO_SLIDES[pcPromoStep];
                return (
                  <div
                    className="rounded-2xl overflow-hidden border border-white/10"
                    style={{ background: "#0b1729" }}
                  >
                    {/* Illustrated visual area */}
                    <div
                      className="relative h-[140px] flex items-center justify-center overflow-hidden"
                      style={{ background: slide.bg, transition: "background 0.5s ease" }}
                    >
                      {/* Ambient glow */}
                      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 60%, ${slide.accent}22 0%, transparent 70%)` }} />
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20" style={{ background: slide.accent, filter: "blur(30px)" }} />
                      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-15" style={{ background: slide.accent, filter: "blur(25px)" }} />
                      {/* SVG icon */}
                      <div style={{ filter: `drop-shadow(0 0 16px ${slide.accent}66)`, transition: "all 0.4s ease" }}>
                        {slide.icon}
                      </div>
                      {/* Step badge */}
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: `${slide.accent}22`, color: slide.accent, border: `1px solid ${slide.accent}44` }}>
                        {slide.subtitle}
                      </div>
                      {/* Setup CTA top-right */}
                      <button
                        onClick={() => { setPcEmail(""); setPcPin(""); setPcPinConfirm(""); setPcCurrentPin(""); setPcLimitHours("1"); setPcPeriod("day"); setPcCategoryAll(true); setPcCategoryIds([]); setIsParentalSetupOpen(true); }}
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                        style={{ background: slide.accent, color: "#000" }}
                        data-testid="button-promo-setup-parental"
                      >
                        {parentalData?.isEnabled ? "Edit" : "Set Up"}
                      </button>
                    </div>

                    {/* Text content */}
                    <div className="px-5 pt-4 pb-2 text-center">
                      <p className="font-black text-base text-white leading-tight" style={{ transition: "all 0.3s ease" }}>
                        {slide.title}
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed mt-1.5 max-w-xs mx-auto">
                        {slide.text}
                      </p>
                    </div>

                    {/* Nav dots + arrows */}
                    <div className="px-5 pb-4 pt-2 flex items-center gap-3">
                      <button
                        onClick={() => setPcPromoStep(s => Math.max(0, s - 1))}
                        disabled={pcPromoStep === 0}
                        className="h-7 w-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20 active:scale-90"
                        style={{ background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.12)` }}
                        data-testid="button-promo-pc-prev"
                      >
                        <ChevronLeft className="h-4 w-4 text-white" />
                      </button>
                      <div className="flex-1 flex items-center justify-center gap-1.5">
                        {PC_PROMO_SLIDES.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setPcPromoStep(i)}
                            className="rounded-full transition-all duration-300"
                            style={{ width: i === pcPromoStep ? 20 : 6, height: 6, background: i === pcPromoStep ? slide.accent : "rgba(255,255,255,0.2)" }}
                            data-testid={`button-promo-pc-dot-${i}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setPcPromoStep(s => Math.min(PC_PROMO_SLIDES.length - 1, s + 1))}
                        disabled={pcPromoStep === PC_PROMO_SLIDES.length - 1}
                        className="h-7 w-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20 active:scale-90"
                        style={{ background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.12)` }}
                        data-testid="button-promo-pc-next"
                      >
                        <ChevronRight className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })()}


              {/* ── Search + Mood slide-down panel ─────────────────── */}
              <div className="space-y-0 relative">
                {/* Top bar: tappable search trigger + Surprise Me */}
                <div className="flex items-center gap-2">
                  {/* Search trigger button */}
                  <button
                    onClick={() => { setIsSearchPanelOpen(true); setMoodFilter(null); }}
                    className="flex-1 min-w-0 flex items-center gap-2 px-3 h-10 rounded-lg border text-sm transition-all hover:border-[#EDE518]/40 text-left"
                    style={{ background: "#0d1828", borderColor: isSearchPanelOpen || searchQuery.trim() ? "rgba(237,229,24,0.4)" : "rgba(255,255,255,0.1)", color: searchQuery.trim() ? "#fff" : "#64748b" }}
                    data-testid="button-open-search-panel"
                  >
                    <Search className="h-4 w-4 shrink-0" style={{ color: "#64748b" }} />
                    <span className="flex-1 truncate">{searchQuery.trim() ? searchQuery : "Search or pick your vibe..."}</span>
                    {(searchQuery.trim() || moodFilter) && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setSearchQuery(""); setMoodFilter(null); }}
                        className="text-slate-500 hover:text-white transition-colors text-xs font-bold px-1"
                      >✕</span>
                    )}
                    {moodFilter && moodFilter !== "open" && (
                      <span className="text-base leading-none">
                        {moodFilter === "funny" ? "😂" : moodFilter === "crazy" ? "🤪" : moodFilter === "smart" ? "🧠" : "😌"}
                      </span>
                    )}
                  </button>
                  <Button
                    onClick={handleSurpriseMe}
                    className="bg-gradient-to-r from-[#EDE518] to-[#f5d800] text-black font-bold hover:from-[#f5d800] hover:to-[#EDE518] shadow-[0_0_12px_#EDE51860] hover:shadow-[0_0_20px_#EDE51880] transition-all gap-2 shrink-0"
                    data-testid="button-surprise-me"
                  >
                    <Shuffle className="h-4 w-4" />
                    Surprise Me
                  </Button>
                </div>

                {/* ── Full slide-down search panel ── */}
                {isSearchPanelOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-[300]"
                      onClick={() => { setIsSearchPanelOpen(false); if (!searchQuery.trim()) setMoodFilter(null); }}
                    />
                    {/* Panel */}
                    <div
                      className="absolute left-0 right-0 top-12 z-[301] rounded-2xl overflow-hidden animate-in slide-in-from-top-3 duration-250 shadow-2xl"
                      style={{ background: "linear-gradient(160deg, #070d1b 0%, #0d1828 60%, #101f34 100%)", border: "1px solid rgba(237,229,24,0.25)" }}
                    >
                      {/* Search input inside panel */}
                      <div className="px-4 pt-4 pb-3 border-b border-white/5">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#EDE518" }} />
                          <input
                            autoFocus
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Escape") setIsSearchPanelOpen(false); }}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm font-medium outline-none border focus:border-[#EDE518]/60 placeholder:text-slate-600"
                            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                            data-testid="input-search-videos"
                          />
                        </div>
                      </div>

                      {/* Mood picker */}
                      <div className="px-4 pt-3 pb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: "#EDE518" }}>
                          ✨ Pick Your Vibe
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "funny", emoji: "😂", label: "Just for Laughs", sub: "Podcast, skits & comedy", color: "#f59e0b" },
                            { id: "crazy", emoji: "🤩", label: "Action & Adventure", sub: "Real life & history", color: "#8b5cf6" },
                            { id: "smart", emoji: "🧠", label: "Torah Time", sub: "Gemara, Navi & more", color: "#08779C" },
                            { id: "chill", emoji: "😌", label: "Stories & Chill", sub: "Inspiring stories & music", color: "#10b981" },
                          ].map(mood => (
                            <button
                              key={mood.id}
                              onClick={() => {
                                setSelectedMood(mood.id);
                                setMoodFilter(mood.id);
                                setSearchQuery("");
                                setIsSearchPanelOpen(false);
                                setSelectedCategory(null);
                              }}
                              className="flex items-center gap-3 px-3 py-3 rounded-2xl border text-left hover:scale-[1.02] active:scale-[0.98] transition-all"
                              style={moodFilter === mood.id ? {
                                background: `${mood.color}22`,
                                borderColor: mood.color,
                                boxShadow: `0 0 12px ${mood.color}44`,
                              } : {
                                background: "rgba(255,255,255,0.04)",
                                borderColor: "rgba(255,255,255,0.08)",
                              }}
                              data-testid={`button-mood-${mood.id}`}
                            >
                              <span className="text-2xl">{mood.emoji}</span>
                              <div className="min-w-0">
                                <p className="text-white font-bold text-xs leading-tight">{mood.label}</p>
                                <p className="text-slate-500 text-[10px] leading-tight truncate">{mood.sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        {(searchQuery.trim() || moodFilter) && (
                          <button
                            onClick={() => { setSearchQuery(""); setMoodFilter(null); setIsSearchPanelOpen(false); }}
                            className="mt-3 w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors underline"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Active mood badge below bar */}
                {moodFilter && moodFilter !== "open" && !isSearchPanelOpen && (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <span className="text-xs text-slate-400">Showing:</span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      style={{ background: "rgba(237,229,24,0.1)", borderColor: "rgba(237,229,24,0.3)", color: "#EDE518" }}>
                      {moodFilter === "funny" ? "😂 Funny" : moodFilter === "crazy" ? "🤪 Wild & Crazy" : moodFilter === "smart" ? "🧠 Learn Something" : "😌 Chill"}
                    </span>
                    <button onClick={() => setMoodFilter(null)} className="text-[10px] text-slate-600 hover:text-white underline transition-colors">clear</button>
                  </div>
                )}
              </div>

              {/* Search Results - shown when searching */}
              {searchQuery.trim() && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="w-1 h-5 bg-[#EDE518] rounded-full inline-block" />
                      Search Results ({searchResults.length})
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchQuery("")}
                      data-testid="button-clear-search"
                    >
                      Clear Search
                    </Button>
                  </div>
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.map((video) => {
                        const category = categories.find(c => c.id === video.categoryId);
                        return (
                          <VideoCard 
                            key={video.id} 
                            video={video}
                            isNew={isVideoNew(video)}
                            onView={() => markVideoViewedMutation.mutate(video.id)}
                            categoryName={category?.name}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No videos found matching your search.</p>
                  )}
                </div>
              )}
              
              {/* Saved Stories Section */}
              {!selectedMood && !searchQuery.trim() && savedStories.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#08779C] shadow-[0_0_8px_#08779C]" />
                    <BookmarkCheck className="h-5 w-5 text-[#08779C]" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">Saved Stories</h2>
                    <span className="text-xs text-white/40 font-medium">Your saved audio</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#08779C]/30 to-transparent" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                    {savedStories.map((vid) => {
                      const category = categories?.find((c: any) => c.id === vid.categoryId);
                      return (
                        <div key={vid.id} className="flex-shrink-0 w-[75vw] sm:w-64 md:w-72">
                          <VideoCard video={vid} onView={() => markVideoViewedMutation.mutate(vid.id)} categoryName={category?.name} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Continue Watching Section */}
              {!selectedMood && !searchQuery.trim() && continueWatching.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#08779C] shadow-[0_0_8px_#08779C]" />
                    <History className="h-5 w-5 text-[#08779C]" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">Continue Watching</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#08779C]/30 to-transparent" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                    {continueWatching.map((item: any) => {
                      const vid = videos?.find(v => v.id === item.video_id);
                      if (!vid) return null;
                      const pct = item.duration_seconds > 0 ? Math.min(100, Math.round((item.position_seconds / item.duration_seconds) * 100)) : 0;
                      return (
                        <div key={item.video_id} className="flex-shrink-0 w-[75vw] sm:w-64 md:w-72 relative">
                          <VideoCard video={vid} onView={() => markVideoViewedMutation.mutate(vid.id)} />
                          {pct > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
                              <div className="h-full bg-[#08779C]" style={{ width: `${pct}%` }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Favorites Section */}
              {!selectedMood && !searchQuery.trim() && favoriteVideos.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#EDE518] shadow-[0_0_8px_#EDE518]" />
                    <Heart className="h-5 w-5 fill-[#EDE518] text-[#EDE518]" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">My Favorites</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#EDE518]/30 to-transparent" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                    {favoriteVideos.map((video) => (
                      <div key={video.id} className="flex-shrink-0 w-[75vw] sm:w-64 md:w-72">
                        <VideoCard video={video} onView={() => markVideoViewedMutation.mutate(video.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Videos Section - Horizontal Scrolling (hidden when searching) */}
              {!searchQuery.trim() && recentVideos.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#EDE518] shadow-[0_0_8px_#EDE518]" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">Recently Added</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#EDE518]/30 to-transparent" />
                  </div>
                  <div className="relative -mx-4 sm:mx-0">
                    {/* Left Arrow */}
                    <button
                      onClick={() => scrollRecent("left")}
                      disabled={!canScrollLeft}
                      className={`absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${canScrollLeft ? 'bg-[#EDE518] text-black hover:scale-110 shadow-[0_0_12px_rgba(237,229,24,0.5)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                      data-testid="button-scroll-recent-left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {/* Scrollable track */}
                    <div 
                      ref={recentScrollRef}
                      className="flex gap-3 overflow-x-auto pb-3 px-14 sm:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {recentVideos.map((video) => (
                        <div key={video.id} className="flex-shrink-0 w-[75vw] sm:w-64 md:w-72">
                          <VideoCard 
                            video={video}
                            isNew={isVideoNew(video)}
                            onView={() => markVideoViewedMutation.mutate(video.id)}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Right Arrow */}
                    <button
                      onClick={() => scrollRecent("right")}
                      disabled={!canScrollRight}
                      className={`absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${canScrollRight ? 'bg-[#EDE518] text-black hover:scale-110 shadow-[0_0_12px_rgba(237,229,24,0.5)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                      data-testid="button-scroll-recent-right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Trending Videos Section */}
              {!searchQuery.trim() && trendingVideos.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#08779C] shadow-[0_0_8px_#08779C]" />
                    <TrendingUp className="h-5 w-5 text-[#08779C]" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">Trending Now</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#08779C]/30 to-transparent" />
                    <button
                      onClick={() => setShowTrending(!showTrending)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      data-testid="button-toggle-trending"
                    >
                      {showTrending ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showTrending ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showTrending && (
                    <div className="relative -mx-4 sm:mx-0">
                      {/* Left Arrow */}
                      <button
                        onClick={() => scrollTrending("left")}
                        disabled={!trendingCanScrollLeft}
                        className={`absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${trendingCanScrollLeft ? 'bg-[#08779C] text-white hover:scale-110 shadow-[0_0_12px_rgba(8,119,156,0.5)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        data-testid="button-scroll-trending-left"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {/* Scrollable track */}
                      <div 
                        ref={trendingScrollRef}
                        className="flex gap-3 overflow-x-auto pb-3 px-14 sm:px-12"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {trendingVideos.map((video) => (
                          <div key={video.id} className="flex-shrink-0 w-[75vw] sm:w-64 md:w-72">
                            <VideoCard 
                              video={video}
                              isNew={isVideoNew(video)}
                              onView={() => markVideoViewedMutation.mutate(video.id)}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Right Arrow */}
                      <button
                        onClick={() => scrollTrending("right")}
                        disabled={!trendingCanScrollRight}
                        className={`absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${trendingCanScrollRight ? 'bg-[#08779C] text-white hover:scale-110 shadow-[0_0_12px_rgba(8,119,156,0.5)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        data-testid="button-scroll-trending-right"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Category Filter Buttons */}
              {!selectedMood && (<div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {topLevelCategories.map((category) => {
                    const subcats = getSubcategories(category.id);
                    const isSelected = selectedCategory === category.id || subcats.some(s => s.id === selectedCategory);
                    const count = getCategoryVideoCount(category.id);
                    return (
                      <Button
                        key={category.id}
                        className={isSelected
                          ? "bg-[#EDE518] text-black font-semibold hover:bg-[#EDE518]/90 border-0"
                          : "bg-[#0d1828] text-slate-300 border border-white/10 hover:bg-[#EDE518]/10 hover:text-white hover:border-[#EDE518]/40"}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setExpandedCategory(category.id);
                        }}
                        data-testid={`button-category-${category.id}`}
                      >
                        {category.name}
                        {count > 0 && (
                          <span className={`ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full ${isSelected ? "bg-black/20 text-black" : "bg-white/10 text-slate-400"}`}>
                            {count}
                          </span>
                        )}
                        {subcats.length > 0 && (
                          <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedCategory === category.id ? "rotate-90" : ""}`} />
                        )}
                      </Button>
                    );
                  })}
                  {videosByCategory.uncategorized && videosByCategory.uncategorized.length > 0 && (
                    <Button
                      className={selectedCategory === "uncategorized"
                        ? "bg-[#EDE518] text-black font-semibold hover:bg-[#EDE518]/90 border-0"
                        : "bg-[#0d1828] text-slate-300 border border-white/10 hover:bg-[#EDE518]/10 hover:text-white hover:border-[#EDE518]/40"}
                      onClick={() => setSelectedCategory("uncategorized")}
                      data-testid="button-category-uncategorized"
                    >
                      Other
                    </Button>
                  )}
                  {albums && albums.length > 0 && (
                    <Button
                      className={selectedCategory === "albums"
                        ? "bg-[#EDE518] text-black font-semibold hover:bg-[#EDE518]/90 border-0"
                        : "bg-[#0d1828] text-slate-300 border border-white/10 hover:bg-[#EDE518]/10 hover:text-white hover:border-[#EDE518]/40"}
                      onClick={() => setSelectedCategory("albums")}
                      data-testid="button-category-albums"
                    >
                      <Disc className="h-4 w-4 mr-2" />
                      Albums
                    </Button>
                  )}
                  {documents && documents.length > 0 && (
                    <Button
                      className={selectedCategory === "documents"
                        ? "bg-[#EDE518] text-black font-semibold hover:bg-[#EDE518]/90 border-0"
                        : "bg-[#0d1828] text-slate-300 border border-white/10 hover:bg-[#EDE518]/10 hover:text-white hover:border-[#EDE518]/40"}
                      onClick={() => setSelectedCategory("documents")}
                      data-testid="button-category-documents"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  )}
                </div>
                {/* Subcategories */}
                {(() => {
                  const mainCatId = topLevelCategories.find(c => c.id === selectedCategory)?.id 
                    || topLevelCategories.find(c => getSubcategories(c.id).some(s => s.id === selectedCategory))?.id;
                  const subsToShow = mainCatId ? getSubcategories(mainCatId) : [];
                  if (subsToShow.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-2 ml-4 pl-4 border-l-2 border-[#08779C]/50">
                      {subsToShow.map((subcat) => (
                        <Button
                          key={subcat.id}
                          className={selectedCategory === subcat.id
                            ? "bg-[#08779C] text-white font-semibold hover:bg-[#08779C]/90 border-0"
                            : "bg-[#0d1828] text-slate-400 border border-[#08779C]/30 hover:bg-[#08779C]/10 hover:text-white"}
                          onClick={() => setSelectedCategory(subcat.id)}
                          data-testid={`button-subcategory-${subcat.id}`}
                        >
                          {subcat.name}
                        </Button>
                      ))}
                    </div>
                  );
                })()}
              </div>
              )}

              {/* Content based on selected category (always visible) */}
              {selectedCategory === "albums" ? (
                <div>
                  {albumsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                          <Skeleton className="aspect-video" />
                          <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : albums && albums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border border-white/10" style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}}>
                      <CardContent className="py-12 text-center">
                        <Disc className="h-16 w-16 mx-auto text-[#EDE518] mb-4" />
                        <h3 className="font-semibold text-lg mb-2 text-white">No Albums Yet</h3>
                        <p className="text-slate-400">Check back soon for new album content!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : selectedCategory === "documents" ? (
                <div>
                  {documentsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                          <Skeleton className="aspect-video" />
                          <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : documents && documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {documents.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border border-white/10" style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}}>
                      <CardContent className="py-12 text-center">
                        <FileText className="h-16 w-16 mx-auto text-[#08779C] mb-4" />
                        <h3 className="font-semibold text-lg mb-2 text-white">No Documents Yet</h3>
                        <p className="text-slate-400">Check back soon for new document content!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                (() => {
                  const selectedCat = categories.find(c => c.id === selectedCategory) || null;
                  const theme = selectedCat ? getCategoryTheme(selectedCat.name) : null;
                  const baseGridCols = theme ? theme.gridCols : "grid-cols-2 md:grid-cols-3";
                  const gridCols = cardSize === 'compact'
                    ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"
                    : cardSize === 'large'
                    ? "grid-cols-1 sm:grid-cols-2"
                    : baseGridCols;
                  const cardVariant = theme ? theme.cardVariant : "default";
                  const featuredFirst = theme ? theme.featuredFirst : true;

                  return (
                    <div>
                      {/* Category Banner — unique per category */}
                      {selectedCat && theme && !videosLoading && (
                        <CategoryBanner category={selectedCat} theme={theme} />
                      )}
                      {/* Generic section label for no-theme or no-category */}
                      {selectedCat && !theme && !videosLoading && (
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#EDE518] shadow-[0_0_8px_#EDE518]" />
                          <h2 className="text-xl font-black text-white uppercase tracking-wide">{selectedCat.name}</h2>
                          <div className="flex-1 h-px bg-gradient-to-r from-[#EDE518]/30 to-transparent" />
                        </div>
                      )}
                      {videosLoading ? (
                        <div className={`grid ${gridCols} gap-4`}>
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden border border-white/10" style={{background: "linear-gradient(145deg, #0e1e35, #0a1628)"}}>
                              <Skeleton className="aspect-video bg-white/5" />
                              <CardContent className="p-3 space-y-2">
                                <Skeleton className="h-4 w-3/4 bg-white/5" />
                                <Skeleton className="h-3 w-full bg-white/5" />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : filteredVideos.length > 0 ? (
                        (() => {
                          const isMainCat = topLevelCategories.some(c => c.id === selectedCategory);
                          const subcats = isMainCat ? getSubcategories(selectedCategory!) : [];
                          const hasSubcats = subcats.length > 0;

                          // Sort all videos per user preference
                          const videosSorted = [...filteredVideos].sort((a, b) => {
                            if (sortOrder === 'newest') return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                            if (sortOrder === 'oldest') return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                            if (sortOrder === 'az') return a.title.localeCompare(b.title);
                            if (sortOrder === 'popular') return (b.viewCount ?? 0) - (a.viewCount ?? 0);
                            // default: sortOrder field then createdAt
                            return (((a as any).sortOrder ?? 0) - ((b as any).sortOrder ?? 0)) || ((a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0));
                          });

                          // Spotlight: rotate daily; skip for list/portrait/square categories
                          // Prefer videos with thumbnails so the spotlight always looks great
                          const canSpotlight = cardVariant !== "list" && cardVariant !== "portrait" && cardVariant !== "square" && videosSorted.length >= 4;
                          const dayIdx = Math.floor(Date.now() / 86400000);
                          const videosWithThumbs = videosSorted.filter(v => v.thumbnailPath);
                          const spotlightPool = videosWithThumbs.length >= 2 ? videosWithThumbs : videosSorted;
                          const spotlightVideo = canSpotlight ? spotlightPool[dayIdx % spotlightPool.length] : null;
                          const gridVideos = spotlightVideo ? videosSorted.filter(v => v.id !== spotlightVideo.id) : videosSorted;

                          return (
                            <>
                              {spotlightVideo && (
                                <SpotlightCard
                                  video={spotlightVideo}
                                  theme={theme}
                                  onView={() => markVideoViewedMutation.mutate(spotlightVideo.id)}
                                />
                              )}
                              {hasSubcats && isMainCat && cardVariant === "list" ? (
                                // Grouped by subcategory (e.g. Mishnayos → Shabbos, Eiruvin…)
                                <div className="space-y-8">
                                  {subcats.map(subcat => {
                                    const subcatVideos = gridVideos
                                      .filter(v => v.categoryId === subcat.id)
                                      .sort((a, b) => ((a as any).sortOrder ?? 0) - ((b as any).sortOrder ?? 0));
                                    if (subcatVideos.length === 0) return null;
                                    return (
                                      <div key={subcat.id}>
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="flex-shrink-0 h-5 w-1 rounded-full" style={{ background: theme?.accent || "#EDE518" }} />
                                          <h3 className="text-base font-bold text-white/90">{subcat.name}</h3>
                                          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${theme?.accent || "#EDE518"}40, transparent)` }} />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                          {subcatVideos.map(video => (
                                            <VideoCard
                                              key={video.id}
                                              video={video}
                                              isNew={isVideoNew(video)}
                                              onView={() => markVideoViewedMutation.mutate(video.id)}
                                              variant="list"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {/* Videos directly in the main category */}
                                  {(() => {
                                    const directVids = gridVideos.filter(v => v.categoryId === selectedCategory)
                                      .sort((a, b) => ((a as any).sortOrder ?? 0) - ((b as any).sortOrder ?? 0));
                                    if (directVids.length === 0) return null;
                                    return (
                                      <div className="flex flex-col gap-3">
                                        {directVids.map(video => (
                                          <VideoCard
                                            key={video.id}
                                            video={video}
                                            isNew={isVideoNew(video)}
                                            onView={() => markVideoViewedMutation.mutate(video.id)}
                                            variant="list"
                                          />
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : cardVariant === "list" ? (
                                <div className="flex flex-col gap-3">
                                  {gridVideos.map((video) => (
                                    <VideoCard
                                      key={video.id}
                                      video={video}
                                      isNew={isVideoNew(video)}
                                      onView={() => markVideoViewedMutation.mutate(video.id)}
                                      variant="list"
                                    />
                                  ))}
                                </div>
                              ) : cardVariant === "portrait" ? (
                                <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                  {gridVideos.map((video) => (
                                    <div key={video.id} className="flex-shrink-0 w-32 sm:w-36 snap-start">
                                      <VideoCard
                                        video={video}
                                        isNew={isVideoNew(video)}
                                        onView={() => markVideoViewedMutation.mutate(video.id)}
                                        variant="portrait"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={`grid ${gridCols} gap-3`}>
                                  {gridVideos.map((video) => (
                                    <div key={video.id}>
                                      <VideoCard
                                        video={video}
                                        isNew={isVideoNew(video)}
                                        onView={() => markVideoViewedMutation.mutate(video.id)}
                                        variant={cardVariant}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <Card className="border border-white/10" style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}}>
                          <CardContent className="py-12 text-center">
                            <FileVideo className="h-16 w-16 mx-auto text-[#08779C] mb-4" />
                            <h3 className="font-semibold text-lg mb-2 text-white">No Content Yet</h3>
                            <p className="text-slate-400">Check back soon for new content!</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  );
                })()
              )}

            </>
          ) : user?.subscriptionStatus === "past_due" ? (
            <Card className="border-2 border-destructive">
              <CardContent className="py-16 text-center">
                <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-6" />
                <h2 className="text-2xl font-bold mb-2">Payment Issue</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We were unable to process your payment. Please update your payment method to restore access to videos and the phone hotline.
                </p>
                <Button
                  size="lg"
                  onClick={() => createPortalMutation.mutate()}
                  disabled={createPortalMutation.isPending}
                  data-testid="button-update-payment"
                >
                  {createPortalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Payment Method
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Once your payment is updated, your access will be restored automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-[#EDE518]/20 overflow-hidden" style={{background: "linear-gradient(135deg, #0d1a35 0%, #0a2040 50%, #071830 100%)"}}>
              <CardContent className="py-16 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-20" style={{background: "radial-gradient(ellipse at top, #EDE518 0%, transparent 70%)"}} />
                <Video className="h-16 w-16 mx-auto text-[#EDE518] mb-6 relative" />
                <h2 className="text-2xl font-bold mb-2 text-white relative">Unlock Video Content</h2>
                <p className="text-slate-300 mb-6 max-w-md mx-auto relative">
                  Subscribe to access our library of exclusive video content for kids, 
                  plus phone hotline access with stories and live calls.
                </p>
                <Button
                  size="lg"
                  className="bg-[#EDE518] text-black font-bold hover:bg-[#EDE518]/90 shadow-[0_0_20px_rgba(237,229,24,0.3)] relative"
                  onClick={() => createCheckoutMutation.mutate()}
                  disabled={createCheckoutMutation.isPending}
                  data-testid="button-subscribe-videos"
                >
                  {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {user?.hasUsedTrial ? "Subscribe Now" : "Start 7-Day Free Trial"}
                </Button>
                <p className="text-sm text-slate-400 mt-4 relative">
                  {user?.hasUsedTrial ? "$9.99/month. Cancel anytime." : "$9.99/month after trial ends. Cancel anytime."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Surprise Me Dialog */}
      {surpriseVideoId && videos && (() => {
        const sv = videos.find(v => v.id === surpriseVideoId);
        if (!sv) return null;
        return (
          <Dialog open={!!surpriseVideoId} onOpenChange={(o) => { if (!o) setSurpriseVideoId(null); }}>
            <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-0 shadow-none" data-testid="dialog-surprise-video" aria-describedby={undefined}>
              <DialogTitle className="sr-only">Surprise Video: {sv.title}</DialogTitle>
              <VideoPlayer video={sv} onClose={() => setSurpriseVideoId(null)} />
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
    </ParentalControlsContext.Provider>
    </VideoProgressContext.Provider>
    <JokeButton onGoToDocs={() => setSelectedCategory("documents")} />
    {showIntro && (
      <IntroAnimation onDone={() => {
        setShowIntro(false);
        try { sessionStorage.setItem("intro_shown", "1"); } catch {}
      }} />
    )}
    {miniPlayerState && (
      <FloatingMiniPlayer
        state={miniPlayerState}
        onClose={() => setMiniPlayerState(null)}
        onExpand={() => {
          setMiniExpandVideo(miniPlayerState.video);
          setMiniPlayerState(null);
        }}
      />
    )}
    {miniExpandVideo && (
      <Dialog open={true} onOpenChange={(o) => { if (!o) setMiniExpandVideo(null); }}>
        <DialogTitle className="sr-only">{miniExpandVideo.title}</DialogTitle>
        <VideoPlayer
          video={miniExpandVideo}
          onClose={() => setMiniExpandVideo(null)}
          onMinimize={(streamUrl, currentTime, isAudioType) => {
            setMiniPlayerState({ video: miniExpandVideo!, streamUrl, currentTime, isAudio: isAudioType });
            setMiniExpandVideo(null);
          }}
        />
      </Dialog>
    )}
    </MiniPlayerContext.Provider>
  );
}
