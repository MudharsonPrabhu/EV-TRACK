import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, Battery, Clock, Zap, Flag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationSearchInput } from '@/components/ui/location-search-input';
import { useAISettings } from '@/hooks/useAISettings';
import { openRouterService } from '@/services/openRouter';
import { OpenChargeMapService } from '@/services/openChargeMapApi';
import { useToast } from '@/hooks/use-toast';

interface TripStop {
  stop_number: number;
  type: 'ChargingStop' | 'Destination';
  location_name: string;
  address?: string;
  reason?: string;
  charge_to_percent?: number;
  estimated_charge_time_minutes?: number;
  estimated_arrival_battery_percent?: number;
}

interface LocationResult {
  name: string;
  lat: number;
  lon: number;
}

const TripPlanner: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routePlan, setRoutePlan] = useState<TripStop[]>([]);
  const [fromLocation, setFromLocation] = useState<LocationResult | null>(null);
  const [toLocation, setToLocation] = useState<LocationResult | null>(null);
  const [formData, setFormData] = useState({
    currentBattery: '',
    vehicleRange: ''
  });
  
  const { settings } = useAISettings();
  const { toast } = useToast();
  const openChargeMapService = OpenChargeMapService.getInstance();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRouteData = async (from: string, to: string) => {
    // Use OpenRouteService for routing (free API)
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?start=${from}&end=${to}`, {
      headers: {
        'Authorization': '5b3ce3597851110001cf6248a4a0c35b3d434a6f9e7c8c8d2f8c4c8a' // Public demo key
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get route data');
    }
    
    const data = await response.json();
    return {
      distance: data.features[0].properties.summary.distance / 1000, // Convert to km
      duration: data.features[0].properties.summary.duration,
      coordinates: data.features[0].geometry.coordinates
    };
  };

  const constructLLMPrompt = (routeData: any, stations: any[], formData: any) => {
    const stationsJson = stations.map(station => ({
      Title: station.addressInfo.title,
      AddressLine1: station.addressInfo.addressLine1,
      Latitude: station.addressInfo.latitude,
      Longitude: station.addressInfo.longitude,
      Connections: station.connections.map((conn: any) => ({
        PowerKW: conn.powerKW || 0,
        Quantity: conn.quantity || 1
      }))
    }));

    return `You are an expert EV Trip Planner AI. Your task is to create an optimal, multi-stop charging plan for an electric vehicle journey.

Trip Details:
Origin: ${formData.from}
Destination: ${formData.to}
Total Distance: ${routeData.distance.toFixed(1)} km

Vehicle Status:
Make/Model: Generic EV
Current Battery: ${formData.currentBattery}%
Maximum Range on Full Charge: ${formData.vehicleRange} km

Available Charging Stations Along Route:
${JSON.stringify(stationsJson, null, 2)}

Your Task:
Generate the most efficient charging plan to reach the destination without running out of battery.
- Prioritize fewer, faster charging stops over many slow ones
- Assume a buffer and recommend charging when the battery is projected to fall below 20%
- Estimate charging time at each stop to reach ~80% battery
- For each stop, provide a brief reason for your choice

Output Format:
Return your response ONLY as a valid JSON array of objects. Do not include any other text, explanation, or markdown formatting. The structure should be:
[
{
"stop_number": 1,
"type": "ChargingStop", 
"location_name": "Name of the Charging Station",
"address": "Brief address of the station",
"reason": "Your brief reason for choosing this stop.",
"charge_to_percent": 80,
"estimated_charge_time_minutes": 35
},
{
"stop_number": 2,
"type": "Destination",
"location_name": "${formData.to}",
"estimated_arrival_battery_percent": 45
}
]`;
  };

  const planTrip = async () => {
    if (!fromLocation || !toLocation || !formData.currentBattery || !formData.vehicleRange) {
      toast({
        title: "Missing Information",
        description: "Please fill in all trip details.",
        variant: "destructive"
      });
      return;
    }

    if (!settings.openRouterApiKey || !settings.selectedModel) {
      toast({
        title: "AI Settings Required",
        description: "Please configure your OpenRouter API key and model in Settings.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoutePlan([]);

    try {
      // Step 1: Get route data using selected locations
      const routeData = {
        distance: calculateDistance(fromLocation.lat, fromLocation.lon, toLocation.lat, toLocation.lon),
        duration: 0, // Will be estimated
        coordinates: [[fromLocation.lon, fromLocation.lat], [toLocation.lon, toLocation.lat]]
      };

      // Step 2: Find charging stations along route
      const midPoint = {
        latitude: (fromLocation.lat + toLocation.lat) / 2,
        longitude: (fromLocation.lon + toLocation.lon) / 2
      };

      const stations = await openChargeMapService.searchStations(midPoint, {
        connectorTypes: [],
        availableOnly: true,
        maxDistance: Math.max(50, routeData.distance / 2), // Search wider area for longer trips
        minPowerKW: 22
      });

      // Step 3: Construct LLM prompt
      const prompt = constructLLMPrompt(routeData, stations, { 
        ...formData, 
        from: fromLocation.name, 
        to: toLocation.name 
      });

      // Step 5: Call OpenRouter API
      const response = await openRouterService.generateCompletion(
        settings.selectedModel.id,
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, max_tokens: 2000 }
      );

      // Step 6: Parse response
      try {
        const parsedPlan = JSON.parse(response);
        if (Array.isArray(parsedPlan)) {
          setRoutePlan(parsedPlan);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', response);
        throw new Error('AI returned invalid format. Please try again.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Trip Planning Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const renderRouteSuggestions = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto mb-4 animate-spin">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">🧠 Planning your optimal route...</h3>
          <p className="text-muted-foreground">
            Analyzing charging stations and calculating the best stops for your journey.
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="bg-destructive/20 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium mb-2">Planning Failed</h3>
          <p className="text-muted-foreground">
            {error}
          </p>
        </div>
      );
    }

    if (routePlan.length > 0) {
      return (
        <div className="space-y-4">
          {routePlan.map((stop, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${stop.type === 'Destination' ? 'bg-accent/20' : 'bg-primary/20'}`}>
                  {stop.type === 'Destination' ? 
                    <Flag className="h-5 w-5 text-accent" /> : 
                    <Zap className="h-5 w-5 text-primary" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                      Stop {stop.stop_number}
                    </span>
                    <h4 className="font-medium">{stop.location_name}</h4>
                  </div>
                  {stop.address && (
                    <p className="text-sm text-muted-foreground mb-2">{stop.address}</p>
                  )}
                  {stop.reason && (
                    <p className="text-sm text-muted-foreground mb-2 italic">{stop.reason}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {stop.estimated_charge_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Charge time: {stop.estimated_charge_time_minutes} min</span>
                      </div>
                    )}
                    {stop.charge_to_percent && (
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        <span>Charge to: {stop.charge_to_percent}%</span>
                      </div>
                    )}
                    {stop.estimated_arrival_battery_percent && (
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        <span>Arrival battery: {stop.estimated_arrival_battery_percent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4 electric-pulse">
          <Zap className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Ready to Plan</h3>
        <p className="text-muted-foreground">
          Enter your trip details and click "Plan Route" to get AI-powered charging recommendations.
        </p>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Trip Planner</h1>
        <p className="text-muted-foreground">
          Plan your EV journey with optimal charging stops
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Route className="h-5 w-5 mr-2 text-primary" />
              Plan Your Route
            </CardTitle>
            <CardDescription>
              Enter your trip details for optimal route planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationSearchInput
              label="From"
              placeholder="Starting location"
              onLocationSelect={setFromLocation}
              value={fromLocation}
            />
            
            <LocationSearchInput
              label="To"
              placeholder="Destination"
              onLocationSelect={setToLocation}
              value={toLocation}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="battery">Current Battery %</Label>
                <div className="relative">
                  <Battery className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="battery" 
                    placeholder="78%" 
                    className="pl-10"
                    value={formData.currentBattery}
                    onChange={(e) => handleInputChange('currentBattery', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="range">Vehicle Range (km)</Label>
                <Input 
                  id="range" 
                  placeholder="350"
                  value={formData.vehicleRange}
                  onChange={(e) => handleInputChange('vehicleRange', e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full energy-flow" 
              onClick={planTrip}
              disabled={isLoading}
            >
              <Route className="h-4 w-4 mr-2" />
              {isLoading ? 'Planning Route...' : 'Plan Route'}
            </Button>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle>Route Suggestions</CardTitle>
            <CardDescription>
              AI-generated optimal routes with charging stops
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderRouteSuggestions()}
          </CardContent>
        </Card>
      </div>

      <Card className="energy-glow">
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>
            Your saved and completed journey plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="bg-primary/20 p-3 rounded-full">
                <Route className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Downtown to Airport</h4>
                <p className="text-sm text-muted-foreground">45 km • 2 charging stops • Completed yesterday</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                1h 20m
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Route className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">City Center to Beach Resort</h4>
                <p className="text-sm text-muted-foreground">120 km • 1 charging stop • Saved for weekend</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                2h 45m
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="bg-accent/20 p-3 rounded-full">
                <Route className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Home to Mountain Lodge</h4>
                <p className="text-sm text-muted-foreground">200 km • 3 charging stops • Completed last week</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                4h 15m
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripPlanner;