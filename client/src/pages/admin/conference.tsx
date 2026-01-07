import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, MicOff, Mic, Volume2, VolumeX, Phone, Clock, RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ConferenceParticipant, UnmuteRequest } from "@shared/schema";

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

export default function ConferenceManagement() {
  const { toast } = useToast();
  const [mutingParticipant, setMutingParticipant] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [isMutingAll, setIsMutingAll] = useState(false);

  const { data: conference, isLoading, refetch } = useQuery<ConferenceStatus>({
    queryKey: ["/api/admin/conference"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

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
