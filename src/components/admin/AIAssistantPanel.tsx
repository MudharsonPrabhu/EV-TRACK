import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};
import { 
  Bot, 
  Send, 
  Copy, 
  Download, 
  Sparkles, 
  MessageSquare,
  Settings,
  Zap,
  BarChart3,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAISettings } from '@/hooks/useAISettings';
import { useAdminChat } from '@/hooks/useAdminChat';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const { settings } = useAISettings();
  const { messages, isLoading, sendMessage, clearChat } = useAdminChat();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: "Unable to capture audio. Please check microphone permissions.",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Speak response using Text-to-Speech
  const speakResponse = (text: string) => {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text for speech (remove markdown and emojis)
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/📊|📈|📋|⚠️|✅|🔍|📱|🚗|📊|💡|🎯|📢|💰|🔄|⚡|🔌|🔧|📍/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Enhanced') ||
      voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Watch for new assistant messages to speak them
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading && isSpeechEnabled) {
        // Delay speech slightly to ensure message is fully rendered
        setTimeout(() => speakResponse(lastMessage.content), 500);
      }
    }
  }, [messages, isLoading, isSpeechEnabled]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!settings.selectedModel || !settings.openRouterApiKey) {
      toast({
        variant: "destructive",
        title: "AI Not Configured",
        description: "Please configure your AI settings first.",
      });
      return;
    }

    const userInput = input;
    setInput('');
    await sendMessage(userInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
      });
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleSpeech = () => {
    if (isSpeechEnabled) {
      window.speechSynthesis.cancel();
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Response copied to clipboard.",
    });
  };

  const exportInsights = () => {
    const insights = messages
      .filter(msg => msg.role === 'assistant')
      .map((msg, index) => `Insight ${index + 1}:\n${msg.content}\n\n`)
      .join('');
    
    const blob = new Blob([insights], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ev-insights.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Insights exported successfully.",
    });
  };


  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full energy-glow z-50 animate-scale-in hover:scale-110 transition-all duration-200"
        size="sm"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] energy-glow z-50 flex flex-col animate-slide-in-right shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/20 p-2 rounded-full electric-pulse">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                {settings.selectedModel?.name || 'Not configured'}
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle}
            className="hover:bg-muted/50 transition-colors"
          >
            ×
          </Button>
        </div>
        {messages.length > 0 && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={exportInsights}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSpeech}
              className={isSpeechEnabled ? "text-primary" : "text-muted-foreground"}
            >
              {isSpeechEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-4 animate-pulse">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium mb-2 text-lg">EVTrack AI Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Ask about station performance, user analytics, system status, or any EV-related questions.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-fade-in",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl p-3 space-y-2 shadow-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/50 border rounded-bl-sm"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.role === 'assistant' && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                          className="h-6 px-2 hover:bg-muted/50"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-muted/50 border rounded-xl rounded-bl-sm p-3 max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">AI is thinking...</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}

        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about stations, analytics, system status..."
                  disabled={isLoading || isListening}
                  className="min-h-[44px] max-h-32 resize-none pr-10 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                  rows={1}
                />
                {isListening && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-1 text-red-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Listening...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={cn(
                    "h-11 w-11 p-0 transition-all duration-200",
                    isListening && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 animate-pulse"
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  size="sm"
                  className="h-11 w-11 p-0 transition-all duration-200 hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!settings.selectedModel && (
              <div className="flex items-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                <Settings className="h-3 w-3 mr-1" />
                Configure AI in Settings first
              </div>
            )}
            {isListening && (
              <div className="text-xs text-muted-foreground text-center animate-fade-in">
                🎤 Speak now... Click the mic again to stop
              </div>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantPanel;