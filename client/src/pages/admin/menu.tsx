import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Phone, Plus, Trash2, Loader2, Edit2, Music, Users, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MenuOption, AudioFile } from "@shared/schema";

function MenuOptionCard({
  option,
  audioFiles,
  onEdit,
  onDelete,
}: {
  option: MenuOption;
  audioFiles: AudioFile[];
  onEdit: (option: MenuOption) => void;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const audioFile = audioFiles.find((f) => f.id === option.audioFileId);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <Card className={!option.isActive ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-foreground">{option.optionNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium" data-testid={`text-menu-label-${option.id}`}>
                  {option.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={option.type === "conference" ? "default" : "secondary"}>
                    {option.type === "conference" ? (
                      <><Users className="h-3 w-3 mr-1" /> Conference</>
                    ) : (
                      <><Music className="h-3 w-3 mr-1" /> Story</>
                    )}
                  </Badge>
                  {!option.isActive && <Badge variant="outline">Disabled</Badge>}
                </div>
                {audioFile && option.type !== "conference" && (
                  <p className="text-sm text-muted-foreground mt-2 truncate">
                    Audio: {audioFile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(option)}
                data-testid={`button-edit-menu-${option.id}`}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                data-testid={`button-delete-menu-${option.id}`}
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

export default function MenuManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<MenuOption | null>(null);
  const [formData, setFormData] = useState({
    optionNumber: "",
    label: "",
    type: "story",
    audioFileId: "",
    isActive: true,
  });

  const { data: menuOptions, isLoading: menuLoading } = useQuery<MenuOption[]>({
    queryKey: ["/api/admin/menu-options"],
  });

  const { data: audioFiles, isLoading: audioLoading } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/menu-options", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
      toast({ title: "Menu option created" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/menu-options/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
      toast({ title: "Menu option updated" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/menu-options/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
      toast({ title: "Menu option deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      optionNumber: "",
      label: "",
      type: "story",
      audioFileId: "",
      isActive: true,
    });
    setEditingOption(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (option: MenuOption) => {
    setEditingOption(option);
    setFormData({
      optionNumber: option.optionNumber.toString(),
      label: option.label,
      type: option.type,
      audioFileId: option.audioFileId || "",
      isActive: option.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      optionNumber: parseInt(formData.optionNumber),
      label: formData.label,
      type: formData.type,
      audioFileId: formData.type === "conference" ? null : formData.audioFileId || null,
      isActive: formData.isActive,
    };

    if (editingOption) {
      await updateMutation.mutateAsync({ id: editingOption.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isLoading = menuLoading || audioLoading;
  const storyAudioFiles = audioFiles?.filter((f) => f.type === "story") || [];
  const sortedOptions = menuOptions?.slice().sort((a, b) => a.optionNumber - b.optionNumber) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Options</h1>
          <p className="text-muted-foreground">Configure the IVR menu for incoming calls.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-menu">
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOption ? "Edit Menu Option" : "Add Menu Option"}</DialogTitle>
              <DialogDescription>
                Configure a number option for the IVR menu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="option-number">Press Number</Label>
                <Input
                  id="option-number"
                  type="number"
                  min="0"
                  max="9"
                  placeholder="1-9"
                  value={formData.optionNumber}
                  onChange={(e) => setFormData({ ...formData, optionNumber: e.target.value })}
                  data-testid="input-option-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Listen to a story"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  data-testid="input-option-label"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger data-testid="select-option-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Conference Call</SelectItem>
                    <SelectItem value="story">Audio Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "story" && (
                <div className="space-y-2">
                  <Label htmlFor="audio">Audio File</Label>
                  <Select value={formData.audioFileId} onValueChange={(v) => setFormData({ ...formData, audioFileId: v })}>
                    <SelectTrigger data-testid="select-option-audio">
                      <SelectValue placeholder="Select audio file" />
                    </SelectTrigger>
                    <SelectContent>
                      {storyAudioFiles.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || !formData.optionNumber || !formData.label}
                data-testid="button-save-menu"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Visual Keypad */}
      <Card>
        <CardHeader>
          <CardTitle>IVR Keypad Overview</CardTitle>
          <CardDescription>Visual representation of your menu options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((key) => {
              const option = menuOptions?.find((o) => o.optionNumber === key);
              return (
                <div
                  key={key}
                  className={`
                    h-16 rounded-lg border-2 flex flex-col items-center justify-center text-center p-2
                    ${option ? "border-primary bg-primary/5" : "border-muted bg-muted/20"}
                  `}
                >
                  <span className="text-lg font-bold">{key}</span>
                  {option && (
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {option.label.substring(0, 10)}...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Menu Options List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedOptions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedOptions.map((option) => (
            <MenuOptionCard
              key={option.id}
              option={option}
              audioFiles={audioFiles || []}
              onEdit={handleEdit}
              onDelete={() => deleteMutation.mutate(option.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">No menu options configured</p>
              <p className="text-muted-foreground mb-4">Add options to create your IVR menu.</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-menu">
                <Plus className="h-4 w-4 mr-2" />
                Add First Option
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
