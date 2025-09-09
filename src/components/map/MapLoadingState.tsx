import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, AlertCircle, RefreshCw, Wifi } from 'lucide-react';

interface MapLoadingStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  stationCount?: number;
}

export const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  stationCount = 0
}) => {
  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
        <Card className="p-6 energy-glow">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="h-12 w-12 mx-auto electric-pulse">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Loading Map Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fetching charging stations...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    const isNetworkError = error.toLowerCase().includes('fetch') || error.toLowerCase().includes('network');
    const isCorsError = error.toLowerCase().includes('cors');
    
    return (
      <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10 p-4">
        <Card className="max-w-md w-full">
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              {isNetworkError ? (
                <Wifi className="h-6 w-6 text-destructive" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                {isNetworkError ? 'Connection Failed' : 'Map Error'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isCorsError 
                  ? 'API access blocked. Using fallback data.'
                  : isNetworkError
                  ? 'Unable to fetch charging station data. Please check your connection.'
                  : error
                }
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (stationCount === 0) {
    return (
      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4">
        <Card className="max-w-md w-full">
          <div className="p-6 text-center space-y-4">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">No Stations Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching a different location or adjusting your filters.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};