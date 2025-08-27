"use client"

import type { FC } from "react"
import { useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Users, ChefHat, Bookmark, Timer, Utensils, Loader2, Upload, ArrowLeft, Camera, Image as ImageIcon, X, Search, Lightbulb, ExternalLink, Play } from "lucide-react"
import "@/styles/ai-response.css"
import { useAuth } from "@/lib/utils"
import { useSubscription } from "@/contexts/SubscriptionContext"
import LoadingScreen from "@/components/LoadingScreen"
import FeatureLock from "@/components/FeatureLock"
import { handleAuthError } from "@/lib/utils"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { formatInstructionsForDisplay } from '@/utils/instructionFormatter';

interface Recipe {
  name: string
  description: string
  cookTime: string
  prepTime: string
  servings: number
  difficulty: string
  calories: number
  ingredients: Array<{
    name: string
    amount: string
    unit: string
  }>
  instructions: string[]
  tips?: string[]
  nutrition?: {
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
}

const AIResponsePage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [inputType, setInputType] = useState<"image" | "ingredient_list">("image")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ingredientList, setIngredientList] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [instructions, setInstructions] = useState<string>("")
  const [resources, setResources] = useState<any>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [analysisId, setAnalysisId] = useState<string>("")
  const [loadingResources, setLoadingResources] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token, isAuthenticated, loading } = useAuth()
  
  // Safely use subscription context with fallback
  let subscriptionContext;
  try {
    subscriptionContext = useSubscription();
  } catch (error) {
    console.warn('Subscription context not available, using fallback functions');
    subscriptionContext = null;
  }
  
  const isFeatureLocked = subscriptionContext?.isFeatureLocked || ((featureName: string) => false);
  const recordFeatureUsage = subscriptionContext?.recordFeatureUsage || (async (featureName: string) => {});
  
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");
  const { toast } = useToast()

  if (loading) {
    return <LoadingScreen size="md" />
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
              Please log in to use the AI Kitchen feature and save your recipe discoveries to history.
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
  if (isFeatureLocked('ingredient_detection')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <FeatureLock
            featureName="ingredient_detection"
            featureTitle="AI Kitchen Assistant"
            featureDescription="Get personalized recipe suggestions, cooking instructions, and meal planning based on your available ingredients or food photos."
            icon={<ChefHat className="h-8 w-8 text-purple-600" />}
          />
        </div>
      </div>
    )
  }

  // Function to compress image before sending
  const compressImage = (file: File): Promise<string> => {
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
    if (inputType === "image" && !selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first.",
        variant: "destructive",
      })
      return
    }
    
    if (inputType === "ingredient_list" && !ingredientList.trim()) {
      toast({
        title: "Error",
        description: "Please enter your ingredients.",
        variant: "destructive",
      })
      return
    }

    // Prevent duplicate submissions
    if (isLoading) {
      toast({
        title: "Processing",
        description: "Please wait for the current processing to complete.",
        variant: "default",
      })
      return
    }
    
    setIsLoading(true)
    setInstructions("")
    setDetectedIngredients([])
    setSuggestions([])
    setResources(null)
    setShowResults(false)

    try {
      // Record feature usage
      await recordFeatureUsage('ingredient_detection');
    } catch (error) {
      console.error('Error recording feature usage:', error);
    }
    
    const formData = new FormData()
    if (inputType === "image" && selectedImage) {
      formData.append("image_or_ingredient_list", "image")
      formData.append("image", selectedImage)
    } else if (inputType === "ingredient_list" && ingredientList.trim()) {
      formData.append("image_or_ingredient_list", "ingredient_list")
      formData.append("ingredient_list", ingredientList)
    }

    try {
      // Step 1: Process ingredients
      console.log("[AIResponse] Starting ingredient processing...")
    const response = await fetch("https://ai-utu2.onrender.com/process", {
      method: "POST",
      body: formData,
    })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

    const data = await response.json()
      console.log("[AIResponse] Process response:", data)

      if (data.error) {
        toast({
          title: "Error",
          description: data.error || "Failed to process ingredients.",
          variant: "destructive",
        })
        return
      }

    setAnalysisId(data.analysis_id)
    setDetectedIngredients(data.response || [])
    setSuggestions(data.food_suggestions || [])
      setShowResults(true)
    } catch (error) {
      console.error("Error processing ingredients:", error)
      toast({
        title: "Error",
        description: "Failed to process ingredients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    // Prevent duplicate clicks
    if (isLoading) {
      toast({
        title: "Processing",
        description: "Please wait for the current recipe to load.",
        variant: "default",
      })
      return
    }

    setIsLoading(true)
    setSelectedSuggestion(suggestion)
    setInstructions("")
    setResources(null)

    // Compress image if available
    let compressedImageData: string | null = null
    if (inputType === "image" && selectedImage) {
      try {
        compressedImageData = await compressImage(selectedImage)
        console.log("[AIResponse] Image compressed successfully for suggestion")
      } catch (error) {
        console.error("[AIResponse] Image compression failed for suggestion:", error)
        compressedImageData = imagePreview
      }
    }
    
    console.log('Starting to fetch instructions for:', suggestion)
    console.log('Current analysisId:', analysisId)
    
    // Validate that we have the required data
    if (!analysisId) {
      console.error('No analysisId available for instructions request')
      setInstructions('Error: Missing analysis data. Please try processing your ingredients again.');
      setIsLoading(false);
      return;
    }
    
    try {
      // 1. Get cooking instructions first
    const formData = new FormData()
    formData.append("food_analysis_id", analysisId)
    formData.append("food_choice_index", suggestion)
      
      console.log('Fetching instructions with analysisId:', analysisId, 'and suggestion:', suggestion)
      console.log('FormData contents:', {
        food_analysis_id: analysisId,
        food_choice_index: suggestion
      })
      
    const instrRes = await fetch("https://ai-utu2.onrender.com/instructions", {
      method: "POST",
      body: formData,
    })
      
      if (!instrRes.ok) {
        const errorText = await instrRes.text()
        console.error('Instructions API error response:', errorText)
        throw new Error(`HTTP error! status: ${instrRes.status} - ${errorText}`)
      }
      
    const instrData = await instrRes.json()
      
      console.log('Instructions API response:', instrData)
      
      if (instrData.error) {
        throw new Error(instrData.error);
      }
      
      // Format instructions for better readability
      let htmlInstructions = instrData.instructions || '';
      
      // Convert markdown-style formatting to HTML
      htmlInstructions = htmlInstructions
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
        .replace(/\n\n/g, '</p><p>') // Double line breaks to paragraphs
        .replace(/\n/g, '<br>') // Single line breaks
      
      // Format numbered steps
      htmlInstructions = htmlInstructions.replace(/(\d+\.\s*)/g, '<br><strong>$1</strong>')
      
      // Wrap in paragraph tags if not already wrapped
      if (!htmlInstructions.startsWith('<p>')) {
        htmlInstructions = '<p>' + htmlInstructions + '</p>'
      }
      
      console.log('Converted HTML instructions:', htmlInstructions)
      setInstructions(htmlInstructions);

      // Instructions are loaded, now start loading resources
      setIsLoading(false);
      setLoadingResources(true);

      // 2. Get resources (YouTube and Google)
    const resForm = new FormData()
    resForm.append("food_choice_index", suggestion)
      
    const resRes = await fetch("https://ai-utu2.onrender.com/resources", {
      method: "POST",
      body: resForm,
    })
      
      if (!resRes.ok) {
        throw new Error(`HTTP error! status: ${resRes.status}`)
      }
      
    const resData = await resRes.json()
      
      // Flatten the double-nested arrays to single arrays
      if (resData) {
        if (resData.GoogleSearch && Array.isArray(resData.GoogleSearch)) {
          resData.GoogleSearch = resData.GoogleSearch.flat();
        }
        if (resData.YoutubeSearch && Array.isArray(resData.YoutubeSearch)) {
          resData.YoutubeSearch = resData.YoutubeSearch.flat();
        }
      }
      
    setResources(resData)
      
    // Now POST to backend
    if (
      token &&
      detectedIngredients.length &&
      instrData.instructions &&
      resData
    ) {
      const payload = {
        recipe_type: "ingredient_detection",
        suggestion: suggestion || "",
        instructions: instrData.instructions || "",
        ingredients: JSON.stringify(detectedIngredients || []), // Use actual detected ingredients
        detected_foods: JSON.stringify(detectedIngredients || []),
        analysis_id: analysisId || "",
        youtube: resData?.YoutubeSearch?.[0]?.link || "",
        google: resData?.GoogleSearch?.[0]?.link || "",
          resources: JSON.stringify(resData || {}),
          image_data: compressedImageData
        };
        
        try {
          await api.saveDetectionHistory(payload);
        } catch (error) {
          console.error('Error saving detection history:', error);
          // Don't show error to user since the main functionality still works
        }
    }
    } catch (error) {
      console.error('Error fetching content:', error);
      setInstructions('Failed to load instructions. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingResources(false);
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                AI Kitchen Assistant
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Get personalized recipe suggestions based on your available ingredients
              </p>
            </div>

            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Input Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Input Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like to start?
            </label>
            <select
              value={inputType}
                  onChange={(e) => setInputType(e.target.value as "image" | "ingredient_list")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
                    <option value="image">Upload Ingredient Image</option>
                  <option value="ingredient_list">List Your Ingredients</option>
            </select>
          </div>

          {/* Image Input */}
          {inputType === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
              </label>
                  <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <div 
                        onClick={() => setShowUploadModal(true)}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                  <img
                    src={imagePreview} 
                    alt="Preview" 
                            className="max-w-full h-auto max-h-48 mx-auto rounded-lg shadow-lg"
                          />
                            <p className="text-sm text-gray-500">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div>
                              <p className="text-base font-medium text-gray-900">
                                Upload Ingredient Image
                            </p>
                              <p className="text-sm text-gray-500">
                              Click to browse or drag and drop
                            </p>
                          </div>
                </div>
              )}
                    </div>
                  </div>
            </div>
          )}

                {/* Text Input */}
          {inputType === "ingredient_list" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      List Your Ingredients
              </label>
              <Textarea
                value={ingredientList}
                onChange={(e) => setIngredientList(e.target.value)}
                placeholder="e.g., chicken breast, rice, tomatoes, onions, garlic, olive oil..."
                      className="min-h-[120px] resize-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (inputType === "image" && !selectedImage) || (inputType === "ingredient_list" && !ingredientList.trim())}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base sm:text-lg font-semibold loading-button"
          >
            {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Discover Recipes
                    </>
            )}
          </Button>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <p className="text-gray-700">Upload a photo of your ingredients or list them manually</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <p className="text-gray-700">Our AI analyzes your ingredients and suggests delicious recipes</p>
            </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                    <p className="text-gray-700">Get step-by-step cooking instructions and video tutorials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
                </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
          {showResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Recipe Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
              {/* Detected Ingredients */}
              {detectedIngredients.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Detected Ingredients:</h3>
                    <div className="flex flex-wrap gap-2">
                      {detectedIngredients.map((ingredient, index) => (
                            <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                          {ingredient}
                            </Badge>
                      ))}
                    </div>
                      </div>
              )}

              {/* Recipe Suggestions */}
              {suggestions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Available Recipes:</h3>
                        <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                            <div 
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                              className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                          {suggestion}
                                  </h4>
                                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                    Click to view detailed recipe and instructions
                                  </p>
                                </div>
                                <ChefHat className="h-5 w-5 text-orange-500" />
                              </div>
                            </div>
                      ))}
                    </div>
                  </div>
                    )}
                </div>
                  </CardContent>
                </Card>
              )}

            {/* Detailed Recipe View */}
              {instructions && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl">Recipe Details</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInstructions("")
                        setResources(null)
                        setSelectedSuggestion("")
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-6">
                    {/* Recipe Title */}
                    {selectedSuggestion && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedSuggestion}</h3>
                </div>
              )}

                    {/* Instructions */}
                    {instructions && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Step-by-Step Instructions:
                        </h4>
                        <div 
                          className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3 instructions-content"
                          dangerouslySetInnerHTML={{ __html: formatInstructionsForDisplay(instructions) }}
                        />
                      </div>
                    )}

              {/* Resources */}
                    {loadingResources && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
                          <span className="text-gray-600">Loading resources...</span>
                  </div>
                </div>
              )}

              {resources && !loadingResources && (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Ingredient Image</h3>
                <p className="text-gray-600">Choose how you'd like to upload your ingredient photo</p>
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
                    fileInputRef.current?.click();
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

        {/* Hidden camera input */}
        <input
          id="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />
        </div>
      </div>
    </div>
  )
}

export default AIResponsePage