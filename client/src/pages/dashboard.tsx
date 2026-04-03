import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, CreditCard, Settings, LogOut, Plus, Trash2, Loader2, Clock, CheckCircle, AlertCircle, XCircle, Video, Play, Pause, FileVideo, Volume2, VolumeX, Maximize, Minimize, Edit2, Music, FileText, ExternalLink, Lock, ChevronLeft, ChevronRight, Disc, SkipBack, SkipForward, TrendingUp, Eye, EyeOff, Star, MonitorPlay } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function VideoEmbedPlayer({ video }: { video: VideoType }) {
  // For Vimeo videos, use stored embed URL (includes hash for private videos)
  // or fall back to constructing URL from vimeoVideoId
  const vimeoVideoId = (video as any).vimeoVideoId;
  const storedEmbedUrl = (video as any).vimeoEmbedUrl;
  
  // Use stored embed URL if available (includes hash for private videos)
  // Otherwise construct basic URL (works for unlisted/public videos)
  const embedUrl = storedEmbedUrl 
    ? (storedEmbedUrl.includes('?') ? `${storedEmbedUrl}&autoplay=1` : `${storedEmbedUrl}?autoplay=1`)
    : `https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1&title=0&byline=0&portrait=0`;
  
  // Increment view count in background (fire and forget)
  useEffect(() => {
    fetch(`/api/videos/${video.id}/view`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
    }).catch(() => {}); // Ignore errors
  }, [video.id]);

  // Use Vimeo embed iframe directly - no loading state needed
  return (
    <DialogContent className="max-w-4xl p-0 overflow-hidden">
      <div className="relative bg-black">
        <iframe
          src={embedUrl}
          className="w-full aspect-video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
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
    <DialogContent className="max-w-4xl p-0 overflow-hidden">
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

function VideoCard({ video, isNew, onView, categoryName }: { video: VideoType; isNew?: boolean; onView?: () => void; categoryName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAudio = video.mediaType === "audio";

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

  // Convert Vimeo thumbnail URL to use smaller size for faster loading
  const getSmallThumbnail = (url: string) => {
    // Replace size suffixes like _640x360, _960x540, _1280x720 with smaller _295x166
    return url.replace(/_\d+x\d+/, '_295x166');
  };

  const thumbnailSrc = (() => {
    // Vimeo thumbnail URL stored directly (starts with https://i.vimeocdn.com)
    if (video.thumbnailPath?.startsWith("https://i.vimeocdn.com")) {
      return getSmallThumbnail(video.thumbnailPath);
    }
    // Legacy vimeo:// prefix format
    if (video.thumbnailPath?.startsWith("vimeo://")) {
      return getSmallThumbnail(video.thumbnailPath.replace("vimeo://", ""));
    }
    // Custom thumbnail path (local storage)
    if (video.thumbnailPath) {
      return `/api/videos/${video.id}/thumbnail?v=${cacheBust}`;
    }
    // Vimeo thumbnail from API response
    if ((video as any).vimeoThumbnailUrl) {
      return getSmallThumbnail((video as any).vimeoThumbnailUrl);
    }
    return null;
  })();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && onView) {
      onView();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 border border-white/10 hover:border-[#EDE518]/40 transition-colors" style={{background: "linear-gradient(145deg, #0e1e35 0%, #0a1628 100%)"}} data-testid={`card-video-${video.id}`}>
          <div className={`aspect-video flex items-center justify-center relative group overflow-hidden ${isAudio ? "bg-[#060e1a]" : "bg-[#060e1a]"}`}>
            {thumbnailSrc ? (
              <>
                <img 
                  src={thumbnailSrc} 
                  alt={video.title}
                  className={`h-full w-full ${isAudio ? "object-contain" : "object-cover"}`}
                />
                {isAudio && (
                  <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                )}
              </>
            ) : isAudio ? (
              <Music className="h-12 w-12 text-[#08779C]" />
            ) : (
              <FileVideo className="h-12 w-12 text-[#08779C]" />
            )}
            {isNew && (
              <div className="absolute top-2 right-2">
                <Badge className="text-xs bg-[#EDE518] text-black font-bold" data-testid={`badge-new-${video.id}`}>New</Badge>
              </div>
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
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold line-clamp-1 flex-1 text-white" data-testid={`text-video-title-${video.id}`}>
                {video.title}
              </h3>
              {isAudio && (
                <span className="text-xs text-[#08779C] flex items-center gap-1 flex-shrink-0">
                  <Music className="h-3 w-3" />
                  Audio
                </span>
              )}
            </div>
            {categoryName && (
              <span className="mt-1.5 inline-block text-xs font-semibold text-[#EDE518] uppercase tracking-wider" data-testid={`badge-category-${video.id}`}>
                {categoryName}
              </span>
            )}
            {video.description && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
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
    <div className="min-h-screen" style={{background: "linear-gradient(135deg, #071220 0%, #0a1a35 30%, #071830 60%, #0a1220 100%)"}}>
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
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
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

      {/* Academy Hero Banner */}
      <div className="relative overflow-hidden border-b border-white/10" style={{background: "linear-gradient(135deg, #0d1a35 0%, #0a2040 40%, #071830 70%, #0d1a35 100%)"}}>
        {/* Decorative color blobs */}
        <div className="absolute top-0 left-0 w-64 h-full opacity-20" style={{background: "radial-gradient(ellipse at left center, #EDE518 0%, transparent 70%)"}} />
        <div className="absolute top-0 right-0 w-64 h-full opacity-20" style={{background: "radial-gradient(ellipse at right center, #08779C 0%, transparent 70%)"}} />
        {/* Bottom accent stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{background: "linear-gradient(90deg, transparent 0%, #EDE518 30%, #08779C 70%, transparent 100%)"}} />
        <div className="relative container mx-auto px-4 py-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#EDE518] text-xs font-black uppercase tracking-[0.25em] mb-2">✦ Members Area</p>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">OneTime <span style={{color: "#EDE518"}}>Academy</span></h1>
            <p className="text-slate-300 text-sm mt-1">Your exclusive Torah content library</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#EDE518] inline-block shadow-[0_0_6px_#EDE518]" />Videos & Films
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#08779C] inline-block shadow-[0_0_6px_#08779C]" />Audio & Albums
            </span>
          </div>
        </div>
      </div>

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
                <div>
                  {/* Section label */}
                  {selectedCategory && !videosLoading && (
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-shrink-0 h-8 w-1.5 rounded-full bg-[#EDE518] shadow-[0_0_8px_#EDE518]" />
                      <h2 className="text-xl font-black text-white uppercase tracking-wide">
                        {categories.find(c => c.id === selectedCategory)?.name || "All Content"}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#EDE518]/30 to-transparent" />
                    </div>
                  )}
                  {videosLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredVideos.map((video, index) => (
                        <div key={video.id} className={index === 0 ? "col-span-2 md:col-span-2" : ""}>
                          <VideoCard 
                            video={video}
                            isNew={isVideoNew(video)}
                            onView={() => markVideoViewedMutation.mutate(video.id)}
                          />
                        </div>
                      ))}
                    </div>
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
