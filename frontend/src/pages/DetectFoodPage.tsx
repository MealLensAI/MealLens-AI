"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, Utensils, Camera, Image as ImageIcon } from "lucide-react"
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
    return <LoadingScreen
      message="Analyzing your food..."
      subMessage="Our AI is detecting ingredients and nutritional information"
      showLogo={true}
      size="lg"
      fullScreen={true}
    />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg mx-auto">
            <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Authentication Required</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Please log in to use the food detection feature and save your detections to history.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full py-3 text-base sm:text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Check if feature is locked
  if (isFeatureLocked('food_detection')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <FeatureLock
            featureName="food_detection"
            featureTitle="AI Food Detection"
            featureDescription="Upload photos of your meals to get detailed nutritional information, cooking instructions, and recipe suggestions powered by advanced AI."
            icon={<Utensils className="h-8 w-8 text-blue-600" />}
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
  }

  // Function to compress image before sending (legacy - now using imageUtils)
  const compressImageLegacy = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set canvas size (max 800x600 for compression)
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(compressedDataUrl)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
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
    }
  }



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
    <div 
      className="min-h-screen py-4 sm:py-6 lg:py-8 text-[#2D3436] leading-[1.6]"
      style={{
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: "url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=2000&q=80') center/cover no-repeat fixed"
      }}
    >
      <style>{`
        @keyframes loading-slide {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="bg-[rgba(255,255,255,0.95)] rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden p-4 sm:p-6 lg:p-8 xl:p-12 relative"
        >
          {/* Title */}
          <h1 
            className="text-xl sm:text-2xl lg:text-3xl xl:text-[2.5rem] font-[800] text-center mb-4 sm:mb-6 lg:mb-8"
            style={{
              background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-1px"
            }}
          >
            Food Detection
          </h1>

          {/* Free Usage Indicator */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
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

          {/* Image Input */}
          <div className="mb-4 sm:mb-6">
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
              className="w-full p-3 sm:p-4 border-2 border-[rgba(0,0,0,0.1)] rounded-xl sm:rounded-2xl text-sm sm:text-[1.1rem] transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.05)] focus:border-[#FF6B6B] focus:shadow-[0_0_0_4px_rgba(255,107,107,0.2)]"
              onChange={handleImageSelect}
            />
            <div className="flex justify-center mt-3 sm:mt-4">
              <img 
                id="imagePreview" 
                src={imagePreview || ""} 
                alt="Image Preview" 
                className={`${imagePreview ? "block" : "hidden"} w-full max-w-xs sm:max-w-sm lg:max-w-md h-48 sm:h-56 lg:h-64 object-cover rounded-lg sm:rounded-xl`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !selectedImage}
            className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 px-6 sm:px-8 text-lg sm:text-xl font-semibold transition-all duration-300 uppercase tracking-wider shadow-[0_4px_15px_rgba(255,107,107,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,107,107,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Detect Food"}
          </button>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[rgba(255,107,107,0.3)] border-t-[#FF6B6B] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="mt-4">
              {/* Instructions Section */}
              {instructions && (
                <div 
                  className="mt-8 bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                >
                  <div className="p-4 mt-2.5">
                    <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                      Cooking Instructions
                    </h5>
                    <div 
                      className="leading-[1.4] m-0 text-left"
                      style={{ lineHeight: '1.4', margin: 0, textAlign: 'left' }}
                      dangerouslySetInnerHTML={{ __html: instructions }}
                    />
                  </div>
              </div>
              )}

              {/* Resources Section */}
              {loadingResources && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* YouTube Resources Loading */}
                  <div 
                    className="bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                  >
                    <div className="p-4 mt-2.5">
                      <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                        Youtube Resources
                      </h5>
                      <h6 className="font-bold mb-3 text-left">Video Tutorials</h6>
                      <div className="w-full h-1 bg-[#f0f0f0] rounded-sm my-4 overflow-hidden relative">
                        <div 
                          className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] rounded-sm"
                          style={{
                            animation: 'loading-slide 1.5s ease-in-out infinite'
                          }}
                        ></div>
                      </div>
                      <div className="text-center">Loading video tutorials...</div>
                    </div>
                  </div>

                  {/* Google Resources Loading */}
                  <div 
                    className="bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                  >
                    <div className="p-4 mt-2.5">
                      <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                        Google Resources
                      </h5>
                      <h6 className="font-bold mb-3 text-left">Recommended Articles</h6>
                      <div className="w-full h-1 bg-[#f0f0f0] rounded-sm my-4 overflow-hidden relative">
                        <div 
                          className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] rounded-sm"
                          style={{
                            animation: 'loading-slide 1.5s ease-in-out infinite'
                          }}
                        ></div>
                      </div>
                      <div className="text-center">Loading articles...</div>
                    </div>
            </div>
          </div>
        )}

              {/* Resources Content */}
              {resources && !loadingResources && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  {/* YouTube Resources */}
                  <div 
                    className="bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                  >
                    <div className="p-4 mt-2.5">
                      <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                        Youtube Resources
                      </h5>
                      <h6 className="font-bold mb-3 text-left">Video Tutorials</h6>
                      {resources.YoutubeSearch && resources.YoutubeSearch.length > 0 ? (
                        <div className="space-y-6">
                          {resources.YoutubeSearch.map((item: any, idx: number) => {
                            if (!item || !item.link) {
                              console.warn('Invalid YouTube item:', item);
                              return null;
                            }
                            
                            const videoId = getYouTubeVideoId(item.link);
                            return videoId ? (
                              <div key={idx} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="relative w-full aspect-video bg-black">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={item.title || 'YouTube Video'}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full rounded-t-2xl"
                                  />
                                </div>
                                <div className="p-6">
                                  <h4 className="font-bold text-[#2D3436] text-base mb-1 line-clamp-2 leading-tight text-left">{item.title || 'Untitled Video'}</h4>
                                  <p className="text-xs text-gray-500 mb-4 text-left">{item.channel || ''}</p>
                                </div>
                              </div>
                            ) : (
                              <div key={idx} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="p-6">
                                  <h4 className="font-bold text-[#2D3436] text-base mb-1 line-clamp-2 leading-tight text-left">{item.title || 'Untitled Video'}</h4>
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-red-500 text-base font-semibold hover:underline"
                                  >
                                    Watch Tutorial
                                  </a>
                                </div>
                              </div>
                            )
                          }).filter(Boolean)}
                        </div>
                      ) : (
                        <p className="text-center text-gray-600">No video tutorials available.</p>
                      )}
                    </div>
                  </div>

                  {/* Google Resources */}
                  <div 
                    className="bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                  >
                    <div className="p-4 mt-2.5">
                      <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                        Google Resources
                      </h5>
                      <h6 className="font-bold mb-3 text-left">Recommended Articles</h6>
                    {resources.GoogleSearch && resources.GoogleSearch.length > 0 ? (
                        <div className="space-y-6">
                          {resources.GoogleSearch.map((item: any, idx: number) => (
                            <div key={idx} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                              <div className="p-6">
                                <h4 className="font-bold text-[#2D3436] text-base mb-1 line-clamp-2 leading-tight text-left">{item.title}</h4>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-3 leading-relaxed text-left">{item.description}</p>
                                <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow hover:from-blue-400 hover:to-blue-500 transition-colors"
                        >
                                  Read More
                        </a>
                              </div>
                            </div>
                          ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No articles available.</p>
                    )}
                    </div>
                  </div>
                  
                  {/* Navigation Actions */}
                  <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                    {/* Primary Action */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate('/history')}
                        className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#FF5A5A] hover:to-[#FF7A3A] transform hover:-translate-y-1 text-base sm:text-lg"
                      >
                        ✅ Done - View in History
                      </button>
                    </div>
                    
                    {/* Secondary Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                          setInstructions("")
                          setDetectedFoods([])
                          setResources(null)
                          setShowResults(false)
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none rounded-lg sm:rounded-xl py-3 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1"
                      >
                        🔄 Detect Another
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white border-none rounded-lg sm:rounded-xl py-3 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:from-gray-600 hover:to-gray-700 transform hover:-translate-y-1"
                      >
                        🏠 Go Home
                      </button>
                    </div>
                  </div>
              </div>
            )}
            </div>
          )}
          </div>
      </div>
    </div>
  )
}

export default DetectFoodPage