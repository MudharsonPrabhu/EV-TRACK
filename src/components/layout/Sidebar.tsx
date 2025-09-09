import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Map,
  Route,
  User,
  Settings,
  BarChart3,
  Building2,
  Network,
  Zap,
  LogOut,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppSidebarProps {
  userRole: 'user' | 'admin';
  onLogout: () => void;
}

const userMenuItems = [
  { title: "Dashboard", url: "/user/dashboard", icon: Home },
  { title: "Map", url: "/user/map", icon: Map },
  { title: "Trip Planner", url: "/user/trip-planner", icon: Route },
  { title: "Profile", url: "/user/profile", icon: User },
  { title: "Settings", url: "/user/settings", icon: Settings },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Live Control Center", url: "/admin/live-dashboard", icon: Activity },
  { title: "Station Management", url: "/admin/stations", icon: Building2 },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Expansion Simulator", url: "/admin/expansion", icon: Network },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar({ userRole, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const { toast } = useToast();
  
  const currentPath = location.pathname;
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  
  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      onLogout();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  const getNavClassName = (isActive: boolean) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar className="w-60 border-r border-sidebar-border bg-sidebar-background">
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="bg-primary/20 p-2 rounded-lg electric-pulse">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-sidebar-foreground">EVTrack</h2>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole} Dashboard</p>
        </div>
      </div>

      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-md transition-all
                        ${getNavClassName(isActive)}
                      `}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Sign Out</span>
        </Button>
      </div>
    </Sidebar>
  );
}