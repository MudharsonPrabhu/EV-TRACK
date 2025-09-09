import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertCircle, Zap, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import StationDetailPanel from './StationDetailPanel';
import SearchAndFilters, { SearchFilters } from './SearchAndFilters';
import { getCachedStations, setCachedStations, getFavorites, addToFavorites, removeFromFavorites, isFavorite } from '@/utils/localStorage';
import { ErrorBoundary } from './ErrorBoundary';
import { useMapSettings } from '@/hooks/useMapSettings';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
  }>;
  OperationalStatus?: {
    IsOperational: boolean;
    Title: string;
  };
  StatusType?: {
    IsOperational: boolean;
    Title: string;
  };
}

const InteractiveMap: React.FC = () => {
  const { settings: mapSettings, loading: mapLoading } = useMapSettings();
  const [stations, setStations] = useState<StationData[]>([]);
  const [filteredStations, setFilteredStations] = useState<StationData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    fastChargingOnly: false,
    availableOnly: false,
    connectorType: 'all',
    maxDistance: 10,
  });

  const provider = mapSettings?.provider || 'openstreetmap';
  const mapApiKey = mapSettings?.api_key || null;

  useEffect(() => {
    console.log('[InteractiveMap] map settings:', mapSettings);
  }, [mapSettings]);

  // Chennai coordinates
  const center: [number, number] = [13.0827, 80.2707];
  const zoom = 13;

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Apply filters whenever stations or filters change
  useEffect(() => {
    let filtered = [...stations];

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(station =>
        station.AddressInfo.Title?.toLowerCase().includes(searchLower) ||
        station.AddressInfo.Town?.toLowerCase().includes(searchLower) ||
        station.AddressInfo.AddressLine1?.toLowerCase().includes(searchLower)
      );
    }

    // Fast charging filter
    if (filters.fastChargingOnly) {
      filtered = filtered.filter(station =>
        station.Connections?.some(conn => (conn.PowerKW || 0) >= 50)
      );
    }

    // Available only filter
    if (filters.availableOnly) {
      filtered = filtered.filter(station =>
        station.OperationalStatus?.IsOperational !== false &&
        station.StatusType?.IsOperational !== false
      );
    }

    // Connector type filter
    if (filters.connectorType !== 'all') {
      const connectorMap: Record<string, string[]> = {
        'ccs': ['CCS', 'Combined Charging System'],
        'chademo': ['CHAdeMO'],
        'type2': ['Type 2', 'Mennekes'],
        'type1': ['Type 1', 'J1772'],
        'tesla': ['Tesla'],
      };
      
      const targetConnectors = connectorMap[filters.connectorType] || [];
      filtered = filtered.filter(station =>
        station.Connections?.some(conn =>
          targetConnectors.some(target =>
            conn.ConnectionType?.Title?.includes(target) ||
            conn.ConnectionType?.FormalName?.includes(target)
          )
        )
      );
    }

    setFilteredStations(filtered);
  }, [stations, filters]);

  const fetchStations = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      
      // Try to use cached data first
      if (useCache) {
        const cached = getCachedStations({ latitude: center[0], longitude: center[1] });
        if (cached) {
          setStations(cached);
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch(
        `https://api.openchargemap.io/v3/poi/?output=json&latitude=13.0827&longitude=80.2707&distance=10&distanceunit=KM&maxresults=20`,
        {
          headers: {
            'X-API-Key': mapApiKey || '24238d0e-f194-446c-8178-b9888dd34f7f',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Safely parse results
      if (Array.isArray(data)) {
        setStations(data);
        // Cache the successful response
        setCachedStations(data, { latitude: center[0], longitude: center[1] });
      } else {
        setStations([]);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
      
      // Try to use cached data as fallback
      const cached = getCachedStations({ latitude: center[0], longitude: center[1] });
      if (cached) {
        setStations(cached);
        setError('Using cached data - unable to fetch latest updates');
      } else {
        setError('Unable to load charging stations. Please check your connection and try again.');
        setStations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStations(false); // Force fresh data on search
  };

  const handleStationClick = (station: StationData) => {
    setSelectedStation(station);
  };

  const handleToggleFavorite = (stationId: number) => {
    if (isFavorite(stationId)) {
      removeFromFavorites(stationId);
      setFavorites(prev => prev.filter(id => id !== stationId));
    } else {
      addToFavorites(stationId);
      setFavorites(prev => [...prev, stationId]);
    }
  };

  // Initial load - wait for map settings to be loaded
  useEffect(() => {
    if (!mapLoading) {
      fetchStations();
    }
  }, [mapLoading]);

  if (loading || mapLoading) {
    return (
      <div className="space-y-4">
        <div className="h-96 w-full rounded-lg flex items-center justify-center bg-muted/50">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              {mapLoading ? 'Loading map configuration...' : 'Loading stations...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback component for when stations fail to load
  const MapFallback = () => (
    <div className="space-y-4">
      {error && (
        <Alert className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStations(false)}
              disabled={loading}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="h-96 w-full rounded-lg flex items-center justify-center bg-muted/50">
        <div className="text-center space-y-4">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium">No stations found</p>
            <p className="text-xs text-muted-foreground">
              Unable to load charging stations. Please try again later.
            </p>
          </div>
          <Button onClick={() => fetchStations(false)} variant="outline" size="sm">
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <SearchAndFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        isLoading={loading}
        activeFiltersCount={filteredStations.length}
      />

      {error && (
        <Alert className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStations(false)}
              disabled={loading}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <ErrorBoundary fallback={<MapFallback />}>
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          {Array.isArray(filteredStations) && filteredStations.length > 0 ? (
            <>
              {/* Render map based on provider */}
              {provider === 'openstreetmap' && (
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
                  
                  {filteredStations.map((station) => {
                    if (!station?.AddressInfo?.Latitude || !station?.AddressInfo?.Longitude) {
                      return null;
                    }

                    const position: [number, number] = [
                      station.AddressInfo.Latitude,
                      station.AddressInfo.Longitude,
                    ];

                    return (
                      <Marker 
                        key={station.ID} 
                        position={position}
                        eventHandlers={{
                          click: () => handleStationClick(station),
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px] space-y-2">
                            <h3 className="font-semibold text-sm">
                              {station.AddressInfo?.Title || 'Charging Station'}
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStationClick(station)}
                              className="w-full"
                            >
                              View Details
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )}

              {/* Fallback for missing API key or configuration */}
              {provider !== 'openstreetmap' && (
                <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center space-y-4 p-8">
                    <div className="bg-destructive/20 p-4 rounded-full w-fit mx-auto">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">⚠️ Map not configured</h3>
                      <p className="text-sm text-muted-foreground">
                        Only OpenStreetMap is supported. Please use OpenStreetMap provider.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center space-y-4 p-8">
                {!mapSettings ? (
                  <>
                    <div className="bg-destructive/20 p-4 rounded-full w-fit mx-auto">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">⚠️ Map not configured</h3>
                      <p className="text-sm text-muted-foreground">
                        Please contact admin to set up map provider and API key.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium">No stations found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search filters or refresh the page
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>

      <StationDetailPanel
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedStation ? isFavorite(selectedStation.ID) : false}
      />
    </div>
  );
};

export default InteractiveMap;