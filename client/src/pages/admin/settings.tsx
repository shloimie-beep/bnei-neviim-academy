import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Lock, UserX, Users } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: adminUsers = [], isLoading: adminsLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      await apiRequest("DELETE", `/api/admin/admins/${adminId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Admin account deleted successfully" });
      setDeleteConfirmOpen(false);
      setDeleteAdminId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete admin", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "New password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords don't match", variant: "destructive" });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await apiRequest("POST", "/api/auth/change-password", { currentPassword, newPassword });
      toast({ title: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ 
        title: "Failed to change password", 
        description: error.message || "Please check your current password",
        variant: "destructive" 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your admin account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your admin account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              data-testid="input-current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              data-testid="input-new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              data-testid="input-confirm-password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            data-testid="button-change-password"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Accounts
          </CardTitle>
          <CardDescription>
            Manage admin user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : adminUsers.length === 0 ? (
            <p className="text-muted-foreground">No admin accounts found.</p>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium" data-testid={`text-admin-email-${admin.id}`}>{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleteAdminId(admin.id);
                      setDeleteConfirmOpen(true);
                    }}
                    data-testid={`button-delete-admin-${admin.id}`}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this admin account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAdminId && deleteAdminMutation.mutate(deleteAdminId)}
              disabled={deleteAdminMutation.isPending}
              data-testid="button-confirm-delete-admin"
            >
              {deleteAdminMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
