import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DetectedEmotion, EmotionAnalysisResult } from "@/lib/emotionDetection";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, Frown, Smile, AlertTriangle, Star, Sparkles } from "lucide-react";

interface EmotionIndicatorProps {
  emotion: EmotionAnalysisResult;
  isPremium?: boolean;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export default function EmotionIndicator({
  emotion,
  isPremium = false,
  size = "md",
  showDetails = true
}: EmotionIndicatorProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [emotion]);
  
  if (!isPremium) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              className="inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-800 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              style={{
                width: size === "sm" ? 24 : size === "md" ? 32 : 40,
                height: size === "sm" ? 24 : size === "md" ? 32 : 40
              }}
            >
              <Sparkles className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Emotion detection available with Premium subscription</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  const EmotionIcon = () => {
    switch (emotion.primaryEmotion.type) {
      case 'joy':
      case 'surprise':
      case 'gratitude':
        return <Smile className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />;
      case 'love':
        return <Heart className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />;
      case 'sadness':
      case 'loneliness':
      case 'disgust':
        return <Frown className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />;
      case 'anger':
      case 'fear':
        return <AlertTriangle className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />;
      default:
        return <Star className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />;
    }
  };
  
  const getEmotionColor = () => {
    switch (emotion.primaryEmotion.type) {
      case 'joy':
      case 'surprise':
      case 'gratitude':
        return 'bg-amber-100 text-amber-800';
      case 'love':
        return 'bg-pink-100 text-pink-800';
      case 'sadness':
      case 'loneliness':
        return 'bg-blue-100 text-blue-800';
      case 'anger':
        return 'bg-red-100 text-red-800';
      case 'fear':
      case 'disgust':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEmotionTerm = (type: string): string => {
    const emotionMap: Record<string, string> = {
      joy: 'Joy',
      sadness: 'Sadness',
      anger: 'Anger',
      fear: 'Fear',
      surprise: 'Surprise',
      disgust: 'Disgust',
      love: 'Love',
      gratitude: 'Gratitude',
      loneliness: 'Loneliness',
      neutral: 'Neutral'
    };
    
    return emotionMap[type] || 'Neutral';
  };
  
  const getIntensityTerm = (intensity: string): string => {
    switch (intensity) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Moderate';
      case 'low':
        return 'Mild';
      default:
        return 'Low';
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`inline-flex items-center justify-center rounded-full cursor-pointer ${getEmotionColor()}`}
                whileHover={{ scale: 1.1 }}
                style={{
                  width: size === "sm" ? 24 : size === "md" ? 32 : 40,
                  height: size === "sm" ? 24 : size === "md" ? 32 : 40
                }}
              >
                <EmotionIcon />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2">
                <p className="font-medium">{getEmotionTerm(emotion.primaryEmotion.type)}: {getIntensityTerm(emotion.primaryEmotion.intensity)}</p>
                {emotion.secondaryEmotion && (
                  <p className="text-xs text-muted-foreground">
                    Also detecting: {getEmotionTerm(emotion.secondaryEmotion.type)}
                  </p>
                )}
                {showDetails && (
                  <Badge variant="outline" className="mt-1">
                    {emotion.overall === 'positive' ? 'Positive tone' : 
                     emotion.overall === 'negative' ? 'Negative tone' : 'Neutral tone'}
                  </Badge>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </AnimatePresence>
  );
}