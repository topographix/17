import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Save } from "lucide-react";
import type { Companion, CompanionSettings } from "@shared/schema";
import { fetchApi } from "@/lib/api";

const relationshipTypes = [
  "Friends",
  "Best Friends",
  "Dating",
  "Lovers",
  "Friends with Benefits",
  "Casual",
  "Soulmates",
  "Mentor/Mentee",
  "Personal Assistant",
  "Long-term Relationship",
  "Married",
];

interface PersonalityTrait {
  name: string;
  min: string;
  max: string;
  defaultValue: number;
}

// Organize traits into categories
const basicPersonalityTraits: PersonalityTrait[] = [
  { name: "caring", min: "Distant", max: "Nurturing", defaultValue: 5 },
  { name: "confidence", min: "Shy", max: "Confident", defaultValue: 5 },
  { name: "sassiness", min: "Sweet", max: "Sassy", defaultValue: 5 },
  { name: "flirtatiousness", min: "Reserved", max: "Flirty", defaultValue: 5 },
  { name: "sensuality", min: "Modest", max: "Sensual", defaultValue: 5 },
  { name: "empathy", min: "Practical", max: "Empathetic", defaultValue: 5 }
];

const advancedPersonalityTraits: PersonalityTrait[] = [
  { name: "attachment", min: "Independent", max: "Attached", defaultValue: 5 },
  { name: "dominance", min: "Submissive", max: "Dominant", defaultValue: 5 },
  { name: "spontaneity", min: "Predictable", max: "Spontaneous", defaultValue: 5 },
  { name: "honesty", min: "Diplomatic", max: "Brutally Honest", defaultValue: 5 },
  { name: "jealousy", min: "Secure", max: "Possessive", defaultValue: 5 },
  { name: "sageness", min: "Naive", max: "Wise", defaultValue: 5 },
  { name: "experimenter", min: "Conservative", max: "Experimental", defaultValue: 5 },
  { name: "innocent", min: "Worldly", max: "Innocent", defaultValue: 5 }
];

// Combine all traits for use in the rest of the app
const personalityTraits: PersonalityTrait[] = [...basicPersonalityTraits, ...advancedPersonalityTraits];

export default function CompanionSettingsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const companionId = parseInt(id || "0");

  // States for companion details
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [albumUrls, setAlbumUrls] = useState<string[]>([]);
  const [gender, setGender] = useState("female");
  const [isPremium, setIsPremium] = useState(false);
  const [tier, setTier] = useState("free");
  const [traits, setTraits] = useState<string[]>([]);
  const [traitsInput, setTraitsInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featuresInput, setFeaturesInput] = useState("");

  // States for settings
  const [traitValues, setTraitValues] = useState<Record<string, number>>({});
  const [relationshipType, setRelationshipType] = useState("Friends");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile fields
  const [age, setAge] = useState("25");
  const [ethnicity, setEthnicity] = useState("");
  const [height, setHeight] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");

  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch companion data
  const { data: companion, isLoading: isLoadingCompanion } = useQuery<Companion>({
    queryKey: [`/api/companions/${companionId}`],
    enabled: companionId > 0,
  });

  // Fetch companion settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<CompanionSettings>({
    queryKey: [`/api/companions/${companionId}/settings`],
    enabled: companionId > 0,
  });

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setImagePreview(previewUrl);
        
        // When we have a valid image preview, we'll add it to albumUrls when saved
        console.log("Image selected for upload and will be added to album");
      };
      reader.readAsDataURL(file);
    }
  };

  // Update companion mutation
  const updateCompanionMutation = useMutation({
    mutationFn: async (updatedCompanion: Partial<Companion>) => {
      // Use FormData to handle file upload
      const formData = new FormData();
      
      // Add companion data as JSON
      formData.append('data', JSON.stringify(updatedCompanion));
      
      // Add image file if it exists
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetchApi(`/api/companions/${companionId}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update companion';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Companion Updated",
        description: "The companion has been successfully updated.",
      });
      
      // Update local state with the returned data
      if (data) {
        // Update the image URL if it changed
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
        
        // Update album URLs if returned
        if (data.albumUrls && Array.isArray(data.albumUrls)) {
          setAlbumUrls(data.albumUrls);
          console.log("Updated album URLs:", data.albumUrls);
        }
        
        // Clear the selected image and preview
        setSelectedImage(null);
        setImagePreview(null);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/companions/${companionId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/companions'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update the companion.",
        variant: "destructive"
      });
    }
  });

  // Settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<CompanionSettings>) => {
      const method = settings ? 'PATCH' : 'POST';
      const response = await fetchApi(`/api/companions/${companionId}/settings`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to save settings";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Companion settings have been updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/companions/${companionId}/settings`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Initialize form with companion data
  useEffect(() => {
    if (companion) {
      setName(companion.name);
      setTagline(companion.tagline || "");
      setDescription(companion.description);
      setImageUrl(companion.imageUrl);
      
      // Handle album URLs
      if (companion.albumUrls && Array.isArray(companion.albumUrls)) {
        setAlbumUrls(companion.albumUrls);
        console.log("Album URLs loaded:", companion.albumUrls);
      } else {
        // If no album URLs, at least include the main image
        setAlbumUrls([companion.imageUrl]);
      }
      
      setGender(companion.gender || "female");
      setIsPremium(companion.isPremium || false);
      setTier(companion.tier || "free");
      setTraits(companion.traits || []);
      setTraitsInput(companion.traits?.join(", ") || "");
      setFeatures(companion.features || []);
      setFeaturesInput(companion.features?.join(", ") || "");
      
      // Use companion description as bio if not set elsewhere
      setBio(companion.description);
      
      // Load profile data from companion settings if available
      if (settings && settings.appearancePreferences) {
        const appearance = settings.appearancePreferences as Record<string, any>;
        if (appearance.age) setAge(appearance.age.toString());
        if (appearance.ethnicity) setEthnicity(appearance.ethnicity);
        if (appearance.height) setHeight(appearance.height);
        if (appearance.location) setLocationValue(appearance.location);
        if (appearance.occupation) setOccupation(appearance.occupation);
        if (appearance.bio) setBio(appearance.bio);
      }
    }
  }, [companion]);

  // Apply settings when data is loaded
  useEffect(() => {
    if (settings) {
      if (settings.personalityTraits) {
        setTraitValues(settings.personalityTraits as Record<string, number>);
      }
      
      if (settings.relationshipType) {
        setRelationshipType(settings.relationshipType);
      }
      
      // If settings include appearancePreferences, apply them
      const appearance = settings.appearancePreferences as any;
      if (appearance) {
        if (appearance.age) setAge(appearance.age.toString());
        if (appearance.ethnicity) setEthnicity(appearance.ethnicity);
        if (appearance.height) setHeight(appearance.height);
        if (appearance.location) setLocationValue(appearance.location);
        if (appearance.occupation) setOccupation(appearance.occupation);
        if (appearance.bio) setBio(appearance.bio);
      }
    } else {
      // Initialize personality trait values if no settings exist
      const initialTraits: Record<string, number> = {};
      personalityTraits.forEach(trait => {
        initialTraits[trait.name] = trait.defaultValue;
      });
      setTraitValues(initialTraits);
    }
  }, [settings]);

  const handleTraitsInput = (value: string) => {
    setTraitsInput(value);
    if (value.trim() === "") {
      setTraits([]);
      return;
    }
    
    const traitList = value.split(",").map(t => t.trim()).filter(t => t.length > 0);
    setTraits(traitList);
  };

  const handleFeaturesInput = (value: string) => {
    setFeaturesInput(value);
    if (value.trim() === "") {
      setFeatures([]);
      return;
    }
    
    const featureList = value.split(",").map(f => f.trim()).filter(f => f.length > 0);
    setFeatures(featureList);
  };

  const handleSaveCompanion = () => {
    setIsSaving(true);
    
    const updatedCompanion: Partial<Companion> = {
      name,
      tagline,
      description,
      gender,
      isPremium,
      tier,
      traits,
      features
    };
    
    // Handle image URLs
    if (!selectedImage) {
      // If no new image, keep the existing imageUrl
      updatedCompanion.imageUrl = imageUrl;
      
      // Keep existing albumUrls
      if (albumUrls && albumUrls.length > 0) {
        updatedCompanion.albumUrls = albumUrls;
      }
    } else {
      // We'll upload the new image and get the URL back from the server
      // The albumUrls will be updated by the server when the image is uploaded
      console.log("New image will be uploaded and added to album");
    }
    
    updateCompanionMutation.mutate(updatedCompanion, {
      onSettled: () => setIsSaving(false)
    });
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Compile settings data
    const settingsData: Partial<CompanionSettings> = {
      personalityTraits: traitValues,
      relationshipType,
      appearancePreferences: {
        age: parseInt(age),
        ethnicity,
        height,
        location: locationValue,
        occupation,
        bio
      }
    };
    
    // Save settings
    saveSettingsMutation.mutate(settingsData, {
      onSettled: () => setIsSaving(false)
    });
  };

  if (isLoadingCompanion || isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/admin')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-primary">Edit Companion: {name}</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit the basic details of this companion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Companion name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input 
                      id="tagline" 
                      value={tagline} 
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="A short tagline (displayed under name)"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the companion"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tier">Tier</Label>
                    <Select 
                      value={tier} 
                      onValueChange={(value) => {
                        setTier(value);
                        setIsPremium(value !== 'free');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="traits">Traits (comma separated)</Label>
                  <Input 
                    id="traits" 
                    value={traitsInput} 
                    onChange={(e) => handleTraitsInput(e.target.value)}
                    placeholder="caring, romantic, playful"
                  />
                  {traits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {traits.map((trait, i) => (
                        <div key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {trait}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma separated)</Label>
                  <Input 
                    id="features" 
                    value={featuresInput} 
                    onChange={(e) => handleFeaturesInput(e.target.value)}
                    placeholder="Voice chat, Relationship advice, etc."
                  />
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {features.map((feature, i) => (
                        <div key={i} className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs">
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Main Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-24 h-24 border rounded-md overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : imageUrl ? (
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input 
                        id="imageUpload" 
                        type="file" 
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a new image or keep the existing one
                      </p>
                    </div>
                  </div>
                  
                  {/* Album Gallery */}
                  <div className="mt-6">
                    <Label>Album Gallery</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {albumUrls && albumUrls.length > 0 ? (
                        albumUrls.map((url, index) => (
                          <div key={index} className="relative w-full aspect-square border rounded-md overflow-hidden">
                            <img src={url} alt={`Album ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 p-4 border rounded-md bg-muted text-center">
                          <span className="text-muted-foreground">No album images yet</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      When you upload a new main image, it will also be added to the album
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveCompanion}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Edit the profile details that users will see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">Ethnicity</Label>
                    <Input 
                      id="ethnicity" 
                      value={ethnicity} 
                      onChange={(e) => setEthnicity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input 
                      id="height" 
                      value={height} 
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Height (e.g. 5ft 7in)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={locationValue} 
                      onChange={(e) => setLocationValue(e.target.value)}
                      placeholder="e.g. Los Angeles, CA"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input 
                      id="occupation" 
                      value={occupation} 
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Yoga Instructor"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Personality Tab */}
          <TabsContent value="personality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personality & Relationship</CardTitle>
                <CardDescription>
                  Configure the personality traits and relationship type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Relationship Type</h3>
                  <RadioGroup 
                    value={relationshipType}
                    onValueChange={setRelationshipType}
                    className="grid grid-cols-2 gap-2"
                  >
                    {relationshipTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={`relationship-${type}`} />
                        <Label htmlFor={`relationship-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personality Traits</h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-t-2 border-primary/10">
                      <div className="space-y-6">
                        {/* Basic Traits Section */}
                        <div className="space-y-5 mb-6">
                          <div className="space-y-6 pl-2">
                            {basicPersonalityTraits.map((trait) => (
                              <div key={trait.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label>{trait.name.charAt(0).toUpperCase() + trait.name.slice(1)}</Label>
                                  <span className="text-sm font-medium">{traitValues[trait.name] || trait.defaultValue}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-muted-foreground w-20">{trait.min}</span>
                                  <Slider
                                    value={[traitValues[trait.name] || trait.defaultValue]}
                                    min={1}
                                    max={10}
                                    step={1}
                                    onValueChange={(value) => {
                                      setTraitValues(prev => ({
                                        ...prev,
                                        [trait.name]: value[0]
                                      }));
                                    }}
                                    className="flex-1"
                                  />
                                  <span className="text-xs text-muted-foreground w-20 text-right">{trait.max}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className="flex items-center gap-2 my-4">
                          <div className="h-px bg-border flex-grow"></div>
                          <span className="text-xs font-medium">Advanced Traits</span>
                          <div className="h-px bg-border flex-grow"></div>
                        </div>
                        
                        {/* Advanced Traits Section */}
                        <div className="space-y-5">
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-6 pl-2 pr-4">
                              {advancedPersonalityTraits.map((trait) => (
                                <div key={trait.name} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label>{trait.name.charAt(0).toUpperCase() + trait.name.slice(1)}</Label>
                                    <span className="text-sm font-medium">{traitValues[trait.name] || trait.defaultValue}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground w-20">{trait.min}</span>
                                    <Slider
                                      value={[traitValues[trait.name] || trait.defaultValue]}
                                      min={1}
                                      max={10}
                                      step={1}
                                      onValueChange={(value) => {
                                        setTraitValues(prev => ({
                                          ...prev,
                                          [trait.name]: value[0]
                                        }));
                                      }}
                                      className="flex-1"
                                    />
                                    <span className="text-xs text-muted-foreground w-20 text-right">{trait.max}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Personality Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}