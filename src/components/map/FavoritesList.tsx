import React, { useEffect, useState } from 'react';
import { Star, MapPin, Zap, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFavorites, removeFromFavorites } from '@/utils/localStorage';

interface FavoriteStation {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
  };
  Connections?: Array<{
    PowerKW?: number;
    ConnectionType?: {
      Title: string;
    };
  }>;
  OperationalStatus?: {
    IsOperational: boolean;
  };
}

interface FavoritesListProps {
  onStationSelect?: (stationId: number) => void;
  stations?: FavoriteStation[];
}

const FavoritesList: React.FC<FavoritesListProps> = ({ onStationSelect, stations = [] }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    // Filter stations to show only favorites
    if (stations.length > 0) {
      const filtered = stations.filter(station => favorites.includes(station.ID));
      setFavoriteStations(filtered);
    }
  }, [favorites, stations]);

  const handleRemoveFavorite = (stationId: number) => {
    removeFromFavorites(stationId);
    setFavorites(prev => prev.filter(id => id !== stationId));
  };

  const getMaxPower = (connections?: FavoriteStation['Connections']) => {
    if (!connections || connections.length === 0) return null;
    return Math.max(...connections.map(conn => conn.PowerKW || 0));
  };

  if (favorites.length === 0) {
    return (
      <Card className="energy-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Favorite Stations
          </CardTitle>
          <CardDescription>
            Your saved charging stations will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No favorite stations yet. Click the star icon on any station to save it here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="energy-glow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Favorite Stations
          </span>
          <Badge variant="secondary">{favorites.length}</Badge>
        </CardTitle>
        <CardDescription>
          Your saved charging stations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favoriteStations.length > 0 ? (
            favoriteStations.map((station) => {
              const maxPower = getMaxPower(station.Connections);
              const isOperational = station.OperationalStatus?.IsOperational !== false;
              
              return (
                <div
                  key={station.ID}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {station.AddressInfo.Title}
                      </h4>
                      <div className={`w-2 h-2 rounded-full ${
                        isOperational ? 'bg-secondary' : 'bg-destructive'
                      }`} />
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {station.AddressInfo.AddressLine1}, {station.AddressInfo.Town}
                      </span>
                    </div>
                    
                    {maxPower && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          Up to {maxPower}kW
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onStationSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStationSelect(station.ID)}
                      >
                        <Navigation className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(station.ID)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Star className="h-3 w-3 fill-current" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Favorite stations not found in current search results.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try expanding your search area to see them.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoritesList;