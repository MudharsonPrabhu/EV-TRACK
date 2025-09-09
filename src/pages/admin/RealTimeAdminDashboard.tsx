import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '@/hooks/useSimulation';
import RealTimeDashboard from '@/components/simulation/RealTimeDashboard';
import RealTimeMap from '@/components/simulation/RealTimeMap';
import SimulationControls from '@/components/simulation/SimulationControls';
import AdminStationTable from '@/components/simulation/AdminStationTable';
import { MockChargingStation } from '@/data/mockIndianStations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Database, BarChart3, Settings, Zap, Clock, Globe, X } from 'lucide-react';

const RealTimeAdminDashboard: React.FC = () => {
  const {
    stations,
    updates,
    isRunning,
    lastUpdate,
    getStationStats,
    getStatusDistribution,
    toggleSimulation,
    runSimulation
  } = useSimulation();

  const [selectedStation, setSelectedStation] = useState<MockChargingStation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = getStationStats();
  const statusDistribution = getStatusDistribution();

  const getStatusColor = (status: MockChargingStation['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Occupied':
        return 'bg-red-500';
      case 'Offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            EVTrack Admin Control Center
          </h1>
          <p className="text-muted-foreground">Advanced monitoring and management of EV charging infrastructure</p>
        </div>
      </motion.div>

      {/* Admin Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Live Map
          </TabsTrigger>
          <TabsTrigger value="stations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Station Data
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RealTimeDashboard
              stats={stats}
              statusDistribution={statusDistribution}
              lastUpdate={lastUpdate}
              isRunning={isRunning}
            />
          </motion.div>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-240px)]">
            <div className="lg:col-span-1 h-full">
              <SimulationControls
                isRunning={isRunning}
                onToggleSimulation={toggleSimulation}
                onRunManualUpdate={runSimulation}
                updates={updates}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </div>
            <div className="lg:col-span-3 h-full min-h-[500px]">
              <RealTimeMap
                stations={stations}
                selectedStation={selectedStation}
                onStationSelect={setSelectedStation}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
              />
            </div>
          </div>
        </TabsContent>

        {/* Stations Tab */}
        <TabsContent value="stations">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AdminStationTable
              stations={stations}
              onStationSelect={setSelectedStation}
            />
          </motion.div>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimulationControls
              isRunning={isRunning}
              onToggleSimulation={toggleSimulation}
              onRunManualUpdate={runSimulation}
              updates={updates}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Simulation Status</p>
                    <Badge variant={isRunning ? "default" : "secondary"} className="mt-1">
                      {isRunning ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Update Frequency</p>
                    <p className="font-medium">Every 7 seconds</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Stations</p>
                    <p className="font-medium">{stats.available + stats.occupied}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Updates</p>
                    <p className="font-medium">{updates.length}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => console.log('Export data')}
                    >
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => console.log('Generate report')}
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Station Detail Modal */}
      {selectedStation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStation(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Station Management</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg">{selectedStation.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedStation.stationId}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant={selectedStation.status === 'Available' ? 'default' : 'secondary'}
                  className={`${getStatusColor(selectedStation.status)} text-white`}
                >
                  {selectedStation.status}
                </Badge>
                <Badge variant="outline">
                  {selectedStation.availablePorts}/{selectedStation.totalPorts} ports available
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{selectedStation.location.city}</p>
                    <p className="text-xs text-muted-foreground">{selectedStation.location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedStation.location.lat}, {selectedStation.location.lng}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Charging Speed: {selectedStation.chargingSpeed}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Operator: {selectedStation.operator}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Updated: {formatLastUpdated(selectedStation.lastUpdated)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium mb-2">Administrative Actions</h5>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => console.log('Edit station:', selectedStation.stationId)}
                  >
                    Edit Station Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => console.log('View maintenance log:', selectedStation.stationId)}
                  >
                    View Maintenance Log
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => console.log('Generate report:', selectedStation.stationId)}
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeAdminDashboard;