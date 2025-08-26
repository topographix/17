import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import CompanionCustomization from "@/components/CompanionCustomization";
import InteractionHeatmap from "@/components/InteractionHeatmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Companion } from "@shared/schema";

export default function CompanionSettings() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch the companion data
  const { data: companion, isLoading: isLoadingCompanion } = useQuery<Companion>({
    queryKey: [`/api/companions/${id}`],
    retry: false,
  });

  const handleDeleteCompanion = () => {
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Premium Feature",
        description: "Custom companions are only available with a premium subscription.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation(`/chat/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {isLoadingCompanion ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar>
                  {companion?.imageUrl ? <AvatarImage src={companion.imageUrl} alt={companion.name} /> : null}
                  <AvatarFallback>
                    {companion?.name ? companion.name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-medium">{companion?.name} Settings</h2>
                  {companion?.isPremium && (
                    <div className="text-xs px-2 py-0.5 bg-pink-100 text-pink-800 rounded-md inline-block mt-1">
                      {companion.tier === 'premium' ? 'Premium' : 'Elite'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={handleDeleteCompanion}
            disabled={isDeleting}
          >
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 container py-6">
        {isLoadingCompanion ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="customization" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customization">
              <CompanionCustomization 
                companionId={companion?.id} 
                companionName={companion?.name}
                isPremium={companion?.isPremium === true}
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Interaction Analytics
                </h2>
                <p className="text-muted-foreground mb-6">
                  See when and how you interact with {companion?.name}. This helps you understand your conversation patterns.
                </p>
                
                {companion && companion.id ? (
                  <InteractionHeatmap companionId={companion.id} className="mb-6" />
                ) : (
                  <Skeleton className="h-72 w-full" />
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}