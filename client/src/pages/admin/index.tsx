import { Link, useLocation } from "wouter";
import { Phone, Music, Settings, Users, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import AdminDashboard from "./dashboard";
import AudioManagement from "./audio";
import MenuManagement from "./menu";
import ConferenceManagement from "./conference";

const adminRoutes = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/audio", label: "Audio Files", icon: Music },
  { path: "/admin/menu", label: "Menu Options", icon: Menu },
  { path: "/admin/conference", label: "Conference", icon: Users },
];

function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Phone className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Kids' Hotline</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminRoutes.map((route) => (
                <SidebarMenuItem key={route.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === route.path}
                  >
                    <Link href={route.path} data-testid={`nav-${route.label.toLowerCase().replace(" ", "-")}`}>
                      <route.icon className="h-4 w-4" />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-customer-view">
              <Settings className="h-4 w-4 mr-2" />
              Customer View
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const [location] = useLocation();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const renderContent = () => {
    switch (location) {
      case "/admin/audio":
        return <AudioManagement />;
      case "/admin/menu":
        return <MenuManagement />;
      case "/admin/conference":
        return <ConferenceManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
