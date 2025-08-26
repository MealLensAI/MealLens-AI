import React, { useState, useEffect, useRef } from 'react';
import { Camera, List, Upload, Utensils, ChefHat, Search, Plus, Calendar, Settings, ChevronLeft, ChevronRight, XCircle, Loader2 } from 'lucide-react';
import WeeklyPlanner from '../components/WeeklyPlanner';
import RecipeCard from '../components/RecipeCard';
import MealTypeFilter from '../components/MealTypeFilter';
import LoadingScreen from '../components/LoadingScreen';
import CookingTutorialModal from '../components/CookingTutorialModal';
import MealPlanManager from '../components/MealPlanManager';
import WeekSelector from '../components/WeekSelector';
import { useMealPlans, SavedMealPlan, MealPlan } from '../hooks/useMealPlans';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { api } from '@/lib/api';
import FeatureLock from '@/components/FeatureLock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Countries list for the dropdown
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const MealPlanner = () => {
  const [inputType, setInputType] = useState<'image' | 'ingredient_list' | 'auto_sick' | 'auto_healthy'>('ingredient_list');
  const [ingredientList, setIngredientList] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [showInputModal, setShowInputModal] = useState(false);
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [isAutoGenerateEnabled, setIsAutoGenerateEnabled] = useState(false);

  const { isFeatureLocked, recordFeatureUsage, incrementFreeUsage, freeUsageCount, maxFreeUsage } = useSubscription();

  const {
    currentPlan,
    saveMealPlan,
    updateMealPlan,
    generateWeekDates,
    savedPlans,
    selectMealPlan,
    clearAllPlans,
    refreshMealPlans
  } = useMealPlans();

  const { toast } = useToast();
  // Get sickness info from profile instead of separate hook
  const [sicknessInfo, setSicknessInfo] = useState<{ hasSickness: boolean, sicknessType: string } | null>(null);

  // Load sickness info from profile
  useEffect(() => {
    const loadSicknessInfo = async () => {
      try {
        const response = await api.getUserProfile();
        if (response.status === 'success' && response.profile) {
          if (response.profile.has_sickness) {
            setSicknessInfo({
              hasSickness: response.profile.has_sickness,
              sicknessType: response.profile.sickness_type || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading sickness info:', error);
      }
    };

    loadSicknessInfo();
  }, []);

  const prevShowPlanManager = useRef(showPlanManager);
  useEffect(() => {
    if (prevShowPlanManager.current && !showPlanManager) {
      // Modal just closed
      refreshMealPlans();
    }
    prevShowPlanManager.current = showPlanManager;
  }, [showPlanManager, refreshMealPlans]);

  // Check if feature is locked
  if (isFeatureLocked('meal_planning')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <FeatureLock
            featureName="meal_planning"
            featureTitle="Smart Meal Planning"
            featureDescription="Create personalized weekly meal plans, get recipe suggestions, and manage your nutrition with AI-powered recommendations."
            icon={<Calendar className="h-8 w-8 text-orange-500" />}
          />
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!currentPlan) {
      setSelectedDay('Monday'); // Reset to default
      setSelectedMealType('all'); // Optionally reset meal type
      // Optionally clear other state if needed
    }
  }, [currentPlan]);

  useEffect(() => {
    if (!showPlanManager && (!currentPlan || !savedPlans.some(plan => plan.id === currentPlan.id))) {
      setSelectedDay('Monday');
      setSelectedMealType('all');
      // Optionally clear other state if needed
    }
  }, [showPlanManager, currentPlan, savedPlans]);

  const weekDates = generateWeekDates(selectedDate);

  // Find all unique week start dates from savedPlans, sorted ascending
  const savedWeeks = savedPlans
    .map(plan => ({
      id: plan.id,
      startDate: plan.startDate,
      name: plan.name,
    }))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  // Find the index of the currently selected week
  const currentWeekIndex = savedWeeks.findIndex(w => w.startDate === weekDates.startDate);
  // Handlers for week navigation
  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      const prevWeek = savedWeeks[currentWeekIndex - 1];
      setSelectedDate(new Date(prevWeek.startDate));
      selectMealPlan(prevWeek.id);
    }
  };
  const handleNextWeek = () => {
    if (currentWeekIndex < savedWeeks.length - 1) {
      const nextWeek = savedWeeks[currentWeekIndex + 1];
      setSelectedDate(new Date(nextWeek.startDate));
      selectMealPlan(nextWeek.id);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Only validate ingredients/image if auto-generate is OFF
    if (!isAutoGenerateEnabled) {
      if (inputType === 'ingredient_list' && !ingredientList.trim()) {
        toast({
          title: "Error",
          description: "Please enter your ingredients list",
          variant: "destructive",
        });
        return;
      }

      if (inputType === 'image' && !selectedImage) {
        toast({
          title: "Error",
          description: "Please select an image to upload",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate auto-generate requirements
    if (isAutoGenerateEnabled) {
          if (sicknessInfo?.hasSickness) {
      // Sick user - validate location and budget
      if (!location.trim() || !budget.trim()) {
        toast({
          title: "Information Required",
          description: "Please provide both location and budget for auto-generation",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Healthy user - validate location and budget
      if (!location.trim() || !budget.trim()) {
        toast({
          title: "Information Required",
          description: "Please provide both location and budget for auto-generation",
          variant: "destructive",
        });
        return;
      }
    }
    }

    setIsLoading(true);

    try {
      // Record feature usage
      await recordFeatureUsage('meal_planning');
    } catch (error) {
      console.error('Error recording feature usage:', error);
    }

    try {
      const formData = new FormData();

      if (isAutoGenerateEnabled) {
        if (sicknessInfo?.hasSickness) {
          // Auto generate based on sickness, location, and budget
          formData.append('sickness', sicknessInfo.sicknessType);
          formData.append('location', location);
          formData.append('budget', budget);
          const response = await fetch('https://ai-utu2.onrender.com/smart_plan', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to generate meal plan');
          }

          const data = await response.json();
          console.log('[MealPlanner] Auto Sick API Response:', data);
          console.log('[MealPlanner] Meal Plan Data:', data.meal_plan);

          // Save the new meal plan
          await saveMealPlan(data.meal_plan, selectedDate);

          setShowInputModal(false);
          setIngredientList('');
          setSelectedImage(null);
          setImagePreview(null);
          setLocation('');
          setBudget('');
          setIsAutoGenerateEnabled(false);

          toast({
            title: "Success!",
            description: `Your auto-generated meal plan for ${weekDates.name} has been created and saved!`,
          });
          return;
        } else {
          // Auto generate based on location and budget only
          formData.append('location', location);
          formData.append('budget', budget);
          const response = await fetch('https://ai-utu2.onrender.com/smart_plan', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to generate meal plan');
          }

          const data = await response.json();
          console.log('[MealPlanner] Auto Healthy API Response:', data);
          console.log('[MealPlanner] Meal Plan Data:', data.meal_plan);

          // Save the new meal plan
          await saveMealPlan(data.meal_plan, selectedDate);

          setShowInputModal(false);
          setIngredientList('');
          setSelectedImage(null);
          setImagePreview(null);
          setLocation('');
          setBudget('');
          setIsAutoGenerateEnabled(false);

          toast({
            title: "Success!",
            description: `Your auto-generated meal plan for ${weekDates.name} has been created and saved!`,
          });
          return;
        }
      }

      // Regular meal plan generation
      formData.append('image_or_ingredient_list', inputType);

      if (inputType === 'ingredient_list') {
        formData.append('ingredient_list', ingredientList);
      } else {
        formData.append('image', selectedImage!);
      }

      // Add sickness information if user has sickness
      if (sicknessInfo) {
        formData.append('sickness', sicknessInfo.sicknessType);
      }

      // Use the correct endpoint for meal planning
      const endpoint = 'https://ai-utu2.onrender.com/smart_plan';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();
      console.log('[MealPlanner] API Response:', data);
      console.log('[MealPlanner] Meal Plan Data:', data.meal_plan);

      // Save the new meal plan
      await saveMealPlan(data.meal_plan, selectedDate);

      setShowInputModal(false);
      setIngredientList('');
      setSelectedImage(null);
      setImagePreview(null);
      setLocation('');
      setBudget('');
      setIsAutoGenerateEnabled(false);

      toast({
        title: "Success!",
        description: `Your meal plan for ${weekDates.name} has been created and saved!`,
      });
    } catch (error: any) {
      // Log the error in detail
      console.error('Error generating meal plan:', error);

      // Try to extract error message from various possible structures
      let errorMessage = '';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Try to extract from nested properties
        if (error[1]?.message) {
          errorMessage = error[1].message;
        } else if (error.details) {
          errorMessage = error.details;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      // Log the extracted error message for debugging
      console.log('Extracted error message:', errorMessage);

      if (
        errorMessage.includes('duplicate key value') &&
        errorMessage.includes('unique_user_week')
      ) {
        toast({
          title: "Duplicate Plan",
          description: "A meal plan for this week already exists. Please choose a different week or edit the existing plan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate meal plan. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeClick = (recipeName: string, mealType: string) => {
    if (!currentPlan) return;

    // Extract clean food name for tutorial content
    const cleanName = recipeName.replace(/\s*\(buy:[^)]*\)/, '').trim();

    // Get ingredients for the selected meal type
    const dayPlan = currentPlan.mealPlan.find(plan => plan.day === selectedDay);
    let ingredients: string[] = [];

    if (dayPlan) {
      switch (mealType) {
        case 'breakfast':
          ingredients = dayPlan.breakfast_ingredients || [];
          break;
        case 'lunch':
          ingredients = dayPlan.lunch_ingredients || [];
          break;
        case 'dinner':
          ingredients = dayPlan.dinner_ingredients || [];
          break;
        case 'snack':
          ingredients = dayPlan.snack_ingredients || [];
          break;
      }
    }

    console.log('[MealPlanner] Recipe clicked:', { cleanName, mealType, ingredients });
    setSelectedRecipe(cleanName);
    setSelectedIngredients(ingredients);
    setShowTutorialModal(true);
  };

  // Helper: rotate meal plan array to start from selectedDay
  const getRotatedMealPlan = () => {
    if (!currentPlan) return [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startIdx = daysOfWeek.indexOf(selectedDay);
    if (startIdx === -1) return currentPlan.mealPlan;
    // Sort mealPlan to match daysOfWeek order
    const sortedPlan = daysOfWeek.map(day => currentPlan.mealPlan.find(mp => mp.day === day)).filter(Boolean);
    // Rotate
    return [...sortedPlan.slice(startIdx), ...sortedPlan.slice(0, startIdx)];
  };

  // In the main content, use the rotated meal plan for display
  const rotatedMealPlan = currentPlan ? getRotatedMealPlan() : [];

  // Helper function to generate food images based on meal type and title
  const getFoodImage = (mealType: string, title: string): string => {
    const baseUrl = 'https://source.unsplash.com/400x300/?';
    
    // Map meal types to relevant food categories
    const mealTypeKeywords = {
      'breakfast': 'breakfast,food',
      'lunch': 'lunch,food',
      'dinner': 'dinner,food',
      'snack': 'snack,food'
    };
    
    // Extract key ingredients from title for more specific images
    const titleKeywords = title.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .split(' ')
      .filter(word => word.length > 3) // Filter out short words
      .slice(0, 2) // Take first 2 meaningful words
      .join(',');
    
    // Combine meal type and title keywords
    const keywords = titleKeywords ? `${titleKeywords},${mealTypeKeywords[mealType as keyof typeof mealTypeKeywords] || 'food'}` : 
                    mealTypeKeywords[mealType as keyof typeof mealTypeKeywords] || 'food';
    
    // Add random seed to prevent caching issues
    const randomSeed = Math.floor(Math.random() * 1000);
    return `${baseUrl}${encodeURIComponent(keywords)}&sig=${randomSeed}`;
  };

  // Replace getRecipesForSelectedDay to use rotated plan
  const getRecipesForSelectedDay = () => {
    const rotatedPlan = getRotatedMealPlan();
    // Always show the first day's recipes (the selected day)
    const dayPlan = rotatedPlan[0];
    if (!dayPlan) return [];
    // Helper function to extract clean food name from meal description
    const extractFoodName = (mealDescription: string): string => {
      // Remove the "(buy: ...)" part and any extra text
      const cleanName = mealDescription.replace(/\s*\(buy:[^)]*\)/, '').trim();
      return cleanName;
    };
    const recipes = [
      {
        title: extractFoodName(dayPlan.breakfast),
        type: 'breakfast',
        time: '15 mins',
        rating: 5,
        originalTitle: dayPlan.breakfast // Keep original for display
      },
      {
        title: extractFoodName(dayPlan.lunch),
        type: 'lunch',
        time: '25 mins',
        rating: 4,
        originalTitle: dayPlan.lunch
      },
      {
        title: extractFoodName(dayPlan.dinner),
        type: 'dinner',
        time: '35 mins',
        rating: 5,
        originalTitle: dayPlan.dinner
      },
    ];
    if (dayPlan.snack) {
      recipes.push({
        title: extractFoodName(dayPlan.snack),
        type: 'snack',
        time: '5 mins',
        rating: 4,
        originalTitle: dayPlan.snack
      });
    }
    return selectedMealType === 'all'
      ? recipes
      : recipes.filter(recipe => recipe.type === selectedMealType);
  };

  const handleNewPlan = () => {
    setShowInputModal(true);
  };

  const handleEditPlan = (plan: SavedMealPlan) => {
    // For now, just select the plan to edit
    // In the future, this could open an edit modal
    toast({
      title: "Plan Selected",
      description: `"${plan.name}" is now active for editing.`,
    });
  };

  // When a plan is selected in the manager, jump to that week
  const handleSelectPlan = (plan: SavedMealPlan) => {
    setSelectedDate(new Date(plan.startDate));
    selectMealPlan(plan.id);
    setShowPlanManager(false);
  };

  // Helper to get day name from a Date
  const getDayName = (date: Date) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  };

  // Update setSelectedDate to also set selectedDay
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedDay(getDayName(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-4 sm:py-6 lg:py-8">
                {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex-responsive items-center justify-between gap-4">
            <div>
              <h1 className="heading-responsive font-bold text-gray-900 mb-2 sm:mb-3">Meal Planner</h1>
              <p className="text-responsive text-gray-600">Plan your meals and discover new recipes</p>
          </div>
            <div className="flex-responsive gap-2 sm:gap-3">
              <Button
                onClick={() => setShowPlanManager(true)}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-medium"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manage Plans</span>
                <span className="sm:hidden">Manage</span>
              </Button>
              <Button
                onClick={handleNewPlan}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Plan</span>
                <span className="sm:hidden">New</span>
              </Button>
        </div>
                      </div>
                  </div>

                {/* Week Navigation */}
        {currentPlan && (
          <div className="mb-6 sm:mb-8">
            <Card className="card-responsive border-orange-200 bg-orange-50/30">
              <div className="flex-responsive items-center justify-between gap-4">
                <Button
                      onClick={handlePrevWeek}
                      disabled={currentWeekIndex <= 0}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-orange-600 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Previous Week</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    {weekDates.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(weekDates.startDate).toLocaleDateString()} - {new Date(weekDates.endDate).toLocaleDateString()}
                  </p>
                </div>
                
                <Button
                      onClick={handleNextWeek}
                  disabled={currentWeekIndex >= savedWeeks.length - 1}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-orange-600 disabled:opacity-50 transition-colors"
                >
                  <span className="hidden sm:inline">Next Week</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

                {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - This Week */}
          {currentPlan && (
            <div className="lg:w-80 flex-shrink-0">
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                    const dayPlan = currentPlan.mealPlan.find(plan => plan.day === day);
                    const hasMeals = dayPlan && (dayPlan.breakfast || dayPlan.lunch || dayPlan.dinner || dayPlan.snack);
                    const isSelected = selectedDay === day;
                    
                    return (
                      <div key={day} className="space-y-2">
                        <button
                          onClick={() => setSelectedDay(day)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            isSelected 
                              ? 'bg-orange-500 text-white shadow-md' 
                              : 'bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{day}</span>
                            <div className="flex items-center gap-2">
                              {hasMeals && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                              {!isSelected && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                    </button>
                        
                        {/* Show meals for selected day */}
                        {isSelected && dayPlan && (
                          <div className="ml-4 space-y-2">
                            {dayPlan.breakfast && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                                <span className="truncate">{dayPlan.breakfast.replace(/\s*\(buy:[^)]*\)/, '')}</span>
                  </div>
                            )}
                            {dayPlan.lunch && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span className="truncate">{dayPlan.lunch.replace(/\s*\(buy:[^)]*\)/, '')}</span>
                </div>
                            )}
                            {dayPlan.dinner && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                <span className="truncate">{dayPlan.dinner.replace(/\s*\(buy:[^)]*\)/, '')}</span>
                              </div>
                            )}
                            {dayPlan.snack && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span className="truncate">{dayPlan.snack.replace(/\s*\(buy:[^)]*\)/, '')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Meal Type Filter */}
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-medium text-gray-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  Filter by Meal Type:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MealTypeFilter
                  selectedType={selectedMealType}
                  onTypeSelect={setSelectedMealType}
                />
              </CardContent>
            </Card>

        {/* Loading State */}
              {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingScreen size="lg" />
          </div>
        ) : null}

        {/* Error State */}
        {isLoading && !currentPlan ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Utensils className="h-12 w-12 mx-auto mb-2" />
              <p className="text-responsive">Failed to load meal plans</p>
            </div>
            <Button onClick={refreshMealPlans} variant="outline" className="text-responsive">
              Try Again
            </Button>
          </div>
        ) : null}

        {/* Meal Plans Grid */}
        {!isLoading && currentPlan && (
          <div className="grid-responsive">
                  {getRecipesForSelectedDay().map((recipe, index) => (
                    <RecipeCard
                      key={`${selectedDay}-${recipe.type}-${index}`}
                      title={recipe.title}
                      originalTitle={recipe.originalTitle}
                      time={recipe.time}
                      rating={recipe.rating}
                      mealType={recipe.type as any}
                      imageUrl={getFoodImage(recipe.type, recipe.title)}

                      onClick={() => handleRecipeClick(recipe.originalTitle || recipe.title, recipe.type)}
                    />
                  ))}
                </div>
              )}

                {/* Empty State - No Current Plan */}
        {!isLoading && !currentPlan && (
          <div className="text-center py-12">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="heading-responsive font-semibold text-gray-900 mb-3">No Meal Plan Yet</h3>
              <p className="text-responsive text-gray-600 mb-6">
                Create your first meal plan to get started with personalized recipe suggestions
              </p>
              <Button 
                  onClick={handleNewPlan}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-responsive font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Plan
              </Button>
              </div>
            </div>
          )}

        {/* Empty State - No Recipes for Selected Day */}
        {!isLoading && currentPlan && getRecipesForSelectedDay().length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Utensils className="h-12 w-12 mx-auto mb-2" />
              <p className="text-responsive">No meals planned for {selectedDay}</p>
        </div>
            <Button onClick={refreshMealPlans} variant="outline" className="text-responsive">
              Refresh
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && currentPlan && getRecipesForSelectedDay().length > 0 && (
          <div className="text-center mt-8">
            <Button 
              onClick={refreshMealPlans} 
              variant="outline" 
              className="text-responsive"
            >
              Load More
            </Button>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Plan Manager Modal */}
      {showPlanManager && (
        <div className="mobile-modal">
          <div className="mobile-modal-overlay" onClick={() => setShowPlanManager(false)} />
          <div className="mobile-modal-content">
            <div className="flex items-center justify-between mb-4 sm:mb-6 p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Meal Plans</h2>
              <button
                onClick={() => setShowPlanManager(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6">
            <MealPlanManager
              onNewPlan={() => {
                setShowPlanManager(false);
                setShowInputModal(true);
              }}
              onEditPlan={handleEditPlan}
              onSelectPlan={handleSelectPlan}
            />
            </div>
          </div>
        </div>
      )}

      {/* Input Modal */}
      {showInputModal && (
        <div className="mobile-modal">
          <div className="mobile-modal-overlay" onClick={() => setShowInputModal(false)} />
          <div className="mobile-modal-content">
            <div className="flex items-center justify-between mb-4 sm:mb-6 p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Your Meal Plan</h2>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
            {/* Week Selection */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Week
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              />
                <p className="text-sm text-gray-600 mt-2">
                Creating plan for: {weekDates.name}
              </p>
            </div>

            {/* Auto-Generate Toggle */}
              <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ChefHat className="w-5 h-5 text-gray-700" />
                  <div>
                      <h3 className="text-sm font-semibold text-gray-900">Auto-Generate Meal Plan</h3>
                      <p className="text-xs text-gray-600">
                      {sicknessInfo?.hasSickness
                        ? `Based on your health condition: ${sicknessInfo.sicknessType}`
                        : 'Based on location and budget preferences'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAutoGenerateEnabled(!isAutoGenerateEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoGenerateEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoGenerateEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Sickness Indicator */}
            {sicknessInfo?.hasSickness && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-sm font-semibold text-orange-800">Health-aware meal planning</span>
                </div>
                <p className="text-sm text-orange-700">
                  Your meal plan will be customized for your condition: <strong>{sicknessInfo.sicknessType}</strong>
                </p>
              </div>
            )}

            {/* Toggle Buttons - Only show when auto-generate is OFF */}
            {!isAutoGenerateEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setInputType('ingredient_list')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${inputType === 'ingredient_list'
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-orange-500'
                    }`}
                >
                  <div className="flex items-center justify-center">
                      <List className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <div className="text-left">
                        <div className="font-semibold text-sm sm:text-base">Type Ingredients</div>
                        <div className="text-xs sm:text-sm opacity-90">Enter manually</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setInputType('image')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${inputType === 'image'
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-orange-500'
                    }`}
                >
                  <div className="flex items-center justify-center">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <div className="text-left">
                        <div className="font-semibold text-sm sm:text-base">Upload Image</div>
                        <div className="text-xs sm:text-sm opacity-90">Take a photo</div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isAutoGenerateEnabled ? (
                // Auto-generate form
                <div className="space-y-6">
                  <div className={`p-4 border rounded-xl ${sicknessInfo?.hasSickness
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                      {sicknessInfo?.hasSickness ? (
                        <Utensils className="w-5 h-5 text-green-600" />
                      ) : (
                        <ChefHat className="w-5 h-5 text-blue-600" />
                      )}
                      <h3 className={`text-lg font-semibold ${sicknessInfo?.hasSickness ? 'text-green-800' : 'text-blue-800'
                        }`}>
                        Auto-Generate Meal Plan
                      </h3>
                    </div>
                    <p className={`text-sm ${sicknessInfo?.hasSickness ? 'text-green-700' : 'text-blue-700'
                      }`}>
                      {sicknessInfo?.hasSickness
                        ? `We'll create a personalized meal plan based on your health condition: ${sicknessInfo.sicknessType}`
                        : 'We\'ll create a personalized meal plan based on your location and budget preferences.'
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Your Location
                      </label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        disabled={isLoading}
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                        <p className="text-sm text-gray-600 mt-1">
                        This helps us suggest locally available ingredients
                      </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Weekly Budget
                      </label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g., 15000"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        disabled={isLoading}
                      />
                        <p className="text-sm text-gray-600 mt-1">
                        Your budget for the entire week
                      </p>
                    </div>
                  </div>
                </div>
              ) : inputType === 'ingredient_list' ? (
                <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                    List your ingredients
                  </label>
                  <textarea
                    value={ingredientList}
                    onChange={(e) => setIngredientList(e.target.value)}
                    placeholder="e.g., tomatoes, onions, beef, rice, bell peppers, garlic, olive oil..."
                      className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    disabled={isLoading}
                  />
                </div>
              ) : inputType === 'image' ? (
                <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Upload an image of your ingredients
                  </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-48 object-cover mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                            className="text-orange-500 hover:text-orange-600"
                        >
                          Choose different image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                            <p className="text-gray-900 font-medium">Click to upload</p>
                            <p className="text-gray-600 text-sm">PNG, JPG, JPEG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="file-upload"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="file-upload"
                            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                        >
                          Select Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                  className="w-full py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {isAutoGenerateEnabled ? 'Auto-Generating Plan...' : 'Generating Plan...'}
                  </>
                ) : (
                  <>
                    <Utensils className="w-6 h-6 mr-3" />
                    {isAutoGenerateEnabled ? 'Auto-Generate Meal Plan' : 'Generate My Meal Plan'}
                  </>
                )}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Cooking Tutorial Modal */}
      <CookingTutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        recipeName={selectedRecipe || ''}
        ingredients={selectedIngredients}
      />
    </div>
  );
};

export default MealPlanner;
