import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Network, MapPin, Calculator, TrendingUp, DollarSign, Users, Loader2, Info } from 'lucide-react';
import { useExpansionSimulation } from '@/hooks/useExpansionSimulation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationSearchInput } from '@/components/ui/location-search-input';

const ExpansionSimulator: React.FC = () => {
  const {
    parameters,
    results,
    isLoading,
    error,
    updateParameter,
    loadScenario,
    runSimulation,
    expansionScenarios
  } = useExpansionSimulation();

  const handleRunSimulation = () => {
    runSimulation();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Network Expansion Simulator</h1>
        <p className="text-muted-foreground">
          Plan and simulate new charging station deployments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-primary" />
              Expansion Parameters
            </CardTitle>
            <CardDescription>
              Configure your expansion scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationSearchInput
              label="Target Location"
              placeholder="Enter city or region"
              value={parameters.locationData}
              onLocationSelect={(location) => {
                if (location) {
                  updateParameter('location', location.name);
                  updateParameter('locationData', location);
                } else {
                  updateParameter('location', '');
                  updateParameter('locationData', undefined);
                }
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stations">Number of Stations</Label>
                <Input 
                  id="stations" 
                  type="number" 
                  placeholder="5"
                  value={parameters.stations || ''}
                  onChange={(e) => updateParameter('stations', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ports">Ports per Station</Label>
                <Input 
                  id="ports" 
                  type="number" 
                  placeholder="8"
                  value={parameters.portsPerStation || ''}
                  onChange={(e) => updateParameter('portsPerStation', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="station-type">Station Type</Label>
              <Select 
                value={parameters.stationType} 
                onValueChange={(value) => updateParameter('stationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select station type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level2">Level 2 (AC)</SelectItem>
                  <SelectItem value="dcfast">DC Fast Charging</SelectItem>
                  <SelectItem value="ultra">Ultra-Fast Charging</SelectItem>
                  <SelectItem value="mixed">Mixed Portfolio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Investment Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="budget" 
                  placeholder="500,000" 
                  className="pl-10"
                  value={parameters.budget || ''}
                  onChange={(e) => updateParameter('budget', parseInt(e.target.value.replace(/,/g, '')) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Deployment Timeline</Label>
              <Select 
                value={parameters.timeline} 
                onValueChange={(value) => updateParameter('timeline', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6m">6 months</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                  <SelectItem value="2y">2 years</SelectItem>
                  <SelectItem value="5y">5 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full energy-flow" 
              onClick={handleRunSimulation}
              disabled={isLoading || !parameters.location || !parameters.stations || !parameters.budget}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
              Simulation Results
            </CardTitle>
            <CardDescription>
              AI-powered market analysis and strategic insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!results && !isLoading && (
              <div className="text-center py-12">
                <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4 electric-pulse">
                  <Network className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Run a Simulation</h3>
                <p className="text-muted-foreground">
                  Configure your expansion parameters and click "Run Simulation" to see projected results.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Running AI Analysis</h3>
                <p className="text-muted-foreground">
                  Gathering market data and generating strategic insights...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="bg-destructive/20 p-4 rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-destructive">Analysis Failed</h3>
                <p className="text-muted-foreground mb-4">
                  {error}
                </p>
                <Button onClick={handleRunSimulation} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {results && !isLoading && !error && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-success">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-medium">AI Analysis Complete</h3>
                  </div>
                  {results.is_mock_data && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Info className="h-4 w-4 mr-1" />
                      Demo Data
                    </div>
                  )}
                </div>

                {/* Key Metrics Grid */}
                {results.is_mock_data && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {results.projected_utilization_rate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Projected Utilization Rate
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary mb-1">
                          {results.estimated_roi_years}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Estimated ROI (Years)
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent mb-1">
                          {results.expected_daily_users}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Daily Users/Station
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success mb-1">
                          ${(results.estimated_annual_revenue || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Annual Revenue
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${
                          results.competition_level === 'Low' ? 'text-success' :
                          results.competition_level === 'Medium' ? 'text-warning' : 'text-destructive'
                        }`}>
                          {results.competition_level}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Competition Level
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {results.simulation_summary}
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                      Key Market Insights
                    </h4>
                    <ul className="space-y-2">
                      {results.key_insights.map((insight, index) => (
                        <li key={index} className="text-sm flex items-start p-3 bg-muted/50 rounded-lg">
                          <span className="text-primary mr-2">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2 text-destructive" />
                      Potential Risks
                    </h4>
                    <ul className="space-y-2">
                      {results.potential_risks.map((risk, index) => (
                        <li key={index} className="text-sm flex items-start p-3 bg-destructive/10 rounded-lg">
                          <span className="text-destructive mr-2">⚠</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-secondary" />
                      Strategic Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {results.strategic_recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm flex items-start p-3 bg-secondary/10 rounded-lg">
                          <span className="text-secondary mr-2">→</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="energy-glow">
        <CardHeader>
          <CardTitle>Expansion Scenarios</CardTitle>
          <CardDescription>
            Pre-configured expansion strategies for different market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expansionScenarios.map((scenario, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="font-medium mb-2">{scenario.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {scenario.description}
                </p>
                <ul className="text-xs space-y-1 mb-4">
                  {scenario.name === "Urban Dense" && (
                    <>
                      <li>• DC Fast charging focus</li>
                      <li>• High port density</li>
                      <li>• Premium locations</li>
                    </>
                  )}
                  {scenario.name === "Suburban Growth" && (
                    <>
                      <li>• Mixed charging types</li>
                      <li>• Shopping center locations</li>
                      <li>• Moderate investment</li>
                    </>
                  )}
                  {scenario.name === "Highway Corridor" && (
                    <>
                      <li>• Ultra-fast charging</li>
                      <li>• Strategic spacing</li>
                      <li>• Travel amenities</li>
                    </>
                  )}
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => loadScenario(scenario)}
                >
                  Load Scenario
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpansionSimulator;