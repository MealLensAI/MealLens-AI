import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Utensils } from 'lucide-react';

interface RecipeCardProps {
  title: string;
  originalTitle?: string;
  time?: string;
  rating?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onClick?: () => void;
  imageUrl?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  originalTitle,
  time = '30 mins',
  rating = 4,
  mealType,
  onClick,
  imageUrl
}) => {
  const getMealTypeColor = (type?: string) => {
    switch (type) {
      case 'breakfast':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'lunch':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dinner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'snack':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMealTypeLabel = (type?: string) => {
    switch (type) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      case 'snack':
        return 'Snack';
      default:
        return 'Meal';
    }
  };

  const getMealTypeIcon = (type?: string) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-orange-300"
      onClick={onClick}
    >
      <div className="relative">
        {/* Recipe Image */}
        <div className="w-full h-32 sm:h-40 lg:h-48 relative overflow-hidden">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If image fails to load, hide the img element to show fallback
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
          {/* Fallback image container - shown when no imageUrl or on error */}
          <div className={`absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 ${imageUrl ? 'hidden' : ''}`}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">{getMealTypeIcon(mealType)}</div>
                <div className="text-xs sm:text-sm font-medium opacity-90">Recipe Image</div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Type Badge */}
        {mealType && (
          <div className="absolute top-2 left-2">
            <Badge className={`text-xs sm:text-sm border ${getMealTypeColor(mealType)}`}>
              {getMealTypeLabel(mealType)}
            </Badge>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/95 text-gray-800 text-xs sm:text-sm border border-gray-200">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            {rating}
          </Badge>
        </div>

        {/* Time Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-black/70 text-white text-xs sm:text-sm border-0">
            <Clock className="h-3 w-3 mr-1" />
            {time}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
            {title}
        </h3>
        
          {/* Original Title (if different) */}
          {originalTitle && originalTitle !== title && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
              {originalTitle}
            </p>
          )}

          {/* Recipe Info */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              <span>View Recipe</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating}/5</span>
          </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
