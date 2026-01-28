import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Folder, Trash2, Loader2, Edit2, Plus, Music, GripVertical, ExternalLink, FolderPlus, Copy, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { RssFolder, RssAudioItem } from "@shared/schema";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RssFeedManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<RssFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const { data: folders = [], isLoading: foldersLoading } = useQuery<RssFolder[]>({
    queryKey: ["/api/admin/rss-folders"],
  });

  const { data: audioItems = [], isLoading: itemsLoading, refetch: refetchItems } = useQuery<RssAudioItem[]>({
    queryKey: ["/api/admin/rss-audio", selectedFolderId],
    queryFn: async () => {
      const params = selectedFolderId !== null ? `?folderId=${selectedFolderId}` : "";
      const res = await fetch(`/api/admin/rss-audio${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audio items");
      return res.json();
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/admin/rss-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-folders"] });
      setShowNewFolderDialog(false);
      setNewFolderName("");
      setNewFolderDescription("");
      toast({ title: "Folder created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create folder", description: error.message, variant: "destructive" });
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RssFolder> }) => {
      const res = await fetch(`/api/admin/rss-folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-folders"] });
      setShowEditFolderDialog(false);
      setEditingFolder(null);
      toast({ title: "Folder updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update folder", description: error.message, variant: "destructive" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/rss-folders/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-audio"] });
      setShowDeleteFolderConfirm(false);
      setEditingFolder(null);
      if (selectedFolderId === editingFolder?.id) {
        setSelectedFolderId(null);
      }
      toast({ title: "Folder deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete folder", description: error.message, variant: "destructive" });
    },
  });

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch("/api/admin/migrate-rss-audio", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Migration failed");
      toast({ 
        title: "Migration complete", 
        description: `${data.migrated} files migrated to cloud storage${data.errors > 0 ? `, ${data.errors} errors` : ""}` 
      });
      refetchItems();
    } catch (error: any) {
      toast({ title: "Migration failed", description: error.message, variant: "destructive" });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      toast({ title: "Please provide a title and select a file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("folderId", selectedFolderId || "null");

      // Use XMLHttpRequest which automatically includes cookies
      const response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.onload = () => {
          resolve(new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          }));
        };
        
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Upload timeout"));
        
        xhr.withCredentials = true;
        xhr.timeout = 300000; // 5 minute timeout
        xhr.open("POST", "/api/admin/rss-audio");
        xhr.send(formData);
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to upload audio" }));
        throw new Error(error.message || "Failed to upload audio");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-audio"] });
      setShowUploadDialog(false);
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      toast({ title: "Audio uploaded and converted to MP3 64kbps" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAudioMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/rss-audio/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete audio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-audio"] });
      setDeletingItemId(null);
      toast({ title: "Audio deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete audio", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const res = await fetch("/api/admin/rss-audio/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      refetchItems();
    },
  });

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...audioItems];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderMutation.mutate(newOrder.map(i => i.id));
  };

  const moveItemDown = (index: number) => {
    if (index === audioItems.length - 1) return;
    const newOrder = [...audioItems];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(newOrder.map(i => i.id));
  };

  // Fetch the secure RSS feed URL from backend
  const { data: rssFeedData } = useQuery<{ url: string }>({
    queryKey: ["/api/admin/rss-feed-url"],
  });
  
  const rssUrl = rssFeedData?.url || "Loading...";

  const copyRssUrl = () => {
    if (rssFeedData?.url) {
      const confirmed = window.confirm(
        "Warning: This URL contains a private access token. Do not share it publicly.\n\nCopy URL to clipboard?"
      );
      if (confirmed) {
        navigator.clipboard.writeText(rssFeedData.url);
        toast({ title: "RSS URL copied to clipboard" });
      }
    }
  };

  const togglePlayAudio = (itemId: string) => {
    if (playingItemId === itemId) {
      audioRef.current?.pause();
      setPlayingItemId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = `/api/rss-audio/${itemId}/stream`;
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error("Playback error:", err);
          setPlayingItemId(null);
          toast({ title: "Failed to play audio", variant: "destructive" });
        });
        setPlayingItemId(itemId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingItemId(null)} 
        onError={() => setPlayingItemId(null)}
        className="hidden" 
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Hotline</h1>
          <p className="text-muted-foreground">Manage audio files for your hotline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleMigrate} 
            disabled={isMigrating}
            data-testid="button-migrate-rss"
          >
            {isMigrating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Migrate to Cloud
          </Button>
          <Button variant="outline" onClick={copyRssUrl} data-testid="button-copy-rss-url">
            <Copy className="h-4 w-4 mr-2" />
            Copy RSS URL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Folders</span>
              <Button size="icon" variant="ghost" onClick={() => setShowNewFolderDialog(true)} data-testid="button-new-folder">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foldersLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <Button
                  variant={selectedFolderId === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolderId(null)}
                  data-testid="button-folder-all"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  <span>All Files</span>
                </Button>
                {folders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No folders yet. Create one to get started.</p>
                ) : (
                  folders.map((folder) => (
                <div key={folder.id} className="flex items-center gap-1">
                  <Button
                    variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                    className="flex-1 justify-start"
                    onClick={() => setSelectedFolderId(folder.id)}
                    data-testid={`button-folder-${folder.id}`}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    <span className="truncate">{folder.name}</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingFolder(folder);
                      setNewFolderName(folder.name);
                      setNewFolderDescription(folder.description || "");
                      setShowEditFolderDialog(true);
                    }}
                    data-testid={`button-edit-folder-${folder.id}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <span>
                {selectedFolderId === null 
                  ? "All Files" 
                  : folders.find(f => f.id === selectedFolderId)?.name || "Audio Files"}
              </span>
              <Button onClick={() => setShowUploadDialog(true)} disabled={!selectedFolderId} data-testid="button-upload-audio">
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio
              </Button>
            </CardTitle>
            <CardDescription>
              Audio files are automatically converted to MP3 64kbps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : audioItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audio files yet</p>
                <p className="text-sm">Upload audio to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {audioItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                    data-testid={`audio-item-${item.id}`}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => moveItemUp(index)}
                        className="h-6 w-6"
                        data-testid={`button-move-up-${item.id}`}
                      >
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === audioItems.length - 1}
                        onClick={() => moveItemDown(index)}
                        className="h-6 w-6"
                        data-testid={`button-move-down-${item.id}`}
                      >
                        <GripVertical className="h-3 w-3 -rotate-90" />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDuration(item.duration)}</span>
                        <span>|</span>
                        <span>{formatFileSize(item.fileSize)}</span>
                        {item.originalFilename && (
                          <>
                            <span>|</span>
                            <span className="truncate">{item.originalFilename}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      #{index + 1}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => togglePlayAudio(item.id)}
                      data-testid={`button-play-audio-${item.id}`}
                    >
                      {playingItemId === item.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletingItemId(item.id)}
                      data-testid={`button-delete-audio-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Create a folder to organize your audio files</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                data-testid="input-folder-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-description">Description (optional)</Label>
              <Textarea
                id="folder-description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Enter description"
                data-testid="input-folder-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => createFolderMutation.mutate({ name: newFolderName, description: newFolderDescription })}
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
              data-testid="button-create-folder"
            >
              {createFolderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditFolderDialog} onOpenChange={setShowEditFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>Update folder details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                data-testid="input-edit-folder-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-folder-description">Description (optional)</Label>
              <Textarea
                id="edit-folder-description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Enter description"
                data-testid="input-edit-folder-description"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowEditFolderDialog(false);
                setShowDeleteFolderConfirm(true);
              }}
              data-testid="button-delete-folder"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setShowEditFolderDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => editingFolder && updateFolderMutation.mutate({ 
                id: editingFolder.id, 
                data: { name: newFolderName, description: newFolderDescription } 
              })}
              disabled={!newFolderName.trim() || updateFolderMutation.isPending}
              data-testid="button-save-folder"
            >
              {updateFolderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteFolderConfirm} onOpenChange={setShowDeleteFolderConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder "{editingFolder?.name}" and all audio files inside it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingFolder && deleteFolderMutation.mutate(editingFolder.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-folder"
            >
              {deleteFolderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Audio</DialogTitle>
            <DialogDescription>
              Upload audio in any format - it will be converted to MP3 64kbps
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter title"
                data-testid="input-upload-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-file">Audio File</Label>
              <Input
                id="upload-file"
                type="file"
                accept="audio/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                data-testid="input-upload-file"
              />
              {uploadFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadTitle.trim() || !uploadFile || isUploading}
              data-testid="button-confirm-upload"
            >
              {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingItemId} onOpenChange={(open) => !open && setDeletingItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this audio file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItemId && deleteAudioMutation.mutate(deletingItemId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-audio"
            >
              {deleteAudioMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
