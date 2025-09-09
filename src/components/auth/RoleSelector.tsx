import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, ChevronRight, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface RoleSelectorProps {
  user: User;
  onRoleSelected: (role: 'user' | 'admin') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ user, onRoleSelected }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleSelection = async (role: 'user' | 'admin') => {
    setLoading(true);
    try {
      // Update the user's profile with the selected role
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Role Selected",
        description: `Welcome to EVTrack as a ${role}!`,
      });

      onRoleSelected(role);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to set role",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full electric-pulse">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
            Welcome to EVTrack
          </h1>
          <p className="text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="energy-glow border-primary/20 cursor-pointer transition-all hover:border-primary/40 hover:scale-105"
            onClick={() => !loading && handleRoleSelection('user')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-secondary/20 rounded-full w-fit">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">EV User</CardTitle>
              <CardDescription>
                Find charging stations, plan routes, and monitor your EV charging sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Interactive charging station map
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  AI-powered trip planner
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Real-time station availability
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Personal charging history
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleRoleSelection('user')}
                disabled={loading}
              >
                {loading ? "Setting up..." : "Continue as User"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="energy-glow border-primary/20 cursor-pointer transition-all hover:border-primary/40 hover:scale-105"
            onClick={() => !loading && handleRoleSelection('admin')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Administrator</CardTitle>
              <CardDescription>
                Manage charging stations, analyze data, and optimize network expansion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Station management dashboard
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Advanced analytics & insights
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Network expansion simulator
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  Digital twin monitoring
                </li>
              </ul>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleRoleSelection('admin')}
                disabled={loading}
              >
                {loading ? "Setting up..." : "Continue as Admin"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;