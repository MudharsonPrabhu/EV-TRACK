import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { ChargingStation } from '@/types/charging-station';
import { MapPin, Zap, Clock } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create a default marker icon that works reliably
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom marker for charging stations
const createChargingStationIcon = (isAvailable: boolean) => {
  const color = isAvailable ? '#10b981' : '#ef4444';
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

interface ChargingStationMapProps {
  stations: ChargingStation[];
  center: [number, number];
  zoom: number;
  onStationClick?: (station: ChargingStation) => void;
}

const ChargingStationMapComponent: React.FC<ChargingStationMapProps> = ({
  stations,
  center, // Ignored - always use India center
  zoom,   // Ignored - always use zoom 5
  onStationClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Always center on India with zoom 5 as per requirements
  const fixedCenter: [number, number] = [20.5937, 78.9629];
  const fixedZoom = 5;

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        console.log('Cleaning up map instance');
        try {
          mapRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up map:', error);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Safely handle stations prop - ensure it's always an array
  const safeStations = useCallback(() => {
    try {
      if (!stations) return [];
      if (!Array.isArray(stations)) return [];
      return stations.filter(station => 
        station && 
        typeof station === 'object' && 
        station.addressInfo &&
        typeof station.addressInfo.latitude === 'number' &&
        typeof station.addressInfo.longitude === 'number' &&
        !isNaN(station.addressInfo.latitude) &&
        !isNaN(station.addressInfo.longitude)
      );
    } catch (error) {
      console.error('Error processing stations:', error);
      return [];
    }
  }, [stations]);

  const validStations = safeStations();

  // Don't render on server side
  if (!isClient) {
    return (
      <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative">
      <MapContainer
        center={fixedCenter}
        zoom={fixedZoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        ref={mapRef}
        preferCanvas={true}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={18}
        />
        
        {validStations.length > 0 ? (
          validStations.map((station, index) => {
            const position: [number, number] = [
              station.addressInfo.latitude,
              station.addressInfo.longitude,
            ];

            return (
              <Marker
                key={`station-${station.id || index}-${station.addressInfo.latitude}-${station.addressInfo.longitude}`}
                position={position}
                icon={defaultIcon}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent?.stopPropagation?.();
                    if (onStationClick && typeof onStationClick === 'function') {
                      onStationClick(station);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{station.addressInfo.title || 'Charging Station'}</strong>
                    {station.addressInfo.addressLine1 && (
                      <p>{station.addressInfo.addressLine1}</p>
                    )}
                    {station.addressInfo.town && (
                      <p>{station.addressInfo.town}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          // Show a test marker in the center of India when no stations
          <Marker
            position={fixedCenter}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Test Location</strong>
                <p>Center of India</p>
                <p>No charging stations available</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* No stations overlay */}
      {validStations.length === 0 && (
        <div className="absolute top-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">No charging stations available</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Test marker shown at center of India
          </p>
        </div>
      )}
    </div>
  );
};

const ChargingStationMap: React.FC<ChargingStationMapProps> = (props) => {
  return (
    <ErrorBoundary>
      <ChargingStationMapComponent {...props} />
    </ErrorBoundary>
  );
};

export default ChargingStationMap;