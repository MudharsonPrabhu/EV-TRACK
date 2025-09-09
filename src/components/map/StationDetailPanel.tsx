import React from 'react';
import { X, MapPin, Zap, Clock, Wifi, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface StationData {
  ID: number;
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    Latitude: number;
    Longitude: number;
  };
  Connections?: Array<{
    ID: number;
    ConnectionType?: {
      Title: string;
      FormalName: string;
    };
    PowerKW?: number;
    Level?: {
      Title: string;
    };
    Quantity?: number;
  }>;
  OperationalStatus?: {
    IsOperational: boolean;
    Title: string;
  };
  StatusType?: {
    IsOperational: boolean;
    Title: string;
  };
  UsageType?: {
    Title: string;
  };
  OperatorInfo?: {
    Title: string;
  };
  NumberOfPoints?: number;
}

interface StationDetailPanelProps {
  station: StationData | null;
  onClose: () => void;
  onToggleFavorite?: (stationId: number) => void;
  isFavorite?: boolean;
}

const StationDetailPanel: React.FC<StationDetailPanelProps> = ({
  station,
  onClose,
  onToggleFavorite,
  isFavorite = false,
}) => {
  if (!station) return null;

  const isOperational = station.OperationalStatus?.IsOperational ?? 
                       station.StatusType?.IsOperational ?? 
                       true;

  const getChargerType = (connection: any) => {
    const powerKW = connection.PowerKW || 0;
    const level = connection.Level?.Title || '';
    
    if (powerKW >= 50) return { type: 'DC Fast', variant: 'default' as const };
    if (powerKW >= 22) return { type: 'AC Fast', variant: 'secondary' as const };
    if (level.includes('3')) return { type: 'DC Fast', variant: 'default' as const };
    if (level.includes('2')) return { type: 'AC Standard', variant: 'outline' as const };
    return { type: 'AC Slow', variant: 'outline' as const };
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto energy-glow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {station.AddressInfo.Title || 'Charging Station'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                isOperational ? 'bg-secondary' : 'bg-destructive'
              }`} />
              {isOperational ? 'Operational' : 'Status Unknown'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(station.ID)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 fill-current text-accent" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Address Section */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </h3>
            <div className="text-sm text-muted-foreground pl-6">
              <p>{station.AddressInfo.AddressLine1}</p>
              <p>
                {station.AddressInfo.Town}
                {station.AddressInfo.StateOrProvince && `, ${station.AddressInfo.StateOrProvince}`}
                {station.AddressInfo.Postcode && ` ${station.AddressInfo.Postcode}`}
              </p>
            </div>
          </div>

          <Separator />

          {/* Charging Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Charging Options
            </h3>
            
            {station.NumberOfPoints && (
              <div className="text-sm">
                <span className="font-medium">Total Charging Points: </span>
                <Badge variant="secondary">{station.NumberOfPoints}</Badge>
              </div>
            )}

            {Array.isArray(station.Connections) && station.Connections.length > 0 ? (
              <div className="space-y-3">
                {station.Connections.map((connection, index) => {
                  const chargerInfo = getChargerType(connection);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={chargerInfo.variant}>
                            {chargerInfo.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {connection.ConnectionType?.Title || 'Unknown Type'}
                          </span>
                        </div>
                        {connection.ConnectionType?.FormalName && (
                          <p className="text-xs text-muted-foreground">
                            {connection.ConnectionType.FormalName}
                          </p>
                        )}
                        {connection.Quantity && connection.Quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            Quantity: {connection.Quantity}
                          </p>
                        )}
                      </div>
                      {connection.PowerKW && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {connection.PowerKW}kW
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                No detailed charging information available
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Additional Info
            </h3>
            
            <div className="space-y-2 text-sm">
              {station.UsageType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access:</span>
                  <span>{station.UsageType.Title}</span>
                </div>
              )}
              
              {station.OperatorInfo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operator:</span>
                  <span>{station.OperatorInfo.Title}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Station ID:</span>
                <span className="font-mono text-xs">{station.ID}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1 energy-flow">
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" className="flex-1">
              <Wifi className="h-4 w-4 mr-2" />
              Check Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationDetailPanel;