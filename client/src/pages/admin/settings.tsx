import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Volume2, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AudioFile, SystemSetting } from "@shared/schema";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [mainGreetingId, setMainGreetingId] = useState<string>("");
  const [nonSubGreetingId, setNonSubGreetingId] = useState<string>("");
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingNonSub, setIsUploadingNonSub] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const nonSubFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadGreeting = async (
    file: File,
    type: "greeting" | "non-subscriber-greeting",
    oldAudioId: string | null
  ) => {
    const setUploading = type === "greeting" ? setIsUploadingMain : setIsUploadingNonSub;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("type", "greeting");
      if (oldAudioId) {
        formData.append("replaceAudioId", oldAudioId);
      }

      const res = await fetch("/api/admin/audio-files/upload-and-assign", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const newAudio = await res.json();
      
      // Save the greeting setting
      await apiRequest("POST", `/api/admin/settings/${type}`, { audioFileId: newAudio.id });
      
      // Clean up old file
      if (newAudio.oldAudioIdToDelete) {
        try {
          await fetch("/api/admin/audio-files/cleanup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioFileId: newAudio.oldAudioIdToDelete }),
          });
        } catch {}
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/audio-files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Greeting uploaded and saved" });
    } catch {
      toast({ title: "Failed to upload greeting", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const isLoading = filesLoading || settingsLoading;

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Greeting for Subscribers
          </CardTitle>
          <CardDescription>
            Plays for subscribers when they call. Users can press menu options while this plays.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current File</p>
            <p className="text-sm text-muted-foreground">
              {mainGreetingId && mainGreetingId !== "none" 
                ? allAudioFiles.find(f => f.id === mainGreetingId)?.name || "Selected file not found"
                : "No greeting selected (using default)"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <input
              ref={mainFileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUploadGreeting(file, "greeting", mainGreetingId && mainGreetingId !== "none" ? mainGreetingId : null);
                  if (mainFileInputRef.current) mainFileInputRef.current.value = "";
                }
              }}
              data-testid="input-main-greeting-file"
            />
            <Button
              variant="outline"
              onClick={() => mainFileInputRef.current?.click()}
              disabled={isUploadingMain}
              data-testid="button-upload-main-greeting"
            >
              {isUploadingMain ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {mainGreetingId && mainGreetingId !== "none" ? "Replace File" : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Greeting for Non-Subscribers
          </CardTitle>
          <CardDescription>
            Plays for non-subscribers before hanging up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current File</p>
            <p className="text-sm text-muted-foreground">
              {nonSubGreetingId && nonSubGreetingId !== "none" 
                ? allAudioFiles.find(f => f.id === nonSubGreetingId)?.name || "Selected file not found"
                : "No greeting selected (using default)"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <input
              ref={nonSubFileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUploadGreeting(file, "non-subscriber-greeting", nonSubGreetingId && nonSubGreetingId !== "none" ? nonSubGreetingId : null);
                  if (nonSubFileInputRef.current) nonSubFileInputRef.current.value = "";
                }
              }}
              data-testid="input-nonsub-greeting-file"
            />
            <Button
              variant="outline"
              onClick={() => nonSubFileInputRef.current?.click()}
              disabled={isUploadingNonSub}
              data-testid="button-upload-nonsub-greeting"
            >
              {isUploadingNonSub ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {nonSubGreetingId && nonSubGreetingId !== "none" ? "Replace File" : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voitex API Branch Webhook</CardTitle>
          <CardDescription>
            Configure your Voitex IVR route to use this webhook URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block bg-muted p-3 rounded-md text-sm break-all" data-testid="text-voitex-webhook-url">
            {window.location.origin}/api/voitex/webhook
          </code>
          <p className="text-sm text-muted-foreground mt-2">
            Set this as your API Branch webhook URL in your Voitex dashboard.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telnyx Webhook URL</CardTitle>
          <CardDescription>
            Configure your Telnyx phone number to use this webhook URL for incoming calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block bg-muted p-3 rounded-md text-sm break-all" data-testid="text-telnyx-webhook-url">
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
