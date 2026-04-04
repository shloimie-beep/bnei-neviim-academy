import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, MessageSquare, Reply, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type CommentWithMeta = {
  id: string;
  videoId: string;
  videoTitle: string;
  userId: string;
  userEmail: string;
  familyName: string | null;
  text: string;
  parentId: string | null;
  isAdminReply: boolean;
  createdAt: string;
};

export default function AdminCommentsPage() {
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedVideos, setExpandedVideos] = useState<Record<string, boolean>>({});

  const { data: comments = [], isLoading } = useQuery<CommentWithMeta[]>({
    queryKey: ["/api/admin/comments"],
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({ title: "Comment deleted" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ videoId, text, parentId }: { videoId: string; text: string; parentId: string }) =>
      apiRequest("POST", `/api/videos/${videoId}/comments`, { text, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      setReplyingTo(null);
      setReplyText("");
      toast({ title: "Reply posted" });
    },
  });

  // Group comments by videoId
  const grouped = comments.reduce<Record<string, CommentWithMeta[]>>((acc, c) => {
    if (!acc[c.videoId]) acc[c.videoId] = [];
    acc[c.videoId].push(c);
    return acc;
  }, {});

  const videoEntries = Object.entries(grouped).sort(([, a], [, b]) => {
    const latestA = Math.max(...a.map(c => new Date(c.createdAt).getTime()));
    const latestB = Math.max(...b.map(c => new Date(c.createdAt).getTime()));
    return latestB - latestA;
  });

  const toggleVideo = (videoId: string) => {
    setExpandedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comment Management</h1>
          <p className="text-muted-foreground mt-1">View and reply to comments across all videos</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {comments.length} total comment{comments.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {videoEntries.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No comments yet</p>
          </CardContent>
        </Card>
      )}

      {videoEntries.map(([videoId, videoComments]) => {
        const isExpanded = expandedVideos[videoId] !== false;
        const topLevel = videoComments.filter(c => !c.parentId);
        const replies = videoComments.filter(c => c.parentId);
        const videoTitle = videoComments[0]?.videoTitle || "Unknown Video";
        const unreplied = topLevel.filter(c => !replies.some(r => r.parentId === c.id));

        return (
          <Card key={videoId} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none hover:bg-muted/30 transition-colors py-4"
              onClick={() => toggleVideo(videoId)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <CardTitle className="text-base truncate">{videoTitle}</CardTitle>
                  {unreplied.length > 0 && (
                    <Badge variant="destructive" className="shrink-0 text-xs">
                      {unreplied.length} need{unreplied.length === 1 ? "s" : ""} reply
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline">{topLevel.length} comment{topLevel.length !== 1 ? "s" : ""}</Badge>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-4 pb-4">
                {topLevel.map(comment => {
                  const commentReplies = replies.filter(r => r.parentId === comment.id);
                  const isReplying = replyingTo === comment.id;

                  return (
                    <div key={comment.id} className="border rounded-lg overflow-hidden">
                      {/* Original comment */}
                      <div className="p-4 bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm">{comment.familyName || comment.userEmail}</span>
                              <span className="text-xs text-muted-foreground">{comment.userEmail}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{comment.text}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => {
                                setReplyingTo(isReplying ? null : comment.id);
                                setReplyText("");
                              }}
                              data-testid={`button-reply-${comment.id}`}
                              title="Reply"
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                              data-testid={`button-delete-comment-${comment.id}`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Admin replies */}
                      {commentReplies.map(reply => (
                        <div key={reply.id} className="p-4 border-t bg-primary/5 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-primary">Rabbi Eli</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin Reply</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{reply.text}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => deleteCommentMutation.mutate(reply.id)}
                            disabled={deleteCommentMutation.isPending}
                            data-testid={`button-delete-reply-${reply.id}`}
                            title="Delete reply"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Reply form */}
                      {isReplying && (
                        <div className="p-4 border-t bg-background">
                          <p className="text-xs font-semibold text-primary mb-2">Reply as Rabbi Eli:</p>
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={3}
                            className="mb-2"
                            data-testid="textarea-reply"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => replyMutation.mutate({ videoId, text: replyText, parentId: comment.id })}
                              disabled={!replyText.trim() || replyMutation.isPending}
                              data-testid="button-submit-reply"
                            >
                              {replyMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              Post Reply
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
