import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, XCircle, Loader2, Search, Play, ExternalLink, Info, Filter, Bell, Clock, CalendarDays, BookOpen, X, Youtube, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { api, APIError } from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

interface SharedRecipe {
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

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SharedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const setIsLoading = setLoading;
  const isLoading = loading;
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<SharedRecipe | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError(null)
      
      console.log("🔍 [History] Starting fetchHistory...")
      console.log("🔍 [History] authLoading:", authLoading)
      console.log("🔍 [History] isAuthenticated:", isAuthenticated)
      
      // Wait for auth to load
      if (authLoading) {
        console.log("🔍 [History] Auth still loading, returning...")
        return
      }
      
      // Check authentication
      if (!isAuthenticated) {
        console.log("🔍 [History] Not authenticated, setting error...")
        setError("Please log in to view your history.")
        setLoading(false)
        return
      }
      
      try {
        console.log("🔍 [History] Making API call to getDetectionHistory...")
        const result = await api.getDetectionHistory()
        console.log("🔍 [History] API response:", result)
        
        if (result.status === 'success') {
          // Handle different response structures
          let historyData: SharedRecipe[] = []
          if ((result as any).detection_history) {
            historyData = (result as any).detection_history
            console.log("🔍 [History] Found detection_history in result")
          } else if ((result as any).data?.detection_history) {
            historyData = (result as any).data.detection_history
            console.log("🔍 [History] Found detection_history in result.data")
          } else if (Array.isArray((result as any).data)) {
            historyData = (result as any).data
            console.log("🔍 [History] Found array in result.data")
          } else if ((result as any).data) {
            historyData = [(result as any).data]
            console.log("🔍 [History] Found single item in result.data")
          } else {
            historyData = []
            console.log("🔍 [History] No data found, setting empty array")
          }
          
          console.log("🔍 [History] Final historyData:", historyData)
          setHistory(historyData)
        } else {
          console.log("🔍 [History] API returned error status:", result.message)
          setError(result.message || 'Failed to load history.')
        }
      } catch (err) {
        console.error("🔍 [History] Error fetching history:", err)
        if (err instanceof APIError) {
          console.log("🔍 [History] APIError:", err.message, "Status:", err.status)
          setError(err.message)
        } else {
          console.log("🔍 [History] Unknown error:", err)
          setError("Failed to load history. Please try again later.")
        }
      } finally {
        console.log("🔍 [History] Setting loading to false")
        setLoading(false)
      }
    }
    fetchHistory()
  }, [isAuthenticated, authLoading])

  // Filter history based on search term
  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const detectedFoods = item.detected_foods ? JSON.parse(item.detected_foods).join(" ") : ""
    const suggestion = item.suggestion || ""
    
    return detectedFoods.toLowerCase().includes(searchLower) || 
           suggestion.toLowerCase().includes(searchLower)
  })

  // Show loading while auth is initializing
  if (authLoading) {
    return <LoadingScreen size="lg" />
  }

  if (loading) {
    return <LoadingScreen size="lg" />
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="p-8 text-center text-red-600 min-h-[600px] flex flex-col items-center justify-center"
      >
        <p className="text-xl font-semibold">{error}</p>
        <p className="text-gray-500 mt-2">Please ensure you are logged in and try again.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">History</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Showing your all histories with a clear view.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {filteredHistory.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500 text-center p-8 min-h-[400px]">
            <Camera className="h-16 w-16 text-gray-300 mb-4" aria-hidden="true" />
            <p className="text-xl font-semibold">No detection history yet.</p>
            <p className="text-md mt-2">Start scanning to see your results here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHistory.map((item) => (
              <HistoryCard 
                key={item.id} 
                item={item} 
                onCardClick={(item) => {
                  setSelectedItem(item)
                  setShowDetailModal(true)
                }}
                onViewDetails={(item) => {
                  navigate(`/history/${item.id}`)
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Detail Modal */}
      <DetailModal 
        item={selectedItem}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedItem(null)
        }}
      />
    </div>
  )
}


// Helper functions moved outside components
const getStatusColor = (recipeType: string) => {
  switch (recipeType) {
    case "food_detection":
      return "bg-green-100 text-green-700 border-green-200"
    case "ingredient_detection":
      return "bg-blue-100 text-blue-700 border-blue-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

const getStatusText = (recipeType: string) => {
  switch (recipeType) {
    case "food_detection":
      return "Food Detection"
    case "ingredient_detection":
      return "Ingredient Detection"
    default:
      return "Detection"
  }
}

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1)
      }
      const searchParams = urlObj.searchParams
      return searchParams.get('v')
    }
    return null
  } catch {
    return null
  }
}

interface HistoryCardProps {
  item: SharedRecipe
  onCardClick: (item: SharedRecipe) => void
  onViewDetails: (item: SharedRecipe) => void
}

function HistoryCard({ item, onCardClick, onViewDetails }: HistoryCardProps) {
  const handleCardClick = () => {
    onCardClick(item)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    onViewDetails(item)
  }

  const getDetectedFoods = () => {
    try {
      if (item.detected_foods) {
        return JSON.parse(item.detected_foods)
      }
      if (item.ingredients) {
        return JSON.parse(item.ingredients)
      }
      return []
    } catch {
      return []
    }
  }

  const getResources = () => {
    try {
      if (item.resources && item.resources !== '{}') {
        const resources = JSON.parse(item.resources)
        
        // Handle both flattened and double-nested array formats
        if (resources.GoogleSearch && Array.isArray(resources.GoogleSearch)) {
          resources.GoogleSearch = resources.GoogleSearch.flat()
        }
        if (resources.YoutubeSearch && Array.isArray(resources.YoutubeSearch)) {
          resources.YoutubeSearch = resources.YoutubeSearch.flat()
        }
        
        return resources
      }
      return null
    } catch {
      return null
    }
  }

  const detectedFoods = getDetectedFoods()
  const resources = getResources()
  const mainFood = detectedFoods[0] || "Unknown"
  const additionalCount = detectedFoods.length > 1 ? detectedFoods.length - 1 : 0
  
  // Check if resources are available
  const hasYouTube = (Array.isArray(resources?.YoutubeSearch) && resources.YoutubeSearch.length > 0) || item.youtube
  const hasGoogle = (Array.isArray(resources?.GoogleSearch) && resources.GoogleSearch.length > 0) || item.google
  const hasResources = hasYouTube || hasGoogle

  // Check if this is a food detection with an image
  const hasImage = item.recipe_type === "food_detection" && (
    item.image_url || 
    (item.input_data && item.input_data.startsWith('http')) || 
    (item.image_data && item.image_data.startsWith('data:image'))
  )

  // Get image source - prioritize Supabase Storage URL, then fallback to base64/input_data
  const getImageSrc = () => {
    // First priority: Supabase Storage URL
    if (item.image_url) {
      return item.image_url
    }
    // Second priority: Base64 encoded image
    if (item.image_data && item.image_data.startsWith('data:image')) {
      return item.image_data
    }
    // Third priority: Input data URL (legacy)
    if (item.input_data && item.input_data.startsWith('http')) {
      return item.input_data
    }
    return null
  }

  const imageSrc = getImageSrc()

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        {/* Image cover for food detection entries */}
        {hasImage && imageSrc ? (
          <img 
            src={imageSrc} 
            alt={mainFood}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {item.recipe_type === "food_detection" ? "🍽️" : "📖"}
              </div>
              <p className="text-sm text-gray-600">Detection</p>
            </div>
          </div>
        )}
        
        {/* Fallback placeholder (hidden by default, shown on image error) */}
        <div className="hidden w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center absolute inset-0">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {item.recipe_type === "food_detection" ? "🍽️" : "📖"}
            </div>
            <p className="text-sm text-gray-600">Detection</p>
          </div>
        </div>
        
        {/* Type indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
          <span className="text-lg">
            {item.recipe_type === "food_detection" ? "🍽️" : "📖"}
          </span>
        </div>
        
        {/* Play overlay */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
            <Play className="h-4 w-4" />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
          
      <div className="p-4">
        <h3 className="font-semibold text-[#2D3436] mb-2 text-sm leading-tight line-clamp-2">
          {mainFood}
        </h3>
        
        {additionalCount > 0 && (
          <p className="text-xs text-gray-500 mb-2">
            +{additionalCount} more items
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[#1e293b] text-xs">
            <Clock className="w-3 h-3 mr-1" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1">
            {hasYouTube && (
              <span className="text-red-500 text-xs">🎥</span>
            )}
            {hasGoogle && (
              <span className="text-blue-500 text-xs">📖</span>
            )}
          </div>
        </div>

        {/* Resource count */}
        {hasResources && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {hasYouTube && (
                <span className="text-xs text-red-600 font-medium">
                  {Array.isArray(resources?.YoutubeSearch) ? resources.YoutubeSearch.length : 1} video{Array.isArray(resources?.YoutubeSearch) && resources.YoutubeSearch.length !== 1 ? 's' : ''}
                </span>
              )}
              {hasGoogle && hasYouTube && <span className="text-xs text-gray-400">•</span>}
              {hasGoogle && (
                <span className="text-xs text-blue-600 font-medium">
                  {Array.isArray(resources?.GoogleSearch) ? resources.GoogleSearch.length : 1} article{Array.isArray(resources?.GoogleSearch) && resources.GoogleSearch.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            View Details
          </Button>
        </div>
      </div>
        </div>
  )
}

// Detail Modal Component
interface DetailModalProps {
  item: SharedRecipe | null
  isOpen: boolean
  onClose: () => void
}

function DetailModal({ item, isOpen, onClose }: DetailModalProps) {
  if (!item) return null

  const getDetectedFoods = () => {
    try {
      if (item.detected_foods) {
        return JSON.parse(item.detected_foods)
      }
      if (item.ingredients) {
        return JSON.parse(item.ingredients)
      }
      return []
    } catch {
      return []
    }
  }

  const getResources = () => {
    try {
      if (item.resources && item.resources !== '{}') {
        const resources = JSON.parse(item.resources)
        
        // Handle both flattened and double-nested array formats
        if (resources.GoogleSearch && Array.isArray(resources.GoogleSearch)) {
          resources.GoogleSearch = resources.GoogleSearch.flat()
        }
        if (resources.YoutubeSearch && Array.isArray(resources.YoutubeSearch)) {
          resources.YoutubeSearch = resources.YoutubeSearch.flat()
        }
        
        return resources
      }
      return null
    } catch {
      return null
    }
  }

  const detectedFoods = getDetectedFoods()
  const resources = getResources()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {detectedFoods[0] || "Recipe Details"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image for food detection entries */}
          {item.recipe_type === "food_detection" && item.input_data && item.input_data.startsWith('http') && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <img 
                src={item.input_data} 
                alt={detectedFoods[0] || "Detected Food"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10" />
            </div>
          )}
          
          {/* Recipe Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className={getStatusColor(item.recipe_type)}>
            {getStatusText(item.recipe_type)}
          </Badge>
              <span className="text-sm text-gray-600">
                {new Date(item.created_at).toLocaleDateString()} at{' '}
                {new Date(item.created_at).toLocaleTimeString()}
              </span>
            </div>
            
            {detectedFoods.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Detected Foods:</h4>
                <div className="flex flex-wrap gap-2">
                  {detectedFoods.map((food: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {item.instructions && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Cooking Instructions</h4>
              <div 
                className="prose prose-sm max-w-none bg-white rounded-lg p-4 border"
                dangerouslySetInnerHTML={{ __html: item.instructions }}
              />
            </div>
          )}

          {/* Resources */}
          {resources && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Cooking Resources</h4>
              
              {/* YouTube Videos */}
              {resources.YoutubeSearch && Array.isArray(resources.YoutubeSearch) && resources.YoutubeSearch.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    Video Tutorials
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.YoutubeSearch.slice(0, 4).map((video: any, index: number) => {
                      const videoId = getYouTubeVideoId(video.link);
                      return (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                          {videoId ? (
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
                          ) : (
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                              <div className="text-center">
                                <Youtube className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Video Preview</p>
                              </div>
                            </div>
                          )}
                          <div className="p-4">
                            <h6 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900">{video.title}</h6>
                        <a
                          href={video.link}
                          target="_blank"
                          rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <ExternalLink className="h-3 w-3" />
                              Watch on YouTube
                        </a>
                      </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Google Articles */}
              {resources.GoogleSearch && Array.isArray(resources.GoogleSearch) && resources.GoogleSearch.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Articles & Recipes
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.GoogleSearch.slice(0, 4).map((article: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                          <div className="text-center">
                            <Globe className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Article Preview</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <h6 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900">{article.title}</h6>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed text-left">{article.description}</p>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Read Article
                        </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

