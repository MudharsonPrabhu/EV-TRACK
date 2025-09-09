import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Auth Components
import AuthPage from './components/auth/AuthPage';
import RoleSelector from './components/auth/RoleSelector';

// Layout
import { Layout } from './components/layout/Layout';

// Pages
import NotFound from "./pages/NotFound";
import UserDashboard from './pages/user/UserDashboard';
import UserMap from './pages/user/UserMap';
import TripPlanner from './pages/user/TripPlanner';
import UserProfile from './pages/user/UserProfile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import StationManagement from './pages/admin/StationManagement';
import Analytics from './pages/admin/Analytics';
import ExpansionSimulator from './pages/admin/ExpansionSimulator';

import RealTimeAdminDashboard from './pages/admin/RealTimeAdminDashboard';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile to get role
        fetchUserProfile(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data?.role) {
        setUserRole(data.role as 'user' | 'admin');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user: User, session: Session) => {
    setUser(user);
    setSession(session);
    fetchUserProfile(user.id);
  };

  const handleRoleSelected = (role: 'user' | 'admin') => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto mb-4 electric-pulse">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading EVTrack...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user || !session) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show role selector if user hasn't selected a role
  if (!userRole) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <RoleSelector user={user} onRoleSelected={handleRoleSelected} />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Main app with routing
  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Layout userRole={userRole} onLogout={handleLogout}>
              <Routes>
                {/* Redirect root to appropriate dashboard */}
                <Route 
                  path="/" 
                  element={
                    <Navigate 
                      to={userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'} 
                      replace 
                    />
                  } 
                />
                
                {/* User Routes */}
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/user/map" element={<UserMap />} />
                <Route path="/user/trip-planner" element={<TripPlanner />} />
                <Route path="/user/profile" element={<UserProfile />} />
                <Route path="/user/settings" element={<Settings userRole={userRole} />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/live-dashboard" element={<RealTimeAdminDashboard />} />
                <Route path="/admin/stations" element={<StationManagement />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/expansion" element={<ExpansionSimulator />} />
                <Route path="/admin/settings" element={<Settings userRole={userRole} />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
};

export default App;
