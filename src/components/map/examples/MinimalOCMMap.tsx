import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ErrorBoundary } from '@/components/map/ErrorBoundary';

// Fix Leaflet default marker assets in React environments
// Ref: https://github.com/Leaflet/Leaflet/issues/4968
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(delete (L.Icon.Default.prototype as any)._getIconUrl);
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface OCMStation {
  ID?: number;
  UUID?: string;
  AddressInfo?: {
    Title?: string;
    AddressLine1?: string;
    Town?: string;
    Latitude?: number | string;
    Longitude?: number | string;
  };
  Connections?: Array<unknown>;
}

const createStationIcon = () =>
  L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="background-color: #10b981; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
        <span style="color:white;font-size:12px;line-height:1">⚡</span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });

interface MinimalOCMMapProps {
  center?: [number, number];
  radiusKm?: number;
}

const MinimalOCMMap: React.FC<MinimalOCMMapProps> = ({
  center = [28.6139, 77.209], // Delhi default
  radiusKm = 20,
}) => {
  const [stations, setStations] = useState<OCMStation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStations() {
      try {
        setError(null);
        const [lat, lon] = center;
        const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=${radiusKm}&distanceunit=KM&maxresults=50&key=24238d0e-f194-446c-8178-b9888dd34f7f`;
        console.log('[MinimalOCMMap] fetching', url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OCM HTTP ${res.status}`);
        const data: OCMStation[] = await res.json();
        if (!cancelled) {
          console.log('[MinimalOCMMap] received', Array.isArray(data) ? data.length : 'non-array');
          setStations(Array.isArray(data) ? data : []);
        }
      } catch (e: unknown) {
        console.error('[MinimalOCMMap] fetch error', e);
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load stations');
      }
    }

    loadStations();
    return () => {
      cancelled = true;
    };
  }, [center, radiusKm]);

  return (
    <div className="w-full h-[480px] rounded-lg overflow-hidden border">
      <ErrorBoundary
        fallback={
          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="text-center">
              <p className="font-medium">Map failed to load</p>
              <p className="text-sm text-muted-foreground">Please reload the page.</p>
            </div>
          </div>
        }
      >
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          {/* Use OpenStreetMap tiles for the basemap. OCM is ONLY the data source. */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />

          {Array.isArray(stations) &&
            stations.map((station, idx) => {
              const latRaw = station?.AddressInfo?.Latitude;
              const lonRaw = station?.AddressInfo?.Longitude;
              const lat = typeof latRaw === 'string' ? Number(latRaw) : latRaw;
              const lon = typeof lonRaw === 'string' ? Number(lonRaw) : lonRaw;
              const title = station?.AddressInfo?.Title || 'Unknown Station';

              console.log('[MinimalOCMMap] station', idx, { title, lat, lon });

              if (typeof lat !== 'number' || typeof lon !== 'number' || Number.isNaN(lat) || Number.isNaN(lon)) {
                console.warn('[MinimalOCMMap] skip invalid coords', { title, lat, lon });
                return null;
              }

              return (
                <Marker key={station.ID ?? idx} position={[lat, lon]} icon={createStationIcon()}>
                  <Popup>
                    <h3>{title}</h3>
                    <p>{station?.AddressInfo?.AddressLine1 || 'No address available'}</p>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </ErrorBoundary>

      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-card/90 border rounded p-2 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default MinimalOCMMap;
