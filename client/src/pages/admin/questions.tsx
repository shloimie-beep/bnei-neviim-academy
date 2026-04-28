import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Pencil, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface VideoQuestion {
  id: string;
  videoId: string;
  question: string;
  answer: string | null;
  sortOrder: number;
  createdAt: string;
}

interface GroupedQuestions {
  videoId: string;
  videoTitle: string;
  questions: VideoQuestion[];
}

interface Video {
  id: string;
  title: string;
}

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<VideoQuestion | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });

  const { data: grouped = [], isLoading } = useQuery<GroupedQuestions[]>({
    queryKey: ["/api/admin/questions"],
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const addMutation = useMutation({
    mutationFn: (data: { videoId: string; question: string; answer: string }) =>
      apiRequest("POST", `/api/admin/videos/${data.videoId}/questions`, { question: data.question, answer: data.answer || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      setAddDialogOpen(false);
      setForm({ question: "", answer: "" });
      setSelectedVideoId("");
      toast({ title: "Question added" });
    },
    onError: () => toast({ title: "Failed to add question", variant: "destructive" }),
  });

  const editMutation = useMutation({
    mutationFn: (data: { id: string; question: string; answer: string }) =>
      apiRequest("PATCH", `/api/admin/questions/${data.id}`, { question: data.question, answer: data.answer || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      setEditDialogOpen(false);
      setEditingQuestion(null);
      setForm({ question: "", answer: "" });
      toast({ title: "Question updated" });
    },
    onError: () => toast({ title: "Failed to update question", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      toast({ title: "Question deleted" });
    },
    onError: () => toast({ title: "Failed to delete question", variant: "destructive" }),
  });

  const toggleExpanded = (videoId: string) => {
    setExpandedVideos(prev => {
      const next = new Set(prev);
      next.has(videoId) ? next.delete(videoId) : next.add(videoId);
      return next;
    });
  };

  const openEdit = (q: VideoQuestion) => {
    setEditingQuestion(q);
    setForm({ question: q.question, answer: q.answer ?? "" });
    setEditDialogOpen(true);
  };

  const totalQuestions = grouped.reduce((sum, g) => sum + g.questions.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Questions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage review questions shown below each video. Currently {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} across {grouped.length} video{grouped.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-question">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading questions...</div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No study questions yet. Add some to appear below videos!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(group => (
            <Card key={group.videoId}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleExpanded(group.videoId)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedVideos.has(group.videoId) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{group.videoTitle}</CardTitle>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.questions.length} question{group.questions.length !== 1 ? "s" : ""}</Badge>
                </div>
              </CardHeader>
              {expandedVideos.has(group.videoId) && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {group.questions.map((q, i) => (
                      <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20" data-testid={`question-item-${q.id}`}>
                        <span className="text-primary font-bold text-sm shrink-0 mt-0.5">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{q.question}</p>
                          {q.answer && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-semibold text-foreground">Answer:</span> {q.answer}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(q)} data-testid={`button-edit-question-${q.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" data-testid={`button-delete-question-${q.id}`}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(q.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => { setSelectedVideoId(group.videoId); setAddDialogOpen(true); }}
                    data-testid={`button-add-question-to-${group.videoId}`}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Question to This Video
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(o) => { setAddDialogOpen(o); if (!o) { setForm({ question: "", answer: "" }); setSelectedVideoId(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Study Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Video</Label>
              <Select value={selectedVideoId} onValueChange={setSelectedVideoId}>
                <SelectTrigger data-testid="select-question-video">
                  <SelectValue placeholder="Select a video..." />
                </SelectTrigger>
                <SelectContent>
                  {videos.map((v: Video) => (
                    <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Question</Label>
              <Textarea
                placeholder="e.g. What foods are valid for an Eruv Chatzeiros?"
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                className="mt-1"
                data-testid="input-question-text"
              />
            </div>
            <div>
              <Label>Answer <span className="text-muted-foreground text-xs">(optional — leave blank to encourage thinking)</span></Label>
              <Textarea
                placeholder="Optional answer..."
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                className="mt-1"
                data-testid="input-question-answer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!selectedVideoId || !form.question.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate({ videoId: selectedVideoId, question: form.question.trim(), answer: form.answer.trim() })}
              data-testid="button-confirm-add-question"
            >
              {addMutation.isPending ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) setEditingQuestion(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Question</Label>
              <Textarea
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                className="mt-1"
                data-testid="input-edit-question-text"
              />
            </div>
            <div>
              <Label>Answer <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                className="mt-1"
                data-testid="input-edit-question-answer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!form.question.trim() || editMutation.isPending}
              onClick={() => editingQuestion && editMutation.mutate({ id: editingQuestion.id, question: form.question.trim(), answer: form.answer.trim() })}
              data-testid="button-confirm-edit-question"
            >
              {editMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
