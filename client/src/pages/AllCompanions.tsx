import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, Users2, ArrowLeft, Search, Filter, Loader2, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Companion } from "@shared/schema";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type CompanionGender = "male" | "female" | "both" | null;
type SortOption = "trending" | "newest" | "popularity" | "relevance";

export default function AllCompanions() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState<CompanionGender>(null);
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  
  // Fetch all companions from API
  const { data: companions = [], isLoading } = useQuery<Companion[]>({
    queryKey: ['/api/companions'],
  });
  
  // Fetch user preference from localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem("companionPreference") as CompanionGender;
    if (storedPreference) {
      setFilterGender(storedPreference);
    }
  }, []);
  
  // Filter and sort companions
  const filteredCompanions = (() => {
    let result = [...companions];
    
    console.log("Total companions:", result.length);
    console.log("Male companions:", result.filter(c => c.gender === "male").length);
    console.log("Female companions:", result.filter(c => c.gender === "female").length);
    console.log("Current gender filter:", filterGender);
    
    // Apply gender filter
    if (filterGender && filterGender !== "both") {
      result = result.filter(companion => companion.gender === filterGender);
      console.log(`After ${filterGender} filter:`, result.length);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        companion => 
          companion.name.toLowerCase().includes(query) || 
          companion.description.toLowerCase().includes(query) ||
          (companion.traits && Array.isArray(companion.traits) && 
           companion.traits.some(trait => trait.toLowerCase().includes(query)))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        // Sort by creation date
        result = [...result].sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case "popularity":
        // Sort by ID for now (in a real app we'd use a popularity metric)
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      case "relevance":
        // Sort by premium status and then by name
        result = [...result].sort((a, b) => {
          if ((a.isPremium || false) === (b.isPremium || false)) {
            return a.name.localeCompare(b.name);
          }
          return (a.isPremium || false) ? -1 : 1;
        });
        break;
      default: // "trending"
        // Keep the original order
        break;
    }
    
    return result;
  })();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-4 text-muted-foreground"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold">All Companions</h1>
            <p className="text-muted-foreground mt-1">
              Find your perfect companion match
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={filterGender === "female" ? "default" : "outline"}
                onClick={() => {
                  setFilterGender("female");
                  localStorage.setItem("companionPreference", "female");
                }}
                className="flex items-center"
              >
                <User className="w-4 h-4 mr-2 text-pink-400" />
                Female
              </Button>
              <Button 
                size="sm" 
                variant={filterGender === "male" ? "default" : "outline"}
                onClick={() => {
                  setFilterGender("male");
                  localStorage.setItem("companionPreference", "male");
                }}
                className="flex items-center"
              >
                <User className="w-4 h-4 mr-2 text-blue-400" />
                Male
              </Button>
              <Button 
                size="sm" 
                variant={filterGender === "both" || filterGender === null ? "default" : "outline"}
                onClick={() => {
                  setFilterGender("both");
                  localStorage.setItem("companionPreference", "both");
                }}
                className="flex items-center"
              >
                <Users2 className="w-4 h-4 mr-2 text-purple-400" />
                Both
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, personality, or traits..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-[180px]">
              <Select 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-6">
          {isLoading ? "Loading companions..." : `Showing ${filteredCompanions.length} companions`}
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium">Loading companions</h3>
            <p className="text-muted-foreground">
              Please wait while we fetch all companions
            </p>
          </div>
        )}
        
        {/* Companions grid */}
        {!isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanions.map((companion, index) => (
              <CompanionCard 
                key={companion.id} 
                companion={companion} 
                onClick={() => setLocation(`/chat/${companion.id}`)}
              />
            ))}
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && filteredCompanions.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No companions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find a companion
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

interface CompanionCardProps {
  companion: Companion;
  onClick: () => void;
}

function CompanionCard({ companion, onClick }: CompanionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="flex flex-col bg-white rounded-xl overflow-hidden shadow-md h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-square bg-gradient-to-r from-purple-100 to-pink-100">
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
          <div className="absolute top-2 right-2">
            <Badge className={`
              rounded-md px-2 py-1 text-[10px] uppercase font-semibold flex items-center gap-1
              ${companion.tier === 'premium' ? 'bg-yellow-500' : 'bg-violet-500'} 
              text-white shadow-lg
            `}>
              <Crown className="h-3 w-3" />
              {companion.tier || 'Premium'}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-lg font-bold text-white">{companion.name}</h3>
          <p className="text-white/80 text-xs">{companion.tagline || 'AI Companion'}</p>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {companion.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {companion.traits && Array.isArray(companion.traits) && companion.traits.slice(0, 3).map((trait: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs bg-accent/50 text-secondary rounded-md">
              {trait}
            </Badge>
          ))}
        </div>
        
        <Button 
          className={`
            w-full text-white rounded-full text-sm mt-auto
            ${companion.isPremium 
              ? `bg-gradient-to-r ${companion.tier === 'premium' ? 'from-pink-500 to-rose-400' : 'from-violet-600 to-indigo-600'}` 
              : 'bg-gradient-to-r from-primary to-secondary'}
          `}
        >
          Chat Now
        </Button>
      </div>
    </motion.div>
  );
}