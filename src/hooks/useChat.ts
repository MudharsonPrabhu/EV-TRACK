import { useState, useCallback } from 'react';
import { useAISettings } from './useAISettings';
import { openRouterService } from '@/services/openRouter';
import { OpenChargeMapService } from '@/services/openChargeMapApi';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useAISettings();

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const detectChargingStationQuery = (message: string): boolean => {
    const keywords = ['charger', 'charging', 'station', 'fast charger', 'near me', 'nearby', 'find charger'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const searchChargingStations = async (query: string, userLocation?: GeolocationCoordinates) => {
    try {
      const latitude = userLocation?.latitude || 37.7749;
      const longitude = userLocation?.longitude || -122.4194;
      
      const ocmService = OpenChargeMapService.getInstance();
      const stations = await ocmService.searchStations(
        { latitude, longitude },
        { 
          connectorTypes: [], 
          availableOnly: false, 
          maxDistance: 20 
        }
      );

      if (stations.length === 0) {
        return "I couldn't find any charging stations in your area. Try expanding your search radius or check if location services are enabled.";
      }

      let response = `I found ${stations.length} charging stations near you:\n\n`;
      
      stations.forEach((station, index) => {
        const distance = station.addressInfo?.distance?.toFixed(1) || 'Unknown';
        const title = station.addressInfo?.title || `Station ${index + 1}`;
        const address = station.addressInfo?.addressLine1 || '';
        const town = station.addressInfo?.town || '';
        
        const connectorTypes = station.connections?.map(conn => 
          conn.connectionType?.title
        ).filter(Boolean).join(', ') || 'Unknown connectors';
        
        const power = station.connections?.[0]?.powerKW ? 
          `${station.connections[0].powerKW}kW` : 'Power unknown';

        response += `**${title}**\n`;
        response += `📍 ${address}, ${town}\n`;
        response += `🔌 ${connectorTypes}\n`;
        response += `⚡ ${power}\n`;
        response += `📏 ${distance} km away\n\n`;
      });

      return response;
    } catch (error) {
      return "I encountered an error while searching for charging stations. Please try again later.";
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!settings.selectedModel || !settings.openRouterApiKey) {
      addMessage('assistant', 'Please configure your AI settings first by going to Settings > AI & LLM Settings.');
      return;
    }

    addMessage('user', content);
    setIsLoading(true);

    try {
      // Check if user is asking about charging stations
      if (detectChargingStationQuery(content)) {
        // Get user location if available
        const userLocation = await new Promise<GeolocationCoordinates | undefined>((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve(position.coords),
              () => resolve(undefined)
            );
          } else {
            resolve(undefined);
          }
        });

        const stationResponse = await searchChargingStations(content, userLocation);
        addMessage('assistant', stationResponse);
      } else {
        // Regular AI conversation
        const systemPrompt = `You are an EV (Electric Vehicle) assistant. Help users with:
- EV charging questions
- Battery maintenance tips
- Electric vehicle information
- Charging station types and compatibility
- EV driving tips and best practices
- Range optimization
Keep responses helpful, concise, and EV-focused.`;

        const response = await openRouterService.generateCompletion(
          settings.selectedModel.id,
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content }
          ],
          { temperature: 0.7, max_tokens: 500 }
        );

        addMessage('assistant', response);
      }
    } catch (error) {
      addMessage('assistant', 'I apologize, but I encountered an error. Please check your AI settings and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [settings, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};