import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, HeartHandshake, Settings, LogOut, BarChart } from "lucide-react";
import InteractionHeatmap from "@/components/InteractionHeatmap";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import type { Companion } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);

  // Fetch companions from the API
  const { data: companions = [], isLoading } = useQuery<Companion[]>({
    queryKey: ['/api/companions'],
    retry: false,
  });

  useEffect(() => {
    // Redirect to login if no user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetchApi('/api/auth/me');
        if (!response.ok) {
          setLocation('/signup');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setLocation('/signup');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
      setLocation('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const startChat = (companion: Companion) => {
    setSelectedCompanion(companion);
    setLocation(`/chat/${companion.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Toaster />
      
      {/* Mobile-friendly header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-primary">RedVelvet</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Choose a companion to start chatting or view your interaction patterns.</p>
        </div>
        
        <Tabs defaultValue="companions" className="w-full mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="companions">Companions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="companions">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-[280px] animate-pulse">
                    <CardHeader className="h-14 bg-muted rounded-t-lg" />
                    <CardContent className="pt-4">
                      <div className="w-3/4 h-5 bg-muted rounded mb-2" />
                      <div className="w-full h-24 bg-muted rounded" />
                    </CardContent>
                    <CardFooter>
                      <div className="w-full h-10 bg-muted rounded" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companions?.map((companion: Companion) => (
                  <Card 
                    key={companion.id}
                    className="overflow-hidden transition-all hover:shadow-lg border-2 hover:border-primary/50"
                  >
                    <div 
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${companion.imageUrl})` }}
                    />
                    <CardHeader className="pt-4 pb-2">
                      <CardTitle>{companion.name}</CardTitle>
                      <CardDescription>{companion.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground pb-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {companion.traits.map((trait, i) => (
                          <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                            {trait}
                          </span>
                        ))}
                      </div>
                      <p className="line-clamp-3">{companion.description}</p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        onClick={() => startChat(companion)} 
                        className="w-full gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Start Chatting
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {!isLoading && companions?.length === 0 && (
              <div className="text-center py-12">
                <HeartHandshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Companions Available</h3>
                <p className="text-muted-foreground mb-6">
                  There are no companions available right now. Please check back later.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  Interaction Analytics
                </h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Here you can view your interaction patterns with your favorite companions. 
                This helps you understand when you're most active.
              </p>
              
              {/* Show heatmaps for most interacted companions, defaulting to first one if available */}
              {companions && companions.length > 0 ? (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Most Active Companion</CardTitle>
                      <CardDescription>
                        Showing interaction data for {companions[0].name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <InteractionHeatmap companionId={companions[0].id} />
                    </CardContent>
                  </Card>
                  
                  {companions.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Second Most Active Companion</CardTitle>
                        <CardDescription>
                          Showing interaction data for {companions[1].name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <InteractionHeatmap companionId={companions[1].id} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="mt-6">
                  <CardContent className="pt-6 text-center">
                    <HeartHandshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Interaction Data Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start chatting with companions to see your interaction patterns here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}