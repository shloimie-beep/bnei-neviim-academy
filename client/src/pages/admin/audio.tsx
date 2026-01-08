import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Music, Trash2, Loader2, FileAudio, Play, Clock, Cloud, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { AudioFile } from "@shared/schema";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function AudioFileCard({ file, onDelete }: { file: AudioFile; onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const typeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    greeting: { label: "Greeting", variant: "default" },
    story: { label: "Story", variant: "secondary" },
    menu: { label: "Menu", variant: "outline" },
    non_subscriber: { label: "Non-Subscriber", variant: "outline" },
  };

  const typeConfig = typeLabels[file.type] || typeLabels.story;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileAudio className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate" data-testid={`text-audio-name-${file.id}`}>
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">{file.filename}</p>
              </div>
              <Badge variant={typeConfig.variant} className="flex-shrink-0">
                {typeConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDuration(file.duration)}
              </div>
              {file.voitexRecordingId ? (
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <Cloud className="h-4 w-4" />
                  <span>Synced</span>
                </div>
              ) : file.voitexAlbum ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CloudOff className="h-4 w-4" />
                  <span>Not synced</span>
                </div>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={handleDelete}
                disabled={isDeleting}
                data-testid={`button-delete-audio-${file.id}`}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AudioManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("story");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [voitexAlbum, setVoitexAlbum] = useState("");
  const [voitexSort, setVoitexSort] = useState("1");
  const [syncToVoitex, setSyncToVoitex] = useState(false);

  const { data: audioFiles, isLoading } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/audio-files/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audio-files"] });
      toast({ title: "Audio file deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadName) {
        setUploadName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadName) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", uploadName);
      formData.append("type", uploadType);
      if (voitexAlbum) {
        formData.append("voitexAlbum", voitexAlbum);
        formData.append("voitexSort", voitexSort);
        formData.append("syncToVoitex", syncToVoitex.toString());
      }

      const res = await fetch("/api/admin/audio-files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/audio-files"] });
      const syncMessage = syncToVoitex ? " and synced to Voitex." : ".";
      toast({ title: "Audio uploaded", description: `Your file has been uploaded successfully${syncMessage}` });
      setIsDialogOpen(false);
      setUploadName("");
      setUploadType("story");
      setSelectedFile(null);
      setVoitexAlbum("");
      setVoitexSort("1");
      setSyncToVoitex(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const groupedFiles = audioFiles?.reduce((acc, file) => {
    const type = file.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<string, AudioFile[]>) || {};

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audio Files</h1>
          <p className="text-muted-foreground">Upload and manage audio files for the hotline.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-audio">
              <Upload className="h-4 w-4 mr-2" />
              Upload Audio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Audio File</DialogTitle>
              <DialogDescription>
                Upload an audio file to use in the hotline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="audio-file">Audio File</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  data-testid="input-audio-file"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter a name for this audio"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  data-testid="input-audio-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger data-testid="select-audio-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greeting">Greeting</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="menu">Menu Audio</SelectItem>
                    <SelectItem value="non_subscriber">Non-Subscriber Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-3">Voitex Integration (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="voitex-album">Album Number</Label>
                    <Input
                      id="voitex-album"
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      value={voitexAlbum}
                      onChange={(e) => setVoitexAlbum(e.target.value)}
                      data-testid="input-voitex-album"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voitex-sort">Sort Order</Label>
                    <Input
                      id="voitex-sort"
                      type="number"
                      min="1"
                      value={voitexSort}
                      onChange={(e) => setVoitexSort(e.target.value)}
                      data-testid="input-voitex-sort"
                    />
                  </div>
                </div>
                {voitexAlbum && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      id="sync-voitex"
                      checked={syncToVoitex}
                      onChange={(e) => setSyncToVoitex(e.target.checked)}
                      className="h-4 w-4"
                      data-testid="checkbox-sync-voitex"
                    />
                    <Label htmlFor="sync-voitex" className="text-sm font-normal cursor-pointer">
                      Upload to Voitex now
                    </Label>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !uploadName}
                data-testid="button-confirm-upload"
              >
                {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : audioFiles && audioFiles.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedFiles).map(([type, files]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold mb-4 capitalize">{type.replace("_", " ")} Files</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <AudioFileCard
                    key={file.id}
                    file={file}
                    onDelete={() => deleteMutation.mutate(file.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">No audio files yet</p>
              <p className="text-muted-foreground mb-4">Upload your first audio file to get started.</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-upload-empty">
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
