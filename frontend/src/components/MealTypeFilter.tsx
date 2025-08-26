
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MealTypeFilterProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const MealTypeFilter: React.FC<MealTypeFilterProps> = ({ selectedType, onTypeSelect }) => {
  const mealTypes = [
    { value: 'all', label: 'All Meals', icon: '🍽️' },
    { value: 'breakfast', label: 'Breakfast', icon: '🥞' },
    { value: 'lunch', label: 'Lunch', icon: '🍽️' },
    { value: 'dinner', label: 'Dinner', icon: '🍛' },
    { value: 'snack', label: 'Snacks', icon: '🍪' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {mealTypes.map((type) => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeSelect(type.value)}
            className={`flex-shrink-0 whitespace-nowrap font-medium transition-all duration-200 ${
              selectedType === type.value
                ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-md'
                : 'border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50'
            } text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2`}
          >
            <span className="mr-1 sm:mr-2 text-sm sm:text-base">{type.icon}</span>
            <span className="hidden sm:inline">{type.label}</span>
            <span className="sm:hidden">{type.label.split(' ')[0]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MealTypeFilter;
