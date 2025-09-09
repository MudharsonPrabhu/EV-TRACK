import { useState, useEffect } from 'react';
import { AISettings, OpenRouterModel } from '@/types/openrouter';
import { openRouterService } from '@/services/openRouter';

const AI_SETTINGS_KEY = 'ev_tracker_ai_settings';

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>({
    smartSuggestions: true,
    predictiveAnalytics: true,
    chatAssistant: false,
  });
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(AI_SETTINGS_KEY);
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        if (parsedSettings.openRouterApiKey) {
          openRouterService.setApiKey(parsedSettings.openRouterApiKey);
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: Partial<AISettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    // Update service API key if changed
    if (newSettings.openRouterApiKey) {
      openRouterService.setApiKey(newSettings.openRouterApiKey);
    }
  };

  const fetchModels = async (apiKey?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (apiKey) {
        openRouterService.setApiKey(apiKey);
      }
      
      const fetchedModels = await openRouterService.fetchModels();
      setModels(fetchedModels);
      return fetchedModels;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectModel = (model: OpenRouterModel) => {
    saveSettings({ selectedModel: model });
  };

  const clearApiKey = () => {
    saveSettings({ openRouterApiKey: undefined, selectedModel: undefined });
    setModels([]);
  };

  return {
    settings,
    models,
    loading,
    error,
    saveSettings,
    fetchModels,
    selectModel,
    clearApiKey,
  };
};