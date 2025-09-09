import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Route, Zap, Battery, Clock, MapPin, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveMap from '@/components/map/InteractiveMap';
import FavoritesList from '@/components/map/FavoritesList';
import { ChatWidget } from '@/components/chat/ChatWidget';

const UserDashboard: React.FC = () => {
  console.log('UserDashboard component rendering successfully');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, EV User! ⚡</h1>
        <p className="text-muted-foreground">
          Your personal EV charging command center
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Battery className="h-4 w-4 mr-2 text-secondary" />
              Battery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">85 km range</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Nearest Station
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 km</div>
            <p className="text-xs text-muted-foreground">FastCharge Plaza</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-accent" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No active charging</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Last Charge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">EcoCharge Station</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="h-5 w-5 mr-2 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Fast access to your most used features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/user/live-dashboard">
              <Button className="w-full justify-start energy-flow" variant="outline">
                <Map className="h-4 w-4 mr-2" />
                View Live Dashboard
              </Button>
            </Link>
            <Link to="/user/map">
              <Button className="w-full justify-start energy-flow" variant="outline">
                <Map className="h-4 w-4 mr-2" />
                Find Charging Stations
              </Button>
            </Link>
            <Link to="/user/trip-planner">
              <Button className="w-full justify-start energy-flow" variant="outline">
                <Route className="h-4 w-4 mr-2" />
                Plan Your Trip
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest charging sessions and trips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <Zap className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">EcoCharge Station</p>
                  <p className="text-xs text-muted-foreground">45 min session • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Route className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Trip to Downtown</p>
                  <p className="text-xs text-muted-foreground">3 stops planned • Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-accent/20 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">PowerHub Center</p>
                  <p className="text-xs text-muted-foreground">1 hour session • 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Nearby Charging Stations
              </CardTitle>
              <CardDescription>
                Interactive map showing real-time charging station data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveMap />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <FavoritesList />
          
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Your charging overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">12 sessions</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Energy Used</span>
                <span className="font-medium">142 kWh</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Session</span>
                <span className="font-medium">45 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="energy-glow">
        <CardHeader>
          <CardTitle>Energy Insights</CardTitle>
          <CardDescription>
            Your charging patterns and efficiency metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto mb-4 electric-pulse">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Detailed analytics and insights about your EV usage will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <ChatWidget />
    </div>
  );
};

export default UserDashboard;