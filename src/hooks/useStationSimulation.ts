import { useState, useEffect, useCallback } from 'react';

export interface Station {
  id: string;
  name: string;
  address: string;
  description: string;
  status: 'Online' | 'Offline';
  availablePorts: number;
  totalPorts: number;
  lastUpdated: Date;
}

export interface StationStats {
  activeStations: number;
  offlineStations: number;
  utilizationRate: number;
  totalLocations: number;
  lastUpdated: Date;
}

const mockStations: Station[] = [
  {
    id: '1',
    name: 'Downtown Plaza Station',
    address: '123 Main St, Downtown',
    description: '8 ports • Level 2 & DC Fast',
    status: 'Online',
    availablePorts: 6,
    totalPorts: 8,
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'Mall District Hub',
    address: '456 Shopping Blvd, Mall District',
    description: '12 ports • DC Fast Charging',
    status: 'Online',
    availablePorts: 2,
    totalPorts: 12,
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'Airport Terminal Station',
    address: '789 Airport Way, Terminal B',
    description: '6 ports • Level 2 Charging',
    status: 'Offline',
    availablePorts: 0,
    totalPorts: 6,
    lastUpdated: new Date()
  },
  {
    id: '4',
    name: 'Tech Park Supercharger',
    address: '321 Innovation Dr, Tech Park',
    description: '16 ports • Ultra-fast DC',
    status: 'Online',
    availablePorts: 12,
    totalPorts: 16,
    lastUpdated: new Date()
  },
  {
    id: '5',
    name: 'University Campus Station',
    address: '555 College Ave, Campus',
    description: '4 ports • Level 2 Charging',
    status: 'Online',
    availablePorts: 4,
    totalPorts: 4,
    lastUpdated: new Date()
  },
  {
    id: '6',
    name: 'Highway Rest Stop',
    address: '100 Interstate Hwy, Mile 45',
    description: '10 ports • DC Fast Charging',
    status: 'Online',
    availablePorts: 7,
    totalPorts: 10,
    lastUpdated: new Date()
  }
];

export const useStationSimulation = () => {
  const [stations, setStations] = useState<Station[]>(mockStations);
  const [isRunning, setIsRunning] = useState(true);
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(new Date());

  const getStationStats = useCallback((): StationStats => {
    const activeStations = stations.filter(s => s.status === 'Online').length;
    const offlineStations = stations.filter(s => s.status === 'Offline').length;
    
    // Calculate utilization rate based on current usage
    const totalPorts = stations.reduce((sum, s) => sum + s.totalPorts, 0);
    const usedPorts = stations.reduce((sum, s) => sum + (s.totalPorts - s.availablePorts), 0);
    const utilizationRate = Math.round((usedPorts / totalPorts) * 100);

    return {
      activeStations,
      offlineStations,
      utilizationRate,
      totalLocations: 89, // Fixed mock number
      lastUpdated: lastGlobalUpdate
    };
  }, [stations, lastGlobalUpdate]);

  const simulateStationUpdate = useCallback(() => {
    setStations(prevStations => {
      const updatedStations = prevStations.map(station => {
        const updateChance = Math.random();
        
        // 20% chance of any update per cycle
        if (updateChance > 0.2) return station;

        const statusChangeChance = Math.random();
        let newStation = { ...station };

        // 5% chance of status change
        if (statusChangeChance < 0.05) {
          newStation.status = station.status === 'Online' ? 'Offline' : 'Online';
          newStation.availablePorts = newStation.status === 'Offline' ? 0 : 
            Math.floor(Math.random() * station.totalPorts);
        } else if (station.status === 'Online') {
          // Adjust available ports for online stations
          const change = Math.random() < 0.5 ? -1 : 1;
          const newAvailable = Math.max(0, Math.min(station.totalPorts, station.availablePorts + change));
          newStation.availablePorts = newAvailable;
        }

        newStation.lastUpdated = new Date();
        return newStation;
      });

      setLastGlobalUpdate(new Date());
      return updatedStations;
    });
  }, []);

  const manualRefresh = useCallback(() => {
    simulateStationUpdate();
  }, [simulateStationUpdate]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      simulateStationUpdate();
    }, Math.random() * 2000 + 3000); // 3-5 seconds

    return () => clearInterval(interval);
  }, [isRunning, simulateStationUpdate]);

  const toggleSimulation = () => setIsRunning(!isRunning);

  return {
    stations,
    stats: getStationStats(),
    isRunning,
    lastGlobalUpdate,
    toggleSimulation,
    manualRefresh
  };
};