import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Volume2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AudioFile, SystemSetting } from "@shared/schema";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [mainGreetingId, setMainGreetingId] = useState<string>("");
  const [nonSubGreetingId, setNonSubGreetingId] = useState<string>("");

  const { data: audioFiles = [], isLoading: filesLoading } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const { data: settings = [], isLoading: settingsLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  useEffect(() => {
    if (settings.length > 0) {
      const mainGreeting = settings.find((s: SystemSetting) => s.key === "main_greeting");
      const nonSubGreeting = settings.find((s: SystemSetting) => s.key === "non_subscriber_greeting");
      if (mainGreeting?.audioFileId) setMainGreetingId(mainGreeting.audioFileId);
      if (nonSubGreeting?.audioFileId) setNonSubGreetingId(nonSubGreeting.audioFileId);
    }
  }, [settings]);

  const saveGreetingMutation = useMutation({
    mutationFn: async ({ type, audioFileId }: { type: "greeting" | "non-subscriber-greeting"; audioFileId: string | null }) => {
      await apiRequest("POST", `/api/admin/settings/${type}`, { audioFileId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Saved",
        description: "Greeting setting updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save greeting setting.",
        variant: "destructive",
      });
    },
  });

  const isLoading = filesLoading || settingsLoading;

  const greetingFiles = audioFiles.filter((f) => f.type === "greeting");
  const allAudioFiles = audioFiles;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          IVR Settings
        </h2>
        <p className="text-muted-foreground">
          Configure the greetings that play when callers connect
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Main Greeting
            </CardTitle>
            <CardDescription>
              Plays for subscribers when they call. Users can press menu options while this plays.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={mainGreetingId}
              onValueChange={setMainGreetingId}
            >
              <SelectTrigger data-testid="select-main-greeting">
                <SelectValue placeholder="Select an audio file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No greeting (use default)</SelectItem>
                {allAudioFiles.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.name} ({file.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => saveGreetingMutation.mutate({
                type: "greeting",
                audioFileId: mainGreetingId === "none" ? null : mainGreetingId || null,
              })}
              disabled={saveGreetingMutation.isPending}
              data-testid="button-save-main-greeting"
            >
              {saveGreetingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Main Greeting
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Non-Subscriber Greeting
            </CardTitle>
            <CardDescription>
              Plays for non-subscribers before hanging up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={nonSubGreetingId}
              onValueChange={setNonSubGreetingId}
            >
              <SelectTrigger data-testid="select-non-sub-greeting">
                <SelectValue placeholder="Select an audio file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No greeting (use default)</SelectItem>
                {allAudioFiles.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.name} ({file.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => saveGreetingMutation.mutate({
                type: "non-subscriber-greeting",
                audioFileId: nonSubGreetingId === "none" ? null : nonSubGreetingId || null,
              })}
              disabled={saveGreetingMutation.isPending}
              data-testid="button-save-nonsub-greeting"
            >
              {saveGreetingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Non-Subscriber Greeting
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Telnyx Webhook URL</CardTitle>
          <CardDescription>
            Configure your Telnyx phone number to use this webhook URL for incoming calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block bg-muted p-3 rounded-md text-sm break-all" data-testid="text-webhook-url">
            {window.location.origin}/api/telnyx/answer
          </code>
          <p className="text-sm text-muted-foreground mt-2">
            Set this as your TeXML webhook URL in your Telnyx dashboard for your phone number.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
