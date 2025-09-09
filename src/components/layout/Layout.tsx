import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'user' | 'admin';
  onLogout: () => void;
}

export function Layout({ children, userRole, onLogout }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={userRole} onLogout={onLogout} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border bg-card/50 backdrop-blur">
            <SidebarTrigger className="ml-4" />
            <div className="flex-1" />
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}