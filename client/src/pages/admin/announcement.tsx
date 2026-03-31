import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, ImagePlus, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth-context";

interface AnnouncementData {
  text: string;
  isActive: boolean;
  imageUrl: string | null;
  webhookSecret: string;
}

export default function AnnouncementManagement() {
  const { toast } = useToast();
  const [text, setText] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<AnnouncementData>({
    queryKey: ["/api/admin/announcement"],
    queryFn: async () => {
      const res = await fetch("/api/admin/announcement", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const d = await res.json();
      if (text === null) setText(d.text);
      if (isActive === null) setIsActive(d.isActive);
      return d;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/announcement", {
        text: text ?? "",
        isActive: isActive ?? true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcement"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
      toast({ title: "Saved", description: "Announcement updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save announcement.", variant: "destructive" });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/announcement/image", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      setImageFile(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcement"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
      toast({ title: "Image uploaded", description: "Announcement image updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/announcement/image", {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcement"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
      toast({ title: "Image removed", description: "Announcement image deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove image.", variant: "destructive" });
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const currentText = text ?? data?.text ?? "";
  const currentActive = isActive ?? data?.isActive ?? true;
  const hasCurrentImage = !!data?.imageUrl;
  const imageSrc = imagePreview ?? (hasCurrentImage ? `/api/announcement/image?v=${Date.now()}` : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Announcement Banner</h1>
        <p className="text-muted-foreground">
          Manage the message shown at the top of the subscriber dashboard.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Banner Text
          </CardTitle>
          <CardDescription>
            This message appears at the top of every subscriber's dashboard when active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="announcement-text">Message</Label>
                <Textarea
                  id="announcement-text"
                  placeholder="e.g. New stories added this week! Call (605) 313-4793 to listen..."
                  value={currentText}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  data-testid="textarea-announcement"
                />
                <p className="text-xs text-muted-foreground">{currentText.length} characters</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">Show on dashboard</p>
                  <p className="text-xs text-muted-foreground">
                    {currentActive ? "Banner is visible to all subscribers" : "Banner is hidden"}
                  </p>
                </div>
                <Switch
                  checked={currentActive}
                  onCheckedChange={setIsActive}
                  data-testid="switch-announcement-active"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-announcement"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Badge variant={currentActive && (currentText.trim() || hasCurrentImage) ? "default" : "outline"}>
                  {currentActive && (currentText.trim() || hasCurrentImage) ? "Live" : "Not Showing"}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Banner Image
          </CardTitle>
          <CardDescription>
            Optional image shown below the banner text. Subscribers can collapse it after viewing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              {imageSrc && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={imageSrc}
                    alt="Announcement"
                    className="w-full object-contain max-h-64"
                    data-testid="img-announcement-preview"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-announcement-image"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-choose-image"
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  {hasCurrentImage || imageFile ? "Replace Image" : "Choose Image"}
                </Button>

                {imageFile && (
                  <Button
                    onClick={() => uploadImageMutation.mutate(imageFile)}
                    disabled={uploadImageMutation.isPending}
                    data-testid="button-upload-image"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadImageMutation.isPending ? "Uploading..." : "Upload Image"}
                  </Button>
                )}

                {hasCurrentImage && !imageFile && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteImageMutation.mutate()}
                    disabled={deleteImageMutation.isPending}
                    data-testid="button-delete-image"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteImageMutation.isPending ? "Removing..." : "Remove Image"}
                  </Button>
                )}

                {imageFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {imageFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {imageFile.name} — click "Upload Image" to save.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
