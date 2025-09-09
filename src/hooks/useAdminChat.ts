import { useState, useCallback, useEffect } from 'react';
import { useAISettings } from './useAISettings';
import { openRouterService } from '@/services/openRouter';

export interface AdminChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'insight' | 'data' | 'analysis';
    structured?: boolean;
  };
}

const ADMIN_CHAT_KEY = 'evtrack_admin_chat_messages';

export const useAdminChat = () => {
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useAISettings();

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_CHAT_KEY);
    if (saved) {
      try {
        const parsedMessages = JSON.parse(saved);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading admin chat messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(ADMIN_CHAT_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, metadata?: AdminChatMessage['metadata']) => {
    const newMessage: AdminChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      metadata,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);


  const sendMessage = useCallback(async (content: string) => {
    if (!settings.selectedModel || !settings.openRouterApiKey) {
      addMessage('assistant', 'Please configure your AI settings first by going to Settings > AI & LLM Settings.');
      return;
    }

    addMessage('user', content);
    setIsLoading(true);

    try {
      // Create system prompt for EV admin assistant
      const systemPrompt = `You are an EVTrack Admin Assistant. You help administrators analyze EV charging station performance, user trends, system errors, and provide operational recommendations.

Your capabilities include:
- Analyzing charging station performance and utilization
- Identifying operational inefficiencies and opportunities  
- Providing strategic insights for network expansion
- Monitoring revenue, user growth, and system health
- Detecting patterns in usage, downtime, and maintenance needs
- Answering general EV domain knowledge queries
- Troubleshooting common EV charging infrastructure issues

Always provide structured, actionable insights with:
- Clear metrics and data points
- Strategic recommendations
- Operational improvements
- Revenue optimization suggestions
- Technical explanations when relevant

Keep responses focused on EV charging infrastructure management and operations.
Format important information with clear sections and bullet points.
Use relevant emojis to enhance readability: ⚡ 🔌 📊 📈 🚗 💰 🔧 📍

Context: You are helping an admin user who manages an EV charging network with real-time access to station data, user analytics, and operational metrics.`;

      // Always route to OpenRouter
      const aiResponse = await openRouterService.generateCompletion(
        settings.selectedModel.id,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        { temperature: 0.7, max_tokens: 800 }
      );

      addMessage('assistant', aiResponse, { 
        type: 'analysis', 
        structured: false 
      });

    } catch (error) {
      console.error('Error in admin chat:', error);
      addMessage('assistant', 'I apologize, but I encountered an error while processing your request. Please check your AI settings and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [settings, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(ADMIN_CHAT_KEY);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};