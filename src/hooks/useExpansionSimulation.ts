import { useState, useCallback } from 'react';
import { openRouterService } from '@/services/openRouter';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

export interface ExpansionParameters {
  location: string;
  locationData?: LocationData;
  stations: number;
  portsPerStation: number;
  stationType: string;
  budget: number;
  timeline: string;
}

export interface SimulationResults {
  simulation_summary: string;
  key_insights: string[];
  potential_risks: string[];
  strategic_recommendations: string[];
  // Mock metrics for demo
  projected_utilization_rate?: number;
  estimated_roi_years?: number;
  expected_daily_users?: number;
  estimated_annual_revenue?: number;
  competition_level?: 'Low' | 'Medium' | 'High';
  is_mock_data?: boolean;
}

export interface ExpansionScenario {
  name: string;
  description: string;
  parameters: Partial<ExpansionParameters>;
}

export const expansionScenarios: ExpansionScenario[] = [
  {
    name: "Urban Dense",
    description: "High-density urban areas with heavy EV adoption",
    parameters: {
      stations: 8,
      portsPerStation: 12,
      stationType: "dcfast",
      budget: 800000,
      timeline: "1y"
    }
  },
  {
    name: "Suburban Growth", 
    description: "Growing suburban markets with emerging EV adoption",
    parameters: {
      stations: 5,
      portsPerStation: 8,
      stationType: "mixed",
      budget: 500000,
      timeline: "2y"
    }
  },
  {
    name: "Highway Corridor",
    description: "Long-distance travel routes requiring fast charging",
    parameters: {
      stations: 3,
      portsPerStation: 6,
      stationType: "ultra",
      budget: 600000,
      timeline: "1y"
    }
  }
];

const generateMockResults = (parameters: ExpansionParameters): SimulationResults => {
  const competitionLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
  const utilizationRate = 60 + Math.floor(Math.random() * 36); // 60-95%
  const roiYears = 2 + Math.floor(Math.random() * 5); // 2-6 years
  const dailyUsers = 50 + Math.floor(Math.random() * 151); // 50-200 users
  const annualRevenue = 10000 + Math.floor(Math.random() * 40001); // 10,000-50,000
  const competitionLevel = competitionLevels[Math.floor(Math.random() * 3)];
  
  return {
    simulation_summary: `This ${parameters.stationType} charging deployment in ${parameters.location} shows ${Math.random() > 0.5 ? 'strong' : 'moderate'} market potential with ${competitionLevel.toLowerCase()} competition density.`,
    key_insights: [
      `Market analysis indicates ${utilizationRate}% projected utilization rate for this location.`,
      `The deployment strategy aligns well with local infrastructure, suggesting ${roiYears}-year ROI timeline.`,
      `Daily traffic projections estimate ${dailyUsers} users per station based on location demographics.`
    ],
    potential_risks: [
      `Competition analysis shows ${competitionLevel.toLowerCase()} market saturation which may impact pricing strategies.`,
      `Budget allocation of $${parameters.budget.toLocaleString()} may require phased deployment to optimize capital efficiency.`
    ],
    strategic_recommendations: [
      `Focus on ${parameters.stationType} infrastructure to maximize market differentiation and user adoption.`,
      `Consider partnerships with local businesses to enhance station utilization and create additional revenue streams.`
    ],
    projected_utilization_rate: utilizationRate,
    estimated_roi_years: roiYears,
    expected_daily_users: dailyUsers,
    estimated_annual_revenue: annualRevenue,
    competition_level: competitionLevel,
    is_mock_data: true
  };
};

export const useExpansionSimulation = () => {
  const [parameters, setParameters] = useState<ExpansionParameters>({
    location: '',
    stations: 0,
    portsPerStation: 0,
    stationType: '',
    budget: 0,
    timeline: ''
  });

  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParameter = useCallback((key: keyof ExpansionParameters, value: string | number | LocationData | undefined) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadScenario = useCallback((scenario: ExpansionScenario) => {
    setParameters(prev => ({ ...prev, ...scenario.parameters }));
  }, []);

  const runSimulation = useCallback(async () => {
    if (!parameters.location || !parameters.stations || !parameters.budget) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Simulate processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Always generate mock results for demo
    const mockResults = generateMockResults(parameters);
    setResults(mockResults);
    setIsLoading(false);
  }, [parameters]);

  return {
    parameters,
    results,
    isLoading,
    error,
    updateParameter,
    loadScenario,
    runSimulation,
    expansionScenarios
  };
};
