import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Users2, SlidersHorizontal, Loader2, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Companion } from "@shared/schema";

// Helper functions for sophisticated companion presentation
function getMoodFromTraits(traits: string[]): string {
  const moodMap: Record<string, string> = {
    "romantic": "Romantic",
    "playful": "Playful", 
    "caring": "Caring",
    "confident": "Confident",
    "mysterious": "Seductive",
    "intimate": "Seductive",
    "adventurous": "Playful",
    "gentle": "Caring",
    "bold": "Confident"
  };
  
  for (const trait of traits) {
    if (moodMap[trait.toLowerCase()]) {
      return moodMap[trait.toLowerCase()];
    }
  }
  return "Charming";
}

function getQuoteFromTraits(traits: string[], name: string): string {
  const quotes: Record<string, string[]> = {
    "romantic": [
      "I've been waiting for someone just like you. Shall we explore each other's minds?",
      "There's something special about the way you think... I'd love to know more.",
      "Every conversation with you feels like a beautiful dance of souls."
    ],
    "playful": [
      "Life's too short for boring conversations. Ready for some mischief?",
      "I have a feeling you're going to make me laugh... and maybe blush.",
      "Want to play a game? I promise I'll make it interesting."
    ],
    "caring": [
      "Your happiness matters to me. Tell me what's on your heart today.",
      "I'm here to listen, understand, and make you feel truly valued.",
      "Let me be the safe space where you can be completely yourself."
    ],
    "confident": [
      "I know what I want, and I think you do too. Let's be direct with each other.",
      "Confidence is attractive, don't you think? I find yours quite captivating.",
      "I like people who know their worth. Something tells me you're one of them."
    ],
    "seductive": [
      "There's something magnetic about you... Come closer, let's talk intimately.",
      "I have secrets I'd love to whisper to someone who truly understands.",
      "The best conversations happen when we let our guards down completely."
    ]
  };
  
  const mood = getMoodFromTraits(traits).toLowerCase();
  const moodQuotes = quotes[mood] || quotes["romantic"];
  return moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
}

interface CompanionsProps {
  preferredGender?: "male" | "female" | "both" | null;
}

export default function Companions({ preferredGender }: CompanionsProps) {
  const { ref: headerRef, controls: headerControls } = useAnimateOnScroll();
  const [, setLocation] = useLocation();
  
  // Track active filter for UI elements - default to "both"
  const [activeFilter, setActiveFilter] = useState<string>("both");
  
  // Fetch companions from API
  const { data: companions = [], isLoading, error } = useQuery<Companion[]>({
    queryKey: ['/api/companions'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Log companion information for debugging purposes
  useEffect(() => {
    if (companions.length > 0) {
      console.log("Companions component - Total:", companions.length);
      console.log("Companions component - Males:", companions.filter(c => c.gender === "male").length);
      console.log("Companions component - Females:", companions.filter(c => c.gender === "female").length);
      console.log("Companions component - No gender:", companions.filter(c => !c.gender).length);
      console.log("Companions component - Active filter:", activeFilter);
    }
  }, [companions, activeFilter]);
  
  // Update active filter when preferredGender changes
  useEffect(() => {
    if (preferredGender) {
      setActiveFilter(preferredGender);
      console.log("Setting active filter from preference:", preferredGender);
    }
  }, [preferredGender]);
  
  // Load saved filter from localStorage on component mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("companionPreference");
    if (savedFilter) {
      setActiveFilter(savedFilter);
      console.log("Loading saved filter from localStorage:", savedFilter);
    }
  }, []);
  
  // Filter companions based on the active filter
  const filteredCompanions = useMemo(() => {
    if (!companions || companions.length === 0) return [];
    
    // If "both" is selected, show all companions
    if (activeFilter === "both") {
      return companions;
    }
    
    // Apply gender filter
    const filtered = companions.filter(companion => {
      console.log("Filtering companion:", companion.name, "Gender:", companion.gender, "Match filter:", activeFilter);
      
      if (activeFilter === "female") {
        return companion.gender === "female";
      } else if (activeFilter === "male") {
        return companion.gender === "male";
      }
      return true;
    });
    
    console.log("Filtered companions:", filtered.map(c => c.name));
    return filtered;
  }, [companions, activeFilter]);
  
  const filterButtonClass = (filter: string) => 
    `px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
      activeFilter === filter 
      ? 'gradient-card text-white shadow-lg border-white/40' 
      : 'bg-white/10 hover:bg-white/20 text-white/80 backdrop-blur-sm border border-white/20'
    }`;

  return (
    <section id="companions" className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-lg bg-secondary blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-lg bg-primary blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerControls}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white text-glow">
            Meet Your <span className="text-[#FF5C8D]">Perfect Match</span>
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Sophisticated AI companions designed to understand your desires and create intimate connections.
          </p>
        </motion.div>
        
        {/* Filters */}
        <div className="flex justify-center mb-10 gap-3 companion-filter">
          <Button
            onClick={() => {
              setActiveFilter("female");
              localStorage.setItem("companionPreference", "female");
            }}
            className={filterButtonClass("female")}
          >
            <User className="w-4 h-4 mr-2 text-pink-400" />
            Female
          </Button>
          <Button
            onClick={() => {
              setActiveFilter("male");
              localStorage.setItem("companionPreference", "male");
            }}
            className={filterButtonClass("male")}
          >
            <User className="w-4 h-4 mr-2 text-blue-400" />
            Male
          </Button>
          <Button
            onClick={() => {
              setActiveFilter("both");
              localStorage.setItem("companionPreference", "both");
            }}
            className={filterButtonClass("both")}
          >
            <Users2 className="w-4 h-4 mr-2 text-purple-400" />
            Both
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="w-full h-64 bg-muted"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-10 bg-muted rounded w-full mt-4"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-10">
              <p className="text-red-500">Failed to load companions. Please try again later.</p>
            </div>
          ) : (
            /* Display all companions if no active filter, otherwise apply the active filter */
            filteredCompanions
              .filter(companion => companion.name && companion.imageUrl) // Ensure we have valid companions
              .slice(0, 6) // Only show 6 companions on the home page
              .map((companion, index) => (
                <CompanionCard key={companion.id} companion={companion} index={index} />
              ))
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="link"
            className="text-primary font-medium hover:underline inline-flex items-center"
            onClick={() => setLocation("/companions")}
          >
            View all companions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function CompanionCard({ companion, index }: { companion: Companion, index: number }) {
  const [, setLocation] = useLocation();

  const getMood = () => getMoodFromTraits(companion.traits);
  const getQuote = () => getQuoteFromTraits(companion.traits, companion.name);

  return (
    <div
      className="gradient-card rounded-xl overflow-hidden relative"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative">
        <div className="aspect-square bg-gradient-to-r from-[#FF5C8D] to-[#C41E3A]">
          <img
            src={(companion as any).image_url || companion.imageUrl || `/placeholder-${companion.gender || 'female'}.jpg`}
            alt={`${companion.name} profile`}
            onError={(e) => {
              // If image fails to load, use a color gradient based on gender
              const target = e.target as HTMLImageElement;
              if (companion.gender === 'male') {
                target.style.display = 'none';
                target.parentElement!.className = 'aspect-square bg-gradient-to-r from-blue-400 to-indigo-500';
              } else {
                target.style.display = 'none';
                target.parentElement!.className = 'aspect-square bg-gradient-to-r from-pink-400 to-rose-500';
              }
            }}
            className="w-full h-full object-cover"
          />
        </div>
        {companion.isPremium && (
          <div className="absolute top-4 right-4">
            <Badge className={`
              rounded-md px-3 py-1 uppercase text-xs font-bold flex items-center gap-1
              ${companion.tier === 'premium' ? 'bg-yellow-500' : 'bg-violet-500'} 
              text-white shadow-lg
            `}>
              <Crown className="h-3 w-3" />
              {companion.tier}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h3 className="text-2xl font-bold font-serif text-white text-glow">{companion.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-[#FF5C8D]/80 text-white rounded-md text-xs font-medium">
              {getMood()}
            </Badge>
            <span className="text-white/60 text-xs">• Online</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-white mb-4 italic font-normal text-shadow-lg">
          "{getQuote()}"
        </p>
        
        {/* Traits */}
        <div className="flex flex-wrap gap-2 mb-4">
          {companion.traits.slice(0, 3).map((trait, i) => (
            <Badge key={i} className="bg-white/20 text-white/90 rounded-md border border-white/30">
              {trait}
            </Badge>
          ))}
        </div>
        
        <p className="text-white/95 mb-4 text-sm leading-relaxed">
          {companion.description}
        </p>
        
        <Button
          className="w-full bg-gradient-to-r from-[#FF5C8D] to-[#E91E63] hover:from-[#E91E63] hover:to-[#C41E3A] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={() => setLocation(`/chat/${companion.id}`)}
        >
          Enter Chat
        </Button>
      </div>
    </div>
  );
}
