"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, Utensils, Camera, Image as ImageIcon, ArrowLeft, Star, Clock, ExternalLink, X, Search, Lightbulb, Play } from "lucide-react"
import { useAuth } from "@/lib/utils"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { useToast } from "@/hooks/use-toast"
import LoadingScreen from "@/components/LoadingScreen"
import FeatureLock from "@/components/FeatureLock"
import { api } from "@/lib/api"
import { handleAuthError } from "@/lib/utils"
import { compressImage, validateImage, formatFileSize, generateThumbnail } from "@/utils/imageUtils"
import { Badge } from "@/components/ui/badge"
import { formatInstructionsForDisplay } from '@/utils/instructionFormatter';

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
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (loading) {
    return <LoadingScreen size="md" />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto">
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8
      });

      setSelectedImage(compressed.file);
      setImagePreview(compressed.dataUrl);
      setShowResults(false);
      setInstructions("");
      setDetectedFoods([]);
      setResources(null);
      setDetectionResult(null);
      setIsProcessing(false);

      // Show compression info
      toast({
        title: "Image Compressed",
        description: `Reduced from ${formatFileSize(compressed.originalSize)} to ${formatFileSize(compressed.size)} (${Math.round(compressed.compressionRatio * 100)}% smaller)`,
      });

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
        title: "Error",
        description: "Please select an image first.",
        variant: "destructive",
      })
      return
    }
    
    // Prevent duplicate submissions
    if (isLoading) {
      toast({
        title: "Processing",
        description: "Please wait for the current detection to complete.",
        variant: "default",
      })
      return
    }
    
    setIsLoading(true)
    setIsProcessing(true)
    setInstructions("")
    setDetectedFoods([])
    setResources(null)
    setShowResults(false)

    try {
      // Increment free usage count
      incrementFreeUsage();
      
      // Record feature usage
      await recordFeatureUsage('food_detection');
    } catch (error) {
      console.error('Error recording feature usage:', error);
    }
    
    // Use the already compressed image from imagePreview
    const compressedImageData = imagePreview || ""
    
    const formData = new FormData()
    formData.append("image", selectedImage)
    
    try {
      // Step 1: Detect food
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
      
      // Format instructions for better readability
      let formattedInstructions = data.instructions || ""
      
      // Convert markdown-style formatting to HTML
      formattedInstructions = formattedInstructions
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
        .replace(/\n\n/g, '</p><p>') // Double line breaks to paragraphs
        .replace(/\n/g, '<br>') // Single line breaks
      
      // Format numbered steps
      formattedInstructions = formattedInstructions.replace(/(\d+\.\s*)/g, '<br><strong>$1</strong>')
      
      // Wrap in paragraph tags if not already wrapped
      if (!formattedInstructions.startsWith('<p>')) {
        formattedInstructions = '<p>' + formattedInstructions + '</p>'
      }
      
      setInstructions(formattedInstructions)
      setDetectedFoods(data.food_detected || [])
      setShowResults(true)
      setDetectionResult(data);
      
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
            console.log("[DetectFood] Successfully saved detection history with resources");
            toast({
              title: "Success",
              description: "Detection and resources saved to history successfully.",
              variant: "default",
            })
          }
        } catch (historyError) {
          console.error("[DetectFood] Error saving to history:", historyError);
          toast({
            title: "Warning",
            description: "Food detected but failed to save to history.",
            variant: "destructive",
          })
        }
      } else {
        console.warn("[DetectFood] Skipping history save - no token");
      }
      
    } catch (error) {
      console.error("[DetectFood] Error detecting food:", error)
      toast({
        title: "Error",
        description: "Failed to detect food. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) {
      console.error('Invalid URL:', url);
      return null;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">AI Food Detection</h1>
            <p className="text-sm sm:text-base text-gray-600">Upload photos of your meals to get detailed nutritional information</p>
          </div>
        </div>

          {/* Free Usage Indicator */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="text-sm sm:text-base font-medium text-blue-900">
                  Free Uses: {freeUsageCount}/{maxFreeUsage}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 sm:w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      freeUsageCount >= maxFreeUsage 
                        ? 'bg-red-500' 
                        : freeUsageCount >= maxFreeUsage * 0.8 
                        ? 'bg-orange-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((freeUsageCount / maxFreeUsage) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  {Math.round((freeUsageCount / maxFreeUsage) * 100)}%
                </span>
              </div>
            </div>
            {freeUsageCount >= maxFreeUsage && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                Free limit reached. Upgrade to continue using this feature.
              </div>
            )}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Camera className="h-5 w-5 text-[#FF6B6B]" /> Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prominent Image Upload Button */}
                <div className="text-center">
                  <Button 
                    onClick={() => {
                      // Show upload options modal
                      setShowUploadModal(true);
                    }}
                    className="w-full h-32 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-8 px-6 rounded-xl transition-all duration-300 text-lg sm:text-xl shadow-lg hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon className="h-12 w-12" />
                      <div>
                        <div className="font-bold">Upload Food Image</div>
                        <div className="text-sm opacity-90">Take photo or choose from gallery</div>
            </div>
                    </div>
                  </Button>
          </div>

                {/* Hidden file inputs for modal */}
                <input type="file" id="cameraInput" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
                <input type="file" id="fileInput" accept="image/*" className="hidden" onChange={handleImageSelect} />
                
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md" />
                    <Button
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
            </div>
          )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!imagePreview || isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base sm:text-lg font-semibold loading-button"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Detect Food
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <p className="text-gray-700">Take a photo of your meal or upload an existing image</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <p className="text-gray-700">Our AI analyzes the image to identify food items and ingredients</p>
                </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                    <p className="text-gray-700">Get detailed nutritional information and recipe suggestions</p>
                      </div>
                    </div>
              </CardContent>
            </Card>
                  </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Instructions Section */}
            {instructions && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-orange-500" />
                      Cooking Instructions
                    </CardTitle>
                    <Button
                      onClick={() => {
                        setShowResults(false)
                        setInstructions("")
                        setDetectedFoods([])
                        setResources(null)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Detected Foods */}
                    {detectedFoods.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 detected-foods-container">
                        <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Detected Foods:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {detectedFoods.map((food, index) => (
                            <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Instructions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 instruction-card">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Step-by-Step Instructions:
                      </h4>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3 instructions-content"
                        dangerouslySetInnerHTML={{ __html: formatInstructionsForDisplay(instructions) }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resources Section */}
            {loadingResources && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Loading Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
                    <span className="text-gray-600">Loading cooking resources...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {resources && !loadingResources && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Cooking Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* YouTube Videos */}
                    {resources.YoutubeSearch && resources.YoutubeSearch.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                          <Play className="h-4 w-4 text-red-500" />
                          YouTube Tutorials
                        </h4>
                        <div className="space-y-3">
                          {resources.YoutubeSearch.slice(0, 3).map((video: any, index: number) => {
                            const videoId = getYouTubeVideoId(video.link);
                            return videoId ? (
                              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <div className="aspect-video bg-gray-100">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                    title={video.title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="p-3">
                                  <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                    {video.title}
                                  </h5>
                                  <p className="text-gray-600 text-xs mb-2">
                                    {video.channel}
                                  </p>
                                  <a
                                    href={video.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-medium"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Watch on YouTube
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <a
                                key={index}
                                href={video.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs">▶</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {video.title}
                                  </p>
                                  <p className="text-gray-600 text-xs">
                                    {video.channel}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Web Resources */}
                    {resources.GoogleSearch && resources.GoogleSearch.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          Web Resources
                        </h4>
                        <div className="space-y-3">
                          {resources.GoogleSearch.slice(0, 3).map((result: any, index: number) => (
                            <a
                              key={index}
                              href={result.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs">🔍</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {result.title}
                                </p>
                                <p className="text-gray-600 text-xs truncate">
                                  {result.snippet}
                                </p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {detectionResult && detectionResult.food_detected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Detection Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Detected Foods */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Detected Foods:</h3>
                      <div className="flex flex-wrap gap-2">
                        {detectionResult.food_detected && Array.isArray(detectionResult.food_detected) && detectionResult.food_detected.map((food: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                            {typeof food === 'string' ? food : food.name || food}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Nutritional Info */}
                    {detectionResult.nutrition && detectionResult.nutrition.calories && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Nutritional Information:</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-900">{detectionResult.nutrition.calories}</div>
                            <div className="text-gray-600">Calories</div>
                                </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-900">{detectionResult.nutrition.protein}g</div>
                            <div className="text-gray-600">Protein</div>
                                </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-900">{detectionResult.nutrition.carbs}g</div>
                            <div className="text-gray-600">Carbs</div>
                              </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-900">{detectionResult.nutrition.fat}g</div>
                            <div className="text-gray-600">Fat</div>
                              </div>
                        </div>
                      </div>
                    )}

                    {/* Recipe Suggestions */}
                    {detectionResult.recipes && Array.isArray(detectionResult.recipes) && detectionResult.recipes.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Recipe Suggestions:</h3>
                        <div className="space-y-2">
                          {detectionResult.recipes.slice(0, 3).map((recipe: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded text-xs sm:text-sm">
                              <div className="font-medium text-gray-900">{recipe.title}</div>
                              <div className="text-gray-600">{recipe.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Tips for better results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Ensure good lighting and clear focus on the food</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Include the entire meal in the frame for comprehensive analysis</p>
                    </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Avoid blurry or heavily edited images for accurate detection</p>
                  </div>
              </div>
              </CardContent>
            </Card>
            </div>
          </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Food Image</h3>
              <p className="text-gray-600">Choose how you'd like to upload your food photo</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  document.getElementById('cameraInput')?.click();
                  setShowUploadModal(false);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors"
              >
                <Camera className="h-5 w-5 mr-3" />
                Take Photo with Camera
              </Button>
              
              <Button 
                        onClick={() => {
                  document.getElementById('fileInput')?.click();
                  setShowUploadModal(false);
                }}
                variant="outline" 
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-medium py-4 px-6 rounded-lg transition-colors"
              >
                <ImageIcon className="h-5 w-5 mr-3" />
                Choose from Gallery
              </Button>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
                    </div>
                  </div>
                </div>
              )}
    </div>
  );
};

export default DetectFoodPage;