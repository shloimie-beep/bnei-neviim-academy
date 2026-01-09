import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, MicOff, Mic, Volume2, VolumeX, Phone, Clock, RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle, Upload, ExternalLink, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ConferenceParticipant, UnmuteRequest, AudioFile, SystemSetting } from "@shared/schema";

interface ConferenceStatus {
  isActive: boolean;
  sessionId: string | null;
  conferenceName: string | null;
  startedAt: string | null;
  participantCount: number;
  participants: (ConferenceParticipant & { phoneNumber: string })[];
  unmuteRequests: UnmuteRequest[];
}

function formatPhoneNumber(phone: string): string {
  const last4 = phone.slice(-4);
  return `***-***-${last4}`;
}

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

function ParticipantRow({
  participant,
  onToggleMute,
  isMuting,
}: {
  participant: ConferenceParticipant;
  onToggleMute: () => void;
  isMuting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium" data-testid={`text-participant-${participant.id}`}>
            {formatPhoneNumber(participant.phoneNumber)}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            Joined {new Date(participant.joinedAt!).toLocaleTimeString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={participant.isMuted ? "secondary" : "default"}>
          {participant.isMuted ? (
            <><MicOff className="h-3 w-3 mr-1" /> Muted</>
          ) : (
            <><Mic className="h-3 w-3 mr-1" /> Unmuted</>
          )}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleMute}
          disabled={isMuting}
          data-testid={`button-toggle-mute-${participant.id}`}
        >
          {isMuting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : participant.isMuted ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function UnmuteRequestRow({
  request,
  onApprove,
  onDeny,
  isProcessing,
}: {
  request: UnmuteRequest;
  onApprove: () => void;
  onDeny: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Mic className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{formatPhoneNumber(request.phoneNumber)}</p>
          <p className="text-sm text-muted-foreground">
            Requested {new Date(request.requestedAt!).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onApprove}
          disabled={isProcessing}
          data-testid={`button-approve-${request.id}`}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDeny}
          disabled={isProcessing}
          data-testid={`button-deny-${request.id}`}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function AudioPlayerDialog({
  open,
  onOpenChange,
  audioFile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioFile: AudioFile | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!audioFile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{audioFile.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={`/api/admin/audio-files/${audioFile.id}/stream`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
          
          <div className="flex items-center gap-4">
            <Button size="icon" variant="outline" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
              />
            </div>
            
            <span className="text-sm text-muted-foreground min-w-[80px] text-right">
              {formatAudioDuration(currentTime)} / {formatAudioDuration(duration)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ConferenceManagement() {
  const { toast } = useToast();
  const [mutingParticipant, setMutingParticipant] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [isMutingAll, setIsMutingAll] = useState(false);
  const [noConferenceAudioId, setNoConferenceAudioId] = useState<string>("");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conference, isLoading, refetch } = useQuery<ConferenceStatus>({
    queryKey: ["/api/admin/conference"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { data: audioFiles = [] } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const { data: settings = [] } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  useEffect(() => {
    if (settings.length > 0) {
      const noConfAudio = settings.find((s: SystemSetting) => s.key === "no_conference_audio");
      if (noConfAudio?.audioFileId) setNoConferenceAudioId(noConfAudio.audioFileId);
    }
  }, [settings]);

  const handleUploadNoConferenceAudio = async (file: File) => {
    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("type", "conference");
      if (noConferenceAudioId && noConferenceAudioId !== "none") {
        formData.append("replaceAudioId", noConferenceAudioId);
      }

      const res = await fetch("/api/admin/audio-files/upload-and-assign", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const newAudio = await res.json();
      
      await apiRequest("POST", "/api/admin/settings/no-conference-audio", { audioFileId: newAudio.id });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audio-files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Audio uploaded and saved" });
    } catch {
      toast({ title: "Failed to upload audio", variant: "destructive" });
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const toggleMuteMutation = useMutation({
    mutationFn: async ({ participantId, mute }: { participantId: string; mute: boolean }) => {
      setMutingParticipant(participantId);
      const res = await apiRequest("POST", `/api/admin/conference/participants/${participantId}/mute`, { mute });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/conference"] });
      toast({ title: "Participant mute status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update mute status", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setMutingParticipant(null);
    },
  });

  const muteAllMutation = useMutation({
    mutationFn: async () => {
      setIsMutingAll(true);
      const res = await apiRequest("POST", "/api/admin/conference/mute-all");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/conference"] });
      toast({ title: "All participants muted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to mute all", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setIsMutingAll(false);
    },
  });

  const handleUnmuteRequest = useMutation({
    mutationFn: async ({ requestId, approve }: { requestId: string; approve: boolean }) => {
      setProcessingRequest(requestId);
      const res = await apiRequest("POST", `/api/admin/conference/unmute-requests/${requestId}`, { approve });
      return res.json();
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/conference"] });
      toast({ title: approve ? "Request approved" : "Request denied" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to process request", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setProcessingRequest(null);
    },
  });

  const pendingRequests = conference?.unmuteRequests?.filter((r) => r.status === "pending") || [];

  const noConferenceAudioFile = audioFiles.find(f => f.id === noConferenceAudioId);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conference Control</h1>
          <p className="text-muted-foreground">Monitor and manage live conference calls.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Voitex Portal Notice */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ExternalLink className="h-5 w-5" />
            Conference Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">
            The actual conference call is managed through the Voitex portal. Use the link below to access the full conference management features.
          </p>
          <a href="https://voitex.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" data-testid="button-voitex-portal">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Voitex Portal
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* No Active Conference Audio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            No Conference Audio
          </CardTitle>
          <CardDescription>
            This audio plays when callers try to join a conference but there is no active session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current File</p>
            <p className="text-sm text-muted-foreground">
              {noConferenceAudioId && noConferenceAudioId !== "none" 
                ? noConferenceAudioFile?.name || "Selected file not found"
                : "No audio selected (using default message)"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {noConferenceAudioId && noConferenceAudioId !== "none" && noConferenceAudioFile && (
              <Button
                variant="outline"
                onClick={() => setAudioPlayerOpen(true)}
                data-testid="button-listen-no-conference-audio"
              >
                <Play className="h-4 w-4 mr-2" />
                Listen
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUploadNoConferenceAudio(file);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
              data-testid="input-no-conference-audio-file"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAudio}
              data-testid="button-upload-no-conference-audio"
            >
              {isUploadingAudio ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {noConferenceAudioId && noConferenceAudioId !== "none" ? "Replace File" : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AudioPlayerDialog
        open={audioPlayerOpen}
        onOpenChange={setAudioPlayerOpen}
        audioFile={noConferenceAudioFile || null}
      />

      {/* Conference Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Conference Status
            </CardTitle>
            <CardDescription>Current state of the live conference</CardDescription>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <Badge variant={conference?.isActive ? "default" : "secondary"} data-testid="badge-conference-status">
              {conference?.isActive ? "Live" : "Inactive"}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : conference?.isActive ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Conference Name</p>
                <p className="font-medium">{conference.conferenceName || "Kids Hotline"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{conference.startedAt ? formatDuration(conference.startedAt) : "--"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="font-medium">{conference.participantCount || 0} active</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active conference at the moment.</p>
              <p className="text-sm text-muted-foreground">A conference will start when callers join.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {conference?.isActive && (
        <>
          {/* Global Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Global Controls</CardTitle>
              <CardDescription>Actions that affect all participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="destructive"
                  onClick={() => muteAllMutation.mutate()}
                  disabled={isMutingAll}
                  data-testid="button-mute-all"
                >
                  {isMutingAll ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <VolumeX className="h-4 w-4 mr-2" />
                  )}
                  Mute All Participants
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unmute Requests */}
          {pendingRequests.length > 0 && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Unmute Requests
                  <Badge variant="default" className="ml-2">{pendingRequests.length}</Badge>
                </CardTitle>
                <CardDescription>Callers requesting permission to speak</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {pendingRequests.map((request, index) => (
                      <div key={request.id}>
                        <UnmuteRequestRow
                          request={request}
                          onApprove={() => handleUnmuteRequest.mutate({ requestId: request.id, approve: true })}
                          onDeny={() => handleUnmuteRequest.mutate({ requestId: request.id, approve: false })}
                          isProcessing={processingRequest === request.id}
                        />
                        {index < pendingRequests.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Participants List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Active Participants
                <Badge variant="secondary" className="ml-2">{conference.participants?.length || 0}</Badge>
              </CardTitle>
              <CardDescription>Currently connected callers</CardDescription>
            </CardHeader>
            <CardContent>
              {conference.participants && conference.participants.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {conference.participants.map((participant, index) => (
                      <div key={participant.id}>
                        <ParticipantRow
                          participant={participant}
                          onToggleMute={() =>
                            toggleMuteMutation.mutate({
                              participantId: participant.id,
                              mute: !participant.isMuted,
                            })
                          }
                          isMuting={mutingParticipant === participant.id}
                        />
                        {index < conference.participants.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No participants in the conference yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
