import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth-context";

interface LiveMeetingData {
  meetingUrl: string;
  isActive: boolean;
  updatesText: string;
}

export default function LiveMeetingManagement() {
  const { toast } = useToast();
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [updatesText, setUpdatesText] = useState<string | null>(null);

  const { data, isLoading } = useQuery<LiveMeetingData>({
    queryKey: ["/api/admin/live-meeting"],
    queryFn: async () => {
      const res = await fetch("/api/admin/live-meeting", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const d = await res.json();
      if (meetingUrl === null) setMeetingUrl(d.meetingUrl ?? "");
      if (isActive === null) setIsActive(d.isActive ?? false);
      if (updatesText === null) setUpdatesText(d.updatesText ?? "");
      return d;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/admin/live-meeting", {
        meetingUrl: meetingUrl ?? "",
        isActive: isActive ?? false,
        updatesText: updatesText ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-meeting"] });
      toast({ title: "Saved", description: "Live meeting settings updated." });
    },
    onError: () =>
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const currentUrl = meetingUrl ?? data?.meetingUrl ?? "";
  const currentActive = isActive ?? data?.isActive ?? false;
  const currentText = updatesText ?? data?.updatesText ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Live Meeting</h1>
        <p className="text-muted-foreground">
          Manage the Google Meet link and updates shown to Plus subscribers on their dashboard.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Google Meet Settings
            </CardTitle>
            <CardDescription>
              Control whether a live meeting button is shown to Plus members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Meeting is live now</p>
                    <p className="text-sm text-muted-foreground">
                      {currentActive
                        ? "Join button is visible to Plus members"
                        : "Showing \"No meeting happening now\""}
                    </p>
                  </div>
                  <Switch
                    checked={currentActive}
                    onCheckedChange={setIsActive}
                    data-testid="switch-meeting-active"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-url">Google Meet URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meeting-url"
                      placeholder="https://meet.google.com/abc-defg-hij"
                      value={currentUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      data-testid="input-meeting-url"
                    />
                    {currentUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        data-testid="button-open-meeting"
                      >
                        <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste the full Google Meet link here. Update this each time you start a new meeting.
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                  <p className="text-sm font-medium">What Plus members will see:</p>
                  {currentActive && currentUrl ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Video className="h-4 w-4" />
                      A "Join Live Meeting" button linking to your Meet URL
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      "No meeting happening right now"
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plus Member Updates
            </CardTitle>
            <CardDescription>
              A text box visible only to Plus subscribers — use it for schedules, announcements, or any updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="updates-text">Updates / Notes</Label>
                  <Textarea
                    id="updates-text"
                    placeholder="e.g. Next live session: Sunday 8pm ET&#10;Topic: Parshas Bereishis&#10;See you there!"
                    value={currentText}
                    onChange={(e) => setUpdatesText(e.target.value)}
                    rows={8}
                    data-testid="textarea-updates"
                  />
                  <p className="text-xs text-muted-foreground">{currentText.length} characters</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || isLoading}
          data-testid="button-save-meeting"
        >
          {saveMutation.isPending ? "Saving..." : "Save All Changes"}
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={currentActive && currentUrl ? "default" : "outline"}>
            {currentActive && currentUrl ? "Meeting Live" : "No Meeting"}
          </Badge>
          {currentText.trim() && (
            <Badge variant="secondary">Updates set</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
