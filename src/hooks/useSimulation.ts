import { useState, useEffect, useCallback } from 'react';
import { mockIndianStations, MockChargingStation } from '@/data/mockIndianStations';

export interface SimulationUpdate {
  timestamp: Date;
  stationId: string;
  stationName: string;
  previousStatus: string;
  newStatus: string;
  message: string;
}

export const useSimulation = () => {
  const [stations, setStations] = useState<MockChargingStation[]>(mockIndianStations);
  const [updates, setUpdates] = useState<SimulationUpdate[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const generateRandomUpdate = useCallback((station: MockChargingStation): MockChargingStation | null => {
    const updateChance = Math.random();
    
    // 30% chance of update per cycle
    if (updateChance > 0.3) return null;

    const updates: Partial<MockChargingStation> = {
      lastUpdated: new Date()
    };

    const updateType = Math.random();
    
    if (updateType < 0.4) {
      // Status change (40% of updates)
      const statuses: MockChargingStation['status'][] = ['Available', 'Occupied', 'Offline'];
      const currentIndex = statuses.indexOf(station.status);
      const newStatuses = statuses.filter((_, i) => i !== currentIndex);
      updates.status = newStatuses[Math.floor(Math.random() * newStatuses.length)];
      
      // Adjust available ports based on new status
      if (updates.status === 'Offline') {
        updates.availablePorts = 0;
      } else if (updates.status === 'Available') {
        updates.availablePorts = Math.floor(Math.random() * station.totalPorts) + 1;
      } else { // Occupied
        updates.availablePorts = Math.floor(Math.random() * station.totalPorts);
      }
    } else {
      // Port availability change (60% of updates)
      if (station.status !== 'Offline') {
        const maxAvailable = station.status === 'Available' ? station.totalPorts : station.totalPorts - 1;
        updates.availablePorts = Math.floor(Math.random() * (maxAvailable + 1));
        
        // Update status based on port availability
        if (updates.availablePorts === 0) {
          updates.status = 'Occupied';
        } else if (updates.availablePorts > 0 && station.status === 'Occupied') {
          updates.status = 'Available';
        }
      }
    }

    return { ...station, ...updates };
  }, []);

  const runSimulation = useCallback(() => {
    setStations(prevStations => {
      const newUpdates: SimulationUpdate[] = [];
      const updatedStations = prevStations.map(station => {
        const updated = generateRandomUpdate(station);
        
        if (updated && (updated.status !== station.status || updated.availablePorts !== station.availablePorts)) {
          const updateMessage = updated.status !== station.status 
            ? `Status changed from ${station.status} to ${updated.status}`
            : `Available ports changed from ${station.availablePorts} to ${updated.availablePorts}`;
            
          newUpdates.push({
            timestamp: new Date(),
            stationId: station.stationId,
            stationName: station.name,
            previousStatus: `${station.status} (${station.availablePorts}/${station.totalPorts})`,
            newStatus: `${updated.status} (${updated.availablePorts}/${updated.totalPorts})`,
            message: updateMessage
          });
          
          return updated;
        }
        
        return station;
      });

      if (newUpdates.length > 0) {
        setUpdates(prev => [...newUpdates, ...prev].slice(0, 50)); // Keep last 50 updates
        setLastUpdate(new Date());
      }

      return updatedStations;
    });
  }, [generateRandomUpdate]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      runSimulation();
    }, 7000); // Update every 7 seconds

    return () => clearInterval(interval);
  }, [isRunning, runSimulation]);

  const getStationStats = useCallback(() => {
    const total = stations.length;
    const available = stations.filter(s => s.status === 'Available').length;
    const occupied = stations.filter(s => s.status === 'Occupied').length;
    const offline = stations.filter(s => s.status === 'Offline').length;
    
    const totalPorts = stations.reduce((sum, s) => sum + s.totalPorts, 0);
    const availablePorts = stations.reduce((sum, s) => sum + s.availablePorts, 0);
    
    const chargingSpeeds = stations.map(s => parseInt(s.chargingSpeed));
    const avgChargingSpeed = chargingSpeeds.reduce((sum, speed) => sum + speed, 0) / chargingSpeeds.length;

    return {
      total,
      available,
      occupied,
      offline,
      totalPorts,
      availablePorts,
      avgChargingSpeed: Math.round(avgChargingSpeed)
    };
  }, [stations]);

  const getStatusDistribution = useCallback(() => {
    const stats = getStationStats();
    return [
      { name: 'Available', value: stats.available, color: '#10b981' },
      { name: 'Occupied', value: stats.occupied, color: '#ef4444' },
      { name: 'Offline', value: stats.offline, color: '#6b7280' }
    ];
  }, [getStationStats]);

  const toggleSimulation = () => setIsRunning(!isRunning);

  return {
    stations,
    updates,
    isRunning,
    lastUpdate,
    getStationStats,
    getStatusDistribution,
    toggleSimulation,
    runSimulation
  };
};