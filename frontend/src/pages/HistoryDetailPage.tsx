"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, ExternalLink, Lightbulb, Search, Youtube, Globe, Clock, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { api } from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

interface HistoryItem {
  id: string;
  recipe_type: "food_detection" | "ingredient_detection";
  detected_foods?: string; // JSON string of string[]
  instructions?: string; // HTML string
  resources?: string; // JSON string of resources object
  suggestion?: string; // for ingredient detection
  ingredients?: string; // JSON string of string[]
  created_at: string;
  youtube?: string;
  google?: string;
  analysis_id?: string;
  input_data?: string;
  image_data?: string;
  image_url?: string;
}

const HistoryDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [historyItem, setHistoryItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistoryItem = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "No history item ID provided.",
          variant: "destructive",
        });
        navigate('/history');
        return;
      }

      if (authLoading) return;

      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view history details.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const result = await api.getDetectionHistory();
        
        if (result.status === 'success') {
          let historyData: HistoryItem[] = [];
          if ((result as any).detection_history) {
            historyData = (result as any).detection_history;
          } else if ((result as any).data?.detection_history) {
            historyData = (result as any).data.detection_history;
          } else if (Array.isArray((result as any).data)) {
            historyData = (result as any).data;
          }

          const item = historyData.find(h => h.id === id);
          if (item) {
            setHistoryItem(item);
            
            // Parse resources if available
            if (item.resources) {
              try {
                const parsedResources = JSON.parse(item.resources);
                setResources(parsedResources);
              } catch (error) {
                console.error('Error parsing resources:', error);
              }
            }
          } else {
            toast({
              title: "Not Found",
              description: "History item not found.",
              variant: "destructive",
            });
            navigate('/history');
          }
        } else {
          toast({
            title: "Error",
            description: result.message || 'Failed to load history item.',
            variant: "destructive",
          });
          navigate('/history');
        }
      } catch (error) {
        console.error('Error fetching history item:', error);
        toast({
          title: "Error",
          description: "Failed to load history item.",
          variant: "destructive",
        });
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryItem();
  }, [id, isAuthenticated, authLoading, navigate, toast]);

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseDetectedFoods = (): string[] => {
    if (!historyItem?.detected_foods) return [];
    try {
      return JSON.parse(historyItem.detected_foods);
    } catch {
      return [];
    }
  };

  const parseIngredients = (): string[] => {
    if (!historyItem?.ingredients) return [];
    try {
      return JSON.parse(historyItem.ingredients);
    } catch {
      return [];
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen size="md" />;
  }

  if (!historyItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">History item not found.</p>
            <Button onClick={() => navigate('/history')} className="mt-4">
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/history')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {historyItem.recipe_type === 'food_detection' ? 'Food Detection' : 'Recipe Generation'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(historyItem.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {historyItem.recipe_type === 'food_detection' ? 'Food Analysis' : 'Recipe Creation'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-6">
            {/* Detected Foods/Ingredients */}
            {historyItem.recipe_type === 'food_detection' && parseDetectedFoods().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-orange-500" />
                    Detected Foods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {parseDetectedFoods().map((food, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {historyItem.recipe_type === 'ingredient_detection' && parseIngredients().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-orange-500" />
                    Ingredients Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {parseIngredients().map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recipe Suggestion */}
            {historyItem.suggestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Recipe Suggestion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 font-medium">{historyItem.suggestion}</p>
                </CardContent>
              </Card>
            )}

            {/* Image Preview */}
            {(historyItem.image_url || historyItem.image_data) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Original Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={historyItem.image_url || `data:image/jpeg;base64,${historyItem.image_data}`}
                      alt="Detection input"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Instructions & Resources */}
          <div className="space-y-6">
            {/* Instructions */}
            {historyItem.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Step-by-Step Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 instruction-card">
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3 instructions-content"
                      dangerouslySetInnerHTML={{ __html: historyItem.instructions }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {resources && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cooking Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* YouTube Videos */}
                    {resources.YoutubeSearch && Array.isArray(resources.YoutubeSearch) && resources.YoutubeSearch.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Play className="h-4 w-4 text-red-500" />
                          YouTube Tutorials
                        </h4>
                        <div className="space-y-3">
                          {resources.YoutubeSearch.slice(0, 3).map((video: any, index: number) => {
                            const videoId = getYouTubeVideoId(video.link);
                            return videoId ? (
                              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm youtube-container">
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
                                className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors google-result"
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
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Google Search Results */}
                    {resources.GoogleSearch && Array.isArray(resources.GoogleSearch) && resources.GoogleSearch.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          Articles & Recipes
                        </h4>
                        <div className="space-y-3">
                          {resources.GoogleSearch.slice(0, 3).map((article: any, index: number) => (
                            <a
                              key={index}
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors google-result"
                            >
                              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
                                <Globe className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {article.title}
                                </p>
                                <p className="text-gray-600 text-xs line-clamp-2">
                                  {article.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage; 