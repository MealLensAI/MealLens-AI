
import React, { useEffect, useState } from 'react';
import { Globe, ExternalLink, BookOpen, Loader2 } from 'lucide-react';

interface WebResource {
  title: string;
  description: string;
  url: string;
  image?: string;
}

interface WebResourcesProps {
  resources: WebResource[];
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const WebResources: React.FC<WebResourcesProps> = ({ resources, onImageError }) => {
  // Local state to cache fetched images
  const [images, setImages] = useState<{ [key: number]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    setImages({});
    setLoadingImages({});
  }, [resources]);

  const fetchOgImage = async (url: string, index: number) => {
    setLoadingImages((prev) => ({ ...prev, [index]: true }));
    try {
      // Use a CORS proxy to fetch the HTML (since most sites block direct fetches)
      const proxyUrl = 'https://corsproxy.io/?';
      const response = await fetch(proxyUrl + encodeURIComponent(url));
      if (!response.ok) throw new Error('Failed to fetch HTML');
      const html = await response.text();
      // Parse the HTML for og:image or twitter:image
      const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      const twitterImageMatch = html.match(/<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']twitter:image["']/i);
      let imageUrl = '';
      if (ogImageMatch && ogImageMatch[1]) {
        imageUrl = ogImageMatch[1];
      } else if (twitterImageMatch && twitterImageMatch[1]) {
        imageUrl = twitterImageMatch[1];
      }
      setImages((prev) => ({ ...prev, [index]: imageUrl }));
    } catch (e) {
      setImages((prev) => ({ ...prev, [index]: '' }));
    } finally {
      setLoadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Web Resources Available</h3>
        <p className="text-sm text-gray-600">We couldn't find additional resources for this recipe</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Web Resources</h3>
          <p className="text-sm text-gray-600">Additional recipes and cooking tips</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {resources.map((resource, index) => {
          const hasImage = resource.image && resource.image.length > 0;
          const imgSrc = hasImage ? resource.image : images[index];
          const isLoading = loadingImages[index];
          
          useEffect(() => {
            if (!hasImage && !images[index] && !isLoading) {
              fetchOgImage(resource.url, index);
            }
            // eslint-disable-next-line
          }, [hasImage, images, isLoading, resource.url, index]);
          
          return (
            <div key={index} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden">
                {isLoading ? (
                  <div className="w-full h-32 sm:h-40 flex items-center justify-center bg-gray-100">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  </div>
                ) : imgSrc ? (
                  <img 
                    src={imgSrc}
                    alt={resource.title}
                    className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={onImageError}
                  />
                ) : (
                  <div className="w-full h-32 sm:h-40 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <span className="text-xs text-blue-600 font-medium">Recipe Resource</span>
                    </div>
                  </div>
                )}
                
                <div className="absolute top-2 left-2">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Web
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h4>
                
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>
                
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Read More</span>
                  <span className="sm:hidden">Read</span>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WebResources;
