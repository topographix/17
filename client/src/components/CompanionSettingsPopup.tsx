import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Save, Image, Plus, X, Loader2 } from "lucide-react";
import type { Companion } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface CompanionSettingsPopupProps {
  companion: Companion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SceneType = "portrait" | "casual" | "romantic" | "fantasy";

const basicPersonalityTraits = [
  { name: "caring", defaultValue: 7, min: "Cold", max: "Caring" },
  { name: "confidence", defaultValue: 6, min: "Shy", max: "Confident" },
  { name: "humor", defaultValue: 5, min: "Serious", max: "Playful" },
  { name: "sassiness", defaultValue: 4, min: "Sweet", max: "Sassy" },
];

const advancedPersonalityTraits = [
  { name: "flirtatiousness", defaultValue: 5, min: "Reserved", max: "Flirty" },
  { name: "adventurousness", defaultValue: 6, min: "Cautious", max: "Adventurous" },
  { name: "empathy", defaultValue: 8, min: "Logical", max: "Empathetic" },
  { name: "independence", defaultValue: 6, min: "Dependent", max: "Independent" },
];

const relationshipTypes = ["Friend", "Best Friend", "Romantic Partner", "Mentor", "Personal Assistant", "Other"];

export default function CompanionSettingsPopup({ companion, open, onOpenChange }: CompanionSettingsPopupProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isLoggedIn = !!user;
  const isPremium = user?.isPremium || false;

  // Profile states
  const [age, setAge] = useState("25");
  const [ethnicity, setEthnicity] = useState("");
  const [height, setHeight] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  
  // Relationship states
  const [relationshipType, setRelationshipType] = useState("Friend");
  const [traitValues, setTraitValues] = useState<Record<string, number>>({});
  
  // UI states
  const [activeTab, setActiveTab] = useState("profile");
  const [album, setAlbum] = useState<string[]>([]);
  const [selectedSceneType, setSelectedSceneType] = useState<SceneType>("portrait");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if ((companion as any).albumUrls && Array.isArray((companion as any).albumUrls)) {
      setAlbum((companion as any).albumUrls);
    }
  }, [companion]);

  const handleGenerateImage = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to generate images",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await apiRequest("POST", `/api/companions/${companion.id}/generate-image`, {
        sceneType: selectedSceneType,
        prompt: `${selectedSceneType} style photo of ${companion.name}`,
      });
      const result = await response.json();
      
      if (result.imageUrl) {
        setAlbum(prev => [...prev, result.imageUrl]);
        toast({
          title: "Image Generated",
          description: "New image added to album",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setAlbum(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSettings = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to save settings",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const settings = {
        companionId: companion.id,
        relationshipType,
        personalityTraits: traitValues,
        customization: {
          age,
          ethnicity,
          height,
          location,
          occupation,
          bio,
          albumUrls: album,
        },
      };

      await apiRequest("POST", "/api/companion-settings", settings);
      
      queryClient.invalidateQueries({ queryKey: ["/api/companion-settings"] });
      
      toast({
        title: "Settings Saved",
        description: `Your preferences for ${companion.name} have been saved`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col !rounded-lg companion-settings-popup">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {companion.imageUrl && (
                <AvatarImage src={companion.imageUrl} alt={companion.name} />
              )}
              <AvatarFallback>{companion.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{companion.name} Settings</span>
          </DialogTitle>
          <DialogDescription>
            Customize your experience with {companion.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="relationship">Relationship</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[calc(100%-40px)]">
            <TabsContent value="profile" className="p-2 max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ethnicity">Ethnicity</Label>
                      <Input
                        id="ethnicity"
                        value={ethnicity}
                        onChange={(e) => setEthnicity(e.target.value)}
                        placeholder="e.g. Italian"
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
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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
                      <textarea
                        id="bio"
                        className="w-full h-24 border rounded-md p-2 resize-none bg-background"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Photo Album</h3>
                    <div className="flex gap-2">
                      <Select
                        value={selectedSceneType}
                        onValueChange={(val) =>
                          setSelectedSceneType(val as SceneType)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Scene type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="romantic">Romantic</SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                      >
                        {isGeneratingImage ? "Generating..." : "Generate"}
                        <Image className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {album.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border">
                          <img
                            src={image}
                            alt={`${companion.name} ${index}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div
                      className="aspect-square rounded-md border border-dashed flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={handleGenerateImage}
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="relationship" className="p-2 max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Relationship Type</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    How would you like to define your relationship with {companion.name}?
                  </p>
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
                  <h3 className="text-lg font-semibold mb-2">Personality Traits</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Customize {companion.name}'s personality to match your preferences.
                  </p>

                  <div className="space-y-6">
                    {basicPersonalityTraits.map((trait) => (
                      <div key={trait.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>
                            {trait.name.charAt(0).toUpperCase() + trait.name.slice(1)}
                          </Label>
                          <span className="text-sm font-medium">
                            {traitValues[trait.name] || trait.defaultValue}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground w-20">
                            {trait.min}
                          </span>
                          <Slider
                            value={[traitValues[trait.name] || trait.defaultValue]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(value) => {
                              setTraitValues((prev) => ({
                                ...prev,
                                [trait.name]: value[0],
                              }));
                            }}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-20 text-right">
                            {trait.max}
                          </span>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    {!isPremium && (
                      <div className="text-center p-4 bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground mb-2">
                          Advanced personality traits are available with premium
                        </p>
                        <Button variant="outline" size="sm">
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}

                    {advancedPersonalityTraits.map((trait) => (
                      <div key={trait.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className={!isPremium ? 'opacity-50' : ''}>
                            {trait.name.charAt(0).toUpperCase() + trait.name.slice(1)}
                          </Label>
                          <span className={`text-sm font-medium ${!isPremium ? 'opacity-50' : ''}`}>
                            {traitValues[trait.name] || trait.defaultValue}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground w-20">
                            {trait.min}
                          </span>
                          <Slider
                            value={[traitValues[trait.name] || trait.defaultValue]}
                            min={1}
                            max={10}
                            step={1}
                            disabled={!isPremium}
                            onValueChange={(value) => {
                              if (isPremium) {
                                setTraitValues((prev) => ({
                                  ...prev,
                                  [trait.name]: value[0],
                                }));
                              }
                            }}
                            className={`flex-1 ${!isPremium ? 'opacity-50' : ''}`}
                          />
                          <span className="text-xs text-muted-foreground w-20 text-right">
                            {trait.max}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button
            variant={isLoggedIn ? "default" : "outline"}
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isLoggedIn ? (
              <>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Settings
              </>
            ) : (
              "Login to Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}