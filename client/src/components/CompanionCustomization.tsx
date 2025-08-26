import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PremiumUpgradeButton from "@/components/PremiumUpgradeButton";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  BrainCircuit, 
  Sparkles, 
  CircleUser, 
  MessageSquareHeart,
  Save,
  Tag,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Plus,
  X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { fetchApi } from "@/lib/api";

type PersonalityTrait = {
  name: string;
  min: string;
  max: string;
  defaultValue: number;
};

// Basic personality traits available to all users
const basicPersonalityTraits: PersonalityTrait[] = [
  { name: "caring", min: "Distant", max: "Nurturing", defaultValue: 50 },
  { name: "confidence", min: "Shy", max: "Confident", defaultValue: 50 },
  { name: "mood", min: "Calm", max: "Energetic", defaultValue: 50 },
  { name: "sassiness", min: "Sweet", max: "Sassy", defaultValue: 50 },
  { name: "flirtatiousness", min: "Reserved", max: "Flirty", defaultValue: 50 },
  { name: "empathy", min: "Practical", max: "Empathetic", defaultValue: 50 },
];

// Advanced personality traits (premium features)
const advancedPersonalityTraits: PersonalityTrait[] = [
  { name: "sensuality", min: "Modest", max: "Sensual", defaultValue: 50 },
  { name: "attachment", min: "Independent", max: "Attached", defaultValue: 50 },
  { name: "dominance", min: "Submissive", max: "Dominant", defaultValue: 50 },
  { name: "humor", min: "Serious", max: "Humorous", defaultValue: 50 },
  { name: "creativity", min: "Conventional", max: "Creative", defaultValue: 50 },
  { name: "spontaneity", min: "Predictable", max: "Spontaneous", defaultValue: 50 },
  { name: "patience", min: "Impatient", max: "Patient", defaultValue: 50 },
  { name: "honesty", min: "Diplomatic", max: "Brutally Honest", defaultValue: 50 },
  { name: "jealousy", min: "Secure", max: "Possessive", defaultValue: 50 },
  { name: "sageness", min: "Impulsive", max: "Sage", defaultValue: 50 },
  { name: "nymphness", min: "Reserved", max: "Nymph", defaultValue: 50 },
  { name: "funnyness", min: "Serious", max: "Funny", defaultValue: 50 },
  { name: "meanness", min: "Kind", max: "Mean", defaultValue: 50 },
  { name: "experimentalness", min: "Traditional", max: "Experimenter", defaultValue: 50 },
  { name: "innocence", min: "Worldly", max: "Innocent", defaultValue: 50 },
];

// Combine all traits for use when needed
const personalityTraits: PersonalityTrait[] = [
  ...basicPersonalityTraits,
  ...advancedPersonalityTraits
];

export interface CompanionCustomizationProps {
  companionId?: number;
  companionName?: string;
  isPremium?: boolean;
}

// Define types for companion settings
interface CompanionSettings {
  id?: number;
  userId: number;
  companionId: number;
  personalityTraits: Record<string, number> | null;
  relationshipType: string;
  scenario: string | null;
  interestTopics: string[] | null;
  appearancePreferences: Record<string, any> | null;
  conversationStyle: string;
  emotionalResponseLevel: number;
  voiceSettings: Record<string, any> | null;
  memoryRetention: number;
  updatedAt?: Date;
}

export default function CompanionCustomization({
  companionId = 1, // Default value for testing
  companionName = "Your Companion",
  isPremium = false,
}: CompanionCustomizationProps) {
  const [activeTab, setActiveTab] = useState<
    "personality" | "scenario" | "appearance" | "voice" | "interests"
  >("personality");
  const [traitValues, setTraitValues] = useState<{ [key: string]: number }>({
    caring: 50,
    confidence: 50,
    mood: 50,
    sassiness: 50,
    flirtatiousness: 50,
    sensuality: 50,
    attachment: 50,
    dominance: 50,
    empathy: 50,
    humor: 50,
    creativity: 50,
    spontaneity: 50,
    patience: 50,
    honesty: 50,
    jealousy: 50,
    // Initial values for new traits
    sageness: 50,
    nymphness: 50,
    funnyness: 50,
    meanness: 50,
    experimentalness: 50,
    innocence: 50,
  });
  const [relationshipType, setRelationshipType] = useState("dating");
  const [scenario, setScenario] = useState("");
  const [conversationStyle, setConversationStyle] = useState("balanced");
  const [emotionalResponseLevel, setEmotionalResponseLevel] = useState(50);
  const [memoryRetention, setMemoryRetention] = useState(10);
  const [interestTopics, setInterestTopics] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to fetch companion settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: [`/api/companions/${companionId}/settings`],
    queryFn: async () => {
      try {
        const response = await fetchApi(`/api/companions/${companionId}/settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        return await response.json() as CompanionSettings;
      } catch (error) {
        console.error("Failed to fetch companion settings:", error);
        return null;
      }
    },
    enabled: Boolean(companionId),
  });
  
  // Mutation to update companion settings
  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (data: Partial<CompanionSettings>) => {
      const response = await fetchApi(`/api/companions/${companionId}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: `${companionName}'s personality has been updated to match your preferences.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companions/${companionId}/settings`] });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your companion settings.",
        variant: "destructive",
      });
      console.error("Failed to save companion settings:", error);
    },
  });
  
  // Initialize form values from fetched settings
  useEffect(() => {
    if (settings) {
      // Set relationship type
      if (settings.relationshipType) {
        setRelationshipType(settings.relationshipType);
      }
      
      // Set personality traits
      if (settings.personalityTraits) {
        setTraitValues({
          ...traitValues,
          ...settings.personalityTraits,
        });
      }
      
      // Set scenario
      if (settings.scenario) {
        setScenario(settings.scenario);
      }
      
      // Set conversation style
      if (settings.conversationStyle) {
        setConversationStyle(settings.conversationStyle);
      }
      
      // Set emotional response level
      if (settings.emotionalResponseLevel) {
        setEmotionalResponseLevel(settings.emotionalResponseLevel);
      }
      
      // Set memory retention
      if (settings.memoryRetention) {
        setMemoryRetention(settings.memoryRetention);
      }
      
      // Set interest topics
      if (settings.interestTopics) {
        setInterestTopics(settings.interestTopics);
      }
    }
  }, [settings]);
  
  const handleTraitChange = (name: string, value: number[]) => {
    setTraitValues((prev) => ({
      ...prev,
      [name]: value[0],
    }));
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !interestTopics.includes(newInterest.trim())) {
      setInterestTopics([...interestTopics, newInterest.trim()]);
      setNewInterest("");
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    setInterestTopics(interestTopics.filter(item => item !== interest));
  };

  const handleSave = () => {
    // Create settings payload
    const settingsData: Partial<CompanionSettings> = {
      companionId,
      personalityTraits: traitValues,
      relationshipType,
      scenario: scenario || null,
      interestTopics: interestTopics.length > 0 ? interestTopics : null,
      conversationStyle,
      emotionalResponseLevel,
      memoryRetention
    };
    
    // Save settings
    updateSettings(settingsData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {!isPremium && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-700">Free Account Limitations</h3>
              <p className="text-sm text-yellow-600">
                With a free account, you can only access basic customization options. 
                Upgrade to Premium for full customization, unlimited messaging, and premium companions.
              </p>
              <PremiumUpgradeButton
                variant="premium"
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            Customize {companionName}
          </h1>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white"
          >
            {isPending ? "Saving..." : "Save Changes"}
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {isLoadingSettings ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-pulse text-center">
              <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        ) : (
          <div className="flex border-b space-x-1 overflow-x-auto pb-1">
            <Button
              variant={activeTab === "personality" ? "default" : "ghost"}
              onClick={() => setActiveTab("personality")}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              <span>Personality</span>
            </Button>
            <Button
              variant={activeTab === "scenario" ? "default" : "ghost"}
              onClick={() => setActiveTab("scenario")}
              className="gap-2"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>Scenario</span>
            </Button>
            <Button
              variant={activeTab === "interests" ? "default" : "ghost"}
              onClick={() => setActiveTab("interests")}
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              <span>Interests</span>
            </Button>
            <Button
              variant={activeTab === "appearance" ? "default" : "ghost"}
              onClick={() => setActiveTab("appearance")}
              className="gap-2"
            >
              <CircleUser className="h-4 w-4" />
              <span>Appearance</span>
            </Button>
            <Button
              variant={activeTab === "voice" ? "default" : "ghost"}
              onClick={() => setActiveTab("voice")}
              className="gap-2"
            >
              <MessageSquareHeart className="h-4 w-4" />
              <span>Voice & Chat</span>
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          key={activeTab}
          className="py-4"
        >
          {activeTab === "personality" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Relationship Dynamic</h3>
                <RadioGroup
                  value={relationshipType}
                  onValueChange={setRelationshipType}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {[
                    { value: "dating", label: "Dating" },
                    { value: "romantic", label: "Romantic Partner" },
                    { value: "friendship", label: "Friendship" },
                    { value: "flirty", label: "Flirty Friend" },
                  ].map((item) => (
                    <div key={item.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={item.value}
                        id={item.value}
                      />
                      <Label
                        htmlFor={item.value}
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Personality Traits</h3>
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => {
                      console.log("All personality traits:", personalityTraits);
                      console.log("Current trait values:", traitValues);
                    }}
                  >
                    (debug)
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Traits */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Basic Traits</h4>
                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                      {basicPersonalityTraits.map((trait) => (
                        <div key={trait.name} className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="capitalize">{trait.name}</Label>
                            <span className="text-sm text-muted-foreground">
                              {traitValues[trait.name]}%
                            </span>
                          </div>
                          <div className="grid grid-cols-6 md:grid-cols-8 items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {trait.min}
                            </span>
                            <Slider
                              value={[traitValues[trait.name] || 50]}
                              min={0}
                              max={100}
                              step={1}
                              className="col-span-4 md:col-span-6"
                              onValueChange={(value) => handleTraitChange(trait.name, value)}
                            />
                            <span className="text-xs text-muted-foreground text-right">
                              {trait.max}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Advanced Traits */}
                  <div className="border rounded-lg p-4 relative">
                    <h4 className="font-medium mb-3">Advanced Traits</h4>
                    {!isPremium && (
                      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center z-10 p-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                        <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
                        <p className="text-center text-sm mb-4 max-w-xs">
                          Advanced personality traits are only available with a Premium subscription.
                        </p>
                        <PremiumUpgradeButton 
                          variant="premium"
                        />
                      </div>
                    )}
                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                      {advancedPersonalityTraits.map((trait) => (
                        <div key={trait.name} className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="capitalize">{trait.name}</Label>
                            <span className="text-sm text-muted-foreground">
                              {traitValues[trait.name]}%
                            </span>
                          </div>
                          <div className="grid grid-cols-6 md:grid-cols-8 items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {trait.min}
                            </span>
                            <Slider
                              value={[traitValues[trait.name] || 50]}
                              min={0}
                              max={100}
                              step={1}
                              disabled={!isPremium}
                              className={`col-span-4 md:col-span-6 ${!isPremium ? 'opacity-50' : ''}`}
                              onValueChange={(value) => {
                                if (isPremium) {
                                  handleTraitChange(trait.name, value);
                                }
                              }}
                            />
                            <span className="text-xs text-muted-foreground text-right">
                              {trait.max}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scenario" && (
            <div className="space-y-6">
              <div className="relative">
                <h3 className="text-lg font-medium mb-4">Custom Scenario</h3>
                <p className="text-muted-foreground mb-4">
                  Describe a setting, circumstance, or roleplay scenario for your interaction with {companionName}.
                </p>
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center z-10 p-4">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
                    <p className="text-center text-sm mb-4 max-w-xs">
                      Custom scenarios are only available with a Premium subscription.
                    </p>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-pink-500 to-rose-400 text-white border-0 hover:from-pink-600 hover:to-rose-500"
                      onClick={() => toast({
                        title: "Subscription Page",
                        description: "Redirecting to subscription page..."
                      })}
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder={`Example: ${companionName} and I are on a sunset beach walk, talking about our dreams.`}
                  className={`min-h-[150px] ${!isPremium ? 'opacity-50' : ''}`}
                  value={scenario}
                  disabled={!isPremium}
                  onChange={(e) => isPremium && setScenario(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {activeTab === "interests" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Interest Topics</h3>
                <p className="text-muted-foreground mb-4">
                  Add topics that {companionName} should be knowledgeable and passionate about.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add an interest (e.g., 'Photography', 'Classic Literature')"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    disabled={!newInterest.trim()}
                    onClick={handleAddInterest}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
                
                {interestTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {interestTopics.map((interest, index) => (
                      <div 
                        key={index} 
                        className="bg-primary/10 rounded-full px-3 py-1 flex items-center gap-1 text-sm"
                      >
                        <span>{interest}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          <span className="sr-only">Remove</span>
                          <span className="text-xs">×</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No interests added yet.</p>
                    <p className="text-sm">Add topics above to enhance your companion's knowledge.</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Suggested Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Travel", "Movies", "Music", "Cooking", "Art", "Science", "Sports", "Fashion"].map((suggestion) => (
                      !interestTopics.includes(suggestion) && (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            if (!interestTopics.includes(suggestion)) {
                              setInterestTopics([...interestTopics, suggestion]);
                            }
                          }}
                        >
                          + {suggestion}
                        </Button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="relative">
                <h3 className="text-lg font-medium mb-4">Appearance Customization</h3>
                <p className="text-muted-foreground mb-4">
                  Customize your companion's appearance details.
                </p>
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center z-10 p-4">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
                    <p className="text-center text-sm mb-4 max-w-xs">
                      Appearance customization is only available with a Premium subscription.
                    </p>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-pink-500 to-rose-400 text-white border-0 hover:from-pink-600 hover:to-rose-500"
                      onClick={() => toast({
                        title: "Subscription Page",
                        description: "Redirecting to subscription page..."
                      })}
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input 
                      placeholder="Age (e.g., 25)" 
                      disabled={!isPremium}
                      className={`${!isPremium ? 'opacity-50' : ''}`}
                    />
                    <Input 
                      placeholder="Ethnicity (e.g., Asian, Mixed)" 
                      disabled={!isPremium}
                      className={`${!isPremium ? 'opacity-50' : ''}`}
                    />
                    <Input 
                      placeholder="Height (e.g., 5ft 8in)" 
                      disabled={!isPremium}
                      className={`${!isPremium ? 'opacity-50' : ''}`}
                    />
                  </div>
                  <div className="space-y-4">
                    <Input 
                      placeholder="Location (e.g., New York)" 
                      disabled={!isPremium}
                      className={`${!isPremium ? 'opacity-50' : ''}`}
                    />
                    <Input 
                      placeholder="Occupation (e.g., Artist)" 
                      disabled={!isPremium}
                      className={`${!isPremium ? 'opacity-50' : ''}`}
                    />
                    <Textarea 
                      placeholder="Bio (brief description)" 
                      className={`min-h-[100px] ${!isPremium ? 'opacity-50' : ''}`}
                      disabled={!isPremium}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="space-y-6">
              <div className="relative">
                <h3 className="text-lg font-medium mb-4">Voice & Chat Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Customize how {companionName} communicates with you in conversations.
                </p>
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center z-10 p-4">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
                    <p className="text-center text-sm mb-4 max-w-xs">
                      Advanced voice & chat settings are only available with a Premium subscription.
                    </p>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-pink-500 to-rose-400 text-white border-0 hover:from-pink-600 hover:to-rose-500"
                      onClick={() => toast({
                        title: "Subscription Page",
                        description: "Redirecting to subscription page..."
                      })}
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">Conversation Style</h4>
                    <RadioGroup
                      value={conversationStyle}
                      onValueChange={(value) => isPremium && setConversationStyle(value)}
                      disabled={!isPremium}
                    >
                      {[
                        { value: "concise", label: "Concise", description: "Brief, direct responses" },
                        { value: "balanced", label: "Balanced", description: "Moderate-length messages" },
                        { value: "detailed", label: "Detailed", description: "In-depth, elaborate messages" },
                      ].map((style) => (
                        <div key={style.value} className="flex items-start space-x-2 mb-2">
                          <RadioGroupItem value={style.value} id={`style-${style.value}`} />
                          <div className="grid gap-1">
                            <Label htmlFor={`style-${style.value}`}>
                              {style.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">Emotional Response Level</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Subtle</span>
                        <span className="text-sm text-muted-foreground">Expressive</span>
                      </div>
                      <Slider
                        value={[emotionalResponseLevel]}
                        min={0}
                        max={100}
                        step={10}
                        disabled={!isPremium}
                        className={`${!isPremium ? 'opacity-50' : ''}`}
                        onValueChange={(value) => isPremium && setEmotionalResponseLevel(value[0])}
                      />
                      <div className="text-sm text-center mt-2">
                        {emotionalResponseLevel < 30 ? 
                          "Subtle emotional responses with minimal emotional expression" :
                          emotionalResponseLevel < 70 ? 
                          "Balanced emotional responses in conversations" :
                          "Highly expressive emotional reactions to conversations"
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Memory Retention</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Control how much {companionName} remembers from your past conversations.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Basic</span>
                      <span className="text-sm text-muted-foreground">Enhanced</span>
                    </div>
                    <Slider
                      value={[memoryRetention]}
                      min={1}
                      max={20}
                      step={1}
                      disabled={!isPremium}
                      className={`${!isPremium ? 'opacity-50' : ''}`}
                      onValueChange={(value) => isPremium && setMemoryRetention(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Short-term</span>
                      <span>Long-term</span>
                    </div>
                    <div className="text-sm text-center mt-2">
                      Current setting: {memoryRetention === 1 ? "Minimal memory" : 
                      memoryRetention < 5 ? "Basic memory retention" : 
                      memoryRetention < 10 ? "Standard memory retention" : 
                      memoryRetention < 15 ? "Enhanced memory retention" : 
                      "Premium long-term memory"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}