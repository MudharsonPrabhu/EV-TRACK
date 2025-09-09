import { useState, useEffect, useCallback } from 'react';

export interface AnalyticsMetrics {
  activeUsers: number;
  activeUsersChange: number;
  sessionsToday: number;
  sessionsTodayChange: number;
  revenue: number;
  revenueChange: number;
  avgSessionTime: number;
  avgSessionTimeChange: number;
}

export interface ChartDataPoint {
  time: string;
  sessions: number;
  timestamp: number;
}

export interface UserDemographics {
  newUsers: number;
  returningUsers: number;
  premiumUsers: number;
}

export interface StationPerformance {
  name: string;
  utilization: number;
}

export interface RevenueBreakdown {
  dcFastCharging: number;
  level2Charging: number;
}

export interface PeakHour {
  timeRange: string;
  utilization: number;
}

export const useRealTimeAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    activeUsers: 15000,
    activeUsersChange: 2.1,
    sessionsToday: 1500,
    sessionsTodayChange: 1.8,
    revenue: 10000,
    revenueChange: 3.2,
    avgSessionTime: 42,
    avgSessionTimeChange: -1.5,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>(() => {
    const data: ChartDataPoint[] = [];
    const now = Date.now();
    
    // Generate initial 24 hours of data
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000);
      const date = new Date(timestamp);
      data.push({
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sessions: Math.floor(Math.random() * 100) + 50,
        timestamp,
      });
    }
    return data;
  });

  const [demographics, setDemographics] = useState<UserDemographics>({
    newUsers: 2500,
    returningUsers: 13500,
    premiumUsers: 5000,
  });

  const [stations, setStations] = useState<StationPerformance[]>([
    { name: 'Downtown Plaza', utilization: 95 },
    { name: 'Mall District Hub', utilization: 89 },
    { name: 'Tech Park Super', utilization: 82 },
    { name: 'Airport Terminal', utilization: 76 },
  ]);

  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown>({
    dcFastCharging: 125000,
    level2Charging: 75000,
  });

  const [peakHours, setPeakHours] = useState<PeakHour[]>([
    { timeRange: '8:00 AM - 10:00 AM', utilization: 89 },
    { timeRange: '12:00 PM - 2:00 PM', utilization: 76 },
    { timeRange: '5:00 PM - 7:00 PM', utilization: 92 },
  ]);

  const generateRandomChange = (current: number, maxPercentage: number): { value: number; change: number } => {
    const changePercent = (Math.random() - 0.5) * 2 * maxPercentage;
    const newValue = Math.max(0, current * (1 + changePercent / 100));
    return { value: Math.round(newValue), change: parseFloat(changePercent.toFixed(1)) };
  };

  const updateMetrics = useCallback(() => {
    setMetrics(prev => {
      const activeUsers = generateRandomChange(prev.activeUsers, 2);
      const sessionsToday = generateRandomChange(prev.sessionsToday, 3);
      const revenue = generateRandomChange(prev.revenue, 5);
      const avgSessionTime = {
        value: Math.max(30, Math.min(60, prev.avgSessionTime + (Math.random() - 0.5) * 4)),
        change: parseFloat(((Math.random() - 0.5) * 4).toFixed(1))
      };

      return {
        activeUsers: Math.max(12000, Math.min(18000, activeUsers.value)),
        activeUsersChange: activeUsers.change,
        sessionsToday: Math.max(1000, Math.min(2000, sessionsToday.value)),
        sessionsTodayChange: sessionsToday.change,
        revenue: Math.max(5000, Math.min(15000, revenue.value)),
        revenueChange: revenue.change,
        avgSessionTime: Math.round(avgSessionTime.value),
        avgSessionTimeChange: avgSessionTime.change,
      };
    });
  }, []);

  const updateChartData = useCallback(() => {
    setChartData(prev => {
      const newData = [...prev];
      const now = new Date();
      const newPoint: ChartDataPoint = {
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sessions: Math.floor(Math.random() * 100) + 50,
        timestamp: now.getTime(),
      };
      
      newData.push(newPoint);
      if (newData.length > 24) {
        newData.shift();
      }
      
      return newData;
    });
  }, []);

  const updateDemographics = useCallback(() => {
    setDemographics(prev => ({
      newUsers: Math.max(2000, Math.min(3000, Math.round(prev.newUsers * (1 + (Math.random() - 0.5) * 0.1)))),
      returningUsers: Math.max(12000, Math.min(15000, Math.round(prev.returningUsers * (1 + (Math.random() - 0.5) * 0.05)))),
      premiumUsers: Math.max(4000, Math.min(6000, Math.round(prev.premiumUsers * (1 + (Math.random() - 0.5) * 0.08)))),
    }));
  }, []);

  const updateStations = useCallback(() => {
    setStations(prev => {
      const updated = prev.map(station => ({
        ...station,
        utilization: Math.max(70, Math.min(100, Math.round(station.utilization + (Math.random() - 0.5) * 10))),
      }));
      
      // Randomly shuffle order occasionally
      if (Math.random() < 0.3) {
        for (let i = updated.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [updated[i], updated[j]] = [updated[j], updated[i]];
        }
      }
      
      return updated.sort((a, b) => b.utilization - a.utilization);
    });
  }, []);

  const updateRevenue = useCallback(() => {
    setRevenueBreakdown(prev => ({
      dcFastCharging: Math.max(100000, Math.min(150000, Math.round(prev.dcFastCharging * (1 + (Math.random() - 0.5) * 0.05)))),
      level2Charging: Math.max(60000, Math.min(90000, Math.round(prev.level2Charging * (1 + (Math.random() - 0.5) * 0.06)))),
    }));
  }, []);

  const updatePeakHours = useCallback(() => {
    setPeakHours(prev => prev.map(peak => ({
      ...peak,
      utilization: Math.max(70, Math.min(95, Math.round(peak.utilization + (Math.random() - 0.5) * 8))),
    })));
  }, []);

  useEffect(() => {
    // Update all data every 3-5 seconds
    const interval = setInterval(() => {
      updateMetrics();
      updateChartData();
      updateDemographics();
      updateStations();
      updateRevenue();
      updatePeakHours();
    }, 3000 + Math.random() * 2000); // 3-5 seconds

    return () => clearInterval(interval);
  }, [updateMetrics, updateChartData, updateDemographics, updateStations, updateRevenue, updatePeakHours]);

  return {
    metrics,
    chartData,
    demographics,
    stations,
    revenueBreakdown,
    peakHours,
  };
};