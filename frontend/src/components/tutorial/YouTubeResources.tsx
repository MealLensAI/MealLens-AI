
import React, { useState } from 'react';
import { Youtube, Play, ExternalLink, Maximize2, X, Clock } from 'lucide-react';

interface VideoResource {
  title: string;
  thumbnail: string;
  url: string;
  videoId?: string;
  channel?: string;
}

interface YouTubeResourcesProps {
  videos: VideoResource[];
  onVideoSelect: (videoId: string | null) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  inlinePlayingIndex?: number | null;
  onInlinePlay?: (index: number | null) => void;
}

const YouTubeResources: React.FC<YouTubeResourcesProps> = ({ videos, onVideoSelect, onImageError, inlinePlayingIndex, onInlinePlay }) => {
  // Helper to play inline and stop modal
  const handlePlayInline = (index: number) => {
    if (onInlinePlay) onInlinePlay(index);
    if (onVideoSelect) onVideoSelect(null); // Stop modal video
  };
  const handleCloseInline = () => {
    if (onInlinePlay) onInlinePlay(null);
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Youtube className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Video Tutorials Available</h3>
        <p className="text-sm text-gray-600">We couldn't find video tutorials for this recipe</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
          <Youtube className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Video Tutorials</h3>
          <p className="text-sm text-gray-600">Watch step-by-step cooking videos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {videos.map((video, index) => (
          <div key={index} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {inlinePlayingIndex === index && video.videoId ? (
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                title={video.title}
                  className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
                <div className="absolute top-2 right-2 flex gap-2">
              <button
                    className="bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                title="Expand"
                onClick={() => onVideoSelect(video.videoId!)}
              >
                    <Maximize2 className="w-4 h-4 text-gray-700" />
              </button>
              <button
                    className="bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                title="Close"
                onClick={handleCloseInline}
              >
                    <X className="w-4 h-4 text-gray-700" />
              </button>
                </div>
            </div>
          ) : (
            <div className="relative overflow-hidden cursor-pointer" onClick={() => handlePlayInline(index)}>
            <img 
              src={video.thumbnail}
              alt={video.title}
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={onImageError}
            />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    YouTube
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                {video.title}
              </h4>
              
              {video.channel && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{video.channel}</p>
              )}
              
              <div className="flex items-center justify-between">
              {video.videoId && (
                <button
                onClick={() => handlePlayInline(index)}
                    className="flex items-center gap-1.5 text-red-500 text-xs sm:text-sm font-medium hover:text-red-600 transition-colors"
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Watch</span>
                    <span className="sm:hidden">Play</span>
                </button>
              )}
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Tutorial</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
    </div>
  );
};

export default YouTubeResources;
