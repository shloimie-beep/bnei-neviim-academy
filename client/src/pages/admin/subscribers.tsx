import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, DollarSign, Clock, Search, RefreshCw, Ban, Calendar, Download, MoreHorizontal, Key, Trash2, Mail, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Subscriber {
  id: string;
  email: string;
  familyName: string | null;
  location: string | null;
  role: string;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  phoneNumbers: { phoneNumber: string }[];
  monthlyCallMinutes: number;
}

interface MonthOption {
  value: string;
  label: string;
}

export default function SubscribersManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [extendTrialDialogOpen, setExtendTrialDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [newPassword, setNewPassword] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");

  const monthOptions: MonthOption[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
  }

  const { data: subscribers, isLoading, refetch } = useQuery<Subscriber[]>({
    queryKey: ["/api/admin/subscribers", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subscribers?month=${selectedMonth}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      return res.json();
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (data: { stripeCustomerId: string; amount: number }) => {
      return apiRequest("POST", "/api/admin/refund", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      setRefundDialogOpen(false);
      setSelectedSubscriber(null);
      setRefundAmount("");
      toast({
        title: "Refund processed",
        description: "The refund has been issued successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Refund failed",
        description: error.message || "Failed to process refund.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (data: { userId: string; immediate: boolean }) => {
      const endpoint = data.immediate 
        ? `/api/admin/subscribers/${data.userId}/cancel-immediately`
        : `/api/admin/subscribers/${data.userId}/cancel`;
      return apiRequest("POST", endpoint, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      setCancelDialogOpen(false);
      setSelectedSubscriber(null);
      toast({
        title: "Subscription cancelled",
        description: "The subscription has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancel failed",
        description: error.message || "Failed to cancel subscription.",
        variant: "destructive",
      });
    },
  });

  const extendTrialMutation = useMutation({
    mutationFn: async (data: { userId: string; days: number }) => {
      return apiRequest("POST", `/api/admin/subscribers/${data.userId}/extend-trial`, { days: data.days });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      setExtendTrialDialogOpen(false);
      setSelectedSubscriber(null);
      setTrialDays("14");
      toast({
        title: "Trial extended",
        description: "The trial period has been extended.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Extend trial failed",
        description: error.message || "Failed to extend trial.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { userId: string; newPassword: string }) => {
      return apiRequest("POST", `/api/admin/subscribers/${data.userId}/change-password`, { newPassword: data.newPassword });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      setPasswordDialogOpen(false);
      setSelectedSubscriber(null);
      setNewPassword("");
      toast({
        title: "Password changed",
        description: "The subscriber's password has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/subscribers/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      setDeleteDialogOpen(false);
      setSelectedSubscriber(null);
      toast({
        title: "Subscriber deleted",
        description: "The subscriber and their subscription have been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete subscriber.",
        variant: "destructive",
      });
    },
  });

  const changePhoneMutation = useMutation({
    mutationFn: async (data: { userId: string; phoneNumber: string }) => {
      return apiRequest("POST", `/api/admin/subscribers/${data.userId}/change-phone`, { phoneNumber: data.phoneNumber });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      setPhoneDialogOpen(false);
      setSelectedSubscriber(null);
      setNewPhoneNumber("");
      toast({
        title: "Phone number updated",
        description: "The subscriber's phone number has been changed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update phone number.",
        variant: "destructive",
      });
    },
  });

  const emailAllMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      return apiRequest("POST", "/api/admin/subscribers/email-all", data);
    },
    onSuccess: (data: any) => {
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailMessage("");
      toast({
        title: "Emails sent",
        description: data.message || `Successfully sent emails to subscribers.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Email failed",
        description: error.message || "Failed to send emails.",
        variant: "destructive",
      });
    },
  });

  const fixTrialStatusMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/subscribers/fix-trial-status");
    },
    onSuccess: async (res: Response) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      toast({
        title: "Trial status fixed",
        description: data.message || `Fixed trial status for users.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fix failed",
        description: error.message || "Failed to fix trial status.",
        variant: "destructive",
      });
    },
  });

  const handleEmailAll = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both subject and message.",
        variant: "destructive",
      });
      return;
    }
    emailAllMutation.mutate({
      subject: emailSubject.trim(),
      message: emailMessage.trim(),
    });
  };

  const handleRefund = () => {
    if (!selectedSubscriber?.stripeCustomerId || !refundAmount) return;
    const amountCents = Math.round(parseFloat(refundAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid refund amount.",
        variant: "destructive",
      });
      return;
    }
    refundMutation.mutate({
      stripeCustomerId: selectedSubscriber.stripeCustomerId,
      amount: amountCents,
    });
  };

  const formatMinutes = (minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return "0 min";
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "trial":
        return <Badge variant="secondary">Trial</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  const filteredSubscribers = subscribers?.filter((sub) => {
    const term = searchTerm.toLowerCase();
    return (
      sub.email.toLowerCase().includes(term) ||
      (sub.familyName?.toLowerCase() || "").includes(term) ||
      (sub.location?.toLowerCase() || "").includes(term) ||
      (sub.phoneNumbers || []).some((p) => p.phoneNumber.includes(searchTerm))
    );
  });

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Subscribers</h1>
          <p className="text-muted-foreground">
            View subscriber details, call statistics, and issue refunds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEmailDialogOpen(true)}
            data-testid="button-email-all"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email All Subscribers
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/api/admin/subscribers/export-phones", "_blank")}
            data-testid="button-export-phones"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Active Phone Numbers
          </Button>
          <Button
            variant="outline"
            onClick={() => fixTrialStatusMutation.mutate()}
            disabled={fixTrialStatusMutation.isPending}
            data-testid="button-fix-trial-status"
          >
            {fixTrialStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Fix Trial Status
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            data-testid="button-refresh-subscribers"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscriber List
          </CardTitle>
          <CardDescription>
            Monthly call time statistics for all subscribers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-subscribers"
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger data-testid="select-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredSubscribers && filteredSubscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Family Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Call Time
                      </div>
                    </TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} data-testid={`row-subscriber-${subscriber.id}`}>
                      <TableCell className="font-medium">{subscriber.familyName || "-"}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {(subscriber.phoneNumbers || []).length > 0
                          ? formatPhoneNumber(subscriber.phoneNumbers[0].phoneNumber)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{subscriber.location || "-"}</TableCell>
                      <TableCell>{getStatusBadge(subscriber.subscriptionStatus)}</TableCell>
                      <TableCell>{formatMinutes(subscriber.monthlyCallMinutes)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(subscriber.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${subscriber.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {subscriber.stripeCustomerId && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscriber(subscriber);
                                  setRefundDialogOpen(true);
                                }}
                                data-testid={`menu-refund-${subscriber.id}`}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Issue Refund
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setExtendTrialDialogOpen(true);
                              }}
                              data-testid={`menu-extend-trial-${subscriber.id}`}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Extend Trial
                            </DropdownMenuItem>
                            {(subscriber.subscriptionStatus === "active" || subscriber.subscriptionStatus === "trial") && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscriber(subscriber);
                                  setCancelDialogOpen(true);
                                }}
                                className="text-destructive"
                                data-testid={`menu-cancel-${subscriber.id}`}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setPasswordDialogOpen(true);
                              }}
                              data-testid={`menu-password-${subscriber.id}`}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setNewPhoneNumber(subscriber.phoneNumbers?.[0]?.phoneNumber || "");
                                setPhoneDialogOpen(true);
                              }}
                              data-testid={`menu-phone-${subscriber.id}`}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Change Phone Number
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                              data-testid={`menu-delete-${subscriber.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Subscriber
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No subscribers found.</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search." : "Subscribers will appear here once they sign up."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Issue a refund to {selectedSubscriber?.email}. This will refund from their most recent payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount ($)</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0.50"
                placeholder="9.99"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                data-testid="input-refund-amount"
              />
              <p className="text-xs text-muted-foreground">
                Enter the amount in dollars. Minimum $0.50.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={refundMutation.isPending || !refundAmount}
              data-testid="button-confirm-refund"
            >
              {refundMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Issue Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Cancel the subscription for {selectedSubscriber?.email}. Choose how to cancel:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Current status: {selectedSubscriber?.subscriptionStatus}
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (selectedSubscriber) {
                  cancelMutation.mutate({ userId: selectedSubscriber.id, immediate: false });
                }
              }}
              disabled={cancelMutation.isPending}
              data-testid="button-cancel-end-period"
            >
              {cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel at Period End
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedSubscriber) {
                  cancelMutation.mutate({ userId: selectedSubscriber.id, immediate: true });
                }
              }}
              disabled={cancelMutation.isPending}
              data-testid="button-cancel-immediately"
            >
              {cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel Immediately
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={extendTrialDialogOpen} onOpenChange={setExtendTrialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              Extend or grant a trial period for {selectedSubscriber?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                min="1"
                max="90"
                placeholder="14"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                data-testid="input-trial-days"
              />
              <p className="text-xs text-muted-foreground">
                Number of days from today. Maximum 90 days.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTrialDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedSubscriber && trialDays) {
                  extendTrialMutation.mutate({ userId: selectedSubscriber.id, days: parseInt(trialDays) });
                }
              }}
              disabled={extendTrialMutation.isPending || !trialDays}
              data-testid="button-confirm-extend-trial"
            >
              {extendTrialMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedSubscriber?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedSubscriber && newPassword.length >= 6) {
                  changePasswordMutation.mutate({ userId: selectedSubscriber.id, newPassword });
                }
              }}
              disabled={changePasswordMutation.isPending || newPassword.length < 6}
              data-testid="button-confirm-password"
            >
              {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Phone Number</DialogTitle>
            <DialogDescription>
              Update the phone number for {selectedSubscriber?.email}. Include the country code (e.g. +1 for USA).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPhone">Phone Number</Label>
              <Input
                id="newPhone"
                type="tel"
                placeholder="+15551234567"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                data-testid="input-new-phone"
              />
              <p className="text-xs text-muted-foreground">
                Include country code with + prefix. Dashes and spaces are removed automatically.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedSubscriber && newPhoneNumber.trim()) {
                  changePhoneMutation.mutate({ userId: selectedSubscriber.id, phoneNumber: newPhoneNumber.trim() });
                }
              }}
              disabled={changePhoneMutation.isPending || !newPhoneNumber.trim()}
              data-testid="button-confirm-phone"
            >
              {changePhoneMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Phone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedSubscriber?.email} and cancel their Stripe subscription if they have one. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedSubscriber) {
                  deleteSubscriberMutation.mutate(selectedSubscriber.id);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteSubscriberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Subscriber
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email All Subscribers</DialogTitle>
            <DialogDescription>
              Send an email to all active subscribers. This will be sent from noreply@onetimeonetime.com.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                data-testid="input-email-subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Message</Label>
              <Textarea
                id="emailMessage"
                placeholder="Enter your message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                data-testid="input-email-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEmailAll}
              disabled={emailAllMutation.isPending || !emailSubject.trim() || !emailMessage.trim()}
              data-testid="button-send-email"
            >
              {emailAllMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
