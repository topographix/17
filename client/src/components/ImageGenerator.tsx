import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateCharacterImage, svgToDataUrl, SceneType, createImagePrompt } from "@/lib/imageGenerator";
import type { Companion } from "@shared/schema";
import { X, Image, AlertTriangle, Diamond, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface ImageGeneratorProps {
  companion: Companion | undefined;
  onImageGenerated: (imageUrl: string, loadingMessageId?: string) => void;
  onGenerationStart: () => string | undefined;
  onClose: () => void;
  isPremium?: boolean;
  sessionId?: string;
  diamonds?: number;
}

export default function ImageGenerator({ companion, onImageGenerated, onGenerationStart, onClose, isPremium = false, sessionId, diamonds }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [sceneType, setSceneType] = useState<SceneType>("portrait");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | undefined>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // API mutation for image generation
  const imageGenerationMutation = useMutation({
    mutationFn: async ({ prompt, companionId }: { prompt: string; companionId?: number }) => {
      const endpoint = user ? "/api/generate-image" : "/api/guest/generate-image";
      const body = user 
        ? { prompt, companionId }
        : { sessionId, prompt, companionId };
      
      const response = await apiRequest("POST", endpoint, body);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      toast({
        title: "Image Generated!",
        description: `Cost: ${data.cost} diamonds. Remaining: ${data.remainingDiamonds}`,
      });
      // Invalidate diamond queries to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest/diamonds"] });
      
      // Automatically send image to chat with loading message ID
      setTimeout(() => {
        onImageGenerated(data.imageUrl, loadingMessageId);
        onClose();
      }, 500); // Brief delay to show success
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image",
        variant: "destructive"
      });
    }
  });

  // Generate image based on companion and scene type
  const handleGenerateImage = () => {
    if (!companion) {
      toast({
        title: "Error",
        description: "No companion selected for image generation",
        variant: "destructive"
      });
      return;
    }
    
    // Check diamond count
    const currentDiamonds = diamonds || 0;
    if (currentDiamonds < 5) {
      toast({
        title: "Insufficient Diamonds",
        description: "You need 5 diamonds to generate an image. Get more by upgrading to premium.",
        variant: "destructive"
      });
      return;
    }
    
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive"
      });
      return;
    }
    
    // Start the loading message in chat immediately
    const messageId = onGenerationStart();
    setLoadingMessageId(messageId);
    
    // Create enhanced prompt with scene type and companion info
    const enhancedPrompt = `${prompt}, ${sceneType} style, ${companion.personality || 'friendly'} personality`;
    
    imageGenerationMutation.mutate({
      prompt: enhancedPrompt,
      companionId: companion.id
    });
  };
  
  // Handle smart prompt generation with 10+ creative options
  const handleSmartPrompt = () => {
    if (!companion) return;
    
    // Expanded creative prompts based on companion and scene type
    const creativePrompts = [
      // Portrait scenes
      `elegant ${companion.gender === 'male' ? 'gentleman' : 'lady'} in professional attire, confident gaze, studio lighting`,
      `close-up portrait with intense eye contact, ${companion.personality || 'charming'} expression, dramatic shadows`,
      `headshot with gentle smile, soft natural lighting, ${companion.gender === 'male' ? 'distinguished' : 'graceful'} pose`,
      
      // Romantic scenes  
      `candlelit dinner setting, warm amber lighting, loving expression, intimate atmosphere`,
      `sunset beach scene, golden hour lighting, romantic pose, wind in hair`,
      `cozy fireplace setting, soft glow, tender expression, comfortable elegance`,
      `garden with roses, dreamy soft focus, romantic outfit, enchanting smile`,
      
      // Casual scenes
      `relaxing at a coffee shop, casual outfit, friendly smile, warm atmosphere`,
      `outdoor picnic setting, natural lighting, comfortable pose, joyful expression`,
      `reading a book in a cozy corner, soft lighting, peaceful expression`,
      `walking in a city street, stylish casual wear, confident stride`,
      
      // Fantasy scenes
      `magical forest with glowing butterflies, ethereal lighting, mystical aura`,
      `enchanted castle backdrop, royal attire, majestic pose, fairy tale atmosphere`,
      `underwater palace scene, flowing hair, mermaid-like elegance, blue tones`,
      `starry night sky, celestial lighting, dreamy expression, cosmic background`,
      
      // Activity-based scenes
      `cooking in a beautiful kitchen, apron on, warm smile, homey atmosphere`,
      `dancing in elegant ballroom, formal attire, graceful movement, golden lighting`,
      `playing piano, focused expression, artistic lighting, musical ambiance`,
      `gardening with flowers, natural setting, peaceful expression, vibrant colors`
    ];
    
    // Filter prompts by scene type if specific
    let filteredPrompts = creativePrompts;
    if (sceneType !== 'portrait') {
      const sceneKeywords = {
        'romantic': ['romantic', 'candlelit', 'sunset', 'fireplace', 'roses'],
        'casual': ['casual', 'coffee', 'picnic', 'reading', 'walking'],
        'fantasy': ['magical', 'enchanted', 'underwater', 'starry', 'mystical']
      };
      
      filteredPrompts = creativePrompts.filter(prompt => 
        sceneKeywords[sceneType]?.some(keyword => prompt.includes(keyword))
      );
    }
    
    // If no filtered prompts, use all prompts
    if (filteredPrompts.length === 0) {
      filteredPrompts = creativePrompts;
    }
    
    // Select a random prompt
    const randomPrompt = filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
    setPrompt(randomPrompt);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card border rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95 relative image-generator-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">
            {companion?.name ? `Generate an image with ${companion.name}` : 'Image Generator'}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="relative z-10 hover:bg-muted/50 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Scene Type Selection */}
          <Tabs value={sceneType} onValueChange={(value) => setSceneType(value as SceneType)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="portrait">Portrait</TabsTrigger>
              <TabsTrigger value="romantic">Romantic</TabsTrigger>
              <TabsTrigger value="casual">Casual</TabsTrigger>
              <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Prompt Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Describe the image... (optional)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSmartPrompt}
              title="Generate smart prompt"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Cost Info and Generate Button */}
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-1">
                <Diamond className="h-4 w-4 text-pink-500" />
                Cost: 5 diamonds
              </span>
              <span className="flex items-center gap-1">
                <Diamond className="h-4 w-4 text-pink-500" />
                Available: {diamonds || 0}
              </span>
            </div>
            <Button 
              onClick={handleGenerateImage} 
              disabled={imageGenerationMutation.isPending || !companion || (diamonds || 0) < 5}
              className="w-full"
            >
              {imageGenerationMutation.isPending ? "Generating..." : "Generate Image (5 💎)"}
            </Button>
          </div>
          
          {/* Generation Status */}
          {imageGenerationMutation.isPending && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Generating your image...</p>
            </div>
          )}
          
          {generatedImage && (
            <div className="mt-4 text-center">
              <div className="text-green-600 mb-2">✓ Image generated successfully!</div>
              <p className="text-xs text-muted-foreground">Sending to chat...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}