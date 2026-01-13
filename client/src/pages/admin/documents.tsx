import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, FileText, Trash2, Loader2, Edit2, Eye, EyeOff, BarChart2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Document, VideoCategory } from "@shared/schema";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function DocumentCard({ doc, onDelete, onUpdate, categories }: { 
  doc: Document; 
  onDelete: () => void;
  onUpdate: (data: Partial<Document>) => void;
  categories: VideoCategory[];
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(doc.title);
  const [editDescription, setEditDescription] = useState(doc.description || "");
  const [editCategoryId, setEditCategoryId] = useState(doc.categoryId || "");
  const [editAllowDownload, setEditAllowDownload] = useState(doc.allowDownload ?? false);
  
  const categoryName = categories.find(c => c.id === doc.categoryId)?.name;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleSave = () => {
    onUpdate({ 
      title: editTitle, 
      description: editDescription, 
      categoryId: editCategoryId || null,
      allowDownload: editAllowDownload 
    });
    setIsEditing(false);
  };

  const toggleStatus = () => {
    onUpdate({ status: doc.status === "ready" ? "hidden" : "ready" });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Document title"
                      data-testid={`input-edit-title-${doc.id}`}
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      data-testid={`input-edit-description-${doc.id}`}
                    />
                    <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                      <SelectTrigger data-testid={`select-edit-category-${doc.id}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`edit-allow-download-${doc.id}`}
                        checked={editAllowDownload}
                        onCheckedChange={(checked) => setEditAllowDownload(checked === true)}
                        data-testid={`checkbox-edit-allow-download-${doc.id}`}
                      />
                      <Label htmlFor={`edit-allow-download-${doc.id}`} className="text-sm font-normal cursor-pointer">
                        Allow users to download and print
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} data-testid={`button-save-doc-${doc.id}`}>
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
                      <p className="font-medium" data-testid={`text-doc-title-${doc.id}`}>
                        {doc.title}
                      </p>
                      <Badge variant="secondary" className="text-xs">PDF</Badge>
                      {categoryName && (
                        <Badge variant="outline" className="text-xs">{categoryName}</Badge>
                      )}
                      {doc.allowDownload && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Download className="h-3 w-3" />
                          Downloadable
                        </Badge>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{doc.filename}</p>
                  </>
                )}
              </div>
              <Badge 
                variant={doc.status === "ready" ? "default" : "secondary"} 
              >
                {doc.status === "ready" ? "Published" : "Hidden"}
              </Badge>
            </div>
            {!isEditing && (
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(doc.fileSize)}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1" title="View count">
                  <BarChart2 className="h-3 w-3" />
                  {doc.viewCount ?? 0} views
                </span>
                <span className="text-sm text-muted-foreground">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Unknown date"}
                </span>
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleStatus}
                    title={doc.status === "ready" ? "Hide document" : "Publish document"}
                    data-testid={`button-toggle-visibility-${doc.id}`}
                  >
                    {doc.status === "ready" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    data-testid={`button-edit-doc-${doc.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    data-testid={`button-delete-doc-${doc.id}`}
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
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{doc.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default function DocumentManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
  });

  const { data: categories = [] } = useQuery<VideoCategory[]>({
    queryKey: ["/api/admin/video-categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      toast({ title: "Document deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Document> }) => {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      toast({ title: "Document updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast({ title: "Please provide a file and title", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (categoryId && categoryId !== "none") formData.append("categoryId", categoryId);
      formData.append("allowDownload", String(allowDownload));

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Upload failed");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      toast({ title: "Document uploaded successfully" });
      
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setCategoryId("");
      setAllowDownload(false);
      setIsDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Document Library</h1>
          <p className="text-muted-foreground">Manage PDF documents for subscribers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-document">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload PDF Document</DialogTitle>
              <DialogDescription>
                Upload a PDF file for subscribers to view. Max file size: 100MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-file">PDF File</Label>
                <Input
                  id="doc-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      if (!title) {
                        setTitle(file.name.replace(/\.pdf$/i, ""));
                      }
                    }
                  }}
                  disabled={isUploading}
                  data-testid="input-doc-file"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="doc-title">Title</Label>
                <Input
                  id="doc-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  disabled={isUploading}
                  data-testid="input-doc-title"
                />
              </div>
              <div>
                <Label htmlFor="doc-description">Description (optional)</Label>
                <Textarea
                  id="doc-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter document description"
                  rows={3}
                  disabled={isUploading}
                  data-testid="input-doc-description"
                />
              </div>
              <div>
                <Label htmlFor="doc-category">Category (optional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={isUploading}>
                  <SelectTrigger data-testid="select-doc-category">
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
              <div className="flex items-center gap-2 pt-2">
                <Checkbox 
                  id="allow-download"
                  checked={allowDownload}
                  onCheckedChange={(checked) => setAllowDownload(checked === true)}
                  disabled={isUploading}
                  data-testid="checkbox-allow-download"
                />
                <Label htmlFor="allow-download" className="text-sm font-normal cursor-pointer">
                  Allow users to download and print
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !title}
                data-testid="button-upload-submit"
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              categories={categories}
              onDelete={() => deleteMutation.mutate(doc.id)}
              onUpdate={(data) => updateMutation.mutate({ id: doc.id, data })}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload PDF documents for your subscribers to view.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-upload-first-doc">
              <Upload className="h-4 w-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
