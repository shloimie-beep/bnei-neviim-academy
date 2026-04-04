import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type DirectMessage = {
  id: string;
  userId: string;
  text: string;
  fromAdmin: boolean;
  readAt: string | null;
  createdAt: string;
};

type Conversation = {
  userId: string;
  userEmail: string;
  familyName: string | null;
  lastMessage: DirectMessage;
  unreadCount: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/admin/direct-messages"],
    refetchInterval: 10000,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery<DirectMessage[]>({
    queryKey: ["/api/admin/direct-messages", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 5000,
  });

  const replyMutation = useMutation({
    mutationFn: ({ userId, text }: { userId: string; text: string }) =>
      apiRequest("POST", `/api/admin/direct-messages/${userId}/reply`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/direct-messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/direct-messages"] });
      setReplyText("");
    },
    onError: () => toast({ title: "Failed to send reply", variant: "destructive" }),
  });

  const selectedConvo = conversations.find(c => c.userId === selectedUserId);

  const handleSend = () => {
    if (!selectedUserId || !replyText.trim()) return;
    replyMutation.mutate({ userId: selectedUserId, text: replyText.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ask the Rabbi — Member Questions</h1>
        <p className="text-muted-foreground mt-1">Personal questions from Plus members about life, growth, emunah, and more</p>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Conversation list */}
        <Card className={`flex flex-col ${selectedUserId ? "hidden md:flex w-80 shrink-0" : "w-full md:w-80 md:shrink-0"}`}>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversations
              {conversations.some(c => c.unreadCount > 0) && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {conversations.reduce((s, c) => s + c.unreadCount, 0)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoading ? (
              <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground text-sm">No messages yet</div>
            ) : (
              conversations.map(convo => (
                <button
                  key={convo.userId}
                  data-testid={`convo-${convo.userId}`}
                  onClick={() => setSelectedUserId(convo.userId)}
                  className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${selectedUserId === convo.userId ? "bg-muted" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {convo.familyName || convo.userEmail.split("@")[0]}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(convo.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">
                          {convo.lastMessage.fromAdmin ? "You: " : ""}{convo.lastMessage.text}
                        </p>
                        {convo.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0 shrink-0">
                            {convo.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat panel */}
        {selectedUserId ? (
          <Card className="flex flex-col flex-1 min-w-0">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  onClick={() => setSelectedUserId(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedConvo?.familyName || selectedConvo?.userEmail.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">{selectedConvo?.userEmail}</p>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No messages yet</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.fromAdmin
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.fromAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Reply box */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  data-testid="admin-reply-input"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your answer as Rabbi Eli Scheller…"
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  data-testid="admin-reply-send"
                  onClick={handleSend}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  size="icon"
                  className="shrink-0 h-10 w-10"
                >
                  {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Select a conversation to reply</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
