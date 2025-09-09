import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Activity, Clock, TrendingUp, Server } from 'lucide-react';

interface DashboardStats {
  total: number;
  available: number;
  occupied: number;
  offline: number;
  totalPorts: number;
  availablePorts: number;
  avgChargingSpeed: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface RealTimeDashboardProps {
  stats: DashboardStats;
  statusDistribution: StatusDistribution[];
  lastUpdate: Date;
  isRunning: boolean;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  stats,
  statusDistribution,
  lastUpdate,
  isRunning
}) => {
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend,
    color = "text-primary" 
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: string;
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <Badge variant="outline" className="mt-1 text-xs">
              {trend}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const portUtilization = ((stats.totalPorts - stats.availablePorts) / stats.totalPorts * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header with last update */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Dashboard</h2>
          <p className="text-muted-foreground">Live EV charging station monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: isRunning ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          >
            <Activity className={`h-4 w-4 ${isRunning ? 'text-green-500' : 'text-gray-400'}`} />
          </motion.div>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? 'Live' : 'Paused'}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Last update: {formatLastUpdate(lastUpdate)}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Stations"
          value={stats.total}
          icon={MapPin}
          description="Across India"
          color="text-blue-500"
        />
        <StatCard
          title="Available Stations"
          value={stats.available}
          icon={Zap}
          description="Ready for charging"
          color="text-green-500"
        />
        <StatCard
          title="Available Ports"
          value={`${stats.availablePorts}/${stats.totalPorts}`}
          icon={Server}
          description={`${portUtilization}% utilized`}
          color="text-purple-500"
        />
        <StatCard
          title="Avg Charging Speed"
          value={`${stats.avgChargingSpeed}kW`}
          icon={TrendingUp}
          description="Network average"
          color="text-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Station Status Distribution</CardTitle>
              <CardDescription>Real-time status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Port Utilization Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Port Utilization</CardTitle>
              <CardDescription>Available vs occupied charging ports</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: 'Available', value: stats.availablePorts, fill: '#10b981' },
                    { name: 'Occupied', value: stats.totalPorts - stats.availablePorts, fill: '#ef4444' }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-sm">
                  {portUtilization}% Network Utilization
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Operational</p>
                <p className="text-2xl font-bold text-green-800">
                  {stats.available + stats.occupied}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Occupied</p>
                <p className="text-2xl font-bold text-red-800">{stats.occupied}</p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Offline</p>
                <p className="text-2xl font-bold text-gray-800">{stats.offline}</p>
              </div>
              <Server className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RealTimeDashboard;