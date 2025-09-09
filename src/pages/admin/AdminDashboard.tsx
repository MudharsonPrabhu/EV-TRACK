import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  BarChart3, 
  Network, 
  Activity, 
  Users, 
  Zap, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import AIAssistantPanel from '@/components/admin/AIAssistantPanel';

const AdminDashboard: React.FC = () => {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, Administrator! 🔧</h1>
        <p className="text-muted-foreground">
          Your EV network management command center
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary" />
              Total Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-secondary" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,432</div>
            <p className="text-xs text-muted-foreground">+8.2% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-accent" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,847</div>
            <p className="text-xs text-muted-foreground">+156 new today</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,934</div>
            <p className="text-xs text-muted-foreground">+12.5% vs avg</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Quick Management
            </CardTitle>
            <CardDescription>
              Fast access to your admin tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start energy-flow" variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Stations
            </Button>
            <Button className="w-full justify-start energy-flow" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start energy-flow" variant="outline">
              <Network className="h-4 w-4 mr-2" />
              Expansion Simulator
            </Button>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-accent" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Recent notifications and system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-destructive/20 p-2 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Station Downtown-05 Offline</p>
                  <p className="text-xs text-muted-foreground">Maintenance required • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Peak Usage Alert</p>
                  <p className="text-xs text-muted-foreground">Mall District at 95% capacity • 1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New Station Online</p>
                  <p className="text-xs text-muted-foreground">Tech Park Station activated • 3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="energy-glow">
        <CardHeader>
          <CardTitle>Network Overview</CardTitle>
          <CardDescription>
            Real-time status of your EV charging network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto mb-4 electric-pulse">
              <Network className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Digital Twin Coming Soon</h3>
            <p className="text-muted-foreground">
              Advanced network visualization and real-time monitoring will be available here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Panel */}
      <AIAssistantPanel 
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
      />
    </div>
  );
};

export default AdminDashboard;