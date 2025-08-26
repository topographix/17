import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type Preference = "male" | "female" | "both" | null;

interface PreferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreferenceSelected: (preference: Preference) => void;
}

export default function PreferenceModal({
  open,
  onOpenChange,
  onPreferenceSelected,
}: PreferenceModalProps) {
  const [hoveredOption, setHoveredOption] = useState<Preference>(null);

  const handlePreferenceSelect = (preference: Preference) => {
    console.log("Modal: Preference selected:", preference);
    onPreferenceSelected(preference);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-serif">
            <span className="text-primary">Welcome to RedVelvet</span>
          </DialogTitle>
          <DialogDescription className="text-center text-lg mt-2">
            Choose your preferred companions to personalize your experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {/* Female Option */}
          <motion.div
            className={`relative overflow-hidden rounded-xl shadow-lg border-2 cursor-pointer transition-all h-80 ${hoveredOption === "female" ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"}`}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredOption("female")}
            onHoverEnd={() => setHoveredOption(null)}
            onClick={() => handlePreferenceSelect("female")}
          >
            {/* Background image - Using a placeholder gradient that looks like a silhouette */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 opacity-90"></div>
            
            {/* Female silhouette created with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-medium text-xl mb-1 font-serif">Female Companions</h3>
                <p className="text-sm text-white/80">
                  Connect with our charming and elegant female companions who are eager to get to know you.                
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Empathetic, caring, and attentive</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Male Option */}
          <motion.div
            className={`relative overflow-hidden rounded-xl shadow-lg border-2 cursor-pointer transition-all h-80 ${hoveredOption === "male" ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"}`}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredOption("male")}
            onHoverEnd={() => setHoveredOption(null)}
            onClick={() => handlePreferenceSelect("male")}
          >
            {/* Background image - Using a placeholder gradient that looks like a silhouette */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700 opacity-90"></div>
            
            {/* Male silhouette created with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-medium text-xl mb-1 font-serif">Male Companions</h3>
                <p className="text-sm text-white/80">
                  Connect with our confident and supportive male companions who are ready to engage in meaningful conversations.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Strong, attentive, and understanding</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Both Option */}
          <motion.div
            className={`relative overflow-hidden rounded-xl shadow-lg border-2 cursor-pointer transition-all h-80 ${hoveredOption === "both" ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"}`}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredOption("both")}
            onHoverEnd={() => setHoveredOption(null)}
            onClick={() => handlePreferenceSelect("both")}
          >
            {/* Background image - Using a placeholder gradient that looks like a silhouette */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-700 opacity-90"></div>
            
            {/* Both silhouettes created with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-medium text-xl mb-1 font-serif">All Companions</h3>
                <p className="text-sm text-white/80">
                  Explore our diverse collection of companions and discover connections that resonate with your preferences.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Diverse, engaging, and personalized</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="flex justify-center mt-2">
          <Button variant="outline" size="sm" onClick={() => handlePreferenceSelect("both")}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}