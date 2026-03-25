import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Copy, Check, Eye, EyeOff, Webhook } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const [secretVisible, setSecretVisible] = useState(false);

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

  const webhookSecret = data?.webhookSecret ?? "";
  const webhookUrl = `${window.location.origin}/api/webhook/announcement`;

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    setTimeout(() => setCopied(false), 2000);
  };

  const currentText = text ?? data?.text ?? "";
  const currentActive = isActive ?? data?.isActive ?? true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Announcement Banner</h1>
        <p className="text-muted-foreground">
          Manage the scrolling message shown at the top of the subscriber dashboard.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Banner Text
            </CardTitle>
            <CardDescription>
              This message scrolls across the top of every subscriber's dashboard when active.
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

                {currentText.trim() && (
                  <div className="rounded-lg bg-muted/50 border overflow-hidden">
                    <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-medium">Preview</p>
                    <div className="relative overflow-hidden h-10 bg-primary/10 border-t">
                      <div className="flex items-center h-full">
                        <p
                          className="whitespace-nowrap text-sm font-medium text-primary animate-marquee px-4"
                          style={{
                            animation: "marquee 18s linear infinite",
                          }}
                        >
                          {currentText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currentText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="w-full"
                  data-testid="button-save-announcement"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Integration
            </CardTitle>
            <CardDescription>
              Use this webhook to update the announcement from an external app or automation tool.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted rounded-md px-3 py-2 break-all font-mono">
                  {webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                  data-testid="button-copy-webhook-url"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted rounded-md px-3 py-2 font-mono break-all">
                  {isLoading ? "Loading..." : secretVisible ? webhookSecret : "•".repeat(Math.min(webhookSecret.length, 36))}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSecretVisible((v) => !v)}
                  data-testid="button-toggle-secret"
                >
                  {secretVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookSecret, "Webhook secret")}
                  data-testid="button-copy-secret"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Include this as the <code className="bg-muted px-1 rounded">x-webhook-secret</code> header in your requests.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">How to use</p>
              <p className="text-xs text-muted-foreground">Send a POST request to the webhook URL:</p>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre">{`POST ${webhookUrl}
x-webhook-secret: <your-secret>
Content-Type: application/json

{
  "text": "Your new announcement here",
  "isActive": true
}`}</pre>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fields (all optional):</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                  <li><code className="bg-muted px-1 rounded">text</code> — the banner message</li>
                  <li><code className="bg-muted px-1 rounded">isActive</code> — true to show, false to hide</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={currentActive && currentText.trim() ? "default" : "outline"}>
                {currentActive && currentText.trim() ? "Live" : "Not Showing"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentActive && currentText.trim()
                  ? "Banner is currently visible to subscribers"
                  : "Banner is not currently shown"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
