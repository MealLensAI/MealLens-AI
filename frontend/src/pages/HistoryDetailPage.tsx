"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/utils"
import { api } from "@/lib/api"
import LoadingScreen from "@/components/LoadingScreen"
import { ArrowLeft, Utensils, BookOpen, XCircle, Camera, Search, Youtube, ExternalLink, Play } from "lucide-react"

interface HistoryDetail {
  id: string
  recipe_type: "food_detection" | "ingredient_detection"
  detected_foods?: string // JSON string of string[]
  instructions?: string // HTML string
  resources?: string // JSON string of resources object
  suggestion?: string // for ingredient detection
  ingredients?: string // JSON string of string[]
  created_at: string
  youtube?: string // Updated field name
  google?: string // Updated field name
  analysis_id?: string
  input_data?: string // Image URL for food detection entries
  image_data?: string // Base64 encoded compressed image (fallback)
  image_url?: string // Supabase Storage URL for the uploaded image
}

const HistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [historyDetail, setHistoryDetail] = useState<HistoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      if (!id) {
        setError("No history ID provided")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Get all history and find the specific entry
        const result = await api.getDetectionHistory()
        
        if (result.status === 'success') {
          let historyData = []
          if (result.detection_history) {
            historyData = result.detection_history
          } else if (result.data?.detection_history) {
            historyData = result.data.detection_history
          } else if (Array.isArray(result.data)) {
            historyData = result.data
          } else if (result.data) {
            historyData = [result.data]
          }

          const detail = historyData.find((item: any) => item.id === id)
          
          if (detail) {
            setHistoryDetail(detail)
          } else {
            setError("History entry not found")
          }
        } else {
          setError(result.message || 'Failed to load history detail.')
        }
      } catch (err) {
        console.error("Error fetching history detail:", err)
        setError("Failed to load history detail. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchHistoryDetail()
    }
  }, [id, isAuthenticated, authLoading, api])

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2] && match[2].length === 11) ? match[2] : null
  }

  const getGoogleSearchUrl = (foodName: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(foodName + ' recipe cooking instructions')}`;
  };

  const getYouTubeSearchUrl = (foodName: string) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(foodName + ' recipe tutorial')}`;
  };

  if (authLoading) {
    return <LoadingScreen size="md" />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg mx-auto">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">
              Please log in to view your detection history.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full py-3 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all duration-300"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen size="md" />
  }

  if (error || !historyDetail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg mx-auto">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">History Entry Not Found</h2>
            <p className="text-gray-600">
              {error || "The requested history entry could not be found."}
            </p>
            <Button 
              onClick={() => navigate('/history')}
              className="w-full py-3 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all duration-300"
            >
              Back to History
            </Button>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Detection Details</h1>
            <p className="text-sm sm:text-base text-gray-600">Detailed analysis of your food detection</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingScreen size="lg" message="Loading details..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <XCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm sm:text-base">Failed to load detection details</p>
            </div>
            <Button onClick={() => navigate('/history')} variant="outline" className="text-sm sm:text-base">
              Back to History
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && historyDetail && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-6">
              {/* Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Detected Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-gray-100">
                    {historyDetail.image_url ? (
                      <img
                        src={historyDetail.image_url}
                        alt="Detected food"
                        className="w-full h-full object-cover"
                      />
                    ) : historyDetail.input_data && historyDetail.input_data.startsWith('http') ? (
                      <img
                        src={historyDetail.input_data}
                        alt="Detected food"
                        className="w-full h-full object-cover"
                      />
                    ) : historyDetail.image_data ? (
                      <img
                        src={`data:image/jpeg;base64,${historyDetail.image_data}`}
                        alt="Detected food"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Detection Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Detection Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div>
                      <label className="font-medium text-gray-900">Date & Time</label>
                      <p className="text-gray-600">
                        {new Date(historyDetail.created_at).toLocaleDateString()} at {new Date(historyDetail.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-900">Detection ID</label>
                      <p className="text-gray-600 font-mono text-xs sm:text-sm">{historyDetail.id}</p>
                </div>
              </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Analysis Results */}
            <div className="space-y-6">
              {/* Detected Foods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Detected Foods</CardTitle>
                </CardHeader>
                <CardContent>
                  {historyDetail.detected_foods ? (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const foods = JSON.parse(historyDetail.detected_foods)
                      return foods.map((food: string, index: number) => (
                            <Badge key={index} variant="default" className="text-xs sm:text-sm">
                          {food}
                            </Badge>
                      ))
                    } catch {
                      return <span className="text-gray-600">No foods detected</span>
                    }
                  })()}
                </div>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">No foods were detected in this image</p>
                  )}
                </CardContent>
              </Card>

              {/* Ingredients */}
              {historyDetail.ingredients && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(() => {
                        try {
                          const ingredients = JSON.parse(historyDetail.ingredients)
                          return ingredients.map((ingredient: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-sm sm:text-base text-gray-700">{ingredient.trim()}</span>
              </div>
                          ))
                        } catch {
                          return <span className="text-gray-600">No ingredients detected</span>
                        }
                      })()}
            </div>
                  </CardContent>
                </Card>
          )}

          {/* Resources */}
              {historyDetail.resources && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      try {
                        const resources = JSON.parse(historyDetail.resources)
                        return Object.entries(resources).map(([key, value]: [string, any]) => (
                          <div key={key}>
                            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            {Array.isArray(value) && value.length > 0 ? (
                              <div className="space-y-2">
                                {value.slice(0, 3).map((item: any, index: number) => {
                                  // Display actual resource data (Google search results, YouTube videos, etc.)
                                  if (typeof item === 'string') {
                                    return (
                                      <div key={index} className="text-sm sm:text-base text-gray-600">
                                        {item}
                                      </div>
                                    );
                                  } else if (item && typeof item === 'object') {
                                    // Handle Google search results
                                    if (item.title && item.link) {
                                      return (
                                        <div key={index} className="text-sm sm:text-base">
                                          <a 
                                            href={item.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                          >
                                            {item.title}
                                          </a>
                                          {item.description && (
                                            <p className="text-gray-600 text-xs mt-1">{item.description}</p>
                                          )}
                                        </div>
                                      );
                                    }
                                    // Handle YouTube videos
                                    if (item.title && item.link) {
                                      return (
                                        <div key={index} className="text-sm sm:text-base">
                                          <a 
                                            href={item.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-red-600 hover:text-red-800 underline"
                                          >
                                            {item.title}
                                          </a>
              </div>
                                      );
                                    }
                                    // Fallback for other resource types
                                    return (
                                      <div key={index} className="text-sm sm:text-base text-gray-600">
                                        {item.title || item.name || item.description || JSON.stringify(item)}
            </div>
                                    );
                                  }
                                  return null;
                                })}
                                {value.length > 3 && (
                                  <p className="text-xs text-gray-500">+{value.length - 3} more items</p>
                                )}
                          </div>
                        ) : (
                              <p className="text-sm sm:text-base text-gray-600">No {key.toLowerCase()} available</p>
                            )}
                          </div>
                        ))
                      } catch {
                        return <p className="text-sm sm:text-base text-gray-600">No resources available</p>
                      }
                      })()}
                  </CardContent>
                </Card>
              )}

              {/* External Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Cooking Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Google Search Links */}
                  {historyDetail.detected_foods && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">Recipe Search</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(() => {
                          try {
                            const foods = JSON.parse(historyDetail.detected_foods)
                            return foods.slice(0, 4).map((food: string, index: number) => (
                              <Button
                                key={index}
                                onClick={() => window.open(getGoogleSearchUrl(food), '_blank')}
                                variant="outline"
                                size="sm"
                                className="justify-start text-xs sm:text-sm"
                              >
                                <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                {food} Recipes
                              </Button>
                            ))
                          } catch {
                            return <span className="text-gray-600 text-sm">No foods detected</span>
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* YouTube Video Links */}
                  {historyDetail.detected_foods && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">Video Tutorials</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(() => {
                          try {
                            const foods = JSON.parse(historyDetail.detected_foods)
                            return foods.slice(0, 4).map((food: string, index: number) => (
                              <Button
                                key={index}
                                onClick={() => window.open(getYouTubeSearchUrl(food), '_blank')}
                                variant="outline"
                                size="sm"
                                className="justify-start text-xs sm:text-sm"
                              >
                                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                {food} Tutorials
                              </Button>
                            ))
                          } catch {
                            return <span className="text-gray-600 text-sm">No foods detected</span>
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Direct Links */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Direct Links</h4>
                    {historyDetail.youtube && (
                      <Button
                        onClick={() => window.open(historyDetail.youtube, '_blank')}
                        variant="outline"
                        className="w-full justify-start text-sm sm:text-base"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Watch on YouTube
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                    {historyDetail.google && (
                      <Button
                        onClick={() => window.open(historyDetail.google, '_blank')}
                        variant="outline"
                        className="w-full justify-start text-sm sm:text-base"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search on Google
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

export default HistoryDetailPage 