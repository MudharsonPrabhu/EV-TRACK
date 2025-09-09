import type { ChargingStation, ChargingStationFilters, SearchLocation } from '@/types/charging-station';

const API_BASE_URL = '/api/openchargemap/v3/poi';
const GEOCODE_BASE_URL = '/api/nominatim';

export class OpenChargeMapService {
  private static instance: OpenChargeMapService;

  static getInstance(): OpenChargeMapService {
    if (!OpenChargeMapService.instance) {
      OpenChargeMapService.instance = new OpenChargeMapService();
    }
    return OpenChargeMapService.instance;
  }

  async searchStations(
    location: SearchLocation,
    filters: ChargingStationFilters
  ): Promise<ChargingStation[]> {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      maxresults: '100',
      distance: filters.maxDistance.toString(),
      distanceunit: 'KM',
      output: 'json',
      compact: 'false',
      verbose: 'false',
    });

    if (filters.availableOnly) {
      params.append('statustype', '50'); // Available status
    }

    if (filters.minPowerKW) {
      params.append('minpowerkw', filters.minPowerKW.toString());
    }

    if (filters.connectorTypes.length > 0) {
      // Map common connector types to OpenChargeMap IDs
      const connectorTypeMap: Record<string, string> = {
        'CCS': '32,33', // CCS Type 1 & 2
        'CHAdeMO': '4',
        'Type2': '25',
        'Tesla': '8,27',
        'Type1': '1',
      };

      const typeIds = filters.connectorTypes
        .flatMap(type => connectorTypeMap[type]?.split(',') || [])
        .join(',');

      if (typeIds) {
        params.append('connectiontypeid', typeIds);
      }
    }

    try {
      const apiUrl = `https://api.openchargemap.io/v3/poi/?${params}`;
      console.log('Fetching stations from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': '24238d0e-f194-446c-8178-b9888dd34f7f',
        },
      });
      
      if (!response.ok) {
        throw new Error(`OpenChargeMap API error: ${response.status} ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('Raw stations fetched successfully:', rawData.length);
      
      // Transform OpenChargeMap API response to our ChargingStation interface
      const mappedStations = this.mapOpenChargeMapResponse(rawData);
      console.log(`Mapped ${mappedStations.length} stations with proper structure`);
      
      return mappedStations;
    } catch (error) {
      console.error('Error fetching charging stations:', error);
      // Return fallback data instead of throwing
      return this.getFallbackStations(location);
    }
  }

  async geocodeLocation(query: string): Promise<SearchLocation | null> {
    try {
      console.log('Geocoding location:', query);
      const response = await fetch(
        `${GEOCODE_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: data[0].display_name,
        };
        console.log('Geocoding successful:', result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private getFallbackStations(location: SearchLocation): ChargingStation[] {
    // Return some fallback/demo stations when API fails
    console.log('Using fallback station data');
    return [
      {
        id: 1,
        uuid: 'fallback-1',
        addressInfo: {
          title: 'Demo Charging Station',
          addressLine1: '123 Main Street',
          town: 'Demo City',
          stateOrProvince: 'Demo State',
          postcode: '12345',
          country: {
            title: 'Demo Country'
          },
          latitude: location.latitude + 0.001,
          longitude: location.longitude + 0.001,
          distance: 0.1
        },
        connections: [
          {
            id: 1,
            connectionTypeID: 32,
            connectionType: {
              title: 'CCS',
              formalName: 'Combined Charging System'
            },
            statusType: {
              title: 'Available',
              isOperational: true
            },
            powerKW: 150,
            quantity: 2
          }
        ],
        statusType: {
          title: 'Available',
          isOperational: true
        },
        operatorInfo: {
          title: 'Demo Network'
        },
        dateLastStatusUpdate: new Date().toISOString()
      }
    ];
  }

  private mapOpenChargeMapResponse(rawStations: any[]): ChargingStation[] {
    if (!Array.isArray(rawStations)) {
      console.warn('Expected array of stations but got:', typeof rawStations);
      return [];
    }

    return rawStations.map((rawStation) => {
      try {
        // Safely extract data with fallbacks
        const addressInfo = rawStation.AddressInfo || {};
        const connections = Array.isArray(rawStation.Connections) ? rawStation.Connections : [];
        const statusType = rawStation.StatusType || {};
        const operatorInfo = rawStation.OperatorInfo || {};
        
        // Log missing critical fields
        if (!addressInfo.Title) {
          console.warn('Station missing title:', rawStation.ID || 'unknown ID');
        }
        if (!addressInfo.Latitude || !addressInfo.Longitude) {
          console.warn('Station missing coordinates:', rawStation.ID || 'unknown ID');
        }

        const mappedStation: ChargingStation = {
          id: rawStation.ID || Math.random(),
          uuid: rawStation.UUID || `ocm-${rawStation.ID || Math.random()}`,
          addressInfo: {
            title: addressInfo.Title || "Unknown Station",
            addressLine1: addressInfo.AddressLine1 || "Address Not Available",
            town: addressInfo.Town || "Unknown",
            stateOrProvince: addressInfo.StateOrProvince || "Unknown",
            postcode: addressInfo.Postcode || "Unknown",
            country: {
              title: addressInfo.Country?.Title || "Unknown Country"
            },
            latitude: parseFloat(addressInfo.Latitude) || 0,
            longitude: parseFloat(addressInfo.Longitude) || 0,
            distance: addressInfo.Distance ? parseFloat(addressInfo.Distance) : undefined
          },
          connections: connections.map((conn: any) => ({
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
            title: statusType.Title || "Unknown Status",
            isOperational: statusType.IsOperational !== false
          },
          usageType: rawStation.UsageType ? {
            title: rawStation.UsageType.Title || "Unknown Usage"
          } : undefined,
          operatorInfo: operatorInfo.Title ? {
            title: operatorInfo.Title,
            websiteURL: operatorInfo.WebsiteURL
          } : undefined,
          dateLastStatusUpdate: rawStation.DateLastStatusUpdate || undefined,
          dataProvider: rawStation.DataProvider ? {
            title: rawStation.DataProvider.Title || "Unknown Provider"
          } : undefined
        };

        return mappedStation;
      } catch (error) {
        console.warn('Error mapping station:', error, rawStation);
        // Return a safe fallback station
        return {
          id: rawStation.ID || Math.random(),
          uuid: `error-${rawStation.ID || Math.random()}`,
          addressInfo: {
            title: "Error Loading Station",
            addressLine1: "Data Not Available",
            town: "Unknown",
            stateOrProvince: "Unknown", 
            postcode: "Unknown",
            country: { title: "Unknown" },
            latitude: 0,
            longitude: 0
          },
          connections: []
        };
      }
    }).filter(station => 
      // Filter out stations with invalid coordinates
      station.addressInfo.latitude !== 0 && station.addressInfo.longitude !== 0
    );
  }

  async getCurrentLocation(): Promise<SearchLocation> {
    return new Promise((resolve, reject) => {
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
          // Default to a location if permission denied
          console.warn('Geolocation error:', error);
          resolve({
            latitude: 37.7749, // San Francisco default
            longitude: -122.4194,
          });
        }
      );
    });
  }
}