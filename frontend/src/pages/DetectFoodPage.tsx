"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, Utensils, Camera, Image as ImageIcon, ArrowLeft, Star, Clock, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/utils"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { useToast } from "@/hooks/use-toast"
import LoadingScreen from "@/components/LoadingScreen"
import FeatureLock from "@/components/FeatureLock"
import { api } from "@/lib/api"
import { handleAuthError } from "@/lib/utils"
import { compressImage, validateImage, formatFileSize, generateThumbnail } from "@/utils/imageUtils"

const DetectFoodPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [instructions, setInstructions] = useState<string>("")
  const [detectedFoods, setDetectedFoods] = useState<string[]>([])
  const [resources, setResources] = useState<any>(null)
  const [loadingResources, setLoadingResources] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()
  const { token, isAuthenticated, loading } = useAuth()
  const { isFeatureLocked, recordFeatureUsage, incrementFreeUsage, freeUsageCount, maxFreeUsage } = useSubscription()

  if (loading) {
    return <LoadingScreen size="md" />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
              <p className="text-gray-600">
                Please log in to use the food detection feature and save your detections to history.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if feature is locked
  if (isFeatureLocked('food_detection')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <FeatureLock
            featureName="food_detection"
            featureTitle="AI Food Detection"
            featureDescription="Upload photos of your meals to get detailed nutritional information, cooking instructions, and recipe suggestions powered by advanced AI."
            icon={<Utensils className="h-8 w-8 text-[#FF6B6B]" />}
          />
        </div>
      </div>
    )
  }

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        title: "Invalid Image",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);

      // Compress image
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8
      });

      // Generate thumbnail
      const thumbnail = await generateThumbnail(file, {
        width: 200,
        height: 200
      });

      setSelectedImage(file);
      setImagePreview(thumbnail);
      setShowResults(false);
      setInstructions("");
      setDetectedFoods([]);
      setResources(null);

    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingResources(true);

    try {
      await recordFeatureUsage('food_detection');
    } catch (error) {
      console.error('Error recording feature usage:', error);
    }

    try {
      // Compress image for API
      const compressedImageData = await compressImage(selectedImage, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8
      });

      const formData = new FormData();
      formData.append("image", selectedImage);

      console.log("[DetectFood] Starting food detection...")
      const response = await fetch("https://ai-utu2.onrender.com/food_detect", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("[DetectFood] Food detection response:", data)
      
      if (data.error) {
        toast({
          title: "Error",
          description: data.error || "Failed to detect food.",
          variant: "destructive",
        })
        return
      }
      
      // Format instructions
      let formattedInstructions = data.instructions || ""
      formattedInstructions = formattedInstructions.replace(/\*\*(.*?)\*\*/g, '<br><strong>$1</strong><br>')
      formattedInstructions = formattedInstructions.replace(/\*\s*(.*?)\s*\*/g, '<p>$1</p>')
      formattedInstructions = formattedInstructions.replace(/(\d+\.)/g, '<br>$1')
      
      setInstructions(formattedInstructions)
      setDetectedFoods(data.food_detected || [])
      setShowResults(true)
      
      // Step 2: Fetch resources first if food was detected
      let resourcesData = null;
      if (data.food_detected && data.food_detected.length > 0) {
        try {
          console.log("[DetectFood] Fetching resources for:", data.food_detected);
          const resResponse = await fetch("https://ai-utu2.onrender.com/food_detect_resources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ food_detected: data.food_detected }),
          });
          
          if (!resResponse.ok) {
            throw new Error(`Resources HTTP error! status: ${resResponse.status}`);
          }
          
          resourcesData = await resResponse.json();
          console.log("[DetectFood] Resources data received:", resourcesData);
          
          // Flatten the double-nested arrays to single arrays
          if (resourcesData) {
            if (resourcesData.GoogleSearch && Array.isArray(resourcesData.GoogleSearch)) {
              resourcesData.GoogleSearch = resourcesData.GoogleSearch.flat();
            }
            if (resourcesData.YoutubeSearch && Array.isArray(resourcesData.YoutubeSearch)) {
              resourcesData.YoutubeSearch = resourcesData.YoutubeSearch.flat();
            }
          }
          
          setResources(resourcesData);
        } catch (resourceError) {
          console.error("[DetectFood] Error fetching resources:", resourceError);
          toast({
            title: "Resources Error",
            description: "Failed to fetch cooking resources, but food detection completed.",
            variant: "destructive",
          })
          resourcesData = null;
        }
      } else {
        console.warn("[DetectFood] No detected foods, skipping resources fetch.");
      }
      
      // Step 3: Save everything together (detection + resources)
      if (token) {
        try {
          const historyPayload = {
            recipe_type: "food_detection",
            suggestion: data.food_detected?.join(", ") || "",
            instructions: formattedInstructions,
            ingredients: "",
            detected_foods: JSON.stringify(data.food_detected || []),
            youtube: resourcesData?.YoutubeSearch?.[0]?.link || "",
            google: resourcesData?.GoogleSearch?.[0]?.link || "",
            resources: JSON.stringify(resourcesData || {}),
            image_data: compressedImageData
          };
          
          console.log("[DetectFood] Attempting to save detection history with payload:", historyPayload);
          const historyResponse = await api.saveDetectionHistory(historyPayload);
          console.log("[DetectFood] Save detection history response:", historyResponse);
          
          if (historyResponse.status !== 'success') {
            console.error("[DetectFood] Failed to save detection history:", historyResponse);
            toast({
              title: "Warning",
              description: "Food detected but failed to save to history.",
              variant: "destructive",
            })
          } else {
            console.log("[DetectFood] Successfully saved detection history");
            toast({
              title: "Success",
              description: "Food detection completed and saved to history.",
            })
          }
        } catch (historyError) {
          console.error("[DetectFood] Error saving detection history:", historyError);
          toast({
            title: "Warning",
            description: "Food detected but failed to save to history.",
            variant: "destructive",
          })
        }
      }
      
    } catch (error) {
      console.error('Error detecting food:', error);
      toast({
        title: "Error",
        description: "Failed to detect food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingResources(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Food Detection</h1>
            <p className="text-gray-600">Upload a photo of your meal to get detailed analysis and cooking instructions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Results */}
          <div className="space-y-6">
            {/* Usage Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Free Usage</p>
                      <p className="text-xs text-gray-500">{freeUsageCount} of {maxFreeUsage} used</p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF6B6B] transition-all duration-300"
                      style={{ width: `${Math.min((freeUsageCount / maxFreeUsage) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {freeUsageCount >= maxFreeUsage && (
                  <p className="mt-2 text-xs text-red-600 font-medium">
                    Free limit reached. Upgrade to continue using this feature.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#FF6B6B]" />
                  Upload Food Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Capture Buttons */}
                <div className="flex gap-3">
                  <input
                    type="file"
                    id="cameraInput"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  
                  <Button
                    onClick={() => document.getElementById('cameraInput')?.click()}
                    className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  
                  <Button
                    onClick={() => document.getElementById('fileInput')?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedImage}
              className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white h-12 text-lg font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Food...
                </>
              ) : (
                "Detect Food"
              )}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {showResults && (
              <>
                {/* Detected Foods */}
                {detectedFoods.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-[#FF6B6B]" />
                        Detected Foods
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {detectedFoods.map((food, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full text-sm font-medium"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cooking Instructions */}
                {instructions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#FF6B6B]" />
                        Cooking Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: instructions }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Resources */}
                {resources && (
                  <div className="grid grid-cols-1 gap-4">
                    {/* YouTube Resources */}
                    {resources.YoutubeSearch && resources.YoutubeSearch.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-[#FF6B6B]" />
                            Video Tutorials
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {resources.YoutubeSearch.slice(0, 3).map((video: any, index: number) => (
                              <a
                                key={index}
                                href={video.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">YT</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {video.channel}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </a>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Google Resources */}
                    {resources.GoogleSearch && resources.GoogleSearch.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-[#FF6B6B]" />
                            Recommended Articles
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {resources.GoogleSearch.slice(0, 3).map((article: any, index: number) => (
                              <a
                                key={index}
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">G</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {article.title}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {article.snippet}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </a>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectFoodPage;