import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '@/hooks/useSimulation';
import RealTimeDashboard from '@/components/simulation/RealTimeDashboard';
import RealTimeMap from '@/components/simulation/RealTimeMap';
import SimulationControls from '@/components/simulation/SimulationControls';
import { MockChargingStation } from '@/data/mockIndianStations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, MapPin, Clock, Phone, Globe, X } from 'lucide-react';

const RealTimeUserDashboard: React.FC = () => {
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
            EVTrack Live Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time EV charging station monitoring across India</p>
        </div>
      </motion.div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[calc(100vh-200px)]">
        {/* Left Panel - Dashboard and Controls */}
        <div className="xl:col-span-1 space-y-6">
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

        {/* Right Panel - Map and Stats */}
        <div className="xl:col-span-3 space-y-6">
          {/* Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <RealTimeDashboard
              stats={stats}
              statusDistribution={statusDistribution}
              lastUpdate={lastUpdate}
              isRunning={isRunning}
            />
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="h-[600px]"
          >
            <RealTimeMap
              stations={stations}
              selectedStation={selectedStation}
              onStationSelect={setSelectedStation}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          </motion.div>
        </div>
      </div>

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
              <h3 className="text-lg font-semibold">Station Details</h3>
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
                <h5 className="font-medium mb-2">Port Information</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Ports</p>
                    <p className="font-medium">{selectedStation.totalPorts}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-medium text-green-600">{selectedStation.availablePorts}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would navigate to directions or booking
                    console.log('Navigate to station:', selectedStation.stationId);
                  }}
                  disabled={selectedStation.status !== 'Available'}
                >
                  {selectedStation.status === 'Available' ? 'Get Directions' : 'Station Unavailable'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeUserDashboard;