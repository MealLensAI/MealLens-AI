"use client"

import type { FC } from "react"
import { useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Users, ChefHat, Bookmark, Timer, Utensils, Loader2, Upload, ArrowLeft } from "lucide-react"
import "@/styles/ai-response.css"
import { useAuth } from "@/lib/utils"
import { useSubscription } from "@/contexts/SubscriptionContext"
import LoadingScreen from "@/components/LoadingScreen"
import FeatureLock from "@/components/FeatureLock"
import { handleAuthError } from "@/lib/utils"
import { api } from "@/lib/api"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token, isAuthenticated, loading } = useAuth()
  const { isFeatureLocked, recordFeatureUsage } = useSubscription()
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");

  if (loading) {
    return <LoadingScreen 
      message="Generating AI insights..." 
      subMessage="Creating personalized recommendations and resources"
      showLogo={true}
      size="lg"
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

  const handleDiscoverRecipes = async () => {
    setIsLoading(true)
    setDetectedIngredients([])
    setSuggestions([])
    setInstructions("")
    setResources(null)
    setShowResults(false)

    try {
      // Record feature usage
      await recordFeatureUsage('ingredient_detection');
    } catch (error) {
      console.error('Error recording feature usage:', error);
    }
    
    // Compress image if provided
    let compressedImageData: string | null = null
    if (inputType === "image" && selectedImage) {
      try {
        compressedImageData = await compressImage(selectedImage)
        console.log("[AIResponse] Image compressed successfully")
      } catch (error) {
        console.error("[AIResponse] Image compression failed:", error)
        compressedImageData = imagePreview
      }
    }
    
    const formData = new FormData()
    if (inputType === "image" && selectedImage) {
      formData.append("image_or_ingredient_list", "image")
      formData.append("image", selectedImage)
    } else if (inputType === "ingredient_list" && ingredientList.trim()) {
      formData.append("image_or_ingredient_list", "ingredient_list")
      formData.append("ingredient_list", ingredientList)
    } else {
      alert("Please provide an image or ingredient list")
      setIsLoading(false)
      return
    }

    try {
    const response = await fetch("https://ai-utu2.onrender.com/process", {
      method: "POST",
      body: formData,
    })

      if (!response.ok) {
        throw new Error("Failed to process ingredients")
      }

    const data = await response.json()
      console.log("Process response:", data)

      if (data.error) {
        alert(data.error)
        return
      }

    setAnalysisId(data.analysis_id)
    setDetectedIngredients(data.response || [])
    setSuggestions(data.food_suggestions || [])
      setShowResults(true)
    } catch (error) {
      console.error("Error processing ingredients:", error)
      alert("Failed to process ingredients. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
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
    
    try {
      // 1. Get cooking instructions first
    const formData = new FormData()
    formData.append("food_analysis_id", analysisId)
    formData.append("food_choice_index", suggestion)
      
      console.log('Fetching instructions with analysisId:', analysisId, 'and suggestion:', suggestion)
      
    const instrRes = await fetch("https://ai-utu2.onrender.com/instructions", {
      method: "POST",
      body: formData,
    })
      
      if (!instrRes.ok) {
        throw new Error(`HTTP error! status: ${instrRes.status}`)
      }
      
    const instrData = await instrRes.json()
      
      console.log('Instructions API response:', instrData)
      
      if (instrData.error) {
        throw new Error(instrData.error);
      }
      
      // Convert markdown to HTML (same as tutorial page)
      let htmlInstructions = instrData.instructions || '';
      htmlInstructions = htmlInstructions
        .replace(/\*\*(.*?)\*\*/g, '<br><strong>$1</strong><br>')
        .replace(/\*\s*(.*?)\s*\*/g, '<p>$1</p>')
        .replace(/(\d+\.)/g, '<br>$1');
      
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
    <div 
      className="min-h-screen py-4 sm:py-6 lg:py-8"
      style={{
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: "url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=2000&q=80') center/cover no-repeat fixed",
        color: "#2D3436",
        lineHeight: "1.6"
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="bg-[rgba(255,255,255,0.95)] rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden p-4 sm:p-6 lg:p-8 xl:p-12 relative max-w-[800px] mx-auto"
        >
          {/* Title */}
          <h1 
            className="text-xl sm:text-2xl lg:text-3xl xl:text-[2.5rem] font-extrabold text-center mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent tracking-[-1px]"
          >
            Ingredient Detection
          </h1>

          {/* Input Form */}
          <div className="mb-4 sm:mb-6">
            <label className="block font-semibold text-base sm:text-lg text-[#2D3436] mb-2 sm:mb-3">
                  How would you like to start?
                </label>
                <select
              className="w-full bg-white border-2 border-[rgba(0,0,0,0.1)] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.05)] focus:border-[#FF6B6B] focus:shadow-[0_0_0_4px_rgba(255,107,107,0.2)]"
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value as "image" | "ingredient_list")}
                >
                  <option value="image">Snap or Upload Ingredient Image</option>
                  <option value="ingredient_list">List Your Ingredients</option>
                </select>
              </div>

          {/* Image Input */}
          {inputType === "image" && (
            <div className="mb-4 sm:mb-6">
              <label className="block font-semibold text-base sm:text-lg text-[#2D3436] mb-2 sm:mb-3">
                Share Your Food Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                onChange={handleImageSelect}
                className="w-full bg-white border-2 border-[rgba(0,0,0,0.1)] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.05)] focus:border-[#FF6B6B] focus:shadow-[0_0_0_4px_rgba(255,107,107,0.2)]"
                  />
                  {imagePreview && (
                <div className="flex justify-center mt-3 sm:mt-4">
                      <img
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-w-xs sm:max-w-sm lg:max-w-md h-48 sm:h-56 lg:h-64 object-cover rounded-lg sm:rounded-xl"
                      />
                    </div>
                  )}
                </div>
          )}

          {/* Ingredient Input */}
          {inputType === "ingredient_list" && (
            <div className="mb-4 sm:mb-6">
              <label className="block font-semibold text-base sm:text-lg text-[#2D3436] mb-2 sm:mb-3">
                    What ingredients do you have?
                  </label>
              <input
                type="text"
                value={ingredientList}
                onChange={(e) => setIngredientList(e.target.value)}
                    placeholder="e.g., chicken, tomatoes, basil, olive oil"
                className="w-full bg-white border-2 border-[rgba(0,0,0,0.1)] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.05)] focus:border-[#FF6B6B] focus:shadow-[0_0_0_4px_rgba(255,107,107,0.2)]"
                  />
                </div>
              )}

          {/* Discover Button */}
          <button
                onClick={handleDiscoverRecipes}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 px-6 sm:px-8 text-lg sm:text-xl font-semibold transition-all duration-300 uppercase tracking-wider shadow-[0_4px_15px_rgba(255,107,107,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,107,107,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discover Recipes
          </button>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[rgba(255,107,107,0.3)] border-t-[#FF6B6B] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* AI Detected Ingredients */}
                <div 
                  className="bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:translate-y-[-5px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)]"
                >
                  <div className="p-4 mt-2.5">
                    <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                      AI Detected Ingredient
                    </h5>
                    <ol className="pl-4 text-left">
                    {detectedIngredients.map((item, i) => (
                        <li key={i} className="mb-3 text-left">{item.trim()}</li>
                    ))}
                  </ol>
                  </div>
                </div>

                {/* AI Recipe Suggestions */}
                <div 
                  className="bg-gradient-to-br from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.8)] rounded-[1.5rem] border-none overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:translate-y-[-5px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)]"
                >
                  <div className="p-4 mt-2.5">
                    <h5 className="text-[#2D3436] font-bold text-xl mb-6 border-b-2 border-[rgba(255,107,107,0.2)] pb-3 text-left">
                      AI Recipe Suggestions
                    </h5>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, i) => (
                        <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                          className="bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] rounded-2xl px-3 py-3 m-2 transition-all duration-300 font-semibold text-base hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E53] hover:text-white hover:border-transparent hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(255,107,107,0.2)]"
                      >
                        {suggestion}
                        </button>
                    ))}
                    </div>
                  </div>
                </div>
            </div>

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                            const videoId = getYouTubeVideoId(item.link);
                        return videoId ? (
                              <div key={idx} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="relative w-full aspect-video bg-black">
                            <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                              title={item.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                                    className="w-full h-full rounded-t-2xl"
                            />
                                </div>
                                <div className="p-6">
                                  <h4 className="font-bold text-[#2D3436] text-base mb-1 line-clamp-2 leading-tight text-left">{item.title}</h4>
                                  <p className="text-xs text-gray-500 mb-4 text-left">{item.channel || ''}</p>
                                </div>
                          </div>
                        ) : (
                              <div key={idx} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="p-6">
                                  <h4 className="font-bold text-[#2D3436] text-base mb-1 line-clamp-2 leading-tight text-left">{item.title}</h4>
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
                          })}
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
              </div>
            )}

              {/* Done Button - Only show when we have complete results */}
              {instructions && resources && !loadingResources && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                    <button
                    onClick={() => window.location.href = '/history'}
                    className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#FF5A5A] hover:to-[#FF7A3A] transform hover:-translate-y-1 text-base sm:text-lg"
                  >
                    ✅ Done - View in History
                    </button>
                </div>
              )}
            </div>
          )}
          </div>
      </div>

      <style>{`
        @keyframes loading-slide {
          0% {
            left: -30%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default AIResponsePage