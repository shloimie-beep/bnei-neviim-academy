import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Video, Trash2, Loader2, FileVideo, Edit2, Eye, EyeOff, Plus, FolderPlus, X, ImagePlus, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Video as VideoType, VideoCategory } from "@shared/schema";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function VideoCard({ video, onDelete, onUpdate, onUploadThumbnail, categories }: { 
  video: VideoType; 
  onDelete: () => void;
  onUpdate: (data: Partial<VideoType>) => void;
  onUploadThumbnail: (file: File) => Promise<void>;
  categories: VideoCategory[];
}) {
  const { toast } = useToast();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title);
  const [editDescription, setEditDescription] = useState(video.description || "");
  const [editCategoryId, setEditCategoryId] = useState(video.categoryId || "");
  
  const categoryName = categories.find(c => c.id === video.categoryId)?.name;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const handleSave = () => {
    onUpdate({ title: editTitle, description: editDescription, categoryId: editCategoryId || null });
    setIsEditing(false);
  };

  const toggleStatus = () => {
    onUpdate({ status: video.status === "ready" ? "hidden" : "ready" });
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingThumbnail(true);
    try {
      await onUploadThumbnail(file);
      toast({ title: "Thumbnail uploaded" });
    } catch (error: any) {
      toast({ title: "Failed to upload thumbnail", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-24 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden group">
            {video.thumbnailPath ? (
              <img 
                src={`/api/videos/${video.id}/thumbnail`} 
                alt={video.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileVideo className="h-8 w-8 text-primary" />
            )}
            <button
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={isUploadingThumbnail}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              data-testid={`button-upload-thumbnail-${video.id}`}
            >
              {isUploadingThumbnail ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailSelect}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Video title"
                      data-testid={`input-edit-title-${video.id}`}
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      data-testid={`input-edit-description-${video.id}`}
                    />
                    <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                      <SelectTrigger data-testid={`select-edit-category-${video.id}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} data-testid={`button-save-video-${video.id}`}>
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
                      <p className="font-medium" data-testid={`text-video-title-${video.id}`}>
                        {video.title}
                      </p>
                      {categoryName && (
                        <Badge variant="outline" className="text-xs">{categoryName}</Badge>
                      )}
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{video.filename}</p>
                  </>
                )}
              </div>
              <Badge 
                variant={video.status === "ready" ? "default" : video.status === "failed" ? "destructive" : "secondary"} 
                className={`flex-shrink-0 ${video.status === "processing" ? "animate-pulse" : ""}`}
              >
                {video.status === "ready" ? "Published" : 
                 video.status === "processing" ? "Converting..." : 
                 video.status === "failed" ? "Failed" : "Hidden"}
              </Badge>
            </div>
            {!isEditing && (
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(video.fileSize)}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1" title="View count">
                  <BarChart2 className="h-3 w-3" />
                  {video.viewCount ?? 0} views
                </span>
                <span className="text-sm text-muted-foreground">
                  {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "Unknown date"}
                </span>
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleStatus}
                    title={video.status === "ready" ? "Hide video" : "Publish video"}
                    data-testid={`button-toggle-visibility-${video.id}`}
                  >
                    {video.status === "ready" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    data-testid={`button-edit-video-${video.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    data-testid={`button-delete-video-${video.id}`}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VideoManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategoryId, setUploadCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const { data: videos, isLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/admin/videos"],
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some(v => v.status === "processing")) {
        return 5000;
      }
      return false;
    },
  });

  const { data: categories = [] } = useQuery<VideoCategory[]>({
    queryKey: ["/api/admin/video-categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/video-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-categories"] });
      toast({ title: "Category created" });
      setNewCategoryName("");
      setIsCategoryDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to create category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/video-categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-categories"] });
      toast({ title: "Category deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete category", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ title: "Video deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VideoType> }) => {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ title: "Video updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", uploadTitle);
    formData.append("description", uploadDescription);
    if (uploadCategoryId && uploadCategoryId !== "none") {
      formData.append("categoryId", uploadCategoryId);
    }
    if (selectedThumbnail) {
      formData.append("thumbnail", selectedThumbnail);
    }

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("POST", "/api/admin/videos");
        xhr.send(formData);
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ title: "Video uploaded successfully" });
      setIsDialogOpen(false);
      setSelectedFile(null);
      setSelectedThumbnail(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategoryId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Video Library</h1>
          <p className="text-muted-foreground">Manage video content for subscribers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-video">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Video</DialogTitle>
              <DialogDescription>
                Upload a video file for subscribers. Supported formats: MP4, WebM, MOV, AVI (max 500MB)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-file">Video File</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  data-testid="input-video-file"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="video-title">Title</Label>
                <Input
                  id="video-title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter video title"
                  data-testid="input-video-title"
                />
              </div>
              <div>
                <Label htmlFor="video-description">Description (optional)</Label>
                <Textarea
                  id="video-description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Enter video description"
                  rows={3}
                  data-testid="input-video-description"
                />
              </div>
              <div>
                <Label htmlFor="video-category">Category (optional)</Label>
                <Select value={uploadCategoryId} onValueChange={setUploadCategoryId}>
                  <SelectTrigger data-testid="select-video-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="video-thumbnail">Thumbnail Image (optional)</Label>
                <Input
                  id="video-thumbnail"
                  type="file"
                  accept="image/*"
                  ref={thumbnailInputRef}
                  onChange={(e) => setSelectedThumbnail(e.target.files?.[0] || null)}
                  data-testid="input-video-thumbnail"
                />
                {selectedThumbnail && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedThumbnail.name}
                  </p>
                )}
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || !uploadTitle || isUploading}
                data-testid="button-confirm-upload"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Organize videos into categories</CardDescription>
            </div>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-add-category">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                  <DialogDescription>
                    Enter a name for the new video category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Stories, Educational, Music"
                      data-testid="input-category-name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCategoryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createCategoryMutation.mutate(newCategoryName)}
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    data-testid="button-confirm-create-category"
                  >
                    {createCategoryMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet. Create one to organize your videos.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="gap-1 pr-1">
                  {cat.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => deleteCategoryMutation.mutate(cat.id)}
                    disabled={deleteCategoryMutation.isPending}
                    data-testid={`button-delete-category-${cat.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-24 rounded-lg" />
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
      ) : videos?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Videos Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload videos for your subscribers to watch
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-upload-first-video">
              <Upload className="h-4 w-4 mr-2" />
              Upload First Video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {videos?.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              categories={categories}
              onDelete={() => deleteMutation.mutate(video.id)}
              onUpdate={(data) => updateMutation.mutate({ id: video.id, data })}
              onUploadThumbnail={async (file) => {
                const formData = new FormData();
                formData.append("thumbnail", file);
                const res = await fetch(`/api/admin/videos/${video.id}/thumbnail`, {
                  method: "POST",
                  body: formData,
                });
                if (!res.ok) throw new Error("Failed to upload thumbnail");
                queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
