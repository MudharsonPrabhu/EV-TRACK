// Local Storage utilities for caching and favorites

export interface CachedStationData {
  stations: any[];
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

const FAVORITES_KEY = 'ev_tracker_favorites';
const CACHE_KEY = 'ev_tracker_stations_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Favorites Management
export const getFavorites = (): number[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
};

export const addToFavorites = (stationId: number): void => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(stationId)) {
      favorites.push(stationId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error);
  }
};

export const removeFromFavorites = (stationId: number): void => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(id => id !== stationId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
  }
};

export const isFavorite = (stationId: number): boolean => {
  return getFavorites().includes(stationId);
};

// Stations Cache Management
export const getCachedStations = (location: { latitude: number; longitude: number }): any[] | null => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;

    const cached: CachedStationData = JSON.parse(stored);
    const now = Date.now();

    // Check if cache is expired
    if (now - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if location is similar (within ~1km)
    const distance = getDistance(location, cached.location);
    if (distance > 1) {
      return null;
    }

    return cached.stations;
  } catch (error) {
    console.error('Error reading cached stations:', error);
    return null;
  }
};

export const setCachedStations = (stations: any[], location: { latitude: number; longitude: number }): void => {
  try {
    const cacheData: CachedStationData = {
      stations,
      timestamp: Date.now(),
      location,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching stations:', error);
  }
};

export const clearStationsCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing stations cache:', error);
  }
};

// Helper function to calculate distance between two points
const getDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Settings Management
export const getUserSettings = () => {
  try {
    const stored = localStorage.getItem('ev_tracker_settings');
    return stored ? JSON.parse(stored) : {
      defaultLocation: { latitude: 13.0827, longitude: 80.2707 },
      preferredDistance: 10,
      preferredConnectorTypes: ['all'],
      autoRefresh: true,
    };
  } catch (error) {
    console.error('Error reading user settings:', error);
    return {};
  }
};

export const saveUserSettings = (settings: any): void => {
  try {
    localStorage.setItem('ev_tracker_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
};