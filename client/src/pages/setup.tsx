import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/sys-config/init-admin-x7k9", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, setupKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult("Admin account created successfully! You can now log in.");
        toast({
          title: "Success",
          description: "Admin account created. Go to login page.",
        });
      } else {
        setResult(`Error: ${data.message}`);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setResult("Failed to create admin account");
      toast({
        title: "Error",
        description: "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle data-testid="text-setup-title">Admin Setup</CardTitle>
          <CardDescription>
            Create an admin account for the production environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                data-testid="input-setup-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                required
                data-testid="input-setup-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setupKey">Setup Key</Label>
              <Input
                id="setupKey"
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="Enter setup key"
                required
                data-testid="input-setup-key"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-create-admin"
            >
              {isLoading ? "Creating..." : "Create Admin Account"}
            </Button>
          </form>
          {result && (
            <p 
              className={`mt-4 text-sm ${result.includes("Error") ? "text-destructive" : "text-green-600"}`}
              data-testid="text-setup-result"
            >
              {result}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
