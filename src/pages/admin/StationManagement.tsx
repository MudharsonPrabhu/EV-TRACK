import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Zap, Activity, Plus, Settings as SettingsIcon, RefreshCw, Pause, Play } from 'lucide-react';
import { useStationSimulation } from '@/hooks/useStationSimulation';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const StationManagement: React.FC = () => {
  const { stations, stats, isRunning, toggleSimulation, manualRefresh } = useStationSimulation();

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Station Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your EV charging network • Last updated: {formatLastUpdated(stats.lastUpdated)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={manualRefresh}
            className="energy-flow"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleSimulation}
            className={isRunning ? "text-orange-400" : "text-green-400"}
          >
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? 'Pause' : 'Start'} Live Updates
          </Button>
          <Button className="energy-flow">
            <Plus className="h-4 w-4 mr-2" />
            Add Station
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary" />
              Active Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats.activeStations} />
            </div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-secondary" />
              Offline Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats.offlineStations} />
            </div>
            <p className="text-xs text-muted-foreground">Maintenance needed</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-accent" />
              Utilization Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter 
                value={stats.utilizationRate} 
                formatValue={(val) => `${val}%`}
              />
            </div>
            <p className="text-xs text-muted-foreground">Network average</p>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats.totalLocations} />
            </div>
            <p className="text-xs text-muted-foreground">Across 12 cities</p>
          </CardContent>
        </Card>
      </div>

      <Card className="energy-glow">
        <CardHeader>
          <CardTitle>Station Overview</CardTitle>
          <CardDescription>
            Real-time status of all charging stations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stations.map((station) => {
              const isOnline = station.status === 'Online';
              const iconColor = isOnline ? 'text-primary' : 'text-destructive';
              const bgColor = isOnline ? 'bg-primary/20' : 'bg-destructive/20';
              
              return (
                <div 
                  key={station.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50 transition-all duration-300 hover:bg-muted/70"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${bgColor} p-2 rounded-full transition-colors duration-300`}>
                      <Building2 className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{station.name}</h4>
                      <p className="text-sm text-muted-foreground">{station.address}</p>
                      <p className="text-xs text-muted-foreground">{station.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge 
                        variant={isOnline ? "default" : "destructive"} 
                        className="mb-1 transition-colors duration-300"
                      >
                        {station.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {isOnline 
                          ? `${station.availablePorts}/${station.totalPorts} available`
                          : 'Maintenance required'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {formatLastUpdated(station.lastUpdated)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationManagement;