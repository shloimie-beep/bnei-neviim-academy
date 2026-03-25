import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth-context";

interface AnnouncementData {
  text: string;
  isActive: boolean;
  webhookSecret: string;
}

export default function AnnouncementManagement() {
  const { toast } = useToast();
  const [text, setText] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);

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

  const currentText = text ?? data?.text ?? "";
  const currentActive = isActive ?? data?.isActive ?? true;

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
                <Badge variant={currentActive && currentText.trim() ? "default" : "outline"}>
                  {currentActive && currentText.trim() ? "Live" : "Not Showing"}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
