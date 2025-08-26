
import React from 'react';
import { ChefHat, Clock, BookOpen } from 'lucide-react';

interface CookingInstructionsProps {
  instructions: string;
}

const CookingInstructions: React.FC<CookingInstructionsProps> = ({ instructions }) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
          <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Cooking Instructions</h3>
          <p className="text-xs sm:text-sm text-gray-600">Follow these steps for perfect results</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-orange-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Step-by-step guide</span>
        </div>
        
        <div 
          className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed"
          style={{
            lineHeight: '1.6',
            margin: 0,
            textAlign: 'left'
          }}
          dangerouslySetInnerHTML={{ 
            __html: instructions 
          }}
        />
        
        <div className="mt-6 pt-4 border-t border-orange-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Follow each step carefully for best results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingInstructions;
