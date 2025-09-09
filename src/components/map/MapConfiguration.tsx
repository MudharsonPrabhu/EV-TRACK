import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Map, Key, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useMapSettings } from '@/hooks/useMapSettings';
import { useToast } from '@/hooks/use-toast';

const MapConfiguration: React.FC = () => {
  const { settings, loading, error, updateSettings, testApiKey } = useMapSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    provider: settings?.provider || 'openstreetmap',
    api_key: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleProviderChange = (provider: string) => {
    setFormData(prev => ({ ...prev, provider: provider as any }));
  };

  const handleApiKeyChange = (value: string) => {
    setFormData(prev => ({ ...prev, api_key: value }));
  };

  const handleTestApiKey = async () => {
    if (!formData.api_key.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key to test",
        variant: "destructive",
      });
      return;
    }

    try {
      setTesting(true);
      const isValid = await testApiKey(formData.provider, formData.api_key);
      
      if (isValid) {
        toast({
          title: "Success",
          description: "API key is valid and working",
        });
      } else {
        toast({
          title: "Error",
          description: "API key test failed. Please check your key and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API key",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setUpdating(true);
      await updateSettings({
        provider: formData.provider,
        api_key: formData.api_key.trim() || null,
      });
      setFormData(prev => ({ ...prev, api_key: '' }));
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="energy-glow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2 text-primary" />
            Map Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="energy-glow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2 text-primary" />
            Map Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-destructive/50">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="energy-glow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Map className="h-5 w-5 mr-2 text-primary" />
          Map Configuration
        </CardTitle>
        <CardDescription>
          Configure map provider and API settings for the entire system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="p-4 border border-border rounded-lg bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold">Current Configuration</Label>
            {settings?.api_key && (
              <Badge variant="outline" className="text-secondary border-secondary">
                <Check className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            )}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Provider: <span className="font-medium text-foreground capitalize">{settings?.provider}</span></div>
            <div>API Key: <span className="font-medium text-foreground">{settings?.api_key ? 'Configured' : 'Not set'}</span></div>
            <div>Status: <span className="font-medium text-foreground">{settings?.is_active ? 'Active' : 'Inactive'}</span></div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Map Provider</Label>
            <Select value={formData.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select map provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openstreetmap">OpenStreetMap (OpenChargeMap)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <div className="relative">
              <Input
                id="api_key"
                type={showApiKey ? "text" : "password"}
                placeholder={`Enter ${formData.provider} API key...`}
                value={formData.api_key}
                onChange={(e) => handleApiKeyChange(e.target.value)}
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
            <div className="text-xs text-muted-foreground">
              {formData.provider === 'openstreetmap' && (
                <span>Get your API key from <a href="https://openchargemap.org/site/loginprovider" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenChargeMap</a></span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestApiKey}
              disabled={!formData.api_key.trim() || testing}
              variant="outline"
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Test API Key
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSaveSettings}
              disabled={!formData.api_key.trim() || updating}
              className="flex-1"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Provider Information */}
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">Provider Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {formData.provider === 'openstreetmap' && (
              <>
                <p>• Free to use with API key from OpenChargeMap</p>
                <p>• Best for EV charging station data</p>
                <p>• No daily request limits for basic usage</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapConfiguration;