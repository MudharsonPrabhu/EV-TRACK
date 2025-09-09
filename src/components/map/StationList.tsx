import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChargingStation } from '@/types/charging-station';
import { MapPin, Zap, Clock, Navigation, Star } from 'lucide-react';

interface StationListProps {
  stations: ChargingStation[];
  onStationSelect: (station: ChargingStation) => void;
  selectedStation?: ChargingStation;
}

const StationList: React.FC<StationListProps> = ({
  stations,
  onStationSelect,
  selectedStation,
}) => {
  const getStatusColor = (station: ChargingStation) => {
    const isAvailable = station.statusType?.isOperational !== false;
    return isAvailable ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (station: ChargingStation) => {
    const isAvailable = station.statusType?.isOperational !== false;
    return isAvailable ? 'Available' : 'Status Unknown';
  };

  return (
    <Card className="energy-glow h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Nearby Stations ({stations.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-4">
            {stations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No charging stations found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              stations.map((station) => (
                <Card
                  key={station.id}
                  className={`cursor-pointer transition-all energy-flow ${
                    selectedStation?.id === station.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => onStationSelect(station)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base line-clamp-2">
                            {station.addressInfo.title || "Unknown Station"}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {station.addressInfo.addressLine1 || "Address Not Available"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {station.addressInfo.town || "Unknown"}, {station.addressInfo.stateOrProvince || "Unknown"}
                          </p>
                        </div>
                        {station.addressInfo.distance && (
                          <Badge variant="outline" className="text-xs">
                            {station.addressInfo.distance.toFixed(1)}km
                          </Badge>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(station)}`} />
                        <span className="text-sm font-medium">
                          {getStatusText(station)}
                        </span>
                      </div>

                      {/* Connectors */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Connectors</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {station.connections.slice(0, 4).map((conn, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {conn.connectionType?.title || "Unknown Type"}
                              {conn.powerKW && ` ${conn.powerKW}kW`}
                            </Badge>
                          ))}
                          {station.connections.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{station.connections.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Operator */}
                      {station.operatorInfo && (
                        <p className="text-xs text-muted-foreground">
                          {station.operatorInfo.title || "Unknown Operator"}
                        </p>
                      )}

                      {/* Last Update */}
                      {station.dateLastStatusUpdate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated: {new Date(station.dateLastStatusUpdate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 energy-flow"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open in Google Maps
                            const url = `https://maps.google.com/?q=${station.addressInfo.latitude},${station.addressInfo.longitude}`;
                            window.open(url, '_blank');
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StationList;