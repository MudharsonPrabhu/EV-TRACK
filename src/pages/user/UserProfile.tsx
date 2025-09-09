import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Car, Battery, Award, Edit } from 'lucide-react';

const UserProfile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and vehicle information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="+1 (555) 123-4567" />
            </div>

            <Button className="w-full energy-flow">
              <Edit className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-secondary" />
              Vehicle Information
            </CardTitle>
            <CardDescription>
              Manage your EV details for better planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make & Model</Label>
              <Input id="make" defaultValue="Tesla Model 3" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" defaultValue="2023" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="range">Range (km)</Label>
                <Input id="range" defaultValue="450" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="efficiency">Efficiency (kWh/100km)</Label>
                <Input id="efficiency" defaultValue="15.2" />
              </div>
            </div>

            <Button variant="secondary" className="w-full energy-flow">
              <Car className="h-4 w-4 mr-2" />
              Update Vehicle
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Battery className="h-5 w-5 mr-2 text-accent" />
              Charging Statistics
            </CardTitle>
            <CardDescription>
              Your charging history and patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Total Sessions</span>
                <span className="text-lg font-bold">127</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Energy Consumed</span>
                <span className="text-lg font-bold">2,340 kWh</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Average Session</span>
                <span className="text-lg font-bold">45 min</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Favorite Station</span>
                <span className="text-lg font-bold">EcoCharge</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your eco-friendly milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Eco Warrior</p>
                  <p className="text-xs text-muted-foreground">100+ charging sessions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <Battery className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Energy Saver</p>
                  <p className="text-xs text-muted-foreground">Efficient charging habits</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="bg-accent/20 p-2 rounded-full">
                  <Car className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Road Trip Master</p>
                  <p className="text-xs text-muted-foreground">Complete 10 long trips</p>
                  <div className="w-full bg-muted mt-1 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;