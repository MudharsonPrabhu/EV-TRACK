import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings as SettingsIcon, 
  Brain, 
  Bell, 
  Palette, 
  Shield, 
  Key, 
  Search, 
  RefreshCw, 
  Check,
  Eye,
  EyeOff,
  Zap,
  Map
} from 'lucide-react';
import { useAISettings } from '@/hooks/useAISettings';
import { OpenRouterModel } from '@/types/openrouter';
import { useToast } from '@/hooks/use-toast';
import MapConfiguration from '@/components/map/MapConfiguration';

interface SettingsProps {
  userRole: 'user' | 'admin';
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const { toast } = useToast();
  const { settings, models, loading, error, saveSettings, fetchModels, selectModel, clearApiKey } = useAISettings();
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(!!settings.openRouterApiKey);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingModels(true);
      await fetchModels(apiKey);
      saveSettings({ openRouterApiKey: apiKey });
      setApiKeyConfigured(true);
      setApiKey('');
      toast({
        title: "Success",
        description: "API Key Configured successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure API key. Please check your key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleRefreshModels = async () => {
    if (!settings.openRouterApiKey) {
      toast({
        title: "Error",
        description: "Please configure your API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingModels(true);
      await fetchModels();
      toast({
        title: "Success",
        description: "Models refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh models",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSelectModel = (model: OpenRouterModel) => {
    selectModel(model);
    toast({
      title: "Model Selected",
      description: `${model.name} is now active for AI suggestions.`,
    });
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return 'Free';
    if (num < 0.001) return `$${(num * 1000000).toFixed(2)}/1M`;
    if (num < 1) return `$${(num * 1000).toFixed(2)}/1K`;
    return `$${num.toFixed(2)}`;
  };

  const getProviderFromId = (id: string) => {
    const parts = id.split('/');
    return parts[0] || 'unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your EVTrack experience
        </p>
      </div>

      {/* Map Configuration for Admins */}
      {userRole === 'admin' && (
        <MapConfiguration />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              AI & LLM Settings
            </CardTitle>
            <CardDescription>
              Configure your AI assistant with OpenRouter models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key Configuration */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-secondary" />
                <Label className="text-base font-semibold">OpenRouter API Key</Label>
                {apiKeyConfigured && (
                  <Badge variant="outline" className="text-secondary border-secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                )}
              </div>
              
              {!apiKeyConfigured ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your OpenRouter API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSaveApiKey} 
                    disabled={!apiKey.trim() || isLoadingModels}
                    className="w-full"
                  >
                    {isLoadingModels ? 'Configuring...' : 'Save API Key'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{' '}
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      OpenRouter
                    </a>
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">API Key Configured</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      clearApiKey();
                      setApiKeyConfigured(false);
                      toast({
                        title: "API Key Cleared",
                        description: "You'll need to reconfigure your API key to use AI features.",
                      });
                    }}
                  >
                    Clear Key
                  </Button>
                </div>
              )}
            </div>

            {/* Model Selection */}
            {apiKeyConfigured && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Available Models</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshModels}
                    disabled={isLoadingModels}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Models List */}
                <div className="max-h-96 overflow-y-auto space-y-2 border border-border rounded-lg">
                  {(isLoadingModels || loading) ? (
                    <div className="p-4 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <div 
                        key={model.id} 
                        className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{model.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {getProviderFromId(model.id)}
                              </Badge>
                              {settings.selectedModel?.id === model.id && (
                                <Badge className="text-xs bg-primary text-primary-foreground">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {model.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Context: {model.context_length.toLocaleString()}</span>
                              <span>Input: {formatPrice(model.pricing.prompt)}</span>
                              <span>Output: {formatPrice(model.pricing.completion)}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={settings.selectedModel?.id === model.id ? "default" : "outline"}
                            onClick={() => handleSelectModel(model)}
                            className="ml-2 flex-shrink-0"
                          >
                            {settings.selectedModel?.id === model.id ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      {searchQuery ? 'No models found matching your search.' : 'No models available.'}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* AI Feature Toggles */}
            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="text-base font-semibold">AI Features</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Smart Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered route and charging suggestions
                  </p>
                </div>
                <Switch 
                  checked={settings.smartSuggestions}
                  onCheckedChange={(checked) => saveSettings({ smartSuggestions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Predictive Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to predict optimal charging times
                  </p>
                </div>
                <Switch 
                  checked={settings.predictiveAnalytics}
                  onCheckedChange={(checked) => saveSettings({ predictiveAnalytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chat Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI chat assistant for help and guidance
                  </p>
                </div>
                <Switch 
                  checked={settings.chatAssistant}
                  onCheckedChange={(checked) => saveSettings({ chatAssistant: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-secondary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Charging Complete</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when charging session is complete
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Battery Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when battery is below 20%
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Station Availability</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when preferred stations become available
                </p>
              </div>
              <Switch />
            </div>

            {userRole === 'admin' && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about system issues
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2 text-accent" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of EVTrack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select defaultValue="dark">
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark Energy</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <Select defaultValue="electric-blue">
                <SelectTrigger>
                  <SelectValue placeholder="Select accent color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electric-blue">Electric Blue</SelectItem>
                  <SelectItem value="energy-green">Energy Green</SelectItem>
                  <SelectItem value="plasma-purple">Plasma Purple</SelectItem>
                  <SelectItem value="solar-orange">Solar Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Disable animations for better performance
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="energy-glow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow location access for nearby stations
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymous usage data to improve EVTrack
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features
                </p>
              </div>
              <Switch />
            </div>

            <Button variant="destructive" className="w-full mt-4">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="energy-glow">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your current plan and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-lg font-bold">Pro</p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-bold">Jan 2024</p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">API Calls Used</p>
              <p className="text-lg font-bold">1,247 / 5,000</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;