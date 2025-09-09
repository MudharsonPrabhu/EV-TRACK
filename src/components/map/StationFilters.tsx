import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ChargingStationFilters } from '@/types/charging-station';
import { Filter, X } from 'lucide-react';

interface StationFiltersProps {
  filters: ChargingStationFilters;
  onFiltersChange: (filters: ChargingStationFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CONNECTOR_TYPES = [
  { id: 'CCS', label: 'CCS' },
  { id: 'CHAdeMO', label: 'CHAdeMO' },
  { id: 'Type2', label: 'Type 2' },
  { id: 'Tesla', label: 'Tesla' },
  { id: 'Type1', label: 'Type 1' },
];

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];

const StationFilters: React.FC<StationFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}) => {
  const handleConnectorToggle = (connectorType: string) => {
    const newConnectorTypes = filters.connectorTypes.includes(connectorType)
      ? filters.connectorTypes.filter(type => type !== connectorType)
      : [...filters.connectorTypes, connectorType];
    
    onFiltersChange({
      ...filters,
      connectorTypes: newConnectorTypes,
    });
  };

  const handleDistanceChange = (distance: number) => {
    onFiltersChange({
      ...filters,
      maxDistance: distance,
    });
  };

  const handleAvailableOnlyToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      availableOnly: checked,
    });
  };

  const handlePowerChange = (power: number[]) => {
    onFiltersChange({
      ...filters,
      minPowerKW: power[0],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      connectorTypes: [],
      availableOnly: false,
      maxDistance: 25,
      minPowerKW: 0,
    });
  };

  const hasActiveFilters = 
    filters.connectorTypes.length > 0 || 
    filters.availableOnly || 
    filters.maxDistance !== 25 || 
    (filters.minPowerKW && filters.minPowerKW > 0);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="energy-flow relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
            !
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="energy-glow w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="mt-2"
          >
            Clear All
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connector Types */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Connector Types</Label>
          <div className="flex flex-wrap gap-2">
            {CONNECTOR_TYPES.map((type) => (
              <Badge
                key={type.id}
                variant={filters.connectorTypes.includes(type.id) ? "default" : "outline"}
                className="cursor-pointer energy-flow"
                onClick={() => handleConnectorToggle(type.id)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Distance */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Max Distance: {filters.maxDistance}km
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {DISTANCE_OPTIONS.map((distance) => (
              <Button
                key={distance}
                variant={filters.maxDistance === distance ? "default" : "outline"}
                size="sm"
                onClick={() => handleDistanceChange(distance)}
                className="energy-flow"
              >
                {distance}km
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Min Power */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Min Power: {filters.minPowerKW || 0}kW
          </Label>
          <Slider
            value={[filters.minPowerKW || 0]}
            onValueChange={handlePowerChange}
            max={350}
            step={10}
            className="energy-flow"
          />
        </div>

        <Separator />

        {/* Available Only */}
        <div className="flex items-center justify-between">
          <Label htmlFor="available-only" className="text-sm font-medium">
            Available Only
          </Label>
          <Switch
            id="available-only"
            checked={filters.availableOnly}
            onCheckedChange={handleAvailableOnlyToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StationFilters;