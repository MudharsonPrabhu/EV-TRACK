import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MapSettings {
  id: string;
  provider: 'openstreetmap';
  api_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMapSettings = () => {
  const [settings, setSettings] = useState<MapSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('map_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      console.log('[useMapSettings] fetched settings:', data);
      setSettings(data as MapSettings | null);
    } catch (err: any) {
      console.error('Error fetching map settings:', err);
      setError(err.message || 'Failed to fetch map settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Pick<MapSettings, 'provider' | 'api_key'>>) => {
    try {
      setLoading(true);
      setError(null);

      if (!settings) {
        throw new Error('No settings to update');
      }

      const { data, error } = await supabase
        .from('map_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSettings(data as MapSettings);
      toast({
        title: "Success",
        description: "Map settings updated successfully",
      });

      return data;
    } catch (err: any) {
      console.error('Error updating map settings:', err);
      const errorMessage = err.message || 'Failed to update map settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testApiKey = async (provider: string, apiKey: string): Promise<boolean> => {
    try {
      // Test different providers
      switch (provider) {
        case 'openstreetmap':
          // Test with OpenChargeMap API (which uses OpenStreetMap)
          const response = await fetch(
            `https://api.openchargemap.io/v3/poi/?output=json&latitude=13.0827&longitude=80.2707&distance=1&distanceunit=KM&maxresults=1`,
            {
              headers: {
                'X-API-Key': apiKey,
                'Accept': 'application/json',
              },
            }
          );
          return response.ok;

        default:
          return false;
      }
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    testApiKey,
    refetch: fetchSettings,
  };
};