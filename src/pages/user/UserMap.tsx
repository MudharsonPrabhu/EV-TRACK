import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, MapPin, Navigation, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChargingStation, SearchLocation } from '@/types/charging-station';
import { ErrorBoundary } from '@/components/map/ErrorBoundary';

// Fix Leaflet default marker icons
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch (e) {
  console.warn('Leaflet icon setup failed:', e);
}

// Create simple charging station marker
const createStationIcon = (isAvailable: boolean = true) => {
  try {
    const color = isAvailable ? '#10b981' : '#ef4444';
    return L.divIcon({
      className: 'charging-station-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="color: white; font-size: 12px; line-height: 1;">⚡</span>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });
  } catch (e) {
    console.warn('Custom icon creation failed, using default:', e);
    return new L.Icon.Default();
  }
};

const UserMap: React.FC = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<SearchLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);

  // Get user location and fetch stations
  const getCurrentLocationAndFetchStations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's current location
      const location = await new Promise<SearchLocation>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Default to Delhi, India if location access denied
            resolve({
              latitude: 28.6139,
              longitude: 77.2090,
            });
          }
        );
      });

      setCurrentLocation(location);
      setMapCenter([location.latitude, location.longitude]);

      console.log('Fetching stations for location:', location);
      // Fetch stations from OpenChargeMap API - using environment variable for API key
      const response = await fetch(
        `https://api.openchargemap.io/v3/poi/?output=json&latitude=${location.latitude}&longitude=${location.longitude}&distance=20&distanceunit=KM&maxresults=50&key=24238d0e-f194-446c-8178-b9888dd34f7f`
      );

      console.log('OpenChargeMap API response status:', response.status);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('OpenChargeMap raw data:', rawData.length, 'stations received');
      
      // Transform API response to our format
      const transformedStations: ChargingStation[] = rawData.map((station: any) => ({
        id: station.ID || Math.random(),
        uuid: station.UUID || `ocm-${station.ID}`,
        addressInfo: {
          title: station.AddressInfo?.Title || "Unknown Station",
          addressLine1: station.AddressInfo?.AddressLine1 || "Address Not Available",
          town: station.AddressInfo?.Town || "Unknown",
          stateOrProvince: station.AddressInfo?.StateOrProvince || "Unknown",
          postcode: station.AddressInfo?.Postcode || "Unknown",
          country: {
            title: station.AddressInfo?.Country?.Title || "Unknown Country"
          },
          latitude: parseFloat(station.AddressInfo?.Latitude) || 0,
          longitude: parseFloat(station.AddressInfo?.Longitude) || 0,
          distance: station.AddressInfo?.Distance ? parseFloat(station.AddressInfo.Distance) : undefined
        },
        connections: (station.Connections || []).map((conn: any) => ({
          id: conn.ID || Math.random(),
          connectionTypeID: conn.ConnectionTypeID || 0,
          connectionType: {
            title: conn.ConnectionType?.Title || "Unknown Type",
            formalName: conn.ConnectionType?.FormalName || "Unknown"
          },
          statusType: {
            title: conn.StatusType?.Title || "Unknown Status",
            isOperational: conn.StatusType?.IsOperational !== false
          },
          powerKW: conn.PowerKW ? parseFloat(conn.PowerKW) : undefined,
          quantity: conn.Quantity ? parseInt(conn.Quantity) : undefined
        })),
        statusType: {
          title: station.StatusType?.Title || "Unknown Status",
          isOperational: station.StatusType?.IsOperational !== false
        },
        operatorInfo: station.OperatorInfo?.Title ? {
          title: station.OperatorInfo.Title,
          websiteURL: station.OperatorInfo.WebsiteURL
        } : undefined,
        dateLastStatusUpdate: station.DateLastStatusUpdate || undefined
      })).filter((station: ChargingStation) => 
        station.addressInfo.latitude !== 0 && station.addressInfo.longitude !== 0
      );

      setStations(transformedStations);
      console.log('Transformed stations:', transformedStations.length, 'valid stations');
      
      toast({
        title: "Stations loaded",
        description: `Found ${transformedStations.length} charging stations nearby`,
      });
    } catch (err) {
      console.error('Error in getCurrentLocationAndFetchStations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stations';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initialize on component mount
  useEffect(() => {
    getCurrentLocationAndFetchStations();
  }, [getCurrentLocationAndFetchStations]);

  // Handle station selection
  const handleStationSelect = useCallback((station: ChargingStation) => {
    setSelectedStation(station);
    setMapCenter([station.addressInfo.latitude, station.addressInfo.longitude]);
  }, []);

  // Handle navigation to station
  const handleNavigate = useCallback((station: ChargingStation) => {
    if (currentLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${station.addressInfo.latitude},${station.addressInfo.longitude}`;
      window.open(url, '_blank');
    }
  }, [currentLocation]);

  // Format connector types for display
  const formatConnectors = (connections: ChargingStation['connections']) => {
    const types = [...new Set(connections.map(conn => conn.connectionType.title))];
    return types.slice(0, 3).join(', ') + (types.length > 3 ? '...' : '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Charging Station Map</h1>
        <p className="text-muted-foreground">
          Find and navigate to EV charging stations near you
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content - Map and Station List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card className="energy-glow h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-primary" />
                Interactive Map
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Real-time charging station locations from OpenChargeMap
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[520px] p-0">
              <div className="h-full w-full relative rounded-lg overflow-hidden">
                  <ErrorBoundary
                    fallback={
                      <div className="h-full w-full flex items-center justify-center p-6">
                        <div className="text-center">
                          <p className="font-medium">Map failed to load</p>
                          <p className="text-sm text-muted-foreground">Please try again or reload the page.</p>
                        </div>
                      </div>
                    }
                  >
                    <MapContainer
                      center={mapCenter}
                      zoom={12}
                      style={{ height: '100%', width: '100%' }}
                      className="rounded-lg"
                      key={`${mapCenter[0]}-${mapCenter[1]}`}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                      />

                      {stations.map((station, idx) => {
                        const lat = station.addressInfo.latitude;
                        const lon = station.addressInfo.longitude;
                        const title = station.addressInfo.title;
                        
                        console.log('[UserMap] rendering station', idx, { id: station.id, title, lat, lon });
                        
                        // Skip stations with invalid coordinates
                        if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
                          console.warn('[UserMap] skipped station due to invalid coords', { title, lat, lon });
                          return null;
                        }

                        return (
                          <Marker
                            key={station.id || idx}
                            position={[lat, lon]}
                            icon={createStationIcon(station.statusType?.isOperational !== false)}
                            eventHandlers={{
                              click: () => handleStationSelect(station),
                            }}
                          >
                            <Popup>
                              <div className="p-2 min-w-[200px] space-y-2">
                                <h3 className="font-semibold text-sm">{title}</h3>
                                
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{station.addressInfo.addressLine1}</span>
                                </div>

                                {station.connections.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs">
                                      <Zap className="h-3 w-3 text-yellow-500" />
                                      <span>{formatConnectors(station.connections)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {station.connections.length} charging point{station.connections.length !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                )}

                                <Badge
                                  variant={station.statusType?.isOperational !== false ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {station.statusType?.title || 'Unknown Status'}
                                </Badge>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </ErrorBoundary>
                
                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-[1000]">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading stations...</p>
                    </div>
                  </div>
                )}

                {/* No stations overlay */}
                {!loading && stations.length === 0 && !error && (
                  <div className="absolute top-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border z-[1000]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">No charging stations found</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Map will show your location. Try expanding the search area.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station List Panel */}
        <div className="lg:col-span-1">
          <Card className="energy-glow h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Charging Stations
              </CardTitle>
              <CardDescription>
                {stations.length} station{stations.length !== 1 ? 's' : ''} found nearby
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                <div className="space-y-3 p-4">
                  {stations.map((station) => (
                    <Card 
                      key={station.id}
                      className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                        selectedStation?.id === station.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleStationSelect(station)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            {station.addressInfo.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{station.addressInfo.addressLine1}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {station.addressInfo.town}, {station.addressInfo.stateOrProvince}
                          </div>
                          {station.addressInfo.distance && (
                            <div className="text-xs text-muted-foreground">
                              {station.addressInfo.distance.toFixed(1)} km away
                            </div>
                          )}
                        </div>
                        
                        {station.connections.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              <span>{formatConnectors(station.connections)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {station.connections.length} charging point{station.connections.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={station.statusType?.isOperational !== false ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {station.statusType?.title || 'Unknown'}
                          </Badge>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(station);
                            }}
                            className="text-xs"
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            Navigate
                          </Button>
                        </div>
                        
                        {station.operatorInfo && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Operator: {station.operatorInfo.title}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {stations.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No charging stations found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different location</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserMap;