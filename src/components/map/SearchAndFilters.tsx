import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface SearchFilters {
  searchTerm: string;
  fastChargingOnly: boolean;
  availableOnly: boolean;
  connectorType: string;
  maxDistance: number;
}

interface SearchAndFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
  activeFiltersCount?: number;
}

const connectorTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'ccs', label: 'CCS (Combined Charging System)' },
  { value: 'chademo', label: 'CHAdeMO' },
  { value: 'type2', label: 'Type 2 (Mennekes)' },
  { value: 'type1', label: 'Type 1 (J1772)' },
  { value: 'tesla', label: 'Tesla Supercharger' },
];

const distances = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
  activeFiltersCount = 0,
}) => {
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      fastChargingOnly: false,
      availableOnly: false,
      connectorType: 'all',
      maxDistance: 10,
    });
  };

  const hasActiveFilters = activeFiltersCount > 0 || 
    filters.fastChargingOnly || 
    filters.availableOnly || 
    filters.connectorType !== 'all';

  return (
    <Card className="energy-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search & Filters
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount || 'Active'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by station name or city..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={onSearch} 
            disabled={isLoading}
            className="energy-flow"
          >
            Search
          </Button>
        </div>

        {/* Filters Toggle */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Quick Filters */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fast-charging"
                  checked={filters.fastChargingOnly}
                  onCheckedChange={(checked) => updateFilter('fastChargingOnly', checked)}
                />
                <label htmlFor="fast-charging" className="text-sm font-medium">
                  Fast charging only (≥50kW)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available-only"
                  checked={filters.availableOnly}
                  onCheckedChange={(checked) => updateFilter('availableOnly', checked)}
                />
                <label htmlFor="available-only" className="text-sm font-medium">
                  Available stations only
                </label>
              </div>
            </div>

            {/* Connector Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Connector Type</label>
              <Select
                value={filters.connectorType}
                onValueChange={(value) => updateFilter('connectorType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {connectorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Distance</label>
              <Select
                value={filters.maxDistance.toString()}
                onValueChange={(value) => updateFilter('maxDistance', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {distances.map((distance) => (
                    <SelectItem key={distance.value} value={distance.value.toString()}>
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SearchAndFilters;