import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, CreditCard, Settings, LogOut, Plus, Trash2, Loader2, Clock, CheckCircle, AlertCircle, XCircle, Video, Play, Pause, FileVideo, Volume2, VolumeX, Maximize, Minimize, Edit2, Music, FileText, ExternalLink, Lock, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { PdfViewer } from "@/components/pdf-viewer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef, useMemo, useEffect } from "react";
import type { PhoneNumber, Video as VideoType, VideoCategory, Document } from "@shared/schema";

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

function BunnyVideoPlayer({ video }: { video: VideoType }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/videos/${video.id}/stream`)
      .then(res => res.json())
      .then(data => {
        if (data.bunny && data.embedUrl) {
          setEmbedUrl(data.embedUrl);
        } else {
          setError("Video not available");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load video");
        setLoading(false);
      });
  }, [video.id]);

  if (loading) {
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

  if (error || !embedUrl) {
    return (
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          <p className="text-white">{error || "Video not available"}</p>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{video.title}</h3>
        </div>
      </DialogContent>
    );
  }

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

  useEffect(() => {
    fetch(`/api/videos/${video.id}/stream`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load");
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          return res.json().then(data => {
            if (data.bunnyStorage && data.cdnUrl) {
              setStreamUrl(data.cdnUrl);
            } else if (data.bunny && data.embedUrl) {
              setStreamUrl(data.embedUrl);
            } else {
              setStreamError("Media not available");
            }
            setStreamLoading(false);
          });
        } else {
          setStreamUrl(`/api/videos/${video.id}/stream`);
          setStreamLoading(false);
        }
      })
      .catch(() => {
        setStreamUrl(`/api/videos/${video.id}/stream`);
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
                src={`/api/videos/${video.id}/thumbnail`}
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
  if (video.bunnyGuid) {
    return <BunnyVideoPlayer video={video} />;
  }
  return <LegacyVideoPlayer video={video} onClose={onClose} />;
}

function VideoCard({ video, isNew, onView }: { video: VideoType; isNew?: boolean; onView?: () => void }) {
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

  const thumbnailSrc = video.thumbnailPath 
    ? (video.thumbnailPath.startsWith("bunny://") 
        ? (video as any).bunnyThumbnailUrl || `https://vz-2480b6a7-327.b-cdn.net/${video.bunnyGuid}/thumbnail.jpg`
        : `/api/videos/${video.id}/thumbnail`)
    : (video as any).bunnyThumbnailUrl 
      ? (video as any).bunnyThumbnailUrl
      : null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && onView) {
      onView();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2" data-testid={`card-video-${video.id}`}>
          <div className="aspect-video bg-muted flex items-center justify-center relative group overflow-hidden">
            {thumbnailSrc ? (
              <>
                <img 
                  src={thumbnailSrc} 
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                {isAudio && (
                  <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                )}
              </>
            ) : isAudio ? (
              <Music className="h-12 w-12 text-muted-foreground" />
            ) : (
              <FileVideo className="h-12 w-12 text-muted-foreground" />
            )}
            {isNew && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs" data-testid={`badge-new-${video.id}`}>New</Badge>
              </div>
            )}
            {durationText && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium" data-testid={`duration-${video.id}`}>
                {durationText}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-6 w-6 text-primary-foreground ml-1" />
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium line-clamp-1 flex-1" data-testid={`text-video-title-${video.id}`}>
                {video.title}
              </h3>
              {isAudio && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                  <Music className="h-3 w-3" />
                  Audio
                </span>
              )}
            </div>
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

function DocumentCard({ doc }: { doc: Document }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2" data-testid={`card-doc-${doc.id}`}>
          <div className="aspect-video bg-muted flex items-center justify-center relative group">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium line-clamp-1 flex-1" data-testid={`text-doc-title-${doc.id}`}>
                {doc.title}
              </h3>
              <Badge variant="secondary" className="text-xs flex-shrink-0">PDF</Badge>
            </div>
            {doc.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {doc.description}
              </p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col [&>button]:hidden">
        <div className="flex-1 overflow-hidden">
          <PdfViewer
            url={`/api/documents/${doc.id}/view`}
            title={doc.title}
            onClose={() => setIsViewerOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
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
  const recentScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: phoneNumbers, isLoading: phonesLoading } = useQuery<PhoneNumber[]>({
    queryKey: ["/api/phone-numbers"],
  });

  const { data: subscription, isLoading: subLoading } = useQuery<any>({
    queryKey: ["/api/subscription"],
  });

  const { data: videos, isLoading: videosLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos"],
  });

  const { data: categories = [] } = useQuery<VideoCategory[]>({
    queryKey: ["/api/video-categories"],
  });

  const { data: viewedData } = useQuery<{ viewedVideoIds: string[] }>({
    queryKey: ["/api/videos/viewed"],
  });
  const viewedVideoIds = viewedData?.viewedVideoIds || [];

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
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
      setSelectedCategory(categories[0].id);
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

  // Get 10 most recent videos for the Recent section
  const recentVideos = useMemo(() => {
    if (!videos) return [];
    return [...videos]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [videos]);

  // Get filtered content based on selected category
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (selectedCategory === null) return [];
    if (selectedCategory === "documents") return [];
    if (selectedCategory === "uncategorized") {
      return videos.filter(v => !v.categoryId);
    }
    return videos.filter(v => v.categoryId === selectedCategory);
  }, [videos, selectedCategory]);

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

  const daysRemaining = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Check if user has access via subscription, trial, or whitelisted email
  const hasActiveSubscription = user?.subscriptionStatus === "active" || 
    (user?.subscriptionStatus === "trial" && daysRemaining > 0) ||
    user?.isWhitelistedEmail === true;

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
                      </h3>
                      {(user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trial") && subscription?.stripeCustomerId ? (
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
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => createCheckoutMutation.mutate()}
                          disabled={createCheckoutMutation.isPending}
                          data-testid="button-start-trial-settings"
                        >
                          {createCheckoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Subscribe Now
                        </Button>
                      )}
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
          Call the Hotline at 613-ONE-TIME (613-663-8463)
        </span>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {hasActiveSubscription ? (
            <>
              {/* Recent Videos Section - Horizontal Scrolling */}
              {recentVideos.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Recent</h2>
                  <div className="grid grid-cols-[40px_1fr_40px] gap-2 items-center">
                    {/* Left control column - always reserves space */}
                    <div className="flex items-center justify-center">
                      {canScrollLeft ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => scrollRecent("left")}
                          data-testid="button-scroll-recent-left"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="w-9 h-9" /> 
                      )}
                    </div>
                    
                    {/* Scrollable video track */}
                    <div className="relative overflow-hidden">
                      {/* Left fade gradient */}
                      {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                      )}
                      <div 
                        ref={recentScrollRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide px-2 pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {recentVideos.map((video) => (
                          <div key={video.id} className="flex-shrink-0 w-56">
                            <VideoCard 
                              video={video}
                              isNew={isVideoNew(video)}
                              onView={() => markVideoViewedMutation.mutate(video.id)}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Right fade gradient */}
                      {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                      )}
                    </div>
                    
                    {/* Right control column - always reserves space */}
                    <div className="flex items-center justify-center">
                      {canScrollRight ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => scrollRecent("right")}
                          data-testid="button-scroll-recent-right"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="w-9 h-9" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`button-category-${category.id}`}
                  >
                    {category.name}
                  </Button>
                ))}
                {videosByCategory.uncategorized && videosByCategory.uncategorized.length > 0 && (
                  <Button
                    variant={selectedCategory === "uncategorized" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("uncategorized")}
                    data-testid="button-category-uncategorized"
                  >
                    Other
                  </Button>
                )}
                {documents && documents.length > 0 && (
                  <Button
                    variant={selectedCategory === "documents" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("documents")}
                    data-testid="button-category-documents"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </Button>
                )}
              </div>

              {/* Content based on selected category */}
              {selectedCategory === "documents" ? (
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
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Documents Yet</h3>
                        <p className="text-muted-foreground">
                          Check back soon for new document content!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div>
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
                  ) : filteredVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVideos.map((video) => (
                        <VideoCard 
                          key={video.id} 
                          video={video}
                          isNew={isVideoNew(video)}
                          onView={() => markVideoViewedMutation.mutate(video.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileVideo className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Content Yet</h3>
                        <p className="text-muted-foreground">
                          Check back soon for new content!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

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
