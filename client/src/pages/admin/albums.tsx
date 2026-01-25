import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Disc, Trash2, Loader2, Edit2, Eye, EyeOff, Plus, Music, ImagePlus, X, Play, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Album, AlbumTrack } from "@shared/schema";

type AlbumWithCount = Album & { trackCount: number };

function AlbumCard({ album, onDelete, onUpdate, onRefresh }: { 
  album: AlbumWithCount; 
  onDelete: () => void;
  onUpdate: (data: Partial<Album>) => void;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const trackInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTracksDialog, setShowTracksDialog] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingTrack, setIsUploadingTrack] = useState(false);
  const [editTitle, setEditTitle] = useState(album.title);
  const [editDescription, setEditDescription] = useState(album.description || "");
  const [newTrackTitle, setNewTrackTitle] = useState("");

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<AlbumTrack[]>({
    queryKey: ["/api/admin/albums", album.id, "tracks"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/albums/${album.id}/tracks`);
      if (!res.ok) throw new Error("Failed to fetch tracks");
      return res.json();
    },
    enabled: showTracksDialog,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleSave = () => {
    onUpdate({ 
      title: editTitle, 
      description: editDescription
    });
    setIsEditing(false);
  };

  const toggleStatus = () => {
    onUpdate({ status: album.status === "ready" ? "hidden" : "ready" });
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("thumbnail", file);
      const res = await fetch(`/api/admin/albums/${album.id}/thumbnail`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload thumbnail");
      toast({ title: "Thumbnail uploaded" });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Failed to upload thumbnail", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const handleTrackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Use provided title or default to filename without extension
    const trackTitle = newTrackTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
    
    setIsUploadingTrack(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("title", trackTitle);
      const res = await fetch(`/api/admin/albums/${album.id}/tracks`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload track");
      }
      toast({ title: "Track added" });
      setNewTrackTitle("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/albums", album.id, "tracks"] });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Failed to upload track", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingTrack(false);
      if (trackInputRef.current) trackInputRef.current.value = "";
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      const res = await fetch(`/api/admin/albums/${album.id}/tracks/${trackId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete track");
      toast({ title: "Track deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/albums", album.id, "tracks"] });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Failed to delete track", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden group">
            {album.thumbnailPath ? (
              <img 
                src={`/api/albums/${album.id}/thumbnail`}
                alt={album.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Disc className="h-10 w-10 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <input 
                ref={thumbnailInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleThumbnailSelect}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploadingThumbnail}
                data-testid={`button-upload-thumbnail-${album.id}`}
              >
                {isUploadingThumbnail ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Album title"
                      data-testid={`input-edit-title-${album.id}`}
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      data-testid={`input-edit-description-${album.id}`}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} data-testid={`button-save-album-${album.id}`}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium" data-testid={`text-album-title-${album.id}`}>
                        {album.title}
                      </p>
                      <Badge variant="secondary" className="text-xs">{album.trackCount} tracks</Badge>
                      {album.status === "hidden" && <Badge variant="destructive" className="text-xs">Hidden</Badge>}
                    </div>
                    {album.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {album.createdAt ? new Date(album.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </>
                )}
              </div>
              {!isEditing && (
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTracksDialog(true)}
                    title="Manage Tracks"
                    data-testid={`button-manage-tracks-${album.id}`}
                  >
                    <Music className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleStatus}
                    title={album.status === "ready" ? "Hide Album" : "Show Album"}
                    data-testid={`button-toggle-status-${album.id}`}
                  >
                    {album.status === "ready" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    data-testid={`button-edit-album-${album.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    data-testid={`button-delete-album-${album.id}`}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{album.title}" and all {album.trackCount} tracks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-album">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              data-testid="button-confirm-delete-album"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTracksDialog} onOpenChange={setShowTracksDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Tracks - {album.title}</DialogTitle>
            <DialogDescription>Add, remove, or reorder tracks in this album.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Track title"
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
                data-testid="input-new-track-title"
              />
              <input 
                ref={trackInputRef}
                type="file" 
                accept="audio/*,.mp3,.wav,.m4a,.ogg" 
                className="hidden" 
                onChange={handleTrackUpload}
              />
              <Button
                onClick={() => trackInputRef.current?.click()}
                disabled={isUploadingTrack}
                data-testid="button-upload-track"
              >
                {isUploadingTrack ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Add Track
              </Button>
            </div>

            {tracksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tracks yet. Add your first track above.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {tracks
                  .sort((a, b) => a.trackNumber - b.trackNumber)
                  .map((track, index) => (
                    <div 
                      key={track.id} 
                      className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                      data-testid={`track-item-${track.id}`}
                    >
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.filename}</p>
                      </div>
                      {track.filepath && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/api/albums/${album.id}/tracks/${track.id}/stream`, "_blank")}
                          title="Play"
                          data-testid={`button-play-track-${track.id}`}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTrack(track.id)}
                        title="Delete Track"
                        data-testid={`button-delete-track-${track.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function AlbumManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [newAlbumThumbnail, setNewAlbumThumbnail] = useState<File | null>(null);
  const [newAlbumTracks, setNewAlbumTracks] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const tracksInputRef = useRef<HTMLInputElement>(null);

  const { data: albums, isLoading } = useQuery<AlbumWithCount[]>({
    queryKey: ["/api/admin/albums"],
  });

  const createAlbumMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create album");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/albums"] });
      toast({ title: "Album created" });
      setIsCreateDialogOpen(false);
      setNewAlbumTitle("");
      setNewAlbumDescription("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to create album", description: error.message, variant: "destructive" });
    },
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/albums/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete album");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/albums"] });
      toast({ title: "Album deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete album", description: error.message, variant: "destructive" });
    },
  });

  const updateAlbumMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Album> }) => {
      const res = await fetch(`/api/admin/albums/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update album");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/albums"] });
      toast({ title: "Album updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update album", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) {
      toast({ title: "Please enter an album title", variant: "destructive" });
      return;
    }
    
    setIsCreating(true);
    try {
      // Create the album first
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAlbumTitle.trim(),
          description: newAlbumDescription.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to create album");
      const album = await res.json();
      
      // Upload thumbnail if provided
      if (newAlbumThumbnail) {
        const thumbFormData = new FormData();
        thumbFormData.append("thumbnail", newAlbumThumbnail);
        await fetch(`/api/admin/albums/${album.id}/thumbnail`, {
          method: "POST",
          body: thumbFormData,
        });
      }
      
      // Upload tracks if provided
      for (const track of newAlbumTracks) {
        const trackFormData = new FormData();
        trackFormData.append("audio", track);
        trackFormData.append("title", track.name.replace(/\.[^/.]+$/, ""));
        await fetch(`/api/admin/albums/${album.id}/tracks`, {
          method: "POST",
          body: trackFormData,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/albums"] });
      toast({ title: "Album created" });
      setIsCreateDialogOpen(false);
      setNewAlbumTitle("");
      setNewAlbumDescription("");
      setNewAlbumThumbnail(null);
      setNewAlbumTracks([]);
    } catch (error: any) {
      toast({ title: "Failed to create album", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Albums</h1>
          <p className="text-muted-foreground">
            Manage audio albums with multiple tracks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-album">
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
              <DialogDescription>Create a new album to organize audio tracks.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="album-title">Title</Label>
                <Input
                  id="album-title"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="Album title"
                  data-testid="input-album-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="album-description">Description (optional)</Label>
                <Textarea
                  id="album-description"
                  value={newAlbumDescription}
                  onChange={(e) => setNewAlbumDescription(e.target.value)}
                  placeholder="Album description"
                  rows={3}
                  data-testid="input-album-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Cover Image (optional)</Label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setNewAlbumThumbnail(e.target.files?.[0] || null)}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    data-testid="button-select-thumbnail"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {newAlbumThumbnail ? "Change Image" : "Select Image"}
                  </Button>
                  {newAlbumThumbnail && (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {newAlbumThumbnail.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Audio Tracks (optional)</Label>
                <input
                  ref={tracksInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setNewAlbumTracks(Array.from(e.target.files || []))}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => tracksInputRef.current?.click()}
                    data-testid="button-select-tracks"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    {newAlbumTracks.length > 0 ? "Change Tracks" : "Select Tracks"}
                  </Button>
                  {newAlbumTracks.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {newAlbumTracks.length} track{newAlbumTracks.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateAlbum} 
                disabled={isCreating}
                data-testid="button-confirm-create-album"
              >
                {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Album
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : albums?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Disc className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Albums Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create albums to organize your audio content into collections
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-album">
              <Plus className="h-4 w-4 mr-2" />
              Create First Album
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {albums?.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onDelete={() => deleteAlbumMutation.mutate(album.id)}
              onUpdate={(data) => updateAlbumMutation.mutate({ id: album.id, data })}
              onRefresh={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/albums"] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
