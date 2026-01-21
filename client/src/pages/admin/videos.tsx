import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Video, Trash2, Loader2, FileVideo, Edit2, Eye, EyeOff, Plus, FolderPlus, X, ImagePlus, BarChart2, Trash, Music, RotateCcw, RefreshCw, Download, GripVertical } from "lucide-react";
import * as tus from "tus-js-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Video as VideoType, VideoCategory } from "@shared/schema";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function VideoCard({ video, onDelete, onUpdate, onUploadThumbnail, onResetThumbnail, onRefreshStatus, categories }: { 
  video: VideoType; 
  onDelete: () => void;
  onUpdate: (data: Partial<VideoType>) => void;
  onUploadThumbnail: (file: File) => Promise<void>;
  onResetThumbnail: (regenerate: boolean) => Promise<void>;
  onRefreshStatus: () => Promise<void>;
  categories: VideoCategory[];
}) {
  const { toast } = useToast();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isResettingThumbnail, setIsResettingThumbnail] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [isDownloadingMp3, setIsDownloadingMp3] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title);
  const [editDescription, setEditDescription] = useState(video.description || "");
  const [editCategoryId, setEditCategoryId] = useState(video.categoryId || "");
  const [thumbnailCacheBust, setThumbnailCacheBust] = useState(Date.now());
  
  const categoryName = categories.find(c => c.id === video.categoryId)?.name;

  // For videos with custom thumbnailPath, serve through our API
  // For Vimeo videos, use the stored thumbnail URL directly
  const thumbnailSrc = (() => {
    // Vimeo thumbnail URL stored directly
    if (video.thumbnailPath?.startsWith("https://i.vimeocdn.com")) {
      return video.thumbnailPath;
    }
    // Legacy vimeo:// prefix format
    if (video.thumbnailPath?.startsWith("vimeo://")) {
      return video.thumbnailPath.replace("vimeo://", "");
    }
    // Custom thumbnail path (local storage)
    if (video.thumbnailPath) {
      return `/api/videos/${video.id}/thumbnail?v=${thumbnailCacheBust}`;
    }
    // Vimeo thumbnail from API response
    if ((video as any).vimeoThumbnailUrl) {
      return (video as any).vimeoThumbnailUrl;
    }
    return null;
  })();

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
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
      setThumbnailCacheBust(Date.now());
      toast({ title: "Thumbnail uploaded" });
    } catch (error: any) {
      toast({ title: "Failed to upload thumbnail", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const handleResetThumbnail = async () => {
    setIsResettingThumbnail(true);
    try {
      await onResetThumbnail(true);
      setThumbnailCacheBust(Date.now());
      toast({ title: "Thumbnail generated", description: "Generated new thumbnail from video" });
    } catch (error: any) {
      toast({ title: "Failed to generate thumbnail", description: error.message, variant: "destructive" });
    } finally {
      setIsResettingThumbnail(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      await onRefreshStatus();
      toast({ title: "Status refreshed" });
    } catch (error: any) {
      toast({ title: "Failed to refresh status", description: error.message, variant: "destructive" });
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleDownloadMp3 = async () => {
    if (video.status !== "ready") {
      toast({ title: "Media not ready for download", variant: "destructive" });
      return;
    }
    
    // For videos, need vimeoVideoId. For audio, can have bunnyStorageUrl or filepath
    const canDownload = video.mediaType === "audio" 
      ? (video.bunnyStorageUrl || video.filepath) 
      : video.vimeoVideoId;
      
    if (!canDownload) {
      toast({ title: "Media source not available", variant: "destructive" });
      return;
    }
    
    setIsDownloadingMp3(true);
    toast({ title: "Preparing MP3 download...", description: "This may take a moment for first download" });
    
    try {
      const response = await fetch(`/api/admin/videos/${video.id}/download-mp3`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.title.replace(/[^a-zA-Z0-9\s_-]/g, "").substring(0, 50) || "audio"}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "MP3 downloaded successfully" });
    } catch (error: any) {
      toast({ title: "Download failed", description: error.message, variant: "destructive" });
    } finally {
      setIsDownloadingMp3(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-24 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden group">
            {thumbnailSrc ? (
              <>
                <img 
                  src={thumbnailSrc} 
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                {video.mediaType === "audio" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                )}
              </>
            ) : video.mediaType === "audio" ? (
              <Music className="h-8 w-8 text-primary" />
            ) : (
              <FileVideo className="h-8 w-8 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploadingThumbnail || isResettingThumbnail}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Upload custom thumbnail"
                data-testid={`button-upload-thumbnail-${video.id}`}
              >
                {isUploadingThumbnail ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4 text-white" />
                )}
              </button>
              {video.mediaType !== "audio" && video.vimeoVideoId && (
                <button
                  onClick={handleResetThumbnail}
                  disabled={isUploadingThumbnail || isResettingThumbnail}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  title="Generate new thumbnail from video"
                  data-testid={`button-reset-thumbnail-${video.id}`}
                >
                  {isResettingThumbnail ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 text-white" />
                  )}
                </button>
              )}
            </div>
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
                      {video.mediaType === "audio" && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Music className="h-3 w-3" />
                          Audio
                        </Badge>
                      )}
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant={video.status === "ready" ? "default" : video.status === "failed" ? "destructive" : "secondary"} 
                  className={`${video.status === "processing" ? "animate-pulse" : ""}`}
                >
                  {video.status === "ready" ? "Published" : 
                   video.status === "processing" ? (video.mediaType === "audio" ? "Processing..." : "Converting...") : 
                   video.status === "failed" ? "Failed" : "Hidden"}
                </Badge>
                {(video.status === "processing" || video.status === "uploading") && video.vimeoVideoId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshStatus}
                    disabled={isRefreshingStatus}
                    title="Check if processing is complete"
                    data-testid={`button-refresh-status-${video.id}`}
                  >
                    {isRefreshingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
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
                  {video.status === "ready" && (
                    (video.vimeoVideoId || video.mediaType === "audio") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownloadMp3}
                        disabled={isDownloadingMp3}
                        title={video.mediaType === "audio" ? "Download Audio" : "Download as MP3"}
                        data-testid={`button-download-mp3-${video.id}`}
                      >
                        {isDownloadingMp3 ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )
                  )}
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
                    onClick={() => setShowDeleteConfirm(true)}
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
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{video.title}"? This action cannot be undone and will permanently remove the video file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-cancel-delete-video-${video.id}`}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirm-delete-video-${video.id}`}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface UploadQueueItem {
  file: File;
  title: string;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  objectPath?: string;
}

export default function VideoManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Batch upload state
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [uploadCategoryId, setUploadCategoryId] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const currentXhrRef = useRef<XMLHttpRequest | null>(null);
  const cancelledRef = useRef(false);
  
  // Single upload state
  const [isSingleDialogOpen, setIsSingleDialogOpen] = useState(false);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleTitle, setSingleTitle] = useState("");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleCategoryId, setSingleCategoryId] = useState("");
  const [singleThumbnail, setSingleThumbnail] = useState<File | null>(null);
  const [singleUploadProgress, setSingleUploadProgress] = useState(0);
  const [isSingleUploading, setIsSingleUploading] = useState(false);
  
  // Category state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<VideoCategory | null>(null);
  
  // Vimeo sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

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

  const reorderCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const res = await fetch("/api/admin/video-categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder categories");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-categories"] });
      toast({ title: "Categories reordered" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to reorder categories", description: error.message, variant: "destructive" });
    },
  });

  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      return;
    }

    const currentOrder = categories.map(c => c.id);
    const draggedIndex = currentOrder.indexOf(draggedCategoryId);
    const targetIndex = currentOrder.indexOf(targetCategoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategoryId(null);
      return;
    }

    // Remove dragged item and insert at target position
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategoryId);

    reorderCategoriesMutation.mutate(newOrder);
    setDraggedCategoryId(null);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategoryId(null);
  };

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
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: UploadQueueItem[] = Array.from(files).map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: 'pending' as const,
        progress: 0,
      }));
      setUploadQueue(prev => [...prev, ...newItems]);
    }
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  const updateQueueItem = (index: number, updates: Partial<UploadQueueItem>) => {
    setUploadQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const uploadSingleVideo = async (item: UploadQueueItem, index: number): Promise<boolean> => {
    let vimeoVideoId: string | undefined;
    let tusUpload: tus.Upload | null = null;
    
    try {
      if (cancelledRef.current) {
        throw new Error("Upload cancelled");
      }
      
      updateQueueItem(index, { status: 'uploading', progress: 5 });

      // Step 1: Create video on Vimeo and get TUS upload URL
      const createResponse = await fetch("/api/admin/videos/vimeo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, fileSize: item.file.size }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create video on Vimeo");
      }

      const { vimeoVideoId: videoId, uploadUrl } = await createResponse.json();
      vimeoVideoId = videoId;

      if (cancelledRef.current) {
        throw new Error("Upload cancelled");
      }

      // Step 2: Upload to Vimeo using TUS protocol
      updateQueueItem(index, { progress: 10 });
      await new Promise<void>((resolve, reject) => {
        tusUpload = new tus.Upload(item.file, {
          uploadUrl,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          chunkSize: 128 * 1024 * 1024, // 128MB chunks for large files
          onError: (error) => {
            tusUpload = null;
            reject(new Error(`Upload failed: ${error.message}`));
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percent = 10 + Math.round((bytesUploaded / bytesTotal) * 80);
            updateQueueItem(index, { progress: percent });
          },
          onSuccess: () => {
            tusUpload = null;
            resolve();
          },
        });
        
        // Store reference for cancellation
        (currentXhrRef as any).current = { abort: () => tusUpload?.abort() };
        tusUpload.start();
      });

      if (cancelledRef.current) {
        throw new Error("Upload cancelled");
      }

      // Step 3: Finalize with retry logic
      updateQueueItem(index, { status: 'processing', progress: 95 });
      let finalizeResponse: Response | null = null;
      let finalizeError: Error | null = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        if (cancelledRef.current) {
          throw new Error("Upload cancelled");
        }
        
        try {
          finalizeResponse = await fetch("/api/admin/videos/vimeo/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.title,
              description: "",
              categoryId: uploadCategoryId && uploadCategoryId !== "none" ? uploadCategoryId : null,
              vimeoVideoId,
              filename: item.file.name,
              fileSize: item.file.size,
            }),
          });
          
          if (finalizeResponse.ok) {
            finalizeError = null;
            break;
          } else {
            const errorData = await finalizeResponse.json().catch(() => ({}));
            finalizeError = new Error(errorData.message || `Finalize failed (attempt ${attempt})`);
          }
        } catch (err: any) {
          finalizeError = err;
        }
        
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }

      if (finalizeError || !finalizeResponse?.ok) {
        throw finalizeError || new Error("Failed to finalize upload after 3 attempts");
      }

      updateQueueItem(index, { status: 'done', progress: 100 });
      return true;
    } catch (error: any) {
      const isCancelled = error.message === "Upload cancelled" || cancelledRef.current;
      
      if (isCancelled) {
        updateQueueItem(index, { status: 'cancelled', error: "Cancelled" });
        
        // Cleanup partial upload on Vimeo if we have an id
        if (vimeoVideoId) {
          try {
            await fetch(`/api/admin/videos/${vimeoVideoId}/vimeo`, {
              method: "DELETE",
            });
          } catch (cleanupError) {
            console.error("Failed to cleanup cancelled upload:", cleanupError);
          }
        }
      } else {
        updateQueueItem(index, { status: 'error', error: error.message });
      }
      return false;
    }
  };

  const handleCancelUpload = async () => {
    setIsCancelling(true);
    cancelledRef.current = true;
    
    // Abort current XHR if active
    if (currentXhrRef.current) {
      currentXhrRef.current.abort();
    }
    
    // Mark all pending items as cancelled
    setUploadQueue(prev => prev.map(item => 
      item.status === 'pending' ? { ...item, status: 'cancelled' as const } : item
    ));
    
    setShowCancelConfirm(false);
    setIsCancelling(false);
    setIsUploading(false);
    
    toast({ title: "Upload cancelled", description: "Remaining uploads have been cancelled" });
  };

  const handleBatchUpload = async () => {
    if (uploadQueue.length === 0) return;

    setIsUploading(true);
    setCurrentUploadIndex(0);
    cancelledRef.current = false;

    let successCount = 0;
    let errorCount = 0;
    let cancelledCount = 0;

    for (let i = 0; i < uploadQueue.length; i++) {
      if (uploadQueue[i].status === 'done' || uploadQueue[i].status === 'cancelled') continue;
      if (cancelledRef.current) break;
      
      setCurrentUploadIndex(i);
      const success = await uploadSingleVideo(uploadQueue[i], i);
      
      if (success) {
        successCount++;
      } else if (cancelledRef.current || uploadQueue[i].status === 'cancelled') {
        cancelledCount++;
      } else {
        errorCount++;
      }
      
      // Refresh video list after each upload
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
    }

    setIsUploading(false);
    
    if (successCount > 0 && !cancelledRef.current) {
      toast({ 
        title: "Batch upload complete", 
        description: `${successCount} videos uploaded${errorCount > 0 ? `, ${errorCount} failed` : ''}` 
      });
    }
    
    if (errorCount === 0 && cancelledCount === 0) {
      setIsBatchDialogOpen(false);
      setUploadQueue([]);
      setUploadCategoryId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSyncFromVimeo = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/videos/sync-from-vimeo", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Sync failed");
      }
      const result = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ 
        title: "Sync complete", 
        description: result.message 
      });
    } catch (error: any) {
      toast({ 
        title: "Sync failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFixVimeo = async () => {
    setIsFixing(true);
    try {
      const res = await fetch("/api/admin/videos/fix-vimeo", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Fix failed");
      }
      const result = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ 
        title: "Fix complete", 
        description: result.message 
      });
    } catch (error: any) {
      toast({ 
        title: "Fix failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleSingleUpload = async () => {
    if (!singleFile || !singleTitle) return;

    setIsSingleUploading(true);
    setSingleUploadProgress(0);

    // Detect if this is an audio file
    const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;
    const audioMimetypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-wav", "audio/x-m4a", "audio/mp4", "audio/aac", "audio/flac"];
    const isAudio = audioMimetypes.includes(singleFile.type) || audioExtensions.test(singleFile.name);

    try {
      if (isAudio) {
        // Audio files: Upload locally via FormData
        setSingleUploadProgress(10);
        
        const formData = new FormData();
        formData.append("file", singleFile);
        formData.append("title", singleTitle);
        formData.append("description", singleDescription || "");
        if (singleCategoryId && singleCategoryId !== "none") {
          formData.append("categoryId", singleCategoryId);
        }
        if (singleThumbnail) {
          formData.append("thumbnail", singleThumbnail);
        }

        const response = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = 10 + Math.round((e.loaded / e.total) * 85);
              setSingleUploadProgress(percent);
            }
          });

          xhr.onload = () => {
            resolve(new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
            }));
          };
          xhr.onerror = () => {
            const errorDetails = [
              "Network error during audio upload.",
              "Possible causes:",
              "- Your internet connection may have dropped",
              "- A proxy or corporate network may be blocking the request",
              "- The server may be temporarily unavailable",
              "",
              "Try: Check your connection and try again."
            ].join("\n");
            reject(new Error(errorDetails));
          };
          xhr.ontimeout = () => reject(new Error("Upload timed out - your connection may be too slow or unstable. Try a smaller file or faster connection."));
          xhr.timeout = 3600000; // 1 hour timeout
          xhr.open("POST", "/api/admin/videos");
          xhr.send(formData);
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to upload audio file");
        }

        setSingleUploadProgress(100);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
        toast({ title: "Audio uploaded", description: "Audio file saved successfully." });
      } else {
        // Video files: Upload to Vimeo using TUS protocol
        setSingleUploadProgress(5);
        const createResponse = await fetch("/api/admin/videos/vimeo/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: singleTitle, fileSize: singleFile.size }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create video on Vimeo");
        }

        const { vimeoVideoId, uploadUrl } = await createResponse.json();

        setSingleUploadProgress(10);
        await new Promise<void>((resolve, reject) => {
          const tusUpload = new tus.Upload(singleFile, {
            uploadUrl,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            chunkSize: 128 * 1024 * 1024, // 128MB chunks
            onError: (error) => {
              reject(new Error(`Upload failed: ${error.message}`));
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              const percent = 10 + Math.round((bytesUploaded / bytesTotal) * 80);
              setSingleUploadProgress(percent);
            },
            onSuccess: () => {
              resolve();
            },
          });
          tusUpload.start();
        });

        setSingleUploadProgress(90);
        let finalizeResponse: Response | null = null;
        let finalizeError: Error | null = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            finalizeResponse = await fetch("/api/admin/videos/vimeo/finalize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: singleTitle,
                description: singleDescription,
                categoryId: singleCategoryId && singleCategoryId !== "none" ? singleCategoryId : null,
                vimeoVideoId,
                filename: singleFile.name,
                fileSize: singleFile.size,
              }),
            });
            
            if (finalizeResponse.ok) {
              finalizeError = null;
              break;
            } else {
              const errorData = await finalizeResponse.json().catch(() => ({}));
              finalizeError = new Error(errorData.message || `Finalize failed (attempt ${attempt})`);
            }
          } catch (err: any) {
            finalizeError = err;
          }
          
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
          }
        }

        if (finalizeError || !finalizeResponse?.ok) {
          throw finalizeError || new Error("Failed to finalize upload after 3 attempts");
        }

        const videoData = await finalizeResponse.json();

        if (singleThumbnail && videoData.id) {
          setSingleUploadProgress(95);
          const thumbnailFormData = new FormData();
          thumbnailFormData.append("thumbnail", singleThumbnail);
          
          const thumbnailResponse = await fetch(`/api/admin/videos/${videoData.id}/thumbnail`, {
            method: "POST",
            body: thumbnailFormData,
          });
          
          if (!thumbnailResponse.ok) {
            console.error("Thumbnail upload failed, but video was created successfully");
          }
        }

        setSingleUploadProgress(100);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
        toast({ title: "Video uploaded", description: "Video is being processed and will be ready shortly." });
      }
      
      // Reset form
      setIsSingleDialogOpen(false);
      setSingleFile(null);
      setSingleThumbnail(null);
      setSingleTitle("");
      setSingleDescription("");
      setSingleCategoryId("");
      if (singleFileInputRef.current) singleFileInputRef.current.value = "";
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSingleUploading(false);
      setSingleUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage video and audio content for subscribers</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleSyncFromVimeo} 
            disabled={isSyncing}
            data-testid="button-sync-from-vimeo"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync from Vimeo
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFixVimeo} 
            disabled={isFixing}
            data-testid="button-fix-vimeo"
          >
            {isFixing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Fix Vimeo Videos
          </Button>
          <Dialog open={isSingleDialogOpen} onOpenChange={setIsSingleDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-single-video">
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Upload a video or audio file. Supported: MP4, WebM, MOV, MKV (video) or MP3, WAV, OGG, M4A (audio). Max 10GB.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="single-video-file">Media File</Label>
                  <Input
                    id="single-video-file"
                    type="file"
                    accept="video/*,audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                    ref={singleFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSingleFile(file);
                        if (!singleTitle) {
                          setSingleTitle(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    disabled={isSingleUploading}
                    data-testid="input-single-video-file"
                  />
                  {singleFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {singleFile.name} ({formatFileSize(singleFile.size)})
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="single-video-title">Title</Label>
                  <Input
                    id="single-video-title"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    placeholder="Enter video title"
                    disabled={isSingleUploading}
                    data-testid="input-single-video-title"
                  />
                </div>
                <div>
                  <Label htmlFor="single-video-description">Description (optional)</Label>
                  <Textarea
                    id="single-video-description"
                    value={singleDescription}
                    onChange={(e) => setSingleDescription(e.target.value)}
                    placeholder="Enter video description"
                    rows={3}
                    disabled={isSingleUploading}
                    data-testid="input-single-video-description"
                  />
                </div>
                <div>
                  <Label htmlFor="single-video-category">Category (optional)</Label>
                  <Select value={singleCategoryId} onValueChange={setSingleCategoryId} disabled={isSingleUploading}>
                    <SelectTrigger data-testid="select-single-video-category">
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
                  <Label htmlFor="single-video-thumbnail">Thumbnail Image (optional)</Label>
                  <Input
                    id="single-video-thumbnail"
                    type="file"
                    accept="image/*"
                    ref={thumbnailInputRef}
                    onChange={(e) => setSingleThumbnail(e.target.files?.[0] || null)}
                    disabled={isSingleUploading}
                    data-testid="input-single-video-thumbnail"
                  />
                  {singleThumbnail && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {singleThumbnail.name}
                    </p>
                  )}
                </div>
                {isSingleUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{singleUploadProgress >= 100 ? "Processing video..." : "Uploading..."}</span>
                      <span>{singleUploadProgress >= 100 ? "Please wait" : `${singleUploadProgress}%`}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${singleUploadProgress >= 100 ? "bg-primary animate-pulse" : "bg-primary"}`}
                        style={{ width: `${singleUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsSingleDialogOpen(false)} disabled={isSingleUploading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSingleUpload} 
                  disabled={!singleFile || !singleTitle || isSingleUploading}
                  data-testid="button-confirm-single-upload"
                >
                  {isSingleUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {singleUploadProgress >= 100 ? "Processing..." : "Uploading..."}
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-batch-upload">
                <Plus className="h-4 w-4 mr-2" />
                Batch Upload
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Select multiple video or audio files to upload. They will be processed one at a time. You can leave this running overnight.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-file">Media Files</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*,audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  data-testid="input-video-file"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: MP4, WebM, MOV, MKV (video) or MP3, WAV, OGG, M4A (audio). Max 10GB each.
                </p>
              </div>
              
              <div>
                <Label htmlFor="video-category">Category for all videos (optional)</Label>
                <Select value={uploadCategoryId} onValueChange={setUploadCategoryId} disabled={isUploading}>
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

              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  <Label>Upload Queue ({uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.length} complete)</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                    {uploadQueue.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                          {item.status === 'uploading' && (
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          )}
                          {item.status === 'error' && (
                            <p className="text-xs text-destructive">{item.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {item.status === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {item.status === 'uploading' && (
                            <Badge variant="default" className="gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {item.progress}%
                            </Badge>
                          )}
                          {item.status === 'processing' && (
                            <Badge variant="default" className="gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing
                            </Badge>
                          )}
                          {item.status === 'done' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">Done</Badge>
                          )}
                          {item.status === 'error' && (
                            <Badge variant="destructive">Error</Badge>
                          )}
                          {item.status === 'cancelled' && (
                            <Badge variant="secondary">Cancelled</Badge>
                          )}
                          {!isUploading && item.status !== 'done' && item.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFromQueue(index)}
                              data-testid={`button-remove-queue-${index}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              {!isUploading && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsBatchDialogOpen(false);
                    setUploadQueue([]);
                    setUploadCategoryId("");
                  }}
                >
                  Close
                </Button>
              )}
              {isUploading && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCancelling}
                  data-testid="button-cancel-upload"
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Cancel Upload"
                  )}
                </Button>
              )}
              <Button 
                onClick={handleBatchUpload} 
                disabled={uploadQueue.length === 0 || isUploading || uploadQueue.every(q => q.status === 'done' || q.status === 'cancelled')}
                data-testid="button-confirm-upload"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading {currentUploadIndex + 1}/{uploadQueue.length}...
                  </>
                ) : uploadQueue.length === 0 ? (
                  "Select Videos"
                ) : (
                  `Upload ${uploadQueue.filter(q => q.status !== 'done' && q.status !== 'cancelled').length} Video${uploadQueue.filter(q => q.status !== 'done' && q.status !== 'cancelled').length !== 1 ? 's' : ''}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Upload?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel the current upload? The partially uploaded file will be deleted from the server. Any videos that have already finished uploading will be kept.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-confirm-no">Continue Uploading</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelUpload}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-cancel-confirm-yes"
              >
                Yes, Cancel Upload
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
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
            <>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, cat.id)}
                    onDragOver={handleCategoryDragOver}
                    onDrop={(e) => handleCategoryDrop(e, cat.id)}
                    onDragEnd={handleCategoryDragEnd}
                    className={`cursor-grab active:cursor-grabbing ${draggedCategoryId === cat.id ? "opacity-50" : ""}`}
                    data-testid={`draggable-category-${cat.id}`}
                  >
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      {cat.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => setCategoryToDelete(cat)}
                        disabled={deleteCategoryMutation.isPending}
                        data-testid={`button-delete-category-${cat.id}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Drag categories to reorder them</p>
              
              <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the category "{categoryToDelete?.name}"? Videos in this category will not be deleted, but they will no longer be assigned to this category.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete-category">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (categoryToDelete) {
                          deleteCategoryMutation.mutate(categoryToDelete.id);
                          setCategoryToDelete(null);
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-testid="button-confirm-delete-category"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
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
            <Button onClick={() => setIsSingleDialogOpen(true)} data-testid="button-upload-first-video">
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
              onResetThumbnail={async (regenerate) => {
                const res = await fetch(`/api/admin/videos/${video.id}/thumbnail?regenerate=${regenerate}`, {
                  method: "DELETE",
                });
                if (!res.ok) throw new Error("Failed to reset thumbnail");
                queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
              }}
              onRefreshStatus={async () => {
                const res = await fetch(`/api/admin/videos/${video.id}/refresh-status`, {
                  method: "POST",
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.message || "Failed to refresh status");
                }
                queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
