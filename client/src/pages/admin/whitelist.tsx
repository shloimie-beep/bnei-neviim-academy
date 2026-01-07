import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Trash2, Phone, ShieldCheck } from "lucide-react";
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

interface WhitelistedNumber {
  id: string;
  phoneNumber: string;
  label: string | null;
  createdAt: string;
}

export default function WhitelistManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const { data: whitelistedNumbers, isLoading } = useQuery<WhitelistedNumber[]>({
    queryKey: ["/api/admin/whitelisted-numbers"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; label?: string }) => {
      return apiRequest("/api/admin/whitelisted-numbers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-numbers"] });
      setIsDialogOpen(false);
      setNewPhoneNumber("");
      setNewLabel("");
      toast({
        title: "Number added",
        description: "The phone number has been whitelisted for free access.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add phone number.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/whitelisted-numbers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-numbers"] });
      toast({
        title: "Number removed",
        description: "The phone number has been removed from the whitelist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove phone number.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (!newPhoneNumber.trim()) return;
    addMutation.mutate({
      phoneNumber: newPhoneNumber.replace(/\D/g, ""),
      label: newLabel.trim() || undefined,
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Whitelisted Numbers</h1>
          <p className="text-muted-foreground">
            Manage phone numbers that can access the hotline for free without a subscription.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-whitelist">
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
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  data-testid="input-whitelist-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label (Optional)</Label>
                <Input
                  id="label"
                  type="text"
                  placeholder="e.g., Mom's phone, Test number"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  data-testid="input-whitelist-label"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending || !newPhoneNumber.trim()}
                data-testid="button-confirm-add-whitelist"
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
            Free Access Numbers
          </CardTitle>
          <CardDescription>
            These phone numbers bypass subscription requirements and can call the hotline for free.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : whitelistedNumbers && whitelistedNumbers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whitelistedNumbers.map((number) => (
                  <TableRow key={number.id} data-testid={`row-whitelist-${number.id}`}>
                    <TableCell className="font-mono">
                      {formatPhoneNumber(number.phoneNumber)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {number.label || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(number.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-whitelist-${number.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from whitelist?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This phone number will no longer have free access to the hotline.
                              They will need a subscription to call.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(number.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
    </div>
  );
}
