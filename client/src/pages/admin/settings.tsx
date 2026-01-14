import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Volume2, Upload, Play, Pause, Lock, UserX, Users } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AudioFile, SystemSetting } from "@shared/schema";

interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

function formatDuration(seconds: number): string {
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
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [nonSubGreetingId, setNonSubGreetingId] = useState<string>("");
  const [isUploadingNonSub, setIsUploadingNonSub] = useState(false);
  const [nonSubPlayerOpen, setNonSubPlayerOpen] = useState(false);
  const nonSubFileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: audioFiles = [], isLoading: filesLoading } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const { data: settings = [], isLoading: settingsLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: adminUsers = [], isLoading: adminsLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      await apiRequest("DELETE", `/api/admin/admins/${adminId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Admin account deleted successfully" });
      setDeleteConfirmOpen(false);
      setDeleteAdminId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete admin", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const nonSubGreeting = settings.find((s: SystemSetting) => s.key === "non_subscriber_greeting");
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "New password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords don't match", variant: "destructive" });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const res = await apiRequest("POST", "/api/auth/change-password", { currentPassword, newPassword });
      toast({ title: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ 
        title: "Failed to change password", 
        description: error.message || "Please check your current password",
        variant: "destructive" 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUploadGreeting = async (
    file: File,
    type: "non-subscriber-greeting",
    oldAudioId: string | null
  ) => {
    setIsUploadingNonSub(true);
    
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
      setIsUploadingNonSub(false);
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
            {nonSubGreetingId && nonSubGreetingId !== "none" && allAudioFiles.find(f => f.id === nonSubGreetingId) && (
              <Button
                variant="outline"
                onClick={() => setNonSubPlayerOpen(true)}
                data-testid="button-listen-nonsub-greeting"
              >
                <Play className="h-4 w-4 mr-2" />
                Listen
              </Button>
            )}
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

      <AudioPlayerDialog
        open={nonSubPlayerOpen}
        onOpenChange={setNonSubPlayerOpen}
        audioFile={allAudioFiles.find(f => f.id === nonSubGreetingId) || null}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your admin account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              data-testid="input-new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              data-testid="input-confirm-password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            data-testid="button-change-password"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Accounts
          </CardTitle>
          <CardDescription>
            Manage admin user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : adminUsers.length === 0 ? (
            <p className="text-muted-foreground">No admin accounts found.</p>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium" data-testid={`text-admin-email-${admin.id}`}>{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleteAdminId(admin.id);
                      setDeleteConfirmOpen(true);
                    }}
                    data-testid={`button-delete-admin-${admin.id}`}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this admin account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAdminId && deleteAdminMutation.mutate(deleteAdminId)}
              disabled={deleteAdminMutation.isPending}
              data-testid="button-confirm-delete-admin"
            >
              {deleteAdminMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
