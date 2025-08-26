import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "@/components/ui/data-table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Users, Settings, PlusCircle, ImagePlus, ListFilter, ChevronLeft, Save, Crown, UserCheck } from "lucide-react";
import InteractionHeatmap from "@/components/InteractionHeatmap";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { fetchApi } from "@/lib/api";
import type { Companion } from "@shared/schema";

// Component for editing companion settings and details
function CompanionTierEditor({ companion, onUpdate }: { companion: Companion; onUpdate: () => void }) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editData, setEditData] = useState({
    name: companion.name,
    tagline: companion.tagline,
    description: companion.description,
    traits: companion.traits?.join(', ') || '',
    features: companion.features?.join(', ') || '',
    imageUrl: companion.imageUrl,
    gender: companion.gender,
    available: companion.available ?? true,
    isPremium: companion.isPremium ?? false,
    tier: companion.tier || 'standard'
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<File[]>([]);
  const [albumPreviews, setAlbumPreviews] = useState<string[]>([]);

  const uploadAlbumMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetchApi(`/api/companions/${companion.id}/album`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload album images');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Album Updated",
        description: "Images have been added to the companion's photo album.",
      });
      setAlbumImages([]);
      setAlbumPreviews([]);
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const updateCompanionMutation = useMutation({
    mutationFn: async (updates: Partial<Companion> | FormData) => {
      let response;
      if (updates instanceof FormData) {
        // For file uploads
        response = await fetchApi(`/api/companions/${companion.id}`, {
          method: 'PATCH',
          body: updates,
        });
      } else {
        // For regular updates
        response = await apiRequest('PATCH', `/api/companions/${companion.id}`, updates);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companions'] });
      toast({
        title: "Success",
        description: `${companion.name} has been updated.`,
      });
      onUpdate();
      setIsExpanded(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update companion settings.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  const handleTierChange = async (updates: Partial<Companion>) => {
    setIsUpdating(true);
    updateCompanionMutation.mutate(updates);
  };

  const handleAvailabilityToggle = () => {
    handleTierChange({ available: !editData.available });
    setEditData(prev => ({ ...prev, available: !prev.available }));
  };

  const handlePremiumToggle = () => {
    handleTierChange({ isPremium: !editData.isPremium });
    setEditData(prev => ({ ...prev, isPremium: !prev.isPremium }));
  };

  const handleTierSelect = (tier: string) => {
    handleTierChange({ tier });
    setEditData(prev => ({ ...prev, tier }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAlbumImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAlbumImages(files);
      
      // Generate previews for all selected files
      const previews: string[] = [];
      let loadedCount = 0;
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = () => {
          previews[index] = reader.result as string;
          loadedCount++;
          if (loadedCount === files.length) {
            setAlbumPreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUploadAlbumImages = () => {
    if (albumImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select images to upload to the album.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    const formData = new FormData();
    
    albumImages.forEach((file) => {
      formData.append('images', file);
    });

    uploadAlbumMutation.mutate(formData);
  };

  const handleSaveDetails = () => {
    setIsUpdating(true);
    
    if (selectedImage) {
      // Handle image upload
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        name: editData.name,
        tagline: editData.tagline,
        description: editData.description,
        traits: editData.traits.split(',').map(t => t.trim()).filter(t => t),
        features: editData.features.split(',').map(f => f.trim()).filter(f => f),
        gender: editData.gender
      }));
      formData.append('image', selectedImage);
      
      updateCompanionMutation.mutate(formData);
    } else {
      // Handle regular update
      const updates = {
        name: editData.name,
        tagline: editData.tagline,
        description: editData.description,
        traits: editData.traits.split(',').map(t => t.trim()).filter(t => t),
        features: editData.features.split(',').map(f => f.trim()).filter(f => f),
        imageUrl: editData.imageUrl,
        gender: editData.gender
      };
      
      updateCompanionMutation.mutate(updates);
    }
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Compact view */}
      <div className="flex items-center gap-4 p-4">
        <div 
          className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 border-2"
          style={{ 
            backgroundImage: `url(${imagePreview || companion.imageUrl})`,
            borderColor: editData.available ? (editData.isPremium ? '#fbbf24' : '#10b981') : '#6b7280'
          }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{companion.name}</h3>
            <div className="flex items-center gap-1">
              {!editData.available && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs">
                  Disabled
                </span>
              )}
              {editData.isPremium && editData.available && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              )}
              {!editData.isPremium && editData.available && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  Free
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">{companion.tagline}</p>
          <p className="text-xs text-muted-foreground">ID: {companion.id} | Gender: {companion.gender}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor={`available-${companion.id}`} className="text-sm font-medium">
              Available
            </Label>
            <Switch
              id={`available-${companion.id}`}
              checked={editData.available}
              onCheckedChange={handleAvailabilityToggle}
              disabled={isUpdating}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor={`premium-${companion.id}`} className="text-sm font-medium">
              Premium Only
            </Label>
            <Switch
              id={`premium-${companion.id}`}
              checked={editData.isPremium}
              onCheckedChange={handlePremiumToggle}
              disabled={isUpdating || !editData.available}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Tier</Label>
            <Select 
              value={editData.tier} 
              onValueChange={handleTierSelect}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isUpdating}
          >
            <Settings className="h-4 w-4 mr-1" />
            {isExpanded ? 'Less' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Expanded editing view */}
      {isExpanded && (
        <div className="border-t p-4 bg-muted/30">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`name-${companion.id}`}>Name</Label>
                <Input
                  id={`name-${companion.id}`}
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <Label htmlFor={`tagline-${companion.id}`}>Tagline</Label>
                <Input
                  id={`tagline-${companion.id}`}
                  value={editData.tagline}
                  onChange={(e) => setEditData(prev => ({ ...prev, tagline: e.target.value }))}
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`description-${companion.id}`}>Description</Label>
              <Textarea
                id={`description-${companion.id}`}
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`traits-${companion.id}`}>Traits (comma-separated)</Label>
                <Input
                  id={`traits-${companion.id}`}
                  value={editData.traits}
                  onChange={(e) => setEditData(prev => ({ ...prev, traits: e.target.value }))}
                  placeholder="Caring, Confident, Playful"
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <Label htmlFor={`features-${companion.id}`}>Features (comma-separated)</Label>
                <Input
                  id={`features-${companion.id}`}
                  value={editData.features}
                  onChange={(e) => setEditData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Deep conversations, Romance, Adventure"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`gender-${companion.id}`}>Gender</Label>
                <Select 
                  value={editData.gender || undefined} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, gender: value }))}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`image-url-${companion.id}`}>Image URL</Label>
                <Input
                  id={`image-url-${companion.id}`}
                  value={editData.imageUrl}
                  onChange={(e) => setEditData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Image Upload Section with Guidelines */}
            <div className="space-y-4">
              <div>
                <Label htmlFor={`image-upload-${companion.id}`}>Profile Image Upload</Label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <h4 className="font-medium text-blue-900 mb-2">📐 Image Guidelines</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Recommended Size:</strong> 512x512 pixels (1:1 square ratio)</li>
                    <li>• <strong>Minimum Size:</strong> 400x400 pixels</li>
                    <li>• <strong>Face Position:</strong> Center the face in the middle of the square image</li>
                    <li>• <strong>Format:</strong> JPG, PNG, or WebP</li>
                    <li>• <strong>File Size:</strong> Under 5MB for optimal loading</li>
                    <li>• <strong>Quality:</strong> High resolution, well-lit, clear facial features</li>
                  </ul>
                </div>
                <Input
                  id={`image-upload-${companion.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUpdating}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-primary" />
                    <p className="text-xs text-muted-foreground mt-1">Preview: Face should be centered in middle of square</p>
                  </div>
                )}
              </div>

              {/* Photo Album Section */}
              <div>
                <Label>Photo Album (Multiple Images)</Label>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                  <h4 className="font-medium text-purple-900 mb-2">🏷️ Photo Album Features</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Upload multiple images for variety in conversations</li>
                    <li>• Each image will be randomly shown during chats</li>
                    <li>• Same size guidelines as profile image apply</li>
                    <li>• Maximum 5 additional images per companion</li>
                  </ul>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAlbumImagesChange}
                  disabled={isUpdating}
                  className="mb-2"
                />
                
                {/* Preview selected images */}
                {albumPreviews.length > 0 && (
                  <div className="mt-2 mb-3">
                    <p className="text-sm font-medium mb-2">Selected Images ({albumPreviews.length}):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {albumPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-20 h-20 object-cover rounded-xl border-2 border-primary"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleUploadAlbumImages}
                      disabled={isUpdating}
                      size="sm"
                      className="mt-2 bg-purple-600 hover:bg-purple-700"
                    >
                      {isUpdating ? 'Uploading...' : `Upload ${albumImages.length} Images`}
                    </Button>
                  </div>
                )}

                {/* Display existing album images */}
                {companion.albumUrls && companion.albumUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Current Album ({companion.albumUrls.length}/5):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {companion.albumUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={url} 
                            alt={`Album ${index + 1}`} 
                            className="w-20 h-20 object-cover rounded-xl border"
                          />
                          <span className="absolute top-0 right-0 bg-black/50 text-white text-xs px-1 rounded-bl">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty album placeholder */}
                {(!companion.albumUrls || companion.albumUrls.length === 0) && albumPreviews.length === 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Empty</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveDetails}
                disabled={isUpdating}
                size="sm"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
                <Save className="h-4 w-4 ml-1" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setIsExpanded(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                  // Reset edit data to original values
                  setEditData({
                    name: companion.name,
                    tagline: companion.tagline,
                    description: companion.description,
                    traits: companion.traits?.join(', ') || '',
                    features: companion.features?.join(', ') || '',
                    imageUrl: companion.imageUrl,
                    gender: companion.gender,
                    available: companion.available ?? true,
                    isPremium: companion.isPremium ?? false,
                    tier: companion.tier || 'standard'
                  });
                }}
                disabled={isUpdating}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCompanionId, setSelectedCompanionId] = useState<number | null>(null);
  const [isCreatingCompanion, setIsCreatingCompanion] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // New companion form state
  const [newCompanion, setNewCompanion] = useState({
    name: "",
    tagline: "",
    description: "",
    imageUrl: "",
    personality: "friendly",
    traits: [] as string[],
    gender: "female",
    isPremium: false
  });
  
  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch companions from the API
  const { data: companions = [], isLoading, refetch } = useQuery<Companion[]>({
    queryKey: ['/api/companions'],
    retry: false,
  });

  // Admin password verification (simple for now, should be improved in production)
  const verifyAdmin = () => {
    // In a real application, this should make a server request
    if (adminPassword === "redvelvet-admin") {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password.",
        variant: "destructive"
      });
    }
  };

  const handleTraitInput = (value: string) => {
    if (value.trim() === "") return;
    
    const traits = value.split(",").map(t => t.trim()).filter(t => t.length > 0);
    setNewCompanion(prev => ({
      ...prev,
      traits
    }));
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCompanion = async () => {
    setIsCreatingCompanion(true);
    try {
      // If we have required fields missing, show error
      if (!newCompanion.name || !newCompanion.tagline || !newCompanion.description) {
        throw new Error('Please fill in all required fields');
      }
      
      // If no image uploaded and no image URL provided, show error
      if (!selectedImage && !newCompanion.imageUrl) {
        throw new Error('Please upload an image or provide an image URL');
      }

      // Use FormData to handle file upload
      const formData = new FormData();
      
      // Add companion data as JSON
      formData.append('data', JSON.stringify(newCompanion));
      
      // Add image file if it exists
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const response = await fetchApi('/api/companions', {
        method: 'POST',
        // Don't set Content-Type header, it will be set automatically with boundary for multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create companion');
      }

      toast({
        title: "Companion Created",
        description: `${newCompanion.name} has been added to the platform.`,
      });

      // Reset form and refetch companions
      setNewCompanion({
        name: "",
        tagline: "",
        description: "",
        imageUrl: "",
        personality: "friendly",
        traits: [],
        gender: "female",
        isPremium: false
      });
      
      // Reset image state
      setSelectedImage(null);
      setImagePreview(null);
      
      refetch();
    } catch (error) {
      console.error("Error creating companion:", error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create the companion.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCompanion(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter admin password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={verifyAdmin}>Access Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-primary">RedVelvet Admin</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container py-6">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="companions">Companions</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold tracking-tight">
                User Interaction Analytics
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>Users currently active on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">247</div>
                  <p className="text-muted-foreground mt-2">+12% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Messages</CardTitle>
                  <CardDescription>Messages sent today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">1,893</div>
                  <p className="text-muted-foreground mt-2">+24% from yesterday</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Companion Selection</CardTitle>
                <CardDescription>Select a companion to view detailed analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {companions.map(companion => (
                    <Button 
                      key={companion.id}
                      variant={selectedCompanionId === companion.id ? "default" : "outline"}
                      className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2"
                      onClick={() => setSelectedCompanionId(companion.id)}
                    >
                      <div 
                        className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-primary/50"
                        style={{ backgroundImage: `url(${companion.imageUrl})` }}
                      />
                      <span className="text-sm">{companion.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {selectedCompanionId ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {companions.find(c => c.id === selectedCompanionId)?.name} Analytics
                  </CardTitle>
                  <CardDescription>
                    Interaction patterns for {companions.find(c => c.id === selectedCompanionId)?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <InteractionHeatmap companionId={selectedCompanionId} />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-6 text-center">
                  <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Companion</h3>
                  <p className="text-muted-foreground">
                    Please select a companion from the list above to view detailed analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="companions" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  Companion Management
                </h2>
              </div>
              
              <Button onClick={() => document.getElementById('create-companion-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <PlusCircle className="h-4 w-4 mr-2" /> New Companion
              </Button>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Companion Access Management</CardTitle>
                <CardDescription>Control which companions are available to free and premium users</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="grid gap-3">
                    {companions.map(companion => (
                      <CompanionTierEditor 
                        key={companion.id} 
                        companion={companion} 
                        onUpdate={refetch}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card id="create-companion-section">
              <CardHeader>
                <CardTitle>Create New Companion</CardTitle>
                <CardDescription>Add a new AI companion to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Companion Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter name" 
                        value={newCompanion.name}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input 
                        id="tagline" 
                        placeholder="A short tagline" 
                        value={newCompanion.tagline}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, tagline: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Detailed description" 
                      rows={3}
                      value={newCompanion.description}
                      onChange={(e) => setNewCompanion(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="imageUpload">Upload Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input 
                          id="imageUpload" 
                          type="file" 
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleImageChange}
                          className="cursor-pointer"
                        />
                      </div>
                      
                      {imagePreview && (
                        <div 
                          className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-primary/50 flex-shrink-0"
                          style={{ backgroundImage: `url(${imagePreview})` }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Upload a JPG, PNG or GIF (max 5MB)</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="imageUrl">OR Image URL (optional if uploading)</Label>
                    <Input 
                      id="imageUrl" 
                      placeholder="https://example.com/image.jpg" 
                      value={newCompanion.imageUrl}
                      onChange={(e) => setNewCompanion(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">You can provide a URL instead of uploading</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="personality">Personality</Label>
                      <select 
                        id="personality" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={newCompanion.personality}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, personality: e.target.value }))}
                      >
                        <option value="friendly">Friendly</option>
                        <option value="warm">Warm</option>
                        <option value="bold">Bold</option>
                        <option value="nurturing">Nurturing</option>
                        <option value="curious">Curious</option>
                        <option value="passionate">Passionate</option>
                        <option value="protective">Protective</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select 
                        id="gender" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={newCompanion.gender}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, gender: e.target.value as "male" | "female" }))}
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="traits">Traits (comma separated)</Label>
                    <Input 
                      id="traits" 
                      placeholder="Caring, Intelligent, Creative" 
                      onChange={(e) => handleTraitInput(e.target.value)}
                    />
                    {newCompanion.traits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newCompanion.traits.map((trait, index) => (
                          <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isPremium" 
                      checked={newCompanion.isPremium}
                      onChange={(e) => setNewCompanion(prev => ({ ...prev, isPremium: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isPremium">Premium Companion</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={createCompanion} 
                  disabled={isCreatingCompanion || !newCompanion.name || !newCompanion.description}
                  className="ml-auto"
                >
                  {isCreatingCompanion ? "Creating..." : "Create Companion"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold tracking-tight">
                Site Settings
              </h2>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Manage global settings for RedVelvet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input id="site-name" defaultValue="RedVelvet" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tagline">Site Tagline</Label>
                      <Input id="tagline" defaultValue="Meaningful digital companionship" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Site Description</Label>
                    <Textarea 
                      id="description" 
                      rows={3}
                      defaultValue="An advanced AI companion platform designed to create meaningful, personalized digital interactions through intelligent communication technologies."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="free-messages">Free Messages</Label>
                      <Input id="free-messages" type="number" defaultValue="100" />
                      <p className="text-xs text-muted-foreground">Number of free messages for new users</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="subscription-price">Monthly Subscription (USD)</Label>
                      <Input id="subscription-price" type="number" defaultValue="29.99" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="maintenance-mode" className="h-4 w-4" />
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Save Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">User management features will be implemented in the next update.</p>
                <Button variant="outline" disabled>View Users</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}