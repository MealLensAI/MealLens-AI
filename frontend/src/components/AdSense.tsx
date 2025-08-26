import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  DollarSign, 
  Star, 
  ShoppingBag, 
  TrendingUp,
  Heart,
  Zap,
  Gift
} from 'lucide-react';

interface AdSenseProps {
  type?: 'banner' | 'card' | 'native';
  position?: 'top' | 'bottom' | 'sidebar' | 'inline';
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface AdData {
  id: string;
  title: string;
  description: string;
  image: string;
  cta: string;
  url: string;
  type: 'product' | 'service' | 'promotion';
  rating?: number;
  price?: string;
  discount?: string;
}

const AdSense: React.FC<AdSenseProps> = ({
  type = 'card',
  position = 'inline',
  className = '',
  showCloseButton = true,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAd, setCurrentAd] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if ads should be disabled (development mode)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const adsDisabled = localStorage.getItem('meallens-ads-disabled') === 'true';

  // Production ad data - fetched from backend or AdSense API
  const [ads, setAds] = useState<AdData[]>([]);

  useEffect(() => {
    if (isDevelopment || adsDisabled) {
      setIsVisible(false);
      return;
    }

    // Load ads from backend or AdSense API
    const loadAd = async () => {
      setIsLoading(true);
      try {
        // In production, this would fetch from AdSense API or backend
        // For now, disable ads in development
        if (isDevelopment) {
          setIsVisible(false);
          return;
        }
        
        // TODO: Implement proper ad loading from backend/AdSense
        // const response = await fetch('/api/ads');
        // const adData = await response.json();
        // setAds(adData);
        
        // For now, disable ads
        setIsVisible(false);
      } catch (error) {
        console.error('Error loading ads:', error);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAd();
  }, [isDevelopment, adsDisabled]);

  const handleAdClick = (url: string) => {
    // Track ad click (analytics)
    console.log('Ad clicked:', url);
    
    // Open URL
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Don't render if ads are disabled or not visible
  if (isDevelopment || adsDisabled || !isVisible) {
    return null;
  }

  const getAdIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <ShoppingBag className="h-4 w-4" />;
      case 'service':
        return <Zap className="h-4 w-4" />;
      case 'promotion':
        return <Gift className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const renderBannerAd = () => (
    <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Sponsored Content</h3>
            <p className="text-xs opacity-90">Discover amazing products and services</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAdClick(currentAd?.url || '#')}
          className="text-white hover:bg-white/20"
        >
          Learn More
        </Button>
      </div>
    </div>
  );

  const renderCardAd = () => (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-lg flex items-center justify-center">
              {getAdIcon(currentAd?.type || 'service')}
            </div>
            {currentAd?.discount && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                {currentAd.discount}
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                  {currentAd?.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {currentAd?.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {currentAd?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">{currentAd.rating}</span>
                    </div>
                  )}
                  {currentAd?.price && (
                    <span className="text-xs font-medium text-[#FF6B6B]">
                      {currentAd.price}
                    </span>
                  )}
                </div>
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              onClick={() => handleAdClick(currentAd?.url || '#')}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm h-8"
            >
              {currentAd?.cta}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNativeAd = () => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          Sponsored
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-lg flex items-center justify-center">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm text-gray-900">
            {currentAd?.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {currentAd?.description}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAdClick(currentAd?.url || '#')}
          className="text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
        >
          {currentAd?.cta}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-24"></div>
      </div>
    );
  }

  return (
    <div className={`ad-sense ${className}`}>
      {type === 'banner' && renderBannerAd()}
      {type === 'card' && renderCardAd()}
      {type === 'native' && renderNativeAd()}
    </div>
  );
};

export default AdSense; 