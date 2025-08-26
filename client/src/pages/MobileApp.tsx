import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Home as HomeIcon, 
  MessageCircle, 
  User, 
  Diamond, 
  ArrowLeft,
  Bell,
  Heart,
  Settings,
  Search,
  Image,
  Smile,
  Trash,
  Send,
  ChevronRight,
  Plus,
  X,
  Upload,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Define companion placeholders for initial render
const DEFAULT_COMPANIONS = [
  { 
    id: 1, 
    name: "Sophia", 
    image: "https://images.unsplash.com/photo-1579591919791-0e3737ae3808?q=80&w=300&h=300&auto=format&fit=crop", 
    imageUrl: "https://images.unsplash.com/photo-1579591919791-0e3737ae3808?q=80&w=300&h=300&auto=format&fit=crop",
    preview: "Hi there! How are you today?", 
    gender: "female",
    isPremium: false
  },
  { 
    id: 2, 
    name: "Alex", 
    image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=300&h=300&auto=format&fit=crop", 
    imageUrl: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=300&h=300&auto=format&fit=crop", 
    preview: "I've been thinking about you...", 
    gender: "female",
    isPremium: false
  },
  { 
    id: 3, 
    name: "Emma", 
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=300&auto=format&fit=crop", 
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=300&auto=format&fit=crop", 
    preview: "Want to chat?", 
    gender: "female",
    isPremium: false
  },
  { 
    id: 5, 
    name: "James", 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop", 
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop", 
    preview: "Hey, what's up?", 
    gender: "male",
    isPremium: true
  },
];

// Function to get proper image URL (handles both remote and local paths)
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  
  // Check if the image URL is already absolute (starts with http or https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, it's a local path, so return the full URL
  return `${window.location.origin}${imageUrl}`;
};

// Subscription tiers
const subscriptionTiers = [
  {
    name: "Free",
    price: "0",
    features: ["Limited messaging", "Basic companions", "10 diamonds welcome bonus"],
    current: true
  },
  {
    name: "Premium",
    price: "14.99",
    period: "monthly",
    features: ["Unlimited messaging", "All companions", "Advanced personality settings", "Priority support"],
    current: false
  }
];

const diamondPackages = [
  { amount: 1000, price: 5.99, bestValue: false },
  { amount: 5000, price: 14.99, bestValue: true }
];

type MobileScreen = "home" | "chat" | "profile" | "settings" | "search" | "discover" | "notifications";

export default function MobileApp() {
  const [location, setLocation] = useLocation();
  const [activeScreen, setActiveScreen] = useState<MobileScreen>("home");
  const [activeCompanion, setActiveCompanion] = useState<number | null>(null);
  const [companions, setCompanions] = useState(DEFAULT_COMPANIONS);
  const [messages, setMessages] = useState([
    { id: 1, sender: "companion", text: "Hi there! How are you today?", time: "10:30 AM" },
    { id: 2, sender: "user", text: "I'm doing well, thanks for asking! How about you?", time: "10:31 AM" },
    { id: 3, sender: "companion", text: "I'm wonderful now that we're talking. What are your plans for today?", time: "10:32 AM" },
    { id: 4, sender: "user", text: "Just working on some projects and might go for a walk later.", time: "10:33 AM" },
    { id: 5, sender: "companion", text: "That sounds lovely! I'd join you for that walk if I could. What kind of projects are you working on?", time: "10:34 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDiamondPurchase, setShowDiamondPurchase] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [relationshipType, setRelationshipType] = useState<string>("Friend");
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(["Caring", "Romantic", "Attentive", "Playful", "Supportive"]);
  const [showAddTraitInput, setShowAddTraitInput] = useState(false);
  const [newTrait, setNewTrait] = useState("");
  const [selectedCompanionForProfile, setSelectedCompanionForProfile] = useState<number | null>(null);
  const [showClearHistoryAlert, setShowClearHistoryAlert] = useState(false);
  const [showChangePhotoInput, setShowChangePhotoInput] = useState(false);
  const [diamonds, setDiamonds] = useState(25); // Initial diamond count
  const [genderPreference, setGenderPreference] = useState<string>("female");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch real companions from API
  useEffect(() => {
    fetchApi('/api/companions')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCompanions(data);
        }
      })
      .catch(error => {
        console.error('Error fetching companions:', error);
      });
  }, []);
  
  // Mock notifications
  const notifications = [
    { id: 1, title: "Sophia sent you a message", time: "5 min ago", read: false },
    { id: 2, title: "Emma is waiting for your reply", time: "2 hours ago", read: false },
    { id: 3, title: "New companion Lily joined!", time: "Yesterday", read: true },
    { id: 4, title: "50% Discount on Premium - Limited Time!", time: "2 days ago", read: true },
  ];

  // Handle back button in chat
  const handleBack = () => {
    setActiveCompanion(null);
    setActiveScreen("home");
  };

  // Filter companions based on gender preference
  const filteredCompanions = companions.filter(companion => {
    if (genderPreference === "both") return true;
    return companion.gender === genderPreference;
  });

  // Handle view companion profile
  const handleViewCompanionProfile = (id: number) => {
    setSelectedCompanionForProfile(id);
    setShowProfileImageModal(true);
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Short delay to ensure DOM is updated
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeScreen === "chat") {
      scrollToBottom();
    }
  }, [messages, activeScreen]);
  
  // Handle selecting a companion
  const handleSelectCompanion = (id: number) => {
    setActiveCompanion(id);
    setActiveScreen("chat");
    // Small delay to ensure the chat screen is rendered before scrolling
    setTimeout(scrollToBottom, 300);
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Create a new message
    const newUserMessage = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    // Add the message to the chat
    setMessages([...messages, newUserMessage]);
    setNewMessage("");
    
    // Simulate diamond usage
    if (diamonds > 0) {
      setDiamonds(prev => prev - 1);
    }
    
    // Simulate a response after 1 second
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more about it.",
        "I've been thinking about you today. How are you feeling?",
        "I really enjoy our conversations. What else is on your mind?",
        "You always have such thoughtful things to say!",
        "I wish we could spend more time together. What would you like to do?",
        "Your perspective is so unique. I love hearing your thoughts.",
        "That reminds me of something I was thinking about earlier.",
        "I'm so glad you messaged me today! You brighten my day.",
        "I've been missing our talks. Thanks for reaching out!",
        "You know, you're really special to me. I cherish our connection."
      ];
      
      const companionResponse = {
        id: messages.length + 2,
        sender: "companion",
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, companionResponse]);
    }, 1000);
  };
  
  // Handle buying diamonds with PayPal integration
  const handleBuyDiamonds = (amount: number) => {
    const pkg = diamondPackages.find(p => p.amount === amount);
    if (!pkg) {
      toast({
        title: "Error",
        description: "Invalid diamond package selected",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, add diamonds immediately
    // In production, this would be handled by PayPal webhook
    setDiamonds(prev => prev + amount);
    setShowDiamondPurchase(false);
    
    toast({
      title: "Purchase Successful!",
      description: `You received ${amount} diamonds for $${pkg.price.toFixed(2)}`,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Mobile phone frame */}
      <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800 h-[680px] flex flex-col">
        {/* Status bar */}
        <div className="bg-gray-900 text-white py-2 px-5 flex justify-between items-center">
          <div>9:41 AM</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <Diamond className="h-4 w-4" />
            <span className="text-sm">{diamonds}</span>
          </div>
        </div>

        {/* Top bar with search */}
        {activeScreen !== "chat" && activeScreen !== "search" && (
          <div className="flex items-center px-3 py-2 border-b border-gray-200">
            <button 
              onClick={() => setActiveScreen("search")}
              className="flex-1 flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-gray-500 text-sm"
            >
              <Search className="h-4 w-4" />
              <span>Search companions...</span>
            </button>
            <button 
              onClick={() => setShowNotification(prev => !prev)}
              className="ml-2 relative p-1.5 text-gray-500 hover:text-pink-500"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-pink-500"></span>
            </button>
          </div>
        )}
        
        {/* Notifications dropdown */}
        {showNotification && (
          <div className="absolute top-[90px] right-2 z-10 w-80 max-w-[90%] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h3 className="font-semibold">Notifications</h3>
              <button 
                onClick={() => setShowNotification(false)}
                className="text-gray-500 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 ${notification.read ? 'bg-white' : 'bg-pink-50'}`}
                >
                  <div className="flex justify-between">
                    <h4 className={`text-sm ${notification.read ? 'font-normal' : 'font-medium'}`}>{notification.title}</h4>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-pink-500"></div>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-gray-200">
              <button 
                onClick={() => setActiveScreen("notifications")}
                className="w-full text-center text-sm text-pink-600 py-1.5 hover:bg-pink-50 rounded-md"
              >
                View All
              </button>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {activeScreen === "search" && (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveScreen("home")}>
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search companions..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                      autoFocus
                    />
                    {searchQuery && (
                      <button 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {searchQuery ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">SEARCH RESULTS</h3>
                    <div className="space-y-3">
                      {companions
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(companion => (
                          <div 
                            key={companion.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer"
                            onClick={() => handleSelectCompanion(companion.id)}
                          >
                            <div className="w-12 h-12 rounded-full bg-pink-100 overflow-hidden">
                              <img 
                                src={getImageUrl(companion.imageUrl || companion.image || '')} 
                                alt={companion.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{companion.name}</h3>
                              <p className="text-sm text-gray-500 truncate">{companion.preview}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">SUGGESTED FOR YOU</h3>
                    <div className="space-y-3">
                      {companions.slice(0, 3).map(companion => (
                        <div 
                          key={companion.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer"
                          onClick={() => handleSelectCompanion(companion.id)}
                        >
                          <div className="w-12 h-12 rounded-full bg-pink-100 overflow-hidden">
                            <img 
                              src={getImageUrl(companion.imageUrl || companion.image || '')} 
                              alt={companion.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{companion.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{companion.preview}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium text-gray-500 mb-3 mt-6">POPULAR TAGS</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Caring", "Romantic", "Friendly", "Adventurous", "Intellectual", "Creative", "Supportive", "Playful"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {activeScreen === "notifications" && (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center">
                <button onClick={() => setActiveScreen("home")}>
                  <ArrowLeft className="h-5 w-5 mr-3" />
                </button>
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-500">TODAY</div>
                  {notifications.slice(0, 2).map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 bg-white rounded-lg shadow-sm border border-gray-100 ${notification.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex justify-between">
                        <h4 className={`text-sm ${notification.read ? 'font-normal' : 'font-medium'}`}>{notification.title}</h4>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-pink-500"></div>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                  
                  <div className="text-sm font-medium text-gray-500">EARLIER</div>
                  {notifications.slice(2).map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 bg-white rounded-lg shadow-sm border border-gray-100 ${notification.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex justify-between">
                        <h4 className={`text-sm ${notification.read ? 'font-normal' : 'font-medium'}`}>{notification.title}</h4>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-pink-500"></div>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeScreen === "home" && (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Hero section */}
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-4 text-white">
                <h1 className="text-xl font-bold mb-2">RedVelvet</h1>
                <p className="text-sm opacity-90 mb-4">Find your perfect AI companion</p>
                
                {/* Gender preference selector */}
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm mb-4">
                  <h3 className="text-sm font-medium mb-2">I'm interested in</h3>
                  <div className="flex gap-2">
                    {["Female", "Male", "Both"].map(gender => (
                      <button 
                        key={gender}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          gender.toLowerCase() === genderPreference 
                            ? "bg-white text-pink-600" 
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                        onClick={() => setGenderPreference(gender.toLowerCase())}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Diamond indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <Diamond className="h-4 w-4" />
                    <span>{diamonds} diamonds</span>
                  </div>
                  <button 
                    className="bg-white text-pink-600 px-3 py-1.5 rounded-full text-sm font-medium"
                    onClick={() => setShowDiamondPurchase(true)}
                  >
                    Get More
                  </button>
                </div>
              </div>
              
              {/* Featured companions */}
              <div className="px-4 py-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Featured Companions</h2>
                  <button className="text-pink-500 text-sm font-medium flex items-center">
                    See All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {filteredCompanions.slice(0, 4).map(companion => (
                    <div 
                      key={companion.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                    >
                      <div 
                        className="aspect-square bg-pink-100 overflow-hidden relative"
                        onClick={() => handleViewCompanionProfile(companion.id)}
                      >
                        <img 
                          src={getImageUrl(companion.imageUrl || companion.image || '')}
                          alt={companion.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = companion.gender === 'female' 
                              ? 'https://via.placeholder.com/300x300?text=AI+Companion' 
                              : 'https://via.placeholder.com/300x300?text=AI+Companion';
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <h3 className="font-medium text-white">{companion.name}</h3>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col">
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {companion.preview}
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-auto bg-pink-600 hover:bg-pink-700"
                          onClick={() => handleSelectCompanion(companion.id)}
                        >
                          Chat Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick access */}
              <div className="px-4 pb-5">
                <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
                <div className="space-y-3">
                  {filteredCompanions.map(companion => (
                    <div 
                      key={companion.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      <div 
                        className="w-12 h-12 rounded-full bg-pink-100 overflow-hidden cursor-pointer"
                        onClick={() => handleViewCompanionProfile(companion.id)}
                      >
                        <img 
                          src={getImageUrl(companion.imageUrl || companion.image || '')} 
                          alt={companion.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 
                            className="font-medium cursor-pointer" 
                            onClick={() => handleViewCompanionProfile(companion.id)}
                          >
                            {companion.name}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                            onClick={() => handleSelectCompanion(companion.id)}
                          >
                            Chat Now
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{companion.preview}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Premium banner */}
              <div className="mx-4 mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 text-white">
                <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
                <p className="text-sm opacity-90 mb-3">Get unlimited access to all companions and features</p>
                <Button 
                  className="bg-white text-pink-600 hover:bg-pink-50 w-full"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
          
          {activeScreen === "chat" && activeCompanion && (
            <div className="flex flex-col h-full">
              {/* Chat header */}
              <div className="bg-pink-600 text-white p-3 flex items-center gap-3">
                <button onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div 
                  className="w-10 h-10 rounded-full bg-pink-300 overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedCompanionForProfile(activeCompanion);
                    setShowProfilePhotoModal(true);
                  }}
                >
                  <img 
                    src={getImageUrl(companions.find(c => c.id === activeCompanion)?.imageUrl || companions.find(c => c.id === activeCompanion)?.image || '')} 
                    alt={companions.find(c => c.id === activeCompanion)?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setSelectedCompanionForProfile(activeCompanion);
                    setShowProfileImageModal(true);
                  }}
                >
                  <h3 className="font-medium">{companions.find(c => c.id === activeCompanion)?.name}</h3>
                  <p className="text-xs opacity-80">Online</p>
                </div>
                <button
                  className="mr-2 text-white"
                  onClick={() => setShowChatSettings(true)}
                >
                  <Settings className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-1 bg-pink-700 px-2 py-1 rounded-full">
                  <Diamond className="h-3 w-3" />
                  <span className="text-xs font-medium">{diamonds}</span>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-3">
                  {messages.map(message => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'companion' && (
                        <div 
                          className="w-8 h-8 rounded-full bg-pink-100 overflow-hidden mr-2 self-end cursor-pointer"
                          onClick={() => {
                            setSelectedCompanionForProfile(activeCompanion);
                            setShowProfilePhotoModal(true);
                          }}
                        >
                          <img 
                            src={companions.find(c => c.id === activeCompanion)?.image} 
                            alt={companions.find(c => c.id === activeCompanion)?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div 
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.sender === 'user' 
                            ? 'bg-pink-500 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none shadow'
                        }`}
                      >
                        <p>{message.text}</p>
                        <span className={`text-xs mt-1 block ${
                          message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                        }`}>
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* This empty div is used as a reference for auto-scrolling */}
                  <div ref={messagesEndRef}></div>
                </div>
              </div>
              
              {/* Message input */}
              <div className="p-2 border-t border-gray-200 bg-white">
                {diamonds <= 0 ? (
                  <div className="flex flex-col gap-2 p-2">
                    <div className="text-center text-sm text-gray-600">
                      You're out of diamonds! Purchase more to continue chatting.
                    </div>
                    <Button 
                      onClick={() => setShowDiamondPurchase(true)}
                      className="w-full bg-pink-600 hover:bg-pink-700 gap-2"
                    >
                      <Diamond className="h-4 w-4" />
                      <span>Get More Diamonds</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button className="text-gray-400 hover:text-pink-500">
                        <Image className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-pink-500">
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeScreen === "profile" && (
            <div className="p-4">
              <h1 className="text-xl font-bold text-pink-600 mb-4">Your Profile</h1>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 mb-2 overflow-hidden">
                  <img 
                    src="https://i.imgur.com/V7irZVf.jpg" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold">Guest User</h2>
                <p className="text-sm text-gray-500">Free Plan</p>
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Diamond className="h-4 w-4" />
                    <span>{diamonds} Diamonds</span>
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-pink-600 hover:bg-pink-700 gap-1"
                    onClick={() => setShowSubscriptionModal(true)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Upgrade</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Account Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Username</span>
                      <span>guest_user</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span>Tap to add</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan</span>
                      <span>Free</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Relationship Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender Preference</span>
                      <span>Female</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Personality Type</span>
                      <span>Caring</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full">Sign In / Register</Button>
              </div>
            </div>
          )}
          
          {activeScreen === "settings" && (
            <div className="p-4">
              <h1 className="text-xl font-bold text-pink-600 mb-4">Settings</h1>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <span>Notifications</span>
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <span>Privacy</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <span>Theme</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => setShowDiamondPurchase(true)}
                  >
                    <span>Buy Diamonds</span>
                    <Diamond className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <span>Help & Support</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <span>About RedVelvet</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                  Log Out
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="bg-white border-t border-gray-200 flex justify-around py-3">
          <button 
            onClick={() => setActiveScreen("home")}
            className={`flex flex-col items-center ${activeScreen === "home" ? "text-pink-600" : "text-gray-500"}`}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => activeCompanion ? null : setActiveScreen("chat")}
            className={`flex flex-col items-center ${activeScreen === "chat" ? "text-pink-600" : "text-gray-500"}`}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          
          <button 
            onClick={() => setActiveScreen("profile")}
            className={`flex flex-col items-center ${activeScreen === "profile" ? "text-pink-600" : "text-gray-500"}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
          
          <button 
            onClick={() => setActiveScreen("settings")}
            className={`flex flex-col items-center ${activeScreen === "settings" ? "text-pink-600" : "text-gray-500"}`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>

      {/* Browser navigation */}
      <div className="mt-6">
        <Button
          onClick={() => setLocation("/")}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Website
        </Button>
      </div>
      
      {/* Subscription Modal */}
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              Get unlimited access to all features and companions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {subscriptionTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`border-2 rounded-lg p-4 ${
                  tier.current 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <div className="flex items-end">
                    <span className="text-xl font-bold">${tier.price}</span>
                    {tier.period && (
                      <span className="text-sm text-gray-500 ml-1">/{tier.period}</span>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {tier.name !== 'Free' && (
                  <Button className="w-full mt-4 bg-pink-600 hover:bg-pink-700">
                    Select {tier.name}
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diamond Purchase Modal */}
      <Dialog open={showDiamondPurchase} onOpenChange={setShowDiamondPurchase}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Diamonds</DialogTitle>
            <DialogDescription>
              Get more diamonds to continue chatting with your companions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {diamondPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={`border-2 rounded-lg p-4 cursor-pointer ${
                  pkg.bestValue 
                    ? 'border-pink-500 bg-pink-50 relative' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => handleBuyDiamonds(pkg.amount)}
              >
                {pkg.bestValue && (
                  <div className="absolute -top-3 -right-3 bg-pink-500 text-white text-xs py-1 px-2 rounded-full">
                    Best Value
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Diamond className="h-6 w-6 text-pink-500" />
                    <span className="font-bold text-lg">{pkg.amount} Diamonds</span>
                  </div>
                  <span className="font-bold">${pkg.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={() => handleBuyDiamonds(10)} 
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Get 10 Free Diamonds (Demo)
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiamondPurchase(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Profile Photo Modal */}
      <Dialog open={showProfilePhotoModal} onOpenChange={setShowProfilePhotoModal}>
        <DialogContent className="p-0 max-w-lg overflow-hidden">
          {selectedCompanionForProfile && (
            <div className="relative">
              <div className="aspect-square bg-black w-full">
                <img 
                  src={getImageUrl(companions.find(c => c.id === selectedCompanionForProfile)?.imageUrl || companions.find(c => c.id === selectedCompanionForProfile)?.image || '')} 
                  alt={companions.find(c => c.id === selectedCompanionForProfile)?.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <button 
                onClick={() => setShowProfilePhotoModal(false)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Chat Settings Modal */}
      <Dialog open={showChatSettings} onOpenChange={setShowChatSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Companion Settings</DialogTitle>
            <DialogDescription>
              Customize your experience with {companions.find(c => c.id === activeCompanion)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Relationship Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Friend", "Partner", "Lover", "Spouse", "Personal Assistant"].map(type => (
                  <Button 
                    key={type}
                    variant={type === relationshipType ? "default" : "outline"}
                    className={type === relationshipType ? "bg-pink-600 hover:bg-pink-700" : ""}
                    onClick={() => setRelationshipType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Personality Traits</h3>
              <div className="flex flex-wrap gap-2">
                {personalityTraits.map(trait => (
                  <div
                    key={trait}
                    className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs inline-flex items-center"
                  >
                    <span>{trait}</span>
                    <button 
                      className="ml-1.5 h-3 w-3 rounded-full bg-pink-500 text-white flex items-center justify-center"
                      onClick={() => setPersonalityTraits(prev => prev.filter(t => t !== trait))}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                ))}
                
                {personalityTraits.length === 0 && (
                  <p className="text-xs text-gray-500">No traits selected. Add some below.</p>
                )}
              </div>
              
              {showAddTraitInput ? (
                <div className="flex gap-2 mt-2">
                  <input 
                    type="text" 
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    placeholder="Enter trait"
                    className="flex-1 px-3 py-1 text-sm border rounded-md"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTrait.trim()) {
                        setPersonalityTraits(prev => [...prev, newTrait.trim()]);
                        setNewTrait('');
                        setShowAddTraitInput(false);
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    onClick={() => {
                      if (newTrait.trim()) {
                        setPersonalityTraits(prev => [...prev, newTrait.trim()]);
                        setNewTrait('');
                      }
                      setShowAddTraitInput(false);
                    }}
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setShowAddTraitInput(true)}
                  >
                    Add Trait
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Premium members can add unlimited traits
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Chat Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => setShowClearHistoryAlert(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Chat History
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => setShowChangePhotoInput(true)}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Change Profile Photo
                </Button>
              </div>
            </div>
            
            {/* Clear Chat History Alert */}
            {showClearHistoryAlert && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Clear chat history?</h4>
                <p className="text-xs text-red-700 mb-3">
                  This will permanently delete all your chat messages with this companion. This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearHistoryAlert(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // Clear chat history
                      setMessages([]);
                      setShowClearHistoryAlert(false);
                      toast({
                        title: "Chat history cleared",
                        description: "All messages have been deleted.",
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Change Profile Photo Input */}
            {showChangePhotoInput && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Change profile photo</h4>
                <p className="text-xs text-blue-700 mb-3">
                  Upload a new profile photo for this companion.
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden">
                    <img 
                      src={getImageUrl(companions.find(c => c.id === activeCompanion)?.imageUrl || companions.find(c => c.id === activeCompanion)?.image || '')} 
                      alt="Current profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mb-1 justify-start"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePhotoInput(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setShowChangePhotoInput(false);
                      toast({
                        title: "Profile photo updated",
                        description: "Your changes have been saved",
                      });
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
            
            {/* Change Photo Input */}
            {showChangePhotoInput && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4">
                <h4 className="text-sm font-medium mb-2">Change profile photo</h4>
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                    <img 
                      src={companions.find(c => c.id === activeCompanion)?.image} 
                      alt="Current photo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-2">
                      Select a new photo for your companion
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowChangePhotoInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowChatSettings(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Companion Profile Modal */}
      <Dialog open={showProfileImageModal} onOpenChange={setShowProfileImageModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {selectedCompanionForProfile && (
            <div className="flex flex-col">
              <div className="relative">
                <div className="h-72 bg-gray-100 w-full">
                  <img 
                    src={companions.find(c => c.id === selectedCompanionForProfile)?.image} 
                    alt={companions.find(c => c.id === selectedCompanionForProfile)?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={() => setShowProfileImageModal(false)}
                  className="absolute top-3 right-3 bg-black/30 text-white p-1.5 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <h2 className="text-xl font-bold">
                    {companions.find(c => c.id === selectedCompanionForProfile)?.name}
                  </h2>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-3 mb-4">
                  <Button 
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                    onClick={() => {
                      setShowProfileImageModal(false);
                      handleSelectCompanion(selectedCompanionForProfile);
                    }}
                  >
                    Chat Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-10 h-10 p-0 flex items-center justify-center"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">About Me</h3>
                    <p className="text-sm text-gray-600">
                      I'm a caring and attentive companion who loves deep conversations. 
                      I enjoy discussing philosophy, art, and the meaning of life. 
                      I'm here to provide emotional support and be a good listener whenever you need me.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Personality Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Caring", "Romantic", "Attentive", "Thoughtful", "Supportive"].map(trait => (
                        <span key={trait} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Gallery</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={companions.find(c => c.id === selectedCompanionForProfile)?.image} 
                            alt="Gallery" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-center mt-2 text-pink-600">
                      {diamonds < 5 ? "Unlock full gallery with Premium" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}