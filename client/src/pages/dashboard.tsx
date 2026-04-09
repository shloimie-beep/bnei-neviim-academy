import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, CreditCard, Settings, LogOut, Plus, Trash2, Loader2, Clock, CheckCircle, AlertCircle, XCircle, Video, Play, Pause, FileVideo, Volume2, VolumeX, Maximize, Minimize, Edit2, Music, FileText, ExternalLink, Lock, ChevronLeft, ChevronRight, Disc, SkipBack, SkipForward, TrendingUp, Eye, EyeOff, Star, MonitorPlay, MessageSquare, Send, Heart, ThumbsUp, Bell, BellDot, History } from "lucide-react";
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
import { useAuth, getAuthHeaders, getStoredAuthToken } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocumentViewer } from "@/components/document-viewer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef, useMemo, useEffect } from "react";
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

  const vimeoVideoId = currentVideo.vimeoVideoId || currentVideo.vimeo_video_id;
  const storedEmbedUrl = currentVideo.vimeoEmbedUrl || currentVideo.vimeo_embed_url;

  const embedUrl = storedEmbedUrl
    ? (storedEmbedUrl.includes('?') ? `${storedEmbedUrl}&autoplay=1` : `${storedEmbedUrl}?autoplay=1`)
    : `https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1&title=0&byline=0&portrait=0`;

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
  const { data: relatedVideos = [] } = useQuery<any[]>({
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
      vimeoEmbedUrl: null,
      vimeo_embed_url: null,
      createdAt: rv.created_at,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const watchNextVideos = relatedVideos.slice(0, 3);

  return (
    <DialogContent className="max-w-4xl p-0 overflow-y-auto max-h-[90vh]">
      <div className="relative bg-black">
        <iframe
          key={currentVideo.id}
          src={embedUrl}
          className="w-full aspect-video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          data-testid={`video-player-${currentVideo.id}`}
        />
      </div>

      {/* Watch Next — 3 cards right below the player */}
      {watchNextVideos.length > 0 && (
        <div className="bg-[#060e1a] border-b border-white/10">
          <div className="px-4 pt-3 pb-2 flex items-center gap-2">
            <Play className="h-3.5 w-3.5 text-[#EDE518] fill-[#EDE518]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EDE518]">Watch Next</span>
          </div>
          <div className="grid grid-cols-3 gap-2 px-3 pb-3">
            {watchNextVideos.map((rv: any) => (
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
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-200" />
                  {/* Play button center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-full p-2.5 transition-all duration-200 group-hover:scale-110"
                      style={{ background: "rgba(237,229,24,0.15)", border: "1.5px solid rgba(237,229,24,0.4)" }}
                    >
                      <Play className="h-5 w-5 text-[#EDE518] fill-[#EDE518]" />
                    </div>
                  </div>
                  {/* Bottom gradient with title */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{rv.title}</p>
                    <p className="text-[#EDE518] text-[10px] font-bold mt-0.5 flex items-center gap-1">
                      Tap to watch
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
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
      <CommentsSection videoId={currentVideo.id} />

      {/* keep a spacer so comments aren't right at the bottom edge */}
      {watchNextVideos.length === 0 && (
        <div className="h-4" />
      )}
    </DialogContent>
  );
}

function LegacyVideoPlayer({ video, onClose }: { video: VideoType; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [thumbnailCacheBust] = useState(() => Date.now());

  useEffect(() => {
    setStreamUrl(null);
    setStreamLoading(true);
    setStreamError(null);
    
    fetch(`/api/videos/${video.id}/stream?t=${Date.now()}`, {
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
          setStreamUrl(`/api/videos/${video.id}/stream?t=${Date.now()}${legacyTokenParam}`);
          setStreamLoading(false);
        }
      })
      .catch(() => {
        setStreamError("Failed to load video");
        setStreamLoading(false);
      });
  }, [video.id]);

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
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
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

  const isAudio = video.mediaType === "audio";

  if (streamLoading) {
    return (
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{video.title}</h3>
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
          <h3 className="font-semibold text-lg">{video.title}</h3>
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
              ref={videoRef as React.RefObject<HTMLAudioElement>}
              src={streamUrl}
              autoPlay
              preload="auto"
              className="hidden"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              data-testid={`audio-player-${video.id}`}
            />
            {video.thumbnailPath ? (
              <img 
                src={`/api/videos/${video.id}/thumbnail?v=${thumbnailCacheBust}`}
                alt={video.title}
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
            className="w-full aspect-video"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            data-testid={`video-player-${video.id}`}
          />
        )}
        
        <div 
          className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={handlePlayPause}
        >
          {!isPlaying && (
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          )}
        </div>

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
        <h3 className="font-semibold text-lg">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
        )}
      </div>
      <CommentsSection videoId={video.id} />
    </DialogContent>
  );
}

function VideoPlayer({ video, onClose }: { video: VideoType; onClose: () => void }) {
  // Use embed player for Vimeo videos
  if ((video as any).vimeoVideoId) {
    return <VideoEmbedPlayer video={video} />;
  }
  return <LegacyVideoPlayer video={video} onClose={onClose} />;
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

function VideoCard({ video, isNew, onView, categoryName, variant = "default" }: { video: VideoType; isNew?: boolean; onView?: () => void; categoryName?: string; variant?: CardVariant }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAudio = video.mediaType === "audio";
  const { toast } = useToast();

  const { data: userFavorites = [] } = useQuery<string[]>({
    queryKey: ["/api/user/favorites"],
  });
  const isFavorited = userFavorites.includes(video.id);

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${video.id}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] }),
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && onView) {
      onView();
    }
  };

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
        <VideoPlayer video={video} onClose={() => setIsOpen(false)} />
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 border border-white/10 hover:border-white/25 transition-colors relative" style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}} data-testid={`card-video-${video.id}`}>
          <div className={`${aspectClass} flex items-center justify-center relative group overflow-hidden bg-[#060e1a]`}>
            {thumbnailSrc ? (
              <>
                <img 
                  src={thumbnailSrc} 
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
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
              <div className="absolute top-2 right-2">
                <Badge className="text-xs bg-[#EDE518] text-black font-bold" data-testid={`badge-new-${video.id}`}>New</Badge>
              </div>
            )}
            {!isNew && (
              <button
                className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all ${isFavorited ? "bg-black/70 opacity-100" : "bg-black/50 opacity-0 group-hover:opacity-100"}`}
                onClick={e => { e.stopPropagation(); favoriteMutation.mutate(); }}
                data-testid={`button-card-favorite-${video.id}`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-[#EDE518] text-[#EDE518]" : "text-white"}`} />
              </button>
            )}
            {durationText && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium" data-testid={`duration-${video.id}`}>
                {durationText}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-14 w-14 rounded-full bg-[#EDE518] flex items-center justify-center shadow-[0_0_20px_rgba(237,229,24,0.5)]">
                <Play className="h-6 w-6 text-black ml-1" />
              </div>
            </div>
          </div>
          {variant !== "square" && variant !== "portrait" && (
            <CardContent className="p-3">
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
            </CardContent>
          )}
          {(variant === "square" || variant === "portrait") && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 pt-6">
              <h3 className="font-bold line-clamp-2 text-white text-xs leading-tight" data-testid={`text-video-title-${video.id}`}>{video.title}</h3>
            </div>
          )}
        </Card>
      </DialogTrigger>
      <VideoPlayer video={video} onClose={() => setIsOpen(false)} />
    </Dialog>
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

function DashboardBannerSlideshow({ banners, videos }: { banners: BannerItem[]; videos: VideoType[] }) {
  const [current, setCurrent] = useState(0);
  const [prev2, setPrev2] = useState<number | null>(null);
  const [openVideo, setOpenVideo] = useState<VideoType | null>(null);
  const [isOpenVideo, setIsOpenVideo] = useState(false);
  const totalSlides = banners.length;

  const goTo = (idx: number) => {
    const next = ((idx % totalSlides) + totalSlides) % totalSlides;
    setPrev2(current);
    setCurrent(next);
    setTimeout(() => setPrev2(null), 500);
  };
  const prevSlide = () => goTo(current - 1);
  const nextSlide = () => goTo(current + 1);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setPrev2(current);
      setCurrent(c => {
        const next = (c + 1) % totalSlides;
        setTimeout(() => setPrev2(null), 500);
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  if (totalSlides === 0) return null;

  const slide = banners[current];
  const accent = SLIDE_ACCENTS[current % SLIDE_ACCENTS.length];
  const overlay = SLIDE_DARK_OVERLAYS[current % SLIDE_DARK_OVERLAYS.length];
  const accentIsYellow = accent === "#EDE518";

  const imageUrl = slide.imageUrl
    ? slide.imageUrl.startsWith("/objects/")
      ? `/api/banners/${slide.id}/image`
      : slide.imageUrl
    : null;

  const handleClick = () => {
    if (!slide.videoId) return;
    const v = videos.find(v => v.id === slide.videoId);
    if (v) { setOpenVideo(v); setIsOpenVideo(true); }
  };

  return (
    <>
      <div
        className="relative overflow-hidden select-none"
        style={{ minHeight: 220, background: "#060e1a" }}
        data-testid="banner-slideshow"
      >
        {/* Full-bleed background image */}
        {imageUrl && (
          <div className="absolute inset-0 transition-opacity duration-500">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.55) saturate(1.2)" }}
            />
          </div>
        )}

        {/* Dark directional overlay — text side is always dark */}
        <div className="absolute inset-0" style={{ background: overlay }} />

        {/* Accent glow blob behind text */}
        <div
          className="absolute -left-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: accent, opacity: 0.12 }}
        />

        {/* Content */}
        <div
          className={`relative flex items-end gap-4 px-5 sm:px-8 pt-7 pb-9 ${slide.videoId ? "cursor-pointer" : ""}`}
          style={{ minHeight: 220 }}
          onClick={handleClick}
        >
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full"
                style={{
                  background: accent,
                  color: accentIsYellow ? "#000" : "#fff",
                  boxShadow: `0 0 16px ${accent}80`,
                }}
              >
                Watch Now
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl sm:text-3xl font-black text-white leading-tight line-clamp-2 drop-shadow-2xl mb-4"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
            >
              {slide.title}
            </h2>

            {/* Watch Now CTA */}
            {slide.videoId && (
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black shadow-xl transition-transform hover:scale-105"
                style={{
                  background: accent,
                  color: accentIsYellow ? "#000" : "#fff",
                  boxShadow: `0 4px 24px ${accent}60`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Now
              </div>
            )}
          </div>

          {/* Right-side thumbnail (larger preview, visible on sm+) */}
          {imageUrl && (
            <div
              className="hidden sm:block flex-shrink-0 w-28 h-20 md:w-40 md:h-28 rounded-2xl overflow-hidden border-2 shadow-2xl"
              style={{ borderColor: `${accent}60`, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${accent}30` }}
            >
              <img src={imageUrl} alt={slide.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Prev/Next arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center transition-all hover:scale-110 z-10"
              data-testid="button-banner-prev"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center transition-all hover:scale-110 z-10"
              data-testid="button-banner-next"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10" data-testid="banner-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className="rounded-full transition-all duration-400"
                style={{
                  width: i === current ? 24 : 6,
                  height: 6,
                  background: i === current ? accent : "rgba(255,255,255,0.35)",
                  boxShadow: i === current ? `0 0 8px ${accent}` : "none",
                }}
                data-testid={`banner-dot-${i}`}
              />
            ))}
          </div>
        )}

        {/* Slide count badge (top right) */}
        {totalSlides > 1 && (
          <div className="absolute top-3 right-3 text-[10px] text-white/40 font-bold tabular-nums z-10">
            {current + 1} / {totalSlides}
          </div>
        )}
      </div>

      {/* Video dialog (when banner is clicked) */}
      {openVideo && (
        <Dialog open={isOpenVideo} onOpenChange={(o) => { setIsOpenVideo(o); if (!o) setOpenVideo(null); }}>
          <VideoPlayer video={openVideo} onClose={() => { setIsOpenVideo(false); setOpenVideo(null); }} />
        </Dialog>
      )}
    </>
  );
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMode, setPreviewMode] = useState<"standard" | "plus">("standard");
  const recentScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const [trendingCanScrollLeft, setTrendingCanScrollLeft] = useState(false);
  const [trendingCanScrollRight, setTrendingCanScrollRight] = useState(true);
  const [showTrending, setShowTrending] = useState(true);
  
  // Fuzzy search helper - normalizes and checks if search terms appear in text
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

  // ── Favorites ──────────────────────────────────────────────────────────────
  const { data: favoritedIds = [] } = useQuery<string[]>({
    queryKey: ["/api/user/favorites"],
    enabled: hasActiveSubscription,
  });
  const favoriteVideos = useMemo(() => {
    if (!videos || !favoritedIds.length) return [];
    return favoritedIds.map(id => videos.find(v => v.id === id)).filter(Boolean) as VideoType[];
  }, [videos, favoritedIds]);

  // ── Continue Watching ──────────────────────────────────────────────────────
  const { data: continueWatching = [] } = useQuery<any[]>({
    queryKey: ["/api/user/continue-watching"],
    enabled: hasActiveSubscription,
  });

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

  // Set default category to first available category when loaded
  useEffect(() => {
    if (selectedCategory === null && categories.length > 0) {
      const firstCategory = categories[0];
      setSelectedCategory(firstCategory.id);
      // Also expand if it's a top-level category with subcategories
      if (!firstCategory.parentCategoryId) {
        setExpandedCategory(firstCategory.id);
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
    if (selectedCategory === "uncategorized") {
      return videos.filter(v => !v.categoryId);
    }
    
    // Check if selectedCategory is a main (top-level) category
    const isMainCategory = topLevelCategories.some(c => c.id === selectedCategory);
    if (isMainCategory) {
      // Get all subcategory IDs for this main category
      const subcategoryIds = getSubcategories(selectedCategory).map(s => s.id);
      // Include videos from main category AND all its subcategories
      return videos.filter(v => v.categoryId === selectedCategory || subcategoryIds.includes(v.categoryId || ""));
    }
    
    // It's a subcategory - show only videos in that subcategory
    return videos.filter(v => v.categoryId === selectedCategory);
  }, [videos, selectedCategory, topLevelCategories, getSubcategories]);

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
    <div className="min-h-screen" style={{background: "radial-gradient(ellipse at 15% 10%, rgba(237,229,24,0.13) 0%, transparent 45%), radial-gradient(ellipse at 85% 15%, rgba(8,119,156,0.18) 0%, transparent 45%), radial-gradient(ellipse at 75% 60%, rgba(237,229,24,0.09) 0%, transparent 40%), radial-gradient(ellipse at 20% 75%, rgba(8,119,156,0.14) 0%, transparent 45%), radial-gradient(ellipse at 50% 40%, rgba(8,50,120,0.20) 0%, transparent 60%), linear-gradient(160deg, #060e20 0%, #071830 40%, #060f1e 70%, #07101f 100%)"}}>
      <header className="sticky top-0 z-50 border-b border-[#EDE518]/20" style={{background: "linear-gradient(90deg, #040d1a 0%, #081630 50%, #040d1a 100%)", backdropFilter: "blur(12px)"}}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.webp" 
              alt="OneTimeOneTime" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-white">OneTimeOneTime</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {hasActiveSubscription && (
              <DropdownMenu open={isNotifOpen} onOpenChange={(o) => { setIsNotifOpen(o); if (o && unreadCount > 0) markAllReadMutation.mutate(); }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
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
            {user?.role !== "admin" && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-account-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                      Manage your account, phone number, and billing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Email Display */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                        {user?.email}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </h3>
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
                  </div>
                </DialogContent>
              </Dialog>
            )}
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

      {/* Admin Preview Toggle — only visible to admins */}
      {user?.role === "admin" && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800" data-testid="bar-admin-preview">
          <div className="container mx-auto px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 shrink-0">
              Admin Preview
            </span>
            <div className="flex items-center gap-1 rounded-full border border-amber-300 dark:border-amber-700 bg-white dark:bg-amber-900/30 p-0.5">
              <button
                onClick={() => setPreviewMode("standard")}
                data-testid="button-preview-standard"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  previewMode === "standard"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setPreviewMode("plus")}
                data-testid="button-preview-plus"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                  previewMode === "plus"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                }`}
              >
                <Star className="h-3 w-3" />
                Plus
              </button>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-500">
              Viewing as {previewMode === "plus" ? "Plus" : "Standard"} subscriber
            </span>
          </div>
        </div>
      )}

      {/* Announcement Banner */}
      {announcement?.isActive && (announcement.text?.trim() || announcement.imageUrl) && (
        <AnnouncementBanner text={announcement.text} imageUrl={announcement.imageUrl} />
      )}

      {/* Dashboard Banner Slideshow */}
      {banners.length > 0 && (
        <DashboardBannerSlideshow banners={banners} videos={videos || []} />
      )}

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

              {/* Search Bar */}
              <div className="max-w-md">
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d1828] border-white/10 text-white placeholder:text-slate-500 focus:border-[#EDE518]/50"
                  data-testid="input-search-videos"
                />
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
              
              {/* Continue Watching Section */}
              {!searchQuery.trim() && continueWatching.length > 0 && (
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
              {!searchQuery.trim() && favoriteVideos.length > 0 && (
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
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {topLevelCategories.map((category) => {
                    const subcats = getSubcategories(category.id);
                    const isSelected = selectedCategory === category.id || subcats.some(s => s.id === selectedCategory);
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
                  const gridCols = theme ? theme.gridCols : "grid-cols-2 md:grid-cols-3";
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

                          // Sort all videos by sortOrder then createdAt
                          const videosSorted = [...filteredVideos].sort((a, b) =>
                            ((a as any).sortOrder ?? 0) - ((b as any).sortOrder ?? 0) ||
                            (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0)
                          );

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
    </div>
  );
}
