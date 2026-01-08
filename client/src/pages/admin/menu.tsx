import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ChevronLeft, Play, Pause, Upload, RefreshCw, Volume2, Plus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MenuOption, AudioFile } from "@shared/schema";

type FunctionType = "none" | "play_mp3" | "submenu" | "conference";

interface MenuOptionData {
  optionNumber: number;
  functionType: FunctionType;
  audioFileId: string | null;
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {audioFile.name}
          </DialogTitle>
          <DialogDescription>
            Listen to the current audio file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <audio
            ref={audioRef}
            src={`/api/admin/audio-files/${audioFile.id}/stream`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
          
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={togglePlay}
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                data-testid="slider-audio-progress"
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

function ReplaceFileDialog({
  open,
  onOpenChange,
  optionNum,
  currentFile,
  onReplace,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionNum: number;
  currentFile: AudioFile | null;
  onReplace: (file: File, name: string) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setIsUploading(true);
      try {
        await onReplace(file, fileName);
        onOpenChange(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentFile ? "Replace Audio File" : "Upload Audio File"}</DialogTitle>
          <DialogDescription>
            {currentFile 
              ? `Replace "${currentFile.name}" with a new file. The old file will be permanently deleted.`
              : `Upload an audio file for option ${optionNum}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isUploading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Select Audio File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />
              <p className="text-sm text-muted-foreground">
                The file will be uploaded and assigned automatically
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OptionBox({
  num,
  option,
  audioFiles,
  allOptions,
  onUpdate,
  onEditSubmenu,
  onUploadAndAssign,
  isSaving,
}: {
  num: number;
  option?: MenuOption;
  audioFiles: AudioFile[];
  allOptions: MenuOption[];
  onUpdate: (data: MenuOptionData) => void;
  onEditSubmenu: (optionId: string) => void;
  onUploadAndAssign: (optionNum: number, file: File, name: string, oldAudioId: string | null) => Promise<string>;
  isSaving: boolean;
}) {
  const { toast } = useToast();
  const [functionType, setFunctionType] = useState<FunctionType>(
    (option?.functionType as FunctionType) || "none"
  );
  const [audioFileId, setAudioFileId] = useState(option?.audioFileId || "");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);

  const currentAudioFile = audioFiles.find(f => f.id === audioFileId);
  
  const conferenceAlreadyAssigned = allOptions.some(
    o => o.functionType === "conference" && o.optionNumber !== num
  );

  const handleFunctionChange = (value: FunctionType) => {
    if (value === "conference" && conferenceAlreadyAssigned) {
      toast({
        title: "Conference Already Assigned",
        description: "Only one menu option can use Conference at a time. Please remove it from the other option first.",
        variant: "destructive",
      });
      return;
    }
    
    setFunctionType(value);
    onUpdate({
      optionNumber: num,
      functionType: value,
      audioFileId: value === "play_mp3" ? audioFileId : null,
    });
  };

  const handleAudioChange = (value: string) => {
    setAudioFileId(value);
    onUpdate({
      optionNumber: num,
      functionType,
      audioFileId: value,
    });
  };

  const handleReplaceFile = async (file: File, name: string) => {
    const newAudioId = await onUploadAndAssign(num, file, name, audioFileId || null);
    setAudioFileId(newAudioId);
  };

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3 bg-card">
        <div className="text-4xl font-bold text-center text-primary">{num}</div>
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Function</Label>
          <Select value={functionType} onValueChange={handleFunctionChange} disabled={isSaving}>
            <SelectTrigger data-testid={`select-function-${num}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="play_mp3">Play MP3</SelectItem>
              <SelectItem value="submenu">Sub-menu</SelectItem>
              <SelectItem value="conference" disabled={conferenceAlreadyAssigned}>
                Conference {conferenceAlreadyAssigned ? "(in use)" : ""}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {functionType === "play_mp3" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">File</Label>
              <Select value={audioFileId} onValueChange={handleAudioChange} disabled={isSaving}>
                <SelectTrigger data-testid={`select-audio-${num}`}>
                  <SelectValue placeholder="Select file" />
                </SelectTrigger>
                <SelectContent>
                  {audioFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {currentAudioFile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPlayerOpen(true)}
                  data-testid={`button-listen-${num}`}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Listen
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setReplaceOpen(true)}
                data-testid={`button-replace-${num}`}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {currentAudioFile ? "Replace" : "Upload"}
              </Button>
            </div>
          </div>
        )}

        {functionType === "submenu" && option?.id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditSubmenu(option.id)}
            data-testid={`button-edit-submenu-${num}`}
          >
            Edit submenu
          </Button>
        )}

        {functionType === "conference" && (
          <p className="text-xs text-muted-foreground text-center">
            Callers will join a moderated conference call
          </p>
        )}
      </div>

      <AudioPlayerDialog
        open={playerOpen}
        onOpenChange={setPlayerOpen}
        audioFile={currentAudioFile || null}
      />

      <ReplaceFileDialog
        open={replaceOpen}
        onOpenChange={setReplaceOpen}
        optionNum={num}
        currentFile={currentAudioFile || null}
        onReplace={handleReplaceFile}
      />
    </>
  );
}

export default function MenuManagement() {
  const { toast } = useToast();
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [menuPath, setMenuPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Main Menu" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isShifting, setIsShifting] = useState(false);
  const [isUploadingGreeting, setIsUploadingGreeting] = useState(false);
  const [greetingPlayerOpen, setGreetingPlayerOpen] = useState(false);
  const greetingFileInputRef = useRef<HTMLInputElement>(null);

  const { data: menuOptions, isLoading: menuLoading } = useQuery<MenuOption[]>({
    queryKey: ["/api/admin/menu-options", currentMenuId],
    queryFn: async () => {
      const url = currentMenuId
        ? `/api/admin/menu-options?parentMenuId=${currentMenuId}`
        : "/api/admin/menu-options?parentMenuId=null";
      const res = await fetch(url);
      return res.json();
    },
  });

  const { data: allMenuOptions } = useQuery<MenuOption[]>({
    queryKey: ["/api/admin/menu-options/all"],
    queryFn: async () => {
      const res = await fetch("/api/admin/menu-options/all");
      return res.json();
    },
  });

  const { data: audioFiles } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { optionNumber: number; parentMenuId: string | null } & Partial<MenuOptionData>) => {
      const res = await apiRequest("POST", "/api/admin/menu-options/upsert", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (data: { key: string; audioFileId: string | null }) => {
      const res = await apiRequest("POST", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting saved" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save setting", description: error.message, variant: "destructive" });
    },
  });

  const handleOptionUpdate = async (data: MenuOptionData) => {
    setIsSaving(true);
    await updateMutation.mutateAsync({
      ...data,
      parentMenuId: currentMenuId,
    });
    setIsSaving(false);
  };

  const handleUploadGreeting = async (file: File, oldAudioId: string | null) => {
    setIsUploadingGreeting(true);
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
      
      await apiRequest("POST", "/api/admin/settings/greeting", { audioFileId: newAudio.id });
      
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
      setIsUploadingGreeting(false);
    }
  };

  const handleUploadAndAssign = async (
    optionNum: number,
    file: File,
    name: string,
    oldAudioId: string | null
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("type", "story");
    if (oldAudioId) {
      formData.append("replaceAudioId", oldAudioId);
    }

    const res = await fetch("/api/admin/audio-files/upload-and-assign", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Upload failed");
    }

    const newAudio = await res.json();
    
    // Update menu option to point to new audio file
    await updateMutation.mutateAsync({
      optionNumber: optionNum,
      parentMenuId: currentMenuId,
      functionType: "play_mp3",
      audioFileId: newAudio.id,
    });

    // Clean up old audio file after menu option is updated
    if (newAudio.oldAudioIdToDelete) {
      try {
        await fetch("/api/admin/audio-files/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioFileId: newAudio.oldAudioIdToDelete }),
        });
      } catch {
        // Cleanup is best-effort
      }
    }

    queryClient.invalidateQueries({ queryKey: ["/api/admin/audio-files"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
    toast({ title: "File uploaded and assigned successfully" });
    
    return newAudio.id;
  };

  const handleEditSubmenu = (optionId: string) => {
    const option = menuOptions?.find((o) => o.id === optionId);
    if (option) {
      setMenuPath([...menuPath, { id: optionId, name: `Option ${option.optionNumber}` }]);
      setCurrentMenuId(optionId);
    }
  };

  const handleBackToMain = () => {
    if (menuPath.length > 1) {
      const newPath = menuPath.slice(0, -1);
      setMenuPath(newPath);
      setCurrentMenuId(newPath[newPath.length - 1].id);
    }
  };

  const shiftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/menu-options/shift-down", {
        parentMenuId: currentMenuId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
      toast({ title: "Options shifted down", description: "Option 1 is now clear for new content." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to shift options", description: error.message, variant: "destructive" });
    },
  });

  const handleShiftDown = async () => {
    setIsShifting(true);
    await shiftMutation.mutateAsync();
    setIsShifting(false);
  };

  const getOptionForNumber = (num: number) => {
    return menuOptions?.find((o) => o.optionNumber === num);
  };

  const getDisplayedOptionNumbers = (): number[] => {
    if (!menuOptions || menuOptions.length === 0) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    const existingNumbers = menuOptions.map(o => o.optionNumber);
    const maxExisting = Math.max(...existingNumbers, 9);
    const allNumbers: number[] = [];
    for (let i = 1; i <= maxExisting; i++) {
      allNumbers.push(i);
    }
    return allNumbers;
  };

  const optionNumbers = getDisplayedOptionNumbers();

  const mainGreeting = settings?.find((s: any) => s.key === "main_greeting");
  const mainGreetingFile = audioFiles?.find((f) => f.id === mainGreeting?.audioFileId);

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {menuPath.length > 1 && (
          <Button variant="ghost" size="icon" onClick={handleBackToMain} data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {menuPath[menuPath.length - 1].name}
          </h1>
          {menuPath.length > 1 && (
            <p className="text-sm text-muted-foreground">
              Press * to return to main menu
            </p>
          )}
        </div>
      </div>

      {currentMenuId === null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Greeting for Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current File</p>
              <p className="text-sm text-muted-foreground">
                {mainGreetingFile?.name || "No greeting selected (using default)"}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {mainGreetingFile && (
                <Button
                  variant="outline"
                  onClick={() => setGreetingPlayerOpen(true)}
                  data-testid="button-listen-greeting"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Listen
                </Button>
              )}
              <input
                ref={greetingFileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadGreeting(file, mainGreeting?.audioFileId || null);
                    if (greetingFileInputRef.current) greetingFileInputRef.current.value = "";
                  }
                }}
                data-testid="input-greeting-file"
              />
              <Button
                variant="outline"
                onClick={() => greetingFileInputRef.current?.click()}
                disabled={isUploadingGreeting}
                data-testid="button-upload-greeting"
              >
                {isUploadingGreeting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {mainGreetingFile ? "Replace File" : "Upload File"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AudioPlayerDialog
        open={greetingPlayerOpen}
        onOpenChange={setGreetingPlayerOpen}
        audioFile={mainGreetingFile || null}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Menu Options</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleShiftDown}
              disabled={isShifting || !menuOptions || menuOptions.length === 0}
              data-testid="button-shift-down"
            >
              {isShifting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-2" />
              )}
              Move it over
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const nextNum = optionNumbers.length > 0 ? Math.max(...optionNumbers) + 1 : 1;
                handleOptionUpdate({
                  optionNumber: nextNum,
                  functionType: "none",
                  audioFileId: null,
                });
              }}
              disabled={isSaving}
              data-testid="button-add-option"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {optionNumbers.map((num) => (
              <OptionBox
                key={num}
                num={num}
                option={getOptionForNumber(num)}
                audioFiles={audioFiles || []}
                allOptions={allMenuOptions || []}
                onUpdate={handleOptionUpdate}
                onEditSubmenu={handleEditSubmenu}
                onUploadAndAssign={handleUploadAndAssign}
                isSaving={isSaving}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
