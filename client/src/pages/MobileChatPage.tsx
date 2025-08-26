import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Send, Camera, Gem, Battery, Wifi, Signal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "companion";
  text: string;
  timestamp: Date;
  imageUrl?: string;
}

interface Companion {
  id: number;
  name: string;
  tagline: string;
  imageUrl?: string;
}

export default function MobileChatPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companion data
  const { data: companion } = useQuery<Companion>({
    queryKey: [`/api/companions/${id}`],
  });

  // Fetch user session
  const { data: user } = useQuery({ queryKey: ["/api/user"] });
  const { data: guestSession } = useQuery({ 
    queryKey: ["/api/guest/session"],
    enabled: !user 
  });

  // Load chat history from localStorage
  useEffect(() => {
    if (id) {
      const savedMessages = localStorage.getItem(`mobile_chat_${id}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
    }
  }, [id]);

  // Save messages to localStorage
  useEffect(() => {
    if (id && messages.length > 0) {
      localStorage.setItem(`mobile_chat_${id}`, JSON.stringify(messages));
    }
  }, [id, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message function
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsGenerating(true);

    try {
      const response = await fetchApi("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companionId: parseInt(id!),
          message: messageToSend,
          sessionId: user ? undefined : (guestSession as any)?.sessionId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      const companionMessage: Message = {
        id: `companion-${Date.now()}`,
        sender: "companion",
        text: data.response || "Sorry, I couldn't respond right now.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, companionMessage]);
      
      // Refresh diamond count
      queryClient.invalidateQueries({ queryKey: ["/api/guest/session"] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diamondCount = user ? 0 : (guestSession as any)?.messageDiamonds ?? 25;

  return (
    <div className="mobile-app">
      <Toaster />
      
      {/* Status Bar */}
      <div className="mobile-status-bar">
        <div className="mobile-status-left">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <span>{currentTime}</span>
        </div>
        <div className="mobile-status-right">
          <span>100%</span>
          <Battery className="w-4 h-3" />
        </div>
      </div>

      {/* Chat Header */}
      <div className="mobile-chat-header">
        <button 
          className="mobile-back-btn"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {companion && (
          <div className="mobile-header-content">
            <div className="mobile-avatar-container">
              {companion.imageUrl ? (
                <img 
                  src={companion.imageUrl} 
                  alt={companion.name}
                  className="mobile-avatar"
                />
              ) : (
                <div className="mobile-avatar-placeholder">
                  {companion.name[0]}
                </div>
              )}
              <div className="mobile-online-dot"></div>
            </div>
            
            <div className="mobile-companion-info">
              <h2 className="mobile-companion-name">{companion.name}</h2>
              <p className="mobile-companion-status">Online • {companion.tagline}</p>
            </div>
          </div>
        )}

        <div className="mobile-header-actions">
          <div className="mobile-diamond-counter">
            <Gem className="w-4 h-4" />
            <span>{diamondCount}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="mobile-messages">
        {!user && (
          <div className="mobile-guest-notice">
            <p>You're chatting as a guest. Sign up to save your conversations and get more diamonds!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mobile-message ${message.sender === 'user' ? 'mobile-message-user' : 'mobile-message-companion'}`}
          >
            <div className="mobile-message-bubble">
              <p className="mobile-message-text">{message.text}</p>
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Generated" 
                  className="mobile-message-image"
                />
              )}
              <span className="mobile-message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="mobile-message mobile-message-companion">
            <div className="mobile-message-bubble">
              <div className="mobile-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mobile-input-area">
        <div className="mobile-input-container">
          <div className="mobile-input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="mobile-input"
              rows={1}
              disabled={isGenerating}
            />
          </div>
          
          <div className="mobile-input-actions">
            <button className="mobile-camera-btn" disabled={isGenerating}>
              <Camera className="w-5 h-5" />
            </button>
            
            <button 
              className="mobile-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isGenerating}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}