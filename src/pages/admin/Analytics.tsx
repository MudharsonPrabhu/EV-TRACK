import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Zap, Download, ArrowUpIcon, ArrowDownIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const Analytics: React.FC = () => {
  const { metrics, chartData, demographics, stations, revenueBreakdown, peakHours } = useRealTimeAnalytics();

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  const ChangeIndicator = ({ change }: { change: number }) => {
    const isPositive = change > 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Real-Time Analytics
            </h1>
            <div className="flex items-center gap-1 text-green-500">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium">LIVE</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Live insights and performance metrics for your EV network
          </p>
        </div>
        <Button variant="outline" className="energy-flow">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </motion.div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="energy-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Active Users
                </div>
                <ChangeIndicator change={metrics.activeUsersChange} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={metrics.activeUsers} 
                  formatValue={formatNumber}
                />
              </div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="energy-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-secondary" />
                  Sessions Today
                </div>
                <ChangeIndicator change={metrics.sessionsTodayChange} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={metrics.sessionsToday} 
                  formatValue={formatNumber}
                />
              </div>
              <p className="text-xs text-muted-foreground">Charging sessions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="energy-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-accent" />
                  Revenue Today
                </div>
                <ChangeIndicator change={metrics.revenueChange} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={metrics.revenue} 
                  formatValue={formatCurrency}
                />
              </div>
              <p className="text-xs text-muted-foreground">Daily earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="energy-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Avg Session Time
                </div>
                <ChangeIndicator change={metrics.avgSessionTimeChange} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter 
                  value={metrics.avgSessionTime} 
                  formatValue={(val) => `${val} min`}
                />
              </div>
              <p className="text-xs text-muted-foreground">Average duration</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Usage Trends (24 Hours)
              </CardTitle>
              <CardDescription>
                Real-time charging session activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-secondary" />
                User Demographics
              </CardTitle>
              <CardDescription>
                Live user distribution and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">New Users</span>
                    <span className="font-bold">
                      <AnimatedCounter value={demographics.newUsers} formatValue={formatNumber} />
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(demographics.newUsers / 3000) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Returning Users</span>
                    <span className="font-bold">
                      <AnimatedCounter value={demographics.returningUsers} formatValue={formatNumber} />
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-secondary to-secondary/60 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(demographics.returningUsers / 15000) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Premium Users</span>
                    <span className="font-bold">
                      <AnimatedCounter value={demographics.premiumUsers} formatValue={formatNumber} />
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-accent to-accent/60 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(demographics.premiumUsers / 6000) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle>Top Performing Stations</CardTitle>
              <CardDescription>
                Highest utilization rates (Live)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stations.map((station, index) => (
                  <motion.div
                    key={station.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{station.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <AnimatedCounter 
                          value={station.utilization} 
                          formatValue={(val) => `${val}% utilization`}
                        />
                      </p>
                    </div>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${station.utilization}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Live income sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <motion.div 
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-sm font-medium">DC Fast Charging</span>
                  <span className="font-bold text-primary">
                    <AnimatedCounter 
                      value={revenueBreakdown.dcFastCharging} 
                      formatValue={formatCurrency}
                    />
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-sm font-medium">Level 2 Charging</span>
                  <span className="font-bold text-secondary">
                    <AnimatedCounter 
                      value={revenueBreakdown.level2Charging} 
                      formatValue={formatCurrency}
                    />
                  </span>
                </motion.div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Revenue</span>
                    <span className="text-accent">
                      <AnimatedCounter 
                        value={revenueBreakdown.dcFastCharging + revenueBreakdown.level2Charging} 
                        formatValue={formatCurrency}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>
                Live network utilization times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {peakHours.map((peak, index) => (
                  <motion.div
                    key={peak.timeRange}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-sm font-medium">{peak.timeRange}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        <AnimatedCounter 
                          value={peak.utilization} 
                          formatValue={(val) => `${val}%`}
                        />
                      </span>
                      <div className="w-12 bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-accent to-accent/60 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${peak.utilization}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse text-green-500" />
                    Data updates every 3-5 seconds
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;