import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Settings, ImagePlus, User2, X, Trash2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Companion, UserPreferences } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import DiamondCounter from "@/components/DiamondCounter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { fetchApi } from "@/lib/api";
import ImageGenerator from "@/components/ImageGenerator";
import CompanionSettingsPopup from "@/components/CompanionSettingsPopup";
import WelcomePopup from "@/components/WelcomePopup";

import { analyzeEmotion, getEmotionalResponse, EmotionAnalysisResult } from "@/lib/emotionDetection";
import EmotionIndicator from "@/components/EmotionIndicator";

interface Message {
  id: string;
  content: string;
  sender: "user" | "companion";
  timestamp: Date;
  emotion?: EmotionAnalysisResult;
  emotionalResponse?: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
}

// Generate a unique ID for messages
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Chat() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  console.log(`Chat component loaded for companion ID: ${id}`);
  
  if (!id || isNaN(parseInt(id))) {
    console.error(`Invalid companion ID: ${id}`);
    return <div>Invalid companion ID</div>;
  }
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(-1);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [guestDiamonds, setGuestDiamonds] = useState(25);
  
  // Fetch the companion data
  const { data: companion, isLoading: isLoadingCompanion } = useQuery<Companion>({
    queryKey: [`/api/companions/${id}`],
    retry: false,
  });
  
  // Fetch user preferences to get diamond count
  const { data: userPrefs, isLoading: isLoadingPrefs } = useQuery<UserPreferences>({
    queryKey: [`/api/user/preferences`],
    enabled: !!user,
  });
  
  // Fetch guest session for non-logged-in users
  const { data: guestSession } = useQuery<{
    sessionId: string;
    preferredGender: string;
    messageDiamonds: number;
    accessibleCompanionIds: number[];
  }>({
    queryKey: ['/api/guest/session'],
    enabled: !user,
    retry: false,
  });
  
  // Update message diamond count mutation
  const updateDiamondsMutation = useMutation({
    mutationFn: async (updatedDiamonds: number) => {
      const res = await apiRequest('PATCH', '/api/user/preferences', { 
        messageDiamonds: updatedDiamonds 
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/preferences`] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update message diamonds',
        variant: 'destructive'
      });
    }
  });

  // Load previous messages from localStorage
  useEffect(() => {
    if (id) {
      const storedMessages = localStorage.getItem(`chat_${id}`);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          // Convert string timestamps back to Date objects
          const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDateObjects);
        } catch (error) {
          console.error("Failed to parse stored messages:", error);
        }
      } else if (companion && companion.name && companion.tagline) {
        // If no previous messages, add a welcome message
        setMessages([
          {
            id: generateId(),
            content: `Hi there! I'm ${companion.name}. ${companion.tagline} How can I make your day better?`,
            sender: "companion",
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [id, companion, user]);

  // Show welcome popup for new guest users
  useEffect(() => {
    if (!user && guestSession && !localStorage.getItem('welcomeShown')) {
      setShowWelcomePopup(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [user, guestSession]);

  // Update guest diamonds from session
  useEffect(() => {
    if (!user && guestSession) {
      setGuestDiamonds(guestSession.messageDiamonds);
    }
  }, [user, guestSession]);

  // Enhanced mobile keyboard and viewport handling
  useEffect(() => {
    const handleKeyboardOpen = () => {
      // Force input field to stay visible above keyboard
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          // Scroll the element into view
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Additional scroll adjustment for Android
          setTimeout(() => {
            window.scrollBy(0, -50);
          }, 100);
        }
      }, 250);
    };

    const handleKeyboardClose = () => {
      const messagesContainer = document.querySelector('.chat-messages-container') as HTMLElement;
      if (messagesContainer) {
        messagesContainer.style.marginBottom = '';
      }
    };

    const handleResize = () => {
      // Detect keyboard open/close by viewport height change
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.screen.height;
      
      if (viewportHeight < windowHeight * 0.75) {
        handleKeyboardOpen();
      } else {
        handleKeyboardClose();
      }
    };

    // Listen for focus events
    document.addEventListener('focusin', handleKeyboardOpen);
    document.addEventListener('focusout', handleKeyboardClose);
    
    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      document.removeEventListener('focusin', handleKeyboardOpen);
      document.removeEventListener('focusout', handleKeyboardClose);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (id && messages.length > 0) {
      localStorage.setItem(`chat_${id}`, JSON.stringify(messages));
    }
  }, [messages, id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Android status bar and keyboard detection for mobile WhatsApp-style layout
  useEffect(() => {
    // ANDROID STATUS BAR DETECTION - Critical fix for mobile
    const detectAndroidStatusBar = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes('android');
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      console.log('🔍 Device detection:', { userAgent: userAgent.substring(0, 50), isAndroid, isMobile });
      
      if (isAndroid || isMobile) {
        // Always apply Android status bar fix for mobile devices
        console.log('📱 Mobile device detected - applying status bar fix');
        document.documentElement.style.setProperty('--android-status-bar-height', '32px');
        document.body.classList.add('android-statusbar-fix');
        
        // Also log current body classes for debugging
        console.log('✅ Applied classes:', document.body.className);
        console.log('✅ CSS variable set:', getComputedStyle(document.documentElement).getPropertyValue('--android-status-bar-height'));
      } else {
        console.log('💻 Desktop detected - no status bar fix needed');
      }
    };

    // Run status bar detection
    detectAndroidStatusBar();

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleKeyboardToggle = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const isKeyboardOpen = currentHeight < initialViewportHeight * 0.8;
      
      document.body.classList.toggle('keyboard-open', isKeyboardOpen);
      
      if (isKeyboardOpen) {
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    // Listen for viewport changes (Modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleKeyboardToggle);
    }

    // Fallback for older browsers
    window.addEventListener('resize', handleKeyboardToggle);

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleKeyboardToggle);
      }
      window.removeEventListener('resize', handleKeyboardToggle);
      document.body.classList.remove('keyboard-open');
      document.body.classList.remove('android-statusbar-fix');
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Check diamond availability for both guest and registered users
    if (!user) {
      // For guest users, check current diamonds
      if (guestDiamonds <= 0) {
        toast({
          title: "Out of diamonds",
          description: "You've used all your free diamonds. Please sign up to continue chatting and get more diamonds.",
          variant: "destructive"
        });
        return;
      }
    } else if (userPrefs && typeof userPrefs.messageDiamonds === 'number' && userPrefs.messageDiamonds <= 0) {
      // Check if logged-in user has diamonds left
      toast({
        title: "Out of diamonds",
        description: "You've used all your diamonds. Please subscribe to continue chatting.",
        variant: "destructive"
      });
      return;
    }
    
    // Analyze message for emotional content
    const detectedEmotion = analyzeEmotion(message);
    
    // Add user message with emotion data
    const userMessage: Message = {
      id: generateId(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      emotion: detectedEmotion
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    
    // Update diamond count for both user types
    if (!user) {
      // For guest users, decrease local counter immediately
      setGuestDiamonds(prev => prev - 1);
      
      // Sync with backend
      try {
        const response = await fetchApi('/api/guest/diamonds/use', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ diamondsUsed: 1 }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setGuestDiamonds(data.remainingDiamonds);
        }
      } catch (error) {
        console.error('Error deducting guest diamonds:', error);
      }
    } else if (userPrefs && typeof userPrefs.messageDiamonds === 'number' && userPrefs.messageDiamonds > 0) {
      // For logged-in users, update in database
      const newDiamondCount = userPrefs.messageDiamonds - 1;
      updateDiamondsMutation.mutate(newDiamondCount);
    }
    
    // Record interaction for heatmap visualization
    if (id) {
      try {
        const now = new Date();
        // Record basic interaction with emotion data if available
        fetchApi('/api/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companionId: parseInt(id),
            userId: user?.id || null,
            date: now,
            hour: now.getHours(),
            messageCount: 1,
            emotionType: detectedEmotion.primaryEmotion.type,
            emotionIntensity: detectedEmotion.primaryEmotion.confidence,
            responseTimeMs: null // Will be populated on response
          }),
        }).catch(err => console.error('Failed to record interaction:', err));
      } catch (error) {
        console.error('Error recording interaction:', error);
        // Non-blocking, continue even if recording fails
      }
    }
    
    // Used to simulate realistic typing behavior
    const calculateTypingDelay = (text: string) => {
      // Average adult typing speed is 40 WPM, or about 200 characters per minute
      // This is about 3.33 characters per second
      const avgCharPerSec = 3.33;
      // Add randomness to make it feel more natural
      const randomFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3
      const delay = (text.length / avgCharPerSec) * 1000 * randomFactor;
      // Ensure minimum delay of 1.5 seconds and max of 6 seconds
      return Math.min(Math.max(delay, 1500), 6000);
    };
    
    // Use the new chat API with memory feature
    const sessionId = localStorage.getItem('chatSessionId') || `session_${Math.random().toString(36).substring(2, 9)}`;
    
    // Store session ID for guest users
    if (!localStorage.getItem('chatSessionId')) {
      localStorage.setItem('chatSessionId', sessionId);
    }
    
    // Prepare emotion data for API
    const emotion = {
      type: detectedEmotion.primaryEmotion.type,
      intensity: detectedEmotion.primaryEmotion.confidence.toString(),
      confidence: detectedEmotion.primaryEmotion.confidence
    };
    
    // Call the chat API - use guest endpoint for non-authenticated users
    const apiEndpoint = user ? `/api/companions/${id}/chat` : `/api/guest/chat`;
    const requestBody = user ? {
      message,
      userId: user.id,
      emotion
    } : {
      companionId: parseInt(id),
      message
    };
    
    setTimeout(() => {
      fetchApi(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Handle different response formats for guest vs authenticated users
        const responseText = data.response || data.text || data.message || "I'm having trouble responding right now.";
        
        // Update diamond count if it's a guest response
        if (!user && data.remainingDiamonds !== undefined) {
          setGuestDiamonds(data.remainingDiamonds);
        }
        
        // Calculate typing delay to make it feel natural
        const typingDelay = calculateTypingDelay(responseText);
        
        // After delay, show the companion's response
        setTimeout(() => {
          // Create companion message
          const companionMessage: Message = {
            id: generateId(),
            content: responseText,
            sender: "companion",
            timestamp: new Date(),
            emotion: data.emotion ? {
              primaryEmotion: {
                type: data.emotion,
                intensity: 'medium',
                confidence: 0.9
              },
              secondaryEmotion: {
                type: 'neutral',
                intensity: 'low',
                confidence: 0.1
              },
              overall: 'neutral'
            } : undefined
          };
          
          // Update message state
          setMessages(prev => [...prev, companionMessage]);
          
          // If we have memory context, log it (for development)
          if (data.memoryContext) {
            console.log('Memory context used:', data.memoryContext);
          }
          
          // Record interaction end time for response time tracking
          if (id) {
            try {
              const responseTime = Date.now() - new Date(userMessage.timestamp).getTime();
              fetchApi('/api/interactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  companionId: parseInt(id),
                  userId: user?.id || null,
                  messageCount: 1,
                  responseTimeMs: responseTime
                }),
              }).catch(err => console.error('Failed to record response time:', err));
            } catch (error) {
              console.error('Error recording response time:', error);
            }
          }
          
          setIsLoading(false);
        }, typingDelay);
      })
      .catch(error => {
        console.error('Error calling chat API:', error);
        toast({
          title: "Failed to get response",
          description: "There was a problem communicating with your companion. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      });
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchResultIndex(-1);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results: number[] = [];
    
    messages.forEach((msg, index) => {
      if (msg.content.toLowerCase().includes(query)) {
        results.push(index);
      }
    });
    
    setSearchResults(results);
    setCurrentSearchResultIndex(results.length > 0 ? 0 : -1);
    
    if (results.length > 0) {
      // Scroll to first result
      scrollToMessage(results[0]);
    } else {
      toast({
        title: "No results found",
        description: `No messages containing "${searchQuery}" were found.`,
        variant: "default"
      });
    }
  };
  
  const scrollToMessage = (index: number) => {
    const messageElements = document.querySelectorAll('[data-message-index]');
    if (messageElements[index]) {
      messageElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const goToNextSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchResultIndex + 1) % searchResults.length;
    setCurrentSearchResultIndex(nextIndex);
    scrollToMessage(searchResults[nextIndex]);
  };
  
  const goToPreviousSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const prevIndex = (currentSearchResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchResultIndex(prevIndex);
    scrollToMessage(searchResults[prevIndex]);
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setCurrentSearchResultIndex(-1);
  };

  // Clear chat history
  const clearChatHistory = () => {
    if (id) {
      localStorage.removeItem(`chat_${id}`);
      // Reset to welcome message only
      if (companion && companion.name && companion.tagline) {
        setMessages([
          {
            id: generateId(),
            content: `Hi there! I'm ${companion.name}. ${companion.tagline} How can I make your day better?`,
            sender: "companion",
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages([]);
      }
      toast({
        title: "Chat History Cleared",
        description: "All previous messages have been deleted.",
      });
    }
  };

  // Handle image generation start - show loading placeholder immediately
  const handleImageGenerationStart = () => {
    if (!companion) return;
    
    // Create loading message immediately
    const loadingMessage: Message = {
      id: generateId(),
      content: `I'm creating an image for you, please wait...`,
      sender: "companion",
      timestamp: new Date(),
      isLoadingImage: true
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Scroll to the new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    
    return loadingMessage.id;
  };

  // Handle generated image - replace loading message with actual image
  const handleImageGenerated = (imageUrl: string, loadingMessageId?: string) => {
    if (!imageUrl || !companion) {
      // Remove loading message if generation failed
      if (loadingMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
      }
      toast({
        title: "Error",
        description: "Failed to generate the image. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Image generated successfully, updating chat:", imageUrl.substring(0, 50) + "...");
    
    // Update the loading message with the actual image
    setMessages(prev => prev.map(msg => {
      if (loadingMessageId && msg.id === loadingMessageId) {
        return {
          ...msg,
          content: `I created this image for you${companion ? ", hope you like it!" : "!"}`,
          imageUrl: imageUrl,
          isLoadingImage: false
        };
      }
      return msg;
    }));
    
    setShowImageGenerator(false);
    
    // Scroll to the updated message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="whatsapp-chat-app">
      <Toaster />
      
      {/* Image Generator Modal */}
      {showImageGenerator && companion && (
        <ImageGenerator
          companion={companion}
          onImageGenerated={handleImageGenerated}
          onGenerationStart={handleImageGenerationStart}
          onClose={() => setShowImageGenerator(false)}
          isPremium={user?.isPremium || false}
          sessionId={user ? undefined : (guestSession as any)?.sessionId}
          diamonds={user ? (userPrefs?.messageDiamonds ?? 0) : ((guestSession as any)?.messageDiamonds ?? 25)}
        />
      )}
      
      {/* Profile Picture Popup Modal (WhatsApp Style) */}
      {showProfilePicture && companion && companion.imageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setShowProfilePicture(false)}
        >
          <div 
            className="relative max-w-[90%] max-h-[90%] animate-in fade-in-50 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button positioned at top right */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              onClick={() => setShowProfilePicture(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="object-contain relative">
              <img 
                src={companion.imageUrl} 
                alt={companion.name} 
                className="max-h-[85vh] max-w-full object-contain rounded-md"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-4 py-2 text-sm">
                {companion.name} • {companion.tagline}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Popup */}
      {showSettings && companion && (
        <CompanionSettingsPopup
          open={showSettings}
          onOpenChange={setShowSettings}
          companion={companion}
        />
      )}
      
      {/* PART 1: FIXED HEADER - Never scrolls, always visible */}
      <header className="whatsapp-header">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="flex items-center justify-center"
              onClick={() => setLocation(user ? '/dashboard' : '/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {isLoadingCompanion ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar 
                  className="h-10 w-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all" 
                  onClick={() => setShowProfilePicture(true)}
                >
                  {companion?.imageUrl ? (
                    <AvatarImage 
                      src={companion.imageUrl} 
                      alt={companion.name}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback>
                    {companion?.name ? companion.name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{companion?.name}</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{companion?.tagline}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isSearching && (
              <div className="flex items-center gap-1 bg-pink-50 text-pink-700 px-2 py-1 rounded-full border border-pink-200 mr-2">
                <span className="text-xs font-medium">💎</span>
                <span className="text-xs font-semibold">
                  {!user ? guestDiamonds : (userPrefs?.messageDiamonds || 0)}
                </span>
              </div>
            )}
            
            {!isSearching ? (
              <Button 
                variant="outline" 
                size="icon"
                className="flex items-center justify-center h-10 w-10"
                onClick={() => setIsSearching(true)}
                title="Search messages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </Button>
            ) : (
              <div className="flex items-center bg-muted rounded-md border border-input overflow-hidden">
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent focus:outline-none px-3 py-1 min-w-[120px] sm:min-w-[180px] text-sm"
                  autoFocus
                />
                <div className="flex">
                  {searchResults.length > 0 && (
                    <div className="text-xs text-muted-foreground px-1 flex items-center">
                      {currentSearchResultIndex + 1}/{searchResults.length}
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={goToPreviousSearchResult}
                        title="Previous result"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={goToNextSearchResult}
                        title="Next result"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={handleSearch}
                    title="Search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={clearSearch}
                    title="Close search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                      <path d="M18 6 6 18"/>
                      <path d="m6 6 12 12"/>
                    </svg>
                  </Button>
                </div>
              </div>
            )}
            
            {companion && (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="flex items-center justify-center h-10 w-10"
                  onClick={clearChatHistory}
                  title="Clear chat history"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="flex items-center justify-center h-10 w-10"
                  onClick={() => setShowSettings(true)}
                  title="Companion settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* PART 2: SCROLLABLE MESSAGES AREA - Auto-scrolls with new messages */}
      <div className="whatsapp-messages">
        {/* Guest User Notice */}
        {!user && showGuestNotice && (
          <div className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div className="text-sm flex-1">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">Guest Mode - No History Saved</p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Your conversations are not saved and will be lost when you leave this page. 
                  <span className="font-medium"> Sign up to save your chat history and get more diamonds!</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 flex-shrink-0"
                onClick={() => setShowGuestNotice(false)}
                title="Close notification"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`chat-message-container flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              data-message-index={i}
              style={{
                backgroundColor: searchResults.includes(i)
                  ? "rgba(255, 255, 0, 0.1)"
                  : "transparent",
              }}
            >
              {msg.sender === "companion" && companion && (
                <Avatar className="h-8 w-8 flex-shrink-0 mr-2 self-end mb-1">
                  {companion.imageUrl ? (
                    <AvatarImage src={companion.imageUrl} alt={companion.name} />
                  ) : null}
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                    {companion.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={
                  msg.sender === "user"
                    ? "whatsapp-user px-3 py-2 max-w-xs break-words"
                    : "whatsapp-companion px-3 py-2 max-w-xs break-words"
                }
              >
                    {/* If the message has an image or is loading, display it */}
                    {msg.isLoadingImage && (
                      <div className="mb-2 flex items-center justify-center p-8 bg-muted/50 rounded-md">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                          <span className="text-xs text-muted-foreground">Generating image...</span>
                        </div>
                      </div>
                    )}
                    {msg.imageUrl && !msg.isLoadingImage && (
                      <div className="mb-2">
                        <img
                          src={msg.imageUrl}
                          alt="Generated image"
                          className="rounded-md max-w-full"
                          style={{ maxHeight: "300px" }}
                        />
                      </div>
                    )}
                    
                    {/* Message text content */}
                    <div className="text-sm whitespace-pre-wrap">
                      {/* If companion message has an emotion, show indicator */}
                      {msg.sender === "companion" && msg.emotion && (
                        <EmotionIndicator emotion={msg.emotion} />
                      )}
                      
                      {msg.content}
                    </div>
                    
                    {/* Time display */}
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === "user"
                          ? "text-gray-700"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                </div>
                
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0 ml-2 self-end mb-1">
                    <AvatarFallback className="bg-pink-500 text-white text-xs">
                      <User2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
            </div>
          ))}
          
          {/* Loading indicator for companion response */}
          {isLoading && (
            <div className="flex justify-start mb-2">
              {companion && (
                <Avatar className="h-8 w-8 flex-shrink-0 mr-2 self-end mb-1">
                  {companion.imageUrl ? (
                    <AvatarImage src={companion.imageUrl} alt={companion.name} />
                  ) : null}
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                    {companion?.name ? companion.name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="whatsapp-companion px-3 py-2 max-w-xs">
                <div className="flex space-x-1 items-center">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "300ms" }}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "600ms" }}></div>
                  <span className="text-xs text-gray-500 ml-2">typing...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* PART 3: FIXED INPUT AREA - Moves up with keyboard */}
      <div className="whatsapp-input">
        <div className="flex items-center gap-2">
          {companion && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImageGenerator(true)}
              className="flex-shrink-0"
              title="Generate an image"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative flex-1">
            <Textarea
              placeholder={`Message ${companion?.name || ''}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] w-full resize-none rounded-md border border-input bg-background pr-12"
            />
            <div className="absolute bottom-3 right-3">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={isLoading || message.trim() === ""}
                className={`h-8 w-8 rounded-full ${isLoading ? 'opacity-50' : message.trim() ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subscription reminder */}
        {!user && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            <span>
              You're in guest mode. <a href="/auth" className="text-primary hover:underline">Sign up</a> to save conversations and access more companions.
            </span>
          </div>
        )}
      </div>

      {/* Welcome popup for new guest users */}
      <WelcomePopup 
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        diamonds={guestDiamonds}
      />
    </div>
  );
}