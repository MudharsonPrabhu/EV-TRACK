import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, RotateCcw, Search, Filter, Activity } from 'lucide-react';
import { SimulationUpdate } from '@/hooks/useSimulation';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onRunManualUpdate: () => void;
  updates: SimulationUpdate[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onToggleSimulation,
  onRunManualUpdate,
  updates,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Simulation Controls */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={onToggleSimulation}
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-2 w-full"
            >
              {isRunning ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={onRunManualUpdate}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full"
            >
              <RotateCcw className="h-3 w-3" />
              Update
            </Button>
          </div>
          
          <div className="text-center">
            <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 text-sm h-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Live Updates Feed */}
      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Live Updates</CardTitle>
          <CardDescription className="text-xs">
            {updates.length} recent changes
          </CardDescription>
        </CardHeader>
        <CardContent className="h-full">
          <ScrollArea className="h-full max-h-[300px]">
            <div className="space-y-2 pr-2">
              {updates.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No updates yet. Start simulation to see changes.
                </p>
              ) : (
                updates.slice(0, 20).map((update, index) => (
                  <motion.div
                    key={`${update.stationId}-${update.timestamp.getTime()}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 border rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-medium truncate">{update.stationName}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {update.previousStatus}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {update.newStatus}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {formatTime(update.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationControls;