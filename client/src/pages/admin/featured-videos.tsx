import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clapperboard, Plus, Pencil, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FeaturedVideo {
  id: number;
  title: string;
  description: string;
  vimeoEmbedUrl: string;
  displayOrder: number;
}

const EMPTY_FORM = { title: "", description: "", vimeoEmbedUrl: "" };

export default function FeaturedVideosManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeaturedVideo | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: videos = [], isLoading } = useQuery<FeaturedVideo[]>({
    queryKey: ["/api/featured-videos"],
  });

  const addMutation = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) => apiRequest("POST", "/api/admin/featured-videos", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/featured-videos"] });
      toast({ title: "Added", description: "Featured video added." });
      setDialogOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to add video.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: typeof EMPTY_FORM & { id: number }) =>
      apiRequest("PUT", `/api/admin/featured-videos/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/featured-videos"] });
      toast({ title: "Saved", description: "Featured video updated." });
      setDialogOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to update video.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/featured-videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/featured-videos"] });
      toast({ title: "Deleted", description: "Featured video removed." });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to delete video.", variant: "destructive" }),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => apiRequest("POST", "/api/admin/featured-videos/reorder", { ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/featured-videos"] }),
  });

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(v: FeaturedVideo) {
    setEditing(v);
    setForm({ title: v.title, description: v.description, vimeoEmbedUrl: v.vimeoEmbedUrl });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.title.trim() || !form.vimeoEmbedUrl.trim()) {
      toast({ title: "Missing fields", description: "Title and Vimeo embed URL are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...form });
    } else {
      addMutation.mutate(form);
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const ids = videos.map((v) => v.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderMutation.mutate(ids);
  }

  function moveDown(index: number) {
    if (index === videos.length - 1) return;
    const ids = videos.map((v) => v.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderMutation.mutate(ids);
  }

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Featured Videos</h1>
          <p className="text-muted-foreground">
            Manage the videos shown in the Featured Videos section of the public homepage.
          </p>
        </div>
        <Button onClick={openAdd} data-testid="button-add-featured-video">
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Clapperboard className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium">No featured videos yet</p>
            <p className="text-sm mt-1">Click "Add Video" to add your first featured video to the homepage.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <Card key={video.id} data-testid={`card-featured-video-${video.id}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveUp(index)}
                      disabled={index === 0 || reorderMutation.isPending}
                      data-testid={`button-move-up-${video.id}`}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveDown(index)}
                      disabled={index === videos.length - 1 || reorderMutation.isPending}
                      data-testid={`button-move-down-${video.id}`}
                    >
                      ▼
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{video.description}</p>
                        )}
                        <a
                          href={video.vimeoEmbedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1 truncate max-w-sm"
                          data-testid={`link-embed-${video.id}`}
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{video.vimeoEmbedUrl}</span>
                        </a>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(video)}
                          data-testid={`button-edit-${video.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(video.id)}
                          data-testid={`button-delete-${video.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Featured Video" : "Add Featured Video"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fv-title">Title</Label>
              <Input
                id="fv-title"
                placeholder="e.g. A Birthday Surprise"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                data-testid="input-fv-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fv-description">Description</Label>
              <Textarea
                id="fv-description"
                placeholder="A short description shown below the video"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                data-testid="input-fv-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fv-url">Vimeo Embed URL</Label>
              <Input
                id="fv-url"
                placeholder="https://player.vimeo.com/video/123456789?h=abc..."
                value={form.vimeoEmbedUrl}
                onChange={(e) => setForm((f) => ({ ...f, vimeoEmbedUrl: e.target.value }))}
                data-testid="input-fv-url"
              />
              <p className="text-xs text-muted-foreground">
                Paste the full Vimeo player embed URL (starts with https://player.vimeo.com/video/...)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-fv">
              {isPending ? "Saving..." : editing ? "Save Changes" : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Featured Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the video from the homepage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
