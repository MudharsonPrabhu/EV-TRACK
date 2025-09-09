import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MockChargingStation } from '@/data/mockIndianStations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, MapPin, Clock, Wifi } from 'lucide-react';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create custom colored markers
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">⚡</div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

const getMarkerIcon = (status: MockChargingStation['status']) => {
  switch (status) {
    case 'Available':
      return createColoredIcon('#10b981'); // Green
    case 'Occupied':
      return createColoredIcon('#ef4444'); // Red
    case 'Offline':
      return createColoredIcon('#6b7280'); // Gray
    default:
      return createColoredIcon('#6b7280');
  }
};

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

interface RealTimeMapProps {
  stations: MockChargingStation[];
  selectedStation?: MockChargingStation | null;
  onStationSelect?: (station: MockChargingStation) => void;
  searchTerm?: string;
  statusFilter?: string;
}

const RealTimeMap: React.FC<RealTimeMapProps> = ({
  stations,
  selectedStation,
  onStationSelect,
  searchTerm = '',
  statusFilter = 'all'
}) => {
  // Default center on India
  const center: [number, number] = [20.5937, 78.9629];
  const zoom = 5;

  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      const matchesSearch = searchTerm === '' || 
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [stations, searchTerm, statusFilter]);

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Station Map</CardTitle>
          <Badge variant="outline" className="text-xs">
            {filteredStations.length} stations shown
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <motion.div 
          className="h-full w-full rounded-lg overflow-hidden border-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {filteredStations.map((station) => (
          <Marker 
            key={station.stationId}
            position={[station.location.lat, station.location.lng]}
            icon={getMarkerIcon(station.status)}
            eventHandlers={{
              click: () => onStationSelect?.(station),
            }}
          >
            <Popup className="custom-popup">
              <motion.div 
                className="p-3 min-w-[280px] space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-base text-foreground">
                    {station.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{station.location.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={station.status === 'Available' ? 'default' : 'secondary'}
                      className={`${getStatusColor(station.status)} text-white`}
                    >
                      {station.status}
                    </Badge>
                    <Badge variant="outline">
                      {station.availablePorts}/{station.totalPorts} ports
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span>{station.chargingSpeed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-blue-500" />
                      <span>{station.operator}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {formatLastUpdated(station.lastUpdated)}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStationSelect?.(station)}
                  className="w-full"
                >
                  View Details
                </Button>
              </motion.div>
            </Popup>
          </Marker>
        ))}
          </MapContainer>
          
          {filteredStations.length === 0 && (
            <motion.div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">No stations found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default RealTimeMap;