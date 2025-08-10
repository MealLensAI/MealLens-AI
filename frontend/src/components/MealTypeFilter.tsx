
import React from 'react';
import { Coffee, Utensils, Moon, Cookie } from 'lucide-react';

interface MealTypeFilterProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const mealTypes = [
  { id: 'all', label: 'All Recipes', icon: Utensils },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Utensils },
  { id: 'dinner', label: 'Dinner', icon: Moon },
  { id: 'snack', label: 'Dessert', icon: Cookie }
];

const MealTypeFilter: React.FC<MealTypeFilterProps> = ({ selectedType, onTypeSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-6 border-b border-[#e2e8f0] mb-4 sm:mb-6 overflow-x-auto">
      {mealTypes.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 px-1 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              selectedType === type.id
                ? 'text-[#FF6B6B] border-[#FF6B6B]'
                : 'text-[#1e293b] border-transparent hover:text-[#FF6B6B]'
            }`}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{type.label}</span>
            <span className="sm:hidden">{type.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MealTypeFilter;
