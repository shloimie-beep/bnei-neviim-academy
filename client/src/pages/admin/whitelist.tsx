import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Phone, ShieldCheck, Mail, Video, Clock, AlertCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const countryCodes = [
  { code: "+1", country: "USA/Canada" },
  { code: "+972", country: "Israel" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+27", country: "South Africa" },
  { code: "+52", country: "Mexico" },
  { code: "+55", country: "Brazil" },
  { code: "+91", country: "India" },
];

interface WhitelistedNumber {
  id: string;
  phoneNumber: string;
  label: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface WhitelistedEmail {
  id: string;
  email: string;
  label: string | null;
  expiresAt: string | null;
  createdAt: string;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function ExpirationBadge({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) {
    return <span className="text-muted-foreground text-sm">Never</span>;
  }
  const expired = isExpired(expiresAt);
  const date = new Date(expiresAt).toLocaleDateString();
  if (expired) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Expired {date}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3 w-3" />
      {date}
    </Badge>
  );
}

export default function WhitelistManagement() {
  const { toast } = useToast();
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newPhoneLabel, setNewPhoneLabel] = useState("");
  const [newPhoneExpires, setNewPhoneExpires] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [bulkNumbers, setBulkNumbers] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailLabel, setNewEmailLabel] = useState("");
  const [newEmailExpires, setNewEmailExpires] = useState("");

  const { data: whitelistedNumbers, isLoading: loadingNumbers } = useQuery<WhitelistedNumber[]>({
    queryKey: ["/api/admin/whitelisted-numbers"],
  });

  const { data: whitelistedEmails, isLoading: loadingEmails } = useQuery<WhitelistedEmail[]>({
    queryKey: ["/api/admin/whitelisted-emails"],
  });

  const addPhoneMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; label?: string; expiresAt?: string }) => {
      return apiRequest("POST", "/api/admin/whitelisted-numbers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-numbers"] });
      setIsPhoneDialogOpen(false);
      setNewPhoneNumber("");
      setNewPhoneLabel("");
      setNewPhoneExpires("");
      setPhoneCountryCode("+1");
      toast({ title: "Number added", description: "The phone number has been whitelisted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add phone number.", variant: "destructive" });
    },
  });

  const deletePhoneMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/whitelisted-numbers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-numbers"] });
      toast({ title: "Number removed", description: "The phone number has been removed from the whitelist." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to remove phone number.", variant: "destructive" });
    },
  });

  const addEmailMutation = useMutation({
    mutationFn: async (data: { email: string; label?: string; expiresAt?: string }) => {
      return apiRequest("POST", "/api/admin/whitelisted-emails", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-emails"] });
      setIsEmailDialogOpen(false);
      setNewEmail("");
      setNewEmailLabel("");
      setNewEmailExpires("");
      toast({ title: "Email added", description: "The email has been whitelisted for free video access." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add email.", variant: "destructive" });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/whitelisted-emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-emails"] });
      toast({ title: "Email removed", description: "The email has been removed from the whitelist." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to remove email.", variant: "destructive" });
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: async (phoneNumbers: string[]) => {
      return apiRequest("POST", "/api/admin/whitelisted-numbers/bulk", { phoneNumbers });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-numbers"] });
      setIsBulkDialogOpen(false);
      setBulkNumbers("");
      toast({
        title: "Bulk upload complete",
        description: `${data.added} number(s) added, ${data.skipped} already existed.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to bulk add numbers.", variant: "destructive" });
    },
  });

  const handleAddPhone = () => {
    if (!newPhoneNumber.trim()) return;
    const countryCodeDigits = phoneCountryCode.replace(/\D/g, "");
    const localNumber = newPhoneNumber.replace(/^0+/, '').replace(/\D/g, "");
    const fullNumber = countryCodeDigits + localNumber;
    addPhoneMutation.mutate({
      phoneNumber: fullNumber,
      label: newPhoneLabel.trim() || undefined,
      expiresAt: newPhoneExpires || undefined,
    });
  };

  const handleBulkAdd = () => {
    const lines = bulkNumbers.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    // Strip country code prefix formatting but keep digits
    const numbers = lines.map(l => l.replace(/\D/g, "")).filter(n => n.length >= 7);
    bulkAddMutation.mutate(numbers);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    addEmailMutation.mutate({
      email: newEmail.trim(),
      label: newEmailLabel.trim() || undefined,
      expiresAt: newEmailExpires || undefined,
    });
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Whitelist Management</h1>
        <p className="text-muted-foreground">
          Manage phone numbers and emails that get free access without a subscription.
        </p>
      </div>

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails" className="gap-2">
            <Video className="h-4 w-4" />
            Video Access (Emails)
          </TabsTrigger>
          <TabsTrigger value="phones" className="gap-2">
            <Phone className="h-4 w-4" />
            Hotline Access (Phones)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-email-whitelist">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Whitelisted Email</DialogTitle>
                  <DialogDescription>
                    This email will have free access to all videos without requiring a subscription.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      data-testid="input-whitelist-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-label">Label (Optional)</Label>
                    <Input
                      id="email-label"
                      type="text"
                      placeholder="e.g., Press reviewer, Partner"
                      value={newEmailLabel}
                      onChange={(e) => setNewEmailLabel(e.target.value)}
                      data-testid="input-whitelist-email-label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-expires">Expiration Date (Optional)</Label>
                    <Input
                      id="email-expires"
                      type="date"
                      value={newEmailExpires}
                      onChange={(e) => setNewEmailExpires(e.target.value)}
                      data-testid="input-whitelist-email-expires"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for no expiration. Access will be automatically revoked after this date.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleAddEmail}
                    disabled={addEmailMutation.isPending || !newEmail.trim()}
                    data-testid="button-confirm-add-email-whitelist"
                  >
                    {addEmailMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Email
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Free Video Access
              </CardTitle>
              <CardDescription>
                These emails can watch all videos without needing a subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEmails ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : whitelistedEmails && whitelistedEmails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelistedEmails.map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-email-whitelist-${entry.id}`} className={isExpired(entry.expiresAt) ? "opacity-60" : ""}>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.label || "-"}</TableCell>
                        <TableCell>
                          <ExpirationBadge expiresAt={entry.expiresAt} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-email-whitelist-${entry.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove from whitelist?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This email will no longer have free video access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteEmailMutation.mutate(entry.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No whitelisted emails yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Add emails that should have free access to videos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phones" className="space-y-4">
          <div className="flex justify-end gap-2">
            {/* Bulk Upload Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-bulk-add-phones">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Add Phone Numbers</DialogTitle>
                  <DialogDescription>
                    Paste phone numbers below — one per line. Any format works (dashes, spaces, country codes). Duplicates are skipped automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Textarea
                    placeholder={`14431234567\n13052345678\n19177654321`}
                    rows={10}
                    value={bulkNumbers}
                    onChange={(e) => setBulkNumbers(e.target.value)}
                    className="font-mono text-sm"
                    data-testid="textarea-bulk-phones"
                  />
                  <p className="text-xs text-muted-foreground">
                    {bulkNumbers.split(/[\n,]+/).map(l => l.trim()).filter(Boolean).length} number(s) detected
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleBulkAdd}
                    disabled={bulkAddMutation.isPending || !bulkNumbers.trim()}
                    data-testid="button-confirm-bulk-add-phones"
                  >
                    {bulkAddMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-phone-whitelist">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Number
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Whitelisted Number</DialogTitle>
                  <DialogDescription>
                    This phone number will have free access to the hotline without requiring a subscription.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                        <SelectTrigger className="w-36" data-testid="select-whitelist-country-code">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((cc) => (
                            <SelectItem key={cc.code} value={cc.code}>
                              {cc.code} {cc.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="555-123-4567"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        data-testid="input-whitelist-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-label">Label (Optional)</Label>
                    <Input
                      id="phone-label"
                      type="text"
                      placeholder="e.g., Mom's phone, Test number"
                      value={newPhoneLabel}
                      onChange={(e) => setNewPhoneLabel(e.target.value)}
                      data-testid="input-whitelist-phone-label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-expires">Expiration Date (Optional)</Label>
                    <Input
                      id="phone-expires"
                      type="date"
                      value={newPhoneExpires}
                      onChange={(e) => setNewPhoneExpires(e.target.value)}
                      data-testid="input-whitelist-phone-expires"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for no expiration. Access will be automatically revoked after this date.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleAddPhone}
                    disabled={addPhoneMutation.isPending || !newPhoneNumber.trim()}
                    data-testid="button-confirm-add-phone-whitelist"
                  >
                    {addPhoneMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Number
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Free Hotline Access
              </CardTitle>
              <CardDescription>
                These phone numbers bypass subscription requirements and can call the hotline for free.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNumbers ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : whitelistedNumbers && whitelistedNumbers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelistedNumbers.map((number) => (
                      <TableRow key={number.id} data-testid={`row-phone-whitelist-${number.id}`} className={isExpired(number.expiresAt) ? "opacity-60" : ""}>
                        <TableCell className="font-mono">{formatPhoneNumber(number.phoneNumber)}</TableCell>
                        <TableCell className="text-muted-foreground">{number.label || "-"}</TableCell>
                        <TableCell>
                          <ExpirationBadge expiresAt={number.expiresAt} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(number.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-phone-whitelist-${number.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove from whitelist?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This phone number will no longer have free access to the hotline.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePhoneMutation.mutate(number.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No whitelisted numbers yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Add phone numbers that should have free access to the hotline.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
