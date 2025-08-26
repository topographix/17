import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Companion } from '@shared/schema';
import { Loader2, Image, Users } from 'lucide-react';

export default function AdminImageGenerator() {
  const [adminPassword, setAdminPassword] = useState('');
  const { toast } = useToast();

  // Fetch all companions to show current status
  const { data: companions = [], isLoading: isLoadingCompanions } = useQuery<Companion[]>({
    queryKey: ['/api/companions'],
  });

  // Generate all companion images mutation
  const generateAllImagesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/generate-companion-images', {
        adminPassword
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'All companion images generated successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generate single companion image mutation
  const generateSingleImageMutation = useMutation({
    mutationFn: async (companionId: number) => {
      const res = await apiRequest('POST', `/api/admin/generate-companion-image/${companionId}`, {
        adminPassword
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Companion image generated successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerateAll = () => {
    if (!adminPassword) {
      toast({
        title: 'Error',
        description: 'Please enter the admin password',
        variant: 'destructive',
      });
      return;
    }
    generateAllImagesMutation.mutate();
  };

  const handleGenerateSingle = (companionId: number) => {
    if (!adminPassword) {
      toast({
        title: 'Error',
        description: 'Please enter the admin password',
        variant: 'destructive',
      });
      return;
    }
    generateSingleImageMutation.mutate(companionId);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin: Character Image Generator
        </h1>
        <p className="text-gray-600">
          Generate consistent AI-powered character portraits for all companions
        </p>
      </div>

      {/* Admin Authentication */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Enter admin password to access image generation features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Input
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="max-w-xs"
            />
            <Button 
              onClick={handleGenerateAll}
              disabled={generateAllImagesMutation.isPending || !adminPassword}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {generateAllImagesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating All Images...
                </>
              ) : (
                <>
                  <Image className="mr-2 h-4 w-4" />
                  Generate All Character Images
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companions Grid */}
      {isLoadingCompanions ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companions.map((companion) => (
            <Card key={companion.id} className="overflow-hidden">
              <div className="aspect-square relative bg-gray-100">
                {companion.imageUrl ? (
                  <img
                    src={companion.imageUrl}
                    alt={companion.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Image className="h-12 w-12" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{companion.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{companion.tagline}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {companion.traits?.slice(0, 3).map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                
                <Button
                  onClick={() => handleGenerateSingle(companion.id)}
                  disabled={generateSingleImageMutation.isPending || !adminPassword}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {generateSingleImageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-3 w-3" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Enter the admin password to enable image generation</li>
            <li>• Click "Generate All Character Images" to create consistent portraits for all companions</li>
            <li>• Or use individual "Generate Image" buttons for specific companions</li>
            <li>• Images are generated using AI with consistent style and character traits</li>
            <li>• The process may take several minutes for all companions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}