import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Search,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface InAppViewerProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  type?: 'web' | 'youtube';
  title?: string;
}

const InAppViewer: React.FC<InAppViewerProps> = ({
  isOpen,
  onClose,
  url = '',
  type = 'web',
  title = 'Content Viewer'
}) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeVideoId = getYouTubeVideoId(currentUrl);
  const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0` : '';

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      setCurrentUrl(searchUrl);
      setIsLoading(true);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setCurrentUrl(newUrl);
    setIsLoading(true);
  };

  const handleReload = () => {
    setIsLoading(true);
    // Force reload by updating the URL slightly
    const timestamp = Date.now();
    const separator = currentUrl.includes('?') ? '&' : '?';
    setCurrentUrl(`${currentUrl}${separator}_t=${timestamp}`);
  };

  const handleBack = () => {
    // In a real implementation, you'd maintain a history stack
    // For now, we'll just reload the current page
    handleReload();
  };

  const handleForward = () => {
    // In a real implementation, you'd maintain a history stack
    // For now, we'll just reload the current page
    handleReload();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'w-screen h-screen max-w-none' : 'max-w-6xl'} p-0`}>
        <DialogHeader className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForward}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReload}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {type === 'web' && (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Input
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlChange(currentUrl)}
                    placeholder="Enter URL or search..."
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUrlChange(currentUrl)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Go
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {type === 'youtube' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                      className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Search bar for web content */}
          {type === 'web' && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search Google..."
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Search
                </Button>
              </div>
              <Badge variant="outline" className="text-xs">
                {type === 'youtube' ? 'YouTube' : 'Web View'}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 bg-gray-100">
          {type === 'youtube' && youtubeVideoId ? (
            <div className="relative w-full h-full min-h-[500px]">
              <iframe
                src={embedUrl}
                title="YouTube video player"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : type === 'web' ? (
            <div className="relative w-full h-full min-h-[500px]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                </div>
              )}
              <iframe
                src={currentUrl}
                title="Web content"
                className="w-full h-full"
                frameBorder="0"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p>No content to display</p>
                <p className="text-sm">Please provide a valid URL</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with additional controls */}
        <div className="p-3 border-t bg-white">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>In-App Viewer</span>
              {type === 'youtube' && youtubeVideoId && (
                <span>Video ID: {youtubeVideoId}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(currentUrl, '_blank')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InAppViewer; 