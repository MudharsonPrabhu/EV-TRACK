import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Zap, MapPin, Clock, Wifi } from 'lucide-react';
import { MockChargingStation } from '@/data/mockIndianStations';

interface AdminStationTableProps {
  stations: MockChargingStation[];
  onStationSelect?: (station: MockChargingStation) => void;
}

const AdminStationTable: React.FC<AdminStationTableProps> = ({
  stations,
  onStationSelect
}) => {
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    city: '',
    address: '',
    lat: '',
    lng: '',
    totalPorts: '4',
    chargingSpeed: '50kW',
    operator: 'Tata Power'
  });

  const getStatusColor = (status: MockChargingStation['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Occupied':
        return 'bg-red-500';
      case 'Offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleAddStation = () => {
    // In a real app, this would call an API
    console.log('Adding new station:', newStation);
    setIsAddStationOpen(false);
    setNewStation({
      name: '',
      city: '',
      address: '',
      lat: '',
      lng: '',
      totalPorts: '4',
      chargingSpeed: '50kW',
      operator: 'Tata Power'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Station Management</CardTitle>
            <CardDescription>
              Monitor and manage all charging stations ({stations.length} total)
            </CardDescription>
          </div>
          <Dialog open={isAddStationOpen} onOpenChange={setIsAddStationOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Station
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Charging Station</DialogTitle>
                <DialogDescription>
                  Add a new charging station to the simulation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Station Name</label>
                  <Input
                    placeholder="Enter station name"
                    value={newStation.name}
                    onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      placeholder="City"
                      value={newStation.city}
                      onChange={(e) => setNewStation({ ...newStation, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Ports</label>
                    <Select value={newStation.totalPorts} onValueChange={(value) => setNewStation({ ...newStation, totalPorts: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Ports</SelectItem>
                        <SelectItem value="4">4 Ports</SelectItem>
                        <SelectItem value="6">6 Ports</SelectItem>
                        <SelectItem value="8">8 Ports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    placeholder="Full address"
                    value={newStation.address}
                    onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latitude</label>
                    <Input
                      placeholder="12.9716"
                      value={newStation.lat}
                      onChange={(e) => setNewStation({ ...newStation, lat: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Longitude</label>
                    <Input
                      placeholder="77.5946"
                      value={newStation.lng}
                      onChange={(e) => setNewStation({ ...newStation, lng: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Charging Speed</label>
                    <Select value={newStation.chargingSpeed} onValueChange={(value) => setNewStation({ ...newStation, chargingSpeed: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7kW">7kW</SelectItem>
                        <SelectItem value="22kW">22kW</SelectItem>
                        <SelectItem value="50kW">50kW</SelectItem>
                        <SelectItem value="120kW">120kW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Operator</label>
                    <Select value={newStation.operator} onValueChange={(value) => setNewStation({ ...newStation, operator: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tata Power">Tata Power</SelectItem>
                        <SelectItem value="Ather Energy">Ather Energy</SelectItem>
                        <SelectItem value="ChargeZone">ChargeZone</SelectItem>
                        <SelectItem value="BPCL">BPCL</SelectItem>
                        <SelectItem value="Adani Total Gas">Adani Total Gas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddStation} className="w-full">
                  Add Station
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station, index) => (
                <motion.tr
                  key={station.stationId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onStationSelect?.(station)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{station.name}</p>
                      <p className="text-sm text-muted-foreground">{station.stationId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{station.location.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={station.status === 'Available' ? 'default' : 'secondary'}
                      className={`${getStatusColor(station.status)} text-white`}
                    >
                      {station.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {station.availablePorts}/{station.totalPorts}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{station.chargingSpeed}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-blue-500" />
                      <span className="text-sm">{station.operator}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{formatLastUpdated(station.lastUpdated)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStationSelect?.(station);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStationTable;